'use strict';
/* ===== town: NPC dialogs, quests with choices, talents, crafting, ship, tavern, NG+ ===== */
const HINTS=['Видишь красный круг на земле? Беги из него.','Акулы бросаются, когда подплывут близко. Рули в сторону, как только она присела.','Пауки плюются паутиной. В ней ноги вязнут.','Ведьмы с топей исчезают и появляются за спиной.','Громилы замахиваются медленно. Успеешь отбежать.','Ночью из тьмы лезут призраки. Держись света.','В деревне раны затягиваются сами. Монстры сюда не заходят.','Мои зелья лечат треть здоровья. Носи с собой несколько.'];
const hasMats=c=>Object.entries(c).every(([k,v])=>(P.mats[k]||0)>=v);
const payMats=c=>{for(const k in c)P.mats[k]-=c[k]};
const matTxt=c=>Object.entries(c).map(([k,v])=>`<span class="mat" style="--c:${MATS[k].c}">${v} ${MATS[k].n.toLowerCase()}</span>`).join(' ');
function interact(n){
  if(n.kind==='shrine'){const s=n.s;if(s.done)say([{who:s.name,text:'Алтарь пуст. Жемчужина уже у тебя.'}]);else activateShrine(s);return}
  if(n.kind==='chest'){openChest(n.c);return}
  if(n.kind==='entrance'){enterDungeon(n.en.id);return}
  if(n.kind==='stairs'){G.dun.floor++;buildFloor();return}
  if(n.kind==='exit'){exitDungeon();toast('Ты снова под открытым небом');return}
  const id=n.id;
  if(id==='elder')return elderTalk(n);
  if(id==='smith'){if(P.stockLvl!==P.lvl||!P.stock.length)restock();return say([{who:n.name,text:pick(['Сабли, луки, посохи. Всё честно выковано. Ну, почти всё.','Принёс железо? Скую что-нибудь получше того, что у тебя в руках.','Сталь не врёт. Выбирай или заказывай.'])}],()=>openInv('smith'))}
  if(id==='herb'){P.hp=P.S.maxHp;P.mp=P.S.maxMp;P.poison=0;sfx('heal');burst(P.x,P.y-6,'#7fe07a',18,50,.7);return say([{who:n.name,text:'Выпей отвар, силы вернутся. '+pick(HINTS)}],()=>openInv('herb'))}
  if(id==='tara')return bountyTalk(n);
  if(id==='tavern')return say([{who:n.name,text:'Ищешь, с кем выйти в море? Найдутся смельчаки. За плату, конечно.'}],()=>openInv('tavern'));
  if(id==='ship')return say([{who:n.name,text:'Лодка у тебя крепкая, но я сделаю её лучше. Неси дерево, железо и шкуры.'}],()=>openInv('ship'));
  if(id==='priest')return priestTalk(n);
  if(id==='keeper')return keeperTalk(n);
  if(id==='ilva')return ilvaTalk(n);
  if(id==='qm')return qmTalk(n);
  if(id==='timcage')return say([{who:'Юнга Тим',text:P.q.pr===2?'...Ты теперь с ними заодно? Ну и ладно.':'Эй! Вытащи меня отсюда! Рыжий держит меня в клетке ради выкупа.'}]);
}
function elderTalk(n){
  if(G.quest===0)return say([
    {who:n.name,text:'Вовремя ты проснулся. Над островами снова Вечный шторм. Это Морвен, Глаз Шторма. Она поднимается из Затонувшего храма.'},
    {who:n.name,text:'Храм держат пять жемчужин бури. Морвен разбросала их по островам, и каждую стережёт чудище.'},
    {who:n.name,text:'Твоя лодка ждёт у причала. Просто зайди в глубокую воду, и ты на борту. Чтобы сойти, подплыви к берегу.'},
    {who:n.name,text:'Начни с Пальмового острова на северо-западе. Гарра кует оружие, Мирра варит зелья, Нэлла платит за охоту, Гром найдёт спутника, Ульф улучшит лодку, а Отец Марин поможет с талантами.'}],()=>{G.quest=1;toast('Задание: собери пять жемчужин бури');save()});
  if(G.won)return say([{who:n.name,text:'Шторм утих. Острова спят спокойно. Но я слышал, что в глубине Морвен оставила себе наследников...'},{who:n.name,text:'Если захочешь испытать себя снова, после победы над Морвен можно начать «Новую игру+». Мир станет злее, а добыча богаче.'}]);
  const left=SHRINES.filter(s=>!s.done).sort((a,b)=>a.lvl-b.lvl);
  if(left.length)return say([{who:n.name,text:`Жемчужин у тебя: ${SHRINES.length-left.length} из ${SHRINES.length}. Следующая — ${left[0].name}, ${left[0].where}. Её страж примерно ${left[0].lvl+ngOff()} уровня.`}]);
  say([{who:n.name,text:'Храм поднялся из моря на юге. Иди туда только с полной сумкой зелий. И возвращайся живым.'}])}
