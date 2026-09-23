/* ============================================================================
   Estudio de marca · lógica
   Se componen las decisiones, se ven aplicadas de verdad (el iframe carga el
   CSS y los efectos del kit) y sale un encargo que otro Claude puede ejecutar.
   ============================================================================ */
'use strict';

/* ── Catálogo ─────────────────────────────────────────────────────────────
   Cada opción trae lo que necesita la previsualización Y lo que necesita el
   encargo. Si una pieza no sabe explicarse, no entra en el catálogo. */

const DISPLAY = [
  ['Archivo', 'Archivo', 'industrial, señalética, cartel'],
  ['Big Shoulders Display', 'Big Shoulders', 'condensada de fábrica: ocupa poco y pega fuerte'],
  ['Fraunces', 'Fraunces', 'cálida y con oficio: cuando se vende TRATO'],
  ['Bodoni Moda', 'Bodoni Moda', 'alto contraste, lujo editorial. Pide mucho aire'],
  ['Young Serif', 'Young Serif', 'contundente y antigua. Ya en uso en Córdoba Soluciona'],
  ['Anton', 'Anton', 'un martillo: titulares de tres palabras'],
  ['Unbounded', 'Unbounded', 'geométrica rotunda, marca joven. Cansa en texto'],
  ['Syne', 'Syne', 'personalidad fuerte, cultural, estudios'],
  ['Cormorant', 'Cormorant', 'fina y delicada. No usar pequeña'],
  ['Instrument Serif', 'Instrument Serif', 'editorial, de revista'],
  ['Epilogue', 'Epilogue', 'carácter sin llegar a display, aguanta densidad'],
  ['Space Grotesk', 'Space Grotesk', 'técnica y limpia, producto'],
  ['Newsreader', 'Newsreader', 'serif de lectura, aguanta párrafos'],
  ['Literata', 'Literata', 'la otra de lectura, más robusta'],
  ['Schibsted Grotesk', 'Schibsted', 'texto limpio con buenas cifras'],
  ['Bricolage Grotesque', 'Bricolage', '⚠ se reconoce al instante en webs generadas'],
];

const TEXTO = [
  ['Instrument Sans', 'Instrument Sans'], ['Schibsted Grotesk', 'Schibsted'],
  ['Literata', 'Literata'], ['Newsreader', 'Newsreader'], ['JetBrains Mono', 'JetBrains Mono'],
];

const BASES = {
  papelFrio:   { n: 'Papel frío',   paper: '#F5F6F7', alt: '#E9EBED', deep: '#14171A', deepSoft: '#1E2328', soft: '#5C646C', hue: 'H≈210 (plateado)' },
  papelCalido: { n: 'Papel cálido', paper: '#F8F6F1', alt: '#EFEBE3', deep: '#1A1713', deepSoft: '#241F19', soft: '#6B6257', hue: 'H≈35 (tierra)' },
  galeria:     { n: 'Galería',      paper: '#FDFCFA', alt: '#F2EFEA', deep: '#17150F', deepSoft: '#221F17', soft: '#6E675C', hue: 'H≈40 (crema)' },
  noche:       { n: 'Noche',        paper: '#14171A', alt: '#1E2328', deep: '#0C0E10', deepSoft: '#171B1F', soft: '#9AA3AD', hue: 'H≈210 (oscuro)', oscuro: true },
};

