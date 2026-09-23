/* Estudio de marca · encargo.js
   Lo que sale: tema, andamio de Astro, DIRECCION-ARTE.md y el encargo.
   Script clásico: comparte el ámbito global con los demás ficheros del
   Estudio y se carga en el orden de index.html. */
'use strict';

/* ── El encargo ───────────────────────────────────────────────────────────── */

const slugDe = (s) => (s || 'marca').toLowerCase().normalize('NFD')
  .replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

/* Los tokens agrupados CON SU PORQUÉ, copiado de themes/_plantilla.css. Un
   tema exportado que solo lleva valores es peor que el que se copia a mano:
   el que se copia a mano trae estas notas, y son las que evitan que alguien
   ponga un gris suelto en las líneas o un texto que no pasa contraste sobre
   el color de marca. Si se exporta sin ellas, la herramienta empeora el
   trabajo en vez de ahorrarlo. */
const BLOQUES_TEMA = [
  ['Marca', [
    ['--color-brand', 'Acción y dato. Es el color de los botones y las cifras, no un adorno.'],
    ['--color-brand-dim', 'El mismo, un punto más apagado: cara inferior de degradados y estados pulsados.'],
    ['--color-brand-ink', 'Texto que va ENCIMA del color de marca: tiene que pasar contraste AA.'],
    ['--color-brand-soft', 'Fondo suave del MISMO tono para avisos y destacados. Es el acento diluido en el papel, no el acento aclarado.'],
  ]],
  ['Tinta y secciones oscuras', [
    ['--color-ink', 'Titulares y estructura. Nunca #000.'],
    ['--color-ink-soft', 'Texto secundario. Sale del MISMO tono que la tinta: una sola familia de grises.'],
    ['--color-deep', 'Secciones oscuras (un cambio de ritmo por página, no más).'],
    ['--color-deep-soft', 'La variante de esas secciones, para cajas dentro de lo oscuro.'],
  ]],
  ['Fondos', [
    ['--color-paper', 'El papel de la página.'],
    ['--color-paper-alt', 'Franja alterna, para separar bloques sin meter una línea.'],
    ['--color-surface', 'Tarjetas.'],
  ]],
  ['Metal', [
    ['--color-metal', 'Canto de material. Solo si la marca fabrica algo físico; si no, se borra.'],
    ['--color-metal-hi', 'Su brillo.'],
    ['--color-metal-lo', 'Su sombra.'],
  ]],
  ['Líneas', [
    ['--color-line', 'Siempre la tinta con alfa, nunca un gris suelto.'],
    ['--color-line-strong', 'La misma, más presente, para bordes que tienen que verse.'],
  ]],
  ['Tipografía', [
    ['--font-display', 'Titulares.'],
    ['--font-sans', 'Texto corrido.'],
  ]],
];

function temaCSS() {
  const t = tokens();
  const slug = slugDe(S.marca);
  const puestos = new Set();

  const cuerpo = BLOQUES_TEMA.map(([titulo, filas]) => {
    const lineas = filas.filter(([k]) => t[k] !== undefined).map(([k, por]) => {
      puestos.add(k);
      return `  /* ${por} */\n  ${k}: ${t[k]};`;
    });
    return lineas.length ? `  /* ── ${titulo} ── */\n${lineas.join('\n')}` : '';
  }).filter(Boolean).join('\n\n');

  // Red de seguridad: si mañana `tokens()` devuelve algo que no está en los
  // bloques de arriba, sale igual en vez de perderse en silencio.
  const sueltos = Object.entries(t).filter(([k]) => !puestos.has(k));

  return `/* Tema · ${S.marca}
   Generado con el Estudio de marca del kit OpsPilot.

   Dónde va:  opspilot-kit/src/styles/themes/${slug}.css
   Se importa DESPUÉS de kit.css y SOLO pisa tokens; si hace falta CSS propio
   de la marca, va en su proyecto (marca-${slug}.css), no aquí.

   Reglas que no se saltan:
   - UN color de marca. Si el logo tiene tres, elige el que manda y usa los
     otros como apoyo.
   - Saturación por debajo del 80 % salvo que el logo obligue.
   - Una sola familia de grises: tinta, tinta suave y líneas salen del MISMO
     tono. Mezclar cálidos y fríos es lo que hace que una web se vea sucia
     sin que se sepa por qué. */
@theme {
${cuerpo}${sueltos.length ? `\n\n  /* ── Sin clasificar ── */\n${sueltos.map(([k, v]) => `  ${k}: ${v};`).join('\n')}` : ''}
}
${S.ancho ? `
/* Los titulares de esta marca van siempre extendidos: es parte de la
   identidad, no un ajuste de una página. */
h1, h2, .display-brand {
  font-stretch: 116%;
}
` : ''}`;
}

/* ── El andamio de Astro ──────────────────────────────────────────────────
   Genera la página con los BLOQUES REALES del kit, no con un HTML inventado
   que luego habría que traducir. Cada sección deja un TODO visible con lo que
   falta: el contenido. Un andamio que finge estar terminado es peor que no
   tenerlo, porque se publica tal cual.

   Dos renderizadores separados a propósito (este y el del lienzo): el lienzo
   tiene que enseñar el efecto aplicado con CSS suelto, y el proyecto tiene que
   usar componentes. Intentar que uno solo sirva para las dos cosas obliga a
   que el lienzo importe Astro, que es justo lo que hace que la herramienta
   deje de abrirse con doble clic. */

const BLOQUE_DE = {
  hero: 'HeroSplit',
  servicios: { indice: 'ServiceIndex', alterno: 'FeatureSplit', bento: 'Bento' },
  banda: { frase: null, marquesina: 'Marquee', datos: 'StatRow' },
  galeria: { rejilla: 'Bento', carril: null, destacado: 'Bento' },
  datos: 'StatRow',
  proceso: { plomada: 'Steps', pasos: 'Steps', pestanas: null },
  testimonio: null,
  precios: { desplegable: 'Disclosure', tabla: null },
  faq: 'FaqList',
  zona: null,
  contacto: null,
  cierre: 'CtaPanel',
};

const bloqueDe = (s) => {
  const b = BLOQUE_DE[s.t];
  return typeof b === 'string' ? b : (b ? b[s.v] : null) || null;
};

const TONO_SECCION = { paper: 'paper', alt: 'alt', deep: 'deep' };

