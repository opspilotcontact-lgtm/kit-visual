/* Estudio de marca · secciones.js
   El compositor de secciones: la arquitectura de la página.
   Script clásico: comparte el ámbito global con los demás ficheros del
   Estudio y se carga en el orden de index.html. */
'use strict';

/* ── El panel del compositor ──────────────────────────────────────────────
   Una lista vertical, una fila por sección. NADA de arrastrar: con ↑↓ se
   reordena igual de rápido, funciona con teclado y no necesita librería. El
   arrastre en una lista de doce elementos dentro de un panel que ya hace
   scroll es peor de usar, no mejor. */

/* 'marca' faltaba aquí desde que se añadió la capa: el panel la rotulaba
   «undefined» y en el encargo desaparecía en silencio («Capas aquí: fondo, »),
   porque join() convierte undefined en cadena vacía. */
const NOMBRE_CAPA = { fondo: 'fondo', escena: 'escena', pieza: 'pieza', modulos: 'módulos', marca: 'marca' };
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

