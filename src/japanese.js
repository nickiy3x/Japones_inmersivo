const KANJI_IN = [
  ['醤油ラーメン','しょうゆらーめん'],['親子丼','おやこどん'],['大福','だいふく'],['豚肉','ぶたにく'],['鶏肉','とりにく'],['玉ねぎ','たまねぎ'],
  ['御馳走様','ごちそうさま'],['ご馳走様','ごちそうさま'],['有難う','ありがとう'],['頂きます','いただきます'],['お勧め','おすすめ'],
  ['一名様','いちめいさま'],['二名様','にめいさま'],['一名','いちめい'],['二名','にめい'],['一人','ひとり'],['二人','ふたり'],['三人','さんにん'],
  ['会計','かいけい'],['玉子','たまご'],['卵','たまご'],['入って','はいって'],['何','なに'],['肉','にく'],['魚','さかな'],
  ['麺','めん'],['小麦','こむぎ'],['豆腐','とうふ'],['油揚げ','あぶらあげ'],['牛乳','ぎゅうにゅう'],['お茶','おちゃ'],['水','みず'],['醤油','しょうゆ'],
  ['御飯','ごはん'],['ご飯','ごはん'],['願い','ねがい'],['一つ','ひとつ'],['二つ','ふたつ'],['下さい','ください'],['寿司','すし'],['天ぷら','てんぷら'],
  ['今日は','こんにちは'],['美味しい','おいしい'],['注文','ちゅうもん'],['名前','なまえ'],['好き','すき'],['日本','にほん'],['私','わたし'],
];

