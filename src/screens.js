const app=document.getElementById('app');
const $=s=>app.querySelector(s);
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
let CUR=null;      // controlador de conversación activo (actividad o charla)
let ROUTE={name:'splash'};

/* ---------- Utilidades de interfaz ---------- */
function mount(html,cls=''){ app.innerHTML=`<div class="screen ${cls}">${html}</div>`; applyLayers(); return app.firstElementChild; }
function toast(t){ const s=app.querySelector('.screen'); if(!s) return; s.querySelectorAll('.toast').forEach(x=>x.remove()); const d=document.createElement('div'); d.className='toast'; d.textContent=t; s.appendChild(d); setTimeout(()=>d.remove(),3300); }
function applyLayers(){ document.body.classList.toggle('hide-furi',!G.user.layers.furi); }
function hdr(title='',back=true,right=''){ return `<div class="hdr">${back?`<button class="iconbtn" data-act="back" aria-label="Atrás">${I('back')}</button>`:'<span style="width:44px"></span>'}<div class="ttl">${title}</div>${right}</div>`; }
function lineHTML(l,o={}){
  const L=G.user.layers;
  return `<div class="ja">${jaHTML(l.m)}</div>${L.ro||o.ro?`<div class="ro">${romajiOf(l.m)}</div>`:''}${(L.es||o.showEs)&&l.es?`<div class="es">${esc(l.es)}</div>`:(o.esHint&&l.es?'<div class="es-hint">Toca para ver en español</div>':'')}`;
}
const rubyOnly=m=>tokens(m).map(t=>t.replace(KANJI_RX,'<ruby>$1<rt>$2</rt></ruby>')).join('');
const isSaved=m=>G.saved.some(w=>w.m===m);
function toggleSave(m,es){ const i=G.saved.findIndex(w=>w.m===m); if(i>=0){G.saved.splice(i,1);toast('Quitada de tus palabras');} else {G.saved.push({m,es,d:Date.now()});toast('Guardada en tu diccionario');} save(); }

function toDisplay(raw,live){ if(!(G.user.conv&&/[a-z]/i.test(raw)&&!isSpanish(raw))) return raw; const r=raw.toLowerCase().replace(/(\S)\s+o(?=\s|$)/g,'$1 wo').replace(/(\S)\s+wa(?=\s|$)/g,'$1 ha').replace(/,/g,'、').replace(/\?/g,'？').replace(/!/g,'！').replace(/\b(konnichi|konban)wa\b/g,'$1ha'); const ws=r.split(/\s+/); return raw.split(/\s+/).length&&r.split(/\s+/).map((w,i)=>{const orig=raw.split(/\s+/)[i]||'';return /^[A-Z]/.test(orig)?orig:romajiToKana(w,!live||i<ws.length-1);}).join(' ').replace(/\s+(?=[^A-Za-z])|(?<=[^A-Za-z])\s+/g,''); }

/* ---------- Audio (texto a voz del navegador; el backend usará ElevenLabs) ---------- */
let jaVoice=null,voiceWarned=false;
function pickVoice(){ try{ jaVoice=speechSynthesis.getVoices().find(v=>/^ja/i.test(v.lang))||null; }catch(e){} }
if('speechSynthesis' in window){ pickVoice(); speechSynthesis.onvoiceschanged=pickVoice; }
function speak(m,slow,btn){
  if(!('speechSynthesis' in window)){ toast('Audio no disponible en este navegador'); return; }
  try{
    speechSynthesis.cancel();
    const u=new SpeechSynthesisUtterance(m.includes('|')||m.includes('{')?kanaOf(m):m);
    u.lang='ja-JP'; if(jaVoice) u.voice=jaVoice;
    u.rate=(slow||G.user.speed<1||(CUR&&CUR.S&&CUR.S.slow))?0.7:1;
    document.querySelectorAll('.playing').forEach(b=>b.classList.remove('playing'));
    if(btn){ btn.classList.add('playing'); u.onend=u.onerror=()=>btn.classList.remove('playing'); }
    conversation.synthesize(u);
    if(!jaVoice&&!voiceWarned){ voiceWarned=true; setTimeout(()=>{ if(!jaVoice) toast('Instala una voz japonesa en tu sistema para escuchar mejor el audio.'); },600); }
  }catch(e){}
}

/* ---------- Navegación ---------- */
const HIST=[];
function go(name,p={},push=true){ if(push&&ROUTE) HIST.push(ROUTE); ROUTE=Object.assign({name},p); if(CUR&&CUR.dispose){CUR.dispose();CUR=null;} if('speechSynthesis' in window) try{speechSynthesis.cancel()}catch(e){} SCREENS[name](p); }
function back(){ const r=HIST.pop(); if(r) go(r.name,r,false); else go(G.registered?'home':'splash',{},false); }

/* =========================================================
   PANTALLAS
   ========================================================= */
const SCREENS={};

SCREENS.splash=()=>{
  mount(`<div class="scroll">
    <div class="splash-art"><img src="${IMG.inicio}" alt="Ilustración de Japón al atardecer"></div>
    <div class="pad" style="margin-top:-28px;position:relative">
      <button class="play-pill" data-act="say" data-m="ようこそ！">${I('sound',{s:18})} Escuchar</button>
      <div class="hello mt3">ようこそ！</div>
      <div class="t-h2 mt2">Practica japonés en contexto</div>
      <p class="muted t-body mt2">Conversa con personajes en escenas cotidianas de Japón. Habla o escribe: te acompañamos con pistas y correcciones.</p>
    </div></div>
    <div class="sticky-cta btn-stack">
      <button class="btn btn-primary" data-act="go" data-to="login">Empezar</button>
      <button class="btn btn-secondary" data-act="haveAccount">Ya tengo cuenta</button>
      <button class="t-sm faint" style="margin-top:4px" data-act="go" data-to="guide">Ver guía de diseño UI</button>
    </div>`);
};

SCREENS.login=()=>{
  mount(`${hdr()}<div class="scroll pad">
    <div class="t-h1 mt2">Entra a practicar</div>
    <p class="muted mt2">Crea una sesión de invitado para guardar tu progreso en este dispositivo.</p>
    <div class="btn-stack mt6">
      <button class="btn btn-primary" data-act="guest">Entrar como invitado</button>
      <button class="btn btn-ghost" data-act="toast" data-t="El inicio de sesión con Google o correo llega en la fase 2.">Iniciar sesión <span class="tag">Fase 2</span></button>
    </div>
    <p class="t-sm faint mt4">El acceso con cuenta (Google o correo) está previsto para la siguiente fase.</p>
    <div style="display:flex;justify-content:center;margin-top:48px;opacity:.9"><img src="${IMG.fachada}" alt="" style="width:100%;border-radius:24px;box-shadow:var(--sh-2)"></div>
  </div>`);
};

function onbShell(step,title,body,cta,ctaDis){
  return `${hdr()}<div class="pad"><div class="steps">${[1,2,3].map(i=>`<i class="${i<=step?'on':''}"></i>`).join('')}</div><div class="t-cap mt4">Paso ${step} de 3</div><div class="t-h1 mt1">${title}</div></div>
  <div class="scroll pad" style="padding-top:20px">${body}</div><div class="sticky-cta btn-stack">${cta}</div>`;
}
SCREENS.onb1=()=>{
  mount(onbShell(1,'¿Cómo te llamas?',`<input class="field" id="nm" placeholder="Tu nombre" maxlength="24" value="${esc(G.user.name)}" autocomplete="given-name"><p class="t-sm faint mt3">Así te saludará Sofía, tu compañera de práctica.</p>`,
    `<button class="btn btn-primary" id="c1" data-act="onbName" ${G.user.name?'':'disabled'}>Continuar</button>`));
  const nm=$('#nm'); nm.focus(); nm.addEventListener('input',()=>$('#c1').disabled=!nm.value.trim()); nm.addEventListener('keydown',e=>{if(e.key==='Enter'&&nm.value.trim())ACT.onbName();});
};
const LEVELS=[{id:'zero',k:'あ',t:'Empiezo de cero',d:'Aún no leo hiragana'},{id:'hira',k:'か',t:'Leo hiragana',d:'Reconozco los kana básicos'},{id:'n5',k:'N5',t:'Tengo N5',d:'Leo kana y algunos kanji'}];
SCREENS.onb2=()=>{
  mount(onbShell(2,'¿Cuál es tu nivel?',`<div class="list">${LEVELS.map(l=>`<button class="opt ${G.user.level===l.id?'act':''}" data-act="level" data-id="${l.id}"><span class="em">${l.k}</span><span class="grow"><b>${l.t}</b><br><span class="t-sm muted">${l.d}</span></span><span class="radio"></span></button>`).join('')}</div>
  <p class="t-sm faint mt4">Con tu nivel ajustamos las ayudas de lectura. Puedes cambiarlas cuando quieras.</p>`,
  `<button class="btn btn-primary" data-act="go" data-to="onb3">Continuar</button>`));
};
function layerToggles(){
  const L=G.user.layers;
  return `<div class="list">
   <button class="tgl ${L.furi?'on':''}" data-act="layer" data-k="furi"><span class="grow"><b>Hiragana</b><br><span class="t-sm muted">Furigana sobre los kanji: <span class="jp">${rubyOnly('一人{ひとり}')}</span></span></span><span class="sw"></span></button>
   <button class="tgl ${L.ro?'on':''}" data-act="layer" data-k="ro"><span class="grow"><b>Romaji</b><br><span class="t-sm muted">Lectura en alfabeto latino: hitori desu</span></span><span class="sw"></span></button>
   <button class="tgl ${L.es?'on':''}" data-act="layer" data-k="es"><span class="grow"><b>Español siempre visible</b><br><span class="t-sm muted">Si está apagado, toca el globo para verlo</span></span><span class="sw"></span></button>
  </div>`;
}
SCREENS.onb3=()=>{
  mount(onbShell(3,'Configura tus ayudas',`${layerToggles()}
   <div class="card mt4 row"><span class="li ico" style="background:var(--lav-50);box-shadow:none;width:40px;height:40px;min-height:0;padding:0;justify-content:center">${I('mic')}</span><span class="grow t-sm"><b>Micrófono</b><br><span class="muted">Para hablar con el modo <i>mantener para hablar</i>. Si no das permiso, todo funciona escribiendo.</span></span></div>
   <button class="btn btn-ghost mt3" data-act="testMic">${I('mic',{s:20})} Probar micrófono</button>`,
  `<button class="btn btn-primary" data-act="finishOnb">Continuar</button><button class="btn btn-secondary" data-act="finishOnb">Omitir</button>`));
};

