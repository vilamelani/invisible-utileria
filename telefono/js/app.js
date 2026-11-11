// INVISIBLE — utilería del iPhone (dirección B · Clara)
import { appIcon, I, tail, waveBars, sized } from './icons.js';
import { M, cargarMedios, esVideo, guardarMedio, src, srcEsVideo } from './media.js';
import { initMenu, abrirMenu, refrescarMenu } from './menu.js';
import { campoFalso, abrirTeclado, cerrarTeclado, resetTeclado, refrescarTeclado, tecladoAbierto } from './teclado.js';

const LS_ESTADO = 'invisible-estado-v1';
const LS_AJUSTES = 'invisible-ajustes-v1';
const LS_GUION = 'invisible-guion-v2';
export const LS_BARRA = 'invisible-barra-v2'; // v2: vuelve a 'default' para todos

// ---------- Estado ----------
export let G = null; // guion
export const A = {
  modo: 'completar',     // 'completar' | 'libre'
  auto: true,            // temporizadores de los mensajes de Julián
  espera: 2.5,           // seg. antes de que Julián responda a Martina
  esperaSeguido: 1.8,    // seg. entre mensajes seguidos de Julián
  tipeo: true,           // mostrar "escribiendo…" antes de cada mensaje
  letras: 3,             // letras que aparecen por tecla (modo completar)
  audiosComo: 'audio',   // cómo se muestran los audios de Martina al forzarlos o al cargar un plano
  bloqueoAuto: true,     // en el bloqueo, las notificaciones entran solas
  bloqueoEspera: 5,      // seg. desde que se muestra el bloqueo hasta la primera notificación
  reSonar: 4,            // seg. para que la llamada vuelva a entrar tras rechazarla (0 = no)
  reSonarVeces: 1,
  ecoVelocidad: 5,       // palabras por segundo de Eco
  formato24: true,       // 03:12 (true) o 3:12 (false)
  extraTop: 36,          // px extra bajo la barra translúcida (zona que iOS desenfoca)
  teclado: 'simulado',   // 'simulado' (dibujado por la app, sin la barra ↑ ↓ ✓ de iOS) | 'sistema'
  predictivo: true,      // barra de sugerencias del teclado simulado
  horaFija: '',          // 'HH:MM' = hora de ficción que corre desde que se fijó
  horaFijaDesde: 0
};
function estadoBase() {
  return {
    screen: 'bloqueo',
    tg: { pos: 0, msgs: [], agendado: false, nombre: '' },
    eco: { pos: 0, msgs: [] },
    lockNotifs: [],
    bg: { visto: {} }
  };
}
export let S = estadoBase();
const TR = {
  esperarToque: true, busy: false, typing: '', autoT: 0, typingT: 0, lockT: 0,
  rec: null, playing: null, ecoStream: null, ecoRec: null, story: null,
  call: { volverA: 'talkgram', conectada: false, inicio: 0, sonadas: 0, reT: 0 }
};

export function save() { try { localStorage.setItem(LS_ESTADO, JSON.stringify(S)); } catch (e) { /* sin espacio */ } }
export function saveAjustes() { try { localStorage.setItem(LS_AJUSTES, JSON.stringify(A)); } catch (e) { /* */ } }
function load() {
  try { Object.assign(A, JSON.parse(localStorage.getItem(LS_AJUSTES) || '{}')); } catch (e) { /* */ }
  try { const s = JSON.parse(localStorage.getItem(LS_ESTADO) || 'null'); if (s) S = Object.assign(estadoBase(), s); } catch (e) { /* */ }
  if (!S.bg) S.bg = { visto: {} };
  if (S.screen === 'llamada') S.screen = 'talkgram';
}
export function getG() { return G; }
export function setGuion(obj, persistir = true) {
  G = obj;
  if (persistir) localStorage.setItem(LS_GUION, JSON.stringify(obj));
}
export function borrarGuionEditado() { localStorage.removeItem(LS_GUION); }

