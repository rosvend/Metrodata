import { afterEach, describe, expect, it, vi } from "vitest";
import { clearCache, loadJson } from "./load";

afterEach(() => {
  clearCache();
  vi.unstubAllGlobals();
});

describe("loadJson", () => {
  it("fetches from /data and caches by name", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ a: 1 })));
    vi.stubGlobal("fetch", fetchMock);
    await expect(loadJson("kpis.json")).resolves.toEqual({ a: 1 });
    await loadJson("kpis.json");
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith("/data/kpis.json");
  });

  it("rejects with a readable error on HTTP failure and does not cache it", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response("nope", { status: 404 }));
    vi.stubGlobal("fetch", fetchMock);
    await expect(loadJson("missing.json")).rejects.toThrow("missing.json could not be loaded (HTTP 404)");
    await expect(loadJson("missing.json")).rejects.toThrow();
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});
