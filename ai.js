'use strict';
/* ===== ai: enemies, bosses, projectiles, world events, NPCs ===== */
function eshoot(e,kind,ux,uy,spd){const S={arrow:[150,1,2.2,2],web:[110,.6,2,3],hex:[85,1,3.6,4],orb:[70,1,4,4],poison:[90,.8,3,4],rock:[130,1,2,4]}[kind];
  proj.push({x:e.x+ux*6,y:ecy(e)+uy*6,vx:ux*(spd||S[0]),vy:uy*(spd||S[0]),life:S[2],owner:'e',kind,dmg:Math.max(1,Math.round(e.dmg*S[1])),r:S[3],homing:kind==='hex'})}
const eshootA=(e,kind,a,spd)=>eshoot(e,kind,Math.cos(a),Math.sin(a),spd);
function blinkNear(e){for(let i=0;i<20;i++){const a=Math.random()*6.283,r=60+Math.random()*40,x=P.x+Math.cos(a)*r,y=P.y+Math.sin(a)*r;
  if(!blocked(x,y,e.r,'e')){burst(e.x,ecy(e),'#9a5fe0',12,60,.4);e.x=x;e.y=y;burst(x,ecy(e),'#9a5fe0',12,60,.4);return}}}
function meleeWind(e,reach,wind,cd){e.acd=cd;e.wind=wind;e.onWind=()=>{const dd=Math.hypot(P.x-e.x,P.y-e.y)||1;e.swing=.15;if(dd<reach+8)hurtPlayer(e.dmg,(P.x-e.x)/dd,(P.y-e.y)/dd,thornsRef(e))}}
const AI={
  hop(e,d,ux,uy,sp){if(e.t%1.1<.45)return[ux*sp*1.8,uy*sp*1.8];if(d<e.r+P.r+3&&e.acd<=0){e.acd=.9;hurtPlayer(e.dmg,ux,uy,thornsRef(e))}return[0,0]},
  lunge(e,d,ux,uy,sp){if(d<46&&e.acd<=0){e.acd=1.7;e.wind=.38;e.onWind=()=>{const a=Math.atan2(P.y-e.y,P.x-e.x);e.leap=.22;e.leapHit=false;e.lvx=Math.cos(a)*200;e.lvy=Math.sin(a)*200};return[0,0]}return[ux*sp,uy*sp]},
  melee(e,d,ux,uy,sp){const reach=e.r+P.r+8;if(d<reach&&e.acd<=0){meleeWind(e,reach,.42,1.15);return[0,0]}if(d<reach-2)return[0,0];return[ux*sp,uy*sp]},
  ghost(e,d,ux,uy,sp){return AI.melee(e,d,ux,uy,sp)},
  ranged(e,d,ux,uy,sp){const R=e.f.range;let v;if(d>R*.8)v=[ux*sp,uy*sp];else if(d<R*.45)v=[-ux*sp,-uy*sp];else v=[-uy*sp*.5*e.side,ux*sp*.5*e.side];
    if(e.cd<=0&&d<R){e.cd=1.6+Math.random()*.9;e.wind=.3;e.onWind=()=>{const dd=Math.hypot(P.x-e.x,P.y-5-ecy(e))||1;eshoot(e,e.f.shot,(P.x-e.x)/dd,(P.y-5-ecy(e))/dd)}}
    if(e.f.blink&&e.t>(e.bt||5)){e.bt=e.t+5+Math.random()*3;blinkNear(e)}return v},
  slam(e,d,ux,uy,sp){if(d<42&&e.acd<=0){e.acd=2.6;e.wind=.9;e.onWind=null;warn({kind:'circle',x:e.x,y:e.y,r:34,t:.9,src:e,fn:()=>{G.shake=.2;sfx('boom');burst(e.x,e.y,'#a08a60',16,70,.5);
    const dd=Math.hypot(P.x-e.x,P.y-e.y)||1;if(dd<34+P.r)hurtPlayer(e.dmg,(P.x-e.x)/dd,(P.y-e.y)/dd,thornsRef(e))}});return[0,0]}return[ux*sp,uy*sp]}
};
function thornsRef(e){return{melee:true,get dead(){return e.dead},_e:e}}
const BOSS={
  fang(e,dt,d,ux,uy,sp){e.sc-=dt;const enr=e.hp<e.maxHp*.4;
    if(d<e.r+P.r+6&&e.acd<=0){meleeWind(e,e.r+P.r+6,.3,1);return[0,0]}
    if(e.cd<=0){e.cd=enr?1.9:2.9;const a=Math.atan2(P.y-e.y,P.x-e.x),L=130;e.wind=.6;sfx('growl');
      warn({kind:'line',x:e.x,y:e.y,a,len:L,w:16,t:.6,src:e});e.onWind=()=>{e.leap=.4;e.leapHit=false;e.lvx=Math.cos(a)*L/.4;e.lvy=Math.sin(a)*L/.4};return[0,0]}
    if(e.sc<=0){e.sc=enr?7:10;const n=enemies.filter(x=>x.wave===e.wave&&x!==e&&!x.dead).length;text(e.x,ecy(e)-20,'Ау-у-у!','#c9c2b2',true);
      for(let k=0;k<2&&n+k<3;k++){const x=e.x+rr(24),y=e.y+rr(24);if(!blocked(x,y,6,'e')){const w=spawn('wolf',x,y,{lvl:5,wave:e.wave});w.ag=true}}}
    return[ux*sp*.85,uy*sp*.85]},
  grokk(e,dt,d,ux,uy,sp){e.sc-=dt;const enr=e.hp<e.maxHp*.35;
    if(e.cd<=0){e.pat=(e.pat||0)+1;
      if(e.pat%3){e.cd=enr?2:2.8;e.wind=.95;e.onWind=null;warn({kind:'circle',x:e.x,y:e.y,r:52,t:.95,src:e,fn:()=>{G.shake=.35;sfx('boom');burst(e.x,e.y,'#a08a60',26,90,.6,2);
        const dd=Math.hypot(P.x-e.x,P.y-e.y)||1;if(dd<52+P.r)hurtPlayer(e.dmg,(P.x-e.x)/dd,(P.y-e.y)/dd,thornsRef(e));if(enr)for(let i=0;i<10;i++)eshootA(e,'rock',i/10*6.283,110)}})}
      else{e.cd=3;const a=Math.atan2(P.y-e.y,P.x-e.x);e.wind=.75;warn({kind:'line',x:e.x,y:e.y,a,len:170,w:24,t:.75,src:e});e.onWind=()=>{e.leap=.5;e.leapHit=false;e.lvx=Math.cos(a)*340;e.lvy=Math.sin(a)*340}}
      return[0,0]}
    if(e.sc<=0){e.sc=12;text(e.x,ecy(e)-24,'Гоблины! Бить!','#f2c14e',true);for(let k=0;k<2;k++){const x=e.x+rr(30),y=e.y+rr(30);if(!blocked(x,y,6,'e')){const g=spawn(k?'garcher':'goblin',x,y,{lvl:7,wave:e.wave});g.ag=true}}}
    return[ux*sp,uy*sp]},
  queen(e,dt,d,ux,uy,sp){e.sc-=dt;const enr=e.hp<e.maxHp*.4;
    const thr=[.75,.5,.25];e.si=e.si||0;if(e.si<3&&e.hp<e.maxHp*thr[e.si]){e.si++;text(e.x,ecy(e)-24,'БУЛЬК!','#e87ab8',true);
      for(let k=0;k<3;k++){const x=e.x+rr(30),y=e.y+rr(30);if(!blocked(x,y,6,'e')){const s=spawn('tslime',x,y,{lvl:9,wave:e.wave});s.ag=true}}}
    if(e.jump>0){e.jump-=dt;return[e.jvx,e.jvy]}
    if(e.sc<=0){e.sc=enr?3:4.2;const off=Math.random();for(let i=0;i<12;i++)eshootA(e,'poison',off+i/12*6.283,85);sfx('orb')}
    if(e.cd<=0){e.cd=enr?.5:1;const tx=P.x+rr(10),ty=P.y+rr(10);e.jump=.8;e.jvx=(tx-e.x)/.8;e.jvy=(ty-e.y)/.8;
      warn({kind:'circle',x:tx,y:ty,r:30,t:.8,src:e,fn:()=>{G.shake=.2;burst(e.x,e.y,'#e87ab8',14,60,.5);const dd=Math.hypot(P.x-e.x,P.y-e.y)||1;if(dd<30+P.r)hurtPlayer(e.dmg,(P.x-e.x)/dd,(P.y-e.y)/dd,thornsRef(e))}})}
    return[0,0]},
  lich(e,dt,d,ux,uy,sp){const enr=e.hp<e.maxHp*.5,p3=e.hp<e.maxHp*.25;e.sc-=dt;e.tp-=dt;
    if(enr&&!e.enr){e.enr=true;toast('Моргрим в ярости!','#c48aff');sfx('boss');G.shake=.3}
    if(p3&&!e.p3){e.p3=true;toast('Моргрим черпает силу склепа!','#c48aff');sfx('boss')}
    let v;if(d>95)v=[ux*sp,uy*sp];else if(d<55)v=[-ux*sp,-uy*sp];else v=[-uy*sp*.8*e.side,ux*sp*.8*e.side];
    if(e.cd<=0){e.pat=(e.pat||0)+1;const k=e.pat%3;
      if(k===1){const n=enr?14:10,off=Math.random()*6;for(let i=0;i<n;i++)eshootA(e,'orb',off+i/n*6.283,enr?78:64)}
      else if(k===2){const b=Math.atan2(P.y-5-ecy(e),P.x-e.x),n=enr?5:3;for(let i=0;i<n;i++)eshootA(e,'orb',b+(i-(n-1)/2)*.22,118)}
      else{for(let i=0;i<(enr?4:3);i++){const x=P.x+rr(40),y=P.y+rr(40);warn({kind:'circle',x,y,r:26,t:1,src:e,fn:()=>{burst(x,y,'#c48aff',16,70,.5);sfx('boom');if(Math.hypot(P.x-x,P.y-y)<26+P.r)hurtPlayer(Math.round(e.dmg*1.2),0,0)}})}}
      e.cd=enr?1.3:2.1;sfx('orb')}
    if(p3){e.spT=(e.spT||0)-dt;if(e.spT<=0){e.spT=.16;e.spA=(e.spA||0)+.42;eshootA(e,'orb',e.spA,70);eshootA(e,'orb',e.spA+Math.PI,70)}}
    if(e.sc<=0){e.sc=enr?7:9.5;const n=enemies.filter(x=>x.wave==='lich'&&!x.dead&&x!==e).length;
      for(let k=0;k<2&&n+k<4;k++){const a=Math.random()*6.283,x=e.x+Math.cos(a)*26,y=e.y+Math.sin(a)*26;if(!blocked(x,y,6,'e')){const s=spawn(pick(['skel','ghost','sarcher']),x,y,{lvl:12,wave:'lich'});s.ag=true;burst(x,y-5,'#9a5fe0',12,60,.5)}}}
    if(enr&&e.tp<=0){e.tp=4.5;for(let i=0;i<25;i++){const tx=CRYPT.x0+2+rint(CRYPT.x1-CRYPT.x0-3),ty=CRYPT.y0+2+rint(CRYPT.y1-CRYPT.y0-3),x=tx*16+8,y=ty*16+8;
      if(!blocked(x,y,e.r,'e')&&Math.hypot(x-P.x,y-P.y)>75){burst(e.x,e.y-14,'#c48aff',18,70,.5);e.x=x;e.y=y;burst(x,y-14,'#c48aff',18,70,.5);break}}}
    return v}
};
function updateEnemies(dt){
  for(const e of enemies){if(e.dead)continue;
    const dx=P.x-e.x,dy=P.y-e.y,d=Math.hypot(dx,dy)||1;
    if(d>520&&!e.f.boss&&!e.wave)continue;
    e.t+=dt;e.flash-=dt;e.slow-=dt;e.cd-=dt;e.acd-=dt;e.wt-=dt;if(e.swing>0)e.swing-=dt;
    if(e.poison>0){e.poison-=dt;e.ptk-=dt;if(e.ptk<=0){e.ptk=.5;dealDamage(e,e.pdps*.5,'dot');if(e.dead)continue}}
    const ux=dx/d,uy=dy/d,mode=e.f.ai==='ghost'?'ghost':'e';
    const sp=e.spd*(e.slow>0?e.slowF:1)*(mode==='e'&&at(e.x/16|0,e.y/16|0)===T.MUD?.7:1);
    const ar=e.f.ai==='ghost'?140:e.elite?135:115;
    if(!e.ag&&(d<ar||e.wave))e.ag=true;if(e.ag&&!e.wave&&!e.f.boss&&d>260)e.ag=false;
    let vx=0,vy=0;
    if(e.wind>0){e.wind-=dt;if(e.wind<=0&&e.onWind){const f=e.onWind;e.onWind=null;f()}}
    else if(e.leap>0){e.leap-=dt;vx=e.lvx;vy=e.lvy;if(d<e.r+P.r+4&&!e.leapHit){e.leapHit=true;hurtPlayer(Math.round(e.dmg*(e.f.boss?1.3:1)),ux,uy,thornsRef(e))}}
    else if(e.f.boss)[vx,vy]=BOSS[e.f.ai](e,dt,d,ux,uy,sp);
    else if(!e.ag){const hd=Math.hypot(e.hx-e.x,e.hy-e.y);if(hd>200){vx=(e.hx-e.x)/hd*sp*.6;vy=(e.hy-e.y)/hd*sp*.6}
      else{if(e.wt<=0){e.wt=1+Math.random()*2;e.wdir=Math.random()<.4?null:Math.random()*6.283}
        if(e.wdir!=null&&(e.f.ai!=='hop'||e.t%1.1<.45)){vx=Math.cos(e.wdir)*sp*.35;vy=Math.sin(e.wdir)*sp*.35}}}
    else[vx,vy]=AI[e.f.ai](e,d,ux,uy,sp);
    if(e.home&&Math.hypot(e.x-e.home.x,e.y-e.home.y)>190){const hx=e.home.x-e.x,hy=e.home.y-e.y,hd=Math.hypot(hx,hy);vx=hx/hd*sp;vy=hy/hd*sp}
    if(vx<-1)e.fl=true;else if(vx>1)e.fl=false;
    moveEnt(e,(vx+e.kx)*dt,(vy+e.ky)*dt,mode);const dec=Math.min(1,dt*9);e.kx-=e.kx*dec;e.ky-=e.ky*dec;
    if(e.type==='lich'||(e.wave==='lich')){e.x=clamp(e.x,(CRYPT.x0+1)*16+8,CRYPT.x1*16-8);e.y=clamp(e.y,(CRYPT.y0+1)*16+8,CRYPT.y1*16-8)}
    if(e.slow>0&&Math.random()<dt*8)parts.push({x:e.x+rr(5),y:ecy(e)+rr(5),vx:0,vy:8,life:.5,max:.5,col:'#c8f4ff',size:1,g:0});
    if(e.poison>0&&Math.random()<dt*6)parts.push({x:e.x+rr(5),y:ecy(e)+rr(5),vx:0,vy:-10,life:.5,max:.5,col:'#9fe060',size:1,g:0})}
  const act=enemies.filter(e=>!e.dead&&Math.abs(e.x-P.x)<400&&Math.abs(e.y-P.y)<300);
  for(let i=0;i<act.length;i++)for(let j=i+1;j<act.length;j++){const a=act[i],b=act[j],dx=b.x-a.x,dy=b.y-a.y,d=Math.hypot(dx,dy),m=a.r+b.r;
    if(d>0&&d<m){const p=(m-d)/2/d;if(!a.f.boss)moveEnt(a,-dx*p,-dy*p,'e');if(!b.f.boss)moveEnt(b,dx*p,dy*p,'e')}}
  enemies=enemies.filter(e=>!e.dead)}

