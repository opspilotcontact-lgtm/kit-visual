/* Estudio de marca · asistente.js
   El asistente «Proyecto nuevo» (F2, 23-sep). El panel lo enseña todo a la
   vez y eso satura: con treinta decisiones abiertas no se decide ninguna. El
   asistente las ordena en ocho pasos —primero lo que trae el cliente, después
   lo que se decide con criterio— y en cada uno dice para qué sirve y cuándo
   aporta más. Escribe en el MISMO estado que el panel: se salta de uno a otro
   cuando se quiera y no se pierde nada.
   Script clásico: comparte el ámbito global con los demás ficheros del
   Estudio y se carga en el orden de index.html. */
'use strict';

const CLAVE_MODO = 'opspilot.estudio.modo';   // { modo: 'asistente'|'panel', paso }
const MARCA_VACIA = 'Nombre del cliente';
let PASO = 0;
let VISTOS = new Set();
let VUELTA = 0;                       // «Otras tres» = otra vuelta de la misma semilla
let PROPUESTAS = [], HUELLA_PROP = '', ELEGIDA = null;
let PALETA_LOGO = [], PALETA_DE = '';

const leeModo = () => { try { return JSON.parse(localStorage.getItem(CLAVE_MODO) || '{}') || {}; } catch { return {}; } };
const guardaModo = (o) => { try { localStorage.setItem(CLAVE_MODO, JSON.stringify({ ...leeModo(), ...o })); } catch { /* modo privado */ } };
const enAsistente = () => document.body.classList.contains('ui-modo-asistente');

/* La semilla sale del nombre: el mismo cliente recibe las mismas tres
   propuestas al volver, y «Otras tres» avanza una vuelta. (FNV-1a) */
function semillaDe(t) {
  let h = 2166136261;
  for (const ch of String(t)) { h ^= ch.codePointAt(0); h = Math.imul(h, 16777619); }
  return h >>> 0;
}

/* ── Piezas de formulario ─────────────────────────────────────────────────
   El texto de ejemplo se lee del campo equivalente del panel: una sola fuente
   para los placeholders, que ya están afinados con casos reales. */
function campoAsis(k, label, { rows = 0, ph = '' } = {}) {
  const v = k === 'marca' && S.marca === MARCA_VACIA ? '' : (S[k] || '');
  const place = esc(ph || ($('#' + k) || {}).placeholder || '');
  return `<label class="ui-field"><span>${label}</span>${rows
    ? `<textarea data-k="${k}" rows="${rows}" placeholder="${place}">${esc(v)}</textarea>`
    : `<input type="text" data-k="${k}" value="${esc(v)}" placeholder="${place}" autocomplete="off">`}</label>`;
}
const tarjeta = (k, v, t, d) =>
  `<button type="button" class="ui-asis-tarjeta${S[k] === v ? ' on' : ''}" data-set="${k}" data-v="${v}"><b>${t}</b><span>${d}</span></button>`;
const casilla = (k, t) =>
  `<label class="ui-field ui-inline"><span>${t}</span><input type="checkbox" data-bool="${k}"${S[k] ? ' checked' : ''}></label>`;
const aviso = (t, x, clase = '') =>
  `<div class="ui-aviso ${clase}" style="margin-top:.45rem"><span>${clase === 'ok' ? '✓' : clase === 'grave' ? '✕' : '⚠'}</span><span><b>${esc(t)}</b>${x ? ' ' + esc(x) : ''}</span></div>`;

/* ── Qué contenido alimenta cada sección ──────────────────────────────────
   Para que el paso de la página diga cuáles irán con su contenido y cuáles
   con un TODO. Es la misma regla del encargo: lo que falta se pide, no se
   inventa. */
const NECESITA = {
  hero: () => [!S.busqueda && 'la búsqueda (P11)', !S.prueba && 'la prueba (P8)'],
  servicios: () => [!serviciosCliente().length && 'los servicios (P12)'],
  banda: (s) => (s.v === 'datos' ? [!cifrasCliente().length && 'cifras con prueba (P8)']
    : s.v === 'frase' ? [!S.respuestaObjecion && 'la objeción respondida (P12)'] : []),
  galeria: () => [FOTOS_CLIENTE.length < 6 && 'fotos de obra propia (P8)'],
  datos: () => [!cifrasCliente().length && 'cifras con prueba (P8)'],
  proceso: () => [!pasosCliente().length && 'los pasos (P12)'],
  testimonio: () => [!resenasCliente().length && 'reseñas literales (P8)'],
  precios: () => [!serviciosCliente().some(([, , p]) => p) && 'precios de partida (P9)'],
  faq: () => [!S.objecion && 'la objeción (P12)'],
  zona: () => [sitiosCliente().length < 2 && 'los pueblos (P11)'],
  contacto: () => [!canalesDecididos() && 'el canal real (P12)', !S.datosContacto && 'horario y tiempo de respuesta'],
  cierre: () => [!canalesDecididos() && 'el canal real (P12)'],
};
const faltaEn = (s) => ((NECESITA[s.t] || (() => []))(s)).filter(Boolean);

/* ── La firma, donde puntúa ───────────────────────────────────────────────
   En la portada si el juego firma en reposo; con sello, en todas las
   secciones que lo admiten (Córdoba); con los demás, también en la última que
   lo admita, para que se repita. Y la portada no apila más de dos capas
   visibles: la firma desplaza a la pieza y, si hace falta, a la escena. */
