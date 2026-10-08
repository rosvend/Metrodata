export type Mode = "metro" | "tranvia" | "metrocable" | "metroplus";

export interface LineInfo {
  id: string;
  badge: string;
  name: string;
  mode: Mode;
  color: string;
  text: string;
}

export const MODE_LABELS: Record<Mode, string> = {
  metro: "Metro",
  tranvia: "Tranvía",
  metrocable: "Metrocable",
  metroplus: "Metroplús",
};

const INK = "#111716";
const WHITE = "#ffffff";

export function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

const luminance = (hex: string) => {
  const [r, g, b] = hexToRgb(hex).map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  }) as [number, number, number];
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

export function contrastRatio(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x) as [number, number];
  return (hi + 0.05) / (lo + 0.05);
}

const textOn = (color: string) => (contrastRatio(color, WHITE) >= contrastRatio(color, INK) ? WHITE : INK);

// Colors from metrodemedellin.gov.co ("Estado de las líneas"); names from lineas_del_sistema_de_tra.geojson
const RAW: [string, string, string, Mode, string][] = [
  ["A", "A", "Niquía – La Estrella", "metro", "#215ca0"],
  ["B", "B", "San Antonio – San Javier", "metro", "#eb8530"],
  ["T-A", "T", "San Antonio – Alejandro Echavarría", "tranvia", "#44a925"],
  ["H", "H", "Alejandro Echavarría – La Sierra", "metrocable", "#e61771"],
  ["J", "J", "San Javier – La Aurora", "metrocable", "#f7c439"],
  ["K", "K", "Acevedo – Santo Domingo", "metrocable", "#b9cf47"],
  ["L", "L", "Santo Domingo – Arví", "metrocable", "#8e6329"],
  ["M", "M", "Miraflores – 13 de Noviembre", "metrocable", "#8322a7"],
  ["P", "P", "Picacho", "metrocable", "#b01330"],
  ["1", "1", "U. de M. – Av. del Ferrocarril – Parque Aranjuez", "metroplus", "#11707c"],
  ["2", "2", "U. de M. – Pretroncal Oriental", "metroplus", "#64a9b0"],
  ["O", "O", "Corredor de la 80 (Caribe – La Palma – Aguacatala)", "metroplus", "#e3807b"],
];

export const LINES: LineInfo[] = RAW.map(([id, badge, name, mode, color]) => ({
  id,
  badge,
  name,
  mode,
  color,
  text: textOn(color),
}));

export const LINE_IDS = LINES.map((l) => l.id);

const BY_ID = new Map(LINES.map((l) => [l.id, l]));

export function lineInfo(id: string): LineInfo {
  const info = BY_ID.get(id);
  if (!info) throw new Error(`Unknown line ${id}`);
  return info;
}
