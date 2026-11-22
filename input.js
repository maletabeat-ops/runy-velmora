'use strict';
/* ===== input: rebindable controls + pause menu ===== */
const BK='velmor2_keys';
const DEFAULT_BINDS={up:['KeyW','ArrowUp'],down:['KeyS','ArrowDown'],left:['KeyA','ArrowLeft'],right:['KeyD','ArrowRight'],
  attack:['Space','Mouse0'],skill0:['Digit1','Mouse2'],skill1:['Digit2',''],skill2:['Digit3',''],skill3:['Digit4',''],
  pot_hp:['KeyQ',''],pot_mp:['KeyR',''],use:['KeyE','Enter'],inv:['KeyI','Tab'],map:['KeyM',''],tal:['KeyT','']};
const EDGE=new Set(['pot_hp','pot_mp','use','inv','map','tal']);
let BINDS=loadBinds();
const down=new Set();
function loadBinds(){const b=JSON.parse(JSON.stringify(DEFAULT_BINDS));try{const s=JSON.parse(localStorage.getItem(BK)||'null');if(s)for(const k in b)if(Array.isArray(s[k]))b[k]=[s[k][0]||'',s[k][1]||'']}catch(_){}return b}
function saveBinds(){try{localStorage.setItem(BK,JSON.stringify(BINDS))}catch(_){}}
function held(a){const b=BINDS[a];return!!b&&b.some(c=>c&&down.has(c))}
function codeActs(code){const r=[];for(const a in BINDS)if(BINDS[a].includes(code))r.push(a);return r}
function keyName(c){if(!c)return'—';const M={Mouse0:'ЛКМ',Mouse1:'СКМ',Mouse2:'ПКМ',Mouse3:'М4',Mouse4:'М5',Space:'Пробел',Enter:'Enter',Tab:'Tab',ShiftLeft:'Shift',ShiftRight:'R-Shift',ControlLeft:'Ctrl',ControlRight:'R-Ctrl',AltLeft:'Alt',AltRight:'R-Alt',
  ArrowUp:'↑',ArrowDown:'↓',ArrowLeft:'←',ArrowRight:'→',Backquote:'`',Minus:'-',Equal:'=',BracketLeft:'[',BracketRight:']',Semicolon:';',Quote:"'",Comma:',',Period:'.',Slash:'/',Backslash:'\\',CapsLock:'Caps'};
  if(M[c])return M[c];if(c.startsWith('Key'))return c.slice(3);if(c.startsWith('Digit'))return c.slice(5);if(c.startsWith('Numpad'))return'Num'+c.slice(6);return c}
function actName(a){
  const N={up:'Идти вверх',down:'Идти вниз',left:'Идти влево',right:'Идти вправо',pot_hp:'Зелье здоровья',pot_mp:'Зелье маны',use:'Говорить, открыть',inv:'Сумка',map:'Карта',tal:'Таланты'};
  if(N[a])return N[a];const c=P?CLS[P.cls]:null;
  if(a==='attack')return c?({mage:'Посох (обычная атака)',warrior:'Меч (обычная атака)',ranger:'Лук (обычная атака)'})[P.cls]:'Обычная атака';
  const i=+a.slice(5);return c?`Умение ${i+1}: ${c.sk[i].n}`:`Умение ${i+1}`}

/* ----- keyboard ----- */
let capture=null;
addEventListener('keydown',e=>{
  if(capture){e.preventDefault();if(e.code==='Escape'){capture=null;renderBinds();return}
    setBind(capture.a,capture.i,(e.code==='Backspace'||e.code==='Delete')?'':e.code);return}
  if(e.code.startsWith('Arrow')||e.code==='Space'||e.code==='Tab')e.preventDefault();
  down.add(e.code);if(e.repeat)return;
  const acts=codeActs(e.code);
  if(G.state==='menu'){if(e.code==='Escape'||acts.includes('inv')||acts.includes('map')||acts.includes('tal'))closeOv();return}
  if(G.state==='dead'){if(e.code==='Enter'||acts.includes('use')){e.preventDefault();respawn()}return}
  if(G.state==='title'||G.state==='win')return;
  if(e.code==='Escape'&&G.state==='play'){openMenu();return}
  if(!acts.length){if(e.code==='KeyN'){muted=!muted;toast(muted?'Звук выключен':'Звук включён')}return}
  acts.forEach(a=>actQ.add(a));if(e.code==='Enter')e.preventDefault()});
addEventListener('keyup',e=>down.delete(e.code));
addEventListener('blur',()=>{down.clear();touchAtk=false});
addEventListener('pointerup',e=>{if(e.pointerType==='mouse')down.delete('Mouse'+e.button)});
addEventListener('pointerdown',e=>{if(!capture||e.pointerType!=='mouse')return;e.preventDefault();e.stopPropagation();setBind(capture.a,capture.i,'Mouse'+e.button)},true);
addEventListener('contextmenu',e=>{if(G.state!=='title')e.preventDefault()});
function mouseDown(e){down.add('Mouse'+e.button);if(G.state!=='play')return;codeActs('Mouse'+e.button).forEach(a=>actQ.add(a))}

/* ----- binding UI ----- */
function setBind(a,i,code){if(code){for(const k in BINDS)BINDS[k]=BINDS[k].map(c=>c===code?'':c)}BINDS[a][i]=code;capture=null;saveBinds();renderBinds();if(P&&$('hotbar').children.length)buildHotbar()}
function renderBinds(){const t=$('bindList');if(!t)return;t.innerHTML='';
  const groups=[['Бой',['attack','skill0','skill1','skill2','skill3']],['Зелья и мир',['pot_hp','pot_mp','use','inv','map','tal']],['Движение',['up','down','left','right']]];
  for(const[g,list]of groups){t.appendChild(el('h4','',g));for(const a of list){const row=el('div','brow');row.appendChild(el('span','bname',actName(a)));
    for(let i=0;i<2;i++){const isCap=capture&&capture.a===a&&capture.i===i;const b=el('button','bkey'+(isCap?' cap':'')+(BINDS[a][i]?'':' none'),isCap?'Нажми…':keyName(BINDS[a][i]));
      b.addEventListener('click',()=>{setTimeout(()=>{capture={a,i};renderBinds()},0)});row.appendChild(b)}
    t.appendChild(row)}}}
function kb(a){return keyName((BINDS[a]||[]).find(Boolean)||'')}
