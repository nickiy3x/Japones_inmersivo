const MENU = [
  { id:'shoyu_ramen', cat:'麺類', catR:'めんるい', catEs:'Fideos', m:'醤油{しょうゆ}ラーメン', es:'ramen de salsa de soya', price:900, priceM:'九百円{きゅうひゃくえん}',
    ing:['men','komugi','shoyu','butaniku','niku','tamago','negi','nori'], main:'麺{めん}|と|豚肉{ぶたにく}|と|卵{たまご}', mainEs:'fideos, cerdo y huevo',
    keys:['しょうゆらめん','しょゆらめん','しょうゆらあめん','らめん','らあめん'], glyph:'麺', img:'shoyu_ramen', bg:'#FDD599', food:true },
  { id:'kitsune_udon', cat:'麺類', catR:'めんるい', catEs:'Fideos', m:'きつねうどん', es:'udon con tofu frito', price:700, priceM:'七百円{ななひゃくえん}',
    ing:['men','komugi','tofu','negi','sakana','shoyu'], main:'麺{めん}|と|油揚{あぶらあ}げ|と|ねぎ', mainEs:'fideos, tofu frito y cebollín',
    keys:['きつねうどん','うどん','きつね'], glyph:'饂', img:'kitsune_udon', bg:'#EFE0D4', food:true },
  { id:'oyakodon', cat:'ご飯もの', catR:'ごはんもの', catEs:'Arroz', m:'親子丼{おやこどん}', es:'oyakodon (arroz con pollo y huevo)', price:850, priceM:'八百五十円{はっぴゃくごじゅうえん}',
    ing:['gohan','toriniku','niku','tamago','tamanegi','shoyu'], main:'ご飯{はん}|と|鶏肉{とりにく}|と|卵{たまご}', mainEs:'arroz, pollo y huevo',
    keys:['おやこどん','おやこど','おやこ'], glyph:'丼', bg:'#FDD599', img:'oyakodon', food:true },
  { id:'curry', cat:'ご飯もの', catR:'ごはんもの', catEs:'Arroz', m:'カレーライス', es:'arroz con curry japonés', price:800, priceM:'八百円{はっぴゃくえん}',
    ing:['gohan','butaniku','niku','jagaimo','ninjin','tamanegi','komugi'], main:'ご飯{はん}|と|豚肉{ぶたにく}|と|じゃがいも', mainEs:'arroz, cerdo y papa',
    keys:['かれらいす','かれえらいす','かれいらいす','かれ'], glyph:'カ', img:'curry', bg:'#FFDCC9', food:true },
  { id:'daifuku', cat:'甘味', catR:'かんみ', catEs:'Dulces', m:'大福{だいふく}', es:'daifuku (mochi con frijol dulce)', price:300, priceM:'三百円{さんびゃくえん}',
    ing:['mochi','anko'], main:'もち|と|あんこ', mainEs:'mochi y frijol rojo dulce',
    keys:['だいふく'], glyph:'福', img:'daifuku', bg:'#E5CBF2', food:true },
  { id:'ocha', cat:'飲み物', catR:'のみもの', catEs:'Bebidas', m:'お茶{ちゃ}', es:'té verde', price:0, priceM:'無料{むりょう}',
    ing:['ocha'], main:'お茶{ちゃ}', mainEs:'té verde', keys:['おちゃ','りょくちゃ'], glyph:'茶', img:'ocha', bg:'#DDEBD3', food:false },
  { id:'mizu', cat:'飲み物', catR:'のみもの', catEs:'Bebidas', m:'お水{みず}', es:'agua', price:0, priceM:'無料{むりょう}',
    ing:['mizu'], main:'お水{みず}', mainEs:'agua', keys:['おみず','みず'], glyph:'水', img:'mizu', bg:'#D8E7F2', food:false },
];

