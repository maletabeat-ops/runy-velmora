'use strict';
/* ===== ui: hud, hotbar, inventory, map, title, input, loop ===== */
const slotEls={};
function el(tag,cls,html){const e=document.createElement(tag);if(cls)e.className=cls;if(html!=null)e.innerHTML=html;return e}
function buildHotbar(){const hb=$('hotbar');hb.innerHTML='';const c=CLS[P.cls];
  const mkS=(act,key,inner,cls,title)=>{const b=el('button','slot '+(cls||''),`<span class="k">${key}</span>${inner}<i class="cd"></i>`);b.dataset.act=act;if(title)b.title=title;b.setAttribute('aria-label',title||act);hb.appendChild(b);
    b.addEventListener('pointerdown',e=>{e.preventDefault();if(G.state==='dialog'){advance();return}if(G.state!=='play')return;if(act==='attack')touchAtk=true;else actQ.add(act)});
    const up=()=>{if(act==='attack')touchAtk=false};b.addEventListener('pointerup',up);b.addEventListener('pointerleave',up);b.addEventListener('pointercancel',up);return b};
  slotEls.atk=mkS('attack',kb('attack'),`<img class="ic" src="${ICON[weaponIcon(P.cls)]}" alt="">`,'s-attack','Атака');
  c.sk.forEach((s,i)=>{slotEls['s'+i]=mkS('skill'+i,kb('skill'+i),`<span class="ic" style="color:${s.col}">${s.ic}</span><span class="c">${s.mp}</span><span class="lk">ур.${s.lv}</span>`,'s-skill',`${s.n}: ${s.d}. ${s.mp} маны`)});
  slotEls.hp=mkS('pot_hp',kb('pot_hp'),`<img class="ic" src="${ICON.pot}" alt=""><span class="n"></span>`,'s-pot','Зелье здоровья');
  slotEls.mp=mkS('pot_mp',kb('pot_mp'),`<img class="ic" src="${ICON.potmp}" alt=""><span class="n"></span>`,'s-pot','Зелье маны');
  slotEls.use=mkS('use','E','<span class="ic etext">E</span>','s-use','Говорить');
  $('cname').textContent=c.n}
let lastQ='',lastR='';
function hud(){
  const S=P.S;$('lvl').textContent=P.lvl;$('hpF').style.width=(P.hp/S.maxHp*100)+'%';$('hpT').textContent=Math.ceil(P.hp)+' / '+S.maxHp;
  $('mpF').style.width=(P.mp/S.maxMp*100)+'%';$('mpT').textContent=Math.floor(P.mp)+' / '+S.maxMp;$('xpF').style.width=(P.lvl>=25?100:P.xp/xpNeed(P.lvl)*100)+'%';$('gold').textContent=P.gold;
  $('hpF').parentNode.classList.toggle('poison',P.poison>0);
  const rk=SHRINES.map(s=>+P.runes[s.id]).join('');if(rk!==lastR){lastR=rk;const R=$('runes');R.innerHTML='';SHRINES.forEach(s=>{const e=el('span',P.runes[s.id]?'on':'');e.style.color=s.col;e.title=s.name;R.appendChild(e)})}
  const c=CLS[P.cls];
  slotEls.atk.querySelector('.cd').style.height=(P.cd.atk>0?Math.min(1,P.cd.atk/.5)*100:0)+'%';
  c.sk.forEach((s,i)=>{const b=slotEls['s'+i];b.classList.toggle('locked',P.lvl<s.lv);b.classList.toggle('nomana',P.mp<s.mp);b.querySelector('.cd').style.height=(P.scd[i]/s.cd*100)+'%'});
  ['hp','mp'].forEach(k=>{const b=slotEls[k];b.querySelector('.n').textContent=P.pots[k];b.classList.toggle('locked',P.pots[k]<=0);b.querySelector('.cd').style.height=(P.cd.pot*100)+'%'});
  const left=SHRINES.filter(s=>!s.done).length;
  const q=G.won?['Вельмор спасён','Ищи легендарные вещи в сундуках и у боссов']:G.quest===0?['Задание','Поговори со старейшиной Ольвеном']:left?[`Руны: ${3-left} из 3`,'Святилища мигают на карте']:['Склеп открыт','Склеп на юго-востоке, за кладбищем'];
  const b=P.bounty,B=BOUNTIES[b.i];const bq=b.active&&B?`${B.t}: ${Math.min(b.prog,B.n)} / ${B.n}`:'';
  const qs=q.join('|')+bq;if(qs!==lastQ){lastQ=qs;const Q=$('quest');Q.innerHTML='';Q.append(el('small','',q[0]),q[1]);if(bq){Q.append(el('small','b','Охота'),bq)}}
  const bo=G.boss&&!G.boss.dead?G.boss:null;$('boss').hidden=!bo;if(bo){$('bossN').textContent=bo.f.n;$('bossF').style.width=(Math.max(0,bo.hp)/bo.maxHp*100)+'%'}
  drawMini($('mm').getContext('2d'),1)}
