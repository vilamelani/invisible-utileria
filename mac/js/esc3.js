// ESC 3 · Eco toma la Mac (dirección 2: terminales que se abren solas).
//
// Coreografía (todo lo hace un cursor que se mueve solo):
//   Paso 1: clic en el Navegador del Dock → se abre una ventana privada → clic en la barra de direcciones →
//           escribe sola "eco.chat" → Enter → la página carga y aparece "Enviando a Martina" →
//           clic en Terminal del Dock → se abre la primera terminal y escribe comandos.
//   Pasos 2 y 3: aparece la línea siguiente en Eco → clic en Terminal del Dock → otra terminal.
//   Paso 4: clic dentro de la última terminal → escribe "camara --abrir --en-vivo" → se abre la cámara →
//           aparece "No sos invisible."
//
// Todo se calcula a partir del momento en que arrancó cada paso (S.esc3.t), así una recarga o cerrar
// y abrir la tapa deja la pantalla exactamente igual.
import { M } from './media.js';

let ctx = null; // { getS, getA, getC, save, stage, alCambiar }
export function initEsc3(c) { ctx = c; }

const esc = (t) => String(t ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const VEL = 30;        // letras por segundo al tipear un comando
const PAUSA_OUT = 0.38; // seg. entre líneas de salida
const ABRE = 0.36;     // seg. que dura la animación de una ventana que se abre
const ECO_MARK = (c, s) => `<svg width="${s}" height="${s}" viewBox="0 0 60 60" aria-hidden="true"><circle cx="30" cy="30" r="6" fill="${c}"/><path d="M20 20a14 14 0 0 0 0 20M40 20a14 14 0 0 1 0 20M12 12a25 25 0 0 0 0 36M48 12a25 25 0 0 1 0 36" stroke="${c}" stroke-width="5.5" stroke-linecap="round" fill="none"/></svg>`;
const TL = '<div class="tl"><button class="tl-r" aria-label="Cerrar"></button><button class="tl-y" aria-label="Minimizar"></button><button class="tl-g" aria-label="Pantalla completa"></button></div>';
const ALTO_TERM = 200;
const ALTO_CAM = 264;

const E = () => ctx.getC().esc3;
const S3 = () => ctx.getS().esc3;
export const esc3Activa = () => !!S3();
export function esc3Base() { return { t: [], inicio: Date.now() }; }

// ---------- Utilidades de tiempo y movimiento ----------
const clamp = (x) => (x < 0 ? 0 : x > 1 ? 1 : x);
const minJerk = (x) => { x = clamp(x); return x * x * x * (10 - 15 * x + 6 * x * x); };
const easeOut = (x) => 1 - Math.pow(1 - clamp(x), 3);
const azar = (i) => { const v = Math.sin(i * 12.9898 + 4.1) * 43758.5453; return v - Math.floor(v); };
// Duración de un movimiento de mouse según la distancia (ley de Fitts, valores de una persona rápida).
const durMov = (a, b) => 0.16 + 0.1 * Math.log2(1 + Math.hypot(b[0] - a[0], b[1] - a[1]) / 28);
function durScript(lineas) {
  return lineas.reduce((t, l) => t + (l.cmd !== undefined ? l.cmd.length / VEL + 0.25 : PAUSA_OUT), 0);
}
// Demoras de tecleo de la URL (irregulares, como una persona).
function demorasURL(txt) { return [...txt].map((_, i) => 0.065 + 0.1 * azar(i + 1) + (i === 3 ? 0.12 : 0)); }

// Posición de un ícono del Dock en coordenadas del escenario.
function posIcono(k) {
  const st = ctx.stage;
  const el = st.querySelector(`[data-dk="${k}"] .ic`);
  if (!el) return [st.offsetWidth / 2, st.offsetHeight - 40];
  const r = el.getBoundingClientRect();
  const sr = st.getBoundingClientRect();
  const f = sr.width / st.offsetWidth;
  // Sin contar el rebote del ícono, para que el cursor no salte con él.
  const m = /translateY\((-?[\d.]+)px\)/.exec(el.closest('[data-dk]').style.transform || '');
  return [(r.left - sr.left + r.width / 2) / f, (r.top - sr.top + r.height / 2) / f - (m ? parseFloat(m[1]) : 0)];
}

// ---------- Plan: todos los momentos de la coreografía ----------
function calcularPlan() {
  const s = S3();
  const e = E();
  const w = e.ventanas;
  const P = { movs: [], clics: [], rebotes: [], abre: {}, lineas: [], fin: [], url: null, terminalesDesde: {}, extraDesde: null };
  const icoNav = posIcono('navegador');
  const icoTerm = posIcono('terminal');
  let cur = e.cursor && e.cursor[0] ? e.cursor[0] : [720, 450];
  const mover = (t0, hacia) => {
    const d = durMov(cur, hacia);
    P.movs.push({ t0, t1: t0 + d, a: cur, b: hacia, sg: P.movs.length % 2 ? 1 : -1 });
    cur = hacia;
    return t0 + d;
  };
  const clic = (t) => { P.clics.push(t); };
  const pasos = e.pasos;
  for (let k = 0; k < s.t.length && k < pasos.length; k++) {
    const T = s.t[k];
    const abre = pasos[k].abre;
    if (k === 0) {
      // Navegador desde el Dock
      let t = mover(T + 0.25, [icoNav[0] + 2, icoNav[1] - 4]);
      clic(t + 0.06); P.rebotes.push({ k: 'navegador', t: t + 0.06 });
      P.abre.navegador = t + 0.16;
      // Clic en la barra de direcciones y tecleo de la URL
      const barra = [w.navegador.x + w.navegador.w / 2 - 40, w.navegador.y + 25];
      t = mover(P.abre.navegador + ABRE + 0.25, barra);
      clic(t + 0.05);
      const foco = t + 0.08;
      const dem = demorasURL(e.url);
      const t0 = foco + 0.3;
      let tt = t0;
      const tiempos = dem.map((d) => (tt += d));
      const enter = tt + 0.28;
      P.url = { foco, tiempos, enter };
      P.lineas[0] = enter + 1.5;
      // Primera terminal
      t = mover(P.lineas[0] + 0.7, [icoTerm[0] + 1, icoTerm[1] - 3]);
      clic(t + 0.06); P.rebotes.push({ k: 'terminal', t: t + 0.06 });
      P.abre[abre] = t + 0.14;
    } else if (abre !== 'cam') {
      P.lineas[k] = T + 0.2;
      const t = mover(T + 0.85, [icoTerm[0] - 2 + 4 * azar(k), icoTerm[1] - 3]);
      clic(t + 0.06); P.rebotes.push({ k: 'terminal', t: t + 0.06 });
      P.abre[abre] = t + 0.14;
    } else {
      // Última: clic dentro de la terminal anterior y comando de la cámara
      const prev = pasos[k - 1] && pasos[k - 1].abre;
      const wt = w[prev] || w.t1;
      const t = mover(T + 0.2, [wt.x + wt.w * 0.6, wt.y + 120]);
      clic(t + 0.05);
      P.extraDesde = { term: prev, t: t + 0.35 };
      const durCmd = durScript(e.camComando || []);
      P.abre.cam = P.extraDesde.t + durCmd + 0.15;
      P.lineas[k] = P.abre.cam + 1.0;
      // El cursor se corre de encima de la cámara
      mover(P.abre.cam + 0.9, [wt.x + wt.w * 0.35, wt.y + 150]);
    }
    if (abre && abre !== 'cam') {
      P.terminalesDesde[abre] = P.abre[abre] + ABRE + 0.15;
      P.fin[k] = P.terminalesDesde[abre] + durScript(e.terminales[abre].lineas);
    } else {
      P.fin[k] = (P.lineas[k] || T) + 1;
    }
  }
  P.cursorReposo = cur;
  return P;
}

// ---------- Avance de pasos ----------
function pasoActual() { const s = S3(); const ahora = Date.now() / 1000; return s ? s.t.filter((t) => t <= ahora).length - 1 : -1; }
export function esc3Siguiente() {
  const s = S3();
  if (!s) return false;
  if (s.t.length >= E().pasos.length) return false;
  const ahora = Date.now() / 1000;
  // Si el paso anterior todavía se está animando, el siguiente arranca cuando termine.
  let inicio = ahora;
  if (s.t.length) { const P = calcularPlan(); inicio = Math.max(ahora, P.fin[s.t.length - 1] || ahora); }
  s.t.push(inicio);
  ctx.save();
  pintarEsc3();
  return true;
}
export function esc3Texto() {
  const p = pasoActual();
  const n = E().pasos.length;
  const A = ctx.getA();
  if (p < 0) return 'ESC 3: escritorio vacío. Siguiente: el cursor abre el navegador privado y escribe la dirección de Eco.' + (A.esc3Arranque > 0 ? ` (arranca sola a los ${A.esc3Arranque} s)` : '');
  if (p >= n - 1) return 'ESC 3: secuencia completa, cámara en vivo.';
  return `ESC 3: paso ${p + 1} de ${n}. Siguiente: "${E().pasos[p + 1].linea}".` + (A.esc3Auto ? ' (sigue sola)' : '');
}
function avanceAuto(P) {
  const s = S3();
  const A = ctx.getA();
  const n = E().pasos.length;
  const ahora = Date.now() / 1000;
  if (s.t.length === 0) {
    if (A.esc3Arranque > 0 && ahora * 1000 - s.inicio >= A.esc3Arranque * 1000) esc3Siguiente();
    return;
  }
  const k = s.t.length - 1;
  if (A.esc3Auto && s.t.length < n && ahora >= (P.fin[k] || 0) + A.esc3Paso) esc3Siguiente();
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
    stage.querySelectorAll('[data-dk]').forEach((d) => { d.style.transform = ''; });
    cancelAnimationFrame(raf);
    raf = 0;
    return;
  }
  // Compatibilidad con la versión anterior, que guardaba milisegundos
  const s = S3();
  if (s.t.some((t) => t > 1e11)) s.t = s.t.map((t) => (t > 1e11 ? t / 1000 : t));
  const e = E();
  if (!capa) {
    capa = document.createElement('div');
    capa.className = 'esc3';
    stage.insertBefore(capa, stage.querySelector('[data-aviso]'));
  }
  const w = e.ventanas;
  const pos = (k) => `left:${w[k].x}px;top:${w[k].y}px;width:${w[k].w}px`;
  capa.innerHTML = `
    <div class="e3-win e3-nav" style="${pos('navegador')};height:${w.navegador.h}px" data-e3="navegador">
      <div class="e3-chrome">${TL}<div class="e3-url" data-e3url><span class="e3-priv">Privada</span>
        <span class="e3-dom"><span class="e3-ph" data-e3ph>Buscar o ingresar sitio web</span><span data-e3urltxt></span><i class="e3-ucar" data-e3ucar></i></span></div></div>
      <div class="e3-prog"><div data-e3prog></div></div>
      <div class="e3-nueva" data-e3nueva>
        <svg width="54" height="40" viewBox="0 0 54 40" aria-hidden="true"><path d="M3 20S12 4 27 4s24 16 24 16-9 16-24 16S3 20 3 20z" fill="none" stroke="#8E8E93" stroke-width="2.4"/><path d="M6 36L48 4" stroke="#8E8E93" stroke-width="2.4" stroke-linecap="round"/></svg>
        <b>Navegación privada activada</b><span>Las páginas que visites no se guardan en el historial.</span>
      </div>
      <div class="e3-page" data-e3page>
        <div class="e3-mark">${ECO_MARK('#6D4AFF', 34)}</div>
        <div class="e3-spin" data-e3spin>${'<i></i>'.repeat(12)}</div>
        ${e.pasos.map((p, i) => `<div class="e3-ln" data-e3ln="${i}">${esc(p.linea)}</div>`).join('')}
      </div>
    </div>
    ${Object.entries(e.terminales).map(([k, t]) => `
      <div class="e3-win e3-term" style="${pos(k)}" data-e3="${k}">
        <div class="e3-tbar">${TL}<span>${esc(t.titulo)}</span></div>
        <div class="e3-tbody" data-e3body="${k}"></div>
      </div>`).join('')}
    <div class="e3-win e3-term e3-cam" style="${pos('cam')}" data-e3="cam">
      <div class="e3-tbar">${TL}<span>${esc(e.camTitulo)}</span></div>
      <div class="e3-cbody"><video data-e3cam muted playsinline autoplay></video><div class="e3-csin" data-e3csin>Sin imagen: elegí la fuente de la cámara en el menú</div>
        <span class="e3-rec"><i></i><span data-e3rec>REC 00:00:00</span></span></div>
    </div>
    <svg class="e3-cursor" data-e3cursor width="22" height="30" viewBox="0 0 22 30" aria-hidden="true"><path d="M2 2v22l6-5.5 4.2 9 3.6-1.7-4.1-8.8H20z" fill="#000" stroke="#fff" stroke-width="1.6" stroke-linejoin="round"/></svg>`;
  document.body.classList.toggle('sin-cursor', !!ctx.getA().cursorFalso);
  ultimoFrente = null;
  frame();
  if (!raf) loop();
}
function loop() { raf = requestAnimationFrame(() => { raf = 0; if (!S3() || !capa) return; frame(); loop(); }); }

