import { GeoJsonLayer, TextLayer } from "@deck.gl/layers";
import type { Layer } from "@deck.gl/core";
import type { ComunasGeo, MaskGeo, MunicipalitiesGeo } from "../data/types";
import { useMemo } from "react";
import { useJson } from "../data/useJson";
import type { Theme } from "../lib/theme";

export interface ContextData {
  // Only the ten metro-area municipalities, filtered once so layers keep stable data between frames
  municipalities: MunicipalitiesGeo | null;
  mask: MaskGeo | null;
  comunas: ComunasGeo | null;
}

const ready = <T>(r: { status: string; data?: T }): T | null => (r.status === "ready" ? (r.data ?? null) : null);

const metroOnly = (m: MunicipalitiesGeo): MunicipalitiesGeo => ({
  ...m,
  features: m.features.filter((f) => f.properties.metro_area),
});

// City context is optional: if a file is missing the map still works without it
export function useContextLayers(): ContextData {
  const municipalities = useJson<MunicipalitiesGeo>("municipalities.geojson");
  const mask = useJson<MaskGeo>("metro_mask.geojson");
  const comunas = useJson<ComunasGeo>("comunas.geojson");
  const all = ready(municipalities);
  const maskData = ready(mask);
  const comunasData = ready(comunas);
  const metro = useMemo(() => (all ? metroOnly(all) : null), [all]);
  return useMemo(
    () => ({ municipalities: metro, mask: maskData, comunas: comunasData }),
    [metro, maskData, comunasData],
  );
}

// Valle de Aburrá focus: shade outside the metro area, outline municipalities and Medellín's comunas
export function contextLayers(ctx: ContextData, theme: Theme): Layer[] {
  const dark = theme === "dark";
  const ink: [number, number, number] = dark ? [242, 245, 244] : [17, 23, 22];
  const layers: Layer[] = [];
  if (ctx.mask) {
    layers.push(
      new GeoJsonLayer({
        id: "mask",
        data: ctx.mask,
        filled: true,
        stroked: false,
        getFillColor: dark ? [0, 0, 0, 150] : [17, 23, 22, 34],
      }),
    );
  }
  if (ctx.comunas) {
    layers.push(
      new GeoJsonLayer({
        id: "comunas",
        data: ctx.comunas,
        filled: false,
        stroked: true,
        getLineColor: [...ink, dark ? 40 : 45],
        getLineWidth: 0.8,
        lineWidthUnits: "pixels",
      }),
    );
  }
  if (ctx.municipalities) {
    layers.push(
      new GeoJsonLayer({
        id: "municipalities",
        data: ctx.municipalities,
        filled: true,
        stroked: true,
        getFillColor: (f) => (f.properties.name === "Medellín" ? [101, 188, 75, dark ? 22 : 26] : [0, 0, 0, 0]),
        getLineColor: [...ink, dark ? 110 : 120],
        getLineWidth: (f) => (f.properties.name === "Medellín" ? 2 : 1.2),
        lineWidthUnits: "pixels",
      }),
    );
  }
  return layers;
}

// Stable references: new objects here would make deck.gl rebuild the font atlas every frame
const FONT_SETTINGS = { sdf: true };
const CHARACTER_SET = [..."ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyzáéíóúüñÁÉÍÓÚÜÑ -'."];

// Municipality names drawn above the lines so they stay readable
export function labelLayer(ctx: ContextData, theme: Theme): Layer[] {
  if (!ctx.municipalities) return [];
  const dark = theme === "dark";
  const ink: [number, number, number] = dark ? [242, 245, 244] : [17, 23, 22];
  return [
    new TextLayer({
      id: "municipality-labels",
      data: ctx.municipalities.features,
      getPosition: (f) => [f.properties.label_lon, f.properties.label_lat],
      getText: (f) => f.properties.name,
      getSize: (f) => (f.properties.name === "Medellín" ? 15 : 12),
      getColor: [...ink, dark ? 170 : 150],
      fontFamily: "Outfit, sans-serif",
      fontWeight: 600,
      characterSet: CHARACTER_SET,
      outlineWidth: 3,
      outlineColor: dark ? [11, 16, 15, 220] : [255, 255, 255, 220],
      fontSettings: FONT_SETTINGS,
    }),
  ];
}
