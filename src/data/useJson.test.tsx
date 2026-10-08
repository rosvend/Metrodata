import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { clearCache } from "./load";
import { useJson } from "./useJson";

afterEach(() => {
  clearCache();
  vi.unstubAllGlobals();
});

describe("useJson", () => {
  it("goes from loading to ready", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response('{"ok":true}')));
    const { result } = renderHook(() => useJson<{ ok: boolean }>("a.json"));
    expect(result.current.status).toBe("loading");
    await waitFor(() => expect(result.current).toEqual({ status: "ready", data: { ok: true } }));
  });

  it("reports errors and can retry", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(new Response("x", { status: 500 }))
      .mockResolvedValueOnce(new Response('{"ok":true}'));
    vi.stubGlobal("fetch", fetchMock);
    const { result } = renderHook(() => useJson<{ ok: boolean }>("b.json"));
    await waitFor(() => expect(result.current.status).toBe("error"));
    const state = result.current;
    if (state.status !== "error") throw new Error("expected error state");
    expect(state.error).toContain("HTTP 500");
    act(() => state.retry());
    await waitFor(() => expect(result.current.status).toBe("ready"));
  });
});
