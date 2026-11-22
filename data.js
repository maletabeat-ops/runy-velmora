'use strict';
/* ===== data: Острова Шторма — classes, races, foes, regions, items, talents, crafting, companions, dungeons ===== */
const CLS={
 mage:{n:'Штормовой маг',spr:'mage',hp:20,hpL:3.5,mp:30,mpL:5,armor:0,armL:.3,sp:1,ms:74,mpr:1.7,crit:5,
  d:'Хрупкий, но страшный на расстоянии. Посох бьёт сгустками морской магии, а заклинания жгут, крутят водовороты и бьют молнией.',
  w:{n:'Посох юнги',dmg:5},
  sk:[{id:'fireball',n:'Огненный шар',lv:1,mp:4,cd:.55,ic:'✦',col:'#ff9a4a',d:'Взрывается и задевает всех рядом'},
      {id:'frostring',n:'Водоворот',lv:3,mp:10,cd:4,ic:'❄︎',col:'#8fe8ff',d:'Ранит и вязко замедляет всех вокруг'},
      {id:'chain',n:'Цепная молния',lv:6,mp:12,cd:2,ic:'ϟ',col:'#c8d8ff',d:'Прыгает по пяти врагам'},
      {id:'meteor',n:'Удар шторма',lv:10,mp:24,cd:9,ic:'☄︎',col:'#ff6a3a',d:'Огромный взрыв молнии через мгновение'}]},
 warrior:{n:'Абордажник',spr:'warrior',hp:34,hpL:5.5,mp:10,mpL:1.5,armor:6,armL:1,sp:.45,ms:70,mpr:.4,crit:5,
  d:'Крепкий морской рубака с тесаком. Каждый удар копит ману, а на ней держится немного пороховой магии.',
  w:{n:'Ржавый тесак',dmg:7},
  sk:[{id:'spark',n:'Огненная искра',lv:1,mp:4,cd:1.1,ic:'✧',col:'#ffc06a',d:'Слабая магия: маленький огненный снаряд'},
      {id:'dash',n:'Абордаж',lv:3,mp:4,cd:3,ic:'➤',col:'#e8e4da',d:'Прыжок вперёд с уроном. Во время прыжка ты неуязвим'},
      {id:'whirl',n:'Вихрь клинков',lv:6,mp:6,cd:5,ic:'✺',col:'#f2c14e',d:'Круговой удар, отбрасывает врагов'},
      {id:'warcry',n:'Ром и ярость',lv:10,mp:8,cd:20,ic:'⚑',col:'#ff6a5a',d:'8 секунд: +40% урона, +10 брони. Лечит четверть здоровья'}]},
 ranger:{n:'Следопыт',spr:'ranger',hp:26,hpL:4.2,mp:16,mpL:2.5,armor:2,armL:.5,sp:.6,ms:82,mpr:.9,crit:10,
  d:'Быстрый стрелок с островов. Держит врагов на расстоянии, уходит перекатом и травит ядом.',
  w:{n:'Охотничий лук',dmg:5},
  sk:[{id:'multi',n:'Веер стрел',lv:1,mp:4,cd:1.2,ic:'⋔',col:'#e8e4da',d:'Пять стрел веером'},
      {id:'roll',n:'Перекат',lv:3,mp:2,cd:1.8,ic:'↻',col:'#9fe08a',d:'Быстрый уход в сторону, ты неуязвим'},
      {id:'poison',n:'Ядовитая стрела',lv:6,mp:5,cd:2.5,ic:'☠︎',col:'#9fe060',d:'Пробивает насквозь и травит'},
      {id:'rain',n:'Град стрел',lv:10,mp:14,cd:10,ic:'⇊',col:'#f2c14e',d:'Стрелы сыплются на область две секунды'}]}
};
const FOES={
 jelly:{n:'Медуза',hp:16,dmg:5,spd:28,xp:6,r:5,ai:'hop',spr:'jelly',mat:{pearl:1}},
 crab:{n:'Краб',hp:20,dmg:6,spd:36,xp:7,r:5,ai:'melee',spr:'crab',mat:{hide:1}},
 monkey:{n:'Бешеная обезьяна',hp:22,dmg:8,spd:56,xp:9,r:5,ai:'lunge',spr:'monkey',pack:true,mat:{hide:1}},
 spider:{n:'Джунглевый паук',hp:20,dmg:7,spd:56,xp:10,r:5,ai:'ranged',shot:'web',range:100,spr:'spider',mat:{hide:1}},
 tslime:{n:'Ядовитая медуза',hp:24,dmg:8,spd:30,xp:9,r:5,ai:'hop',spr:'tjelly',split:true,mat:{pearl:1}},
 mini:{n:'Медузка',hp:9,dmg:4,spd:38,xp:2,r:4,ai:'hop',spr:'tjelly',small:true},
 zombie:{n:'Утопленник',hp:48,dmg:12,spd:26,xp:14,r:6,ai:'melee',spr:'zombie',mat:{pearl:1,wood:1}},
 witch:{n:'Болотная ведьма',hp:32,dmg:11,spd:38,xp:16,r:5,ai:'ranged',shot:'hex',range:130,spr:'witch',blink:true,mat:{crystal:1}},
 pirate:{n:'Пират',hp:30,dmg:10,spd:48,xp:12,r:5,ai:'melee',spr:'pirate',pack:true,mat:{iron:1,wood:1}},
 pgunner:{n:'Пират-стрелок',hp:22,dmg:10,spd:42,xp:12,r:5,ai:'ranged',shot:'bullet',range:130,spr:'pgunner',mat:{iron:1}},
 brute:{n:'Громила',hp:90,dmg:18,spd:30,xp:26,r:8,ai:'slam',spr:'brute',big:true,mat:{iron:2}},
 skel:{n:'Скелет матроса',hp:38,dmg:12,spd:36,xp:15,r:5,ai:'melee',spr:'skel',mat:{iron:1}},
 sarcher:{n:'Скелет-мушкетёр',hp:28,dmg:12,spd:32,xp:15,r:5,ai:'ranged',shot:'bullet',range:135,spr:'sarcher',mat:{iron:1,wood:1}},
 ghost:{n:'Призрак моряка',hp:34,dmg:13,spd:42,xp:17,r:5,ai:'ghost',spr:'ghost',mat:{crystal:1}},
 iwolf:{n:'Ледяной волк',hp:26,dmg:9,spd:58,xp:11,r:6,ai:'lunge',spr:'iwolf',chill:true,mat:{hide:1}},
 troll:{n:'Снежный тролль',hp:100,dmg:19,spd:32,xp:28,r:8,ai:'slam',spr:'troll',big:true,mat:{hide:2,crystal:1}},
 wraith:{n:'Ледяной дух',hp:34,dmg:12,spd:44,xp:16,r:5,ai:'ranged',shot:'ice',range:125,spr:'wraith',blink:true,mat:{crystal:1}},
 imp:{n:'Огненный бес',hp:30,dmg:12,spd:60,xp:15,r:5,ai:'ranged',shot:'fireb',range:115,spr:'imp',blink:true,pack:true,mat:{crystal:1}},
 golem:{n:'Лавовый голем',hp:120,dmg:21,spd:28,xp:32,r:8,ai:'slam',spr:'golem',big:true,mat:{iron:2,crystal:1}},
 shark:{n:'Акула',hp:40,dmg:12,spd:64,xp:12,r:6,ai:'lunge',spr:'shark',sea:true,mat:{hide:1,pearl:1}},
 serpent:{n:'Морской змей',hp:110,dmg:16,spd:36,xp:30,r:8,ai:'ranged',shot:'ice',range:140,spr:'serpent',sea:true,big:true,mat:{pearl:2,crystal:1}},
 crabking:{n:'Краб-король',hp:800,dmg:18,spd:48,xp:600,r:10,ai:'fang',spr:'crabking',boss:true,big:true,adds:['crab']},
 ila:{n:'Ила, мангровая ведьма',hp:1500,dmg:22,spd:36,xp:1100,r:9,ai:'lich',spr:'ila',boss:true,big:true,adds:['zombie','tslime'],orb:'hex'},
 barracuda:{n:'Капитан Барракуда',hp:1700,dmg:26,spd:34,xp:1400,r:10,ai:'grokk',spr:'captain',boss:true,big:true,adds:['pirate','pgunner'],shard:'bullet'},
 yeti:{n:'Хрум, ледяной великан',hp:2600,dmg:32,spd:34,xp:2400,r:10,ai:'grokk',spr:'yeti',boss:true,big:true,adds:['iwolf','wraith'],shard:'ice'},
 ashlord:{n:'Саламандра, владычица пепла',hp:3400,dmg:34,spd:38,xp:3200,r:9,ai:'lich',spr:'ashlord',boss:true,big:true,adds:['imp','golem'],orb:'fireb'},
 sam:{n:'Одноглазый Сэм',hp:1500,dmg:24,spd:36,xp:1300,r:10,ai:'grokk',spr:'captain2',boss:true,big:true,adds:['pirate'],shard:'bullet'},
 trollking:{n:'Король троллей',hp:2400,dmg:30,spd:32,xp:2200,r:10,ai:'grokk',spr:'troll',boss:true,big:true,adds:['iwolf','troll'],shard:'ice'},
 morven:{n:'Морвен, Глаз Шторма',hp:6000,dmg:42,spd:38,xp:7000,r:9,ai:'lich',spr:'morven',boss:true,big:true,adds:['skel','ghost','sarcher'],orb:'orb'}
};
const RACES={
 human:{n:'Человек',d:'Ко всему привычен. Чуть крепче и сильнее в бою.',b:{hpP:5,dmgP:5},pal:{}},
 fish:{n:'Рыболюд',d:'Плавники вместо ушей. Больше маны, быстрее её копит и не вязнет в мелководье.',b:{mpP:15,mpr:.4,swim:1},pal:{s:'#6ab8b0'},fins:true},
 bird:{n:'Птицелюд',d:'Лёгкий и зоркий. Быстро бегает и чаще бьёт точно, но чуть хрупче.',b:{ms:12,crit:5,hpP:-5},pal:{s:'#e8d8b0'},beak:true},
 turtle:{n:'Черепаха-отшельник',d:'Панцирь за спиной. Очень много здоровья и брони, но неспешна.',b:{hpP:25,armor:6,ms:-10},pal:{s:'#8aa860'},shell:true},
 fox:{n:'Лисолюд-мореход',d:'Рыжий, хитрый и вертлявый. Быстро бегает и уворачивается от каждого десятого удара.',b:{ms:8,dodge:10},pal:{s:'#e8822e'},fox:true}
};
function heroRows(cls,race){const rows=SRC[CLS[cls].spr].map(r=>r.padEnd(16,'.').split(''));const R=RACES[race]||RACES.human;
  let y0=-1,y1=-1,x0=99,x1=-1;rows.forEach((r,y)=>{if(y>9)return;r.forEach((c,x)=>{if(c==='s'){if(y0<0)y0=y;y1=y;x0=Math.min(x0,x);x1=Math.max(x1,x)}})});
  const put=(x,y,c)=>{if(y>=0&&y<rows.length&&x>=0&&x<16)rows[y][x]=c};
  if(y0>=0){
    if(R.fins){put(x0-1,y0,'c');put(x0-2,y0,'k');put(x0-1,y0+1,'C');put(x1+1,y0,'c');put(x1+2,y0,'k');put(x1+1,y0+1,'C')}
    if(R.beak){const mx=(x0+x1)>>1;put(mx,y1,'o');put(mx+1,y1,'o');put(mx,y1+1,'k');put(x0,y0-1,'r');put(x0+1,y0-2,'r')}
    if(R.shell){for(let y=y1+2;y<=y1+6;y++){put(x0-2,y,'k');put(x0-1,y,'L');put(x1+1,y,'L');put(x1+2,y,'k')}}
    if(R.fox){put(x0-1,y0-1,'k');put(x0-1,y0,'o');put(x1+1,y0-1,'k');put(x1+1,y0,'o');[[1,10],[0,11],[1,11],[0,12],[1,12],[1,13]].forEach(([x,y])=>put(x,y,y===13?'w':'o'));put(0,10,'k');put(2,13,'k')}}
  return rows.map(r=>r.join(''))}
