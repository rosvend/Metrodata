export type Bounds = [[number, number], [number, number]];
export type Padding = number | { top: number; bottom: number; left: number; right: number };

// A camera move requested by the page; a new object triggers a new flight
export interface FlyTarget {
  center: [number, number];
  zoom: number;
  padding?: { top: number; bottom: number; left: number; right: number };
}

// Leave room for the floating title card and control panel on large screens
export const overlayPadding = (bottom: number): Padding =>
  typeof matchMedia === "function" && matchMedia("(min-width: 1024px)").matches
    ? { top: 40, bottom, left: 60, right: 60 }
    : 24;
