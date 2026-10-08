import type { PickingInfo } from "@deck.gl/core";
import { MapLibreOverlay, type MapLibreOverlayProps } from "@deck.gl/maplibre";
import { setWorkerUrl } from "maplibre-gl";
import maplibreWorkerUrl from "maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url";
import "maplibre-gl/dist/maplibre-gl.css";
import { useMemo, useState } from "react";
import { Map as MapView, useControl } from "react-map-gl/maplibre";
import type { Feature, FeedersGeo, LineGeometry, LineProps, StationsGeo } from "../data/types";
import type { Theme } from "../lib/theme";
import { type HoverTarget, buildLayers } from "./layers";
import type { Metric } from "./metrics";
import type { FlowLine } from "./model";

setWorkerUrl(maplibreWorkerUrl);

const STYLES: Record<Theme, string> = {
  light: "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json",
  dark: "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json",
};

function DeckOverlay(props: MapLibreOverlayProps) {
  const overlay = useControl<MapLibreOverlay>(() => new MapLibreOverlay(props));
  overlay.setProps(props);
  return null;
}

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

  const handleHover = (target: HoverTarget | null, info: PickingInfo) => {
    setHoverLine(target?.kind === "line" ? target.id : null);
    onHover(target ? { target, x: info.x, y: info.y } : null);
  };

  const layers = buildLayers({
    ...props,
    focus: hoverLine ?? props.selected,
    onHover: handleHover,
    onClick: onSelect,
  });

  return (
    <MapView
      initialViewState={{ bounds, fitBoundsOptions: { padding: 32 } }}
      mapStyle={STYLES[props.theme]}
      style={{ width: "100%", height: "100%" }}
      attributionControl={{ compact: true }}
      dragRotate={false}
      onError={(e) => props.onError(e.error?.message ?? "The map could not be drawn")}
    >
      <DeckOverlay
        layers={layers}
        onClick={(info) => !info.object && onSelect(null)}
        getCursor={({ isHovering }) => (isHovering ? "pointer" : "grab")}
      />
    </MapView>
  );
}
