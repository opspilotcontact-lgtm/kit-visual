/* Estudio de marca · persistencia.js
   Recetas, composiciones, persistencia y el azar.
   Script clásico: comparte el ámbito global con los demás ficheros del
   Estudio y se carga en el orden de index.html. */
'use strict';

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
  // Un logo guardado sin `src` no es un logo: se descarta en vez de pintar un hueco.
  if (!n.logo || typeof n.logo.src !== 'string' || !n.logo.src.startsWith('data:')) n.logo = null;

  // El contenido: texto, y canales que existan. Un estado de antes de que hubiera
  // bloque de contenido llega sin estas claves y se queda con las vacías.
  CAMPOS_CONTENIDO.forEach((k) => { if (typeof n[k] !== 'string') n[k] = ''; });
  if (!esHex(n.papel)) n.papel = '';
  n.canales = (Array.isArray(n.canales) ? n.canales : []).filter((c) => CANALES[c]);

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

    // El gesto y el contenido siempre faltan en una tirada al azar: el dado
    // decide el estilo, no lo que dice el cliente. No cuentan como conflicto.
    const n = conflictos().filter(([t]) => !t.startsWith('Falta el')).length;
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

