'use strict';
/* ===== data: classes, foes, regions, items ===== */
const CLS={
 mage:{n:'Маг',spr:'mage',hp:20,hpL:3.5,mp:30,mpL:5,armor:0,armL:.3,sp:1,ms:74,mpr:1.7,crit:5,
  d:'Хрупкий, но страшный на расстоянии. Посох стреляет сгустками магии, а заклинания жгут, морозят и бьют молнией.',
  pips:{hp:1,mp:3,atk:1,mag:3},w:{n:'Ученический посох',dmg:5},
  sk:[{id:'fireball',n:'Огненный шар',lv:1,mp:4,cd:.55,ic:'✦',col:'#ff9a4a',d:'Взрывается и задевает всех рядом'},
      {id:'frostring',n:'Кольцо инея',lv:3,mp:10,cd:4,ic:'❄︎',col:'#8fe8ff',d:'Ранит и почти замораживает всех вокруг'},
      {id:'chain',n:'Цепная молния',lv:6,mp:12,cd:2,ic:'ϟ',col:'#c8d8ff',d:'Прыгает по пяти врагам'},
      {id:'meteor',n:'Метеор',lv:10,mp:24,cd:9,ic:'☄︎',col:'#ff6a3a',d:'Огромный взрыв через мгновение'}]},
 warrior:{n:'Воин',spr:'warrior',hp:34,hpL:5.5,mp:10,mpL:1.5,armor:6,armL:1,sp:.45,ms:70,mpr:.4,crit:5,
  d:'Крепкий боец с широким мечом. Каждый удар копит ману, а на ней держится немного простой магии.',
  pips:{hp:3,mp:1,atk:3,mag:1},w:{n:'Старый меч',dmg:7},
  sk:[{id:'spark',n:'Искра',lv:1,mp:4,cd:1.1,ic:'✧',col:'#ffc06a',d:'Слабая магия: маленький огненный снаряд'},
      {id:'dash',n:'Рывок',lv:3,mp:4,cd:3,ic:'➤',col:'#e8e4da',d:'Прорыв вперёд с уроном. Во время рывка ты неуязвим'},
      {id:'whirl',n:'Вихрь',lv:6,mp:6,cd:5,ic:'✺',col:'#f2c14e',d:'Круговой удар, отбрасывает врагов'},
      {id:'warcry',n:'Боевой клич',lv:10,mp:8,cd:20,ic:'⚑',col:'#ff6a5a',d:'8 секунд: +40% урона, +10 брони. Лечит четверть здоровья'}]},
 ranger:{n:'Следопыт',spr:'ranger',hp:26,hpL:4.2,mp:16,mpL:2.5,armor:2,armL:.5,sp:.6,ms:82,mpr:.9,crit:10,
  d:'Быстрый стрелок. Держит врагов на расстоянии, уходит перекатом и травит ядом. Немного умеет в магию природы.',
  pips:{hp:2,mp:2,atk:2,mag:2},w:{n:'Охотничий лук',dmg:5},
  sk:[{id:'multi',n:'Веер стрел',lv:1,mp:4,cd:1.2,ic:'⋔',col:'#e8e4da',d:'Пять стрел веером'},
      {id:'roll',n:'Перекат',lv:3,mp:2,cd:1.8,ic:'↻',col:'#9fe08a',d:'Быстрый уход в сторону, ты неуязвим'},
      {id:'poison',n:'Ядовитая стрела',lv:6,mp:5,cd:2.5,ic:'☠︎',col:'#9fe060',d:'Пробивает насквозь и травит'},
      {id:'rain',n:'Град стрел',lv:10,mp:14,cd:10,ic:'⇊',col:'#f2c14e',d:'Стрелы сыплются на область две секунды'}]}
};
const FOES={
 slime:{n:'Слизень',hp:16,dmg:5,spd:28,xp:6,r:5,ai:'hop',spr:'slime'},
 tslime:{n:'Ядовитый слизень',hp:24,dmg:8,spd:30,xp:9,r:5,ai:'hop',spr:'tslime',split:true},
 mini:{n:'Слизнёнок',hp:9,dmg:4,spd:38,xp:2,r:4,ai:'hop',spr:'tslime',small:true},
 wolf:{n:'Волк',hp:22,dmg:8,spd:54,xp:9,r:6,ai:'lunge',spr:'wolf'},
 iwolf:{n:'Ледяной волк',hp:26,dmg:9,spd:58,xp:11,r:6,ai:'lunge',spr:'iwolf',chill:true},
 spider:{n:'Паук',hp:20,dmg:7,spd:56,xp:10,r:5,ai:'ranged',shot:'web',range:100,spr:'spider'},
 goblin:{n:'Гоблин',hp:28,dmg:9,spd:48,xp:11,r:5,ai:'melee',spr:'goblin',pack:true},
 garcher:{n:'Гоблин-лучник',hp:20,dmg:8,spd:42,xp:11,r:5,ai:'ranged',shot:'arrow',range:120,spr:'garcher'},
 ogre:{n:'Огр',hp:90,dmg:18,spd:30,xp:26,r:8,ai:'slam',spr:'ogre',big:true},
 troll:{n:'Снежный тролль',hp:100,dmg:19,spd:32,xp:28,r:8,ai:'slam',spr:'troll',big:true},
 golem:{n:'Лавовый голем',hp:120,dmg:21,spd:28,xp:32,r:8,ai:'slam',spr:'golem',big:true},
 zombie:{n:'Утопленник',hp:48,dmg:12,spd:26,xp:14,r:6,ai:'melee',spr:'zombie'},
 witch:{n:'Болотная ведьма',hp:32,dmg:11,spd:38,xp:16,r:5,ai:'ranged',shot:'hex',range:130,spr:'witch',blink:true},
 wraith:{n:'Ледяной дух',hp:34,dmg:12,spd:44,xp:16,r:5,ai:'ranged',shot:'ice',range:125,spr:'wraith',blink:true},
 imp:{n:'Огненный бес',hp:30,dmg:12,spd:60,xp:15,r:5,ai:'ranged',shot:'fireb',range:115,spr:'imp',blink:true,pack:true},
 skel:{n:'Скелет',hp:38,dmg:12,spd:36,xp:15,r:5,ai:'melee',spr:'skel'},
 sarcher:{n:'Скелет-лучник',hp:28,dmg:12,spd:32,xp:15,r:5,ai:'ranged',shot:'arrow',range:130,spr:'sarcher'},
 ghost:{n:'Призрак',hp:34,dmg:13,spd:42,xp:17,r:5,ai:'ghost',spr:'ghost'},
 fang:{n:'Клык, вожак стаи',hp:750,dmg:18,spd:60,xp:600,r:9,ai:'fang',spr:'fang',boss:true,big:true},
 grokk:{n:'Гроккс, вождь огров',hp:1400,dmg:26,spd:32,xp:1100,r:10,ai:'grokk',spr:'grokk',boss:true,big:true,adds:['goblin','garcher'],shard:'rock'},
 queen:{n:'Королева слизней',hp:1800,dmg:22,spd:30,xp:1600,r:10,ai:'queen',spr:'queen',boss:true,big:true},
 yeti:{n:'Хримнир, ледяной великан',hp:2600,dmg:32,spd:34,xp:2400,r:10,ai:'grokk',spr:'yeti',boss:true,big:true,adds:['iwolf','wraith'],shard:'ice'},
 ashlord:{n:'Пепельный владыка',hp:3400,dmg:34,spd:38,xp:3200,r:9,ai:'lich',spr:'ashlord',boss:true,big:true,adds:['imp','golem'],orb:'fireb'},
 lich:{n:'Моргрим, Лич',hp:5200,dmg:40,spd:38,xp:6000,r:9,ai:'lich',spr:'lich',boss:true,big:true,adds:['skel','ghost','sarcher'],orb:'orb'}
};
const RACES={
 human:{n:'Человек',d:'Ко всему привычен. Чуть крепче и сильнее в бою.',b:{hpP:5,dmgP:5},pal:{}},
 elf:{n:'Эльф',d:'Острые уши и острый глаз. Больше маны, чаще криты, быстрее бегает.',b:{mpP:15,crit:5,ms:5},pal:{s:'#f6dcc4'},ears:true},
 dwarf:{n:'Гном',d:'Бородат и крепок, как скала. Больше здоровья и брони, но медленнее.',b:{hpP:20,armor:4,ms:-6},pal:{s:'#e8b088'},beard:true},
 fox:{n:'Лисолюд',d:'Рыжий, хитрый и вертлявый. Быстро бегает и уворачивается от каждого десятого удара.',b:{ms:10,dodge:10},pal:{s:'#e8822e'},fox:true},
 orc:{n:'Орк',d:'Сильный и злой. Бьёт больнее всех, но с магией не дружит.',b:{dmgP:15,hpP:10,mpP:-15},pal:{s:'#7ab04a'},tusks:true}
};
function heroRows(cls,race){const rows=SRC[CLS[cls].spr].map(r=>r.padEnd(16,'.').split(''));const R=RACES[race]||RACES.human;
  let y0=-1,y1=-1,x0=99,x1=-1;rows.forEach((r,y)=>{if(y>9)return;r.forEach((c,x)=>{if(c==='s'){if(y0<0)y0=y;y1=y;x0=Math.min(x0,x);x1=Math.max(x1,x)}})});
  const put=(x,y,c)=>{if(y>=0&&y<rows.length&&x>=0&&x<16)rows[y][x]=c};
  if(y0>=0){
    if(R.ears){put(x0-1,y0,'k');put(x0-2,y0-1,'k');put(x0-1,y0+0,'s');put(x1+1,y0,'s');put(x1+2,y0-1,'k')}
    if(R.fox){put(x0-1,y0-1,'k');put(x0-1,y0,'o');put(x1+1,y0-1,'k');put(x1+1,y0,'o');[[1,10],[0,11],[1,11],[0,12],[1,12],[1,13]].forEach(([x,y])=>put(x,y,y===13?'w':'o'));put(0,10,'k');put(2,13,'k')}
    if(R.beard){for(let x=x0;x<=x1;x++){put(x,y1+1,'h');if(x>x0&&x<x1)put(x,y1+2,'h')}}
    if(R.tusks){put(x0+1,y1,'w');put(x1-1,y1,'w')}}
  return rows.map(r=>r.join(''))}