function ajustaCapasFirma() {
  const admite = (s) => ((SECCIONES[s.t] || {}).admite || []).includes('marca');
  S.secciones.forEach((s) => { s.capas = (s.capas || []).filter((c) => c !== 'marca'); });
  if (S.marcaJuego === 'ninguno') return;
  const hero = S.secciones.find((s) => s.t === 'hero');
  const ultima = [...S.secciones].reverse().find(admite);
  S.secciones.forEach((s) => {
    if (admite(s) && (S.marcaJuego === 'sello' || s === hero || s === ultima)) s.capas.push('marca');
  });
  if (!hero) return;
  const visibles = () => capasDe(hero).filter((c) => (c === 'fondo' && S.fondo !== 'ninguno') ||
    (c === 'escena' && S.escena !== 'ninguna') || (c === 'pieza' && S.pieza !== 'ninguna') || c === 'marca');
  for (const c of ['pieza', 'escena', 'fondo']) {
    if (visibles().length <= 2) break;
    hero.capas = hero.capas.filter((x) => x !== c);
  }
}

/* ── Las propuestas del paso 5 ────────────────────────────────────────────
   Se recalculan solo si cambia algo que el motor mira. Elegir una NO las
   invalida: lo que cambia al elegir (el estilo) no está en la huella. */
function propuestasAsis() {
  // logoSirve() y no solo «hay logo»: cambiar un logo recortado por uno con
  // degradado tiene que quitar la ventana y el sello (revisión del 23-sep).
  const huella = JSON.stringify([S.marca, S.ejes, S.identidad, S.coloresFijos, S.displayFija, S.materialOficio,
    S.coloresFijos ? [S.acento, S.tinta, S.papel, S.base] : 0, S.displayFija ? S.display : 0,
    S.logo ? S.logo.src.length : 0, logoSirve(), S.gesto, S.listaServicios, S.listaResenas, S.cifras,
    S.secciones.map((s) => s.t + '/' + s.v), FOTOS_CLIENTE.length, VUELTA]);
  if (huella !== HUELLA_PROP) {
    PROPUESTAS = proponer({ n: 3, semilla: semillaDe(S.marca) + VUELTA * 7919 });
    HUELLA_PROP = huella;
    ELEGIDA = null;
  }
  return PROPUESTAS;
}

/** El documento del lienzo con una propuesta aplicada, sin tocar el estado. */
function documentoCon(cambios) {
  const antes = S;
  S = { ...antes, ...JSON.parse(JSON.stringify(cambios)), ejes: { ...antes.ejes } };
  try { return documento(); } finally { S = antes; }
}

/* Las miniaturas se pintan a 1280×800 —la primera pantalla de un portátil—
   y se escalan al ancho de la tarjeta: se juzga la portada tal como se verá. */
function escalaMinis() {
  document.querySelectorAll('.ui-asis-mini').forEach((m) => {
    const f = m.querySelector('iframe');
    if (f) f.style.transform = `scale(${m.clientWidth / 1280})`;
  });
}

/* ── Los ocho pasos ───────────────────────────────────────────────────────
   Cada paso: n, para (qué decide y cuándo aporta), pinta() → HTML,
   tras() → lo que necesita el DOM ya puesto, vivo() → lo que se refresca en
   cada repintado SIN rehacer los campos (si no, escribir perdería el foco),
   falta() → lo pendiente, y siFalta: qué pasa si se sigue sin ello. */
