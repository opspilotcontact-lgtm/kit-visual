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

/* Los módulos también traían contenido de ejemplo de un taller de rótulos
   («desde 480 €», «2 semanas», «100 % fabricación propia», «No hacemos lo que no
   sabemos hacer»). Con un cliente con nombre, llevan lo suyo o el hueco (F6). */
function moduloHTML(id) {
  const cli = esCliente();
  switch (id) {
    case 'disclosure': {
      const filas = cli
        ? svc().slice(0, 2).map(([t, d, p]) => [t, '', p || hueco('P9', 'precio de partida'), d || hueco('P18', 'qué incluye y qué no')])
        : [['Lo que va dentro del precio', 'Con nombre y apellidos, no «material de primera calidad»', 'desde 480 €', 'Aquí va el detalle, con la foto al lado. Cerrado ya dice algo; por eso se abre.'],
          ['Plazos', 'Lo que tarda de verdad, no lo que queda bien', '2 semanas', 'Aquí va el detalle, con la foto al lado. Cerrado ya dice algo; por eso se abre.']];
      return `<div style="margin-top:2rem">
        ${filas.map(([t, h, m, cuerpo], i) => `<details class="fx-disc-item" ${i === 0 ? 'open' : ''}>
            <summary class="fx-disc-head">
              <span class="fx-disc-n tabular">0${i + 1}</span>
              <span class="fx-disc-titles"><span class="fx-disc-title">${t}</span><span class="fx-disc-hint">${h}</span></span>
              <span class="fx-disc-meta tabular">${m}</span>
              <span class="fx-disc-sign" aria-hidden="true"><i></i><i></i></span>
            </summary>
            <div class="fx-disc-body"><div class="fx-disc-text"><p>${cuerpo}</p></div>
            <figure class="fx-disc-fig"><img src="${FL()[3]}" alt=""></figure></div>
          </details>`).join('')}
      </div>`;
    }
    case 'tabs': {
      const pes = cli ? svc().slice(0, 2).map(([t, d]) => [t, d || hueco('P12', 'qué es')])
        : [['Fabricación', 'Pestañas con radios y <code>:checked</code>: funcionan con teclado y sin JavaScript.'], ['Instalación', 'Medios propios. El segundo panel.']];
      return `<div class="fx-tabs" style="margin-top:2rem">
        ${pes.map(([t], i) => `<input type="radio" name="t" id="t${i + 1}"${i ? '' : ' checked'}><label for="t${i + 1}">${t}</label>`).join('')}
        <div class="fx-tabs-panels">
          ${pes.map(([, d]) => `<div><p style="color:var(--color-ink-soft);margin:0">${d}</p></div>`).join('')}
        </div></div>`;
    }
    case 'rail':
      return `<div class="fx-rail" style="margin-top:2rem;--rail-w:72%;--rail-w-lg:34%">
        ${FL().slice(0, 4).map((s) => figura(s)).join('')}</div>`;
    case 'pull': {
      const [t, f] = cli ? res()[0] : ['Lo pusieron en dos días y lo que dijeron que costaba fue lo que costó.', 'Reseña real · con nombre y fecha'];
      return `<blockquote class="fx-pull" style="margin-top:2rem;max-width:34ch">
        ${t}</blockquote>
        <p style="margin:.75rem 0 0;font-size:.85rem;color:var(--color-ink-soft)">${f}</p>`;
    }
    case 'note':
      return `<p class="fx-note" style="margin-top:2rem">${cli
        ? (S.respuestaObjecion.trim() ? esc(S.respuestaObjecion.trim()) : hueco('P12', 'la objeción, respondida con un hecho'))
        : 'No hacemos lo que no sabemos hacer.<br>Si es lo que busca, le decimos a dónde ir.'}</p>`;
    case 'highlight':
      return `<p class="fx-highlight" style="margin-top:2rem">${cli
        ? (S.prueba.trim() ? esc(S.prueba.trim()) : hueco('P8', 'la prueba principal'))
        : 'Lo que hay que leer si solo se lee una cosa. Uno por página.'}</p>`;
    case 'stat':
      return `<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(9rem,1fr));gap:1.5rem;margin-top:2rem">
        ${(cli ? cif().slice(0, 3) : [['1993', 'Desde entonces'], ['100 %', 'Fabricación propia'], ['48 h', 'Presupuesto cerrado']])
          .map(([v, l]) => `<div class="fx-stat"><span>${v}</span><span>${l}</span></div>`).join('')}</div>`;
    case 'time':
      return `<div style="position:relative;margin-top:2rem;padding-left:2.4rem">
        <div class="fx-plumb fx-plumb-bare" style="--plumb-x:.5rem"></div>
        <ol class="fx-time" style="list-style:none;margin:0;padding:0">
          ${(cli ? pas().slice(0, 3) : [['1993', 'Abre el taller.'], ['2018', 'Medios propios de instalación.'], ['Hoy', 'Toda la provincia.']])
            .map(([a, t]) => `<li><span>${a}</span><p>${t}</p></li>`).join('')}
        </ol></div>`;
    case 'sheet':
      return `<div style="margin-top:2rem">${botonHTML('Ver la ficha completa', false)}
        ${cli ? '' : '<p style="margin:.7rem 0 0;font-size:.85rem;color:var(--color-ink-soft)">Abre un &lt;dialog&gt; nativo: Esc, foco atrapado y fondo bloqueado, sin librería.</p>'}</div>`;
    case 'sign':
      return `<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(13rem,1fr));gap:1rem;margin-top:2rem"
        data-fx="sign" data-fx-opt='{"stagger":140,"once":false}'>
        ${(cli ? svc().slice(0, 3) : [['Una idea', 'Las piezas están apagadas y se encienden al llegar.'], ['Otra idea', 'Las piezas están apagadas y se encienden al llegar.'], ['La tercera', 'Las piezas están apagadas y se encienden al llegar.']])
          .map(([t, d]) => `<article class="fx-sign"><div style="padding:1.5rem">
          <p style="font-family:var(--font-display);font-weight:800;font-size:1.25rem;margin:0">${t}</p>
          <p style="margin:.6rem 0 0;font-size:.9rem">${d}</p>
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

/** Formas de repuesto, para poder jugar antes de tener el logo del cliente.
    [nombre, trazado en 96×96, cuándo aporta]. Las ocho primeras son geometría;
    las de «con memoria» (F5, 23-sep) salen de un lugar o de un oficio, que es
    lo que hace que una forma se recuerde como de alguien. El arco ya es de
    Córdoba Soluciona: para otro cliente de Córdoba, mejor otra. */
const FORMAS_MARCA = {
  arco: ['Arco', 'M6 96V54A42 42 0 1 1 90 54V96H78V56A30 30 0 1 0 18 56V96Z', 'La puerta o la ventana: reformas, casa. Ya es la firma de Córdoba Soluciona.'],
  disco: ['Disco', 'M48 8A40 40 0 1 1 48 88A40 40 0 1 1 48 8ZM48 26A22 22 0 1 0 48 70A22 22 0 1 0 48 26Z', 'Geometría neutra: sello, moneda, pieza.'],
  triangulo: ['Triángulo', 'M48 10L90 84H6Z', 'Geometría neutra: dirección, cubierta.'],
  rombo: ['Rombo', 'M48 6L90 48L48 90L6 48Z', 'Geometría neutra: señal, aviso.'],
  hexagono: ['Hexágono', 'M48 6L85 27V69L48 90L11 69V27Z', 'Geometría neutra: técnica, tuerca, panal.'],
  cruz: ['Cruz', 'M38 6H58V38H90V58H58V90H38V58H6V38H38Z', 'Suma, salud, farmacia: úsala solo si es literal.'],
  galon: ['Galón', 'M14 18L48 52L82 18L92 30L48 76L4 30Z', 'Movimiento hacia abajo o rango: cuidado, lee a militar.'],
  barra: ['Barra', 'M6 30H90V48H6ZM6 60H62V78H6Z', 'Texto, listado, ficha técnica.'],
  // ── Con memoria (F5) ──
  estrella: ['Estrella', 'M48 4L61 18L79 17L79 35L92 48L79 61L79 79L61 79L48 92L35 79L17 79L18 61L4 48L18 35L17 17L35 18Z', 'La estrella andalusí de ocho puntas: Andalucía, alicatado, artesanía.'],
  azulejo: ['Azulejo', 'M8 8H88V88H8ZM40 28L27 27L28 40L18 48L28 56L27 69L40 68L48 78L56 68L69 69L68 56L78 48L68 40L69 27L56 28L48 18Z', 'El azulejo del patio con su estrella calada: casa andaluza, cerámica, patio.'],
  maceta: ['Maceta', 'M48 10A20 20 0 1 1 48 50A20 20 0 1 1 48 10ZM26 56H70L63 90H33Z', 'La maceta del patio: plantas, patio cordobés, cuidado, crecer.'],
  reja: ['Reja', 'M14 6H82V90H14ZM26 18V78H36V18ZM43 18V78H53V18ZM60 18V78H70V18Z', 'La reja de ventana: forja, carpintería metálica, seguridad, casco antiguo.'],
  casa: ['Casa', 'M48 8L90 44H78V88H18V44H6Z', 'El tejado: inmobiliaria, reformas, hogar. Muy vista: solo si no hay otra.'],
  gota: ['Gota', 'M48 6C48 6 20 42 20 62A28 28 0 0 0 76 62C76 42 48 6 48 6Z', 'Agua, fontanería, limpieza, piscinas.'],
  hoja: ['Hoja', 'M48 6C82 22 86 64 48 90C10 64 14 22 48 6Z', 'Planta, jardín, lo natural. Muy vista en «eco»: con algo más.'],
  ola: ['Ola', 'M4 58C20 38 36 38 48 58C60 78 76 78 92 58V86H4Z', 'Mar, movimiento, ritmo: costa, náutica, baile.'],
};

/** La forma elegida como SVG en data URL, para poder usarla de máscara. */
function marcaSVG() {
  const f = FORMAS_MARCA[S.marcaForma] || FORMAS_MARCA.arco;
  // evenodd: los huecos (el disco, la estrella calada del azulejo, la reja) se
  // vacían dibujen en el sentido que dibujen.
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96"><path d="${f[1]}" fill="#000" fill-rule="evenodd"/></svg>`;
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

/**
 * La caja de una capa de marca, por su lado MAYOR. Con la altura fija, un logo
 * apaisado se desbordaba: el de Dígito (640×300) salía de 64rem de ancho en la
 * ventana, una mancha detrás de las fotos (medido el 23-sep, F4).
 */
function cajaMarca(max) {
  const p = proporcionMarca();
  return p >= 1 ? [max, `calc(${max} / ${p.toFixed(3)})`] : [`calc(${max} * ${p.toFixed(3)})`, max];
}

/* ¿El logo es a color? Lo decide el diagnóstico al subirlo (logo.aColor). Un
   logo de varios colores recoloreado con máscara pierde lo de dentro: el de
   Dígito —elipse amarilla, letras negras— salía como una elipse negra en la
   cabecera, sin nombre. A color va como imagen; de una tinta, como máscara. */
const logoAColor = () => !!(S.logo && S.logo.aColor);

/** El logo para la cabecera y el pie. De una tinta, en oscuro se recolorea con la máscara. */
function marcaHTML(alto, oscuro) {
  if (!S.marcaEnChrome) {
    return `<strong style="font-family:var(--font-display);font-weight:800;font-size:1.05rem;${S.ancho ? 'font-stretch:116%' : ''}">${esc(S.marca)}</strong>`;
  }
  if (logoAColor()) {
    return `<img src="${fuenteMarca()}" alt="${esc(S.marca)}" style="display:block;height:${alto};width:auto">`;
  }
  const color = oscuro ? '#fff' : 'var(--color-ink)';
  const forma = `<span aria-label="${esc(S.marca)}" role="img" style="display:inline-block;${marcaMascara(alto, color)}"></span>`;
  // Sin logo, la forma sola no dice quién es: va con el nombre, como un logo provisional.
  if (S.logo) return forma;
  return `<span style="display:inline-flex;align-items:center;gap:.5rem">${forma}<strong style="font-family:var(--font-display);font-weight:800;font-size:1.05rem;${S.ancho ? 'font-stretch:116%;' : ''}color:${oscuro ? '#fff' : 'var(--color-ink)'}">${esc(S.marca)}</strong></span>`;
}

/* Por debajo de 75rem el titular ocupa todo el ancho y la ventana flotante se
   le montaba encima (medido en el panel del Estudio a 770 px: el titular
   cruzaba la foto). Ahí deja de flotar y va ENCIMA del titular, a la derecha.
   Viaja igual en el encargo: sin esta regla la ventana rompe el suelo. */
/* Y por encima, el titular y la entradilla no pasan de donde empieza la
   ventana: un titular largo («Entrenamiento en grupo pequeño para mujeres…»)
   la cruzaba a 1280 px en la IA directora de Brío (F6). */
const VENTANA_CSS = '@media (max-width:75rem){.marca-ventana{position:relative!important;display:block;right:auto!important;top:auto!important;margin:0 0 1.5rem auto}}'
  + '@media (min-width:75.0625rem){.sec:has(>.marca-ventana) h1,.sec:has(>.marca-ventana) .lead{max-width:calc(100% - min(26rem,38vw) - 2.5rem)}}';

/**
 * La marca como capa de sección: sello, agua, ventana, trama o calado.
 * `enPortada`: la ventana es grande SOLO en la portada; en las demás secciones
 * vuelve como sello. Es el patrón de Córdoba (el arco enorme en el primer píxel
 * y el sello en cada titular) y lo que dijeron los dos jueces ciegos de la F4:
 * la ventana repetida en grande «es ruidosa»; el sello pequeño y constante «se
 * repite con disciplina» y es lo que más se recuerda.
 */
function capaMarca(oscuro, enPortada = true) {
  let j = S.marcaJuego;
  if (!j || j === 'ninguno') return '';
  if (j === 'ventana' && !enPortada) j = 'sello';
  const tinta = oscuro ? '#fff' : 'var(--color-ink)';
  /* Para los juegos, la FORMA del logo si el cliente la tiene aparte (logo.formaSrc):
     la silueta sin detalles sueltos. Con el logo entero, el «®» de Dígito salía
     flotando fuera de la ventana («parece un resto sin terminar», juez Sonnet, F6). */
  const src = S.logo && S.logo.formaSrc
    ? (MARCA_FIJA ? MARCA_FIJA.replace(/logo\.svg$/, 'logo-forma.svg') : S.logo.formaSrc.replace(/'/g, '%27'))
    : fuenteMarca();
  const mascara = `-webkit-mask:url('${src}') center/contain no-repeat;mask:url('${src}') center/contain no-repeat;`;

  if (j === 'sello') {
    // class="marca-sello": los titulares de su sección le dejan sitio (cssBase).
    return `<span class="marca-sello" aria-hidden="true" style="position:absolute;top:1.5rem;right:1.5rem;z-index:0;
      display:grid;place-items:center;width:5.5rem;height:5.5rem;border-radius:999px;
      border:1px solid ${oscuro ? 'rgb(255 255 255/.35)' : 'var(--color-line-strong)'};">
      <span style="width:${cajaMarca('3rem')[0]};height:${cajaMarca('3rem')[1]};background:var(--color-brand);${mascara}"></span></span>`;
  }
  if (j === 'agua') {
    const [w, h] = cajaMarca('34rem');
    return `<span aria-hidden="true" style="position:absolute;right:-6%;bottom:-18%;z-index:0;
      opacity:.07;width:${w};height:${h};background:${tinta};${mascara}"></span>`;
  }
  if (j === 'ventana') {
    /* Una VENTANA: la forma del logo con una foto del cliente dentro, como el
       arco de Córdoba. La versión anterior era la silueta en el color de marca
       al 22 %, y con un acento claro (el amarillo de Dígito) se quedaba en una
       mancha pálida que nadie leía como su logo (F4, 23-sep).
       Sigue sin disputarle la lectura al titular —la regla 10 del suelo—: va a
       la derecha, arriba, y a lo sumo el 38 % del ancho, no detrás del texto
       (a 44 %, el juez Sonnet la vio «montada encima del titular»). */
    /* Y con un aro del color de marca: la foto sola dentro de la silueta se leía
       como «una foto ovalada», no como SU forma. El aro es el canto del rótulo
       en Dígito y el marco del arco en Córdoba. Grosor igual en los cuatro
       lados: se calcula sobre el lado corto. */
    const [w, h] = cajaMarca('min(26rem, 38vw)');
    const corto = proporcionMarca() >= 1 ? h : w;
    // La cuarta foto: las tres primeras ya las enseña la portada en su fila.
    const fl = FL();
    const foto = String(fl[Math.min(3, fl.length - 1)] || '').replace(/'/g, '%27');
    // class="marca-ventana": por debajo de 75rem deja de flotar (VENTANA_CSS).
    return `<span class="marca-ventana" aria-hidden="true" style="position:absolute;right:clamp(0rem,3vw,3rem);top:clamp(2.5rem,9%,6rem);z-index:0;
      width:${w};height:${h};">
      <span style="position:absolute;inset:0;background:var(--color-brand);${mascara}"></span>
      <span style="position:absolute;inset:calc(${corto} * .07);background:var(--color-metal) url('${foto}') center/cover no-repeat;${mascara}"></span></span>`;
  }
  if (j === 'trama') {
    return `<span aria-hidden="true" style="position:absolute;inset:0;z-index:0;opacity:.06;
      background:${tinta};
      -webkit-mask:url('${fuenteMarca()}') 0 0/4.5rem 4.5rem repeat;
      mask:url('${fuenteMarca()}') 0 0/4.5rem 4.5rem repeat;"></span>`;
  }
  if (j === 'calado') {
    const [w, h] = cajaMarca('18rem');
    return `<span aria-hidden="true" style="position:absolute;left:-4rem;bottom:-4rem;z-index:0;
      opacity:.16;width:${w};height:${h};background:var(--color-brand);${mascara}"></span>`;
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
    ['¿Cuánto tarda un rótulo de fachada?', 'Dos semanas desde que se aprueba el diseño. Si hay que pedir permiso, suma tres más.'],
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

/* Con un cliente de verdad (tiene nombre), lo que falta NO se rellena con el
   ejemplo: el ejemplo es de un taller de rótulos —1993, 48 h, «el rótulo
   encendido»— y en la web de otro oficio es un dato inventado. Lo cazaron los
   jueces ciegos de la F6 en la de Brío (entrenamiento para mujeres): «el copy
   de rótulos delata una plantilla sin adaptar». Se enseña el HUECO, con el
   paso del protocolo que lo rellena. Sin nombre, siguen los ejemplos: enseñan
   a escribir bien. */
const esCliente = () => !!S.marca && S.marca !== 'Nombre del cliente';
const hueco = (p, que) => `<span style="opacity:.55">[${que} · pendiente, ${p}]</span>`;
const ej = (ejemplo, p, que) => (esCliente() ? hueco(p, que) : ejemplo);

const svc = () => (serviciosCliente().length ? serviciosCliente().map(escFila)
  : esCliente() ? [[hueco('P12', 'servicio'), hueco('P12', 'qué incluye'), '']] : EJ['servicios']);
const res = () => (resenasCliente().length ? resenasCliente().map(escFila)
  : esCliente() ? [[hueco('P8', 'reseña literal'), hueco('P8', 'dónde y cuándo')]] : EJ['resenas']);
const sit = () => (sitiosCliente().length ? escFila(sitiosCliente())
  : esCliente() ? [hueco('P11', 'los pueblos')] : EJ['sitios']);
const cif = () => (cifrasCliente().length ? cifrasCliente().map(([v, q]) => [esc(v), esc(q)])
  : esCliente() ? [1, 2, 3].map(() => ['—', hueco('P8', 'cifra con prueba')]) : EJ['cifras']);
const preguntas = () => (esCliente()
  ? [[S.objecion.trim() ? esc(S.objecion.trim()) : hueco('P12', 'la objeción principal'),
    S.respuestaObjecion.trim() ? esc(S.respuestaObjecion.trim()) : hueco('P12', 'cómo se responde')]]
  : EJ.faq);
/* El contacto del cliente, tal como lo escribió (una línea por dato). */
const contactoCliente = () => lineas(S.datosContacto).map(esc);
const pas = () => (pasosCliente().length
  ? pasosCliente().map(([t, d, p]) => [esc(t), esc([d, p].filter(Boolean).join(' · '))])
  : esCliente() ? [1, 2, 3].map((n) => [`Paso ${n}`, hueco('P12', 'qué pasa y en qué plazo')]) : EJ['pasos']);

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
    /* P12: el titular dice qué es y dónde CON la búsqueda principal (P11). Antes
       ponía el oficio y la búsqueda solo viajaba al encargo: la muestra
       enseñaba un titular que el encargo luego mandaba cambiar. */
    const base = String(S.busqueda || '').trim() || String(S.oficio || '').trim();
    const titulo = S.titular === 'knockout' ? 'TU NOMBRE'
      : (base ? esc(base.charAt(0).toUpperCase() + base.slice(1)) : 'Lo que hacemos, en claro.');
    const entrada = lead(S.prueba.trim() ? esc(S.prueba.trim())
      : ej('Una línea que explica qué se vende y a quién, con palabras del cliente y no del sector.', 'P8', 'la prueba principal'));
    // El segundo botón lleva a algo que existe: los trabajos si hay galería; si no, los servicios.
    const segundo = !esCliente() || S.secciones.some((s) => s.t === 'galeria') ? 'Ver trabajos'
      : S.secciones.some((s) => s.t === 'servicios') ? 'Qué hacemos' : '';
    const botones = `<div style="display:flex;gap:.7rem;flex-wrap:wrap;margin-top:2rem">
      ${botonHTML(llamada())}${segundo ? botonHTML(segundo, false) : ''}</div>`;
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
      ${S.respuestaObjecion.trim() ? esc(S.respuestaObjecion.trim()) : ej('Si no sabemos hacerlo, te decimos quién lo hace.', 'P12', 'la objeción, respondida con un hecho')}</p>`;
  },

  servicios(v, osc) {
    const cab = esCliente() ? `${ojo('Qué hacemos')}${h2('Lo que hacemos')}`
      : `${ojo('Qué hacemos')}${h2('Cuatro cosas, y las cuatro las hacemos nosotros')}
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
    const cab = esCliente() ? `${ojo('Trabajos')}${h2('Lo que ya está hecho')}`
      : `${ojo('Trabajos')}${h2('Lo que ya está puesto')}
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
    const cab = `${ojo('Cómo trabajamos')}${h2(esCliente() ? 'Cómo funciona' : 'De la primera visita al rótulo encendido')}`;
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
      ${esCliente() ? '' : lead('Son precios de partida reales. El presupuesto cerrado sale tras medir.', osc)}`;
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
        <div class="fx-disc-body"><div class="fx-disc-text"><p>${ej('Qué entra en ese precio, con nombre y apellidos: material, medidas y montaje. Cerrado ya dice algo; por eso se abre.', 'P18', 'qué incluye y qué no')}</p></div>
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
        ${preguntas().map((f, i) => `<div>${item(f, i)}</div>`).join('')}</div>`;
    }
    return `${cab}<div style="margin-top:2rem">${preguntas().map(item).join('')}</div>`;
  },

  zona(v, osc) {
    const sitios = `<div style="display:flex;flex-wrap:wrap;gap:.5rem;margin-top:2rem">
      ${sit().map((s) => `<span style="font-size:.9rem;padding:.4rem .8rem;border-radius:999px;
        border:1px solid ${osc ? 'rgb(255 255 255/.2)' : 'var(--color-line-strong)'}">${s}</span>`).join('')}</div>`;
    const cab = esCliente() ? `${ojo('Dónde trabajamos')}${h2('Dónde')}`
      : `${ojo('Dónde trabajamos')}${h2('La provincia, y lo que cae al lado')}
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
        canal('correo') ? `<p style="margin:1rem 0 0;color:${suave(osc)}">O por correo: <a href="#" style="color:inherit">${esCliente() ? hueco('P21', 'el correo') : 'hola@…'}</a></p>` : '',
      ].join('');
      const dice = esCliente()
        ? (contactoCliente().length ? contactoCliente().join('<br>') : hueco('P21', 'a quién le llega y cuándo contesta'))
        : 'Por escrito y a tu ritmo: mándanos fotos y medidas y te contestamos.';
      return `${ojo('Contacto')}${h2('Escríbenos y te contestamos')}
        <p style="margin:.6rem 0 0;color:${suave(osc)};max-width:46ch">${dice}</p>
        <div style="display:flex;gap:.7rem;flex-wrap:wrap;margin-top:2rem">${vias}</div>`;
    }
    const cab = `${ojo('Contacto')}${h2(canalesDecididos() && !canal('telefono') ? 'Cuéntanos qué necesitas' : 'Se contesta el teléfono')}`;
    if (v === 'formulario') {
      const campo = (l, t) => `<label style="display:block"><span style="display:block;font-size:.85rem;
        font-weight:600;margin-bottom:.35rem;color:${suave(osc)}">${l}</span>
        <input type="${t}" style="width:100%;padding:.65rem .8rem;border-radius:8px;font:inherit;
          border:1px solid ${osc ? 'rgb(255 255 255/.25)' : 'var(--color-line-strong)'};background:transparent;color:inherit"></label>`;
      return `${cab}<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(14rem,1fr));gap:1rem;margin-top:2rem;max-width:40rem">
        ${campo('Nombre', 'text')}${campo('Teléfono', 'tel')}${campo('Qué necesitas', 'text')}${campo('Dónde', 'text')}</div>
        <div style="margin-top:1.5rem">${botonHTML('Enviar')}</div>
        <p style="margin:.8rem 0 0;font-size:.85rem;color:${suave(osc)}">${esCliente()
          ? (contactoCliente().length ? contactoCliente().join('<br>') : hueco('P21', 'a quién le llega y cuándo contesta'))
          : 'Cuatro campos. Cada campo de más es gente que no lo rellena.'}</p>`;
    }
    const [linea1, ...otras] = contactoCliente();
    return `${cab}<p style="font-family:var(--font-display);font-weight:800;font-size:clamp(1.8rem,4.5vw,3rem);
      margin:1rem 0 0;letter-spacing:-.02em"><a href="#" style="color:inherit;text-decoration:none">${esCliente() ? (linea1 || hueco('P21', 'el teléfono real')) : '957 00 00 00'}</a></p>
      <p style="margin:.6rem 0 0;color:${suave(osc)}">${esCliente() ? (otras.join('<br>') || hueco('P21', 'horario y quién contesta')) : 'De lunes a viernes, de 8 a 14 y de 16 a 19. Contesta alguien del taller, no un contestador.'}</p>
      <div style="margin-top:2rem">${botonHTML('Escribir por WhatsApp')}</div>`;
  },

  cierre(v, osc) {
    if (v === 'partido') {
      return `<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(18rem,1fr));gap:2.5rem;align-items:center">
        <div><h2${osc ? ' style="color:#fff"' : ''}>¿Lo vemos?</h2>
          ${lead(esCliente() ? (S.prueba.trim() ? esc(S.prueba.trim()) : hueco('P12', 'qué pasa cuando te escriben')) : 'Vamos, medimos y te mandamos el montaje sobre la foto de tu fachada. Sin compromiso y sin insistir después.', osc)}</div>
        <div style="text-align:right">${botonHTML('Pedir presupuesto')}</div></div>`;
    }
    return `<div style="text-align:center">
      <h2${osc ? ' style="color:#fff"' : ''}>¿Hablamos?</h2>
      <p style="color:${suave(osc)};max-width:42ch;margin:1rem auto 2rem">${esCliente() ? (S.prueba.trim() ? esc(S.prueba.trim()) : hueco('P12', 'qué pasa cuando te escriben')) : 'Vamos, medimos y te mandamos el montaje sobre la foto de tu fachada.'}</p>
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

  const pintadas = (capas.includes('marca') ? capaMarca(osc, s.t === 'hero') : '')
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

/* La navegación, de las secciones QUE HAY; y la llamada, del canal y del oficio.
   Los dos constructores ciegos de la F6 lo marcaron: la cabecera enlazaba a
   «Trabajos» en páginas sin galería y el botón decía «Presupuesto» en un centro
   de entrenamiento. Sin cliente, se queda la de ejemplo. */
const NAV_DE = { servicios: 'Servicios', galeria: 'Trabajos', precios: 'Precios', proceso: 'Cómo funciona',
  testimonio: 'Opiniones', zona: 'Dónde', faq: 'Preguntas', contacto: 'Contacto' };
function enlacesNav() {
  if (!esCliente()) return ['Servicios', 'Trabajos', 'Contacto'];
  return [...new Set(S.secciones.map((s) => NAV_DE[s.t]).filter(Boolean))].slice(0, 4);
}
/** La llamada principal: por el canal real. «Presupuesto» solo si el oficio lo usa (ejemplo). */
function llamada(corta = false) {
  if (canalesDecididos() && canal('whatsapp') && !canal('formulario')) return corta ? 'WhatsApp' : 'Escribir por WhatsApp';
  if (!esCliente()) return corta ? 'Presupuesto' : 'Pedir presupuesto';
  return corta ? 'Contacto' : 'Escríbenos';
}

function headerHTML() {
  const nav = enlacesNav()
    .map((t) => `<a href="#" style="text-decoration:none;color:var(--color-ink);font-size:.9rem;font-weight:500">${t}</a>`).join('');
  const marca = marcaHTML('1.6rem', false);
  if (S.header === 'isla') {
    return `<div style="position:sticky;top:0;z-index:20;padding:1rem">
      <header style="display:flex;align-items:center;justify-content:space-between;gap:1.5rem;max-width:64rem;margin:0 auto;
        padding:.7rem 1.1rem;border-radius:999px;background:color-mix(in srgb,var(--color-surface) 82%,transparent);
        backdrop-filter:blur(10px);border:1px solid var(--color-line)">
        ${marca}<nav style="display:flex;gap:1.2rem">${nav}</nav>${botonHTML(llamada(true))}
      </header></div>`;
  }
  if (S.header === 'minimo') {
    return `<header style="display:flex;align-items:center;justify-content:space-between;padding:1.5rem clamp(1rem,4vw,3rem)">
      ${marca}${botonHTML(llamada(true))}</header>`;
  }
  return `<header style="display:flex;align-items:center;justify-content:space-between;gap:1.5rem;
    padding:1rem clamp(1rem,4vw,3rem);border-bottom:1px solid var(--color-line);background:var(--color-surface)">
    ${marca}<nav style="display:flex;gap:1.3rem">${nav}</nav>${botonHTML(llamada(true))}</header>`;
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
      ${[['Qué hacemos', () => svc().map(([t]) => t)], ['Dónde', sit], ['Contacto', contactoCliente]].map(([t, datos]) => {
        // Con cliente, el pie lleva lo suyo (servicios, pueblos, contacto); nueve «Enlace»
        // eran lo primero que delataba la plantilla (juez Sonnet, F4).
        const xs = esCliente() ? datos().slice(0, 3) : ['Enlace', 'Enlace', 'Enlace'];
        return `<div><p style="font-size:.7rem;letter-spacing:.14em;text-transform:uppercase;opacity:.5;margin:0 0 .6rem">${t}</p>
        ${(xs.length ? xs : [hueco('P21', 'dato')]).map((x) => `<p style="margin:.3rem 0;font-size:.85rem;opacity:.75">${x}</p>`).join('')}</div>`;
      }).join('')}
    </div></footer>`;
}

/* El marco de la muestra: aire de sección, ancho, titulares y entradilla. Lo
   usan el lienzo Y el encargo (vía B). Antes solo vivía aquí, y el constructor
   ciego de la F6 (Dígito) sacó el titular en peso fino, el texto pegado al
   borde y la portada larguísima: el encargo no decía nada del marco. */
function cssBase() {
  const aire = { 1: '2.5rem', 2: '3.5rem', 3: '5rem', 4: '7rem', 5: '9rem' }[S.ejes.aire] || '5rem';
  const ancho = S.ancho ? 'font-stretch:116%;' : '';
  return `body{margin:0;background:var(--color-paper);color:var(--color-ink);font-family:var(--font-sans)}
  .sec{padding-block:${aire};padding-inline:clamp(1rem,4vw,3rem)}
  .wrap{max-width:70rem;margin:0 auto}
  h1{font-family:var(--font-display);font-weight:800;line-height:.98;letter-spacing:-.03em;${ancho}font-size:clamp(2.4rem,6vw,4.2rem);margin:0}
  h2{font-family:var(--font-display);font-weight:800;letter-spacing:-.03em;${ancho}font-size:clamp(1.7rem,3.4vw,2.6rem);margin:0 0 1rem;line-height:1.02}
  p{line-height:1.65}
  .lead{color:var(--color-ink-soft);max-width:60ch;font-size:1.05rem}
  .sec:has(>.marca-sello) :is(h1,h2){padding-right:5.5rem}
  @media (max-width:40rem){header nav{display:none!important}}
  ${VENTANA_CSS}`;
  /* La cabecera en el móvil: marca y botón, sin los enlaces. Con los tres, el
     botón se salía de la pantalla y había scroll lateral (medido a 375 px en la
     muestra de Dígito, F6; las dos webs construidas ya lo resolvían así). */
}

function documento() {
  const t = tokens();
  const vars = Object.entries(t).map(([k, v]) => `${k}:${v}`).join(';');
  const mov = S.movimiento;
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
  ${cssBase()}
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
  ALRENDER.forEach((f) => { try { f(); } catch (e) { console.error(e); } });

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

