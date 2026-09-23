/* Estudio de marca · panel.js
   El panel: controles y miniaturas de cada opción.
   Script clásico: comparte el ámbito global con los demás ficheros del
   Estudio y se carga en el orden de index.html. */
'use strict';

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


/* ── Miniaturas ───────────────────────────────────────────────────────────
   Cada opción se dibuja a escala. Donde el efecto es CSS se usa la clase real
   del kit, así que la miniatura ES el efecto. Donde es de JavaScript (un
   canvas o un shader) se dibuja una aproximación y se marca con la etiqueta
   JS: prometer lo que no se enseña sería peor que no enseñar nada. */

/** Aproximaciones CSS de los fondos que en realidad se pintan con JavaScript. */
const APROX = {
  contour: `background:
      repeating-radial-gradient(circle at 30% 60%, transparent 0 5px, color-mix(in srgb,var(--color-ink) 22%,transparent) 5px 6px, transparent 6px 11px),
      repeating-radial-gradient(circle at 75% 25%, transparent 0 6px, color-mix(in srgb,var(--color-ink) 16%,transparent) 6px 7px, transparent 7px 13px)`,
  flowfield: `background:
      repeating-linear-gradient(72deg, transparent 0 3px, color-mix(in srgb,var(--color-ink) 16%,transparent) 3px 4px, transparent 4px 9px),
      repeating-linear-gradient(104deg, transparent 0 4px, color-mix(in srgb,var(--color-brand) 30%,transparent) 4px 5px, transparent 5px 12px)`,
  gridwarp: `background:
      repeating-linear-gradient(to right, color-mix(in srgb,var(--color-ink) 20%,transparent) 0 1px, transparent 1px 9px),
      repeating-linear-gradient(to bottom, color-mix(in srgb,var(--color-ink) 20%,transparent) 0 1px, transparent 1px 9px)`,
  mesh: `background:
      radial-gradient(60% 70% at 25% 30%, color-mix(in srgb,var(--color-brand) 55%,transparent), transparent 70%),
      radial-gradient(50% 60% at 80% 70%, color-mix(in srgb,var(--color-brand-soft) 80%,transparent), transparent 70%),
      var(--color-paper-alt)`,
  halftone: `background-image: radial-gradient(color-mix(in srgb,var(--color-ink) 55%,transparent) 1.4px, transparent 1.5px);
      background-size: 7px 7px`,
};

/* A 74 px una trama al 6 % no se ve. La miniatura usa valores más marcados
   —no los de producción— porque su trabajo es que se distinga una opción de
   otra, no enseñar la intensidad final. Esa se calibra en el lienzo. */
const VARS_MINI = {
  grid:    '--grid-size:8px;--grid-fade:100%',
  stripes: '--stripe-w:6px;--stripe-a:18%',
  hatch:   '--hatch-a:26%;--hatch-gap:4px',
  dots:    '--dot-gap:7px;--dot-a:38%;--dot-fade:100%',
  rays:    '--ray-a:34%;--ray-w:7deg;--ray-fade:100%',
  halo:    '--halo-a:65%;--halo-size:3rem',
  orbs:    '--orb-a:75%;--orb-blur:4px',
  sweep:   '',
  // Biblioteca libre (23-sep): los mismos patrones, marcados para que a 74 px se distingan.
  grano:      '--noise-a:.55',
  veta:       '--streak-a:.6',
  ondas:      '--wave-a:45%;--wave-w:34px',
  cruces:     '--plus-a:55%;--plus-w:14px',
  curvas:     '--rings-a:40%;--rings-gap:7px',
  celosia:    '--lat-a:35%;--lat:9px;--lat-fade:100%',
  damero:     '--chk-a:22%;--chk:10px;--chk-fade:100%',
  tejas:      '--scale-a:45%;--scale:9px;--scale-fade:100%',
  pautado:    '--ruled-a:35%;--renglon:8px;--margen:14px',
  hidraulica: '--tile-a:28%;--tile-b:70%;--tile:20px;--tile-fade:100%',
  aurora:     '--aurora-a:70%;--aurora-blur:5px',
};

