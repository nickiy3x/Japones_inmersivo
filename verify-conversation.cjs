const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const sources = ['restaurant-data','japanese','session','conversation-local','conversation-service'];
const context = vm.createContext({assert, console, store:new Map()});
vm.runInContext(`const localStorage={getItem:k=>store.get(k),setItem:(k,v)=>store.set(k,v)};
` + sources.map(x=>fs.readFileSync('src/'+x+'.js','utf8')).join('\n'), context);
vm.runInContext(`
(async()=>{
  let S=newSession();
  const turn=(text,channel='text')=>conversation.sendTurn({text,channel,scenario:'restaurant',session:S});
  await turn('konnichiwa, hitori desu');
  await turn('menyuu o kudasai');
  const sushi=await turn('sushi o kudasai');
  assert.equal(sushi.user_analysis.intent,'off_menu');
  assert.match(sushi.replies[0].m,/寿司.*ありません.*親子丼/);
  assert.equal(S.pendDish,null);
  for(const text of ['arigatou gozaimasu','arigatō gozaimasu','arigato gozaimasu','ありがとうございます']){
    const r=await turn(text);
    assert.equal(r.user_analysis.intent,'thanks');
    assert.equal(r.tutor.has_error,false);
  }
  const short=await turn('arigatou gozaimas');
  assert.equal(short.user_analysis.intent,'thanks');
  assert.equal(short.tutor.corrected.romaji,'Arigatō gozaimasu.');
  assert.match(short.tutor.explanation_es,/arigatou gozaimasu.*u final/);
  const ingredient=await turn('oyakodon ni tamago ga haitte imasu ka');
  assert.equal(ingredient.user_analysis.intent,'ask_ingredient');
  S.selDish=MENU.find(x=>x.id==='curry');
  await turn('kitsune udon wo kudasai');
  assert.equal(S.selDish.id,'curry');
  assert.equal(S.pendDish.id,'kitsune_udon');
  assert.equal(S.ordered,null);
  const doubt=await turn('¿Qué significa la pregunta?');
  assert.equal(doubt.replies.length,0);
  assert.equal(doubt.sofia.length,1);
  assert.match(S.pendingQuestion.m,/きつねうどん/);
  G.resume=snapshot(S); save();
  S=restoreSession(load().resume);
  const heard=await conversation.transcribe({sample:{m:'はい'}});
  const confirmation=await turn(heard.text,'voice');
  assert.equal(S.pendingQuestion,null);
  assert.equal(S.pendDish,null);
  assert.equal(S.ordered.id,'kitsune_udon');
  assert.match(confirmation.followup.line.m,/きつねうどん/);
  assert.equal(S.selDish.id,'curry');
  const bill=await turn('okaikei o onegaishimasu');
  assert.match(bill.followup.line.es,/700 yenes/);
  const bye=await turn('arigatou gozaimas');
  assert.equal(bye.tutor.has_error,true);
  assert.equal(bye.replies.filter(r=>r.m.includes('お越')).length,1);
  assert.equal(bye.end_scene,true);
  assert.equal(Object.keys(S.done).length,5);
  assert.equal(await turn('arigatou gozaimasu'),null);
  console.log('OK: sushi, romanización, corrección y cinco misiones; udon tras pausa y recarga, voz simulada, 700 yenes y cierre único.');
})()
`,context).catch(error=>{console.error(error);process.exitCode=1});
