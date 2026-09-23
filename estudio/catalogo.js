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
    RELLENOS = {}, RECETAS = {}, EJES = [], REGLAS = [], SECCIONES = {}, COMPOSICION = [],
    MARCAJUEGOS = {}, COMPOSICIONES = {};

/* Lo memorable (F0, 23-sep): la rúbrica de 7 pruebas y, por grupo y pieza,
   cuándo aporta más. Los usan el asistente, el motor de propuestas y la
   revisión. APORTA[grupo][id] = texto; RUBRICA = [{id, n, pregunta, …}]. */
let RUBRICA = [], APORTA = {};

/* Las tipografías que trae el CSS del kit: familia → URLs de sus ficheros.
   Se leen de las @font-face del CSS compilado, no se mantienen a mano: así el
   encargo dice exactamente qué .woff2 descargar para montar la web sin el kit. */
let FUENTES = {};

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
    if (p.protocolo) v.protocolo = p.protocolo;
    if (p.sinJs) v.sinJs = p.sinJs;
    if (p.aporta) v.aporta = p.aporta;
    if (p.paleta) Object.assign(v, p.paleta, { hue: p.hue, oscuro: p.oscuro });
    o[p.id] = v;
  });
  return o;
}

/** Carga el manifiesto y rellena los catálogos. Sin él no hay estudio. */
async function cargaManifiesto() {
  const r = await fetch('../_astro/kit.manifest.json?v=e3b11db1', { cache: 'no-cache' });
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
  MARCAJUEGOS = porGrupo(M, 'marca');
  COMPOSICION = M.composicionPorDefecto || [];
  COMPOSICIONES = M.composiciones || {};

  POSICIONES = M.posiciones;
  TAMANOS = M.tamanos;
  RELLENOS = M.rellenos;
  RECETAS = M.recetas;
  EJES = M.ejes.map((e) => [e.id, e.n, e.min, e.max]);
  REGLAS = M.reglas || [];
  RUBRICA = M.rubrica || [];
  APORTA = {};
  M.piezas.filter((p) => p.aporta).forEach((p) => { (APORTA[p.grupo] = APORTA[p.grupo] || {})[p.id] = p.aporta; });

  return M;
}

/**
 * Carga el registro de marcas. A diferencia del manifiesto, si falla NO se
 * para: sin registro el estudio sigue componiendo, solo pierde los avisos de
 * clon. Que falte la comprobación no puede impedir trabajar.
 */
async function cargaMarcas() {
  try {
    const r = await fetch('../_astro/marcas.json?v=2bf0b74d', { cache: 'no-cache' });
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    MARCAS = (await r.json()).marcas || [];
  } catch (e) {
    console.warn('registro de marcas no disponible, sin avisos de clon:', e.message);
  }
}

/**
 * Lee las @font-face del CSS del kit que ya ha cargado la página. Como el
 * registro, si falla no para nada: el encargo solo pierde la lista exacta de
 * ficheros de fuente y remite al CSS.
 */
async function cargaFuentes() {
  try {
    const link = document.querySelector('link[href*="kit-completo.css"]');
    if (!link) return;
    const css = await (await fetch(link.href)).text();
    for (const [, cuerpo] of css.matchAll(/@font-face\{([^}]*)\}/g)) {
      const fam = (cuerpo.match(/font-family:\s*["']?([^;"']+)/) || [])[1];
      const url = (cuerpo.match(/url\(["']?([^)"']+)/) || [])[1];
      if (!fam || !url) continue;
      const abs = new URL(url, link.href).href;
      const k = fam.trim();
      FUENTES[k] = FUENTES[k] || [];
      if (!FUENTES[k].includes(abs)) FUENTES[k].push(abs);
    }
  } catch (e) {
    console.warn('no se pudieron leer las fuentes del kit:', e.message);
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

/* ── Las fotos del cliente ─────────────────────────────────────────────────
   F5 pide una maqueta con las fotos REALES del cliente, y el lienzo solo
   aceptaba el logo: la muestra enseñaba los rótulos de Dígito aunque el
   cliente fuera una peluquería. Ahora se suben (se reducen a 1400 px para el
   lienzo), se diagnostican con las reglas de ASSETS.md y se ven con el
   tratamiento elegido — que es cuando se sabe si fx-tint salva SUS fotos.

   No viajan en el enlace ni en el encargo (pesan megas y son del cliente): se
   guardan en este navegador y el lienzo las lee como URL blob, que es corta y
   del mismo origen que el iframe. */
const CLAVE_FOTOS = 'opspilot.estudio.fotos.v1';
const MAX_FOTOS = 12;
const LADO_LIENZO = 1400;
let FOTOS_CLIENTE = [];   // [{url, datos, w, h, n, b, luz}]

/** Las fotos que ve el lienzo: las del cliente si las hay (en ciclo hasta
    cinco, para que ninguna sección se quede con huecos) y si no, las de ejemplo. */
let FOTO_FIJA = null;   // para el encargo: el marcado sale con una ruta de fichero, no con un blob

/* Las fotos de ejemplo son obras de Dígito. Con un cliente de verdad que aún no
   las ha mandado, enseñarlas es poner trabajos que no son suyos en su web (los
   jueces de la F6 vieron rótulos en la de un centro de entrenamiento). Ahí van
   marcadores que dicen lo que falta; para Dígito, las de ejemplo SON las suyas. */
const FOTOS_PENDIENTES = ['#D9D4C7', '#CFC9BB', '#E3DED2', '#C8C2B4', '#DDD8CC'].map((tono) =>
  'data:image/svg+xml,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600"><rect width="800" height="600" fill="${tono}"/><text x="400" y="292" text-anchor="middle" font-family="sans-serif" font-size="30" fill="#5B574E">FOTO PENDIENTE</text><text x="400" y="336" text-anchor="middle" font-family="sans-serif" font-size="22" fill="#5B574E">obra propia del cliente (P10)</text></svg>`));

function FL() {
  if (FOTO_FIJA) return Array(5).fill(FOTO_FIJA);
  const ajeno = typeof esCliente === 'function' && esCliente() && !/^d[ií]gito/i.test(S.marca);
  const xs = FOTOS_CLIENTE.length ? FOTOS_CLIENTE.map((f) => f.url) : ajeno ? FOTOS_PENDIENTES : FOTOS_DEMO;
  return Array.from({ length: Math.max(5, Math.min(xs.length, 8)) }, (_, i) => xs[i % xs.length]);
}

