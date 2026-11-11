// Íconos propios (no son los de Apple ni los de ninguna marca real).
const PHONE = 'M21 15c1.5 0 2.6.9 3.1 2.2l2 5.6c.4 1.2 0 2.5-1 3.3l-2.6 2c1.9 4 5 7.2 9 9.1l2-2.6c.8-1 2.1-1.4 3.3-1l5.6 2c1.3.5 2.2 1.6 2.2 3.1v4.2c0 2-1.7 3.6-3.7 3.4C25 49.4 10.6 35 9.6 18.7 9.4 16.7 11 15 13 15z';
const BUBBLE = 'M30 14c-9.9 0-18 6.7-18 15 0 4.6 2.5 8.7 6.4 11.5L17 47l7.4-3.6c1.8.4 3.6.6 5.6.6 9.9 0 18-6.7 18-15s-8.1-15-18-15z';

export const APPS = {
  fotos: { bg: '#FFFFFF', svg: '<circle cx="39" cy="21" r="6" fill="#FFB020"/><path d="M8 46l14-17 9 10 6-6 15 13z" fill="#3E7BFA"/>' },
  camara: { bg: 'linear-gradient(180deg,#ECECF0 0%,#A8A8B0 100%)', svg: '<circle cx="30" cy="30" r="15" fill="#151517" stroke="#4A4A50" stroke-width="3"/><circle cx="30" cy="30" r="7" fill="#26324F"/><circle cx="27" cy="27" r="2.2" fill="#FFFFFF" fill-opacity="0.75"/>' },
  mapas: { bg: 'linear-gradient(180deg,#7FDC97 0%,#2EA85F 100%)', svg: '<path d="M-2 46C18 40 26 24 62 18" stroke="#FFFFFF" stroke-opacity="0.6" stroke-width="6" fill="none"/><path d="M30 12c-6.6 0-12 5.2-12 11.6C18 32 30 44 30 44s12-12 12-20.4C42 17.2 36.6 12 30 12z" fill="#FF4D4D"/><circle cx="30" cy="24" r="4.5" fill="#FFFFFF"/>' },
  reloj: { bg: '#111113', svg: '<circle cx="30" cy="30" r="21" fill="#FFFFFF"/><path d="M30 16v14l8 6" stroke="#111113" stroke-width="3" stroke-linecap="round" fill="none"/><circle cx="30" cy="30" r="2.4" fill="#FF9500"/>' },
  bristagram: { bg: 'linear-gradient(135deg,#3B5BFF 0%,#7B5CFF 50%,#19C3C0 100%)', svg: '<circle cx="30" cy="30" r="16" fill="none" stroke="#FFFFFF" stroke-width="3.2" stroke-dasharray="7 4.5" stroke-linecap="round"/><path d="M30 20.5l2.4 7.1 7.1 2.4-7.1 2.4-2.4 7.1-2.4-7.1-7.1-2.4 7.1-2.4z" fill="#FFFFFF"/>' },
  eco: { bg: 'linear-gradient(180deg,#7D62FF 0%,#5B3BE8 100%)', svg: '<circle cx="30" cy="30" r="4.5" fill="#FFFFFF"/><path d="M22.5 21.5a12 12 0 0 0 0 17M37.5 21.5a12 12 0 0 1 0 17M16.5 15.5a20 20 0 0 0 0 29M43.5 15.5a20 20 0 0 1 0 29" stroke="#FFFFFF" stroke-width="3.2" stroke-linecap="round" fill="none"/>' },
  correo: { bg: 'linear-gradient(180deg,#45A6FF 0%,#1366E8 100%)', svg: '<rect x="12" y="18" width="36" height="25" rx="4" fill="#FFFFFF"/><path d="M13.5 20.5L30 32l16.5-11.5" stroke="#2A7CF0" stroke-width="2.6" fill="none" stroke-linejoin="round"/>' },
  notas: { bg: 'linear-gradient(180deg,#FFE88E 0%,#FFC93C 100%)', svg: '<rect x="14" y="13" width="32" height="34" rx="4" fill="#FFFFFF"/><path d="M20 24h20M20 31h20M20 38h12" stroke="#E0B12A" stroke-width="2.6" stroke-linecap="round"/>' },
  telefono: { bg: 'linear-gradient(180deg,#6BE88A 0%,#22B24A 100%)', svg: `<g transform="translate(3 -2)"><path d="${PHONE}" fill="#FFFFFF"/></g>` },
  navegador: { bg: '#FFFFFF', svg: '<circle cx="30" cy="30" r="20" fill="#1A8CFF"/><path d="M39 21l-6.5 11.5L21 39l6.5-11.5z" fill="#FFFFFF"/><path d="M39 21l-6.5 11.5-5-5z" fill="#FF4D4D"/>' },
  talkgram: { bg: 'linear-gradient(180deg,#2BC3CF 0%,#0B8F9E 100%)', svg: `<path d="${BUBBLE}" fill="#FFFFFF"/><circle cx="23" cy="29" r="2.6" fill="#13A2B0"/><circle cx="30" cy="29" r="2.6" fill="#13A2B0"/><circle cx="37" cy="29" r="2.6" fill="#13A2B0"/>` },
  musica: { bg: 'linear-gradient(180deg,#FF7590 0%,#EE2A50 100%)', svg: '<path d="M25 41V20l19-4.5v21" stroke="#FFFFFF" stroke-width="3.6" fill="none" stroke-linejoin="round"/><circle cx="20" cy="41" r="5.5" fill="#FFFFFF"/><circle cx="39" cy="36.5" r="5.5" fill="#FFFFFF"/>' }
};

