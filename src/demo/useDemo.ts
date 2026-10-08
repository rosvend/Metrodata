import { createContext, useContext } from "react";
import type { DemoStep } from "./steps";

export interface Demo {
  steps: DemoStep[];
  index: number | null;
  error: string | null;
  start: () => void;
  go: (i: number) => void;
  stop: () => void;
}

export const DemoCtx = createContext<Demo | null>(null);

export function useDemo(): Demo {
  const demo = useContext(DemoCtx);
  if (!demo) throw new Error("useDemo needs a DemoProvider");
  return demo;
}
