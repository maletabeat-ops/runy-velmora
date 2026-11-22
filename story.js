'use strict';
/* ===== story: Act I quests, NPCs, dialog with portraits, journal, talents, crafting ===== */
const DAYLEN=420;
function nightF(){if(!G||G.clock==null)return 0;const c=G.clock%DAYLEN;if(c<240)return 0;if(c<285)return(c-240)/45;if(c<390)return 1;return 1-(c-390)/30}
function clockName(){const c=(G.clock||0)%DAYLEN;return c<240?'День':c<285?'Вечер':c<390?'Ночь':'Рассвет'}
function updateComp(){}function spawnComp(){P.cmp=null}function hurtComp(){}function dungeonTick(){}
const QST=[
 {t:'Пробуждение',d:'Поговори с Ирэль у дома на дереве.'},
 {t:'Упавший осколок',d:'Найди осколок луны на поляне в центре Шепчущего леса. Лес к северу от деревни.'},
 {t:'Кузня Корнеля',d:'Отнеси осколок Корнелю Старому. Его кузня на восточном берегу ручья.'},
 {t:'Свет сквозь туман',d:'Поговори с Моттой. Её дом на западе деревни.'},
 {t:'Светящиеся грибы',d:'Собери светящиеся грибы в Шепчущем лесу ({n} из 5) и отнеси Мотте.'},
 {t:'Тропа в топи',d:'Пройди сквозь туман на востоке Шепчущего леса. Фонарь Мотты осветит путь.'},
 {t:'Следы Ордена',d:'Убей культистов Ордена в Туманных топях ({n} из 6).'},
 {t:'Логово Ведьмы',d:'Найди Ведьму Тумана среди древних колонн на севере топей и победи её.'},
 {t:'Возвращение',d:'Вернись к Ирэль в Светлый Ручей.'},
 {t:'Конец первого акта',d:'Ирэль научила тебя Лунному свету: тени на востоке топей больше не преграда. Второй акт скоро.'}];
const NPCDEF={village:[
 {id:'irel',name:'Ирэль',spr:'hare',por:'p_irel',pt:'irel'},{id:'kornel',name:'Корнель Старый',spr:'kornel',por:'p_kornel',pt:'kornel'},
 {id:'motta',name:'Мотта',spr:'motta',por:'p_motta',pt:'motta'},{id:'lucia',name:'Люция',spr:'glowbug',por:'p_glowbug',pt:'lucia'},{id:'born',name:'Борн',spr:'guard',por:'p_shard',pt:'born'}]};
function zoneNpcs(id){return(NPCDEF[id]||[]).filter(n=>ZPOINTS[n.pt]).map(n=>({...n,x:ZPOINTS[n.pt].x,y:ZPOINTS[n.pt].y}))}
const heroPor=()=>(RACES[P.race]||RACES.hare).por;
const me=t=>({who:'Ты',hero:1,text:t});
const Q=()=>P.st||0;
function qText(i){return(QST[i]||QST[QST.length-1]).d.replace('{n}',P.qn||0)}
function setStage(n,silent){P.st=n;P.qn=0;if(!silent){sfx('rune');toast('Задание: '+QST[n].t,'#f2d48a')}save()}

/* ----- dialog with portraits and choices ----- */
let D=null;
function say(lines,onEnd){D={lines,i:0,onEnd,shown:0};G.state='dialog';$('dlg').hidden=false;document.body.classList.add('talking');showLine()}
function showLine(){const l=D.lines[D.i];const npc=!l.hero&&l.por;$('dWho').textContent=l.hero?(RACES[P.race].n):l.who;
  $('dPorL').hidden=!npc;$('dPorR').hidden=!l.hero;if(npc)$('dPorL').src=artURL(l.por,1);if(l.hero)$('dPorR').src=artURL(heroPor(),1);
  $('dlg').classList.toggle('herosay',!!l.hero);D.full=l.text;D.shown=0;$('dTxt').textContent='';$('dCh').innerHTML='';$('dCh').hidden=true;$('dMore').hidden=false}
