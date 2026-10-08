"""Colour-vision check: simulate dichromacy (Machado et al. 2009, severity 1) and measure CIELAB ΔE76."""

import itertools

import numpy as np

MACHADO = {
    "protan": [[0.152286, 1.052583, -0.204868], [0.114503, 0.786281, 0.099216], [-0.003882, -0.048116, 1.051998]],
    "deutan": [[0.367322, 0.860646, -0.227968], [0.280085, 0.672501, 0.047413], [-0.011820, 0.042940, 0.968881]],
    "tritan": [[1.255528, -0.076749, -0.178779], [-0.078411, 0.930809, 0.147602], [0.004733, 0.691367, 0.303900]],
}
CONFUSABLE = 15  # ΔE76 below this is hard to tell apart for thin lines and small marks

Color = str | tuple[float, float, float]


def _rgb(c: Color) -> np.ndarray:
    if isinstance(c, str):
        return np.array([int(c[i : i + 2], 16) for i in (1, 3, 5)], dtype=float)
    return np.array(c, dtype=float)


def _to_linear(rgb: np.ndarray) -> np.ndarray:
    c = rgb / 255
    return np.where(c <= 0.04045, c / 12.92, ((c + 0.055) / 1.055) ** 2.4)


def _to_srgb(lin: np.ndarray) -> np.ndarray:
    lin = np.clip(lin, 0, 1)
    return 255 * np.where(lin <= 0.0031308, lin * 12.92, 1.055 * lin ** (1 / 2.4) - 0.055)


def simulate(c: Color, kind: str) -> tuple[float, float, float]:
    out = _to_srgb(np.array(MACHADO[kind]) @ _to_linear(_rgb(c)))
    return (float(out[0]), float(out[1]), float(out[2]))


def _lab(c: Color) -> np.ndarray:
    xyz = np.array([[0.4124, 0.3576, 0.1805], [0.2126, 0.7152, 0.0722], [0.0193, 0.1192, 0.9505]]) @ _to_linear(_rgb(c))
    xyz /= np.array([0.95047, 1.0, 1.08883])
    f = np.where(xyz > 216 / 24389, np.cbrt(xyz), (24389 / 27 * xyz + 16) / 116)
    return np.array([116 * f[1] - 16, 500 * (f[0] - f[1]), 200 * (f[1] - f[2])])


def delta_e(a: Color, b: Color) -> float:
    return float(np.linalg.norm(_lab(a) - _lab(b)))


def confusable_pairs(colors: dict[str, str], kind: str | None) -> list[tuple[str, str, float]]:
    sim = {k: (simulate(v, kind) if kind else v) for k, v in colors.items()}
    pairs = [(a, b, delta_e(sim[a], sim[b])) for a, b in itertools.combinations(colors, 2)]
    return sorted([p for p in pairs if p[2] < CONFUSABLE], key=lambda p: p[2])


LINE_COLORS = {
    "A": "#215ca0", "B": "#eb8530", "T": "#44a925", "H": "#e61771", "J": "#f7c439", "K": "#b9cf47",
    "L": "#8e6329", "M": "#8322a7", "P": "#b01330", "1": "#11707c", "2": "#64a9b0", "O": "#e3807b",
}  # fmt: skip


def main() -> None:
    palettes = {
        "line colors": LINE_COLORS,
        "calendar diverging": {"dip": "#c2401c", "neutral": "#e8eceb", "spike": "#215ca0"},
        "walking bands": {"5": "#2f7a22", "10": "#65bc4b", "15": "#b9e2a8"},
    }
    for name, colors in palettes.items():
        for kind in (None, "protan", "deutan", "tritan"):
            pairs = confusable_pairs(colors, kind)
            label = kind or "normal"
            text = ", ".join(f"{a}/{b} ΔE {d:.1f}" for a, b, d in pairs) or "none"
            print(f"{name:20s} {label:7s} confusable: {text}")


if __name__ == "__main__":
    main()
