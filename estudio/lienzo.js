/* Estudio de marca · lienzo.js
   El lienzo: la web de verdad dentro del iframe.
   Script clásico: comparte el ámbito global con los demás ficheros del
   Estudio y se carga en el orden de index.html. */
'use strict';

/* ── Previsualización ─────────────────────────────────────────────────────── */
function capaFondo(atenua = false) {
  const f = FONDOS[S.fondo];
  if (!f || S.fondo === 'ninguno') return '';
  // Sobre fondo profundo la trama se baja: ahí compite con el texto blanco, que
  // es justo la regla 10 del suelo («si ves antes el fondo que el titular…»).
  if (f.js) return `<div class="absolute inset-0"${atenua ? ' style="opacity:.5"' : ''} data-fx="${S.fondo}"></div>`;
  return `<div class="${f.clase}" style="${f.vars || ''}${atenua ? ';opacity:.5' : ''}"></div>`;
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
    estilo += `--knockout:url(${FL()[1]});`;
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
      return `<div style="margin-top:2rem">
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
            <figure class="fx-disc-fig"><img src="${FL()[3]}" alt=""></figure></div>
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
        ${FL().slice(0, 4).map((s) => figura(s)).join('')}</div>`;
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

/* ── La marca ─────────────────────────────────────────────────────────────
   El logo no es sólo lo que va arriba a la izquierda. Bien hecho, la forma de
   la marca se reutiliza como elemento de composición: en Córdoba Soluciona el
   arco del logo vuelve a aparecer como ventana en tres sitios, y eso es lo que
   hace que la web se lea como suya y no como una plantilla.

   Todo esto funciona con UN mecanismo: `mask-image`. Se enmascara un bloque
   con el logo y se pinta el bloque, no el logo. Con eso salen gratis las cinco
   cosas que hacen falta:
     · recolorear un logo de cualquier formato (para el pie oscuro)
     · el sello, la marca de agua y la trama repetida
     · la VENTANA, que es la buena: el fondo o la foto se ven POR DENTRO de la
       forma, porque lo que se enmascara es la capa de debajo.
   Y funciona igual con un SVG que con un PNG con transparencia, que es lo que
   suele mandar el cliente.

   El precio: el logo tiene que ser una silueta. Si trae fondo blanco, la
   máscara es un rectángulo y no hay nada que mirar. Por eso hay diagnóstico. */

/** Formas de repuesto, para poder jugar antes de tener el logo del cliente. */
const FORMAS_MARCA = {
  arco: ['Arco', 'M6 96V54A42 42 0 1 1 90 54V96H78V56A30 30 0 1 0 18 56V96Z'],
  disco: ['Disco', 'M48 8A40 40 0 1 1 48 88A40 40 0 1 1 48 8ZM48 26A22 22 0 1 0 48 70A22 22 0 1 0 48 26Z'],
  triangulo: ['Triángulo', 'M48 10L90 84H6Z'],
  rombo: ['Rombo', 'M48 6L90 48L48 90L6 48Z'],
  hexagono: ['Hexágono', 'M48 6L85 27V69L48 90L11 69V27Z'],
  cruz: ['Cruz', 'M38 6H58V38H90V58H58V90H38V58H6V38H38Z'],
  galon: ['Galón', 'M14 18L48 52L82 18L92 30L48 76L4 30Z'],
  barra: ['Barra', 'M6 30H90V48H6ZM6 60H62V78H6Z'],
};

/** La forma elegida como SVG en data URL, para poder usarla de máscara. */
function marcaSVG() {
  const f = FORMAS_MARCA[S.marcaForma] || FORMAS_MARCA.arco;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96"><path d="${f[1]}" fill="#000"/></svg>`;
  return 'data:image/svg+xml,' + encodeURIComponent(svg);
}

/**
 * La fuente de la marca: el logo subido si lo hay, si no la forma elegida.
 *
 * Las comillas van escapadas por una razón concreta: esto acaba dentro de un
 * `url(...)` dentro de un atributo `style="..."` de HTML. Con comillas dobles
 * —`url("data:…")`— la primera comilla CIERRA EL ATRIBUTO, la máscara llega
 * como `url("")` y el juego de marca desaparece sin ningún error en consola.
 * Pasó. Por eso ahora es `url('…')` y aquí se neutraliza la comilla simple.
 */
/* Para el encargo: la misma capa que pinta el lienzo, pero apuntando al fichero
   del logo en el proyecto en vez de a un data URL de 200 KB. Se pinta con
   capaMarca() y no con una copia escrita a mano, para que la receta que se
   entrega sea EXACTAMENTE lo que se vio. */
let MARCA_FIJA = null;
const fuenteMarca = () => MARCA_FIJA
  || String((S.logo && S.logo.src) ? S.logo.src : marcaSVG()).replace(/'/g, '%27');
const proporcionMarca = () => (S.logo && S.logo.w && S.logo.h) ? S.logo.w / S.logo.h : 1;

/**
 * Un bloque enmascarado con la marca. `color` puede ser un color (el logo sale
 * plano de ese color, que es como se recolorea) o 'fondo', y entonces se deja
 * transparente para que se vea lo que haya debajo: eso es la ventana.
 */
function marcaMascara(alto, color, extra = '') {
  const ancho = `calc(${alto} * ${proporcionMarca().toFixed(3)})`;
  const pintura = color === 'fondo' ? '' : `background:${color};`;
  return `width:${ancho};height:${alto};${pintura}
    -webkit-mask:url('${fuenteMarca()}') center/contain no-repeat;
    mask:url('${fuenteMarca()}') center/contain no-repeat;${extra}`;
}

/** El logo para la cabecera y el pie. En oscuro se recolorea con la máscara. */
function marcaHTML(alto, oscuro) {
  if (!S.marcaEnChrome) {
    return `<strong style="font-family:var(--font-display);font-weight:800;font-size:1.05rem;${S.ancho ? 'font-stretch:116%' : ''}">${esc(S.marca)}</strong>`;
  }
  const color = oscuro ? '#fff' : 'var(--color-ink)';
  return `<span aria-label="${esc(S.marca)}" role="img" style="display:inline-block;${marcaMascara(alto, color)}"></span>`;
}

/** La marca como capa de sección: sello, agua, ventana, trama o calado. */
function capaMarca(oscuro) {
  const j = S.marcaJuego;
  if (!j || j === 'ninguno') return '';
  const tinta = oscuro ? '#fff' : 'var(--color-ink)';

  if (j === 'sello') {
    return `<span aria-hidden="true" style="position:absolute;top:1.5rem;right:1.5rem;z-index:0;
      display:grid;place-items:center;width:5.5rem;height:5.5rem;border-radius:999px;
      border:1px solid ${oscuro ? 'rgb(255 255 255/.35)' : 'var(--color-line-strong)'};">
      <span style="${marcaMascara('2.6rem', 'var(--color-brand)')}"></span></span>`;
  }
  if (j === 'agua') {
    return `<span aria-hidden="true" style="position:absolute;right:-6%;bottom:-18%;z-index:0;
      opacity:.07;${marcaMascara('34rem', tinta)}"></span>`;
  }
  if (j === 'ventana') {
    /* Calibrado a la baja a propósito, y me costó verlo: la primera versión
       iba centrada, a 26rem y opacidad .85, y se comía el titular. Es la
       regla 10 del suelo —«si ves antes el fondo que el titular, está mal
       calibrado»— incumplida por la propia herramienta que la comprueba.
       Va a un lado, no detrás del texto, y a una opacidad en la que se
       intuye la forma sin disputarle la lectura a nadie. */
    return `<span aria-hidden="true" style="position:absolute;right:-4%;top:50%;
      transform:translateY(-50%);z-index:0;opacity:.22;
      ${marcaMascara('30rem', 'var(--color-brand)')}"></span>`;
  }
  if (j === 'trama') {
    return `<span aria-hidden="true" style="position:absolute;inset:0;z-index:0;opacity:.06;
      background:${tinta};
      -webkit-mask:url('${fuenteMarca()}') 0 0/4.5rem 4.5rem repeat;
      mask:url('${fuenteMarca()}') 0 0/4.5rem 4.5rem repeat;"></span>`;
  }
  if (j === 'calado') {
    return `<span aria-hidden="true" style="position:absolute;left:-4rem;bottom:-4rem;z-index:0;
      opacity:.16;${marcaMascara('16rem', 'var(--color-brand)')}"></span>`;
  }
  return '';
}

/* ── El compositor de secciones ───────────────────────────────────────────
   Antes el lienzo tenía tres secciones escritas a mano: se elegía cómo se veía
   la página, no cuál era. Ahora la página ES `S.secciones`, un array ordenado,
   y esto lo traduce a HTML.

   El contenido de ejemplo está escrito, no rellenado con lorem ni con los
   tópicos de siempre: un ejemplo que dice «Soluciones a medida» enseña a
   escribir mal, y lo que se ve en la previsualización es lo que acaba copiado. */

const TONOS = {
  paper: 'background:var(--color-paper);color:var(--color-ink)',
  alt: 'background:var(--color-paper-alt);color:var(--color-ink)',
  deep: 'background:var(--color-deep);color:#fff',
};

const ojo = (t) => `<p style="font-family:var(--font-display);font-size:.72rem;font-weight:700;letter-spacing:.16em;
  text-transform:uppercase;opacity:.65;margin:0 0 1rem">${esc(t)}</p>`;
const h2 = (t) => `<h2>${esc(t)}</h2>`;
const lead = (t, osc) => `<p class="lead"${osc ? ' style="color:rgb(255 255 255/.72)"' : ''}>${t}</p>`;
const suave = (osc) => osc ? 'rgb(255 255 255/.7)' : 'var(--color-ink-soft)';

/* Contenido de ejemplo. Nombres y cifras deliberadamente concretos: un «99,9 %»
   o un «Juan Pérez» son el tell de plantilla que la skill prohíbe. */
const EJ = {
  servicios: [
    ['Rótulos de fachada', 'Letra corporal, cajón de luz o vinilo sobre panel. Medimos in situ.', 'desde 480 €'],
    ['Rotulación de vehículos', 'Vinilo fundido, plotter propio. Furgón entero en dos días.', 'desde 350 €'],
    ['Placas y señalética', 'Metacrilato, dibond o acero. Con la normativa del local.', 'desde 60 €'],
    ['Montaje y mantenimiento', 'Camión cesta propio. Retiramos lo viejo y lo reciclamos.', 'presupuesto'],
  ],
  pasos: [
    ['Medimos', 'Vamos al local con el metro. Las medidas de un plano nunca son las de la pared.'],
    ['Dibujamos', 'Un montaje sobre la foto de tu fachada, para que lo veas antes de que exista.'],
    ['Fabricamos', 'En el taller, no subcontratado. Por eso podemos cambiar algo a mitad.'],
    ['Montamos', 'Con medios propios y el permiso de ocupación pedido, si hace falta.'],
  ],
  cifras: [['1993', 'Desde entonces'], ['100 %', 'Fabricación propia'], ['48 h', 'Presupuesto cerrado'], ['2', 'Camiones cesta']],
  resenas: [
    ['Lo pusieron en dos días y lo que dijeron que costaba fue lo que costó.', 'Reseña en Google · marzo de 2026'],
    ['Vinieron a medir un sábado porque el local abría el lunes. Eso no lo hace nadie.', 'Reseña en Google · enero de 2026'],
  ],
  faq: [
    ['¿Hace falta permiso del ayuntamiento?', 'Para fachada, casi siempre. Lo tramitamos nosotros y va incluido en el presupuesto.'],
    ['¿Cuánto tarda un rótulo de fachada?', 'Dos semanas desde que se aprueba el diseño. Si hay que pedir permiso, sumá tres más.'],
    ['¿Reparáis rótulos de otros?', 'Sí, si el cajón está sano. Si no, sale más caro arreglarlo que hacerlo nuevo y te lo decimos.'],
  ],
  sitios: ['La Carlota', 'Écija', 'Palma del Río', 'Fuente Palmera', 'Posadas', 'Almodóvar del Río', 'La Rambla', 'Santaella'],
};

/* Lo del cliente si lo hay; el ejemplo si no. Así el lienzo pasa a ser la
   maqueta de F5 —su marca, sus servicios, sus reseñas— en cuanto se rellena
   el bloque de contenido, y mientras tanto sigue enseñando algo con sentido.
   El texto del cliente se escapa AQUÍ y no en la fuente: la fuente también
   alimenta el encargo (texto plano) y el andamio (cadenas de JavaScript). */
const escFila = (xs) => xs.map((x) => esc(x));
const svc = () => (serviciosCliente().length ? serviciosCliente().map(escFila) : EJ['servicios']);
const res = () => (resenasCliente().length ? resenasCliente().map(escFila) : EJ['resenas']);
const sit = () => (sitiosCliente().length ? escFila(sitiosCliente()) : EJ['sitios']);
const cif = () => (cifrasCliente().length ? cifrasCliente().map(([v, q]) => [esc(v), esc(q)]) : EJ['cifras']);
const pas = () => (pasosCliente().length
  ? pasosCliente().map(([t, d, p]) => [esc(t), esc([d, p].filter(Boolean).join(' · '))]) : EJ['pasos']);

function filaServicio([t, d, p], i, osc) {
  return `<div style="display:grid;grid-template-columns:2.5rem 1fr auto;gap:1.2rem;align-items:baseline;
    padding:1.4rem 0;border-top:1px solid ${osc ? 'rgb(255 255 255/.15)' : 'var(--color-line)'}">
    <span class="tabular" style="font-family:var(--font-display);font-weight:700;opacity:.45">0${i + 1}</span>
    <div><p style="font-family:var(--font-display);font-weight:700;font-size:1.15rem;margin:0">${t}</p>
      <p style="margin:.35rem 0 0;font-size:.92rem;color:${suave(osc)}">${d}</p></div>
    <span class="tabular" style="font-size:.85rem;color:${suave(osc)};white-space:nowrap">${p}</span>
  </div>`;
}

const CUERPO = {
  hero(v) {
    const titulo = S.titular === 'knockout' ? 'TU NOMBRE' : (S.oficio ? esc(S.oficio) : 'Lo que hacemos, en claro.');
    const entrada = lead(S.prueba.trim() ? esc(S.prueba.trim())
      : 'Una línea que explica qué se vende y a quién, con palabras del cliente y no del sector.');
    const primario = canalesDecididos() && canal('whatsapp') && !canal('formulario') ? 'Escribir por WhatsApp' : 'Pedir presupuesto';
    const botones = `<div style="display:flex;gap:.7rem;flex-wrap:wrap;margin-top:2rem">
      ${botonHTML(primario)}${botonHTML('Ver trabajos', false)}</div>`;
    const texto = `${ojo(S.marca)}${tituloHTML(titulo)}<div style="margin-top:1.4rem">${entrada}</div>${botones}`;

    if (v === 'partida') {
      return `<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(20rem,1fr));gap:clamp(2rem,5vw,4rem);align-items:center">
        <div>${texto}</div><div>${figura(FL()[0])}</div></div>`;
    }
    if (v === 'centrada') {
      return `<div style="text-align:center;max-width:46rem;margin:0 auto">${texto}
        <div style="margin-top:3rem">${figura(FL()[1])}</div></div>`;
    }
    return `${texto}
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(11rem,1fr));gap:1rem;margin-top:3rem">
        ${FL().slice(0, 3).map((s, i) => figura(s, i)).join('')}</div>`;
  },

  banda(v, osc) {
    if (v === 'marquesina') {
      // El contrato de `marquee` es del kit, no inventado aquí: contenedor con
      // data-fx, pista con data-fx-track y el contenido DUPLICADO (el efecto
      // mide media pista para que el bucle no tenga costura).
      const tira = `<span style="font-family:var(--font-display);font-weight:800;white-space:nowrap;
        font-size:clamp(1.6rem,4vw,2.8rem);letter-spacing:-.02em;padding-inline:1.5rem">
        ${sit().slice(0, 5).join(' · ')} · </span>`;
      return `<div data-fx="marquee" style="overflow:hidden">
        <div data-fx-track style="display:flex;width:max-content">${tira}${tira}</div></div>`;
    }
    if (v === 'datos') {
      return `<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(9rem,1fr));gap:1.5rem;text-align:center">
        ${cif().slice(0, 3).map(([n, l]) => `<div class="fx-stat"><span>${n}</span><span>${l}</span></div>`).join('')}</div>`;
    }
    return `<p style="font-family:var(--font-display);font-weight:800;font-size:clamp(1.5rem,3.6vw,2.4rem);
      line-height:1.1;letter-spacing:-.02em;margin:0;max-width:26ch">
      ${S.respuestaObjecion.trim() ? esc(S.respuestaObjecion.trim()) : 'Si no sabemos hacerlo, te decimos quién lo hace.'}</p>`;
  },

  servicios(v, osc) {
    const cab = `${ojo('Qué hacemos')}${h2('Cuatro cosas, y las cuatro las hacemos nosotros')}
      ${lead('Nada de subcontratas: el taller es propio y por eso podemos cambiar algo a mitad.', osc)}`;
    if (v === 'alterno') {
      return `${cab}<div style="margin-top:3rem;display:grid;gap:clamp(2rem,4vw,3.5rem)">
        ${svc().slice(0, 3).map(([t, d], i) => `
          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(17rem,1fr));gap:2rem;align-items:center">
            <div style="${i % 2 ? 'order:2' : ''}">
              <p style="font-family:var(--font-display);font-weight:700;font-size:1.3rem;margin:0">${t}</p>
              <p style="margin:.6rem 0 0;color:${suave(osc)}">${d}</p></div>
            ${figura(FL()[i])}</div>`).join('')}</div>`;
    }
    if (v === 'bento') {
      return `${cab}<div style="margin-top:2.5rem;display:grid;grid-template-columns:repeat(4,1fr);gap:1rem">
        ${svc().map(([t, d], i) => {
          const ancho = i === 0 ? 'grid-column:span 2;grid-row:span 2' : 'grid-column:span 2';
          return `<div class="frame" style="${ancho};padding:1.5rem;border:1px solid ${osc ? 'rgb(255 255 255/.15)' : 'var(--color-line)'};border-radius:14px">
            <p style="font-family:var(--font-display);font-weight:700;font-size:1.1rem;margin:0">${t}</p>
            <p style="margin:.5rem 0 0;font-size:.9rem;color:${suave(osc)}">${d}</p></div>`;
        }).join('')}</div>`;
    }
    return `${cab}<div style="margin-top:2.5rem">${svc().map((s, i) => filaServicio(s, i, osc)).join('')}</div>`;
  },

  galeria(v, osc) {
    const cab = `${ojo('Trabajos')}${h2('Lo que ya está puesto')}
      ${lead('Fotos de obra propia, enteras y sin retocar. Si no hay foto de algo, es que no lo hemos hecho.', osc)}`;
    if (v === 'carril') {
      return `${cab}<div class="fx-rail" style="margin-top:2rem;--rail-w:72%;--rail-w-lg:34%">
        ${FL().map((s) => figura(s)).join('')}</div>`;
    }
    if (v === 'destacado') {
      return `${cab}<div style="margin-top:2rem">${figura(FL()[0])}</div>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(10rem,1fr));gap:1rem;margin-top:1rem">
          ${FL().slice(1, 4).map((s, i) => figura(s, i)).join('')}</div>`;
    }
    return `${cab}<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(13rem,1fr));gap:1rem;margin-top:2rem">
      ${FL().map((s, i) => figura(s, i)).join('')}</div>`;
  },

  datos(v, osc) {
    const n = v === 'rejilla' ? 4 : 3;
    return `${ojo('En números')}${h2('Lo que se puede medir')}
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(9rem,1fr));gap:1.5rem;margin-top:2rem">
        ${cif().slice(0, n).map(([x, l]) => `<div class="fx-stat"><span>${x}</span><span>${l}</span></div>`).join('')}</div>`;
  },

  proceso(v, osc) {
    const cab = `${ojo('Cómo trabajamos')}${h2('De la primera visita al rótulo encendido')}`;
    if (v === 'pasos') {
      return `${cab}<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(12rem,1fr));gap:2rem;margin-top:2.5rem">
        ${pas().map(([t, d], i) => `<div>
          <span class="tabular" style="font-family:var(--font-display);font-weight:800;font-size:2.2rem;
            line-height:1;color:var(--color-brand)">${i + 1}</span>
          <p style="font-family:var(--font-display);font-weight:700;margin:.6rem 0 0">${t}</p>
          <p style="margin:.4rem 0 0;font-size:.9rem;color:${suave(osc)}">${d}</p></div>`).join('')}</div>`;
    }
    if (v === 'pestanas') {
      return `${cab}<div class="fx-tabs" style="margin-top:2rem">
        ${pas().slice(0, 3).map(([t], i) => `<input type="radio" name="proc" id="pr${i}"${i ? '' : ' checked'}><label for="pr${i}">${t}</label>`).join('')}
        <div class="fx-tabs-panels">
          ${pas().slice(0, 3).map(([, d]) => `<div><p style="margin:0;color:${suave(osc)}">${d}</p></div>`).join('')}
        </div></div>`;
    }
    return `${cab}<div style="position:relative;margin-top:2.5rem;padding-left:2.4rem">
      <div class="fx-plumb fx-plumb-bare" style="--plumb-x:.5rem"></div>
      <ol class="fx-time" style="list-style:none;margin:0;padding:0">
        ${pas().map(([t, d]) => `<li><span>${t}</span><p>${d}</p></li>`).join('')}</ol></div>`;
  },

  testimonio(v, osc) {
    if (v === 'dos') {
      return `${ojo('Lo que dicen')}<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(17rem,1fr));gap:2.5rem;margin-top:1rem">
        ${res().map(([t, f]) => `<div>
          <blockquote class="fx-pull" style="margin:0">${t}</blockquote>
          <p style="margin:.75rem 0 0;font-size:.85rem;color:${suave(osc)}">${f}</p></div>`).join('')}</div>`;
    }
    const [t, f] = res()[0];
    return `${ojo('Lo que dicen')}
      <blockquote class="fx-pull" style="margin:0;max-width:34ch">${t}</blockquote>
      <p style="margin:.75rem 0 0;font-size:.85rem;color:${suave(osc)}">${f}</p>`;
  },

  precios(v, osc) {
    const cab = `${ojo('Precios')}${h2('Lo que cuesta, sin tener que pedirlo')}
      ${lead('Son precios de partida reales. El presupuesto cerrado sale tras medir.', osc)}`;
    if (v === 'tabla') {
      return `${cab}<table class="tabular" style="width:100%;border-collapse:collapse;margin-top:2rem;font-size:.95rem">
        ${svc().map(([t, d, p]) => `<tr style="border-top:1px solid ${osc ? 'rgb(255 255 255/.15)' : 'var(--color-line)'}">
          <td style="padding:.9rem 0">${t}<br><span style="font-size:.85rem;color:${suave(osc)}">${d}</span></td>
          <td style="padding:.9rem 0;text-align:right;white-space:nowrap">${p}</td></tr>`).join('')}</table>`;
    }
    return `${cab}<div style="margin-top:2rem">
      ${svc().slice(0, 3).map(([t, d, p], i) => `<details class="fx-disc-item"${i === 0 ? ' open' : ''}>
        <summary class="fx-disc-head">
          <span class="fx-disc-n tabular">0${i + 1}</span>
          <span class="fx-disc-titles"><span class="fx-disc-title">${t}</span><span class="fx-disc-hint">${d}</span></span>
          <span class="fx-disc-meta tabular">${p}</span>
          <span class="fx-disc-sign" aria-hidden="true"><i></i><i></i></span>
        </summary>
        <div class="fx-disc-body"><div class="fx-disc-text"><p>Qué entra en ese precio, con nombre y apellidos: material, medidas y montaje. Cerrado ya dice algo; por eso se abre.</p></div>
        <figure class="fx-disc-fig"><img src="${FL()[i]}" alt=""></figure></div></details>`).join('')}</div>`;
  },

  faq(v, osc) {
    const item = ([q, r], i) => `<details class="fx-disc-item"${i === 0 ? ' open' : ''}>
      <summary class="fx-disc-head">
        <span class="fx-disc-titles"><span class="fx-disc-title">${q}</span></span>
        <span class="fx-disc-sign" aria-hidden="true"><i></i><i></i></span>
      </summary>
      <div class="fx-disc-body"><div class="fx-disc-text"><p>${r}</p></div></div></details>`;
    const cab = `${ojo('Preguntas')}${h2('Lo que preguntan antes de llamar')}`;
    if (v === 'dos') {
      return `${cab}<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(18rem,1fr));gap:1rem 2rem;margin-top:2rem">
        ${EJ.faq.map((f, i) => `<div>${item(f, i)}</div>`).join('')}</div>`;
    }
    return `${cab}<div style="margin-top:2rem">${EJ.faq.map(item).join('')}</div>`;
  },

  zona(v, osc) {
    const sitios = `<div style="display:flex;flex-wrap:wrap;gap:.5rem;margin-top:2rem">
      ${sit().map((s) => `<span style="font-size:.9rem;padding:.4rem .8rem;border-radius:999px;
        border:1px solid ${osc ? 'rgb(255 255 255/.2)' : 'var(--color-line-strong)'}">${s}</span>`).join('')}</div>`;
    const cab = `${ojo('Dónde trabajamos')}${h2('La provincia, y lo que cae al lado')}
      ${lead('Los nombres propios de los pueblos, que es lo que la gente escribe en el buscador.', osc)}`;
    if (v === 'mapa') {
      return `<div style="position:relative"><div class="fx-blueprint" style="--bp-a:14%;--bp-fade:75%"></div>
        <div style="position:relative;z-index:1">${cab}${sitios}</div></div>`;
    }
    return cab + sitios;
  },

  contacto(v, osc) {
    // Con los canales decididos, se enseña SOLO lo que el cliente atiende.
    if (canalesDecididos() && !canal('telefono') && v === 'directo') {
      const vias = [
        canal('whatsapp') ? botonHTML('Escribir por WhatsApp') : '',
        canal('formulario') ? botonHTML('Pedir presupuesto', !canal('whatsapp')) : '',
        canal('correo') ? `<p style="margin:1rem 0 0;color:${suave(osc)}">O por correo: <a href="#" style="color:inherit">hola@…</a></p>` : '',
      ].join('');
      return `${ojo('Contacto')}${h2('Escríbenos y te contestamos')}
        <p style="margin:.6rem 0 0;color:${suave(osc)};max-width:46ch">Por escrito y a tu ritmo: mándanos fotos y medidas y te contestamos.</p>
        <div style="display:flex;gap:.7rem;flex-wrap:wrap;margin-top:2rem">${vias}</div>`;
    }
    const cab = `${ojo('Contacto')}${h2(canalesDecididos() && !canal('telefono') ? 'Cuéntanos qué necesitas' : 'Se contesta el teléfono')}`;
    if (v === 'formulario') {
      const campo = (l, t) => `<label style="display:block"><span style="display:block;font-size:.85rem;
        font-weight:600;margin-bottom:.35rem;color:${suave(osc)}">${l}</span>
        <input type="${t}" style="width:100%;padding:.65rem .8rem;border-radius:8px;font:inherit;
          border:1px solid ${osc ? 'rgb(255 255 255/.25)' : 'var(--color-line-strong)'};background:transparent;color:inherit"></label>`;
      return `${cab}<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(14rem,1fr));gap:1rem;margin-top:2rem;max-width:40rem">
        ${campo('Nombre', 'text')}${campo('Teléfono', 'tel')}${campo('Qué necesitás', 'text')}${campo('Dónde', 'text')}</div>
        <div style="margin-top:1.5rem">${botonHTML('Enviar')}</div>
        <p style="margin:.8rem 0 0;font-size:.85rem;color:${suave(osc)}">Cuatro campos. Cada campo de más es gente que no lo rellena.</p>`;
    }
    return `${cab}<p style="font-family:var(--font-display);font-weight:800;font-size:clamp(1.8rem,4.5vw,3rem);
      margin:1rem 0 0;letter-spacing:-.02em"><a href="#" style="color:inherit;text-decoration:none">957 00 00 00</a></p>
      <p style="margin:.6rem 0 0;color:${suave(osc)}">De lunes a viernes, de 8 a 14 y de 16 a 19. Contesta alguien del taller, no un contestador.</p>
      <div style="margin-top:2rem">${botonHTML('Escribir por WhatsApp')}</div>`;
  },

  cierre(v, osc) {
    if (v === 'partido') {
      return `<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(18rem,1fr));gap:2.5rem;align-items:center">
        <div><h2${osc ? ' style="color:#fff"' : ''}>¿Lo vemos?</h2>
          ${lead('Vamos, medimos y te mandamos el montaje sobre la foto de tu fachada. Sin compromiso y sin insistir después.', osc)}</div>
        <div style="text-align:right">${botonHTML('Pedir presupuesto')}</div></div>`;
    }
    return `<div style="text-align:center">
      <h2${osc ? ' style="color:#fff"' : ''}>¿Hablamos?</h2>
      <p style="color:${suave(osc)};max-width:42ch;margin:1rem auto 2rem">Vamos, medimos y te mandamos el montaje sobre la foto de tu fachada.</p>
      ${botonHTML('Pedir presupuesto')}</div>`;
  },
};

function seccionHTML(s) {
  const def = SECCIONES[s.t];
  if (!def || !CUERPO[s.t]) return '';

  // `admite` manda sobre lo guardado: si una sección deja de admitir una capa,
  // las composiciones viejas no arrastran algo que ya no tiene sentido ahí.
  const admite = def.admite || [];
  const capas = (s.capas || []).filter((c) => admite.includes(c));
  const osc = s.tono === 'deep';

  const pintadas = (capas.includes('marca') ? capaMarca(osc) : '')
    + (capas.includes('fondo') ? capaFondo(osc) : '')
    + (capas.includes('escena') ? capaEscena() : '')
    + (capas.includes('pieza') ? piezaHTML() : '');
  const arco = capas.includes('escena') && ESCENAS[S.escena].borde
    ? 'border-bottom-left-radius:50% 4rem;border-bottom-right-radius:50% 4rem;' : '';
  const aisla = pintadas || arco ? 'position:relative;isolation:isolate;overflow:hidden;' : '';

  const extras = capas.includes('modulos') ? S.modulos.map(moduloHTML).join('') : '';

  return `<section class="sec" style="${TONOS[s.tono] || TONOS.paper};${aisla}${arco}">
    ${pintadas}
    <div class="wrap"${aisla ? ' style="position:relative;z-index:1"' : ''}>
      ${CUERPO[s.t](s.v, osc)}${extras}
    </div>
  </section>`;
}

function headerHTML() {
  const nav = ['Servicios', 'Trabajos', 'Contacto']
    .map((t) => `<a href="#" style="text-decoration:none;color:var(--color-ink);font-size:.9rem;font-weight:500">${t}</a>`).join('');
  const marca = marcaHTML('1.6rem', false);
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
      ${marcaHTML('1.5rem', true)}
      <span style="font-size:.85rem;opacity:.7">Teléfono · Dirección · Horario</span></footer>`;
  }
  return `<footer style="padding:3rem clamp(1rem,4vw,3rem);background:var(--color-deep);color:#fff">
    <div style="display:grid;gap:2rem;grid-template-columns:repeat(auto-fit,minmax(11rem,1fr))">
      <div>${marcaHTML('1.8rem', true)}
        <p style="margin:.6rem 0 0;font-size:.85rem;opacity:.65">${esc(S.oficio || 'Lo que hace, en una línea.')}</p></div>
      ${['Qué hacemos', 'Dónde', 'Contacto'].map((t) => `<div><p style="font-size:.7rem;letter-spacing:.14em;text-transform:uppercase;opacity:.5;margin:0 0 .6rem">${t}</p>
        ${[1, 2, 3].map(() => `<p style="margin:.3rem 0;font-size:.85rem;opacity:.75">Enlace</p>`).join('')}</div>`).join('')}
    </div></footer>`;
}

function documento() {
  const t = tokens();
  const vars = Object.entries(t).map(([k, v]) => `${k}:${v}`).join(';');
  const mov = S.movimiento;
  const aire = { 1: '2.5rem', 2: '3.5rem', 3: '5rem', 4: '7rem', 5: '9rem' }[S.ejes.aire];
  const cuerpo = S.secciones.map(seccionHTML).join('\n');

  /* El runtime de efectos solo se carga si algo lo necesita. Se mira el HTML ya
     montado en vez de enumerar condiciones: así una sección nueva que traiga un
     data-fx funciona sin que nadie se acuerde de tocar esta línea. */
  const necesitaFx = /data-fx=/.test(cuerpo) || mov.some((m) => MOVIMIENTO[m]?.js);

  /* Rutas ABSOLUTAS. Con <base href="../"> relativa, el navegador pedía antes
     el CSS contra la URL del Estudio (estudio/_astro/… → 404) en CADA repintado
     del lienzo: un 404 por tecla. El CSS es el mismo <link> de la página, ya
     versionado por publicar.sh, así que no hay una segunda versión que mantener. */
  const enNavegador = typeof location !== 'undefined' && typeof document !== 'undefined' && document.querySelector;
  const raiz = enNavegador ? new URL('../', location.href).href : '../';
  const cssKit = (enNavegador && document.querySelector('link[href*="kit-completo.css"]')?.href) || `${raiz}_astro/kit-completo.css`;

  return `<!doctype html><html lang="es"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<base href="${raiz}">
<link rel="stylesheet" href="${cssKit}">
<style>
  /* AQUÍ NO VA estudio.css. Estuvo, y rompía la muestra sin que se viera la
     causa: ese fichero viste la HERRAMIENTA, y su regla de body
     —height:100dvh; display:flex; flex-direction:column; overflow:hidden—
     caía sobre el body de la previsualización. Consecuencias: las secciones
     pasaban a ser items de flex y se ENCOGÍAN para caber en una pantalla
     (4178px de página aplastados en 598), y overflow:hidden impedía
     deslizar para ver el resto.
     Regla: el lienzo carga el CSS del KIT y nada más. Lo de la herramienta
     se queda fuera. */
  :root{${vars}}
  html{scroll-behavior:auto}
  body{margin:0;background:var(--color-paper);color:var(--color-ink);font-family:var(--font-sans)}
  .sec{padding-block:${aire};padding-inline:clamp(1rem,4vw,3rem)}
  .wrap{max-width:70rem;margin:0 auto}
  h2{font-family:var(--font-display);font-weight:800;letter-spacing:-.03em;${S.ancho ? 'font-stretch:116%;' : ''}font-size:clamp(1.7rem,3.4vw,2.6rem);margin:0 0 1rem;line-height:1.02}
  p{line-height:1.65}
  .lead{color:var(--color-ink-soft);max-width:60ch;font-size:1.05rem}
  /* (Aquí había un display:none para .ui-aviso y .ui-panel: tapaba el mobiliario
     de la herramienta que se colaba con estudio.css. Al dejar de cargarlo, el
     parche sobra — y era el síntoma, no la causa.) */
</style></head>
<body class="${mov.includes('reveal') ? 'kit-js' : ''}">

  ${headerHTML()}

  ${cuerpo || `<section class="sec"><div class="wrap">
    <p class="lead">La página no tiene secciones. Añadí alguna en el panel: una web sin
    arquitectura no se arregla con efectos.</p></div></section>`}

  ${footerHTML()}

  ${/* SIN ?v=: los módulos de cada efecto importan este runtime por su nombre
       a secas; con otra URL habría dos instancias y cada efecto se iniciaría
       dos veces (medido: dos canvas en el mismo contenedor). */ ''}
  ${necesitaFx ? `<script type="module" src="${raiz}_astro/Fx.astro_astro_type_script_index_0_lang.CGbv7hfv.js"><\/script>` : ''}
  <script>document.querySelectorAll('.reveal').forEach(e=>e.classList.add('is-in'));<\/script>
</body></html>`;
}

/* ── El lienzo ────────────────────────────────────────────────────────────
   Reconstruir el `srcdoc` cuesta una recarga entera: se pierde el scroll y los
   efectos vuelven a arrancar. Con tres secciones fijas se toleraba; con una
   página de verdad, mover un color y que el lienzo salte al principio hace la
   herramienta inservible.

   Dos caminos, y el barato es el habitual:
   · Si SOLO han cambiado cosas que viven en tokens (acento, tinta y las dos
     tipografías), se escriben como variables en el documento de dentro y ya
     está. El iframe es del mismo origen —`srcdoc` hereda el del contenedor—,
     así que no hace falta postMessage para nada.
   · Si ha cambiado la estructura, se reconstruye y se devuelve el scroll donde
     estaba.

   `base` NO está en la lista aunque toque tokens: también decide si `ink` se
   invierte, y eso es marcado. Lo mismo `ancho`, que escribe font-stretch en
   varios sitios. Ante la duda, reconstruir. */
const SOLO_TOKENS = ['acento', 'tinta', 'display', 'texto', 'papel'];
/* Campos de contenido que van al encargo pero no se pintan en el lienzo:
   escribir en ellos no puede recargar la muestra en cada tecla. */
const SOLO_ENCARGO = ['np', 'posicionamiento', 'busqueda', 'voz', 'palabrasSi', 'palabrasNo', 'objecion', 'gesto', 'datosContacto'];
let firmaPrevia = null;

function firmaEstructural() {
  const c = { ...S };
  SOLO_TOKENS.forEach((k) => delete c[k]);
  SOLO_ENCARGO.forEach((k) => delete c[k]);
  return JSON.stringify(c);
}

function parcheaTokens(t) {
  try {
    const d = $('#lienzo').contentDocument;
    if (!d || !d.documentElement) return false;
    Object.entries(t).forEach(([k, v]) => d.documentElement.style.setProperty(k, v));
    return true;
  } catch { return false; }
}

let t0;
function render() {
  clearTimeout(t0);
  // Las miniaturas del panel usan los mismos tokens que el lienzo: así una
  // opción se ve con TU paleta, no con una de muestra.
  const t = tokens();
  Object.entries(t).forEach(([k, v]) => document.documentElement.style.setProperty(k, v));
  avisos();
  guarda();
  lectura();
  pintaFotos();   // el aviso de luces depende del tratamiento elegido

  const f = firmaEstructural();
  const soloColor = f === firmaPrevia;
  firmaPrevia = f;
  if (soloColor && parcheaTokens(t)) return;

  t0 = setTimeout(() => {
    const el = $('#lienzo');
    let y = 0;
    try { y = el.contentWindow.scrollY || 0; } catch { /* aún no hay documento */ }
    el.addEventListener('load', () => {
      try { el.contentWindow.scrollTo(0, y); } catch { /* da igual: era una comodidad */ }
    }, { once: true });
    el.srcdoc = documento();
  }, 220);
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