function showChoices(){const l=D.lines[D.i];if(!l.ch||!$('dCh').hidden)return;const box=$('dCh');box.innerHTML='';
  l.ch.forEach((c,i)=>{const b=el('button','chbtn'+(c.no?' no':''),`<b>${i+1}</b> ${c.t}`);if(c.no)b.disabled=true;b.addEventListener('pointerdown',e=>{e.stopPropagation();e.preventDefault();choose(i)});box.appendChild(b)});box.hidden=false;$('dMore').hidden=true}
function choose(i){if(!D)return;const l=D.lines[D.i];if(!l.ch||!l.ch[i]||l.ch[i].no)return;const c=l.ch[i];closeDlg();if(c.fn)c.fn()}
function closeDlg(){D=null;$('dlg').hidden=true;document.body.classList.remove('talking');G.state='play';P.cd.atk=.3}
function advance(){if(!D)return;if(D.shown<D.full.length){D.shown=D.full.length;$('dTxt').textContent=D.full;showChoices();return}
  if(D.lines[D.i].ch)return;D.i++;if(D.i<D.lines.length)return showLine();const cb=D.onEnd;closeDlg();if(cb)cb()}
function tickDialog(dt){if(!D)return;if(D.shown<D.full.length){D.shown=Math.min(D.full.length,D.shown+dt*60);$('dTxt').textContent=D.full.slice(0,D.shown|0);if(D.shown>=D.full.length)showChoices()}
  if(D.lines[D.i].ch){for(let i=0;i<4;i++)if(actQ.has('skill'+i)&&!$('dCh').hidden){choose(i);return}}
  if(actQ.has('use')||actQ.has('attack'))advance()}
$('dlg').addEventListener('pointerdown',e=>{e.preventDefault();advance()});
const npcVisible=()=>true;

/* ----- world interactions ----- */
function findNear(){G.near=null;let best=24;
  for(const n of NPCS){const d=Math.hypot(n.x-P.x,n.y-P.y);if(d<best){best=d;G.near={kind:'npc',...n,label:n.name}}}
  for(const c of CHESTS){if(c.open)continue;const d=Math.hypot(c.x-P.x,c.y-P.y);if(d<best){best=d;G.near={kind:'chest',c,x:c.x,y:c.y,label:'Сундук'}}}
  for(const p of PROPS){if(!p.quest)continue;if(p.quest==='mush'&&(Q()<4||P.mush[p.mid]))continue;if(p.quest==='shard'&&Q()!==1)continue;
    const d=Math.hypot(p.x-P.x,p.y-P.y);if(d<best+6){best=d;G.near={kind:p.quest,p,x:p.x,y:p.y-6,label:p.quest==='mush'?'Сорвать гриб':'Осколок луны'}}}}
function interact(n){
  if(n.kind==='chest'){openChest(n.c);return}
  if(n.kind==='mush'){P.mush[n.p.mid]=1;P.qn=(P.qn||0)+1;sfx('item');burst(n.p.x,n.p.y-4,'#cfd8ff',14,40,.6);text(P.x,P.y-28,`Грибы: ${Math.min(P.qn,5)} из 5`,'#cfd8ff',true);if(P.qn>=5)toast('Хватит грибов. Неси их Мотте','#f2d48a');save();return}
  if(n.kind==='shard'){if(enemies.some(e=>e.wave==='q1'&&!e.dead)){deny('сначала культисты!');return}
    P.flags.shard=1;PROPS=PROPS.filter(p=>p!==n.p);sfx('moon');burst(n.p.x,n.p.y-8,'#cfd8ff',40,80,1);
    say([{who:'Осколок луны',text:'Осколок тёплый и тихо поёт. Как только ты касаешься его, в голове звучит далёкий голос: «Хранитель... Найди остальных...»'},me('Надо показать его Корнелю. Он знает, что делать с осколками.')],()=>setStage(2));return}
  const id=n.id;
  if(id==='irel')return irelTalk(n);if(id==='kornel')return kornelTalk(n);if(id==='motta')return mottaTalk(n);if(id==='lucia')return luciaTalk(n);if(id==='born')return bornTalk(n)}
