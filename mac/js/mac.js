// INVISIBLE — utilería de la MacBook (dirección A · Claro fiel)
import { M, cargarMedios } from './media.js';
import { initMenu, abrirMenu, refrescarMenu, menuAbierto } from './menu.js';
import { initEsc3, pintarEsc3, esc3Base, esc3Siguiente, esc3Texto } from './esc3.js';

const LS_ESTADO = 'invisible-mac-estado-v1';
const LS_AJUSTES = 'invisible-mac-ajustes-v1';
const LS_CONTENIDO = 'invisible-mac-contenido-v1';

// ---------- Ajustes (se cambian desde el menú oculto) ----------
export const A = {
  horaFija: '',        // 'HH:MM' = hora de ficción que corre desde que se fijó ('' = hora real)
  horaFijaDesde: 0,
  bateria: 82,         // % que muestra el ícono de la barra
  bateriaPct: false,   // mostrar el número al lado del ícono
  mailAuto: 0,         // seg. para que el mail entre solo al cargar el plano 1.G/2 (0 = solo con toque)
  avisoFijo: true,     // el aviso del mail queda hasta que se toca (si no, se va solo)
  avisoSeg: 6,
  cargaVideo: 8,       // seg. que tarda en cargar el video
  videoLoop: false,
  esc3Auto: true,      // ESC 3: los pasos avanzan solos
  esc3Paso: 2,         // seg. de pausa entre un paso y el siguiente (cuando terminó de escribir la terminal)
  esc3Arranque: 0,     // seg. para que arranque sola al cargar el plano (0 = con el toque)
  camFuente: 'webcam', // 'webcam' (la cámara real de la Mac) | 'video' (video de respaldo cargado en el menú)
  cursorFalso: true    // cursor que se mueve solo (y se oculta el real)
};
export let C = null; // contenido (textos)

const W0 = { musica: { x: 48, y: 70 }, correo: { x: 412, y: 62 }, video: { x: 330, y: 150 } };
function estadoBase() {
  return {
    plano: '1.A',
    musica: { sonando: true, base: C ? C.musica.posInicial : 0, t0: Date.now() },
    mail: { llego: false, hora: '', leido: false, sel: false },
    aviso: false,
    esc3: null,
    win: {
      musica: { open: true, ...W0.musica, z: 2 },
      correo: { open: false, ...W0.correo, z: 1 },
      video: { open: false, ...W0.video, z: 3, t0: 0 }
    }
  };
}
export let S = null;

export function save() { try { localStorage.setItem(LS_ESTADO, JSON.stringify(S)); } catch (e) { /* */ } }
export function saveAjustes() { try { localStorage.setItem(LS_AJUSTES, JSON.stringify(A)); } catch (e) { /* */ } }
export function setContenido(obj, persistir = true) {
  C = obj;
  if (persistir) localStorage.setItem(LS_CONTENIDO, JSON.stringify(obj));
}
export function borrarContenidoEditado() { localStorage.removeItem(LS_CONTENIDO); }