// Texto de una terminal a los "seg" segundos de empezar a escribir. Devuelve [html, terminó].
function textoLineas(lineas, seg, conPrompt) {
  let t = seg;
  let html = '';
  for (const l of lineas) {
    if (l.cmd !== undefined) {
      const dur = l.cmd.length / VEL;
      const n = Math.max(0, Math.min(l.cmd.length, Math.floor(t * VEL)));
      html += `<p><span class="pr">eco@nube:~$</span> ${esc(l.cmd.slice(0, n))}`;
      if (t < dur + 0.25) return [html + '<i class="e3-car"></i></p>', false];
      html += '</p>';
      t -= dur + 0.25;
    } else {
      if (t < PAUSA_OUT) return [html, false];
      html += `<p class="${l.c || ''}">  ${esc(l.out)}</p>`;
      t -= PAUSA_OUT;
    }
  }
  return [html + (conPrompt ? '<p><span class="pr">eco@nube:~$</span> <i class="e3-car"></i></p>' : ''), true];
}

// Ventana que sale del ícono del Dock (o de otra ventana) con un leve rebote.
function animarApertura(el, k, tAbre, desde, ahora) {
  const w = E().ventanas[k];
  const h = k === 'navegador' ? w.h : k === 'cam' ? ALTO_CAM : ALTO_TERM;
  const x = clamp((ahora - tAbre) / ABRE);
  if (x >= 1) { el.style.transform = ''; el.style.opacity = ''; return; }
  const e = 1 - Math.pow(1 - x, 3) * Math.cos(x * 2.2); // ease-out con un pelín de rebote
  const dx = desde[0] - (w.x + w.w / 2);
  const dy = desde[1] - (w.y + h / 2);
  const sc = 0.06 + 0.94 * e;
  el.style.transform = `translate(${(dx * (1 - e)).toFixed(1)}px, ${(dy * (1 - e)).toFixed(1)}px) scale(${sc.toFixed(3)})`;
  el.style.opacity = String(clamp(x * 4));
}