const L=(n,t)=>({who:n.name,por:n.por,text:t});
function irelTalk(n){const s=Q();
  if(s===0)return say([L(n,'Проснулся? Хорошо. Ночью над лесом снова падали звёзды. Только это были не звёзды, а осколки луны.'),
    L(n,'Сто лет назад луна раскололась. С тех пор осколки падают на землю и меняют всё, чего касаются. Мы, Хранители, собираем их, пока их не забрал Орден Затмения.'),
    me('Орден Затмения? Я думал, это сказки.'),
    L(n,'Сказки не носят кинжалов. Магистр Нокс хочет собрать все осколки и погасить луну навсегда. Тогда наступит вечная ночь.'),
    L(n,'Я стара и последняя из Хранителей. Теперь твой черёд. Осколок упал в Шепчущем лесу, к северу отсюда. Найди его раньше Ордена.')],()=>setStage(1));
  if(s===1)return say([L(n,'Осколок упал где-то в центре Шепчущего леса. Лес к северу, за дорогой. Будь осторожен: волки там стали злее.')]);
  if(s>=2&&s<8)return say([L(n,pick(['Каждый осколок, что ты найдёшь, делает тебя сильнее. Распределяй очки характеристик (C) и таланты (T) с умом.','Мотта странная, но ей можно верить. Почти всегда.','Ведьма Тумана служит Ордену. Если она в топях, Нокс близко.'])),
    {who:n.name,por:n.por,text:'Могу помочь тебе начать путь заново и сбросить таланты. Это стоит немного золота.',ch:[{t:`Сбросить таланты (${30*P.lvl} золота)`,no:P.gold<30*P.lvl||!talSpent(),fn:()=>{P.gold-=30*P.lvl;P.tal={};recalc();toast('Таланты сброшены')}},{t:'Не нужно'}]}]);
  if(s===8)return say([L(n,'Ведьма Тумана мертва? Я чувствовала, как туман ушёл с болот.'),me('Она говорила о Ноксе. Он ищет что-то на Обратной стороне Луны.'),
    L(n,'Значит, времени меньше, чем я думала. Возьми мой последний дар. Это Лунный свет. Он рассеивает тени Ордена, что закрывают дороги.'),
    L(n,'На востоке топей стоит стена тьмы. Теперь она тебе не преграда. За ней Каменные холмы и Город Осколков. Но это уже другая история.')],()=>{P.flags.moonlight=1;gainXp(400+P.lvl*40);setStage(9);burst(P.x,P.y-10,'#cfd8ff',50,90,1.2);toast('Первый акт пройден! Ты получил Лунный свет','#cfd8ff')});
  return say([L(n,'Ты сделал больше, чем я могла просить. Отдохни. Второй акт уже близко.')])}
function kornelTalk(n){const s=Q();
  if(s===2&&P.flags.shard)return say([L(n,'Хм-м. Осколок... Давно я не держал такой в руках. Он ещё поёт.'),L(n,'Дай-ка мне его. Лунное серебро любит сталь. Подожди, я быстро.'),L(n,'Готово. Держи. Оружие с частицей луны, оно будет расти вместе с тобой.')],()=>{
    const it=genItem(P.lvl+1,{slot:'weapon',cls:P.cls,minRar:2,bias:1});it.name='Лунное '+it.base.toLowerCase();dropItem(it,P.x,P.y+14);P.gold+=40;setStage(3)});
  if(P.stockLvl!==P.lvl||!P.stock.length)restock();
  say([L(n,pick(['Кора, железо, шкуры. Неси что найдёшь, и я выкую что-нибудь получше.','Сталь не врёт. Выбирай или заказывай.','Осколочки береги. Из них выходят лучшие вещи.']))],()=>openInv('smith'))}