function heroSpr(cls,race){const k='hero_'+cls+'_'+race;if(!SPR[k])SPR[k]=mk(heroRows(cls,race),(RACES[race]||RACES.human).pal);return SPR[k]}
/* regions: 0 home, 1 village, 2 palm, 3 mangrove, 4 pirate, 5 wrecks, 6 temple islet, 7 ice, 8 volcano, 9 sea, 10 dungeon */
const REGIONS=[
 {n:'Остров Тихой гавани',lv:[1,3],foes:{crab:3,jelly:2},cap:12,lab:[80,52]},
 {n:'Деревня Тихая гавань',safe:true,lab:[80,66]},
 {n:'Пальмовый остров',lv:[3,6],foes:{monkey:3,spider:2,crab:2},cap:16,lab:[40,40]},
 {n:'Мангровые топи',lv:[6,10],foes:{zombie:3,witch:2,tslime:3},cap:16,lab:[36,92]},
 {n:'Пиратская бухта',lv:[8,12],foes:{pirate:4,pgunner:3,brute:1},cap:18,lab:[122,40]},
 {n:'Кладбище кораблей',lv:[14,18],foes:{skel:4,sarcher:3,ghost:2},cap:16,lab:[124,96]},
 {n:'Островок Затонувшего храма',safe:true,lab:[80,104]},
 {n:'Ледяной остров',lv:[12,16],foes:{iwolf:4,wraith:3,troll:1},cap:16,lab:[80,14]},
 {n:'Остров Вулкан',lv:[16,20],foes:{imp:4,golem:2},cap:14,lab:[145,68]},
 {n:'Открытое море',sea:true,foes:{shark:4,serpent:1},cap:9},
 {n:'Подземелье',dun:true}
];
const BOUNTIES=[
 {t:'Крабья напасть',foes:['crab'],n:10,gold:60,d:'Убей 10 крабов. Они на всех пляжах.'},
 {t:'Обезьянья банда',foes:['monkey'],n:12,gold:120,d:'Убей 12 бешеных обезьян на Пальмовом острове.'},
 {t:'Морская охота',foes:['shark','serpent'],n:8,gold:180,d:'Убей 8 акул или морских змеев в открытом море.'},
 {t:'Болотная нечисть',foes:['zombie','witch'],n:12,gold:240,d:'Убей 12 утопленников или ведьм в Мангровых топях.'},
 {t:'Пиратский налёт',foes:['pirate','pgunner','brute'],n:16,gold:320,d:'Разгони 16 пиратов в Пиратской бухте.'},
 {t:'Холодная охота',foes:['iwolf','troll','wraith'],n:16,gold:420,d:'Убей 16 тварей на Ледяном острове.'},
 {t:'Покой мёртвых',foes:['skel','sarcher','ghost'],n:18,gold:520,d:'Упокой 18 мертвецов на Кладбище кораблей.'},
 {t:'Пепел и пламя',foes:['imp','golem'],n:16,gold:680,d:'Убей 16 бесов или големов на Острове Вулкан.'}
];
const DUNGEONS={
 smug:{n:'Пещера контрабандистов',floors:3,lv:[9,12],foes:{pirate:3,pgunner:2,brute:1},boss:'sam',theme:'cave'},
 grotto:{n:'Ледяные гроты',floors:3,lv:[14,17],foes:{iwolf:3,wraith:2,troll:1},boss:'trollking',theme:'ice'},
 temple:{n:'Затонувший храм',floors:4,lv:[20,23],foes:{skel:3,sarcher:2,ghost:2},boss:'morven',theme:'temple',locked:true}
};