export function appIcon(key, size = 60) {
  const a = APPS[key];
  const r = Math.round(size * 0.2333);
  return `<span class="app-icon" style="width:${size}px;height:${size}px;border-radius:${r}px;background:${a.bg}"><svg viewBox="0 0 60 60" width="${size}" height="${size}" aria-hidden="true">${a.svg}</svg></span>`;
}

const s = (w, h, vb, body, extra = '') => `<svg width="${w}" height="${h}" viewBox="${vb}" aria-hidden="true" ${extra}>${body}</svg>`;

export const I = {
  chevronLeft: s(13, 21, '0 0 13 21', '<path d="M10.5 2L2.5 10.5l8 8.5" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>'),
  video: s(27, 18, '0 0 27 18', '<rect x="1" y="1.5" width="17" height="15" rx="3.5" fill="none" stroke="currentColor" stroke-width="1.9"/><path d="M18 7l7.5-4.5v13L18 11z" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linejoin="round"/>'),
  phone: s(22, 22, '0 0 60 60', `<g transform="translate(3 -2)"><path d="${PHONE}" fill="none" stroke="currentColor" stroke-width="4.6" stroke-linejoin="round"/></g>`),
  phoneFill: s(30, 30, '0 0 60 60', `<g transform="translate(3 -2)"><path d="${PHONE}" fill="currentColor"/></g>`),
  phoneDown: s(34, 34, '0 0 60 60', `<g transform="rotate(135 30 30) translate(3 -2)"><path d="${PHONE}" fill="currentColor"/></g>`),
  plus: s(22, 22, '0 0 22 22', '<path d="M11 3v16M3 11h16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>'),
  camera: s(25, 21, '0 0 25 21', '<path d="M2 6.5a2 2 0 0 1 2-2h3.2L9 2h7l1.8 2.5H21a2 2 0 0 1 2 2V17a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2z" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linejoin="round"/><circle cx="12.5" cy="11.5" r="4" fill="none" stroke="currentColor" stroke-width="1.9"/>'),
  mic: s(18, 24, '0 0 18 24', '<rect x="5" y="1.5" width="8" height="13" rx="4" fill="none" stroke="currentColor" stroke-width="1.9"/><path d="M1.5 11a7.5 7.5 0 0 0 15 0M9 18.5V22.5" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"/>'),
  micSmall: s(10, 13, '0 0 18 24', '<rect x="5" y="1.5" width="8" height="13" rx="4" fill="none" stroke="currentColor" stroke-width="2.6"/><path d="M1.5 11a7.5 7.5 0 0 0 15 0M9 18.5V22.5" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/>'),
  send: s(18, 18, '0 0 18 18', '<path d="M9 15V3M3.5 8.5L9 3l5.5 5.5" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>'),
  trash: s(20, 22, '0 0 20 22', '<path d="M2 5h16M7 5V3h6v2M4 5l1 14a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-14M8 9v8M12 9v8" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/>'),
  play: s(14, 16, '0 0 14 16', '<path d="M2 1.6v12.8c0 .7.8 1.2 1.4.8l10-6.4c.6-.4.6-1.2 0-1.6l-10-6.4C2.8.4 2 .9 2 1.6z" fill="currentColor"/>'),
  pause: s(14, 16, '0 0 14 16', '<rect x="2" y="1" width="3.6" height="14" rx="1.2" fill="currentColor"/><rect x="8.4" y="1" width="3.6" height="14" rx="1.2" fill="currentColor"/>'),
  ticks: (c) => s(17, 10, '0 0 17 10', `<path d="M1 5.5l3 3L10.5 1.5M7 8.5L15.5 1.5" fill="none" stroke="${c}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>`),
  tick: (c) => s(12, 10, '0 0 12 10', `<path d="M1 5.5l3 3L10.5 1.5" fill="none" stroke="${c}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>`),
  heart: s(26, 26, '0 0 24 24', '<path d="M12 20.3s-8-4.9-8-10.6A4.6 4.6 0 0 1 12 6.9a4.6 4.6 0 0 1 8 2.8c0 5.7-8 10.6-8 10.6z" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linejoin="round"/>'),
  share: s(26, 26, '0 0 24 24', '<path d="M21.5 2.5L2.5 9.8l7.6 3 3 7.7z M10.1 12.8L21.5 2.5" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linejoin="round"/>'),
  more: s(22, 22, '0 0 22 22', '<circle cx="4.5" cy="11" r="1.8" fill="currentColor"/><circle cx="11" cy="11" r="1.8" fill="currentColor"/><circle cx="17.5" cy="11" r="1.8" fill="currentColor"/>'),
  close: s(22, 22, '0 0 22 22', '<path d="M5 5l12 12M17 5L5 17" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>'),
  lock: s(18, 24, '0 0 18 24', '<rect x="1.5" y="10" width="15" height="12.5" rx="3" fill="currentColor"/><path d="M4.5 10V7a4.5 4.5 0 0 1 9 0v3" fill="none" stroke="currentColor" stroke-width="2.4"/>'),
  flashlight: s(18, 26, '0 0 18 26', '<path d="M3 2h12v4l-3 5v13H6V11L3 6z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><circle cx="9" cy="16" r="1.6" fill="currentColor"/>'),
  sidebar: s(22, 16, '0 0 22 16', '<path d="M2 3h18M2 13h11" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>'),
  compose: s(22, 22, '0 0 22 22', '<path d="M11.5 3H5.5a2.5 2.5 0 0 0-2.5 2.5v11A2.5 2.5 0 0 0 5.5 19h11a2.5 2.5 0 0 0 2.5-2.5v-6" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"/><path d="M16.8 2.6a1.9 1.9 0 0 1 2.7 2.7L11.3 13.5 8 14.3l.8-3.3z" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linejoin="round"/>'),
  chevronDown: s(12, 12, '0 0 12 12', '<path d="M3 4.5l3 3 3-3" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>'),
  voice: s(18, 16, '0 0 18 16', '<rect x="0.5" y="5" width="2.6" height="6" rx="1.3" fill="currentColor"/><rect x="5.2" y="1" width="2.6" height="14" rx="1.3" fill="currentColor"/><rect x="9.9" y="3.5" width="2.6" height="9" rx="1.3" fill="currentColor"/><rect x="14.6" y="6" width="2.6" height="4" rx="1.3" fill="currentColor"/>'),
  stop: s(14, 14, '0 0 14 14', '<rect x="1" y="1" width="12" height="12" rx="3" fill="currentColor"/>'),
  ecoMark: (c) => s(16, 16, '0 0 60 60', `<circle cx="30" cy="30" r="6" fill="${c}"/><path d="M20 20a14 14 0 0 0 0 20M40 20a14 14 0 0 1 0 20M12 12a25 25 0 0 0 0 36M48 12a25 25 0 0 1 0 36" stroke="${c}" stroke-width="5.5" stroke-linecap="round" fill="none"/>`),
  moon: s(20, 20, '0 0 20 20', '<path d="M13 2.5a7.5 7.5 0 1 0 4.5 12A6 6 0 0 1 13 2.5z" fill="currentColor"/>'),
  locArrow: s(10, 10, '0 0 10 10', '<path d="M9.5.5L.8 4.2l3.9.9.9 3.9z" fill="currentColor"/>'),
  search: s(13, 13, '0 0 13 13', '<circle cx="5.5" cy="5.5" r="4" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M8.6 8.6L12 12" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>'),
  copy: s(18, 18, '0 0 20 20', '<rect x="7" y="7" width="10" height="10" rx="2" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M13 4H5a2 2 0 0 0-2 2v7" fill="none" stroke="currentColor" stroke-width="1.8"/>'),
  speaker: s(18, 18, '0 0 20 20', '<path d="M3 8v4h3l4 3V5L6 8z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M13.5 7.5a3.5 3.5 0 0 1 0 5M15.5 5a7 7 0 0 1 0 10" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>')
};

