/* Estudio de marca · propuestas.js
   El motor de propuestas (F2-F3, 23-sep). En vez de tirar dados y filtrar, arma
   candidatos con criterio —los ejes del cliente, el registro del portfolio y la
   lección de lo memorable (firma en reposo, repetida)—, los puntúa con la
   rúbrica y el suelo, y devuelve los mejores DISTINTOS entre sí, cada uno con
   su porqué. Con identidad propia no toca sus colores ni su letra.
   Script clásico: comparte el ámbito global con los demás ficheros del
   Estudio y se carga en el orden de index.html. */
'use strict';

/* ── Azar con semilla ─────────────────────────────────────────────────────
   Reproducible: la misma semilla da las mismas propuestas. Así «otras tres»
   es otra semilla y una propuesta se puede volver a pedir. (mulberry32) */
function azarCon(semilla) {
  let a = semilla >>> 0;
  return () => {
    a = (a + 0x6D2B79F5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
/** Elige con pesos: [[valor, peso], …]. */
function conPeso(rnd, pares) {
  const total = pares.reduce((s, [, p]) => s + Math.max(0, p), 0);
  if (total <= 0) return pares[0][0];
  let x = rnd() * total;
  for (const [v, p] of pares) { x -= Math.max(0, p); if (x <= 0) return v; }
  return pares[pares.length - 1][0];
}

/* ── Color desde OKLCH ────────────────────────────────────────────────────
   La inversa de oklab() (color.js). Si el color cae fuera de sRGB se le baja
   el croma hasta que entre, en vez de recortar canales y cambiarle el tono. */
function desdeOklch(L, C, H) {
  const lineal = (v) => (v <= 0.0031308 ? 12.92 * v : 1.055 * Math.pow(v, 1 / 2.4) - 0.055);
  const h = (H * Math.PI) / 180;
  for (let c = C; c >= 0; c -= 0.004) {
    const A = c * Math.cos(h), B = c * Math.sin(h);
    const l = (L + 0.3963377774 * A + 0.2158037573 * B) ** 3;
    const m = (L - 0.1055613458 * A - 0.0638541728 * B) ** 3;
    const s = (L - 0.0894841775 * A - 1.2914855480 * B) ** 3;
    const rgb = [
      4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
      -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
      -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s,
    ];
    if (rgb.every((v) => v >= -0.0005 && v <= 1.0005))
      return '#' + rgb.map((v) => Math.round(Math.min(1, Math.max(0, lineal(Math.min(1, Math.max(0, v))))) * 255)
        .toString(16).padStart(2, '0')).join('').toUpperCase();
  }
  return '#6B737B';
}

/* ── El criterio, como tablas ─────────────────────────────────────────────
   Afinidad de cada display con [peso, temperatura, memoria]. Es criterio de
   oficio (skill direccion-arte-web, capa 2) y sirve para ORDENAR candidatos,
   no para decidir solo: el registro y la rúbrica pesan más. */
const AFIN_DISPLAY = {
  'Archivo': [4, 2, 2], 'Big Shoulders Display': [5, 2, 2], 'Fraunces': [3, 4, 4],
  'Bodoni Moda': [2, 3, 5], 'Young Serif': [4, 4, 4], 'Anton': [5, 2, 1],
  'Unbounded': [4, 2, 1], 'Syne': [3, 3, 1], 'Cormorant': [1, 4, 4],
  'Instrument Serif': [2, 3, 4], 'Epilogue': [3, 3, 2], 'Space Grotesk': [3, 1, 1],
  'Newsreader': [2, 3, 4], 'Literata': [3, 3, 4], 'Schibsted Grotesk': [3, 2, 2],
};
const SERIF = new Set(['Fraunces', 'Bodoni Moda', 'Young Serif', 'Cormorant', 'Instrument Serif', 'Newsreader', 'Literata']);

/* Colores de MATERIAL, no de catálogo: cada tono tiene nombre de cosa (así el
   porqué se entiende) y la temperatura que transmite. El motor los usa solo si
   el cliente no trae los suyos. */
const MATERIALES = [
  { n: 'vino', h: 18, t: 4 }, { n: 'terracota', h: 40, t: 5 }, { n: 'ocre', h: 78, t: 4 },
  { n: 'oliva', h: 118, t: 4 }, { n: 'verde botella', h: 152, t: 3 }, { n: 'verde agua', h: 185, t: 2 },
  { n: 'turquesa', h: 200, t: 2 }, { n: 'petróleo', h: 215, t: 2 }, { n: 'pizarra', h: 238, t: 1 },
  { n: 'azul acero', h: 250, t: 1 }, { n: 'índigo', h: 278, t: 2 }, { n: 'berenjena', h: 305, t: 4 },
  { n: 'ciruela', h: 330, t: 4 }, { n: 'rosa viejo', h: 355, t: 5 },
];
/* El color sale del MATERIAL con el que trabaja el cliente (ASSETS.md, regla 2
   del color). El asistente lo pregunta; el motor multiplica por 3 esos tonos.
   Sin esto, a una carpintería le podía tocar un rosa viejo solo porque el
   portfolio ya había gastado los ocres. */
const MATERIAL_OFICIO = {
  madera: { n: 'Madera', tonos: ['ocre', 'terracota', 'vino'] },
  piedra: { n: 'Piedra y cal', tonos: ['pizarra', 'ocre', 'verde botella'] },
  metal: { n: 'Metal', tonos: ['azul acero', 'pizarra', 'petróleo'] },
  tierra: { n: 'Tierra y barro', tonos: ['terracota', 'ocre', 'oliva'] },
  vegetal: { n: 'Plantas', tonos: ['verde botella', 'oliva', 'verde agua'] },
  agua: { n: 'Agua', tonos: ['turquesa', 'verde agua', 'petróleo'] },
  textil: { n: 'Tela y piel', tonos: ['índigo', 'vino', 'rosa viejo'] },
  cuerpo: { n: 'El cuerpo (estética, bienestar)', tonos: ['rosa viejo', 'ciruela', 'terracota'] },
  papel: { n: 'Papel y tinta', tonos: ['índigo', 'vino', 'pizarra'] },
  digital: { n: 'Pantalla (software, datos)', tonos: ['índigo', 'petróleo', 'turquesa'] },
};
/* Medido el 23-sep con el registro: el portfolio ya usa casi todos los tonos
   cálidos (rojos, naranjas, amarillos y oliva, de 27° a 125°). A un cliente
   cálido le quedan libres la berenjena, la ciruela y el rosa viejo; los demás
   siguen disponibles, pero castigados por cercanía. */

const distEjes = (a, e) => Math.hypot(a[0] - e.peso, a[1] - e.temperatura, a[2] - e.memoria);

/** Un candidato completo: solo ESTILO y capas. El contenido del cliente no se toca. */
function candidato(rnd) {
  const e = S.ejes;
  const c = {};
  const usadas = new Set(MARCAS.map((m) => familia(m.display)));

  // La letra: la del cliente si es suya; si no, la que mejor casa con los ejes,
  // castigando las que ya lleva otra web del portfolio.
  c.display = S.displayFija ? S.display : conPeso(rnd, Object.entries(AFIN_DISPLAY)
    .filter(([d]) => DISPLAY.some(([id]) => id === d))
    .map(([d, a]) => [d, Math.exp(-distEjes(a, e)) * (usadas.has(familia(d)) ? 0.12 : 1)]));
  c.texto = SERIF.has(c.display) ? (e.temperatura <= 2 ? 'Schibsted Grotesk' : 'Instrument Sans')
    : (e.memoria >= 4 ? 'Literata' : 'Instrument Sans');
  c.ancho = c.display === 'Archivo' && e.peso >= 4 && rnd() < 0.6;

  // El papel: cálido o frío según la temperatura; galería si pide mucho aire.
  if (!S.coloresFijos) {
    c.base = e.temperatura >= 4 ? (e.aire >= 4 ? 'galeria' : 'papelCalido')
      : e.temperatura <= 2 ? 'papelFrio' : (e.memoria >= 3 ? 'papelCalido' : 'papelFrio');
    c.papel = '';
    // El acento: un material cuya temperatura case. La temperatura MANDA sobre
    // el portfolio: primera versión al revés y a un cliente cálido le salían
    // acentos fríos (verde agua, petróleo) solo por esquivar los rojos ya usados.
    // Cerca del portfolio se castiga, pero sin anular.
    // Y solo materiales a un punto de temperatura: forzar variedad entre las tres
    // propuestas colaba un petróleo en un cliente de temperatura 5.
    const cercanos = MATERIALES.filter((m) => Math.abs(m.t - e.temperatura) <= 1);
    const suyos = new Set(((MATERIAL_OFICIO[S.materialOficio] || {}).tonos) || []);
    const pool = suyos.size ? MATERIALES.filter((m) => suyos.has(m.n) || Math.abs(m.t - e.temperatura) <= 1)
      : (cercanos.length ? cercanos : MATERIALES);
    const mat = conPeso(rnd, pool.map((m) => {
      const cerca = MARCAS.some((x) => esHex(x.acento) && oklch(x.acento).C >= 0.04 && dTono(oklch(x.acento).H, m.h) <= 30);
      return [m, Math.exp(-Math.abs(m.t - e.temperatura) / 0.8) * (cerca ? 0.4 : 1) * (suyos.has(m.n) ? 3 : 1)];
    }));
    // La claridad: la que pide el peso, pero moviéndola hasta que el acento pase
    // el suelo (3:1 sobre el fondo profundo y su texto a 4.5:1). La primera
    // versión no lo comprobaba y a un cliente técnico y pesado le salían acentos
    // oscuros que el suelo tiraba TODOS: cero propuestas.
    const deep = (BASES[c.base] || {}).deep || '#14171A';
    const C = 0.13 + (e.memoria <= 2 ? 0.03 : 0) - (e.memoria >= 4 ? 0.02 : 0);
    const L0 = e.peso >= 4 ? 0.46 : e.peso <= 2 ? 0.58 : 0.52;
    const pasa = (h) => ratio(h, deep) >= 3 && ratio(sobre(h), h) >= 4.5;
    let acento = null;
    for (const d of [0, 0.03, -0.03, 0.06, -0.06, 0.09, 0.12, 0.15]) {
      const h = desdeOklch(Math.min(0.8, Math.max(0.3, L0 + d)), C, mat.h);
      if (pasa(h)) { acento = h; break; }
    }
    c.acento = acento || desdeOklch(0.62, C, mat.h);
    c.material = mat.n;
    const hBase = { papelFrio: 250, papelCalido: 70, galeria: 80 }[c.base] || 250;
    c.tinta = desdeOklch(0.25, 0.022, hBase);

    // El papel de la base es el de media agencia: si con esta letra, este
    // acento o este temperamento ya lo tiene otra web, se tiñe del MISMO
    // material que el acento (la cal de Córdoba, el papel de Rodríguez). Medido
    // el 23-sep: a un cliente cálido y ligero las tres propuestas le perdían el
    // registro por el papel de MCF. Se pregunta a la regla anti-clon de verdad
    // (problemasClon), no a una copia de ella.
    const chocaPapel = (papel) => {
      const antes = S;
      S = { ...antes, ...c, papel };
      try { return problemasClon().some(([t]) => t.startsWith('El papel')); } finally { S = antes; }
    };
    if (chocaPapel('')) {
      for (const [L, C] of [[0.968, 0.014], [0.958, 0.018], [0.972, 0.022], [0.95, 0.024]]) {
        const p = desdeOklch(L, C, mat.h);
        if (!chocaPapel(p)) { c.papel = p; break; }
      }
    }
  }

  // El fondo: «ninguno» pesa siempre mucho (a menudo es lo mejor); los demás,
  // según temperatura y aire, y nunca uno que la regla del manifiesto prohíba.
  const fondos = [['ninguno', 3]];
  if (e.temperatura <= 2) fondos.push(['grid', 1], ['blueprint', 1.2], ['gridwarp', 0.8], ['contour', e.aire <= 3 ? 0.8 : 0.3]);
  else if (e.temperatura >= 4) fondos.push(['hatch', 0.6], ['flowfield', 0.5], ['dots', 0.5], ['orbs', e.aire >= 4 ? 0.4 : 0.1]);
  else fondos.push(['dots', 0.8], ['halftone', e.memoria >= 3 ? 0.6 : 0.3], ['grid', 0.5]);
  c.fondo = conPeso(rnd, fondos.filter(([f]) => FONDOS[f]));

  // La firma EN REPOSO (la lección de Córdoba): la forma del logo dentro de la
  // página. Si el logo no sirve como forma, la firma va por la escena.
  const logoSirve = !S.logo || (ULTIMO_DIAG_LOGO ? ULTIMO_DIAG_LOGO.transparente !== false && (ULTIMO_DIAG_LOGO.colores ?? 1) <= 24 : true);
  c.marcaJuego = logoSirve
    ? conPeso(rnd, [['ventana', e.peso >= 3 ? 3 : 1.5], ['sello', e.temperatura >= 3 ? 2.5 : 1.2], ['calado', e.peso >= 4 ? 2 : 0.8], ['agua', e.aire >= 4 ? 1 : 0.4]])
    : 'ninguno';
  c.marcaEnChrome = true;
  c.escena = c.marcaJuego === 'ninguno'
    ? conPeso(rnd, [['arco', e.temperatura >= 3 ? 1.5 : 0.5], ['band', e.peso >= 4 ? 1.5 : 0.6], ['half', e.aire >= 3 ? 1 : 0.2], ['disc', 0.6]])
    : 'ninguna';
  c.pieza = 'ninguna';

  // La foto: la serie antes que el efecto.
  const lucesDispares = FOTOS_CLIENTE.length > 1 &&
    Math.max(...FOTOS_CLIENTE.map((f) => f.luz || 0)) - Math.min(...FOTOS_CLIENTE.map((f) => f.luz || 0)) > 0.25;
  c.foto = lucesDispares ? 'tint' : conPeso(rnd, [['limpia', 3], ['tint', e.temperatura >= 3 ? 1.2 : 0.4], ['duotono', e.temperatura <= 2 ? 0.6 : 0.1]]);
  c.forma = conPeso(rnd, [['recto', 2.5], ['redondo', 1], ['notch', e.peso >= 4 && e.temperatura <= 2 ? 1.2 : 0],
    ['blob', e.temperatura >= 4 && e.peso <= 2 ? 1 : 0], ['arch', e.temperatura >= 3 && c.marcaJuego !== 'ventana' ? 0.4 : 0]]);

  c.titular = c.ancho ? 'extendido' : conPeso(rnd, [['normal', 4], ['escalonado', e.peso >= 4 && e.aire <= 3 ? 0.7 : 0]]);
  c.header = conPeso(rnd, [['barra', 2], ['isla', e.aire >= 4 && e.temperatura >= 3 ? 1.2 : 0], ['minimo', e.aire >= 4 && e.peso <= 2 ? 1 : 0]]);
  c.boton = e.peso >= 4 || e.temperatura <= 2 ? 'recto' : conPeso(rnd, [['pildora', 1.5], ['recto', 1], ['flecha', 0.6]]);
  c.footer = e.peso >= 4 ? 'grande' : 'completo';

  // Los módulos salen del CONTENIDO: sin reseñas no hay cita; sin cifras, no hay cifras.
  const m = [];
  if (serviciosCliente().some(([, , p]) => p) || !serviciosCliente().length) m.push('disclosure');
  if (resenasCliente().length) m.push('pull');
  if (cifrasCliente().length) m.push('stat');
  if (!m.length) m.push('note');
  c.modulos = m.slice(0, 3);
  c.movimiento = ['reveal'];
  if (e.peso >= 4 && rnd() < 0.5) c.movimiento.push('split');
  if (cifrasCliente().length) c.movimiento.push('counter');

  // Las capas: la firma en la portada y en la llamada final, y el sello, que es
  // firma de titular, en todas las secciones que lo admiten (como Córdoba).
  const secs = (S.secciones.length ? S.secciones : JSON.parse(JSON.stringify((COMPOSICIONES.p12 || {}).secciones || COMPOSICION)))
    .map((s) => ({ ...s, capas: [] }));
  const admite = (s, capa) => ((SECCIONES[s.t] || {}).admite || []).includes(capa);
  const ultima = [...secs].reverse().find((s) => admite(s, 'marca'));
  secs.forEach((s) => {
    if (s.t === 'hero') {
      if (c.marcaJuego !== 'ninguno' && admite(s, 'marca')) s.capas.push('marca');
      if (c.escena !== 'ninguna' && admite(s, 'escena')) s.capas.push('escena');
      if (c.fondo !== 'ninguno' && admite(s, 'fondo') && s.capas.length < 2) s.capas.push('fondo');
    } else if (c.marcaJuego === 'sello' && admite(s, 'marca')) s.capas.push('marca');
    else if (s === ultima && c.marcaJuego !== 'ninguno') s.capas.push('marca');
    if (admite(s, 'modulos') && ['servicios', 'precios', 'datos'].includes(s.t)) s.capas.push('modulos');
  });
  c.secciones = secs;
  return c;
}

/** Aplica un candidato sobre una copia del estado, mide y devuelve la copia a su sitio. */
function mideCandidato(c) {
  const antes = S;
  S = { ...antes, ...c, ejes: { ...antes.ejes } };
  try {
    const graves = problemasContraste().length;
    const avisos = conflictos().filter(([t]) => !t.startsWith('Falta el')).length;
    const filas = evaluaRubrica();
    const tot = totalRubrica(filas);
    return { graves, avisos, auto: tot.auto, maxAuto: tot.maxAuto, filas };
  } finally { S = antes; }
}

/** El porqué, en una frase que se pueda discutir. */
function porqueDe(c) {
  const e = S.ejes;
  const trozos = [];
  const a = AFIN_DISPLAY[c.display];
  // Honesto con el encaje: la primera versión decía «casa con…» de cualquier
  // letra, también de las que el motor metía solo para variar.
  const d = a ? distEjes(a, e) : 9;
  trozos.push(S.displayFija ? `${c.display}, la letra de su marca`
    : d <= 1.5 ? `${c.display} porque casa con peso ${e.peso}, temperatura ${e.temperatura} y memoria ${e.memoria}`
      : `${c.display}, que se acerca a sus ejes sin clavarlos (una apuesta)`);
  const COMO = { sello: 'el logo como sello', agua: 'el logo como marca de agua', ventana: 'el logo como ventana',
    calado: 'el logo calado en el borde', trama: 'el logo en trama' };
  if (c.marcaJuego && c.marcaJuego !== 'ninguno')
    trozos.push(`la firma, ${COMO[c.marcaJuego] || 'la forma del logo'}, está en la portada y se repite`);
  else if (c.escena && c.escena !== 'ninguna') trozos.push(`la firma va por la escenografía (${(ESCENAS[c.escena] || {}).n.toLowerCase()}) porque el logo no sirve como forma`);
  trozos.push(c.fondo === 'ninguno' ? 'sin fondo: la firma ya habla' : `fondo ${(FONDOS[c.fondo] || {}).n.toLowerCase()}, tenue`);
  if (c.material) trozos.push(`acento ${c.material}, de su temperatura y lejos de los colores del portfolio` +
    (c.papel ? `, sobre un papel teñido de ${c.material} porque el de la base ya lo usa otra web parecida` : ''));
  else if (S.coloresFijos) trozos.push('con sus colores, sin tocarlos');
  let frase = trozos.join(' · ') + '.';
  // Con identidad propia, los choques con el portfolio vienen de SU marca y no
  // se arreglan cambiándola: se compensan con la firma. Se dice.
  if (S.coloresFijos || S.displayFija) {
    const antes = S; S = { ...antes, ...c };
    const clon = problemasClon().length; S = antes;
    if (clon) frase += ` Ojo: su identidad choca con ${clon} ${clon === 1 ? 'web' : 'webs'} del portfolio; la firma tiene que ser lo que la separe.`;
  }
  return frase;
}

/**
 * Las propuestas. `n` distintas, de `intentos` candidatos con la semilla dada.
 * Distintas quiere decir: otra familia de letra, y no el mismo fondo con el
 * mismo juego de marca. Una propuesta con el suelo roto no se enseña nunca.
 */
function proponer({ n = 3, semilla = 1, intentos = 90 } = {}) {
  const rnd = azarCon(semilla);
  const vistos = [];
  /* Con colores fijos, el suelo que falla es el de SU paleta y falla igual en
     todos los candidatos: descartarlos dejaba cero propuestas a cualquier marca
     de acento oscuro (medido: un verde #2F5D50 no llega a 3:1 sobre el fondo
     profundo). Se descarta solo lo que el candidato EMPEORA; lo suyo se avisa
     aparte, porque no se arregla cambiándole el color. */
  const suelo = S.coloresFijos ? problemasContraste().length : 0;
  for (let i = 0; i < intentos; i++) {
    const c = candidato(rnd);
    const m = mideCandidato(c);
    if (m.graves > suelo) continue;
    const afin = AFIN_DISPLAY[c.display] ? Math.exp(-distEjes(AFIN_DISPLAY[c.display], S.ejes)) : 0.5;
    vistos.push({ c, m, nota: m.auto * 10 - m.avisos * 4 + afin * 6 });
  }
  vistos.sort((x, y) => y.nota - x.nota);
  const elegidas = [];
  // Una letra lejos de los ejes solo entra si no hay más remedio (relleno final).
  const encaja = (v) => S.displayFija || !AFIN_DISPLAY[v.c.display] || distEjes(AFIN_DISPLAY[v.c.display], S.ejes) <= 2.3;
  for (const v of vistos) {
    if (elegidas.length >= n) break;
    if (!encaja(v)) continue;
    const clon = elegidas.some((x) => (!S.displayFija && familia(x.c.display) === familia(v.c.display)) ||
      (!S.coloresFijos && x.c.material === v.c.material) ||
      (x.c.fondo === v.c.fondo && x.c.marcaJuego === v.c.marcaJuego && x.c.escena === v.c.escena));
    if (!clon) elegidas.push(v);
  }
  // Relleno si faltan (letra fijada, ejes extremos): se admite repetir letra o
  // color, pero nunca una propuesta igual a otra en todo lo que se ve.
  // Lo que identifica una propuesta a la vista: letra, color y firma. Solo el
  // fondo distinto no la hace otra (salían dos «Newsreader · Sello · ciruela»).
  const firma = (x) => [x.c.display, x.c.acento, x.c.marcaJuego, x.c.escena].join('|');
  for (const v of vistos) {
    if (elegidas.length >= n) break;
    if (!elegidas.some((x) => firma(x) === firma(v))) elegidas.push(v);
  }
  return elegidas.map((v, i) => ({
    id: `${semilla}-${i}`,
    nombre: `${v.c.display} · ${v.c.marcaJuego !== 'ninguno' ? (MARCAJUEGOS[v.c.marcaJuego] || {}).n : (ESCENAS[v.c.escena] || {}).n || 'sin firma'}${v.c.material ? ' · ' + v.c.material : ''}`,
    porque: porqueDe(v.c),
    cambios: v.c,
    auto: v.m.auto, maxAuto: v.m.maxAuto, avisos: v.m.avisos,
  }));
}

/** Aplica una propuesta: estilo y capas. El contenido, los ejes y la identidad, intactos. */
function aplicaPropuesta(p) {
  const { material, ...cambios } = p.cambios;
  Object.assign(S, JSON.parse(JSON.stringify(cambios)));
}
