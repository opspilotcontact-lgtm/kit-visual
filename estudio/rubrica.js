/* Estudio de marca · rubrica.js
   Lo memorable, medido (F0, 23-sep). Las 7 pruebas vienen del manifiesto
   (RUBRICA); aquí se calculan las cuatro «auto» sobre el estado y se leen las
   tres de «juicio» (S.juicio) que responde quien revisa. La calibración:
   Córdoba Soluciona 13/14, Dígito v2 6/14.
   Script clásico: comparte el ámbito global con los demás ficheros del
   Estudio y se carga en el orden de index.html. */
'use strict';

/* Los juegos de marca que ponen la forma del logo DENTRO de la página, visibles
   en reposo. «trama» cuenta para repetir, pero no firma una portada: a 6 % se
   intuye, no se ve. */
const JUEGOS_FIRMA = ['ventana', 'sello', 'calado', 'agua'];
/* Y de esos, solo la ventana FIRMA la primera pantalla: grande y a la vista.
   Medido en las capturas de la IA directora (F4, 23-sep, Dígito): el calado
   caía al pie de la portada, por debajo de los 800 px; el sello era un punto de
   3rem y la marca de agua va al 7 %. Están, pero no se recuerdan: valen 1. */
const JUEGOS_REPOSO = ['ventana'];
const TITULAR_TRATADO = ['knockout', 'extendido', 'trama', 'escalonado', 'outline'];

const capasDe = (s) => (s.capas || []).filter((c) => ((SECCIONES[s.t] || {}).admite || []).includes(c));

/** Firma en reposo: ¿se ve la forma de la marca en la primera pantalla sin mover nada? */
function pruebaReposo() {
  const hero = S.secciones.find((s) => s.t === 'hero') || S.secciones[0];
  if (!hero) return [0, 'La página no tiene primera sección.'];
  const capas = capasDe(hero);
  const juego = (MARCAJUEGOS[S.marcaJuego] || {}).n || S.marcaJuego;
  if (capas.includes('marca') && JUEGOS_REPOSO.includes(S.marcaJuego))
    return [2, `La forma de la marca está en la primera pantalla (${juego}), grande y en reposo.`];
  if (capas.includes('marca') && JUEGOS_FIRMA.includes(S.marcaJuego))
    return [1, `La forma de la marca está en la portada (${juego}), pero pequeña, tenue o fuera de la primera pantalla: se intuye, no firma. La que firma es la ventana.`];
  const forma = (capas.includes('escena') && S.escena !== 'ninguna') || (capas.includes('pieza') && S.pieza !== 'ninguna');
  const titular = TITULAR_TRATADO.includes(S.titular) || S.ancho;
  if (forma || titular)
    return [1, 'Hay forma o letra con carácter en la portada, pero no es la forma de la marca: se recuerda la web, no a quién es.'];
  const soloMovimiento = S.movimiento.some((m) => (MOVIMIENTO[m] || {}).js) || S.modulos.includes('sign');
  return [0, soloMovimiento
    ? 'La firma depende del movimiento: en una captura no se ve. Es lo que le pasa a Dígito.'
    : 'La primera pantalla no tiene firma: tapando el logo, es cualquiera.'];
}

/** Repetición: ¿la firma es ESTRUCTURA en 3 sitios o más? */
function pruebaRepeticion() {
  const sitios = [];
  if (S.marcaEnChrome) sitios.push('cabecera', 'pie');
  if (S.marcaJuego && S.marcaJuego !== 'ninguno')
    S.secciones.forEach((s, i) => { if (capasDe(s).includes('marca')) sitios.push(`${String(i + 1).padStart(2, '0')} ${(SECCIONES[s.t] || {}).n}`); });
  const n = sitios.length;
  const pts = n >= 4 ? 2 : n === 3 ? 1 : 0;
  return [pts, n
    ? `La forma de la marca aparece en ${n} ${n === 1 ? 'sitio' : 'sitios'}: ${lista(sitios)}.${pts < 2 ? ' Hacen falta la cabecera, el pie y al menos dos secciones.' : ''}`
    : 'La forma de la marca no aparece en la página: solo el nombre.'];
}

/** Contención: dos colores, una forma, un fondo; que las capas no se pisen. */
function pruebaContencion() {
  let p = 2;
  const mal = [];
  const hero = S.secciones.find((s) => s.t === 'hero');
  if (hero) {
    const activas = capasDe(hero).filter((c) =>
      (c === 'fondo' && S.fondo !== 'ninguno') || (c === 'escena' && S.escena !== 'ninguna') ||
      (c === 'pieza' && S.pieza !== 'ninguna') || (c === 'marca' && S.marcaJuego !== 'ninguno'));
    if (activas.length > 2) { p--; mal.push(`la portada apila ${activas.length} capas (${activas.join(', ')})`); }
  }
  const movJs = S.movimiento.filter((m) => (MOVIMIENTO[m] || {}).js).length;
  if (movJs > 2) { p--; mal.push(`${movJs} movimientos con JavaScript compiten`); }
  if (S.modulos.length > 3) { p--; mal.push(`${S.modulos.length} módulos a la vez`); }
  return [Math.max(0, p), mal.length ? `Se pisa: ${lista(mal)}.` : 'Un acento, un fondo, una forma de firma: nada compite.'];
}

/** Registro: ¿se distingue del portfolio? Son los avisos de clon, contados. */
function pruebaRegistro() {
  const c = problemasClon();
  const n = c.length;
  return [n === 0 ? 2 : n === 1 ? 1 : 0, n ? `Choca con el portfolio: ${c.map(([t]) => t).join(' · ')}.` : 'No se parece a ninguna web del registro.'];
}

const PRUEBAS_AUTO = {
  reposo: pruebaReposo,
  repeticion: pruebaRepeticion,
  contencion: pruebaContencion,
  registro: pruebaRegistro,
};

/**
 * La rúbrica completa sobre el estado actual. Cada fila:
 * { id, n, pregunta, como, mide, puntos (0-2 o null si falta el juicio), motivo }
 */
function evaluaRubrica() {
  return RUBRICA.map((r) => {
    if (r.mide === 'auto' && PRUEBAS_AUTO[r.id]) {
      const [puntos, motivo] = PRUEBAS_AUTO[r.id]();
      return { ...r, puntos, motivo };
    }
    const v = (S.juicio || {})[r.id];
    return { ...r, puntos: Number.isInteger(v) ? v : null, motivo: Number.isInteger(v) ? '' : 'Sin responder: lo responde quien revisa.' };
  });
}

/** Total, máximo y cuántas de juicio faltan. Las que faltan cuentan 0. */
function totalRubrica(filas = evaluaRubrica()) {
  return {
    puntos: filas.reduce((s, f) => s + (f.puntos || 0), 0),
    max: filas.length * 2,
    pendientes: filas.filter((f) => f.puntos === null).length,
    auto: filas.filter((f) => f.mide === 'auto').reduce((s, f) => s + f.puntos, 0),
    maxAuto: filas.filter((f) => f.mide === 'auto').length * 2,
  };
}
