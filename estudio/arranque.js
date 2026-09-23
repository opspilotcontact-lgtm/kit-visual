/* Estudio de marca · arranque.js
   El arranque: enlaza la interfaz y carga el catálogo. Lo último que se carga.
   Script clásico: comparte el ámbito global con los demás ficheros del
   Estudio y se carga en el orden de index.html. */
'use strict';

/* ── Arranque ─────────────────────────────────────────────────────────────── */
function enlaza() {
  $('#marca').addEventListener('input', (e) => { S.marca = e.target.value || 'Nombre del cliente'; render(); });
  $('#oficio').addEventListener('input', (e) => { S.oficio = e.target.value; render(); });
  $('#gesto').addEventListener('input', (e) => { S.gesto = e.target.value; avisos(); guarda(); });
  CAMPOS_CONTENIDO.forEach((k) => $('#' + k)?.addEventListener('input', (e) => {
    S[k] = e.target.value;
    if (SOLO_ENCARGO.includes(k)) { avisos(); guarda(); } else render();
  }));
  $('#acento').addEventListener('input', (e) => { S.acento = e.target.value; render(); });
  $('#tinta').addEventListener('input', (e) => { S.tinta = e.target.value; render(); });
  $('#papel')?.addEventListener('input', (e) => {
    if (!$('#papel-propio').checked) $('#papel-propio').checked = true;   // tocar el color ES pedir papel propio
    S.papel = e.target.value; render();
  });
  $('#papel-propio')?.addEventListener('change', (e) => { S.papel = e.target.checked ? $('#papel').value : ''; pintaControles(); render(); });
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

  document.querySelectorAll('[data-bajar]').forEach((b) => b.addEventListener('click', () => {
    descarga(b.dataset.bajar);
    $('#copiado').textContent = `Descargado ${FICHEROS[b.dataset.bajar].n()}`;
    setTimeout(() => { $('#copiado').textContent = ''; }, 2600);
  }));

  $('#enlace').addEventListener('click', async () => {
    const u = enlaceDeEstado();
    try { await navigator.clipboard.writeText(u); $('#enlace').textContent = 'Enlace copiado'; }
    catch { $('#enlace').textContent = 'Copia la barra de direcciones'; }
    setTimeout(() => { $('#enlace').textContent = 'Copiar enlace'; }, 2200);
  });

  // «Empezar de cero» es ahora «Proyecto nuevo»: lo lleva asistente.js
  // (proyectoNuevo), que además arranca con la arquitectura de P12.

  $('#dados').addEventListener('click', azar);

  enlazaLogo();
  enlazaFotos();
  $('#marca-chrome')?.addEventListener('change', (e) => { S.marcaEnChrome = e.target.checked; render(); });

  /* Pantalla completa de la muestra. En un móvil no caben el panel y la
     previsualización a la vez: por mucho que se reparta, ninguno queda usable.
     Se elige una cosa y se ve entera. */
  $('#pantalla')?.addEventListener('click', () => {
    const on = document.body.classList.toggle('ui-solo-muestra');
    $('#pantalla').textContent = on ? 'Ajustes' : 'Ver entero';
    $('#pantalla').setAttribute('aria-pressed', String(on));
  });
}

/* Arranque. Todo espera al manifiesto: sin catálogo no hay nada que pintar. */
Promise.all([cargaManifiesto(), cargaMarcas(), cargaFuentes(), recuperaFotos()]).then(() => {
  const origen = recupera();
  chips('#recetas', Object.entries(RECETAS).map(([k, v]) => [k, v.n, v.d]), null, aplicaReceta);
  chips('#composiciones', [['defecto', 'La de siempre', 'Portada, servicios, trabajos, reseña y cierre'],
    ...Object.entries(COMPOSICIONES).map(([k, c]) => [k, c.n, c.dice])], null, aplicaComposicion);
  pintaControles();
  pintaEjes();
  pintaSecciones();
  enlaza();
  sincronizaCampos();
  render();
  iniciaAsistente(origen);
}).catch((e) => {
  document.querySelector('#avisos').innerHTML =
    `<div class="ui-aviso"><span>⚠</span><span><b>No se pudo cargar el catálogo:</b> ${e.message}.
     El manifiesto se copia al publicar; en local hay que servir la carpeta con un servidor HTTP,
     no abrir el fichero directamente.</span></div>`;
  console.error(e);
});
