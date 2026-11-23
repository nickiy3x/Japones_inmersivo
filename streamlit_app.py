"""Serve Japonés en contexto from Streamlit Community Cloud."""

import streamlit as st

from web_bundle import build_html

st.set_page_config(page_title="Japonés en contexto", page_icon="🍜", layout="wide")
st.html("""
<style>
  .stMainBlockContainer { padding: 0 !important; }
  .stMainBlockContainer iframe { height: 100dvh !important; display: block; }
  [data-testid="stHeader"] { background: transparent; pointer-events: none; }
  [data-testid="stToolbar"] { display: none; }
</style>
""")
st.iframe(build_html(), height=800, alt="Japonés en contexto")
