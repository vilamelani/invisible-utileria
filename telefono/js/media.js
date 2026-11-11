// Fotos y videos cargados desde el menú oculto. Se guardan en el celular (IndexedDB),
// así sobreviven a recargas y funcionan sin conexión.
const DB = 'invisible-media';
const STORE = 'media';
export const M = {}; // clave -> objectURL listo para usar al dibujar
export const T = {}; // clave -> tipo MIME

export const MEDIOS = [
  { key: 'perfilJulian', label: 'Foto de perfil de Julián (TalkGram y Bristagram)', accept: 'image/*' },
  { key: 'historia1', label: 'Historia 1 de Bristagram (foto o video)', accept: 'image/*,video/*' },
  { key: 'historia2', label: 'Historia 2 de Bristagram', accept: 'image/*,video/*' },
  { key: 'historia3', label: 'Historia 3 de Bristagram', accept: 'image/*,video/*' },
  { key: 'corona', label: 'Foto de la corona (1.C/11)', accept: 'image/*' },
  { key: 'emily', label: 'Foto de Martina de Emily (1.E/5)', accept: 'image/*' },
  { key: 'selfie', label: 'Selfie de Martina (1.F/3), si no se saca en vivo', accept: 'image/*' },
  { key: 'fondo', label: 'Fondo de pantalla (bloqueo e inicio)', accept: 'image/*' },
  { key: 'fotoWidget', label: 'Foto del widget "Hace un año"', accept: 'image/*' }
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
      const s = t.objectStore(STORE);
      const req = s.openCursor();
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

export function esVideo(key) {
  return (T[key] || '').startsWith('video/');
}