/* ---------- Home con pestañas ---------- */
const TABS=[['lessons','cap','Lecciones'],['practice','chat','Práctica'],['dict','dict','Diccionario'],['profile','user','Perfil']];
SCREENS.home=(p)=>{
  const tab=p.tab||'practice';
  const body={lessons:tabLessons,practice:tabPractice,dict:tabDict,profile:tabProfile}[tab]();
  mount(`<div class="scroll">${body}</div>
   <button class="fab" data-act="talk">${I('mic',{s:20})} Hablar <span class="jp">話す</span></button>
   <nav class="tabbar">${TABS.map(t=>`<button class="${t[0]===tab?'act':''}" ${t[0]===tab?'aria-current="page"':''} data-act="tab" data-tab="${t[0]}">${I(t[1])}${t[2]}</button>`).join('')}</nav>`,'with-tabbar');
  if(tab==='dict') bindDict();
};
function greetDate(){ const d=new Date().toLocaleDateString('es-CO',{weekday:'long',day:'numeric',month:'short'}); return d.charAt(0).toUpperCase()+d.slice(1); }
function tabPractice(){
  const n=G.user.name?.trim()||'invitado'; const R=G.resume;
  const streak=currentStreak();
  const done=R?Object.keys(R.done).length:0;
  return `<div class="home-top"><div class="avatar">${esc(n[0].toUpperCase())}</div><div class="grow"><div class="t-h2">Hola, ${esc(n)}</div><div class="t-sm faint">${greetDate()}</div></div><div class="streak" title="Racha de días">${I('flame',{s:18})}<span style="color:var(--coral-700)">${streak}</span> ${streak===1?'día':'días'}</div></div>
  <div class="pad mt4">
    <button class="feat" data-act="go" data-to="ficha"><img src="${IMG.fachada}" alt="Fachada de Maruya Shokudō"><span class="chip dark">Escenario 1 · Vida cotidiana</span>
      <div class="in"><div class="t-cap" style="color:rgba(255,255,255,.75)">まるや食堂 · Maruya Shokudō</div><div class="t-h1 mt1">Tu primer pedido en Tokio</div>
      <div class="t-sm mt1" style="opacity:.85">Principiante · 10 min · 5 misiones</div>
      <div class="row mt3"><div class="progress grow"><b style="width:${done*20}%"></b></div><span class="t-sm" style="font-weight:900">${done}/5</span></div></div></button>
    ${R?`<button class="li mt3" data-act="resume"><span class="ico" style="background:var(--coral-50);color:var(--coral-700)">${I('refresh')}</span><span class="grow"><b>Continúa con tu actividad</b><br><span class="t-sm muted">Misión ${Math.min(done+1,5)} · ${MISSIONS[Math.min(done,4)].title}</span></span>${I('chev')}</button>`:''}
    <div class="sec-ttl"><div class="t-h2">Modos de práctica</div></div>
    <div class="modes">
      <button class="mode" style="background:var(--lav)" data-act="talk"><span class="k">話</span>${I('chat')}<span><b>Conversación libre</b><br><span class="t-sm muted">Voz o texto con Sofía</span></span></button>
      <button class="mode" style="background:var(--peach)" data-act="write"><span class="k">書</span>${I('pen')}<span><b>Escritura libre</b><br><span class="t-sm muted">Chat con corrección</span></span></button>
      <button class="mode" style="background:var(--coral-50)" data-act="go" data-to="ficha"><span class="k">役</span>${I('mask')}<span><b>Juego de rol</b><br><span class="t-sm muted">Escenarios con misiones</span></span></button>
      <button class="mode locked" style="background:var(--sand)" data-act="toast" data-t="La entrevista se desbloquea en nivel N4."><span class="k">面</span>${I('lock')}<span><b>Entrevista</b><br><span class="t-sm muted">Nivel N4</span></span></button>
    </div>
    <div class="sec-ttl"><div class="t-h2">Escenarios rápidos</div><span class="t-sm faint">3–5 min</span></div>
    <div class="hscroll">
      <button class="qs" data-act="talk" data-topic="intro"><div class="jp">自己紹介</div><b class="t-sm">Presentarte</b><div class="t-sm faint">Disponible</div></button>
      ${[['買い物','De compras'],['朝の会話','Charla matutina'],['友達と','Con un amigo']].map(q=>`<button class="qs locked" data-act="toast" data-t="Próximamente: ${q[1]}."><div class="jp">${q[0]}</div><b class="t-sm">${q[1]}</b><div class="t-sm faint">Próximamente</div></button>`).join('')}
    </div>
    <p class="t-sm faint">Debate y Discusión se activan desde el nivel N4.</p>
  </div>`;
}
function tabLessons(){
  return `<div class="pad"><div class="row" style="padding-top:20px"><div class="t-display grow">Lecciones</div><span class="chip coral">${I('globe',{s:16})} 日本語</span></div>
   <div class="unit mt4"><span class="k">食</span><div class="t-cap" style="color:var(--ink-2)">Unidad 1 · Principiante</div><div class="t-h1 mt1">En el restaurante</div><p class="t-sm muted mt1" style="max-width:240px">Prepara el escenario «Tu primer pedido en Tokio».</p></div>
   <div class="path mt6 list" style="gap:16px">
     ${[['01','Vocabulario','Platos, ingredientes y frases','flash',''],['02','Mini quiz','Repasa las palabras','quiz',''],['03','Juego de rol','Tu primer pedido en Tokio','ficha',''],['04','Kana básicos','Hiragana y katakana','', 'l']].map(x=>`<div style="position:relative"><span class="node ${x[4]}">${x[4]?I('lock',{s:18}):x[0]}</span><button class="li" ${x[3]?`data-act="go" data-to="${x[3]}"`:'data-act="toast" data-t="Kana y gramática llegan en la fase 2."'} style="${x[4]?'opacity:.55':''}"><span class="grow"><b>${x[1]}</b><br><span class="t-sm muted">${x[2]}</span></span>${I('chev')}</button></div>`).join('')}
   </div></div>`;
}
let DICTQ='',DICTTAB='search';
function tabDict(){
  const wod=VOCAB[new Date().getDate()%VOCAB.length];
  return `<div class="pad"><div class="t-display" style="padding-top:20px">Diccionario</div>
   <label class="search mt4">${I('search',{s:20})}<input id="dq" placeholder="Español, romaji, kana o kanji" value="${esc(DICTQ)}" autocomplete="off"></label>
   <div class="card lav mt4"><div class="t-cap" style="color:var(--lav-700)">Palabra del día</div><div class="row mt1"><div class="grow">${lineHTML(wod,{showEs:true,ro:true})}</div><button class="iconbtn solid" data-act="say" data-m="${encodeURIComponent(wod.m)}">${I('play',{s:18})}</button></div></div>
   <div class="seg mt4"><button class="${DICTTAB==='search'?'act':''}" data-act="dtab" data-t="search">Buscar</button><button class="${DICTTAB==='saved'?'act':''}" data-act="dtab" data-t="saved">Guardadas (${G.saved.length})</button></div>
   <div class="list mt3" id="dres"></div></div>`;
}
const fold=s=>s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'');
function wordRow(w){ return `<div class="wrow"><div class="grow">${lineHTML(w,{showEs:true})}</div><button class="iconbtn" data-act="say" data-m="${encodeURIComponent(w.m)}">${I('play',{s:18})}</button><button class="iconbtn star-btn ${isSaved(w.m)?'on':''}" data-act="save" data-m="${encodeURIComponent(w.m)}" data-es="${esc(w.es)}">${I('star',{s:20})}</button></div>`; }
function renderDict(){
  const box=$('#dres'); if(!box) return;
  let items;
  if(DICTTAB==='saved') items=G.saved;
  else { const q=fold(DICTQ.trim()); const qk=q?kataToHira(romajiToKana(q,true)):'';
    items=!q?VOCAB.slice(0,12):VOCAB.filter(w=>{const pl=plain(w.m),ka=kataToHira(kanaOf(w.m)),ro=fold(romajiOf(w.m));return pl.includes(DICTQ.trim())||ka.includes(qk)||ro.replace(/[^a-z]/g,'').includes(q.replace(/[^a-z]/g,''))&&q.replace(/[^a-z]/g,'').length>1||fold(w.es).includes(q);}); }
  box.innerHTML=items.length?items.map(wordRow).join(''):`<div class="card t-sm muted">${DICTTAB==='saved'?'Aún no guardas palabras. Toca cualquier palabra japonesa de la app y pulsa ☆.':'Sin resultados. Prueba con «huevo», «tamago» o «たまご».'}</div>`;
  applyLayers();
}
function bindDict(){ const q=$('#dq'); q.addEventListener('input',()=>{DICTQ=q.value;renderDict();}); renderDict(); }
function tabProfile(){
  const u=G.user, lvl=LEVELS.find(l=>l.id===u.level);
  return `<div class="pad"><div class="t-display" style="padding-top:20px">Mi progreso</div>
   <div class="card mt4 row"><div class="avatar" style="width:56px;height:56px;font-size:22px">${esc((u.name||'I')[0].toUpperCase())}</div><div class="grow"><div class="t-h2">${esc(u.name||'Invitado')}</div><div class="t-sm muted">${lvl.t} · Japonés</div></div></div>
   <div class="row mt3"><div class="stat"><b>${currentStreak()}</b><span class="t-sm muted">días de racha</span></div><div class="stat"><b>${G.stats.missions}</b><span class="t-sm muted">misiones</span></div><div class="stat"><b>${G.saved.length}</b><span class="t-sm muted">palabras</span></div></div>
   <div class="sec-ttl"><div class="t-h2">Ajustes</div></div>
   <div class="list">
     <button class="li" data-act="layers"><span class="ico" style="background:var(--lav-50)"><span class="jp" style="font-weight:900">文</span></span><span class="grow"><b>Ayudas de lectura</b><br><span class="t-sm muted">${['furi','ro','es'].filter(k=>u.layers[k]).map(k=>({furi:'Hiragana',ro:'Romaji',es:'Español'})[k]).join(' · ')||'Solo japonés'}</span></span>${I('chev')}</button>
     <div class="card"><b>Velocidad de voz</b><div class="seg mt2"><button class="${u.speed===1?'act':''}" data-act="speed" data-v="1">Normal</button><button class="${u.speed<1?'act':''}" data-act="speed" data-v="0.7">Lenta 0,7x</button></div></div>
     <div class="card"><b>Modo de respuesta por defecto</b><div class="seg mt2"><button class="${u.mode==='voice'?'act':''}" data-act="setMode" data-m="voice">${I('mic',{s:18})} Voz</button><button class="${u.mode==='text'?'act':''}" data-act="setMode" data-m="text">${I('kb',{s:18})} Escribir</button></div></div>
     <button class="tgl ${u.notif?'on':''}" data-act="notif"><span class="grow"><b>Recordatorio diario</b><br><span class="t-sm muted">Para no perder la racha</span></span><span class="sw"></span></button>
     <button class="li" data-act="go" data-to="guide"><span class="ico" style="background:var(--peach-50)">${I('palette')}</span><span class="grow"><b>Guía de diseño UI</b><br><span class="t-sm muted">Medidas, colores y fotografía</span></span>${I('chev')}</button>
     <button class="li" data-act="reset"><span class="ico" style="background:var(--sand-200)">${I('refresh')}</span><span class="grow"><b>Reiniciar prototipo</b><br><span class="t-sm muted">Borra progreso y ajustes de este navegador</span></span></button>
     <button class="li" data-act="logout"><span class="ico" style="background:var(--coral-50);color:var(--coral-700)">${I('logout')}</span><span class="grow"><b>Cerrar sesión</b></span></button>
   </div></div>`;
}

