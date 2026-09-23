#!/usr/bin/env bash
# Publica la guía y el estudio. Versiona los assets por hash de contenido para
# que el navegador no sirva una versión vieja: es el fallo que más tiempo cuesta
# diagnosticar, porque el repo está bien y la web no.
set -e
cd "$(dirname "$0")"

# 1) Recompilar el CSS completo del kit (todas las utilidades forzadas)
npx --yes @tailwindcss/cli@4 \
  -i ../opspilot-kit/build/completo.css \
  -o _astro/kit-completo.css --minify

# 2) Versionar
python - <<'PY'
import io, hashlib, re
h = lambda f: hashlib.sha1(io.open(f,'rb').read()).hexdigest()[:8]
vcss, vjs, vkit = h('estudio/estudio.css'), h('estudio/estudio.js'), h('_astro/kit-completo.css')
p='estudio/index.html'; s=io.open(p,encoding='utf-8').read()
s=re.sub(r'href="estudio\.css(\?v=[a-f0-9]+)?"', f'href="estudio.css?v={vcss}"', s)
s=re.sub(r'src="estudio\.js(\?v=[a-f0-9]+)?"', f'src="estudio.js?v={vjs}"', s)
s=re.sub(r'href="\.\./_astro/kit-completo\.css(\?v=[a-f0-9]+)?"', f'href="../_astro/kit-completo.css?v={vkit}"', s)
io.open(p,'w',encoding='utf-8').write(s)
p='estudio/estudio.js'; s=io.open(p,encoding='utf-8').read()
s=re.sub(r'href="_astro/kit-completo\.css(\?v=[a-f0-9]+)?"', f'href="_astro/kit-completo.css?v={vkit}"', s)
s=re.sub(r'href="estudio/estudio\.css(\?v=[a-f0-9]+)?"', f'href="estudio/estudio.css?v={vcss}"', s)
io.open(p,'w',encoding='utf-8').write(s)
print(f'versionado css:{vcss} js:{vjs} kit:{vkit}')
PY

# 3) Publicar
git add -A
git -c user.email="opspilot.contact@gmail.com" -c user.name="opspilot" \
    commit -q -m "${1:-chore: actualizar guia y estudio}" || echo "(sin cambios que commitear)"
git push -q origin master
echo "publicado -> https://opspilotcontact-lgtm.github.io/kit-visual/estudio/"
