/* Estudio de marca · persistencia.js
   Recetas, composiciones y persistencia.
   Script clásico: comparte el ámbito global con los demás ficheros del
   Estudio y se carga en el orden de index.html. */
'use strict';

/* ── Recetas y enlace compartible ────────────────────────────────────────── */

function aplicaReceta(id) {
  const r = RECETAS[id];
  if (!r) return;
  // La receta decide el ESTILO, no la arquitectura: si trajese secciones,
  // aplicarla borraría la página que ya llevás compuesta.
  S = { ...S, ...JSON.parse(JSON.stringify(r.S)) };
  sincronizaCampos();
  pintaControles(); pintaEjes(); pintaSecciones(); render();
}

/* Una composición de partida: sustituye la lista de secciones y nada más. El
   estilo no se toca, igual que la receta no toca la arquitectura. */
function aplicaComposicion(id) {
  const lista = id === 'defecto' ? COMPOSICION : (COMPOSICIONES[id] || {}).secciones;
  if (!lista) return;
  S.secciones = normaliza({ ...S, secciones: JSON.parse(JSON.stringify(lista)) }).secciones;
  // La llamada final de P12 va por el canal real: sin formulario, directo.
  if (canalesDecididos() && !canal('formulario'))
    S.secciones.forEach((s) => { if (s.t === 'contacto') s.v = 'directo'; });
  pintaSecciones(); render();
}

/* Los campos de contenido. Los que se ven en el lienzo lo repintan; los que
   solo van al encargo actualizan avisos y guardan, sin recargar la muestra. */
const CAMPOS_CONTENIDO = ['np', 'posicionamiento', 'prueba', 'busqueda', 'zona', 'voz',
  'palabrasSi', 'palabrasNo', 'objecion', 'respuestaObjecion', 'pasos', 'listaServicios', 'listaResenas', 'cifras', 'datosContacto'];

