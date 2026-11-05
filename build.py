#!/usr/bin/env python3
"""Gera dist/conferencia-gd.html: a ferramenta inteira em um único arquivo,
para baixar e abrir direto no navegador (sem precisar da pasta do projeto).

Uso:  python3 build.py
"""
import base64
import re
from pathlib import Path

RAIZ = Path(__file__).parent
html = (RAIZ / "index.html").read_text(encoding="utf-8")

# CSS local -> <style>
def css_inline(m):
    return "<style>\n" + (RAIZ / m.group(1)).read_text(encoding="utf-8") + "\n</style>"
html = re.sub(r'<link rel="stylesheet" href="([^"]+)">', css_inline, html)

# JS local -> <script> (scripts de CDN continuam externos)
def js_inline(m):
    codigo = (RAIZ / m.group(1)).read_text(encoding="utf-8").replace("</script>", "<\\/script>")
    return "<script>\n" + codigo + "\n</script>"
html = re.sub(r'<script src="(js/[^"]+)"></script>', js_inline, html)

# Imagens locais -> data URI
def img_inline(m):
    dados = base64.b64encode((RAIZ / m.group(1)).read_bytes()).decode()
    return f'src="data:image/png;base64,{dados}"'
html = re.sub(r'src="(assets/[^"]+\.png)"', img_inline, html)

saida = RAIZ / "dist" / "conferencia-gd.html"
saida.parent.mkdir(exist_ok=True)
saida.write_text(html, encoding="utf-8")
print(f"Gerado: {saida} ({saida.stat().st_size / 1024:.0f} KB)")
