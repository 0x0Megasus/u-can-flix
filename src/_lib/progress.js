const STORAGE_KEY = 'ucanflix:progress';
const MAX_ENTRIES = 60;

/**
 * Providers postMessage their own progress objects. VidLink and Peachify
 * share an identical shape, so a single store handles both.
 */
function isTrustedOrigin(origin) {
  return /(^|\.)(vidlink\.pro|peachify\.top|vidnest\.fun|2embed\.cc)$/i.test(origin);
}

function readStore() {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function writeStore(store) {
  if (typeof window === 'undefined') return;
  try {
    const keys = Object.keys(store);
    if (keys.length > MAX_ENTRIES) {
      const sorted = keys.sort((a, b) => (store[b]?.last_updated || 0) - (store[a]?.last_updated || 0));
      for (const key of sorted.slice(MAX_ENTRIES)) delete store[key];
    }
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch { /* quota or private mode — progress is best-effort */ }
}

/** Merges a provider MEDIA_DATA payload into local storage. */
export function ingestMediaData(payload) {
  if (!payload || typeof payload !== 'object') return;
  const store = readStore();
  let changed = false;
  for (const [id, entry] of Object.entries(payload)) {
    if (!entry || typeof entry !== 'object') continue;
    store[String(id)] = { ...entry, last_updated: entry.last_updated || Date.now() };
    changed = true;
  }
  if (changed) {
    writeStore(store);
    window.dispatchEvent(new CustomEvent('progress:update'));
  }
}

/**
 * Subscribes to player events from the supported providers.
 * Returns an unsubscribe function.
 */
export function listenForProgress() {
  if (typeof window === 'undefined') return () => {};

  function onMessage(event) {
    if (!isTrustedOrigin(event.origin)) return;
    const data = event.data;
    if (!data || typeof data !== 'object') return;

    if (data.type === 'MEDIA_DATA') {
      ingestMediaData(data.data);
      return;
    }

    if (data.type === 'PLAYER_EVENT') {
      const detail = data.data;
      if (!detail) return;
      if (detail.event === 'ended') {
        // Finished — drop it so it stops appearing in Continue Watching.
        const store = readStore();
        const key = String(detail.tmdbId);
        if (store[key]) {
          delete store[key];
          writeStore(store);
          window.dispatchEvent(new CustomEvent('progress:update'));
        }
      }
    }
  }

  window.addEventListener('message', onMessage);
  return () => window.removeEventListener('message', onMessage);
}

export function getProgressEntries() {
  const store = readStore();
  return Object.entries(store)
    .map(([id, entry]) => ({ id: String(id), ...entry }))
    .filter(entry => {
      const p = entry.progress;
      if (!p || !p.duration) return false;
      const ratio = p.watched / p.duration;
      return ratio > 0.01 && ratio < 0.97;
    })
    .sort((a, b) => (b.last_updated || 0) - (a.last_updated || 0));
}

export function getProgressFor(tmdbId) {
  if (!tmdbId) return null;
  return readStore()[String(tmdbId)] || null;
}

const META_KEY = 'ucanflix:title-meta';
const MAX_META = 200;

function readMeta() {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(META_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

/** Remembers the title behind an id so Continue Watching can link it later. */
export function rememberTitleMeta(id, meta) {
  if (typeof window === 'undefined' || !id || !meta) return;
  try {
    const store = readMeta();
    store[String(id)] = { ...meta, last_updated: Date.now() };
    const keys = Object.keys(store).sort((a, b) => (store[b]?.last_updated || 0) - (store[a]?.last_updated || 0));
    for (const key of keys.slice(MAX_META)) delete store[key];
    window.localStorage.setItem(META_KEY, JSON.stringify(store));
  } catch { /* best-effort */ }
}

export function getTitleMeta() {
  return readMeta();
}

export function clearProgress() {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch { /* ignore */ }
  window.dispatchEvent(new CustomEvent('progress:update'));
}
