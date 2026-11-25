const GUIDED_TOURS = {
  practice: [
    {target:'[data-tour="scenario-choice"]', title:'Elige un escenario', text:'En Juego de rol encontrarás escenarios con misiones para practicar situaciones cotidianas.'},
    {target:'[data-tour="restaurant-card"]', title:'Tu primer pedido en Tokio', text:'Toca esta tarjeta para ver las misiones. En la ficha, pulsa «Entrar al restaurante» para comenzar.'},
  ],
  restaurant: [
    {target:'#dlg', title:'Chat', text:'Aquí puedes leer lo que dice Nakamura y seguir la conversación con tus respuestas.'},
    {target:'#dlg .sofia .mini-av', last:true, title:'Sofía', text:'Sofía te acompaña en español y te recuerda qué estás practicando en cada misión.'},
    {target:'#cmp [data-act="hint"]', title:'Pistas', text:'Si te quedas en blanco, toca aquí. Primero verás qué hacer, luego palabras clave y, si la necesitas, una frase completa.'},
    {target:'#stage .stage-layer [data-a="repeat"]', last:true, title:'Mesero', text:'Toca al mesero para volver a escuchar lo último que dijo.', action:'hs', padding:22},
    {target:'#dlg .waiter [data-act="play"]', title:'Audio del chat', text:'Toca aquí para escuchar este mensaje. También puedes volver a escuchar mensajes anteriores.', action:'play'},
    {target:'#ci', mode:'text', title:'Escritura', text:'Usa el teclado japonés para escribir ひとりです o tu teclado habitual para escribir hitori desu. Confirma los caracteres antes de enviar.'},
    {target:'#ptt', mode:'voice', title:'Voz', text:'Mantén presionado mientras hablas. Al soltar, se envía tu respuesta. En este prototipo la transcripción es simulada.'},
  ],
};

let activeTour = null;

function startTour(id, trigger){
  if(activeTour || (id==='restaurant'&&(!CUR||CUR.busy||CUR.recording||CUR.transcribing||CUR.S.ended))) return;
  if(CUR?.kind==='act'){
    closeSheet(true);
    closeNudge();
    clearTimeout(CUR.idleT);
  }
  const overlay=document.createElement('div');
  overlay.className='guided-tour';
  overlay.innerHTML=`<div class="tour-shade"></div><section class="tour-card" role="dialog" aria-modal="true" aria-labelledby="tour-title" aria-describedby="tour-copy"></section>`;
  const tour=activeTour={id,step:0,overlay,card:overlay.lastElementChild,trigger,activity:CUR?.kind==='act'?CUR:null};
  app.appendChild(overlay);
  window.addEventListener('resize',positionTour);
  document.addEventListener('scroll',positionTour,true);
  document.addEventListener('keydown',tourKeys,true);
  renderTour(tour);
}

function renderTour(tour){
  const steps=GUIDED_TOURS[tour.id], step=steps[tour.step];
  if(step.mode && tour.activity.guideMode!==step.mode){
    const input=$('#ci');
    if(input) tour.activity.draft=input.value;
    tour.activity.guideMode=step.mode;
    renderComposer();
  }
  const candidates=app.querySelectorAll(step.target);
  tour.target=candidates[step.last?candidates.length-1:0];
  tour.target?.scrollIntoView({block:'nearest',inline:'nearest',behavior:'instant'});
  tour.card.innerHTML=`<div class="tour-count">${tour.step+1} de ${steps.length}</div>
    <h2 id="tour-title">${step.title}</h2><p id="tour-copy">${step.text}</p>
    ${step.action?'<button class="tour-audio" data-tour-action="listen">Escuchar</button>':''}
    <div class="tour-controls">
      <button data-tour-action="skip">Omitir</button>
      <button data-tour-action="back" ${tour.step===0?'disabled':''}>Atrás</button>
      <button class="tour-next" data-tour-action="next">${tour.step===steps.length-1?'Entendido':'Siguiente'}</button>
    </div>`;
  positionTour();
  tour.card.querySelector('.tour-next').focus({preventScroll:true});
  requestAnimationFrame(positionTour);
}

