'use strict';
/* ===== menu: main menu, new hero, pause, settings, music, fullscreen ===== */
const STK='velmor2_settings';
try{Object.assign(SET,JSON.parse(localStorage.getItem(STK)||'{}'))}catch(_){}
function saveSet(){try{localStorage.setItem(STK,JSON.stringify(SET))}catch(_){}}

/* ----- pixel icons ----- */
const MICO={
 play:["..k......","..kyk....","..kyyk...","..kyyyk..","..kyyyyk.","..kyyyk..","..kyyk...","..kyk....","..k......"],
 star:["....k....","...kyk...","kkkkykkkk","kyyyyyyyk",".kyyyyyk.","..kyyyk..",".kyykyyk.",".kyk.kyk.",".kk...kk."],
 gear:["...kkk...",".k.kgk.k.","kgkkgkkgk",".kggggk..","kkgkkkgkk",".kggggk..","kgkkgkkgk",".k.kgk.k.","...kkk..."],
 power:["....k....","..k.y.k..",".ky.y.yk.","ky..y..yk","ky.....yk","ky.....yk",".ky...yk.","..kyyyk..","...kkk..."],
 home:["....k....","...kyk...","..kyyyk..",".kyyyyyk.","kyyyyyyyk",".kyhhhyk.",".kyhkhyk.",".kyhkhyk.",".kkkkkkk."],
 full:["kkk...kkk","kyk...kyk","kk.....kk","........."," ........","kk.....kk","kyk...kyk","kkk...kkk","........."],
 keys:["kkkkkkkkk","kwkwkwkwk","kkkkkkkkk","kwkwkwkwk","kkkkkkkkk","kwkwwwkwk","kkkkkkkkk",".........","........."],
 back:["...k.....","..kyk....",".kyyk....","kyyyykkkk","kyyyyyyyk",".kyyk....","..kyk....","...k.....","........."]
};
const MICON={};for(const k in MICO)MICON[k]=bigURL(mk(MICO[k].map(r=>r.replace(/ /g,'.'))),4);
document.querySelectorAll('[data-ico]').forEach(b=>{const i=el('img','mico');i.src=MICON[b.dataset.ico];i.alt='';b.prepend(i)});

/* ----- music ----- */
const TRACKS={menu:'music/menu.mp3',village:'music/village.mp3',wild:'music/wild.mp3',dark:'music/dark.mp3',boss:'music/boss.mp3'};
const MUS={cur:null,a:null,old:[],unlocked:false};
function wantTrack(){if(G.state==='title')return'menu';if(!P)return'menu';if(G.boss&&!G.boss.dead)return'boss';const r=RG(P.x/16|0,P.y/16|0);
  if(r===1)return'village';if(r===3||r===5||r===6||r===8)return'dark';return'wild'}
function musicTick(dt){if(!MUS.unlocked)return;const want=wantTrack(),vol=muted?0:SET.music;
  if(want!==MUS.cur){if(MUS.a)MUS.old.push(MUS.a);MUS.cur=want;try{const a=new Audio(TRACKS[want]);a.loop=true;a.volume=0;a.play().catch(()=>{});MUS.a=a}catch(_){MUS.a=null}}
  if(MUS.a)MUS.a.volume=Math.min(vol,MUS.a.volume+dt*.5*Math.max(.05,vol))*(vol>0?1:0);
  MUS.old=MUS.old.filter(a=>{a.volume=Math.max(0,a.volume-dt*.6);if(a.volume<=0.01){a.pause();return false}return true})}
function unlockAudio(){if(!MUS.unlocked){MUS.unlocked=true}try{AC=AC||new(window.AudioContext||window.webkitAudioContext)();AC.resume&&AC.resume()}catch(_){}
  if(MUS.a&&MUS.a.paused)MUS.a.play().catch(()=>{})}
addEventListener('pointerdown',unlockAudio,true);addEventListener('keydown',unlockAudio,true);