function heroSpr(cls,race){const k='hero_'+cls+'_'+race;if(!SPR[k])SPR[k]=mk(heroRows(cls,race),(RACES[race]||RACES.human).pal);return SPR[k]}
const REGIONS=[
 {n:'Луга Вельмора',lv:[1,4],foes:{slime:3,wolf:2},cap:16,lab:[78,36]},
 {n:'Деревня Вельмор',safe:true,lab:[70,64]},
 {n:'Тёмный лес',lv:[4,8],foes:{wolf:3,spider:3},cap:20,lab:[24,48]},
 {n:'Гнилые топи',lv:[10,14],foes:{zombie:3,witch:2,tslime:3},cap:20,lab:[44,92]},
 {n:'Гоблинские холмы',lv:[7,11],foes:{goblin:4,garcher:3,ogre:1},cap:20,lab:[104,46]},
 {n:'Старое кладбище',lv:[13,17],foes:{skel:4,sarcher:3,ghost:2},cap:20,lab:[96,80]},
 {n:'Склеп Моргрима',lv:[22,24],foes:{},cap:0,lab:[117,95]},
 {n:'Ледяной перевал',lv:[15,19],foes:{iwolf:4,wraith:3,troll:1},cap:18,lab:[46,14]},
 {n:'Пепельные пустоши',lv:[18,22],foes:{imp:4,golem:2},cap:16,lab:[130,66]}
];
const BOUNTIES=[
 {t:'Волчья напасть',foes:['wolf'],n:10,gold:60,d:'Убей 10 волков. Они на лугах и в лесу.'},
 {t:'Паучье гнездо',foes:['spider'],n:10,gold:120,d:'Убей 10 пауков в Тёмном лесу.'},
 {t:'Гоблинский набег',foes:['goblin','garcher'],n:15,gold:190,d:'Убей 15 гоблинов на холмах.'},
 {t:'Огрова доля',foes:['ogre'],n:4,gold:240,d:'Убей 4 огров. Они медленные, но бьют больно.'},
 {t:'Болотная нечисть',foes:['zombie','witch'],n:12,gold:300,d:'Убей 12 утопленников или ведьм в топях.'},
 {t:'Покой мёртвых',foes:['skel','sarcher','ghost'],n:18,gold:420,d:'Упокой 18 мертвецов на кладбище.'},
 {t:'Холодная охота',foes:['iwolf','troll','wraith'],n:16,gold:560,d:'Убей 16 тварей на Ледяном перевале.'},
 {t:'Пепел и пламя',foes:['imp','golem'],n:16,gold:720,d:'Убей 16 бесов или големов в Пепельных пустошах.'}
];

