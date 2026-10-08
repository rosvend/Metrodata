import type { Layer, PickingInfo } from "@deck.gl/core";
import { MapLibreOverlay, type MapLibreOverlayProps } from "@deck.gl/maplibre";
import { setWorkerUrl } from "maplibre-gl";
import maplibreWorkerUrl from "maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url";
import "maplibre-gl/dist/maplibre-gl.css";
import { useReducedMotion } from "motion/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { AttributionControl, Map as MapView, type MapRef, useControl } from "react-map-gl/maplibre";
import type { Theme } from "../lib/theme";
import { type ContextData, contextLayers, labelLayer } from "./context";

setWorkerUrl(maplibreWorkerUrl);

// Label-free basemaps: our own layers name the municipalities that matter
const STYLES: Record<Theme, string> = {
  light: "https://basemaps.cartocdn.com/gl/positron-nolabels-gl-style/style.json",
  dark: "https://basemaps.cartocdn.com/gl/dark-matter-nolabels-gl-style/style.json",
};

// Panning and zooming stay within the Valle de Aburrá
const MAX_BOUNDS: [number, number, number, number] = [-75.95, 5.95, -75.2, 6.56];
const MIN_ZOOM = 10;

import type { Bounds, FlyTarget, Padding } from "./view";

function DeckOverlay(props: MapLibreOverlayProps) {
  const overlay = useControl<MapLibreOverlay>(() => new MapLibreOverlay(props));
  overlay.setProps(props);
  return null;
}

interface Props {
  bounds: Bounds;
  padding: Padding;
  layers: Layer[];
  context: ContextData;
  theme: Theme;
  onClick?: (info: PickingInfo) => void;
  onError: (message: string) => void;
  flyTo?: FlyTarget | null;
}

// MapLibre basemap + deck.gl overlay with the Valle de Aburrá context drawn below and labels above `layers`
export function BaseMap({ bounds, padding, layers, context, theme, onClick, onError, flyTo }: Props) {
  const mapRef = useRef<MapRef>(null);
  const reduced = useReducedMotion() ?? false;
  // A deep link can ask for a flight before the style has loaded; wait for it
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    if (!flyTo || !loaded) return;
    mapRef.current?.flyTo({
      center: flyTo.center,
      zoom: flyTo.zoom,
      duration: reduced ? 0 : 1200,
      ...(flyTo.padding ? { padding: flyTo.padding } : {}),
    });
  }, [flyTo, reduced, loaded]);
  const below = useMemo(() => contextLayers(context, theme), [context, theme]);
  const above = useMemo(() => labelLayer(context, theme), [context, theme]);
  return (
    <MapView
      ref={mapRef}
      initialViewState={{ bounds, fitBoundsOptions: { padding } }}
      maxBounds={MAX_BOUNDS}
      minZoom={MIN_ZOOM}
      mapStyle={STYLES[theme]}
      style={{ width: "100%", height: "100%" }}
      attributionControl={false}
      dragRotate={false}
      onError={(e) => onError(e.error?.message ?? "The map could not be drawn")}
      onLoad={() => setLoaded(true)}
    >
      <AttributionControl position="top-right" compact />
      <DeckOverlay
        layers={[...below, ...layers, ...above]}
        {...(onClick ? { onClick } : {})}
        getCursor={({ isHovering }) => (isHovering ? "pointer" : "grab")}
      />
    </MapView>
  );
}