const PASOS = [
  {
    id: 'cliente', n: 'El cliente', obliga: true,
    para: 'Quién es y si ya tiene marca. Lo segundo lo decide casi todo: con marca propia, sus colores y su letra no se tocan (P9) y el trabajo es hacerlos memorables; sin marca, el color sale del material de su oficio.',
    pinta: () => `
      ${campoAsis('marca', 'Nombre', { ph: 'Córdoba Soluciona' })}
      ${campoAsis('oficio', 'Qué hace, en sus palabras')}
      ${campoAsis('np', 'NotionPilot <em>— su proyecto o el documento F4: de ahí sale el contenido</em>')}
      <div class="ui-field"><span>¿Trae marca?</span>
        <div class="ui-asis-dos">
          ${tarjeta('identidad', 'propia', 'Tiene marca', 'Logo y colores suyos. Se respetan; el trabajo es la firma.')}
          ${tarjeta('identidad', 'nueva', 'Hay que hacerla', 'Sin logo, o con uno provisional. El color sale de su material.')}
        </div></div>`,
    falta: () => [(!S.marca || S.marca === MARCA_VACIA) && 'el nombre', !S.identidad && 'si trae marca'],
  },
  {
    id: 'materiales', n: 'Sus materiales',
    para: 'Sin materiales no hay dirección de arte (ASSETS.md). El logo decide si su forma puede ser la firma; las fotos, qué tratamiento las convierte en serie. Aporta más cuanto antes llegue: lo que se decide sin ellos se rehace.',
    pinta: () => {
      const propia = S.identidad === 'propia';
      const logo = `<div class="ui-field"><span>Logo <em>— SVG recortado o PNG con transparencia${propia ? '' : '; si tiene uno provisional'}</em></span>
        <div class="ui-logo"><button type="button" class="ui-btn ui-btn-ghost" data-accion="logo">${S.logo ? 'Cambiar el logo…' : 'Subir el logo…'}</button>
        ${S.logo ? '<button type="button" class="ui-btn ui-btn-ghost" data-accion="logo-quitar">Quitar</button>' : ''}</div>
        <div data-vivo="logo"></div></div>`;
      const colores = `<div class="ui-field"><span>Sus colores <em>— del manual o del SVG, no de un JPG</em></span>
        <div data-vivo="paleta"></div>
        <div class="ui-row">
          <label class="ui-color"><span>Acento</span><input type="color" data-color="acento" value="${esc(S.acento)}"></label>
          <label class="ui-color"><span>Tinta</span><input type="color" data-color="tinta" value="${esc(S.tinta)}"></label>
          <label class="ui-color"><span>Papel</span><input type="color" data-color="papel" value="${esc(S.papel || (BASES[S.base] || {}).paper || '#F5F6F7')}"></label>
        </div></div>
        ${casilla('coloresFijos', 'Son los de su marca <em>— ninguna propuesta los cambia</em>')}
        <label class="ui-field"><span>Su letra <em>— si no está en el kit, la más cercana y sin fijar</em></span>
          <select data-k="display">${DISPLAY.map(([id, l]) => `<option value="${esc(id)}"${id === S.display ? ' selected' : ''}>${esc(l)}</option>`).join('')}</select></label>
        ${casilla('displayFija', 'Es la letra de su marca <em>— no se propone otra</em>')}`;
      const material = `<div class="ui-field"><span>¿Con qué material trabaja? <em>— de ahí sale el acento</em></span>
        <div class="ui-chips ui-chips-sm">${Object.entries(MATERIAL_OFICIO).map(([k, v]) =>
          `<button type="button" data-set="materialOficio" data-v="${k}" class="${S.materialOficio === k ? 'on' : ''}">${esc(v.n)}</button>`).join('')}</div>
        <p class="ui-hint" data-vivo="tonos"></p></div>`;
      const fotos = `<div class="ui-field"><span>Sus fotos <em>— de obra propia; no salen de este navegador</em></span>
        <div class="ui-logo"><button type="button" class="ui-btn ui-btn-ghost" data-accion="fotos">Subir fotos…</button>
        ${FOTOS_CLIENTE.length ? '<button type="button" class="ui-btn ui-btn-ghost" data-accion="fotos-quitar">Quitar</button>' : ''}</div>
        <div data-vivo="fotos"></div></div>`;
      return propia ? logo + colores + fotos : material + logo + fotos;
    },
    vivo: (c) => {
      const zona = (k) => c.querySelector(`[data-vivo="${k}"]`);
      if (zona('logo')) {
        const d = ULTIMO_DIAG_LOGO;
        zona('logo').innerHTML = !S.logo ? '<p class="ui-hint">Sin logo: la firma se prueba con una forma de repuesto y el encargo lo pedirá.</p>'
          : `<div class="ui-asis-logo"><img src="${esc(S.logo.src)}" alt=""></div>` + (!d ? '<p class="ui-hint">Mirando el logo…</p>'
            : d.transparente === false || (d.colores ?? 0) > 24
              ? aviso('No sirve como forma:', 'trae fondo o demasiados colores. La firma irá por la escenografía; pide el SVG recortado.')
              : aviso('Sirve como forma:', 'recortado y con pocos colores. Puede ser la firma de toda la web.', 'ok'));
      }
      if (zona('paleta')) {
        if (S.logo && PALETA_DE !== S.logo.src) {
          const src = S.logo.src;
          PALETA_DE = src; PALETA_LOGO = [];
          // Solo si sigue siendo el mismo logo: si llega tarde la medición de uno
          // anterior, se verían sus colores con el logo nuevo.
          paletaDeLogo(src).then((xs) => { if (PALETA_DE === src) { PALETA_LOGO = xs; vivo(); } });
        }
        zona('paleta').innerHTML = !S.logo ? '' : PALETA_LOGO.length
          ? `<p class="ui-hint" style="margin:0 0 .35rem">Medidos en el logo (toca uno para usarlo de acento):</p>
            <div class="ui-asis-sw">${PALETA_LOGO.map((h) => `<button type="button" data-hex="${h}" title="${h}" aria-label="Acento ${h}" class="${h === S.acento.toUpperCase() ? 'on' : ''}" style="background:${h}"></button>`).join('')}</div>`
          : '<p class="ui-hint" style="margin:0 0 .35rem">El logo no tiene colores de marca medibles (solo blanco, negro o gris).</p>';
      }
      if (zona('tonos')) {
        const m = MATERIAL_OFICIO[S.materialOficio];
        zona('tonos').textContent = m ? `El acento saldrá de ${lista(m.tonos)}, ajustado a su temperatura y lejos de los colores del portfolio.`
          : 'Si ninguno encaja, sáltalo: el acento saldrá solo de la temperatura (paso 4).';
      }
      if (zona('fotos')) {
        const xs = FOTOS_CLIENTE;
        zona('fotos').innerHTML = (xs.length
          ? `<p class="ui-hint">${xs.length} ${xs.length === 1 ? 'foto' : 'fotos'} · ${xs.filter((f) => f.w > f.h).length} horizontales</p>`
          : '<p class="ui-hint">Sin fotos: la muestra usa las de ejemplo. Doce es el mínimo para una web.</p>') +
          diagnosticoFotos().map(([t, x]) => aviso(t + ':', x)).join('');
      }
    },
    falta: () => (S.identidad === 'propia'
      ? [!S.logo && 'el logo', S.acento.toUpperCase() === '#6B737B' && 'su color de acento', !FOTOS_CLIENTE.length && 'sus fotos']
      : [!S.materialOficio && 'con qué material trabaja', !FOTOS_CLIENTE.length && 'sus fotos']),
    siFalta: 'Se puede seguir, pero las propuestas saldrán con piezas de repuesto.',
  },
  {
    id: 'contenido', n: 'Qué dice',
    para: 'El contenido, del protocolo y no de la IA: sale de las plantillas F4 (P7–P9) y F5 (P11–P12) del cliente en NotionPilot. Lo que quede vacío viaja al encargo como TODO (Pn): se pide, no se inventa.',
    pinta: () => `
      ${campoAsis('posicionamiento', 'P7 · Posicionamiento', { rows: 2 })}
      ${campoAsis('prueba', 'P8 · La prueba principal <em>— va en el subtítulo</em>')}
      ${campoAsis('busqueda', 'P11 · Búsqueda principal')}
      ${campoAsis('zona', 'P11 · Zona <em>— pueblos, separados por comas</em>')}
      ${campoAsis('listaServicios', 'Servicios <em>— uno por línea: nombre · qué incluye · desde X €</em>', { rows: 3 })}
      <div class="ui-field"><span>P12 · El canal que atiende DE VERDAD <em>— lo que no se marque no sale en la web</em></span>
        <div class="ui-chips ui-chips-sm">${Object.entries(CANALES).map(([k, n]) =>
          `<button type="button" data-canal="${k}" class="${canal(k) ? 'on' : ''}">${esc(n)}</button>`).join('')}</div></div>
      <details class="ui-asis-mas"><summary>El resto del protocolo <em>— voz, objeción, pasos, reseñas, cifras, contacto</em></summary>
        ${campoAsis('voz', 'P9 · Voz <em>— tres adjetivos</em>')}
        ${campoAsis('palabrasSi', 'P9 · Decimos')}
        ${campoAsis('palabrasNo', 'P9 · Nunca decimos')}
        ${campoAsis('objecion', 'P12 · La objeción principal')}
        ${campoAsis('respuestaObjecion', '…y cómo se responde <em>— con un hecho</em>')}
        ${campoAsis('pasos', 'P12 · Cómo funciona <em>— paso · qué pasa · plazo</em>', { rows: 3 })}
        ${campoAsis('listaResenas', 'Reseñas reales <em>— texto literal · dónde y cuándo</em>', { rows: 3 })}
        ${campoAsis('cifras', 'P8 · Cifras con prueba <em>— cifra · qué mide · de dónde sale</em>', { rows: 3 })}
        ${campoAsis('datosContacto', 'Datos de contacto <em>— tal como van en todas partes</em>', { rows: 3 })}
      </details>`,
    falta: () => [!S.posicionamiento && 'P7', !S.prueba && 'la prueba (P8)', !S.busqueda && 'la búsqueda (P11)', !canalesDecididos() && 'el canal (P12)'],
    siFalta: 'Se puede seguir: irá al encargo como TODO.',
  },
  {
    id: 'temperamento', n: 'Cómo es',
    para: 'Cuatro ejes que se leen del cliente —sus reseñas, su local, cómo habla—, no del sector: dos fontaneros pueden estar en extremos opuestos. De aquí salen la letra, el papel, el color y el aire de las propuestas.',
    pinta: () => {
      const QUE = {
        peso: 'La letra y los botones: contundente pide display de peso y botones rectos.',
        temperatura: 'El papel y el color: cálido tira de papeles crema y materiales cálidos.',
        memoria: 'Con oficio pide serif con historia; presente, una sans de hoy.',
        aire: 'El espacio: galería respira entre secciones; taller aprieta.',
      };
      return EJES.map(([id, n, a, b]) => `<div class="ui-asis-eje">
          <div class="ui-asis-eje-top"><b>${esc(n)}</b><output data-out="${id}">${esc(S.ejes[id])}</output></div>
          <input type="range" min="1" max="5" step="1" value="${esc(S.ejes[id])}" data-eje="${id}" aria-label="${esc(n)}: 1 ${esc(a)}, 5 ${esc(b)}">
          <div class="ui-asis-eje-ext"><span>${esc(a)}</span><span>${esc(b)}</span></div>
          <p class="ui-hint" style="margin-top:.2rem">${QUE[id] || ''}</p></div>`).join('') +
        '<p class="ui-asis-lectura" data-vivo="lectura"></p>';
    },
    vivo: (c) => { const z = c.querySelector('[data-vivo="lectura"]'); if (z) z.textContent = ($('#eje-lectura') || {}).textContent || ''; },
  },
  {
    id: 'direccion', n: 'Tres direcciones',
    para: 'Tres propuestas distintas entre sí, armadas con sus ejes, sus materiales y el registro del portfolio. Cada una dice por qué y cuánto firma según la rúbrica. Elige la que más se acerque: se afina en los pasos siguientes.',
    pinta: () => '<div class="ui-asis-props" data-props></div><div class="ui-asis-acc"><button type="button" class="ui-btn ui-btn-ghost" data-accion="otras">Otras tres</button></div>',
    tras: (c) => pintaPropuestas(c),
    falta: () => [!ELEGIDA && 'elegir una'],
    siFalta: 'Se puede seguir con lo que ya tiene la muestra.',
  },
  {
    id: 'firma', n: 'La firma',
    para: 'Lo que hace que se recuerde. La lección de Córdoba Soluciona: la forma de su logo, visible en la primera pantalla SIN mover nada, y repetida como estructura —cabecera, pie y al menos dos secciones—. Los efectos la refuerzan; no la sostienen.',
    pinta: () => `
      ${campoAsis('gesto', 'El gesto <em>— una idea que solo valga para ESTE cliente; búscala en sus reseñas</em>', { rows: 3, ph: 'Su logo es un arco califal: el titular vive dentro de un arco enorme y cada sección lo repite como sello.' })}
      ${S.logo ? '' : '<div class="ui-field"><span>Sin logo todavía <em>— una forma para probar la firma</em></span><div class="ui-ops" data-formas></div></div>'}
      <div class="ui-field"><span>Cómo vuelve la forma <em>— el juego de marca</em></span><div id="asis-juego"></div>
        <p class="ui-hint" data-vivo="aporta"></p></div>
      <div class="ui-field" data-escena-host><span>Sin juego, la firma va por la escenografía</span><div id="asis-escena"></div></div>
      ${casilla('marcaEnChrome', 'En la cabecera y el pie <em>— dos de los sitios que cuentan</em>')}
      <div data-vivo="medida"></div>`,
    tras: (c) => pintaFirma(c),
    vivo: (c) => {
      const a = c.querySelector('[data-vivo="aporta"]');
      if (a) a.textContent = (APORTA.marca || {})[S.marcaJuego] || (MARCAJUEGOS[S.marcaJuego] || {}).dice || '';
      const z = c.querySelector('[data-vivo="medida"]');
      if (z) z.innerHTML = [pruebaReposo(), pruebaRepeticion()].map(([p, m], i) =>
        `<div class="ui-asis-fila"><span class="ui-pts p${p}">${p}</span><div><b>${i ? 'Repetición' : 'Firma en reposo'}</b><p>${esc(m)}</p></div></div>`).join('');
    },
    falta: () => [!S.gesto && 'el gesto', pruebaReposo()[0] < 2 && 'firma en reposo', pruebaRepeticion()[0] < 2 && 'que se repita'],
    siFalta: 'Sin esto la web se entiende pero no se recuerda (Dígito: 6/14).',
  },
  {
    id: 'pagina', n: 'La página',
    para: 'La arquitectura: en qué orden se entiende el negocio. Parte del orden del protocolo (P12) y cada sección dice si ya tiene su contenido o irá con un TODO. Variantes, tonos y capas se afinan en el panel.',
    pinta: () => '<div data-secs></div>',
    tras: (c) => pintaPagina(c),
    falta: () => { const n = S.secciones.filter((s) => faltaEn(s).length).length; return [n && `el contenido de ${n} ${n === 1 ? 'sección' : 'secciones'}`]; },
    siFalta: 'Irán con TODO en el encargo.',
  },
  {
    id: 'revision', n: 'Revisión',
    para: 'Lo memorable, medido con la rúbrica de siete pruebas: Córdoba Soluciona saca 13 de 14; Dígito, 6. Cuatro las mide el Estudio; tres las respondes tú mirando la muestra —mejor aún, alguien que no la haya hecho—.',
    pinta: () => `<div data-vivo="total"></div><div data-vivo="filas"></div><div data-vivo="suelo"></div>
      <div class="ui-asis-acc"><button type="button" class="ui-btn ui-btn-primary" data-accion="encargo">Generar el encargo</button>
      <button type="button" class="ui-btn ui-btn-ghost" data-accion="panel">Afinar en el panel</button></div>`,
    vivo: (c) => pintaRevision(c),
    falta: () => { const t = totalRubrica(); return [t.pendientes && `responder ${t.pendientes} de juicio`]; },
    siFalta: 'Las que falten cuentan 0.',
  },
];