/* ---------- Ficha del escenario ---------- */
const KEY_VOCAB=['一人{ひとり}','メニュー','卵{たまご}','入{はい}って','お会計{かいけい}','おねがいします','すみません'];
SCREENS.ficha=()=>{
  const u=G.user;
  mount(`<div class="scroll" style="padding-bottom:16px"><div class="hero"><img src="${IMG.fachada}" alt="Fachada de Maruya Shokudō con cortinas noren"><div class="hdr" style="color:#fff"><button class="iconbtn" data-act="back" style="background:rgba(45,31,43,.35);backdrop-filter:blur(8px)">${I('back')}</button></div></div>
   <div class="pad" style="margin-top:-40px;position:relative;z-index:2">
    <div class="t-cap">まるや食堂 · Maruya Shokudō</div>
    <div class="t-display mt1">Tu primer pedido en Tokio</div>
    <div class="row mt3" style="flex-wrap:wrap;gap:8px"><span class="chip lav">Principiante</span><span class="chip">${I('clock',{s:16})} 10 min</span><span class="chip">5 misiones + 3 bonus</span></div>
    <p class="muted mt3">Es hora del almuerzo en un comedor familiar de barrio. Llegas solo/a, tienes hambre y no sabes qué pedir. Nakamura-san te atiende.</p>
    ${G.tip?`<div class="card peach mt3"><div class="t-cap" style="color:#8A5A12">Esta vez intenta</div><div class="mt1">${lineHTML(G.tip,{showEs:true})}</div></div>`:''}
    <div class="sec-ttl"><div class="t-h2">Lo que vas a lograr</div></div>
    <div class="card" style="padding:4px 16px">${MISSIONS.map((m,i)=>`<div class="mis"><span class="n">${I(m.icon,{s:20})}</span><span class="grow"><b>${m.title}</b><br><span class="t-sm faint jp">${i+1} · ${m.k}</span></span></div>`).join('')}</div>
    <div class="sec-ttl"><div class="t-h2">Vocabulario clave</div><span class="t-sm faint">Toca para escuchar</span></div>
    <div class="ing-chips">${KEY_VOCAB.map(m=>`<button class="jp">${jaHTML(m)}</button>`).join('')}</div>
    <div class="sec-ttl"><div class="t-h2">Modo de respuesta</div></div>
    <div class="seg"><button class="${u.mode==='voice'?'act':''}" data-act="setMode" data-m="voice" data-re="1">${I('mic',{s:18})} Voz</button><button class="${u.mode==='text'?'act':''}" data-act="setMode" data-m="text" data-re="1">${I('kb',{s:18})} Escribir</button></div>
    <button class="li mt3" data-act="layers"><span class="ico" style="background:var(--lav-50)"><span class="jp" style="font-weight:900">文</span></span><span class="grow"><b>Capas de lectura</b><br><span class="t-sm muted">Puedes cambiarlas durante la conversación</span></span>${I('chev')}</button>
   </div></div>
   <div class="sticky-cta"><div class="row"><button class="btn btn-ghost" style="width:auto" data-act="go" data-to="flash">${I('book',{s:20})}</button><button class="btn btn-primary grow" data-act="startScenario">Entrar al restaurante</button></div></div>`);
};

/* =========================================================
   ACTIVIDAD INMERSIVA
   ========================================================= */
SCREENS.activity=(p)=>{
  const resumed=p.resume&&G.resume;
  const S=resumed?restoreSession(G.resume):newSession();
  G.resume=snapshot(S); save();
  const A=CUR={kind:'act',S,heard:null,bigPhrase:null,busy:false,hintLv:0,hintCtx:null,announced:new Set(),timers:[],recId:0,
    dispose(){window.removeEventListener('resize',layoutStage);this.timers.forEach(clearTimeout);clearTimeout(this.idleT);try{this.rec&&this.rec.abort()}catch(e){}},
    later(fn,ms){const t=setTimeout(fn,ms);this.timers.push(t);return t;}};
  mount(`<div class="topbar"><button class="iconbtn" data-act="exitAct" aria-label="Salir">${I('close')}</button><div class="prog" id="prog"></div><button class="iconbtn solid" data-act="layers" aria-label="Capas de lectura"><span class="jp" style="font-weight:900;font-size:18px">文</span></button></div>
    <div class="stage" id="stage"><span class="cap chip dark" id="cap"></span><button class="iconbtn exp" data-act="viewer" aria-label="Ver escena completa">${I('expand',{s:20})}</button><div class="mhead" id="mhead"></div></div>
    <div class="dialog" id="dlg" aria-live="polite"></div>
    <div class="composer" id="cmp"></div>`,'act-screen');
  renderProg(); renderComposer();
  window.addEventListener('resize',layoutStage);
  if(S.ended){ finishScenario(true); return; }
  if(resumed){
    setScene(sceneFor(S),true); rerenderDialog(); renderMhead(); A.announced.add(activeMission(S));
    pushMsg({t:'sofia',text:'¡Volviste! Seguimos donde quedaste.'});
  } else {
    setScene('fachada',true); renderMhead(true);
    A.later(()=>{ setScene('mostrador'); renderMhead(); },1700);
    A.later(()=>{ waiterSay(W.greet); },2500);
    A.later(()=>{ announce('M1'); },3600);
  }
  resetIdle();
};
function renderProg(popId){
  const S=CUR.S, act=S.ended?null:activeMission(S);
  $('#prog').innerHTML=MISSIONS.map(m=>`<div class="st ${S.done[m.id]?'done':''} ${m.id===act?'cur':''} ${m.id===popId?'pop':''}" title="${m.title}"><div class="bar">${S.done[m.id]?I('check',{s:16,w:3}):I(m.icon,{s:16})}</div>${m.label}</div>`).join('');
}
function renderMhead(intro){
  const S=CUR.S, el=$('#mhead'); if(!el) return;
  const n=Object.keys(S.done).length;
  if(intro){ el.innerHTML=`<div><div class="k">Escenario 1</div><div class="t">まるや食堂 · Maruya Shokudō</div></div>`; return; }
  if(S.ended){ el.innerHTML=`<div><div class="k">Escenario completo</div><div class="t">¡Lo lograste! ごちそうさまでした</div></div><span class="cnt">5/5</span>`; return; }
  const id=activeMission(S), i=MISSIONS.findIndex(m=>m.id===id), m=MISSIONS[i];
  el.innerHTML=`<div><div class="k">Misión ${i+1} · <span class="jp">${m.k}</span></div><div class="t">${m.title}</div></div><span class="cnt">${n}/5</span>`;
}

/* ----- Escena: recorte con punto focal + zonas táctiles ----- */
function setScene(name,instant){
  const A=CUR, st=$('#stage'); if(!st) return;
  A.S.scene=name; const sc=sceneView(name,A.S);
  const layer=document.createElement('div'); layer.className='stage-layer'; layer.style.opacity=instant?1:0;
  layer.innerHTML=`<div class="stage-inner" data-ratio="${sc.ratio}" data-focal="${sc.focal}"><img src="${IMG[sc.img]}" alt="${sc.cap}">${hotspotsHTML(name)}</div>`;
  st.insertBefore(layer,st.querySelector('.cap'));
  const old=[...st.querySelectorAll('.stage-layer')].filter(l=>l!==layer);
  layoutStage();
  requestAnimationFrame(()=>{ layer.style.opacity=1; old.forEach(o=>{o.style.opacity=0;setTimeout(()=>o.remove(),950);}); });
  st.querySelector('.served-card')?.remove();
  if(name==='servido' && A.S.ordered){
    const d=A.S.ordered;
    st.insertAdjacentHTML('beforeend',`<button class="served-card" data-act="hs" data-a="dish"><b>${plain(d.m)}</b><br>${d.es}</button>`);
  }
  $('#cap').innerHTML=`<span class="jp">${sc.cap}</span>`;
}
function sceneView(name,S){
  const view=SCENES[name];
  return name==='servido' && S.ordered?.id!=='oyakodon' ? {...view,img:'mesa',cap:'お待たせしました · Plato servido'} : view;
}
function hotspotsHTML(name){ const S=CUR.S; return SCENES[name].hs.filter(h=>!h.need||S.done[h.need]).map(h=>`<button class="hs" style="left:${h.x}%;top:${h.y}%" data-act="hs" data-a="${h.act}" aria-label="${h.label}"><span>${h.label}</span></button>`).join(''); }
function refreshHotspots(){ const ls=app.querySelectorAll('.stage-layer'); const inner=ls.length&&ls[ls.length-1].querySelector('.stage-inner'); if(!inner) return; inner.querySelectorAll('.hs').forEach(h=>h.remove()); inner.insertAdjacentHTML('beforeend',hotspotsHTML(CUR.S.scene)); }
function layoutStage(){
  const st=$('#stage'); if(!st) return; const W0=st.clientWidth,H0=st.clientHeight;
  st.querySelectorAll('.stage-inner').forEach(el=>{
    const r=+el.dataset.ratio, f=+el.dataset.focal;
    let w=Math.max(W0,H0*r), h=w/r; if(h<H0){h=H0;w=h*r;}
    const left=Math.min(0,Math.max(W0-w,W0/2-f*w)), top=(H0-h)/2;
    Object.assign(el.style,{width:w+'px',height:h+'px',left:left+'px',top:top+'px'});
  });
}
function timecut(jp,es){ const st=$('#stage'); const d=document.createElement('div'); d.className='timecut'; d.innerHTML=`<div class="jp">${rubyOnly(jp)}</div><div class="t-sm" style="opacity:.85;margin-top:4px">${es}</div>`; st.appendChild(d); setTimeout(()=>d.remove(),2500); }

