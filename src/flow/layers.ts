import type { Layer } from "@deck.gl/core";
import { PathStyleExtension, type PathStyleExtensionProps } from "@deck.gl/extensions";
import { PathLayer, ScatterplotLayer, TextLayer } from "@deck.gl/layers";
import type { Feature, FeedersGeo, LineGeometry, LineProps, LonLat, StationsGeo } from "../data/types";

import type { Theme } from "../lib/theme";
import { hexToRgb } from "../lib/lines";
import { type Metric, interpolate, metricValue, opacityFor, particleCount, widthFor } from "./metrics";
import type { FlowLine } from "./model";
import { pointAlong } from "./path";
import { placeParticles } from "./particles";

const MAX_PARTICLES = 70;
const DASH = new PathStyleExtension({ dash: true });

export type HoverTarget =
  { kind: "line"; id: string } | { kind: "station"; id: string } | { kind: "nodata"; id: string };

export interface LayerInput {
  flow: FlowLine[];
  noData: Feature<LineGeometry, LineProps>[];
  stations: StationsGeo | null;
  feeders: FeedersGeo | null;
  t: number;
  clock: number;
  metric: Metric;
  max: number;
  focus: string | null;
  theme: Theme;
  onHover: (target: HoverTarget | null, client: { x: number; y: number }) => void;
  onClick: (lineId: string | null) => void;
}

interface Segment {
  line: FlowLine;
  path: LonLat[];
}

// Deck passes the DOM event as the second hover argument; tooltips are placed in viewport coordinates
const client = (event: { srcEvent?: unknown }) => {
  const e = event.srcEvent as { clientX?: number; clientY?: number } | undefined;
  return { x: e?.clientX ?? 0, y: e?.clientY ?? 0 };
};

const valueAt = (l: FlowLine, t: number, metric: Metric) => metricValue(interpolate(l.values, t), metric, l);

export function buildLayers(input: LayerInput): Layer[] {
  const { flow, t, metric, max, focus, theme, clock } = input;
  const dark = theme === "dark";
  const segments: Segment[] = flow.flatMap((line) => line.paths.map((path) => ({ line, path })));
  const dim = (id: string) => focus !== null && focus !== id;
  const trigger = [t, metric, max, focus];

  const layers: Layer[] = [];

  if (input.feeders) {
    layers.push(
      new PathLayer({
        id: "feeders",
        data: input.feeders.features.flatMap((f) =>
          f.geometry.type === "LineString" ? [f.geometry.coordinates] : f.geometry.coordinates,
        ),
        getPath: (d: LonLat[]) => d,
        getColor: dark ? [180, 196, 194, 110] : [73, 73, 73, 90],
        getWidth: 1.2,
        widthUnits: "pixels",
      }),
    );
  }

  layers.push(
    new PathLayer<Feature<LineGeometry, LineProps>, PathStyleExtensionProps<Feature<LineGeometry, LineProps>>>({
      id: "no-data",
      data: input.noData,
      getPath: (f) => (f.geometry.type === "LineString" ? f.geometry.coordinates : (f.geometry.coordinates[0] ?? [])),
      getColor: dark ? [166, 178, 176, 200] : [105, 105, 105, 200],
      getWidth: 3,
      widthUnits: "pixels",
      getDashArray: [2, 2],
      extensions: [DASH],
      pickable: true,
      onHover: (info, event) =>
        input.onHover(info.object ? { kind: "nodata", id: info.object.properties.id } : null, client(event)),
    }),
    new PathLayer<Segment>({
      id: "casing",
      data: segments,
      getPath: (d) => d.path,
      getColor: (d) => (dark ? [242, 245, 244, dim(d.line.id) ? 25 : 110] : [17, 23, 22, dim(d.line.id) ? 30 : 120]),
      getWidth: (d) => widthFor(valueAt(d.line, t, metric), max) + 3,
      widthUnits: "pixels",
      capRounded: true,
      jointRounded: true,
      updateTriggers: { getWidth: trigger, getColor: trigger },
    }),
    new PathLayer<Segment, PathStyleExtensionProps<Segment>>({
      id: "lines",
      data: segments,
      getPath: (d) => d.path,
      getColor: (d) => {
        const alpha = opacityFor(valueAt(d.line, t, metric), max) * (dim(d.line.id) ? 0.25 : 1);
        return [...hexToRgb(d.line.info.color), Math.round(alpha * 255)];
      },
      getWidth: (d) => widthFor(valueAt(d.line, t, metric), max),
      widthUnits: "pixels",
      capRounded: true,
      jointRounded: true,
      getDashArray: (d) => (d.line.planned ? [3, 1.5] : [0, 0]),
      extensions: [DASH],
      pickable: true,
      autoHighlight: false,
      onHover: (info, event) =>
        input.onHover(info.object ? { kind: "line", id: info.object.line.id } : null, client(event)),
      onClick: (info) => input.onClick(info.object ? info.object.line.id : null),
      updateTriggers: { getWidth: trigger, getColor: trigger },
      transitions: { getWidth: 0 },
    }),
  );

  const counts = Object.fromEntries(
    flow.filter((l) => !dim(l.id)).map((l) => [l.id, particleCount(valueAt(l, t, metric), max, MAX_PARTICLES)]),
  );
  layers.push(
    new ScatterplotLayer({
      id: "particles",
      data: placeParticles(flow, counts, clock),
      getPosition: (d: { position: LonLat }) => d.position,
      getRadius: 2.4,
      radiusUnits: "pixels",
      getFillColor: dark ? [242, 245, 244, 235] : [255, 255, 255, 235],
      stroked: false,
    }),
  );

  if (input.stations) {
    layers.push(
      new ScatterplotLayer<StationsGeo["features"][number]>({
        id: "stations",
        data: input.stations.features,
        getPosition: (f) => f.geometry.coordinates,
        getRadius: (f) => (f.properties.tipo === 1 ? 4 : 2.5),
        radiusUnits: "pixels",
        getFillColor: dark ? [21, 28, 27, 255] : [255, 255, 255, 255],
        getLineColor: dark ? [242, 245, 244, 230] : [17, 23, 22, 230],
        getLineWidth: 1.5,
        lineWidthUnits: "pixels",
        stroked: true,
        pickable: true,
        onHover: (info, event) =>
          input.onHover(info.object ? { kind: "station", id: info.object.properties.id } : null, client(event)),
      }),
    );
  }
  return layers;
}

const LABEL_CHARS = [..."ABHJKLMPTO12"];

// Letter badges on each line so lines are identifiable without relying on colour (WCAG 1.4.1)
export function lineLabelLayer(flow: FlowLine[]): Layer {
  const data = flow.map((line) => {
    const longest = line.parts.reduce((a, b) => (b.total > a.total ? b : a));
    return { line, position: pointAlong(longest, 0.5) };
  });
  return new TextLayer({
    id: "line-labels",
    data,
    getPosition: (d: { position: LonLat }) => d.position,
    getText: (d: { line: FlowLine }) => d.line.info.badge,
    getColor: (d: { line: FlowLine }) => [...hexToRgb(d.line.info.text), 255],
    getSize: 13,
    fontFamily: "Outfit, sans-serif",
    fontWeight: 700,
    characterSet: LABEL_CHARS,
    background: true,
    getBackgroundColor: (d: { line: FlowLine }) => [...hexToRgb(d.line.info.color), 255],
    backgroundPadding: [5, 2],
    getBorderColor: [255, 255, 255, 230],
    getBorderWidth: 1.5,
  });
}