/* ── Paso 5: las tres direcciones ─────────────────────────────────────── */
function pintaPropuestas(c) {
  const host = c.querySelector('[data-props]');
  if (!host) return;
  const ps = propuestasAsis();
  if (!ps.length) {
    host.innerHTML = aviso('Ninguna combinación pasa el suelo de contraste con estos colores.', 'Revisa el acento y la tinta en el paso 2: con colores fijos, el motor no puede moverlos.', 'grave');
    return;
  }
  const graves = S.coloresFijos ? problemasContraste() : [];
  host.innerHTML = (graves.length ? aviso(`Sus colores no pasan ${graves.length === 1 ? 'un par' : graves.length + ' pares'} del suelo de contraste.`,
    'No se cambian porque son suyos: el encargo dirá dónde no usarlos. El detalle, en la revisión (paso 8).') : '') +
    ps.map((p, i) => `<article class="ui-asis-prop${p.id === ELEGIDA ? ' on' : ''}" data-prop="${i}">
      <div class="ui-asis-mini"><iframe tabindex="-1" title="Propuesta ${i + 1}: ${esc(p.nombre)}"></iframe></div>
      <div class="ui-asis-prop-txt">
        <b>${esc(p.nombre)}</b>
        <p>${esc(p.porque)}</p>
        <p class="ui-asis-nota">Firma medida: ${p.auto}/${p.maxAuto}${p.avisos ? ` · ${p.avisos} ${p.avisos === 1 ? 'aviso' : 'avisos'} de criterio` : ''}</p>
        <button type="button" class="ui-btn ${p.id === ELEGIDA ? 'ui-btn-primary' : 'ui-btn-ghost'}" data-elige="${i}">${p.id === ELEGIDA ? 'Elegida' : 'Elegir esta'}</button>
      </div></article>`).join('');
  host.querySelectorAll('iframe').forEach((f, i) => { f.srcdoc = documentoCon(ps[i].cambios); });
  escalaMinis();
}

