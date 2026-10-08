import { MapLibreOverlay, type MapLibreOverlayProps } from "@deck.gl/maplibre";
import { setWorkerUrl } from "maplibre-gl";
import maplibreWorkerUrl from "maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url";
import "maplibre-gl/dist/maplibre-gl.css";
import { useMemo, useState } from "react";
import { AttributionControl, Map as MapView, useControl } from "react-map-gl/maplibre";
import type { Feature, FeedersGeo, LineGeometry, LineProps, StationsGeo } from "../data/types";
import { type ContextData, contextLayers, labelLayer } from "./context";
import type { Theme } from "../lib/theme";
import { type HoverTarget, buildLayers } from "./layers";
import type { Metric } from "./metrics";
import type { FlowLine } from "./model";

setWorkerUrl(maplibreWorkerUrl);

// Label-free basemaps: our own layers name the municipalities that matter
const STYLES: Record<Theme, string> = {
  light: "https://basemaps.cartocdn.com/gl/positron-nolabels-gl-style/style.json",
  dark: "https://basemaps.cartocdn.com/gl/dark-matter-nolabels-gl-style/style.json",
};

// Panning and zooming stay within the Valle de Aburrá
const MAX_BOUNDS: [number, number, number, number] = [-75.95, 5.95, -75.2, 6.56];
const MIN_ZOOM = 10;

// Leave room for the floating title card and control panel on large screens
const fitPadding = () =>
  typeof matchMedia === "function" && matchMedia("(min-width: 1024px)").matches
    ? { top: 40, bottom: 220, left: 60, right: 60 }
    : 24;

function DeckOverlay(props: MapLibreOverlayProps) {
  const overlay = useControl<MapLibreOverlay>(() => new MapLibreOverlay(props));
  overlay.setProps(props);
  return null;
}

// x and y are viewport (client) coordinates
export interface Hover {
  target: HoverTarget;
  x: number;
  y: number;
}

interface Props {
  flow: FlowLine[];
  noData: Feature<LineGeometry, LineProps>[];
  stations: StationsGeo | null;
  feeders: FeedersGeo | null;
  context: ContextData;
  t: number;
  clock: number;
  metric: Metric;
  max: number;
  selected: string | null;
  theme: Theme;
  onSelect: (id: string | null) => void;
  onHover: (hover: Hover | null) => void;
  onError: (message: string) => void;
}

function boundsOf(flow: FlowLine[]): [[number, number], [number, number]] {
  const pts = flow.flatMap((l) => l.paths.flat());
  const xs = pts.map((p) => p[0]);
  const ys = pts.map((p) => p[1]);
  return [
    [Math.min(...xs), Math.min(...ys)],
    [Math.max(...xs), Math.max(...ys)],
  ];
}

export function FlowMap(props: Props) {
  const { flow, onHover, onSelect } = props;
  const [hoverLine, setHoverLine] = useState<string | null>(null);
  const bounds = useMemo(() => boundsOf(flow), [flow]);

  const handleHover = (target: HoverTarget | null, at: { x: number; y: number }) => {
    setHoverLine(target?.kind === "line" ? target.id : null);
    onHover(target ? { target, ...at } : null);
  };

  const below = useMemo(() => contextLayers(props.context, props.theme), [props.context, props.theme]);
  const above = useMemo(() => labelLayer(props.context, props.theme), [props.context, props.theme]);
  const layers = buildLayers({
    ...props,
    below,
    above,
    focus: hoverLine ?? props.selected,
    onHover: handleHover,
    onClick: onSelect,
  });

  return (
    <MapView
      initialViewState={{ bounds, fitBoundsOptions: { padding: fitPadding() } }}
      maxBounds={MAX_BOUNDS}
      minZoom={MIN_ZOOM}
      mapStyle={STYLES[props.theme]}
      style={{ width: "100%", height: "100%" }}
      attributionControl={false}
      dragRotate={false}
      onError={(e) => props.onError(e.error?.message ?? "The map could not be drawn")}
    >
      <AttributionControl position="top-right" compact />
      <DeckOverlay
        layers={layers}
        onClick={(info) => !info.object && onSelect(null)}
        getCursor={({ isHovering }) => (isHovering ? "pointer" : "grab")}
      />
    </MapView>
  );
}
