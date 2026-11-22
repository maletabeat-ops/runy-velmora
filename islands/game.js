'use strict';
/* ===== game: state, stats, combat, player, skills, save ===== */
const G={state:'title',time:0,quest:0,shake:0,spawnT:0,kills:0,gateOpen:false,bossSpawned:false,won:false,winT:0,dark:0,near:null,cx:0,cy:0,smoke:0,mouseT:-99,mx:0,my:0,boss:null,regionCur:-1,saveT:0,fogT:0,amb:0};
let P=null,enemies=[],proj=[],pickups=[],parts=[],texts=[],rings=[],bolts=[],warns=[],zones=[],trails=[],SHRINES=[],NPCS=[],CHESTS=[];
const SK='velmor2_save';
const xpNeed=l=>Math.round(35*Math.pow(l,1.7));let MAXLV=30;
const ecy=e=>e.y-(e.f.big?12:4);
const regLv=ri=>{const R=REGIONS[ri];return (R&&R.lv?Math.round((R.lv[0]+R.lv[1])/2):3)+ngOff()};
const ngOff=()=>(G.ng||0)*8;
const seaLv=(x,y)=>clamp(2+Math.round(Math.hypot(x/16-HOME.x,y/16-HOME.y)/6),2,22)+ngOff();

function newGame(cls,race){
  genMap();renderWorld();buildMM();resetFog();
  P={cls,race:race||'human',hitN:0,gcd:0,emberT:0,boat:false,cannonT:0,ship:{sail:0,hull:0,cannon:0},mats:{wood:0,iron:0,hide:0,pearl:0,crystal:0},tal:{},comp:null,comps:[],q:{lh:0,pr:0,bp:0},dun:{},x:SPAWN.x,y:SPAWN.y,r:5,lvl:1,xp:0,gold:20,hp:1,mp:1,fx:1,fy:0,fl:false,cd:{atk:0,pot:0},scd:[0,0,0,0],inv:0,swing:null,kx:0,ky:0,moving:false,anim:0,dash:0,dhit:null,buff:0,slowT:0,poison:0,pdps:0,ptk:0,denyT:0,
    bag:[],eq:{weapon:starterWeapon(cls),armor:null,amulet:null,ring:null},pots:{hp:3,mp:2},runes:{tide:false,mire:false,gold:false,frost:false,fire:false},bounty:{i:0,active:false,prog:0},stock:[],stockLvl:0};
  recalc();P.hp=P.S.maxHp;P.mp=P.S.maxMp;
  enemies=[];proj=[];pickups=[];parts=[];texts=[];rings=[];bolts=[];warns=[];zones=[];trails=[];
  SHRINES=SHRINE_DEF.map(s=>({...s,done:false,active:false}));
  NPCS=NPC_DEF.map(n=>({...n,x:n.x||n.hx*16+32,y:n.y||(n.hy+3)*16+8}));
  CHESTS=CHEST_POS.map(([x,y])=>({tx:x,ty:y,x:x*16+8,y:y*16+12,open:false,lvl:regLv(RG(x,y))}));
  Object.assign(G,{time:0,clock:60,quest:0,shake:0,spawnT:2,kills:0,gateOpen:false,bossSpawned:false,won:false,winT:0,dark:0,near:null,boss:null,regionCur:-1,saveT:0,inDun:false});MAXLV=30+(G.ng||0)*10;
  G.cx=P.x-VW/2;G.cy=P.y-VH/2;reveal(P.x/16|0,P.y/16|0,9);
  populate();
}
function populate(){REGIONS.forEach((R,ri)=>{if(!R.cap||R.sea)return;for(let i=0;i<R.cap;i++)spawnInRegion(ri,220)})}
function spawnInRegion(ri,minD){const R=REGIONS[ri],L=REGTILES[ri];if(!L||!L.length)return false;const night=nightF()>.5;
  for(let i=0;i<30;i++){const idx=L[rint(L.length)],tx=idx%W,ty=(idx/W)|0;if(inVil(tx,ty))continue;
    const x=tx*16+8,y=ty*16+8;if(Math.hypot(x-P.x,y-P.y)<minD||blocked(x,y,6,'e'))continue;
    const type=night&&Math.random()<.2&&ri!==9?'ghost':pickW(R.foes),lvl=R.lv[0]+rint(R.lv[1]-R.lv[0]+1)+ngOff()+(night?1:0),el=Math.random()<(night?.18:.1);
    spawn(type,x,y,{lvl,elite:el,reg:ri});
    if(FOES[type].pack)for(let k=0;k<1+rint(2);k++){const ax=x+rr(20),ay=y+rr(20);if(!blocked(ax,ay,6,'e'))spawn(type,ax,ay,{lvl,reg:ri})}
    return true}return false}