/* ── Paso 6: la firma ─────────────────────────────────────────────────── */
function pintaFirma(c) {
  const juegos = Object.entries(MARCAJUEGOS).map(([k, v]) => [k, v.n, (APORTA.marca || {})[k] || v.dice]);
  opciones('#asis-juego', juegos, S.marcaJuego, (v) => {
    S.marcaJuego = v;
    ajustaCapasFirma();
    pintaFirma(c); render();
  }, { tipo: 'marca', cols: 2 });
  const hostE = c.querySelector('[data-escena-host]');
  if (hostE) {
    hostE.hidden = S.marcaJuego !== 'ninguno';
    opciones('#asis-escena', Object.entries(ESCENAS).map(([k, v]) => [k, v.n, (APORTA.escena || {})[k]]), S.escena, (v) => {
      S.escena = v;
      const hero = S.secciones.find((s) => s.t === 'hero');
      if (hero && v !== 'ninguna' && !hero.capas.includes('escena')) hero.capas.push('escena');
      pintaFirma(c); render();
    }, { tipo: 'escena' });
  }
  const hostF = c.querySelector('[data-formas]');
  if (hostF) {
    hostF.innerHTML = Object.entries(FORMAS_MARCA).map(([id, [n, d]]) =>
      `<button type="button" class="ui-op${S.marcaForma === id ? ' on' : ''}" data-forma="${id}" title="${esc(n)}">
        <span class="ui-op-vis" style="display:grid;place-items:center"><svg viewBox="0 0 96 96" width="30" height="30" aria-hidden="true"><path d="${d}" fill="var(--color-ink)"/></svg></span>
        <span class="ui-op-lbl">${esc(n)}</span></button>`).join('');
  }
}