function miniFondo(id) {
  if (id === 'ninguno') return '<span class="m-nada">SIN FONDO</span>';
  const f = FONDOS[id];
  if (f.js) return `<span style="${APROX[id] || ''}"></span>`;
  const fondo = id === 'rays' || id === 'halo' || id === 'sweep'
    ? '<span style="position:absolute;inset:0;background:var(--color-deep)"></span>' : '';
  return `${fondo}<span class="${f.clase}" style="${VARS_MINI[id] ?? f.vars ?? ''};position:absolute;inset:0"></span>`;
}

function miniEscena(id) {
  if (id === 'ninguna') return '<span class="m-nada">NINGUNA</span>';
  const e = ESCENAS[id];
  if (e.borde) return `<span style="background:var(--color-deep);border-bottom-left-radius:50% 60%;border-bottom-right-radius:50% 60%;inset:0 0 35% 0"></span>`;
  return `<span class="${e.clase}" style="${e.mini || e.vars || ''};position:absolute;inset:0"></span>`;
}

function miniPieza(id) {
  if (id === 'ninguna') return '<span class="m-nada">NINGUNA</span>';
  const p = PIEZAS[id];
  return `<span style="position:absolute;left:50%;top:50%;translate:-50% -50%;width:58%;aspect-ratio:1;
    background:var(--pc,var(--color-brand));--pc:var(--color-brand);--pw:5px;${p.css || ''}"></span>`;
}

function miniForma(id) {
  const c = FORMAS[id].clase;
  return `<span class="${c}" style="position:absolute;inset:14%;background:var(--color-metal);opacity:.75"></span>`;
}

function miniFoto(id) {
  const f = FOTOS[id];
  const base = `position:absolute;inset:12%;border-radius:4px;background:
    linear-gradient(140deg, var(--color-metal-hi) 0%, var(--color-metal) 55%, var(--color-metal-lo) 100%)`;
  if (id === 'ink') return `<span style="${base};background-image:radial-gradient(var(--color-brand) 1.3px,transparent 1.4px);background-size:5px 5px;background-color:var(--color-deep)"></span>`;
  if (id === 'tint') return `<span style="${base}"></span><span style="position:absolute;inset:12%;border-radius:4px;background:var(--color-brand);mix-blend-mode:soft-light;opacity:.6"></span>`;
  if (id === 'duotono') return `<span style="${base};filter:grayscale(1)"></span><span style="position:absolute;inset:12%;border-radius:4px;background:var(--color-brand);mix-blend-mode:color;opacity:.8"></span>`;
  if (id === 'bleed') return `<span style="${base};-webkit-mask-image:linear-gradient(to top,transparent,#000 60%);mask-image:linear-gradient(to top,transparent,#000 60%)"></span>`;
  if (id === 'soft') return `<span style="${base};-webkit-mask-image:radial-gradient(ellipse 70% 70% at center,#000 40%,transparent);mask-image:radial-gradient(ellipse 70% 70% at center,#000 40%,transparent)"></span>`;
  if (id === 'grano') return `<span style="${base}"></span><span class="fx-photo-grain" style="position:absolute;inset:12%;--pgrain-a:.5"></span>`;
  if (id === 'offset') return `<span style="position:absolute;inset:18% 12% 8% 18%;border-radius:4px;background:var(--color-brand)"></span><span style="${base};inset:10% 18% 16% 12%"></span>`;
  return `<span style="${base}"></span>`;
}

function miniHeader(id) {
  const logo = '<i class="m-bar" style="left:8%;top:38%;width:22%;height:16%"></i>';
  const nav = '<i class="m-line" style="left:38%;top:44%;width:9%;height:8%"></i><i class="m-line" style="left:50%;top:44%;width:9%;height:8%"></i><i class="m-line" style="left:62%;top:44%;width:9%;height:8%"></i>';
  const cta = '<i class="m-pill" style="right:8%;top:36%;width:18%;height:20%"></i>';
  if (id === 'isla') return `<i class="m-box" style="left:10%;top:26%;right:10%;height:40%;border-radius:99px;opacity:.16"></i>${logo}${nav}${cta}`;
  if (id === 'minimo') return `${logo}${cta}`;
  if (id === 'centrado') return `<i class="m-bar" style="left:39%;top:18%;width:22%;height:18%"></i><i class="m-line" style="left:24%;top:62%;width:13%;height:7%"></i><i class="m-line" style="left:43%;top:62%;width:13%;height:7%"></i><i class="m-line" style="left:62%;top:62%;width:13%;height:7%"></i>`;
  if (id === 'apilado') return `<i class="m-bar" style="left:8%;top:16%;width:26%;height:16%"></i><i class="m-line" style="left:8%;top:60%;width:14%;height:7%"></i><i class="m-line" style="left:26%;top:60%;width:14%;height:7%"></i>${cta}`;
  if (id === 'lateral') return `<i style="position:absolute;left:0;top:0;bottom:0;width:6%;background:var(--color-brand)"></i>${logo}${nav}${cta}`;
  return `<i class="m-box" style="inset:22% 0 22% 0;opacity:.07"></i>${logo}${nav}${cta}`;
}

