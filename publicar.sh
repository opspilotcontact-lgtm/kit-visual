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

# 3) Verificar que manifiesto y kit coinciden. Si no, se para aquí.
echo "› verificando el manifiesto"
node "$KIT/build/verificar.mjs"

# 4) El manifiesto vive en el kit, pero Pages solo sirve este repo
cp "$KIT/kit.manifest.json" _astro/kit.manifest.json
[ -f "$KIT/marcas.json" ] && cp "$KIT/marcas.json" _astro/marcas.json

# 5) Versionar por hash de contenido
python - <<'PY'
import io, hashlib, re
h = lambda f: hashlib.sha1(io.open(f,'rb').read()).hexdigest()[:8]
vcss, vjs = h('estudio/estudio.css'), h('estudio/estudio.js')
vkit, vman = h('_astro/kit-completo.css'), h('_astro/kit.manifest.json')

p='estudio/index.html'; s=io.open(p,encoding='utf-8').read()
s=re.sub(r'href="estudio\.css(\?v=[a-f0-9]+)?"', f'href="estudio.css?v={vcss}"', s)
s=re.sub(r'src="estudio\.js(\?v=[a-f0-9]+)?"', f'src="estudio.js?v={vjs}"', s)
s=re.sub(r'href="\.\./_astro/kit-completo\.css(\?v=[a-f0-9]+)?"', f'href="../_astro/kit-completo.css?v={vkit}"', s)
io.open(p,'w',encoding='utf-8').write(s)

p='estudio/estudio.js'; s=io.open(p,encoding='utf-8').read()
s=re.sub(r'href="_astro/kit-completo\.css(\?v=[a-f0-9]+)?"', f'href="_astro/kit-completo.css?v={vkit}"', s)
s=re.sub(r'href="estudio/estudio\.css(\?v=[a-f0-9]+)?"', f'href="estudio/estudio.css?v={vcss}"', s)
# El manifiesto también: si cambia una pieza y el navegador sirve el JSON viejo,
# el estudio ofrece el catálogo de ayer sin decir nada.
s=re.sub(r"'\.\./_astro/kit\.manifest\.json(\?v=[a-f0-9]+)?'", f"'../_astro/kit.manifest.json?v={vman}'", s)
io.open(p,'w',encoding='utf-8').write(s)
print(f'  versionado css:{vcss} js:{vjs} kit:{vkit} manifiesto:{vman}')
PY

# 6) Publicar
git add -A
git -c user.email="opspilot.contact@gmail.com" -c user.name="opspilot" \
    commit -q -m "${1:-chore: actualizar guia y estudio}" || echo "  (sin cambios que commitear)"
git push -q origin master
echo "› publicado -> https://opspilotcontact-lgtm.github.io/kit-visual/estudio/"