/* ----- Diálogo ----- */
function msgHTML(x,i){
  const L=G.user.layers;
  if(x.t==='waiter') return `<div class="msg waiter"><div class="mini-av w">${x.av||'中'}</div><div class="bub" data-act="toggleEs" data-i="${i}"><div class="who">${x.who||'中村さん · Mesero'}</div>${lineHTML(x,{showEs:x.showEs,esHint:!L.es&&!x.showEs&&i===lastWaiterIdx()})}<div class="aud"><button data-act="play" data-i="${i}">${I('play',{s:14})} Repetir</button><button data-act="play" data-i="${i}" data-slow="1">${I('turtle',{s:16})} Lento</button></div></div></div>`;
  if(x.t==='me'){ const hasKana=/[ぁ-んァ-ン]/.test(x.text)&&!/[一-鿿A-Za-z]/.test(x.text); return `<div class="msg me"><div class="bub" style="cursor:default"><div class="who" style="justify-content:flex-end">Tú</div><div class="ja">${esc(x.text)}</div>${L.ro&&hasKana?`<div class="ro">${esc(kanaToRomaji(x.text))}</div>`:''}</div></div>`; }
  if(x.t==='corr') return `<div class="corr"><div class="lbl">${I('sparkle',{s:14})} Mejor así</div>${lineHTML(x,{showEs:true})}<div class="aud"><button data-act="play" data-i="${i}">${I('play',{s:14})} Escuchar e imitar</button></div><details><summary>¿Por qué?</summary>${esc(x.exp)}</details></div>`;
  if(x.t==='sofia') return `<div class="msg sofia"><div class="mini-av"><img src="${IMG.sofia}" alt="Sofía"></div><div class="bub"><div class="who">Sofía · guía</div><div class="txt">${esc(x.text)}</div>${x.btn?`<button class="btn btn-sm btn-lav mt2" style="background:var(--surface)" data-act="${x.btn[1]}">${x.btn[0]}</button>`:''}</div></div>`;
  if(x.t==='sep') return `<div style="text-align:center" class="t-cap"><span class="jp">${rubyOnly(x.jp)}</span> · ${x.es}</div>`;
  return '';
}
function lastWaiterIdx(){ const m=CUR.S.msgs; for(let i=m.length-1;i>=0;i--) if(m[i].t==='waiter') return i; return -1; }
function rerenderDialog(){ const d=$('#dlg'); if(!d) return; d.innerHTML=CUR.S.msgs.map(msgHTML).join(''); d.scrollTop=d.scrollHeight; }
function pushMsg(x){
  const S=CUR.S; S.msgs.push(x); if(CUR.kind==='act'){ G.resume=snapshot(S); save(); } const d=$('#dlg'); if(!d) return;
  d.querySelector('.typing')?.remove();
  if(x.t==='waiter') d.querySelectorAll('.es-hint').forEach(e=>e.remove());
  d.insertAdjacentHTML('beforeend',msgHTML(x,S.msgs.length-1));
  requestAnimationFrame(()=>d.scrollTop=d.scrollHeight);
}
function waiterSay(l, autoplay=G.user.autoplay){
  const S=CUR.S, entry=S.sub==='entry';
  pushMsg({t:'waiter',m:l.m,es:l.es,who:entry?'店員さん · Recepción':'中村さん · Mesero',av:entry?'店':'中'});
  S.lastW=l; if(autoplay) speak(l.m);
}
function showTyping(){ const d=$('#dlg'); d.insertAdjacentHTML('beforeend',`<div class="typing"><span class="dots"><i></i><i></i><i></i></span> ${CUR.S.sub==='entry'?'店員さん':'中村さん'} está respondiendo…</div>`); d.scrollTop=d.scrollHeight; }
function announce(id){ const A=CUR; if(A.announced.has(id)||A.S.ended) return; A.announced.add(id); pushMsg({t:'sofia',text:SOFIA_INTRO[id]}); renderMhead(); }

/* ----- Turno del usuario ----- */
async function sendAct(raw, channel='text'){
  const A=CUR,S=A.S; raw=(raw||'').trim(); if(!raw||A.busy||S.ended) return;
  resetIdle(); A.bigPhrase=null; A.heard=null; closeNudge();
  const display=toDisplay(raw);
  const prevActive=activeMission(S);
  pushMsg({t:'me',text:display});
  A.busy=true; renderComposer(); showTyping();
  let res;
  try{
    res=await conversation.sendTurn({text:raw, channel, scenario:'restaurant', session:S});
  }catch{
    if(CUR===A){ A.busy=false; $('#dlg')?.querySelector('.typing')?.remove(); renderComposer(); toast('No se pudo enviar el turno.'); }
    return;
  }
  if(CUR!==A||!res) return;
  A.last=res;
  if(res.tutor.has_error){ S.corr.push({m:res.tutor.corrected.m,es:res.tutor.corrected.es,exp:res.tutor.explanation_es,said:display}); pushMsg({t:'corr',m:res.tutor.corrected.m,es:res.tutor.corrected.es,exp:res.tutor.explanation_es}); }
  showTyping();
  A.later(()=>{
    res.replies.forEach(line=>waiterSay(line, G.user.autoplay&&!res.end_scene));
    res.sofia.forEach(t=>pushMsg({t:'sofia',text:t}));
    if(res.end_scene){
      finishScenario(true);
      const farewell=res.replies.at(-1);
      if(farewell&&G.user.autoplay) speak(farewell.m);
      return;
    }
    let maxDelay=0;
    res.events.forEach(ev=>{
      const dl=ev.delay||0; maxDelay=Math.max(maxDelay,dl);
      if(ev.type==='mission'){ recordPracticeDay(); renderProg(ev.id); renderMhead(); refreshHotspots(); }
      if(ev.type==='bonus'){ toast('★ Bonus: '+BONUS.find(b=>b.id===ev.id).title); }
      if(ev.type==='scene') A.later(()=>{ setScene(ev.scene); renderMhead(); },dl);
      if(ev.type==='openMenu') A.later(()=>{ openCarta(); },dl);
      if(ev.type==='timecut') A.later(()=>{ timecut(ev.jp,ev.es); A.later(()=>{ setScene(ev.scene); pushMsg({t:'sep',jp:ev.jp,es:ev.es}); },1000); },dl);
      if(ev.type==='slow') toast('Audio lento activado (0,7x)');
      if(ev.type==='nudge') pushMsg({t:'sofia',text:'¿Te quedaste en blanco? Te ayudo con una pista.',btn:['Ver pista','hint']});
    });
    if(res.followup){ const f=res.followup; maxDelay=Math.max(maxDelay,f.delay); A.later(()=>{ waiterSay(f.line); if(f.sofia) pushMsg({t:'sofia',text:f.sofia}); },f.delay); }
    const now=activeMission(S);
    if(now!==prevActive&&!S.ended) A.later(()=>announce(now),maxDelay+900);
    A.later(()=>{ A.busy=false; renderComposer(); }, maxDelay+(res.events.some(e=>e.type==='timecut')?1050:0));
    if(G.user.dev) console.log('[turno]',JSON.stringify(res,null,1));
  },650+Math.random()*450);
}

/* ----- Panel de respuesta ----- */
function renderComposer(){
  const A=CUR, c=$('#cmp'); if(!c) return;
  if(A.kind==='chat') return renderChatComposer();
  const voice=G.user.mode==='voice', S=A.S;
  if(S.ended){ c.innerHTML=`<button class="btn btn-primary" data-act="finishNow">Ver resultados</button>`; return; }
  let top='';
  if(A.heard) top=heardHTML();
  else if(A.bigPhrase) top=`<div class="big-phrase"><div class="t-cap">Léela en voz alta</div>${lineHTML(A.bigPhrase,{showEs:true})}<div class="aud" style="justify-content:center"><button data-act="sayBig">${I('play',{s:14})} Escuchar</button></div></div>`;
  if(voice){
    c.innerHTML=(S.done.M2?'<button class="menu-shortcut" data-act="openCarta">Ver carta</button>':'')+top+`<div class="voice-row"><button class="roundbtn hint" data-act="hint" aria-label="Pista">${I('bulb')}<small>Pista</small></button>
      <div class="col" style="align-items:center;gap:10px"><button class="ptt" id="ptt" aria-label="Mantén para hablar" ${A.busy?'disabled':''}>${I('mic',{s:34})}</button><div class="ptt-lbl" id="pttl">${A.busy?'Esperando respuesta…':'MANTÉN PARA HABLAR'}</div></div>
      <button class="roundbtn" data-act="mode" data-m="text" aria-label="Escribir">${I('kb')}<small>Escribir</small></button></div>`;
    bindPTT();
  } else {
    const keep=$('#ci')?.value||A.draft||'';
    c.innerHTML=(S.done.M2?'<button class="menu-shortcut" data-act="openCarta">Ver carta</button>':'')+top+`<div id="kprev" class="t-sm" style="min-height:0;padding:0 6px 6px 64px;color:var(--ink-3)"></div>
     <div class="cmp-row"><button class="roundbtn hint" data-act="hint" aria-label="Pista">${I('bulb')}</button>
     <form class="cmp-in" id="cf"><input id="ci" placeholder="Escribe en romaji, kana o japonés" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" enterkeyhint="send"><button class="send" type="submit" aria-label="Enviar">${I('send',{s:20})}</button></form>
     <button class="roundbtn" data-act="mode" data-m="voice" aria-label="Hablar">${I('mic')}</button></div>`;
    const ci=$('#ci'); ci.value=keep; A.draft='';
    bindInput(ci,v=>sendAct(v));
  }
}
function heardHTML(){ const h=CUR.heard; return `<div class="heard"><div class="t-cap">Revisa lo que entendí${h.sim?' · simulado':''}</div><div class="ja mt1">${esc(h.text)}</div>${G.user.layers.ro?(h.m?`<div class="ro">${romajiOf(h.m)}</div>`:(/[ぁ-ん]/.test(h.text)&&!/[\u4e00-\u9fff]/.test(h.text)?`<div class="ro">${esc(kanaToRomaji(h.text))}</div>`:'')):''}${h.sim?'<p class="t-sm faint mt1">Transcripción simulada con una frase de práctica. Puedes enviarla o cambiar a Escribir.</p>':''}<div class="row mt3"><button class="btn btn-ghost btn-sm" data-act="reRec">${I('refresh',{s:16})} Grabar de nuevo</button><button class="btn btn-primary btn-sm grow" data-act="sendHeard">Enviar</button></div></div>`; }
function bindInput(ci,onSend){
  const prev=$('#kprev');
  const upd=()=>{ resetIdle(); const v=ci.value; if(prev){ prev.innerHTML=(G.user.conv&&/[a-z]/i.test(v)&&!isSpanish(v))?`<span class="jp" style="color:var(--ink-2);font-weight:800">→ ${esc(toDisplay(v,true))}</span> <button class="link t-sm" data-act="convOff" style="margin-left:6px">Desactivar</button>`:''; } };
  ci.addEventListener('input',upd);
  ci.addEventListener('focus',()=>{ app.querySelector('.act-screen')?.classList.add('compact'); setTimeout(layoutStage,380); });
  ci.addEventListener('blur',()=>{ setTimeout(()=>{ app.querySelector('.act-screen')?.classList.remove('compact'); setTimeout(layoutStage,380); },150); });
  $('#cf').addEventListener('submit',e=>{ e.preventDefault(); const v=ci.value; if(!v.trim()||CUR?.busy) return; ci.value=''; upd(); onSend(v); ci.focus(); });
  upd();
}

/* ----- Voz: mantener para hablar ----- */
function bindPTT(){
  const b=$('#ptt'); if(!b) return;
  b.addEventListener('pointerdown',e=>{ e.preventDefault(); try{b.setPointerCapture(e.pointerId)}catch(_){} startRec(); });
  ['pointerup','pointercancel'].forEach(ev=>b.addEventListener(ev,()=>stopRec()));
  b.addEventListener('keydown',e=>{ if((e.key===' '||e.key==='Enter')&&!e.repeat){e.preventDefault();startRec();} });
  b.addEventListener('keyup',e=>{ if(e.key===' '||e.key==='Enter'){e.preventDefault();stopRec();} });
}
function startRec(){
  const A=CUR; if(A.recording||A.busy) return; resetIdle(); closeNudge();
  A.recording=true; A.recText=''; const id=++A.recId; A.curRec=id;
  $('#ptt')?.classList.add('rec'); const l=$('#pttl'); if(l) l.textContent='SUELTA PARA SIMULAR LA VOZ';
  if('speechSynthesis' in window) try{speechSynthesis.cancel()}catch(e){}
}
function stopRec(){
  const A=CUR;
  if(!A||!A.recording) return;
  A.recording=false;
  $('#ptt')?.classList.remove('rec');
  finishRec(A, A.curRec);
}
async function finishRec(A,id){
  const sample=A.kind==='act'?hintFor(A.S).ph:chatSuggestion();
  try{
    const heard=await conversation.transcribe({sample, scenario:A.kind});
    if(CUR!==A || A.curRec!==id || G.user.mode!=='voice') return;
    A.heard=heard; renderComposer();
  }catch{
    if(CUR!==A) return;
    G.user.mode='text'; save(); renderComposer(); toast('Puedes continuar por escrito.');
  }
}

