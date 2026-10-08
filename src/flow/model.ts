import type { DayTypeKey, Feature, LineGeometry, LineProps, LinesGeo, LonLat, Profiles } from "../data/types";
import { type LineInfo, LINE_IDS, lineInfo } from "../lib/lines";
import { type MeasuredPath, measure } from "./path";

export interface FlowLine {
  id: string;
  info: LineInfo;
  km: number;
  indicative: boolean;
  planned: boolean;
  values: number[];
  daily: number;
  paths: LonLat[][];
  parts: MeasuredPath[];
}

const pathsOf = (g: LineGeometry): LonLat[][] => (g.type === "LineString" ? [g.coordinates] : g.coordinates);

// Join line geometry with the mean hourly profile for one period and day type
export function buildFlowLines(
  geo: LinesGeo,
  profiles: Profiles,
  period: string,
  dayType: DayTypeKey,
): { flow: FlowLine[]; noData: Feature<LineGeometry, LineProps>[] } {
  const byLine = profiles.periods[period]?.[dayType] ?? {};
  const flow: FlowLine[] = [];
  const noData: Feature<LineGeometry, LineProps>[] = [];
  for (const f of geo.features) {
    const values = byLine[f.properties.id];
    if (!f.properties.has_ridership || !values) {
      noData.push(f);
      continue;
    }
    const paths = pathsOf(f.geometry);
    flow.push({
      id: f.properties.id,
      info: lineInfo(f.properties.id),
      km: f.properties.km,
      indicative: f.properties.indicative,
      planned: f.properties.estado.some((e) => e >= 4),
      values,
      daily: values.reduce((s, v) => s + v, 0),
      paths,
      parts: paths.map(measure),
    });
  }
  flow.sort((a, b) => LINE_IDS.indexOf(a.id) - LINE_IDS.indexOf(b.id));
  return { flow, noData };
}