/* ----- items ----- */
const RAR=[{n:'Обычный',c:'#c9c2b2',m:1},{n:'Необычный',c:'#7fe07a',m:1.15},{n:'Редкий',c:'#6fa8ff',m:1.32},{n:'Эпический',c:'#c48aff',m:1.55},{n:'Легендарный',c:'#ff9a3a',m:1.85}];
const SLOTS=['weapon','armor','amulet','ring'];
const SLOTN={weapon:'Оружие',armor:'Броня',amulet:'Амулет',ring:'Кольцо'};
const WN={mage:['Посох','Жезл','Коралловый посох','Скипетр бури'],warrior:['Тесак','Абордажная сабля','Боевой топор','Палаш'],ranger:['Лук','Длинный лук','Составной лук','Арбалет']};
const AN=['Жилет','Кожаный камзол','Мантия','Морской доспех','Кольчуга','Чешуйчатый доспех'];
const AMN=['Амулет','Ракушка','Оберег','Медальон'],RIN=['Кольцо','Перстень','Печатка'];
const SUF=['силы','ветра','тумана','пламени','приливов','глубин','шторма','рифов','капитана','рассвета','теней','чаек','мудреца','крови','звёзд','гнева'];
const LEGS=[
 {slot:'weapon',cls:'mage',n:'Шёпот Бездны',fx:'freecast',d:'Заклинание с шансом 25% не тратит ману'},
 {slot:'weapon',cls:'warrior',n:'Сабля Рассвета',fx:'wave',d:'Удары саблей пускают световую волну'},
 {slot:'weapon',cls:'ranger',n:'Ветер Севера',fx:'pierce',d:'Стрелы пробивают врагов насквозь и замедляют'},
 {slot:'amulet',n:'Сердце Океана',fx:'heart',d:'Восстанавливает 1.5% здоровья в секунду'},
 {slot:'armor',n:'Панцирь Краб-короля',fx:'thorns',d:'Возвращает 40% урона тем, кто бьёт тебя вблизи'},
 {slot:'ring',n:'Кольцо Морвен',fx:'soul',d:'Каждое убийство возвращает 4 маны',only:'morven'},
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
  lvl=Math.max(1,Math.round(lvl));const ngb=(G&&G.ng||0)*.6;
  let rar=o.rarity??rollRar((o.bias||0)+ngb);if(o.minRar!=null)rar=Math.max(rar,o.minRar);
  const slot=o.slot||pickW({weapon:34,armor:30,amulet:18,ring:18});
  const cls=slot==='weapon'?(o.cls||(Math.random()<.75?P.cls:pick(['mage','warrior','ranger']))):null;
  let leg=null;
  if(rar===4){const c=LEGS.filter(l=>l.slot===slot&&(!l.cls||l.cls===cls)&&(!l.only||l.only===o.src));leg=c.length?pick(c):null;if(!leg)rar=3}
  const it={uid:uid(),slot,cls,rar,lvl,af:{}};
  if(slot==='weapon')it.base=WN[cls][Math.min(3,rint(1+lvl/5))];else if(slot==='armor')it.base=pick(AN);else it.base=pick(slot==='amulet'?AMN:RIN);
  rollBase(it);
  const pool=[...AFPOOL[slot]].filter(k=>k!=='ls'||rar>=3);let n=rar;
  if(slot==='weapon'&&cls==='mage'){it.af.spP=AFX.spP.r(lvl)+rar*3;n--;pool.splice(pool.indexOf('spP'),1)}
  for(let i=0;i<n&&pool.length;i++){const k=pool.splice(rint(pool.length),1)[0];it.af[k]=AFX[k].r(lvl)}
  if(leg){it.name=leg.n;it.fx=leg.fx;it.fxd=leg.d}else it.name=it.base+(rar>0?' '+pick(SUF):'');
  return it;
}
function rollBase(it){const m=RAR[it.rar].m,l=it.lvl;
  if(it.slot==='weapon'){const cm={mage:.85,warrior:1.25,ranger:1}[it.cls];it.dmg=Math.round((3+l*1.7)*cm*m)}
  else if(it.slot==='armor')it.armor=Math.round((2+l*1.3)*m);
  it.price=Math.round((5+l*3)*Math.pow(it.rar+1,1.6))}
