const W = {
  greet:{m:'いらっしゃいませ！|何名様{なんめいさま}|ですか。',es:'¡Bienvenido/a! ¿Cuántas personas son?'},
  greetAgain:{m:'はい、|何名様{なんめいさま}|ですか。',es:'Sí, ¿cuántas personas son?'},
  alone:{m:'お一人{ひとり}|ですか。',es:'¿Viene solo/a?'},
  seat1:{m:'一名様{いちめいさま}|ですね。|こちらへ|どうぞ。',es:'Una persona, ¿verdad? Por aquí, por favor.'},
  seat2:{m:'二名様{にめいさま}|ですね。|こちらへ|どうぞ。',es:'Dos personas, ¿verdad? Por aquí, por favor.'},
  water:{m:'お水{みず}|です。|ごゆっくり|どうぞ。',es:'Aquí tiene agua. Tómese su tiempo.'},
  menuBlank:{m:'メニュー、|いります|か。',es:'¿Necesita la carta?'},
  menu:{m:'はい、|メニュー|です。|どうぞ。',es:'Sí, aquí tiene la carta.'},
  anyQ:{m:'何{なに}か|質問{しつもん}|は|あります|か。',es:'¿Tiene alguna pregunta?'},
  order:{m:'ご注文{ちゅうもん}|は？',es:'¿Qué desea pedir?'},
  reco:{m:'おすすめ|は|親子丼{おやこどん}|です。',es:'Le recomiendo el oyakodon.'},
  which:{m:'どれ|ですか。',es:'¿Cuál?'},
  ok:{m:'かしこまりました。',es:'Entendido, enseguida.'},
  enjoy:{m:'はい、|どうぞ。',es:'Adelante, buen provecho.'},
  thanks:{m:'ありがとう|ございます！',es:'¡Muchas gracias!'},
  bye:{m:'ありがとう|ございました。|またお越{こ}し|ください。',es:'Muchas gracias. Vuelva pronto.'},
  repeat:{m:'すみません、|もう一度{いちど}|おねがいします。',es:'Disculpe, ¿puede repetirlo?'},
  notYet:{m:'先{さき}に|ご注文{ちゅうもん}|を|どうぞ。',es:'Primero haga su pedido, por favor.'},
  anythingElse:{m:'他{ほか}|に|何{なに}か|いかが|ですか。',es:'¿Desea algo más?'},
  hai:{m:'はい！',es:'¡Sí!'},
};
const join=(...ls)=>({m:ls.map(l=>l.m).join('|'),es:ls.map(l=>l.es).join(' ')});
const confirmLine=(d,q)=>({m:`${d.m}|を|${q===2?'二{ふた}つ':'一{ひと}つ'}|ですね。`,es:`${q===2?'Dos':'Un'} ${d.es}, ¿verdad?`});
const servedLine=d=>({m:`お待{ま}たせ|しました。|${d.m}|です。`,es:`Perdón por la espera. Aquí tiene: ${d.es}.`});
const priceLine=(dish, quantity=1)=>{
  if(!dish) return W.notYet;
  const total = dish.price * quantity;
  return {m:`はい、|${quantity===1?dish.priceM:total+'円'}|です。`, es:'Sí, son '+total+' yenes.'};
};
const ingYes=(d,i)=>({m:`はい、|${d.m}|には|${i.m}|が|入{はい}って|います。`,es:`Sí, el ${d.es} lleva ${i.es}.`});
const ingNo=(d,i)=>({m:`いいえ、|${i.m}|は|入{はい}って|いません。`,es:`No, el ${d.es} no lleva ${i.es}.`});
const ingWhat=d=>({m:`${d.m}|には|${d.main}|が|入{はい}って|います。`,es:`El ${d.es} lleva ${d.mainEs}.`});
const freeLine=d=>({m:`${d.m}|は|無料{むりょう}|です。|どうぞ。`,es:`El/la ${d.es} es gratis. Aquí tiene.`});
function norm(raw){
  let s=raw.normalize('NFKC').toLowerCase().replace(/[ōô]/g,'ou').replace(/[ūû]/g,'uu');
  for(const [k,v] of KANJI_IN) s=s.split(k).join(v);
  s=s.toLowerCase().replace(/(\S)\s+o\s+/g,'$1 wo ').replace(/(\S)\s+o$/,'$1 wo');
  s=romajiToKana(s,true);
  return kataToHira(s).replace(/[ー\s、。！？!?.,~〜「」]/g,'');
}
const ES_RX=/(¿|[áéíóúñ]|\b(que|como|significa|ayuda|espanol|entiendo|quiero|favor|cuanto|hola|gracias|lleva|tiene|puedo|digo|dice|porque|despacio|repite|otra vez|no se|necesito|explica|traduce)\b)/i;
const isSpanish=raw=>/[a-z]/i.test(raw)&&ES_RX.test(raw);