/* ── Paso 7: la página ────────────────────────────────────────────────── */
function pintaPagina(c) {
  const host = c.querySelector('[data-secs]');
  if (!host) return;
  const tiene = (t) => S.secciones.some((s) => s.t === t);
  const sugeridas = [
    resenasCliente().length && !tiene('testimonio') && ['testimonio', `hay ${resenasCliente().length} reseñas`],
    FOTOS_CLIENTE.length >= 6 && !tiene('galeria') && ['galeria', `${FOTOS_CLIENTE.length} fotos suyas`],
    sitiosCliente().length >= 3 && !tiene('zona') && ['zona', `${sitiosCliente().length} pueblos`],
    cifrasCliente().length >= 3 && !tiene('datos') && !S.secciones.some((s) => s.t === 'banda' && s.v === 'datos') &&
      ['datos', `${cifrasCliente().length} cifras con prueba`],
    serviciosCliente().some(([, , p]) => p) && !tiene('precios') && ['precios', 'hay precios de partida'],
    S.objecion && !tiene('faq') && ['faq', 'hay una objeción que responder'],
  ].filter(Boolean);

  host.innerHTML = S.secciones.map((s, i) => {
    const def = SECCIONES[s.t] || {};
    const v = (def.variantes || []).find((x) => x.id === s.v) || {};
    const f = faltaEn(s);
    return `<div class="ui-asis-sec"><span class="ui-sec-n">${String(i + 1).padStart(2, '0')}</span>
      <span class="ui-asis-sec-n"><b>${esc(def.n || s.t)}</b><em>${esc(v.n || '')}${(s.capas || []).includes('marca') ? ' · con la firma' : ''}</em></span>
      <span class="ui-asis-est ${f.length ? 'todo' : 'ok'}">${f.length ? 'TODO: ' + esc(lista(f)) : '✓ con su contenido'}</span>
      <button type="button" data-quita="${i}" title="Quitar" aria-label="Quitar ${esc(def.n || s.t)}">✕</button></div>`;
  }).join('') +
    (sugeridas.length ? `<p class="ui-hint" style="margin-top:1rem">Con lo que ya trae el cliente, suman:</p>
      <div class="ui-sec-add">${sugeridas.map(([t, por]) => `<button type="button" data-add="${t}">+ ${esc((SECCIONES[t] || {}).n || t)} <em>(${esc(por)})</em></button>`).join('')}</div>` : '') +
    '<div class="ui-asis-acc"><button type="button" class="ui-btn ui-btn-ghost" data-accion="p12">Volver al orden P12</button></div>';
}

/* ── Paso 8: la revisión ──────────────────────────────────────────────── */
function pintaRevision(c) {
  const filas = evaluaRubrica();
  const t = totalRubrica(filas);
  const z = (k) => c.querySelector(`[data-vivo="${k}"]`);
  const pc = (x) => `${(x / t.max) * 100}%`;
  if (z('total')) z('total').innerHTML = `<div class="ui-asis-total"><b>${t.puntos}</b><span>/ ${t.max}${t.pendientes ? ` · faltan ${t.pendientes} de juicio` : ''}</span></div>
    <div class="ui-asis-barra"><i style="width:${pc(t.puntos)}"></i><b style="left:${pc(6)}">Dígito 6</b><b style="left:${pc(13)}">Córdoba 13</b></div>`;
  if (z('filas')) z('filas').innerHTML = filas.map((f) => (f.mide === 'auto'
    ? `<div class="ui-asis-fila"><span class="ui-pts p${f.puntos}">${f.puntos}</span><div><b>${esc(f.n)}</b><p>${esc(f.motivo)}</p>
        <p class="ui-asis-cal">Córdoba ${f.cordoba} · Dígito ${f.digito}</p></div></div>`
    : `<div class="ui-asis-fila"><span class="ui-asis-juicio">${[0, 1, 2].map((v) =>
        `<button type="button" data-juicio="${f.id}" data-v="${v}" class="${f.puntos === v ? 'on p' + v : ''}" aria-label="${esc(f.n)}: ${v}">${v}</button>`).join('')}</span>
        <div><b>${esc(f.n)}</b><p>${esc(f.pregunta)}</p><p class="ui-asis-cal">${esc(f.como)}</p></div></div>`)).join('');
  if (z('suelo')) {
    const graves = problemasContraste();
    z('suelo').innerHTML = graves.length
      ? graves.map(([a, b]) => aviso(a + ':', b, 'grave')).join('')
      : aviso('Contraste:', 'todos los pares medidos pasan el suelo.', 'ok');
  }
}

/* ── Navegación ───────────────────────────────────────────────────────── */
const pendiente = (p) => (p.falta ? p.falta() : []).filter(Boolean);

function pintaNav() {
  $('#asis-pasos').innerHTML = PASOS.map((p, i) => `<li><button type="button" data-paso="${i}"
    class="${i === PASO ? 'on' : ''}${VISTOS.has(i) && !pendiente(p).length ? ' hecho' : ''}"${i === PASO ? ' aria-current="step"' : ''}>
    <span>${i + 1}</span><em>${esc(p.n)}</em></button></li>`).join('');
}