/* ----- projectiles & effects ----- */
function explodeP(p){burst(p.x,p.y,'#ff9a4a',14,80,.4);burst(p.x,p.y,'#ffe08a',6,40,.3);rings.push({x:p.x,y:p.y,r:3,max:p.aoe,life:.25,col:'255,150,70'});
  forNear(p.x,p.y,p.aoe,e=>{const dx=e.x-p.x,dy=e.y-p.y,d=Math.hypot(dx,dy)||1;dealDamage(e,p.dmg,'spell',dx/d,dy/d)})}
function updateProj(dt){
  for(const p of proj){
    if(p.homing){const a=Math.atan2(P.y-5-p.y,P.x-p.x),c=Math.atan2(p.vy,p.vx);let df=a-c;while(df>Math.PI)df-=6.283;while(df<-Math.PI)df+=6.283;const n=c+clamp(df,-2*dt,2*dt),s=Math.hypot(p.vx,p.vy);p.vx=Math.cos(n)*s;p.vy=Math.sin(n)*s}
    p.x+=p.vx*dt;p.y+=p.vy*dt;p.life-=dt;p.rot=(p.rot||0)+dt*14;
    if((p.kind==='fire'||p.kind==='spark')&&Math.random()<.8)parts.push({x:p.x+rr(1),y:p.y+rr(1),vx:rr(8),vy:rr(8)-6,life:.25,max:.25,col:Math.random()<.5?'#ff9a4a':'#ffd36a',size:1,g:0});
    if(p.kind==='arcane'&&Math.random()<.9)parts.push({x:p.x+rr(1),y:p.y+rr(1),vx:rr(6),vy:rr(6),life:.22,max:.22,col:Math.random()<.5?'#9fb7ff':'#e0d0ff',size:1,g:0});
    if((p.kind==='orb'||p.kind==='hex')&&Math.random()<.4)parts.push({x:p.x,y:p.y,vx:0,vy:0,life:.3,max:.3,col:'#9a5fe0',size:1,g:0});
    if(p.kind==='poison'&&Math.random()<.4)parts.push({x:p.x,y:p.y,vx:0,vy:0,life:.3,max:.3,col:'#b07ad8',size:1,g:0});
    if(solidAt(p.x,p.y,'proj')||p.life<=0){if(p.aoe)explodeP(p);else if(p.kind!=='arrow')burst(p.x,p.y,'#c9c2b2',4,30,.2);p.dead=true;continue}
    if(p.owner==='p'){const s=Math.hypot(p.vx,p.vy)||1;
      for(const e of enemies){if(e.dead||(p.hit&&p.hit.has(e)))continue;if(Math.hypot(p.x-e.x,p.y-ecy(e))<e.r+p.r+2){
        if(p.aoe){explodeP(p);p.dead=true;break}
        dealDamage(e,p.dmg,p.kind==='spark'?'spell':'proj',p.vx/s,p.vy/s);if(p.poison){e.poison=p.poison;e.pdps=p.pdps}if(p.slow){e.slow=Math.max(e.slow,1.5)}
        if(p.pierce)p.hit.add(e);else{p.dead=true;break}}}}
    else if(Math.hypot(p.x-P.x,p.y-(P.y-5))<P.r+p.r){const s=Math.hypot(p.vx,p.vy)||1;if(hurtPlayer(p.dmg,p.vx/s,p.vy/s)){if(p.kind==='web'){P.slowT=1.6;text(P.x,P.y-26,'паутина','#e8e4da')}if(p.kind==='poison'){P.poison=3;P.pdps=p.dmg*.4}}p.dead=true}}
  proj=proj.filter(p=>!p.dead)}