let ultimoFrente = null;
function frame() {
  if (!capa) return;
  const s = S3();
  const e = E();
  const A = ctx.getA();
  const ahora = Date.now() / 1000;
  const P = calcularPlan();
  avanceAuto(P);
  const icoNav = posIcono('navegador');
  const icoTerm = posIcono('terminal');
  let frente = 'archivos';
  let zTop = 0;

  // --- Navegador ---
  const nav = capa.querySelector('[data-e3="navegador"]');
  const navAbierto = P.abre.navegador !== undefined && ahora >= P.abre.navegador;
  nav.classList.toggle('abierta', navAbierto);
  if (navAbierto) {
    frente = 'navegador';
    nav.style.zIndex = 5;
    animarApertura(nav, 'navegador', P.abre.navegador, icoNav, ahora);
    const u = P.url;
    const foco = ahora >= u.foco && ahora < u.enter;
    const n = u.tiempos.filter((t) => t <= ahora).length;
    const enviado = ahora >= u.enter;
    capa.querySelector('[data-e3url]').classList.toggle('foco', foco);
    capa.querySelector('[data-e3ph]').style.display = n === 0 && !enviado ? '' : 'none';
    capa.querySelector('[data-e3urltxt]').textContent = enviado ? e.url : e.url.slice(0, n);
    capa.querySelector('[data-e3ucar]').style.display = foco ? '' : 'none';
    capa.querySelector('[data-e3nueva]').style.display = ahora < u.enter + 0.45 ? '' : 'none';
    capa.querySelector('[data-e3page]').style.display = ahora >= u.enter + 0.45 ? '' : 'none';
    // Barra de carga
    let prog = 0;
    if (enviado) {
      const vistas = P.lineas.filter((t) => t !== undefined && t <= ahora).length;
      if (vistas === 0) prog = 0.08 + 0.22 * easeOut((ahora - u.enter) / 1.4);
      else prog = 0.3 + 0.67 * (vistas / e.pasos.length);
    }
    const pb = capa.querySelector('[data-e3prog]');
    pb.style.width = (prog * 100).toFixed(1) + '%';
    pb.parentNode.style.opacity = enviado ? '1' : '0';
    // Líneas de Eco
    let ultima = -1;
    e.pasos.forEach((p, i) => { if (P.lineas[i] !== undefined && ahora >= P.lineas[i]) ultima = i; });
    e.pasos.forEach((p, i) => {
      const el = capa.querySelector(`[data-e3ln="${i}"]`);
      el.classList.toggle('on', i <= ultima);
      el.classList.toggle('actual', i === ultima);
    });
    capa.querySelector('[data-e3spin]').style.display = ultima < 0 ? '' : 'none';
  }

  // --- Terminales ---
  Object.keys(e.terminales).forEach((k, idx) => {
    const win = capa.querySelector(`[data-e3="${k}"]`);
    const tA = P.abre[k];
    const abierta = tA !== undefined && ahora >= tA;
    win.classList.toggle('abierta', abierta);
    if (!abierta) return;
    win.style.zIndex = 10 + idx;
    if (10 + idx > zTop) { zTop = 10 + idx; frente = 'terminal'; }
    animarApertura(win, k, tA, icoTerm, ahora);
    const body = capa.querySelector(`[data-e3body="${k}"]`);
    let [html, termino] = textoLineas(e.terminales[k].lineas, ahora - P.terminalesDesde[k], false);
    if (P.extraDesde && P.extraDesde.term === k && ahora >= P.extraDesde.t) {
      const [h2, t2] = textoLineas(e.camComando || [], ahora - P.extraDesde.t, true);
      html += h2; termino = t2;
      win.style.zIndex = 30; zTop = 30;
    } else if (termino) {
      html += '<p><span class="pr">eco@nube:~$</span> <i class="e3-car"></i></p>';
    }
    if (body._html !== html) { body.innerHTML = html; body._html = html; body.scrollTop = body.scrollHeight; }
  });

  // --- Cámara ---
  const cam = capa.querySelector('[data-e3="cam"]');
  const camAbierta = P.abre.cam !== undefined && ahora >= P.abre.cam;
  cam.classList.toggle('abierta', camAbierta);
  if (camAbierta) {
    cam.style.zIndex = 40;
    frente = 'terminal';
    const wt = P.extraDesde ? e.ventanas[P.extraDesde.term] : null;
    animarApertura(cam, 'cam', P.abre.cam, wt ? [wt.x + wt.w / 2, wt.y + 100] : icoTerm, ahora);
    iniciarCamara();
    const r = Math.max(0, Math.floor(ahora - P.abre.cam));
    capa.querySelector('[data-e3rec]').textContent = `REC ${String(Math.floor(r / 3600)).padStart(2, '0')}:${String(Math.floor(r / 60) % 60).padStart(2, '0')}:${String(r % 60).padStart(2, '0')}`;
  }

  // --- Dock: rebote de los íconos y puntito de app abierta ---
  ['navegador', 'terminal'].forEach((k) => {
    const dk = ctx.stage.querySelector(`[data-dk="${k}"]`);
    if (!dk) return;
    let y = 0;
    P.rebotes.filter((r) => r.k === k).forEach((r) => {
      const t = ahora - r.t;
      if (t >= 0 && t < 0.9) y = Math.min(y, -22 * Math.abs(Math.sin(Math.PI * t / 0.45)) * (1 - t / 0.9));
    });
    dk.style.transform = y ? `translateY(${y.toFixed(1)}px)` : '';
    const dot = dk.querySelector('i');
    if (dot) dot.classList.toggle('on', k === 'navegador' ? navAbierto : P.abre.t1 !== undefined && ahora >= P.abre.t1);
  });

  if (frente !== ultimoFrente) { ultimoFrente = frente; ctx.alCambiar(frente); }

  // --- Cursor ---
  const cur = capa.querySelector('[data-e3cursor]');
  cur.style.display = A.cursorFalso ? '' : 'none';
  let pt = e.cursor && e.cursor[0] ? e.cursor[0] : [720, 450];
  for (const m of P.movs) {
    if (ahora < m.t0) break;
    const x = (ahora - m.t0) / (m.t1 - m.t0);
    if (x >= 1) { pt = m.b; continue; }
    const k = minJerk(x);
    const dx = m.b[0] - m.a[0];
    const dy = m.b[1] - m.a[1];
    const L = Math.hypot(dx, dy) || 1;
    const arco = Math.min(46, L * 0.07) * Math.sin(Math.PI * k) * m.sg; // trayectoria apenas curva
    pt = [m.a[0] + dx * k - (dy / L) * arco, m.a[1] + dy * k + (dx / L) * arco];
    break;
  }
  const enClic = P.clics.some((t) => ahora >= t && ahora < t + 0.13);
  cur.style.transform = `translate(${(pt[0] - 2).toFixed(1)}px, ${(pt[1] - 2).toFixed(1)}px) scale(${enClic ? 0.86 : 1})`;
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
