const cache = new Map<string, Promise<unknown>>();

export function loadJson<T>(name: string): Promise<T> {
  const hit = cache.get(name);
  if (hit) return hit as Promise<T>;
  const request = fetch(`/data/${name}`).then(async (res) => {
    if (!res.ok) throw new Error(`${name} could not be loaded (HTTP ${res.status})`);
    return (await res.json()) as T;
  });
  cache.set(name, request);
  request.catch(() => cache.delete(name));
  return request;
}

export const clearCache = (): void => cache.clear();