function mottaTalk(n){const s=Q();
  if(s<3)return say([L(n,'Ох, гость. Не стой в дверях, сквозняк. Зелья нужны? У меня всё свежее, почти.')],()=>openInv('herb'));
  if(s===3)return say([L(n,'Ирэль прислала? Знаю, знаю. Ты хочешь в Туманные топи. Туда не пройти: туман там живой и злой.'),
    L(n,'Но я могу сделать фонарь, свет которого туман боится. Нужны светящиеся грибы из Шепчущего леса. Пять штук. И не ешь их по дороге.')],()=>{setStage(4);P.qn=Object.keys(P.mush).length});
  if(s===4&&(P.qn||0)>=5)return say([L(n,'Принёс! И даже не надкусил. Похвально.'),L(n,'Вот твой фонарь. Иди на восток через лес. Где туман, просто иди вперёд, он расступится.')],()=>{P.flags.lantern=1;P.pots.hp+=2;P.pots.mp+=1;setStage(5)});
  if(s===4)return say([L(n,`Грибов пока ${P.qn||0} из 5. Они светятся голубым, их видно издалека. Особенно ночью.`)],()=>openInv('herb'));
  say([L(n,pick(['Туман нынче тихий. Это ты его так?','Зелья, отвары, немного сплетен. Что тебе?']))],()=>openInv('herb'))}
function luciaTalk(n){P.hp=P.S.maxHp;P.mp=P.S.maxMp;P.poison=0;sfx('heal');burst(P.x,P.y-6,'#e8f080',18,50,.7);
  say([L(n,pick(['Тише, тише. Сейчас полегчает.','Посвечу немного, и раны затянутся.','Вот так. Береги себя там, снаружи.'])+' '+pick(HINTS))])}
const HINTS=['Видишь красный круг на земле? Беги из него.','Кабаны долго разгоняются, а потом несутся по прямой. Отойди в сторону.','Пауки плюются паутиной, в ней ноги вязнут.','Туманники исчезают и появляются за спиной.','Ночью в лесу темно, зато враги дают больше опыта.','В деревне раны затягиваются сами.'];
function bornTalk(n){const b=P.bounty,B=BOUNTIES[b.i];
  if(!B)return say([L(n,'Охотиться больше не на кого. Ты молодец.')]);
  if(!b.active)return say([L(n,`Стража платит за охоту. «${B.t}»: ${B.d} Награда ${B.gold+ngOff()*30} золота и вещь из запасов.`)],()=>{b.active=true;b.prog=0;toast('Охота: '+B.t);save()});
  if(b.prog<B.n)return say([L(n,`«${B.t}»: ${b.prog} из ${B.n}. Возвращайся, когда закончишь.`)]);
  say([L(n,'Хорошая охота. Держи награду.')],()=>{P.gold+=B.gold+ngOff()*30;dropItem(genItem(P.lvl,{bias:1.5,minRar:2}),P.x,P.y+14);b.i++;b.active=false;b.prog=0;sfx('lvl');save()})}

/* ----- triggers ----- */
function storyZoneEnter(id){if(!P)return;
  if(id==='marsh'&&Q()===5){setStage(6);say([me('Туман расступается перед фонарём... Впереди огни. Похоже на лагерь Ордена.')])}
  if(id==='forest'&&Q()===1)setTimeout(()=>toast('Осколок упал в центре леса. Иди по тропе на север','#cfd8ff'),900)}