function positionTour(){
  const tour=activeTour;
  if(!tour) return;
  const screen=app.firstElementChild.getBoundingClientRect();
  const height=Math.min(screen.bottom,window.innerHeight), top=Math.max(screen.top,0);
  const target=tour.target?.getBoundingClientRect();
  const clip=tour.target?.closest('#dlg,.scroll,#stage')?.getBoundingClientRect();
  const padding=GUIDED_TOURS[tour.id][tour.step].padding||4;
  const left=target?Math.max(screen.left,target.left-padding,clip?.left??0):screen.left;
  const right=target?Math.min(screen.right,target.right+padding,clip?.right??window.innerWidth):screen.right;
  const y=target?Math.max(top,target.top-padding,clip?.top??0):top;
  const bottom=target?Math.max(y,Math.min(height,target.bottom+padding,clip?.bottom??height)):top;
  tour.overlay.style.setProperty('--spotlight',`polygon(evenodd,0 0,100% 0,100% 100%,0 100%,0 0,${left}px ${y}px,${right}px ${y}px,${right}px ${bottom}px,${left}px ${bottom}px,${left}px ${y}px)`);
  const width=Math.min(360,screen.width-20);
  tour.card.style.width=width+'px';
  tour.card.style.left=Math.max(screen.left+10,Math.min((left+right-width)/2,screen.right-width-10))+'px';
  tour.card.style.maxHeight='';
  const above=y-top-20, below=height-bottom-20;
  const useBelow=below>=tour.card.offsetHeight || below>=above;
  tour.card.style.maxHeight=Math.max(72,useBelow?below:above)+'px';
  tour.card.style.top=(useBelow?bottom+10:y-10-tour.card.offsetHeight)+'px';
}

function finishTour(outcome){
  const tour=activeTour;
  if(!tour) return;
  activeTour=null;
  window.removeEventListener('resize',positionTour);
  document.removeEventListener('scroll',positionTour,true);
  document.removeEventListener('keydown',tourKeys,true);
  tour.overlay.remove();
  if(outcome){
    (G.user.tours??={})[tour.id]=outcome;
    save();
  }
  if(tour.activity===CUR && tour.activity){
    const input=$('#ci');
    if(input) CUR.draft=input.value;
    if(CUR.guideMode){
      delete CUR.guideMode;
      renderComposer();
    }
    resetIdle();
  }
  (tour.trigger?.isConnected?tour.trigger:$(tour.id==='restaurant'?'[data-act="layers"]':'[data-tour="restaurant-card"]'))?.focus({preventScroll:true});
}

function tourClick(event){
  const tour=activeTour;
  if(!tour) return false;
  const action=event.target.closest('[data-tour-action]')?.dataset.tourAction;
  const steps=GUIDED_TOURS[tour.id];
  if(action==='listen') tour.target?.click();
  else if(action==='skip') finishTour('skipped');
  else if(action==='back'&&tour.step>0){ tour.step--; renderTour(tour); }
  else if(action==='next'){
    if(tour.step===steps.length-1) finishTour('completed');
    else { tour.step++; renderTour(tour); }
  } else if(!action && steps[tour.step].action && tour.target?.contains(event.target)) return false;
  event.preventDefault();
  return true;
}

function tourKeys(event){
  if(event.key==='Escape'){
    event.stopImmediatePropagation();
    event.preventDefault();
    finishTour('skipped');
  } else if(event.key==='Tab'){
    const buttons=[...activeTour.card.querySelectorAll('button:not(:disabled)')];
    const current=buttons.indexOf(document.activeElement);
    const offset=event.shiftKey?-1:1;
    buttons[(current<0?(event.shiftKey?buttons.length-1:0):(current+offset+buttons.length)%buttons.length)].focus();
    event.preventDefault();
  }
}
