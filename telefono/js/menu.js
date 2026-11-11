// Menú oculto para el equipo técnico.
// Se abre manteniendo apretada 0,7 s la esquina superior izquierda.
import {
  S, A, getG, setGuion, borrarGuionEditado, go, render, save, saveAjustes, planos, cargarPlano,
  siguiente, deshacer, reiniciarTodo, reiniciarEco, ecoSiguiente, iniciarLlamada, estadoTexto, hhmm, ahora, LS_BARRA, calcularColorFondo
} from './app.js';
import { M, MEDIOS, guardarMedio, borrarMedio, esVideo } from './media.js';

const layer = () => document.getElementById('menu-layer');
const esc = (t) => String(t ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

export function initMenu() {
  layer().addEventListener('click', onClick);
  layer().addEventListener('change', onChange);
  layer().addEventListener('input', (e) => { if (e.target.dataset.num) aplicarNumero(e.target, false); });
}
export function abrirMenu() {
  pintar();
  layer().classList.add('open');
}
function cerrar() { layer().classList.remove('open'); layer().innerHTML = ''; }
export function refrescarMenu() {
  if (!layer().classList.contains('open')) return;
  const st = layer().querySelector('[data-state]');
  if (st) { const e = estadoTexto(); st.innerHTML = `Chat: ${esc(e.tg)}<br>Eco: ${esc(e.eco)}`; }
}

// Aviso breve dentro del menú (confirma que la acción se hizo).
let toastT = 0;
function toast(msg, tipo = 'ok') {
  let el = layer().querySelector('.menu-toast');
  if (!el) {
    el = document.createElement('div');
    el.className = 'menu-toast';
    layer().appendChild(el);
  }
  el.textContent = (tipo === 'ok' ? '✓ ' : '') + msg;
  el.classList.toggle('err', tipo === 'err');
  el.classList.remove('in');
  void el.offsetWidth;
  el.classList.add('in');
  clearTimeout(toastT);
  toastT = setTimeout(() => el.classList.remove('in'), 1800);
}
// Repinta el menú sin perder la posición del scroll.
function pintar() {
  const prev = layer().querySelector('.menu');
  const y = prev ? prev.scrollTop : 0;
  pintarMenu();
  const nuevo = layer().querySelector('.menu');
  if (nuevo) nuevo.scrollTop = y;
}
// Acciones que piden confirmación: el primer toque cambia el texto del botón, el segundo confirma.
function confirmar(btn, texto) {
  if (btn.dataset.armado === '1') return true;
  btn.dataset.armado = '1';
  btn.dataset.orig = btn.textContent;
  btn.textContent = texto;
  btn.classList.add('armado');
  setTimeout(() => {
    if (!btn.isConnected) return;
    btn.dataset.armado = '';
    btn.textContent = btn.dataset.orig;
    btn.classList.remove('armado');
  }, 3000);
  return false;
}
function pintarMenu() {
  const G = getG();
  const e = estadoTexto();
  const b = (act, lbl, cls = '') => `<button class="btn ${cls}" data-act="${act}">${lbl}</button>`;
  const pant = [['bloqueo', 'Bloqueo'], ['inicio', 'Inicio'], ['bristagram', 'Bristagram'], ['talkgram', 'TalkGram'], ['eco', 'Eco']];
  layer().innerHTML = `<div class="menu">
    <header><b>Utilería · Invisible</b>${b('cerrar', 'Cerrar', 'go')}</header>

    <section>
      <h3>Estado</h3>
      <div class="state" data-state>Chat: ${esc(e.tg)}<br>Eco: ${esc(e.eco)}</div>
      <p class="note">Toque invisible: doble toque en la esquina superior derecha = siguiente evento (en Eco avanza Eco).</p>
    </section>

    <section>
      <h3>Ir a pantalla</h3>
      <div class="row">${pant.map(([k, l]) => `<button class="btn ${S.screen === k ? 'on' : ''}" data-go="${k}">${l}</button>`).join('')}</div>
    </section>

    <section>
      <h3>Plano (deja el chat exactamente como empieza ese plano)</h3>
      <div class="row"><select data-plano style="flex:1;min-width:0">${planos().map((p) => `<option value="${p.i}" ${p.i === S.tg.pos ? 'selected' : ''}>${esc(p.plano)}</option>`).join('')}</select>${b('cargar-plano', 'Cargar', 'on')}</div>
      <p class="note">Al cargar un plano, el primer mensaje de Julián espera el toque invisible (para arrancar en "acción").</p>
      <div class="row">${b('siguiente', 'Siguiente evento', 'go')}${b('deshacer', 'Deshacer último')}${b('reiniciar', 'Reiniciar todo', 'warn')}</div>
    </section>

    <section>
      <h3>Chat TalkGram</h3>
      <div class="row">
        <button class="btn ${A.modo === 'completar' ? 'on' : ''}" data-set="modo" data-val="completar">Completar texto del guion</button>
        <button class="btn ${A.modo === 'libre' ? 'on' : ''}" data-set="modo" data-val="libre">Escritura libre</button>
      </div>
      <div class="row">
        <button class="btn ${A.teclado !== 'sistema' ? 'on' : ''}" data-set="teclado" data-val="simulado">Teclado simulado</button>
        <button class="btn ${A.teclado === 'sistema' ? 'on' : ''}" data-set="teclado" data-val="sistema">Teclado del sistema</button>
      </div>
      <div class="row"><label><input type="checkbox" data-chk="predictivo" ${A.predictivo ? 'checked' : ''}> Barra de sugerencias en el teclado simulado</label></div>
      <p class="note">El teclado simulado no muestra la barra ↑ ↓ ✓ de iOS. El del sistema tiene autocorrector y emojis reales.</p>
      <div class="row"><label><input type="checkbox" data-chk="auto" ${A.auto ? 'checked' : ''}> Respuestas de Julián con temporizador</label></div>
      <div class="row"><label><input type="checkbox" data-chk="tipeo" ${A.tipeo ? 'checked' : ''}> Mostrar "escribiendo…" antes de cada mensaje</label></div>
      <div class="row"><label>Respuesta a Martina (s) <input type="number" step="0.5" min="0" data-num="espera" value="${A.espera}"></label><label>Entre mensajes (s) <input type="number" step="0.5" min="0" data-num="esperaSeguido" value="${A.esperaSeguido}"></label></div>
      <div class="row"><label>Letras por tecla <input type="number" step="1" min="1" data-num="letras" value="${A.letras}"></label></div>
      <p class="note">Todo mensaje de Martina se puede escribir o mandar como audio, sin importar cómo figure en el guion. Esto define cómo aparecen los audios del guion cuando los fuerza el equipo (Siguiente evento) o al cargar un plano:</p>
      <div class="row">
        <button class="btn ${A.audiosComo === 'audio' ? 'on' : ''}" data-set="audiosComo" data-val="audio">Audios como audio</button>
        <button class="btn ${A.audiosComo === 'texto' ? 'on' : ''}" data-set="audiosComo" data-val="texto">Audios como texto</button>
      </div>
      <div class="row">${S.tg.agendado ? b('desagendar', 'Quitar contacto agendado') : b('agendar', 'Agendar contacto ahora')}${b('borrar-notifs', 'Borrar notificaciones del bloqueo')}</div>
    </section>

    <section>
      <h3>Pantalla de bloqueo</h3>
      <div class="row"><label><input type="checkbox" data-chk="bloqueoAuto" ${A.bloqueoAuto ? 'checked' : ''}> Las notificaciones entran solas</label></div>
      <div class="row"><label>Primera notificación a los (s) <input type="number" step="0.5" min="0" data-num="bloqueoEspera" value="${A.bloqueoEspera}"></label></div>
      <p class="note">Empieza a contar cuando se muestra el bloqueo. Para el plano 1.C/5: cargá ese plano y cerrá el menú; la cuenta arranca al cerrarlo.</p>
    </section>

    <section>
      <h3>Barra de estado (arriba de todo)</h3>
      <div class="row">
        <button class="btn ${barra() === 'default' ? 'on' : ''}" data-barra="default">Normal (recomendado)</button>
        <button class="btn ${barra() === 'black-translucent' ? 'on' : ''}" data-barra="black-translucent">Translúcida</button>
        <button class="btn ${barra() === 'auto' ? 'on' : ''}" data-barra="auto">Automático (prueba)</button>
      </div>
      <div class="row"><label>Espacio extra bajo la barra (px) <input type="number" step="2" min="0" data-num="extraTop" value="${A.extraTop}"></label></div>
      <p class="note">Solo con "Texto blanco": iOS desenfoca lo que queda debajo de la barra y un poco más abajo. Este espacio baja el contenido para que ningún texto quede desenfocado. 0 = pegado a la barra.</p>
      <p class="note">Normal: la barra toma el color de la parte de arriba de cada pantalla y iOS elige solo si el texto va blanco o negro. Translúcida: la app pasa por debajo de la barra; en iOS 26 achica la pantalla y desenfoca la parte de arriba (no recomendado). iOS guarda este ajuste al instalar: después de cambiarlo hay que borrar el ícono y volver a agregarlo desde Safari.</p>
    </section>

    <section>
      <h3>Eco</h3>
      <div class="row">${b('eco-sig', 'Siguiente (Eco)', 'go')}${b('eco-reset', 'Reiniciar Eco', 'warn')}</div>
      <div class="row"><label>Velocidad (palabras/s) <input type="number" step="0.5" min="1" data-num="ecoVelocidad" value="${A.ecoVelocidad}"></label></div>
    </section>

    <section>
      <h3>Llamada entrante</h3>
      <div class="row">${b('llamar', 'Disparar llamada de Julián', 'go')}</div>
      <div class="row"><label>Vuelve a sonar a los (s) <input type="number" step="1" min="0" data-num="reSonar" value="${A.reSonar}"></label><label>Veces <input type="number" step="1" min="0" data-num="reSonarVeces" value="${A.reSonarVeces}"></label></div>
    </section>

    <section>
      <h3>Fotos y videos</h3>
      ${MEDIOS.map((m) => `<div class="media"><span class="thumb">${M[m.key] ? (esVideo(m.key) ? `<video src="${M[m.key]}" muted playsinline></video>` : `<img src="${M[m.key]}" alt="">`) : 'vacío'}</span><span class="l">${esc(m.label)}</span>
        <span class="btn file">Cargar<input type="file" accept="${m.accept}" data-file="${m.key}"></span>${M[m.key] ? `<button class="btn warn" data-del="${m.key}">✕</button>` : ''}</div>`).join('')}
    </section>

    <section>
      <h3>Hora de ficción (pantalla de bloqueo y horarios del chat)</h3>
      <p class="note">La barra de estado de arriba es la real del iPhone: su hora se cambia en Ajustes › General › Fecha y hora (desactivar "Automático"). La batería no se puede simular.</p>
      <div class="row"><label><input type="time" data-hora value="${esc(A.horaFija || hhmm(new Date()))}"></label>${b('hora-fijar', 'Fijar y que corra', 'on')}${b('hora-real', 'Usar hora real')}</div>
      <div class="row"><label><input type="checkbox" data-chk="formato24" ${A.formato24 ? 'checked' : ''}> Formato 24 h con cero (03:12)</label></div>
      <p class="note">Ahora en la app: ${esc(hhmm(ahora()))}${A.horaFija ? ' (fija)' : ' (real)'}</p>
    </section>

    <section>
      <h3>Textos (JSON)</h3>
      <p class="note">Editá cualquier texto del guion, nombres, fecha del bloqueo, widgets. "Guardar" lo deja en este celular.</p>
      <textarea data-json spellcheck="false">${esc(JSON.stringify(G, null, 2))}</textarea>
      <div class="row">${b('json-guardar', 'Guardar textos', 'on')}${b('json-original', 'Volver al guion original', 'warn')}</div>
    </section>
    <section><p class="note">Recargar la app no pierde el estado: queda guardado en el celular.</p></section>
  </div>`;
}

function barra() {
  try { return localStorage.getItem(LS_BARRA) || 'default'; } catch (e) { return 'default'; }
}

async function onClick(ev) {
  const t = ev.target.closest('[data-act],[data-go],[data-set],[data-del],[data-barra]');
  if (!t) return;
  if (t.dataset.barra) {
    localStorage.setItem(LS_BARRA, t.dataset.barra);
    location.reload();
    return;
  }
  if (t.dataset.go) { cerrar(); go(t.dataset.go); return; }
  if (t.dataset.set) { A[t.dataset.set] = t.dataset.val; saveAjustes(); pintar(); toast('Listo: ' + t.textContent.trim()); return; }
  if (t.dataset.del) { await borrarMedio(t.dataset.del); if (t.dataset.del === 'fondo') await calcularColorFondo(); pintar(); toast('Foto borrada'); return; }
  const G = getG();
  switch (t.dataset.act) {
    case 'cerrar': cerrar(); if (S.screen !== 'bristagram') render(); break;
    case 'cargar-plano': cargarPlano(+layer().querySelector('[data-plano]').value); cerrar(); break;
    case 'siguiente': cerrar(); siguiente(); break;
    case 'deshacer': deshacer(); toast('Último mensaje deshecho'); break;
    case 'reiniciar': if (confirmar(t, 'Tocá otra vez para reiniciar')) { reiniciarTodo(); cerrar(); } break;
    case 'agendar': S.tg.agendado = true; S.tg.nombre = G.contacto.nombreAgendado; save(); pintar(); toast('Contacto agendado'); break;
    case 'desagendar': S.tg.agendado = false; S.tg.nombre = ''; save(); pintar(); toast('Contacto quitado'); break;
    case 'borrar-notifs': S.lockNotifs = []; save(); toast('Notificaciones borradas'); break;
    case 'eco-sig': cerrar(); if (S.screen !== 'eco') go('eco'); ecoSiguiente(); break;
    case 'eco-reset': reiniciarEco(); toast('Eco reiniciado'); break;
    case 'llamar': cerrar(); iniciarLlamada(true); break;
    case 'hora-fijar': {
      const v = layer().querySelector('[data-hora]').value;
      if (v) { A.horaFija = v; A.horaFijaDesde = Date.now(); saveAjustes(); pintar(); toast('Hora fijada: ' + v); }
      break;
    }
    case 'hora-real': A.horaFija = ''; saveAjustes(); pintar(); toast('Usando hora real'); break;
    case 'json-guardar': {
      try {
        const obj = JSON.parse(layer().querySelector('[data-json]').value);
        setGuion(obj, true);
        toast('Textos guardados');
      } catch (e) {
        toast('El JSON tiene un error: ' + e.message, 'err');
      }
      break;
    }
    case 'json-original': {
      if (!confirmar(t, 'Tocá otra vez para descartar')) break;
      borrarGuionEditado();
      const obj = await (await fetch('contenido/guion.json', { cache: 'reload' })).json();
      setGuion(obj, false);
      pintar();
      toast('Guion original restaurado');
      break;
    }
    default: break;
  }
  refrescarMenu();
}

async function onChange(ev) {
  const t = ev.target;
  if (t.dataset.file) {
    const f = t.files && t.files[0];
    if (f) { await guardarMedio(t.dataset.file, f); if (t.dataset.file === 'fondo') await calcularColorFondo(); pintar(); toast('Foto cargada'); }
    return;
  }
  if (t.dataset.chk) { A[t.dataset.chk] = t.checked; saveAjustes(); toast(t.checked ? 'Activado' : 'Desactivado'); return; }
  if (t.dataset.num) aplicarNumero(t, true);
}
// Los números se aplican mientras se escriben (sin esperar a salir del campo).
let numT = 0;
function aplicarNumero(t, avisar) {
  const v = parseFloat(t.value);
  if (Number.isNaN(v)) return;
  A[t.dataset.num] = v;
  saveAjustes();
  if (t.dataset.num === 'extraTop') document.documentElement.style.setProperty('--extra-top', (A.extraTop || 0) + 'px');
  clearTimeout(numT);
  if (avisar) toast('Guardado');
  else numT = setTimeout(() => toast('Guardado'), 700);
}
