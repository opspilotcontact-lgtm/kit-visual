# Guía visual · @opspilot/kit

Catálogo vivo de lo que se puede hacer con el kit de front: **fondos, escenografía,
tratamientos de foto, letras, módulos de información y tipografías**, cada uno
funcionando de verdad y con el código al lado.

👉 **https://opspilotcontact-lgtm.github.io/kit-visual/**

Sirve para no empezar cada web nueva delante de un catálogo sin saber qué casa con
qué: se elige el fondo, el tratamiento de foto y la tipografía, y esa web ya no se
parece a la anterior.

---

## Qué hay dentro

| Sección | Contenido |
|---|---|
| 01 · Fondos | 13 opciones. 4 con JavaScript (curvas de nivel, campo de flujo, rejilla deformable, mesh WebGL) y 9 en CSS puro |
| 02 · Foto y fondo | `ink`: la foto pasada a tinta (semitono, grabado, umbral) para que el fondo se vea *a través* |
| 03 · Formas | 8 recortes para sacar la foto del rectángulo |
| 04 · El cambio | Comparador antes/después sin librería |
| 05 · El puntero | Rastro de fotos: una galería sin galería |
| 06-10 | Fotos, tipografía, puntero, scroll y texto |
| 11 · Escenografía | Color plano **con forma**: bloques recortados que estructuran la sección |
| 12 · Desplegar información | Acordeón con cara y panel de detalle sobre `<dialog>` |
| 13 · Letras | Letras-agujero, titular que pisa la foto, marca de agua, trama |
| 14 · Módulos de texto | Contra el muro gris: cita, destacado, nota de taller |
| 15 · La librería | Las 18 tipografías, con su «para qué» |
| 16 · Más formas | Pestañas, nota emergente, carril y cronología — **sin una línea de JavaScript** |

## Antes de usarlo

El catálogo es la caja de herramientas, no el criterio. El criterio está en el kit:

1. **`ASSETS.md`** — qué material hay que reunir antes de maquetar. Va primero,
   porque diseñar sin materiales es decorar un hueco.
2. **`direccion-arte-web`** (skill) — cómo se decide tipografía, color, fondo,
   foto y movimiento leyendo al cliente.
3. **`RECETAS.md`** — seis mundos ya combinados, cada uno con su «no la uses si».

Y la regla que más importa: **si la web se parece a la última que hiciste, está mal
aunque esté bien hecha.**

## Aviso

Los textos, precios y fotografías son **material de ejemplo** procedente de un
proyecto real (Dígito Rotulación). No son tarifas vigentes ni información
comercial. La página va con `noindex`.

## Cómo se regenera

Esta carpeta es una copia estática de la página `/fx/` del proyecto
`Digitorotulacion/web`, con las rutas absolutas reescritas a relativas para poder
servirse desde una subcarpeta de GitHub Pages. Se regenera reconstruyendo ese
proyecto y volviendo a ejecutar el script de empaquetado.
