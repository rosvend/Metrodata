import type { Layer } from "@deck.gl/core";
import { GeoJsonLayer, PathLayer, ScatterplotLayer, TextLayer } from "@deck.gl/layers";
import type { AccessFilter, CoverageGeo, Feature, IsochronesGeo, LinesGeo, LonLat, StationsGeo } from "../data/types";
import type { AreaGeometry } from "../data/types";
import { hexToRgb, lineInfo } from "../lib/lines";
import type { Theme } from "../lib/theme";
import { bandFill } from "./colors";
import { scaleAround } from "./geometry";
import { contourScale } from "./useGrow";

type StationFeature = StationsGeo["features"][number];

export interface AccessLayerInput {
  mode: "station" | "coverage";
  filter: AccessFilter;
  allowed: Set<string>;
  stations: StationFeature[];
  lines: LinesGeo;
  iso: IsochronesGeo;
  coverage: CoverageGeo | null;
  showOverlap: boolean;
  selected: StationFeature | null;
  grow: number;
  point: LonLat | null;
  barrio: Feature<AreaGeometry, { nombre: string }> | null;
  theme: Theme;
  onStation: (id: string) => void;
}

const FONT_SETTINGS = { sdf: true };
const CHARS = [..."ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyzáéíóúüñÁÉÍÓÚÜÑ0123456789 -'."];

export function buildAccessLayers(a: AccessLayerInput): Layer[] {
  const dark = a.theme === "dark";
  const ink: [number, number, number] = dark ? [242, 245, 244] : [17, 23, 22];
  const layers: Layer[] = [];

  if (a.mode === "coverage" && a.coverage) {
    const bands = a.coverage.features.filter((f) => f.properties.filter === a.filter && f.properties.kind === "band");
    layers.push(
      new GeoJsonLayer({
        id: `coverage-${a.filter}`,
        data: { type: "FeatureCollection", features: [...bands].reverse() },
        filled: true,
        stroked: false,
        getFillColor: (f) => bandFill(f.properties.minutes, a.theme),
        updateTriggers: { getFillColor: [a.theme] },
      }),
    );
    if (a.showOverlap) {
      const ov = a.coverage.features.filter((f) => f.properties.filter === a.filter && f.properties.kind === "overlap");
      layers.push(
        new GeoJsonLayer({
          id: `overlap-${a.filter}`,
          data: { type: "FeatureCollection", features: ov },
          filled: true,
          stroked: true,
          getFillColor: [...ink, dark ? 40 : 45],
          getLineColor: [...ink, 140],
          getLineWidth: 1,
          lineWidthUnits: "pixels",
        }),
      );
    }
  }

  if (a.mode === "station" && a.selected) {
    const origin = a.selected.geometry.coordinates;
    const own = a.iso.features
      .filter((f) => f.properties.station_id === a.selected?.properties.id)
      .sort((x, y) => y.properties.minutes - x.properties.minutes)
      .map((f) => ({ ...f, geometry: scaleAround(f.geometry, origin, contourScale(a.grow, f.properties.minutes)) }));
    layers.push(
      new GeoJsonLayer({
        id: "station-isochrones",
        data: { type: "FeatureCollection", features: own },
        filled: true,
        stroked: true,
        getFillColor: (f) => bandFill(f.properties.minutes, a.theme),
        getLineColor: [...ink, 150],
        getLineWidth: 1.2,
        lineWidthUnits: "pixels",
        updateTriggers: { getFillColor: [a.theme] },
      }),
    );
  }

  if (a.barrio) {
    layers.push(
      new GeoJsonLayer({
        id: "barrio",
        data: a.barrio,
        filled: true,
        stroked: true,
        getFillColor: [...ink, 30],
        getLineColor: [...ink, 255],
        getLineWidth: 3,
        lineWidthUnits: "pixels",
      }),
    );
  }

  layers.push(
    new PathLayer({
      id: "network",
      data: a.lines.features.filter((f) => f.properties.has_ridership),
      getPath: (f: LinesGeo["features"][number]) =>
        f.geometry.type === "LineString" ? f.geometry.coordinates : f.geometry.coordinates.flat(),
      getColor: (f: LinesGeo["features"][number]) => [...hexToRgb(lineInfo(f.properties.id).color), 220],
      getWidth: 3,
      widthUnits: "pixels",
      capRounded: true,
      jointRounded: true,
    }),
    new ScatterplotLayer<StationFeature>({
      id: "access-stations",
      data: a.stations,
      getPosition: (f) => f.geometry.coordinates,
      getRadius: (f) => (f.properties.id === a.selected?.properties.id ? 8 : a.allowed.has(f.properties.id) ? 5.5 : 3),
      radiusUnits: "pixels",
      getFillColor: (f) =>
        f.properties.id === a.selected?.properties.id
          ? [101, 188, 75, 255]
          : a.allowed.has(f.properties.id)
            ? dark
              ? [21, 28, 27, 255]
              : [255, 255, 255, 255]
            : [...ink, 60],
      getLineColor: [...ink, 230],
      getLineWidth: (f) => (a.allowed.has(f.properties.id) ? 1.8 : 0),
      lineWidthUnits: "pixels",
      stroked: true,
      pickable: true,
      onClick: (info) => {
        if (info.object && a.allowed.has(info.object.properties.id)) a.onStation(info.object.properties.id);
      },
      updateTriggers: {
        getRadius: [a.selected, a.allowed],
        getFillColor: [a.selected, a.allowed, a.theme],
        getLineWidth: [a.allowed],
      },
    }),
  );

  if (a.selected) {
    layers.push(
      new TextLayer({
        id: "selected-label",
        data: [a.selected],
        getPosition: (f: StationFeature) => f.geometry.coordinates,
        getText: (f: StationFeature) => f.properties.name,
        getPixelOffset: [0, -18],
        getSize: 14,
        getColor: [...ink, 255],
        fontFamily: "Outfit, sans-serif",
        fontWeight: 600,
        characterSet: CHARS,
        fontSettings: FONT_SETTINGS,
        outlineWidth: 3,
        outlineColor: dark ? [11, 16, 15, 230] : [255, 255, 255, 230],
      }),
    );
  }

  if (a.point) {
    layers.push(
      new ScatterplotLayer({
        id: "query-point",
        data: [a.point],
        getPosition: (p: LonLat) => p,
        getRadius: 7,
        radiusUnits: "pixels",
        getFillColor: [228, 87, 46, 255],
        getLineColor: [255, 255, 255, 255],
        getLineWidth: 2.5,
        lineWidthUnits: "pixels",
        stroked: true,
      }),
    );
  }
  return layers;
}