function spawnSea(){let n=0;for(const e of enemies)if(e.reg===9)n++;const cap=REGIONS[9].cap+(nightF()>.5?(P.q.lh===2?6:3):0)-(P.q.lh===1&&Math.hypot(P.x/16-HOME.x,P.y/16-HOME.y)<40?4:0);if(n>=cap)return;
  for(let i=0;i<20;i++){const a=Math.random()*6.283,r=230+Math.random()*220,x=P.x+Math.cos(a)*r,y=P.y+Math.sin(a)*r,tx=x/16|0,ty=y/16|0;if(at(tx,ty)!==T.WATER)continue;
    const lv=seaLv(x,y);spawn(pickW(REGIONS[9].foes),tx*16+8,ty*16+8,{lvl:lv,reg:9,elite:Math.random()<.08});return}}
function spawn(type,x,y,o={}){const f=FOES[type],lvl=o.lvl||1,el=!!o.elite;
  const ng=G.ng||0,hs=f.boss?1+.7*ng:(1+.45*(lvl-1)),ds=f.boss?1+.35*ng:(1+.3*(lvl-1));
  const e={type,f,x,y,r:f.small?4:f.r,lvl,elite:el,hp:Math.round(f.hp*hs*(el?2.6:1)),dmg:Math.round(f.dmg*ds*(el?1.3:1)),spd:f.spd*(el?1.1:1),xp:Math.round(f.xp*(f.boss?1:lvl)*(el?3:1)),
    kx:0,ky:0,flash:0,slow:0,slowF:.45,poison:0,pdps:0,ptk:0,cd:1+Math.random(),acd:0,sc:6,tp:4,wind:0,leap:0,t:Math.random()*3,wt:0,wdir:null,fl:false,ag:false,
    wave:o.wave||null,reg:o.reg??-1,side:Math.random()<.5?-1:1,hx:x,hy:y};
  e.maxHp=e.hp;enemies.push(e);return e}

/* ----- stats ----- */
function recalc(){const c=CLS[P.cls];
  const S={maxHp:c.hp+c.hpL*(P.lvl-1),maxMp:c.mp+c.mpL*(P.lvl-1),armor:c.armor+c.armL*(P.lvl-1),sp:c.sp*(1+.06*(P.lvl-1)),wdmg:2,dmgP:0,spP:0,crit:c.crit,as:0,ms:0,mpr:c.mpr+P.lvl*.04,ls:0,dodge:0,fx:new Set()};
  const rb=(RACES[P.race]||RACES.human).b;S.dmgP+=rb.dmgP||0;S.crit+=rb.crit||0;S.ms+=rb.ms||0;S.armor+=rb.armor||0;S.dodge+=rb.dodge||0;S.mpr+=rb.mpr||0;S.swim=!!rb.swim;
  S.skD={};S.skC={};S.atkP=0;let thp=0,tmp=0;(TAL[P.cls]||[]).forEach(br=>br.t.forEach(t=>{const r=P.tal[t.id]||0;if(!r)return;const v=t.v*r;
    if(t.k==='stat'){if(t.s==='hpP')thp+=v;else if(t.s==='mpP')tmp+=v;else S[t.s]+=v}else if(t.k==='sk')S.skD[t.sk]=(S.skD[t.sk]||0)+v;else if(t.k==='skc')S.skC[t.sk]=(S.skC[t.sk]||0)+v;else if(t.k==='atk')S.atkP+=v}));
  for(const s of SLOTS){const it=P.eq[s];if(!it)continue;if(it.dmg)S.wdmg=it.dmg;if(it.armor)S.armor+=it.armor;
    for(const k in it.af){const v=it.af[k];if(k==='hp')S.maxHp+=v;else if(k==='mp')S.maxMp+=v;else S[k]+=v}if(it.fx)S.fx.add(it.fx)}
  if(P.runes.mire)S.maxHp*=1.12;if(P.runes.fire)S.dmgP+=10;if(P.runes.tide){S.as+=8;S.ms+=4}if(P.runes.gold){S.crit+=5}if(P.runes.frost){S.armor+=5;S.dodge+=3}
  S.maxHp*=1+((rb.hpP||0)+thp)/100;S.maxMp*=1+((rb.mpP||0)+tmp)/100;
  if(S.fx.has('blackpearl')){S.dmgP+=30;S.maxHp*=.85}if(P.q.bp===3){S.maxHp*=1.1;S.hpr=1}
  if(P.buff>0){S.dmgP+=40;S.armor+=10}
  S.wdmg*=1+.035*(P.lvl-1);S.sp*=1+S.spP/100;
  S.maxHp=Math.round(S.maxHp);S.maxMp=Math.round(S.maxMp);S.armor=Math.round(S.armor);
  P.S=S;P.hp=Math.min(P.hp,S.maxHp);P.mp=Math.min(P.mp,S.maxMp)}

