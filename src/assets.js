function assetUrl(path) {
  return globalThis.maruyaEmbeddedAssets?.[decodeURI(path)] ?? path;
}

const IMG = {
  "inicio": "RECURSOS/3.Escenarios/Imagen%20de%20inicio.jpg",
  "mostrador": "RECURSOS/3.Escenarios/vista%20mostrador.jpg",
  "mesa": "RECURSOS/3.Escenarios/mesa%20menu.jpg",
  "servido": "RECURSOS/3.Escenarios/plato%20de%20oyakodon%20en%20mesa.jpg",
  "cuenta": "RECURSOS/3.Escenarios/pedir%20la%20cuenta.jpg",
  "oyakodon": "RECURSOS/3.Escenarios/plato%20detallado%20oyakodon.jpg",
  "shoyu_ramen": encodeURI("RECURSOS/3.Escenarios/Ramen shoyu, cerdo y huevo-2.png"),
  "kitsune_udon": encodeURI("RECURSOS/3.Escenarios/Kitsune udon con tofu dorado-4.png"),
  "curry": encodeURI("RECURSOS/3.Escenarios/Arroz con curry japonés y cerdo-6.png"),
  "daifuku": encodeURI("RECURSOS/3.Escenarios/Daifuku de frijol rojo-5.png"),
  "ocha": encodeURI("RECURSOS/3.Escenarios/Té verde en yunomi de cerámica-1.png"),
  "mizu": encodeURI("RECURSOS/3.Escenarios/Agua clara en vaso transparente-3.png"),
  "sofia": "RECURSOS/3.Escenarios/avatar.jpg",
  "sofiaWide": "RECURSOS/3.Escenarios/avatar.jpg",
  "fachada": "src/fachada.jpg"
};
for (const key of Object.keys(IMG)) IMG[key] = assetUrl(IMG[key]);
const TEAM_ICONS = {
  "chat": "RECURSOS/4. iconos/conversacion%20lineas.png",
  "dict": "RECURSOS/4. iconos/libro-alt.png",
  "cap": "RECURSOS/4. iconos/gorro-de-graduacion.png",
  "user": "RECURSOS/4. iconos/usuario.png",
  "mic": "RECURSOS/4. iconos/forma-de-microfono-negro.png",
  "sound": "RECURSOS/4. iconos/audio.png",
  "fire": "RECURSOS/4. iconos/fuego%20(1).png"
};
for (const key of Object.keys(TEAM_ICONS)) TEAM_ICONS[key] = assetUrl(TEAM_ICONS[key]);