function updateMisc(dt){
  for(const k of pickups){k.t+=dt;const dx=P.x-k.x,dy=P.y-k.y,d=Math.hypot(dx,dy)||1;const mag=k.k==='item'?0:30;
    if(d<mag){k.x+=dx/d*120*dt;k.y+=dy/d*120*dt}
    if(d<9){if(k.k==='gold'){P.gold+=k.v;sfx('coin');text(P.x,P.y-20,'+'+k.v,'#f2c14e');k.dead=true}
      else if(k.k==='pot'){P.pots[k.kind]++;sfx('coin');text(P.x,P.y-20,k.kind==='hp'?'зелье здоровья':'зелье маны',k.kind==='hp'?'#ff8a7a':'#8fb4ff');k.dead=true}
      else if(k.k==='item'){if(P.bag.length<24){P.bag.push(k.it);k.dead=true;sfx('item');text(P.x,P.y-24,k.it.name,RAR[k.it.rar].c,k.it.rar>=3);if(k.it.rar>=3)toast(k.it.name,RAR[k.it.rar].c);save()}else if(!k.full){k.full=true;deny('сумка полна')}}}
    else k.full=false;
    if(k.t>(k.k==='item'?180:40))k.dead=true}
  pickups=pickups.filter(k=>!k.dead);
  for(const p of parts){p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=p.g*dt;p.life-=dt}parts=parts.filter(p=>p.life>0);
  for(const t of texts){t.y-=18*dt;t.life-=dt}texts=texts.filter(t=>t.life>0);
  for(const r of rings){r.life-=dt;r.r+=(r.max-r.r)*Math.min(1,dt*14)}rings=rings.filter(r=>r.life>0);
  for(const b of bolts)b.life-=dt;bolts=bolts.filter(b=>b.life>0);
  for(const t of trails)t.life-=dt;trails=trails.filter(t=>t.life>0);
  for(const w of warns){w.t-=dt;if(w.t<=0){w.done=true;if(w.fn&&!(w.src&&w.src.dead))w.fn()}}warns=warns.filter(w=>!w.done);
  for(const z of zones){z.t-=dt;z.tick-=dt;if(Math.random()<dt*30)parts.push({x:z.x+rr(z.r*.8),y:z.y+rr(z.r*.6)-30,vx:0,vy:200,life:.15,max:.15,col:'#e8e4da',size:1,g:0});
    if(z.tick<=0){z.tick=.22;forNear(z.x,z.y,z.r,e=>dealDamage(e,P.S.wdmg*.45,'proj'))}}zones=zones.filter(z=>z.t>0);
  G.smoke-=dt;if(G.smoke<=0){G.smoke=.35;HOUSES.forEach(h=>{if(Math.abs(h.x*16-P.x)<400)parts.push({x:h.x*16+50+rr(1),y:h.y*16-6,vx:4+rr(2),vy:-9,life:2.4,max:2.4,col:'rgba(225,225,235,.45)',size:2,g:0})})}
  G.amb-=dt;if(G.amb<=0){G.amb=.12;const r=RG(P.x/16|0,P.y/16|0);
    if(r===2||r===3)parts.push({x:P.x+rr(VW/2),y:P.y+rr(VH/2),vx:rr(6),vy:rr(6),life:3,max:3,col:r===2?'#e8f080':'#b0f060',size:1,g:0});
    if(r===5)parts.push({x:P.x+rr(VW/2),y:P.y+rr(VH/2),vx:6+rr(3),vy:rr(1),life:4,max:4,col:'rgba(200,200,220,.18)',size:10,g:0})}}
