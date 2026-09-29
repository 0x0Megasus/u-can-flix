const SEED_STORAGE_KEY = 'ucanflix:rotation-seed';
const DAILY_MS = 24 * 60 * 60 * 1000;

/**
 * Deterministic 32-bit PRNG (mulberry32).
 *
 * Deterministic matters: the same seed must always produce the same order,
 * otherwise server and client markup disagree and React reports a hydration
 * mismatch.
 */
function mulberry32(seed) {
  let a = seed >>> 0;
  return function next() {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashString(value) {
  let h = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    h ^= value.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Days since epoch — the default rotation period. */
export function daysSinceEpoch(now = Date.now()) {
  return Math.floor(now / DAILY_MS);
}

/** Rotates every 6 hours so a single day shows four distinct sets. */
export function sixHourBucket(now = Date.now()) {
  return Math.floor(now / (DAILY_MS / 4));
}

function writeStoredSeed(seed) {
  if (typeof window === 'undefined') return;
  try {
    window.sessionStorage.setItem(SEED_STORAGE_KEY, String(seed));
  } catch {
    /* sessionStorage unavailable — rotation still works, just resets */
  }
}

/** Re-rolls the seed and returns the new value, so the UI can reshuffle. */
export function reshuffle() {
  let seed;
  try {
    const buf = new Uint32Array(1);
    window.crypto.getRandomValues(buf);
    seed = buf[0];
  } catch {
    seed = Math.floor(Math.random() * 0xffffffff);
  }
  seed = (seed || 1) >>> 0;
  writeStoredSeed(seed);
  return seed;
}

/** Fisher–Yates using the seeded PRNG. Does not mutate the input. */
export function shuffle(items, seed, salt = 0) {
  if (!Array.isArray(items) || items.length < 2) return Array.isArray(items) ? [...items] : [];

  const out = [...items];
  const rand = mulberry32((hashString(String(seed)) ^ (salt * 0x9e3779b9)) >>> 0);

  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rand() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/**
 * Picks `count` items, reshuffling first when `rotate` is set.
 * The rotated and ordered variants are disjoint so the rows stay distinct.
 */
export function pickRotating(items, { seed = 0, salt = 0, count, rotate = true } = {}) {
  if (!Array.isArray(items) || items.length === 0) return [];
  if (!rotate) return items.slice(0, count ?? items.length);
  return shuffle(items, seed, salt).slice(0, count ?? items.length);
}
