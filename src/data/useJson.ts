import { useCallback, useEffect, useState } from "react";
import { loadJson } from "./load";

export type Resource<T> =
  { status: "loading" } | { status: "ready"; data: T } | { status: "error"; error: string; retry: () => void };

export function useJson<T>(name: string): Resource<T> {
  const [attempt, setAttempt] = useState(0);
  const [state, setState] = useState<{ key: string; data?: T; error?: string }>({ key: "" });
  const key = `${name}#${attempt}`;
  const retry = useCallback(() => setAttempt((a) => a + 1), []);

  useEffect(() => {
    let live = true;
    loadJson<T>(name).then(
      (data) => live && setState({ key, data }),
      (err: unknown) => live && setState({ key, error: err instanceof Error ? err.message : String(err) }),
    );
    return () => {
      live = false;
    };
  }, [name, key]);

  if (state.key !== key) return { status: "loading" };
  if (state.error !== undefined) return { status: "error", error: state.error, retry };
  return { status: "ready", data: state.data as T };
}