function spawnTick(dt){G.spawnT-=dt;if(G.spawnT>0)return;G.spawnT=2.2;
  REGIONS.forEach((R,ri)=>{if(!R.cap)return;if(enemies.filter(e=>e.reg===ri).length<R.cap)spawnInRegion(ri,230)})}

/* ----- world events ----- */
const BOSS_INTRO={
  fang:[{who:'Клык, вожак стаи',text:'Р-р-р... (Из чащи выходит огромный волк. Шерсть у него покрыта инеем.)'}],
  grokk:[{who:'Гроккс',text:'Мелкий человек трогать камень Гроккса? Гроккс сделать из тебя лепёшку!'}],
  queen:[{who:'Королева слизней',text:'Бульк. БУЛЬК. БУЛЬК!'},{who:'Королева слизней',text:'(Кажется, это была угроза.)'}]};
function activateShrine(s){s.active=true;sfx('boss');G.shake=.3;const sx=s.x*16+8,sy=s.y*16+8;
  const b=spawn(s.boss,sx,sy-46,{lvl:s.lvl,wave:s.id});b.home={x:sx,y:sy};b.ag=true;b.cd=2;G.boss=b;burst(b.x,b.y-14,s.col,40,90,1);
  say(BOSS_INTRO[s.boss])}