function miniFooter(id) {
  const fondo = '<i style="position:absolute;inset:0;background:var(--color-deep)"></i>';
  if (id === 'franja') return `${fondo}<i class="m-bar" style="left:8%;top:42%;width:24%;height:16%;background:#fff;opacity:.9"></i><i class="m-line" style="right:8%;top:46%;width:30%;height:8%;background:#fff;opacity:.35"></i>`;
  if (id === 'grande') return `${fondo}<i class="m-bar" style="left:8%;top:22%;width:60%;height:26%;background:#fff;opacity:.9"></i><i class="m-line" style="left:8%;top:62%;width:24%;height:7%;background:#fff;opacity:.3"></i><i class="m-pill" style="right:8%;top:58%;width:20%;height:16%"></i>`;
  if (id === 'minimo') return `${fondo}<i class="m-line" style="left:50%;translate:-50% 0;top:46%;width:44%;height:8%;background:#fff;opacity:.35"></i>`;
  return `${fondo}<i class="m-bar" style="left:7%;top:20%;width:22%;height:14%;background:#fff;opacity:.9"></i>` +
    [30, 52, 74].map((x) => `<i class="m-line" style="left:${x}%;top:22%;width:14%;height:6%;background:#fff;opacity:.4"></i>` +
      [0, 1, 2].map((k) => `<i class="m-line" style="left:${x}%;top:${38 + k * 14}%;width:17%;height:5%;background:#fff;opacity:.22"></i>`).join('')).join('');
}

function miniBoton(id) {
  const r = id === 'recto' || id === 'bisel' ? '3px' : '99px';
  let est = `background:var(--color-brand)`;
  if (id === 'material') est = 'background:linear-gradient(180deg,var(--color-brand),var(--color-brand-dim));box-shadow:0 1px 0 rgb(255 255 255/.6) inset';
  if (id === 'contorno') est = 'background:none;border:2px solid var(--color-ink)';
  if (id === 'bisel') est = 'background:var(--color-brand);clip-path:polygon(0 0,88% 0,100% 100%,12% 100%)';
  const flecha = id === 'flecha' ? '<i style="position:absolute;right:26%;top:40%;width:9%;aspect-ratio:1;border-radius:50%;background:color-mix(in srgb,var(--color-ink) 22%,transparent)"></i>' : '';
  return `<i style="position:absolute;left:22%;right:22%;top:34%;height:32%;border-radius:${r};${est}"></i>${flecha}`;
}