function starterWeapon(cls){const c=CLS[cls];return{uid:uid(),slot:'weapon',cls,rar:0,lvl:1,af:cls==='mage'?{spP:5}:{},dmg:c.w.dmg,name:c.w.n,base:c.w.n,price:3}}
function weaponIcon(cls){return{mage:'staff',warrior:'sword',ranger:'bow'}[cls]}
function itemIcon(it){if(it.slot==='potion')return ICON[it.kind==='hp'?'pot':'potmp'];if(it.slot==='weapon')return ICON[weaponIcon(it.cls)];return ICON[it.slot]}
function itemSpr(it){if(it.slot==='weapon')return SPR[weaponIcon(it.cls)];return SPR[it.slot]||SPR.ring}
function itemType(it){if(it.slot==='potion')return'зелье';if(it.slot==='weapon')return({mage:'посох мага',warrior:'оружие абордажника',ranger:'лук следопыта'})[it.cls];return SLOTN[it.slot].toLowerCase()}

/* ----- materials & crafting ----- */
const MATS={wood:{n:'Дерево',c:'#b07a40'},iron:{n:'Железо',c:'#a8aeb8'},hide:{n:'Шкура',c:'#d0a070'},pearl:{n:'Жемчуг',c:'#f4ecff'},crystal:{n:'Кристалл бури',c:'#8fe8ff'}};
const RECIPES=[
 {id:'weapon',n:'Выковать оружие',d:'Оружие твоего класса твоего уровня, не хуже необычного',cost:{iron:4,wood:2},gold:20},
 {id:'armor',n:'Сшить броню',d:'Броня твоего уровня, не хуже необычной',cost:{hide:5,iron:2},gold:20},
 {id:'jewel',n:'Огранить украшение',d:'Амулет или кольцо, часто редкие',cost:{pearl:3,crystal:1},gold:30},
 {id:'upgrade',n:'Закалить вещь',d:'Выбранная надетая вещь получает +2 к уровню и становится сильнее',cost:{iron:3,crystal:1},gold:40,sel:true},
 {id:'reroll',n:'Перековать свойства',d:'Свойства выбранной надетой вещи меняются случайно',cost:{crystal:2,pearl:1},gold:30,sel:true}
];
const SHIPUP=[
 {id:'sail',n:'Паруса',d:'Лодка плывёт на 20% быстрее',max:3,cost:l=>({wood:4+l*3,hide:2+l*2}),gold:l=>60+l*80},
 {id:'hull',n:'Обшивка',d:'В море ты получаешь на 15% меньше урона',max:3,cost:l=>({wood:4+l*2,iron:3+l*3}),gold:l=>80+l*90},
 {id:'cannon',n:'Пушки',d:'Лодка сама стреляет по морским тварям',max:3,cost:l=>({iron:5+l*3,crystal:1+l}),gold:l=>100+l*120}
];
/* ----- companions ----- */
const COMPS={
 parrot:{n:'Попугай Кеша',d:'Быстрый, клюёт врагов издалека.',spr:'parrot',hp:30,hpL:6,dmg:5,dmgL:1.6,range:80,kind:'ranged',cost:150},
 crab:{n:'Краб Клешня',d:'Очень крепкий, дерётся вплотную.',spr:'pcrab',hp:90,hpL:15,dmg:7,dmgL:1.9,range:14,kind:'melee',cost:200},
 healer:{n:'Знахарка Лея',d:'Лечит тебя в бою, сама бьёт слабо.',spr:'healer',hp:40,hpL:7,dmg:3,dmgL:.8,range:70,kind:'heal',cost:250},
 tim:{n:'Юнга Тим',d:'Стреляет из пистоля. Ты спас его у пиратов.',spr:'tim',hp:45,hpL:8,dmg:9,dmgL:2.3,range:100,kind:'ranged',cost:0,req:'tim'}
};
/* ----- talents ----- */
const TAL={
 mage:[
  {n:'Огонь',t:[{id:'m1',n:'Жар',k:'sk',sk:'fireball',v:12,d:'+12% к урону Огненного шара'},{id:'m2',n:'Пламя души',k:'stat',s:'spP',v:5,d:'+5% к силе магии'},{id:'m3',n:'Пироман',k:'stat',s:'crit',v:3,d:'+3% к шансу крита'},{id:'m4',n:'Гроза',k:'sk',sk:'meteor',v:15,d:'+15% к урону Удара шторма'}]},
  {n:'Вода',t:[{id:'m5',n:'Глубина',k:'stat',s:'mpP',v:8,d:'+8% к мане'},{id:'m6',n:'Приливы',k:'stat',s:'mpr',v:.3,d:'+0.3 маны в секунду'},{id:'m7',n:'Омут',k:'skc',sk:'frostring',v:12,d:'Водоворот перезаряжается на 12% быстрее'},{id:'m8',n:'Морская кожа',k:'stat',s:'armor',v:3,d:'+3 к броне'}]},
  {n:'Буря',t:[{id:'m9',n:'Посох бури',k:'atk',v:10,d:'+10% к урону посоха'},{id:'m10',n:'Разряд',k:'sk',sk:'chain',v:12,d:'+12% к урону Цепной молнии'},{id:'m11',n:'Буйство',k:'stat',s:'as',v:5,d:'+5% к скорости атаки'},{id:'m12',n:'Око шторма',k:'skc',sk:'meteor',v:10,d:'Удар шторма перезаряжается на 10% быстрее'}]}],
 warrior:[
  {n:'Клинок',t:[{id:'w1',n:'Заточка',k:'atk',v:10,d:'+10% к урону тесака'},{id:'w2',n:'Точный удар',k:'stat',s:'crit',v:3,d:'+3% к шансу крита'},{id:'w3',n:'Быстрая рука',k:'stat',s:'as',v:5,d:'+5% к скорости атаки'},{id:'w4',n:'Буря стали',k:'sk',sk:'whirl',v:15,d:'+15% к урону Вихря клинков'}]},
  {n:'Крепость',t:[{id:'w5',n:'Морская выносливость',k:'stat',s:'hpP',v:6,d:'+6% к здоровью'},{id:'w6',n:'Толстая кожа',k:'stat',s:'armor',v:3,d:'+3 к броне'},{id:'w7',n:'Бывалый',k:'stat',s:'dodge',v:2,d:'+2% к увороту'},{id:'w8',n:'Ещё кружку!',k:'skc',sk:'warcry',v:10,d:'Ром и ярость перезаряжается на 10% быстрее'}]},
  {n:'Порох',t:[{id:'w9',n:'Сухой порох',k:'sk',sk:'spark',v:20,d:'+20% к урону Огненной искры'},{id:'w10',n:'Запас',k:'stat',s:'mpP',v:10,d:'+10% к мане'},{id:'w11',n:'На абордаж!',k:'skc',sk:'dash',v:10,d:'Абордаж перезаряжается на 10% быстрее'},{id:'w12',n:'Канонир',k:'stat',s:'dmgP',v:4,d:'+4% ко всему урону'}]}],
 ranger:[
  {n:'Меткость',t:[{id:'r1',n:'Острый наконечник',k:'atk',v:10,d:'+10% к урону лука'},{id:'r2',n:'Глаз чайки',k:'stat',s:'crit',v:3,d:'+3% к шансу крита'},{id:'r3',n:'Веер',k:'sk',sk:'multi',v:12,d:'+12% к урону Веера стрел'},{id:'r4',n:'Ливень',k:'sk',sk:'rain',v:15,d:'+15% к урону Града стрел'}]},
  {n:'Ловкость',t:[{id:'r5',n:'Лёгкий шаг',k:'stat',s:'ms',v:4,d:'+4% к скорости бега'},{id:'r6',n:'Увёртливость',k:'stat',s:'dodge',v:3,d:'+3% к увороту'},{id:'r7',n:'Кувырок',k:'skc',sk:'roll',v:12,d:'Перекат перезаряжается на 12% быстрее'},{id:'r8',n:'Быстрая тетива',k:'stat',s:'as',v:5,d:'+5% к скорости атаки'}]},
  {n:'Природа',t:[{id:'r9',n:'Яд кобры',k:'sk',sk:'poison',v:15,d:'+15% к урону Ядовитой стрелы'},{id:'r10',n:'Знахарство',k:'stat',s:'hpP',v:5,d:'+5% к здоровью'},{id:'r11',n:'Дух леса',k:'stat',s:'spP',v:6,d:'+6% к силе магии'},{id:'r12',n:'Родник',k:'stat',s:'mpr',v:.2,d:'+0.2 маны в секунду'}]}]
};