/** El cuerpo de cada sección, ya como componentes del kit. */
function astroSeccion(s, i) {
  const def = SECCIONES[s.t] || {};
  const v = (def.variantes || []).find((x) => x.id === s.v) || {};
  const osc = s.tono === 'deep';
  const tone = osc ? ' tone="dark"' : '';
  const bloque = bloqueDe(s);
  const capas = (s.capas || []).filter((c) => (def.admite || []).includes(c));

  const nota = [
    `  {/* ${String(i + 1).padStart(2, '0')} · ${def.n} — ${v.n || s.v}`,
    `      ${v.dice || def.dice || ''}`,
    capas.length ? `      Capas decididas aquí: ${capas.map((c) => NOMBRE_CAPA[c] || c).join(', ')}` : null,
    (v.protocolo || def.protocolo) ? `      Contenido: ${v.protocolo || def.protocolo}` : null,
    `      TODO: sustituir el contenido de ejemplo por el del cliente. */}`,
  ].filter(Boolean).join('\n');

  // El texto del cliente entra como expresión JS ({"…"}), no como atributo
  // literal: una comilla en una reseña cerraría el atributo y rompería el build.
  const js = (t) => JSON.stringify(String(t));
  const limpio = (t) => String(t).replace(/["{}<>`]/g, '');

  const dentro = {
    hero: () => `  <HeroSplit
    eyebrow="${esc(S.marca)}"
    titleHtml="TODO (P12): qué es, dónde y qué hacer, con <em>énfasis</em> donde toque${S.busqueda.trim() ? ` · con «${limpio(S.busqueda.trim())}»` : ''}"
    lead=${S.prueba.trim() ? `{${js(S.prueba.trim())}}` : '"TODO (P8): la prueba principal, en una línea y con palabras del cliente."'}
    photo={{ src: '/img/TODO.webp', alt: 'TODO: describe la foto', width: 1200, height: 900 }}
  />`,
    servicios: () => bloque === 'ServiceIndex'
      ? `  <Section tone="${TONO_SECCION[s.tono]}">
    <SectionHead eyebrow="Qué hacemos" title="TODO: el titular de servicios"${tone} />
    <ServiceIndex items={servicios} />
  </Section>`
      : bloque === 'Bento'
        ? `  <Section tone="${TONO_SECCION[s.tono]}">
    <SectionHead eyebrow="Qué hacemos" title="TODO: el titular de servicios"${tone} />
    <Bento items={trabajos} />
  </Section>`
        : `  <Section tone="${TONO_SECCION[s.tono]}">
    <FeatureSplit titleHtml="TODO: el servicio"${tone}>
      <p>TODO: qué incluye y qué no.</p>
    </FeatureSplit>
  </Section>`,
    banda: () => bloque === 'Marquee'
      ? `  <Marquee items={['TODO', 'los', 'sitios', 'o', 'servicios']} tone="${osc ? 'deep' : 'paper'}" />`
      : bloque === 'StatRow'
        ? `  <Section tone="${TONO_SECCION[s.tono]}" space="sm">
    <StatRow items={cifras} cols={3}${tone} />
  </Section>`
        : `  <Section tone="${TONO_SECCION[s.tono]}" space="sm">
    <p class="font-display text-d2 max-w-[26ch]">${S.respuestaObjecion.trim() ? `{${js(S.respuestaObjecion.trim())}}` : 'TODO (P12): la objeción principal, respondida en una frase.'}</p>
  </Section>`,
    galeria: () => bloque === 'Bento'
      ? `  <Section tone="${TONO_SECCION[s.tono]}">
    <SectionHead eyebrow="Trabajos" title="TODO: el titular de trabajos"${tone} />
    <Bento items={trabajos} />
  </Section>`
      : `  <Section tone="${TONO_SECCION[s.tono]}" bleed>
    <SectionHead eyebrow="Trabajos" title="TODO: el titular de trabajos"${tone} />
    {/* Carril horizontal: utilidad del kit, sin componente. */}
    <div class="fx-rail" style="--rail-w:72%;--rail-w-lg:34%">
      {trabajos.map((t) => (
        <figure class="m-0 overflow-hidden ${FORMAS[S.forma].clase || ''}">
          <img src={t.src} alt={t.alt} width={t.width} height={t.height} loading="lazy" decoding="async" />
        </figure>
      ))}
    </div>
  </Section>`,
    datos: () => `  <Section tone="${TONO_SECCION[s.tono]}">
    <StatRow items={cifras} cols={${s.v === 'rejilla' ? 4 : 3}}${tone} />
  </Section>`,
    proceso: () => bloque === 'Steps'
      ? `  <Section tone="${TONO_SECCION[s.tono]}">
    <SectionHead eyebrow="Cómo trabajamos" title="TODO: el titular del proceso"${tone} />
    <Steps items={pasos}${tone} ring="${s.tono === 'deep' ? 'deep' : s.tono}" />
  </Section>`
      : `  <Section tone="${TONO_SECCION[s.tono]}">
    <SectionHead eyebrow="Cómo trabajamos" title="TODO: el titular del proceso"${tone} />
    {/* Pestañas con radios y :checked — funcionan con teclado y sin JavaScript. */}
    <div class="fx-tabs">
      {pasos.map((p, n) => (
        <>
          <input type="radio" name="proceso" id={\`proc-\${n}\`} checked={n === 0} />
          <label for={\`proc-\${n}\`}>{p.title}</label>
        </>
      ))}
      <div class="fx-tabs-panels">{pasos.map((p) => <div><p>{p.text}</p></div>)}</div>
    </div>
  </Section>`,
    testimonio: () => `  <Section tone="${TONO_SECCION[s.tono]}">
    {/* Reseñas REALES, literales, con nombre y fecha. Una inventada se nota y cuesta la venta. */}
    {resenas.slice(0, ${s.v === 'dos' ? 2 : 1}).map((r) => (
      <figure class="m-0 mt-8 first:mt-0">
        <blockquote class="fx-pull max-w-[34ch]">{r.text}</blockquote>
        <figcaption class="mt-3 text-sm text-ink-soft">{r.source}</figcaption>
      </figure>
    ))}
  </Section>`,
    precios: () => bloque === 'Disclosure'
      ? `  <Section tone="${TONO_SECCION[s.tono]}">
    <SectionHead eyebrow="Precios" title="TODO: el titular de precios"${tone} />
    <Disclosure items={partidas} numbered openFirst${tone} />
  </Section>`
      : `  <Section tone="${TONO_SECCION[s.tono]}">
    <SectionHead eyebrow="Precios" title="TODO: el titular de precios"${tone} />
    <table class="w-full border-collapse tabular">
      {partidas.map((p) => (
        <tr class="border-t border-line">
          <td class="py-3">{p.title}<br /><span class="text-sm text-ink-soft">{p.hint}</span></td>
          <td class="py-3 text-right whitespace-nowrap">{p.meta}</td>
        </tr>
      ))}
    </table>
  </Section>`,
    faq: () => `  <Section tone="${TONO_SECCION[s.tono]}">
    <SectionHead eyebrow="Preguntas" title="TODO: el titular de preguntas"${tone} />
    {/* schema: solo si estas preguntas están de verdad en la página. */}
    <FaqList items={preguntas} schema${tone} />
  </Section>`,
    zona: () => `  <Section tone="${TONO_SECCION[s.tono]}"${s.v === 'mapa' ? ' class="relative isolate"' : ''}>
    ${s.v === 'mapa' ? '<div class="fx-blueprint" style="--bp-a:14%;--bp-fade:75%"></div>\n    ' : ''}<SectionHead eyebrow="Dónde trabajamos" title="TODO: el titular de zona"${tone} />
    {/* Nombres propios: es lo que la gente escribe en el buscador. */}
    <ul class="flex flex-wrap gap-2 list-none p-0 mt-8">
      {sitios.map((z) => <li class="text-sm px-3 py-1.5 rounded-full border border-line-strong">{z}</li>)}
    </ul>
  </Section>`,
    contacto: () => {
      /* Con los canales decididos (P12) sale SOLO lo que el cliente atiende:
         ni un tel: si no coge el teléfono. Sin decidir, el andamio de siempre. */
      const decididos = canalesDecididos();
      const quiere = (c) => !decididos || canal(c);
      const form = s.v === 'formulario' && quiere('formulario');
      const partes = [];
      if (form) {
        partes.push(`{/* Cuatro campos. Cada campo de más es gente que no lo rellena. */}
    {/* TODO: conectar el envío. Un formulario que no manda nada es peor que no tenerlo. */}
    <form class="grid gap-4 max-w-[40rem] sm:grid-cols-2 mt-8">
      {/* TODO: nombre, teléfono, qué necesita, dónde */}
      <Button type="submit" variant="primary" class="sm:col-span-2">Enviar</Button>
    </form>`);
      } else if (quiere('telefono')) {
        partes.push(`<p class="font-display text-d2 mt-4"><a href="tel:+34TODO" class="text-inherit no-underline">TODO: el teléfono</a></p>
    <p class="mt-2 text-ink-soft">TODO: el horario REAL. Uno inventado genera la primera queja.</p>`);
      } else {
        partes.push(`<p class="mt-4 text-ink-soft max-w-[46ch]">TODO (P12): cuánto se tarda en contestar DE VERDAD y quién contesta.</p>`);
      }
      if (quiere('whatsapp') && (decididos || !form))
        partes.push(`<Button href="https://wa.me/34TODO" variant="wa" external class="mt-8">Escribir por WhatsApp</Button>`);
      if (decididos && canal('correo'))
        partes.push(`<p class="mt-4"><a href="mailto:TODO">TODO: el correo que alguien lee de verdad</a></p>`);
      return `  <Section tone="${TONO_SECCION[s.tono]}" id="contacto">
    <SectionHead eyebrow="Contacto" title="TODO: el titular de contacto"${tone} />
    ${partes.join('\n    ')}
  </Section>`;
    },
    cierre: () => `  <CtaPanel title="TODO: la última llamada" text="TODO: qué pasa cuando te escriben." />`,
  };

  const f = dentro[s.t];
  return f ? `${nota}\n${f()}` : `${nota}\n  {/* TODO: sección "${s.t}" sin andamio generado. */}`;
}

/** Los datos de ejemplo que el andamio necesita para compilar. */
function astroDatos() {
  const usa = (t) => S.secciones.some((s) => s.t === t);
  const usaBloque = (b) => S.secciones.some((s) => bloqueDe(s) === b);
  const d = [];
  // Lo que el cliente ya dio (bloque de contenido) entra tal cual; lo que no,
  // como TODO con el paso del protocolo que lo rellena.
  const q = (t) => JSON.stringify(String(t));
  if (usa('servicios') && S.secciones.some((s) => s.t === 'servicios' && s.v === 'indice')) {
    const sv = serviciosCliente();
    d.push(`const servicios = [
${sv.length
    ? sv.map(([t, dd, p]) => `  { href: ${q(`/${slugDe(t)}/`)}, name: ${q(t)}, claim: ${q(dd || 'TODO (P12): qué es, en una línea')}, price: ${q(p || 'TODO')} },`).join('\n')
    : `  { href: '/servicios/todo', name: 'TODO (P12): el servicio', claim: 'TODO: qué es, en una línea', price: 'desde TODO €' },`}
];`);
  }
  if (usa('testimonio')) {
    const rs = resenasCliente();
    d.push(`const resenas = [
${rs.length
    ? rs.map(([t, f]) => `  { text: ${q(t)}, source: ${q(f || 'TODO: dónde y cuándo se publicó')} },`).join('\n')
    : `  { text: 'TODO (P8): la reseña, literal.', source: 'TODO: dónde y cuándo se publicó' },`}
];`);
  }
  if (usaBloque('Bento') || usa('galeria'))
    d.push(`const trabajos = [
  { src: '/img/TODO.webp', alt: 'TODO: describe la foto', width: 1200, height: 900 },
];`);
  if (usaBloque('StatRow')) {
    const cf = cifrasCliente();
    d.push(`const cifras = [
${cf.length
    ? cf.map(([v, l, p]) => `  { value: ${q(v)}, label: ${q(l || 'TODO: qué mide')} },${p ? ` // prueba: ${String(p).replace(/[\r\n]/g, ' ')}` : ' // TODO (P8): de dónde sale la prueba'}`).join('\n')
    : `  { value: 'TODO', label: 'TODO (P8): qué mide, con prueba enseñable' },`}
];`);
  }
  if (usaBloque('Steps') || usa('proceso')) {
    const ps = pasosCliente();
    d.push(`const pasos = [
${ps.length
    ? ps.map(([t, dd, p]) => `  { title: ${q(t)}, text: ${q([dd, p].filter(Boolean).join(' · ') || 'TODO (P12): qué pasa en ese paso y cuánto tarda')} },`).join('\n')
    : `  { title: 'TODO (P12): el paso', text: 'TODO: qué pasa en ese paso y cuánto tarda.' },`}
];`);
  }
  if (usa('precios'))
    d.push(`const partidas = [
  { title: 'TODO: la partida', hint: 'TODO: el gancho', meta: 'desde TODO €', body: 'TODO: qué entra en ese precio.' },
];`);
  if (usa('faq'))
    d.push(`const preguntas = [
  { q: 'TODO: la pregunta que hacen siempre', a: 'TODO: la respuesta, sin rodeos.' },
];`);
  if (usa('zona')) {
    const si = sitiosCliente();
    d.push(`const sitios = [${si.length ? si.map(q).join(', ') : `'TODO (P11): los pueblos, con su nombre propio'`}];`);
  }
  return d;
}

function astroPagina() {
  const slug = slugDe(S.marca);
  const cuerpo = S.secciones.map(astroSeccion).join('\n\n');

  // Solo se importa lo que se usa: un import muerto en Astro no rompe, pero
  // enseña a copiar imports sin mirar.
  const bloques = [...new Set(S.secciones.map(bloqueDe).filter(Boolean))].sort();
  const primitivos = [];
  if (/<Section\b/.test(cuerpo)) primitivos.push('Section');
  if (/<SectionHead\b/.test(cuerpo)) primitivos.push('SectionHead');
  if (/<Button\b/.test(cuerpo)) primitivos.push('Button');
  const datos = astroDatos();
  const hayFx = S.movimiento.some((m) => MOVIMIENTO[m]?.js) || /data-fx=/.test(cuerpo);

  return `---
/* Portada · ${S.marca}
   Andamio generado por el Estudio de marca. Las secciones y su orden ya están
   decididos; lo que falta es el CONTENIDO, marcado con TODO.

   Antes de tocar esto: opspilot-kit/ASSETS.md. Sin fotos utilizables, logo en
   vector y datos reales no hay maquetación que salve la página.

   El CSS del proyecto tiene que importar, en este orden:
     kit.css → fx.css → themes/${slug}.css → marca-${slug}.css */
import Layout from '../layouts/Layout.astro';
${primitivos.map((p) => `import ${p} from '@opspilot/kit/primitives/${p}.astro';`).join('\n')}
${bloques.map((b) => `import ${b} from '@opspilot/kit/blocks/${b}.astro';`).join('\n')}
import NavBar from '@opspilot/kit/blocks/NavBar.astro';
import SiteFooter from '@opspilot/kit/blocks/SiteFooter.astro';${hayFx ? `
import KitRuntime from '@opspilot/kit/primitives/KitRuntime.astro';` : ''}

${datos.join('\n\n')}
---

<Layout
  title="TODO (P11): título de 55-60 caracteres con el servicio y el sitio${S.busqueda.trim() ? ` · «${S.busqueda.trim().replace(/["{}<>`]/g, '')}»` : ''}"
  description="TODO: 150-160 caracteres. Lo que hace y dónde, sin adjetivos."
>
  {/* Cabecera: ${HEADERS[S.header].n} */}
  <NavBar
    logo={{ src: '/img/TODO-logo.svg', alt: '${esc(S.marca)}' }}
    items={[{ href: '/servicios', label: 'Servicios' }, { href: '/trabajos', label: 'Trabajos' }]}
    cta={{ href: '/contacto', label: 'Presupuesto' }}
  />

  <main>
${cuerpo}
  </main>

  {/* Pie: ${FOOTERS[S.footer].n} */}
  <SiteFooter
    logo={{ src: '/img/TODO-logo.svg', alt: '${esc(S.marca)}' }}
    legal={[{ href: '/aviso-legal', label: 'Aviso legal' }]}
    copyright="TODO: razón social y NIF reales"
  />${hayFx ? `

  {/* Los efectos se cargan solos y solo si hay algo que animar. */}
  <KitRuntime />` : ''}
</Layout>
`;
}

/** Las seis líneas, y la entrada lista para pegar en marcas.json. */
function direccionArteMD() {
  const e = S.ejes, b = BASES[S.base], f = FONDOS[S.fondo];
  const entrada = {
    id: slugDe(S.marca),
    n: S.marca,
    repo: 'TODO',
    sector: S.oficio || 'TODO',
    fecha: new Date().toISOString().slice(0, 10),
    estado: 'en obras',
    ejes: { ...e },
    display: S.display,
    acento: S.acento.toUpperCase(),
    acento2: null,
    papel: String(tokens()['--color-paper']).toUpperCase(),
    // 'est' hasta que una persona los confirme (F4b: la IA propone, valida una persona).
    origenEjes: 'est',
    fondo: S.fondo === 'ninguno' ? 'color plano' : S.fondo,
    foto: FOTOS[S.foto].n,
    gesto: S.gesto.trim() || 'TODO',
    kit: true,
    doc: `${slugDe(S.marca)}/brand/DIRECCION-ARTE.md`,
  };

  const problemas = conflictos();

  return `# Dirección de arte · ${S.marca}

Generado con el Estudio de marca. Va en \`<repo>/brand/DIRECCION-ARTE.md\`.

## Las seis líneas

\`\`\`
Ejes:     peso ${e.peso} · temperatura ${e.temperatura} · memoria ${e.memoria} · aire ${e.aire}
Display:  ${S.display}${S.ancho ? ' en ancho extendido (font-stretch 116%)' : ''}
Acento:   ${S.acento.toUpperCase()} sobre base «${b.n}» (${b.hue})${S.papel ? ` con papel propio ${S.papel.toUpperCase()}` : ''}
Fondo:    ${f.n}${f.dice ? ` — ${f.dice}` : ''}
Foto:     ${FOTOS[S.foto].n}, recorte ${FORMAS[S.forma].n.toLowerCase()}
Gesto:    ${S.gesto.trim() || '⚠ SIN DEFINIR'}
\`\`\`

${S.gesto.trim() ? '' : `> **Falta el gesto.** Sin él la web estará bien hecha y será olvidable.
> Búscalo en las reseñas del cliente, no en su catálogo: ahí es donde la gente
> escribe por qué le contrató en vez de al de al lado.

`}## La página

${S.secciones.map((s, i) => {
  const def = SECCIONES[s.t] || {};
  const v = (def.variantes || []).find((x) => x.id === s.v) || {};
  return `${i + 1}. **${def.n}** · ${v.n || s.v} — ${v.dice || def.dice || ''}`;
}).join('\n')}

## El contenido (protocolo OpsPilot)

Lo que sale de las plantillas F4 y F5 del cliente. Lo marcado TODO se pide; no se inventa.

\`\`\`
${bloqueContenido()}
\`\`\`

## Lo que la herramienta avisó

${problemas.length
  ? problemas.map(([t, d, n]) => `- ${n === 'grave' ? '**✕ SUELO INCUMPLIDO**' : '⚠'} **${t}:** ${d}`).join('\n')
  : 'Nada: las decisiones se sostienen entre sí y no chocan con ninguna web del registro.'}

## Entrada para el registro

Al cerrar la web, pegá esto en \`opspilot-kit/marcas.json\`. Si no se pega, el
registro envejece y la comprobación anti-clon deja de servir para la siguiente.
\`origenEjes\` sale como \`est\`: pásalo a \`validado\` cuando una persona confirme los ejes.

\`\`\`json
${JSON.stringify(entrada, null, 2)}
\`\`\`
`;
}

/* ── El encargo, autosuficiente ────────────────────────────────────────────
   Lo lee OTRO Claude, que no tiene esta pantalla ni, muchas veces, el repo del
   kit (es privado). Medido el 23-sep: el encargo anterior pesaba 3.080
   caracteres y no llevaba NI UN token de color —remitía a «el bloque Tema CSS
   de este encargo», que no viajaba al copiar—, así que el que lo recibía tenía
   el acento y se inventaba el papel, la tinta suave y el fondo profundo, que
   son justo los pares que mide el suelo. Tampoco decía qué va dentro de cada
   sección. Regla: todo lo que hace falta para maquetar viaja en el texto; lo
   que no se sabe viaja como TODO con el paso del protocolo que lo rellena. */

const PUBLICO = 'https://opspilotcontact-lgtm.github.io/kit-visual/';

/** El enlace a esta composición, sin tocar la barra de direcciones. */
function enlaceEstudio() {
  const { logo, ...sinLogo } = S;
  const aqui = typeof location !== 'undefined' && /^https?:/.test(location.origin || '')
    ? location.origin + location.pathname : PUBLICO + 'estudio/';
  return aqui + '#' + codifica(sinLogo);
}

/** Los tokens como líneas de CSS, con su porqué. Sirven igual en @theme que en :root. */
function lineasTokens() {
  const t = tokens();
  const nota = Object.fromEntries(BLOQUES_TEMA.flatMap(([, filas]) => filas));
  return Object.entries(t).map(([k, v]) => `  ${`${k}: ${v};`.padEnd(52)} /* ${nota[k] || ''} */`).join('\n');
}

/** Los .woff2 exactos de las dos familias de esta web. */
function ficherosFuente() {
  const fams = [...new Set([S.display, S.texto])];
  return fams.map((f) => {
    const urls = FUENTES[f] || [];
    return urls.length
      ? urls.map((u) => `     ${u}`).join('\n')
      : `     (${f}: busca su @font-face en kit-completo.css y descarga el fichero que nombra)`;
  }).join('\n');
}

/** La capa de marca tal y como la pinta el lienzo, apuntando al fichero del logo. */
function recetaMarca(ruta, enPortada = true) {
  // La ventana lleva una foto dentro: en el encargo, un fichero, no un blob.
  MARCA_FIJA = ruta; FOTO_FIJA = '/img/TODO.webp';
  try {
    return capaMarca(false, enPortada).replace(/\s+/g, ' ').replace(/ ;/g, ';').trim();
  } finally { MARCA_FIJA = null; FOTO_FIJA = null; }
}

const vacio = (v, p, que) => (String(v || '').trim() ? String(v).trim() : `TODO (${p}): ${que}`);

/* Cabecera, botones, pie y pasos. En el kit son COMPONENTES de Astro (NavBar,
   Button, SiteFooter, Steps), no clases: en la vía B no hay clase que dar. La
   prueba ciega v3 (Sonnet) lo cazó: el encargo prometía «clase exacta» y tuvo
   que inventarse las suyas. Ahora se dice, y del botón y la cabecera viaja el
   marcado del lienzo (estilos en línea con los tokens) como referencia exacta:
   se pasa a clases en marca-<slug>.css. */
function estructura() {
  const compacta = (h) => h.replace(/\s+/g, ' ').replace(/> </g, '><').trim();
  MARCA_FIJA = '/img/logo.svg';
  let boton, cabecera;
  try { boton = compacta(botonHTML('Texto del botón')); cabecera = compacta(headerHTML()); }
  finally { MARCA_FIJA = null; }
  return [
    `· Cabecera: ${HEADERS[S.header].n} — vía A: componente NavBar del kit · vía B: sin clase en el kit; referencia exacta (pásala a clases en marca-<slug>.css):`,
    `  ${cabecera}`,
    `· Botones: ${BOTONES[S.boton].n} — vía A: componente Button · vía B, referencia exacta:`,
    `  ${boton}`,
    `· Pie: ${FOOTERS[S.footer].n} — vía A: componente SiteFooter · vía B: fondo --color-deep, texto blanco, ${logoAColor() ? 'el logo a color como imagen (ver «La marca»)' : 'el logo recoloreado con mask-image'} y los enlaces legales.`,
    ...(S.secciones.some((s) => s.t === 'proceso') ? ['· Pasos del proceso — vía A: componente Steps · vía B: número grande en --color-brand con font-display, título y texto debajo; sin tarjetas.'] : []),
  ].join('\n');
}

function bloqueContenido() {
  const sv = serviciosCliente(), rs = resenasCliente(), si = sitiosCliente();
  const prohibidas = '«líderes», «soluciones a medida», «vanguardia», «Elevate», «Impulsa», «Transformamos tu…», «calidad-precio»';
  const noCanales = Object.keys(CANALES).filter((c) => !canal(c)).map((c) => CANALES[c].toLowerCase());
  return [
    `Fuente: ${S.np.trim() ? `NotionPilot · ${S.np.trim()}` : 'NotionPilot · TODO: enlaza el proyecto o el documento F4 del cliente'}`,
    'Lo que falte aquí va a la web como TODO (Pn) y se pide: NO se inventa. Ni cifras, ni reseñas, ni plazos.',
    '',
    `P7  Posicionamiento:    ${vacio(S.posicionamiento, 'P7', 'para [quién] que necesita [qué], [cliente] es [qué] que [prueba que un competidor no podría firmar]')}`,
    '                        → INTERNO: orienta el titular y el tono. NO se pega literal en la web.',
    `P8  Prueba principal:   ${vacio(S.prueba, 'P8', 'una cifra, foto, nombre o fecha que se pueda enseñar')}`,
    '                        → va en el subtítulo de la portada',
    `P11 Búsqueda principal: ${S.busqueda.trim() ? `«${S.busqueda.trim()}»` : 'TODO (P11): la búsqueda tal como la escribe el cliente'}`,
    '                        → en el <title>, el H1 y la URL de la portada',
    `    Zona:               ${si.length ? si.join(', ') : 'TODO (P11): los pueblos, por su nombre propio'}`,
    `                        → en la sección «${(SECCIONES.zona || {}).n || 'Dónde trabajás'}» si la página la tiene; si no, en el pie. Una página por pueblo (P15).`,
    `P9  Voz:                ${vacio(S.voz, 'P9', 'tres adjetivos, con un ejemplo de cada')}`,
    `    Decimos:            ${vacio(S.palabrasSi, 'P9', 'palabras que usa el cliente')}`,
    `    Nunca decimos:      ${S.palabrasNo.trim() ? S.palabrasNo.trim() + ' · ' : ''}${prohibidas}`,
    `P12 Objeción principal: ${vacio(S.objecion, 'P12', 'la duda que frena al cliente antes de escribir')}`,
    `    Se responde con:    ${vacio(S.respuestaObjecion, 'P12', 'un hecho que la desmonte (una garantía, un plazo, un nombre); sin él, la banda de la objeción se quita')}`,
    '',
    'Cómo funciona (P12 · los pasos, con su plazo real):',
    pasosCliente().length
      ? pasosCliente().map(([t, d, p], i) => `  ${i + 1}. ${[t, d, p].filter(Boolean).join(' — ')}`).join('\n')
      : '  TODO (P12): los pasos, del primer mensaje a la obra terminada. Sin ellos, la sección de proceso se quita.',
    '',
    'Servicios (P12 · nombre — qué incluye — precio; si falta «para quién» o «plazo», va como TODO (P12) en su ficha):',
    sv.length ? sv.map(([t, d, p], i) => `  ${i + 1}. ${[t, d, p].filter(Boolean).join(' — ')}`).join('\n')
      : '  TODO (P12): la lista de servicios con sus palabras y su «desde X €» si lo hay',
    '',
    'Reseñas reales (P8 · literales, sin corregir):',
    rs.length ? rs.map(([t, f]) => `  «${t}»${f ? ` — ${f}` : ''}`).join('\n')
      : '  TODO (P8): reseñas literales con nombre (con permiso) y fecha. Si no hay, la sección de testimonio se quita.',
    '',
    'Cifras con prueba (P8 · para las bandas y secciones de cifras):',
    cifrasCliente().length
      ? cifrasCliente().map(([v, qq, p]) => `  ${v} — ${qq || 'TODO: qué mide'}${p ? ` (prueba: ${p})` : ' (TODO: de dónde sale la prueba)'}`).join('\n')
      : '  TODO (P8): cifras con prueba enseñable. Sin cifras, las secciones de cifras se QUITAN: no se rellenan con números redondos.',
    '',
    'Datos de contacto (ASSETS · tal como van en todas partes):',
    lineas(S.datosContacto).length ? lineas(S.datosContacto).map((l) => `  ${l}`).join('\n')
      : `  TODO: ${canal('whatsapp') || !canalesDecididos() ? 'el número de WhatsApp, ' : ''}el horario REAL${canal('formulario') || !canalesDecididos() ? ', a dónde llega el formulario (correo, WhatsApp o CRM) y quién lo atiende y en cuánto tiempo (P16)' : ''}.`,
    '',
    canalesDecididos()
      ? `Canal real (P12): ${(S.canales || []).map((c) => CANALES[c]).join(' y ')}.${noCanales.length ? ` NO poner ${noCanales.join(' ni ')}: lo que no está aquí no existe en la web (ni tel: ni mailto: sueltos).` : ''}` +
        // Los datos de contacto pueden traer un correo o un teléfono de un canal no marcado: manda el canal
        // (el constructor ciego de Dígito, F6, lo vio como contradicción).
        (/@/.test(S.datosContacto) && !canal('correo') ? ' El correo que aparezca en «Datos de contacto» NO se publica: el canal correo no está marcado.' : '')
      : 'Canal real (P12): TODO: qué canal atiende el cliente DE VERDAD. Sin esto no se maqueta el contacto.',
  ].join('\n');
}

function prompt() {
  const b = BASES[S.base];
  const f = FONDOS[S.fondo];
  const slug = slugDe(S.marca);
  const vars = (x) => (x ? ` con ${x}` : '');

  /* Cada pieza con su clase exacta y, si necesita JavaScript, lo que se pone en
     su lugar cuando se monta sin el kit (vía B). */
  const piezas = [];
  if (S.fondo !== 'ninguno') {
    if (f.js) {
      const alt = f.sinJs && FONDOS[f.sinJs];
      piezas.push(`Fondo: data-fx="${S.fondo}" (JS, se carga solo)${alt ? ` · vía B: .${alt.clase}${vars(alt.vars)}` : ' · vía B: color plano'}`);
    } else piezas.push(`Fondo: .${f.clase}${vars(f.vars)}`);
  }
  if (ESCENAS[S.escena].clase) piezas.push(`Escenografía: .${ESCENAS[S.escena].clase}${vars(ESCENAS[S.escena].vars)}`);
  if (ESCENAS[S.escena].borde) piezas.push('Escenografía: .fx-arc-b en el corte de sección');
  if (S.pieza !== 'ninguna') piezas.push(
    `Pieza geométrica: ${PIEZAS[S.pieza].n.toLowerCase()} ${RELLENOS[S.relleno].n.toLowerCase()}, ` +
    `${TAMANOS[S.tam].n.toLowerCase()} (${TAMANOS[S.tam].v}), colocada ${POSICIONES[S.pos].n.toLowerCase()} ` +
    `(left:${POSICIONES[S.pos].x} top:${POSICIONES[S.pos].y}), en un span absoluto detrás del contenido: ${PIEZAS[S.pieza].css || ''}`);
  const fo = FOTOS[S.foto];
  if (fo.clase) piezas.push(`Foto: .${fo.clase}${vars(fo.vars)}`);
  if (fo.js) {
    const alt = fo.sinJs && FOTOS[fo.sinJs];
    piezas.push(`Foto: data-fx="ink" con {"mode":"dots","color":"--color-brand","invert":${b.oscuro},"reveal":true}` +
      (alt ? ` · vía B: .${alt.clase}${vars(alt.vars)}` : ''));
  }
  if (FORMAS[S.forma].clase) piezas.push(`Forma de foto: .${FORMAS[S.forma].clase}`);
  if (TITULARES[S.titular].clase) piezas.push(`Titulares: .${TITULARES[S.titular].clase}`);
  if (S.boton === 'material') piezas.push('Botones: cara con degradado de marca + canto de metal (--color-brand → --color-brand-dim, borde --color-metal)');
  // Los módulos son de toda la web, pero se ven solo donde la sección lleva la
  // capa «módulos»: el encargo dice dónde, o avisa de que no van en ninguna.
  const conModulos = S.secciones.map((s, i) => [s, i]).filter(([s]) =>
    (s.capas || []).includes('modulos') && ((SECCIONES[s.t] || {}).admite || []).includes('modulos'))
    .map(([s, i]) => `${String(i + 1).padStart(2, '0')} ${(SECCIONES[s.t] || {}).n}`);
  /* Un módulo no se explica con su nombre: la prueba ciega del 23-sep (Haiku)
     recibió «Módulo: Desplegable» y no usó ni una clase del kit porque no sabía
     su marcado. Se entrega el marcado EXACTO que pinta el lienzo, con la foto
     como fichero y el texto de ejemplo para sustituir. */
  const marcado = (m) => {
    // La ficha del lienzo es una imitación (botón + nota); la de verdad es el
    // bloque Sheet del kit o un <dialog> nativo. Dar la imitación como
    // «marcado exacto» sería mentir.
    if (m === 'sheet') return '';
    FOTO_FIJA = '/img/TODO.webp';
    try { return moduloHTML(m).replace(/\s+/g, ' ').replace(/> </g, '><').trim(); }
    finally { FOTO_FIJA = null; }
  };
  S.modulos.forEach((m) => piezas.push(`Módulo: ${MODULOS[m].n} — ${MODULOS[m].nota}${MODULOS[m].js ? ' · vía B: se quita' : ''}` +
    ` · va en: ${conModulos.length ? conModulos.join(', ') : 'ninguna sección (se usa donde el contenido lo pida, no por tenerlo)'}` +
    (marcado(m) ? `\n  Marcado exacto (el texto es de ejemplo: se sustituye por el del cliente):\n  ${marcado(m)}` : '')));
  S.movimiento.filter((m) => m !== 'quieto').forEach((m) => piezas.push(
    `Movimiento: ${MOVIMIENTO[m].n}${MOVIMIENTO[m].js ? ` (data-fx="${MOVIMIENTO[m].js}") · vía B: se quita` : ''}`));

  /* La marca como forma: dónde vuelve a salir el logo y con qué CSS. */
  const conMarca = S.secciones.map((s, i) => [s, i]).filter(([s]) =>
    (s.capas || []).includes('marca') && ((SECCIONES[s.t] || {}).admite || []).includes('marca'));
  const juego = MARCAJUEGOS[S.marcaJuego] || {};
  const logo = S.logo
    ? `el del cliente (${S.logo.tipo.replace('image/', '')}, ${S.logo.w}×${S.logo.h} px). Se usa el fichero original en vector: /img/logo.svg` +
      (S.logo.formaSrc ? '. Para los juegos de forma (ventana, sello…) va aparte /img/logo-forma.svg: su silueta sin detalles sueltos (sin ®), del mismo tamaño de lienzo' : '')
    : `TODO: el logo del cliente en SVG. En el Estudio se compuso con la forma de repuesto «${(FORMAS_MARCA[S.marcaForma] || FORMAS_MARCA.arco)[0]}»; se sustituye por el logo real`;
  const marca = [
    `Logo: ${logo}.`,
    `Cabecera y pie: ${!S.marcaEnChrome ? 'el nombre en la tipografía display, sin logo'
      : logoAColor() ? 'el logo como IMAGEN, a color (<img src="/img/logo.svg">): tiene varios colores y recolorearlo con máscara borraría lo de dentro. En el pie oscuro, su versión para fondo oscuro si la tiene; si no, la misma'
        : 'el logo como forma; en el pie oscuro se recolorea con mask-image (un solo fichero, sin versión en negativo)'}.`,
    S.marcaJuego && S.marcaJuego !== 'ninguno'
      ? `Juego: ${juego.n}${juego.dice ? ` — ${juego.dice}` : ''}. Va en ${conMarca.length ? conMarca.map(([s, i]) => `${String(i + 1).padStart(2, '0')} ${(SECCIONES[s.t] || {}).n}`).join(', ') : 'ninguna sección todavía (marca la capa «marca» donde toque)'}.\n` +
        `  CSS exacto (el mismo que pinta el Estudio; la sección lleva position:relative;isolation:isolate;overflow:hidden y el contenido z-index:1):\n` +
        (S.marcaJuego === 'ventana'
          ? `  En la PORTADA, la ventana (grande, una sola vez):\n  ${recetaMarca('/img/logo.svg', true)}\n  Y en el CSS de la web, sin falta (por debajo de 75rem deja de flotar y va encima del titular; si no, se le monta encima):\n  ${VENTANA_CSS}\n  En las DEMÁS secciones con marca, como sello (pequeño y siempre igual; así se repite sin hacer ruido):\n  ${recetaMarca('/img/logo.svg', false)}`
          : `  ${recetaMarca('/img/logo.svg')}`)
      : 'Juego: ninguno. El logo solo va en cabecera y pie.',
  ].join('\n');

  const problemas = conflictos();
  const contraste = problemasContraste();
  const e = S.ejes;

  return `ENCARGO DE MAQUETACIÓN · ${S.marca}
Generado con el Estudio de marca del kit OpsPilot · ${new Date().toISOString().slice(0, 10)}

═══ QUÉ HAY QUE HACER ═══
Maquetar la web de ${S.marca}${S.oficio ? ` (${S.oficio})` : ''} aplicando EXACTAMENTE la dirección de arte y el
contenido de abajo. No los reinterpretes: están decididos.

Este encargo se basta solo: trae la paleta completa, las piezas del kit con su clase exacta
(y, las que en el kit son componentes sin clase, su marcado de referencia), el orden
de la página y lo que va dentro de cada sección. Lo que no se sabe va marcado como TODO con el
paso del protocolo que lo rellena (P7, P8…): NO lo inventes, pídeselo a quien te pasó el encargo.
Los «Pn» son pasos del protocolo de la agencia: no hace falta consultarlos, lo que aportan ya
está en el bloque CONTENIDO. Los textos de sección y botones los redactas tú con la VOZ de abajo;
los datos (cifras, precios, plazos, reseñas, teléfonos) salen SOLO del CONTENIDO.

═══ ANTES DE MAQUETAR: MATERIALES ═══
Mínimo: logo en vector · 12 fotos reales de ≥1600 px · nombre, dirección y teléfono exactos ·
qué vende y a quién, en sus palabras · razón social y NIF. Sin eso no se arranca: se piden.
Fotos: nunca de banco ni generadas con IA. Si son de móvil y con luces distintas, el tratamiento
de foto de abajo las iguala.${FOTOS_CLIENTE.length ? `
Fotos del cliente probadas en el Estudio: ${FOTOS_CLIENTE.length} (${FOTOS_CLIENTE.filter((f) => f.w >= 1600).length} de ≥1600 px, ${FOTOS_CLIENTE.filter((f) => f.w > f.h).length} horizontales).${diagnosticoFotos().map(([t, x]) => `\n  ⚠ ${t}: ${x}`).join('')}` : ''}

═══ CÓMO SE MONTA: DOS VÍAS ═══
VÍA A · con el kit (Astro 5 + Tailwind v4), si tienes el repo privado
  github.com/opspilotcontact-lgtm/opspilot-kit (en la máquina del fundador: Documents/GitHub/opspilot-kit)
  1. En el proyecto Astro: npm i file:<ruta-al-kit> y npm i -D tailwindcss @tailwindcss/vite
  2. Crea opspilot-kit/src/styles/themes/${slug}.css con el bloque TOKENS dentro de @theme { … }
     (o descarga «${slug}.css» del Estudio: son los mismos tokens con su porqué).
  3. CSS del proyecto, en este orden: kit.css → fx.css → themes/${slug}.css → marca-${slug}.css (lo propio).
  4. Descarga «index.astro» del Estudio: es el andamio con los bloques reales y este mismo orden.
  5. Si falta un bloque o un efecto, se añade AL KIT, nunca suelto en el proyecto.

VÍA B · sin el kit (HTML estático, otro framework, o un Claude sin acceso al repo)
  1. Descarga ${PUBLICO}_astro/kit-completo.css y guárdalo como /css/kit.css
     (83 KB, 16 KB en gzip; trae las utilidades fx-* y las @font-face de todas las familias).
  2. Descarga a /fonts/ SOLO las fuentes de esta web (el CSS las busca en ../fonts/, al lado de /css/):
${ficherosFuente()}
  3. Pega el bloque TOKENS dentro de :root { … } en una hoja cargada DESPUÉS de kit.css.
  4. Autoalójalo todo. NO enlaces el CSS ni las fuentes desde github.io en producción: le das la IP
     de cada visitante a un tercero (RGPD) y Pages cachea diez minutos.
  5. Los efectos con JavaScript (data-fx) no existen en esta vía: cada pieza dice abajo qué va en su
     lugar. La web tiene que entenderse entera sin ellos.
  6. Utilidades base que trae kit.css, para no reinventarlas: container-kit (ancho y márgenes) ·
     section-y (aire vertical de sección) · measure (≤65 caracteres) · tabular (cifras alineadas) ·
     text-d1 / text-d2 / text-d3 (tamaños de titular) · bg-paper / bg-paper-alt / bg-deep ·
     text-ink / text-ink-soft · font-display. «.reveal» sin el runtime se queda visible: NO pongas
     la clase kit-js a mano, o lo marcado con .reveal no aparecerá nunca.
  7. El MARCO de la muestra, tal cual (cada sección es <section class="sec"> con su contenido en
     <div class="wrap">). Sin esto el titular sale fino y el texto pegado al borde:
     ${cssBase().replace(/\n\s*/g, '\n     ')}
  8. El titular de la portada es CORTO: la búsqueda principal (P11), qué y dónde. El resto (años,
     proceso, promesa) va al subtítulo o más abajo; un h1 de cinco líneas no se lee.
  9. Las máscaras (mask-image) no se ven abriendo el HTML con doble clic (file://): el navegador las
     bloquea. Pruébalo SERVIDO (npx serve, python -m http.server…).

═══ TOKENS · la paleta completa (no se añade ni un color) ═══
${lineasTokens()}

Contraste medido por el Estudio sobre estos valores: ${contraste.length
    ? `${contraste.length} de ${PARES.length} pares NO cumplen — corrígelos ANTES de maquetar (ver AVISOS).`
    : `los ${PARES.length} pares que importan cumplen (texto ≥4.5:1, titulares grandes ≥3:1).`}
Sobre foto, degradado o fondo animado no se puede medir aquí: mídelo en la zona PEOR.

═══ LAS SEIS LÍNEAS ═══
Ejes:     peso ${e.peso} · temperatura ${e.temperatura} · memoria ${e.memoria} · aire ${e.aire}
Display:  ${S.display}${S.ancho ? ' en ancho extendido (font-stretch 116%)' : ''}
Texto:    ${S.texto}
Acento:   ${S.acento.toUpperCase()} sobre base «${b.n}» (${b.hue})${S.papel ? ` con papel propio ${S.papel.toUpperCase()}` : ''}. Tinta ${S.tinta.toUpperCase()}.
Fondo:    ${f.n}${f.dice ? ` — ${f.dice}` : ''}
Foto:     ${fo.n}${fo.nota ? ` — ${fo.nota}` : ''}, recorte ${FORMAS[S.forma].n.toLowerCase()}
Gesto:    ${S.gesto.trim() || '⚠ SIN DEFINIR. Búscalo en las reseñas del cliente antes de maquetar: es lo único que no se puede copiar.'}

═══ LA MARCA COMO FORMA ═══
${marca}

═══ EL CONTENIDO · protocolo OpsPilot ═══
${bloqueContenido()}

═══ LA PÁGINA DE INICIO, SECCIÓN A SECCIÓN (se maquetan las ${S.secciones.length}) ═══
«Portada» es solo el nombre de la PRIMERA sección (la primera pantalla): la página de inicio
son todas las secciones de abajo, en este orden.
${S.secciones.map((s, i) => {
  const def = SECCIONES[s.t] || {};
  const v = (def.variantes || []).find((x) => x.id === s.v) || {};
  const capas = (s.capas || []).filter((c) => (def.admite || []).includes(c));
  return `${String(i + 1).padStart(2, '0')}. ${def.n} · ${v.n || s.v}` +
    `\n    ${v.dice || def.dice || ''}` +
    `\n    Fondo de sección: ${({ paper: 'papel (--color-paper)', alt: 'papel alterno (--color-paper-alt)', deep: 'profundo (--color-deep, texto en blanco)' })[s.tono]}` +
    (capas.length ? `\n    Capas aquí: ${capas.map((c) => NOMBRE_CAPA[c] || c).join(', ')}` : '') +
    ((v.protocolo || def.protocolo) ? `\n    Contenido: ${v.protocolo || def.protocolo}` : '');
}).join('\n')}

El orden es una decisión, no una lista: no lo reordenes «para que fluya mejor».
Si una sección no tiene contenido real que poner, se quita — no se rellena.

═══ PIEZAS DEL KIT, EXACTAS ═══
${piezas.map((p) => '· ' + p).join('\n')}
${estructura()}

═══ REGLAS QUE NO SE SALTAN ═══
1. UN fondo principal en toda la web. Un segundo solo si una sección cambia de asunto a propósito.
2. UN tratamiento de foto, el mismo en todas.
3. Máximo DOS formas de recorte.
4. El movimiento se decide una vez: o la web es tranquila o es nerviosa.
5. La escenografía va en las secciones bisagra (paso a oscuro, CTA, cierre), no en todas.
6. Contraste real: cuerpo ≥4.5:1, titulares ≥3:1, medido en la zona PEOR del fondo.
7. Sin JS, todo visible. Ningún efecto puede esconder un precio.
8. prefers-reduced-motion cortado de verdad, no «más suave».
9. Nada de foto de banco ni generada. Ni una.
10. Una sola familia de grises: todo gris sale de los tokens, nunca un #999 suelto.
${problemas.length ? `
═══ AVISOS ABIERTOS DEL ESTUDIO ═══
${problemas.map(([t, d, n]) => `${n === 'grave' ? '✕ SUELO' : '⚠'} ${t}: ${d}`).join('\n')}
` : ''}
═══ TERMINADA CUANDO ═══
· Abre en un móvil de 390 px sin scroll lateral.
· No hay ni un color fuera del bloque TOKENS.
· Sin JavaScript todo se lee; con prefers-reduced-motion no se mueve nada.
· No queda ni un TODO publicado, ni un texto que no salga del bloque CONTENIDO o de NotionPilot.
· Quitas todos los efectos y la página sigue entendiéndose. Si se cae, no estabas diseñando: estabas tapando.

Para reabrir esta composición en el Estudio (sin el logo, que no viaja en el enlace):
${enlaceEstudio()}`;
}

/* ── Diálogo de salida ────────────────────────────────────────────────────── */
/* Los ficheros que salen de aquí. Uno por cosa que hay que crear en el repo,
   con su nombre ya puesto: si el que lo recibe tiene que inventarse dónde va,
   acaba en la carpeta de descargas y no en el proyecto. */
const FICHEROS = {
  prompt: { n: () => `ENCARGO-${slugDe(S.marca)}.md`, tipo: 'text/markdown', texto: () => prompt() },
  astro: { n: () => 'index.astro', tipo: 'text/plain', texto: astroPagina },
  tema: { n: () => `${slugDe(S.marca)}.css`, tipo: 'text/css', texto: temaCSS },
  arte: { n: () => 'DIRECCION-ARTE.md', tipo: 'text/markdown', texto: direccionArteMD },
  json: { n: () => `estudio-${slugDe(S.marca)}.json`, tipo: 'application/json', texto: () => JSON.stringify(S, null, 2) },
};

/** Blob + <a download>. Sin dependencias y sin servidor. */
function descarga(clave) {
  const f = FICHEROS[clave];
  if (!f) return;
  const url = URL.createObjectURL(new Blob([f.texto()], { type: f.tipo + ';charset=utf-8' }));
  const a = document.createElement('a');
  a.href = url; a.download = f.n();
  document.body.appendChild(a); a.click(); a.remove();
  // Sin esto el Blob se queda en memoria hasta recargar. No se nota con uno;
  // sí con veinte descargas en una sesión larga.
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

let vista = 'prompt';
function pintaSalida() {
  $('#salida').value = (FICHEROS[vista] || FICHEROS.prompt).texto();
  document.querySelectorAll('.ui-dialog-tabs button').forEach((b) => b.classList.toggle('on', b.dataset.vista === vista));
}