/* ----- Pistas (3 niveles) ----- */
function openHint(){
  const A=CUR, S=A.S, h=hintFor(S); resetIdle(); closeNudge();
  if(A.hintCtx!==h.ctx){ A.hintCtx=h.ctx; A.hintLv=0; }
  if(A.hintLv===0){ A.hintLv=1; S.hints++; }
  const lv=A.hintLv;
  const body=`<div class="msg sofia" style="max-width:100%"><div class="mini-av"><img src="${IMG.sofia}" alt=""></div><div class="bub"><div class="txt">Intenta primero con la idea; si hace falta, te doy las palabras y luego la frase.</div></div></div>
   <div class="list mt3">
    <div class="hint-step"><span class="n">1</span><div class="grow"><b>Qué hacer</b><p class="t-sm muted" style="margin:4px 0 0">${esc(h.l1)}</p></div></div>
    <div class="hint-step ${lv<2?'locked':''}"><span class="n">2</span><div class="grow"><b>Palabras clave</b>${lv>=2?h.kw.map(k=>`<div class="kw"><span class="ja">${jaHTML(k.m)}</span><span class="t-sm muted grow">= ${esc(k.es)}</span><button class="iconbtn" data-act="say" data-m="${encodeURIComponent(k.m)}">${I('play',{s:16})}</button></div>`).join(''):'<p class="t-sm" style="margin:4px 0 0">Se desbloquea con el siguiente toque</p>'}</div></div>
    <div class="hint-step ${lv<3?'locked':''}"><span class="n">3</span><div class="grow"><b>Frase sugerida</b>${lv>=3?`<div class="mt1">${lineHTML(h.ph,{showEs:true,ro:true})}</div><div class="aud"><button data-act="say" data-m="${encodeURIComponent(h.ph.m)}">${I('play',{s:14})} Escuchar</button><button data-act="say" data-slow="1" data-m="${encodeURIComponent(h.ph.m)}">${I('turtle',{s:16})} Lento</button></div>`:'<p class="t-sm" style="margin:4px 0 0">La frase completa, para leerla o decirla</p>'}</div></div>
   </div>
   <div class="mt4">${lv<3?`<button class="btn btn-secondary" data-act="hintNext">Ver siguiente pista (${lv+1}/3)</button>`:`<button class="btn btn-primary" data-act="useHint">Usar esta frase</button>`}</div>
   <p class="t-sm faint mt2" style="text-align:center">Las pistas no restan misiones; se cuentan en tu resumen.</p>`;
  sheet('Ayuda en el turno',body,'hint');
}

/* ----- Carta del restaurante ----- */
function dishImg(d,big){ return d.img?`<img src="${IMG[d.img]}" alt="${plain(d.m)}">`:`<span style="color:rgba(45,31,43,.55)">${d.glyph}</span>`; }
function dishStatus(S,d){
  if(!S) return '';
  const states = [];
  if(S.selDish?.id===d.id) states.push('En vista');
  if(S.pendDish?.id===d.id) states.push('Pedido por confirmar');
  if(S.ordered?.id===d.id) states.push('Confirmado');
  return states.length ? '<span class="order-state">'+states.join(' · ')+'</span>' : '';
}
function openCarta(){
  const S=CUR&&CUR.S; const L=G.user.layers;
  const cats=[...new Set(MENU.map(d=>d.cat))];
  const body=`<div class="carta"><div class="carta-ttl">お品書き</div><div class="t-sm faint" style="text-align:center">${L.ro?'oshinagaki · ':''}まるや食堂</div>
   ${cats.map(c=>{const ds=MENU.filter(d=>d.cat===c);return `<div class="carta-sec">${rubyOnly(c==='飲み物'?'飲{の}み物{もの}':c==='麺類'?'麺類{めんるい}':c==='甘味'?'甘味{かんみ}':'ご飯{はん}もの')}<span class="t-sm faint" style="font-family:var(--f-ui)">${ds[0].catEs}</span></div>
     ${ds.map(d=>`<button class="dish ${S&&S.selDish&&S.selDish.id===d.id?'sel':''}" data-act="dish" data-id="${d.id}"><span class="dish-img" style="background:${d.bg}">${dishImg(d)}</span><span class="grow"><span class="ja">${rubyOnly(d.m)}</span>${dishStatus(S,d)}${L.ro?`<span class="ro" style="display:block">${romajiOf(d.m)}</span>`:''}${L.es?`<span class="t-sm muted" style="display:block">${d.es}</span>`:''}</span><span class="price">${d.price?d.price+'円':'無料'}</span></button>`).join('')}`;}).join('')}
  </div><p class="t-sm faint mt3" style="text-align:center">Toca un plato para ver sus ingredientes y escucharlo.</p>`;
  sheet('Carta del restaurante',body,'carta');
}
function openDish(id){
  const d=MENU.find(x=>x.id===id); const inAct=CUR&&CUR.kind==='act'&&!CUR.S.ended;
  if(inAct){ CUR.S.selDish=d; G.resume=snapshot(CUR.S); save(); }
  const body=`<div class="dish-hero" style="background:${d.bg}">${dishImg(d,true)}</div>
   <div class="row mt4"><div class="grow">${lineHTML({m:d.m,es:d.es},{showEs:true})}</div><div class="price" style="font-size:20px">${d.price?d.price+'円':'無料'}</div></div>
   <div class="aud"><button data-act="say" data-m="${encodeURIComponent(d.m)}">${I('play',{s:14})} Escuchar nombre</button><button data-act="say" data-slow="1" data-m="${encodeURIComponent(d.m)}">${I('turtle',{s:16})} Lento</button></div>
   <div class="t-cap mt4">Ingredientes · 材料</div>
   <div class="ing-chips mt2">${d.ing.filter(k=>k!=='niku'||!d.ing.some(x=>x==='butaniku'||x==='toriniku')).map(k=>`<button>${jaHTML(ING[k].m)}</button>`).join('')}</div>
   <p class="t-sm faint mt2">Toca un ingrediente para ver su lectura y guardarlo.</p>
   ${d.id==='kitsune_udon'?`<div class="card peach mt3 t-sm"><b>Nota cultural:</b> ${NOTES.dashi}</div>`:''}
   ${inAct?`<div class="btn-stack mt4"><button class="btn btn-secondary" data-act="draft" data-m="${encodeURIComponent('これ|に|卵{たまご}|が|入{はい}って|います|か。')}">Preguntar por un ingrediente</button>${d.food?`<button class="btn btn-primary" data-act="draft" data-m="${encodeURIComponent(d.m+'|を|おねがいします。')}">Pedir este plato</button>`:''}</div><p class="t-sm faint mt2" style="text-align:center">La frase queda lista en tu panel; tú decides cuándo enviarla.</p>`:''}`;
  sheet(plain(d.m),dishStatus(CUR?.kind==='act'?CUR.S:null,d)+body,'dish');
}
function setDraft(m,es){
  const A=CUR; closeSheet();
  if(G.user.mode==='voice'){ A.bigPhrase={m,es:es||''}; renderComposer(); }
  else { const ci=$('#ci'); if(ci){ ci.value=plain(m); ci.dispatchEvent(new Event('input')); ci.focus(); } }
}

/* ----- Silencio: pista proactiva a los 20 s ----- */
function resetIdle(){ const A=CUR; if(!A||A.kind!=='act') return; clearTimeout(A.idleT); A.idleT=setTimeout(showNudge,20000); }
function showNudge(){ const A=CUR; if(!A||A.kind!=='act'||A.S.ended||app.querySelector('.ovl')||A.busy) return resetIdle();
  const c=$('#cmp'); if(!c||c.querySelector('.sofia-nudge')) return;
  c.insertAdjacentHTML('beforeend',`<div class="sofia-nudge"><div class="mini-av"><img src="${IMG.sofia}" alt=""></div><span class="t">¿Quieres una pista?</span><button class="btn btn-sm btn-secondary" style="height:32px" data-act="hint">Sí</button><button class="iconbtn" style="width:32px;height:32px" data-act="closeNudge">${I('close',{s:16})}</button></div>`); }
function closeNudge(){ app.querySelector('.sofia-nudge')?.remove(); }

/* ----- Salir y cierre ----- */
function finishScenario(complete){
  const S=CUR.S;
  const done=MISSIONS.filter(m=>S.done[m.id]).map(m=>m.id);
  const R={complete,done,bonus:Object.keys(S.bonus),corr:S.corr.slice(),expr:S.expr.slice(),hints:S.hints,hint3:S.hint3,turns:S.turns,secs:Math.round((Date.now()-S.t0)/1000),ordered:S.ordered&&S.ordered.id};
  R.stars=complete?(R.hint3===0&&R.corr.length<=2?3:R.hint3<=2?2:1):0;
  G.stats.missions+=Math.max(0,done.length-(S.countedMissions||0)); S.countedMissions=done.length; if(complete) G.stats.scenarios++;
  if(done.length) recordPracticeDay();
  G.tip=R.corr.length?{m:R.corr[0].m,es:R.corr[0].es}:null;
  G.resume=complete?null:snapshot(S); G.last=R; save();
  go('results',{R},false);
}