/** Los campos que no son fichas hay que ponerlos a mano. */
function sincronizaCampos() {
  CAMPOS_CONTENIDO.forEach((k) => { const el = $('#' + k); if (el) el.value = S[k] || ''; });
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
/* El enlace va SIN el logo. Un data URL de 200 KB dentro del hash produce una
   URL que ni el navegador ni WhatsApp ni el correo aceptan pegar: el enlace
   dejaría de funcionar justo cuando más falta hace. El logo se queda en
   localStorage, que para eso está, y quien abra el enlace verá la forma de
   repuesto con todo lo demás intacto. */
function enlaceDeEstado() {
  const { logo, ...sinLogo } = S;
  const b64 = codifica(sinLogo);
  try { history.replaceState(null, '', '#' + b64); } catch { /* da igual */ }
  return location.origin + location.pathname + '#' + b64;
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

  // La marca, contra el catálogo de hoy.
  if (!FORMAS_MARCA[n.marcaForma]) n.marcaForma = 'arco';
  if (!MARCAJUEGOS[n.marcaJuego]) n.marcaJuego = 'ninguno';
  /* Un logo solo es un logo si es una imagen en base64 de los tipos que se
     aceptan al subirlo. Antes bastaba con que empezara por «data:», y el src
     acaba en un <img> y en un mask:url(): con un enlace fabricado se ejecutaba
     código (revisión adversarial del 23-sep). */
  const lg = n.logo;
  const tipoLogo = /^image\/(png|webp|svg\+xml)$/;
  n.logo = lg && typeof lg.src === 'string' && /^data:image\/(png|webp|svg\+xml);base64,[A-Za-z0-9+/=]+$/.test(lg.src)
    ? { src: lg.src, tipo: tipoLogo.test(lg.tipo) ? lg.tipo : 'image/png',
      w: Number.isFinite(lg.w) && lg.w > 0 ? Math.round(lg.w) : 96,
      h: Number.isFinite(lg.h) && lg.h > 0 ? Math.round(lg.h) : 96,
      bytes: Number.isFinite(lg.bytes) && lg.bytes >= 0 ? Math.round(lg.bytes) : 0,
      aColor: lg.aColor === true,
      ...(typeof lg.formaSrc === 'string' && /^data:image\/svg\+xml;base64,[A-Za-z0-9+/=]+$/.test(lg.formaSrc) ? { formaSrc: lg.formaSrc } : {}) }
    : null;

  /* Todo lo que acaba dentro de HTML o de CSS se valida contra el catálogo o
     contra su forma. Un enlace compartido es texto de otra persona: con un
     acento «#000" onfocus=…» o una display con «</style>» se inyectaba código
     en el asistente, en el panel y en la muestra (revisión del 23-sep). Si un
     catálogo aún no está cargado, esa clave no se toca. */
  const esDe = (cat, v) => cat && Object.keys(cat).length ? Object.prototype.hasOwnProperty.call(cat, v) : true;
  [['base', BASES], ['fondo', FONDOS], ['escena', ESCENAS], ['foto', FOTOS], ['forma', FORMAS],
    ['pieza', PIEZAS], ['header', HEADERS], ['boton', BOTONES], ['titular', TITULARES],
    ['footer', FOOTERS], ['pos', POSICIONES], ['tam', TAMANOS], ['relleno', RELLENOS]]
    .forEach(([k, cat]) => { if (!esDe(cat, n[k])) n[k] = base[k]; });
  if (DISPLAY.length && !DISPLAY.some(([id]) => id === n.display)) n.display = base.display;
  if (TEXTO.length && !TEXTO.some(([id]) => id === n.texto)) n.texto = base.texto;
  n.modulos = (Array.isArray(n.modulos) ? n.modulos : []).filter((m) => esDe(MODULOS, m) && typeof m === 'string');
  n.movimiento = (Array.isArray(n.movimiento) ? n.movimiento : []).filter((m) => esDe(MOVIMIENTO, m) && typeof m === 'string');
  if (!esHex(n.acento)) n.acento = base.acento;
  if (!esHex(n.tinta)) n.tinta = base.tinta;
  const ej = n.ejes && typeof n.ejes === 'object' ? n.ejes : {};
  n.ejes = Object.fromEntries(Object.entries(base.ejes).map(([k, v]) =>
    [k, Number.isInteger(ej[k]) && ej[k] >= 1 && ej[k] <= 5 ? ej[k] : v]));
  ['marca', 'oficio', 'gesto'].forEach((k) => { if (typeof n[k] !== 'string') n[k] = base[k]; });
  n.ancho = !!n.ancho;
  n.marcaEnChrome = n.marcaEnChrome !== false;

  // El contenido: texto, y canales que existan. Un estado de antes de que hubiera
  // bloque de contenido llega sin estas claves y se queda con las vacías.
  CAMPOS_CONTENIDO.forEach((k) => { if (typeof n[k] !== 'string') n[k] = ''; });
  if (!esHex(n.papel)) n.papel = '';
  n.canales = (Array.isArray(n.canales) ? n.canales : []).filter((c) => CANALES[c]);
  /* Sin formulario entre los canales, el contacto va DIRECTO. Solo se aplicaba
     al tocar los canales en el panel o al elegir composición: un estado que
     llegaba hecho (un brief, un enlace) conservaba el formulario, y el encargo
     decía a la vez «no pongas formulario» y «sección: formulario» (constructor
     ciego de Brío, F6). */
  if (n.canales.length && !n.canales.includes('formulario'))
    n.secciones.forEach((s) => { if (s.t === 'contacto' && s.v === 'formulario') s.v = 'directo'; });

  // Lo del asistente, contra valores válidos.
  if (!['', 'propia', 'nueva'].includes(n.identidad)) n.identidad = '';
  n.coloresFijos = !!n.coloresFijos;
  n.displayFija = !!n.displayFija;
  if (typeof MATERIAL_OFICIO !== 'undefined' && !esDe(MATERIAL_OFICIO, n.materialOficio)) n.materialOficio = '';
  const j = n.juicio && typeof n.juicio === 'object' ? n.juicio : {};
  const val = (v) => (Number.isInteger(v) && v >= 0 && v <= 2 ? v : null);
  n.juicio = { logo: val(j.logo), cambiazo: val(j.cambiazo), telefono: val(j.telefono) };

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

/* El azar de antes (40 tiradas sobre todo el catálogo, acento con un hex al
   azar y ejes al azar) se fue el 23-sep: salían webs correctas que no tenían
   nada que ver con el cliente y, además, le cambiaba los ejes, que son SUYOS.
   «Sorpréndeme» está ahora en sorpresa.js, sobre el motor de propuestas. */