const ING = {
  tamago:{m:'卵{たまご}',es:'huevo',keys:['たまご']},
  butaniku:{m:'豚肉{ぶたにく}',es:'cerdo',keys:['ぶたにく','ぽく']},
  toriniku:{m:'鶏肉{とりにく}',es:'pollo',keys:['とりにく','ちきん']},
  niku:{m:'肉{にく}',es:'carne',keys:['にく']},
  sakana:{m:'魚{さかな}',es:'pescado',keys:['さかな']},
  ebi:{m:'えび',es:'camarón',keys:['えび']},
  men:{m:'麺{めん}',es:'fideos',keys:['めん','ぱすた']},
  gohan:{m:'ご飯{はん}',es:'arroz',keys:['ごはん','らいす']},
  komugi:{m:'小麦{こむぎ}',es:'trigo',keys:['こむぎ']},
  tamanegi:{m:'玉{たま}ねぎ',es:'cebolla',keys:['たまねぎ']},
  negi:{m:'ねぎ',es:'cebollín',keys:['ねぎ']},
  tofu:{m:'豆腐{とうふ}',es:'tofu',keys:['とうふ','とふ','あぶらあげ']},
  jagaimo:{m:'じゃがいも',es:'papa',keys:['じゃがいも']},
  ninjin:{m:'にんじん',es:'zanahoria',keys:['にんじん']},
  shoyu:{m:'醤油{しょうゆ}',es:'salsa de soya',keys:['しょうゆ','しょゆ']},
  nori:{m:'のり',es:'alga',keys:['のり']},
  anko:{m:'あんこ',es:'frijol rojo dulce',keys:['あんこ']},
  mochi:{m:'もち',es:'mochi',keys:['もち']},
  gyunyu:{m:'牛乳{ぎゅうにゅう}',es:'leche',keys:['ぎゅうにゅう','みるく']},
  ocha:{m:'お茶{ちゃ}',es:'té verde',keys:['おちゃ','りょくちゃ']},
  mizu:{m:'お水{みず}',es:'agua',keys:['おみず','みず']},
};
const ING_ORDER = ['tamanegi','butaniku','toriniku','tamago','niku','sakana','ebi','men','gohan','komugi','negi','tofu','jagaimo','ninjin','shoyu','nori','anko','mochi','gyunyu'];

