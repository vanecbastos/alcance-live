import re, pathlib
root = pathlib.Path(__file__).parent
svg = (root/'assets/alcance-simbolo-branco.svg').read_text()
vb = re.search(r'viewBox="([^"]+)"', svg).group(1)
d = re.search(r' d="([^"]+)"', svg).group(1)
big = f'<svg viewBox="{vb}" role="img" aria-label="Alcance logo"><path fill="#ffffff" fill-rule="evenodd" d="{d}"/></svg>'
small = big.replace('role="img" aria-label="Alcance logo"', 'aria-hidden="true"')
op = f'<svg viewBox="{vb}" aria-hidden="true"><path fill-rule="evenodd" d="{d}"/></svg>'
idx = (root/'src/index.template.html').read_text().replace('__LOGO__', big).replace('__LOGO_SMALL__', small)
idx = idx.replace("$('audio').muted = !voiceOn || paused; if (joined)", "$('audio').muted = !voiceOn || paused || !joined; if (joined)")
(root/'index.html').write_text(idx)
(root/'operador.html').write_text((root/'src/operador.template.html').read_text().replace('__LOGO__', op))
print('built')
