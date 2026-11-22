'use strict';
/* ===== dungeons, day/night, companions ===== */
const DAYLEN=420;
function nightF(){if(!G||G.clock==null)return 0;const c=G.clock%DAYLEN;if(c<240)return 0;if(c<285)return(c-240)/45;if(c<390)return 1;return 1-(c-390)/30}
function clockName(){const c=G.clock%DAYLEN;return c<240?'День':c<285?'Вечер':c<390?'Ночь':'Рассвет'}

/* ----- dungeons ----- */
function enterDungeon(id){const D0=DUNGEONS[id];
  if(D0.locked&&!G.gateOpen){say([{who:D0.n,text:'Вход запечатан. На камне пять пустых гнёзд в форме жемчужин.'}]);return}
  G.owPos={x:P.x,y:P.y+20};G.owFog=fogPack();G.wChests=CHESTS;G.wNpcs=NPCS;G.inDun=true;P.boat=false;
  const st=P.dun[id]||{};G.dun={id,floor:st.cleared?1:Math.max(1,st.floor||1)};buildFloor();sfx('boss')}
function buildFloor(){const d=G.dun,D0=DUNGEONS[d.id];DUNTHEME=D0.theme;genDungeon(d);renderWorld();buildMM();resetFog();
  enemies=[];proj=[];pickups=[];warns=[];zones=[];parts=[];G.boss=null;
  P.x=d.start.x;P.y=d.start.y;G.cx=P.x-VW/2;G.cy=P.y-VH/2;if(P.cmp){P.cmp.x=P.x;P.cmp.y=P.y}
  populateDun(d);G.regionCur=-1;
  toast(`${D0.n} · этаж ${d.floor} из ${D0.floors}`,'#e8dcc0');
  setTimeout(()=>{if(G.inDun&&d.plates.length)toast('Наступи на все каменные плиты, чтобы открыть дверь дальше','#c8ffb0')},2800);
  P.dun[d.id]=Object.assign(P.dun[d.id]||{},{floor:d.floor});save()}
function genDungeon(d){for(let k=0;k<12;k++){genDungeonOnce(d);if(dunOk(d))return}}
function dunOk(d){const seen=new Uint8Array(W*H),s=(d.start.y/16|0)*W+(d.start.x/16|0),q=[s];seen[s]=1;
  for(let h=0;h<q.length;h++){const i=q[h];for(const o of[1,-1,W,-W]){const j=i+o;if(seen[j])continue;const t=map[j];if(SOLID.has(t))continue;seen[j]=1;q.push(j)}}
  return d.plates.every(p=>seen[p.y*W+p.x])&&CHESTS.every(c=>seen[c.ty*W+c.tx])}
