/* Estudio de marca · estado.js
   El estado de la composición y el contenido del cliente.
   Script clásico: comparte el ámbito global con los demás ficheros del
   Estudio y se carga en el orden de index.html. */
'use strict';

/* ── Estado ───────────────────────────────────────────────────────────────── */
const inicial = () => ({
  marca: 'Nombre del cliente', oficio: '',
  /* La marca aplicada. `logo` es null o {src (data URL), w, h, tipo, bytes}.
     Vive en localStorage pero NO en el enlace compartible: un data URL de
     200 KB dentro del hash hace una URL que ningún sitio acepta pegar. */
  logo: null, marcaForma: 'arco', marcaEnChrome: true, marcaJuego: 'ninguno',
  ejes: { peso: 3, temperatura: 3, memoria: 3, aire: 3 },
  /* Punto de partida NEUTRO. Antes arrancaba con Archivo y #FEFE00 —la marca de
     Dígito—: cuatro avisos de clon antes de tocar nada, y quien no los leyera
     partía de la web de otro. El acento es un gris a propósito: no tiene tono
     que comparar y deja claro que el color todavía no se ha decidido — sale de
     la marca del cliente (ASSETS.md), no de aquí. */
  display: 'Epilogue', texto: 'Instrument Sans', ancho: false,
  acento: '#6B737B', tinta: '#15181B', base: 'papelFrio',
  papel: '',   // vacío = el de la base; un hex = el papel propio del cliente
  fondo: 'ninguno', escena: 'ninguna', foto: 'limpia', forma: 'redondo',
  pieza: 'ninguna', pos: 'cd', tam: 'm', relleno: 'solido',
  header: 'barra', boton: 'pildora', titular: 'normal', footer: 'completo',
  modulos: ['disclosure', 'pull'], movimiento: ['reveal'],
  gesto: '',
  /* El CONTENIDO, del protocolo OpsPilot (plantillas F4 y F5 del cliente en
     NotionPilot). El Estudio decidía cómo se ve y callaba qué dice: el encargo
     salía con un TODO por sección y quien maquetaba lo rellenaba con tópicos.
     Lo que quede vacío aquí viaja como TODO con la P que lo rellena — nunca
     se inventa. */
  np: '',               // proyecto o documento del cliente en NotionPilot
  posicionamiento: '',  // P7
  prueba: '',           // P8 · la prueba principal, va en el subtítulo
  busqueda: '',         // P11 · la búsqueda principal
  zona: '',             // P11 · los pueblos, por su nombre
  voz: '',              // P9 · tres adjetivos
  palabrasSi: '',       // P9
  palabrasNo: '',       // P9
  objecion: '',         // P12 · la objeción principal que responde la portada
  respuestaObjecion: '',// P12 · cómo se responde, con un hecho (la prueba ciega la echó en falta)
  pasos: '',            // P12 · cómo funciona, uno por línea: paso · qué pasa · plazo
  listaServicios: '',   // P12 · uno por línea: nombre · qué incluye · desde X €
  listaResenas: '',     // P8 · una por línea: texto literal · dónde y cuándo
  cifras: '',           // P8 · una por línea: cifra · qué mide · de dónde sale la prueba
  datosContacto: '',    // P21/ASSETS · WhatsApp, horario, a dónde llega el formulario y quién lo atiende
  canales: [],          // P12 · el canal que el cliente usa DE VERDAD
  /* La ARQUITECTURA de la página, no solo su estilo. Antes el lienzo tenía tres
     secciones escritas a mano y se elegía cómo se veían pero no cuáles eran.
     Se rellena desde el manifiesto al arrancar. */
  secciones: [],
});

/* Los canales posibles. Lo que no esté marcado NO se pone en la web: un
   teléfono que nadie coge es peor que no tener teléfono (Córdoba Soluciona
   quitó todos los tel: por eso). */
const CANALES = {
  whatsapp: 'WhatsApp',
  formulario: 'Formulario',
  telefono: 'Teléfono',
  correo: 'Correo',
};

/* ── El contenido del cliente, leído de los campos ─────────────────────────
   Una línea por elemento y las partes separadas por « · », « | » o « — ».
   Si no hay nada, el lienzo usa el ejemplo y el encargo deja el TODO. */
const lineas = (t) => String(t || '').split('\n').map((x) => x.trim()).filter(Boolean);
const trozos = (l) => l.split(/\s+[·|—–]\s+/).map((x) => x.trim());
const serviciosCliente = () => lineas(S.listaServicios).map((l) => {
  const [t, d = '', p = ''] = trozos(l);
  return [t, d, p];
});
const resenasCliente = () => lineas(S.listaResenas).map((l) => {
  const [t, f = ''] = trozos(l);
  return [t, f];
});
const sitiosCliente = () => String(S.zona || '').split(/[,;·\n]/).map((x) => x.trim()).filter(Boolean);
const cifrasCliente = () => lineas(S.cifras).map((l) => {
  const [v, q = '', p = ''] = trozos(l);
  return [v, q, p];
});
const pasosCliente = () => lineas(S.pasos).map((l) => {
  const [t, d = '', p = ''] = trozos(l);
  return [t, d, p];
});
const canal = (c) => (S.canales || []).includes(c);
/** Sin canales marcados todavía no se ha decidido: el lienzo enseña el ejemplo. */
const canalesDecididos = () => (S.canales || []).length > 0;
let S = inicial();