/* ----- fullscreen without the frame ----- */
const isFull=()=>!!(document.fullscreenElement||document.webkitFullscreenElement);
function enterFull(){const r=document.documentElement,f=r.requestFullscreen||r.webkitRequestFullscreen;if(!f||isFull())return lockEsc();
  try{const p=f.call(r,{navigationUI:'hide'});if(p&&p.then)p.then(lockEsc).catch(()=>{});else lockEsc()}catch(_){}}
function lockEsc(){try{if(navigator.keyboard&&navigator.keyboard.lock)navigator.keyboard.lock(['Escape']).catch(()=>{})}catch(_){}}
function toggleFull(){if(isFull()){SET.autoFull=false;saveSet();(document.exitFullscreen||document.webkitExitFullscreen).call(document)}else{SET.autoFull=true;saveSet();enterFull()}syncSet()}
document.addEventListener('fullscreenchange',()=>{setTimeout(resize,60);if(!isFull()&&G.state==='play')openMenu()});
addEventListener('keydown',e=>{if(e.code==='KeyF'&&!e.repeat&&!capture&&!codeActs('KeyF').length&&(G.state==='play'||G.state==='title'))toggleFull()});

/* ----- exit ----- */
function exitGame(){save();try{if(isFull())(document.exitFullscreen||document.webkitExitFullscreen).call(document)}catch(_){}
  try{window.close()}catch(_){}setTimeout(()=>{if(!document.hidden)toast('Окно не даёт закрыть себя из игры. Закрой его крестиком, прогресс сохранён.')},350)}

/* ----- settings block (shared by main menu and pause) ----- */
function syncSet(){$('sMusic').value=Math.round(SET.music*100);$('sSfx').value=Math.round(SET.sfx*100);$('sFull').checked=!!SET.autoFull;
  $('sMusicV').textContent=Math.round(SET.music*100)+'%';$('sSfxV').textContent=Math.round(SET.sfx*100)+'%'}
$('sMusic').addEventListener('input',e=>{SET.music=e.target.value/100;muted=false;syncSet();saveSet()});
$('sSfx').addEventListener('input',e=>{SET.sfx=e.target.value/100;muted=false;syncSet();saveSet();sfx('coin')});
$('sFull').addEventListener('change',e=>{SET.autoFull=e.target.checked;saveSet();if(SET.autoFull)enterFull();else if(isFull())(document.exitFullscreen||document.webkitExitFullscreen).call(document)});
$('bReset').addEventListener('click',()=>{BINDS=JSON.parse(JSON.stringify(DEFAULT_BINDS));saveBinds();renderBinds();if(P&&G.state!=='title')buildHotbar()});
function mountSettings(where){$(where).appendChild($('setBlock'));syncSet();renderBinds()}

/* ----- main menu ----- */
function showScreen(id){['mmMain','mmNew','mmSet'].forEach(s=>$(s).hidden=s!==id)}
function showMain(){G.state='title';$('hud').hidden=true;$('ovTitle').hidden=false;['ovMenu','ovWin','ovDead','ovInv','ovMap'].forEach(i=>$(i).hidden=true);$('dlg').hidden=true;
  const sv=loadSave();$('mContinue').hidden=!sv;if(sv)$('mContInfo').textContent=`${(RACES[sv.race]||RACES.human).n}, ${CLS[sv.cls].n}, ур. ${sv.lvl}`;
  $('mLogo').src=bigURL(heroSpr(sv?sv.cls:'mage',sv&&sv.race||'human'),6);showScreen('mmMain')}
$('mContinue').addEventListener('click',()=>{const sv=loadSave();if(sv)beginGame(sv.cls,sv.race,sv)});
$('mNew').addEventListener('click',()=>{NG.armed=false;renderNew();showScreen('mmNew')});
$('mSettings').addEventListener('click',()=>{mountSettings('mmSetBody');showScreen('mmSet')});
$('mExit').addEventListener('click',exitGame);
document.querySelectorAll('.mback').forEach(b=>b.addEventListener('click',()=>showScreen('mmMain')));