function storyTick(dt){const s=Q();
  if(s===1&&ZID==='forest'&&!G.q1&&Math.hypot(P.x-ZPOINTS.shard.x,P.y-ZPOINTS.shard.y)<120){G.q1=1;
    for(let i=0;i<4;i++){const a=i/4*6.283,x=ZPOINTS.shard.x+Math.cos(a)*40,y=ZPOINTS.shard.y+Math.sin(a)*30;if(!blocked(x,y,6,'e')){const e=spawn('cultist',x,y,{lvl:3+ngOff(),wave:'q1'});e.ag=true}}
    say([{who:'Культист',por:null,text:'Хранитель?! Осколок принадлежит Ордену! Взять его!'}])}
  if(s===7&&ZID==='marsh'&&!G.witch&&!P.flags.witch&&Math.hypot(P.x-ZPOINTS.arena.x,P.y-ZPOINTS.arena.y)<130){G.witch=1;
    const b=spawn('b_mistwitch',ZPOINTS.arena.x,ZPOINTS.arena.y-20,{lvl:8+ngOff(),wave:'witch'});b.home={x:ZPOINTS.arena.x,y:ZPOINTS.arena.y};b.ag=true;b.cd=2.5;G.boss=b;sfx('boss');
    say([{who:'Ведьма Тумана',por:null,text:'Маленький Хранитель с фонариком... Нокс обещал мне твою луну. А туман всегда берёт своё.'},me('Твой туман больше никого не заберёт.')])}}
function storyKill(e){if(Q()===6&&e.type==='cultist'){P.qn=(P.qn||0)+1;if(P.qn>=6){setStage(7);say([me('У культиста письмо: «Ведьма ждёт у старых колонн на севере. Хранитель не должен пройти». Значит, мне туда.')])}}}
function bossDown(e){G.boss=null;G.shake=.6;sfx('rune');burst(e.x,ecy(e),'#cfd8ff',50,90,1.2);
  enemies.forEach(x=>{if(x.wave&&x.wave===e.wave&&!x.dead){x.dead=true;burst(x.x,x.y-5,'#9a8fa8',8,50,.4)}});
  if(e.wave==='witch'){P.flags.witch=1;setStage(8);say([me('Туман над топями редеет... Пора возвращаться к Ирэль.')])}}
function townTick(dt){storyTick(dt)}
function die(){G.state='dead';sfx('die');setTimeout(()=>{$('ovDead').hidden=false;$('bRespawn').focus()},500)}
function respawn(){if(G.state!=='dead')return;$('ovDead').hidden=true;const lost=Math.floor(P.gold*.2);P.gold-=lost;P.xp=Math.floor(P.xp*.85);
  P.hp=P.S.maxHp;P.mp=P.S.maxMp;P.inv=1.5;P.kx=P.ky=0;P.poison=0;P.slowT=0;P.dash=0;G.q1=0;G.witch=0;G.state='play';loadZone('village','spawn');if(lost)toast('Пропало золота: '+lost);save()}
function openChest(c){c.open=true;P.chests[c.key]=1;sfx('item');burst(c.x,c.y-6,'#f2c14e',20,60,.6);
  dropItem(genItem(c.lvl,{bias:1,minRar:1}),c.x,c.y+12);if(Math.random()<.5)dropItem(genItem(c.lvl,{bias:1}),c.x,c.y+12);
  pickups.push({k:'gold',v:c.lvl*8+rint(20),x:c.x,y:c.y+14,t:0});const m=pick(Object.keys(MATS));pickups.push({k:'mat',m,v:2+rint(3),x:c.x+rr(8),y:c.y+14,t:0});save()}
function restock(){P.stockLvl=P.lvl;P.stock=[];for(let i=0;i<3;i++)P.stock.push(genItem(P.lvl,{slot:'weapon',cls:P.cls,bias:.8}));['armor','amulet','ring'].forEach(s=>P.stock.push(genItem(P.lvl,{slot:s,bias:.8})))}