/* ---------- Resultados ---------- */
const MISSION_PH={M1:{m:'一人{ひとり}|です。',es:'Vengo solo/a.'},M2:{m:'メニュー|を|ください。',es:'La carta, por favor.'},M3:{m:'親子丼{おやこどん}|に|卵{たまご}|が|入{はい}って|います|か。',es:'¿El oyakodon lleva huevo?'},M4:{m:'きつねうどん|を|おねがいします。',es:'Un kitsune udon, por favor.'},M5:{m:'お会計{かいけい}|を|おねがいします。',es:'La cuenta, por favor.'}};
SCREENS.results=(p)=>{
  const R=p.R||G.last; const ok=R.complete;
  const t=`${Math.floor(R.secs/60)} min ${R.secs%60} s`;
  const note=R.ordered==='kitsune_udon'?NOTES.dashi:[NOTES.water,NOTES.pay,NOTES.itadaki][R.turns%3];
  const conf=ok?`<div class="confetti">${Array.from({length:28},(_,i)=>`<i style="left:${(i*37)%100}%;background:${['#FF946C','#FDD599','#E5CBF2','#2D1F2B'][i%4]};animation-delay:${(i%7)*.12}s"></i>`).join('')}</div>`:'';
  mount(`<div class="scroll"><div class="res-hero">${conf}
    <div class="t-cap">Restaurante en Tokio · まるや食堂</div>
    <h1 class="t-display mt2" tabindex="-1" id="results-title">${ok?'¡Felicitaciones, lo lograste!':'¡Buen intento!'}</h1>
    ${ok?`<div class="jp t-h2 mt1">${rubyOnly('ごちそうさまでした')}</div>`:''}
    <div class="t-body muted mt1">${ok?'Completaste «Tu primer pedido en Tokio».':''} ${R.done.length} de 5 misiones${R.bonus.length?` · ${R.bonus.length} bonus`:''}</div>
    ${ok?`<div class="stars">${[1,2,3].map(i=>`<span style="color:${i<=R.stars?'#F2A93B':'var(--sand)'}">${I.fill('star',{s:40})}</span>`).join('')}</div>`:''}
    ${ok?`<div class="btn-stack mt4">
      <button class="btn btn-primary" data-act="homeTab" data-tab="lessons">Seguir con las lecciones</button>
      <button class="btn btn-secondary" data-act="homeTab" data-tab="practice">Volver al menú principal</button>
    </div>`:''}
   </div>
   <div class="pad">
    <div class="card"><div class="t-h2">Misiones</div>
     ${MISSIONS.map(m=>{const d=R.done.includes(m.id);return `<div class="mrow"><span class="ck ${d?'ok':'no'}">${d?I('check',{s:16,w:3}):I(m.icon,{s:16})}</span><div class="grow"><b>${m.title}</b>${!d?`<div class="t-sm muted mt1">Frase que la habría completado:</div><div class="row"><div class="grow">${lineHTML(MISSION_PH[m.id],{showEs:true})}</div><button class="iconbtn" data-act="say" data-m="${encodeURIComponent(MISSION_PH[m.id].m)}">${I('play',{s:18})}</button></div>`:''}</div></div>`;}).join('')}
     ${BONUS.map(b=>R.bonus.includes(b.id)?`<div class="mrow"><span class="ck ok" style="background:var(--peach-50);color:#B57914">${I.fill('star',{s:14})}</span><div class="grow"><b>Bonus:</b> ${b.title}</div></div>`:'').join('')}
    </div>
    ${R.expr.length?`<div class="sec-ttl"><div class="t-h2">Expresiones aprendidas</div></div><div class="list">${R.expr.map(wordRow).join('')}</div>`:''}
    ${R.corr.length?`<div class="sec-ttl"><div class="t-h2">Para mejorar</div></div><div class="list">${R.corr.slice(0,3).map(c=>`<div class="card"><div class="t-sm faint">Dijiste: <span class="jp">${esc(c.said)}</span></div><div class="mt1">${lineHTML(c,{showEs:true})}</div><p class="t-sm muted" style="margin:6px 0 0">${esc(c.exp)}</p></div>`).join('')}</div>`:''}
    <div class="card peach mt4"><div class="t-cap" style="color:#8A5A12">Nota cultural</div><p class="mt1" style="margin-bottom:0">${note}</p></div>
    <div class="row mt4"><div class="stat"><b>${t}</b><span class="t-sm muted">tiempo</span></div><div class="stat"><b>${R.hints}</b><span class="t-sm muted">pistas</span></div><div class="stat"><b>${R.turns}</b><span class="t-sm muted">turnos</span></div></div>
    <div class="btn-stack mt6" style="padding-bottom:32px">
     ${ok?`<button class="btn btn-primary" data-act="saveAll">${I('bookmark',{s:20})} Guardar palabras</button><button class="btn btn-secondary" data-act="startScenario">Repetir escenario</button>`
         :`<button class="btn btn-primary" data-act="resume">Retomar misión pendiente</button><button class="btn btn-secondary" data-act="startScenario">Repetir completo</button>`}
     ${ok?'':`<button class="btn btn-lav" data-act="homeTab" data-tab="practice">Volver al menú principal</button>`}
    </div>
   </div></div>`);
  $('#results-title').focus({preventScroll:true});
};

/* =========================================================
   CHARLA LIBRE / ESCRITURA LIBRE
   ========================================================= */
SCREENS.chat=(p)=>{
  const write=p.kind==='write'; const topic=FREE_TOPICS.find(t=>t.id===(p.topic||(write?'free':'intro')));
  const C=CUR={kind:'chat',write,topic,S:{msgs:[],slow:false},lastW:topic.open,heard:null,recId:0,timers:[],
    dispose(){this.timers.forEach(clearTimeout);try{this.rec&&this.rec.abort()}catch(e){}},later(fn,ms){this.timers.push(setTimeout(fn,ms));}};
  mount(`${hdr(write?'Escritura libre':'Conversación libre',true,`<button class="iconbtn solid" data-act="layers" aria-label="Capas"><span class="jp" style="font-weight:900">文</span></button>`)}
   ${write?'':`<div style="position:relative;height:150px;flex-shrink:0;margin:0 16px;border-radius:24px;overflow:hidden"><img src="${IMG.sofiaWide}" alt="Sofía con audífonos en una estación" style="width:100%;height:100%;object-fit:cover;object-position:40% 25%"><span class="chip dark" style="position:absolute;left:12px;bottom:12px">Sofía · compañera de práctica</span></div>`}
   <div class="hscroll" style="padding:12px 16px 4px;margin:0">${FREE_TOPICS.map(t=>`<button class="chip ${t.id===topic.id?'coral':''}" data-act="topic" data-id="${t.id}"><span class="jp">${t.k}</span> ${t.es}</button>`).join('')}</div>
   <div class="dialog" id="dlg"></div><div class="composer" id="cmp"></div>`);
  renderChatComposer();
  C.later(()=>chatSay(topic.open),400);
  if(write) C.later(()=>pushMsg({t:'sofia',text:'Escribe sobre el tema que quieras, en romaji, kana o japonés. Corrijo tu redacción en cada mensaje.'}),900);
};
function chatSay(l){ pushMsg({t:'waiter',m:l.m,es:l.es,who:'Sofía · compañera',av:'ソ'}); CUR.lastW=l; if(G.user.autoplay&&!CUR.write) speak(l.m); }
function chatSuggestion(){
  const m=(CUR.lastW||{}).m||''; const n=G.user.name||'ソフィア';
  if(/名前/.test(m)) return {m:`わたし|は|${n}|です。`,es:`Soy ${n}.`};
  if(/どこ/.test(m)) return {m:'コロンビア|から|来{き}ました。',es:'Vengo de Colombia.'};
  if(/一番/.test(m)) return {m:'ラーメン|が|好{す}き|です。',es:'Me gusta el ramen.'};
  if(/好/.test(m)) return {m:'はい、|好{す}き|です。',es:'Sí, me gusta.'};
  if(/趣味/.test(m)) return {m:'趣味{しゅみ}|は|アニメ|です。',es:'Mi pasatiempo es el anime.'};
  if(/元気/.test(m)) return {m:'はい、|元気{げんき}|です。',es:'Sí, estoy bien.'};
  if(/毎日/.test(m)) return {m:'はい、|毎日{まいにち}|します。',es:'Sí, todos los días.'};
  if(/行/.test(m)) return {m:'はい、|行{い}きたい|です！',es:'¡Sí, quiero ir!'};
  return {m:'はじめまして。',es:'Mucho gusto.'};
}
function renderChatComposer(){
  const C=CUR,c=$('#cmp'); const voice=!C.write&&G.user.mode==='voice';
  let top=C.heard?heardHTML():(C.sug?`<div class="big-phrase" style="text-align:left"><div class="t-cap">Sugerencia de respuesta</div>${lineHTML(C.sug,{showEs:true})}<div class="row mt2"><button class="btn btn-sm btn-ghost" data-act="say" data-m="${encodeURIComponent(C.sug.m)}">${I('play',{s:14})} Escuchar</button>${voice?'':`<button class="btn btn-sm btn-secondary" data-act="useSug">Usar</button>`}</div></div>`:'');
  if(voice){ c.innerHTML=top+`<div class="voice-row"><button class="roundbtn hint" data-act="sug">${I('bulb')}<small>Idea</small></button><div class="col" style="align-items:center;gap:10px"><button class="ptt" id="ptt">${I('mic',{s:34})}</button><div class="ptt-lbl" id="pttl">MANTÉN PARA HABLAR</div></div><button class="roundbtn" data-act="mode" data-m="text">${I('kb')}<small>Escribir</small></button></div>`; bindPTT(); }
  else { c.innerHTML=top+`<div id="kprev" class="t-sm" style="padding:0 6px 6px 64px"></div><div class="cmp-row"><button class="roundbtn hint" data-act="sug" aria-label="Sugerencia">${I('bulb')}</button><form class="cmp-in" id="cf"><input id="ci" placeholder="${C.write?'Escribe tu mensaje':'Escribe tu respuesta'}" autocomplete="off" autocapitalize="off" spellcheck="false"><button class="send" type="submit" aria-label="Enviar">${I('send',{s:20})}</button></form>${C.write?`<button class="roundbtn" data-act="doubt" aria-label="Preguntar una duda"><b style="font-size:20px">?</b></button>`:`<button class="roundbtn" data-act="mode" data-m="voice">${I('mic')}</button>`}</div>`;
    bindInput($('#ci'),v=>sendChat(v)); }
}
async function sendChat(raw, channel='text'){
  const C=CUR; raw=(raw||'').trim(); if(!raw||C.busy) return; C.busy=true; C.heard=null; C.sug=null;
  const display=toDisplay(raw);
  pushMsg({t:'me',text:display}); renderChatComposer();
  let r;
  try{ r=await conversation.sendTurn({text:raw, channel, scenario:'free', session:C}); }
  catch{ if(CUR===C){ C.busy=false; toast('No se pudo enviar el turno.'); } return; }
  if(CUR!==C) return;
  if(r.tutor&&r.tutor.corrected) pushMsg({t:'corr',m:r.tutor.corrected.m,es:r.tutor.corrected.es,exp:r.tutor.explanation_es});
  const d=$('#dlg'); d.insertAdjacentHTML('beforeend',`<div class="typing"><span class="dots"><i></i><i></i><i></i></span> Sofía está escribiendo…</div>`); d.scrollTop=d.scrollHeight;
  C.later(()=>{ if(r.tutor&&!r.tutor.corrected) pushMsg({t:'sofia',text:r.tutor.explanation_es}); chatSay(r.reply); C.busy=false; },800);
}

/* =========================================================
   LECCIONES: tarjetas y mini quiz
   ========================================================= */
let FC={i:0,cat:'Platos',flip:false};
SCREENS.flash=()=>{
  const items=VOCAB.filter(v=>v.cat===FC.cat); FC.i=Math.min(FC.i,items.length-1); const w=items[FC.i];
  mount(`${hdr('Vocabulario del restaurante')}<div class="scroll pad">
   <div class="seg">${['Platos','Ingredientes','Frases'].map(c=>`<button class="${FC.cat===c?'act':''}" data-act="fcCat" data-c="${c}">${c}</button>`).join('')}</div>
   <div class="t-sm faint mt4" style="text-align:center">${FC.i+1} / ${items.length} · toca la tarjeta para girarla</div>
   <div class="fc mt2 ${FC.flip?'flip':''}" data-act="fcFlip"><div class="fc-in">
     <div class="fc-f"><div class="big" data-nowords>${rubyOnly(w.m)}</div><div class="t-sm faint mt2">¿Qué significa?</div></div>
     <div class="fc-b"><div class="jp t-h1">${kanaOf(w.m)}</div><div class="ro" style="font-size:16px">${romajiOf(w.m)}</div><div class="t-h2 mt3">${w.es}</div></div>
   </div></div>
   <div class="row mt4" style="justify-content:center;gap:16px">
     <button class="roundbtn" data-act="fcMove" data-d="-1" aria-label="Anterior">${I('back')}</button>
     <button class="roundbtn" style="width:64px;height:64px;background:var(--coral)" data-act="say" data-m="${encodeURIComponent(w.m)}" aria-label="Escuchar">${I('play')}</button>
     <button class="roundbtn star-btn ${isSaved(w.m)?'on':''}" data-act="save" data-m="${encodeURIComponent(w.m)}" data-es="${esc(w.es)}" data-re="flash" aria-label="Guardar">${I('star')}</button>
     <button class="roundbtn" data-act="fcMove" data-d="1" aria-label="Siguiente">${I('chev')}</button>
   </div>
   <div class="btn-stack mt8"><button class="btn btn-secondary" data-act="go" data-to="quiz">Practicar en el mini quiz</button><button class="btn btn-ghost" data-act="go" data-to="ficha">Ir al escenario</button></div>
  </div>`);
};
let QZ=null;
function newQuiz(){ const pool=VOCAB.filter(v=>v.cat!=='Frases'); const sh=a=>a.map(x=>[Math.random(),x]).sort((a,b)=>a[0]-b[0]).map(x=>x[1]);
  return {i:0,score:0,ans:null,qs:sh(pool).slice(0,5).map(q=>({q,opts:sh([q,...sh(pool.filter(x=>x!==q)).slice(0,3)])}))}; }
