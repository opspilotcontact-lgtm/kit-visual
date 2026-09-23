# Iconos

40 iconos de **Lucide 1.47.0** (`lucide-static`), licencia **ISC**. Los que
vienen de Feather (calendar, check, clock, key, arrow-right) llevan además la
MIT de Feather. Las dos están en `LICENSE`, que **viaja con los iconos**: es la
única condición de la licencia (que el aviso acompañe a las copias). Cada SVG
trae además su comentario `@license` en la primera línea: no se borra.

Bajados el 23-sep-2026 con `curl` desde
`https://cdn.jsdelivr.net/npm/lucide-static@1.47.0/icons/<nombre>.svg` y
revisados al llegar: ninguno lleva `<script>`, atributos `on…`, enlaces ni
`url()`. Unos 0,5 KB cada uno, 20 KB los 40.

## Cómo se usan

- **En línea** (`<svg>` dentro del HTML), no como `<img>`: van con
  `stroke="currentColor"` y así toman el color del texto que los rodea, o sea
  la paleta de cada cliente sin tocar el fichero.
- Tamaño con `width`/`height` o CSS (1.25em junto a texto). El trazo es 2 a
  24 px; a tamaños grandes, `stroke-width="1.5"` queda menos pesado.
- **Para leer, no para adornar**: un icono junto a un servicio, al teléfono o a
  la dirección ayuda a encontrar; una fila de iconos decorativos es plantilla.
  Si el icono no dice nada que el texto no diga, sobra. Con `aria-hidden="true"`
  cuando el texto de al lado ya lo explica.

## Los 40, por uso

| Uso | Iconos |
|---|---|
| Oficios y obra | hammer · wrench · paintbrush · paint-roller · drill · ruler · hard-hat · key |
| Sitio y negocio | house · building-2 · store · utensils · coffee · truck · car |
| Cuerpo y cuidado | scissors · dumbbell · heart-pulse · baby · flower-2 · leaf |
| Casa y energía | sun · droplets · zap · lightbulb |
| Contacto | phone · message-circle · map-pin · clock · calendar |
| Confianza | shield-check · badge-check · star · quote · users · check |
| Documentos y precio | camera · file-text · euro · arrow-right |

La lista vive también en `kit.manifest.json` (`iconos.lista`): el encargo se la
da a quien maqueta y `build/verificar.mjs` para la publicación si falta un
fichero. Para añadir uno: bajarlo de la misma URL con la misma versión, meterlo
aquí y en la lista del manifiesto.

**Los ficheros viven aquí.** `kit-visual/publicar.sh` los copia a
`kit-visual/iconos/` al publicar: no se copian a mano.