/* ----- fx helpers ----- */
function burst(x,y,col,n,spd,life,size=1,g=0){for(let i=0;i<n;i++){const a=Math.random()*6.283,s=spd*(.3+Math.random()*.7);parts.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,life:life*(.5+Math.random()*.5),max:life,col,size,g})}}
function text(x,y,s,col,big){texts.push({x,y,s:String(s),col,life:.9,big})}
let toastTO;function toast(s,col){const t=$('toast');t.textContent=s;t.style.color=col||'';t.classList.add('on');clearTimeout(toastTO);toastTO=setTimeout(()=>t.classList.remove('on'),2600)}
function deny(msg){if(P.denyT>0)return false;P.denyT=.7;text(P.x,P.y-24,msg,'#c9b8d8');sfx('deny');return false}
function warn(w){w.max=w.t;warns.push(w)}
function forNear(x,y,r,fn){for(const e of enemies)if(!e.dead&&Math.hypot(e.x-x,ecy(e)-y)<r+e.r)fn(e)}

/* ----- combat ----- */
function dealDamage(e,amt,kind,dx=0,dy=0){
  if(e.dead)return;const S=P.S;let d=amt*(G.skMul||1)*(1+S.dmgP/100);const crit=kind!=='dot'&&Math.random()*100<S.crit;if(crit)d*=1.8;
  d=Math.max(1,Math.round(d*(.9+Math.random()*.2)));e.hp-=d;
  if(kind!=='dot'){e.flash=.1;const kb=e.f.boss?0:e.f.big?50:120;e.kx=dx*kb;e.ky=dy*kb;e.ag=true}
  text(e.x+rr(4),ecy(e)-10,crit?d+'!':d,kind==='dot'?'#9fe060':crit?'#ffd34a':'#fff3c4',crit);
  if(kind!=='dot'){burst(e.x,ecy(e),'#ffffff',3,40,.25);sfx('hit')}
  if(S.ls&&kind!=='dot'&&kind!=='comp')P.hp=Math.min(S.maxHp,P.hp+d*S.ls/100);
  if(P.runes.frost&&kind!=='dot'&&Math.random()<.15)e.slow=Math.max(e.slow,1.5);
  if(kind==='melee'&&P.cls==='warrior')P.mp=Math.min(S.maxMp,P.mp+1);
  if(S.fx.has('storm')&&(kind==='melee'||kind==='proj')&&++P.hitN%5===0){let b=null,bd=90;for(const o of enemies){if(o===e||o.dead)continue;const dd=Math.hypot(o.x-e.x,o.y-e.y);if(dd<bd){bd=dd;b=o}}if(b){bolts.push({pts:[{x:e.x,y:ecy(e)},{x:b.x,y:ecy(b)}],life:.25});sfx('zap');setTimeout(()=>dealDamage(b,S.wdmg*.8,'spell'),0)}}
  if(e.hp<=0)kill(e)}
function hurtPlayer(d,ux,uy,src){
  if(P.inv>0||P.dash>0||G.state!=='play')return false;if(Math.random()*100<P.S.dodge){P.inv=.25;text(P.x,P.y-22,'уворот','#e8e4da');return false}const red=Math.min(.85,P.S.armor/(P.S.armor+80)+(P.boat?P.ship.hull*.15:0));const dd=Math.max(1,Math.round(d*(1-red)));
  P.hp-=dd;P.inv=.4;if(src&&src._e&&src._e.f.chill)P.slowT=Math.max(P.slowT,1);P.kx=ux*150;P.ky=uy*150;G.shake=.22;sfx('hurt');text(P.x,P.y-20,'-'+dd,'#ff6a5a');burst(P.x,P.y-6,'#e0402e',6,50,.4);
  if(src&&src.melee&&P.S.fx.has('thorns')&&src._e&&!src._e.dead)dealDamage(src._e,dd*.4,'dot');
  if(P.hp<=0){P.hp=0;die()}return true}