function bountyTalk(n){const b=P.bounty,B=BOUNTIES[b.i];
  if(!B)return say([{who:n.name,text:'Охотиться больше не на кого. Ты вычистил все острова. Спасибо, правда.'}]);
  if(!b.active)return say([{who:n.name,text:`Есть работа: «${B.t}». ${B.d} Плачу ${B.gold+ngOff()*30} золота и вещь из запасов стражи.`}],()=>{b.active=true;b.prog=0;toast('Новое задание: '+B.t);save()});
  if(b.prog<B.n)return say([{who:n.name,text:`«${B.t}»: ${b.prog} из ${B.n}. Возвращайся, когда закончишь.`}]);
  say([{who:n.name,text:'Отличная охота. Держи награду.'}],()=>{P.gold+=B.gold+ngOff()*30;dropItem(genItem(P.lvl,{bias:1.5,minRar:2}),P.x,P.y+14);b.i++;b.active=false;b.prog=0;sfx('lvl');save()})}
function talSpent(){return Object.values(P.tal).reduce((a,b)=>a+b,0)}
function talPts(){return P.lvl-1-talSpent()}
function priestTalk(n){const cost=40*P.lvl,spent=talSpent(),ch=[];
  ch.push({t:`Сбросить таланты (${cost} золота)`,no:!spent||P.gold<cost,fn:()=>{P.gold-=cost;P.tal={};recalc();sfx('rune');toast('Таланты сброшены. Распредели очки заново (T)')}});
  if(P.q.bp===1)ch.push({t:'Отдать чёрную жемчужину храму',fn:()=>{P.q.bp=3;recalc();P.hp=P.S.maxHp;sfx('rune');burst(P.x,P.y-6,'#f4ecff',30,70,.8);say([{who:n.name,text:'Храм очистит её. А тебя хранит благословение: +10% к здоровью, и раны понемногу затягиваются сами.'}]);save()}});
  ch.push({t:'Ничего, спасибо'});
  say([{who:n.name,text:P.q.bp===1?'Я чувствую холод у тебя в сумке... Чёрная жемчужина? Отдай её храму, и море тебя отблагодарит.':'Да хранит тебя море. Хочешь начать путь заново? Я могу сбросить твои таланты.',ch}])}
function keeperTalk(n){
  if(P.q.lh===1)return say([{who:n.name,text:'Маяк горит! Ночью у нашего острова теперь светло, и морские твари держатся подальше.'}]);
  if(P.q.lh===2)return say([{who:n.name,text:'Без линзы маяк мёртв. По ночам из темноты лезет всё больше тварей... Надеюсь, золото того стоило.'}]);
  const c={wood:10,iron:6};
  say([{who:n.name,text:'Шторм разбил маяк. Без света ночью у острова собираются твари из глубин.'},
    {who:n.name,text:'Я починю его, если принесёшь 10 дерева и 6 железа. А контрабандисты, говорят, дорого платят за линзу...',ch:[
      {t:'Починить маяк (10 дерева, 6 железа)',no:!hasMats(c),fn:()=>{payMats(c);P.q.lh=1;P.gold+=150;sfx('rune');toast('Маяк снова горит! +150 золота','#f2c14e');save()}},
      {t:'Продать линзу контрабандистам (+300 золота)',fn:()=>{P.q.lh=2;P.gold+=300;sfx('coin');toast('Ты продал линзу. Ночи стали опаснее','#ff8a7a');save()}},
      {t:'Подумаю'}]}])}
function ilvaTalk(n){
  if(P.q.bp===1)return say([{who:n.name,text:'Ох, какая жемчужина... Чёрная, как мои мысли. Отдай её мне, и я сделаю из неё вещь великой силы. Правда, у силы есть цена.',ch:[
    {t:'Отдать жемчужину Илве',fn:()=>{P.q.bp=2;const it={uid:uid(),slot:'amulet',cls:null,rar:4,lvl:Math.max(10,P.lvl),af:{crit:6,mp:20},name:'Чёрная жемчужина',base:'Амулет',fx:'blackpearl',fxd:'+30% ко всему урону, но −15% к здоровью',price:400};dropItem(it,P.x,P.y+14);sfx('legend');save()}},
    {t:'Оставить себе'}]}]);
  say([{who:n.name,text:P.q.bp===2?'Носи мою жемчужину с гордостью. И не жалуйся, если сердце иногда холодеет.':'Ищешь силу? На Кладбище кораблей лежит кое-что очень тёмное. Принеси мне — не пожалеешь.'}])}