function drawMini(m,s){m.imageSmoothingEnabled=false;m.drawImage(mmBase,0,0,W*s,H*s);m.drawImage(fogCv,0,0,W*s,H*s);const bl=(G.time*3|0)%2;
  const mark=(x,y,c,z=3)=>{if(!explored[y*W+x]&&s===1)return;m.fillStyle=c;m.fillRect((x-1)*s,(y-1)*s,z*s,z*s)};
  SHRINES.forEach(sh=>{if(!sh.done&&(bl||s>1))mark(sh.x,sh.y,sh.col)});
  if(s>1)CHESTS.forEach(c=>{if(!c.open&&explored[c.ty*W+c.tx])mark(c.tx,c.ty,'#f2c14e',2)});
  if(G.quest===0&&bl){m.fillStyle='#f2c14e';m.fillRect(44*s,34*s,3*s,3*s)}
  if(G.gateOpen&&!G.won&&(bl||s>1)){m.fillStyle='#c48aff';m.fillRect((GATE.x-1)*s,(GATE.y-1)*s,3*s,3*s)}
  m.fillStyle='#fff';m.fillRect(((P.x/16|0)-1)*s,((P.y/16|0)-1)*s,2*s+1,2*s+1)}

/* ----- inventory & shop ----- */
let INV={mode:null,sel:null};
function openInv(mode){INV.mode=mode||null;INV.sel=null;G.state='menu';$('ovInv').hidden=false;renderInv()}
function closeOv(){['ovInv','ovMap','ovMenu'].forEach(i=>$(i).hidden=true);if(G.state==='menu')G.state='play';save()}
function cell(it,onClick,selected,label){const b=el('button','cell'+(it?' r'+it.rar:' empty')+(selected?' sel':''));
  if(it){const img=el('img');img.src=itemIcon(it);img.alt='';b.appendChild(img);if(it.slot==='weapon'&&it.cls!==P.cls)b.classList.add('wrong')}
  else if(label)b.appendChild(el('span','lbl',label));b.addEventListener('click',onClick);return b}
function statLines(){const S=P.S,red=Math.round(S.armor/(S.armor+50)*100),c=CLS[P.cls];
  const L=[['Здоровье',S.maxHp],['Мана',S.maxMp],['Урон оружия',Math.round(S.wdmg)],['Сила магии',Math.round(S.sp*100)+'%'],['Броня',`${S.armor} (−${red}% урона)`],['Шанс крита',S.crit+'%'],['Скорость атаки','+'+S.as+'%'],['Скорость бега','+'+S.ms+'%'],['Мана в секунду',S.mpr.toFixed(1)]];
  if(S.ls)L.push(['Вампиризм',S.ls+'%']);if(S.dmgP)L.push(['Бонус урона','+'+S.dmgP+'%']);return L}
