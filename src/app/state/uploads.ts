// ─── Uploaded Image Persistence (IndexedDB) ────────────────────────────
// Uploaded images are too large for localStorage, so they are stored as
// data URLs in IndexedDB under a single record. This keeps the user's
// background image across reloads instead of silently dropping it.

const DB_NAME = 'poster-studio';
const DB_VERSION = 1;
const STORE = 'uploads';
const KEY = 'current';

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/** Persist the uploaded image data URL. Fails silently (returns false). */
export async function saveUploadedImage(dataUrl: string | null): Promise<boolean> {
  try {
    const db = await openDb();
    return await new Promise<boolean>((resolve, reject) => {
      const tx = db.transaction(STORE, 'readwrite');
      const store = tx.objectStore(STORE);
      if (dataUrl === null) {
        store.delete(KEY);
      } else {
        store.put(dataUrl, KEY);
      }
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(tx.error);
    });
  } catch {
    return false;
  }
}

/** Load the persisted uploaded image data URL, or null if absent/unavailable. */
export async function loadUploadedImage(): Promise<string | null> {
  try {
    const db = await openDb();
    return await new Promise<string | null>((resolve, reject) => {
      const tx = db.transaction(STORE, 'readonly');
      const request = tx.objectStore(STORE).get(KEY);
      request.onsuccess = () => {
        resolve(typeof request.result === 'string' ? request.result : null);
      };
      request.onerror = () => reject(request.error);
    });
  } catch {
    return null;
  }
}

// ─── Image Downscale Guard ─────────────────────────────────────

/** Longest edge accepted for an uploaded image; larger images are scaled down. */
const MAX_EDGE = 2160;

/**
 * Read an image File as a data URL, downscaling it if either edge exceeds
 * MAX_EDGE. Keeps huge photos from bloating state, IndexedDB, and the
 * re-render cost of multiple full-size PosterRenderers.
 * Returns null if the image cannot be decoded.
 */
export function readAndDownscaleImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Could not read file'));
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const img = new Image();
      img.onerror = () => reject(new Error('Could not decode image'));
      img.onload = () => {
        const longest = Math.max(img.width, img.height);
        if (longest <= MAX_EDGE) {
          resolve(dataUrl);
          return;
        }
        const ratio = MAX_EDGE / longest;
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(img.width * ratio);
        canvas.height = Math.round(img.height * ratio);
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(dataUrl); // fall back to original rather than failing
          return;
        }
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', 0.9));
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  });
}
