// store.js — wrapper localStorage (aman di mode privat: gagal diam-diam).

const PREFIX = "afterlife-kit:";

export function save(key, value) {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value));
    return true;
  } catch {
    return false; // mode privat / storage penuh — app tetap jalan tanpa persistensi
  }
}

export function load(key, fallback = null) {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    return raw === null ? fallback : JSON.parse(raw);
  } catch {
    return fallback;
  }
}

export function remove(key) {
  try { localStorage.removeItem(PREFIX + key); } catch { /* abaikan */ }
}

/** Hapus SEMUA data Afterlife Kit dari perangkat ini. */
export function clearAll() {
  try {
    const keys = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith(PREFIX)) keys.push(k);
    }
    keys.forEach((k) => localStorage.removeItem(k));
    return true;
  } catch {
    return false;
  }
}