function detectDish(n){
  const all=[];MENU.forEach(d=>d.keys.forEach(k=>all.push([k,d])));
  all.sort((a,b)=>b[0].length-a[0].length);
  for(const [k,d] of all) if(n.includes(k)) return d;
  return null;
}
function stripDishes(n){let s=n;MENU.forEach(d=>d.keys.slice().sort((a,b)=>b.length-a.length).forEach(k=>s=s.split(k).join('·')));return s;}
function detectIng(n){
  const s=stripDishes(n);
  for(const id of ING_ORDER) for(const k of ING[id].keys) if(s.includes(k)) return id;
  return null;
}
function people(n){
  if(/ひとり|いちめい|おひとり|^1|one|uno/.test(n)) return 1;
  if(/ふたり|にめい|^2/.test(n)) return 2;
  if(/さんにん|^3/.test(n)) return 3;
  return 0;
}
const mk=(m,es,exp)=>({m,es,exp});

function activeMission(S){
  if(S.sub==='bill'&&S.done.M2&&S.done.M3) return 'M5';
  for(const m of MISSIONS){ if(!S.done[m.id]) { if(m.id==='M5'&&!S.done.M4) continue; return m.id; } }
  return 'M5';
}
function hintCtx(S){
  if(S.sub==='entry') return 'm1';
  if(S.sub==='confirm') return 'confirm';
  if(S.sub==='bill') return !S.done.M2?'m2':!S.done.M3?'m3':'bill';
  if(S.sub==='served') return S.done.M3?'m5':'m3';
  if(!S.done.M2) return 'm2';
  if(!S.done.M3) return 'm3';
  return 'm4';
}
function hintFor(S){
  const ctx=hintCtx(S);
  const d=S.selDish||S.pendDish||MENU[1];
  const dIng=S.selDish||MENU[2];
  const H={
    m1:{l1:'Te pregunta cuántas personas son. Dile que vienes solo/a.',kw:[{m:'一人{ひとり}',es:'una persona'},{m:'です',es:'es / soy'}],ph:{m:'一人{ひとり}|です。',es:'Vengo solo/a.'}},
    m2:{l1:'Ya tienes mesa. Pide la carta al mesero.',kw:[{m:'メニュー',es:'menú, carta'},{m:'を',es:'marca lo que pides'},{m:'ください',es:'por favor, deme'}],ph:{m:'メニュー|を|ください。',es:'La carta, por favor.'}},
    m3:{l1:`Pregunta si un plato lleva algún ingrediente. Por ejemplo, si el ${dIng.es.split(' (')[0]} lleva huevo.`,kw:[{m:'卵{たまご}',es:'huevo'},{m:'入{はい}って|います',es:'lleva, contiene'},{m:'か',es:'¿…? (pregunta)'}],ph:{m:`${dIng.m}|に|卵{たまご}|が|入{はい}って|います|か。`,es:`¿El ${dIng.es.split(' (')[0]} lleva huevo?`}},
    m4:{l1:'Elige un plato de la carta y pídelo.',kw:[{m:d.m,es:d.es},{m:'を',es:'marca lo que pides'},{m:'おねがいします',es:'por favor'}],ph:{m:`${d.m}|を|おねがいします。`,es:`Un ${d.es}, por favor.`}},
    confirm:{l1:'El mesero repite tu pedido para confirmarlo. Dile que sí.',kw:[{m:'はい',es:'sí'},{m:'おねがいします',es:'por favor'}],ph:{m:'はい、|おねがいします。',es:'Sí, por favor.'}},
    m5:{l1:'Ya terminaste de comer. Llama al mesero y pide la cuenta.',kw:[{m:'お会計{かいけい}',es:'la cuenta'},{m:'おねがいします',es:'por favor'}],ph:{m:'お会計{かいけい}|を|おねがいします。',es:'La cuenta, por favor.'}},
    bill:{l1:'Te dijo el precio. Da las gracias por la comida y despídete.',kw:[{m:'ごちそうさま',es:'gracias por la comida'},{m:'でした',es:'(pasado cortés)'}],ph:{m:'ごちそうさま|でした。',es:'Gracias por la comida.'}},
  };
  return Object.assign({ctx},H[ctx]);
}
function blankLine(S){
  const ctx=hintCtx(S);
  return {m1:W.alone,m2:W.menuBlank,m3:W.anyQ,m4:W.reco,confirm:S.pendDish?confirmLine(S.pendDish,S.pendQty):W.order,m5:W.anythingElse,bill:priceLine(S.ordered,S.orderedQty)}[ctx];
}
const SOFIA_INTRO={
  M1:'Saluda si quieres y di cuántas personas son. A いらっしゃいませ no se responde.',
  M2:'¡Ya tienes mesa! Ahora pide la carta.',
  M3:'Toca un plato de la carta y pregunta si lleva algún ingrediente, por ejemplo huevo.',
  M4:'Elige un plato y pídelo. Cuando el mesero lo repita, confírmalo con はい.',
  M5:'Cuando termines, pide la cuenta y despídete.',
};