function bossDown(e){G.boss=null;G.shake=.6;sfx('rune');burst(e.x,ecy(e),'#f2c14e',40,90,1.2);
  enemies.forEach(x=>{if(x.wave&&x.wave===e.wave&&!x.dead){x.dead=true;burst(x.x,x.y-5,'#9a8fa8',8,50,.4)}});
  if(e.type==='lich'){G.won=true;proj=proj.filter(p=>p.owner==='p');G.winT=2;save();return}
  const s=SHRINES.find(s=>s.id===e.wave);if(s){s.active=false;s.done=true;grantRune(s)}}
function grantRune(s){P.runes[s.id]=true;recalc();P.hp=P.S.maxHp;P.mp=P.S.maxMp;sfx('rune');burst(s.x*16+8,s.y*16,s.col,40,90,1.1);
  const L={frost:'Холод бежит по пальцам. Теперь каждый твой удар может заморозить врага.',fire:'Огонь отзывается в крови. Весь твой урон вырос на 15%.',life:'Тёплый свет наполняет тело. Здоровье выросло на 20% и само понемногу восстанавливается.'};
  const cnt=Object.values(P.runes).filter(Boolean).length;save();
  say([{who:s.name,text:L[s.id]},{who:'Руны: '+cnt+' из 3',text:cnt<3?'Осталось святилищ: '+(3-cnt)+'. Они мигают на карте.':'Все три руны у тебя. Где-то на юго-востоке с грохотом рушится печать склепа.'}],()=>{if(cnt===3)openGate()})}
