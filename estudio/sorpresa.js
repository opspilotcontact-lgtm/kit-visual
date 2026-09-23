/* Estudio de marca · sorpresa.js
   «Sorpréndeme» con criterio (F3, 23-sep). Antes tiraba dados sobre todo el
   catálogo —acento incluido, un hex al azar— y se quedaba con la tirada que
   menos reglas rompía: salían webs correctas y sin nada que ver con el
   cliente. Ahora la sorpresa es la mejor propuesta del motor para una semilla
   nueva: parte de SUS ejes, sus materiales y el registro, firma en reposo y
   dice por qué. Con marca propia no le toca los colores ni la letra.
   «Variar esta» deja letra y color y busca otra firma; «Deshacer» vuelve a lo
   que había antes del clic, que es lo que da permiso para probar.
   Script clásico: comparte el ámbito global con los demás ficheros del
   Estudio y se carga en el orden de index.html. */
'use strict';

let SORPRESA = null;   // { p: la propuesta aplicada, antes: el estado de antes del clic }

const semillaNueva = () => Math.floor(Math.random() * 2 ** 31);

/** Lo que cambia a la vista entre dos estados: sin esto, «variar» podía devolver lo mismo. */
const firmaVisible = (x) => [x.marcaJuego, x.escena, x.fondo, x.foto, x.forma].join('|');

/**
 * Las candidatas de una sorpresa. `variar`: misma letra y mismo color que
 * ahora (se fijan un momento, como si fueran de su marca) y otra firma. Sin DOM:
 * así se prueba en node.
 */
function candidatasSorpresa({ variar = false, semilla = semillaNueva() } = {}) {
  if (!variar) return proponer({ n: 3, semilla });
  const fijos = { coloresFijos: S.coloresFijos, displayFija: S.displayFija };
  S.coloresFijos = true; S.displayFija = true;
  let ps;
  // Seis y no tres: si la actual ya es la mejor firma, hace falta mirar más abajo.
  try { ps = proponer({ n: 6, semilla }); } finally { Object.assign(S, fijos); }
  const ahora = firmaVisible(S);
  // Primero las que cambian la FIRMA (juego o escena): medido el 23-sep, cuatro
  // de cinco variaciones dejaban el mismo juego y solo movían fondo o foto, y
  // eso no se lee como otra opción. El orden del motor se respeta dentro.
  const otraFirma = (p) => (p.cambios.marcaJuego !== S.marcaJuego || p.cambios.escena !== S.escena ? 1 : 0);
  return ps.filter((p) => firmaVisible({ ...S, ...p.cambios }) !== ahora)
    .sort((x, y) => otraFirma(y) - otraFirma(x));
}

function sorprende(variar = false) {
  const antes = JSON.parse(JSON.stringify(S));
  const ps = candidatasSorpresa({ variar });
  const p = ps[0];
  if (!p) {
    pintaSorpresa('Sin sorpresa posible', variar
      ? 'Con esta letra y este color no sale otra firma que pase el suelo. Prueba «Otra».'
      : 'Ninguna combinación pasa el suelo de contraste con estos colores. Revísalos.');
    return;
  }
  aplicaPropuesta(p);
  SORPRESA = { p, antes };
  repintaTodo();
  pintaSorpresa(p.nombre, `${p.porque} Firma medida: ${p.auto}/${p.maxAuto}.`);
}

function deshaceSorpresa() {
  if (!SORPRESA) return;
  S = normaliza(SORPRESA.antes);
  SORPRESA = null;
  repintaTodo();
  $('#sorpresa').hidden = true;
}

/* Panel Y asistente. Sin sincronizaCampos, los selectores de color del panel
   se quedaban con el acento de antes y el siguiente toque lo volvía a escribir;
   sin pintaPaso, el paso abierto enseñaba una página que ya no era la de S
   (revisión del 23-sep). */
function repintaTodo() {
  sincronizaCampos(); pintaControles(); pintaEjes(); pintaSecciones(); render();
  if (enAsistente()) pintaPaso();
}

function pintaSorpresa(nombre, porque) {
  $('#sorpresa-n').textContent = nombre;
  $('#sorpresa-p').textContent = porque;
  $('#sorpresa-deshacer').disabled = !SORPRESA;
  $('#sorpresa-variar').disabled = !SORPRESA;
  $('#sorpresa').hidden = false;
}

function enlazaSorpresa() {
  $('#dados').addEventListener('click', () => sorprende(false));
  $('#sorpresa-otra').addEventListener('click', () => sorprende(false));
  $('#sorpresa-variar').addEventListener('click', () => sorprende(true));
  $('#sorpresa-deshacer').addEventListener('click', deshaceSorpresa);
  $('#sorpresa-cerrar').addEventListener('click', () => { $('#sorpresa').hidden = true; });
}
