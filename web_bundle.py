"""Build a self-contained HTML document from the repository frontend."""

import base64
import json
import mimetypes
import re
from io import BytesIO
from pathlib import Path, PurePosixPath
from urllib.parse import unquote

from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parent
ASSET_FOLDERS = ("3.Escenarios", "4. iconos")
STYLESHEET_LINK = re.compile(r'<link\s+rel="stylesheet"\s+href="([^"]+)"\s*/?>')


def exact_path(relative_path):
    """Find a repository path with Linux-style case sensitivity."""
    path = ROOT
    for part in PurePosixPath(relative_path).parts:
        if not path.is_dir() or part not in {entry.name for entry in path.iterdir()}:
            return None
        path /= part
    return path


def resource_locations(relative_path):
    """Prefer the standard layout, then check the separately uploaded folder."""
    return (relative_path, relative_path.removeprefix("RECURSOS/"))


def repository_file(relative_path):
    locations = (
        resource_locations(relative_path)
        if relative_path.startswith("RECURSOS/")
        else (relative_path,)
    )
    for location in locations:
        path = exact_path(location)
        if path is not None and path.is_file():
            return path
    raise FileNotFoundError(
        f"No se encontró el archivo. Rutas comprobadas: {', '.join(locations)}. "
        "Incluye el archivo en la rama desplegada con el nombre y las mayúsculas exactos."
    )


def data_url(path):
    if path.parent.name == "3.Escenarios":
        with Image.open(path) as source:
            image = ImageOps.exif_transpose(source)
            image.thumbnail((1440, 1000), Image.Resampling.LANCZOS)
            buffer = BytesIO()
            image.save(buffer, format="WEBP", quality=87)
        mime, data = "image/webp", buffer.getvalue()
    else:
        mime = "font/ttf" if path.suffix.lower() == ".ttf" else mimetypes.guess_type(path.name)[0]
        mime = mime or "application/octet-stream"
        data = path.read_bytes()
    content = base64.b64encode(data).decode("ascii")
    return f"data:{mime};base64,{content}"


def build_html():
    """Inline only trusted files maintained in the project repository."""
    html = (ROOT / "index.html").read_text(encoding="utf-8-sig")
    stylesheet = STYLESHEET_LINK.search(html)
    if stylesheet is None:
        raise ValueError("index.html no declara la hoja de estilos del prototipo.")
    css_path = repository_file(unquote(stylesheet[1]))
    css = css_path.read_text(encoding="utf-8-sig")
    css = re.sub(
        r'url\("\.\./(RECURSOS/[^"]+)"\)',
        lambda match: 'url("' + data_url(repository_file(unquote(match[1]))) + '")',
        css,
    )
    html = html[:stylesheet.start()] + f"<style>\n{css}\n</style>" + html[stylesheet.end():]

    paths = {"src/fachada.jpg": repository_file("src/fachada.jpg")}
    for folder in ASSET_FOLDERS:
        locations = resource_locations(f"RECURSOS/{folder}")
        directories = [exact_path(location) for location in locations]
        directories = [path for path in directories if path is not None and path.is_dir()]
        if not directories:
            raise FileNotFoundError(f"Falta la carpeta {folder}. Rutas comprobadas: {', '.join(locations)}.")
        for directory in reversed(directories):
            for path in directory.iterdir():
                if path.is_file() and path.suffix.lower() in {".jpg", ".jpeg", ".png"}:
                    paths[f"RECURSOS/{folder}/{path.name}"] = path
    assets = {url: data_url(path) for url, path in paths.items()}
    preload = "<script>globalThis.maruyaEmbeddedAssets=" + json.dumps(assets) + ";</script>"
    html = html.replace('<div id="app"></div>', '<div id="app"></div>\n' + preload)

    def inline_script(match):
        code = (ROOT / match[1]).read_text(encoding="utf-8-sig")
        code = re.sub(r"</script", lambda tag: "<\\/" + tag[0][2:], code, flags=re.I)
        return f"<script>\n{code}\n</script>"

    return re.sub(r'<script defer src="(src/[^"]+\.js)"></script>', inline_script, html)