function miniTitular(id) {
  const base = 'position:absolute;left:10%;right:10%;top:26%;height:22%;border-radius:2px';
  if (id === 'knockout') return `<i style="${base};background:linear-gradient(120deg,var(--color-brand),var(--color-metal));"></i><i style="${base};top:56%;height:14%;background:var(--color-ink);opacity:.15"></i>`;
  if (id === 'outline') return `<i style="${base};background:none;border:2px solid var(--color-ink);opacity:.7"></i>`;
  if (id === 'trama') return `<i style="${base};background:repeating-linear-gradient(45deg,var(--color-ink) 0 2px,transparent 2px 5px)"></i>`;
  if (id === 'marcado') return `<i style="${base};background:var(--color-ink);opacity:.85"></i><i style="position:absolute;left:10%;width:38%;top:38%;height:10%;background:var(--color-brand);opacity:.9"></i>`;
  if (id === 'escalonado') return [[10, 26, 46], [22, 44, 26], [34, 62, 10]]
    .map(([l, t, r]) => `<i style="${base};top:${t}%;left:${l}%;right:${r}%;height:12%;background:var(--color-ink)"></i>`).join('');
  if (id === 'extendido') return `<i style="${base};left:5%;right:5%;background:var(--color-ink)"></i><i style="${base};top:56%;height:12%;left:5%;right:34%;background:var(--color-ink);opacity:.25"></i>`;
  // Biblioteca libre: con letras de verdad, que es lo que cambia entre uno y otro.
  const letras = (clase, extra = '') => `<span class="m-txt ${clase}" style="left:10%;top:22%;font-family:var(--font-display);font-size:19px;${extra}">Ab <em>cd</em></span>`;
  if (id === 'degradado') return letras('fx-title-gradient');
  if (id === 'mezcla') return letras('fx-title-mix');
  if (id === 'sombra') return letras('fx-title-shadow', '--ts-x:2px;--ts-y:2px');
  if (id === 'subrayado') return letras('fx-title-underline');
  if (id === 'dostonos') return `<span class="m-txt fx-title-twotone" style="left:10%;top:12%;font-family:var(--font-display);font-size:15px;line-height:1.05;--tt-c:var(--color-brand)">Uno<br>dos</span>`;
  if (id === 'cartel') return letras('fx-title-poster', 'font-size:21px');
  return `<i style="${base};background:var(--color-ink)"></i><i style="${base};top:56%;height:12%;right:38%;background:var(--color-ink);opacity:.25"></i>`;
}

function miniModulo(id) {
  const l = (x, y, w, h, o = .25) => `<i class="m-line" style="left:${x}%;top:${y}%;width:${w}%;height:${h}%;opacity:${o}"></i>`;
  switch (id) {
    case 'disclosure': return l(8, 20, 10, 8, .5) + l(24, 20, 44, 8, .6) + `<i class="m-pill" style="right:8%;top:17%;width:12%;height:14%"></i>` + l(8, 44, 78, 4) + l(8, 58, 60, 4) + l(8, 76, 84, 4, .12);
    case 'tabs': return `<i class="m-pill" style="left:8%;top:14%;width:22%;height:16%"></i>` + l(34, 16, 18, 12, .2) + l(56, 16, 18, 12, .2) + l(8, 48, 80, 5) + l(8, 64, 56, 5);
    case 'rail': return `<i class="m-img" style="left:6%;top:18%;width:26%;height:56%"></i><i class="m-img" style="left:37%;top:18%;width:26%;height:56%"></i><i class="m-img" style="left:68%;top:18%;width:26%;height:56%"></i>` + l(6, 86, 40, 5, .3);
    case 'sheet': return `<i class="m-box" style="inset:6%;opacity:.08"></i><i style="position:absolute;left:16%;right:16%;top:16%;bottom:16%;background:var(--color-surface);border-radius:5px;box-shadow:0 6px 14px -6px rgb(0 0 0/.5)"></i><i class="m-img" style="left:20%;top:20%;right:20%;height:26%"></i>` + l(20, 54, 40, 6, .5) + l(20, 68, 56, 4);
    case 'pull': return `<i class="m-txt" style="left:6%;top:6%;font-size:30px;color:var(--color-brand)">“</i>` + l(22, 26, 66, 8, .55) + l(22, 44, 58, 8, .55) + l(22, 66, 34, 5, .25);
    case 'note': return `<i style="position:absolute;inset:16%;border:1px dashed var(--color-ink);opacity:.35;border-radius:3px"></i>` + l(24, 36, 48, 5, .35) + l(24, 52, 36, 5, .35);
    case 'highlight': return `<i style="position:absolute;inset:20% 8%;background:var(--color-brand-soft);border-left:3px solid var(--color-brand);border-radius:4px"></i>` + l(16, 38, 60, 6, .4) + l(16, 54, 44, 6, .4);
    case 'stat': return [10, 40, 70].map((x) => `<i class="m-bar" style="left:${x}%;top:28%;width:18%;height:22%"></i><i class="m-line" style="left:${x}%;top:58%;width:22%;height:5%;opacity:.3"></i>`).join('');
    case 'time': return `<i style="position:absolute;left:12%;top:12%;bottom:12%;width:1.5px;background:var(--color-metal)"></i>` +
      [18, 44, 70].map((y) => `<i style="position:absolute;left:10%;top:${y}%;width:6%;aspect-ratio:1;border-radius:50%;background:var(--color-brand)"></i><i class="m-line" style="left:24%;top:${y + 1}%;width:${60 - y / 3}%;height:5%;opacity:.3"></i>`).join('');
    case 'sign': return [8, 37, 66].map((x) => `<i style="position:absolute;left:${x}%;top:22%;width:26%;height:50%;border-radius:5px;background:linear-gradient(180deg,var(--color-metal-hi),var(--color-metal-lo));padding:2px"></i><i style="position:absolute;left:${x + 1}%;top:24%;width:24%;height:46%;border-radius:4px;background:linear-gradient(180deg,var(--color-brand),var(--color-brand-dim))"></i>`).join('');
    default: return '<span class="m-nada">—</span>';
  }
}