const FONDOS = {
  ninguno:   { n: 'Ninguno',     js: false, dice: 'que hable el contenido. Opción legítima y a menudo la mejor' },
  contour:   { n: 'Curvas',      js: true,  dice: 'plano, medida, ingeniería. Es LÍNEA: no come contraste' },
  flowfield: { n: 'Flujo',       js: true,  dice: 'mano, trazo, arte. Se pinta y para; distinto en cada visita' },
  gridwarp:  { n: 'Rejilla viva',js: true,  dice: 'técnico pero vivo. En reposo es un plano serio' },
  mesh:      { n: 'Mesh',        js: true,  dice: 'luz, color, ambiente, sin bandas' },
  halftone:  { n: 'Semitono',    js: true,  dice: 'imprenta, tinta, oficio gráfico' },
  grid:      { n: 'Rejilla',     js: false, clase: 'fx-grid', dice: 'plano de taller' },
  stripes:   { n: 'Bandas',      js: false, clase: 'fx-stripes', vars: '--stripe-w:20px;--stripe-a:6%', dice: 'señalización, obra, aviso' },
  hatch:     { n: 'Rayado',      js: false, clase: 'fx-hatch', dice: 'grabado, billete, lámina antigua' },
  dots:      { n: 'Puntos',      js: false, clase: 'fx-dots', dice: 'papel técnico sin parecerlo' },
  orbs:      { n: 'Manchas',     js: false, clase: 'fx-orbs', dice: 'color y ambiente por tres degradados' },
  rays:      { n: 'Rayos',       js: false, clase: 'fx-rays', vars: '--ray-a:10%', dice: 'luz de foco, letrero encendido' },
  halo:      { n: 'Halo',        js: false, clase: 'fx-halo', vars: '--halo-a:26%', dice: 'resplandor limpio detrás de algo' },
};

const ESCENAS = {
  ninguna: { n: 'Ninguna' },
  half:    { n: 'Sección partida', clase: 'fx-half', vars: '--half-color:var(--color-deep)' },
  disc:    { n: 'Disco',           clase: 'fx-disc', vars: '--disc-size:30rem;--disc-x:82%;--disc-y:26%' },
  ring:    { n: 'Anillo',          clase: 'fx-disc fx-ring', vars: '--disc-size:26rem;--disc-x:84%;--disc-y:30%;--ring-w:2rem' },
  band:    { n: 'Faja',            clase: 'fx-band' },
  corner:  { n: 'Cuña',            clase: 'fx-corner' },
  column:  { n: 'Columna',         clase: 'fx-column', vars: '--col-color:var(--color-deep);--col-w:34%' },
  arco:    { n: 'Borde en curva',  borde: true },
};

const FOTOS = {
  limpia:  { n: 'Limpia' },
  tint:    { n: 'Tinte de marca', clase: 'fx-tint', nota: 'iguala fotos de días y luces distintas. El que más rinde' },
  ink:     { n: 'Tinta', js: 'ink', nota: 'deja de ser foto y pasa a ser dibujo: el fondo se ve a través' },
  duotono: { n: 'Duotono', clase: 'fx-tint', vars: '--tint-blend:color;--tint-a:.75', nota: 'mete cualquier foto en la paleta' },
  bleed:   { n: 'Sangrado', clase: 'fx-bleed', vars: '--bleed-b:55%', nota: 'la foto se disuelve en el fondo' },
  soft:    { n: 'Bordes disueltos', clase: 'fx-soft', nota: 'no termina, se desvanece' },
  grano:   { n: 'Grano', clase: 'fx-photo-grain', nota: 'iguala texturas, disimula fotos de móvil' },
  offset:  { n: 'Marco desplazado', clase: 'fx-offset', nota: 'un rectángulo de marca asomando' },
};

const FORMAS = {
  recto:   { n: 'Rectángulo', clase: '' },
  redondo: { n: 'Redondeado', clase: 'rounded-xl' },
  arch:    { n: 'Arco', clase: 'fx-arch' },
  blob:    { n: 'Mancha', clase: 'fx-blob' },
  notch:   { n: 'Bisel', clase: 'fx-notch' },
  hex:     { n: 'Hexágono', clase: 'fx-hex' },
  lozenge: { n: 'Elipse', clase: 'fx-lozenge' },
  capsule: { n: 'Cápsula', clase: 'fx-capsule' },
};

const HEADERS = {
  barra:    { n: 'Barra' },
  isla:     { n: 'Isla flotante' },
  minimo:   { n: 'Mínimo' },
};
const BOTONES = {
  pildora:  { n: 'Píldora' },
  recto:    { n: 'Recto' },
  material: { n: 'Con material', nota: 'cara con luz + canto, como una pieza fabricada' },
};
const TITULARES = {
  normal:   { n: 'Normal' },
  extendido:{ n: 'Extendido' },
  knockout: { n: 'Foto dentro', clase: 'fx-knockout' },
  outline:  { n: 'Contorno', clase: 'fx-outline' },
  trama:    { n: 'Trama', clase: 'fx-hatch-text' },
};
const FOOTERS = { completo: { n: 'Completo' }, franja: { n: 'Franja' } };

