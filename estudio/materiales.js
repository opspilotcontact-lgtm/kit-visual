/* Estudio de marca · materiales.js
   Los materiales del cliente: logo y fotos, con su diagnóstico.
   Script clásico: comparte el ámbito global con los demás ficheros del
   Estudio y se carga en el orden de index.html. */
'use strict';

/* ── El logo: subirlo y saber si sirve ────────────────────────────────────
   Esto es más que un selector de fichero. La mitad de los logos que manda un
   cliente NO se pueden reutilizar como forma —vienen con fondo blanco, o son
   un JPG, o tienen ocho colores— y eso se descubre tarde, cuando ya montaste
   media web alrededor de la idea. Aquí se dice al subirlo. */

const LIMITE_LOGO = 400 * 1024;   // 400 KB: por encima no es un logo, es una foto

/* El último diagnóstico del logo: lo usa el motor de propuestas para saber si
   el logo sirve como forma (si no, la firma va por la escenografía). */
let ULTIMO_DIAG_LOGO = null;

/**
 * Los colores del logo, medidos: se pinta a 64 px, se agrupan los píxeles
 * opacos por tono (a 5 bits por canal) y se quitan los casi blancos, los casi
 * negros y los grises (croma < 0,03), que no son color de marca. Devuelve hasta
 * cuatro, del más al menos presente. ASSETS.md: el color «del logo» suele venir
 * mal medido de un JPG; esto es un punto de partida, no el Pantone.
 */
async function paletaDeLogo(src) {
  try {
    const img = await new Promise((ok, no) => { const i = new Image(); i.onload = () => ok(i); i.onerror = no; i.src = src; });
    const n = 64;
    const c = Object.assign(document.createElement('canvas'), { width: n, height: n });
    const cx = c.getContext('2d', { willReadFrequently: true });
    cx.drawImage(img, 0, 0, n, n);
    const px = cx.getImageData(0, 0, n, n).data;
    const cubos = new Map();
    for (let i = 0; i < px.length; i += 4) {
      if (px[i + 3] < 200) continue;
      const k = `${px[i] >> 3},${px[i + 1] >> 3},${px[i + 2] >> 3}`;
      const b = cubos.get(k) || { n: 0, r: 0, g: 0, b: 0 };
      b.n++; b.r += px[i]; b.g += px[i + 1]; b.b += px[i + 2];
      cubos.set(k, b);
    }
    const hex = (b) => '#' + [b.r / b.n, b.g / b.n, b.b / b.n].map((v) => Math.round(v).toString(16).padStart(2, '0')).join('').toUpperCase();
    const colores = [...cubos.values()].sort((a, b) => b.n - a.n).map(hex).filter((h) => {
      const o = oklch(h);
      return o.L > 0.15 && o.L < 0.93 && o.C >= 0.03;
    });
    // Sin repetir casi el mismo color: a menos de 0,06 en Oklab es el mismo.
    const unicos = [];
    for (const h of colores) if (!unicos.some((u) => deltaE(u, h) < 0.06)) unicos.push(h);
    return unicos.slice(0, 4);
  } catch { return []; }
}

/** Mira el logo y dice qué se puede hacer con él. Sin opinar: mirando píxeles. */
async function diagnosticaLogo(src, tipo) {
  const d = { transparente: null, colores: null, avisos: [] };

  if (tipo === 'image/svg+xml') {
    // En un SVG lo que descalifica es un fondo a sangre: un rect que cubra
    // todo el viewBox. Y los colores se cuentan por los atributos de pintura.
    const texto = decodeURIComponent(escape(atob(src.split(',')[1] || '')));
    const pinturas = new Set([...texto.matchAll(/(?:fill|stroke)="(#[0-9a-fA-F]{3,8}|[a-z]+)"/g)]
      .map((m) => m[1].toLowerCase()).filter((c) => c !== 'none'));
    d.colores = pinturas.size;
    if (/<rect[^>]*width="(100%|\d{2,})"[^>]*height="(100%|\d{2,})"/.test(texto))
      d.avisos.push(['Puede llevar fondo a sangre', 'hay un rectángulo que cubre todo el lienzo. Si es un fondo, la máscara sale cuadrada y los juegos de forma no valen.']);
    d.transparente = !/<rect[^>]*width="100%"/.test(texto);
  } else {
    // En un mapa de bits: se pinta en un canvas y se miran los píxeles.
    const img = await new Promise((ok, no) => { const i = new Image(); i.onload = () => ok(i); i.onerror = no; i.src = src; });
    const n = 64;
    const c = Object.assign(document.createElement('canvas'), { width: n, height: n });
    const cx = c.getContext('2d', { willReadFrequently: true });
    cx.drawImage(img, 0, 0, n, n);
    const px = cx.getImageData(0, 0, n, n).data;
    let opacos = 0; const tonos = new Set();
    for (let i = 0; i < px.length; i += 4) {
      if (px[i + 3] > 200) { opacos++; tonos.add(`${px[i] >> 4},${px[i + 1] >> 4},${px[i + 2] >> 4}`); }
    }
    const cobertura = opacos / (n * n);
    d.transparente = cobertura < 0.92;
    d.colores = tonos.size;
    if (!d.transparente) d.avisos.push(['Sin transparencia', 'el logo cubre todo el rectángulo, así que trae fondo. Para usarlo como forma hace falta un PNG o un SVG recortado.']);
    if (tonos.size > 24) d.avisos.push(['Demasiados colores', `se han contado ${tonos.size} tonos. Un logo con degradados o fotografía dentro no se puede recolorear para el pie oscuro.`]);
  }
  return d;
}

