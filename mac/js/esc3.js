// ESC 3 · Eco toma la Mac (dirección 2: terminales que se abren solas).
// La página de Eco (navegador en ventana privada) va mostrando las 4 líneas del guion y, con cada una,
// se abre sola una terminal que escribe comandos. Con la última línea se abre la cámara "en vivo".
// Todo se calcula a partir de los momentos en que arrancó cada paso (S.esc3.t), así una recarga
// o cerrar y abrir la tapa deja la pantalla exactamente igual.
import { M } from './media.js';

let ctx = null; // { getS, getA, getC, save, stage, alCambiar }
export function initEsc3(c) { ctx = c; }

const esc = (t) => String(t ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const VEL = 32;       // letras por segundo al tipear un comando
const PAUSA_OUT = 0.4; // seg. entre líneas de salida
const ECO_MARK = (c, s) => `<svg width="${s}" height="${s}" viewBox="0 0 60 60" aria-hidden="true"><circle cx="30" cy="30" r="6" fill="${c}"/><path d="M20 20a14 14 0 0 0 0 20M40 20a14 14 0 0 1 0 20M12 12a25 25 0 0 0 0 36M48 12a25 25 0 0 1 0 36" stroke="${c}" stroke-width="5.5" stroke-linecap="round" fill="none"/></svg>`;
const TL = '<div class="tl"><button class="tl-r" aria-label="Cerrar"></button><button class="tl-y" aria-label="Minimizar"></button><button class="tl-g" aria-label="Pantalla completa"></button></div>';

const E = () => ctx.getC().esc3;
const S3 = () => ctx.getS().esc3;
export const esc3Activa = () => !!S3();

// ---------- Estado ----------
export function esc3Base() { return { t: [], inicio: Date.now() }; }
function pasoActual() { const s = S3(); return s ? s.t.length - 1 : -1; } // -1 = página cargando, sin líneas
export function esc3Siguiente() {
  const s = S3();
  if (!s) return false;
  if (s.t.length >= E().pasos.length) return false;
  s.t.push(Date.now());
  ctx.save();
  pintarEsc3();
  return true;
}
export function esc3Texto() {
  const p = pasoActual();
  const n = E().pasos.length;
  const A = ctx.getA();
  if (p < 0) return `ESC 3: Eco cargando. Siguiente: aparece "${E().pasos[0].linea}".` + (A.esc3Arranque > 0 ? ` (arranca sola a los ${A.esc3Arranque} s)` : '');
  if (p >= n - 1) return 'ESC 3: secuencia completa, cámara en vivo.';
  return `ESC 3: paso ${p + 1} de ${n}. Siguiente: "${E().pasos[p + 1].linea}".` + (A.esc3Auto ? ` (en ${A.esc3Paso} s)` : '');
}

// Avance automático (temporizador entre pasos y arranque solo).
function avanceAuto() {
  const s = S3();
  if (!s) return;
  const A = ctx.getA();
  const n = E().pasos.length;
  const ahora = Date.now();
  if (s.t.length === 0) {
    if (A.esc3Arranque > 0 && ahora - s.inicio >= A.esc3Arranque * 1000) esc3Siguiente();
    return;
  }
  if (A.esc3Auto && s.t.length < n && ahora - s.t[s.t.length - 1] >= A.esc3Paso * 1000) esc3Siguiente();
}

// ---------- Armado ----------
let capa = null;
let raf = 0;
export function pintarEsc3() {
  const stage = ctx.stage;
  if (!S3()) {
    if (capa) { capa.remove(); capa = null; }
    pararCamara();
    document.body.classList.remove('sin-cursor');
    cancelAnimationFrame(raf);
    raf = 0;
    return;
  }
  const e = E();
  if (!capa) {
    capa = document.createElement('div');
    capa.className = 'esc3';
    stage.insertBefore(capa, stage.querySelector('[data-aviso]'));
  }
  const w = e.ventanas;
  const pos = (k) => `left:${w[k].x}px;top:${w[k].y}px;width:${w[k].w}px`;
  capa.innerHTML = `
    <div class="e3-nav" style="${pos('navegador')};height:${w.navegador.h}px" data-e3="navegador">
      <div class="e3-chrome">${TL}<div class="e3-url"><span class="e3-priv">Privada</span><span class="e3-dom">${esc(e.url)}</span></div></div>
      <div class="e3-prog"><div data-e3prog></div></div>
      <div class="e3-page">
        <div class="e3-mark">${ECO_MARK('#6D4AFF', 34)}</div>
        <div class="e3-spin" data-e3spin>${'<i></i>'.repeat(12)}</div>
        ${e.pasos.map((p, i) => `<div class="e3-ln" data-e3ln="${i}">${esc(p.linea)}</div>`).join('')}
      </div>
    </div>
    ${Object.entries(e.terminales).map(([k, t]) => `
      <div class="e3-term" style="${pos(k)}" data-e3="${k}">
        <div class="e3-tbar">${TL}<span>${esc(t.titulo)}</span></div>
        <div class="e3-tbody" data-e3body="${k}"></div>
      </div>`).join('')}
    <div class="e3-term e3-cam" style="${pos('cam')}" data-e3="cam">
      <div class="e3-tbar">${TL}<span>${esc(e.camTitulo)}</span></div>
      <div class="e3-cbody"><video data-e3cam muted playsinline autoplay></video><div class="e3-csin" data-e3csin>Sin imagen: elegí la fuente de la cámara en el menú</div>
        <span class="e3-rec"><i></i><span data-e3rec>REC 00:00:00</span></span></div>
    </div>
    <svg class="e3-cursor" data-e3cursor width="22" height="30" viewBox="0 0 22 30" aria-hidden="true"><path d="M2 2v22l6-5.5 4.2 9 3.6-1.7-4.1-8.8H20z" fill="#000" stroke="#fff" stroke-width="1.6" stroke-linejoin="round"/></svg>`;
  document.body.classList.toggle('sin-cursor', !!ctx.getA().cursorFalso);
  frame();
  if (!raf) loop();
}
function loop() { raf = requestAnimationFrame(() => { raf = 0; if (!S3()) return; avanceAuto(); frame(); loop(); }); }

// Texto de una terminal a los "seg" segundos de abierta.
function textoTerminal(lineas, seg) {
  let t = seg;
  let html = '';
  let cursorPuesto = false;
  for (const l of lineas) {
    if (l.cmd !== undefined) {
      const dur = l.cmd.length / VEL;
      const n = Math.max(0, Math.min(l.cmd.length, Math.floor(t * VEL)));
      html += `<p><span class="pr">eco@nube:~$</span> ${esc(l.cmd.slice(0, n))}`;
      if (t < dur + 0.25) { html += '<i class="e3-car"></i></p>'; cursorPuesto = true; break; }
      html += '</p>';
      t -= dur + 0.25;
    } else {
      if (t < PAUSA_OUT) { cursorPuesto = true; break; }
      html += `<p class="${l.c || ''}">  ${esc(l.out)}</p>`;
      t -= PAUSA_OUT;
    }
  }
  if (!cursorPuesto) html += '<p><span class="pr">eco@nube:~$</span> <i class="e3-car"></i></p>';
  return html;
}

const ease = (x) => (x < 0 ? 0 : x > 1 ? 1 : 1 - Math.pow(1 - x, 3));
let ultimoFrente = null;
function frame() {
  if (!capa) return;
  const s = S3();
  const e = E();
  const ahora = Date.now();
  const p = pasoActual();
  // Página de Eco: líneas y barra de carga
  e.pasos.forEach((paso, i) => {
    const el = capa.querySelector(`[data-e3ln="${i}"]`);
    const on = i <= p;
    el.classList.toggle('on', on);
    el.classList.toggle('actual', i === p);
  });
  capa.querySelector('[data-e3spin]').style.display = p < 0 ? '' : 'none';
  const prog = p < 0 ? 0.08 : 0.15 + 0.85 * ((p + 1) / e.pasos.length) * 0.97;
  capa.querySelector('[data-e3prog]').style.width = (prog * 100).toFixed(1) + '%';
  // Terminales y cámara: se abren con su paso
  let frente = 'navegador';
  let zTop = 0;
  e.pasos.forEach((paso, i) => {
    if (!paso.abre) return;
    const win = capa.querySelector(`[data-e3="${paso.abre}"]`);
    if (!win) return;
    const abierto = i <= p;
    win.classList.toggle('abierta', abierto);
    if (!abierto) return;
    win.style.zIndex = 10 + i;
    if (10 + i > zTop) { zTop = 10 + i; frente = paso.abre === 'cam' ? 'terminal' : 'terminal'; }
    const seg = (ahora - s.t[i]) / 1000;
    if (paso.abre === 'cam') {
      iniciarCamara();
      const r = Math.floor(seg);
      const rec = capa.querySelector('[data-e3rec]');
      rec.textContent = `REC ${String(Math.floor(r / 3600)).padStart(2, '0')}:${String(Math.floor(r / 60) % 60).padStart(2, '0')}:${String(r % 60).padStart(2, '0')}`;
    } else {
      const body = capa.querySelector(`[data-e3body="${paso.abre}"]`);
      const html = textoTerminal(e.terminales[paso.abre].lineas, seg);
      if (body._html !== html) { body.innerHTML = html; body._html = html; body.scrollTop = body.scrollHeight; }
    }
  });
  if (frente !== ultimoFrente) { ultimoFrente = frente; ctx.alCambiar(frente); }
  // Cursor falso: va hacia lo último que se abrió y queda con un leve movimiento
  const cur = capa.querySelector('[data-e3cursor]');
  cur.style.display = ctx.getA().cursorFalso ? '' : 'none';
  const pts = e.cursor;
  const desde = p < 0 ? pts[0] : pts[Math.max(0, p)];
  const hacia = p < 0 ? pts[0] : pts[Math.min(pts.length - 1, p + 1)];
  const k = p < 0 ? 0 : ease((ahora - s.t[p]) / 1600);
  const deriva = Math.sin(ahora / 900) * 3;
  const x = desde[0] + (hacia[0] - desde[0]) * k + deriva;
  const y = desde[1] + (hacia[1] - desde[1]) * k + Math.cos(ahora / 1100) * 2;
  cur.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)`;
}

// ---------- Cámara en vivo ----------
let stream = null;
let pidiendo = false;
function iniciarCamara() {
  const v = capa && capa.querySelector('[data-e3cam]');
  if (!v) return;
  const fuente = ctx.getA().camFuente;
  const sin = capa.querySelector('[data-e3csin]');
  if (fuente === 'video') {
    if (M.camara) {
      if (v.dataset.src !== 'video') { v.srcObject = null; v.src = M.camara; v.loop = true; v.dataset.src = 'video'; v.play().catch(() => {}); }
      sin.style.display = 'none';
    } else sin.style.display = '';
    return;
  }
  if (stream) {
    if (v.srcObject !== stream) { v.removeAttribute('src'); v.srcObject = stream; v.dataset.src = 'webcam'; v.play().catch(() => {}); }
    sin.style.display = 'none';
    return;
  }
  if (pidiendo) return;
  pidiendo = true;
  pedirCamara().then((st) => {
    pidiendo = false;
    if (!st) { sin.textContent = 'La cámara no está disponible (permiso negado o sin cámara). Se puede usar el video de respaldo.'; sin.style.display = ''; }
  });
}
export async function pedirCamara() {
  if (stream) return stream;
  try {
    stream = await navigator.mediaDevices.getUserMedia({ video: { width: { ideal: 1280 }, height: { ideal: 720 } }, audio: false });
    return stream;
  } catch (err) {
    console.warn('Cámara:', err);
    return null;
  }
}
export function pararCamara() {
  if (stream) { stream.getTracks().forEach((t) => t.stop()); stream = null; }
}
