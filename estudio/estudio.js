/* ============================================================================
   Estudio de marca · lógica
   Se componen las decisiones, se ven aplicadas de verdad (el iframe carga el
   CSS y los efectos del kit) y sale un encargo que otro Claude puede ejecutar.
   ============================================================================ */
'use strict';

/* ── Catálogo ─────────────────────────────────────────────────────────────
   Cada opción trae lo que necesita la previsualización Y lo que necesita el
   encargo. Si una pieza no sabe explicarse, no entra en el catálogo. */

/* ── Catálogo ─────────────────────────────────────────────────────────────
   NO se declara aquí: viene de `kit.manifest.json`, la fuente única del kit.
   Antes estos catálogos vivían en este fichero, y añadir una pieza obligaba a
   tocar nueve sitios; ahora son dos (fx.css y el manifiesto) y un verificador
   impide que se separen. Ver opspilot-kit/build/verificar.mjs. */

let DISPLAY = [], TEXTO = [], BASES = {}, FONDOS = {}, ESCENAS = {}, FOTOS = {},
    FORMAS = {}, HEADERS = {}, BOTONES = {}, TITULARES = {}, FOOTERS = {},
    MODULOS = {}, MOVIMIENTO = {}, PIEZAS = {}, POSICIONES = {}, TAMANOS = {},
    RELLENOS = {}, RECETAS = {}, EJES = [], REGLAS = [], SECCIONES = {}, COMPOSICION = [];

/* El registro de las webs ya hechas (opspilot-kit/marcas.json). Es lo que
   convierte la regla anti-clon de la skill en una comprobación: sin lista
   contra la que mirar, «no repitas la display» es una buena intención. */
let MARCAS = [];

/** Índice de piezas por grupo, tal y como las declara el manifiesto. */
function porGrupo(M, grupo) {
  const o = {};
  M.piezas.filter((p) => p.grupo === grupo).forEach((p) => {
    const v = { n: p.n };
    if (p.dice) v.dice = p.dice;
    if (p.nota) v.nota = p.nota;
    if (p.clase) v.clase = p.clase;
    if (p.vars) v.vars = p.vars;
    if (p.js) v.js = p.js;
    if (p.borde) v.borde = p.borde;
    if (p.css) v.css = p.css;
    if (p.miniVars) v.mini = p.miniVars;
    if (p.variantes) v.variantes = p.variantes;
    if (p.tono) v.tono = p.tono;
    if (p.admite) v.admite = p.admite;
    if (p.paleta) Object.assign(v, p.paleta, { hue: p.hue, oscuro: p.oscuro });
    o[p.id] = v;
  });
  return o;
}

/** Carga el manifiesto y rellena los catálogos. Sin él no hay estudio. */
async function cargaManifiesto() {
  const r = await fetch('../_astro/kit.manifest.json?v=378ead06', { cache: 'no-cache' });
  if (!r.ok) throw new Error(`no se pudo cargar el manifiesto (HTTP ${r.status})`);
  const M = await r.json();

  // Los dos grupos de tipografía son listas [id, etiqueta, descripción].
  DISPLAY = M.piezas.filter((p) => p.grupo === 'display').map((p) => [p.id, p.n, p.dice || '']);
  TEXTO = M.piezas.filter((p) => p.grupo === 'texto').map((p) => [p.id, p.n]);

  BASES = porGrupo(M, 'base');
  FONDOS = porGrupo(M, 'fondo');
  ESCENAS = porGrupo(M, 'escena');
  FOTOS = porGrupo(M, 'foto');
  FORMAS = porGrupo(M, 'forma');
  HEADERS = porGrupo(M, 'header');
  BOTONES = porGrupo(M, 'boton');
  TITULARES = porGrupo(M, 'titular');
  FOOTERS = porGrupo(M, 'footer');
  MODULOS = porGrupo(M, 'modulo');
  MOVIMIENTO = porGrupo(M, 'movimiento');
  PIEZAS = porGrupo(M, 'pieza');
  SECCIONES = porGrupo(M, 'seccion');
  COMPOSICION = M.composicionPorDefecto || [];

  POSICIONES = M.posiciones;
  TAMANOS = M.tamanos;
  RELLENOS = M.rellenos;
  RECETAS = M.recetas;
  EJES = M.ejes.map((e) => [e.id, e.n, e.min, e.max]);
  REGLAS = M.reglas || [];

  return M;
}

/**
 * Carga el registro de marcas. A diferencia del manifiesto, si falla NO se
 * para: sin registro el estudio sigue componiendo, solo pierde los avisos de
 * clon. Que falte la comprobación no puede impedir trabajar.
 */
async function cargaMarcas() {
  try {
    const r = await fetch('../_astro/marcas.json?v=2a2f860a', { cache: 'no-cache' });
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    MARCAS = (await r.json()).marcas || [];
  } catch (e) {
    console.warn('registro de marcas no disponible, sin avisos de clon:', e.message);
  }
}

/* Rutas relativas al `<base href="../">` del lienzo, que ya apunta a la raíz
   del repo. Llevaban `../img/…` y eso resolvía a la raíz del DOMINIO: las
   fotos daban 404 y el lienzo enseñaba iconos rotos desde el primer día.
   No se veía porque nadie miró el lienzo con la consola abierta; ahora hay
   una prueba que lo comprueba (build/probar-reglas.mjs). */
const FOTOS_DEMO = [
  'img/letras-corporeas-econatur-nave-industrial-800.webp',
  'img/letras-corporeas-iluminadas-restaurante-carmen-noche.webp',
  'img/rotulacion-integral-furgon-vredestein-800.webp',
  'img/fabricacion-monoposte-soldadura-taller.webp',
  'img/neon-colores-tubos.webp',
];

/* ── Estado ───────────────────────────────────────────────────────────────── */
const inicial = () => ({
  marca: 'Nombre del cliente', oficio: '',
  ejes: { peso: 3, temperatura: 3, memoria: 3, aire: 3 },
  display: 'Archivo', texto: 'Instrument Sans', ancho: false,
  acento: '#FEFE00', tinta: '#101316', base: 'papelFrio',
  fondo: 'ninguno', escena: 'ninguna', foto: 'limpia', forma: 'redondo',
  pieza: 'ninguna', pos: 'cd', tam: 'm', relleno: 'solido',
  header: 'barra', boton: 'pildora', titular: 'normal', footer: 'completo',
  modulos: ['disclosure', 'pull'], movimiento: ['reveal'],
  gesto: '',
  /* La ARQUITECTURA de la página, no solo su estilo. Antes el lienzo tenía tres
     secciones escritas a mano y se elegía cómo se veían pero no cuáles eran.
     Se rellena desde el manifiesto al arrancar. */
  secciones: [],
});
let S = inicial();

/* ── Utilidades ───────────────────────────────────────────────────────────── */
const $ = (s) => document.querySelector(s);
const esc = (t) => String(t).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