function kill(e){if(e.dead)return;e.dead=true;G.kills++;
  burst(e.x,ecy(e),'#ffffff',10,70,.5);burst(e.x,ecy(e),e.elite?'#f2c14e':'#9a8fa8',8,40,.6);
  let xp=e.xp;if(e.lvl<P.lvl-4&&!e.f.boss)xp=Math.round(xp*.3);gainXp(xp);text(e.x,ecy(e)-18,'+'+xp+' опыта','#b4ec8a');
  if(P.S.fx.has('soul'))P.mp=Math.min(P.S.maxMp,P.mp+4);
  const b=P.bounty;if(b.active&&b.prog<BOUNTIES[b.i].n&&BOUNTIES[b.i].foes.includes(e.type)){b.prog++;if(b.prog>=BOUNTIES[b.i].n)toast('Задание выполнено! Возвращайся к Таре.','#f2c14e')}
  if(e.f.split)for(let k=0;k<2;k++){const m=spawn('mini',e.x+rr(8),e.y+rr(8),{lvl:Math.max(1,e.lvl-1),reg:-1,wave:e.wave});m.ag=true}
  loot(e);if(e.f.boss)bossDown(e)}
function loot(e){const lv=e.lvl,boss=e.f.boss;
  const g=Math.round((1+Math.random()*2)*lv*(e.elite?3:1)*(boss?12:1));const piles=boss?6:1+rint(2);
  for(let i=0;i<piles;i++)pickups.push({k:'gold',v:Math.max(1,Math.round(g/piles)),x:e.x+rr(8),y:e.y+rr(6),t:0});
  if(e.f.mat)for(const m in e.f.mat)if(Math.random()<(boss?1:e.elite?.7:.3))pickups.push({k:'mat',m,v:e.f.mat[m]*(boss?5:1)*(e.elite?2:1),x:e.x+rr(6),y:e.y+rr(6),t:0});
  if(boss)['iron','crystal','pearl'].forEach(m=>pickups.push({k:'mat',m,v:3+rint(4),x:e.x+rr(10),y:e.y+rr(10),t:0}));
  if(Math.random()<.04||boss)pickups.push({k:'pot',kind:'hp',x:e.x+rr(6),y:e.y+rr(6),t:0});
  if(Math.random()<.04||boss)pickups.push({k:'pot',kind:'mp',x:e.x+rr(6),y:e.y+rr(6),t:0});
  if(boss){dropItem(genItem(lv,{bias:2,minRar:3,src:e.type}),e.x,e.y);dropItem(genItem(lv,{bias:2,minRar:2}),e.x,e.y);dropItem(genItem(lv,{bias:1}),e.x,e.y);
    if(e.type==='lich')dropItem(genItem(lv,{rarity:4,slot:'ring',src:'lich'}),e.x,e.y)}
  else if(Math.random()<(e.elite?.65:.11))dropItem(genItem(lv,{bias:e.elite?1:0}),e.x,e.y)}
function dropItem(it,x,y){pickups.push({k:'item',it,x:x+rr(12),y:y+rr(10),t:0});if(it.rar===4)sfx('legend')}
function gainXp(n){if(P.lvl>=MAXLV)return;P.xp+=n;while(P.xp>=xpNeed(P.lvl)&&P.lvl<MAXLV){P.xp-=xpNeed(P.lvl);P.lvl++;recalc();P.hp=P.S.maxHp;P.mp=P.S.maxMp;
  burst(P.x,P.y-6,'#f2c14e',26,80,.8);text(P.x,P.y-28,'НОВЫЙ УРОВЕНЬ','#f2c14e',true);sfx('lvl');
  const sk=CLS[P.cls].sk.find(s=>s.lv===P.lvl);toast(sk?`Уровень ${P.lvl}! Новое умение: ${sk.n}`:`Уровень ${P.lvl}! Ты стал сильнее.`);save()}}

/* ----- aiming ----- */
function aim(){
  if(G.time-G.mouseT<4){const dx=G.mx-P.x,dy=G.my-(P.y-5),d=Math.hypot(dx,dy)||1;return{x:dx/d,y:dy/d}}
  let best=null,bs=1e9;for(const e of enemies){if(e.dead)continue;const dx=e.x-P.x,dy=ecy(e)-(P.y-5),d=Math.hypot(dx,dy);if(d>175||d<1)continue;
    const dot=(dx*P.fx+dy*P.fy)/d;if(dot<.2&&d>40)continue;const s=d*(1.8-dot);if(s<bs){bs=s;best={x:dx/d,y:dy/d}}}
  return best||{x:P.fx,y:P.fy}}
function targetPoint(maxD,defD){
  if(G.time-G.mouseT<4){const dx=G.mx-P.x,dy=G.my-P.y,d=Math.hypot(dx,dy)||1,k=Math.min(d,maxD);return{x:P.x+dx/d*k,y:P.y+dy/d*k}}
  const a=aim();let best=null,bd=maxD;for(const e of enemies){if(e.dead)continue;const d=Math.hypot(e.x-P.x,e.y-P.y);const dot=((e.x-P.x)*a.x+(e.y-P.y)*a.y)/(d||1);if(d<bd&&dot>.5){bd=d;best=e}}
  return best?{x:best.x,y:ecy(best)}:{x:P.x+a.x*defD,y:P.y-5+a.y*defD}}