/* Diccionario de palabras tocables (clave = forma escrita sin lectura) */
const DICT = {
  'いらっしゃいませ':'¡Bienvenido/a! (fórmula de tienda; no se responde)',
  '何名様':'¿cuántas personas? (forma cortés)', 'ですか':'¿es…? (pregunta cortés)', 'ですね':'es…, ¿verdad?',
  'お一人':'una persona (cortés)', '一人':'una persona', '一名様':'una persona (cortés, lo dice el personal)', '二名様':'dos personas (cortés)',
  'こちらへ':'por aquí', 'どうぞ':'adelante / aquí tiene / por favor', 'お水':'agua', 'です':'es / soy / son',
  'ごゆっくり':'tómese su tiempo', 'メニュー':'menú, carta', 'いります':'necesitar', 'か':'partícula de pregunta (¿…?)',
  'はい':'sí', 'はい、':'sí', 'いいえ':'no', 'いいえ、':'no', '何か':'algo', '質問':'pregunta', 'は':'partícula de tema (se lee «wa»)',
  'あります':'hay / tener (cosas)', 'ありません':'no hay', 'ご注文':'pedido (cortés)', 'おすすめ':'recomendación',
  '親子丼':'oyakodon: arroz con pollo y huevo', '醤油ラーメン':'ramen de salsa de soya', 'きつねうどん':'udon con tofu frito dulce',
  'カレーライス':'arroz con curry japonés', '大福':'daifuku: mochi relleno de frijol dulce', 'お茶':'té verde',
  'を':'partícula de objeto: marca lo que pides (se lee «o»)', '一つ':'uno (para contar cosas)', '二つ':'dos (para contar cosas)',
  'かしこまりました':'entendido, enseguida (muy cortés)', 'お待たせ':'perdón por la espera', 'しました':'hice (pasado de する)',
  'ありがとう':'gracias', 'ございます':'(hace la frase más cortés)', 'ございました':'(pasado cortés)', 'またお越し':'vuelva otra vez',
  'ください':'por favor, deme', 'すみません':'disculpe (también para llamar al mesero)', 'すみません、':'disculpe', 'もう一度':'una vez más',
  'おねがいします':'por favor (al pedir algo)', '先に':'primero', '無料':'gratis', '他':'otro', 'に':'partícula: en / a',
  'いかが':'¿qué tal…? (cortés)', 'には':'en… (tema): «ni wa»', 'が':'partícula de sujeto', '入って':'(está) dentro → «入っています» = lleva, contiene',
  'います':'estar (forma です／ます)', 'いません':'no estar', '卵':'huevo', '肉':'carne', '豚肉':'cerdo', '鶏肉':'pollo', '魚':'pescado',
  'えび':'camarón', '麺':'fideos', 'ご飯':'arroz cocido / comida', '小麦':'trigo', '玉ねぎ':'cebolla', 'ねぎ':'cebollín', '油揚げ':'tofu frito',
  '豆腐':'tofu', 'じゃがいも':'papa', 'にんじん':'zanahoria', '醤油':'salsa de soya', 'のり':'alga nori', 'あんこ':'pasta de frijol rojo dulce',
  'もち':'mochi, pastel de arroz', '牛乳':'leche', 'お会計':'la cuenta', 'と':'y (une sustantivos)', 'どれ':'¿cuál?',
  'ごちそうさま':'gracias por la comida (al terminar)', 'でした':'era / fue (cortés)', 'いただきます':'buen provecho (antes de comer)',
  'こんにちは':'hola / buenas tardes', '九百円':'900 yenes', '七百円':'700 yenes', '八百五十円':'850 yenes', '八百円':'800 yenes', '三百円':'300 yenes',
  'そうですね':'así es / ya veo', 'ピザ':'pizza', '寿司':'sushi', '天ぷら':'tempura', 'ステーキ':'filete', 'まだ':'todavía',
  'はじめまして':'mucho gusto (primera vez)', 'よろしく':'encantado/a', 'わたし':'yo', 'も':'también', '好き':'me gusta', 'どこ':'dónde',
  'から':'desde', '来ました':'vine', '日本':'Japón', 'の':'de (posesión)', '食べ物':'comida', '何':'qué', 'いいですね':'¡qué bien!', 'すごい':'¡increíble!',
  '趣味':'pasatiempo', 'お名前':'nombre (cortés)', 'ですか。':'¿es…?', '大学生':'universitario/a', 'コロンビア':'Colombia', '勉強':'estudio',
  '毎日':'todos los días', '朝':'mañana', 'ご飯を':'', '今日':'hoy', '天気':'clima', '晴れ':'despejado', '料理':'cocina, platos', '日本語':'idioma japonés',
  'ようこそ':'¡bienvenido/a!', '食堂':'comedor, restaurante sencillo', 'まるや食堂':'Maruya Shokudō, comedor familiar de barrio'
};

/* Mapa kanji → kana para entender lo que el usuario escribe con teclado japonés */
const VOCAB = [
  ...MENU.map(d=>({m:d.m,es:d.es,cat:'Platos'})),
  ...Object.values(ING).map(i=>({m:i.m,es:i.es,cat:'Ingredientes'})),
  {m:'一人{ひとり}|です。',es:'Vengo solo/a.',cat:'Frases'},
  {m:'すみません',es:'Disculpe (para llamar al mesero)',cat:'Frases'},
  {m:'メニュー|を|ください。',es:'La carta, por favor.',cat:'Frases'},
  {m:'卵{たまご}|が|入{はい}って|います|か。',es:'¿Lleva huevo?',cat:'Frases'},
  {m:'おすすめ|は|何{なん}|ですか。',es:'¿Qué me recomienda?',cat:'Frases'},
  {m:'お会計{かいけい}|を|おねがいします。',es:'La cuenta, por favor.',cat:'Frases'},
  {m:'いただきます',es:'Buen provecho (antes de comer)',cat:'Frases'},
  {m:'ごちそうさま|でした',es:'Gracias por la comida',cat:'Frases'},
  {m:'いらっしゃいませ',es:'¡Bienvenido/a! (lo dice el personal)',cat:'Frases'},
  {m:'かしこまりました',es:'Entendido, enseguida',cat:'Frases'},
];

