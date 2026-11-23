# Japonés en contexto

Prototipo web para practicar japonés. El escenario principal es **Tu primer pedido en Tokio**, en Maruya Shokudō. La conversación se simula en el navegador y el progreso se guarda en el almacenamiento local del navegador.

## Probar en Windows

Instala Python 3.12 y abre PowerShell en la carpeta del proyecto.

```powershell
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
.\.venv\Scripts\python.exe -m streamlit run streamlit_app.py
```

Streamlit muestra la dirección local. Para abrir el prototipo directamente, también puedes abrir `index.html` en el navegador. El notebook `Japonés en contexto.ipynb` incluye una exportación HTML autónoma y los pasos de publicación.

## Subir a GitHub

1. Crea un repositorio vacío llamado `japones-en-contexto` en tu cuenta u organización. Escoge quién podrá acceder al repositorio y a la aplicación.
2. En la carpeta del proyecto, ejecuta estos comandos. Reemplaza `TU_USUARIO` por la cuenta u organización propietaria.

```powershell
git init -b main
git add .
git status --short
git commit -m "Publicar prototipo de Japonés en contexto"
git remote add origin https://github.com/TU_USUARIO/japones-en-contexto.git
git push -u origin main
```

Conserva `src/` en la raíz. Para Streamlit, puedes subir `3.Escenarios/`, `4. iconos/` y `6.Tipografia_fuente/` por separado en la raíz o dentro de `RECURSOS/`. Para abrir `index.html` directamente, usa la estructura original con `RECURSOS/`. Respeta los nombres exactos, incluidas las tildes, los espacios y las mayúsculas. El archivo `.gitignore` excluye los materiales de referencia y los archivos de trabajo de Illustrator.

## Publicar en Streamlit Community Cloud

1. Inicia sesión en [Streamlit Community Cloud](https://share.streamlit.io/) y conecta la cuenta de GitHub que tiene acceso al repositorio.
2. Pulsa **Create app** y selecciona el repositorio `TU_USUARIO/japones-en-contexto`, la rama `main` y el archivo principal `streamlit_app.py`.
3. Usa Python 3.12 y pulsa **Deploy**. Esta versión funciona sin claves de API.
4. Abre el enlace generado en un celular. Comprueba el registro de invitado, los íconos de navegación, la carta de Maruya, la conversación y el cierre del escenario. Recarga la misma URL y comprueba que se conserva el progreso.

[Guía oficial de despliegue](https://docs.streamlit.io/deploy/streamlit-community-cloud/deploy-your-app/deploy)

Si el despliegue indica que falta el CSS, ejecuta `git ls-tree -r --name-only HEAD -- src/styles.css` en el repositorio conectado. Debe devolver exactamente `src/styles.css`. Si la salida está vacía, añade ese archivo, haz el commit y sube la rama que usa Streamlit. El empaquetador obtiene la ruta desde `index.html` y distingue mayúsculas y minúsculas también en Windows.

El progreso del archivo local y el de la URL publicada se guardan por separado, porque el navegador usa un almacenamiento por origen. Para una futura versión con API, guarda las credenciales en los secretos del servicio.
