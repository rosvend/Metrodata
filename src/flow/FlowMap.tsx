import { useMemo, useState } from "react";
import type { Feature, FeedersGeo, LineGeometry, LineProps, StationsGeo } from "../data/types";
import type { Theme } from "../lib/theme";
import { BaseMap } from "../map/BaseMap";
import { type Bounds, overlayPadding } from "../map/view";
import type { ContextData } from "../map/context";
import { type HoverTarget, buildLayers } from "./layers";
import type { Metric } from "./metrics";
import type { FlowLine } from "./model";

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

function boundsOf(flow: FlowLine[]): Bounds {
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

  const layers = buildLayers({ ...props, focus: hoverLine ?? props.selected, onHover: handleHover, onClick: onSelect });

  return (
    <BaseMap
      bounds={bounds}
      padding={overlayPadding(220)}
      layers={layers}
      context={props.context}
      theme={props.theme}
      onClick={(info) => !info.object && onSelect(null)}
      onError={props.onError}
    />
  );
}