/* ----- attacks & skills ----- */
function face(a){P.fx=a.x;P.fy=a.y;if(Math.abs(a.x)>.15)P.fl=a.x<0}
function melee(range,dotMin,dmg,a){for(const e of enemies){if(e.dead)continue;const dx=e.x-P.x,dy=ecy(e)-(P.y-5),d=Math.hypot(dx,dy)||1;
  if(d<range+e.r){const dot=(dx*a.x+dy*a.y)/d;if(dot>dotMin||d<11)dealDamage(e,dmg,'melee',dx/d,dy/d)}}}
function arrow(ang,dmg,o={}){const c=Math.cos(ang),s=Math.sin(ang),pierce=o.pierce||P.S.fx.has('pierce');
  proj.push({x:P.x+c*6,y:P.y-5+s*6,vx:c*240,vy:s*240,life:.85,owner:'p',kind:o.kind||'arrow',dmg,r:2,pierce,hit:new Set(),poison:o.poison,pdps:o.pdps,slow:P.S.fx.has('pierce')})}
function basicAttack(){P.gcd=.2;const S=P.S,as=1+S.as/100,a=aim();face(a);
  if(P.cls==='mage'){P.cd.atk=.42/as;proj.push({x:P.x+a.x*8,y:P.y-8+a.y*6,vx:a.x*215,vy:a.y*215,life:.55,owner:'p',kind:'arcane',dmg:S.wdmg*(.7+.3*S.sp),r:3});sfx('zap')}
  else if(P.cls==='warrior'){P.cd.atk=.5/as;P.swing={t:.2,max:.2,r:17,w:1.5,a};melee(25,-.15,S.wdmg,a);sfx('swing');
    if(S.fx.has('wave'))proj.push({x:P.x+a.x*8,y:P.y-5+a.y*8,vx:a.x*200,vy:a.y*200,life:.5,owner:'p',kind:'wave',dmg:S.wdmg*.6,r:6,pierce:true,hit:new Set()})}
  else{P.cd.atk=.46/as;arrow(Math.atan2(a.y,a.x),S.wdmg);sfx('bow')}}
function useSkill(i){const sk=CLS[P.cls].sk[i];if(!sk)return;if(P.lvl<sk.lv)return deny(`откроется на ${sk.lv} ур.`);if(P.scd[i]>0||P.gcd>0)return;
  const free=P.S.fx.has('freecast')&&Math.random()<.25;if(!free&&P.mp<sk.mp)return deny('мало маны');
  if(withMul(1+(P.S.skD[sk.id]||0)/100,SKILL[sk.id])===false)return;if(!free)P.mp-=sk.mp;else text(P.x,P.y-26,'бесплатно!','#c48aff');P.scd[i]=sk.cd*(1-Math.min(60,P.S.skC[sk.id]||0)/100);P.gcd=.35;P.cd.atk=Math.max(P.cd.atk,.3)}
function withMul(m,fn){const n0=proj.length,w0=warns.length,z0=zones.length;G.skMul=m;let r;try{r=fn()}finally{G.skMul=1}
  for(let i=n0;i<proj.length;i++)proj[i].dmg*=m;for(let i=w0;i<warns.length;i++){const w=warns[i],f=w.fn;if(f)w.fn=()=>{G.skMul=m;try{f()}finally{G.skMul=1}}}for(let i=z0;i<zones.length;i++)zones[i].mul=m;return r}