function openGate(silent){if(G.gateOpen&&!silent)return;G.gateOpen=true;set(GATE.x,GATE.y,T.FLOOR);drawTile(wx,GATE.x,GATE.y);drawTile(wx,GATE.x,GATE.y+1);buildMM();
  if(silent)return;G.shake=.5;sfx('boss');toast('Печать склепа пала. Склеп на юго-востоке, за кладбищем.','#c48aff');
  for(let i=0;i<9;i++){for(let k=0;k<20;k++){const tx=CRYPT.x0+2+rint(CRYPT.x1-CRYPT.x0-3),ty=CRYPT.y0+2+rint(8),x=tx*16+8,y=ty*16+8;if(!blocked(x,y,6,'e')){spawn(pick(['skel','sarcher','ghost']),x,y,{lvl:12,reg:6,elite:Math.random()<.2});break}}}
  save()}
function bossCheck(){if(!G.gateOpen||G.bossSpawned||G.won)return;const tx=P.x/16|0,ty=P.y/16|0;
  if(inCrypt(tx,ty)&&ty>CRYPT.y0+4){G.bossSpawned=true;const b=spawn('lich',82*16+8,70*16+8,{lvl:13,wave:'lichboss'});b.cd=2.5;b.ag=true;G.boss=b;sfx('boss');burst(b.x,b.y-14,'#c48aff',40,90,1);
    say([{who:'Моргрим',text:'Ещё один ученик Ольвена... Сколько вас было? Я сбился со счёта.'},{who:'Моргрим',text:'Твоя душа станет новым камнем в моей короне.'}])}}