function genDungeonOnce(d){const R=mulberry32((Math.random()*1e9)|0),D0=DUNGEONS[d.id];
  map.fill(T.VOID);reg.fill(10);const AW=78,AH=58,rooms=[];
  for(let k=0;k<300&&rooms.length<9;k++){const w=7+((R()*7)|0),h=6+((R()*5)|0),x=3+((R()*(AW-w-6))|0),y=3+((R()*(AH-h-6))|0);
    if(rooms.some(r=>x<r.x+r.w+3&&x+w+3>r.x&&y<r.y+r.h+3&&y+h+3>r.y))continue;rooms.push({x,y,w,h,cx:x+(w>>1),cy:y+(h>>1)})}
  const ord=[rooms.shift()];while(rooms.length){const l=ord[ord.length-1];let bi=0,bd=1e9;rooms.forEach((r,i)=>{const dd=Math.abs(r.cx-l.cx)+Math.abs(r.cy-l.cy);if(dd<bd){bd=dd;bi=i}});ord.push(rooms.splice(bi,1)[0])}
  ord.forEach(r=>rect(r.x,r.y,r.x+r.w-1,r.y+r.h-1,T.FLOOR));
  for(let i=1;i<ord.length;i++){const a=ord[i-1],b=ord[i];const hx=R()<.5;
    if(hx){rect(Math.min(a.cx,b.cx),a.cy,Math.max(a.cx,b.cx),a.cy+1,T.FLOOR);rect(b.cx,Math.min(a.cy,b.cy),b.cx+1,Math.max(a.cy,b.cy),T.FLOOR)}
    else{rect(a.cx,Math.min(a.cy,b.cy),a.cx+1,Math.max(a.cy,b.cy),T.FLOOR);rect(Math.min(a.cx,b.cx),b.cy,Math.max(a.cx,b.cx),b.cy+1,T.FLOOR)}}
  const inRoom=(r,x,y)=>x>=r.x&&x<r.x+r.w&&y>=r.y&&y<r.y+r.h;
  const first=ord[0],last=ord[ord.length-1],mid=ord.slice(1,-1);
  const plates=[];
  if(mid.length>=2){for(let x=last.x-1;x<=last.x+last.w;x++)for(let y=last.y-1;y<=last.y+last.h;y++){if(inRoom(last,x,y))continue;if(map[y*W+x]===T.FLOOR&&!ord.slice(0,-1).some(r=>inRoom(r,x,y)))map[y*W+x]=T.DOOR}
    const np=Math.min(mid.length,2+(d.floor>1?1:0));const pr=[...mid].sort(()=>R()-.5).slice(0,np);
    pr.forEach(r=>{const x=r.x+1+((R()*(r.w-2))|0),y=r.y+1+((R()*(r.h-2))|0);map[y*W+x]=T.PLATE;plates.push({x,y})})}
  for(let y=1;y<H-1;y++)for(let x=1;x<W-1;x++){const i=y*W+x;if(map[i]!==T.FLOOR||inRoom(first,x,y)||inRoom(last,x,y))continue;if(R()<.035)map[i]=T.SPIKE}
  for(let y=1;y<H-1;y++)for(let x=1;x<W-1;x++){if(map[y*W+x]!==T.VOID)continue;let n=false;for(let dy=-1;dy<=1&&!n;dy++)for(let dx=-1;dx<=1;dx++){const t=map[(y+dy)*W+x+dx];if(t!==T.VOID&&t!==T.WALL){n=true;break}}if(n)map[y*W+x]=T.WALL}
  set(first.cx,first.cy,T.EXIT);
  const final=d.floor>=D0.floors;if(!final)set(last.cx,last.cy,T.STAIRS);
  const ch=[];[...mid].sort(()=>R()-.5).slice(0,1+(R()<.6?1:0)).forEach(r=>{const x=r.x+1,y=r.y+1;if(map[y*W+x]===T.FLOOR)ch.push({tx:x,ty:y,x:x*16+8,y:y*16+12,open:false,lvl:D0.lv[1]+ngOff(),dun:true})});
  CHESTS=ch;NPCS=[];
  Object.assign(d,{start:{x:first.cx*16+8,y:(first.cy+1)*16+8},rooms:ord,first,last,plates,doorsOpen:!plates.length,final,bossSpawned:false})}
function populateDun(d){const D0=DUNGEONS[d.id],lv=D0.lv[0]+d.floor-1+ngOff();
  d.rooms.forEach((r,i)=>{if(i===0)return;if(i===d.rooms.length-1&&d.final)return;const n=2+rint(2)+(d.floor>2?1:0);
    for(let k=0;k<n;k++){const x=(r.x+1+rint(r.w-2))*16+8,y=(r.y+1+rint(r.h-2))*16+8;if(blocked(x,y,6,'e'))continue;spawn(pickW(D0.foes),x,y,{lvl,elite:Math.random()<.14,reg:10})}})}
function dungeonTick(dt){const d=G.dun;if(!d)return;const tx=P.x/16|0,ty=P.y/16|0,t=at(tx,ty);
  if(t===T.PLATE){set(tx,ty,T.PLATEON);drawTile(wx,tx,ty);sfx('coin');text(P.x,P.y-22,'щёлк','#c8ffb0');
    if(!d.plates.some(p=>at(p.x,p.y)===T.PLATE)){for(let i=0;i<W*H;i++)if(map[i]===T.DOOR){map[i]=T.FLOOR;drawTile(wx,i%W,(i/W)|0)}d.doorsOpen=true;buildMM();sfx('rune');toast('Где-то с лязгом открылась дверь','#c8ffb0')}}
  if(t===T.SPIKE&&spikesUp()&&P.inv<=0&&P.dash<=0){hurtPlayer(Math.max(5,Math.round(P.S.maxHp*.1)),0,0)}
  const L=d.last;if(d.final&&!d.bossSpawned&&tx>=L.x&&tx<L.x+L.w&&ty>=L.y&&ty<L.y+L.h){d.bossSpawned=true;const D0=DUNGEONS[d.id];
    const b=spawn(D0.boss,L.cx*16+8,L.cy*16+8,{lvl:D0.lv[1]+1+ngOff(),wave:'dun_'+d.id});b.home={x:b.x,y:b.y};b.ag=true;b.cd=2;G.boss=b;sfx('boss');say(BOSS_INTRO[D0.boss]||[{who:FOES[D0.boss].n,text:'...'}])}}
const spikesUp=()=>(G.time%2.4)<.75;
function dunBossDown(e){const d=G.dun;if(!d)return;P.dun[d.id]=Object.assign(P.dun[d.id]||{},{cleared:true,floor:1});set(d.last.cx,d.last.cy,T.EXIT);drawTile(wx,d.last.cx,d.last.cy);buildMM();
  if(d.id==='temple'){G.won=true;G.winT=2.5;save();return}
  toast(`${DUNGEONS[d.id].n} пройдена! Выход появился в центре зала`,'#f2c14e');save()}
