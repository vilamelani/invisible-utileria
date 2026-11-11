// Teclado simulado de iOS (estilo iOS 26), dibujado dentro de la app.
// Sirve para que en cámara no aparezca la barra ↑ ↓ ✓ que iOS agrega a los campos de texto de una web.
// El teclado escribe sobre un "campo falso" (un div con propiedad value) y le manda eventos 'input'
// con el mismo inputType que mandaría el teclado real, así el modo Completar funciona igual.

const LETRAS = [
  ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
  ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'ñ'],
  ['z', 'x', 'c', 'v', 'b', 'n', 'm']
];
const NUMEROS = [
  ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
  ['-', '/', ':', ';', '(', ')', '$', '&', '@', '"'],
  ['.', ',', '?', '!', "'"]
];
const SIMBOLOS = [
  ['[', ']', '{', '}', '#', '%', '^', '*', '+', '='],
  ['_', '\\', '|', '~', '<', '>', '€', '£', '¥', '•'],
  ['.', ',', '?', '!', "'"]
];
const ACENTOS = { a: 'á', e: 'é', i: 'í', o: 'ó', u: 'ú', n: 'ñ', A: 'Á', E: 'É', I: 'Í', O: 'Ó', U: 'Ú', N: 'Ñ' };

const SVG = {
  shift: '<svg width="24" height="22" viewBox="0 0 24 22" aria-hidden="true"><path d="M12 2.2L2.6 11.6h5.1v7.9h8.6v-7.9h5.1z" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/></svg>',
  shiftOn: '<svg width="24" height="22" viewBox="0 0 24 22" aria-hidden="true"><path d="M12 2.2L2.6 11.6h5.1v7.9h8.6v-7.9h5.1z" fill="currentColor" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/></svg>',
  shiftLock: '<svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 1.6L2.6 11h5.1v6.2h8.6V11h5.1z" fill="currentColor" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/><path d="M7.7 21.4h8.6" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"/></svg>',
  back: '<svg width="28" height="20" viewBox="0 0 28 20" aria-hidden="true"><path d="M9.2 1.5h14.6a2.7 2.7 0 0 1 2.7 2.7v11.6a2.7 2.7 0 0 1-2.7 2.7H9.2L1.6 10z" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/><path d="M13 6.2l7.6 7.6M20.6 6.2L13 13.8" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>',
  emoji: '<svg width="25" height="25" viewBox="0 0 25 25" aria-hidden="true"><circle cx="12.5" cy="12.5" r="10.6" fill="none" stroke="currentColor" stroke-width="1.7"/><circle cx="8.9" cy="9.8" r="1.5" fill="currentColor"/><circle cx="16.1" cy="9.8" r="1.5" fill="currentColor"/><path d="M6.8 13.8h11.4a5.7 5.7 0 0 1-11.4 0z" fill="currentColor"/></svg>',
  intro: '<svg width="28" height="20" viewBox="0 0 28 20" aria-hidden="true"><path d="M24.5 2v5.6a3.2 3.2 0 0 1-3.2 3.2H4M9.6 4.8L3.6 10.8l6 6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  globe: '<svg width="27" height="27" viewBox="0 0 27 27" aria-hidden="true"><circle cx="13.5" cy="13.5" r="11.6" fill="none" stroke="currentColor" stroke-width="1.7"/><ellipse cx="13.5" cy="13.5" rx="5.2" ry="11.6" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="M1.9 13.5h23.2M3.6 7.4h19.8M3.6 19.6h19.8M13.5 1.9v23.2" fill="none" stroke="currentColor" stroke-width="1.7"/></svg>',
  mic: '<svg width="20" height="29" viewBox="0 0 20 29" aria-hidden="true"><rect x="5.6" y="1.4" width="8.8" height="16.6" rx="4.4" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="M1.8 13.6a8.2 8.2 0 0 0 16.4 0M10 21.9v5M5.4 26.9h9.2" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>'
};

// ---------- Campo falso ----------
// Un div que se comporta como un textarea para el resto de la app: tiene .value, recibe eventos 'input'
// y muestra un cursor que titila cuando el teclado está escribiendo en él.
export function campoFalso(clase, placeholder) {
  const el = document.createElement('div');
  el.className = `${clase} campo-sim`;
  el.innerHTML = `<span class="cs-t"></span><i class="cs-caret"></i><span class="cs-ph"></span>`;
  const t = el.querySelector('.cs-t');
  const ph = el.querySelector('.cs-ph');
  ph.textContent = placeholder || '';
  let v = '';
  const pintar = () => {
    t.textContent = v;
    el.classList.toggle('vacio', !v);
    el.scrollTop = el.scrollHeight;
  };
  Object.defineProperty(el, 'value', { get: () => v, set: (x) => { v = String(x == null ? '' : x); pintar(); } });
  el.setSelectionRange = () => {};
  pintar();
  return el;
}

// ---------- Teclado ----------
let K = null; // { el, host, campo, opts, capa, shift, ... }

const h = (k) => k.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