function miniBase(id) {
  const b = BASES[id];
  return `<span style="position:absolute;inset:0;background:${b.paper}"></span>
    <span style="position:absolute;left:0;bottom:0;right:50%;top:50%;background:${b.alt}"></span>
    <span style="position:absolute;right:0;bottom:0;width:50%;top:50%;background:${b.deep}"></span>`;
}

function miniTipo(fam, peso) {
  return `<span style="position:absolute;inset:0;display:grid;place-items:center;font-family:'${fam}';
    font-weight:${peso || 700};font-size:22px;color:var(--color-ink)">Aa</span>`;
}

function miniMovimiento(id) {
  const l = (x, y, w, o) => `<i class="m-line" style="left:${x}%;top:${y}%;width:${w}%;height:7%;opacity:${o}"></i>`;
  if (id === 'quieto') return '<span class="m-nada">QUIETO</span>';
  if (id === 'split') return l(10, 26, 70, .6) + l(10, 46, 55, .35) + l(10, 66, 40, .15);
  if (id === 'counter') return `<i class="m-txt" style="left:50%;top:50%;translate:-50% -50%;font-size:17px">123</i>`;
  if (id === 'parallax') return `<i class="m-img" style="left:10%;top:14%;width:34%;height:60%"></i><i class="m-img" style="left:52%;top:28%;width:34%;height:60%;opacity:.35"></i>`;
  if (id === 'marquee') return l(-6, 40, 48, .45) + l(48, 40, 48, .25);
  if (id === 'spot') return `<i style="position:absolute;inset:0;background:radial-gradient(circle 34% at 62% 44%,color-mix(in srgb,var(--color-brand) 60%,transparent),transparent)"></i>`;
  if (id === 'tilt') return `<i class="m-img" style="left:20%;top:18%;width:60%;height:62%;rotate:-6deg"></i>`;
  if (id === 'trail') return [0, 1, 2].map((k) => `<i class="m-img" style="left:${14 + k * 22}%;top:${22 + k * 10}%;width:30%;height:44%;opacity:${.8 - k * .25}"></i>`).join('');
  // Biblioteca libre (scroll, sin JS): el estado a medio entrar, quieto.
  if (id === 'subida') return l(10, 30, 60, .55) + `<i class="m-line" style="left:10%;top:58%;width:44%;height:7%;opacity:.2;transform:translateY(5px)"></i>`;
  if (id === 'barrido') return `<i class="m-line" style="left:10%;top:30%;width:60%;height:7%;opacity:.55;clip-path:inset(0 45% 0 0)"></i>` + l(10, 52, 44, .25);
  if (id === 'enfoque') return `<i class="m-line" style="left:10%;top:30%;width:60%;height:7%;opacity:.5;filter:blur(2px)"></i>` + l(10, 52, 44, .25);
  if (id === 'escala') return `<i class="m-img" style="left:26%;top:20%;width:48%;height:56%;transform:scale(.85);opacity:.6"></i>`;
  if (id === 'progreso') return `<i style="position:absolute;left:0;top:0;height:8%;width:58%;background:var(--color-brand)"></i>` + l(10, 34, 60, .3) + l(10, 54, 44, .2);
  return l(10, 30, 60, .5) + l(10, 52, 44, .25);
}

