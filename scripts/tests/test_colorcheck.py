import pytest

from scripts.metro.colorcheck import delta_e, simulate


def test_grey_is_unchanged_by_every_simulation():
    for kind in ("protan", "deutan", "tritan"):
        assert simulate("#808080", kind) == pytest.approx((128, 128, 128), abs=1.5)


def test_red_and_green_collapse_for_deuteranopes():
    normal = delta_e("#c2401c", "#2f7a22")
    deutan = delta_e(simulate("#c2401c", "deutan"), simulate("#2f7a22", "deutan"))
    assert deutan < normal / 2