SCREENS.quiz=()=>{
  if(!QZ||QZ.fin) QZ=newQuiz();
  if(QZ.i>=QZ.qs.length){ QZ.fin=true; mount(`${hdr('Mini quiz')}<div class="scroll pad" style="text-align:center"><div class="t-display mt8">${QZ.score}/5</div><p class="muted">${QZ.score>=4?'¡Listo para el restaurante!':'Repasa las tarjetas y vuelve a intentarlo.'}</p><div class="btn-stack mt6"><button class="btn btn-primary" data-act="go" data-to="ficha">Ir al escenario</button><button class="btn btn-secondary" data-act="go" data-to="quiz">Otro quiz</button></div></div>`); return; }
  const Q=QZ.qs[QZ.i];
  mount(`${hdr('Mini quiz')}<div class="scroll pad"><div class="steps">${QZ.qs.map((_,i)=>`<i class="${i<=QZ.i?'on':''}"></i>`).join('')}</div>
   <div class="t-cap mt4">¿Qué significa?</div>
   <div class="card mt2 row" style="padding:24px"><div class="grow"><div class="jp" style="font-size:40px;font-weight:900;line-height:1.6" data-nowords>${rubyOnly(Q.q.m)}</div>${G.user.layers.ro?`<div class="ro">${romajiOf(Q.q.m)}</div>`:''}</div><button class="iconbtn solid" data-act="say" data-m="${encodeURIComponent(Q.q.m)}">${I('play',{s:18})}</button></div>
   <div class="list mt4">${Q.opts.map((o,j)=>`<button class="qopt ${QZ.ans!=null?(o===Q.q?'right':(j===QZ.ans?'wrong':'')):''}" data-act="qAns" data-j="${j}">${o.es}</button>`).join('')}</div>
   ${QZ.ans!=null?`<button class="btn btn-primary mt4" data-act="qNext">${QZ.i<4?'Siguiente':'Ver resultado'}</button>`:''}
  </div>`);
};

/* =========================================================
   GUÍA DE DISEÑO (medidas, color y fotografía)
   ========================================================= */
SCREENS.guide=()=>{
  const sw=[['#FF946C','Coral · acción principal','Texto ink sobre coral: 7,1:1 ✓ (blanco: 2,2:1 ✗)'],['#FDD599','Durazno · pistas y apoyo','Pistas, botón secundario, correcciones'],['#E5CBF2','Lavanda · Sofía y tutor','Todo lo que dice la guía'],['#EFE0D4','Arena · neutro cálido','Fondos de controles, pendientes'],['#2D1F2B','Ink · texto','Texto principal 15,6:1 sobre fondo'],['#FBF6F1','Fondo','Superficie general de la app']];
  const sc=SCENES.mesa, vis=(390/270)/sc.ratio, left=Math.max(0,Math.min(1-vis,sc.focal-vis/2));
  mount(`${hdr('Guía de diseño UI')}<div class="scroll pad" style="padding-bottom:40px">
   <p class="muted">Decisiones de interfaz de esta versión para el equipo (UI, ilustración y programación).</p>
   <div class="sec-ttl"><div class="t-h2">Color con roles</div></div>
   <div class="sw-grid">${sw.map(s=>`<div class="swatch"><div style="background:${s[0]}"></div><p><b>${s[1]}</b><br>${s[0]} · ${s[2]}</p></div>`).join('')}</div>
   <div class="sec-ttl"><div class="t-h2">Tipografía · Nunito</div></div>
   <div class="card list" style="gap:10px">
    <div class="t-display">Display 30/36 · 900</div><div class="t-h1">Título 24/30 · 900</div><div class="t-h2">Subtítulo 18/24 · 800</div><div class="t-body">Cuerpo 16/24 · 600</div><div class="t-sm">Pequeño 14/20 · 600</div><div class="t-cap">Etiqueta 12/16 · 800</div>
    <div class="ja">日本語 20/35 · Noto Sans JP (globo)</div><p class="t-sm muted" style="margin:0">El japonés usa Noto Sans JP como respaldo de Nunito (no tiene kanji). Furigana al 50 %.</p></div>
   <div class="sec-ttl"><div class="t-h2">Espaciado · grilla 8 pt</div></div>
   <div class="card list" style="gap:8px">${[4,8,12,16,24,32].map(v=>`<div class="spc"><i style="width:${v*3}px"></i>${v} px · ${({4:'icono–texto',8:'dentro de chips',12:'entre tarjetas',16:'padding de tarjeta',24:'entre secciones',32:'bloques grandes'})[v]}</div>`).join('')}</div>
   <div class="sec-ttl"><div class="t-h2">Medidas de componentes</div></div>
   <div class="card t-sm"><ul style="margin:0;padding-left:18px;line-height:26px">
    <li>Área táctil mínima: 44 × 44 px</li><li>Botón principal: 52 px de alto, radio 16</li><li>Botón pequeño: 40 px, radio 10</li>
    <li>Panel de respuesta: una fila de 52 px (pista · campo · voz) en vez de botón «Enviar» aparte</li><li>Mantener para hablar: 84 px</li>
    <li>Globos: radio 20, máx. 200 px de alto con scroll, máx. 2 frases</li><li>Hojas inferiores: radio 24, máx. 88 % de alto</li><li>Márgenes laterales: 20 px · barra inferior flotante 64 px</li>
   </ul></div>
   <div class="sec-ttl"><div class="t-h2">Fotografía y escenario</div></div>
   <div class="safe"><img src="${IMG.mesa}" alt="Escena de la mesa"><div class="zone" style="left:${left*100}%;width:${vis*100}%"><span>Recorte en celular</span></div>${sc.hs.map(h=>`<span class="hs" style="left:${h.x}%;top:${h.y}%;pointer-events:none"></span>`).join('')}</div>
   <div class="card t-sm mt3"><ul style="margin:0;padding-left:18px;line-height:24px">
    <li><b>Una escena = una imagen 21:9</b> (3168 × 1344). En celular se recorta alrededor de un <b>punto focal</b> por escena, no al centro: el mesero nunca queda fuera.</li>
    <li><b>Zona segura:</b> personaje y objetos clave dentro del 40 % central-derecho; deja aire arriba para la etiqueta del lugar y abajo para el título de la misión.</li>
    <li><b>Zonas táctiles</b> en la foto (mesero = repetir, carta, plato, agua): la escena enseña, no solo decora.</li>
    <li>Transición por fundido de 0,9 s y paneo lento (Ken Burns 4 %); cortes de tiempo con texto (十五分後…).</li>
    <li>La escena va encima del diálogo y se compacta al escribir para darle más espacio a la conversación.</li>
    <li>Toque «expandir» para ver la imagen completa y explorar.</li>
    <li>Pendientes para Vale: fachada en alta resolución, plato servido de ramen, udon, curry y daifuku, y una entrada con Nakamura-san (hoy la recepción la hace otra empleada).</li>
   </ul></div>
  </div>`);
};

/* =========================================================
   HOJAS (bottom sheets)
   ========================================================= */
function sheet(title,body,id){
  closeSheet(true); const s=app.querySelector('.screen');
  s.insertAdjacentHTML('beforeend',`<div class="ovl" data-sheet="${id||''}" data-act="ovl"><div class="sheet" role="dialog" aria-label="${esc(title)}"><div class="grab"></div><div class="sheet-hd"><div class="t-h2">${title}</div><button class="iconbtn" data-act="closeSheet" aria-label="Cerrar">${I('close')}</button></div><div class="sheet-bd">${body}</div></div></div>`);
  applyLayers();
}
function closeSheet(instant){ app.querySelectorAll('.ovl').forEach(o=>o.remove()); if(CUR&&CUR.kind==='act') resetIdle(); }
function modal(html){ closeSheet(); app.querySelector('.screen').insertAdjacentHTML('beforeend',`<div class="ovl center" data-act="ovl"><div class="modal">${html}</div></div>`); }
function wordSheet(t){
  const s=surf(t).replace(/[、。！？]/g,''), k=readT(t).replace(/[、。！？]/g,''), clean=t.replace(/[、。！？]/g,'');
  const mean=DICT[s]||DICT[k];
  const body=`<div class="row"><div class="grow"><div class="jp" style="font-size:44px;font-weight:900;line-height:1.5" data-nowords>${rubyOnly(clean)}</div><div class="jp t-h2">${k}</div><div class="ro" style="font-size:16px">${kanaToRomaji(k)}</div></div><button class="roundbtn" style="background:var(--coral)" data-act="say" data-m="${encodeURIComponent(clean)}">${I('play')}</button></div>
   <div class="card mt4">${mean?`<b>${esc(mean)}</b>`:'<span class="muted">Aún sin definición en el diccionario del prototipo.</span>'}</div>
   <div class="btn-stack mt4"><button class="btn ${isSaved(clean)?'btn-ghost':'btn-primary'}" data-act="save" data-m="${encodeURIComponent(clean)}" data-es="${esc(mean||'')}" data-re="sheet">${I('star',{s:20})} ${isSaved(clean)?'Guardada':'Guardar en mi diccionario'}</button></div>`;
  sheet('Desde el globo',body,'word'); speak(clean);
}
function layersSheet(){
  const u=G.user;
  const body=`${layerToggles()}
   <div class="list mt3">
    <button class="tgl ${u.autoplay?'on':''}" data-act="pref" data-k="autoplay"><span class="grow"><b>Audio automático</b><br><span class="t-sm muted">Cada mensaje del mesero se reproduce solo</span></span><span class="sw"></span></button>
    <div class="card"><b>Velocidad de voz</b><div class="seg mt2"><button class="${u.speed===1?'act':''}" data-act="speed" data-v="1" data-re="sheet">Normal</button><button class="${u.speed<1?'act':''}" data-act="speed" data-v="0.7" data-re="sheet">Lenta 0,7x</button></div></div>
    <button class="tgl ${u.conv?'on':''}" data-act="pref" data-k="conv"><span class="grow"><b>Romaji → kana al escribir</b><br><span class="t-sm muted">«hitori desu» se envía como ひとりです</span></span><span class="sw"></span></button>
    <button class="tgl ${u.dev?'on':''}" data-act="pref" data-k="dev"><span class="grow"><b>Modo desarrollo</b><br><span class="t-sm muted">Ver el JSON que devolvería el backend</span></span><span class="sw"></span></button>
    ${u.dev&&CUR&&CUR.last?`<button class="btn btn-ghost" data-act="showJson">${I('code',{s:20})} Ver JSON del último turno</button>`:''}
   </div>`;
  sheet('Ayudas de lectura',body,'layers');
}

