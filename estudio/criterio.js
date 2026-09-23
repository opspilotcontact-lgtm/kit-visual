/* Estudio de marca · criterio.js
   El criterio: tokens, el suelo medido, el anti-clon y las reglas.
   Script clásico: comparte el ámbito global con los demás ficheros del
   Estudio y se carga en el orden de index.html. */
'use strict';

/* ── Tokens del tema ──────────────────────────────────────────────────────── */
function tokens() {
  const b = BASES[S.base];
  /* La tinta suave y las líneas salen de LA TINTA, no de la base. Antes la
     línea iba fija con la tinta de Dígito (rgb 16 19 22) y la tinta suave con
     el gris de la base: con una tinta verde eran tres familias de grises —el
     error que el suelo prohíbe— mientras la nota del token decía lo contrario.
     La suave se busca a mitad de camino hacia el papel y, si no llega a 4.5:1
     sobre la banda alterna, se corrige hasta que llegue. */
  const [tr, tg, tb] = canales(S.tinta);
  /* El papel propio. Con solo cuatro bases, todas las webs del Estudio
     compartían uno de cuatro papeles: la máquina de clonar por el fondo. Si el
     cliente tiene el suyo (la cal de Córdoba Soluciona, el papel de su
     rótulo), manda; la franja alterna se deriva de él hacia la tinta. En las
     bases oscuras no se ofrece: ahí el papel ES la base. */
  const propio = !b.oscuro && esHex(S.papel);
  const papel = propio ? S.papel : b.paper;
  const alterno = propio ? mezcla(S.papel, S.tinta, 0.94) : b.alt;
  let suaveTinta = b.soft;
  if (!b.oscuro) {
    const s0 = mezcla(S.tinta, papel, 0.64);
    suaveTinta = ratio(s0, alterno) >= 4.5 ? s0 : (corrige(s0, alterno, 4.5) || b.soft);
  }
  return {
    '--color-brand': S.acento,
    '--color-brand-dim': ajusta(S.acento, 0.82),
    '--color-brand-ink': sobre(S.acento),
    // El fondo suave es el acento DILUIDO EN EL PAPEL, no el acento aclarado:
    // multiplicar canales satura en vez de suavizar (un marrón #8C5A3C daba un
    // naranja chillón #FFAB72). Va al tema exportado y a fx-highlight.
    '--color-brand-soft': mezcla(S.acento, papel, 0.16),
    '--color-ink': b.oscuro ? '#F2F4F6' : S.tinta,
    '--color-ink-soft': suaveTinta,
    '--color-deep': b.deep,
    '--color-deep-soft': b.deepSoft,
    '--color-paper': papel,
    '--color-paper-alt': alterno,
    '--color-surface': b.oscuro ? b.alt : '#FFFFFF',
    '--color-metal': '#788088',
    '--color-metal-hi': '#C9CDD2',
    '--color-metal-lo': '#4A5057',
    '--color-line': b.oscuro ? 'rgb(255 255 255 / 12%)' : `rgb(${tr} ${tg} ${tb} / 10%)`,
    '--color-line-strong': b.oscuro ? 'rgb(255 255 255 / 22%)' : `rgb(${tr} ${tg} ${tb} / 18%)`,
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
  /* Una marca no choca consigo misma. Al rehacer el encargo de una web que ya
     está en el registro (pasó con Córdoba Soluciona el 23-sep), el Estudio
     avisaba de que su tipografía «ya está en Córdoba Soluciona»: quien leyera
     el encargo cambiaría la letra de la propia marca. */
  const yo = slugDe(S.marca);
  const registro = MARCAS.filter((m) => m.id !== yo && slugDe(m.n) !== yo);
  if (!registro.length) return a;

  // 1) La display. Se compara por FAMILIA: «Archivo» y «Archivo Black» son la
  //    misma letra con otro peso, y contarlas como distintas es justo cómo se
  //    coló cuatro veces sin que saltara nada.
  const repes = registro.filter((m) => familia(m.display) === familia(S.display));
  if (repes.length)
    a.push([`${S.display} ya está en ${repes.length === 1 ? 'otra web' : repes.length + ' webs'}`,
      `la llevan ${lista(repes.map((m) => m.n))}. La letra es lo primero que identifica una marca: repetida, las dos se leen como la misma plantilla con otro logo.`]);

  // 2) El acento, en OKLCH. A croma bajo el tono es ruido numérico, así que un
  //    acento casi gris se compara por distancia en Oklab (ΔE), como el papel.
  const mio = oklch(S.acento);
  registro.forEach((m) => {
    if (!esHex(m.acento)) return;
    const o = oklch(m.acento);
    if (mio.C < 0.04 || o.C < 0.04) {
      const d = deltaE(S.acento, m.acento);
      if (d <= UMBRAL_DE)
        a.push([`El acento choca con ${m.n}`,
          `${S.acento.toUpperCase()} y ${m.acento.toUpperCase()} están a ΔE ${d.toFixed(3)} en Oklab: por debajo de ${UMBRAL_DE} no se distinguen a ojo.`]);
      return;
    }
    const dh = dTono(mio.H, o.H), dl = Math.abs(mio.L - o.L);
    if (dh <= 12 && dl <= 0.15)
      a.push([`El acento choca con ${m.n}`,
        `${S.acento.toUpperCase()} y ${m.acento.toUpperCase()} están a ${dh.toFixed(0)}° de tono y ${(dl * 100).toFixed(0)}% de claridad en OKLCH. En RGB parecen distintos —por eso se cuela—, pero en pantalla es el mismo color.`]);
  });

  // 3) El temperamento. La skill pide al menos DOS ejes de diferencia; se
  //    comprueba contra todas las webs que tengan ejes escritos, no solo las
  //    del mismo sector: el clon no distingue de oficios.
  registro.forEach((m) => {
    if (!m.ejes) return;
    const d = CLAVES_EJE.filter((k) => Math.abs(S.ejes[k] - m.ejes[k]) >= 1).length;
    // Los ejes estimados por IA (origenEjes: 'est') cuentan, pero se dice: un
    // [est] no puede leerse como [sabido] (protocolo, regla de las etiquetas).
    if (d < 2)
      a.push([`Mismo temperamento que ${m.n}`,
        `se diferencian en ${d} de los cuatro ejes y hacen falta dos. Con el mismo temperamento, cambiar el color no cambia la web.` +
        (m.origenEjes === 'est' ? ` (Los ejes de ${m.n} son una estimación [est] de la IA, pendiente de validar.)` : '')]);
  });

  // 3b) El papel. El único choque REAL medido entre 14 webs fue de papeles
  //     (Rodríguez y Córdoba Soluciona, 23-sep) y el registro solo miraba el
  //     acento: no lo habría visto. A croma bajo el tono no sirve, así que se
  //     mide la distancia euclídea en Oklab con 0,02 de umbral, que es el
  //     límite de lo que se distingue a ojo.
  //     Calibrado con el registro real (23-sep): los blancos rotos son todos
  //     parecidos, y a 0,02 SOLO por papel chocaban 32 de 66 pares — un aviso
  //     que salta siempre se ignora. El caso real no era el papel solo: eran
  //     papel + verdes cercanos + mismo sector. Así que el papel avisa cuando
  //     además coincide algo más con esa misma web: acento a ≤30° de tono,
  //     la misma letra o el temperamento. En el registro eso deja 14 pares.
  const miPapel = tokens()['--color-paper'];
  if (esHex(miPapel)) {
    registro.filter((m) => esHex(m.papel)).forEach((m) => {
      const d = deltaE(miPapel, m.papel);
      if (d > UMBRAL_DE) return;
      const mas = [];
      if (esHex(m.acento)) {
        const o = oklch(m.acento);
        if (mio.C >= 0.04 && o.C >= 0.04 && dTono(mio.H, o.H) <= 30) mas.push(`un acento a ${dTono(mio.H, o.H).toFixed(0)}° de tono`);
      }
      if (familia(m.display) === familia(S.display)) mas.push('la misma letra');
      if (m.ejes && CLAVES_EJE.filter((k) => Math.abs(S.ejes[k] - m.ejes[k]) >= 1).length < 2) mas.push('el temperamento');
      if (mas.length)
        a.push([`El papel y ${lista(mas)} coinciden con ${m.n}`,
          `${miPapel.toUpperCase()} y ${m.papel.toUpperCase()} están a ΔE ${d.toFixed(3)} en Oklab (por debajo de ${UMBRAL_DE} no se distinguen a ojo) y además comparten ${lista(mas)}. Juntas, las dos webs se leen como la misma: cambia el papel (papel propio) o lo otro.`]);
    });
  }

  // 4) El gesto. Nunca se repite, y el cliché del sector no cuenta como gesto.
  const g = S.gesto.trim().toLowerCase();
  if (g) {
    const igual = registro.find((m) => m.gesto && m.gesto.toLowerCase().includes(g.slice(0, 24)));
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