function die(){G.state='dead';sfx('die');setTimeout(()=>{$('ovDead').hidden=false;$('bRespawn').focus()},500)}
function respawn(){if(G.state!=='dead')return;$('ovDead').hidden=true;const lost=Math.floor(P.gold*.2);P.gold-=lost;
  P.hp=P.S.maxHp;P.mp=P.S.maxMp;P.x=SPAWN.x;P.y=SPAWN.y;P.inv=1.5;P.kx=P.ky=0;P.poison=0;P.slowT=0;P.dash=0;
  enemies=enemies.filter(e=>!e.wave);SHRINES.forEach(s=>s.active=false);proj=[];warns=[];zones=[];G.boss=null;
  if(G.bossSpawned&&!G.won)G.bossSpawned=false;
  G.cx=P.x-VW/2;G.cy=P.y-VH/2;G.state='play';if(lost)toast('Пропало золота: '+lost);save()}
function openChest(c){c.open=true;sfx('item');burst(c.x,c.y-6,'#f2c14e',20,60,.6);const crypt=inCrypt(c.tx,c.ty);
  dropItem(genItem(c.lvl,{bias:crypt?2:1,minRar:1}),c.x,c.y+12);if(Math.random()<.5||crypt)dropItem(genItem(c.lvl,{bias:1}),c.x,c.y+12);
  pickups.push({k:'gold',v:c.lvl*8+rint(20),x:c.x,y:c.y+14,t:0});if(Math.random()<.5)pickups.push({k:'pot',kind:pick(['hp','mp']),x:c.x+rr(8),y:c.y+14,t:0});save()}