function exitDungeon(dead){DUNTHEME=null;G.inDun=false;genMap();if(G.gateOpen)openGate(true);renderWorld();buildMM();if(G.owFog)fogUnpack(G.owFog);
  CHESTS=G.wChests||CHESTS;NPCS=G.wNpcs||NPCS;enemies=[];proj=[];pickups=[];warns=[];zones=[];G.boss=null;G.dun=null;
  if(!dead&&G.owPos){P.x=G.owPos.x;P.y=G.owPos.y}if(P.cmp){P.cmp.x=P.x;P.cmp.y=P.y}populate();G.regionCur=-1;G.cx=P.x-VW/2;G.cy=P.y-VH/2;save()}

/* ----- companions ----- */
function spawnComp(){if(!P.comp){P.cmp=null;return}const C=COMPS[P.comp];P.cmp={id:P.comp,x:P.x-12,y:P.y,r:4,maxHp:Math.round(C.hp+C.hpL*(P.lvl-1)),hp:1,cd:0,down:0,fl:false,t:0};P.cmp.hp=P.cmp.maxHp}
const compDmg=()=>{const C=COMPS[P.comp];return C.dmg+C.dmgL*(P.lvl-1)};
function updateComp(dt){const c=P.cmp;if(!c)return;const C=COMPS[c.id];c.t+=dt;c.maxHp=Math.round(C.hp+C.hpL*(P.lvl-1));
  if(c.down>0){c.down-=dt;if(c.down<=0){c.hp=c.maxHp;c.x=P.x;c.y=P.y;text(P.x,P.y-24,C.n+' снова с тобой','#9fe08a')}return}
  if(P.boat){c.x=P.x;c.y=P.y;return}
  let tgt=null,bd=C.kind==='melee'?110:C.range+40;for(const e of enemies){if(e.dead)continue;const d=Math.hypot(e.x-c.x,e.y-c.y);if(d<bd&&Math.hypot(e.x-P.x,e.y-P.y)<190){bd=d;tgt=e}}
  let gx=P.x-P.fx*16,gy=P.y-P.fy*16+4;if(tgt&&(C.kind==='melee'||bd>C.range)){gx=tgt.x;gy=tgt.y}
  const dx=gx-c.x,dy=gy-c.y,d=Math.hypot(dx,dy);if(d>6){const sp=d>120?170:90;moveEnt(c,dx/d*sp*dt,dy/d*sp*dt,'c');if(Math.abs(dx)>1)c.fl=dx<0}
  if(Math.hypot(c.x-P.x,c.y-P.y)>240){c.x=P.x;c.y=P.y}
  c.cd-=dt;
  if(C.kind==='heal'){if(c.cd<=0&&P.hp<P.S.maxHp*.8){c.cd=3.2;const v=Math.round(P.S.maxHp*.08+P.lvl);P.hp=Math.min(P.S.maxHp,P.hp+v);text(P.x,P.y-22,'+'+v,'#7fe07a');burst(P.x,P.y-6,'#7fe07a',10,40,.6)}
    else if(c.cd<=0&&tgt&&bd<C.range){c.cd=1.4;shootC(c,tgt,'arcane')}}
  else if(tgt&&c.cd<=0){if(C.kind==='melee'&&bd<c.r+tgt.r+8){c.cd=.9;const ux=(tgt.x-c.x)/(bd||1),uy=(tgt.y-c.y)/(bd||1);dealDamage(tgt,compDmg(),'comp',ux,uy)}
    else if(C.kind==='ranged'&&bd<C.range){c.cd=c.id==='parrot'?.7:1.1;shootC(c,tgt,c.id==='tim'?'pbullet':'peck')}}
  for(const e of enemies){if(e.dead)continue;if(Math.hypot(e.x-c.x,e.y-c.y)<e.r+c.r+4){e.cTick=(e.cTick||0)-dt;if(e.cTick<=0){e.cTick=1.3;hurtComp(e.dmg*.7)}}}}
function shootC(c,t,kind){const a=Math.atan2(ecy(t)-(c.y-4),t.x-c.x);proj.push({x:c.x,y:c.y-4,vx:Math.cos(a)*220,vy:Math.sin(a)*220,life:.8,owner:'p',kind,dmg:compDmg(),r:2,comp:true})}
function hurtComp(d){const c=P.cmp;if(!c||c.down>0)return;const dd=Math.max(1,Math.round(d));c.hp-=dd;text(c.x,c.y-14,'-'+dd,'#ff9a8a');
  if(c.hp<=0){c.down=25;burst(c.x,c.y-4,'#c9c2b2',10,40,.5);toast(COMPS[c.id].n+' без сил. Вернётся через 25 секунд')}}
