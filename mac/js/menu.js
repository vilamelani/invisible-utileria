// Menú oculto de la Mac para el equipo técnico.
// Se abre manteniendo apretado 0,7 s el círculo de arriba a la izquierda, o con Ctrl+Opción+M.
import {
  S, A, C, save, saveAjustes, setContenido, borrarContenidoEditado, PLANOS, cargarPlano, siguiente, deshacer,
  reiniciarTodo, pausarMusica, setPosMusica, llegarMail, abrirCorreo, abrirVideo, estadoTexto, reposicionarVentanas,
  pintarMenuBar, pintarFondo, pintarVentanas, pintarTodo
} from './mac.js';
import { M, MEDIOS, guardarMedio, borrarMedio, esVideo } from './media.js';
import { pedirCamara, pararCamara, pintarEsc3 } from './esc3.js';

const layer = () => document.getElementById('menu-layer');
const esc = (t) => String(t ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

export const menuAbierto = () => layer().classList.contains('open');
export function initMenu() {
  layer().addEventListener('click', onClick);
  layer().addEventListener('change', onChange);
  layer().addEventListener('input', (e) => { if (e.target.dataset.num) aplicarNumero(e.target); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && menuAbierto()) cerrar(); });
}
export function abrirMenu() { pintar(); layer().classList.add('open'); }
function cerrar() { layer().classList.remove('open'); layer().innerHTML = ''; }
export function refrescarMenu() {
  if (!menuAbierto()) return;
  const st = layer().querySelector('[data-state]');
  if (st) st.textContent = estadoTexto();
}

let toastT = 0;
function toast(msg, tipo = 'ok') {
  let el = layer().querySelector('.menu-toast');
  if (!el) { el = document.createElement('div'); el.className = 'menu-toast'; layer().appendChild(el); }
  el.textContent = (tipo === 'ok' ? '✓ ' : '') + msg;
  el.classList.toggle('err', tipo === 'err');
  el.classList.remove('in');
  void el.offsetWidth;
  el.classList.add('in');
  clearTimeout(toastT);
  toastT = setTimeout(() => el.classList.remove('in'), 1800);
}
function pintar() {
  const m = layer().querySelector('.menu');
  const y = m ? m.scrollTop : 0;
  layer().innerHTML = html();
  const m2 = layer().querySelector('.menu');
  if (m2) m2.scrollTop = y;
}
function confirmar(btn, texto) {
  if (btn.classList.contains('armado')) return true;
  const orig = btn.textContent;
  btn.classList.add('armado');
  btn.textContent = texto;
  setTimeout(() => { btn.classList.remove('armado'); btn.textContent = orig; }, 2500);
  return false;
}