function pintaDiagnostico(d) {
  ULTIMO_DIAG_LOGO = S.logo ? d : null;
  /* Si es a color, va como imagen en cabecera y pie (lienzo.js, logoAColor).
     En un SVG, dos pinturas ya son dos colores; en un mapa de bits el suavizado
     de los bordes suma tonos, así que el umbral es más alto. Se guarda EN el
     logo para que viaje al encargo sin volver a diagnosticar. */
  if (S.logo && d && Number.isFinite(d.colores)) {
    const aColor = d.colores > (S.logo.tipo === 'image/svg+xml' ? 1 : 3);
    if (S.logo.aColor !== aColor) { S.logo.aColor = aColor; firmaPrevia = null; render(); }
  }
  // El diagnóstico llega DESPUÉS del repintado (es asíncrono): se avisa otra vez.
  ALRENDER.forEach((f) => { try { f(); } catch (e) { console.error(e); } });
  const host = $('#logo-diag');
  if (!host) return;
  if (!S.logo) { host.innerHTML = ''; return; }
  const filas = [
    `${S.logo.w}×${S.logo.h} px · ${(S.logo.bytes / 1024).toFixed(0)} KB · ${S.logo.tipo.replace('image/', '')}`,
    d.colores != null ? `${d.colores} ${d.colores === 1 ? 'color' : 'colores'}` : null,
    d.transparente === true ? '✓ recortado, sirve como forma' : d.transparente === false ? '✕ sin transparencia' : null,
  ].filter(Boolean);
  host.innerHTML = `<p class="ui-hint" style="margin:.5rem 0 0">${filas.join(' · ')}</p>` +
    (d.avisos || []).map(([t, x]) => `<div class="ui-aviso" style="margin-top:.45rem"><span>⚠</span><span><b>${esc(t)}:</b> ${esc(x)}</span></div>`).join('');
}

/* ── Las fotos del cliente: subirlas y saber si sirven ─────────────────────
   Las reglas son las de ASSETS.md, medidas y no opinadas: cuántas hay (12 es
   el mínimo para una web), cuántas no llegan a 1600 px (no valen a pantalla
   completa), si hay horizontales para las cabeceras y si las luces son tan
   distintas que piden fx-tint, que es lo que más rinde de todo el kit. */

let fotosNoCaben = false;

/** Reduce la foto para el lienzo y mide su luminosidad media. */
async function preparaFoto(file) {
  const src = await new Promise((ok, no) => { const r = new FileReader(); r.onload = () => ok(r.result); r.onerror = no; r.readAsDataURL(file); });
  const img = await new Promise((ok, no) => { const i = new Image(); i.onload = () => ok(i); i.onerror = no; i.src = src; });
  const w = img.naturalWidth, h = img.naturalHeight;
  const k = Math.min(1, LADO_LIENZO / Math.max(w, h));
  const c = Object.assign(document.createElement('canvas'), { width: Math.round(w * k), height: Math.round(h * k) });
  c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
  // Luminosidad media sobre una miniatura de 32 px: basta para comparar luces.
  const m = Object.assign(document.createElement('canvas'), { width: 32, height: 32 });
  const mx = m.getContext('2d', { willReadFrequently: true });
  mx.drawImage(img, 0, 0, 32, 32);
  const px = mx.getImageData(0, 0, 32, 32).data;
  let suma = 0;
  for (let i = 0; i < px.length; i += 4) suma += (0.2126 * px[i] + 0.7152 * px[i + 1] + 0.0722 * px[i + 2]) / 255;
  return { datos: c.toDataURL('image/jpeg', 0.82), w, h, n: file.name, b: file.size, luz: suma / (px.length / 4) };
}

const aURL = async (datos) => URL.createObjectURL(await (await fetch(datos)).blob());

function guardaFotos() {
  try {
    localStorage.setItem(CLAVE_FOTOS, JSON.stringify(FOTOS_CLIENTE.map(({ url, ...f }) => f)));
    return true;
  } catch { return false; }
}

async function recuperaFotos() {
  try {
    const xs = JSON.parse(localStorage.getItem(CLAVE_FOTOS) || '[]');
    FOTOS_CLIENTE = await Promise.all(xs
      .filter((f) => f && typeof f.datos === 'string' && f.datos.startsWith('data:image/'))
      .map(async (f) => ({ ...f, url: await aURL(f.datos) })));
  } catch { FOTOS_CLIENTE = []; }
}