// ---------- Utilidades ----------
const esc = (t) => String(t ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
export function ahora() {
  if (A.horaFija) {
    const [h, m] = A.horaFija.split(':').map(Number);
    const d = new Date(A.horaFijaDesde);
    d.setHours(h, m, 0, 0);
    return new Date(d.getTime() + (Date.now() - A.horaFijaDesde));
  }
  return new Date();
}
export function hhmm(d = ahora()) {
  const h = d.getHours();
  return (A.formato24 ? String(h).padStart(2, '0') : String(h % 12 || 12)) + ':' + String(d.getMinutes()).padStart(2, '0');
}
const fmtDur = (s) => Math.floor(s / 60) + ':' + String(Math.round(s % 60)).padStart(2, '0');
const nombreContacto = () => (S.tg.agendado ? (S.tg.nombre || G.contacto.nombreAgendado) : G.contacto.numero);
const perfilSrc = () => M.perfilJulian || 'contenido/default/av-julian.jpg';
function avatarHTML(size, extra = '') {
  return `<span class="avatar" style="width:${size}px;height:${size}px;${extra}"><img src="${perfilSrc()}" alt=""></span>`;
}
const durEstimada = (t) => Math.max(2, Math.round(String(t || '').split(/\s+/).length * 0.45 + 1));

// ---------- Router con transiciones ----------
const app = document.getElementById('app');
let CUR = null;
let cleanup = null;
const $ = (s) => (CUR ? CUR.querySelector(s) : null);
const $$ = (s) => (CUR ? [...CUR.querySelectorAll(s)] : []);
// Barra de estado (modo 'default'): iOS la pinta con el color de fondo de la página y elige solo
// el color del texto (blanco sobre fondos oscuros, negro sobre claros). Cada pantalla pone de fondo
// el color de su borde superior. No se toca color-scheme: en modo oscuro iOS pinta un gris propio.
let colorFondo = '#5571AA';     // borde superior del fondo de pantalla (se mide sobre la foto cargada)
const COLOR_LLAMADA = '#1D1B22';
const THEME = {
  bloqueo: () => colorFondo, inicio: () => colorFondo, bristagram: () => '#FFFFFF',
  talkgram: () => '#F7F8F9', eco: () => '#FFFFFF', llamada: () => COLOR_LLAMADA
};
function setTheme(color, oscuro) {
  document.querySelector('meta[name=theme-color]').setAttribute('content', color);
  document.documentElement.style.background = color;
  document.body.style.background = color;
  if ((localStorage.getItem(LS_BARRA) || 'default') === 'auto') {
    const m = document.querySelector('meta[name=apple-mobile-web-app-status-bar-style]');
    if (m) m.setAttribute('content', oscuro ? 'black-translucent' : 'default');
  }
}
function themeActual() {
  if (S.screen === 'bristagram' && TR.story) return setTheme('#000000', true);
  const t = THEME[S.screen];
  setTheme(t ? t() : '#000000', ['bloqueo', 'inicio', 'llamada'].includes(S.screen));
}
// Mide el color promedio de la franja superior del fondo de pantalla tal como se muestra (cover, centrado).
export async function calcularColorFondo() {
  let c = '#5571AA';
  if (M.fondo) {
    try {
      const img = new Image();
      img.src = M.fondo;
      await img.decode();
      const W = window.innerWidth;
      const H = window.innerHeight;
      const k = Math.max(W / img.naturalWidth, H / img.naturalHeight);
      const sw = W / k;
      const sx = (img.naturalWidth - sw) / 2;
      const sy = Math.max(0, (img.naturalHeight - H / k) / 2);
      const cv = document.createElement('canvas');
      cv.width = 24; cv.height = 2;
      const ctx = cv.getContext('2d');
      ctx.drawImage(img, sx, sy, sw, 24 / k, 0, 0, 24, 2);
      const d = ctx.getImageData(0, 0, 24, 2).data;
      let r = 0, g = 0, b = 0;
      for (let i = 0; i < d.length; i += 4) { r += d[i]; g += d[i + 1]; b += d[i + 2]; }
      const n = d.length / 4;
      c = '#' + [r, g, b].map((v) => Math.round(v / n).toString(16).padStart(2, '0')).join('');
    } catch (e) { /* queda el predeterminado */ }
  }
  colorFondo = c;
  document.documentElement.style.setProperty('--fondo-top', c);
  if (S.screen === 'bloqueo' || S.screen === 'inicio') themeActual();
}
// anim: 'open' (abrir app), 'close' (volver a Inicio), 'unlock' (desbloquear), 'fade'
export function go(screen, anim) {
  if (S.screen !== 'llamada' && screen === 'llamada') TR.call.volverA = S.screen;
  S.screen = screen;
  save();
  render(anim);
}
export function render(anim) {
  if (cleanup) { cleanup(); cleanup = null; }
  resetTeclado();
  const old = CUR;
  const el = document.createElement('div');
  el.className = 'screen';
  CUR = el;
  if (old && anim) {
    old.style.pointerEvents = 'none';
    if (anim === 'close' || anim === 'unlock') {
      app.insertBefore(el, old);
      old.classList.add('on-top', `a-${anim}-out`);
    } else {
      app.appendChild(el);
      el.classList.add('on-top');
      old.classList.add(`a-${anim}-under`);
    }
    el.classList.add(`a-${anim}-in`);
    setTimeout(() => { old.remove(); el.classList.remove('on-top', `a-${anim}-in`); }, 460);
  } else {
    app.innerHTML = '';
    app.appendChild(el);
  }
  TR.story = null;
  cleanup = (SCREENS[S.screen] || SCREENS.inicio)(el) || null;
  themeActual();
}

// ---------- Reloj ----------
function tick() {
  document.querySelectorAll('[data-clock]').forEach((n) => { n.textContent = hhmm(); });
  const ct = $('[data-calltime]');
  if (ct && TR.call.conectada) ct.textContent = fmtDur((Date.now() - TR.call.inicio) / 1000);
}
setInterval(tick, 1000);

// ---------- Fondo ----------
const wallpaperHTML = () => `<div class="wallpaper"${M.fondo ? ` style="background-image:url('${M.fondo}')"` : ''}></div>`;

// ========== BLOQUEO ==========
function scrBloqueo(el) {
  el.classList.add('lock');
  el.innerHTML = `${wallpaperHTML()}<div class="top-fade"></div>
    <div class="safe-top"></div>
    <div class="lock-top"><span class="lock-icon">${I.lock}</span><div class="lock-date">${esc(G.bloqueo.fecha)}</div><div class="lock-clock" data-clock>${hhmm()}</div></div>
    <div class="lock-notifs" data-notifs>${S.lockNotifs.slice(0, 4).map(notifHTML).join('')}</div>
    <div class="lock-bottom"><span class="lock-round">${I.flashlight}</span><span class="lock-round">${I.camera}</span></div>
    <div class="safe-bottom"></div>`;
  el.querySelector('[data-notifs]').addEventListener('click', (e) => {
    if (e.target.closest('.notif')) { S.lockNotifs = []; go('talkgram', 'unlock'); }
  });
  // Notificaciones automáticas: si lo próximo del guion es un mensaje de Julián, entra solo.
  const ev = G.talkgram[S.tg.pos];
  if (A.bloqueoAuto && ev && ev.de === 'julian' && !TR.busy) {
    TR.lockT = setTimeout(() => {
      TR.esperarToque = false;
      clearTimeout(TR.autoT);
      dispararJulian(G.talkgram[S.tg.pos]);
    }, A.bloqueoEspera * 1000);
  }
  swipeUp(el, () => go('inicio', 'unlock'));
  return () => clearTimeout(TR.lockT);
}
function notifHTML(n) {
  return `<button class="notif">${appIcon('talkgram', 38)}<span class="notif-body"><span class="notif-head"><span class="notif-title">${esc(n.titulo)}</span><span class="notif-time">${esc(n.cuando || 'ahora')}</span></span><span class="notif-text">${esc(n.texto)}</span></span></button>`;
}
function agregarNotifBloqueo(n) {
  S.lockNotifs.unshift(n);
  save();
  const box = $('[data-notifs]');
  if (!box) return;
  const antes = [...box.children].map((c) => [c, c.getBoundingClientRect().top]);
  box.insertAdjacentHTML('afterbegin', notifHTML(n));
  box.firstElementChild.classList.add('notif-new');
  while (box.children.length > 4) box.lastElementChild.remove();
  antes.forEach(([c, t0]) => {
    if (!c.isConnected) return;
    const d = t0 - c.getBoundingClientRect().top;
    if (!d) return;
    c.style.transition = 'none';
    c.style.transform = `translateY(${d}px)`;
    requestAnimationFrame(() => requestAnimationFrame(() => {
      c.style.transition = 'transform 0.45s cubic-bezier(0.2, 0.9, 0.3, 1)';
      c.style.transform = '';
    }));
  });
}

// ========== INICIO ==========
function scrInicio(el) {
  el.classList.add('home');
  const ap = (k, lbl) => `<button class="home-app" data-app="${k}">${appIcon(k)}<span class="lbl">${lbl}</span></button>`;
  const w = G.inicio;
  el.innerHTML = `${wallpaperHTML()}<div class="top-fade"></div>
    <div class="safe-top"></div>
    <div class="home-body">
      <div class="home-grid">
        <div class="widget widget-weather"><span class="city">${esc(w.ciudad)} ${I.locArrow}</span><span class="temp">${esc(w.temperatura)}</span><span style="flex:1"></span>${I.moon}<span class="cond">${esc(w.clima)}</span><span class="mm">${esc(w.maxmin)}</span></div>
        <div class="widget widget-photo">${M.fotoWidget ? `<img src="${M.fotoWidget}" alt="">` : ''}<span class="cap">${esc(w.tituloFoto)}</span></div>
        ${ap('fotos', 'Fotos')}${ap('camara', 'Cámara')}${ap('mapas', 'Mapas')}${ap('reloj', 'Reloj')}
        ${ap('bristagram', 'Bristagram')}${ap('eco', 'Eco')}${ap('correo', 'Correo')}${ap('notas', 'Notas')}
      </div>
    </div>
    <div class="home-search">${I.search}<span>Buscar</span></div>
    <div class="dock">
      <button data-app="telefono">${appIcon('telefono')}</button>
      <button data-app="navegador">${appIcon('navegador')}</button>
      <button data-app="talkgram">${appIcon('talkgram')}</button>
      <button data-app="musica">${appIcon('musica')}</button>
    </div>
    <div class="safe-bottom"></div>`;
  el.addEventListener('click', (e) => {
    const b = e.target.closest('[data-app]');
    if (!b) return;
    const k = b.dataset.app;
    const destino = { bristagram: 'bristagram', talkgram: 'talkgram', eco: 'eco' }[k];
    if (!destino) return;
    const r = b.querySelector('.app-icon').getBoundingClientRect();
    app.style.setProperty('--ox', `${r.left + r.width / 2}px`);
    app.style.setProperty('--oy', `${r.top + r.height / 2}px`);
    go(destino, 'open');
  });
}

// ========== BRISTAGRAM ==========
function scrBristagram(el) {
  el.classList.add('bg');
  const B = G.bristagram;
  const ring = (u, i) => `<button class="bg-st" data-u="${i}"><span class="bg-ring${S.bg.visto[u.usuario] ? ' seen' : ''}"><img src="${src(u.avatar)}" alt=""></span><span class="n">${esc(u.usuario)}</span></button>`;
  const post = (p) => `<article class="bg-post">
      <div class="bg-ph"><span class="bg-av"><img src="${src(p.avatar)}" alt=""></span><span class="bg-who"><b>${esc(p.usuario)}</b>${p.ubicacion ? `<span>${esc(p.ubicacion)}</span>` : ''}</span><button class="icon-btn" aria-label="Más opciones">${I.more}</button></div>
      <div class="bg-img"><img src="${src(p)}" alt=""></div>
      <div class="bg-actions"><button class="bg-ab" data-like aria-label="Me gusta">${I.bgHeart}</button><button class="bg-ab" aria-label="Comentar">${I.bgComment}</button><button class="bg-ab" aria-label="Compartir">${I.bgSend}</button><span style="flex:1"></span><button class="bg-ab" aria-label="Guardar">${I.bgSave}</button></div>
      <p class="bg-likes">${esc(p.likes)}</p>
      <p class="bg-cap"><b>${esc(p.usuario)}</b> ${esc(p.texto)}</p>
      <p class="bg-time">${esc(p.hace)}</p>
    </article>`;
  el.innerHTML = `
    <div class="bg-top"><div class="safe-top"></div>
      <div class="bg-bar"><span class="bg-logo">Bristagram</span><span class="bg-logo-chev">${I.bgChevron}</span><span style="flex:1"></span>
        <button class="bg-ab" aria-label="Notificaciones">${I.bgHeart}</button><button class="bg-ab" aria-label="Mensajes">${I.bgDM}<span class="bg-badge">3</span></button></div>
    </div>
    <div class="bg-scroll">
      <div class="bg-stories">
        <button class="bg-st me"><span class="bg-ring none"><img src="${src(B.miAvatar)}" alt=""><span class="bg-plus">${I.bgPlus}</span></span><span class="n">Tu historia</span></button>
        ${B.historias.map(ring).join('')}
      </div>
      ${B.posts.map(post).join('')}
    </div>
    <div class="bg-tabs">
      <span class="on">${I.bgHome}</span><span>${I.bgSearch}</span><span>${I.bgAdd}</span><span>${I.bgReels}</span><span class="bg-tab-av"><img src="${src(B.miAvatar)}" alt=""></span>
    </div>
    <div class="safe-bottom bg-safe"></div>`;
  el.addEventListener('click', (e) => {
    const st = e.target.closest('[data-u]');
    if (st) return abrirHistorias(el, +st.dataset.u, st.querySelector('.bg-ring'));
    const like = e.target.closest('[data-like]');
    if (like) { like.classList.toggle('liked'); like.innerHTML = like.classList.contains('liked') ? I.bgHeartFill : I.bgHeart; }
  });
  return () => { if (TR.story) { cancelAnimationFrame(TR.story.raf); TR.story = null; } };
}

function abrirHistorias(el, u, ringEl) {
  const B = G.bristagram;
  const r = ringEl.getBoundingClientRect();
  const sv = document.createElement('div');
  sv.className = 'sv';
  sv.style.transformOrigin = `${r.left + r.width / 2}px ${r.top + r.height / 2}px`;
  el.appendChild(sv);
  const dur = (B.segundosPorHistoria || 6) * 1000;
  const st = { u, i: 0, t0: 0, pausa: 0, raf: 0, enPausa: false, origen: ringEl };
  TR.story = st;
  themeActual();

  const itemHTML = (it) => {
    let fondo;
    if (it.fondo) fondo = `<div class="sv-media" style="background:${it.fondo}"></div>`;
    else if (srcEsVideo(it)) fondo = `<video class="sv-media" src="${src(it)}" autoplay muted playsinline loop></video>`;
    else fondo = `<img class="sv-media" src="${src(it)}" alt="">`;
    const texto = it.texto ? `<div class="sv-text${it.fondo ? ' solo' : ''}"><span>${esc(it.texto)}</span></div>` : '';
    return fondo + texto;
  };
  function pintar(dir) {
    const user = B.historias[st.u];
    S.bg.visto[user.usuario] = true;
    save();
    sv.innerHTML = `<div class="safe-top"></div>
      <div class="sv-card${dir ? ' sv-in-' + dir : ''}">
        <div data-media>${itemHTML(user.items[st.i])}</div>
        <div class="story-shade"></div>
        <div class="story-bars">${user.items.map(() => '<span class="story-bar"><i></i></span>').join('')}</div>
        <div class="story-head"><span class="avatar" style="width:32px;height:32px"><img src="${src(user.avatar)}" alt=""></span><span class="story-user">${esc(user.usuario)}</span><span class="story-time" data-hace>${esc(user.items[st.i].hace || '')}</span><span style="flex:1"></span>
          <button class="icon-btn" aria-label="Más opciones">${I.more}</button><button class="icon-btn" aria-label="Cerrar" data-close>${I.close}</button></div>
      </div>
      <div class="story-reply"><span class="field">Enviar mensaje</span><button class="icon-btn" style="width:30px" aria-label="Me gusta">${I.heart}</button><button class="icon-btn" style="width:30px" aria-label="Compartir">${I.share}</button></div>
      <div class="safe-bottom"></div>`;
    sv.querySelector('[data-close]').onclick = cerrar;
    mostrarItem();
  }
  function mostrarItem() {
    const user = B.historias[st.u];
    const box = sv.querySelector('[data-media]');
    box.innerHTML = itemHTML(user.items[st.i]);
    sv.querySelector('[data-hace]').textContent = user.items[st.i].hace || '';
    sv.querySelectorAll('.story-bar i').forEach((b, k) => { b.style.width = k < st.i ? '100%' : '0%'; });
    st.t0 = performance.now();
    st.pausa = 0;
  }
  function siguienteItem() {
    const user = B.historias[st.u];
    if (st.i < user.items.length - 1) { st.i++; mostrarItem(); return; }
    if (st.u < B.historias.length - 1) { st.u++; st.i = 0; pintar('right'); return; }
    cerrar();
  }
  function anteriorItem() {
    if (st.i > 0) { st.i--; mostrarItem(); return; }
    if (st.u > 0) { st.u--; st.i = 0; pintar('left'); return; }
    mostrarItem();
  }
  function cambiarUsuario(delta) {
    const n = st.u + delta;
    if (n < 0) { mostrarItem(); return; }
    if (n >= B.historias.length) { cerrar(); return; }
    st.u = n; st.i = 0;
    pintar(delta > 0 ? 'right' : 'left');
  }
  function frame(t) {
    if (TR.story !== st) return;
    if (!st.enPausa) {
      const p = Math.min(1, (t - st.t0 - st.pausa) / dur);
      const bar = sv.querySelectorAll('.story-bar i')[st.i];
      if (bar) bar.style.width = (p * 100) + '%';
      if (p >= 1) siguienteItem();
    }
    st.raf = requestAnimationFrame(frame);
  }
  function cerrar() {
    if (TR.story !== st) return;
    cancelAnimationFrame(st.raf);
    TR.story = null;
    sv.classList.add('sv-out');
    setTimeout(() => sv.remove(), 300);
    el.querySelectorAll('.bg-st').forEach((b) => {
      const k = b.dataset.u;
      if (k !== undefined) b.querySelector('.bg-ring').classList.toggle('seen', !!S.bg.visto[B.historias[k].usuario]);
    });
    themeActual();
  }
  // Gestos: toque a la derecha/izquierda, deslizar horizontal (cambia de persona), deslizar hacia abajo (cierra), mantener (pausa)
  let g = null;
  sv.addEventListener('pointerdown', (e) => {
    if (e.target.closest('button,.story-reply')) return;
    g = { x: e.clientX, y: e.clientY, t: performance.now(), pausadoEn: performance.now() };
    st.enPausa = true;
  });
  sv.addEventListener('pointermove', (e) => {
    if (!g) return;
    const card = sv.querySelector('.sv-card');
    const dx = e.clientX - g.x;
    const dy = e.clientY - g.y;
    if (dy > 10 && Math.abs(dy) > Math.abs(dx)) card.style.transform = `translateY(${dy}px) scale(${Math.max(0.85, 1 - dy / 1500)})`;
    else if (Math.abs(dx) > 10) card.style.transform = `translateX(${dx}px)`;
  });
  const fin = (e) => {
    if (!g) return;
    const dx = e.clientX - g.x;
    const dy = e.clientY - g.y;
    const dt = performance.now() - g.t;
    st.pausa += performance.now() - g.pausadoEn;
    st.enPausa = false;
    const card = sv.querySelector('.sv-card');
    if (card) card.style.transform = '';
    g = null;
    if (e.type === 'pointercancel') return;
    if (dy > 110 && dy > Math.abs(dx)) return cerrar();
    if (Math.abs(dx) > 70) return cambiarUsuario(dx < 0 ? 1 : -1);
    if (dt < 300 && Math.abs(dx) < 12 && Math.abs(dy) < 12) {
      if (e.clientX < window.innerWidth / 3) anteriorItem(); else siguienteItem();
    }
  };
  sv.addEventListener('pointerup', fin);
  sv.addEventListener('pointercancel', fin);
  pintar();
  st.raf = requestAnimationFrame(frame);
}

// ========== TALKGRAM ==========
const esperado = () => { const e = G.talkgram[S.tg.pos]; return e && e.de === 'martina' ? e : null; };
const aceptaTexto = (e) => e && e.de === 'martina' && typeof e.texto === 'string';
const aceptaAudio = (e) => e && e.de === 'martina' && e.tipo !== 'foto';
// Mensaje para mostrar a partir de un evento del guion. comoTexto fuerza que un audio de Martina se vea como texto.
function desdeEvento(e, comoTexto) {
  if (e.de === 'martina' && e.tipo === 'audio' && comoTexto && e.texto) return { de: e.de, tipo: 'texto', texto: e.texto, ev: e.id };
  const m = { de: e.de, tipo: e.tipo === 'audio-cancelado' ? 'audio' : e.tipo, ev: e.id };
  if (e.texto) m.texto = e.texto;
  if (e.media) m.media = e.media;
  if (e.tipo === 'audio') m.duracion = e.duracion || 4;
  return m;
}
const etiquetaFoto = { corona: 'Foto de la corona', emily: 'Foto de Emily', selfie: 'Selfie de Martina' };

function msgHTML(m, i, arr) {
  const prev = arr[i - 1];
  const first = !prev || prev.de !== m.de;
  const side = m.de === 'martina' ? 'out' : 'in';
  const color = side === 'in' ? '#FFFFFF' : '#CDEFF2';
  const meta = side === 'out' ? `${esc(m.hora)}${I.ticks(m.leido ? '#0B8F9E' : '#8FA3A6')}` : esc(m.hora);
  const cls = `bub ${side}${first ? ' first' : ''}`;
  const t = first ? tail(side, color) : '';
  if (m.tipo === 'foto') {
    const s = M[m.media];
    return `<div class="${cls} photo" data-i="${i}">${t}<div class="ph">${s ? `<img src="${s}" alt="">` : `<span class="lbl">${etiquetaFoto[m.media] || 'Foto'} (cargar en el menú)</span>`}</div><span class="meta">${meta}</span></div>`;
  }
  if (m.tipo === 'audio') {
    const bars = waveBars(30, i + 3).map((h) => `<i style="height:${h}px"></i>`).join('');
    return `<div class="${cls} audio" data-i="${i}">${t}<button class="audio-play" data-play="${i}" aria-label="Reproducir">${I.play}</button><div class="audio-wave">${bars}</div><div class="audio-side"><span class="audio-dur" data-dur="${i}">${fmtDur(m.duracion || 4)}</span><span class="meta">${meta}</span></div></div>`;
  }
  return `<div class="${cls}" data-i="${i}">${t}${esc(m.texto)}<span class="meta">${meta}</span></div>`;
}
const puntosHTML = () => `<div class="bub in first typing" data-typing>${tail('in', '#FFFFFF')}<span class="dots"><i></i><i></i><i></i></span></div>`;

function scrTalkGram(el) {
  el.classList.add('tg');
  el.innerHTML = `
    <div class="tg-top"><div class="safe-top"></div>
      <div class="tg-nav">
        <button class="tg-back" aria-label="Volver" data-back>${I.chevronLeft}</button>
        <button class="tg-av" aria-label="Ver foto de perfil" data-avatar>${avatarHTML(36)}</button>
        <button class="tg-who" data-who><span class="tg-who-text"><span class="tg-name" data-name></span><span class="tg-status" data-status></span></span></button>
        <button class="tg-act" aria-label="Videollamada">${I.video}</button>
        <button class="tg-act" aria-label="Llamar">${I.phone}</button>
      </div>
    </div>
    <div class="tg-list" data-list></div>
    <div class="tg-bottom kb-closed" data-bottom></div>
    <input type="file" accept="image/*" capture="user" data-cam hidden>`;
  tgHeader();
  tgLista();
  tgComposer('idle');

  el.querySelector('[data-back]').onclick = () => go('inicio', 'close');
  el.querySelector('[data-avatar]').onclick = (e) => verFotoPerfil(el, e.currentTarget);
  el.querySelector('[data-who]').onclick = () => hojaContacto(el);
  el.querySelector('[data-list]').addEventListener('click', (e) => {
    if (tecladoAbierto() && !e.target.closest('button')) cerrarTeclado();
    const p = e.target.closest('[data-play]');
    if (p) return reproducirAudio(+p.dataset.play);
    if (e.target.closest('[data-agregar]')) hojaContacto(el);
  });
  el.querySelector('[data-cam]').addEventListener('change', async (e) => {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    await guardarMedio('selfie', f);
    const exp = esperado();
    let evId;
    if (exp && exp.tipo === 'foto') evId = consumir();
    agregarMsg({ de: 'martina', tipo: 'foto', media: 'selfie', ev: evId });
    e.target.value = '';
  });
  return () => { if (TR.rec) { clearInterval(TR.rec.iv); TR.rec = null; } TR.playing = null; };
}

function tgHeader() {
  const n = $('[data-name]');
  if (!n) return;
  n.textContent = nombreContacto();
  $('[data-status]').textContent = TR.typing || G.contacto.estado;
}
function tgLista() {
  const list = $('[data-list]');
  if (!list) return;
  const card = S.tg.agendado ? '' : `<div class="tg-card"><p>Este número no está en tus contactos</p><div class="row"><button class="red">Bloquear</button><button class="acc" data-agregar>Agregar</button></div></div>`;
  list.innerHTML = card + '<span class="tg-day">Hoy</span>' + S.tg.msgs.map(msgHTML).join('') + (TR.typing === 'escribiendo…' ? puntosHTML() : '');
  list.scrollTop = list.scrollHeight;
  scrollAbajo();
  setTimeout(scrollAbajo, 150);
  list.querySelectorAll('img').forEach((im) => im.addEventListener('load', scrollAbajo, { once: true }));
}
function scrollAbajo() {
  const list = $('[data-list]');
  if (list) requestAnimationFrame(() => { list.scrollTop = list.scrollHeight; });
}
function puntos(mostrar) {
  const list = $('[data-list]');
  if (!list) return;
  const p = list.querySelector('[data-typing]');
  if (mostrar && !p) { list.insertAdjacentHTML('beforeend', puntosHTML()); scrollAbajo(); }
  if (!mostrar && p) p.remove();
}

// Visor de la foto de perfil
function verFotoPerfil(el, origen) {
  const r = origen.getBoundingClientRect();
  const pv = document.createElement('div');
  pv.className = 'pv';
  pv.style.transformOrigin = `${r.left + r.width / 2}px ${r.top + r.height / 2}px`;
  pv.innerHTML = `<div class="safe-top"></div>
    <div class="pv-nav"><button class="pv-back" aria-label="Volver" data-pvclose>${I.chevronLeft}</button><span class="pv-name">${esc(nombreContacto())}</span><span style="width:44px"></span></div>
    <div class="pv-img"><img src="${perfilSrc()}" alt=""></div>`;
  el.appendChild(pv);
  setTheme('#000000', true);
  const cerrar = () => { pv.classList.add('pv-out'); setTimeout(() => pv.remove(), 260); themeActual(); };
  pv.querySelector('[data-pvclose]').onclick = cerrar;
}

// Composer: 'idle' (vacío/escribiendo) o 'rec' (grabando)
let typedN = 0;
function tgComposer(estado) {
  const box = $('[data-bottom]');
  if (!box) return;
  if (estado === 'rec') {
    box.innerHTML = `<button class="tg-ibtn" aria-label="Descartar audio" data-trash style="color:#8A929C">${I.trash}</button>
      <div class="tg-rec"><span class="rec-dot"></span><span data-rect>0:00</span><div class="rec-wave" data-recwave></div></div>
      <button class="tg-sendbtn" aria-label="Enviar audio" data-sendrec>${I.send}</button>`;
    box.querySelector('[data-trash]').onclick = cancelarAudio;
    box.querySelector('[data-sendrec]').onclick = enviarAudio;
    return;
  }
  const sim = A.teclado === 'simulado';
  box.innerHTML = `<button class="tg-ibtn" aria-label="Adjuntar">${I.plus}</button>
    ${sim ? '<span data-slot></span>' : '<textarea class="tg-field" rows="1" placeholder="Mensaje" autocomplete="off" autocorrect="off" autocapitalize="sentences" spellcheck="false" data-field></textarea>'}
    <span data-right style="display:flex"></span>`;
  if (sim) {
    const cf = campoFalso('tg-field', 'Mensaje');
    cf.dataset.field = '';
    box.querySelector('[data-slot]').replaceWith(cf);
    cf.addEventListener('pointerup', () => abrirTecladoTG(cf));
    if (tecladoAbierto()) abrirTecladoTG(cf);
  }
  const f = box.querySelector('[data-field]');
  const right = box.querySelector('[data-right]');
  const pintarDerecha = () => {
    if (f.value.length) {
      right.innerHTML = `<button class="tg-sendbtn" aria-label="Enviar" data-send>${I.send}</button>`;
      right.querySelector('[data-send]').onclick = enviarTexto;
    } else {
      right.innerHTML = `<button class="tg-ibtn" aria-label="Cámara" data-camb>${I.camera}</button><button class="tg-ibtn" aria-label="Nota de voz" data-mic style="width:36px">${I.mic}</button>`;
      right.querySelector('[data-camb]').onclick = () => $('[data-cam]').click();
      right.querySelector('[data-mic]').onclick = grabarAudio;
    }
  };
  const ajustarAlto = () => { f.style.height = 'auto'; f.style.height = Math.min(120, f.scrollHeight) + 'px'; };
  f.addEventListener('input', (e) => {
    const exp = esperado();
    if (A.modo === 'completar' && aceptaTexto(exp)) {
      const borra = (e.inputType || '').startsWith('delete');
      typedN = borra ? Math.max(0, typedN - A.letras) : Math.min(exp.texto.length, typedN + A.letras);
      f.value = exp.texto.slice(0, typedN);
      try { f.setSelectionRange(f.value.length, f.value.length); } catch (err) { /* */ }
    }
    ajustarAlto();
    pintarDerecha();
  });
  f.addEventListener('focus', () => { TR.esperarToque = false; });
  pintarDerecha();
  ajustarAlto();
}

// ---------- Teclado simulado en TalkGram ----------
function abrirTecladoTG(cf) {
  TR.esperarToque = false;
  abrirTeclado(CUR, cf, { predictivo: A.predictivo, sugerencias: sugerenciasTG, alSugerir: sugerirTG, alIntro: () => {}, alMover: scrollAbajo });
}
// Palabras del texto del guion con su posición final (para avanzar el modo Completar hasta ahí).
function palabrasDe(texto) {
  const out = [];
  const re = /\S+/g;
  let m;
  while ((m = re.exec(texto))) out.push({ ini: m.index, fin: m.index + m[0].length, w: m[0] });
  return out;
}
const limpiarPalabra = (w) => w.replace(/^[¿¡"'(]+|[.,;:!?"')…]+$/g, '');
// [INVENTADO] sugerencias genéricas para el modo libre con el campo vacío.
const SUG_LIBRE = ['Sí', 'No', 'Jaja'];
function sugerenciasTG() {
  const f = $('[data-field]');
  const v = f ? f.value : '';
  const exp = esperado();
  if (A.modo === 'completar' && aceptaTexto(exp)) {
    const ws = palabrasDe(exp.texto);
    const n = typedN;
    const i = ws.findIndex((w) => w.fin > n || (w.fin === n && exp.texto[n] !== ' ' && n < exp.texto.length));
    if (i < 0) return [];
    const cur = ws[i];
    const parcial = n > cur.ini ? exp.texto.slice(cur.ini, n) : '';
    const item = (w) => (w ? { texto: limpiarPalabra(w.w) || w.w, fin: Math.min(exp.texto.length, w.fin + (exp.texto[w.fin] === ' ' ? 1 : 0)) } : null);
    if (parcial) return [{ texto: `“${parcial}”`, fin: n }, item(cur), item(ws[i + 1])].filter(Boolean);
    return [item(cur), item(ws[i + 1]), item(ws[i + 2])].filter(Boolean);
  }
  const m = v.match(/(\S+)$/);
  if (m) return [{ texto: `“${m[1]}”`, libre: m[1] }];
  return SUG_LIBRE.map((w) => ({ texto: w, libre: w, nueva: true }));
}
function sugerirTG(it) {
  const f = $('[data-field]');
  if (!f) return;
  const exp = esperado();
  if (it.fin !== undefined && A.modo === 'completar' && aceptaTexto(exp)) {
    typedN = it.fin;
    f.value = exp.texto.slice(0, typedN);
  } else if (it.libre) {
    const base = it.nueva ? f.value : f.value.replace(/\S+$/, '');
    f.value = base + it.libre + ' ';
  }
  // Repinta el botón de enviar y el alto sin pasar por la lógica de "letras por tecla".
  const guardado = A.modo;
  A.modo = 'libre';
  f.dispatchEvent(new Event('input'));
  A.modo = guardado;
}

function enviarTexto() {
  const f = $('[data-field]');
  const v = f.value.trim();
  if (!v) return;
  const exp = esperado();
  let texto = v;
  let evId;
  if (aceptaTexto(exp)) {
    if (A.modo === 'completar') texto = exp.texto;
    evId = consumir();
  }
  f.value = '';
  typedN = 0;
  f.style.height = 'auto';
  f.dispatchEvent(new Event('input'));
  typedN = 0;
  agregarMsg({ de: 'martina', tipo: 'texto', texto, ev: evId });
  f.focus();
}

function grabarAudio() {
  TR.esperarToque = false;
  cerrarTeclado();
  const t0 = Date.now();
  tgComposer('rec');
  const wave = $('[data-recwave]');
  const iv = setInterval(() => {
    const s = (Date.now() - t0) / 1000;
    const tEl = $('[data-rect]');
    if (tEl) tEl.textContent = fmtDur(s);
    if (wave) {
      const i = document.createElement('i');
      i.style.height = (4 + Math.random() * 20) + 'px';
      wave.appendChild(i);
      if (wave.children.length > 60) wave.firstChild.remove();
    }
  }, 120);
  TR.rec = { t0, iv };
}
function terminarGrabacion() {
  if (!TR.rec) return 0;
  clearInterval(TR.rec.iv);
  const s = (Date.now() - TR.rec.t0) / 1000;
  TR.rec = null;
  tgComposer('idle');
  return s;
}
function cancelarAudio() {
  terminarGrabacion();
  const exp = esperado();
  if (exp && exp.tipo === 'audio-cancelado') { consumir(); programarAuto(); }
}
function enviarAudio() {
  const s = terminarGrabacion();
  const exp = esperado();
  let dur = Math.max(1, Math.round(s));
  let evId;
  if (aceptaAudio(exp)) {
    if (A.modo === 'completar') dur = exp.duracion || durEstimada(exp.texto);
    evId = consumir();
  }
  agregarMsg({ de: 'martina', tipo: 'audio', duracion: dur, ev: evId });
}

function reproducirAudio(i) {
  const m = S.tg.msgs[i];
  if (!m) return;
  const node = $(`.bub[data-i="${i}"]`);
  if (!node) return;
  const btn = node.querySelector('[data-play]');
  const bars = node.querySelectorAll('.audio-wave i');
  const durEl = node.querySelector('[data-dur]');
  if (TR.playing && TR.playing.i === i) {
    cancelAnimationFrame(TR.playing.raf);
    TR.playing = null;
    btn.innerHTML = I.play;
    return;
  }
  if (TR.playing) cancelAnimationFrame(TR.playing.raf);
  const total = (m.duracion || 4) * 1000;
  const t0 = performance.now();
  btn.innerHTML = I.pause;
  const st = { i, raf: 0 };
  TR.playing = st;
  const frame = (t) => {
    const p = Math.min(1, (t - t0) / total);
    const on = Math.round(p * bars.length);
    bars.forEach((b, k) => b.classList.toggle('on', k < on));
    durEl.textContent = fmtDur((m.duracion || 4) * (1 - p));
    if (p < 1 && TR.playing === st) st.raf = requestAnimationFrame(frame);
    else if (p >= 1) { btn.innerHTML = I.play; bars.forEach((b) => b.classList.remove('on')); durEl.textContent = fmtDur(m.duracion || 4); TR.playing = null; }
  };
  st.raf = requestAnimationFrame(frame);
}

// Hoja "Nuevo contacto" (agendar a Julián)
function hojaContacto(el) {
  if (S.tg.agendado) return;
  const back = document.createElement('div');
  back.className = 'sheet-back';
  back.innerHTML = `<div class="sheet">
      <div class="sheet-nav"><button data-cancel>Cancelar</button><span class="t">Nuevo contacto</span><button class="b" data-ok>OK</button></div>
      <div class="sheet-av">${avatarHTML(96)}</div>
      <div class="sheet-group"><div class="sheet-row"><input type="text" placeholder="Nombre" autocomplete="off" autocorrect="off" data-nombre></div><div class="sheet-row"><input type="text" placeholder="Apellido" autocomplete="off" autocorrect="off"></div></div>
      <div class="sheet-group"><div class="sheet-row"><span class="k">celular</span><span class="v">${esc(G.contacto.numero)}</span></div></div>
    </div>`;
  el.appendChild(back);
  let inp = back.querySelector('[data-nombre]');
  const sim = A.teclado === 'simulado';
  if (sim) {
    const cf = campoFalso('', 'Nombre');
    inp.replaceWith(cf);
    inp = cf;
    const abrir = () => abrirTeclado(el, cf, {
      predictivo: A.predictivo,
      sugerencias: () => (A.modo === 'completar' ? [G.contacto.nombreAgendado] : []),
      alSugerir: () => { n = G.contacto.nombreAgendado.length; cf.value = G.contacto.nombreAgendado; },
      alIntro: () => {}
    });
    cf.addEventListener('pointerup', abrir);
    back._abrir = abrir;
  }
  let n = 0;
  inp.addEventListener('input', (e) => {
    if (A.modo !== 'completar') return;
    const objetivo = G.contacto.nombreAgendado;
    n = (e.inputType || '').startsWith('delete') ? Math.max(0, n - 1) : Math.min(objetivo.length, n + 1);
    inp.value = objetivo.slice(0, n);
  });
  const cerrar = () => { if (sim) cerrarTeclado(); back.classList.add('out'); setTimeout(() => back.remove(), 260); };
  back.querySelector('[data-cancel]').onclick = cerrar;
  back.querySelector('[data-ok]').onclick = () => {
    S.tg.agendado = true;
    S.tg.nombre = inp.value.trim() || G.contacto.nombreAgendado;
    save();
    cerrar();
    tgHeader();
    tgLista();
  };
  setTimeout(() => (sim ? back._abrir() : inp.focus()), 300);
}

// ---------- Motor del guion de TalkGram ----------
function consumir() { const e = G.talkgram[S.tg.pos]; S.tg.pos++; save(); refrescarMenu(); return e ? e.id : undefined; }
function marcarLeidos() { S.tg.msgs.forEach((m) => { if (m.de === 'martina') m.leido = true; }); }
function setTyping(txt) {
  const habia = !!TR.typing;
  TR.typing = txt;
  tgHeader();
  if (S.screen !== 'talkgram') return;
  if (txt && !habia) {
    marcarLeidos();
    $$('.bub.out .meta svg path').forEach((p) => p.setAttribute('stroke', '#0B8F9E'));
  }
  puntos(txt === 'escribiendo…');
}
export function agregarMsg(m) {
  m.hora = hhmm();
  S.tg.msgs.push(m);
  save();
  if (S.screen === 'talkgram') {
    const list = $('[data-list]');
    puntos(false);
    const i = S.tg.msgs.length - 1;
    list.insertAdjacentHTML('beforeend', msgHTML(m, i, S.tg.msgs));
    const img = list.lastElementChild.querySelector('img');
    if (img) img.addEventListener('load', scrollAbajo, { once: true });
    scrollAbajo();
  } else if (m.de === 'julian') {
    notificar(m);
  }
  if (m.de === 'martina') programarAuto();
  refrescarMenu();
}
function vistaPrevia(m) {
  if (m.tipo === 'foto') return '📷 Foto';
  if (m.tipo === 'audio') return '🎤 Mensaje de voz';
  return m.texto;
}
function notificar(m) {
  const n = { titulo: nombreContacto(), texto: vistaPrevia(m), cuando: 'ahora' };
  if (S.screen === 'bloqueo') { agregarNotifBloqueo(n); return; }
  if (S.screen === 'llamada') return;
  banner(n);
}
function banner(n) {
  const layer = document.getElementById('banner-layer');
  layer.innerHTML = notifHTML(n);
  const b = layer.firstChild;
  b.onclick = () => { layer.innerHTML = ''; go('talkgram', 'open'); };
  requestAnimationFrame(() => requestAnimationFrame(() => b.classList.add('in')));
  setTimeout(() => { b.classList.remove('in'); setTimeout(() => { if (b.parentNode) b.remove(); }, 400); }, 5000);
}
function limpiarTimers() {
  clearTimeout(TR.autoT);
  clearTimeout(TR.typingT);
  clearTimeout(TR.lockT);
  TR.busy = false;
  TR.typing = '';
}
export function programarAuto() {
  clearTimeout(TR.autoT);
  const ev = G.talkgram[S.tg.pos];
  if (!ev || ev.de !== 'julian' || !A.auto || ev.manual || TR.esperarToque || TR.busy) return;
  const prev = G.talkgram[S.tg.pos - 1];
  const wait = ev.espera ?? (prev && prev.de === 'martina' ? A.espera : A.esperaSeguido);
  TR.autoT = setTimeout(() => dispararJulian(ev), wait * 1000);
}
function dispararJulian(ev) {
  if (TR.busy || !ev || ev.de !== 'julian') return;
  TR.busy = true;
  if (ev.tipo === 'escribiendo') {
    setTyping('escribiendo…');
    TR.typingT = setTimeout(() => { setTyping(''); TR.busy = false; consumir(); programarAuto(); }, (ev.duracion || 2) * 1000);
    return;
  }
  let t = 0.6;
  if (ev.tipo === 'texto' && A.tipeo) t = Math.min(3, 0.8 + ev.texto.length * 0.03);
  if (ev.tipo === 'audio') t = 1.6;
  if (S.screen === 'bloqueo') t = 0.1;
  setTyping(ev.tipo === 'audio' ? 'grabando audio…' : 'escribiendo…');
  TR.typingT = setTimeout(() => {
    setTyping('');
    TR.busy = false;
    S.tg.pos++;
    agregarMsg(desdeEvento(ev));
    programarAuto();
  }, t * 1000);
}
// Toque invisible / botón "Siguiente" del menú
export function siguiente() {
  TR.esperarToque = false;
  if (S.screen === 'eco') return ecoSiguiente();
  if (TR.busy) return;
  clearTimeout(TR.autoT);
  clearTimeout(TR.lockT);
  const ev = G.talkgram[S.tg.pos];
  if (!ev) return;
  if (ev.de === 'martina') { // el equipo fuerza el mensaje de Martina
    consumir();
    if (ev.tipo !== 'audio-cancelado') agregarMsg(desdeEvento(ev, A.audiosComo === 'texto'));
    return;
  }
  dispararJulian(ev);
}
export function deshacer() {
  limpiarTimers();
  const m = S.tg.msgs.pop();
  if (m && m.ev) {
    const i = G.talkgram.findIndex((e) => e.id === m.ev);
    if (i >= 0) S.tg.pos = i;
  } else if (!m && S.tg.pos > 0) {
    S.tg.pos--;
  }
  save();
  if (S.screen === 'talkgram') { tgHeader(); tgLista(); }
  refrescarMenu();
}
export function planos() {
  return G.talkgram.map((e, i) => ({ i, plano: e.plano })).filter((c) => c.plano);
}
export function cargarPlano(i) {
  limpiarTimers();
  TR.esperarToque = true;
  const base = ahora().getTime();
  const previos = G.talkgram.slice(0, i).filter((e) => e.tipo !== 'escribiendo' && e.tipo !== 'audio-cancelado');
  S.tg.pos = i;
  S.tg.msgs = previos.map((e, k) => Object.assign(desdeEvento(e, A.audiosComo === 'texto'), { hora: hhmm(new Date(base - (previos.length - k) * 40000)), leido: true }));
  S.tg.agendado = G.talkgram.slice(0, i + 1).some((e) => e.yaAgendado);
  S.tg.nombre = S.tg.agendado ? G.contacto.nombreAgendado : '';
  S.lockNotifs = [];
  save();
  go(i === 0 ? 'bloqueo' : 'talkgram');
  refrescarMenu();
}
export function reiniciarTodo() {
  limpiarTimers();
  TR.esperarToque = true;
  S = estadoBase();
  save();
  render();
  refrescarMenu();
}
export function estadoTexto() {
  const ev = G.talkgram[S.tg.pos];
  const ec = G.eco[S.eco.pos];
  const tg = ev ? `${ev.id} · ${ev.de === 'julian' ? 'Julián' : 'Martina'} (${ev.tipo})${ev.texto ? ': "' + ev.texto.slice(0, 40) + (ev.texto.length > 40 ? '…' : '') + '"' : ''}${TR.esperarToque && ev.de === 'julian' ? ' · espera toque' : ''}` : 'fin del chat';
  const eco = ec ? `${ec.id} · ${ec.de === 'eco' ? 'Eco' : 'Martina'}` : 'fin';
  return { tg, eco };
}

// ========== ECO ==========
function scrEco(el) {
  el.classList.add('eco');
  el.innerHTML = `<div class="safe-top"></div>
    <div class="eco-nav">
      <button class="icon-btn" aria-label="Conversaciones" data-home>${I.sidebar}</button>
      <div class="eco-title">${I.ecoMark('#6D4AFF')}<span>Eco</span><span class="chev">${I.chevronDown}</span></div>
      <button class="icon-btn" aria-label="Nueva conversación">${I.compose}</button>
    </div>
    <div class="eco-list" data-elist></div>
    <div class="eco-composer" data-ecomp></div>
    <div class="safe-bottom"></div>`;
  el.querySelector('[data-home]').onclick = () => go('inicio', 'close');
  ecoLista();
  ecoComposer(false);
  return () => { if (TR.ecoRec) { clearInterval(TR.ecoRec.iv); TR.ecoRec = null; } };
}
function ecoMsgHTML(m, i, arr) {
  if (m.de === 'martina') return `<div class="eco-user"><div class="b">${esc(m.texto)}</div><span class="vm">${I.micSmall}Mensaje de voz, ${fmtDur(m.duracion || 5)}</span></div>`;
  const ultimo = i === arr.length - 1;
  const streaming = TR.ecoStream && ultimo;
  return `<p class="eco-bot" data-bot="${i}">${esc(streaming ? TR.ecoStream.visible : m.texto)}${streaming ? '<span class="eco-dot"></span>' : ''}</p>${!streaming && ultimo ? `<div class="eco-acts"><span>${I.speaker}</span><span>${I.copy}</span></div>` : ''}`;
}
function ecoLista() {
  const list = $('[data-elist]');
  if (!list) return;
  if (!S.eco.msgs.length) {
    list.innerHTML = '<div class="eco-empty"><span class="h">¿De qué querés hablar?</span></div>';
    return;
  }
  list.innerHTML = S.eco.msgs.map(ecoMsgHTML).join('');
  list.scrollTop = list.scrollHeight;
}
function ecoComposer(grabando) {
  const c = $('[data-ecomp]');
  if (!c) return;
  if (!grabando) {
    c.innerHTML = `<span class="ph">Preguntale a Eco</span>
      <button class="cb" style="left:8px" aria-label="Adjuntar">${I.plus}</button>
      <button class="cb" style="right:52px" aria-label="Dictar" data-erec>${I.mic}</button>
      <button class="cb voice" style="right:8px" aria-label="Modo voz" data-erec>${I.voice}</button>`;
    c.querySelectorAll('[data-erec]').forEach((b) => { b.onclick = ecoGrabar; });
    return;
  }
  c.innerHTML = `<div class="eco-rec"><button class="x" aria-label="Cancelar" data-ex>${I.close}</button><div class="wave" data-ewave></div><span class="time" data-et>0:00</span><button class="ok" aria-label="Enviar" data-eok>${I.send}</button></div>`;
  c.querySelector('[data-ex]').onclick = () => { clearInterval(TR.ecoRec.iv); TR.ecoRec = null; ecoComposer(false); };
  c.querySelector('[data-eok]').onclick = () => { clearInterval(TR.ecoRec.iv); TR.ecoRec = null; ecoComposer(false); ecoEnviarVoz(); };
}
function ecoGrabar() {
  if (TR.ecoStream) return;
  ecoComposer(true);
  const t0 = Date.now();
  const wave = $('[data-ewave]');
  TR.ecoRec = { iv: setInterval(() => {
    const t = $('[data-et]');
    if (t) t.textContent = fmtDur((Date.now() - t0) / 1000);
    const i = document.createElement('i');
    i.style.height = (4 + Math.random() * 24) + 'px';
    wave.appendChild(i);
    if (wave.children.length > 70) wave.firstChild.remove();
  }, 110) };
}
function ecoEnviarVoz() {
  const ev = G.eco[S.eco.pos];
  if (!ev || ev.de !== 'martina') return;
  S.eco.pos++;
  S.eco.msgs.push({ de: 'martina', texto: ev.texto, duracion: ev.duracion });
  save();
  ecoLista();
  refrescarMenu();
  const resp = G.eco[S.eco.pos];
  if (resp && resp.de === 'eco') setTimeout(() => ecoResponder(resp), 900);
}
function ecoResponder(ev) {
  const palabras = ev.texto.split(' ');
  S.eco.msgs.push({ de: 'eco', texto: ev.texto });
  S.eco.pos++;
  save();
  TR.ecoStream = { visible: '', k: 0 };
  ecoLista();
  const paso = 1000 / Math.max(1, A.ecoVelocidad);
  const iv = setInterval(() => {
    const st = TR.ecoStream;
    if (!st) return clearInterval(iv);
    st.k++;
    st.visible = palabras.slice(0, st.k).join(' ');
    const p = $(`[data-bot="${S.eco.msgs.length - 1}"]`);
    if (p) p.innerHTML = esc(st.visible) + '<span class="eco-dot"></span>';
    const list = $('[data-elist]');
    if (list) list.scrollTop = list.scrollHeight;
    if (st.k >= palabras.length) { clearInterval(iv); TR.ecoStream = null; ecoLista(); refrescarMenu(); }
  }, paso);
}
export function ecoSiguiente() {
  if (TR.ecoStream) return;
  const ev = G.eco[S.eco.pos];
  if (!ev) return;
  if (ev.de === 'martina') ecoEnviarVoz();
  else ecoResponder(ev);
}
export function reiniciarEco() {
  TR.ecoStream = null;
  S.eco = { pos: 0, msgs: [] };
  save();
  if (S.screen === 'eco') render();
  refrescarMenu();
}

// ========== LLAMADA ==========
export function iniciarLlamada(desdeMenu = true) {
  clearTimeout(TR.call.reT);
  if (desdeMenu) TR.call.sonadas = 0;
  TR.call.conectada = false;
  document.getElementById('banner-layer').innerHTML = '';
  go('llamada', 'fade');
}
function scrLlamada(el) {
  el.classList.add('call');
  const nombre = S.tg.agendado ? (S.tg.nombre || G.llamada.nombre) : G.contacto.numero;
  const fondo = `<div class="call-bgimg" style="background-image:url('${perfilSrc()}')"></div><div class="top-fade"></div>`;
  if (TR.call.conectada) {
    el.innerHTML = `${fondo}<div class="safe-top"></div>
      <div class="call-top">${avatarHTML(96, 'margin-bottom:16px')}<span class="call-name">${esc(nombre)}</span><span class="call-sub" data-calltime>0:00</span></div>
      <div class="call-btns" style="justify-content:center"><button class="call-btn no" data-end><span class="c">${sized(I.phoneDown, 48)}</span>Finalizar</button></div>`;
    el.querySelector('[data-end]').onclick = () => { TR.call.conectada = false; go(TR.call.volverA || 'talkgram', 'fade'); };
    return;
  }
  el.innerHTML = `${fondo}<div class="safe-top"></div>
    <div class="call-top">${avatarHTML(96, 'margin-bottom:16px')}<span class="call-name">${esc(nombre)}</span><span class="call-sub">${esc(G.llamada.subtitulo)}</span></div>
    <div class="call-small"><div><span class="c">${I.alarm}</span>Recordarme</div><div><span class="c">${I.bubble}</span>Mensaje</div></div>
    <div class="call-btns" style="margin-top:0"><button class="call-btn no" data-no><span class="c">${sized(I.phoneDown, 48)}</span>Rechazar</button><button class="call-btn yes" data-yes><span class="c ringing">${sized(I.phoneFill, 44)}</span>Aceptar</button></div>`;
  el.querySelector('[data-no]').onclick = () => {
    TR.call.sonadas++;
    go(TR.call.volverA || 'talkgram', 'fade');
    if (A.reSonar > 0 && TR.call.sonadas <= A.reSonarVeces) TR.call.reT = setTimeout(() => iniciarLlamada(false), A.reSonar * 1000);
  };
  el.querySelector('[data-yes]').onclick = () => { TR.call.conectada = true; TR.call.inicio = Date.now(); render(); };
}

const SCREENS = { bloqueo: scrBloqueo, inicio: scrInicio, bristagram: scrBristagram, talkgram: scrTalkGram, eco: scrEco, llamada: scrLlamada };

// ---------- Gestos ----------
function swipeUp(el, fn) {
  let y0 = null;
  el.addEventListener('pointerdown', (e) => { y0 = e.clientY; });
  el.addEventListener('pointerup', (e) => { if (y0 !== null && y0 - e.clientY > window.innerHeight * 0.18) fn(); y0 = null; });
}
// Toques invisibles (no bloquean los botones de debajo):
// · mantener 0,7 s en la esquina superior izquierda → menú oculto
// · doble toque en la esquina superior derecha → siguiente evento del guion
function initToques() {
  const Z = 64;
  let lp = 0;
  let suprimir = false;
  let ultimoToque = 0;
  let yBottom = null;
  const topSeguro = () => {
    const p = $('.safe-top');
    return p ? p.getBoundingClientRect().bottom : 0;
  };
  document.addEventListener('pointerdown', (e) => {
    if (document.getElementById('menu-layer').classList.contains('open')) return;
    const top = topSeguro();
    const enFranja = e.clientY < top + Z;
    if (enFranja && e.clientX < Z) {
      // Al abrir el menú con la pulsación larga se descarta el "click" que llega al soltar.
      // iOS a veces no genera ese click: por eso el descarte vence solo, para no comerse el primer toque del menú.
      lp = setTimeout(() => { suprimir = true; abrirMenu(); setTimeout(() => { suprimir = false; }, 450); }, 700);
    }
    if (enFranja && e.clientX > window.innerWidth - Z && !TR.story) {
      const t = Date.now();
      if (t - ultimoToque < 400) { ultimoToque = 0; siguiente(); } else ultimoToque = t;
    }
    yBottom = e.clientY > window.innerHeight - 40 && !e.target.closest('.kbs') ? e.clientY : null;
  }, true);
  const fin = (e) => {
    clearTimeout(lp);
    if (yBottom !== null && e.type === 'pointerup' && yBottom - e.clientY > 80 && !['llamada', 'bloqueo', 'inicio'].includes(S.screen) && !TR.story) go('inicio', 'close');
    yBottom = null;
  };
  document.addEventListener('pointerup', fin, true);
  document.addEventListener('pointercancel', fin, true);
  document.addEventListener('click', (e) => {
    if (suprimir) { suprimir = false; e.preventDefault(); e.stopPropagation(); }
  }, true);
}

// ---------- Teclado (iOS) ----------
const altoMax = { o: '', v: 0 };
function initViewport() {
  const vv = window.visualViewport;
  const ajustar = () => {
    detectarBarra();
    // Con la barra translúcida, iOS informa una altura más corta (le resta la barra de arriba):
    // la altura real de la app es la de la pantalla.
    const translucida = document.body.classList.contains('barra-translucida') && esApp();
    // En iOS 26 la altura de la ventana también se achica con el teclado del sistema: se usa la mayor
    // vista en esta orientación. Si no, el teclado no se detecta y queda un hueco abajo de la barra de escribir.
    const orient = window.innerWidth > window.innerHeight ? 'h' : 'v';
    if (altoMax.o !== orient) { altoMax.o = orient; altoMax.v = 0; }
    altoMax.v = Math.max(altoMax.v, window.innerHeight);
    const completa = translucida ? Math.max(altoMax.v, screen.height) : altoMax.v;
    const visible = vv ? vv.height : window.innerHeight;
    const ae = document.activeElement;
    const enCampo = ae && (ae.tagName === 'TEXTAREA' || ae.tagName === 'INPUT') && !ae.readOnly && ae.type !== 'file';
    const teclado = completa - visible > 150 || (enCampo && completa - visible > 60);
    document.documentElement.style.setProperty('--app-h', (teclado ? visible : completa) + 'px');
    document.body.classList.toggle('kb', !!teclado);
    const b = $('[data-bottom]');
    if (b) b.classList.toggle('kb-closed', !teclado);
    window.scrollTo(0, 0);
    scrollAbajo();
  };
  if (vv) { vv.addEventListener('resize', ajustar); vv.addEventListener('scroll', () => window.scrollTo(0, 0)); }
  window.addEventListener('resize', ajustar);
  document.addEventListener('focusin', () => setTimeout(ajustar, 60));
  document.addEventListener('focusout', () => setTimeout(ajustar, 60));
  ajustar();
}

// ---------- Arranque ----------
function detectarBarra() {
  const probe = document.createElement('div');
  probe.style.cssText = 'position:fixed;top:0;left:0;padding-top:env(safe-area-inset-top,0px);visibility:hidden';
  document.body.appendChild(probe);
  const inset = parseFloat(getComputedStyle(probe).paddingTop) || 0;
  document.body.classList.toggle('barra-translucida', inset > 0);
  probe.remove();
}
const esApp = () => navigator.standalone === true || window.matchMedia('(display-mode: standalone)').matches;
async function boot() {
  load();
  // Sin esto, iOS no muestra el estado :active (respuesta visual) al tocar botones.
  document.addEventListener('touchstart', () => {}, { passive: true });
  document.documentElement.style.setProperty('--extra-top', (A.extraTop || 0) + 'px');
  const editado = localStorage.getItem(LS_GUION);
  if (editado) {
    try { G = JSON.parse(editado); } catch (e) { G = null; }
  }
  if (!G) G = await (await fetch('contenido/guion.json')).json();
  await cargarMedios();
  await calcularColorFondo();
  initViewport();
  initToques();
  initMenu();
  render();
  if ('serviceWorker' in navigator && location.protocol !== 'file:') {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  }
}
boot();