const SKILL={
  fireball(){const a=aim();face(a);sfx('fire');proj.push({x:P.x+a.x*6,y:P.y-5+a.y*6,vx:a.x*185,vy:a.y*185,life:1,owner:'p',kind:'fire',dmg:11*P.S.sp,r:3,aoe:24})},
  frostring(){sfx('nova');rings.push({x:P.x,y:P.y-4,r:4,max:58,life:.45,col:'150,235,255'});G.shake=.12;burst(P.x,P.y-4,'#8fe8ff',24,110,.5);
    forNear(P.x,P.y-4,58,e=>{const dx=e.x-P.x,dy=e.y-P.y,d=Math.hypot(dx,dy)||1;dealDamage(e,9*P.S.sp,'spell',dx/d,dy/d);e.slow=Math.max(e.slow,3);e.slowF=.25})},
  chain(){let from={x:P.x,y:P.y-5};const hitS=new Set(),pts=[from];
    for(let j=0;j<5;j++){let best=null,bd=j?90:150;for(const e of enemies){if(e.dead||hitS.has(e))continue;const d=Math.hypot(e.x-from.x,ecy(e)-from.y);if(d<bd){bd=d;best=e}}
      if(!best)break;hitS.add(best);const p={x:best.x,y:ecy(best)};pts.push(p);dealDamage(best,15*P.S.sp*(1-j*.1),'spell');best.slow=Math.max(best.slow,.5);from=p}
    if(pts.length<2)return deny('нет целей');bolts.push({pts,life:.25});sfx('zap')},
  meteor(){const t=targetPoint(150,70);sfx('fire');warn({kind:'circle',x:t.x,y:t.y,r:50,t:.75,friendly:true,fn:()=>{G.shake=.4;sfx('boom');burst(t.x,t.y,'#ff9a4a',40,120,.7,2);burst(t.x,t.y,'#ffe08a',20,60,.5);rings.push({x:t.x,y:t.y,r:5,max:52,life:.35,col:'255,150,70'});
    forNear(t.x,t.y,52,e=>{const dx=e.x-t.x,dy=e.y-t.y,d=Math.hypot(dx,dy)||1;dealDamage(e,44*P.S.sp,'spell',dx/d,dy/d)})}})},
  spark(){const a=aim();face(a);sfx('fire');proj.push({x:P.x+a.x*6,y:P.y-5+a.y*6,vx:a.x*190,vy:a.y*190,life:.8,owner:'p',kind:'spark',dmg:12*P.S.sp,r:2})},
  dash(){const a=aim();face(a);P.dash=.2;P.dvx=a.x*360;P.dvy=a.y*360;P.dhit=new Set();sfx('swing')},
  whirl(){sfx('swing');P.swing={t:.3,max:.3,r:20,w:7,a:{x:P.fx,y:P.fy},spin:true};rings.push({x:P.x,y:P.y-4,r:6,max:40,life:.3,col:'242,193,78'});G.shake=.1;
    forNear(P.x,P.y-4,38,e=>{const dx=e.x-P.x,dy=e.y-P.y,d=Math.hypot(dx,dy)||1;dealDamage(e,P.S.wdmg*1.7,'melee',dx/d*1.6,dy/d*1.6)})},
  warcry(){P.buff=8;recalc();P.hp=Math.min(P.S.maxHp,P.hp+P.S.maxHp*.25);sfx('rune');burst(P.x,P.y-6,'#ff6a5a',30,90,.7);rings.push({x:P.x,y:P.y-4,r:6,max:50,life:.4,col:'255,106,90'});text(P.x,P.y-28,'ЗА ВЕЛЬМОР!','#ff8a7a',true)},
  multi(){const a=aim();face(a);const b=Math.atan2(a.y,a.x);for(let i=-2;i<=2;i++)arrow(b+i*.16,P.S.wdmg*.75);sfx('bow')},
  roll(){let a={x:P.fx,y:P.fy};P.dash=.24;P.dvx=a.x*300;P.dvy=a.y*300;P.dhit=null;P.inv=Math.max(P.inv,.3);sfx('swing')},
  poison(){const a=aim();face(a);arrow(Math.atan2(a.y,a.x),P.S.wdmg*1.2,{pierce:true,poison:4,pdps:3*P.S.sp+P.S.wdmg*.35,kind:'parrow'});sfx('bow')},
  rain(){const t=targetPoint(160,80);zones.push({x:t.x,y:t.y,r:46,t:2.2,tick:0});sfx('bow')}
};
function usePotion(k){if(P.cd.pot>0)return;if(P.pots[k]<=0)return deny('нет зелий');
  if(k==='hp'){if(P.hp>=P.S.maxHp)return deny('здоровье полное');const v=Math.round(P.S.maxHp*.35);P.hp=Math.min(P.S.maxHp,P.hp+v);text(P.x,P.y-22,'+'+v,'#ff8a7a');burst(P.x,P.y-6,'#ff8a7a',14,40,.6)}
  else{if(P.mp>=P.S.maxMp)return deny('мана полная');const v=Math.round(P.S.maxMp*.4);P.mp=Math.min(P.S.maxMp,P.mp+v);text(P.x,P.y-22,'+'+v,'#8fb4ff');burst(P.x,P.y-6,'#8fb4ff',14,40,.6)}
  P.pots[k]--;P.cd.pot=1;sfx('heal')}

/* ----- collision ----- */
function solidAt(x,y,mode){const tx=Math.floor(x/TS),ty=Math.floor(y/TS);if(tx<0||ty<0||tx>=W||ty>=H)return true;const t=map[ty*W+tx];
  if(mode==='proj')return PSOLID.has(t);if(mode==='boat')return!BOATOK.has(t);if(mode==='sea')return t!==T.WATER;
  if(mode==='ghost')return tx<1||ty<1||tx>=W-1||ty>=H-1||inVil(tx,ty)||t===T.WATER||t===T.VOID;
  if(SOLID.has(t))return true;if(mode==='e'&&inVil(tx,ty)&&!G.inDun)return true;return false}