/** Mezcla dos colores en RGB. `t` es cuánto del primero queda. */
function mezcla(a, b, t) {
  const v = (h) => { const n = parseInt(h.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };
  const [x, y] = [v(a), v(b)];
  return '#' + x.map((c, i) => Math.round(c * t + y[i] * (1 - t)).toString(16).padStart(2, '0')).join('');
}

/** Aclara u oscurece un hex, para derivar el degradado de la cara. */
function ajusta(hex, f) {
  const n = parseInt(hex.slice(1), 16);
  const c = [(n >> 16) & 255, (n >> 8) & 255, n & 255]
    .map((v) => Math.max(0, Math.min(255, Math.round(v * f))));
  return '#' + c.map((v) => v.toString(16).padStart(2, '0')).join('');
}
const canales = (hex) => { const n = parseInt(hex.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };
const esHex = (v) => typeof v === 'string' && /^#[0-9a-f]{6}$/i.test(v);

/** Luminancia relativa (WCAG 2.1). */
function lum(hex) {
  const [r, g, b] = canales(hex).map((v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** Texto legible sobre un color: la regla 1 del suelo, automatizada. */
function sobre(hex) { return lum(hex) > 0.42 ? '#101114' : '#ffffff'; }

/** Contraste WCAG 2.1. 1 = son el mismo color, 21 = negro sobre blanco. */
function ratio(a, b) {
  const [x, y] = [lum(a), lum(b)];
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
}

/**
 * El color MÁS PARECIDO a `c` que sí pasa `meta` contra `fondo`.
 * Lo empuja hacia negro o hacia blanco y busca por bisección el punto justo:
 * así el aviso no dice «no llega», dice «con este sí».
 *
 * Se prueban LOS DOS extremos a propósito. Elegir la dirección por si el fondo
 * es claro u oscuro falla justo en los tonos medios: contra un gris #7A7A7A no
 * se llega a 4.5 por arriba y sí por abajo, y la versión que decidía sola daba
 * «imposible» teniendo salida. Gana el que quede más cerca del color original.
 *
 * Devuelve null cuando ningún extremo alcanza: ahí el que hay que mover es el
 * fondo, y el aviso lo dice.
 */
function corrige(c, fondo, meta) {
  let mejor = null, mejorT = -1;
  for (const extremo of ['#000000', '#ffffff']) {
    if (ratio(extremo, fondo) < meta) continue;
    let lo = 0, hi = 1;                     // t = cuánto del color original queda
    for (let i = 0; i < 24; i++) {
      const m = (lo + hi) / 2;
      if (ratio(mezcla(c, extremo, m), fondo) >= meta) lo = m; else hi = m;
    }
    if (lo > mejorT) { mejorT = lo; mejor = mezcla(c, extremo, lo); }
  }
  return mejor;
}

/**
 * sRGB → Oklab (Björn Ottosson). Hace falta para la regla anti-clon: en RGB
 * los dos amarillos que ya tenemos (#FEFE00 de Dígito y #F5D800 de ObraFácil)
 * distan lo suficiente como para no saltar ninguna alarma; en OKLCH están a
 * un puñado de grados de tono. Comparar en RGB es justo lo que dejó pasar el
 * choque que motivó todo esto.
 */
function oklab(hex) {
  const [r, g, b] = canales(hex).map((v) => {
    const s = v / 255;
    return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  return {
    L: 0.2104542553 * l + 0.7936177850 * m - 0.0040720468 * s,
    A: 1.9779984951 * l - 2.4285922050 * m + 0.4505937099 * s,
    B: 0.0259040371 * l + 0.7827717662 * m - 0.8086757660 * s,
  };
}
function oklch(hex) {
  const { L, A, B } = oklab(hex);
  return { L, C: Math.hypot(A, B), H: (Math.atan2(B, A) * 180 / Math.PI + 360) % 360 };
}
/** Distancia de tono por el lado corto del círculo. */
const dTono = (x, y) => { const d = Math.abs(x - y) % 360; return d > 180 ? 360 - d : d; };

/** «A, B y C» — para que el aviso nombre las webs en vez de contarlas. */
const lista = (xs) => xs.length < 2 ? (xs[0] || '')
  : xs.slice(0, -1).join(', ') + ' y ' + xs[xs.length - 1];

/* ── Construcción de los controles ────────────────────────────────────────── */
function chips(host, entradas, activo, onPick, multi = false) {
  const el = $(host);
  el.innerHTML = '';
  entradas.forEach(([id, label, titulo]) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = label;
    if (titulo) b.title = titulo;
    const on = multi ? activo.includes(id) : activo === id;
    if (on) b.classList.add('on');
    b.addEventListener('click', () => onPick(id));
    el.appendChild(b);
  });
}


/* ── Miniaturas ───────────────────────────────────────────────────────────
   Cada opción se dibuja a escala. Donde el efecto es CSS se usa la clase real
   del kit, así que la miniatura ES el efecto. Donde es de JavaScript (un
   canvas o un shader) se dibuja una aproximación y se marca con la etiqueta
   JS: prometer lo que no se enseña sería peor que no enseñar nada. */

/** Aproximaciones CSS de los fondos que en realidad se pintan con JavaScript. */
const APROX = {
  contour: `background:
      repeating-radial-gradient(circle at 30% 60%, transparent 0 5px, color-mix(in srgb,var(--color-ink) 22%,transparent) 5px 6px, transparent 6px 11px),
      repeating-radial-gradient(circle at 75% 25%, transparent 0 6px, color-mix(in srgb,var(--color-ink) 16%,transparent) 6px 7px, transparent 7px 13px)`,
  flowfield: `background:
      repeating-linear-gradient(72deg, transparent 0 3px, color-mix(in srgb,var(--color-ink) 16%,transparent) 3px 4px, transparent 4px 9px),
      repeating-linear-gradient(104deg, transparent 0 4px, color-mix(in srgb,var(--color-brand) 30%,transparent) 4px 5px, transparent 5px 12px)`,
  gridwarp: `background:
      repeating-linear-gradient(to right, color-mix(in srgb,var(--color-ink) 20%,transparent) 0 1px, transparent 1px 9px),
      repeating-linear-gradient(to bottom, color-mix(in srgb,var(--color-ink) 20%,transparent) 0 1px, transparent 1px 9px)`,
  mesh: `background:
      radial-gradient(60% 70% at 25% 30%, color-mix(in srgb,var(--color-brand) 55%,transparent), transparent 70%),
      radial-gradient(50% 60% at 80% 70%, color-mix(in srgb,var(--color-brand-soft) 80%,transparent), transparent 70%),
      var(--color-paper-alt)`,
  halftone: `background-image: radial-gradient(color-mix(in srgb,var(--color-ink) 55%,transparent) 1.4px, transparent 1.5px);
      background-size: 7px 7px`,
};

/* A 74 px una trama al 6 % no se ve. La miniatura usa valores más marcados
   —no los de producción— porque su trabajo es que se distinga una opción de
   otra, no enseñar la intensidad final. Esa se calibra en el lienzo. */
const VARS_MINI = {
  grid:    '--grid-size:8px;--grid-fade:100%',
  stripes: '--stripe-w:6px;--stripe-a:18%',
  hatch:   '--hatch-a:26%;--hatch-gap:4px',
  dots:    '--dot-gap:7px;--dot-a:38%;--dot-fade:100%',
  rays:    '--ray-a:34%;--ray-w:7deg;--ray-fade:100%',
  halo:    '--halo-a:65%;--halo-size:3rem',
  orbs:    '--orb-a:75%;--orb-blur:4px',
  sweep:   '',
};

function miniFondo(id) {
  if (id === 'ninguno') return '<span class="m-nada">SIN FONDO</span>';
  const f = FONDOS[id];
  if (f.js) return `<span style="${APROX[id] || ''}"></span>`;
  const fondo = id === 'rays' || id === 'halo' || id === 'sweep'
    ? '<span style="position:absolute;inset:0;background:var(--color-deep)"></span>' : '';
  return `${fondo}<span class="${f.clase}" style="${VARS_MINI[id] ?? f.vars ?? ''};position:absolute;inset:0"></span>`;
}

function miniEscena(id) {
  if (id === 'ninguna') return '<span class="m-nada">NINGUNA</span>';
  const e = ESCENAS[id];
  if (e.borde) return `<span style="background:var(--color-deep);border-bottom-left-radius:50% 60%;border-bottom-right-radius:50% 60%;inset:0 0 35% 0"></span>`;
  return `<span class="${e.clase}" style="${e.mini || e.vars || ''};position:absolute;inset:0"></span>`;
}

function miniPieza(id) {
  if (id === 'ninguna') return '<span class="m-nada">NINGUNA</span>';
  const p = PIEZAS[id];
  return `<span style="position:absolute;left:50%;top:50%;translate:-50% -50%;width:58%;aspect-ratio:1;
    background:var(--pc,var(--color-brand));--pc:var(--color-brand);--pw:5px;${p.css || ''}"></span>`;
}

function miniForma(id) {
  const c = FORMAS[id].clase;
  return `<span class="${c}" style="position:absolute;inset:14%;background:var(--color-metal);opacity:.75"></span>`;
}

function miniFoto(id) {
  const f = FOTOS[id];
  const base = `position:absolute;inset:12%;border-radius:4px;background:
    linear-gradient(140deg, var(--color-metal-hi) 0%, var(--color-metal) 55%, var(--color-metal-lo) 100%)`;
  if (id === 'ink') return `<span style="${base};background-image:radial-gradient(var(--color-brand) 1.3px,transparent 1.4px);background-size:5px 5px;background-color:var(--color-deep)"></span>`;
  if (id === 'tint') return `<span style="${base}"></span><span style="position:absolute;inset:12%;border-radius:4px;background:var(--color-brand);mix-blend-mode:soft-light;opacity:.6"></span>`;
  if (id === 'duotono') return `<span style="${base};filter:grayscale(1)"></span><span style="position:absolute;inset:12%;border-radius:4px;background:var(--color-brand);mix-blend-mode:color;opacity:.8"></span>`;
  if (id === 'bleed') return `<span style="${base};-webkit-mask-image:linear-gradient(to top,transparent,#000 60%);mask-image:linear-gradient(to top,transparent,#000 60%)"></span>`;
  if (id === 'soft') return `<span style="${base};-webkit-mask-image:radial-gradient(ellipse 70% 70% at center,#000 40%,transparent);mask-image:radial-gradient(ellipse 70% 70% at center,#000 40%,transparent)"></span>`;
  if (id === 'grano') return `<span style="${base}"></span><span class="fx-photo-grain" style="position:absolute;inset:12%;--pgrain-a:.5"></span>`;
  if (id === 'offset') return `<span style="position:absolute;inset:18% 12% 8% 18%;border-radius:4px;background:var(--color-brand)"></span><span style="${base};inset:10% 18% 16% 12%"></span>`;
  return `<span style="${base}"></span>`;
}

function miniHeader(id) {
  const logo = '<i class="m-bar" style="left:8%;top:38%;width:22%;height:16%"></i>';
  const nav = '<i class="m-line" style="left:38%;top:44%;width:9%;height:8%"></i><i class="m-line" style="left:50%;top:44%;width:9%;height:8%"></i><i class="m-line" style="left:62%;top:44%;width:9%;height:8%"></i>';
  const cta = '<i class="m-pill" style="right:8%;top:36%;width:18%;height:20%"></i>';
  if (id === 'isla') return `<i class="m-box" style="left:10%;top:26%;right:10%;height:40%;border-radius:99px;opacity:.16"></i>${logo}${nav}${cta}`;
  if (id === 'minimo') return `${logo}${cta}`;
  if (id === 'centrado') return `<i class="m-bar" style="left:39%;top:18%;width:22%;height:18%"></i><i class="m-line" style="left:24%;top:62%;width:13%;height:7%"></i><i class="m-line" style="left:43%;top:62%;width:13%;height:7%"></i><i class="m-line" style="left:62%;top:62%;width:13%;height:7%"></i>`;
  if (id === 'apilado') return `<i class="m-bar" style="left:8%;top:16%;width:26%;height:16%"></i><i class="m-line" style="left:8%;top:60%;width:14%;height:7%"></i><i class="m-line" style="left:26%;top:60%;width:14%;height:7%"></i>${cta}`;
  if (id === 'lateral') return `<i style="position:absolute;left:0;top:0;bottom:0;width:6%;background:var(--color-brand)"></i>${logo}${nav}${cta}`;
  return `<i class="m-box" style="inset:22% 0 22% 0;opacity:.07"></i>${logo}${nav}${cta}`;
}

function miniFooter(id) {
  const fondo = '<i style="position:absolute;inset:0;background:var(--color-deep)"></i>';
  if (id === 'franja') return `${fondo}<i class="m-bar" style="left:8%;top:42%;width:24%;height:16%;background:#fff;opacity:.9"></i><i class="m-line" style="right:8%;top:46%;width:30%;height:8%;background:#fff;opacity:.35"></i>`;
  if (id === 'grande') return `${fondo}<i class="m-bar" style="left:8%;top:22%;width:60%;height:26%;background:#fff;opacity:.9"></i><i class="m-line" style="left:8%;top:62%;width:24%;height:7%;background:#fff;opacity:.3"></i><i class="m-pill" style="right:8%;top:58%;width:20%;height:16%"></i>`;
  if (id === 'minimo') return `${fondo}<i class="m-line" style="left:50%;translate:-50% 0;top:46%;width:44%;height:8%;background:#fff;opacity:.35"></i>`;
  return `${fondo}<i class="m-bar" style="left:7%;top:20%;width:22%;height:14%;background:#fff;opacity:.9"></i>` +
    [30, 52, 74].map((x) => `<i class="m-line" style="left:${x}%;top:22%;width:14%;height:6%;background:#fff;opacity:.4"></i>` +
      [0, 1, 2].map((k) => `<i class="m-line" style="left:${x}%;top:${38 + k * 14}%;width:17%;height:5%;background:#fff;opacity:.22"></i>`).join('')).join('');
}

function miniBoton(id) {
  const r = id === 'recto' || id === 'bisel' ? '3px' : '99px';
  let est = `background:var(--color-brand)`;
  if (id === 'material') est = 'background:linear-gradient(180deg,var(--color-brand),var(--color-brand-dim));box-shadow:0 1px 0 rgb(255 255 255/.6) inset';
  if (id === 'contorno') est = 'background:none;border:2px solid var(--color-ink)';
  if (id === 'bisel') est = 'background:var(--color-brand);clip-path:polygon(0 0,88% 0,100% 100%,12% 100%)';
  const flecha = id === 'flecha' ? '<i style="position:absolute;right:26%;top:40%;width:9%;aspect-ratio:1;border-radius:50%;background:color-mix(in srgb,var(--color-ink) 22%,transparent)"></i>' : '';
  return `<i style="position:absolute;left:22%;right:22%;top:34%;height:32%;border-radius:${r};${est}"></i>${flecha}`;
}

function miniTitular(id) {
  const base = 'position:absolute;left:10%;right:10%;top:26%;height:22%;border-radius:2px';
  if (id === 'knockout') return `<i style="${base};background:linear-gradient(120deg,var(--color-brand),var(--color-metal));"></i><i style="${base};top:56%;height:14%;background:var(--color-ink);opacity:.15"></i>`;
  if (id === 'outline') return `<i style="${base};background:none;border:2px solid var(--color-ink);opacity:.7"></i>`;
  if (id === 'trama') return `<i style="${base};background:repeating-linear-gradient(45deg,var(--color-ink) 0 2px,transparent 2px 5px)"></i>`;
  if (id === 'marcado') return `<i style="${base};background:var(--color-ink);opacity:.85"></i><i style="position:absolute;left:10%;width:38%;top:38%;height:10%;background:var(--color-brand);opacity:.9"></i>`;
  if (id === 'escalonado') return [[10, 26, 46], [22, 44, 26], [34, 62, 10]]
    .map(([l, t, r]) => `<i style="${base};top:${t}%;left:${l}%;right:${r}%;height:12%;background:var(--color-ink)"></i>`).join('');
  if (id === 'extendido') return `<i style="${base};left:5%;right:5%;background:var(--color-ink)"></i><i style="${base};top:56%;height:12%;left:5%;right:34%;background:var(--color-ink);opacity:.25"></i>`;
  return `<i style="${base};background:var(--color-ink)"></i><i style="${base};top:56%;height:12%;right:38%;background:var(--color-ink);opacity:.25"></i>`;
}

function miniModulo(id) {
  const l = (x, y, w, h, o = .25) => `<i class="m-line" style="left:${x}%;top:${y}%;width:${w}%;height:${h}%;opacity:${o}"></i>`;
  switch (id) {
    case 'disclosure': return l(8, 20, 10, 8, .5) + l(24, 20, 44, 8, .6) + `<i class="m-pill" style="right:8%;top:17%;width:12%;height:14%"></i>` + l(8, 44, 78, 4) + l(8, 58, 60, 4) + l(8, 76, 84, 4, .12);
    case 'tabs': return `<i class="m-pill" style="left:8%;top:14%;width:22%;height:16%"></i>` + l(34, 16, 18, 12, .2) + l(56, 16, 18, 12, .2) + l(8, 48, 80, 5) + l(8, 64, 56, 5);
    case 'rail': return `<i class="m-img" style="left:6%;top:18%;width:26%;height:56%"></i><i class="m-img" style="left:37%;top:18%;width:26%;height:56%"></i><i class="m-img" style="left:68%;top:18%;width:26%;height:56%"></i>` + l(6, 86, 40, 5, .3);
    case 'sheet': return `<i class="m-box" style="inset:6%;opacity:.08"></i><i style="position:absolute;left:16%;right:16%;top:16%;bottom:16%;background:var(--color-surface);border-radius:5px;box-shadow:0 6px 14px -6px rgb(0 0 0/.5)"></i><i class="m-img" style="left:20%;top:20%;right:20%;height:26%"></i>` + l(20, 54, 40, 6, .5) + l(20, 68, 56, 4);
    case 'pull': return `<i class="m-txt" style="left:6%;top:6%;font-size:30px;color:var(--color-brand)">“</i>` + l(22, 26, 66, 8, .55) + l(22, 44, 58, 8, .55) + l(22, 66, 34, 5, .25);
    case 'note': return `<i style="position:absolute;inset:16%;border:1px dashed var(--color-ink);opacity:.35;border-radius:3px"></i>` + l(24, 36, 48, 5, .35) + l(24, 52, 36, 5, .35);
    case 'highlight': return `<i style="position:absolute;inset:20% 8%;background:var(--color-brand-soft);border-left:3px solid var(--color-brand);border-radius:4px"></i>` + l(16, 38, 60, 6, .4) + l(16, 54, 44, 6, .4);
    case 'stat': return [10, 40, 70].map((x) => `<i class="m-bar" style="left:${x}%;top:28%;width:18%;height:22%"></i><i class="m-line" style="left:${x}%;top:58%;width:22%;height:5%;opacity:.3"></i>`).join('');
    case 'time': return `<i style="position:absolute;left:12%;top:12%;bottom:12%;width:1.5px;background:var(--color-metal)"></i>` +
      [18, 44, 70].map((y) => `<i style="position:absolute;left:10%;top:${y}%;width:6%;aspect-ratio:1;border-radius:50%;background:var(--color-brand)"></i><i class="m-line" style="left:24%;top:${y + 1}%;width:${60 - y / 3}%;height:5%;opacity:.3"></i>`).join('');
    case 'sign': return [8, 37, 66].map((x) => `<i style="position:absolute;left:${x}%;top:22%;width:26%;height:50%;border-radius:5px;background:linear-gradient(180deg,var(--color-metal-hi),var(--color-metal-lo));padding:2px"></i><i style="position:absolute;left:${x + 1}%;top:24%;width:24%;height:46%;border-radius:4px;background:linear-gradient(180deg,var(--color-brand),var(--color-brand-dim))"></i>`).join('');
    default: return '<span class="m-nada">—</span>';
  }
}

function miniBase(id) {
  const b = BASES[id];
  return `<span style="position:absolute;inset:0;background:${b.paper}"></span>
    <span style="position:absolute;left:0;bottom:0;right:50%;top:50%;background:${b.alt}"></span>
    <span style="position:absolute;right:0;bottom:0;width:50%;top:50%;background:${b.deep}"></span>`;
}

function miniTipo(fam, peso) {
  return `<span style="position:absolute;inset:0;display:grid;place-items:center;font-family:'${fam}';
    font-weight:${peso || 700};font-size:22px;color:var(--color-ink)">Aa</span>`;
}

function miniMovimiento(id) {
  const l = (x, y, w, o) => `<i class="m-line" style="left:${x}%;top:${y}%;width:${w}%;height:7%;opacity:${o}"></i>`;
  if (id === 'quieto') return '<span class="m-nada">QUIETO</span>';
  if (id === 'split') return l(10, 26, 70, .6) + l(10, 46, 55, .35) + l(10, 66, 40, .15);
  if (id === 'counter') return `<i class="m-txt" style="left:50%;top:50%;translate:-50% -50%;font-size:17px">123</i>`;
  if (id === 'parallax') return `<i class="m-img" style="left:10%;top:14%;width:34%;height:60%"></i><i class="m-img" style="left:52%;top:28%;width:34%;height:60%;opacity:.35"></i>`;
  if (id === 'marquee') return l(-6, 40, 48, .45) + l(48, 40, 48, .25);
  if (id === 'spot') return `<i style="position:absolute;inset:0;background:radial-gradient(circle 34% at 62% 44%,color-mix(in srgb,var(--color-brand) 60%,transparent),transparent)"></i>`;
  if (id === 'tilt') return `<i class="m-img" style="left:20%;top:18%;width:60%;height:62%;rotate:-6deg"></i>`;
  if (id === 'trail') return [0, 1, 2].map((k) => `<i class="m-img" style="left:${14 + k * 22}%;top:${22 + k * 10}%;width:30%;height:44%;opacity:${.8 - k * .25}"></i>`).join('');
  return l(10, 30, 60, .5) + l(10, 52, 44, .25);
}

/** Despacha según el grupo. */
function mini(tipo, id, extra) {
  switch (tipo) {
    case 'fondo': return miniFondo(id);
    case 'escena': return miniEscena(id);
    case 'pieza': return miniPieza(id);
    case 'forma': return miniForma(id);
    case 'foto': return miniFoto(id);
    case 'header': return miniHeader(id);
    case 'footer': return miniFooter(id);
    case 'boton': return miniBoton(id);
    case 'titular': return miniTitular(id);
    case 'modulo': return miniModulo(id);
    case 'movimiento': return miniMovimiento(id);
    case 'base': return miniBase(id);
    case 'tipo': return miniTipo(id, extra);
    default: return '';
  }
}

/** Pinta un grupo de opciones como miniaturas. */
function opciones(host, entradas, activo, onPick, o = {}) {
  const el = $(host);
  if (!el) return;
  el.className = 'ui-ops' + (o.cols ? ' ui-ops-' + o.cols : '');
  el.innerHTML = '';
  entradas.forEach(([id, label, titulo, extra]) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'ui-op';
    if (titulo) b.title = titulo;
    const on = o.multi ? activo.includes(id) : activo === id;
    if (on) b.classList.add('on');
    const esJs = (o.tipo === 'fondo' && FONDOS[id]?.js) || (o.tipo === 'foto' && FOTOS[id]?.js)
      || (o.tipo === 'modulo' && MODULOS[id]?.js) || (o.tipo === 'movimiento' && MOVIMIENTO[id]?.js);
    b.innerHTML = `<span class="ui-op-vis">${mini(o.tipo, id, extra)}</span>
      <span class="ui-op-lbl">${esc(label)}${esJs ? '<em class="ui-op-js">JS</em>' : ''}</span>`;
    b.addEventListener('click', () => onPick(id));
    el.appendChild(b);
  });
}

function pintaControles() {
  opciones('#display', DISPLAY.map(([id, l, d]) => [id, l, d, 800]), S.display, (v) => set('display', v), { tipo: 'tipo' });
  opciones('#texto', TEXTO.map(([id, l]) => [id, l, '', 500]), S.texto, (v) => set('texto', v), { tipo: 'tipo' });
  opciones('#base', Object.entries(BASES).map(([k, v]) => [k, v.n, v.hue]), S.base, (v) => set('base', v), { tipo: 'base' });
  opciones('#fondo', Object.entries(FONDOS).map(([k, v]) => [k, v.n, v.dice]), S.fondo, (v) => set('fondo', v), { tipo: 'fondo' });
  opciones('#escena', Object.entries(ESCENAS).map(([k, v]) => [k, v.n]), S.escena, (v) => set('escena', v), { tipo: 'escena' });
  opciones('#pieza', Object.entries(PIEZAS).map(([k, v]) => [k, v.n]), S.pieza, (v) => set('pieza', v), { tipo: 'pieza' });
  opciones('#foto', Object.entries(FOTOS).map(([k, v]) => [k, v.n, v.nota]), S.foto, (v) => set('foto', v), { tipo: 'foto' });
  opciones('#forma', Object.entries(FORMAS).map(([k, v]) => [k, v.n]), S.forma, (v) => set('forma', v), { tipo: 'forma' });
  opciones('#header', Object.entries(HEADERS).map(([k, v]) => [k, v.n]), S.header, (v) => set('header', v), { tipo: 'header', cols: 2 });
  opciones('#boton', Object.entries(BOTONES).map(([k, v]) => [k, v.n, v.nota]), S.boton, (v) => set('boton', v), { tipo: 'boton' });
  opciones('#titular', Object.entries(TITULARES).map(([k, v]) => [k, v.n, v.nota]), S.titular, (v) => set('titular', v), { tipo: 'titular' });
  opciones('#footer', Object.entries(FOOTERS).map(([k, v]) => [k, v.n]), S.footer, (v) => set('footer', v), { tipo: 'footer', cols: 2 });
  opciones('#modulos', Object.entries(MODULOS).map(([k, v]) => [k, v.n, v.nota]), S.modulos, (v) => toggle('modulos', v), { tipo: 'modulo', multi: true, cols: 2 });
  opciones('#movimiento', Object.entries(MOVIMIENTO).map(([k, v]) => [k, v.n]), S.movimiento, (v) => toggle('movimiento', v), { tipo: 'movimiento', multi: true });
  pintaColocacion();
}

function pintaEjes() {
  const host = $('#ejes');
  host.innerHTML = '';
  EJES.forEach(([id, label, a, b]) => {
    const d = document.createElement('div');
    d.className = 'ui-eje';
    d.innerHTML = `<label for="eje-${id}" title="1 = ${a} · 5 = ${b}">${label}</label>
      <input type="range" id="eje-${id}" min="1" max="5" step="1" value="${S.ejes[id]}">
      <output>${S.ejes[id]}</output>`;
    d.querySelector('input').addEventListener('input', (e) => {
      S.ejes[id] = +e.target.value;
      d.querySelector('output').textContent = e.target.value;
      render();
    });
    host.appendChild(d);
  });
}

function set(k, v) { S[k] = v; pintaControles(); render(); }
function toggle(k, v) {
  const i = S[k].indexOf(v);
  if (i === -1) S[k].push(v); else S[k].splice(i, 1);
  pintaControles(); render();
}


/* La misma pieza en otra esquina es otra composición, así que la colocación
   es una decisión de diseño y no un detalle. Rejilla de nueve, como un cartel. */
function pintaColocacion() {
  const host = $('#colocacion');
  if (!host) return;
  const off = S.pieza === 'ninguna';
  host.style.opacity = off ? '.35' : '1';
  host.style.pointerEvents = off ? 'none' : 'auto';
  host.innerHTML = `
    <div class="ui-field"><span>Dónde</span>
      <div class="ui-rejilla">${Object.entries(POSICIONES).map(([k, v]) =>
        `<button type="button" data-p="${k}" class="${S.pos === k ? 'on' : ''}" title="${v.n}"></button>`).join('')}</div></div>
    <div class="ui-field"><span>Tamaño</span>
      <div class="ui-chips ui-chips-sm">${Object.entries(TAMANOS).map(([k, v]) =>
        `<button type="button" data-t="${k}" class="${S.tam === k ? 'on' : ''}">${v.n}</button>`).join('')}</div></div>
    <div class="ui-field"><span>Relleno</span>
      <div class="ui-chips ui-chips-sm">${Object.entries(RELLENOS).map(([k, v]) =>
        `<button type="button" data-r="${k}" class="${S.relleno === k ? 'on' : ''}">${v.n}</button>`).join('')}</div></div>`;
  host.querySelectorAll('[data-p]').forEach((b) => b.addEventListener('click', () => set('pos', b.dataset.p)));
  host.querySelectorAll('[data-t]').forEach((b) => b.addEventListener('click', () => set('tam', b.dataset.t)));
  host.querySelectorAll('[data-r]').forEach((b) => b.addEventListener('click', () => set('relleno', b.dataset.r)));
}

/** La pieza geométrica, tal y como va al lienzo y al encargo.
 *
 *  Ojo con el contorno: un `border` NO sirve en las formas que usan clip-path,
 *  porque el recorte se come el borde y la pieza desaparece. Se resuelve
 *  apilando la misma forma dos veces —la de dentro en el color del fondo—,
 *  que además funciona igual en las formas de border-radius. */
function piezaHTML() {
  if (S.pieza === 'ninguna') return '';
  const p = PIEZAS[S.pieza], pos = POSICIONES[S.pos], t = TAMANOS[S.tam];
  const base = `position:absolute;pointer-events:none;left:${pos.x};top:${pos.y};translate:-50% -50%;
    width:${t.v};aspect-ratio:1;--pc:var(--color-brand);
    --pw:${S.tam === 's' ? '1.2rem' : (S.tam === 'l' || S.tam === 'xl') ? '3rem' : '2rem'};${p.css || ''}`;

  if (S.relleno === 'contorno') {
    const grosor = S.tam === 's' ? 3 : S.tam === 'xl' ? 8 : 5;
    return `<span aria-hidden="true" style="${base};z-index:0;background:var(--color-brand)"></span>
      <span aria-hidden="true" style="${base};z-index:0;background:var(--color-paper);
        width:calc(${t.v} - ${grosor * 2}px)"></span>`;
  }

  let fondo = 'background:var(--color-brand)', extra = '';
  if (S.relleno === 'suave') fondo = 'background:color-mix(in srgb, var(--color-brand) 38%, transparent)';
  if (S.relleno === 'difuso') { fondo = 'background:color-mix(in srgb, var(--color-brand) 60%, transparent)'; extra = 'filter:blur(32px);'; }
  if (S.relleno === 'trama') fondo = 'background:repeating-linear-gradient(45deg,var(--color-brand) 0 4px,transparent 4px 10px)';

  return `<span aria-hidden="true" style="${base};z-index:0;${fondo};${extra}"></span>`;
}

/* ── Tokens del tema ──────────────────────────────────────────────────────── */
function tokens() {
  const b = BASES[S.base];
  return {
    '--color-brand': S.acento,
    '--color-brand-dim': ajusta(S.acento, 0.82),
    '--color-brand-ink': sobre(S.acento),
    // El fondo suave es el acento DILUIDO EN EL PAPEL, no el acento aclarado:
    // multiplicar canales satura en vez de suavizar (un marrón #8C5A3C daba un
    // naranja chillón #FFAB72). Va al tema exportado y a fx-highlight.
    '--color-brand-soft': mezcla(S.acento, b.paper, 0.16),
    '--color-ink': b.oscuro ? '#F2F4F6' : S.tinta,
    '--color-ink-soft': b.soft,
    '--color-deep': b.deep,
    '--color-deep-soft': b.deepSoft,
    '--color-paper': b.paper,
    '--color-paper-alt': b.alt,
    '--color-surface': b.oscuro ? b.alt : '#FFFFFF',
    '--color-metal': '#788088',
    '--color-metal-hi': '#C9CDD2',
    '--color-metal-lo': '#4A5057',
    '--color-line': b.oscuro ? 'rgb(255 255 255 / 12%)' : 'rgb(16 19 22 / 10%)',
    '--color-line-strong': b.oscuro ? 'rgb(255 255 255 / 22%)' : 'rgb(16 19 22 / 18%)',
    '--font-display': `'${S.display}', system-ui, sans-serif`,
    '--font-sans': `'${S.texto}', system-ui, sans-serif`,
  };
}

/* ── El suelo, medido ─────────────────────────────────────────────────────
   La regla 1 de la skill («cuerpo ≥ 4.5:1, titulares grandes ≥ 3:1») era
   hasta ahora una frase. Aquí se calcula sobre los tokens que de verdad se
   van a exportar, y el aviso trae EL NÚMERO y un color que sí cumple.

   Límite honesto, y por eso está escrito en pantalla: esto mide colores
   planos. El contraste sobre una foto, un degradado o un shader depende del
   píxel y hay que mirarlo con los ojos, en la zona peor. */
const PARES = [
  ['--color-ink', '--color-paper', 4.5, 'el texto sobre el papel', 'a'],
  ['--color-ink-soft', '--color-paper', 4.5, 'el texto secundario sobre el papel', 'a'],
  ['--color-ink-soft', '--color-paper-alt', 4.5, 'el texto secundario sobre la banda alterna', 'a'],
  ['--color-ink', '--color-surface', 4.5, 'el texto sobre las tarjetas', 'a'],
  ['--color-brand-ink', '--color-brand', 4.5, 'el texto del botón sobre el acento', 'b'],
  ['#ffffff', '--color-deep', 4.5, 'el texto blanco sobre el fondo profundo', 'b'],
  ['--color-brand', '--color-deep', 3.0, 'el acento sobre el fondo profundo (solo titulares grandes)', 'a'],
  ['--color-ink', '--color-brand-soft', 4.5, 'el texto dentro del destacado', 'b'],
];
const NOMBRE_TOKEN = {
  '--color-ink': 'la tinta', '--color-ink-soft': 'la tinta suave',
  '--color-paper': 'el papel', '--color-paper-alt': 'la banda alterna',
  '--color-surface': 'la superficie', '--color-deep': 'el fondo profundo',
  '--color-brand': 'el acento', '--color-brand-soft': 'el destacado',
  '--color-brand-ink': 'el texto sobre el acento',
};

function problemasContraste() {
  const t = tokens();
  const val = (k) => (k.startsWith('#') ? k : t[k]);
  const a = [];

  PARES.forEach(([ka, kb, meta, dice, cual]) => {
    const [ca, cb] = [val(ka), val(kb)];
    if (!esHex(ca) || !esHex(cb)) return;      // los tokens con alfa no se miden así
    const r = ratio(ca, cb);
    if (r >= meta) return;

    // Se corrige el lado que el autor puede mover. `--color-brand-ink` sale de
    // `sobre()`, así que cuando falla el botón el que sobra no es el texto: es
    // el acento, y por eso ese par se arregla por el lado del fondo.
    const mover = cual === 'a' ? [ca, cb, ka] : [cb, ca, kb];
    const sug = corrige(mover[0], mover[1], meta);
    const arreglo = sug
      ? `Con ${NOMBRE_TOKEN[mover[2]] || mover[2]} en ${sug.toUpperCase()} se cumple.`
      : `Ni llevándolo al extremo se llega: el que hay que cambiar es el otro color del par.`;
    a.push([`Contraste: ${dice}`, `${r.toFixed(2)}:1, hace falta ${meta.toFixed(1)}:1. ${arreglo}`, 'grave']);
  });

  return a;
}

/* ── La regla anti-clon, con datos ───────────────────────────────────────── */
const CLAVES_EJE = ['peso', 'temperatura', 'memoria', 'aire'];
const familia = (f) => String(f || '').split(' ')[0];   // «Archivo Black» → «Archivo»

function problemasClon() {
  const a = [];
  if (!MARCAS.length) return a;

  // 1) La display. Se compara por FAMILIA: «Archivo» y «Archivo Black» son la
  //    misma letra con otro peso, y contarlas como distintas es justo cómo se
  //    coló cuatro veces sin que saltara nada.
  const repes = MARCAS.filter((m) => familia(m.display) === familia(S.display));
  if (repes.length)
    a.push([`${S.display} ya está en ${repes.length === 1 ? 'otra web' : repes.length + ' webs'}`,
      `la llevan ${lista(repes.map((m) => m.n))}. La letra es lo primero que identifica una marca: repetida, las dos se leen como la misma plantilla con otro logo.`]);

  // 2) El acento, en OKLCH.
  const mio = oklch(S.acento);
  MARCAS.forEach((m) => {
    if (!esHex(m.acento) || mio.C < 0.04) return;
    const o = oklch(m.acento);
    if (o.C < 0.04) return;                     // un gris no tiene tono que comparar
    const dh = dTono(mio.H, o.H), dl = Math.abs(mio.L - o.L);
    if (dh <= 12 && dl <= 0.15)
      a.push([`El acento choca con ${m.n}`,
        `${S.acento.toUpperCase()} y ${m.acento.toUpperCase()} están a ${dh.toFixed(0)}° de tono y ${(dl * 100).toFixed(0)}% de claridad en OKLCH. En RGB parecen distintos —por eso se cuela—, pero en pantalla es el mismo color.`]);
  });

  // 3) El temperamento. La skill pide al menos DOS ejes de diferencia; se
  //    comprueba contra todas las webs que tengan ejes escritos, no solo las
  //    del mismo sector: el clon no distingue de oficios.
  MARCAS.forEach((m) => {
    if (!m.ejes) return;
    const d = CLAVES_EJE.filter((k) => Math.abs(S.ejes[k] - m.ejes[k]) >= 1).length;
    if (d < 2)
      a.push([`Mismo temperamento que ${m.n}`,
        `se diferencian en ${d} de los cuatro ejes y hacen falta dos. Con el mismo temperamento, cambiar el color no cambia la web.`]);
  });

  // 4) El gesto. Nunca se repite, y el cliché del sector no cuenta como gesto.
  const g = S.gesto.trim().toLowerCase();
  if (g) {
    const igual = MARCAS.find((m) => m.gesto && m.gesto.toLowerCase().includes(g.slice(0, 24)));
    if (igual) a.push([`El gesto ya es el de ${igual.n}`, `«${igual.gesto}». El gesto es lo único que no se puede compartir: si se repite, deja de ser de nadie.`]);
    if (/antes\s*(y|\/)\s*despu/.test(g))
      a.push(['El antes/después es del gremio', 'lo hacen los cuarenta competidores de la provincia. Es correcto y no diferencia nada: busca el gesto en las reseñas del cliente, no en su catálogo.']);
  }

  return a;
}

/* ── Reglas de coherencia · datos, no código ──────────────────────────────
   Estas reglas vivían escritas a mano aquí, una detrás de otra. Ahora vienen
   del manifiesto y esto es solo el evaluador: añadir una regla no obliga a
   tocar el estudio.

   Los operadores son cinco y no va a haber un sexto. Si una comprobación no
   cabe en ellos es porque CALCULA algo —el contraste, la distancia de tono—,
   y esas viven en JavaScript arriba, no aquí. Un lenguaje de reglas que crece
   hasta poder expresarlo todo deja de ser datos y vuelve a ser código, solo
   que peor escrito. */

/** Resuelve la ruta de una regla contra el estado actual. */
function valorDe(ruta) {
  if (ruta.startsWith('eje.')) return S.ejes[ruta.slice(4)];
  if (ruta === 'base.oscuro') return !!(BASES[S.base] || {}).oscuro;
  return S[ruta];
}

function cumple(v, cond) {
  if (typeof cond === 'string') {
    if (cond.startsWith('<=')) return Number(v) <= Number(cond.slice(2));
    if (cond.startsWith('>=')) return Number(v) >= Number(cond.slice(2));
    if (cond.startsWith('en:')) return cond.slice(3).split(',').includes(v);
    if (cond.startsWith('tiene:')) return Array.isArray(v) && v.includes(cond.slice(6));
    if (cond === 'vacio') return !String(v == null ? '' : v).trim();
  }
  return v === cond;
}

const evaluaReglas = () => REGLAS
  .filter((r) => Object.entries(r.si).every(([k, c]) => cumple(valorDe(k), c)))
  .map((r) => r.aviso.slice());

/* ── Avisos de coherencia · las reglas de la skill, comprobadas ───────────── */
function conflictos() {
  // El suelo primero: un contraste que no pasa no es una opinión de estilo.
  return [...problemasContraste(), ...evaluaReglas(), ...problemasClon()];
}

function avisos() {
  const a = conflictos();
  const host = $('#avisos');
  host.innerHTML = '';

  if (!a.length) {
    host.innerHTML = '<div class="ui-aviso ok"><b>✓</b><span>Sin conflictos. Las decisiones se sostienen entre sí.</span></div>';
  } else {
    a.forEach(([t, d, nivel]) => {
      const el = document.createElement('div');
      el.className = 'ui-aviso' + (nivel === 'grave' ? ' grave' : '');
      el.innerHTML = `<span>${nivel === 'grave' ? '✕' : '⚠'}</span><span><b>${esc(t)}:</b> ${esc(d)}</span>`;
      host.appendChild(el);
    });
  }

  // El alcance de la comprobación, siempre a la vista. Un medidor que no dice
  // lo que NO mide se acaba leyendo como un visto bueno que no ha dado.
  const nota = document.createElement('p');
  nota.className = 'ui-nota';
  nota.textContent = MARCAS.length
    ? `El contraste se mide sobre colores planos; sobre foto, degradado o shader hay que mirarlo en la zona peor. Clon comprobado contra ${MARCAS.length} webs del registro.`
    : 'El contraste se mide sobre colores planos. El registro de marcas no ha cargado: sin él no hay comprobación anti-clon.';
  host.appendChild(nota);
}

/* ── Previsualización ─────────────────────────────────────────────────────── */
function capaFondo(atenua = false) {
  const f = FONDOS[S.fondo];
  if (!f || S.fondo === 'ninguno') return '';
  // Sobre fondo profundo la trama se baja: ahí compite con el texto blanco, que
  // es justo la regla 10 del suelo («si ves antes el fondo que el titular…»).
  if (f.js) return `<div class="absolute inset-0"${atenua ? ' style="opacity:.5"' : ''} data-fx="${S.fondo}"></div>`;
  return `<div class="${f.clase}" style="${f.vars || ''}${atenua ? ';opacity:.5' : ''}"></div>`;
}
function capaEscena() {
  const e = ESCENAS[S.escena];
  if (!e || !e.clase) return '';
  return `<div class="${e.clase}" style="${e.vars || ''}"></div>`;
}
function claseFoto() {
  const f = FOTOS[S.foto];
  return [FORMAS[S.forma].clase, f.clase || ''].filter(Boolean).join(' ');
}
function varsFoto() { return FOTOS[S.foto].vars || ''; }

function figura(src, i) {
  const f = FOTOS[S.foto];
  const extra = f.js === 'ink'
    ? ` data-fx="ink" data-fx-opt='{"mode":"dots","step":5,"color":"--color-brand","invert":${BASES[S.base].oscuro},"reveal":true}'`
    : '';
  return `<figure class="relative m-0 overflow-hidden ${claseFoto()}" style="${varsFoto()}"${extra}>
    <img src="${src}" alt="" loading="lazy" decoding="async" style="width:100%;aspect-ratio:4/3;object-fit:cover;display:block">
  </figure>`;
}

function botonHTML(txt, primario = true) {
  const r = S.boton === 'recto' ? '8px' : '999px';
  const material = S.boton === 'material';
  const est = primario
    ? `background:${material ? 'linear-gradient(180deg,var(--color-brand),var(--color-brand-dim))' : 'var(--color-brand)'};
       color:var(--color-brand-ink);border:1px solid ${material ? 'color-mix(in srgb,var(--color-metal) 55%,transparent)' : 'var(--color-ink)'};
       ${material ? 'box-shadow:0 1px 0 rgb(255 255 255/55%) inset,0 -1px 0 rgb(0 0 0/18%) inset;' : ''}`
    : `background:transparent;color:var(--color-ink);border:1px solid var(--color-line-strong);`;
  return `<a href="#" style="display:inline-flex;align-items:center;gap:.5rem;padding:.7rem 1.2rem;border-radius:${r};
    font-family:var(--font-display);font-weight:600;font-size:.95rem;text-decoration:none;${est}">${txt}</a>`;
}

function tituloHTML(txt) {
  const t = TITULARES[S.titular];
  const stretch = S.ancho ? 'font-stretch:116%;' : '';
  let estilo = `font-family:var(--font-display);font-weight:800;line-height:.98;letter-spacing:-.03em;${stretch}`;
  let clase = '';
  if (S.titular === 'knockout') {
    clase = 'fx-knockout';
    estilo += `--knockout:url(${FOTOS_DEMO[1]});`;
  } else if (S.titular === 'outline') {
    clase = 'fx-outline'; estilo += '--outline-c:var(--color-ink);--outline-w:2px;';
  } else if (S.titular === 'trama') {
    clase = 'fx-hatch-text'; estilo += '--htext-color:var(--color-ink);';
  }
  return `<h1 class="${clase}" style="${estilo}font-size:clamp(2.4rem,6vw,4.2rem);margin:0">${txt}</h1>`;
}

function moduloHTML(id) {
  switch (id) {
    case 'disclosure':
      return `<div style="margin-top:2rem">
        ${[['Lo que va dentro del precio', 'Con nombre y apellidos, no «material de primera calidad»', 'desde 480 €'],
           ['Plazos', 'Lo que tarda de verdad, no lo que queda bien', '2 semanas']]
          .map(([t, h, m], i) => `<details class="fx-disc-item" ${i === 0 ? 'open' : ''}>
            <summary class="fx-disc-head">
              <span class="fx-disc-n tabular">0${i + 1}</span>
              <span class="fx-disc-titles"><span class="fx-disc-title">${t}</span><span class="fx-disc-hint">${h}</span></span>
              <span class="fx-disc-meta tabular">${m}</span>
              <span class="fx-disc-sign" aria-hidden="true"><i></i><i></i></span>
            </summary>
            <div class="fx-disc-body"><div class="fx-disc-text"><p>Aquí va el detalle, con la foto al lado. Cerrado ya dice algo; por eso se abre.</p></div>
            <figure class="fx-disc-fig"><img src="${FOTOS_DEMO[3]}" alt=""></figure></div>
          </details>`).join('')}
      </div>`;
    case 'tabs':
      return `<div class="fx-tabs" style="margin-top:2rem">
        <input type="radio" name="t" id="t1" checked><label for="t1">Fabricación</label>
        <input type="radio" name="t" id="t2"><label for="t2">Instalación</label>
        <div class="fx-tabs-panels">
          <div><p style="color:var(--color-ink-soft);margin:0">Pestañas con radios y <code>:checked</code>: funcionan con teclado y sin JavaScript.</p></div>
          <div><p style="color:var(--color-ink-soft);margin:0">Medios propios. El segundo panel.</p></div>
        </div></div>`;
    case 'rail':
      return `<div class="fx-rail" style="margin-top:2rem;--rail-w:72%;--rail-w-lg:34%">
        ${FOTOS_DEMO.slice(0, 4).map((s) => figura(s)).join('')}</div>`;
    case 'pull':
      return `<blockquote class="fx-pull" style="margin-top:2rem;max-width:34ch">
        Lo pusieron en dos días y lo que dijeron que costaba fue lo que costó.</blockquote>
        <p style="margin:.75rem 0 0;font-size:.85rem;color:var(--color-ink-soft)">Reseña real · con nombre y fecha</p>`;
    case 'note':
      return `<p class="fx-note" style="margin-top:2rem">No hacemos lo que no sabemos hacer.<br>Si es lo que busca, le decimos a dónde ir.</p>`;
    case 'highlight':
      return `<p class="fx-highlight" style="margin-top:2rem">Lo que hay que leer si solo se lee una cosa. Uno por página.</p>`;
    case 'stat':
      return `<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(9rem,1fr));gap:1.5rem;margin-top:2rem">
        ${[['1993', 'Desde entonces'], ['100 %', 'Fabricación propia'], ['48 h', 'Presupuesto cerrado']]
          .map(([v, l]) => `<div class="fx-stat"><span>${v}</span><span>${l}</span></div>`).join('')}</div>`;
    case 'time':
      return `<div style="position:relative;margin-top:2rem;padding-left:2.4rem">
        <div class="fx-plumb fx-plumb-bare" style="--plumb-x:.5rem"></div>
        <ol class="fx-time" style="list-style:none;margin:0;padding:0">
          ${[['1993', 'Abre el taller.'], ['2018', 'Medios propios de instalación.'], ['Hoy', 'Toda la provincia.']]
            .map(([a, t]) => `<li><span>${a}</span><p>${t}</p></li>`).join('')}
        </ol></div>`;
    case 'sheet':
      return `<div style="margin-top:2rem">${botonHTML('Ver la ficha completa', false)}
        <p style="margin:.7rem 0 0;font-size:.85rem;color:var(--color-ink-soft)">Abre un &lt;dialog&gt; nativo: Esc, foco atrapado y fondo bloqueado, sin librería.</p></div>`;
    case 'sign':
      return `<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(13rem,1fr));gap:1rem;margin-top:2rem"
        data-fx="sign" data-fx-opt='{"stagger":140,"once":false}'>
        ${['Una idea', 'Otra idea', 'La tercera'].map((t) => `<article class="fx-sign"><div style="padding:1.5rem">
          <p style="font-family:var(--font-display);font-weight:800;font-size:1.25rem;margin:0">${t}</p>
          <p style="margin:.6rem 0 0;font-size:.9rem">Las piezas están apagadas y se encienden al llegar.</p>
        </div></article>`).join('')}</div>`;
    default: return '';
  }
}

/* ── El compositor de secciones ───────────────────────────────────────────
   Antes el lienzo tenía tres secciones escritas a mano: se elegía cómo se veía
   la página, no cuál era. Ahora la página ES `S.secciones`, un array ordenado,
   y esto lo traduce a HTML.

   El contenido de ejemplo está escrito, no rellenado con lorem ni con los
   tópicos de siempre: un ejemplo que dice «Soluciones a medida» enseña a
   escribir mal, y lo que se ve en la previsualización es lo que acaba copiado. */

const TONOS = {
  paper: 'background:var(--color-paper);color:var(--color-ink)',
  alt: 'background:var(--color-paper-alt);color:var(--color-ink)',
  deep: 'background:var(--color-deep);color:#fff',
};

const ojo = (t) => `<p style="font-family:var(--font-display);font-size:.72rem;font-weight:700;letter-spacing:.16em;
  text-transform:uppercase;opacity:.65;margin:0 0 1rem">${esc(t)}</p>`;
const h2 = (t) => `<h2>${esc(t)}</h2>`;
const lead = (t, osc) => `<p class="lead"${osc ? ' style="color:rgb(255 255 255/.72)"' : ''}>${t}</p>`;
const suave = (osc) => osc ? 'rgb(255 255 255/.7)' : 'var(--color-ink-soft)';

/* Contenido de ejemplo. Nombres y cifras deliberadamente concretos: un «99,9 %»
   o un «Juan Pérez» son el tell de plantilla que la skill prohíbe. */
const EJ = {
  servicios: [
    ['Rótulos de fachada', 'Letra corporal, cajón de luz o vinilo sobre panel. Medimos in situ.', 'desde 480 €'],
    ['Rotulación de vehículos', 'Vinilo fundido, plotter propio. Furgón entero en dos días.', 'desde 350 €'],
    ['Placas y señalética', 'Metacrilato, dibond o acero. Con la normativa del local.', 'desde 60 €'],
    ['Montaje y mantenimiento', 'Camión cesta propio. Retiramos lo viejo y lo reciclamos.', 'presupuesto'],
  ],
  pasos: [
    ['Medimos', 'Vamos al local con el metro. Las medidas de un plano nunca son las de la pared.'],
    ['Dibujamos', 'Un montaje sobre la foto de tu fachada, para que lo veas antes de que exista.'],
    ['Fabricamos', 'En el taller, no subcontratado. Por eso podemos cambiar algo a mitad.'],
    ['Montamos', 'Con medios propios y el permiso de ocupación pedido, si hace falta.'],
  ],
  cifras: [['1993', 'Desde entonces'], ['100 %', 'Fabricación propia'], ['48 h', 'Presupuesto cerrado'], ['2', 'Camiones cesta']],
  resenas: [
    ['Lo pusieron en dos días y lo que dijeron que costaba fue lo que costó.', 'Reseña en Google · marzo de 2026'],
    ['Vinieron a medir un sábado porque el local abría el lunes. Eso no lo hace nadie.', 'Reseña en Google · enero de 2026'],
  ],
  faq: [
    ['¿Hace falta permiso del ayuntamiento?', 'Para fachada, casi siempre. Lo tramitamos nosotros y va incluido en el presupuesto.'],
    ['¿Cuánto tarda un rótulo de fachada?', 'Dos semanas desde que se aprueba el diseño. Si hay que pedir permiso, sumá tres más.'],
    ['¿Reparáis rótulos de otros?', 'Sí, si el cajón está sano. Si no, sale más caro arreglarlo que hacerlo nuevo y te lo decimos.'],
  ],
  sitios: ['La Carlota', 'Écija', 'Palma del Río', 'Fuente Palmera', 'Posadas', 'Almodóvar del Río', 'La Rambla', 'Santaella'],
};

function filaServicio([t, d, p], i, osc) {
  return `<div style="display:grid;grid-template-columns:2.5rem 1fr auto;gap:1.2rem;align-items:baseline;
    padding:1.4rem 0;border-top:1px solid ${osc ? 'rgb(255 255 255/.15)' : 'var(--color-line)'}">
    <span class="tabular" style="font-family:var(--font-display);font-weight:700;opacity:.45">0${i + 1}</span>
    <div><p style="font-family:var(--font-display);font-weight:700;font-size:1.15rem;margin:0">${t}</p>
      <p style="margin:.35rem 0 0;font-size:.92rem;color:${suave(osc)}">${d}</p></div>
    <span class="tabular" style="font-size:.85rem;color:${suave(osc)};white-space:nowrap">${p}</span>
  </div>`;
}

const CUERPO = {
  hero(v) {
    const titulo = S.titular === 'knockout' ? 'TU NOMBRE' : (S.oficio ? esc(S.oficio) : 'Lo que hacemos, en claro.');
    const entrada = lead('Una línea que explica qué se vende y a quién, con palabras del cliente y no del sector.');
    const botones = `<div style="display:flex;gap:.7rem;flex-wrap:wrap;margin-top:2rem">
      ${botonHTML('Pedir presupuesto')}${botonHTML('Ver trabajos', false)}</div>`;
    const texto = `${ojo(S.marca)}${tituloHTML(titulo)}<div style="margin-top:1.4rem">${entrada}</div>${botones}`;

    if (v === 'partida') {
      return `<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(20rem,1fr));gap:clamp(2rem,5vw,4rem);align-items:center">
        <div>${texto}</div><div>${figura(FOTOS_DEMO[0])}</div></div>`;
    }
    if (v === 'centrada') {
      return `<div style="text-align:center;max-width:46rem;margin:0 auto">${texto}
        <div style="margin-top:3rem">${figura(FOTOS_DEMO[1])}</div></div>`;
    }
    return `${texto}
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(11rem,1fr));gap:1rem;margin-top:3rem">
        ${FOTOS_DEMO.slice(0, 3).map((s, i) => figura(s, i)).join('')}</div>`;
  },

  banda(v, osc) {
    if (v === 'marquesina') {
      // El contrato de `marquee` es del kit, no inventado aquí: contenedor con
      // data-fx, pista con data-fx-track y el contenido DUPLICADO (el efecto
      // mide media pista para que el bucle no tenga costura).
      const tira = `<span style="font-family:var(--font-display);font-weight:800;white-space:nowrap;
        font-size:clamp(1.6rem,4vw,2.8rem);letter-spacing:-.02em;padding-inline:1.5rem">
        ${EJ.sitios.slice(0, 5).join(' · ')} · </span>`;
      return `<div data-fx="marquee" style="overflow:hidden">
        <div data-fx-track style="display:flex;width:max-content">${tira}${tira}</div></div>`;
    }
    if (v === 'datos') {
      return `<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(9rem,1fr));gap:1.5rem;text-align:center">
        ${EJ.cifras.slice(0, 3).map(([n, l]) => `<div class="fx-stat"><span>${n}</span><span>${l}</span></div>`).join('')}</div>`;
    }
    return `<p style="font-family:var(--font-display);font-weight:800;font-size:clamp(1.5rem,3.6vw,2.4rem);
      line-height:1.1;letter-spacing:-.02em;margin:0;max-width:26ch">
      Si no sabemos hacerlo, te decimos quién lo hace.</p>`;
  },

  servicios(v, osc) {
    const cab = `${ojo('Qué hacemos')}${h2('Cuatro cosas, y las cuatro las hacemos nosotros')}
      ${lead('Nada de subcontratas: el taller es propio y por eso podemos cambiar algo a mitad.', osc)}`;
    if (v === 'alterno') {
      return `${cab}<div style="margin-top:3rem;display:grid;gap:clamp(2rem,4vw,3.5rem)">
        ${EJ.servicios.slice(0, 3).map(([t, d], i) => `
          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(17rem,1fr));gap:2rem;align-items:center">
            <div style="${i % 2 ? 'order:2' : ''}">
              <p style="font-family:var(--font-display);font-weight:700;font-size:1.3rem;margin:0">${t}</p>
              <p style="margin:.6rem 0 0;color:${suave(osc)}">${d}</p></div>
            ${figura(FOTOS_DEMO[i])}</div>`).join('')}</div>`;
    }
    if (v === 'bento') {
      return `${cab}<div style="margin-top:2.5rem;display:grid;grid-template-columns:repeat(4,1fr);gap:1rem">
        ${EJ.servicios.map(([t, d], i) => {
          const ancho = i === 0 ? 'grid-column:span 2;grid-row:span 2' : 'grid-column:span 2';
          return `<div class="frame" style="${ancho};padding:1.5rem;border:1px solid ${osc ? 'rgb(255 255 255/.15)' : 'var(--color-line)'};border-radius:14px">
            <p style="font-family:var(--font-display);font-weight:700;font-size:1.1rem;margin:0">${t}</p>
            <p style="margin:.5rem 0 0;font-size:.9rem;color:${suave(osc)}">${d}</p></div>`;
        }).join('')}</div>`;
    }
    return `${cab}<div style="margin-top:2.5rem">${EJ.servicios.map((s, i) => filaServicio(s, i, osc)).join('')}</div>`;
  },

  galeria(v, osc) {
    const cab = `${ojo('Trabajos')}${h2('Lo que ya está puesto')}
      ${lead('Fotos de obra propia, enteras y sin retocar. Si no hay foto de algo, es que no lo hemos hecho.', osc)}`;
    if (v === 'carril') {
      return `${cab}<div class="fx-rail" style="margin-top:2rem;--rail-w:72%;--rail-w-lg:34%">
        ${FOTOS_DEMO.map((s) => figura(s)).join('')}</div>`;
    }
    if (v === 'destacado') {
      return `${cab}<div style="margin-top:2rem">${figura(FOTOS_DEMO[0])}</div>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(10rem,1fr));gap:1rem;margin-top:1rem">
          ${FOTOS_DEMO.slice(1, 4).map((s, i) => figura(s, i)).join('')}</div>`;
    }
    return `${cab}<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(13rem,1fr));gap:1rem;margin-top:2rem">
      ${FOTOS_DEMO.map((s, i) => figura(s, i)).join('')}</div>`;
  },

  datos(v, osc) {
    const n = v === 'rejilla' ? 4 : 3;
    return `${ojo('En números')}${h2('Lo que se puede medir')}
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(9rem,1fr));gap:1.5rem;margin-top:2rem">
        ${EJ.cifras.slice(0, n).map(([x, l]) => `<div class="fx-stat"><span>${x}</span><span>${l}</span></div>`).join('')}</div>`;
  },

  proceso(v, osc) {
    const cab = `${ojo('Cómo trabajamos')}${h2('De la primera visita al rótulo encendido')}`;
    if (v === 'pasos') {
      return `${cab}<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(12rem,1fr));gap:2rem;margin-top:2.5rem">
        ${EJ.pasos.map(([t, d], i) => `<div>
          <span class="tabular" style="font-family:var(--font-display);font-weight:800;font-size:2.2rem;
            line-height:1;color:var(--color-brand)">${i + 1}</span>
          <p style="font-family:var(--font-display);font-weight:700;margin:.6rem 0 0">${t}</p>
          <p style="margin:.4rem 0 0;font-size:.9rem;color:${suave(osc)}">${d}</p></div>`).join('')}</div>`;
    }
    if (v === 'pestanas') {
      return `${cab}<div class="fx-tabs" style="margin-top:2rem">
        ${EJ.pasos.slice(0, 3).map(([t], i) => `<input type="radio" name="proc" id="pr${i}"${i ? '' : ' checked'}><label for="pr${i}">${t}</label>`).join('')}
        <div class="fx-tabs-panels">
          ${EJ.pasos.slice(0, 3).map(([, d]) => `<div><p style="margin:0;color:${suave(osc)}">${d}</p></div>`).join('')}
        </div></div>`;
    }
    return `${cab}<div style="position:relative;margin-top:2.5rem;padding-left:2.4rem">
      <div class="fx-plumb fx-plumb-bare" style="--plumb-x:.5rem"></div>
      <ol class="fx-time" style="list-style:none;margin:0;padding:0">
        ${EJ.pasos.map(([t, d]) => `<li><span>${t}</span><p>${d}</p></li>`).join('')}</ol></div>`;
  },

  testimonio(v, osc) {
    if (v === 'dos') {
      return `${ojo('Lo que dicen')}<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(17rem,1fr));gap:2.5rem;margin-top:1rem">
        ${EJ.resenas.map(([t, f]) => `<div>
          <blockquote class="fx-pull" style="margin:0">${t}</blockquote>
          <p style="margin:.75rem 0 0;font-size:.85rem;color:${suave(osc)}">${f}</p></div>`).join('')}</div>`;
    }
    const [t, f] = EJ.resenas[0];
    return `${ojo('Lo que dicen')}
      <blockquote class="fx-pull" style="margin:0;max-width:34ch">${t}</blockquote>
      <p style="margin:.75rem 0 0;font-size:.85rem;color:${suave(osc)}">${f}</p>`;
  },

  precios(v, osc) {
    const cab = `${ojo('Precios')}${h2('Lo que cuesta, sin tener que pedirlo')}
      ${lead('Son precios de partida reales. El presupuesto cerrado sale tras medir.', osc)}`;
    if (v === 'tabla') {
      return `${cab}<table class="tabular" style="width:100%;border-collapse:collapse;margin-top:2rem;font-size:.95rem">
        ${EJ.servicios.map(([t, d, p]) => `<tr style="border-top:1px solid ${osc ? 'rgb(255 255 255/.15)' : 'var(--color-line)'}">
          <td style="padding:.9rem 0">${t}<br><span style="font-size:.85rem;color:${suave(osc)}">${d}</span></td>
          <td style="padding:.9rem 0;text-align:right;white-space:nowrap">${p}</td></tr>`).join('')}</table>`;
    }
    return `${cab}<div style="margin-top:2rem">
      ${EJ.servicios.slice(0, 3).map(([t, d, p], i) => `<details class="fx-disc-item"${i === 0 ? ' open' : ''}>
        <summary class="fx-disc-head">
          <span class="fx-disc-n tabular">0${i + 1}</span>
          <span class="fx-disc-titles"><span class="fx-disc-title">${t}</span><span class="fx-disc-hint">${d}</span></span>
          <span class="fx-disc-meta tabular">${p}</span>
          <span class="fx-disc-sign" aria-hidden="true"><i></i><i></i></span>
        </summary>
        <div class="fx-disc-body"><div class="fx-disc-text"><p>Qué entra en ese precio, con nombre y apellidos: material, medidas y montaje. Cerrado ya dice algo; por eso se abre.</p></div>
        <figure class="fx-disc-fig"><img src="${FOTOS_DEMO[i]}" alt=""></figure></div></details>`).join('')}</div>`;
  },

  faq(v, osc) {
    const item = ([q, r], i) => `<details class="fx-disc-item"${i === 0 ? ' open' : ''}>
      <summary class="fx-disc-head">
        <span class="fx-disc-titles"><span class="fx-disc-title">${q}</span></span>
        <span class="fx-disc-sign" aria-hidden="true"><i></i><i></i></span>
      </summary>
      <div class="fx-disc-body"><div class="fx-disc-text"><p>${r}</p></div></div></details>`;
    const cab = `${ojo('Preguntas')}${h2('Lo que preguntan antes de llamar')}`;
    if (v === 'dos') {
      return `${cab}<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(18rem,1fr));gap:1rem 2rem;margin-top:2rem">
        ${EJ.faq.map((f, i) => `<div>${item(f, i)}</div>`).join('')}</div>`;
    }
    return `${cab}<div style="margin-top:2rem">${EJ.faq.map(item).join('')}</div>`;
  },

  zona(v, osc) {
    const sitios = `<div style="display:flex;flex-wrap:wrap;gap:.5rem;margin-top:2rem">
      ${EJ.sitios.map((s) => `<span style="font-size:.9rem;padding:.4rem .8rem;border-radius:999px;
        border:1px solid ${osc ? 'rgb(255 255 255/.2)' : 'var(--color-line-strong)'}">${s}</span>`).join('')}</div>`;
    const cab = `${ojo('Dónde trabajamos')}${h2('La provincia, y lo que cae al lado')}
      ${lead('Los nombres propios de los pueblos, que es lo que la gente escribe en el buscador.', osc)}`;
    if (v === 'mapa') {
      return `<div style="position:relative"><div class="fx-blueprint" style="--bp-a:14%;--bp-fade:75%"></div>
        <div style="position:relative;z-index:1">${cab}${sitios}</div></div>`;
    }
    return cab + sitios;
  },

  contacto(v, osc) {
    const cab = `${ojo('Contacto')}${h2('Se contesta el teléfono')}`;
    if (v === 'formulario') {
      const campo = (l, t) => `<label style="display:block"><span style="display:block;font-size:.85rem;
        font-weight:600;margin-bottom:.35rem;color:${suave(osc)}">${l}</span>
        <input type="${t}" style="width:100%;padding:.65rem .8rem;border-radius:8px;font:inherit;
          border:1px solid ${osc ? 'rgb(255 255 255/.25)' : 'var(--color-line-strong)'};background:transparent;color:inherit"></label>`;
      return `${cab}<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(14rem,1fr));gap:1rem;margin-top:2rem;max-width:40rem">
        ${campo('Nombre', 'text')}${campo('Teléfono', 'tel')}${campo('Qué necesitás', 'text')}${campo('Dónde', 'text')}</div>
        <div style="margin-top:1.5rem">${botonHTML('Enviar')}</div>
        <p style="margin:.8rem 0 0;font-size:.85rem;color:${suave(osc)}">Cuatro campos. Cada campo de más es gente que no lo rellena.</p>`;
    }
    return `${cab}<p style="font-family:var(--font-display);font-weight:800;font-size:clamp(1.8rem,4.5vw,3rem);
      margin:1rem 0 0;letter-spacing:-.02em"><a href="#" style="color:inherit;text-decoration:none">957 00 00 00</a></p>
      <p style="margin:.6rem 0 0;color:${suave(osc)}">De lunes a viernes, de 8 a 14 y de 16 a 19. Contesta alguien del taller, no un contestador.</p>
      <div style="margin-top:2rem">${botonHTML('Escribir por WhatsApp')}</div>`;
  },

  cierre(v, osc) {
    if (v === 'partido') {
      return `<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(18rem,1fr));gap:2.5rem;align-items:center">
        <div><h2${osc ? ' style="color:#fff"' : ''}>¿Lo vemos?</h2>
          ${lead('Vamos, medimos y te mandamos el montaje sobre la foto de tu fachada. Sin compromiso y sin insistir después.', osc)}</div>
        <div style="text-align:right">${botonHTML('Pedir presupuesto')}</div></div>`;
    }
    return `<div style="text-align:center">
      <h2${osc ? ' style="color:#fff"' : ''}>¿Hablamos?</h2>
      <p style="color:${suave(osc)};max-width:42ch;margin:1rem auto 2rem">Vamos, medimos y te mandamos el montaje sobre la foto de tu fachada.</p>
      ${botonHTML('Pedir presupuesto')}</div>`;
  },
};

function seccionHTML(s) {
  const def = SECCIONES[s.t];
  if (!def || !CUERPO[s.t]) return '';

  // `admite` manda sobre lo guardado: si una sección deja de admitir una capa,
  // las composiciones viejas no arrastran algo que ya no tiene sentido ahí.
  const admite = def.admite || [];
  const capas = (s.capas || []).filter((c) => admite.includes(c));
  const osc = s.tono === 'deep';

  const pintadas = (capas.includes('fondo') ? capaFondo(osc) : '')
    + (capas.includes('escena') ? capaEscena() : '')
    + (capas.includes('pieza') ? piezaHTML() : '');
  const arco = capas.includes('escena') && ESCENAS[S.escena].borde
    ? 'border-bottom-left-radius:50% 4rem;border-bottom-right-radius:50% 4rem;' : '';
  const aisla = pintadas || arco ? 'position:relative;isolation:isolate;overflow:hidden;' : '';

  const extras = capas.includes('modulos') ? S.modulos.map(moduloHTML).join('') : '';

  return `<section class="sec" style="${TONOS[s.tono] || TONOS.paper};${aisla}${arco}">
    ${pintadas}
    <div class="wrap"${aisla ? ' style="position:relative;z-index:1"' : ''}>
      ${CUERPO[s.t](s.v, osc)}${extras}
    </div>
  </section>`;
}

function headerHTML() {
  const nav = ['Servicios', 'Trabajos', 'Contacto']
    .map((t) => `<a href="#" style="text-decoration:none;color:var(--color-ink);font-size:.9rem;font-weight:500">${t}</a>`).join('');
  const marca = `<strong style="font-family:var(--font-display);font-weight:800;font-size:1.05rem;${S.ancho ? 'font-stretch:116%' : ''}">${esc(S.marca)}</strong>`;
  if (S.header === 'isla') {
    return `<div style="position:sticky;top:0;z-index:20;padding:1rem">
      <header style="display:flex;align-items:center;justify-content:space-between;gap:1.5rem;max-width:64rem;margin:0 auto;
        padding:.7rem 1.1rem;border-radius:999px;background:color-mix(in srgb,var(--color-surface) 82%,transparent);
        backdrop-filter:blur(10px);border:1px solid var(--color-line)">
        ${marca}<nav style="display:flex;gap:1.2rem">${nav}</nav>${botonHTML('Presupuesto')}
      </header></div>`;
  }
  if (S.header === 'minimo') {
    return `<header style="display:flex;align-items:center;justify-content:space-between;padding:1.5rem clamp(1rem,4vw,3rem)">
      ${marca}${botonHTML('Presupuesto')}</header>`;
  }
  return `<header style="display:flex;align-items:center;justify-content:space-between;gap:1.5rem;
    padding:1rem clamp(1rem,4vw,3rem);border-bottom:1px solid var(--color-line);background:var(--color-surface)">
    ${marca}<nav style="display:flex;gap:1.3rem">${nav}</nav>${botonHTML('Presupuesto')}</header>`;
}

function footerHTML() {
  if (S.footer === 'franja') {
    return `<footer style="padding:2rem clamp(1rem,4vw,3rem);background:var(--color-deep);color:#fff;
      display:flex;flex-wrap:wrap;gap:1rem;justify-content:space-between;align-items:center">
      <strong style="font-family:var(--font-display)">${esc(S.marca)}</strong>
      <span style="font-size:.85rem;opacity:.7">Teléfono · Dirección · Horario</span></footer>`;
  }
  return `<footer style="padding:3rem clamp(1rem,4vw,3rem);background:var(--color-deep);color:#fff">
    <div style="display:grid;gap:2rem;grid-template-columns:repeat(auto-fit,minmax(11rem,1fr))">
      <div><strong style="font-family:var(--font-display);font-size:1.1rem">${esc(S.marca)}</strong>
        <p style="margin:.6rem 0 0;font-size:.85rem;opacity:.65">${esc(S.oficio || 'Lo que hace, en una línea.')}</p></div>
      ${['Qué hacemos', 'Dónde', 'Contacto'].map((t) => `<div><p style="font-size:.7rem;letter-spacing:.14em;text-transform:uppercase;opacity:.5;margin:0 0 .6rem">${t}</p>
        ${[1, 2, 3].map(() => `<p style="margin:.3rem 0;font-size:.85rem;opacity:.75">Enlace</p>`).join('')}</div>`).join('')}
    </div></footer>`;
}

function documento() {
  const t = tokens();
  const vars = Object.entries(t).map(([k, v]) => `${k}:${v}`).join(';');
  const mov = S.movimiento;
  const aire = { 1: '2.5rem', 2: '3.5rem', 3: '5rem', 4: '7rem', 5: '9rem' }[S.ejes.aire];
  const cuerpo = S.secciones.map(seccionHTML).join('\n');

  /* El runtime de efectos solo se carga si algo lo necesita. Se mira el HTML ya
     montado en vez de enumerar condiciones: así una sección nueva que traiga un
     data-fx funciona sin que nadie se acuerde de tocar esta línea. */
  const necesitaFx = /data-fx=/.test(cuerpo) || mov.some((m) => MOVIMIENTO[m]?.js);

  return `<!doctype html><html lang="es"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<base href="../">
<link rel="stylesheet" href="_astro/kit-completo.css?v=fd949ab8">
<link rel="stylesheet" href="estudio/estudio.css?v=9255722f">
<style>
  :root{${vars}}
  html{scroll-behavior:auto}
  body{margin:0;background:var(--color-paper);color:var(--color-ink);font-family:var(--font-sans)}
  .sec{padding-block:${aire};padding-inline:clamp(1rem,4vw,3rem)}
  .wrap{max-width:70rem;margin:0 auto}
  h2{font-family:var(--font-display);font-weight:800;letter-spacing:-.03em;${S.ancho ? 'font-stretch:116%;' : ''}font-size:clamp(1.7rem,3.4vw,2.6rem);margin:0 0 1rem;line-height:1.02}
  p{line-height:1.65}
  .lead{color:var(--color-ink-soft);max-width:60ch;font-size:1.05rem}
  .ui-aviso,.ui-panel{display:none}
</style></head>
<body class="${mov.includes('reveal') ? 'kit-js' : ''}">

  ${headerHTML()}

  ${cuerpo || `<section class="sec"><div class="wrap">
    <p class="lead">La página no tiene secciones. Añadí alguna en el panel: una web sin
    arquitectura no se arregla con efectos.</p></div></section>`}

  ${footerHTML()}

  ${necesitaFx ? `<script type="module" src="_astro/Fx.astro_astro_type_script_index_0_lang.CGbv7hfv.js"><\/script>` : ''}
  <script>document.querySelectorAll('.reveal').forEach(e=>e.classList.add('is-in'));<\/script>
</body></html>`;
}

/* ── El lienzo ────────────────────────────────────────────────────────────
   Reconstruir el `srcdoc` cuesta una recarga entera: se pierde el scroll y los
   efectos vuelven a arrancar. Con tres secciones fijas se toleraba; con una
   página de verdad, mover un color y que el lienzo salte al principio hace la
   herramienta inservible.

   Dos caminos, y el barato es el habitual:
   · Si SOLO han cambiado cosas que viven en tokens (acento, tinta y las dos
     tipografías), se escriben como variables en el documento de dentro y ya
     está. El iframe es del mismo origen —`srcdoc` hereda el del contenedor—,
     así que no hace falta postMessage para nada.
   · Si ha cambiado la estructura, se reconstruye y se devuelve el scroll donde
     estaba.

   `base` NO está en la lista aunque toque tokens: también decide si `ink` se
   invierte, y eso es marcado. Lo mismo `ancho`, que escribe font-stretch en
   varios sitios. Ante la duda, reconstruir. */
const SOLO_TOKENS = ['acento', 'tinta', 'display', 'texto'];
let firmaPrevia = null;

function firmaEstructural() {
  const c = { ...S };
  SOLO_TOKENS.forEach((k) => delete c[k]);
  return JSON.stringify(c);
}

function parcheaTokens(t) {
  try {
    const d = $('#lienzo').contentDocument;
    if (!d || !d.documentElement) return false;
    Object.entries(t).forEach(([k, v]) => d.documentElement.style.setProperty(k, v));
    return true;
  } catch { return false; }
}

let t0;
function render() {
  clearTimeout(t0);
  // Las miniaturas del panel usan los mismos tokens que el lienzo: así una
  // opción se ve con TU paleta, no con una de muestra.
  const t = tokens();
  Object.entries(t).forEach(([k, v]) => document.documentElement.style.setProperty(k, v));
  avisos();
  guarda();
  lectura();

  const f = firmaEstructural();
  const soloColor = f === firmaPrevia;
  firmaPrevia = f;
  if (soloColor && parcheaTokens(t)) return;

  t0 = setTimeout(() => {
    const el = $('#lienzo');
    let y = 0;
    try { y = el.contentWindow.scrollY || 0; } catch { /* aún no hay documento */ }
    el.addEventListener('load', () => {
      try { el.contentWindow.scrollTo(0, y); } catch { /* da igual: era una comodidad */ }
    }, { once: true });
    el.srcdoc = documento();
  }, 220);
}

function lectura() {
  const e = S.ejes;
  const d = [];
  d.push(e.peso >= 4 ? 'contundente' : e.peso <= 2 ? 'ligera' : 'de peso medio');
  d.push(e.temperatura >= 4 ? 'cálida' : e.temperatura <= 2 ? 'fría y técnica' : 'templada');
  d.push(e.memoria >= 4 ? 'con oficio detrás' : e.memoria <= 2 ? 'sin pasado, al día' : '');
  d.push(e.aire >= 4 ? 'con mucho aire' : e.aire <= 2 ? 'densa' : '');
  $('#eje-lectura').textContent = 'Una web ' + d.filter(Boolean).join(', ') + '.';
}

/* ── El encargo ───────────────────────────────────────────────────────────── */

const slugDe = (s) => (s || 'marca').toLowerCase().normalize('NFD')
  .replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

/* Los tokens agrupados CON SU PORQUÉ, copiado de themes/_plantilla.css. Un
   tema exportado que solo lleva valores es peor que el que se copia a mano:
   el que se copia a mano trae estas notas, y son las que evitan que alguien
   ponga un gris suelto en las líneas o un texto que no pasa contraste sobre
   el color de marca. Si se exporta sin ellas, la herramienta empeora el
   trabajo en vez de ahorrarlo. */
const BLOQUES_TEMA = [
  ['Marca', [
    ['--color-brand', 'Acción y dato. Es el color de los botones y las cifras, no un adorno.'],
    ['--color-brand-dim', 'El mismo, un punto más apagado: cara inferior de degradados y estados pulsados.'],
    ['--color-brand-ink', 'Texto que va ENCIMA del color de marca: tiene que pasar contraste AA.'],
    ['--color-brand-soft', 'Fondo suave del MISMO tono para avisos y destacados. Es el acento diluido en el papel, no el acento aclarado.'],
  ]],
  ['Tinta y secciones oscuras', [
    ['--color-ink', 'Titulares y estructura. Nunca #000.'],
    ['--color-ink-soft', 'Texto secundario. Sale del MISMO tono que la tinta: una sola familia de grises.'],
    ['--color-deep', 'Secciones oscuras (un cambio de ritmo por página, no más).'],
    ['--color-deep-soft', 'La variante de esas secciones, para cajas dentro de lo oscuro.'],
  ]],
  ['Fondos', [
    ['--color-paper', 'El papel de la página.'],
    ['--color-paper-alt', 'Franja alterna, para separar bloques sin meter una línea.'],
    ['--color-surface', 'Tarjetas.'],
  ]],
  ['Metal', [
    ['--color-metal', 'Canto de material. Solo si la marca fabrica algo físico; si no, se borra.'],
    ['--color-metal-hi', 'Su brillo.'],
    ['--color-metal-lo', 'Su sombra.'],
  ]],
  ['Líneas', [
    ['--color-line', 'Siempre la tinta con alfa, nunca un gris suelto.'],
    ['--color-line-strong', 'La misma, más presente, para bordes que tienen que verse.'],
  ]],
  ['Tipografía', [
    ['--font-display', 'Titulares.'],
    ['--font-sans', 'Texto corrido.'],
  ]],
];

function temaCSS() {
  const t = tokens();
  const slug = slugDe(S.marca);
  const puestos = new Set();

  const cuerpo = BLOQUES_TEMA.map(([titulo, filas]) => {
    const lineas = filas.filter(([k]) => t[k] !== undefined).map(([k, por]) => {
      puestos.add(k);
      return `  /* ${por} */\n  ${k}: ${t[k]};`;
    });
    return lineas.length ? `  /* ── ${titulo} ── */\n${lineas.join('\n')}` : '';
  }).filter(Boolean).join('\n\n');

  // Red de seguridad: si mañana `tokens()` devuelve algo que no está en los
  // bloques de arriba, sale igual en vez de perderse en silencio.
  const sueltos = Object.entries(t).filter(([k]) => !puestos.has(k));

  return `/* Tema · ${S.marca}
   Generado con el Estudio de marca del kit OpsPilot.

   Dónde va:  opspilot-kit/src/styles/themes/${slug}.css
   Se importa DESPUÉS de kit.css y SOLO pisa tokens; si hace falta CSS propio
   de la marca, va en su proyecto (marca-${slug}.css), no aquí.

   Reglas que no se saltan:
   - UN color de marca. Si el logo tiene tres, elige el que manda y usa los
     otros como apoyo.
   - Saturación por debajo del 80 % salvo que el logo obligue.
   - Una sola familia de grises: tinta, tinta suave y líneas salen del MISMO
     tono. Mezclar cálidos y fríos es lo que hace que una web se vea sucia
     sin que se sepa por qué. */
@theme {
${cuerpo}${sueltos.length ? `\n\n  /* ── Sin clasificar ── */\n${sueltos.map(([k, v]) => `  ${k}: ${v};`).join('\n')}` : ''}
}
${S.ancho ? `
/* Los titulares de esta marca van siempre extendidos: es parte de la
   identidad, no un ajuste de una página. */
h1, h2, .display-brand {
  font-stretch: 116%;
}
` : ''}`;
}

/* ── El andamio de Astro ──────────────────────────────────────────────────
   Genera la página con los BLOQUES REALES del kit, no con un HTML inventado
   que luego habría que traducir. Cada sección deja un TODO visible con lo que
   falta: el contenido. Un andamio que finge estar terminado es peor que no
   tenerlo, porque se publica tal cual.

   Dos renderizadores separados a propósito (este y el del lienzo): el lienzo
   tiene que enseñar el efecto aplicado con CSS suelto, y el proyecto tiene que
   usar componentes. Intentar que uno solo sirva para las dos cosas obliga a
   que el lienzo importe Astro, que es justo lo que hace que la herramienta
   deje de abrirse con doble clic. */

const BLOQUE_DE = {
  hero: 'HeroSplit',
  servicios: { indice: 'ServiceIndex', alterno: 'FeatureSplit', bento: 'Bento' },
  banda: { frase: null, marquesina: 'Marquee', datos: 'StatRow' },
  galeria: { rejilla: 'Bento', carril: null, destacado: 'Bento' },
  datos: 'StatRow',
  proceso: { plomada: 'Steps', pasos: 'Steps', pestanas: null },
  testimonio: null,
  precios: { desplegable: 'Disclosure', tabla: null },
  faq: 'FaqList',
  zona: null,
  contacto: null,
  cierre: 'CtaPanel',
};

const bloqueDe = (s) => {
  const b = BLOQUE_DE[s.t];
  return typeof b === 'string' ? b : (b ? b[s.v] : null) || null;
};

const TONO_SECCION = { paper: 'paper', alt: 'alt', deep: 'deep' };

/** El cuerpo de cada sección, ya como componentes del kit. */
function astroSeccion(s, i) {
  const def = SECCIONES[s.t] || {};
  const v = (def.variantes || []).find((x) => x.id === s.v) || {};
  const osc = s.tono === 'deep';
  const tone = osc ? ' tone="dark"' : '';
  const bloque = bloqueDe(s);
  const capas = (s.capas || []).filter((c) => (def.admite || []).includes(c));

  const nota = [
    `  {/* ${String(i + 1).padStart(2, '0')} · ${def.n} — ${v.n || s.v}`,
    `      ${v.dice || def.dice || ''}`,
    capas.length ? `      Capas decididas aquí: ${capas.map((c) => NOMBRE_CAPA[c]).join(', ')}` : null,
    `      TODO: sustituir el contenido de ejemplo por el del cliente. */}`,
  ].filter(Boolean).join('\n');

  const dentro = {
    hero: () => `  <HeroSplit
    eyebrow="${esc(S.marca)}"
    titleHtml="TODO: el titular, con <em>énfasis</em> donde toque"
    lead="TODO: una línea que explique qué se vende y a quién, con palabras del cliente."
    photo={{ src: '/img/TODO.webp', alt: 'TODO: describe la foto', width: 1200, height: 900 }}
  />`,
    servicios: () => bloque === 'ServiceIndex'
      ? `  <Section tone="${TONO_SECCION[s.tono]}">
    <SectionHead eyebrow="Qué hacemos" title="TODO: el titular de servicios"${tone} />
    <ServiceIndex items={servicios} />
  </Section>`
      : bloque === 'Bento'
        ? `  <Section tone="${TONO_SECCION[s.tono]}">
    <SectionHead eyebrow="Qué hacemos" title="TODO: el titular de servicios"${tone} />
    <Bento items={trabajos} />
  </Section>`
        : `  <Section tone="${TONO_SECCION[s.tono]}">
    <FeatureSplit titleHtml="TODO: el servicio"${tone}>
      <p>TODO: qué incluye y qué no.</p>
    </FeatureSplit>
  </Section>`,
    banda: () => bloque === 'Marquee'
      ? `  <Marquee items={['TODO', 'los', 'sitios', 'o', 'servicios']} tone="${osc ? 'deep' : 'paper'}" />`
      : bloque === 'StatRow'
        ? `  <Section tone="${TONO_SECCION[s.tono]}" space="sm">
    <StatRow items={cifras} cols={3}${tone} />
  </Section>`
        : `  <Section tone="${TONO_SECCION[s.tono]}" space="sm">
    <p class="font-display text-d2 max-w-[26ch]">TODO: una afirmación sola, sin nada más.</p>
  </Section>`,
    galeria: () => bloque === 'Bento'
      ? `  <Section tone="${TONO_SECCION[s.tono]}">
    <SectionHead eyebrow="Trabajos" title="TODO: el titular de trabajos"${tone} />
    <Bento items={trabajos} />
  </Section>`
      : `  <Section tone="${TONO_SECCION[s.tono]}" bleed>
    <SectionHead eyebrow="Trabajos" title="TODO: el titular de trabajos"${tone} />
    {/* Carril horizontal: utilidad del kit, sin componente. */}
    <div class="fx-rail" style="--rail-w:72%;--rail-w-lg:34%">
      {trabajos.map((t) => (
        <figure class="m-0 overflow-hidden ${FORMAS[S.forma].clase || ''}">
          <img src={t.src} alt={t.alt} width={t.width} height={t.height} loading="lazy" decoding="async" />
        </figure>
      ))}
    </div>
  </Section>`,
    datos: () => `  <Section tone="${TONO_SECCION[s.tono]}">
    <StatRow items={cifras} cols={${s.v === 'rejilla' ? 4 : 3}}${tone} />
  </Section>`,
    proceso: () => bloque === 'Steps'
      ? `  <Section tone="${TONO_SECCION[s.tono]}">
    <SectionHead eyebrow="Cómo trabajamos" title="TODO: el titular del proceso"${tone} />
    <Steps items={pasos}${tone} ring="${s.tono === 'deep' ? 'deep' : s.tono}" />
  </Section>`
      : `  <Section tone="${TONO_SECCION[s.tono]}">
    <SectionHead eyebrow="Cómo trabajamos" title="TODO: el titular del proceso"${tone} />
    {/* Pestañas con radios y :checked — funcionan con teclado y sin JavaScript. */}
    <div class="fx-tabs">
      {pasos.map((p, n) => (
        <>
          <input type="radio" name="proceso" id={\`proc-\${n}\`} checked={n === 0} />
          <label for={\`proc-\${n}\`}>{p.title}</label>
        </>
      ))}
      <div class="fx-tabs-panels">{pasos.map((p) => <div><p>{p.text}</p></div>)}</div>
    </div>
  </Section>`,
    testimonio: () => `  <Section tone="${TONO_SECCION[s.tono]}">
    {/* TODO: reseñas REALES, con nombre y fecha. Una inventada se nota y cuesta la venta. */}
    <blockquote class="fx-pull max-w-[34ch]">TODO: la reseña, literal.</blockquote>
    <p class="mt-3 text-sm text-ink-soft">TODO: dónde y cuándo se publicó</p>
  </Section>`,
    precios: () => bloque === 'Disclosure'
      ? `  <Section tone="${TONO_SECCION[s.tono]}">
    <SectionHead eyebrow="Precios" title="TODO: el titular de precios"${tone} />
    <Disclosure items={partidas} numbered openFirst${tone} />
  </Section>`
      : `  <Section tone="${TONO_SECCION[s.tono]}">
    <SectionHead eyebrow="Precios" title="TODO: el titular de precios"${tone} />
    <table class="w-full border-collapse tabular">
      {partidas.map((p) => (
        <tr class="border-t border-line">
          <td class="py-3">{p.title}<br /><span class="text-sm text-ink-soft">{p.hint}</span></td>
          <td class="py-3 text-right whitespace-nowrap">{p.meta}</td>
        </tr>
      ))}
    </table>
  </Section>`,
    faq: () => `  <Section tone="${TONO_SECCION[s.tono]}">
    <SectionHead eyebrow="Preguntas" title="TODO: el titular de preguntas"${tone} />
    {/* schema: solo si estas preguntas están de verdad en la página. */}
    <FaqList items={preguntas} schema${tone} />
  </Section>`,
    zona: () => `  <Section tone="${TONO_SECCION[s.tono]}"${s.v === 'mapa' ? ' class="relative isolate"' : ''}>
    ${s.v === 'mapa' ? '<div class="fx-blueprint" style="--bp-a:14%;--bp-fade:75%"></div>\n    ' : ''}<SectionHead eyebrow="Dónde trabajamos" title="TODO: el titular de zona"${tone} />
    {/* Nombres propios: es lo que la gente escribe en el buscador. */}
    <ul class="flex flex-wrap gap-2 list-none p-0 mt-8">
      {sitios.map((z) => <li class="text-sm px-3 py-1.5 rounded-full border border-line-strong">{z}</li>)}
    </ul>
  </Section>`,
    contacto: () => `  <Section tone="${TONO_SECCION[s.tono]}" id="contacto">
    <SectionHead eyebrow="Contacto" title="TODO: el titular de contacto"${tone} />
    ${s.v === 'formulario'
      ? `{/* Cuatro campos. Cada campo de más es gente que no lo rellena. */}
    {/* TODO: conectar el envío. Un formulario que no manda nada es peor que no tenerlo. */}
    <form class="grid gap-4 max-w-[40rem] sm:grid-cols-2 mt-8">
      {/* TODO: nombre, teléfono, qué necesita, dónde */}
      <Button type="submit" variant="primary" class="sm:col-span-2">Enviar</Button>
    </form>`
      : `<p class="font-display text-d2 mt-4"><a href="tel:+34TODO" class="text-inherit no-underline">TODO: el teléfono</a></p>
    <p class="mt-2 text-ink-soft">TODO: el horario REAL. Uno inventado genera la primera queja.</p>
    <Button href="https://wa.me/34TODO" variant="wa" external class="mt-8">Escribir por WhatsApp</Button>`}
  </Section>`,
    cierre: () => `  <CtaPanel title="TODO: la última llamada" text="TODO: qué pasa cuando te escriben." />`,
  };

  const f = dentro[s.t];
  return f ? `${nota}\n${f()}` : `${nota}\n  {/* TODO: sección "${s.t}" sin andamio generado. */}`;
}

/** Los datos de ejemplo que el andamio necesita para compilar. */
function astroDatos() {
  const usa = (t) => S.secciones.some((s) => s.t === t);
  const usaBloque = (b) => S.secciones.some((s) => bloqueDe(s) === b);
  const d = [];
  if (usa('servicios') && S.secciones.some((s) => s.t === 'servicios' && s.v === 'indice'))
    d.push(`const servicios = [
  { href: '/servicios/todo', name: 'TODO: el servicio', claim: 'TODO: qué es, en una línea', price: 'desde TODO €' },
];`);
  if (usaBloque('Bento') || usa('galeria'))
    d.push(`const trabajos = [
  { src: '/img/TODO.webp', alt: 'TODO: describe la foto', width: 1200, height: 900 },
];`);
  if (usaBloque('StatRow'))
    d.push(`const cifras = [
  { value: 'TODO', label: 'TODO: qué mide' },
];`);
  if (usaBloque('Steps') || usa('proceso'))
    d.push(`const pasos = [
  { title: 'TODO: el paso', text: 'TODO: qué pasa en ese paso.' },
];`);
  if (usa('precios'))
    d.push(`const partidas = [
  { title: 'TODO: la partida', hint: 'TODO: el gancho', meta: 'desde TODO €', body: 'TODO: qué entra en ese precio.' },
];`);
  if (usa('faq'))
    d.push(`const preguntas = [
  { q: 'TODO: la pregunta que hacen siempre', a: 'TODO: la respuesta, sin rodeos.' },
];`);
  if (usa('zona'))
    d.push(`const sitios = ['TODO: los pueblos, con su nombre propio'];`);
  return d;
}

function astroPagina() {
  const slug = slugDe(S.marca);
  const cuerpo = S.secciones.map(astroSeccion).join('\n\n');

  // Solo se importa lo que se usa: un import muerto en Astro no rompe, pero
  // enseña a copiar imports sin mirar.
  const bloques = [...new Set(S.secciones.map(bloqueDe).filter(Boolean))].sort();
  const primitivos = [];
  if (/<Section\b/.test(cuerpo)) primitivos.push('Section');
  if (/<SectionHead\b/.test(cuerpo)) primitivos.push('SectionHead');
  if (/<Button\b/.test(cuerpo)) primitivos.push('Button');
  const datos = astroDatos();
  const hayFx = S.movimiento.some((m) => MOVIMIENTO[m]?.js) || /data-fx=/.test(cuerpo);

  return `---
/* Portada · ${S.marca}
   Andamio generado por el Estudio de marca. Las secciones y su orden ya están
   decididos; lo que falta es el CONTENIDO, marcado con TODO.

   Antes de tocar esto: opspilot-kit/ASSETS.md. Sin fotos utilizables, logo en
   vector y datos reales no hay maquetación que salve la página.

   El CSS del proyecto tiene que importar, en este orden:
     kit.css → fx.css → themes/${slug}.css → marca-${slug}.css */
import Layout from '../layouts/Layout.astro';
${primitivos.map((p) => `import ${p} from '@opspilot/kit/primitives/${p}.astro';`).join('\n')}
${bloques.map((b) => `import ${b} from '@opspilot/kit/blocks/${b}.astro';`).join('\n')}
import NavBar from '@opspilot/kit/blocks/NavBar.astro';
import SiteFooter from '@opspilot/kit/blocks/SiteFooter.astro';${hayFx ? `
import KitRuntime from '@opspilot/kit/primitives/KitRuntime.astro';` : ''}

${datos.join('\n\n')}
---

<Layout
  title="TODO: título de 55-60 caracteres con el servicio y el sitio"
  description="TODO: 150-160 caracteres. Lo que hace y dónde, sin adjetivos."
>
  {/* Cabecera: ${HEADERS[S.header].n} */}
  <NavBar
    logo={{ src: '/img/TODO-logo.svg', alt: '${esc(S.marca)}' }}
    items={[{ href: '/servicios', label: 'Servicios' }, { href: '/trabajos', label: 'Trabajos' }]}
    cta={{ href: '/contacto', label: 'Presupuesto' }}
  />

  <main>
${cuerpo}
  </main>

  {/* Pie: ${FOOTERS[S.footer].n} */}
  <SiteFooter
    logo={{ src: '/img/TODO-logo.svg', alt: '${esc(S.marca)}' }}
    legal={[{ href: '/aviso-legal', label: 'Aviso legal' }]}
    copyright="TODO: razón social y NIF reales"
  />${hayFx ? `

  {/* Los efectos se cargan solos y solo si hay algo que animar. */}
  <KitRuntime />` : ''}
</Layout>
`;
}

/** Las seis líneas, y la entrada lista para pegar en marcas.json. */
function direccionArteMD() {
  const e = S.ejes, b = BASES[S.base], f = FONDOS[S.fondo];
  const entrada = {
    id: slugDe(S.marca),
    n: S.marca,
    repo: 'TODO',
    sector: S.oficio || 'TODO',
    fecha: new Date().toISOString().slice(0, 10),
    estado: 'en obras',
    ejes: { ...e },
    display: S.display,
    acento: S.acento.toUpperCase(),
    acento2: null,
    fondo: S.fondo === 'ninguno' ? 'color plano' : S.fondo,
    foto: FOTOS[S.foto].n,
    gesto: S.gesto.trim() || 'TODO',
    kit: true,
    doc: `${slugDe(S.marca)}/brand/DIRECCION-ARTE.md`,
  };

  const problemas = conflictos();

  return `# Dirección de arte · ${S.marca}

Generado con el Estudio de marca. Va en \`<repo>/brand/DIRECCION-ARTE.md\`.

## Las seis líneas

\`\`\`
Ejes:     peso ${e.peso} · temperatura ${e.temperatura} · memoria ${e.memoria} · aire ${e.aire}
Display:  ${S.display}${S.ancho ? ' en ancho extendido (font-stretch 116%)' : ''}
Acento:   ${S.acento.toUpperCase()} sobre base «${b.n}» (${b.hue})
Fondo:    ${f.n}${f.dice ? ` — ${f.dice}` : ''}
Foto:     ${FOTOS[S.foto].n}, recorte ${FORMAS[S.forma].n.toLowerCase()}
Gesto:    ${S.gesto.trim() || '⚠ SIN DEFINIR'}
\`\`\`

${S.gesto.trim() ? '' : `> **Falta el gesto.** Sin él la web estará bien hecha y será olvidable.
> Búscalo en las reseñas del cliente, no en su catálogo: ahí es donde la gente
> escribe por qué le contrató en vez de al de al lado.

`}## La página

${S.secciones.map((s, i) => {
  const def = SECCIONES[s.t] || {};
  const v = (def.variantes || []).find((x) => x.id === s.v) || {};
  return `${i + 1}. **${def.n}** · ${v.n || s.v} — ${v.dice || def.dice || ''}`;
}).join('\n')}

## Lo que la herramienta avisó

${problemas.length
  ? problemas.map(([t, d, n]) => `- ${n === 'grave' ? '**✕ SUELO INCUMPLIDO**' : '⚠'} **${t}:** ${d}`).join('\n')
  : 'Nada: las decisiones se sostienen entre sí y no chocan con ninguna web del registro.'}

## Entrada para el registro

Al cerrar la web, pegá esto en \`opspilot-kit/marcas.json\`. Si no se pega, el
registro envejece y la comprobación anti-clon deja de servir para la siguiente.

\`\`\`json
${JSON.stringify(entrada, null, 2)}
\`\`\`
`;
}

function prompt() {
  const b = BASES[S.base];
  const f = FONDOS[S.fondo];
  const piezas = [];
  if (S.fondo !== 'ninguno') piezas.push(f.js ? `Fondo: data-fx="${S.fondo}" (JS, se carga solo)` : `Fondo: .${FONDOS[S.fondo].clase}${f.vars ? ` con ${f.vars}` : ''}`);
  if (ESCENAS[S.escena].clase) piezas.push(`Escenografía: .${ESCENAS[S.escena].clase}${ESCENAS[S.escena].vars ? ` con ${ESCENAS[S.escena].vars}` : ''}`);
  if (ESCENAS[S.escena].borde) piezas.push('Escenografía: .fx-arc-b en el corte de sección');
  if (S.pieza !== 'ninguna') piezas.push(
    `Pieza geométrica: ${PIEZAS[S.pieza].n.toLowerCase()} ${RELLENOS[S.relleno].n.toLowerCase()}, ` +
    `${TAMANOS[S.tam].n.toLowerCase()} (${TAMANOS[S.tam].v}), colocada ${POSICIONES[S.pos].n.toLowerCase()} ` +
    `(left:${POSICIONES[S.pos].x} top:${POSICIONES[S.pos].y}), en un span absoluto detrás del contenido`);
  if (FOTOS[S.foto].clase) piezas.push(`Foto: .${FOTOS[S.foto].clase}${FOTOS[S.foto].vars ? ` con ${FOTOS[S.foto].vars}` : ''}`);
  if (FOTOS[S.foto].js) piezas.push(`Foto: data-fx="ink" con {"mode":"dots","color":"--color-brand","invert":${b.oscuro},"reveal":true}`);
  if (FORMAS[S.forma].clase) piezas.push(`Forma de foto: .${FORMAS[S.forma].clase}`);
  if (TITULARES[S.titular].clase) piezas.push(`Titulares: .${TITULARES[S.titular].clase}`);
  if (S.boton === 'material') piezas.push('Botones: cara con degradado de marca + canto de metal (ver marca-digito.css como referencia)');
  S.modulos.forEach((m) => piezas.push(`Módulo: ${MODULOS[m].n} — ${MODULOS[m].nota}`));
  S.movimiento.filter((m) => m !== 'quieto').forEach((m) => piezas.push(`Movimiento: ${MOVIMIENTO[m].n}${MOVIMIENTO[m].js ? ` (data-fx="${MOVIMIENTO[m].js}")` : ''}`));

  const e = S.ejes;
  return `ENCARGO DE MAQUETACIÓN · ${S.marca}
Generado con el Estudio de marca del kit OpsPilot.

═══ QUÉ HAY QUE HACER ═══
Maquetar la web de ${S.marca}${S.oficio ? ` (${S.oficio})` : ''} con @opspilot/kit (Astro 5 + Tailwind v4),
aplicando exactamente la dirección de arte de abajo. No la reinterpretes: está decidida.

Kit: Documents/GitHub/opspilot-kit  ·  Catálogo vivo: https://opspilotcontact-lgtm.github.io/kit-visual/
Lee antes: opspilot-kit/ASSETS.md (materiales) y opspilot-kit/RECETAS.md (combinaciones).

═══ LAS SEIS LÍNEAS ═══
Ejes:     peso ${e.peso} · temperatura ${e.temperatura} · memoria ${e.memoria} · aire ${e.aire}
Display:  ${S.display}${S.ancho ? ' en ancho extendido (font-stretch 116%)' : ''}
Texto:    ${S.texto}
Acento:   ${S.acento} sobre base «${b.n}» (${b.hue}). Tinta ${S.tinta}.
Fondo:    ${f.n}${f.dice ? ` — ${f.dice}` : ''}
Foto:     ${FOTOS[S.foto].n}${FOTOS[S.foto].nota ? ` — ${FOTOS[S.foto].nota}` : ''}, recorte ${FORMAS[S.forma].n.toLowerCase()}
Gesto:    ${S.gesto.trim() || '⚠ SIN DEFINIR. Búscalo en las reseñas del cliente antes de maquetar: es lo único que no se puede copiar.'}

═══ LA PÁGINA, EN ESTE ORDEN ═══
${S.secciones.map((s, i) => {
  const def = SECCIONES[s.t] || {};
  const v = (def.variantes || []).find((x) => x.id === s.v) || {};
  const capas = (s.capas || []).filter((c) => (def.admite || []).includes(c));
  return `${String(i + 1).padStart(2, '0')}. ${def.n} · ${v.n || s.v}` +
    `\n    ${v.dice || def.dice || ''}` +
    `\n    Fondo de sección: ${({ paper: 'papel', alt: 'papel alterno', deep: 'profundo (texto en blanco)' })[s.tono]}` +
    (capas.length ? `\n    Capas aquí: ${capas.map((c) => NOMBRE_CAPA[c]).join(', ')}` : '');
}).join('\n')}

El orden es una decisión, no una lista: no lo reordenes «para que fluya mejor».
Si una sección no tiene contenido real que poner, se quita — no se rellena.

═══ PIEZAS DEL KIT, EXACTAS ═══
${piezas.map((p) => '· ' + p).join('\n')}
· Cabecera: ${HEADERS[S.header].n}
· Botones: ${BOTONES[S.boton].n}
· Pie: ${FOOTERS[S.footer].n}

═══ TEMA (crear este fichero) ═══
opspilot-kit/src/styles/themes/<marca>.css con los tokens del bloque «Tema CSS» de este encargo.
Importar en el CSS del proyecto: kit.css → fx.css → themes/<marca>.css → marca-<cliente>.css (lo propio).

═══ REGLAS QUE NO SE SALTAN ═══
1. UN fondo principal en toda la web. Un segundo solo si una sección cambia de asunto a propósito.
2. UN tratamiento de foto, el mismo en todas.
3. Máximo DOS formas de recorte.
4. El movimiento se decide una vez: o la web es tranquila o es nerviosa.
5. La escenografía va en las secciones bisagra (paso a oscuro, CTA, cierre), no en todas.
6. Contraste real: cuerpo ≥4.5:1, titulares ≥3:1, medido en la zona PEOR del fondo.
7. Sin JS, todo visible. Ningún efecto puede esconder un precio.
8. prefers-reduced-motion cortado de verdad, no «más suave».
9. Nada de foto de banco. Ni una.
10. Si falta un bloque, se añade AL KIT, nunca suelto en el proyecto.

═══ PRUEBA FINAL ═══
Quita todos los efectos y mira la página. Si sigue entendiéndose, sumaban.
Si se cae, no estabas diseñando: estabas tapando.`;
}

/* ── Diálogo de salida ────────────────────────────────────────────────────── */
/* Los ficheros que salen de aquí. Uno por cosa que hay que crear en el repo,
   con su nombre ya puesto: si el que lo recibe tiene que inventarse dónde va,
   acaba en la carpeta de descargas y no en el proyecto. */
const FICHEROS = {
  prompt: { n: () => `ENCARGO-${slugDe(S.marca)}.md`, tipo: 'text/markdown', texto: () => prompt() },
  astro: { n: () => 'index.astro', tipo: 'text/plain', texto: astroPagina },
  tema: { n: () => `${slugDe(S.marca)}.css`, tipo: 'text/css', texto: temaCSS },
  arte: { n: () => 'DIRECCION-ARTE.md', tipo: 'text/markdown', texto: direccionArteMD },
  json: { n: () => `estudio-${slugDe(S.marca)}.json`, tipo: 'application/json', texto: () => JSON.stringify(S, null, 2) },
};

/** Blob + <a download>. Sin dependencias y sin servidor. */
function descarga(clave) {
  const f = FICHEROS[clave];
  if (!f) return;
  const url = URL.createObjectURL(new Blob([f.texto()], { type: f.tipo + ';charset=utf-8' }));
  const a = document.createElement('a');
  a.href = url; a.download = f.n();
  document.body.appendChild(a); a.click(); a.remove();
  // Sin esto el Blob se queda en memoria hasta recargar. No se nota con uno;
  // sí con veinte descargas en una sesión larga.
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

let vista = 'prompt';
function pintaSalida() {
  $('#salida').value = (FICHEROS[vista] || FICHEROS.prompt).texto();
  document.querySelectorAll('.ui-dialog-tabs button').forEach((b) => b.classList.toggle('on', b.dataset.vista === vista));
}


/* ── El panel del compositor ──────────────────────────────────────────────
   Una lista vertical, una fila por sección. NADA de arrastrar: con ↑↓ se
   reordena igual de rápido, funciona con teclado y no necesita librería. El
   arrastre en una lista de doce elementos dentro de un panel que ya hace
   scroll es peor de usar, no mejor. */

const NOMBRE_CAPA = { fondo: 'fondo', escena: 'escena', pieza: 'pieza', modulos: 'módulos' };
const NOMBRE_TONO = { paper: 'Papel', alt: 'Alterno', deep: 'Profundo' };

function pintaSecciones() {
  const host = $('#secciones');
  if (!host) return;
  host.innerHTML = '';

  S.secciones.forEach((s, i) => {
    const def = SECCIONES[s.t];
    if (!def) return;
    const fila = document.createElement('div');
    fila.className = 'ui-sec';

    const variante = (def.variantes || []).find((v) => v.id === s.v) || {};
    const admite = def.admite || [];

    fila.innerHTML = `
      <div class="ui-sec-top">
        <span class="ui-sec-n tabular">${String(i + 1).padStart(2, '0')}</span>
        <span class="ui-sec-n2"><b>${esc(def.n)}</b><em>${esc(variante.dice || def.dice || '')}</em></span>
        <span class="ui-sec-acc">
          <button type="button" data-a="sube"  title="Subir"    aria-label="Subir ${esc(def.n)}"${i === 0 ? ' disabled' : ''}>↑</button>
          <button type="button" data-a="baja"  title="Bajar"    aria-label="Bajar ${esc(def.n)}"${i === S.secciones.length - 1 ? ' disabled' : ''}>↓</button>
          <button type="button" data-a="clona" title="Duplicar" aria-label="Duplicar ${esc(def.n)}">⧉</button>
          <button type="button" data-a="quita" title="Quitar"   aria-label="Quitar ${esc(def.n)}">✕</button>
        </span>
      </div>
      <div class="ui-sec-vars">
        ${(def.variantes || []).map((v) => `<button type="button" class="${v.id === s.v ? 'on' : ''}"
           data-v="${v.id}" title="${esc(v.dice || '')}">${esc(v.n)}</button>`).join('')}
      </div>
      <div class="ui-sec-pie">
        <span class="ui-sec-tono">
          ${Object.keys(TONOS).map((k) => `<button type="button" class="${k === s.tono ? 'on' : ''}"
             data-tono="${k}" title="Fondo de la sección">${NOMBRE_TONO[k]}</button>`).join('')}
        </span>
        ${admite.length ? `<span class="ui-sec-capas">${admite.map((c) => `
          <label title="Aplicar ${NOMBRE_CAPA[c]} en esta sección">
            <input type="checkbox" data-capa="${c}"${(s.capas || []).includes(c) ? ' checked' : ''}>${NOMBRE_CAPA[c]}
          </label>`).join('')}</span>` : ''}
      </div>`;

    fila.querySelectorAll('[data-a]').forEach((b) =>
      b.addEventListener('click', () => accionSeccion(b.dataset.a, i)));
    fila.querySelectorAll('[data-v]').forEach((b) =>
      b.addEventListener('click', () => { s.v = b.dataset.v; pintaSecciones(); render(); }));
    fila.querySelectorAll('[data-tono]').forEach((b) =>
      b.addEventListener('click', () => { s.tono = b.dataset.tono; pintaSecciones(); render(); }));
    fila.querySelectorAll('[data-capa]').forEach((c) =>
      c.addEventListener('change', () => {
        const set = new Set(s.capas || []);
        c.checked ? set.add(c.dataset.capa) : set.delete(c.dataset.capa);
        s.capas = [...set];
        render();
      }));

    host.appendChild(fila);
  });

  // Añadir: todos los tipos, siempre. Que un tipo ya esté puesto no lo
  // inhabilita — una web puede tener dos galerías o dos bandas.
  const add = document.createElement('div');
  add.className = 'ui-sec-add';
  add.innerHTML = Object.entries(SECCIONES).map(([id, d]) =>
    `<button type="button" data-add="${id}" title="${esc(d.dice || '')}">+ ${esc(d.n)}</button>`).join('');
  add.querySelectorAll('[data-add]').forEach((b) =>
    b.addEventListener('click', () => anadeSeccion(b.dataset.add)));
  host.appendChild(add);

  const n = S.secciones.length;
  $('#secciones-cuenta').textContent = n === 1 ? '1 sección' : `${n} secciones`;
}

function nuevaSeccion(t) {
  const def = SECCIONES[t];
  return {
    t,
    v: ((def.variantes || [])[0] || {}).id || '',
    tono: def.tono || 'paper',
    // Las capas arrancan vacías a propósito: que una sección admita fondo no
    // quiere decir que lo quiera. La regla es «un fondo principal», no «fondo
    // en todas», y el valor por defecto es la que más gente acaba aceptando.
    capas: [],
  };
}

function anadeSeccion(t) {
  if (!SECCIONES[t]) return;
  // Se inserta ANTES del cierre si lo hay: el cierre es la última pantalla por
  // definición, y tener que bajarlo a mano cada vez es un impuesto tonto.
  const fin = S.secciones.findIndex((x) => x.t === 'cierre');
  const s = nuevaSeccion(t);
  if (t !== 'cierre' && fin > -1) S.secciones.splice(fin, 0, s);
  else S.secciones.push(s);
  pintaSecciones(); render();
}

function accionSeccion(a, i) {
  const xs = S.secciones;
  if (a === 'sube' && i > 0) xs.splice(i - 1, 0, xs.splice(i, 1)[0]);
  if (a === 'baja' && i < xs.length - 1) xs.splice(i + 1, 0, xs.splice(i, 1)[0]);
  if (a === 'clona') xs.splice(i + 1, 0, JSON.parse(JSON.stringify(xs[i])));
  if (a === 'quita') xs.splice(i, 1);
  pintaSecciones(); render();
}

/* ── Recetas, enlace compartible y azar con criterio ─────────────────────── */

function aplicaReceta(id) {
  const r = RECETAS[id];
  if (!r) return;
  // La receta decide el ESTILO, no la arquitectura: si trajese secciones,
  // aplicarla borraría la página que ya llevás compuesta.
  S = { ...S, ...JSON.parse(JSON.stringify(r.S)) };
  sincronizaCampos();
  pintaControles(); pintaEjes(); pintaSecciones(); render();
}

/** Los campos que no son fichas hay que ponerlos a mano. */
function sincronizaCampos() {
  $('#marca').value = S.marca;
  $('#oficio').value = S.oficio;
  $('#gesto').value = S.gesto;
  $('#acento').value = S.acento;
  $('#tinta').value = S.tinta;
  $('#ancho').checked = S.ancho;
}

/* ── Persistencia ─────────────────────────────────────────────────────────
   El hash hacía dos trabajos: compartir una composición y no perder el
   trabajo al recargar. Con la página entera dentro del estado deja de servir
   para el segundo — reescribir la URL en cada tecla llena el historial y el
   enlace se vuelve enorme.

   Reparto: `localStorage` guarda el trabajo, callado, en cada render. El hash
   se escribe SOLO al pulsar «Copiar enlace», que es cuando de verdad se quiere
   compartir. Al arrancar manda el hash si lo hay; si no, lo guardado. */
const CLAVE = 'opspilot.estudio.v1';
const codifica = (o) => btoa(unescape(encodeURIComponent(JSON.stringify(o))));
const descodifica = (s) => JSON.parse(decodeURIComponent(escape(atob(s))));

function guarda() {
  try { localStorage.setItem(CLAVE, JSON.stringify(S)); } catch { /* modo privado: se sigue trabajando */ }
}
function enlaceDeEstado() {
  const u = location.origin + location.pathname + '#' + codifica(S);
  try { history.replaceState(null, '', '#' + codifica(S)); } catch { /* da igual */ }
  return u;
}

const clonaComposicion = () => JSON.parse(JSON.stringify(COMPOSICION));

/* Un estado guardado puede venir de una versión anterior del catálogo. Se
   normaliza contra el manifiesto de HOY: una sección que ya no existe se cae,
   una variante renombrada vuelve a la primera y una capa que la sección ya no
   admite se descarta. Vale más perder una decisión que pintar algo roto. */
function normaliza(d) {
  const base = inicial();
  const n = { ...base, ...d, ejes: { ...base.ejes, ...(d.ejes || {}) } };

  const secs = Array.isArray(n.secciones) ? n.secciones : [];
  n.secciones = secs.filter((s) => s && SECCIONES[s.t]).map((s) => {
    const def = SECCIONES[s.t];
    const v = (def.variantes || []).find((x) => x.id === s.v) || (def.variantes || [])[0];
    return {
      t: s.t,
      v: v ? v.id : '',
      tono: TONOS[s.tono] ? s.tono : (def.tono || 'paper'),
      capas: (Array.isArray(s.capas) ? s.capas : []).filter((c) => (def.admite || []).includes(c)),
    };
  });
  if (!n.secciones.length) n.secciones = clonaComposicion();
  return n;
}

function recupera() {
  if (location.hash && location.hash.length > 4) {
    try {
      const d = descodifica(location.hash.slice(1));
      if (d && d.display) { S = normaliza(d); return 'enlace'; }
    } catch { /* hash roto: se sigue por lo guardado */ }
  }
  try {
    const d = JSON.parse(localStorage.getItem(CLAVE) || 'null');
    if (d && d.display) { S = normaliza(d); return 'guardado'; }
  } catch { /* nada guardado */ }
  S = normaliza({});
  return 'nuevo';
}

/* Azar CON criterio: tira combinaciones hasta dar con una que no se
   contradiga a sí misma. Si tras 40 intentos no lo consigue, se queda con la
   que menos conflictos tenía: mejor una propuesta imperfecta que ninguna. */
function azar() {
  const uno = (o) => { const k = Object.keys(o); return k[Math.floor(Math.random() * k.length)]; };
  const displays = DISPLAY.filter(([d]) => d !== 'Bricolage Grotesque' && d !== 'Young Serif').map(([d]) => d);
  const guardado = { marca: S.marca, oficio: S.oficio, gesto: S.gesto };
  let mejor = null, mejorN = 99;

  for (let i = 0; i < 40; i++) {
    S.display = displays[Math.floor(Math.random() * displays.length)];
    S.texto = TEXTO[Math.floor(Math.random() * TEXTO.length)][0];
    S.base = uno(BASES);
    S.fondo = uno(FONDOS);
    S.escena = uno(ESCENAS);
    S.foto = uno(FOTOS);
    S.forma = uno(FORMAS);
    S.header = uno(HEADERS); S.boton = uno(BOTONES); S.titular = uno(TITULARES); S.footer = uno(FOOTERS);
    S.pieza = uno(PIEZAS); S.pos = uno(POSICIONES); S.tam = uno(TAMANOS); S.relleno = uno(RELLENOS);
    S.modulos = Object.keys(MODULOS).sort(() => Math.random() - 0.5).slice(0, 2 + Math.floor(Math.random() * 2));
    S.movimiento = ['reveal'];
    S.ancho = Math.random() < 0.35;
    S.acento = '#' + Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, '0');
    EJES.forEach(([id]) => { S.ejes[id] = 1 + Math.floor(Math.random() * 5); });

    // El gesto siempre falta en una tirada al azar: no cuenta como conflicto.
    const n = conflictos().filter(([t]) => t !== 'Falta el gesto').length;
    if (n === 0) { mejor = null; break; }
    if (n < mejorN) { mejorN = n; mejor = JSON.parse(JSON.stringify(S)); }
  }
  if (mejor) S = mejor;
  Object.assign(S, guardado);

  /* También la ARQUITECTURA, que es la mitad de la sorpresa. Portada y cierre
     se quedan —toda web tiene principio y final—; en medio entran de tres a
     cinco del resto, sin repetir. La escenografía solo cae en las bisagras,
     que es lo que manda RECETAS.md, y el fondo en una sola sección para no
     romper la regla del fondo único. */
  const medias = Object.keys(SECCIONES).filter((k) => k !== 'hero' && k !== 'cierre');
  const elegidas = medias.sort(() => Math.random() - 0.5).slice(0, 3 + Math.floor(Math.random() * 3));
  S.secciones = ['hero', ...elegidas, 'cierre'].map(nuevaSeccion);
  S.secciones[0].capas = ['fondo', 'escena', 'pieza']
    .filter((c) => (SECCIONES.hero.admite || []).includes(c));
  const cierre = S.secciones[S.secciones.length - 1];
  cierre.capas = ['escena'].filter((c) => (SECCIONES.cierre.admite || []).includes(c));
  // Los módulos elegidos tienen que verse en alguna parte.
  const conModulos = S.secciones.find((s) => (SECCIONES[s.t].admite || []).includes('modulos'));
  if (conModulos) conModulos.capas = [...conModulos.capas, 'modulos'];

  sincronizaCampos();
  pintaControles(); pintaEjes(); pintaSecciones(); render();
}

/* ── Arranque ─────────────────────────────────────────────────────────────── */
function enlaza() {
  $('#marca').addEventListener('input', (e) => { S.marca = e.target.value || 'Nombre del cliente'; render(); });
  $('#oficio').addEventListener('input', (e) => { S.oficio = e.target.value; render(); });
  $('#gesto').addEventListener('input', (e) => { S.gesto = e.target.value; avisos(); });
  $('#acento').addEventListener('input', (e) => { S.acento = e.target.value; render(); });
  $('#tinta').addEventListener('input', (e) => { S.tinta = e.target.value; render(); });
  $('#ancho').addEventListener('change', (e) => { S.ancho = e.target.checked; render(); });

  document.querySelectorAll('#anchos button').forEach((b) => b.addEventListener('click', () => {
    document.querySelectorAll('#anchos button').forEach((x) => x.classList.remove('on'));
    b.classList.add('on');
    $('#lienzo').style.width = b.dataset.w;
  }));

  $('#ver-brief').addEventListener('click', () => { pintaSalida(); $('#brief').showModal(); });
  document.querySelectorAll('.ui-dialog-tabs button').forEach((b) =>
    b.addEventListener('click', () => { vista = b.dataset.vista; pintaSalida(); }));
  $('#copiar').addEventListener('click', async () => {
    const t = $('#salida');
    try { await navigator.clipboard.writeText(t.value); }
    catch { t.select(); document.execCommand('copy'); }
    $('#copiado').textContent = 'Copiado al portapapeles';
    setTimeout(() => { $('#copiado').textContent = ''; }, 2200);
  });

  document.querySelectorAll('[data-bajar]').forEach((b) => b.addEventListener('click', () => {
    descarga(b.dataset.bajar);
    $('#copiado').textContent = `Descargado ${FICHEROS[b.dataset.bajar].n()}`;
    setTimeout(() => { $('#copiado').textContent = ''; }, 2600);
  }));

  $('#enlace').addEventListener('click', async () => {
    const u = enlaceDeEstado();
    try { await navigator.clipboard.writeText(u); $('#enlace').textContent = 'Enlace copiado'; }
    catch { $('#enlace').textContent = 'Copia la barra de direcciones'; }
    setTimeout(() => { $('#enlace').textContent = 'Copiar enlace'; }, 2200);
  });

  $('#reset').addEventListener('click', () => {
    S = normaliza({});
    try { localStorage.removeItem(CLAVE); } catch { /* nada que borrar */ }
    history.replaceState(null, '', location.pathname);
    sincronizaCampos();
    pintaControles(); pintaEjes(); pintaSecciones(); render();
  });

  $('#dados').addEventListener('click', azar);
}

/* Arranque. Todo espera al manifiesto: sin catálogo no hay nada que pintar. */
Promise.all([cargaManifiesto(), cargaMarcas()]).then(() => {
  recupera();
  chips('#recetas', Object.entries(RECETAS).map(([k, v]) => [k, v.n, v.d]), null, aplicaReceta);
  pintaControles();
  pintaEjes();
  pintaSecciones();
  enlaza();
  sincronizaCampos();
  render();
}).catch((e) => {
  document.querySelector('#avisos').innerHTML =
    `<div class="ui-aviso"><span>⚠</span><span><b>No se pudo cargar el catálogo:</b> ${e.message}.
     El manifiesto se copia al publicar; en local hay que servir la carpeta con un servidor HTTP,
     no abrir el fichero directamente.</span></div>`;
  console.error(e);
});
