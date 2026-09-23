#!/usr/bin/env bash
# Publica la guía y el estudio.
#
# Hace TODO el circuito para que nadie tenga que acordarse del orden:
# regenera la lista de utilidades desde el kit, compila el CSS completo,
# verifica que el manifiesto y el kit no se hayan separado, copia el
# manifiesto y versiona los assets por hash.
#
# El versionado no es un detalle: GitHub Pages responde con
# Cache-Control: max-age=600, así que sin él publicas y sigues viendo lo de
# antes durante diez minutos. Es el fallo que más tiempo cuesta diagnosticar,
# porque el repo está bien y la web no.
set -e
cd "$(dirname "$0")"

KIT=../opspilot-kit

# 1) La lista de utilidades se GENERA desde el CSS del kit, no se mantiene
echo "› generando build/completo.css desde el kit"
node "$KIT/build/generar-completo.mjs"

# 2) Compilar el kit entero para las herramientas internas
echo "› compilando kit-completo.css"
npx --yes @tailwindcss/cli@4 -i "$KIT/build/completo.css" -o _astro/kit-completo.css --minify

# 2b) Las fuentes. El kit declara url(/fonts/...), que es lo correcto DENTRO de
# un proyecto: ahí /fonts/ es la raíz del sitio. En Pages la raíz es
# /kit-visual/, así que /fonts/ daba 404 y las tipografías caían a la del
# sistema —en el lienzo Y en las miniaturas— sin ningún error a la vista.
# Medido el 23-sep: 18 de 18 familias en error. Se reescribe relativo al CSS
# (../fonts/), que funciona aquí y en cualquier web que ponga el CSS en /css/ y
# las fuentes en /fonts/, que es justo lo que pide la vía B del encargo.
echo "› rutas de fuentes relativas al CSS"
node -e "
const fs = require('fs'), f = '_astro/kit-completo.css';
const s = fs.readFileSync(f, 'utf8').split('url(/fonts/').join('url(../fonts/');
if (s.includes('url(/fonts/')) { console.error('  quedan rutas /fonts/ absolutas'); process.exit(1); }
fs.writeFileSync(f, s);
console.log('  ' + (s.match(/url\(\.\.\/fonts\//g) || []).length + ' @font-face apuntan a ../fonts/');
"

# 2c) Los efectos con JS. El runtime (Fx.astro_…js) salió de un build con base
# «/», y el precargador de Vite pide cada módulo a /_astro/… (la raíz del
# DOMINIO): 404 en Pages por cada efecto usado en el lienzo. Los import() son
# relativos y el efecto se pinta igual, pero la consola se llenaba de errores
# que tapaban los de verdad (medido el 23-sep). Se resuelve relativo al módulo.
echo "› precarga de efectos relativa al módulo"
node -e "
const fs = require('fs');
for (const f of fs.readdirSync('_astro').filter((f) => /^Fx\.astro.*\.js$/.test(f))) {
  const p = '_astro/' + f, s = fs.readFileSync(p, 'utf8');
  const t = s.split('function(t){return\"/\"+t}').join('function(t){return new URL(\"../\"+t,import.meta.url).href}');
  if (t !== s) { fs.writeFileSync(p, t); console.log('  ' + f + ': corregido'); }
}
"

# 2d) Las fuentes y los iconos viven en el kit; Pages solo sirve este repo.
# Antes se copiaban a mano y se separaron: Source Sans 3 estaba aquí y no en
# el kit (visto el 23-sep). Ahora se copian siempre, y el paso 3 comprueba en
# el kit que cada @font-face y cada icono de la lista tienen su fichero.
echo "› fuentes e iconos desde el kit"
mkdir -p fonts iconos
cp "$KIT"/fonts/*.woff2 fonts/
cp "$KIT"/iconos/*.svg "$KIT"/iconos/LICENSE "$KIT"/iconos/README.md iconos/
node -e "
const fs = require('fs'), n = (d, e) => fs.readdirSync(d).filter((f) => f.endsWith(e)).length;
console.log('  ' + n('fonts', '.woff2') + ' fuentes · ' + n('iconos', '.svg') + ' iconos');
"

# 3) Verificar que manifiesto y kit coinciden. Si no, se para aquí.
echo "› verificando el manifiesto"
node "$KIT/build/verificar.mjs"

# 4) El manifiesto vive en el kit, pero Pages solo sirve este repo
# Los dos son obligatorios: sin manifiesto no hay catálogo y sin registro la
# comprobación anti-clon calla. La copia va sin guardas a propósito — un
# `[ -f x ] && cp` devuelve 1 cuando el fichero falta y con `set -e` mata el
# script justo donde querría avisar.
cp "$KIT/kit.manifest.json" _astro/kit.manifest.json
cp "$KIT/marcas.json" _astro/marcas.json

# 5) Versionar por hash de contenido
python - <<'PY'
import io, hashlib, re, glob, os
h = lambda f: hashlib.sha1(io.open(f,'rb').read()).hexdigest()[:8]
vcss = h('estudio/estudio.css')
vkit, vman = h('_astro/kit-completo.css'), h('_astro/kit.manifest.json')
vmar = h('_astro/marcas.json')

# 5a) Primero, lo que los scripts referencian DENTRO (el CSS del lienzo, el
# manifiesto, el registro). Va antes de calcular su propio hash: si no, el hash
# no refleja el contenido que se publica.
scripts = sorted(glob.glob('estudio/*.js'))
# OJO: el runtime de efectos (_astro/Fx.astro_…js) NO se versiona con ?v=: sus
# módulos lo importan por el nombre a secas y con dos URL habría dos instancias
# (cada efecto se iniciaba dos veces). Tras cambiarlo, Pages tarda 10 min.
for p in scripts:
    s = io.open(p, encoding='utf-8').read()
    s = re.sub(r'href="_astro/kit-completo\.css(\?v=[a-f0-9]+)?"', f'href="_astro/kit-completo.css?v={vkit}"', s)
    # El manifiesto también: si cambia una pieza y el navegador sirve el JSON
    # viejo, el estudio ofrece el catálogo de ayer sin decir nada.
    s = re.sub(r"'\.\./_astro/kit\.manifest\.json(\?v=[a-f0-9]+)?'", f"'../_astro/kit.manifest.json?v={vman}'", s)
    # Y el registro de marcas: con el JSON de ayer, la regla anti-clon compara
    # contra un registro viejo y calla el choque que sí existe.
    s = re.sub(r"'\.\./_astro/marcas\.json(\?v=[a-f0-9]+)?'", f"'../_astro/marcas.json?v={vmar}'", s)
    io.open(p, 'w', encoding='utf-8').write(s)

# 5b) Después, cada <script> de index.html con el hash de SU fichero. El
# Estudio son varios scripts desde el 23-sep: versionar solo uno dejaría a los
# demás servidos de la caché de diez minutos de Pages.
p = 'estudio/index.html'; s = io.open(p, encoding='utf-8').read()
s = re.sub(r'href="estudio\.css(\?v=[a-f0-9]+)?"', f'href="estudio.css?v={vcss}"', s)
s = re.sub(r'href="\.\./_astro/kit-completo\.css(\?v=[a-f0-9]+)?"', f'href="../_astro/kit-completo.css?v={vkit}"', s)
cargados = re.findall(r'<script src="([a-z-]+\.js)(?:\?v=[a-f0-9]+)?"></script>', s)
faltan = [f for f in cargados if not os.path.exists('estudio/' + f)]
if faltan:
    raise SystemExit(f'  index.html carga scripts que no existen: {faltan}')
sobran = [os.path.basename(f) for f in scripts if os.path.basename(f) not in cargados]
if sobran:
    raise SystemExit(f'  hay scripts que index.html no carga (¿olvidados?): {sobran}')
for f in cargados:
    s = re.sub(r'src="' + re.escape(f) + r'(\?v=[a-f0-9]+)?"', f'src="{f}?v={h("estudio/" + f)}"', s)
io.open(p, 'w', encoding='utf-8').write(s)
print(f'  versionado css:{vcss} kit:{vkit} manifiesto:{vman} marcas:{vmar} · {len(cargados)} scripts')
PY

# 6) Publicar
git add -A
git -c user.email="opspilot.contact@gmail.com" -c user.name="opspilot" \
    commit -q -m "${1:-chore: actualizar guia y estudio}" || echo "  (sin cambios que commitear)"
git push -q origin master
echo "› publicado -> https://opspilotcontact-lgtm.github.io/kit-visual/estudio/"