function explainSpanish(raw,S){
  const low=raw.toLowerCase();
  const sig=low.match(/significa\s+[«"']?([^?»"']+)/)||low.match(/[«"']([^»"']+)[»"']/);
  if(sig){
    const q=sig[1].trim(); const qn=norm(q);
    const hit=Object.keys(DICT).find(k=>k===q||norm(k)===qn)||Object.keys(DICT).find(k=>qn&&norm(k).includes(qn));
    if(hit) return `«${hit}» significa: ${DICT[hit]}.`;
  }
  if(/huevo|lleva|ingrediente|tiene/.test(low)) return 'Para preguntar si un plato lleva algo: plato + に + ingrediente + が入っていますか. Ej.: 親子丼に卵が入っていますか。';
  if(/cuenta|pagar/.test(low)) return 'Para pedir la cuenta di お会計をおねがいします。';
  if(/hola/.test(low)) return 'Para saludar se dice こんにちは. Pero a いらっしゃいませ no se responde: solo di cuántas personas son.';
  const h=hintFor(S);
  return `Nakamura-san dijo: «${(S.lastW||W.greet).es}». ${h.l1} Respóndele en japonés o toca 💡 Pista.`;
}

/* ---------- Turno ---------- */
function processTurn(raw,S){
  if(S.ended) return null;
  S.turns++;
  const n=norm(raw);
  const out={user_analysis:{understood_as:'',intent:'unknown',missions_detected:[],bonus_detected:[],dish_id:null,off_topic:false},
    tutor:{has_error:false,corrected:null,explanation_es:null},replies:[],sofia:[],events:[],end_scene:false};
  const A=out.user_analysis;
  const doneM=(id)=>{ if(!S.done[id]){S.done[id]=true;A.missions_detected.push(id);out.events.push({type:'mission',id});S.fail=0;} };
  const bonus=(id)=>{ if(!S.bonus[id]){S.bonus[id]=true;A.bonus_detected.push(id);out.events.push({type:'bonus',id});} };
  const correct=(c)=>{ if(!out.tutor.has_error){out.tutor={has_error:true,corrected:{ja:plain(c.m),kana:kanaOf(c.m),romaji:romajiOf(c.m),m:c.m,es:c.es},explanation_es:c.exp};} };
  const say=(l)=>{out.replies.push(l);S.lastW=l;};
  const fail=()=>{S.fail++;A.intent='unclear';
    if(S.fail>=2){say(blankLine(S));out.events.push({type:'nudge'});} else say(W.repeat);};
  const expr=(m,es)=>{ if(!S.expr.find(e=>e.m===m)) S.expr.push({m,es}); };

  // Español / explicación → tutor, el mesero sigue en personaje
  if(/despacio|lento|ゆっくり|slow/.test(raw.toLowerCase())||/ゆっくり/.test(n)){ S.slow=true; A.intent='slow_down'; out.events.push({type:'slow'}); say(S.lastW); A.understood_as='Pide que hable más despacio'; return out; }
  if(/もういちど|もいちど|repite|otra vez/.test(n+raw.toLowerCase())){ A.intent='repeat'; say(S.lastW); A.understood_as='Pide que repita'; return out; }
  const off=OFFMENU.find(o=>n.includes(o[0])) || (/\bsushi\b/i.test(raw)?OFFMENU[0]:null);
  if(off&&['entry','seated','confirm'].includes(S.sub)&&(!isSpanish(raw)||/\b(quiero|pedir|quisiera|deme)\b/i.test(raw))){ A.intent='off_menu'; A.understood_as=`Pide ${off[2]}, que no está en el menú`; say(join({m:`すみません、|${off[1]}|は|ありません。`,es:`Lo siento, no tenemos ${off[2]}.`},W.reco)); out.sofia.push('Maruya Shokudō es un comedor de barrio: no sirve sushi ni pizza. Mira la carta.'); return out; }
  if(isSpanish(raw)){
    A.intent='spanish_help'; A.understood_as='Escribe en español / pide explicación';
    out.tutor.explanation_es=explainSpanish(raw,S); out.sofia.push(out.tutor.explanation_es);
    S.pendingQuestion ||= S.sub==='confirm' ? confirmLine(S.pendDish,S.pendQty) : S.lastW;
    return out;
  }

  const pendingQuestion=S.pendingQuestion;
  S.pendingQuestion=null;
  const dish=detectDish(n), kore=/これ|それ/.test(n)&&S.selDish;
  const ingId=detectIng(n), ing=ingId&&ING[ingId];
  const what=/なにが(はい|ある)|なにがはい|なにを?つかって/.test(n);
  const askIng=/はいって|はいってますか|はいっていますか|ありますか|あるか|ある$/.test(n);
  const greet=/こんにち|すみません|すいません|こんばん|おはよ/.test(n);
  const thanks=/ありがと|どうも/.test(n), gochi=/ごちそうさま/.test(n), itadaki=/いただきます/.test(n);
  const yes=/^(はい|ええ|うん|そうです|おねがい|それで|いいです)/.test(n), no=/^(いいえ|いや|ちがい)/.test(n);
  const menu=/めにゅ|めぬ|おしながき|なにがありますか/.test(n);
  const bill=/かいけい|おあいそ|ちぇっく|check|かんじょう/.test(n);
  const reco=/すすめ/.test(n);
  const polite=/ください|おねがい/.test(n), hasWo=/を/.test(n);
  const qty=/ふたつ|2つ|にこ/.test(n)?2:1;
  if(dish) A.dish_id=dish.id;
  if(thanks && /ありがと.*ござ/.test(n) && !/ございます|ございました/.test(n)){
    correct(mk('ありがとう|ございます。','Muchas gracias.','Escribe «arigatou gozaimasu». La u final de masu casi no se oye, pero se escribe.'));
  }

  /* --- Entrada --- */
  if(S.sub==='entry'){
    const p=people(n);
    if(p){
      A.intent='party_size'; A.understood_as=`Viene ${p===1?'solo/a':p+' personas'}`;
      if(p===1&&!/です/.test(n)) correct(mk('一人{ひとり}|です。','Vengo solo/a.','Añade です al final: la respuesta suena completa y cortés.'));
      if(greet) S.greeted=true;
      doneM('M1'); expr('一人{ひとり}|です。','Vengo solo/a.');
      say(p===3?{m:'三名様{さんめいさま}|ですね。|こちらへ|どうぞ。',es:'Tres personas, ¿verdad? Por aquí, por favor.'}:p===2?W.seat2:W.seat1);
      out.events.push({type:'scene',scene:'mesa',delay:1600});
      out.followup={line:W.water,delay:2400};
      S.sub='seated';
      return out;
    }
    if(greet){ S.greeted=true; A.intent='greet'; A.understood_as='Saluda / llama al personal'; say(W.greetAgain); return out; }
    fail(); return out;
  }

  /* --- Bonus y preguntas comunes en mesa --- */
  if(reco){ bonus('B1'); A.intent='ask_recommendation'; A.understood_as='Pide una recomendación'; say(W.reco); expr('おすすめ|は|何{なん}|ですか。','¿Qué me recomienda?'); return out; }


  /* --- Pregunta por ingredientes (M3) --- */
  const ingQuestion = what || (ing && !bill && !(S.sub==='confirm'&&yes) && (askIng||kore||!dish||!polite));
  if(ingQuestion){
    let d=dish||S.selDish||null;
    A.intent='ask_ingredient';
    if(!d){ S.awaitWhich=ingId||'what'; A.understood_as='Pregunta por un ingrediente sin decir el plato'; say(W.which); out.sofia.push('Dile qué plato: toca uno en la carta o di su nombre (ej. 親子丼).'); return out; }
    A.dish_id=d.id; S.selDish=d;
    let line;
    if(what||!ing){ line=ingWhat(d); A.understood_as=`Pregunta qué lleva el ${d.es}`; }
    else { line=d.ing.includes(ingId)?ingYes(d,ing):ingNo(d,ing); A.understood_as=`Pregunta si el ${d.es} lleva ${ing.es}`;
      if(!/はいって/.test(n)) correct(mk(`${d.m}|に|${ing.m}|が|入{はい}って|います|か。`,`¿El ${d.es} lleva ${ing.es}?`,'Para preguntar si un plato lleva algo se usa 〜に…が入っていますか (literalmente «¿hay … dentro?»).'));
      expr(`${d.m}|に|${ing.m}|が|入{はい}って|います|か。`,`¿El ${d.es} lleva ${ing.es}?`);
      if(d.id==='kitsune_udon'&&ingId==='sakana') out.sofia.push(NOTES.dashi);
    }
    if(what) expr(`${d.m}|には|何{なに}|が|入{はい}って|います|か。`,`¿Qué lleva el ${d.es}?`);
    S.awaitWhich=null; doneM('M3');
    say(S.sub==='seated'&&!S.done.M4?join(line,W.order):line);
    return out;
  }
  if(S.awaitWhich&&dish){ const d=dish; S.selDish=d; const id=S.awaitWhich; S.awaitWhich=null; A.intent='ask_ingredient';
    const line=id==='what'?ingWhat(d):(d.ing.includes(id)?ingYes(d,ING[id]):ingNo(d,ING[id])); doneM('M3'); say(line); A.understood_as=`Aclara que pregunta por el ${d.es}`; return out; }

  /* --- Mesa: menú y pedido --- */
  if(menu && S.sub!=='entry'){
      A.intent='ask_menu'; A.understood_as='Pide la carta';
      if(!hasWo&&polite) correct(mk('メニュー|を|ください。','La carta, por favor.','Usa を (o) para marcar lo que pides: cosa + を + ください.'));
      else if(!polite&&!/ありますか|ある/.test(n)) correct(mk('メニュー|を|ください。','La carta, por favor.','Decir solo «メニュー» se entiende; añade をください para pedirla con cortesía.'));
      doneM('M2'); expr('メニュー|を|ください。','La carta, por favor.'); say(W.menu); out.events.push({type:'openMenu',delay:900}); return out;
  }
  if(S.sub==='seated'){
    if(dish){
      if(!dish.food){ A.intent='ask_drink'; A.understood_as=`Pide ${dish.es}`; say(freeLine(dish)); out.sofia.push(NOTES.water); return out; }
      A.intent='order'; A.understood_as=`Quiere pedir ${dish.es}`;
      if(polite&&!hasWo) correct(mk(`${dish.m}|を|ください。`,`Un ${dish.es}, por favor.`,'Usa を (o) entre el plato y ください: plato + を + ください.'));
      else if(!polite) correct(mk(`${dish.m}|を|おねがいします。`,`Un ${dish.es}, por favor.`,'Añade をおねがいします para pedir con cortesía.'));
      S.pendDish=dish; S.pendQty=qty; S.sub='confirm'; say(confirmLine(dish,qty)); return out;
    }
    if(bill){ A.intent='ask_bill_early'; A.understood_as='Pide la cuenta antes de pedir'; say(W.notYet); out.sofia.push('Primero haz tu pedido; la cuenta llega después de comer.'); return out; }
    if(thanks){ A.intent='thanks'; say(W.thanks); return out; }
    if(greet){ A.intent='call_waiter'; A.understood_as='Llama al mesero'; say(join(W.hai,S.done.M2?W.order:W.menuBlank)); return out; }
    if(ing){ /* ingrediente suelto sin plato */ }
    A.off_topic=true; fail(); return out;
  }

  /* --- Confirmación del pedido --- */
  if(S.sub==='confirm'){
    if(dish&&dish.id!==S.pendDish.id&&dish.food){ S.pendDish=dish; S.pendQty=qty; A.intent='change_order'; say(confirmLine(dish,qty)); return out; }
    if(yes){
      A.intent='confirm_order'; A.understood_as='Confirma el pedido';
      S.ordered=S.pendDish; S.orderedQty=S.pendQty; S.pendDish=null; doneM('M4'); expr(`${S.ordered.m}|を|おねがいします。`,`Un ${S.ordered.es}, por favor.`);
      say(W.ok); S.sub='served';
      out.events.push({type:'timecut',jp:'十五分後{じゅうごふんご}…',es:'15 minutos después',scene:'servido',delay:1500});
      out.followup={line:servedLine(S.ordered),delay:4300,sofia:'Llegó tu comida. Puedes decir いただきます antes de comer (bonus).'};
      return out;
    }
    if(no){ A.intent='reject_order'; S.sub='seated'; S.pendDish=null; say(join({m:'すみません。',es:'Disculpe.'},W.order)); return out; }
    if(pendingQuestion){ say(pendingQuestion); return out; }
    fail(); return out;
  }

  /* --- Plato servido --- */
  if(S.sub==='served'){
    if(itadaki){ bonus('B2'); A.intent='itadakimasu'; A.understood_as='Dice いただきます'; expr('いただきます','Buen provecho.'); say(W.enjoy); return out; }
    if(bill){
      A.intent='ask_bill'; A.understood_as='Pide la cuenta';
      if(!/おかいけい/.test(n)&&/かいけい/.test(n)) correct(mk('お会計{かいけい}|を|おねがいします。','La cuenta, por favor.','Se dice お会計, con お delante: es la forma cortés y natural.'));
      else if(/ください/.test(n)) correct(mk('お会計{かいけい}|を|おねがいします。','La cuenta, por favor.','Se entiende, pero para la cuenta suena más natural おねがいします.'));
      expr('お会計{かいけい}|を|おねがいします。','La cuenta, por favor.');
      S.sub='bill';
      out.events.push({type:'timecut',jp:'食後{しょくご}',es:'Después de comer',scene:'cuenta',delay:300});
      if((thanks||gochi)&&MISSIONS.slice(0,4).every(m=>S.done[m.id])){ if(gochi) bonus('B3'); doneM('M5'); say(join(priceLine(S.ordered,S.orderedQty),W.bye)); out.end_scene=true; S.ended=true; out.events.push({type:'end',delay:5200}); return out; }
      out.followup={line:priceLine(S.ordered,S.orderedQty),delay:2600}; S.lastW=priceLine(S.ordered,S.orderedQty); return out;
    }
    if(gochi){ bonus('B3'); A.intent='gochisousama'; A.understood_as='Dice ごちそうさまでした al terminar'; expr('ごちそうさま|でした。','Gracias por la comida.'); say(W.thanks); out.sofia.push('¡Muy bien dicho! Ahora pide la cuenta para despedirte.'); return out; }
    if(/おいし/.test(n)||thanks){ A.intent='compliment'; say(W.thanks); return out; }
    if(dish&&dish.food){ A.intent='extra_order'; say(W.ok); return out; }
    if(greet){ A.intent='call_waiter'; say(join(W.hai,W.anythingElse)); return out; }
    A.off_topic=true; fail(); return out;
  }

  /* --- Cuenta y despedida (M5) --- */
  if(S.sub==='bill'){
    if(thanks||gochi||/さようなら|しつれい|じゃあね|またね/.test(n)){
      if(!MISSIONS.slice(0,4).every(m=>S.done[m.id])){ out.sofia.push('Aún quedan misiones. Revisa la barra superior y usa Pista para continuar.'); say(W.hai); return out; }
      A.intent='thanks_goodbye'; A.understood_as='Da las gracias y se despide';
      if(gochi){ bonus('B3'); expr('ごちそうさま|でした。','Gracias por la comida.'); }
      else if(thanks&&!/ございま/.test(n)) correct(mk('ありがとう|ございます。','Muchas gracias.','Con el personal usa la forma cortés ありがとうございます.'));
      if(!gochi) expr('ありがとう|ございます。','Muchas gracias.');
      doneM('M5'); say(W.bye); out.end_scene=true; S.ended=true; out.events.push({type:'end',delay:3600}); return out;
    }
    if(bill){ say(priceLine(S.ordered,S.orderedQty)); return out; }
    fail(); return out;
  }
  fail(); return out;
}

/* ---------- Charla libre (simulada) ---------- */
const FREE_TOPICS=[
  {id:'intro',k:'自己紹介',es:'Presentarte',open:{m:'こんにちは！|はじめまして。|お名前{なまえ}|は？',es:'¡Hola! Mucho gusto. ¿Cómo te llamas?'}},
  {id:'food',k:'食べ物',es:'Comida',open:{m:'日本{にほん}|の|食{た}べ物{もの}|は|好{す}き|ですか。',es:'¿Te gusta la comida japonesa?'}},
  {id:'hobby',k:'趣味',es:'Pasatiempos',open:{m:'趣味{しゅみ}|は|何{なん}|ですか。',es:'¿Cuál es tu pasatiempo?'}},
  {id:'free',k:'自由',es:'Tema libre',open:{m:'こんにちは！|今日{きょう}|は|何{なに}|を|話{はな}し|ますか。',es:'¡Hola! ¿De qué hablamos hoy?'}},
];
function freeTurn(raw,C,strict){
  const n=norm(raw);
  const out={reply:null,tutor:null};
  if(isSpanish(raw)){ out.tutor={explanation_es:explainSpanish(raw,{lastW:C.lastW,sub:'seated',done:{M2:1,M3:1}})}; out.reply=C.lastW; return out; }
  const R=[
    [/わたしは|なまえは|といいます|です$/, {m:'よろしく|おねがいします！|どこ|から|来{き}ました|か。',es:'¡Encantada! ¿De dónde vienes?'}],
    [/から/, {m:'いいですね！|日本{にほん}|の|食{た}べ物{もの}|は|好{す}き|ですか。',es:'¡Qué bien! ¿Te gusta la comida japonesa?'}],
    [/すき|だいすき/, {m:'わたし|も|好{す}き|です！|何{なに}|が|一番{いちばん}|好{す}き|ですか。',es:'¡A mí también! ¿Qué es lo que más te gusta?'}],
    [/らめん|すし|うどん|おやこどん|かれ|たこやき/, {m:'おいしい|ですね！|わたし|は|ラーメン|が|好{す}き|です。',es:'¡Qué rico! A mí me gusta el ramen.'}],
    [/こんにち|はじめまして/, {m:'こんにちは！|元気{げんき}|ですか。',es:'¡Hola! ¿Cómo estás?'}],
    [/げんき/, {m:'よかった！|趣味{しゅみ}|は|何{なん}|ですか。',es:'¡Qué bien! ¿Cuál es tu pasatiempo?'}],
    [/あにめ|まんが|げえむ|おんがく|べんきょう|りょこう/, {m:'すごい！|毎日{まいにち}|します|か。',es:'¡Genial! ¿Lo haces todos los días?'}],
    [/はい|いいえ|ええ/, {m:'そうですか。|日本{にほん}|へ|行{い}きたい|ですか。',es:'Ya veo. ¿Quieres ir a Japón?'}],
  ];
  const hit=R.find(r=>r[0].test(n));
  out.reply=hit?hit[1]:{m:'そうですね！|もう|少{すこ}し|教{おし}えて|ください。',es:'¡Ya veo! Cuéntame un poco más.'};
  // Corrección de redacción (escritura libre)
  if(/わたしわ/.test(kataToHira(raw))) out.tutor={corrected:{m:'わたし|は…',es:'Yo…'},explanation_es:'La partícula de tema se escribe は aunque se pronuncie «wa».'};
  else if(strict&&n.length>3&&!/(です|ます|か|ね|よ|た|ください|ました)$/.test(n)&&/[ぁ-ん]/.test(n)) out.tutor={corrected:{m:plainToM(kanaOfInput(raw))+'|です。',es:'(forma cortés)'},explanation_es:'Termina la frase con です／ます para que suene cortés en una primera conversación.'};
  C.lastW=out.reply; return out;
}
const kanaOfInput=raw=>/[a-z]/i.test(raw)?romajiToKana(raw.toLowerCase().replace(/\s+/g,''),true):raw.replace(/[。！？\s]/g,'');
const plainToM=s=>s;