/* ----- new hero ----- */
const NG={cls:'mage',race:'human',armed:false};
function previewStats(cls,race){const c=CLS[cls],b=(RACES[race]||RACES.human).b;
  return[['Здоровье',Math.round(c.hp*(1+(b.hpP||0)/100))],['Мана',Math.round(c.mp*(1+(b.mpP||0)/100))],['Урон оружия',Math.round(c.w.dmg*(1+(b.dmgP||0)/100))],['Сила магии',Math.round(c.sp*100)+'%'],
    ['Броня',c.armor+(b.armor||0)],['Шанс крита',(c.crit+(b.crit||0))+'%'],['Скорость',Math.round(c.ms*(1+(b.ms||0)/100))],['Уворот',(b.dodge||0)+'%']]}
function renderNew(){const c=CLS[NG.cls],r=RACES[NG.race];
  $('pvImg').src=bigURL(heroSpr(NG.cls,NG.race),7);$('pvName').textContent=`${r.n} · ${c.n}`;
  const st=$('pvStats');st.innerHTML='';previewStats(NG.cls,NG.race).forEach(([a,b])=>st.append(el('dt','',a),el('dd','',String(b))));
  const cc=$('clsChips');cc.innerHTML='';Object.keys(CLS).forEach(k=>{const b=el('button','chip'+(k===NG.cls?' on':''));const i=el('img');i.src=bigURL(heroSpr(k,NG.race),2);i.alt='';b.append(i,CLS[k].n);b.addEventListener('click',()=>{NG.cls=k;renderNew()});cc.appendChild(b)});
  $('clsDesc').textContent=c.d;$('clsSk').innerHTML=c.sk.map(s=>`<li><span style="color:${s.col}">${s.ic}</span> ${s.n} <small>ур. ${s.lv} · ${s.d}</small></li>`).join('');
  const rc=$('raceChips');rc.innerHTML='';Object.keys(RACES).forEach(k=>{const b=el('button','chip'+(k===NG.race?' on':''));const i=el('img');i.src=bigURL(heroSpr(NG.cls,k),2);i.alt='';b.append(i,RACES[k].n);b.addEventListener('click',()=>{NG.race=k;renderNew()});rc.appendChild(b)});
  $('raceDesc').textContent=r.d;
  const sv=loadSave();$('ngStart').textContent=NG.armed?'Точно? Старый герой пропадёт':'В путь';$('ngStart').classList.toggle('warn',NG.armed);$('ngWarn').hidden=!sv}
$('ngStart').addEventListener('click',()=>{if(loadSave()&&!NG.armed){NG.armed=true;renderNew();return}beginGame(NG.cls,NG.race,null)});

/* ----- start / pause ----- */
function beginGame(cls,race,sv){unlockAudio();if(SET.autoFull)enterFull();
  if(sv)applySave(sv);else newGame(cls,race);
  $('ovTitle').hidden=true;$('hud').hidden=false;buildHotbar();lastQ='';lastR='';G.state='play';G.cx=P.x-VW/2;G.cy=P.y-VH/2;G.regionCur=-1;
  if(!sv){save();setTimeout(()=>toast('Поговори со старейшиной Ольвеном. Подойди и нажми E'),600)}else toast('С возвращением в Вельмор!')}
function openMenu(){if(G.state!=='play')return;G.state='menu';capture=null;$('ovMenu').hidden=false;mountSettings('pSet');
  const R=RACES[P.race]||RACES.human,t=Math.floor(G.time/60);$('pHero').textContent=`${R.n} · ${CLS[P.cls].n} · ур. ${P.lvl} · рун ${Object.values(P.runes).filter(Boolean).length} из ${SHRINES.length} · в пути ${t} мин`}
$('pResume').addEventListener('click',()=>{capture=null;closeOv();if(SET.autoFull)enterFull()});
$('pFull').addEventListener('click',()=>{toggleFull()});
$('pMain').addEventListener('click',()=>{save();capture=null;showMain()});
$('pExit').addEventListener('click',exitGame);
$('bMenu').addEventListener('click',()=>openMenu());
$('bRestart').addEventListener('click',()=>showMain());
syncSet();
$('bFull').addEventListener('click',toggleFull);
showMain();