/* ----- crafting panel (Kornel) ----- */
const hasMats=c=>Object.entries(c).every(([k,v])=>(P.mats[k]||0)>=v);
const payMats=c=>{for(const k in c)P.mats[k]-=c[k]};
const matTxt=c=>Object.entries(c).map(([k,v])=>`<span class="mat" style="--c:${MATS[k].c}">${v} ${MATS[k].n.toLowerCase()}</span>`).join(' ');
function renderExtra(mode){const w=$('craftWrap');w.innerHTML='';w.hidden=mode!=='smith';if(w.hidden)return;w.appendChild(el('h4','','Мастерская Корнеля'));
  RECIPES.forEach(rc=>{const ok=hasMats(rc.cost)&&P.gold>=rc.gold;const r=el('div','crow');r.innerHTML=`<div class="cinfo"><b>${rc.n}</b><small>${rc.d}</small><div class="ccost">${matTxt(rc.cost)} <span class="mat" style="--c:#f2c14e">${rc.gold} золота</span></div></div>`;
    if(rc.sel){const ex=el('div','selrow');SLOTS.forEach(s=>{const it=P.eq[s];const b=el('button','selb'+(INV.csel===s?' on':''),it?it.name:SLOTN[s]+': пусто');b.disabled=!it;b.addEventListener('click',()=>{INV.csel=s;renderInv()});ex.appendChild(b)});r.querySelector('.cinfo').appendChild(ex)}
    r.appendChild(act(rc.sel?rc.n.split(' ')[0]:'Создать',()=>craft(rc),true,!(ok&&(rc.sel?INV.csel&&P.eq[INV.csel]:P.bag.length<24))));w.appendChild(r)})}
function craft(rc){if(!hasMats(rc.cost)||P.gold<rc.gold)return;
  if(rc.sel){const it=P.eq[INV.csel];if(!it)return;payMats(rc.cost);P.gold-=rc.gold;
    if(rc.id==='upgrade'){it.lvl+=2;rollBase(it);for(const k in it.af)it.af[k]=k==='mpr'?+(it.af[k]*1.1).toFixed(1):Math.round(it.af[k]*1.1+(k==='hp'||k==='mp'?2:0));toast(`${it.name} закалён: ур. ${it.lvl}`)}
    else{const n=Object.keys(it.af).length||1;it.af={};const pool=[...AFPOOL[it.slot]].filter(k=>k!=='ls'||it.rar>=3);for(let i=0;i<n&&pool.length;i++){const k=pool.splice(rint(pool.length),1)[0];it.af[k]=AFX[k].r(it.lvl)}toast(`${it.name}: свойства перекованы`)}
    recalc();sfx('rune')}
  else{payMats(rc.cost);P.gold-=rc.gold;const o=rc.id==='weapon'?{slot:'weapon',cls:P.cls,bias:1,minRar:1}:rc.id==='armor'?{slot:'armor',bias:1,minRar:1}:{slot:pick(['amulet','ring']),bias:1.6,minRar:1};
    const it=genItem(P.lvl,o);P.bag.push(it);sfx('item');toast(`Создано: ${it.name}`,RAR[it.rar].c)}
  save();renderInv()}