function qmTalk(n){
  if(P.q.pr===1)return say([{who:n.name,text:'Забрал своего юнгу? Ну и катись.'}]);
  if(P.q.pr===2)return say([{who:n.name,text:'Эй, свой! Как там море? Наши ребята тебя не тронут... наверное.'}]);
  if(G.prFight)return say([{who:n.name,text:'Ребята, чего стоим?! Бей его!'}]);
  say([{who:n.name,text:'Юнга Тим — наш пленник. Хочешь его забрать? Плати 250 золота. Или проваливай.',ch:[
    {t:'Выкупить Тима (250 золота)',no:P.gold<250,fn:()=>{P.gold-=250;freeTim()}},
    {t:'Освободить силой',fn:()=>{G.prFight=true;toast('Пираты хватаются за сабли!','#ff8a7a');for(let i=0;i<5;i++){const a=i/5*6.283,x=P.x+Math.cos(a)*60,y=P.y+Math.sin(a)*50;if(!blocked(x,y,6,'e')){const e=spawn(i%2?'pgunner':'pirate',x,y,{lvl:12+ngOff(),elite:true,wave:'prq'});e.ag=true}}}},
    {t:'Вступить в команду (+150 золота)',fn:()=>{P.q.pr=2;P.gold+=150;dropItem(genItem(P.lvl,{slot:'ring',minRar:2,bias:1}),P.x,P.y+14);toast('Ты теперь пират. Тим остаётся в клетке','#f2c14e');save()}},
    {t:'Уйти'}]}])}
function freeTim(){P.q.pr=1;G.prFight=false;sfx('rune');toast('Тим свободен! Он ждёт тебя в таверне у Боцмана Грома','#9fe08a');save()}
function townTick(dt){if(G.prFight&&!enemies.some(e=>e.wave==='prq'&&!e.dead))freeTim()}

/* ----- crafting / ship / tavern panels inside the inventory overlay ----- */
function renderExtra(mode){const w=$('craftWrap');w.innerHTML='';w.hidden=!(mode==='smith'||mode==='ship'||mode==='tavern');if(w.hidden)return;
  const row=(title,desc,costHtml,btnLabel,ok,fn,extra)=>{const r=el('div','crow');r.innerHTML=`<div class="cinfo"><b>${title}</b><small>${desc}</small><div class="ccost">${costHtml}</div></div>`;
    if(extra)r.querySelector('.cinfo').appendChild(extra);if(btnLabel){const b=act(btnLabel,fn,true,!ok);r.appendChild(b)}w.appendChild(r)};
  if(mode==='smith'){w.appendChild(el('h4','','Мастерская'));
    RECIPES.forEach(rc=>{const ok=hasMats(rc.cost)&&P.gold>=rc.gold;const costHtml=matTxt(rc.cost)+` <span class="mat" style="--c:#f2c14e">${rc.gold} золота</span>`;
      if(rc.sel){const ex=el('div','selrow');SLOTS.forEach(s=>{const it=P.eq[s];const b=el('button','selb'+(INV.csel===s?' on':''),it?it.name:SLOTN[s]+': пусто');b.disabled=!it;b.addEventListener('click',()=>{INV.csel=s;renderInv()});ex.appendChild(b)});
        row(rc.n,rc.d,costHtml,rc.n.split(' ')[0],ok&&INV.csel&&P.eq[INV.csel],()=>craft(rc),ex)}
      else row(rc.n,rc.d,costHtml,'Создать',ok&&P.bag.length<24,()=>craft(rc))})}
  if(mode==='ship'){w.appendChild(el('h4','','Улучшения лодки'));
    SHIPUP.forEach(u=>{const l=P.ship[u.id],max=l>=u.max,c=u.cost(l),g=u.gold(l);const ok=!max&&hasMats(c)&&P.gold>=g;
      row(`${u.n} · ${l} из ${u.max}`,u.d,max?'<span class="mat" style="--c:#7fe07a">Максимум</span>':matTxt(c)+` <span class="mat" style="--c:#f2c14e">${g} золота</span>`,max?null:'Улучшить',ok,()=>{payMats(c);P.gold-=g;P.ship[u.id]++;sfx('rune');toast(`${u.n}: уровень ${P.ship[u.id]}`);save();renderInv()})})}
  if(mode==='tavern'){w.appendChild(el('h4','','Спутники'));
    Object.entries(COMPS).forEach(([id,C])=>{if(C.req==='tim'&&P.q.pr!==1)return;const own=P.comps.includes(id)||C.cost===0,cur=P.comp===id;
      const ic=el('img','cicon');ic.src=bigURL(SPR[C.spr],2);ic.alt='';
      const lbl=cur?'Отпустить':own?'Взять с собой':`Нанять за ${C.cost}`;
      row(C.n,`${C.d} Здоровье ${Math.round(C.hp+C.hpL*(P.lvl-1))}, урон ${Math.round(C.dmg+C.dmgL*(P.lvl-1))}.`,cur?'<span class="mat" style="--c:#7fe07a">Сейчас с тобой</span>':'',lbl,cur||own||P.gold>=C.cost,()=>{
        if(cur){P.comp=null;P.cmp=null}else{if(!own){P.gold-=C.cost;P.comps.push(id)}P.comp=id;spawnComp();sfx('lvl');toast(C.n+' теперь с тобой')}save();renderInv()},ic)})}}