const MODULOS = {
  disclosure: { n: 'Desplegable', nota: 'número, gancho visible, precio a la vista y foto dentro' },
  tabs:       { n: 'Pestañas', nota: 'radios + :checked, teclado incluido' },
  rail:       { n: 'Carril', nota: 'scroll-snap; mejor que un carrusel con puntitos' },
  sheet:      { n: 'Panel de ficha', nota: '<dialog> nativo: Esc, foco atrapado, fondo bloqueado' },
  pull:       { n: 'Cita grande', nota: 'para una reseña REAL, con nombre y fecha' },
  note:       { n: 'Nota de taller', nota: 'para decir lo que NO se hace. Da credibilidad' },
  highlight:  { n: 'Destacado', nota: 'uno por página; si hay tres, no hay ninguno' },
  stat:       { n: 'Cifras', nota: 'dato grande y etiqueta, con cifras tabulares' },
  time:       { n: 'Cronología', nota: 'una lista de fechas cuenta más que tres párrafos' },
  sign:       { n: 'Piezas que se encienden', js: 'sign', nota: 'material con canto; se encienden al llegar' },
};

const MOVIMIENTO = {
  reveal:  { n: 'Aparición al entrar' },
  split:   { n: 'Titular por líneas', js: 'split' },
  counter: { n: 'Cifras que suben', js: 'counter' },
  parallax:{ n: 'Parallax', js: 'parallax' },
  marquee: { n: 'Banda en marcha', js: 'marquee' },
  spot:    { n: 'Foco con el cursor', js: 'spotlight' },
  tilt:    { n: 'Inclinación', js: 'tilt' },
  trail:   { n: 'Rastro de fotos', js: 'trail' },
  quieto:  { n: 'Quieto' },
};

const EJES = [
  ['peso', 'Peso', 'ligero', 'contundente'],
  ['temperatura', 'Temperatura', 'frío/técnico', 'cálido/humano'],
  ['memoria', 'Memoria', 'presente', 'con oficio'],
  ['aire', 'Aire', 'galería', 'taller'],
];

const FOTOS_DEMO = [
  '../img/letras-corporeas-econatur-nave-industrial-800.webp',
  '../img/letras-corporeas-iluminadas-restaurante-carmen-noche.webp',
  '../img/rotulacion-integral-furgon-vredestein-800.webp',
  '../img/fabricacion-monoposte-soldadura-taller.webp',
  '../img/neon-colores-tubos.webp',
];

/* ── Estado ───────────────────────────────────────────────────────────────── */
const inicial = () => ({
  marca: 'Nombre del cliente', oficio: '',
  ejes: { peso: 3, temperatura: 3, memoria: 3, aire: 3 },
  display: 'Archivo', texto: 'Instrument Sans', ancho: false,
  acento: '#FEFE00', tinta: '#101316', base: 'papelFrio',
  fondo: 'ninguno', escena: 'ninguna', foto: 'limpia', forma: 'redondo',
  header: 'barra', boton: 'pildora', titular: 'normal', footer: 'completo',
  modulos: ['disclosure', 'pull'], movimiento: ['reveal'],
  gesto: '',
});
let S = inicial();

/* ── Utilidades ───────────────────────────────────────────────────────────── */
const $ = (s) => document.querySelector(s);
const esc = (t) => String(t).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

/** Aclara u oscurece un hex, para derivar el degradado de la cara. */
function ajusta(hex, f) {
  const n = parseInt(hex.slice(1), 16);
  const c = [(n >> 16) & 255, (n >> 8) & 255, n & 255]
    .map((v) => Math.max(0, Math.min(255, Math.round(v * f))));
  return '#' + c.map((v) => v.toString(16).padStart(2, '0')).join('');
}
/** Texto legible sobre un color: la regla 1 del suelo, automatizada. */
function sobre(hex) {
  const n = parseInt(hex.slice(1), 16);
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b > 0.42 ? '#101114' : '#ffffff';
}

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