const MISSIONS = [
  {id:'M1',k:'入店',label:'Entrada',title:'Saludar y pedir mesa',icon:'door',scene:'mostrador'},
  {id:'M2',k:'メニュー',label:'Menú',title:'Consultar el menú',icon:'book',scene:'mesa'},
  {id:'M3',k:'材料',label:'Ingred.',title:'Preguntar un ingrediente',icon:'egg',scene:'mesa'},
  {id:'M4',k:'注文',label:'Pedido',title:'Hacer el pedido',icon:'bowl',scene:'mesa'},
  {id:'M5',k:'お会計',label:'Cuenta',title:'Pedir la cuenta',icon:'yen',scene:'cuenta'},
];
const BONUS = [
  {id:'B1',title:'Pedir una recomendación',m:'おすすめ|は|何{なん}|ですか。'},
  {id:'B2',title:'Decir いただきます',m:'いただきます'},
  {id:'B3',title:'Decir ごちそうさまでした',m:'ごちそうさま|でした。'},
];

/* Escenas: focal = punto (0–1) que debe quedar centrado al recortar en vertical; hs = zonas táctiles (% de la imagen) */
const SCENES = {
  fachada:{img:'fachada',ratio:483/262,focal:.5,cap:'まるや食堂 · Fachada',hs:[]},
  mostrador:{img:'mostrador',ratio:1440/611,focal:.6,cap:'入口 · Entrada',hs:[{x:57,y:64,label:'Escuchar de nuevo',act:'repeat'}]},
  mesa:{img:'mesa',ratio:1440/611,focal:.6,cap:'テーブル · Mesa',hs:[{x:71,y:40,label:'中村さん · repetir',act:'repeat'},{x:47,y:90,label:'Ver la carta',act:'menu',need:'M2'}]},
  servido:{img:'servido',ratio:1440/611,focal:.56,cap:'お待たせしました · Plato servido',hs:[{x:51,y:74,label:'Tu plato',act:'dish'},{x:64.5,y:79,label:'Agua',act:'note-water'},{x:68,y:40,label:'中村さん · repetir',act:'repeat'}]},
  cuenta:{img:'cuenta',ratio:1440/611,focal:.6,cap:'食後 · Después de comer',hs:[{x:71,y:40,label:'中村さん · repetir',act:'repeat'},{x:56,y:87,label:'Nota cultural',act:'note-pay'}]},
};

const NOTES = {
  water:'El agua y el té son gratis y llegan solos al sentarte. No hace falta pedirlos.',
  pay:'En un shokudō se paga en la caja, a la salida. No se deja propina.',
  irasshai:'A «いらっしゃいませ» no se responde: solo dices cuántas personas son.',
  sumimasen:'Para llamar al mesero se dice すみません.',
  itadaki:'いただきます antes de comer y ごちそうさまでした al salir son gestos muy valorados.',
  dashi:'El caldo dashi del udon lleva pescado: no es del todo vegetariano.',
};
const OFFMENU=[['すし','寿司{すし}','sushi'],['ぴざ','ピザ','pizza'],['ぴっざ','ピザ','pizza'],['ぴっつぁ','ピザ','pizza'],['てんぷら','天{てん}ぷら','tempura'],['すてき','ステーキ','filete'],['はんばが','ハンバーガー','hamburguesa']];