const esc = (t) => String(t ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

// ---------- Hora ----------
export function ahora() {
  if (A.horaFija) {
    const [h, m] = A.horaFija.split(':').map(Number);
    const d = new Date();
    d.setHours(h, m, 0, 0);
    return new Date(d.getTime() + (Date.now() - A.horaFijaDesde));
  }
  return new Date();
}
export const hm = (d) => `${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`;
const DIAS = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'];
const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sept', 'oct', 'nov', 'dic'];
function fechaBarra() {
  if (C.fechaBarra) return C.fechaBarra;
  const d = ahora();
  return `${DIAS[d.getDay()]} ${d.getDate()} ${MESES[d.getMonth()]}`;
}

// ---------- Íconos ----------
const ICO = {
  logo: '<svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="6.2" fill="none" stroke="currentColor" stroke-width="1.6"/><circle cx="8" cy="8" r="2.2" fill="currentColor"/></svg>',
  wifi: '<svg width="18" height="14" viewBox="0 0 18 14" aria-hidden="true"><path d="M1.5 5a10.5 10.5 0 0 1 15 0M4 7.6a7 7 0 0 1 10 0M6.5 10.2a3.5 3.5 0 0 1 5 0" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/><circle cx="9" cy="12.4" r="1.1" fill="currentColor"/></svg>',
  bateria: (p) => `<svg width="26" height="13" viewBox="0 0 26 13" aria-hidden="true"><rect x="0.75" y="0.75" width="21.5" height="11.5" rx="3.2" fill="none" stroke="currentColor" stroke-opacity="0.45" stroke-width="1.2"/><rect x="2.5" y="2.5" width="${Math.max(1.5, 18 * p / 100).toFixed(1)}" height="8" rx="1.8" fill="currentColor"/><path d="M23.8 4.5v4" stroke="currentColor" stroke-opacity="0.45" stroke-width="1.6" stroke-linecap="round"/></svg>`,
  lupa: '<svg width="15" height="15" viewBox="0 0 15 15" aria-hidden="true"><circle cx="6.3" cy="6.3" r="4.6" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M9.8 9.8L13.5 13.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>',
  control: '<svg width="17" height="15" viewBox="0 0 17 15" aria-hidden="true"><rect x="1" y="1.5" width="15" height="5" rx="2.5" fill="none" stroke="currentColor" stroke-width="1.4"/><circle cx="13.5" cy="4" r="1.4" fill="currentColor"/><rect x="1" y="8.5" width="15" height="5" rx="2.5" fill="none" stroke="currentColor" stroke-width="1.4"/><circle cx="3.5" cy="11" r="1.4" fill="currentColor"/></svg>',
  prev: '<svg width="30" height="20" viewBox="0 0 30 20" aria-hidden="true"><path d="M14 2L3 10l11 8zM27 2L16 10l11 8z" fill="currentColor"/></svg>',
  next: '<svg width="30" height="20" viewBox="0 0 30 20" aria-hidden="true"><path d="M16 2l11 8-11 8zM3 2l11 8-11 8z" fill="currentColor"/></svg>',
  pausa: '<svg width="26" height="30" viewBox="0 0 26 30" aria-hidden="true"><rect x="3" y="2" width="7" height="26" rx="1.5" fill="currentColor"/><rect x="16" y="2" width="7" height="26" rx="1.5" fill="currentColor"/></svg>',
  play: '<svg width="26" height="30" viewBox="0 0 26 30" aria-hidden="true"><path d="M4 2.5v25a1 1 0 0 0 1.5.9l20-12.5a1 1 0 0 0 0-1.8L5.5 1.6A1 1 0 0 0 4 2.5z" fill="currentColor"/></svg>',
  recibidos: '<svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><path d="M2 9l1.6-6h8.8L14 9v4H2z M2 9h3.5l1 2h3l1-2H14" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/></svg>',
  enviados: '<svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><path d="M2 8l12-5-4 11-2.5-4.5z" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/></svg>',
  borradores: '<svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><rect x="2.5" y="2" width="11" height="12" rx="2" fill="none" stroke="currentColor" stroke-width="1.4"/><path d="M5 6h6M5 9h4" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>',
  papelera: '<svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><path d="M3 4.5h10M6 4.5V3h4v1.5M4.5 4.5l.7 9h5.6l.7-9" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/></svg>',
  responder: '<svg width="18" height="16" viewBox="0 0 18 16" aria-hidden="true"><path d="M7 3L2 8l5 5M2 8h9a5 5 0 0 1 5 5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  reenviar: '<svg width="18" height="16" viewBox="0 0 18 16" aria-hidden="true"><path d="M11 3l5 5-5 5M16 8H7a5 5 0 0 0-5 5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  basura: '<svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><path d="M2.5 4.5h11M6 4.5V3h4v1.5M4 4.5l.8 9.5h6.4l.8-9.5" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/></svg>',
  playAdj: '<svg width="44" height="44" viewBox="0 0 44 44" aria-hidden="true"><circle cx="22" cy="22" r="21" fill="rgba(255,255,255,0.18)"/><path d="M18 14l12 8-12 8z" fill="#FFFFFF"/></svg>'
};
// Íconos de las apps del Dock (propios, misma familia que los del teléfono).
const APPS = {
  archivos: { n: 'Archivos', bg: 'linear-gradient(180deg,#6CC4FF 0%,#2A8BF2 100%)', svg: '<path d="M13 20a3 3 0 0 1 3-3h9l4 4h15a3 3 0 0 1 3 3v17a3 3 0 0 1-3 3H16a3 3 0 0 1-3-3z" fill="#FFFFFF"/>' },
  navegador: { n: 'Navegador', bg: '#FFFFFF', svg: '<circle cx="30" cy="30" r="20" fill="#1A8CFF"/><path d="M39 21l-6.5 11.5L21 39l6.5-11.5z" fill="#FFFFFF"/><path d="M39 21l-6.5 11.5-5-5z" fill="#FF4D4D"/>' },
  correo: { n: 'Correo', bg: 'linear-gradient(180deg,#45A6FF 0%,#1366E8 100%)', svg: '<rect x="12" y="18" width="36" height="25" rx="4" fill="#FFFFFF"/><path d="M13.5 20.5L30 32l16.5-11.5" stroke="#2A7CF0" stroke-width="2.6" fill="none" stroke-linejoin="round"/>' },
  musica: { n: 'Música', bg: 'linear-gradient(180deg,#FF7590 0%,#EE2A50 100%)', svg: '<path d="M25 41V20l19-4.5v21" stroke="#FFFFFF" stroke-width="3.6" fill="none" stroke-linejoin="round"/><circle cx="20" cy="41" r="5.5" fill="#FFFFFF"/><circle cx="39" cy="36.5" r="5.5" fill="#FFFFFF"/>' },
  fotos: { n: 'Fotos', bg: 'linear-gradient(180deg,#FFB35C 0%,#F07A2A 100%)', svg: '<circle cx="38" cy="22" r="5" fill="#FFFFFF"/><path d="M12 44l12-15 8 9 5-5 11 11z" fill="#FFFFFF"/>' },
  notas: { n: 'Notas', bg: 'linear-gradient(180deg,#FFE88E 0%,#FFC93C 100%)', svg: '<rect x="14" y="13" width="32" height="34" rx="4" fill="#FFFFFF"/><path d="M20 24h20M20 31h20M20 38h12" stroke="#E0B12A" stroke-width="2.6" stroke-linecap="round"/>' },
  terminal: { n: 'Terminal', bg: 'linear-gradient(180deg,#45454D 0%,#1C1C21 100%)', svg: '<rect x="9.5" y="12.5" width="41" height="35" rx="5" fill="none" stroke="rgba(255,255,255,0.18)" stroke-width="1"/><path d="M18 24l7 6-7 6" stroke="#FFFFFF" stroke-width="3.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="M29 37h12" stroke="#FFFFFF" stroke-width="3.4" stroke-linecap="round"/>' },
  ajustes: { n: 'Ajustes', bg: 'linear-gradient(180deg,#B9BCC4 0%,#7E828C 100%)', svg: '<circle cx="30" cy="30" r="9" fill="none" stroke="#FFFFFF" stroke-width="4"/><path d="M30 12v6M30 42v6M12 30h6M42 30h6M17.3 17.3l4.2 4.2M38.5 38.5l4.2 4.2M17.3 42.7l4.2-4.2M38.5 21.5l4.2-4.2" stroke="#FFFFFF" stroke-width="4" stroke-linecap="round"/>' }
};
const appIcon = (k, size = 52) => `<span class="ic" style="width:${size}px;height:${size}px;border-radius:${Math.round(size * 0.23)}px;background:${APPS[k].bg}"><svg viewBox="0 0 60 60" width="${size}" height="${size}" aria-hidden="true">${APPS[k].svg}</svg></span>`;

const MENUS = {
  archivos: ['Archivos', 'Archivo', 'Edición', 'Ver', 'Ir', 'Ventana', 'Ayuda'],
  musica: ['Música', 'Archivo', 'Edición', 'Canción', 'Ver', 'Controles', 'Ventana', 'Ayuda'],
  correo: ['Correo', 'Archivo', 'Edición', 'Ver', 'Buzón', 'Mensaje', 'Formato', 'Ventana', 'Ayuda'],
  video: ['Video', 'Archivo', 'Edición', 'Ver', 'Ventana', 'Ayuda'],
  navegador: ['Navegador', 'Archivo', 'Edición', 'Ver', 'Historial', 'Marcadores', 'Ventana', 'Ayuda'],
  terminal: ['Terminal', 'Shell', 'Edición', 'Ver', 'Ventana', 'Ayuda']
};
let frenteEsc3 = 'navegador';

// ---------- Escenario (1440 × 900, se escala para llenar la pantalla) ----------
const stage = document.getElementById('stage');
function escalar() {
  const k = Math.min(window.innerWidth / 1440, window.innerHeight / 900);
  stage.style.width = window.innerWidth / k + 'px';
  stage.style.height = window.innerHeight / k + 'px';
  stage.style.transform = `scale(${k})`;
}
const $ = (s) => stage.querySelector(s);

function armar() {
  stage.innerHTML = `
    <div class="fondo" data-fondo></div>
    <div class="mb" data-mb>
      <div class="mb-l"><span class="mb-logo">${ICO.logo}</span><span data-menus></span></div>
      <div class="mb-r"><span data-bat></span><span>${ICO.wifi}</span><span>${ICO.lupa}</span><span>${ICO.control}</span><span class="mb-hora" data-hora></span></div>
    </div>
    <div class="wins" data-wins></div>
    <div class="aviso" data-aviso></div>
    <div class="dock" data-dock></div>`;
  pintarDock();
}

// ---------- Ventanas ----------
function ventana(id, inner, clase) {
  const w = S.win[id];
  const el = document.createElement('div');
  el.className = `win ${clase}`;
  el.dataset.win = id;
  el.style.left = w.x + 'px';
  el.style.top = w.y + 'px';
  el.style.zIndex = w.z;
  el.innerHTML = inner;
  return el;
}
const semaforo = '<div class="tl"><button class="tl-r" data-cerrar aria-label="Cerrar"></button><button class="tl-y" data-min aria-label="Minimizar"></button><button class="tl-g" aria-label="Pantalla completa"></button></div>';

function htmlMusica() {
  const m = C.musica;
  const portada = M.portada ? `<img src="${M.portada}" alt="">` : '';
  return `<div class="mu-bar" data-drag>${semaforo}</div>
    <div class="mu-art">${portada}</div>
    <div class="mu-txt"><div class="mu-t">${esc(m.cancion)}</div><div class="mu-a">${esc(m.artista)}</div></div>
    <div class="mu-prog"><div class="mu-track"><div class="mu-fill" data-mufill></div></div><div class="mu-times"><span data-mupos></span><span data-murest></span></div></div>
    <div class="mu-ctrl"><button aria-label="Anterior" data-muprev>${ICO.prev}</button><button aria-label="Reproducir o pausar" data-muplay></button><button aria-label="Siguiente" data-munext>${ICO.next}</button></div>`;
}
function htmlCorreo() {
  const m = C.mail;
  const filas = [];
  if (S.mail.llego) {
    filas.push(`<button class="row${S.mail.sel ? ' sel' : ''}${S.mail.leido ? '' : ' nuevo'}" data-mailrow>
      <div class="row-1"><b>${esc(m.remitente)}</b><span>${esc(S.mail.hora)}</span></div>
      <div class="row-s">${esc(m.asunto)}</div><div class="row-r">${esc(m.cuerpo)}</div></button>`);
  }
  (C.bandeja || []).forEach((b) => filas.push(`<div class="row"><div class="row-1"><b>${esc(b.de)}</b><span>${esc(b.cuando)}</span></div><div class="row-s">${esc(b.asunto)}</div><div class="row-r">${esc(b.resumen)}</div></div>`));
  const sinLeer = S.mail.llego && !S.mail.leido ? 1 : 0;
  const lectura = S.mail.llego && S.mail.sel ? `
    <div class="rd-head"><div class="av">${esc((m.remitente || '?').slice(0, 1).toUpperCase())}</div>
      <div class="rd-who"><div class="rd-1"><span class="rd-n">${esc(m.remitente)}</span><span class="rd-f">${esc(C.fechaLarga)}, ${esc(S.mail.hora)}</span></div>
      <div class="rd-s">${esc(m.asunto)}</div><div class="rd-p">Para: ${esc(m.para)}</div></div></div>
    <div class="rd-body">${esc(m.cuerpo)}</div>
    <button class="adj" data-adjunto><div class="adj-v">${ICO.playAdj}</div><div class="adj-n"><span>${esc(m.adjunto)}</span><span>${esc(m.peso)}</span></div></button>` :
    '<div class="rd-vacio">Ningún mensaje seleccionado</div>';
  return `<div class="co-side" data-drag>${semaforo}
      <div class="co-h">Favoritos</div>
      <div class="co-it on">${ICO.recibidos}<span>Recibidos</span><span class="co-n">${sinLeer || ''}</span></div>
      <div class="co-it">${ICO.enviados}<span>Enviados</span></div>
      <div class="co-it">${ICO.borradores}<span>Borradores</span></div>
      <div class="co-it">${ICO.papelera}<span>Papelera</span></div></div>
    <div class="co-list"><div class="co-lh" data-drag>Recibidos</div>${filas.join('')}</div>
    <div class="co-read"><div class="co-tools" data-drag>${ICO.responder}${ICO.reenviar}${ICO.basura}</div><div class="co-rd">${lectura}</div></div>`;
}
function htmlVideo() {
  return `<div class="vi-bar" data-drag>${semaforo}<span class="vi-t">${esc(C.mail.adjunto)}</span></div>
    <div class="vi-body">
      <video data-video muted playsinline preload="auto"></video>
      <div class="vi-load" data-vload><div class="spin">${'<i></i>'.repeat(12)}</div><div class="vi-bar2"><div data-vprog></div></div></div>
      <div class="vi-falta" data-vfalta>Cargá el video desde el menú (Fotos y videos)</div>
    </div>`;
}

function pintarVentanas() {
  const box = $('[data-wins]');
  const vivo = box.querySelector('[data-win="video"] video');
  const tiempoVideo = vivo ? vivo.currentTime : 0;
  box.innerHTML = '';
  if (S.win.musica.open) box.appendChild(ventana('musica', htmlMusica(), 'w-musica'));
  if (S.win.correo.open) box.appendChild(ventana('correo', htmlCorreo(), 'w-correo'));
  if (S.win.video.open) {
    box.appendChild(ventana('video', htmlVideo(), 'w-video'));
    const v = box.querySelector('[data-video]');
    if (M.video) {
      v.src = M.video;
      v.loop = !!A.videoLoop;
      if (tiempoVideo) v.currentTime = tiempoVideo;
      v.addEventListener('ended', () => { v.dataset.terminado = '1'; });
    }
  }
  tick();
  pintarMenuBar();
  pintarDock();
}

function frente() {
  let top = null;
  Object.entries(S.win).forEach(([k, w]) => { if (w.open && (!top || w.z > S.win[top].z)) top = k; });
  return top;
}
function alFrente(id) {
  const zMax = Math.max(...Object.values(S.win).map((w) => w.z));
  if (S.win[id].z !== zMax) S.win[id].z = zMax + 1;
  const el = $(`[data-win="${id}"]`);
  if (el) el.style.zIndex = S.win[id].z;
  pintarMenuBar();
}

// ---------- Barra de menú, Dock y aviso ----------
function pintarMenuBar() {
  const app = S.esc3 ? frenteEsc3 : (frente() || 'archivos');
  const items = MENUS[app] || MENUS.archivos;
  $('[data-menus]').innerHTML = items.map((t, i) => `<span class="${i === 0 ? 'app' : ''}">${esc(t)}</span>`).join('');
  $('[data-bat]').innerHTML = (A.bateriaPct ? `<span class="pct">${Math.round(A.bateria)} %</span>` : '') + ICO.bateria(A.bateria);
  $('[data-hora]').textContent = `${fechaBarra()}  ${hm(ahora())}`;
}
function pintarDock() {
  const abiertas = { musica: S.win.musica.open, correo: S.win.correo.open, archivos: true };
  const badge = S.mail.llego && !S.mail.leido;
  const ks = ['archivos', 'navegador', 'correo', 'musica', 'fotos', 'notas', 'terminal', 'ajustes'];
  $('[data-dock]').innerHTML = ks.map((k) => `<button class="dk" data-dk="${k}" aria-label="${APPS[k].n}">${appIcon(k)}${k === 'correo' && badge ? '<span class="badge">1</span>' : ''}<i class="${abiertas[k] ? 'on' : ''}"></i></button>`).join('') +
    `<span class="dk-sep"></span><button class="dk" aria-label="Papelera"><span class="ic papel"><svg viewBox="0 0 60 60" width="52" height="52" aria-hidden="true"><path d="M17 19h26M24 19v-3h12v3M19.5 19l2 26h17l2-26" fill="none" stroke="#6E6E73" stroke-width="2.6" stroke-linejoin="round"/><path d="M26 25v14M30 25v14M34 25v14" stroke="#6E6E73" stroke-width="1.8" stroke-linecap="round"/></svg></span><i></i></button>`;
}
let avisoT = 0;
function pintarAviso(anim) {
  const el = $('[data-aviso]');
  clearTimeout(avisoT);
  if (!S.aviso) { el.classList.remove('in'); return; }
  const m = C.mail;
  el.innerHTML = `<button class="av-in" data-abriraviso>${appIcon('correo', 38)}<div class="av-t"><div class="av-1"><b>${esc(m.remitente)}</b><span>ahora</span></div><div class="av-s">${esc(m.asunto)}</div><div class="av-c">${esc(m.cuerpo)}</div></div></button>`;
  if (anim) { el.classList.remove('in'); void el.offsetWidth; }
  el.classList.add('in');
  if (!A.avisoFijo) avisoT = setTimeout(() => { S.aviso = false; save(); pintarAviso(); }, A.avisoSeg * 1000);
}
function pintarFondo() {
  const f = $('[data-fondo]');
  f.style.backgroundImage = M.fondo ? `url("${M.fondo}")` : '';
  f.classList.toggle('foto', !!M.fondo);
}

// ---------- Reloj de la música y del video ----------
const fmt = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
function posMusica() {
  const m = S.musica;
  const dur = C.musica.duracion || 1;
  const p = m.sonando ? m.base + (Date.now() - m.t0) / 1000 : m.base;
  return ((p % dur) + dur) % dur;
}
function curvaCarga(t) {
  // Avanza, se traba un rato y termina de golpe: "tarda en cargar".
  if (t < 0.45) return 0.62 * (t / 0.45);
  if (t < 0.85) return 0.62 + 0.06 * ((t - 0.45) / 0.4);
  return Math.min(1, 0.68 + 0.32 * ((t - 0.85) / 0.15));
}
function tick() {
  // Música
  const dur = C.musica.duracion || 1;
  const p = posMusica();
  const fill = $('[data-mufill]');
  if (fill) {
    fill.style.width = (100 * p / dur).toFixed(2) + '%';
    $('[data-mupos]').textContent = fmt(p);
    $('[data-murest]').textContent = '-' + fmt(dur - p);
    const b = $('[data-muplay]');
    const ico = S.musica.sonando ? 'pausa' : 'play';
    if (b.dataset.ico !== ico) { b.innerHTML = ICO[ico]; b.dataset.ico = ico; }
  }
  // Video
  const vw = S.win.video;
  const load = $('[data-vload]');
  if (vw.open && load) {
    const t = (Date.now() - vw.t0) / 1000 / Math.max(0.1, A.cargaVideo);
    const listo = t >= 1;
    const v = $('[data-video]');
    const falta = $('[data-vfalta]');
    load.style.display = listo ? 'none' : '';
    $('[data-vprog]').style.width = (100 * curvaCarga(Math.min(1, t))).toFixed(1) + '%';
    falta.style.display = listo && !M.video ? '' : 'none';
    if (listo && M.video && v.paused && !v.dataset.terminado) {
      v.classList.add('on');
      v.play().catch(() => {});
    }
  }
  // Hora (cada vez que cambia el minuto)
  const h = $('[data-hora]');
  if (h) {
    const txt = `${fechaBarra()}  ${hm(ahora())}`;
    if (h.textContent !== txt) h.textContent = txt;
  }
}

// ---------- Acciones (las usa la actriz con clics y el equipo desde el menú) ----------
const HIST = [];
function snapshot() { HIST.push(JSON.stringify(S)); if (HIST.length > 40) HIST.shift(); }
export function deshacer() {
  const s = HIST.pop();
  if (!s) return false;
  S = JSON.parse(s);
  save();
  pintarTodo();
  return true;
}

export function pausarMusica(pausa = true) {
  if (pausa === !S.musica.sonando) return;
  snapshot();
  S.musica.base = posMusica();
  S.musica.t0 = Date.now();
  S.musica.sonando = !pausa;
  save();
  tick();
  refrescarMenu();
}
export function setPosMusica(seg) {
  S.musica.base = Math.max(0, seg);
  S.musica.t0 = Date.now();
  save();
  tick();
}
export function llegarMail() {
  if (S.mail.llego) return;
  snapshot();
  S.mail = { llego: true, hora: hm(ahora()), leido: false, sel: false };
  S.aviso = true;
  save();
  pintarAviso(true);
  if (S.win.correo.open) pintarVentanas(); else pintarDock();
  refrescarMenu();
}
export function abrirCorreo(seleccionar) {
  snapshot();
  S.win.correo.open = true;
  if (seleccionar && S.mail.llego) { S.mail.sel = true; S.mail.leido = true; }
  S.aviso = false;
  pintarAviso();
  pintarVentanas();
  alFrente('correo');
  save();
  refrescarMenu();
}
export function abrirVideo(listoYa) {
  snapshot();
  S.win.video.open = true;
  S.win.video.t0 = listoYa ? Date.now() - A.cargaVideo * 1000 - 50 : Date.now();
  pintarVentanas();
  alFrente('video');
  save();
  refrescarMenu();
}
function cerrarVentana(id) {
  snapshot();
  S.win[id].open = false;
  save();
  pintarVentanas();
  refrescarMenu();
}

// Siguiente evento del guion de la Mac.
export function siguiente() {
  if (S.esc3) { esc3Siguiente(); refrescarMenu(); return; }
  if (S.musica.sonando) return pausarMusica(true);
  if (!S.mail.llego) return llegarMail();
  if (!S.win.correo.open || !S.mail.sel) return abrirCorreo(true);
  if (!S.win.video.open) return abrirVideo(false);
  if ((Date.now() - S.win.video.t0) / 1000 < A.cargaVideo) { S.win.video.t0 = Date.now() - A.cargaVideo * 1000 - 50; save(); tick(); }
}
export function estadoTexto() {
  if (S.esc3) return esc3Texto();
  if (S.musica.sonando) return 'Música sonando. Siguiente: pausar la música.';
  if (!S.mail.llego) return 'Música pausada. Siguiente: llega el mail de Julián.';
  if (!S.win.correo.open || !S.mail.sel) return 'Mail recibido (aviso en pantalla). Siguiente: abrir el mail.';
  if (!S.win.video.open) return 'Mail abierto. Siguiente: abrir el video adjunto.';
  if ((Date.now() - S.win.video.t0) / 1000 < A.cargaVideo) return 'Video cargando. Siguiente: que termine de cargar ya.';
  return 'Video reproduciéndose. Fin de la secuencia de la ESC 1.';
}

// ---------- Planos (dejan la Mac exactamente como empieza cada plano) ----------
export const PLANOS = [
  { id: '1.A', t: '1.A · Música sonando' },
  { id: '1.B', t: '1.B · Martina apaga la música' },
  { id: '1.G/2', t: '1.G/2 · Llega el mail (música pausada)' },
  { id: '1.G/2-abierto', t: '1.G/2 · Mail de Julián abierto' },
  { id: '1.G/4', t: '1.G/4 · Video reproduciéndose' },
  { id: 'ESC 3', t: 'ESC 3 · Eco toma la Mac' }
];
let mailAutoT = 0;
export function cargarPlano(id) {
  snapshot();
  clearTimeout(mailAutoT);
  const base = estadoBase();
  base.plano = id;
  if (id === '1.G/2' || id === '1.G/2-abierto' || id === '1.G/4') base.musica.sonando = false;
  if (id === '1.G/2-abierto' || id === '1.G/4') {
    base.mail = { llego: true, hora: hm(ahora()), leido: true, sel: true };
    base.win.correo.open = true;
    base.win.correo.z = 3;
  }
  if (id === '1.G/4') {
    base.win.video.open = true;
    base.win.video.z = 4;
    base.win.video.t0 = Date.now() - A.cargaVideo * 1000 - 50;
  }
  if (id === 'ESC 3') {
    // [PROPUESTA] En la ESC 3 la pantalla solo muestra lo de Eco: las ventanas de la ESC 1 quedan cerradas.
    base.musica.sonando = false;
    Object.values(base.win).forEach((w) => { w.open = false; });
    base.esc3 = esc3Base();
  }
  S = base;
  save();
  pintarTodo();
  if (id === '1.G/2' && A.mailAuto > 0) mailAutoT = setTimeout(llegarMail, A.mailAuto * 1000);
}
export function reiniciarTodo() { HIST.length = 0; clearTimeout(mailAutoT); S = estadoBase(); save(); pintarTodo(); }
export function reposicionarVentanas() {
  snapshot();
  Object.keys(W0).forEach((k) => Object.assign(S.win[k], W0[k]));
  save();
  pintarVentanas();
}

export function pintarTodo() {
  pintarFondo();
  pintarVentanas();
  pintarAviso();
  pintarEsc3();
}

// ---------- Interacción (clics reales en la Mac) ----------
function initClics() {
  stage.addEventListener('mousedown', (e) => {
    const w = e.target.closest('[data-win]');
    if (w) alFrente(w.dataset.win);
    const d = e.target.closest('[data-drag]');
    if (w && d && !e.target.closest('button')) arrastrar(e, w);
  });
  stage.addEventListener('click', (e) => {
    const t = (s) => e.target.closest(s);
    const w = t('[data-win]');
    if (t('[data-cerrar]') && w) return cerrarVentana(w.dataset.win);
    if (t('[data-min]') && w) return cerrarVentana(w.dataset.win);
    if (t('[data-muplay]')) return pausarMusica(S.musica.sonando);
    if (t('[data-muprev]')) { setPosMusica(0); return; }
    if (t('[data-abriraviso]')) return abrirCorreo(true);
    if (t('[data-mailrow]')) { snapshot(); S.mail.sel = true; S.mail.leido = true; save(); pintarVentanas(); refrescarMenu(); return; }
    if (t('[data-adjunto]')) { if (!S.win.video.open) abrirVideo(false); else alFrente('video'); return; }
    const dk = t('[data-dk]');
    if (dk) {
      const k = dk.dataset.dk;
      if (k === 'correo') { if (S.win.correo.open) alFrente('correo'); else abrirCorreo(false); }
      if (k === 'musica') { if (!S.win.musica.open) { snapshot(); S.win.musica.open = true; save(); pintarVentanas(); } alFrente('musica'); }
      dk.classList.remove('rebote'); void dk.offsetWidth; dk.classList.add('rebote');
    }
  });
  // Doble clic en una fila de video: también abre (como en Correo real).
  stage.addEventListener('dblclick', (e) => { if (e.target.closest('[data-adjunto]') && !S.win.video.open) abrirVideo(false); });
}
function arrastrar(e, el) {
  const id = el.dataset.win;
  const k = stage.getBoundingClientRect().width / stage.offsetWidth;
  const x0 = e.clientX, y0 = e.clientY;
  const w = S.win[id];
  const wx = w.x, wy = w.y;
  const mover = (ev) => {
    w.x = Math.round(wx + (ev.clientX - x0) / k);
    w.y = Math.max(26, Math.round(wy + (ev.clientY - y0) / k));
    el.style.left = w.x + 'px';
    el.style.top = w.y + 'px';
  };
  const soltar = () => { window.removeEventListener('mousemove', mover); window.removeEventListener('mouseup', soltar); save(); };
  window.addEventListener('mousemove', mover);
  window.addEventListener('mouseup', soltar);
}

// ---------- Controles invisibles del equipo ----------
// Menú: mantener apretado 0,7 s sobre el círculo de la barra de menú (arriba a la izquierda), o Ctrl+Opción+M.
// Siguiente evento: doble clic en la esquina superior derecha (sobre la hora), o Ctrl+Opción+→.
function initToques() {
  let lp = 0;
  let ultimo = 0;
  document.addEventListener('pointerdown', (e) => {
    if (menuAbierto()) return;
    const r = stage.getBoundingClientRect();
    const k = r.width / stage.offsetWidth;
    const x = (e.clientX - r.left) / k;
    const y = (e.clientY - r.top) / k;
    if (y < 40 && x < 60) lp = setTimeout(() => { abrirMenu(); }, 700);
    if (y < 40 && x > stage.offsetWidth - 70) {
      const t = Date.now();
      if (t - ultimo < 450) { ultimo = 0; siguiente(); } else ultimo = t;
    }
  }, true);
  const fin = () => clearTimeout(lp);
  document.addEventListener('pointerup', fin, true);
  document.addEventListener('pointercancel', fin, true);
  document.addEventListener('keydown', (e) => {
    if (!(e.ctrlKey && e.altKey)) return;
    if (e.code === 'KeyM') { e.preventDefault(); abrirMenu(); }
    if (e.code === 'ArrowRight') { e.preventDefault(); siguiente(); }
    if (e.code === 'ArrowLeft') { e.preventDefault(); deshacer(); }
  });
}

// ---------- Arranque ----------
async function boot() {
  try { Object.assign(A, JSON.parse(localStorage.getItem(LS_AJUSTES) || '{}')); } catch (e) { /* */ }
  const editado = localStorage.getItem(LS_CONTENIDO);
  if (editado) { try { C = JSON.parse(editado); } catch (e) { C = null; } }
  const original = await (await fetch('contenido/mac.json')).json();
  if (!C) C = original;
  // Textos nuevos que no estaban en una versión editada desde el menú
  Object.keys(original).forEach((k) => { if (C[k] === undefined) C[k] = original[k]; });
  if (C.esc3 && original.esc3) Object.keys(original.esc3).forEach((k) => { if (C.esc3[k] === undefined) C.esc3[k] = original.esc3[k]; });
  try { const s = JSON.parse(localStorage.getItem(LS_ESTADO) || 'null'); if (s && s.win) S = s; } catch (e) { /* */ }
  if (!S) S = estadoBase();
  await cargarMedios();
  escalar();
  window.addEventListener('resize', escalar);
  armar();
  initEsc3({ getS: () => S, getA: () => A, getC: () => C, save, stage, alCambiar: (f) => { frenteEsc3 = f; pintarMenuBar(); refrescarMenu(); } });
  pintarTodo();
  initClics();
  initToques();
  initMenu();
  setInterval(tick, 250);
  // Al volver de cerrar la tapa, el reloj y la música siguen donde corresponde.
  document.addEventListener('visibilitychange', () => { if (!document.hidden) { tick(); pintarMenuBar(); } });
  if ('serviceWorker' in navigator && location.protocol !== 'file:') navigator.serviceWorker.register('sw.js').catch(() => {});
}
export { pintarMenuBar, pintarFondo, pintarVentanas };
boot();