/* ---------- Conversión romaji ⇄ kana ---------- */
const R2K = (()=>{
  const t={a:'あ',i:'い',u:'う',e:'え',o:'お'};
  const rows={k:'かきくけこ',g:'がぎぐげご',s:'さしすせそ',z:'ざじずぜぞ',t:'たちつてと',d:'だぢづでど',n:'なにぬねの',h:'はひふへほ',b:'ばびぶべぼ',p:'ぱぴぷぺぽ',m:'まみむめも',r:'らりるれろ'};
  for(const c in rows){'aiueo'.split('').forEach((v,j)=>t[c+v]=rows[c][j]);}
  Object.assign(t,{ya:'や',yu:'ゆ',yo:'よ',wa:'わ',wo:'を',shi:'し',chi:'ち',tsu:'つ',fu:'ふ',ji:'じ',l:'',
    sha:'しゃ',shu:'しゅ',she:'しぇ',sho:'しょ',cha:'ちゃ',chu:'ちゅ',che:'ちぇ',cho:'ちょ',ja:'じゃ',ju:'じゅ',je:'じぇ',jo:'じょ',
    jya:'じゃ',jyu:'じゅ',jyo:'じょ',sya:'しゃ',syu:'しゅ',syo:'しょ',tya:'ちゃ',tyu:'ちゅ',tyo:'ちょ',zya:'じゃ',zyu:'じゅ',zyo:'じょ',
    fa:'ふぁ',fi:'ふぃ',fe:'ふぇ',fo:'ふぉ',ti:'ち',tu:'つ',si:'し',zi:'じ',hu:'ふ',di:'ぢ',du:'づ',dhi:'でぃ',thi:'てぃ',vu:'ゔ',
    xa:'ぁ',xi:'ぃ',xu:'ぅ',xe:'ぇ',xo:'ぉ',xya:'ゃ',xyu:'ゅ',xyo:'ょ',xtsu:'っ',xtu:'っ',"n'":'ん',nn:'ん','-':'ー'});
  ['k','g','n','h','b','p','m','r'].forEach(c=>{const base=rows[c][1];t[c+'ya']=base+'ゃ';t[c+'yu']=base+'ゅ';t[c+'yo']=base+'ょ';});
  delete t.l; return t;
})();
function romajiToKana(str, final){
  const s=str; let out='',i=0; const low=s.toLowerCase();
  while(i<low.length){
    const c=low[i];
    if(!/[a-z'\-]/.test(c)){out+=s[i];i++;continue;}
    // doble consonante → っ
    if(/[bcdfghjkmpqrstvwxyz]/.test(c) && low[i+1]===c){out+='っ';i++;continue;}
    if(c==='t'&&low[i+1]==='c'&&low[i+2]==='h'){out+='っ';i++;continue;}
    // n + consonante → ん
    if(c==='n'){
      const nx=low[i+1];
      if(nx===undefined){ out+= final?'ん':'n'; i++; continue; }
      if(nx==="'"){out+='ん';i+=2;continue;}
      if(nx==='n'){ out+='ん'; i+= (low[i+2]&&/[aiueoy]/.test(low[i+2]))?1:2; continue; }
      if(!/[aiueoy]/.test(nx)){out+='ん';i++;continue;}
    }
    let hit=false;
    for(let L=4;L>=1;L--){const ch=low.substr(i,L); if(R2K[ch]!==undefined){out+=R2K[ch];i+=L;hit=true;break;}}
    if(!hit){out+=s[i];i++;}
  }
  return out;
}
const kataToHira=s=>s.replace(/[ァ-ヶ]/g,ch=>String.fromCharCode(ch.charCodeAt(0)-0x60));
const K2R=(()=>{const m={};for(const k in R2K){const v=R2K[k];if(!v||v==='ー'||v==='っ'||v==='ん')continue;
  const pref={し:'shi',ち:'chi',つ:'tsu',ふ:'fu',じ:'ji',を:'o',ぢ:'ji',づ:'zu'};
  if(m[v]===undefined) m[v]=k;} Object.assign(m,{し:'shi',ち:'chi',つ:'tsu',ふ:'fu',じ:'ji',を:'o',ぢ:'ji',づ:'zu',しゃ:'sha',しゅ:'shu',しょ:'sho',ちゃ:'cha',ちゅ:'chu',ちょ:'cho',じゃ:'ja',じゅ:'ju',じょ:'jo',ぁ:'a',ぃ:'i',ぅ:'u',ぇ:'e',ぉ:'o'}); return m;})();
function kanaToRomaji(str){
  const s=kataToHira(str); let out='';
  const mac={a:'ā',i:'ī',u:'ū',e:'ē',o:'ō'};
  for(let i=0;i<s.length;i++){
    const two=s.substr(i,2);
    if(K2R[two]&&two.length===2&&/[ゃゅょぁぃぅぇぉ]/.test(two[1])){out+=K2R[two];i++;continue;}
    const c=s[i];
    if(c==='っ'){const nx=s.substr(i+1,2);let r=K2R[nx]&&/[ゃゅょ]/.test(nx[1])?K2R[nx]:K2R[s[i+1]]||'';out+=r.startsWith('ch')?'t':(r[0]||'');continue;}
    if(c==='ん'){out+='n';continue;}
    if(c==='ー'){const v=out.slice(-1);if(mac[v])out=out.slice(0,-1)+mac[v];continue;}
    if(K2R[c]!==undefined){out+=K2R[c];continue;}
    if('、。！？'.includes(c)){out+={'、':',','。':'.','！':'!','？':'?'}[c];continue;}
    out+=c;
  }
  return out.replace(/ou(?![aiueo])/g,'ō').replace(/uu/g,'ū');
}

/* ---------- Texto con capas ---------- */
const KANJI_RX=/([一-鿿々]+)\{([^}]+)\}/g;
const tokens=m=>m.split('|');
const surf=t=>t.replace(KANJI_RX,'$1');
const readT=t=>t.replace(KANJI_RX,'$2');
const plain=m=>tokens(m).map(surf).join('');
const kanaOf=m=>tokens(m).map(readT).join('');
const PARTICLE_R={'は':'wa','には':'ni wa','を':'o','へ':'e','では':'de wa'};
function romajiOf(m){
  return tokens(m).map(t=>{const r=readT(t);const clean=r.replace(/[、。！？]/g,'');const p=PARTICLE_R[clean];if(p) return p+(r.match(/[、。！？]/)?kanaToRomaji(r.replace(clean,'')):'');
      if(clean.length>1&&/へ$/.test(clean)) return kanaToRomaji(r.replace('へ',''))+' e'+(r.match(/[、。！？]/)?kanaToRomaji(r.match(/[、。！？]/)[0]):'');
      return kanaToRomaji(r);})
    .join(' ').replace(/\s+([,.!?])/g,'$1').replace(/^\w/,c=>c.toUpperCase()).replace(/([.!?] )(\w)/g,(a,b,c)=>b+c.toUpperCase()).replace(/(onnichi|onban)ha/gi,'$1wa');
}
function tokenHTML(t){
  const s=surf(t).replace(/[、。！？]/g,'');
  const html=t.replace(KANJI_RX,'<ruby>$1<rt>$2</rt></ruby>');
  return `<span class="w" data-w="${encodeURIComponent(t)}">${html}</span>`;
}
const jaHTML=m=>tokens(m).map(tokenHTML).join('');

/* ---------- Vocabulario (lecciones y diccionario) ---------- */