function craft(rc){if(!hasMats(rc.cost)||P.gold<rc.gold)return;
  if(rc.sel){const it=P.eq[INV.csel];if(!it)return;payMats(rc.cost);P.gold-=rc.gold;
    if(rc.id==='upgrade'){it.lvl+=2;rollBase(it);for(const k in it.af)it.af[k]=k==='mpr'?+(it.af[k]*1.1).toFixed(1):Math.round(it.af[k]*1.1+(k==='hp'||k==='mp'?2:0));toast(`${it.name} закалён: ур. ${it.lvl}`)}
    else{const n=Object.keys(it.af).length||1;const keep=it.slot==='weapon'&&it.cls==='mage';it.af={};const pool=[...AFPOOL[it.slot]].filter(k=>k!=='ls'||it.rar>=3);
      if(keep){it.af.spP=AFX.spP.r(it.lvl)+it.rar*3;pool.splice(pool.indexOf('spP'),1)}for(let i=keep?1:0;i<n&&pool.length;i++){const k=pool.splice(rint(pool.length),1)[0];it.af[k]=AFX[k].r(it.lvl)}toast(`${it.name}: свойства перекованы`)}
    recalc();sfx('rune')}
  else{payMats(rc.cost);P.gold-=rc.gold;const o=rc.id==='weapon'?{slot:'weapon',cls:P.cls,bias:1,minRar:1}:rc.id==='armor'?{slot:'armor',bias:1,minRar:1}:{slot:pick(['amulet','ring']),bias:1.6,minRar:1};
    const it=genItem(P.lvl,o);P.bag.push(it);sfx('item');toast(`Создано: ${it.name}`,RAR[it.rar].c)}
  save();renderInv()}

/* ----- talents overlay ----- */
function openTal(){if(G.state!=='play')return;G.state='menu';$('ovTal').hidden=false;renderTal()}
function renderTal(){const g=$('talGrid');g.innerHTML='';const pts=talPts();$('talPts').textContent=`Свободных очков: ${pts}`;
  TAL[P.cls].forEach(br=>{const col=el('div','tcol pnl');const spent=br.t.reduce((a,t)=>a+(P.tal[t.id]||0),0);col.appendChild(el('h4','',`${br.n} <small>${spent}</small>`));
    br.t.forEach((t,j)=>{const r=P.tal[t.id]||0,need=j*2,locked=spent<need;const row=el('div','trow'+(locked?' locked':''));
      row.innerHTML=`<div><b>${t.n}</b><small>${t.d}${r?` · сейчас ${(t.v*r).toFixed(t.v<1?1:0).replace(/\.0$/,'')}`:''}</small>${locked?`<small class="need">Нужно ${need} очка в ветке</small>`:''}</div><i class="pips">${'<b class="on"></b>'.repeat(r)}${'<b></b>'.repeat(3-r)}</i>`;
      const b=el('button','tplus','+');b.disabled=locked||r>=3||pts<=0;b.setAttribute('aria-label','Улучшить: '+t.n);b.addEventListener('click',()=>{P.tal[t.id]=r+1;recalc();sfx('coin');renderTal();save()});row.appendChild(b);col.appendChild(row)});
    g.appendChild(col)})}

/* ----- New Game+ ----- */
function startNG(){save();const sv=loadSave();if(!sv)return;const ng=(sv.ng||0)+1;
  Object.assign(sv,{ng,runes:null,gate:false,won:false,chests:'',shrines:'',dun:{},quest:1,fog:null,bounty:{i:0,active:false,prog:0}});
  $('ovWin').hidden=true;beginGame(sv.cls,sv.race,sv);toast(`Новая игра+ ${ng}: враги сильнее на ${ng*8} уровней, добыча богаче`,'#ff9a3a')}