function pintaPie() {
  const p = PASOS[PASO];
  const f = pendiente(p);
  $('#asis-falta').innerHTML = f.length
    ? `Falta ${esc(lista(f))}. ${p.obliga ? '' : esc(p.siFalta || '')}`
    : '<span class="ok">✓ Listo</span>';
  $('#asis-atras').disabled = PASO === 0;
  const sig = $('#asis-sigue');
  sig.disabled = !!(p.obliga && f.length);
  sig.textContent = PASO === PASOS.length - 1 ? 'Generar el encargo' : 'Siguiente';
}

function pintaPaso() {
  const p = PASOS[PASO];
  VISTOS.add(PASO);
  const c = $('#asis-cuerpo');
  c.innerHTML = `<header class="ui-asis-cab"><p class="ui-eyebrow">Paso ${PASO + 1} de ${PASOS.length}</p>
    <h2>${esc(p.n)}</h2><p class="ui-asis-para">${esc(p.para)}</p></header>${p.pinta()}`;
  c.scrollTop = 0;
  if (p.tras) p.tras(c);
  vivo();
  guardaModo({ paso: PASO });
}

/** Lo que se refresca en cada repintado del Estudio (se apunta en ALRENDER). */
function vivo() {
  if (!enAsistente()) return;
  const p = PASOS[PASO];
  if (p.vivo) p.vivo($('#asis-cuerpo'));
  pintaNav(); pintaPie();
}

function irA(i) {
  // El paso 1 decide cómo son los demás: sin él no se pasa.
  if (i > 0 && pendiente(PASOS[0]).length) i = 0;
  PASO = Math.max(0, Math.min(PASOS.length - 1, i));
  pintaPaso();
}

/* ── Modos ────────────────────────────────────────────────────────────── */
function refrescaPanel() { sincronizaCampos(); pintaControles(); pintaEjes(); pintaSecciones(); }

function modo(m) {
  const asis = m === 'asistente';
  document.body.classList.toggle('ui-modo-asistente', asis);
  const b = $('#modo');
  if (b) {
    b.textContent = asis ? 'Panel completo' : 'Asistente';
    b.title = asis ? 'Todas las opciones a la vista, para afinar' : 'Los ocho pasos, en orden';
  }
  if (asis) irA(PASO); else refrescaPanel();
  guardaModo({ modo: asis ? 'asistente' : 'panel' });
}

/** Cliente nuevo desde cero, con la arquitectura del protocolo (P12). */
function proyectoNuevo() {
  S = normaliza({});
  try { localStorage.removeItem(CLAVE); } catch { /* nada que borrar */ }
  // Ni las fotos ni el logo del anterior se quedan.
  quitaFotos(); firmaPrevia = null; ULTIMO_DIAG_LOGO = null;
  if ($('#logo-file')) $('#logo-file').value = '';
  if ($('#logo-diag')) $('#logo-diag').innerHTML = '';
  history.replaceState(null, '', location.pathname);
  const p12 = (COMPOSICIONES.p12 || {}).secciones;
  if (p12) S.secciones = normaliza({ ...S, secciones: JSON.parse(JSON.stringify(p12)) }).secciones;
  PROPUESTAS = []; HUELLA_PROP = ''; ELEGIDA = null; VUELTA = 0; VISTOS = new Set(); PASO = 0;
  PALETA_LOGO = []; PALETA_DE = '';
  // Sin esto, «Deshacer» de una sorpresa anterior devolvía al cliente de antes.
  SORPRESA = null;
  if ($('#sorpresa')) $('#sorpresa').hidden = true;
  refrescaPanel(); render();
  modo('asistente');
}

/* ¿Hay algo que se perdería con «Proyecto nuevo»? Antes solo miraba el nombre,
   y con el nombre por defecto borraba sin avisar un trabajo con colores,
   servicios, fotos y logo (revisión del 23-sep). */
function hayTrabajo() {
  const v = normaliza({});
  return (S.marca && S.marca !== MARCA_VACIA) || !!S.logo || FOTOS_CLIENTE.length > 0 ||
    S.acento !== v.acento || S.tinta !== v.tinta || !!S.papel || !!S.gesto || S.canales.length > 0 ||
    CAMPOS_CONTENIDO.some((k) => (S[k] || '').trim()) || JSON.stringify(S.ejes) !== JSON.stringify(v.ejes) ||
    S.display !== v.display || !!S.identidad;
}

function abreInicio() {
  const d = $('#inicio');
  if (!d || d.open) return;
  const hay = hayTrabajo();
  const quien = S.marca && S.marca !== MARCA_VACIA ? S.marca : 'lo que había';
  $('#inicio-seguir').hidden = !hay;
  $('#inicio-marca').textContent = quien;
  $('#inicio-nuevo-d').textContent = hay
    ? `Ocho pasos en orden. Borra ${quien === 'lo que había' ? 'el trabajo guardado' : 'lo de ' + quien} de este navegador (también fotos y logo): si lo quieres guardar, copia antes el enlace.`
    : 'Ocho pasos en orden: primero lo que trae el cliente, luego tres direcciones con su porqué, la firma y la revisión.';
  d.showModal();
}

/* ── Eventos: delegados, una vez ──────────────────────────────────────────
   El cuerpo del asistente se rehace a cada paso; escuchar en el contenedor
   evita volver a enganchar nada. */
function escribe(k, v) {
  S[k] = k === 'marca' ? (v || MARCA_VACIA) : v;
  if (SOLO_ENCARGO.includes(k)) { avisos(); guarda(); vivo(); } else render();
}