/* ----- NPCs & dialog ----- */
const HINTS=['Слизни безобидны поодиночке. Королева слизней — совсем другое дело.','Волки прыгают, когда подходят близко. Отойди в сторону, как только волк присел.','Видишь красный круг на земле? Беги из него.','Пауки плюются паутиной. В ней ноги вязнут.','Ведьмы с болот исчезают и появляются за спиной.','Огры замахиваются медленно. Успеешь отбежать.','В деревне раны затягиваются сами. Монстры сюда не заходят.','Мои зелья лечат почти половину здоровья. Носи с собой несколько.'];
function interact(n){
  if(n.kind==='shrine'){const s=n.s;if(s.done)say([{who:s.name,text:'Камень молчит. Руна уже у тебя.'}]);else activateShrine(s);return}
  if(n.kind==='chest'){openChest(n.c);return}
  if(n.id==='elder'){
    if(G.won)return say([{who:'Ольвен',text:'Ты спас Вельмор. Хотя какой ты теперь ученик... Самый настоящий герой!'},{who:'Ольвен',text:'Говорят, в старых сундуках ещё лежат легендарные вещи. Мир большой, гуляй.'}]);
    if(G.quest===0)return say([
      {who:'Ольвен',text:'А, вот и ты. Плохие вести: в старом склепе за кладбищем проснулся лич Моргрим.'},
      {who:'Ольвен',text:'Ворота склепа держит печать. Снять её можно тремя рунами: Инея, Пламени и Жизни.'},
      {who:'Ольвен',text:'Каждую руну стережёт чудовище. Коснёшься камня святилища, и оно выйдет к тебе.'},
      {who:'Ольвен',text:'Не спеши. Начни с Тёмного леса на западе, а сначала окрепни на лугах. Чем дальше от деревни, тем злее звери.'},
      {who:'Ольвен',text:'Брам продаёт оружие, Ива варит зелья, а Тара платит за охоту на монстров. Загляни ко всем.'}],()=>{G.quest=1;toast('Задание: найди три руны');save()});
    const left=SHRINES.filter(s=>!s.done);
    if(left.length)return say([{who:'Ольвен',text:`Рун у тебя: ${3-left.length} из 3. Следующая — ${left[0].name}, ${left[0].where}. Чудовище там примерно ${left[0].lvl} уровня.`}]);
    return say([{who:'Ольвен',text:'Печать пала. Склеп на юго-востоке, за кладбищем. Возьми побольше зелий.'}])}
  if(n.id==='smith'){if(P.stockLvl!==P.lvl||!P.stock.length)restock();return say([{who:'Брам',text:pick(['Клинки, луки, доспехи. Всё честно выковано. Ну, почти всё.','Принёс трофеи? Покупаю всё, что блестит.','Сталь не врёт. Выбирай.'])}],()=>openInv('smith'))}
  if(n.id==='herb'){P.hp=P.S.maxHp;P.mp=P.S.maxMp;P.poison=0;sfx('heal');burst(P.x,P.y-6,'#7fe07a',18,50,.7);
    return say([{who:'Ива',text:'Выпей отвар, силы вернутся. '+pick(HINTS)}],()=>openInv('herb'))}
  if(n.id==='tara'){const b=P.bounty,B=BOUNTIES[b.i];
    if(!B)return say([{who:'Тара',text:'Охотиться больше не на кого. Ты вычистил всю округу. Спасибо, правда.'}]);
    if(!b.active)return say([{who:'Тара',text:`Есть работа. «${B.t}». ${B.d} Плачу ${B.gold} золота и вещь из запасов стражи.`}],()=>{b.active=true;b.prog=0;toast('Новое задание: '+B.t);save()});
    if(b.prog<B.n)return say([{who:'Тара',text:`«${B.t}»: ${b.prog} из ${B.n}. Возвращайся, когда закончишь.`}]);
    return say([{who:'Тара',text:`Отличная охота. Держи ${B.gold} золота и вот это.`}],()=>{P.gold+=B.gold;dropItem(genItem(P.lvl,{bias:1.5,minRar:2}),P.x,P.y+14);b.i++;b.active=false;b.prog=0;sfx('lvl');save()})}
}
function restock(){P.stockLvl=P.lvl;P.stock=[];for(let i=0;i<3;i++)P.stock.push(genItem(P.lvl,{slot:'weapon',cls:P.cls,bias:.8}));['armor','amulet','ring'].forEach(s=>P.stock.push(genItem(P.lvl,{slot:s,bias:.8})))}
let D=null;
function say(lines,onEnd){D={lines,i:0,onEnd,shown:0};G.state='dialog';$('dlg').hidden=false;document.body.classList.add('talking');showLine()}
function showLine(){const l=D.lines[D.i];$('dWho').textContent=l.who;D.full=l.text;D.shown=0;$('dTxt').textContent=''}
function advance(){if(!D)return;if(D.shown<D.full.length){D.shown=D.full.length;$('dTxt').textContent=D.full;return}
  D.i++;if(D.i<D.lines.length)return showLine();const cb=D.onEnd;D=null;$('dlg').hidden=true;document.body.classList.remove('talking');G.state='play';P.cd.atk=.3;if(cb)cb()}
function tickDialog(dt){if(!D)return;if(D.shown<D.full.length){D.shown=Math.min(D.full.length,D.shown+dt*60);$('dTxt').textContent=D.full.slice(0,D.shown|0)}if(actQ.has('use')||actQ.has('attack'))advance()}
function findNear(){G.near=null;let best=24;
  for(const n of NPCS){const d=Math.hypot(n.x-P.x,n.y-P.y);if(d<best){best=d;G.near={kind:'npc',...n,label:n.name}}}
  for(const s of SHRINES){if(s.active)continue;const x=s.x*16+8,y=s.y*16+10,d=Math.hypot(x-P.x,y-P.y);if(d<best+4){best=d;G.near={kind:'shrine',s,x,y:y-8,label:s.done?'Святилище':'Разбудить стража'}}}
  for(const c of CHESTS){if(c.open)continue;const d=Math.hypot(c.x-P.x,c.y-P.y);if(d<best){best=d;G.near={kind:'chest',c,x:c.x,y:c.y,label:'Сундук'}}}}