function pintaControles() {
  chips('#display', DISPLAY.map(([id, l, d]) => [id, l, d]), S.display, (v) => set('display', v));
  chips('#texto', TEXTO, S.texto, (v) => set('texto', v));
  chips('#base', Object.entries(BASES).map(([k, v]) => [k, v.n, v.hue]), S.base, (v) => set('base', v));
  chips('#fondo', Object.entries(FONDOS).map(([k, v]) => [k, v.n, v.dice]), S.fondo, (v) => set('fondo', v));
  chips('#escena', Object.entries(ESCENAS).map(([k, v]) => [k, v.n]), S.escena, (v) => set('escena', v));
  chips('#foto', Object.entries(FOTOS).map(([k, v]) => [k, v.n, v.nota]), S.foto, (v) => set('foto', v));
  chips('#forma', Object.entries(FORMAS).map(([k, v]) => [k, v.n]), S.forma, (v) => set('forma', v));
  chips('#header', Object.entries(HEADERS).map(([k, v]) => [k, v.n]), S.header, (v) => set('header', v));
  chips('#boton', Object.entries(BOTONES).map(([k, v]) => [k, v.n, v.nota]), S.boton, (v) => set('boton', v));
  chips('#titular', Object.entries(TITULARES).map(([k, v]) => [k, v.n]), S.titular, (v) => set('titular', v));
  chips('#footer', Object.entries(FOOTERS).map(([k, v]) => [k, v.n]), S.footer, (v) => set('footer', v));
  chips('#modulos', Object.entries(MODULOS).map(([k, v]) => [k, v.n, v.nota]), S.modulos, (v) => toggle('modulos', v), true);
  chips('#movimiento', Object.entries(MOVIMIENTO).map(([k, v]) => [k, v.n]), S.movimiento, (v) => toggle('movimiento', v), true);
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

/* ── Tokens del tema ──────────────────────────────────────────────────────── */
function tokens() {
  const b = BASES[S.base];
  return {
    '--color-brand': S.acento,
    '--color-brand-dim': ajusta(S.acento, 0.82),
    '--color-brand-ink': sobre(S.acento),
    '--color-brand-soft': ajusta(S.acento, 1.9),
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

/* ── Avisos de coherencia · las reglas de la skill, comprobadas ───────────── */
function avisos() {
  const a = [];
  const e = S.ejes;

  if (S.display === 'Bricolage Grotesque')
    a.push(['Bricolage', 'sale en demasiadas webs generadas y se reconoce al instante. El kit la declara por compatibilidad, no para usarla.']);
  if (S.display === 'Young Serif')
    a.push(['Young Serif ya está en uso', 'la lleva Córdoba Soluciona. Dos webs del mismo encargante no comparten display.']);
  if (S.titular === 'knockout' && S.foto === 'limpia')
    a.push(['Foto dentro de las letras', 'necesita una foto con contraste y, si el fondo es claro, oscurecerla antes.']);
  if (S.foto === 'ink' && !BASES[S.base].oscuro)
    a.push(['Tinta sobre base clara', 'sobre fondo claro entinta las sombras. Si la sección va en oscuro, usa invert:true.']);
  if (S.modulos.includes('highlight') && S.modulos.filter((m) => m === 'highlight').length > 1)
    a.push(['Destacado', 'uno por página. Si hay tres, no hay ninguno.']);
  if (e.aire <= 2 && S.escena === 'half')
    a.push(['Sección partida con aire bajo', 'el corte repetido pide aire alto; en una web densa hay que romperlo donde aparece una tabla y la excepción se nota más que la regla.']);
  if (e.aire >= 4 && ['stripes', 'dots', 'hatch', 'grid'].includes(S.fondo))
    a.push(['Aire alto con fondo de trama', 'con aire 4-5 el espacio ES el efecto: una trama densa se lo come.']);
  if (S.display === 'Bodoni Moda' && e.aire <= 2)
    a.push(['Bodoni con aire bajo', 'el alto contraste pide mucho aire alrededor; apretada se vuelve ilegible.']);
  if (S.display === 'Cormorant' && e.peso >= 4)
    a.push(['Cormorant con peso alto', 'es de trazo delicado: no aguanta el papel de display contundente.']);
  if (e.temperatura >= 4 && ['contour', 'gridwarp', 'grid'].includes(S.fondo))
    a.push(['Fondo técnico con temperatura cálida', 'las líneas de plano enfrían justo lo que este cliente vende. Pasó en Rodríguez Reformas.']);
  if (S.foto === 'ink' && S.modulos.includes('sign'))
    a.push(['Dos texturas con significado', 'la tinta y el material compiten: el lector no sabe cuál está leyendo.']);
  if (!S.gesto.trim())
    a.push(['Falta el gesto', 'sin él la web estará bien hecha y será olvidable. Búscalo en las reseñas del cliente, no en su catálogo.']);

  const host = $('#avisos');
  host.innerHTML = '';
  if (!a.length) {
    host.innerHTML = '<div class="ui-aviso ok"><b>✓</b><span>Sin conflictos. Las decisiones se sostienen entre sí.</span></div>';
    return;
  }
  a.forEach(([t, d]) => {
    const el = document.createElement('div');
    el.className = 'ui-aviso';
    el.innerHTML = `<span>⚠</span><span><b>${esc(t)}:</b> ${esc(d)}</span>`;
    host.appendChild(el);
  });
}

/* ── Previsualización ─────────────────────────────────────────────────────── */
function capaFondo() {
  const f = FONDOS[S.fondo];
  if (!f || S.fondo === 'ninguno') return '';
  if (f.js) return `<div class="absolute inset-0" data-fx="${S.fondo}"></div>`;
  return `<div class="${f.clase}" style="${f.vars || ''}"></div>`;
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
      return `<div class="fx-disc-list" style="margin-top:2rem">
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
  const b = BASES[S.base];
  const mov = S.movimiento;
  const arco = ESCENAS[S.escena].borde ? 'border-bottom-left-radius:50% 4rem;border-bottom-right-radius:50% 4rem;overflow:hidden;' : '';
  const aire = { 1: '2.5rem', 2: '3.5rem', 3: '5rem', 4: '7rem', 5: '9rem' }[S.ejes.aire];

  const titulo = S.titular === 'knockout' ? 'TU NOMBRE' : (S.oficio ? esc(S.oficio) : 'Lo que hacemos, en claro.');

  return `<!doctype html><html lang="es"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<base href="../">
<link rel="stylesheet" href="_astro/index.13ee7bc9.css">
<link rel="stylesheet" href="estudio/estudio.css">
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

  <section class="sec" style="position:relative;isolation:isolate;overflow:hidden;${arco}">
    ${capaFondo()}${capaEscena()}
    <div class="wrap" style="position:relative;z-index:1">
      <p style="font-family:var(--font-display);font-size:.72rem;font-weight:700;letter-spacing:.16em;text-transform:uppercase;color:var(--color-ink-soft);margin:0 0 1rem">
        ${esc(S.marca)}</p>
      ${tituloHTML(titulo)}
      <p class="lead" style="margin-top:1.4rem">Una línea que explica qué se vende y a quién, con palabras del cliente y no del sector.</p>
      <div style="display:flex;gap:.7rem;flex-wrap:wrap;margin-top:2rem">
        ${botonHTML('Pedir presupuesto')}${botonHTML('Ver trabajos', false)}
      </div>
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(11rem,1fr));gap:1rem;margin-top:3rem">
        ${FOTOS_DEMO.slice(0, 3).map((s, i) => figura(s, i)).join('')}
      </div>
    </div>
  </section>

  <section class="sec" style="background:var(--color-paper-alt)">
    <div class="wrap">
      <h2>Lo que hacemos</h2>
      <p class="lead">Aquí va el contenido de verdad. Los módulos elegidos aparecen debajo.</p>
      ${S.modulos.map(moduloHTML).join('')}
    </div>
  </section>

  <section class="sec" style="background:var(--color-deep);color:#fff;position:relative;isolation:isolate;overflow:hidden">
    ${S.fondo !== 'ninguno' && !FONDOS[S.fondo].js ? `<div class="${FONDOS[S.fondo].clase}" style="${FONDOS[S.fondo].vars || ''};opacity:.5"></div>` : ''}
    <div class="wrap" style="position:relative;z-index:1;text-align:center">
      <h2 style="color:#fff">¿Hablamos?</h2>
      <p style="color:rgb(255 255 255/.7);max-width:40ch;margin:1rem auto 2rem">El cierre es la última pantalla: tiene que ser el producto.</p>
      ${botonHTML('Pedir presupuesto')}
    </div>
  </section>

  ${footerHTML()}

  ${mov.some((m) => MOVIMIENTO[m]?.js) || S.fondo !== 'ninguno' && FONDOS[S.fondo].js || S.foto === 'ink' || S.modulos.includes('sign')
    ? `<script type="module" src="_astro/Fx.astro_astro_type_script_index_0_lang.CGbv7hfv.js"><\/script>` : ''}
  <script>document.querySelectorAll('.reveal').forEach(e=>e.classList.add('is-in'));<\/script>
</body></html>`;
}

let t0;
function render() {
  clearTimeout(t0);
  avisos();
  lectura();
  t0 = setTimeout(() => { $('#lienzo').srcdoc = documento(); }, 220);
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
function temaCSS() {
  const t = tokens();
  const slug = (S.marca || 'marca').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  return `/* Tema · ${S.marca}
   Generado con el Estudio de marca. Va en opspilot-kit/src/styles/themes/${slug}.css
   y se importa DESPUÉS de kit.css. Solo pisa tokens. */
@theme {
${Object.entries(t).map(([k, v]) => `  ${k}: ${v};`).join('\n')}
}
${S.ancho ? '\n/* Titulares de esta marca: siempre extendidos. */\nh1, h2, .display-brand {\n  font-stretch: 116%;\n}\n' : ''}`;
}

function prompt() {
  const b = BASES[S.base];
  const f = FONDOS[S.fondo];
  const piezas = [];
  if (S.fondo !== 'ninguno') piezas.push(f.js ? `Fondo: data-fx="${S.fondo}" (JS, se carga solo)` : `Fondo: .${FONDOS[S.fondo].clase}${f.vars ? ` con ${f.vars}` : ''}`);
  if (ESCENAS[S.escena].clase) piezas.push(`Escenografía: .${ESCENAS[S.escena].clase}${ESCENAS[S.escena].vars ? ` con ${ESCENAS[S.escena].vars}` : ''}`);
  if (ESCENAS[S.escena].borde) piezas.push('Escenografía: .fx-arc-b en el corte de sección');
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
let vista = 'prompt';
function pintaSalida() {
  const m = { prompt, tema: temaCSS, json: () => JSON.stringify(S, null, 2) };
  $('#salida').value = m[vista]();
  document.querySelectorAll('.ui-dialog-tabs button').forEach((b) => b.classList.toggle('on', b.dataset.vista === vista));
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

  $('#reset').addEventListener('click', () => {
    S = inicial();
    $('#marca').value = S.marca; $('#oficio').value = ''; $('#gesto').value = '';
    $('#acento').value = S.acento; $('#tinta').value = S.tinta; $('#ancho').checked = false;
    pintaControles(); pintaEjes(); render();
  });

  // Combina al azar, pero solo entre opciones que no se pisan entre sí.
  $('#dados').addEventListener('click', () => {
    const uno = (o) => { const k = Object.keys(o); return k[Math.floor(Math.random() * k.length)]; };
    S.display = DISPLAY.filter(([d]) => d !== 'Bricolage Grotesque')[Math.floor(Math.random() * (DISPLAY.length - 1))][0];
    S.base = uno(BASES);
    S.fondo = uno(FONDOS);
    S.escena = uno(ESCENAS);
    S.foto = uno(FOTOS);
    S.forma = uno(FORMAS);
    S.header = uno(HEADERS); S.boton = uno(BOTONES); S.titular = uno(TITULARES); S.footer = uno(FOOTERS);
    const mods = Object.keys(MODULOS).sort(() => Math.random() - 0.5).slice(0, 3);
    S.modulos = mods;
    S.acento = '#' + Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, '0');
    $('#acento').value = S.acento;
    EJES.forEach(([id]) => { S.ejes[id] = 1 + Math.floor(Math.random() * 5); });
    pintaControles(); pintaEjes(); render();
  });
}

pintaControles();
pintaEjes();
enlaza();
render();