function enlazaAsistente() {
  const c = $('#asis-cuerpo');

  c.addEventListener('input', (e) => {
    const el = e.target;
    if (el.dataset.k) escribe(el.dataset.k, el.value);
    else if (el.dataset.eje) {
      S.ejes[el.dataset.eje] = +el.value;
      const o = c.querySelector(`[data-out="${el.dataset.eje}"]`);
      if (o) o.textContent = el.value;
      render();
    } else if (el.dataset.color) {
      S[el.dataset.color] = el.value.toUpperCase();
      render();
    }
  });

  c.addEventListener('change', (e) => {
    const el = e.target;
    if (el.dataset.bool) { S[el.dataset.bool] = el.checked; render(); }
  });

  c.addEventListener('click', (e) => {
    const b = e.target.closest('button');
    if (!b || !c.contains(b)) return;
    const d = b.dataset;
    if (d.set) {
      S[d.set] = d.set === 'materialOficio' && S[d.set] === d.v ? '' : d.v;
      // Con marca propia, sus colores y su letra son suyos hasta que se diga otra cosa.
      if (d.set === 'identidad') { S.coloresFijos = d.v === 'propia'; if (d.v === 'nueva') S.displayFija = false; }
      render(); pintaPaso();
    } else if (d.canal) {
      // La llamada final va por el canal real: sin formulario, directa (igual que aplicaComposicion).
      const i = S.canales.indexOf(d.canal);
      if (i === -1) S.canales.push(d.canal); else S.canales.splice(i, 1);
      if (canalesDecididos() && !canal('formulario')) S.secciones.forEach((s) => { if (s.t === 'contacto') s.v = 'directo'; });
      b.classList.toggle('on', canal(d.canal));
      render();
    } else if (d.hex) {
      S.acento = d.hex;
      const inp = c.querySelector('[data-color="acento"]');
      if (inp) inp.value = d.hex;
      render();
    } else if (d.elige !== undefined) {
      const p = PROPUESTAS[+d.elige];
      if (!p) return;
      aplicaPropuesta(p);
      ELEGIDA = p.id;
      c.querySelectorAll('[data-prop]').forEach((a, i) => {
        const on = PROPUESTAS[i] && PROPUESTAS[i].id === ELEGIDA;
        a.classList.toggle('on', on);
        const bt = a.querySelector('[data-elige]');
        bt.className = 'ui-btn ' + (on ? 'ui-btn-primary' : 'ui-btn-ghost');
        bt.textContent = on ? 'Elegida' : 'Elegir esta';
      });
      render();
    } else if (d.forma) {
      S.marcaForma = d.forma; render(); pintaFirma(c);
    } else if (d.quita !== undefined) {
      S.secciones.splice(+d.quita, 1); pintaSecciones(); render(); pintaPagina(c);
    } else if (d.add) {
      anadeSeccion(d.add);
      ajustaCapasFirma(); render(); pintaPagina(c);
    } else if (d.juicio) {
      S.juicio = { ...S.juicio, [d.juicio]: +d.v }; render();
    } else if (d.accion) {
      const a = d.accion;
      if (a === 'logo') $('#logo-file').click();
      else if (a === 'logo-quitar') { $('#logo-quitar').click(); PALETA_DE = ''; pintaPaso(); }
      else if (a === 'fotos') $('#fotos-file').click();
      else if (a === 'fotos-quitar') { $('#fotos-quitar').click(); pintaPaso(); }
      else if (a === 'otras') { VUELTA++; pintaPropuestas(c); }
      else if (a === 'p12') { aplicaComposicion('p12'); ajustaCapasFirma(); render(); pintaPagina(c); }
      else if (a === 'encargo') $('#ver-brief').click();
      else if (a === 'panel') modo('panel');
    }
  });

  /* Al volver del selector de ficheros cambian los botones del paso (Quitar,
     Cambiar): se rehace cuando el fichero ya está dentro. */
  ['#logo-file', '#fotos-file'].forEach((sel) => $(sel)?.addEventListener('change', () => {
    setTimeout(() => { if (enAsistente() && PASOS[PASO].id === 'materiales') pintaPaso(); }, 300);
  }));

  $('#asis-pasos').addEventListener('click', (e) => { const b = e.target.closest('[data-paso]'); if (b) irA(+b.dataset.paso); });
  $('#asis-atras').addEventListener('click', () => irA(PASO - 1));
  $('#asis-sigue').addEventListener('click', () => (PASO === PASOS.length - 1 ? $('#ver-brief').click() : irA(PASO + 1)));

  $('#modo')?.addEventListener('click', () => modo(enAsistente() ? 'panel' : 'asistente'));
  $('#nuevo')?.addEventListener('click', abreInicio);
  $('#inicio')?.addEventListener('click', (e) => {
    const b = e.target.closest('[data-inicio]');
    if (!b) return;
    $('#inicio').close();
    if (b.dataset.inicio === 'nuevo') proyectoNuevo();
    else if (b.dataset.inicio === 'seguir') modo(leeModo().modo === 'panel' ? 'panel' : 'asistente');
    else modo('panel');
  });
  window.addEventListener('resize', escalaMinis);
}

/**
 * Arranque del asistente. Un enlace compartido abre el panel sin preguntar
 * —quien lo recibe viene a mirar esa composición—; si no, se pregunta qué
 * hacer: proyecto nuevo, seguir o el panel de siempre.
 */
function iniciaAsistente(origen) {
  ALRENDER.push(vivo);
  enlazaAsistente();
  // El diagnóstico del logo no se guardaba: tras recargar, el motor no sabía si servía como forma.
  if (S.logo) diagnosticaLogo(S.logo.src, S.logo.tipo).then(pintaDiagnostico).catch(() => {});
  const m = leeModo();
  PASO = Number.isInteger(m.paso) ? m.paso : 0;
  if (origen === 'enlace') { modo('panel'); return; }
  modo(m.modo === 'asistente' ? 'asistente' : 'panel');
  abreInicio();
}