function itemHTML(it){const r=RAR[it.rar];let h=`<div class="iname" style="color:${r.c}">${it.name}</div><div class="imeta">${r.n} · ${itemType(it)} · ур. ${it.lvl}</div>`;
  if(it.slot==='weapon'&&it.cls!==P.cls)h+=`<div class="warnl">Только для класса «${CLS[it.cls].n}»</div>`;
  if(it.dmg)h+=`<div class="main">Урон ${it.dmg}${cmpTxt(it,'dmg')}</div>`;if(it.armor)h+=`<div class="main">Броня ${it.armor}${cmpTxt(it,'armor')}</div>`;
  for(const k in it.af)h+=`<div class="af">${AFX[k].t(it.af[k])}</div>`;if(it.fxd)h+=`<div class="fx">★ ${it.fxd}</div>`;return h}
function cmpTxt(it,k){const cur=P.eq[it.slot];if(!cur||cur===it||(it.slot==='weapon'&&it.cls!==P.cls))return'';const d=it[k]-(cur[k]||0);return d?` <b class="${d>0?'up':'down'}">${d>0?'▲ +':'▼ '}${d}</b>`:''}
function act(label,fn,primary,disabled){const b=el('button','abtn'+(primary?' pri':''),label);b.disabled=!!disabled;b.addEventListener('click',fn);return b}
function renderInv(){
  const shop=INV.mode,inShop=!!shop;$('invTitle').textContent=shop==='smith'?'Кузница Брама':shop==='herb'?'Лавка Ивы':'Снаряжение';$('invGold').textContent=P.gold;
  const eg=$('eqGrid');eg.innerHTML='';SLOTS.forEach(s=>{const w=el('div','eqs');w.append(el('span','eql',SLOTN[s]),cell(P.eq[s],()=>{INV.sel={src:'eq',k:s};renderInv()},INV.sel&&INV.sel.src==='eq'&&INV.sel.k===s,'—'));eg.appendChild(w)});
  const pw=el('div','eqs');pw.append(el('span','eql','Зелья'),el('div','pots',`<img src="${ICON.pot}" alt=""> ${P.pots.hp} &nbsp; <img src="${ICON.potmp}" alt=""> ${P.pots.mp}`));eg.appendChild(pw);
  const sl=$('statList');sl.innerHTML='';statLines().forEach(([a,b])=>{sl.append(el('dt','',a),el('dd','',String(b)))});
  $('shopWrap').hidden=!inShop;
  if(inShop){const sg=$('shopGrid');sg.innerHTML='';const items=shop==='herb'?[{slot:'potion',kind:'hp',name:'Зелье здоровья',rar:1,lvl:P.lvl,af:{},cost:15},{slot:'potion',kind:'mp',name:'Зелье маны',rar:2,lvl:P.lvl,af:{},cost:12}]:P.stock.map(it=>({...it,cost:it.price*4}));
    INV.shopItems=items;items.forEach((it,i)=>{const c=cell(it,()=>{INV.sel={src:'shop',i};renderInv()},INV.sel&&INV.sel.src==='shop'&&INV.sel.i===i);c.append(el('span','price',it.cost));sg.appendChild(c)});
    $('shopTitle').textContent=shop==='herb'?'Зелья':'Товары (обновляются с новым уровнем)'}
  const bg=$('bagGrid');bg.innerHTML='';for(let i=0;i<24;i++){const it=P.bag[i];bg.appendChild(cell(it,()=>{if(it){INV.sel={src:'bag',i};renderInv()}},INV.sel&&INV.sel.src==='bag'&&INV.sel.i===i))}
  $('bagCount').textContent=P.bag.length+' / 24';
  const det=$('det');det.innerHTML='';const s=INV.sel;
  const it=!s?null:s.src==='bag'?P.bag[s.i]:s.src==='eq'?P.eq[s.k]:INV.shopItems&&INV.shopItems[s.i];
  if(!it){det.append(el('p','hint',inShop?'Нажми на товар, чтобы купить, или на вещь в сумке, чтобы продать.':'Нажми на вещь, чтобы рассмотреть, надеть или выбросить.'));return}
  if(it.slot==='potion')det.append(el('div','',`<div class="iname" style="color:${RAR[it.rar].c}">${it.name}</div><div class="af">${it.kind==='hp'?'Лечит 45% здоровья. Клавиша Q':'Возвращает 50% маны. Клавиша R'}</div>`));
  else det.append(el('div','',itemHTML(it)));
  const row=el('div','acts');
  if(s.src==='bag'){const ok=!(it.slot==='weapon'&&it.cls!==P.cls);row.append(act('Надеть',()=>equip(s.i),true,!ok));
    if(inShop&&shop==='smith')row.append(act('Продать за '+it.price,()=>{P.gold+=it.price;P.bag.splice(s.i,1);INV.sel=null;sfx('coin');renderInv()}));
    else row.append(act('Выбросить',()=>{P.bag.splice(s.i,1);INV.sel=null;renderInv()}))}
  else if(s.src==='eq')row.append(act('Снять',()=>{if(P.bag.length>=24)return;P.bag.push(P.eq[s.k]);P.eq[s.k]=null;recalc();INV.sel=null;renderInv()},false,P.bag.length>=24||s.k==='weapon'&&false));
  else{const can=P.gold>=it.cost&&(it.slot==='potion'||P.bag.length<24);row.append(act(`Купить за ${it.cost}`,()=>{if(!can)return;P.gold-=it.cost;sfx('coin');
    if(it.slot==='potion')P.pots[it.kind]++;else{const real=P.stock.find(x=>x.uid===it.uid);P.stock=P.stock.filter(x=>x!==real);P.bag.push(real);INV.sel=null}renderInv()},true,!can));
    if(P.gold<it.cost)row.append(el('span','need','Не хватает золота'))}
  det.append(row)}
