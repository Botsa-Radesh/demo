const UNSPLASH_API = 'https://api.unsplash.com/search/photos';
const CACHE_PREFIX = 'unsplash-img-';
const CACHE_DURATION = 7 * 24 * 60 * 60 * 1000;

interface CacheEntry {
  url: string;
  expires: number;
}

function getApiKey(): string | null {
  try {
    if (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY) {
      return process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY;
    }
  } catch {}
  return null;
}

function getCached(id: string): string | null {
  try {
    const raw = localStorage.getItem(CACHE_PREFIX + id);
    if (!raw) return null;
    const entry: CacheEntry = JSON.parse(raw);
    if (Date.now() > entry.expires) {
      localStorage.removeItem(CACHE_PREFIX + id);
      return null;
    }
    return entry.url;
  } catch {
    return null;
  }
}

function setCache(id: string, url: string) {
  try {
    localStorage.setItem(CACHE_PREFIX + id, JSON.stringify({ url, expires: Date.now() + CACHE_DURATION }));
  } catch {}
}

export async function fetchProductImage(productId: string, query: string): Promise<string | null> {
  const cached = getCached(productId);
  if (cached) return cached;

  const key = getApiKey();
  if (!key) return null;

  try {
    const res = await fetch(`${UNSPLASH_API}?query=${encodeURIComponent(query)}&per_page=1&orientation=squarish`, {
      headers: { Authorization: `Client-ID ${key}` },
    });
    if (!res.ok) return null;
    const data = await res.json();
    const url = data?.results?.[0]?.urls?.small || null;
    if (url) setCache(productId, url);
    return url;
  } catch {
    return null;
  }
}
