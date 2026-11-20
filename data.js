'use strict';
/* ===== data: classes, foes, regions, items ===== */
const CLS={
 mage:{n:'Маг',spr:'mage',hp:18,hpL:4,mp:30,mpL:5,armor:0,armL:.3,sp:1,ms:74,mpr:1.7,crit:5,
  d:'Хрупкий, но страшный на расстоянии. Посох стреляет сгустками магии, а заклинания жгут, морозят и бьют молнией.',
  pips:{hp:1,mp:3,atk:1,mag:3},w:{n:'Ученический посох',dmg:5},
  sk:[{id:'fireball',n:'Огненный шар',lv:1,mp:4,cd:.55,ic:'✦',col:'#ff9a4a',d:'Взрывается и задевает всех рядом'},
      {id:'frostring',n:'Кольцо инея',lv:3,mp:10,cd:4,ic:'❄︎',col:'#8fe8ff',d:'Ранит и почти замораживает всех вокруг'},
      {id:'chain',n:'Цепная молния',lv:6,mp:12,cd:2,ic:'ϟ',col:'#c8d8ff',d:'Прыгает по пяти врагам'},
      {id:'meteor',n:'Метеор',lv:10,mp:24,cd:9,ic:'☄︎',col:'#ff6a3a',d:'Огромный взрыв через мгновение'}]},
 warrior:{n:'Воин',spr:'warrior',hp:34,hpL:8,mp:10,mpL:1.5,armor:6,armL:1,sp:.45,ms:70,mpr:.4,crit:5,
  d:'Крепкий боец с широким мечом. Каждый удар копит ману, а на ней держится немного простой магии.',
  pips:{hp:3,mp:1,atk:3,mag:1},w:{n:'Старый меч',dmg:7},
  sk:[{id:'spark',n:'Искра',lv:1,mp:4,cd:1.1,ic:'✧',col:'#ffc06a',d:'Слабая магия: маленький огненный снаряд'},
      {id:'dash',n:'Рывок',lv:3,mp:4,cd:3,ic:'➤',col:'#e8e4da',d:'Прорыв вперёд с уроном. Во время рывка ты неуязвим'},
      {id:'whirl',n:'Вихрь',lv:6,mp:6,cd:5,ic:'✺',col:'#f2c14e',d:'Круговой удар, отбрасывает врагов'},
      {id:'warcry',n:'Боевой клич',lv:10,mp:8,cd:20,ic:'⚑',col:'#ff6a5a',d:'8 секунд: +40% урона, +10 брони. Лечит четверть здоровья'}]},
 ranger:{n:'Следопыт',spr:'ranger',hp:24,hpL:5,mp:16,mpL:2.5,armor:2,armL:.5,sp:.6,ms:82,mpr:.9,crit:10,
  d:'Быстрый стрелок. Держит врагов на расстоянии, уходит перекатом и травит ядом. Немного умеет в магию природы.',
  pips:{hp:2,mp:2,atk:2,mag:2},w:{n:'Охотничий лук',dmg:5},
  sk:[{id:'multi',n:'Веер стрел',lv:1,mp:4,cd:1.2,ic:'⋔',col:'#e8e4da',d:'Пять стрел веером'},
      {id:'roll',n:'Перекат',lv:3,mp:2,cd:1.8,ic:'↻',col:'#9fe08a',d:'Быстрый уход в сторону, ты неуязвим'},
      {id:'poison',n:'Ядовитая стрела',lv:6,mp:5,cd:2.5,ic:'☠︎',col:'#9fe060',d:'Пробивает насквозь и травит'},
      {id:'rain',n:'Град стрел',lv:10,mp:14,cd:10,ic:'⇊',col:'#f2c14e',d:'Стрелы сыплются на область две секунды'}]}
};
const FOES={
 slime:{n:'Слизень',hp:14,dmg:4,spd:26,xp:6,r:5,ai:'hop',spr:'slime'},
 tslime:{n:'Ядовитый слизень',hp:22,dmg:6,spd:28,xp:9,r:5,ai:'hop',spr:'tslime',split:true},
 mini:{n:'Слизнёнок',hp:8,dmg:3,spd:36,xp:2,r:4,ai:'hop',spr:'tslime',small:true},
 wolf:{n:'Волк',hp:20,dmg:6,spd:50,xp:9,r:6,ai:'lunge',spr:'wolf'},
 spider:{n:'Паук',hp:18,dmg:5,spd:54,xp:10,r:5,ai:'ranged',shot:'web',range:95,spr:'spider'},
 goblin:{n:'Гоблин',hp:26,dmg:7,spd:46,xp:11,r:5,ai:'melee',spr:'goblin',pack:true},
 garcher:{n:'Гоблин-лучник',hp:18,dmg:6,spd:40,xp:11,r:5,ai:'ranged',shot:'arrow',range:115,spr:'garcher'},
 ogre:{n:'Огр',hp:80,dmg:14,spd:28,xp:26,r:8,ai:'slam',spr:'ogre',big:true},
 zombie:{n:'Утопленник',hp:44,dmg:9,spd:24,xp:14,r:6,ai:'melee',spr:'zombie'},
 witch:{n:'Болотная ведьма',hp:30,dmg:8,spd:36,xp:16,r:5,ai:'ranged',shot:'hex',range:125,spr:'witch',blink:true},
 skel:{n:'Скелет',hp:34,dmg:9,spd:34,xp:15,r:5,ai:'melee',spr:'skel'},
 sarcher:{n:'Скелет-лучник',hp:26,dmg:9,spd:30,xp:15,r:5,ai:'ranged',shot:'arrow',range:125,spr:'sarcher'},
 ghost:{n:'Призрак',hp:30,dmg:10,spd:40,xp:17,r:5,ai:'ghost',spr:'ghost'},
 fang:{n:'Клык, вожак стаи',hp:340,dmg:13,spd:58,xp:300,r:9,ai:'fang',spr:'fang',boss:true,big:true},
 grokk:{n:'Гроккс, вождь огров',hp:600,dmg:19,spd:30,xp:500,r:10,ai:'grokk',spr:'grokk',boss:true,big:true},
 queen:{n:'Королева слизней',hp:680,dmg:16,spd:30,xp:650,r:10,ai:'queen',spr:'queen',boss:true,big:true},
 lich:{n:'Моргрим, Лич',hp:1600,dmg:22,spd:36,xp:2000,r:9,ai:'lich',spr:'lich',boss:true,big:true}
};
const REGIONS=[
 {n:'Луга Вельмора',lv:[1,3],foes:{slime:3,wolf:2},cap:11,lab:[52,16]},
 {n:'Деревня Вельмор',safe:true,lab:[50,44]},
 {n:'Тёмный лес',lv:[3,6],foes:{wolf:3,spider:3},cap:14,lab:[17,30]},
 {n:'Гнилые топи',lv:[7,10],foes:{zombie:3,witch:2,tslime:3},cap:14,lab:[30,72]},
 {n:'Гоблинские холмы',lv:[5,8],foes:{goblin:4,garcher:3,ogre:1},cap:14,lab:[80,26]},
 {n:'Старое кладбище',lv:[9,12],foes:{skel:4,sarcher:3,ghost:2},cap:15,lab:[70,50]},
 {n:'Склеп Моргрима',lv:[12,13],foes:{},cap:0,lab:[82,68]}
];
const BOUNTIES=[
 {t:'Волчья напасть',foes:['wolf'],n:10,gold:60,d:'Убей 10 волков. Они на лугах и в лесу.'},
 {t:'Паучье гнездо',foes:['spider'],n:10,gold:120,d:'Убей 10 пауков в Тёмном лесу.'},
 {t:'Гоблинский набег',foes:['goblin','garcher'],n:15,gold:190,d:'Убей 15 гоблинов на холмах.'},
 {t:'Огрова доля',foes:['ogre'],n:4,gold:240,d:'Убей 4 огров. Они медленные, но бьют больно.'},
 {t:'Болотная нечисть',foes:['zombie','witch'],n:12,gold:300,d:'Убей 12 утопленников или ведьм в топях.'},
 {t:'Покой мёртвых',foes:['skel','sarcher','ghost'],n:18,gold:420,d:'Упокой 18 мертвецов на кладбище.'}
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
 {slot:'ring',n:'Кольцо Моргрима',fx:'soul',d:'Каждое убийство возвращает 4 маны',only:'lich'}
];
const AFX={
 hp:{t:v=>`+${v} к здоровью`,r:l=>Math.round((5+l*3)*(.6+Math.random()*.6))},
 mp:{t:v=>`+${v} к мане`,r:l=>Math.round((4+l*1.8)*(.6+Math.random()*.6))},
 dmgP:{t:v=>`+${v}% к урону`,r:()=>4+rint(9)},
 spP:{t:v=>`+${v}% к силе магии`,r:()=>6+rint(12)},
 crit:{t:v=>`+${v}% шанс крита`,r:()=>2+rint(6)},
 as:{t:v=>`+${v}% к скорости атаки`,r:()=>5+rint(10)},
 ms:{t:v=>`+${v}% к скорости бега`,r:()=>3+rint(7)},
 mpr:{t:v=>`+${v} маны в секунду`,r:l=>+(.2+l*.04+Math.random()*.3).toFixed(1)},
 armor:{t:v=>`+${v} к броне`,r:l=>Math.round(1+l*.8)},
 ls:{t:v=>`${v}% урона лечит тебя`,r:()=>2+rint(3)}
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