function equip(i){const it=P.bag[i];if(it.slot==='weapon'&&it.cls!==P.cls)return;const old=P.eq[it.slot];P.eq[it.slot]=it;P.bag.splice(i,1);if(old)P.bag.push(old);recalc();sfx('item');
  if(it.slot==='weapon')$('hotbar').querySelector('.s-attack img').src=ICON[weaponIcon(P.cls)];INV.sel={src:'eq',k:it.slot};renderInv()}

/* ----- big map ----- */
function openMap(){G.state='menu';$('ovMap').hidden=false;const c=$('bigmap'),m=c.getContext('2d');m.clearRect(0,0,c.width,c.height);drawMini(m,4);
  const L=$('mapLabels');L.innerHTML='';REGIONS.forEach((R,i)=>{const[x,y]=R.lab;if(!explored[y*W+x]&&i!==1)return;const d=el('div','mlab',`${R.n}${R.lv?`<small>ур. ${R.lv[0]}–${R.lv[1]}</small>`:''}`);d.style.left=(x/W*100)+'%';d.style.top=(y/H*100)+'%';L.appendChild(d)})}

/* ----- title & class select ----- */
function buildTitle(){const box=$('cards');box.innerHTML='';const sv=loadSave();
  if(sv){$('contWrap').hidden=false;$('bCont').textContent=`Продолжить: ${CLS[sv.cls].n}, ур. ${sv.lvl}`}
  Object.keys(CLS).forEach(k=>{const c=CLS[k],card=el('div','ccard pnl');
    const img=el('img','cimg');img.src=bigURL(SPR[c.spr],5);img.alt=c.n;
    const pips=Object.entries({hp:'Здоровье',mp:'Мана',atk:'Оружие',mag:'Магия'}).map(([p,n])=>`<div class="pip"><span>${n}</span><i>${'<b></b>'.repeat(c.pips[p])}${'<b class="o"></b>'.repeat(3-c.pips[p])}</i></div>`).join('');
    card.innerHTML=`<h3>${c.n}</h3><p class="cd">${c.d}</p><div class="pips">${pips}</div><ul class="sks">${c.sk.map(s=>`<li><span style="color:${s.col}">${s.ic}</span> ${s.n} <small>ур. ${s.lv}</small></li>`).join('')}</ul>`;
    card.prepend(img);const b=el('button','btn','Выбрать');let armed=false;
    b.addEventListener('click',()=>{if(sv&&!armed){armed=true;b.textContent='Точно? Сохранение пропадёт';b.classList.add('warn');return}startGame(k)});card.appendChild(b);box.appendChild(card)})}
