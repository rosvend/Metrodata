import datetime as dt
from pathlib import Path

import pandas as pd

from scripts.metro.config import HOUR_COLS, HOURS


def read_ridership(path: Path) -> pd.DataFrame:
    """Read one Afluencia workbook into raw columns dia, linea, h04..h23, total."""
    sheet = pd.read_excel(path, sheet_name=0, header=None)
    header_row = sheet.index[sheet.iloc[:, 0].astype(str).str.strip() == "Día"][0]
    hour_cells = sheet.iloc[header_row + 1, 2 : 2 + len(HOURS)].tolist()
    if hour_cells != [dt.time(h) for h in HOURS]:
        raise ValueError(f"{path.name}: unexpected hour header {hour_cells}")
    body = sheet.iloc[header_row + 2 :, : 3 + len(HOURS)].reset_index(drop=True)
    body.columns = ["dia", "linea", *HOUR_COLS, "total"]
    return body