function blocked(x,y,r,mode){
  if(solidAt(x-r,y-r,mode)||solidAt(x+r,y-r,mode)||solidAt(x-r,y+r,mode)||solidAt(x+r,y+r,mode))return true;
  if(mode==='p'&&!P.boat){for(const n of NPCS)if(Math.abs(n.x-x)<9&&Math.abs(n.y-y)<7)return true;for(const c of CHESTS)if(Math.abs(c.x-x)<10&&Math.abs(c.y-2-y)<7)return true}
  return false}
function moveEnt(e,dx,dy,mode){const st=Math.ceil(Math.max(Math.abs(dx),Math.abs(dy))/4)||1,sx=dx/st,sy=dy/st;
  for(let i=0;i<st;i++){if(!blocked(e.x+sx,e.y,e.r,mode))e.x+=sx;if(!blocked(e.x,e.y+sy,e.r,mode))e.y+=sy}}

/* ----- player update ----- */
const keys={},actQ=new Set(),joy={x:0,y:0,id:null,ox:0,oy:0};let touchAtk=false;
function updatePlayer(dt){
  let mx=0,my=0;if(held('left'))mx--;if(held('right'))mx++;if(held('up'))my--;if(held('down'))my++;
  mx+=joy.x;my+=joy.y;let l=Math.hypot(mx,my);if(l>1){mx/=l;my/=l;l=1}
  P.moving=l>.2;if(P.moving&&!P.dash){P.fx=mx/l;P.fy=my/l;if(Math.abs(P.fx)>.2)P.fl=P.fx<0;P.anim+=dt}
  const S=P.S,tt=at(P.x/16|0,P.y/16|0),mud=tt===T.MUD||(tt===T.SHALLOW&&!S.swim&&!P.boat);const sp=P.boat?110*(1+.2*P.ship.sail):CLS[P.cls].ms*(1+S.ms/100)*(P.slowT>0?.55:1)*(mud?.7:1);
  if(P.dash>0){P.dash-=dt;moveEnt(P,P.dvx*dt,P.dvy*dt,'p');trails.push({x:P.x,y:P.y,fl:P.fl,life:.25});
    if(P.dhit)for(const e of enemies)if(!e.dead&&!P.dhit.has(e)&&Math.hypot(e.x-P.x,e.y-P.y)<e.r+12){P.dhit.add(e);dealDamage(e,S.wdmg*1.4,'melee',P.fx,P.fy)}}
  else{const bx=P.x,by=P.y;moveEnt(P,mx*sp*dt+P.kx*dt,my*sp*dt+P.ky*dt,P.boat?'boat':'p');
    if(P.moving&&Math.hypot(P.x-bx,P.y-by)<.25*sp*dt){const nx=P.x+P.fx*11,ny=P.y+P.fy*11,t=at(nx/16|0,ny/16|0);
      if(!P.boat&&t===T.WATER&&!G.inDun&&!blocked(nx,ny,5,'boat')){P.boat=true;P.x=nx;P.y=ny;sfx('swing');text(P.x,P.y-20,'на борт!','#8fe8ff')}
      else if(P.boat&&!SOLID.has(t)&&t!==T.WATER&&!blocked(nx,ny,5,'p')){P.boat=false;P.x=nx;P.y=ny;sfx('swing')}}}
  if(P.boat&&P.ship.cannon>0){P.cannonT-=dt;if(P.cannonT<=0){let b=null,bd=160;for(const e of enemies)if(!e.dead&&e.f.sea){const d=Math.hypot(e.x-P.x,e.y-P.y);if(d<bd){bd=d;b=e}}
    if(b){P.cannonT=1.8;const a=Math.atan2(ecy(b)-P.y,b.x-P.x);proj.push({x:P.x,y:P.y-4,vx:Math.cos(a)*230,vy:Math.sin(a)*230,life:1,owner:'p',kind:'cannon',dmg:(8+P.lvl*2.5)*P.ship.cannon,r:3,aoe:18});sfx('boom')}}}
  const dec=Math.min(1,dt*10);P.kx-=P.kx*dec;P.ky-=P.ky*dec;
  for(const k in P.cd)P.cd[k]=Math.max(0,P.cd[k]-dt);for(let i=0;i<4;i++)P.scd[i]=Math.max(0,P.scd[i]-dt);
  P.gcd-=dt;P.inv-=dt;P.denyT-=dt;P.slowT-=dt;if(P.swing){P.swing.t-=dt;if(P.swing.t<=0)P.swing=null}
  if(P.buff>0){P.buff-=dt;if(P.buff<=0)recalc()}
  if(P.poison>0){P.poison-=dt;P.ptk-=dt;if(P.ptk<=0){P.ptk=.5;P.hp-=P.pdps*.5;text(P.x,P.y-18,'-'+Math.ceil(P.pdps*.5),'#9fe060');if(P.hp<=0){P.hp=0;die();return}}}
  P.mp=Math.min(S.maxMp,P.mp+dt*S.mpr);
  if(S.fx.has('heart'))P.hp=Math.min(S.maxHp,P.hp+dt*S.maxHp*.015);
  if(P.runes.life)P.hp=Math.min(S.maxHp,P.hp+dt*.6);
  if(S.fx.has('ember')){P.emberT-=dt;if(P.emberT<=0){P.emberT=.5;forNear(P.x,P.y-4,34,e=>dealDamage(e,S.wdmg*.25+4,'dot'));if(Math.random()<.5)burst(P.x,P.y-4,'#ff9a3a',4,30,.4)}}
  if(S.hpr)P.hp=Math.min(S.maxHp,P.hp+dt*S.hpr);
  if(!G.inDun&&inVil(P.x/16|0,P.y/16|0)&&P.hp<S.maxHp){P.hp=Math.min(S.maxHp,P.hp+dt*(1.5+S.maxHp*.015));if(Math.random()<dt*3)parts.push({x:P.x+rr(6),y:P.y,vx:0,vy:-18,life:.6,max:.6,col:'#9fe08a',size:1,g:0})}
  if(!P.boat&&(held('attack')||touchAtk||actQ.has('attack'))&&P.cd.atk<=0&&P.gcd<=0&&P.dash<=0)withMul(1+P.S.atkP/100,basicAttack);
  if(!P.boat)for(let i=0;i<4;i++)if(actQ.has('skill'+i)||(held('skill'+i)&&P.scd[i]<=0&&P.gcd<=0&&P.lvl>=CLS[P.cls].sk[i].lv))useSkill(i);
  if(actQ.has('pot_hp'))usePotion('hp');if(actQ.has('pot_mp'))usePotion('mp');
}