I.alarm = s(22, 22, '0 0 22 22', '<circle cx="11" cy="12" r="7.5" fill="none" stroke="currentColor" stroke-width="1.9"/><path d="M11 8v4l2.5 2M3 4.5L6 2M19 4.5L16 2" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/>');
I.bubble = s(22, 22, '0 0 60 60', `<path d="${BUBBLE}" fill="currentColor"/>`);

// Cambia el tamaño de un ícono ya armado
export const sized = (svg, n) => svg.replace(/width="[\d.]+" height="[\d.]+"/, `width="${n}" height="${n}"`);

// Colita de burbuja (estilo "primera burbuja del grupo")
export function tail(lado, color) {
  return lado === 'in'
    ? `<svg class="tail tail-in" width="9" height="14" viewBox="0 0 9 14" aria-hidden="true"><path d="M9 0H2.2C.6 0-.3 1.9.7 3.1L9 14z" fill="${color}"/></svg>`
    : `<svg class="tail tail-out" width="9" height="14" viewBox="0 0 9 14" aria-hidden="true"><path d="M0 0h6.8c1.6 0 2.5 1.9 1.5 3.1L0 14z" fill="${color}"/></svg>`;
}

// Forma de onda fija (pseudo-aleatoria) para burbujas de audio
export function waveBars(n, seed = 1) {
  const out = [];
  let x = seed * 9301 + 49297;
  for (let i = 0; i < n; i++) {
    x = (x * 9301 + 49297) % 233280;
    out.push(4 + Math.round((x / 233280) * 18));
  }
  return out;
}