/* ----- items ----- */
const RAR=[{n:'Обычный',c:'#c9c2b2',m:1},{n:'Необычный',c:'#7fe07a',m:1.15},{n:'Редкий',c:'#6fa8ff',m:1.32},{n:'Эпический',c:'#c48aff',m:1.55},{n:'Легендарный',c:'#ff9a3a',m:1.85}];
const SLOTS=['weapon','armor','amulet','ring'];
const SLOTN={weapon:'Оружие',armor:'Броня',amulet:'Амулет',ring:'Кольцо'};
const WN={mage:['Посох','Жезл','Посох чародея','Скипетр'],warrior:['Меч','Палаш','Боевой топор','Клеймор'],ranger:['Лук','Длинный лук','Составной лук','Боевой лук']};
const AN=['Стёганка','Кольчуга','Мантия','Кожаный доспех','Латы','Чешуйчатый доспех'];
const AMN=['Амулет','Талисман','Оберег','Медальон'],RIN=['Кольцо','Перстень','Печатка'];
const SUF=['силы','ветра','тумана','пламени','инея','волка','ворона','рассвета','бури','теней','королей','охотника','мудреца','крови','звёзд','гнева'];
const LEGS=[
 {slot:'weapon',cls:'mage',n:'Шёпот Бездны',fx:'freecast',d:'Заклинание с шансом 25% не тратит ману'},
 {slot:'weapon',cls:'warrior',n:'Клинок Рассвета',fx:'wave',d:'Удары мечом пускают световую волну'},
 {slot:'weapon',cls:'ranger',n:'Ветер Севера',fx:'pierce',d:'Стрелы пробивают врагов насквозь и замедляют'},
 {slot:'amulet',n:'Сердце Вельмора',fx:'heart',d:'Восстанавливает 2% здоровья в секунду'},
 {slot:'armor',n:'Шкура Клыка',fx:'thorns',d:'Возвращает 40% урона тем, кто бьёт тебя вблизи'},
 {slot:'ring',n:'Кольцо Моргрима',fx:'soul',d:'Каждое убийство возвращает 4 маны',only:'lich'},
 {slot:'ring',n:'Глаз Бури',fx:'storm',d:'Каждый пятый удар бьёт молнией по ближайшему врагу'},
 {slot:'amulet',n:'Пепельное сердце',fx:'ember',d:'Враги рядом с тобой горят'}
];
const AFX={
 hp:{t:v=>`+${v} к здоровью`,r:l=>Math.round((4+l*2.2)*(.6+Math.random()*.6))},
 mp:{t:v=>`+${v} к мане`,r:l=>Math.round((4+l*1.8)*(.6+Math.random()*.6))},
 dmgP:{t:v=>`+${v}% к урону`,r:()=>4+rint(9)},
 spP:{t:v=>`+${v}% к силе магии`,r:()=>6+rint(12)},
 crit:{t:v=>`+${v}% шанс крита`,r:()=>2+rint(6)},
 as:{t:v=>`+${v}% к скорости атаки`,r:()=>5+rint(10)},
 ms:{t:v=>`+${v}% к скорости бега`,r:()=>3+rint(7)},
 mpr:{t:v=>`+${v} маны в секунду`,r:l=>+(.2+l*.04+Math.random()*.3).toFixed(1)},
 armor:{t:v=>`+${v} к броне`,r:l=>Math.round(1+l*.8)},
 ls:{t:v=>`${v}% урона лечит тебя`,r:()=>1+rint(3)}
};
const AFPOOL={weapon:['dmgP','crit','as','spP','ls'],armor:['hp','armor','ms','mpr','hp'],amulet:['hp','mp','spP','crit','mpr','ls'],ring:['dmgP','crit','as','mp','ms','spP']};
function rollRar(b){const r=Math.random()*100;if(r<.6+b*1.5)return 4;if(r<4+b*5)return 3;if(r<16+b*10)return 2;if(r<46+b*10)return 1;return 0}
function genItem(lvl,o={}){
  lvl=Math.max(1,Math.round(lvl));
  let rar=o.rarity??rollRar(o.bias||0);if(o.minRar!=null)rar=Math.max(rar,o.minRar);
  const slot=o.slot||pickW({weapon:34,armor:30,amulet:18,ring:18});
  const cls=slot==='weapon'?(o.cls||(Math.random()<.75?P.cls:pick(['mage','warrior','ranger']))):null;
  let leg=null;
  if(rar===4){const c=LEGS.filter(l=>l.slot===slot&&(!l.cls||l.cls===cls)&&(!l.only||l.only===o.src));leg=c.length?pick(c):null;if(!leg)rar=3}
  const it={uid:uid(),slot,cls,rar,lvl,af:{}};
  const m=RAR[rar].m;
  if(slot==='weapon'){const cm={mage:.85,warrior:1.25,ranger:1}[cls];it.dmg=Math.round((3+lvl*1.7)*cm*m);it.base=WN[cls][Math.min(3,rint(1+lvl/4))]}
  else if(slot==='armor'){it.armor=Math.round((2+lvl*1.3)*m);it.base=pick(AN)}
  else it.base=pick(slot==='amulet'?AMN:RIN);
  const pool=[...AFPOOL[slot]].filter(k=>k!=='ls'||rar>=3);
  let n=rar;if(slot==='weapon'&&cls==='mage'&&!pool.includes('spP'))n++;
  if(slot==='weapon'&&cls==='mage'){it.af.spP=AFX.spP.r(lvl)+rar*3;n--}
  for(let i=0;i<n&&pool.length;i++){const k=pool.splice(rint(pool.length),1)[0];if(it.af[k]!=null){i--;continue}it.af[k]=AFX[k].r(lvl)}
  if(leg){it.name=leg.n;it.fx=leg.fx;it.fxd=leg.d}else it.name=it.base+(rar>0?' '+pick(SUF):'');
  it.price=Math.round((5+lvl*3)*Math.pow(rar+1,1.6));
  return it;
}
function starterWeapon(cls){const c=CLS[cls];return{uid:uid(),slot:'weapon',cls,rar:0,lvl:1,af:cls==='mage'?{spP:5}:{},dmg:c.w.dmg,name:c.w.n,base:c.w.n,price:3}}
function weaponIcon(cls){return{mage:'staff',warrior:'sword',ranger:'bow'}[cls]}
function itemIcon(it){if(it.slot==='potion')return ICON[it.kind==='hp'?'pot':'potmp'];if(it.slot==='weapon')return ICON[weaponIcon(it.cls)];return ICON[it.slot]}
function itemSpr(it){if(it.slot==='weapon')return SPR[weaponIcon(it.cls)];return SPR[it.slot]||SPR.ring}
function itemType(it){if(it.slot==='potion')return'зелье';if(it.slot==='weapon')return({mage:'посох мага',warrior:'оружие воина',ranger:'лук следопыта'})[it.cls];return SLOTN[it.slot].toLowerCase()}
