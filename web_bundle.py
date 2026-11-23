"""Build a self-contained HTML document from the repository frontend."""

import base64
import json
import mimetypes
import re
from io import BytesIO
from pathlib import Path
from urllib.parse import unquote

from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parent
ASSET_FOLDERS = ("3.Escenarios", "4. iconos")


def data_url(path):
    if path.parent.name == "3.Escenarios":
        with Image.open(path) as source:
            image = ImageOps.exif_transpose(source)
            image.thumbnail((1440, 1000), Image.Resampling.LANCZOS)
            buffer = BytesIO()
            image.save(buffer, format="WEBP", quality=87)
        mime, data = "image/webp", buffer.getvalue()
    else:
        mime = mimetypes.guess_type(path.name)[0] or "application/octet-stream"
        data = path.read_bytes()
    content = base64.b64encode(data).decode("ascii")
    return f"data:{mime};base64,{content}"


def build_html():
    """Inline only trusted files maintained in the project repository."""
    html = (ROOT / "index.html").read_text(encoding="utf-8-sig")
    css_path = ROOT / "src" / "styles.css"
    css = css_path.read_text(encoding="utf-8-sig")
    css = re.sub(
        r'url\("(\.\./RECURSOS/[^"]+)"\)',
        lambda match: 'url("' + data_url(css_path.parent / unquote(match[1])) + '")',
        css,
    )
    html = html.replace(
        '<link rel="stylesheet" href="src/styles.css">', f"<style>\n{css}\n</style>"
    )

    paths = [ROOT / "src" / "fachada.jpg"]
    for folder in ASSET_FOLDERS:
        paths.extend(
            path for path in (ROOT / "RECURSOS" / folder).iterdir()
            if path.is_file() and path.suffix.lower() in {".jpg", ".jpeg", ".png"}
        )
    assets = {path.relative_to(ROOT).as_posix(): data_url(path) for path in paths}
    preload = "<script>globalThis.maruyaEmbeddedAssets=" + json.dumps(assets) + ";</script>"
    html = html.replace('<div id="app"></div>', '<div id="app"></div>\n' + preload)

    def inline_script(match):
        code = (ROOT / match[1]).read_text(encoding="utf-8-sig")
        code = re.sub(r"</script", lambda tag: "<\\/" + tag[0][2:], code, flags=re.I)
        return f"<script>\n{code}\n</script>"

    return re.sub(r'<script defer src="(src/[^"]+\.js)"></script>', inline_script, html)