/* ----- talents: tree of nodes with forks ----- */
const talNodes=br=>br.t.flatMap(n=>n.fork?n.fork:[n]);
function talSpent(){return Object.values(P.tal).reduce((a,b)=>a+b,0)}
function talPts(){return P.lvl-1-talSpent()}
function nodeOpen(br,i){if(i===0)return true;const prev=br.t[i-1];return prev.fork?prev.fork.some(n=>(P.tal[n.id]||0)>0):(P.tal[prev.id]||0)>0}
function openTal(){if(G.state!=='play')return;G.state='menu';$('ovTal').hidden=false;renderTal()}
function renderTal(){const g=$('talGrid');g.innerHTML='';const pts=talPts();$('talPts').textContent=`Свободных очков: ${pts}`;
  TAL[P.cls].forEach(br=>{const row=el('div','tbranch');const spent=talNodes(br).reduce((a,t)=>a+(P.tal[t.id]||0),0);
    const hd=el('div','tbh');hd.innerHTML=`<img src="${ICON[br.ic]||ICON.sword}" alt=""><div><b>${br.n}</b><small>вложено ${spent}</small></div>`;row.appendChild(hd);
    const chain=el('div','tchain');
    br.t.forEach((node,i)=>{const open=nodeOpen(br,i);const grp=node.fork?node.fork:[node];const cell=el('div','tcell'+(node.fork?' fork':''));
      grp.forEach(t=>{const r=P.tal[t.id]||0,other=node.fork&&grp.some(o=>o!==t&&(P.tal[o.id]||0)>0);const can=open&&!other&&r<t.max&&pts>0;
        const b=el('button','tnode'+(r?' on':'')+(r>=t.max?' max':'')+(!open||other?' locked':''));b.innerHTML=`<span class="tn">${t.n}</span><span class="tr">${r}/${t.max}</span>`;
        b.title=`${t.n}: ${t.d}${node.fork?' (выбери один из двух)':''}`;b.setAttribute('aria-label',b.title);
        b.addEventListener('click',()=>{if(!can)return;P.tal[t.id]=r+1;recalc();sfx('coin');renderTal();save()});
        b.addEventListener('pointerenter',()=>{$('talTip').innerHTML=`<b>${t.n}</b> · ${r}/${t.max}<br>${t.d}${node.fork?'<br><i>Развилка: можно выбрать только один из двух</i>':''}${!open?'<br><i>Сначала изучи предыдущий узел</i>':''}`});cell.appendChild(b)});
      if(node.fork)cell.prepend(el('span','forkl','или'));chain.appendChild(cell)});
    row.appendChild(chain);g.appendChild(row)})}

/* ----- character panel ----- */
function openChar(){if(G.state!=='play')return;G.state='menu';$('ovChar').hidden=false;renderChar()}
function renderChar(){const R=RACES[P.race],C=CLS[P.cls],S=P.S;$('chPor').src=artURL(R.por,2);$('chName').textContent=`${R.n} · ${C.n}`;$('chLvl').textContent=`Уровень ${P.lvl} · опыт ${P.xp} / ${xpNeed(P.lvl)}`;
  $('chPerk').textContent='Особенность расы: '+R.perk;$('chPts').textContent=P.statPts>0?`Свободных очков: ${P.statPts}`:'Очки появятся на следующем уровне';
  const st=$('chStats');st.innerHTML='';STATS.forEach(k=>{const r=el('div','strow');const v=statVal(k);r.innerHTML=`<div><b>${STATN[k]}</b><small>${STATD[k]}</small></div><span class="sv">${v}</span>`;
    const b=el('button','tplus','+');b.disabled=P.statPts<=0;b.setAttribute('aria-label','Добавить: '+STATN[k]);b.addEventListener('click',()=>{if(P.statPts<=0)return;P.statPts--;P.alloc[k]=(P.alloc[k]||0)+1;recalc();sfx('coin');renderChar();save()});r.appendChild(b);st.appendChild(r)});
  const dl=$('chDer');dl.innerHTML='';statLines().forEach(([a,b])=>dl.append(el('dt','',a),el('dd','',String(b))))}

/* ----- journal ----- */
function openJournal(){if(G.state!=='play')return;G.state='menu';$('ovJour').hidden=false;const L=$('jList');L.innerHTML='';
  const s=Q();const cur=el('div','jcur pnl');cur.innerHTML=`<small>Сейчас</small><b>${QST[s].t}</b><p>${qText(s)}</p>`;L.appendChild(cur);
  for(let i=s-1;i>=0;i--){const d=el('div','jdone');d.innerHTML=`<b>✓ ${QST[i].t}</b>`;L.appendChild(d)}
  const b=P.bounty,B=BOUNTIES[b.i];if(b.active&&B){const d=el('div','jcur pnl');d.innerHTML=`<small>Охота</small><b>${B.t}</b><p>${B.d} Прогресс: ${Math.min(b.prog,B.n)} из ${B.n}.</p>`;L.appendChild(d)}}