/** Despacha según el grupo. */
/* La miniatura del juego de marca usa la marca REAL —el logo subido o la forma
   elegida— porque es lo único que se está decidiendo. Una aproximación aquí no
   informa de nada: lo que cambia entre un juego y otro es dónde y cómo cae TU
   forma, no qué forma es. */
function miniMarca(id) {
  const m = fuenteMarca();
  const mask = (tam, rep = 'no-repeat', pos = 'center') =>
    `-webkit-mask:url('${m}') ${pos}/${tam} ${rep};mask:url('${m}') ${pos}/${tam} ${rep};`;
  const capa = (estilo) => `<span style="position:absolute;${estilo}"></span>`;
  const base = 'inset:0;background:var(--color-paper);';

  if (id === 'ninguno') return capa(base) + capa('left:6px;top:6px;width:22px;height:10px;background:var(--color-ink);opacity:.5;' + mask('contain'));
  if (id === 'sello') return capa(base) + capa('top:5px;right:5px;width:20px;height:20px;border-radius:999px;border:1px solid var(--color-ink);opacity:.5') +
    capa('top:9px;right:9px;width:12px;height:12px;background:var(--color-brand);' + mask('contain'));
  if (id === 'agua') return capa(base) + capa('right:-10%;bottom:-25%;width:70%;height:120%;background:var(--color-ink);opacity:.14;' + mask('contain'));
  if (id === 'ventana') {
    // Como en el lienzo: la foto se ve por dentro de la forma. Las de ejemplo
    // son relativas a la raíz del repo; aquí la página está en /estudio/.
    const f = String(FL()[0] || '');
    const foto = (/^(blob:|data:|https?:|file:)/.test(f) ? f : '../' + f).replace(/'/g, '%27');
    return capa(base) + capa(`left:50%;top:50%;transform:translate(-50%,-50%);width:70%;height:80%;background:var(--color-brand) url('${foto}') center/cover;` + mask('contain'));
  }
  if (id === 'trama') return capa(base) + capa('inset:0;background:var(--color-ink);opacity:.16;' + mask('13px 13px', 'repeat', '0 0'));
  if (id === 'calado') return capa(base) + capa('left:-14%;bottom:-30%;width:55%;height:95%;background:var(--color-brand);opacity:.5;' + mask('contain'));
  return capa(base);
}

function mini(tipo, id, extra) {
  switch (tipo) {
    case 'fondo': return miniFondo(id);
    case 'escena': return miniEscena(id);
    case 'pieza': return miniPieza(id);
    case 'forma': return miniForma(id);
    case 'foto': return miniFoto(id);
    case 'header': return miniHeader(id);
    case 'footer': return miniFooter(id);
    case 'boton': return miniBoton(id);
    case 'titular': return miniTitular(id);
    case 'modulo': return miniModulo(id);
    case 'movimiento': return miniMovimiento(id);
    case 'base': return miniBase(id);
    case 'tipo': return miniTipo(id, extra);
    case 'marca': return miniMarca(id);
    default: return '';
  }
}

/** Pinta un grupo de opciones como miniaturas. */
function opciones(host, entradas, activo, onPick, o = {}) {
  const el = $(host);
  if (!el) return;
  el.className = 'ui-ops' + (o.cols ? ' ui-ops-' + o.cols : '');
  el.innerHTML = '';
  entradas.forEach(([id, label, titulo, extra]) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'ui-op';
    if (titulo) b.title = titulo;
    const on = o.multi ? activo.includes(id) : activo === id;
    if (on) b.classList.add('on');
    const esJs = (o.tipo === 'fondo' && FONDOS[id]?.js) || (o.tipo === 'foto' && FOTOS[id]?.js)
      || (o.tipo === 'modulo' && MODULOS[id]?.js) || (o.tipo === 'movimiento' && MOVIMIENTO[id]?.js);
    b.innerHTML = `<span class="ui-op-vis">${mini(o.tipo, id, extra)}</span>
      <span class="ui-op-lbl">${esc(label)}${esJs ? '<em class="ui-op-js">JS</em>' : ''}</span>`;
    b.addEventListener('click', () => onPick(id));
    el.appendChild(b);
  });
}