/* =========================================================
   ACCIONES (delegación de eventos)
   ========================================================= */
const ACT={
  go:a=>go(a.dataset.to), back:()=>back(), toast:a=>toast(a.dataset.t),
  say:a=>speak(decodeURIComponent(a.dataset.m),!!a.dataset.slow,a),
  haveAccount:()=>{ if(G.registered) go('home'); else { toast('No hay sesión guardada en este navegador: entra como invitado.'); go('login'); } },
  guest:()=>go('onb1'),
  onbName:()=>{ G.user.name=$('#nm').value.trim(); save(); go('onb2'); },
  level:a=>{ G.user.level=a.dataset.id; G.user.layers={zero:{furi:true,ro:true,es:false},hira:{furi:true,ro:false,es:false},n5:{furi:true,ro:false,es:false}}[a.dataset.id]; save(); SCREENS.onb2(); },
  layer:a=>{ const k=a.dataset.k; G.user.layers[k]=!G.user.layers[k]; save(); a.classList.toggle('on'); applyLayers(); if(CUR&&CUR.S&&$('#dlg')) rerenderDialog(); },
  testMic:async()=>{ try{ const s=await navigator.mediaDevices.getUserMedia({audio:true}); s.getTracks().forEach(t=>t.stop()); toast('Micrófono listo ✓'); }catch(e){ toast('Sin micrófono en esta vista: usarás el modo Escribir (o la voz simulada).'); } },
  finishOnb:()=>{ G.registered=true; save(); HIST.length=0; go('home',{tab:'practice'}); },
  tab:a=>go('home',{tab:a.dataset.tab},false), homeTab:a=>{HIST.length=0;go('home',{tab:a.dataset.tab},false);},
  talk:a=>go('chat',{kind:'talk',topic:a.dataset.topic}), write:()=>go('chat',{kind:'write'}),
  topic:a=>go('chat',{kind:CUR&&CUR.write?'write':'talk',topic:a.dataset.id},false),
  startScenario:()=>{ G.resume=null; save(); go('activity',{}); },
  resume:()=>{ if(G.resume) go('activity',{resume:true}); else go('ficha'); },
  setMode:a=>{ G.user.mode=a.dataset.m; save(); a.parentElement.querySelectorAll('button').forEach(b=>b.classList.toggle('act',b===a)); },
  mode:a=>{ G.user.mode=a.dataset.m; save(); if(CUR){CUR.heard=null;} renderComposer(); },
  speed:a=>{ G.user.speed=+a.dataset.v; save(); a.parentElement.querySelectorAll('button').forEach(b=>b.classList.toggle('act',b===a)); },
  notif:a=>{ G.user.notif=!G.user.notif; save(); a.classList.toggle('on'); },
  pref:a=>{ const k=a.dataset.k; G.user[k]=!G.user[k]; save(); if(k==='dev') layersSheet(); else a.classList.toggle('on'); },
  layers:()=>layersSheet(),
  showJson:()=>{ const r=CUR.last; const o={user_analysis:r.user_analysis,tutor:r.tutor,reply:r.replies[0]?{ja:plain(r.replies[0].m),kana:kanaOf(r.replies[0].m),romaji:romajiOf(r.replies[0].m),es:r.replies[0].es}:null,end_scene:r.end_scene};
    sheet('JSON del turno',`<pre class="json">${esc(JSON.stringify(o,null,2))}</pre><p class="t-sm faint">Mismo esquema que el backend: la interfaz solo cambia la fuente.</p>`,'json'); },
  reset:()=>modal(`<div class="t-h2">¿Reiniciar el prototipo?</div><p class="muted">Se borran nombre, progreso y palabras guardadas de este navegador.</p><div class="btn-stack mt4"><button class="btn btn-primary" data-act="doReset">Reiniciar</button><button class="btn btn-ghost" data-act="closeSheet">Cancelar</button></div>`),
  doReset:()=>{ try{localStorage.removeItem(STORE)}catch(e){} G=defaultProgress(); HIST.length=0; go('splash',{},false); },
  logout:()=>{ HIST.length=0; go('splash',{},false); },
  dtab:a=>{ DICTTAB=a.dataset.t; go('home',{tab:'dict'},false); },
  save:a=>{ toggleSave(decodeURIComponent(a.dataset.m),a.dataset.es||''); if(a.dataset.re==='flash') SCREENS.flash(); else if(a.dataset.re==='sheet'){ closeSheet(); } else { a.classList.toggle('on'); } if(ROUTE.name==='home'&&ROUTE.tab==='dict') renderDict(); },
  saveAll:()=>{ const R=G.last; let n=0; R.expr.forEach(e=>{ if(!isSaved(e.m)){G.saved.push({m:e.m,es:e.es,d:Date.now()});n++;} }); save(); toast(n?`${n} expresiones guardadas en tu diccionario`:'Ya estaban guardadas'); },
  closeSheet:()=>closeSheet(), ovl:(a,e)=>{ if(e.target===a) closeSheet(); },
  // actividad
  exitAct:()=>{ if(CUR.S.ended) return finishScenario(true); modal(`<div class="t-cap">Progreso de la sesión</div><div class="t-h1 mt1">¿Quieres salir?</div><p class="muted">Puedes guardar el avance y retomarlo más tarde desde Práctica.</p><div class="btn-stack mt4"><button class="btn btn-primary" data-act="saveExit">Guardar y salir</button><button class="btn btn-secondary" data-act="partial">Ver resumen parcial</button><button class="btn btn-lav" data-act="closeSheet">Seguir practicando</button></div>`); },
  saveExit:()=>{ const S=CUR.S; G.resume=snapshot(S); save(); CUR.dispose(); HIST.length=0; go('home',{tab:'practice'},false); toast('Progreso guardado'); },
  partial:()=>{ closeSheet(); finishScenario(false); },
  finishNow:()=>finishScenario(true),
  hint:()=>openHint(), hintNext:()=>{ const A=CUR; A.hintLv=Math.min(3,A.hintLv+1); A.S.hints++; if(A.hintLv===3) A.S.hint3++; openHint(); },
  useHint:()=>{ const h=hintFor(CUR.S); setDraft(h.ph.m,h.ph.es); },
  sayBig:a=>speak(CUR.bigPhrase.m,false,a),
  draft:a=>setDraft(decodeURIComponent(a.dataset.m)),
  closeNudge:()=>{ closeNudge(); resetIdle(); },
  play:a=>{ const x=CUR.S.msgs[+a.dataset.i]; if(x) speak(x.m,!!a.dataset.slow,a); },
  toggleEs:(a,e)=>{ if(e.target.closest('button')) return; const x=CUR.S.msgs[+a.dataset.i]; if(!x) return; x.showEs=!x.showEs; const tmp=document.createElement('div'); tmp.innerHTML=msgHTML(x,+a.dataset.i); a.closest('.msg').replaceWith(tmp.firstElementChild); },
  openCarta:()=>openCarta(),
  dish:a=>openDish(a.dataset.id),
  hs:a=>{ const k=a.dataset.a, S=CUR.S; app.querySelector('.viewer')?.remove();
    if(k==='repeat'){ if(S.lastW) speak(S.lastW.m); toast('Repitiendo el último mensaje'); }
    if(k==='menu') openCarta();
    if(k==='dish'&&S.ordered) openDish(S.ordered.id);
    if(k==='note-water') pushMsg({t:'sofia',text:NOTES.water});
    if(k==='note-pay') pushMsg({t:'sofia',text:NOTES.pay}); },
  viewer:()=>{ const sc=sceneView(CUR.S.scene,CUR.S); app.querySelector('.screen').insertAdjacentHTML('beforeend',`<div class="viewer"><div class="hdr" style="color:#fff"><button class="iconbtn" data-act="closeViewer">${I('close')}</button><div class="ttl jp">${sc.cap}</div></div><div class="vbody"><div class="vimg" style="aspect-ratio:${sc.ratio}"><img src="${IMG[sc.img]}" alt="${sc.cap}">${hotspotsHTML(CUR.S.scene)}</div></div><p class="t-sm" style="color:rgba(255,255,255,.7);text-align:center;padding:12px 20px 24px;margin:0">Desliza para recorrer la escena · toca los puntos para interactuar</p></div>`);
    const vb=app.querySelector('.vbody'); vb.scrollLeft=(vb.scrollWidth-vb.clientWidth)*sc.focal; },
  closeViewer:()=>app.querySelector('.viewer')?.remove(),
  reRec:()=>{ CUR.heard=null; renderComposer(); },
  sendHeard:()=>{ const t=CUR.heard.text; CUR.heard=null; CUR.kind==='act'?sendAct(t,'voice'):sendChat(t,'voice'); },
  convOff:()=>{ G.user.conv=false; save(); toast('Conversión a kana desactivada (actívala en 文)'); $('#ci')?.dispatchEvent(new Event('input')); },
  // charla
  sug:()=>{ CUR.sug=chatSuggestion(); CUR.heard=null; renderChatComposer(); },
  useSug:()=>{ const s=CUR.sug; CUR.sug=null; renderChatComposer(); const ci=$('#ci'); ci.value=plain(s.m); ci.dispatchEvent(new Event('input')); ci.focus(); },
  doubt:()=>{ const ci=$('#ci'); ci.value='¿Qué significa '; ci.focus(); },
  // lecciones
  fcFlip:()=>{ FC.flip=!FC.flip; app.querySelector('.fc').classList.toggle('flip'); },
  fcMove:a=>{ const n=VOCAB.filter(v=>v.cat===FC.cat).length; FC.i=(FC.i+ +a.dataset.d+n)%n; FC.flip=false; SCREENS.flash(); },
  fcCat:a=>{ FC={i:0,cat:a.dataset.c,flip:false}; SCREENS.flash(); },
  qAns:a=>{ if(QZ.ans!=null) return; QZ.ans=+a.dataset.j; const Q=QZ.qs[QZ.i]; if(Q.opts[QZ.ans]===Q.q) QZ.score++; SCREENS.quiz(); },
  qNext:()=>{ QZ.i++; QZ.ans=null; SCREENS.quiz(); },
};

document.addEventListener('click',e=>{
  const w=e.target.closest('.w');
  if(w&&!e.target.closest('[data-nowords]')&&!e.target.closest('.dish')){ e.stopPropagation(); wordSheet(decodeURIComponent(w.dataset.w)); return; }
  const a=e.target.closest('[data-act]'); if(!a) return;
  const fn=ACT[a.dataset.act]; if(fn){ fn(a,e); }
});
document.addEventListener('keydown',e=>{ if(e.key==='Escape'){ if(app.querySelector('.viewer')) ACT.closeViewer(); else closeSheet(); } });

/* Arranque */
G.registered?go('home',{tab:'practice'},false):go('splash',{},false);