function audioOn(){try{AC=AC||new(window.AudioContext||window.webkitAudioContext)();AC.resume&&AC.resume()}catch(_){}}
function startGame(cls,sv){audioOn();if(sv)applySave(sv);else{newGame(cls)}
  $('ovTitle').hidden=true;$('hud').hidden=false;buildHotbar();lastQ='';lastR='';G.state='play';G.cx=P.x-VW/2;G.cy=P.y-VH/2;
  if(!sv){save();setTimeout(()=>toast('Поговори со старейшиной Ольвеном. Подойди и нажми E'),400)}else toast('С возвращением в Вельмор!')}
function showWin(){G.state='win';const m=Math.floor(G.time/60),s=Math.floor(G.time%60);const ws=$('winStats');ws.innerHTML='';
  [[m+':'+String(s).padStart(2,'0'),'время'],[P.lvl,'уровень'],[G.kills,'побеждено'],[P.gold,'золота']].forEach(([v,l])=>{const d=el('div','',String(v));d.appendChild(el('span','',l));ws.appendChild(d)});$('ovWin').hidden=false}

/* ----- main update ----- */
function update(dt){
  G.time+=dt;G.shake=Math.max(0,G.shake-dt);
  updatePlayer(dt);if(G.state!=='play')return;
  updateEnemies(dt);updateProj(dt);updateMisc(dt);spawnTick(dt);if(G.state!=='play')return;bossCheck();
  findNear();if(actQ.has('use')&&G.near)interact(G.near);
  if(actQ.has('inv'))openInv();else if(actQ.has('map'))openMap();
  G.fogT-=dt;if(G.fogT<=0){G.fogT=.25;reveal(P.x/16|0,P.y/16|0,9)}
  const r=RG(P.x/16|0,P.y/16|0);if(r!==G.regionCur){G.regionCur=r;const R=REGIONS[r];const b=$('region');b.innerHTML=`${R.n}${R.lv?`<small>ур. ${R.lv[0]}–${R.lv[1]}</small>`:'<small>безопасно</small>'}`;b.classList.remove('on');void b.offsetWidth;b.classList.add('on')}
  G.saveT-=dt;if(G.saveT<=0){G.saveT=20;save()}
  if(G.winT>0){G.winT-=dt;if(G.winT<=0)showWin()}}

/* ----- input ----- */
if(matchMedia('(pointer: coarse)').matches)document.body.classList.add('touch');
const joyEl=$('joy'),knob=$('knob');
function toWorld(e){G.mx=(G.camX||0)+e.clientX/SCALE;G.my=(G.camY||0)+e.clientY/SCALE}
cv.addEventListener('pointerdown',e=>{if(G.state==='dialog'){advance();return}if(G.state!=='play')return;
  if(e.pointerType==='mouse'){toWorld(e);G.mouseT=G.time;mouseDown(e);return}
  if(e.clientX>innerWidth*.5){touchAtk=true;cv.setPointerCapture(e.pointerId);return}
  joy.id=e.pointerId;joy.ox=e.clientX;joy.oy=e.clientY;joyEl.hidden=false;joyEl.style.left=e.clientX+'px';joyEl.style.top=e.clientY+'px';knob.style.transform='';cv.setPointerCapture(e.pointerId)});