function filasHTML() {
  const capa = K.capa;
  const may = K.shift > 0;
  const letra = (c) => (may ? c.toUpperCase() : c);
  const tecla = (c, extra = '') => `<div class="k${extra}" data-k="${h(c)}" data-c="${h(c)}">${h(c)}</div>`;
  if (capa === 'letras') {
    const shiftIco = K.shift === 2 ? SVG.shiftLock : K.shift === 1 ? SVG.shiftOn : SVG.shift;
    return `
      <div class="kr">${LETRAS[0].map((c) => tecla(letra(c))).join('')}</div>
      <div class="kr">${LETRAS[1].map((c) => tecla(letra(c))).join('')}</div>
      <div class="kr kr3"><div class="k esp shift${K.shift ? ' on' : ''}" data-k="shift" aria-label="Mayúsculas">${shiftIco}</div>
        <div class="kg">${LETRAS[2].map((c) => tecla(letra(c))).join('')}</div>
        <div class="k esp back" data-k="back" aria-label="Borrar">${SVG.back}</div></div>
      <div class="kr kr4"><div class="k esp t123" data-k="123">123</div><div class="k esp emo" data-k="emoji" aria-label="Emoji">${SVG.emoji}</div>
        <div class="k espacio" data-k=" "></div><div class="k esp intro" data-k="intro" aria-label="Intro">${SVG.intro}</div></div>`;
  }
  const L = capa === 'numeros' ? NUMEROS : SIMBOLOS;
  return `
    <div class="kr">${L[0].map((c) => tecla(c)).join('')}</div>
    <div class="kr">${L[1].map((c) => tecla(c)).join('')}</div>
    <div class="kr kr3"><div class="k esp shift sym" data-k="${capa === 'numeros' ? 'simbolos' : 'numeros'}">${capa === 'numeros' ? '#+=' : '123'}</div>
      <div class="kg ancho">${L[2].map((c) => tecla(c)).join('')}</div>
      <div class="k esp back" data-k="back" aria-label="Borrar">${SVG.back}</div></div>
    <div class="kr kr4"><div class="k esp t123" data-k="letras">ABC</div><div class="k esp emo" data-k="emoji" aria-label="Emoji">${SVG.emoji}</div>
      <div class="k espacio" data-k=" "></div><div class="k esp intro" data-k="intro" aria-label="Intro">${SVG.intro}</div></div>`;
}

function pintarTeclas() { K.el.querySelector('.kbs-keys').innerHTML = filasHTML(); }

function pintarSugerencias() {
  const box = K.el.querySelector('.kbs-pred');
  if (!box) return;
  let s = (K.opts.sugerencias ? K.opts.sugerencias() : []) || [];
  if (s.length === 1) s = [null, s[0], null]; // una sola sugerencia va al medio, como en iOS
  K.sug = s;
  box.innerHTML = [0, 1, 2].map((i) => {
    const it = s[i];
    const txt = it ? (typeof it === 'string' ? it : it.texto) : '';
    return `<div class="sg" data-sg="${i}">${h(txt)}</div>`;
  }).join('<i class="sg-sep"></i>');
}

// Mayúscula automática al empezar o después de punto.
function autoShift() {
  if (K.shift === 2 || K.capa !== 'letras') return;
  const v = K.campo ? K.campo.value : '';
  const nueva = !v || /[.!?¿¡]\s$/.test(v) || /\n$/.test(v);
  const antes = K.shift;
  K.shift = nueva ? 1 : 0;
  if (antes !== K.shift) pintarTeclas();
}

function emitir(inputType, data) {
  const c = K.campo;
  if (!c) return;
  let ev;
  try { ev = new InputEvent('input', { inputType, data, bubbles: true }); } catch (e) { ev = new Event('input', { bubbles: true }); }
  c.dispatchEvent(ev);
  pintarSugerencias();
  autoShift();
}
function escribir(ch) {
  if (!K.campo) return;
  K.campo.value = K.campo.value + ch;
  emitir('insertText', ch);
}
function borrar() {
  if (!K.campo) return;
  const v = K.campo.value;
  K.campo.value = v.slice(0, -1);
  emitir('deleteContentBackward', null);
}

function accion(k) {
  switch (k) {
    case 'shift': {
      const t = Date.now();
      if (K.shift === 1 && t - K.ultShift < 350) K.shift = 2;
      else K.shift = K.shift ? 0 : 1;
      K.ultShift = t;
      pintarTeclas();
      return;
    }
    case 'back': borrar(); return;
    case '123': case 'numeros': K.capa = 'numeros'; pintarTeclas(); return;
    case 'simbolos': K.capa = 'simbolos'; pintarTeclas(); return;
    case 'letras': K.capa = 'letras'; autoShift(); pintarTeclas(); return;
    case 'emoji': return; // sin emojis reales
    case 'intro': if (K.opts.alIntro) K.opts.alIntro(); else escribir('\n'); return;
    default: {
      escribir(k);
      if (K.capa === 'letras' && K.shift === 1 && k !== ' ') { K.shift = 0; pintarTeclas(); }
      // En iOS, después de un espacio en números/símbolos se vuelve a letras.
      if (K.capa !== 'letras' && k === ' ') { K.capa = 'letras'; autoShift(); pintarTeclas(); }
    }
  }
}