function pintaControles() {
  opciones('#display', DISPLAY.map(([id, l, d]) => [id, l, d, 800]), S.display, (v) => set('display', v), { tipo: 'tipo' });
  opciones('#texto', TEXTO.map(([id, l]) => [id, l, '', 500]), S.texto, (v) => set('texto', v), { tipo: 'tipo' });
  opciones('#base', Object.entries(BASES).map(([k, v]) => [k, v.n, v.hue]), S.base, (v) => set('base', v), { tipo: 'base' });
  opciones('#fondo', Object.entries(FONDOS).map(([k, v]) => [k, v.n, v.dice]), S.fondo, (v) => set('fondo', v), { tipo: 'fondo' });
  opciones('#escena', Object.entries(ESCENAS).map(([k, v]) => [k, v.n]), S.escena, (v) => set('escena', v), { tipo: 'escena' });
  opciones('#pieza', Object.entries(PIEZAS).map(([k, v]) => [k, v.n]), S.pieza, (v) => set('pieza', v), { tipo: 'pieza' });
  opciones('#foto', Object.entries(FOTOS).map(([k, v]) => [k, v.n, v.nota]), S.foto, (v) => set('foto', v), { tipo: 'foto' });
  opciones('#forma', Object.entries(FORMAS).map(([k, v]) => [k, v.n]), S.forma, (v) => set('forma', v), { tipo: 'forma' });
  opciones('#header', Object.entries(HEADERS).map(([k, v]) => [k, v.n]), S.header, (v) => set('header', v), { tipo: 'header', cols: 2 });
  opciones('#boton', Object.entries(BOTONES).map(([k, v]) => [k, v.n, v.nota]), S.boton, (v) => set('boton', v), { tipo: 'boton' });
  opciones('#titular', Object.entries(TITULARES).map(([k, v]) => [k, v.n, v.nota]), S.titular, (v) => set('titular', v), { tipo: 'titular' });
  opciones('#footer', Object.entries(FOOTERS).map(([k, v]) => [k, v.n]), S.footer, (v) => set('footer', v), { tipo: 'footer', cols: 2 });
  opciones('#modulos', Object.entries(MODULOS).map(([k, v]) => [k, v.n, v.nota]), S.modulos, (v) => toggle('modulos', v), { tipo: 'modulo', multi: true, cols: 2 });
  opciones('#movimiento', Object.entries(MOVIMIENTO).map(([k, v]) => [k, v.n]), S.movimiento, (v) => toggle('movimiento', v), { tipo: 'movimiento', multi: true });

  /* La marca. La rejilla de formas se pinta a mano porque la miniatura tiene
     que ser la forma DE VERDAD —o el logo subido—, no una aproximación: es lo
     único que se está eligiendo aquí. */
  const hostF = $('#marca-forma');
  if (hostF) {
    hostF.className = 'ui-ops';
    hostF.innerHTML = '';
    Object.entries(FORMAS_MARCA).forEach(([id, [n, d, memoria]]) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'ui-op' + (!S.logo && S.marcaForma === id ? ' on' : '');
      b.title = memoria ? `${n}: ${memoria}` : n;
      b.innerHTML = `<span class="ui-op-vis" style="display:grid;place-items:center">
        <svg viewBox="0 0 96 96" width="34" height="34" aria-hidden="true"><path d="${d}" fill="var(--color-ink)" fill-rule="evenodd"/></svg>
      </span><span class="ui-op-lbl">${esc(n)}</span>`;
      b.addEventListener('click', () => { S.logo = null; $('#logo-file') && ($('#logo-file').value = ''); $('#logo-diag') && ($('#logo-diag').innerHTML = ''); set('marcaForma', id); });
      hostF.appendChild(b);
    });
    // Si hay logo subido, manda él: las formas quedan como alternativa.
    hostF.style.opacity = S.logo ? '.45' : '1';
  }
  const chrome = $('#marca-chrome');
  if (chrome) chrome.checked = !!S.marcaEnChrome;
  const aro = $('#ventana-marco');
  if (aro) aro.checked = S.ventanaMarco !== false;
  opciones('#marca-juego', Object.entries(MARCAJUEGOS).map(([k, v]) => [k, v.n, v.dice]), S.marcaJuego, (v) => set('marcaJuego', v), { tipo: 'marca', cols: 2 });

  if ($('#canales')) chips('#canales', Object.entries(CANALES), S.canales, (v) => toggle('canales', v), true);

  // El papel: sin papel propio, el selector enseña el de la base elegida.
  const pp = $('#papel-propio'), pc = $('#papel');
  if (pp && pc) {
    pp.checked = !!S.papel;
    pc.value = S.papel || (BASES[S.base] || {}).paper || '#F5F6F7';
    pc.disabled = !!(BASES[S.base] || {}).oscuro;
    pp.disabled = pc.disabled;
  }

  pintaColocacion();
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


