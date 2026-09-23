/* Estudio de marca · color.js
   Utilidades y la ciencia del color: contraste WCAG, Oklab, ΔE.
   Script clásico: comparte el ámbito global con los demás ficheros del
   Estudio y se carga en el orden de index.html. */
'use strict';

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
/** Distancia euclídea en Oklab (ΔE). Es la métrica para colores de croma bajo
    —papeles, grises, acentos apagados—, donde el tono no significa nada. */
function deltaE(a, b) {
  const [x, y] = [oklab(a), oklab(b)];
  return Math.hypot(x.L - y.L, x.A - y.A, x.B - y.B);
}
const UMBRAL_DE = 0.02;

/** Distancia de tono por el lado corto del círculo. */
const dTono = (x, y) => { const d = Math.abs(x - y) % 360; return d > 180 ? 360 - d : d; };

/** «A, B y C» — para que el aviso nombre las webs en vez de contarlas. */
const lista = (xs) => xs.length < 2 ? (xs[0] || '')
  : xs.slice(0, -1).join(', ') + ' y ' + xs[xs.length - 1];