function initEventos() {
  const keys = K.el.querySelector('.kbs-keys');
  let down = null;
  const soltarVisual = () => { if (down && down.el) down.el.classList.remove('down', 'acento'); };
  keys.addEventListener('pointerdown', (e) => {
    const el = e.target.closest('.k');
    if (!el) return;
    e.preventDefault();
    soltarVisual();
    const k = el.dataset.k;
    down = { el, k, acento: null, rep: 0, repT: 0 };
    el.classList.add('down');
    if (k === 'back') {
      // Mantener apretado: borra seguido.
      borrar();
      down.repT = setTimeout(() => { down.rep = setInterval(borrar, 90); }, 480);
    } else if (ACENTOS[k]) {
      down.repT = setTimeout(() => {
        if (!down) return;
        down.acento = ACENTOS[k];
        el.dataset.c = down.acento;
        el.classList.add('acento');
      }, 420);
    }
  });
  const fin = (e) => {
    if (!down) return;
    clearTimeout(down.repT);
    clearInterval(down.rep);
    const d = down;
    soltarVisual();
    down = null;
    if (e.type === 'pointercancel' || d.k === 'back') return;
    if (d.acento) { d.el.dataset.c = d.k; escribir(d.acento); if (K.shift === 1) { K.shift = 0; pintarTeclas(); } return; }
    accion(d.k);
  };
  keys.addEventListener('pointerup', fin);
  keys.addEventListener('pointercancel', fin);
  keys.addEventListener('pointerleave', (e) => { if (down && e.target === keys) fin({ type: 'pointercancel' }); });

  const pred = K.el.querySelector('.kbs-pred');
  if (pred) {
    pred.addEventListener('pointerdown', (e) => { const s = e.target.closest('[data-sg]'); if (s && s.textContent) s.classList.add('down'); e.preventDefault(); });
    pred.addEventListener('pointerup', (e) => {
      pred.querySelectorAll('.down').forEach((x) => x.classList.remove('down'));
      const s = e.target.closest('[data-sg]');
      if (!s) return;
      const it = K.sug && K.sug[+s.dataset.sg];
      if (it && K.opts.alSugerir) { K.opts.alSugerir(it); pintarSugerencias(); autoShift(); }
    });
  }
  // El pie (globo y micrófono) no hace nada, pero no tiene que dejar pasar el toque.
  K.el.addEventListener('pointerdown', (e) => { if (!e.target.closest('.kbs-keys')) e.preventDefault(); });
}

// opts: { predictivo, sugerencias(): [texto | {texto,...}], alSugerir(item), alIntro(), alMover() }
export function abrirTeclado(host, campo, opts = {}) {
  if (K && K.host !== host) resetTeclado();
  if (K && K.host === host) {
    // Ya abierto: solo cambia el campo.
    setCampo(campo, opts);
    return;
  }
  const el = document.createElement('div');
  el.className = 'kbs';
  el.innerHTML = `${opts.predictivo ? '<div class="kbs-pred"></div>' : '<div class="kbs-pad"></div>'}<div class="kbs-keys"></div>
    <div class="kbs-foot"><span>${SVG.globe}</span><span>${SVG.mic}</span></div>`;
  host.appendChild(el);
  K = { el, host, campo: null, opts, capa: 'letras', shift: 0, ultShift: 0, sug: [] };
  pintarTeclas();
  initEventos();
  setCampo(campo, opts);
  const alto = el.getBoundingClientRect().height;
  host.style.setProperty('--kbs-h', alto + 'px');
  // Doble rAF para que la animación de entrada arranque desde abajo.
  requestAnimationFrame(() => requestAnimationFrame(() => {
    if (!K || K.el !== el) return;
    el.classList.add('open');
    host.classList.add('kbs-on');
    if (opts.alMover) { opts.alMover(); setTimeout(opts.alMover, 330); }
  }));
}

export function setCampo(campo, opts) {
  if (!K) return;
  if (K.campo && K.campo !== campo) K.campo.classList.remove('activo');
  K.campo = campo;
  if (opts) K.opts = opts;
  if (campo) campo.classList.add('activo');
  K.shift = 0;
  autoShift();
  pintarTeclas();
  pintarSugerencias();
}

export function refrescarTeclado() { if (K) { pintarSugerencias(); autoShift(); } }

export function cerrarTeclado() {
  if (!K) return;
  const { el, host, campo, opts } = K;
  K = null;
  if (campo) campo.classList.remove('activo');
  el.classList.remove('open');
  host.classList.remove('kbs-on');
  if (opts.alMover) { opts.alMover(); setTimeout(opts.alMover, 330); }
  setTimeout(() => el.remove(), 320);
}

// Sin animación (al cambiar de pantalla).
export function resetTeclado() {
  if (!K) return;
  K.el.remove();
  K.host.classList.remove('kbs-on');
  if (K.campo) K.campo.classList.remove('activo');
  K = null;
}

export const tecladoAbierto = () => !!K;