/** Lo que dice ASSETS.md de estas fotos, con números. */
function diagnosticoFotos() {
  const xs = FOTOS_CLIENTE;
  if (!xs.length) return [];
  const a = [];
  const pequenas = xs.filter((f) => f.w < 1600).length;
  const horizontales = xs.filter((f) => f.w > f.h).length;
  const luces = xs.map((f) => f.luz).filter((l) => typeof l === 'number');
  if (xs.length < 12) a.push(['Pocas fotos', `${xs.length} de las 12 mínimas. Por debajo, la web se nota vacía: úsalas GRANDES y pide el resto con el guion de ASSETS.md.`]);
  if (pequenas) a.push([`${pequenas} por debajo de 1600 px`, 'no valen a pantalla completa. Pídelas como ARCHIVO, no por chat: el chat las comprime.']);
  if (!horizontales) a.push(['Ninguna horizontal', 'las cabeceras necesitan fotos apaisadas. Pídelas en horizontal y sin zoom.']);
  if (luces.length > 1 && Math.max(...luces) - Math.min(...luces) > 0.25 && !['tint', 'duotono', 'ink'].includes(S.foto))
    a.push(['Luces muy distintas', `la luminosidad media va del ${Math.round(Math.min(...luces) * 100)} % al ${Math.round(Math.max(...luces) * 100)} %. Con el tratamiento «Tinte» (fx-tint) se leen como una serie.`]);
  return a;
}

function pintaFotos() {
  const host = $('#fotos-diag');
  if (!host) return;
  const xs = FOTOS_CLIENTE;
  const resumen = xs.length
    ? `${xs.length} ${xs.length === 1 ? 'foto' : 'fotos'} · ${xs.filter((f) => f.w > f.h).length} horizontales · la mayor de ${Math.max(...xs.map((f) => f.w))} px de ancho`
    : 'Sin fotos del cliente: el lienzo usa fotos de ejemplo (rótulos de Dígito).';
  host.innerHTML = `<p class="ui-hint" style="margin:.5rem 0 0">${resumen}</p>` +
    (fotosNoCaben ? '<div class="ui-aviso" style="margin-top:.45rem"><span>⚠</span><span><b>No caben en el navegador:</b> se ven ahora, pero al recargar habrá que subirlas otra vez.</span></div>' : '') +
    diagnosticoFotos().map(([t, x]) =>
      `<div class="ui-aviso" style="margin-top:.45rem"><span>⚠</span><span><b>${esc(t)}:</b> ${esc(x)}</span></div>`).join('');
}

function quitaFotos() {
  FOTOS_CLIENTE.forEach((f) => URL.revokeObjectURL(f.url));
  FOTOS_CLIENTE = [];
  fotosNoCaben = false;
  try { localStorage.removeItem(CLAVE_FOTOS); } catch { /* nada que borrar */ }
}

function enlazaFotos() {
  const inp = $('#fotos-file');
  if (!inp) return;
  inp.addEventListener('change', async () => {
    const files = [...(inp.files || [])].filter((f) => /^image\//.test(f.type))
      .slice(0, Math.max(0, MAX_FOTOS - FOTOS_CLIENTE.length));
    inp.value = '';
    if (!files.length) return;
    for (const f of files) {
      try { const p = await preparaFoto(f); FOTOS_CLIENTE.push({ ...p, url: await aURL(p.datos) }); }
      catch { /* una foto ilegible no para las demás */ }
    }
    fotosNoCaben = !guardaFotos();
    firmaPrevia = null;   // las fotos no viven en S: se fuerza a repintar el lienzo
    render();
  });
  $('#fotos-quitar')?.addEventListener('click', () => { quitaFotos(); firmaPrevia = null; render(); });
}

function enlazaLogo() {
  const inp = $('#logo-file');
  if (!inp) return;
  inp.addEventListener('change', async () => {
    const f = inp.files && inp.files[0];
    if (!f) return;
    if (f.size > LIMITE_LOGO) {
      $('#logo-diag').innerHTML = `<div class="ui-aviso grave"><span>✕</span><span><b>Pesa ${(f.size / 1024).toFixed(0)} KB:</b> el límite son ${LIMITE_LOGO / 1024} KB. Un logo que pesa esto es una imagen exportada, no un logo. Pedí el SVG.</span></div>`;
      inp.value = '';
      return;
    }
    const src = await new Promise((ok) => { const r = new FileReader(); r.onload = () => ok(r.result); r.readAsDataURL(f); });
    const img = await new Promise((ok, no) => { const i = new Image(); i.onload = () => ok(i); i.onerror = no; i.src = src; })
      .catch(() => null);
    if (!img) { $('#logo-diag').innerHTML = `<div class="ui-aviso grave"><span>✕</span><span>No se ha podido leer el fichero como imagen.</span></div>`; return; }

    S.logo = { src, tipo: f.type || 'image/png', w: img.naturalWidth || 96, h: img.naturalHeight || 96, bytes: f.size };
    S.marcaEnChrome = true;
    pintaControles(); render();
    pintaDiagnostico(await diagnosticaLogo(src, f.type));
  });

  $('#logo-quitar')?.addEventListener('click', () => {
    S.logo = null;
    $('#logo-file').value = '';
    $('#logo-diag').innerHTML = '';
    pintaControles(); render();
  });
}