cv.addEventListener('pointermove',e=>{if(e.pointerType==='mouse'){toWorld(e);G.mouseT=G.time;return}if(e.pointerId!==joy.id)return;
  let dx=(e.clientX-joy.ox)/40,dy=(e.clientY-joy.oy)/40;const l=Math.hypot(dx,dy);if(l>1){dx/=l;dy/=l}joy.x=dx;joy.y=dy;knob.style.transform=`translate(${dx*32}px,${dy*32}px)`});
const jEnd=e=>{if(e.pointerType==='mouse'){down.delete('Mouse'+e.button);return}if(e.pointerId===joy.id){joy.id=null;joy.x=joy.y=0;joyEl.hidden=true}else touchAtk=false};
cv.addEventListener('pointerup',jEnd);cv.addEventListener('pointercancel',jEnd);cv.addEventListener('contextmenu',e=>e.preventDefault());
$('dlg').addEventListener('pointerdown',e=>{e.preventDefault();advance()});
$('bBag').addEventListener('click',()=>{if(G.state==='play')openInv()});$('bMap').addEventListener('click',()=>{if(G.state==='play')openMap()});
$('invClose').addEventListener('click',closeOv);$('mapClose').addEventListener('click',closeOv);
$('bCont').addEventListener('click',()=>{const sv=loadSave();if(sv)startGame(sv.cls,sv)});
$('bRespawn').addEventListener('click',respawn);
$('bRoam').addEventListener('click',()=>{$('ovWin').hidden=true;G.state='play'});
$('bRestart').addEventListener('click',()=>{$('ovWin').hidden=true;$('hud').hidden=true;G.state='title';$('ovTitle').hidden=false;buildTitle()});

/* ----- fullscreen ----- */
function toggleFull(){const d=document,r=d.documentElement;try{
  if(d.fullscreenElement||d.webkitFullscreenElement){(d.exitFullscreen||d.webkitExitFullscreen).call(d);return}
  const f=r.requestFullscreen||r.webkitRequestFullscreen;if(!f)throw 0;const p=f.call(r,{navigationUI:'hide'});if(p&&p.catch)p.catch(()=>fullFail());
  try{screen.orientation&&screen.orientation.lock&&screen.orientation.lock('landscape').catch(()=>{})}catch(_){}}catch(_){fullFail()}}
function fullFail(){toast('Браузер не дал включить полный экран. Попробуй F11 или открой игру отдельным файлом')}
$('bFull').addEventListener('click',toggleFull);$('bFull2').addEventListener('click',toggleFull);
addEventListener('keydown',e=>{if(e.code==='KeyF'&&!e.repeat&&!capture&&!codeActs('KeyF').length&&(G.state==='play'||G.state==='title'))toggleFull()});
document.addEventListener('fullscreenchange',()=>setTimeout(resize,50));

/* ----- boot ----- */
resize();genMap();renderWorld();buildMM();buildTitle();
let lastT=performance.now(),titleCam=0;
function frame(now){const dt=Math.min(.05,(now-lastT)/1000);lastT=now;
  if(G.state==='play')update(dt);else if(G.state==='dialog'){tickDialog(dt);updateMisc(0)}
  if(G.state==='title'){titleCam+=dt*14;ctx.fillStyle='#0f0d14';ctx.fillRect(0,0,VW,VH);const x=clamp(300+titleCam%900,0,WW-VW),y=clamp(420,0,WH-VH);ctx.drawImage(worldCv,x,y,VW,VH,0,0,VW,VH);ctx.drawImage(vg,0,0)}
  else{render(dt);if(P&&G.state!=='win')hud()}
  actQ.clear();requestAnimationFrame(frame)}
requestAnimationFrame(frame);
window.__vel={get P(){return P},G,spawn,genItem,dropItem,openGate,get enemies(){return enemies}};