/* ----- save / load ----- */
function save(){if(!P||G.state==='title')return;try{localStorage.setItem(SK,JSON.stringify({v:4,ng:G.ng||0,ship:P.ship,mats:P.mats,tal:P.tal,comp:P.comp,comps:P.comps,q:P.q,dun:P.dun,clock:G.clock,cls:P.cls,race:P.race,lvl:P.lvl,xp:P.xp,gold:P.gold,bag:P.bag,eq:P.eq,pots:P.pots,runes:P.runes,bounty:P.bounty,stock:P.stock,stockLvl:P.stockLvl,
  quest:G.quest,gate:G.gateOpen,won:G.won,kills:G.kills,time:G.time,chests:(G.inDun?G.wChests:CHESTS).map(c=>c.open?1:0).join(''),shrines:SHRINES.map(s=>s.done?1:0).join(''),fog:G.inDun?G.owFog:fogPack()}))}catch(_){}}
function loadSave(){try{const s=localStorage.getItem(SK);return s?JSON.parse(s):null}catch(_){return null}}
function applySave(d){G.ng=d.v>=4?(d.ng||0):0;newGame(d.cls,d.race);if(d.v<4){d={cls:d.cls,race:d.race,lvl:d.lvl,xp:d.xp,gold:d.gold,bag:d.bag,eq:d.eq,pots:d.pots,v:4}}
  Object.assign(P,{ship:d.ship||P.ship,mats:d.mats||P.mats,tal:d.tal||{},comp:d.comp||null,comps:d.comps||[],q:d.q||P.q,dun:d.dun||{}});if(d.clock!=null)G.clock=d.clock;Object.assign(P,{lvl:d.lvl,xp:d.xp,gold:d.gold,bag:d.bag||[],eq:d.eq||P.eq,pots:d.pots||P.pots,runes:d.runes||P.runes,bounty:d.bounty||P.bounty,stock:d.stock||[],stockLvl:d.stockLvl||0});
  Object.assign(G,{quest:d.quest||0,won:!!d.won,kills:d.kills||0,time:d.time||0});
  (d.chests||'').split('').forEach((v,i)=>{if(CHESTS[i])CHESTS[i].open=v==='1'});(d.shrines||'').split('').forEach((v,i)=>{if(SHRINES[i])SHRINES[i].done=v==='1'});
  if(d.fog&&d.v>=4)fogUnpack(d.fog);if(d.gate)openGate(true);recalc();P.hp=P.S.maxHp;P.mp=P.S.maxMp}
