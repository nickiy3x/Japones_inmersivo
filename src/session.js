function newSession(){
  return {done:{},bonus:{},sub:'entry',selDish:null,pendDish:null,pendQty:1,ordered:null,orderedQty:1,pendingQuestion:null,
    hints:0,hint3:0,corr:[],turns:0,t0:Date.now(),fail:0,lastW:W.greet,expr:[],msgs:[],
    scene:'fachada',greeted:false,awaitWhich:null,ended:false,lastCtx:null,slow:false};
}
const STORE='maruya_proto_v2';
const defUser=()=>({name:'',level:'zero',layers:{furi:true,ro:true,es:false},speed:1,autoplay:true,conv:true,mode:'text',dev:false,notif:true});
const load=()=>{try{return JSON.parse(localStorage.getItem(STORE))}catch(e){return null}};
const defaultProgress=()=>({user:defUser(),registered:false,streak:0,lastDay:null,saved:[],stats:{missions:0,scenarios:0},resume:null,tip:null,last:null,practiceStreak:true});
let G = load() || defaultProgress();
const save=()=>{try{localStorage.setItem(STORE,JSON.stringify(G))}catch(e){}};
if(!G.practiceStreak){
  G.streak=G.lastDay&&G.stats?.missions>0?G.streak:0;
  if(!G.streak) G.lastDay=null;
  G.practiceStreak=true;
  save();
}
const practiceDate=date=>date.toLocaleDateString('en-CA',{timeZone:'America/Bogota'});
function currentStreak(now=new Date()){
  const yesterday=practiceDate(new Date(now.getTime()-86400000));
  return [practiceDate(now),yesterday].includes(G.lastDay)?G.streak:0;
}
function recordPracticeDay(now=new Date()){
  const day=practiceDate(now);
  if(G.lastDay===day) return;
  G.streak=currentStreak(now)+1;
  G.lastDay=day;
  save();
}
function restoreSession(o){ const S=Object.assign(newSession(),o); ['selDish','pendDish','ordered'].forEach(k=>{ if(S[k]) S[k]=MENU.find(d=>d.id===S[k].id); }); S.t0=Date.now()-(o.elapsed||0); return S; }
const sceneFor=S=>({entry:'mostrador',seated:'mesa',confirm:'mesa',served:'servido',bill:'cuenta'})[S.sub]||'mesa';
function snapshot(S){ const o=Object.assign({},S); o.elapsed=Date.now()-S.t0; return JSON.parse(JSON.stringify(o)); }
