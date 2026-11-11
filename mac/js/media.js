// Fotos y videos cargados desde el menú oculto. Se guardan en la Mac (IndexedDB del navegador),
// así sobreviven a recargas, a cerrar la tapa y funcionan sin conexión.
const DB = 'invisible-mac-media';
const STORE = 'media';
export const M = {}; // clave -> objectURL
export const T = {}; // clave -> tipo MIME

export const MEDIOS = [
  { key: 'video', label: 'Video de Martina durmiendo (el adjunto del mail)', accept: 'video/*' },
  { key: 'fondo', label: 'Fondo de pantalla', accept: 'image/*' },
  { key: 'portada', label: 'Portada del disco (reproductor de música)', accept: 'image/*' },
  { key: 'camara', label: 'Video de respaldo para la cámara "en vivo" (ESC 3, si no se usa la webcam real)', accept: 'video/*' }
];

function abrir() {
  return new Promise((res, rej) => {
    const r = indexedDB.open(DB, 1);
    r.onupgradeneeded = () => r.result.createObjectStore(STORE);
    r.onsuccess = () => res(r.result);
    r.onerror = () => rej(r.error);
  });
}
async function tx(modo, fn) {
  const db = await abrir();
  return new Promise((res, rej) => {
    const t = db.transaction(STORE, modo);
    const out = fn(t.objectStore(STORE));
    t.oncomplete = () => res(out && out.result);
    t.onerror = () => rej(t.error);
  });
}
export async function guardarMedio(key, blob) {
  await tx('readwrite', (s) => s.put(blob, key));
  if (M[key]) URL.revokeObjectURL(M[key]);
  M[key] = URL.createObjectURL(blob);
  T[key] = blob.type || '';
}
export async function borrarMedio(key) {
  await tx('readwrite', (s) => s.delete(key));
  if (M[key]) URL.revokeObjectURL(M[key]);
  delete M[key];
  delete T[key];
}
export async function cargarMedios() {
  try {
    const db = await abrir();
    await new Promise((res) => {
      const t = db.transaction(STORE, 'readonly');
      const req = t.objectStore(STORE).openCursor();
      req.onsuccess = () => {
        const c = req.result;
        if (!c) return res();
        M[c.key] = URL.createObjectURL(c.value);
        T[c.key] = c.value.type || '';
        c.continue();
      };
      req.onerror = () => res();
    });
  } catch (e) {
    console.warn('No se pudieron leer los medios', e);
  }
}
export const esVideo = (key) => (T[key] || '').startsWith('video/');
