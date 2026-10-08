from scripts.metro.osm_extract import in_bbox


def test_in_bbox():
    assert in_bbox(-75.57, 6.25)
    assert not in_bbox(-74.07, 4.71)
    assert not in_bbox(-75.57, 6.45)