const b = (act, t, cls = '') => `<button class="btn ${cls}" data-act="${act}">${t}</button>`;
function html() {
  const mu = C.musica;
  const ml = C.mail;
  const medios = MEDIOS.map((x) => {
    const s = M[x.key];
    const th = s ? (esVideo(x.key) ? `<video src="${s}" muted></video>` : `<img src="${s}" alt="">`) : 'vacío';
    return `<div class="media"><div class="thumb">${th}</div><div class="l">${esc(x.label)}</div>
      <label class="btn file">Cargar<input type="file" accept="${x.accept}" data-file="${x.key}"></label>
      ${s ? `<button class="btn warn" data-del="${x.key}">Borrar</button>` : ''}</div>`;
  }).join('');
  return `<div class="menu" role="dialog" aria-label="Menú del equipo">
    <header><b>Invisible · Mac</b>${b('cerrar', 'Cerrar', 'go')}</header>
    <section>
      <h3>Estado</h3>
      <div class="state" data-state>${esc(estadoTexto())}</div>
      <div class="row">${b('siguiente', 'Siguiente evento', 'go')}${b('deshacer', 'Deshacer último')}${b('reiniciar', 'Reiniciar todo', 'warn')}</div>
      <p class="note">Sin abrir el menú: doble clic arriba a la derecha (sobre la hora) o Ctrl+Opción+→ = siguiente evento. Ctrl+Opción+← = deshacer.</p>
    </section>
    <section>
      <h3>Plano (deja la Mac exactamente como empieza ese plano)</h3>
      <div class="row">${PLANOS.map((p) => `<button class="btn ${S.plano === p.id ? 'on' : ''}" data-plano="${p.id}">${esc(p.t)}</button>`).join('')}</div>
    </section>
    <section>
      <h3>ESC 3 · Eco toma la Mac</h3>
      <div class="row">${b('esc3-cargar', 'Cargar ESC 3 (escritorio vacío)', 'go')}${b('siguiente', 'Siguiente línea')}</div>
      <div class="row"><label><input type="checkbox" data-chk="esc3Auto" ${A.esc3Auto ? 'checked' : ''}> Después del primer paso, los demás siguen solos</label>
        <label>pausa entre pasos (s) <input type="number" min="0" step="0.5" data-num="esc3Paso" value="${A.esc3Paso}"></label></div>
      <div class="row"><label>Arranca sola a los (s) de cargar la ESC 3 <input type="number" min="0" step="0.5" data-num="esc3Arranque" value="${A.esc3Arranque}"></label></div>
      <p class="note">0 = arranca con el toque invisible (doble clic sobre la hora o Ctrl+Opción+→). Paso 1: el cursor abre el navegador privado desde el Dock, escribe la dirección de Eco y abre la primera terminal. Pasos 2 y 3: nueva línea en Eco y otra terminal desde el Dock. Paso 4: un comando abre la cámara en vivo y aparece la última línea.</p>
      <div class="row">
        <button class="btn ${A.camFuente !== 'video' ? 'on' : ''}" data-cam="webcam">Cámara: webcam real</button>
        <button class="btn ${A.camFuente === 'video' ? 'on' : ''}" data-cam="video">Cámara: video de respaldo</button>
        ${b('cam-permiso', 'Pedir permiso de cámara ahora')}
      </div>
      <p class="note">Pedí el permiso antes de la toma, así el cartel de Safari no aparece en cámara. Para que no lo pida nunca más: Safari › Ajustes › Sitios web › Cámara › Permitir. El video de respaldo se carga en Fotos y videos.</p>
      <div class="row"><label><input type="checkbox" data-chk="cursorFalso" ${A.cursorFalso ? 'checked' : ''}> Cursor que se mueve solo (oculta el cursor real)</label></div>
    </section>
    <section>
      <h3>Música</h3>
      <div class="row">${b('mu-pausa', S.musica.sonando ? 'Pausar' : 'Reproducir')}${b('mu-cero', 'Volver al principio')}
        <label>Ir al segundo <input type="number" min="0" step="1" data-mupos value="${Math.round(mu.posInicial)}"></label>${b('mu-ir', 'Ir')}</div>
      <div class="row"><label>Canción <input type="text" data-txt="musica.cancion" value="${esc(mu.cancion)}"></label><label>Artista <input type="text" data-txt="musica.artista" value="${esc(mu.artista)}"></label></div>
      <div class="row"><label>Duración (s) <input type="number" min="10" step="1" data-cnum="musica.duracion" value="${mu.duracion}"></label><label>Arranca en (s) <input type="number" min="0" step="1" data-cnum="musica.posInicial" value="${mu.posInicial}"></label></div>
    </section>
    <section>
      <h3>Mail de Julián</h3>
      <div class="row">${b('mail', 'Hacer llegar el mail ahora', 'go')}${b('mail-abrir', 'Abrir el mail')}${b('video', 'Abrir el video')}</div>
      <div class="row"><label>Al cargar el plano 1.G/2, el mail llega solo a los (s) <input type="number" min="0" step="0.5" data-num="mailAuto" value="${A.mailAuto}"></label></div>
      <p class="note">0 = el mail solo llega con el toque invisible o el botón de arriba.</p>
      <div class="row"><label><input type="checkbox" data-chk="avisoFijo" ${A.avisoFijo ? 'checked' : ''}> El aviso queda en pantalla hasta que Martina lo toca</label>
        <label>Si no, se va a los (s) <input type="number" min="1" step="1" data-num="avisoSeg" value="${A.avisoSeg}"></label></div>
      <div class="row"><label>Remitente <input type="text" data-txt="mail.remitente" value="${esc(ml.remitente)}"></label><label>Asunto <input type="text" data-txt="mail.asunto" value="${esc(ml.asunto)}"></label></div>
      <div class="row"><label>Texto <input type="text" style="width:340px" data-txt="mail.cuerpo" value="${esc(ml.cuerpo)}"></label></div>
      <div class="row"><label>Adjunto <input type="text" data-txt="mail.adjunto" value="${esc(ml.adjunto)}"></label><label>Peso <input type="text" style="width:90px" data-txt="mail.peso" value="${esc(ml.peso)}"></label></div>
    </section>
    <section>
      <h3>Video adjunto</h3>
      <div class="row"><label>Tarda en cargar (s) <input type="number" min="0" step="0.5" data-num="cargaVideo" value="${A.cargaVideo}"></label>
        <label><input type="checkbox" data-chk="videoLoop" ${A.videoLoop ? 'checked' : ''}> Repetir en loop</label></div>
    </section>
    <section>
      <h3>Fotos y videos</h3>
      ${medios}
    </section>
    <section>
      <h3>Hora, fecha y batería (barra de menú)</h3>
      <div class="state">${A.horaFija ? `Hora de ficción desde ${esc(A.horaFija)}` : 'Usando la hora real de la Mac'}</div>
      <div class="row"><input type="time" data-hora value="${esc(A.horaFija || '02:10')}">${b('hora-fijar', 'Fijar hora de ficción')}${b('hora-real', 'Usar hora real')}</div>
      <div class="row"><label>Fecha en la barra <input type="text" style="width:120px" data-txt="fechaBarra" value="${esc(C.fechaBarra)}"></label><label>Fecha en el mail <input type="text" style="width:200px" data-txt="fechaLarga" value="${esc(C.fechaLarga)}"></label></div>
      <p class="note">Fecha en la barra vacía = fecha real.</p>
      <div class="row"><label>Batería (%) <input type="number" min="1" max="100" step="1" data-num="bateria" value="${A.bateria}"></label><label><input type="checkbox" data-chk="bateriaPct" ${A.bateriaPct ? 'checked' : ''}> Mostrar el número</label></div>
    </section>
    <section>
      <h3>Pantalla</h3>
      <div class="row">${b('fullscreen', 'Pantalla completa')}${b('posiciones', 'Ventanas a su lugar')}</div>
      <p class="note">Las ventanas se pueden mover arrastrando la barra de arriba. La posición queda guardada.</p>
    </section>
    <section>
      <h3>Textos (JSON)</h3>
      <textarea data-json spellcheck="false">${esc(JSON.stringify(C, null, 2))}</textarea>
      <div class="row">${b('json-guardar', 'Guardar textos', 'go')}${b('json-descartar', 'Volver a los textos originales', 'warn')}</div>
    </section>
  </div>`;
}