/* La misma pieza en otra esquina es otra composición, así que la colocación
   es una decisión de diseño y no un detalle. Rejilla de nueve, como un cartel. */
function pintaColocacion() {
  const host = $('#colocacion');
  if (!host) return;
  const off = S.pieza === 'ninguna';
  host.style.opacity = off ? '.35' : '1';
  host.style.pointerEvents = off ? 'none' : 'auto';
  host.innerHTML = `
    <div class="ui-field"><span>Dónde</span>
      <div class="ui-rejilla">${Object.entries(POSICIONES).map(([k, v]) =>
        `<button type="button" data-p="${k}" class="${S.pos === k ? 'on' : ''}" title="${v.n}"></button>`).join('')}</div></div>
    <div class="ui-field"><span>Tamaño</span>
      <div class="ui-chips ui-chips-sm">${Object.entries(TAMANOS).map(([k, v]) =>
        `<button type="button" data-t="${k}" class="${S.tam === k ? 'on' : ''}">${v.n}</button>`).join('')}</div></div>
    <div class="ui-field"><span>Relleno</span>
      <div class="ui-chips ui-chips-sm">${Object.entries(RELLENOS).map(([k, v]) =>
        `<button type="button" data-r="${k}" class="${S.relleno === k ? 'on' : ''}">${v.n}</button>`).join('')}</div></div>`;
  host.querySelectorAll('[data-p]').forEach((b) => b.addEventListener('click', () => set('pos', b.dataset.p)));
  host.querySelectorAll('[data-t]').forEach((b) => b.addEventListener('click', () => set('tam', b.dataset.t)));
  host.querySelectorAll('[data-r]').forEach((b) => b.addEventListener('click', () => set('relleno', b.dataset.r)));
}

/** La pieza geométrica, tal y como va al lienzo y al encargo.
 *
 *  Ojo con el contorno: un `border` NO sirve en las formas que usan clip-path,
 *  porque el recorte se come el borde y la pieza desaparece. Se resuelve
 *  apilando la misma forma dos veces —la de dentro en el color del fondo—,
 *  que además funciona igual en las formas de border-radius. */
function piezaHTML() {
  if (S.pieza === 'ninguna') return '';
  const p = PIEZAS[S.pieza], pos = POSICIONES[S.pos], t = TAMANOS[S.tam];
  const base = `position:absolute;pointer-events:none;left:${pos.x};top:${pos.y};translate:-50% -50%;
    width:${t.v};aspect-ratio:1;--pc:var(--color-brand);
    --pw:${S.tam === 's' ? '1.2rem' : (S.tam === 'l' || S.tam === 'xl') ? '3rem' : '2rem'};${p.css || ''}`;

  if (S.relleno === 'contorno') {
    const grosor = S.tam === 's' ? 3 : S.tam === 'xl' ? 8 : 5;
    return `<span aria-hidden="true" style="${base};z-index:0;background:var(--color-brand)"></span>
      <span aria-hidden="true" style="${base};z-index:0;background:var(--color-paper);
        width:calc(${t.v} - ${grosor * 2}px)"></span>`;
  }

  let fondo = 'background:var(--color-brand)', extra = '';
  if (S.relleno === 'suave') fondo = 'background:color-mix(in srgb, var(--color-brand) 38%, transparent)';
  if (S.relleno === 'difuso') { fondo = 'background:color-mix(in srgb, var(--color-brand) 60%, transparent)'; extra = 'filter:blur(32px);'; }
  if (S.relleno === 'trama') fondo = 'background:repeating-linear-gradient(45deg,var(--color-brand) 0 4px,transparent 4px 10px)';

  return `<span aria-hidden="true" style="${base};z-index:0;${fondo};${extra}"></span>`;
}

