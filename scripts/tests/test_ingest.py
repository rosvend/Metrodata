import datetime as dt

from openpyxl import Workbook

from scripts.metro.config import HOUR_COLS
from scripts.metro.ingest import read_ridership


def _write_book(path, sheet, rows, extra_col=False):
    wb = Workbook()
    ws = wb.active
    ws.title = sheet
    pad = [None] if extra_col else []
    ws.append(["Día", "Línea de Servicio", "Hora de operación", *[None] * 20, *pad])
    ws.append([None, None, *[dt.time(h) for h in range(4, 24)], "Total general (Número de pasajeros)", *pad])
    for r in rows:
        ws.append([*r, *pad])
    wb.save(path)


def test_reads_layout_regardless_of_sheet_name_and_extra_column(tmp_path):
    p = tmp_path / "x.xlsx"
    hours = [1] * 19 + [None]
    _write_book(
        p,
        "Hoja1",
        [[dt.datetime(2025, 1, 1), "LÍNEA A", *hours, 19], ["Resultado total", None, *[None] * 20, 19]],
        extra_col=True,
    )
    raw = read_ridership(p)
    assert list(raw.columns) == ["dia", "linea", *HOUR_COLS, "total"]
    assert len(raw) == 2
    assert raw.iloc[0]["total"] == 19


def test_rejects_unexpected_hour_header(tmp_path):
    import pytest

    p = tmp_path / "bad.xlsx"
    wb = Workbook()
    wb.active.append(["Día", "Línea de Servicio"])
    wb.active.append([None, None, dt.time(5)])
    wb.save(p)
    with pytest.raises(ValueError, match="hour"):
        read_ridership(p)