function setRuta(obj, ruta, val) {
  const p = ruta.split('.');
  let o = obj;
  for (let i = 0; i < p.length - 1; i++) o = o[p[i]];
  o[p[p.length - 1]] = val;
}
function aplicarNumero(inp) {
  const v = parseFloat(inp.value);
  if (Number.isNaN(v)) return;
  A[inp.dataset.num] = v;
  saveAjustes();
  if (inp.dataset.num.startsWith('bateria')) pintarMenuBar();
}

async function onClick(ev) {
  const t = ev.target.closest('[data-act],[data-plano],[data-del],[data-cam]');
  if (!t) return;
  if (t.dataset.cam) { A.camFuente = t.dataset.cam; saveAjustes(); pararCamara(); pintarEsc3(); pintar(); toast('Listo: ' + t.textContent.trim()); return; }
  if (t.dataset.plano) { cargarPlano(t.dataset.plano); pintar(); toast('Plano cargado: ' + t.dataset.plano); return; }
  if (t.dataset.del) { await borrarMedio(t.dataset.del); pintarTodo(); pintar(); toast('Borrado'); return; }
  switch (t.dataset.act) {
    case 'cerrar': cerrar(); break;
    case 'siguiente': siguiente(); refrescarMenu(); toast('Hecho'); break;
    case 'deshacer': { const ok = deshacer(); toast(ok ? 'Deshecho' : 'No hay nada para deshacer', ok ? 'ok' : 'err'); pintar(); break; }
    case 'reiniciar': if (confirmar(t, 'Tocá otra vez para reiniciar')) { reiniciarTodo(); pintar(); toast('Todo reiniciado'); } break;
    case 'mu-pausa': pausarMusica(S.musica.sonando); pintar(); toast('Listo'); break;
    case 'mu-cero': setPosMusica(0); toast('Música al principio'); break;
    case 'mu-ir': setPosMusica(+layer().querySelector('[data-mupos]').value || 0); toast('Listo'); break;
    case 'mail': llegarMail(); toast('Mail recibido'); break;
    case 'mail-abrir': abrirCorreo(true); toast('Mail abierto'); break;
    case 'video': abrirVideo(false); toast('Video abierto'); break;
    case 'esc3-cargar': cargarPlano('ESC 3'); pintar(); toast('ESC 3 cargada'); break;
    case 'cam-permiso': {
      const st = await pedirCamara();
      toast(st ? 'Cámara habilitada' : 'No se pudo acceder a la cámara', st ? 'ok' : 'err');
      break;
    }
    case 'hora-fijar': {
      const v = layer().querySelector('[data-hora]').value;
      if (v) { A.horaFija = v; A.horaFijaDesde = Date.now(); saveAjustes(); pintarMenuBar(); pintar(); toast('Hora fijada: ' + v); }
      break;
    }
    case 'hora-real': A.horaFija = ''; saveAjustes(); pintarMenuBar(); pintar(); toast('Usando hora real'); break;
    case 'fullscreen':
      cerrar();
      (document.documentElement.requestFullscreen || document.documentElement.webkitRequestFullscreen || (() => {})).call(document.documentElement);
      break;
    case 'posiciones': reposicionarVentanas(); toast('Ventanas en su lugar'); break;
    case 'json-guardar':
      try { setContenido(JSON.parse(layer().querySelector('[data-json]').value)); pintarTodo(); toast('Textos guardados'); } catch (e) { toast('El JSON tiene un error: ' + e.message, 'err'); }
      break;
    case 'json-descartar':
      if (confirmar(t, 'Tocá otra vez para descartar')) {
        borrarContenidoEditado();
        setContenido(await (await fetch('contenido/mac.json')).json(), false);
        pintarTodo(); pintar(); toast('Textos originales');
      }
      break;
    default: break;
  }
}

async function onChange(ev) {
  const t = ev.target;
  if (t.dataset.chk) { A[t.dataset.chk] = t.checked; saveAjustes(); pintarMenuBar(); if (t.dataset.chk === 'cursorFalso') pintarEsc3(); toast(t.checked ? 'Activado' : 'Desactivado'); return; }
  if (t.dataset.txt) { setRuta(C, t.dataset.txt, t.value); setContenido(C); pintarVentanas(); pintarMenuBar(); toast('Guardado'); return; }
  if (t.dataset.cnum) { setRuta(C, t.dataset.cnum, parseFloat(t.value) || 0); setContenido(C); pintarVentanas(); toast('Guardado'); return; }
  if (t.dataset.num) { aplicarNumero(t); toast('Guardado'); return; }
  if (t.dataset.file && t.files && t.files[0]) {
    try {
      await guardarMedio(t.dataset.file, t.files[0]);
      if (t.dataset.file === 'fondo') pintarFondo(); else pintarVentanas();
      pintar();
      toast('Cargado');
    } catch (e) { toast('No se pudo guardar: ' + e.message, 'err'); }
  }
}
