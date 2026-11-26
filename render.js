'use strict';
/* ===== render: art sprites, props, light, weather ===== */
const cv=$('cv'),ctx=cv.getContext('2d');
let VW=320,VH=200,SCALE=4;const dk=cnv(1,1),dctx=dk.getContext('2d'),vg=cnv(1,1);
function resize(){const w=innerWidth,h=innerHeight,k=Math.max(1,Math.floor(Math.min(w,h)/680));SCALE=2*k;
  VW=Math.ceil(w/SCALE);VH=Math.ceil(h/SCALE);cv.width=VW*AP;cv.height=VH*AP;cv.style.width=VW*SCALE+'px';cv.style.height=VH*SCALE+'px';ctx.imageSmoothingEnabled=false;
  dk.width=VW*AP;dk.height=VH*AP;vg.width=VW*AP;vg.height=VH*AP;const vx=vg.getContext('2d'),g=vx.createRadialGradient(vg.width/2,vg.height/2,Math.min(vg.width,vg.height)*.35,vg.width/2,vg.height/2,Math.max(vg.width,vg.height)*.75);
  g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(1,'rgba(6,6,20,.5)');vx.fillStyle=g;vx.fillRect(0,0,vg.width,vg.height)}
addEventListener('resize',resize);
const TINT={marsh:'rgba(40,60,30,.16)',forest:'rgba(0,30,20,.10)'};
function drawImg(n,x,y,flip,white,alpha){const I=IMG[n];if(!I)return;const w=I.W/AP,h=I.H/AP;const s=flip?(white?I.fw:I.f):(white?I.w:I.c);
  if(alpha!=null&&alpha<1){ctx.globalAlpha=alpha;ctx.drawImage(s,Math.round((x-w/2)*AP)/AP,Math.round((y+2-h)*AP)/AP,w,h);ctx.globalAlpha=1}else ctx.drawImage(s,Math.round((x-w/2)*AP)/AP,Math.round((y+2-h)*AP)/AP,w,h)}
const imgH=n=>IMG[n]?IMG[n].H/AP:24,imgW=n=>IMG[n]?IMG[n].W/AP:16;
function shadow(x,y,rx=6){ctx.fillStyle='rgba(0,0,0,.28)';ctx.beginPath();ctx.ellipse(x,y+2,rx,rx*.32,0,0,7);ctx.fill()}
function heroImg(){return heroSprFor(P.cls)}
function drawPlayer(){let S=heroImg();const h=imgH(S);const walkF=P.moving&&P.cls==='ranger'&&IMG.rein_walk0&&P.dash<=0;if(walkF)S='rein_walk'+((P.anim*9|0)%4);
  for(const t of trails)drawImg(S,t.x,t.y,t.fl,true,t.life*1.6);
  if(P.buff>0){ctx.globalAlpha=.35+.15*Math.sin(G.time*8);ctx.fillStyle='#e0402e';ctx.beginPath();ctx.ellipse(P.x,P.y+2,10,3.5,0,0,7);ctx.fill();ctx.globalAlpha=1}
  if(P.inv>0&&P.dash<=0&&(G.time*20|0)%2)return;shadow(P.x,P.y,imgW(S)*.32);const bob=walkF?0:P.moving?Math.abs(Math.sin(P.anim*11))*-1.2:Math.sin(G.time*2)*.3;
  ctx.save();if(P.moving&&!walkF){ctx.translate(P.x,P.y);ctx.rotate(Math.sin(P.anim*11)*.05);ctx.translate(-P.x,-P.y)}drawImg(S,P.x,P.y+bob,P.fl);ctx.restore();
  if(P.shieldT>0){ctx.strokeStyle=`rgba(168,184,208,${.4+.2*Math.sin(G.time*8)})`;ctx.lineWidth=1.5;ctx.beginPath();ctx.ellipse(P.x,P.y-h/2,imgW(S)*.45,h*.55,0,0,7);ctx.stroke()}
  if(P.absorb>0){ctx.fillStyle=`rgba(207,216,255,${.12+.06*Math.sin(G.time*5)})`;ctx.strokeStyle='rgba(207,216,255,.6)';ctx.lineWidth=1;ctx.beginPath();ctx.arc(P.x,P.y-h/2,h*.62,0,7);ctx.fill();ctx.stroke()}}
function drawEnemy(e){const f=e.f,wh=e.flash>0,run=f.spr==='wolf'&&IMG.wolf_run0&&(Math.hypot(e.kx,e.ky)>1||e.ag)&&e.wind<=0,n=run?'wolf_run'+((e.t*10|0)%4):f.spr,h=imgH(n),w=imgW(n);
  if(e.elite||f.boss){ctx.globalAlpha=.35+.15*Math.sin(G.time*6);ctx.fillStyle=f.boss?'#8a5aff':'#f2c14e';ctx.beginPath();ctx.ellipse(e.x,e.y+2,w*.42,w*.13,0,0,7);ctx.fill();ctx.globalAlpha=1}
  shadow(e.x,e.y,w*.32);const jit=e.wind>0?rr(.8):0,bob=run?0:f.ai==='ghost'||f.ghostly?Math.sin(G.time*3+e.hx)*2-2:Math.abs(Math.sin(e.t*9))*-(Math.hypot(e.kx,e.ky)>1||e.ag?1:0);
  drawImg(n,e.x+jit,e.y+bob,e.fl,wh,f.ghostly?.6+.25*Math.sin(G.time*4+e.hx):null);
  if(e.wind>0){const y=e.y-h-6;px(ctx,'#1a1420',e.x-1.5,y-6,3,8);px(ctx,'#e0402e',e.x-1,y-5,2,4);px(ctx,'#e0402e',e.x-1,y,2,1)}
  if(e.stun>0){for(let i=0;i<3;i++){const a=G.time*4+i*2.1;px(ctx,'#f2d48a',e.x+Math.cos(a)*6,e.y-h-2+Math.sin(a)*2,1.5,1.5)}}
  if(e.swing>0){const a=Math.atan2(P.y-e.y,P.x-e.x);ctx.strokeStyle='rgba(255,120,100,.8)';ctx.lineWidth=2;ctx.beginPath();ctx.arc(e.x,e.y-h/2,w*.6,a-.9,a+.9);ctx.stroke()}
  if((e.hp<e.maxHp||e.elite)&&!f.boss){const y=e.y-h-3;px(ctx,'#1a1420',e.x-9,y,18,3);px(ctx,e.elite?'#f2c14e':'#e0402e',e.x-8,y+1,16*Math.max(0,e.hp)/e.maxHp,1);
    ctx.font='bold 6px monospace';ctx.textAlign='right';ctx.fillStyle=e.lvl>=P.lvl+3?'#ff6a5a':e.lvl>P.lvl?'#f2c14e':'#ecdfc3';ctx.fillText(e.lvl,e.x-10,y+3)}}
function npcHas(n){const s=P.st||0,b=P.bounty;return(n.id==='irel'&&(s===0||s===8))||(n.id==='kornel'&&s===2)||(n.id==='motta'&&(s===3||(s===4&&P.qn>=5)))||(n.id==='born'&&((!b.active&&BOUNTIES[b.i])||(b.active&&BOUNTIES[b.i]&&b.prog>=BOUNTIES[b.i].n)))}
function render(dt){
  ctx.setTransform(1,0,0,1,0,0);ctx.fillStyle='#0b0d18';ctx.fillRect(0,0,cv.width,cv.height);if(!P||!ZONE)return;
  const k=Math.min(1,dt*7);G.cx+=(P.x-VW/2-G.cx)*k;G.cy+=(P.y-VH/2-G.cy)*k;
  if(VW>=WW)G.cx=(WW-VW)/2;else G.cx=clamp(G.cx,0,WW-VW);if(VH>=WH)G.cy=(WH-VH)/2;else G.cy=clamp(G.cy,0,WH-VH);
  let cx=Math.round(G.cx*AP)/AP,cy=Math.round(G.cy*AP)/AP;if(G.shake>0&&!reduced){cx+=Math.round(rr(2));cy+=Math.round(rr(2))}
  G.camX=cx;G.camY=cy;
  ctx.setTransform(AP,0,0,AP,-cx*AP,-cy*AP);
  const sx=Math.max(0,cx),sy=Math.max(0,cy),sw=Math.min(VW,WW-sx),sh=Math.min(VH,WH-sy);if(sw>0&&sh>0)ctx.drawImage(worldCv,sx*AP,sy*AP,sw*AP,sh*AP,sx,sy,sw,sh);
  const x0=Math.max(0,cx/16|0),y0=Math.max(0,cy/16|0),x1=Math.min(W-1,x0+(VW/16|0)+1),y1=Math.min(H-1,y0+(VH/16|0)+1),tq=Math.floor(G.time*2);
  for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){const t=at(x,y);
    if((t===T.WATER||t===T.SHALLOW)&&hash(x,y,tq)<.15)px(ctx,'rgba(220,240,255,.7)',x*16+2+((hash(x,y,tq+7)*11)|0),y*16+3+((hash(x,y,tq+3)*10)|0),3,.5);
    if(t===T.SHADOW){ctx.fillStyle=`rgba(40,10,70,${.75+.1*Math.sin(G.time*2+x)})`;ctx.fillRect(x*16,y*16,16,16);if(hash(x,y,tq)<.3)px(ctx,'#8a5aff',x*16+((hash(x,y,tq+1)*14)|0),y*16+((hash(x,y,tq+2)*14)|0),1,1)}}
  const inView=(x,y,m=60)=>x>cx-m&&x<cx+VW+m&&y>cy-m&&y<cy+VH+m+40;
  for(const p of PROPS)if(p.quest==='mush'&&inView(p.x,p.y)&&!(P.mush&&P.mush[p.mid])){const a=.25+.15*Math.sin(G.time*3+p.mid);ctx.fillStyle=`rgba(160,200,255,${a})`;ctx.beginPath();ctx.ellipse(p.x,p.y,9,4,0,0,7);ctx.fill()}
  for(const w of warns){const pr=1-w.t/w.max,col=w.friendly?'207,216,255':'224,64,46';ctx.fillStyle=`rgba(${col},.16)`;ctx.strokeStyle=`rgba(${col},.7)`;ctx.lineWidth=1;
    if(w.kind==='circle'){ctx.beginPath();ctx.arc(w.x,w.y,w.r,0,7);ctx.fill();ctx.stroke();ctx.fillStyle=`rgba(${col},.3)`;ctx.beginPath();ctx.arc(w.x,w.y,w.r*pr,0,7);ctx.fill()}
    else{ctx.save();ctx.translate(w.x,w.y);ctx.rotate(w.a);ctx.fillRect(0,-w.w/2,w.len,w.w);ctx.strokeRect(0,-w.w/2,w.len,w.w);ctx.fillStyle=`rgba(${col},.3)`;ctx.fillRect(0,-w.w/2,w.len*pr,w.w);ctx.restore()}}
  for(const z of zones){ctx.strokeStyle=z.kind==='wild'?'rgba(127,224,122,.55)':'rgba(242,193,78,.5)';ctx.setLineDash([3,3]);ctx.beginPath();ctx.arc(z.x,z.y,z.r,0,7);ctx.stroke();ctx.setLineDash([])}
  const L=[];
  for(const p of PROPS){if(!inView(p.x,p.y))continue;if(p.quest==='mush'&&P.mush&&P.mush[p.mid])continue;
    L.push([p.y,()=>{const h=imgH(p.img),w=imgW(p.img);let a=null;if(h>30&&P.y<p.y-2&&P.y>p.y-h+4&&Math.abs(P.x-p.x)<w*.42)a=.45;
      if(p.fire){drawImg(p.img,p.x,p.y,false,false,a);return}drawImg(p.img,p.x,p.y,false,false,a);
      if(p.img==='shard'){ctx.globalCompositeOperation='lighter';ctx.globalAlpha=.25+.15*Math.sin(G.time*3);ctx.fillStyle='#8fb8ff';ctx.beginPath();ctx.arc(p.x,p.y-10,10,0,7);ctx.fill();ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over'}}])}
  for(const c of CHESTS)if(inView(c.x,c.y))L.push([c.y,()=>{shadow(c.x,c.y-2,7);drawImg(c.open?'chest_open':'chest',c.x,c.y-1);if(!c.open&&Math.sin(G.time*3+c.x)>.85)px(ctx,'#fff3c4',c.x-3+((G.time*7|0)%7),c.y-10,1,1)}]);
  for(const n of NPCS)if(inView(n.x,n.y))L.push([n.y,()=>{shadow(n.x,n.y,imgW(n.spr)*.3);drawImg(n.spr,n.x,n.y+(n.mv?-Math.abs(Math.sin(G.time*10))*1.2:Math.sin(G.time*2+(n.hx||n.x))*.3),n.mv?n.fl:P.x<n.x);
    if(npcHas(n)){const h=imgH(n.spr),b=Math.abs(Math.sin(G.time*4))*2;px(ctx,'#1a1420',n.x-2,n.y-h-12-b,4,9);px(ctx,'#f2d48a',n.x-1,n.y-h-11-b,2,5);px(ctx,'#f2d48a',n.x-1,n.y-h-5-b,2,2)}}]);
  for(const p of pickups)if(inView(p.x,p.y))L.push([p.y,()=>{if(p.k!=='item'&&p.t>35&&(G.time*8|0)%2)return;const b=Math.abs(Math.sin(p.t*4))*2;shadow(p.x,p.y-1,3);
    if(p.k==='gold'){px(ctx,'#8a5f14',p.x-2,p.y-4-b,5,5);px(ctx,'#f2c14e',p.x-2,p.y-5-b,4,4);px(ctx,'#fff3c4',p.x-1,p.y-4-b,1,1)}
    else if(p.k==='mat'){const c=MATS[p.m].c,Y=p.y-6-b;px(ctx,'#1a1420',p.x-3,Y-3,7,7);px(ctx,c,p.x-2,Y-2,5,5);px(ctx,'#ffffff',p.x-2,Y-2,2,1)}
    else if(p.k==='pot')ctx.drawImage(SPR[p.kind==='hp'?'pot':'potmp'],p.x-6,p.y-10-b);
    else{const c=RAR[p.it.rar].c;if(p.it.rar>=2){ctx.globalAlpha=.18+.08*Math.sin(G.time*4);ctx.fillStyle=c;ctx.fillRect(p.x-2,p.y-60,4,58);ctx.globalAlpha=1}
      ctx.globalAlpha=.5;ctx.fillStyle=c;ctx.beginPath();ctx.arc(p.x,p.y-6-b,7,0,7);ctx.fill();ctx.globalAlpha=1;ctx.drawImage(itemSpr(p.it),p.x-6,p.y-12-b)}}]);
  for(const c of CRIT)if(inView(c.x,c.y)&&!c.gone){if(c.fly){L.push([c.y+40,()=>{const fl=(G.time*12+c.t)%2<1;ctx.globalAlpha=.9;drawImg('butterfly',c.x,c.y-14+Math.sin(G.time*3+c.t)*3,fl);ctx.globalAlpha=1}]);continue}
    L.push([c.y,()=>{if(!c.water&&!c.air)shadow(c.x,c.y,imgW(c.img)*.28);const hop=c.mv&&!c.water?-Math.abs(Math.sin(G.time*12+c.t))*1.5:c.water?Math.sin(G.time*2+c.t)*.6:0;drawImg(c.img,c.x,c.y+hop-(c.air||0),c.fl,false,c.air?Math.max(0,1-c.air/80):null)}])}
  for(const e of enemies)if(inView(e.x,e.y))L.push([e.y,()=>drawEnemy(e)]);
  L.push([P.y,drawPlayer]);
  L.sort((a,b)=>a[0]-b[0]).forEach(l=>l[1]());
  /* mist walls */
  for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++)if(at(x,y)===T.MIST){const a=P.flags.lantern?.28:.72;for(let i=0;i<2;i++){const ox=Math.sin(G.time*.7+x*1.3+i*2)*6,oy=Math.cos(G.time*.5+y*1.7+i)*4;
    ctx.fillStyle=`rgba(225,230,240,${a*(.6+.4*hash(x,y,i))})`;ctx.beginPath();ctx.arc(x*16+8+ox,y*16+6+oy,11,0,7);ctx.fill()}}
  if(P.swing){const s=P.swing,pr=1-s.t/s.max,a=Math.atan2(s.a.y,s.a.x),hy=P.y-imgH(heroImg())*.45;ctx.strokeStyle=`rgba(255,250,235,${.9-pr*.7})`;ctx.lineWidth=2;ctx.beginPath();
    if(s.spin)ctx.arc(P.x,hy,s.r,a+pr*6.283,a+pr*6.283+4);else ctx.arc(P.x,hy,s.r,a-s.w*.8+pr*.6,a+s.w*.2+pr);ctx.stroke()}
  for(const p of proj){
    if(p.kind==='fire'||p.kind==='spark'){ctx.fillStyle='#ff7a2a';ctx.beginPath();ctx.arc(p.x,p.y,3,0,7);ctx.fill();ctx.fillStyle='#ffe08a';ctx.beginPath();ctx.arc(p.x,p.y,1.5,0,7);ctx.fill()}
    else if(p.kind==='moon'||p.kind==='smite'){ctx.fillStyle=p.kind==='moon'?'#6a7ad8':'#d8b860';ctx.beginPath();ctx.arc(p.x,p.y,3.5,0,7);ctx.fill();ctx.fillStyle='#fffbe8';ctx.beginPath();ctx.arc(p.x,p.y,1.8,0,7);ctx.fill()}
    else if(p.kind==='arcane'){ctx.fillStyle='#5a6ad8';ctx.beginPath();ctx.arc(p.x,p.y,3,0,7);ctx.fill();ctx.fillStyle='#d8e0ff';ctx.beginPath();ctx.arc(p.x,p.y,1.5,0,7);ctx.fill()}
    else if(p.kind==='thorn'){const a=Math.atan2(p.vy,p.vx);ctx.save();ctx.translate(p.x,p.y);ctx.rotate(a);px(ctx,'#3a5a20',-5,-1,8,2);px(ctx,'#9fe060',-4,-.5,7,1);px(ctx,'#cfffb0',2,-1,2,2);ctx.restore()}
    else if(p.kind==='arrow'||p.kind==='parrow'){const a=Math.atan2(p.vy,p.vx);ctx.save();ctx.translate(p.x,p.y);ctx.rotate(a);px(ctx,p.kind==='parrow'?'#9fe060':'#c9a070',-6,-.5,8,1);px(ctx,'#e8e4da',2,-1,3,2);px(ctx,'#f4f0e6',-7,-1.5,2,3);ctx.restore()}
    else if(p.kind==='wave'){ctx.globalAlpha=.75;ctx.strokeStyle='#fff3c4';ctx.lineWidth=2;const a=Math.atan2(p.vy,p.vx);ctx.beginPath();ctx.arc(p.x-Math.cos(a)*6,p.y-Math.sin(a)*6,p.r+2,a-1,a+1);ctx.stroke();ctx.globalAlpha=1}
    else if(p.kind==='web'){ctx.strokeStyle='#e8e4da';ctx.lineWidth=1;ctx.beginPath();ctx.arc(p.x,p.y,3,0,7);ctx.moveTo(p.x-4,p.y);ctx.lineTo(p.x+4,p.y);ctx.moveTo(p.x,p.y-4);ctx.lineTo(p.x,p.y+4);ctx.stroke()}
    else if(p.kind==='rock'){px(ctx,'#1a1420',p.x-3,p.y-3,6,6);px(ctx,'#8a8f98',p.x-2,p.y-2,4,4)}
    else{ctx.fillStyle='#4a2580';ctx.beginPath();ctx.arc(p.x,p.y,4.5,0,7);ctx.fill();ctx.fillStyle=p.kind==='hex'?'#c8d0e0':'#c48aff';ctx.beginPath();ctx.arc(p.x,p.y,3,0,7);ctx.fill();px(ctx,'#fff',p.x-1,p.y-1,2,2)}}
  for(const b of bolts){ctx.strokeStyle=b.col?b.col:`rgba(200,216,255,${b.life*4})`;ctx.globalAlpha=Math.min(1,b.life*4);ctx.lineWidth=2;ctx.beginPath();b.pts.forEach((p,i)=>{if(!i)ctx.moveTo(p.x,p.y);else{const q=b.pts[i-1];ctx.lineTo((p.x+q.x)/2+rr(5),(p.y+q.y)/2+rr(5));ctx.lineTo(p.x,p.y)}});ctx.stroke();
    ctx.strokeStyle='#ffffff';ctx.lineWidth=1;ctx.stroke();ctx.globalAlpha=1}
  for(const r of rings){ctx.strokeStyle=`rgba(${r.col||'150,235,255'},${Math.min(1,r.life*2.5)})`;ctx.lineWidth=2;ctx.beginPath();ctx.arc(r.x,r.y,r.r,0,7);ctx.stroke()}
  for(const p of parts){ctx.globalAlpha=Math.min(1,p.life/p.max*1.5);ctx.fillStyle=p.col;const s=p.size;if(p.glow){ctx.globalCompositeOperation='lighter';ctx.fillRect(p.x-1,p.y-1,2,2);ctx.globalAlpha*=.3;ctx.fillRect(p.x-2.5,p.y-2.5,5,5);ctx.globalCompositeOperation='source-over'}else if(s>4){ctx.beginPath();ctx.arc(p.x,p.y,s,0,7);ctx.fill();ctx.globalAlpha*=.5;ctx.beginPath();ctx.arc(p.x+s*.6,p.y-s*.2,s*.8,0,7);ctx.fill()}else ctx.fillRect(p.x-s/2,p.y-s/2,s,s)}ctx.globalAlpha=1;
  /* exits */
  for(const e of EXITS){const ex=(e.x0+e.x1)/2*16+8,ey=(e.y0+e.y1)/2*16+8;if(Math.hypot(P.x-ex,P.y-ey)<90){const Z=ZONES[e.to];ctx.font='bold 7px sans-serif';ctx.textAlign='center';ctx.lineWidth=2;ctx.strokeStyle='#1a1420';const s=Z?'→ '+Z.n:'→ Акт II';ctx.strokeText(s,clamp(ex,cx+30,cx+VW-30),clamp(ey-14,cy+12,cy+VH-8));ctx.fillStyle='#f2d48a';ctx.fillText(s,clamp(ex,cx+30,cx+VW-30),clamp(ey-14,cy+12,cy+VH-8))}}
  /* god rays */
  const day=1-nightF();if(day>.05&&(ZID==='forest'||ZID==='village')){ctx.globalCompositeOperation='lighter';for(let i=0;i<6;i++){const bx=Math.floor(cx/180)*180+i*180-60+Math.sin(G.time*.2+i)*10,w=26+(i%3)*14;
    const g=ctx.createLinearGradient(bx,cy,bx+90,cy+VH);g.addColorStop(0,`rgba(255,240,190,${.10*day})`);g.addColorStop(1,'rgba(255,240,190,0)');ctx.fillStyle=g;ctx.beginPath();ctx.moveTo(bx,cy-10);ctx.lineTo(bx+w,cy-10);ctx.lineTo(bx+w+110,cy+VH+10);ctx.lineTo(bx+110,cy+VH+10);ctx.fill()}ctx.globalCompositeOperation='source-over'}
  if(G.state==='play'&&G.near){const n=G.near;ctx.font='bold 7px sans-serif';const tw=Math.ceil(ctx.measureText(n.label).width)+14,hgt=n.spr?imgH(n.spr):18,bx=Math.round(n.x-tw/2),by=Math.round(n.y-hgt-16);
    px(ctx,'#1a1420',bx,by,tw,11);px(ctx,'#ecdfc3',bx+1,by+1,tw-2,9);px(ctx,'#1a1420',bx+2,by+2,8,7);ctx.fillStyle='#ecdfc3';ctx.textAlign='center';ctx.fillText('E',bx+6,by+8.5);ctx.fillStyle='#1a1420';ctx.textAlign='left';ctx.fillText(n.label,bx+12,by+8.5)}
  ctx.textAlign='center';ctx.lineWidth=2;ctx.strokeStyle='#1a1420';
  for(const t of texts){ctx.font=t.big?'bold 9px sans-serif':'bold 7px sans-serif';ctx.globalAlpha=Math.min(1,t.life*2);ctx.strokeText(t.s,t.x,t.y);ctx.fillStyle=t.col;ctx.fillText(t.s,t.x,t.y)}ctx.globalAlpha=1;
  /* screen-space layers */
  ctx.setTransform(1,0,0,1,0,0);
  if(TINT[ZID]){ctx.fillStyle=TINT[ZID];ctx.fillRect(0,0,cv.width,cv.height)}
  const nf=nightF(),tgt=Math.max(nf*.62,ZID==='marsh'?.22:0);G.dark+=(tgt-G.dark)*Math.min(1,dt*2);
  if(G.dark>.01){dctx.globalCompositeOperation='source-over';dctx.clearRect(0,0,dk.width,dk.height);dctx.fillStyle=`rgba(8,10,32,${G.dark})`;dctx.fillRect(0,0,dk.width,dk.height);dctx.globalCompositeOperation='destination-out';
    const light=(x,y,rad)=>{const X=(x-cx)*AP,Y=(y-cy)*AP,R=rad*AP;if(X<-R||Y<-R||X>dk.width+R||Y>dk.height+R)return;const g=dctx.createRadialGradient(X,Y,0,X,Y,R);g.addColorStop(0,'rgba(0,0,0,1)');g.addColorStop(1,'rgba(0,0,0,0)');dctx.fillStyle=g;dctx.beginPath();dctx.arc(X,Y,R,0,7);dctx.fill()};
    const rb=(RACES[P.race]||{}).b||{};light(P.x,P.y-10,(rb.light?150:105)+(P.flags.lantern?25:0));
    for(const p of PROPS)if(p.light)light(p.x,p.y-10,p.light*(p.fire?1+.08*Math.sin(G.time*13):1));
    for(const p of PROPS)if(p.img==='cottage'||p.img==='treehouse'||p.win)light(p.x,p.y-16,p.win?40:30);
    for(const p of proj)if(p.owner==='p')light(p.x,p.y,30);for(const w of warns)light(w.x,w.y,30);
    ctx.drawImage(dk,0,0)}
  ctx.drawImage(vg,0,0);
  if(P.hp<P.S.maxHp*.25){ctx.fillStyle=`rgba(180,20,20,${.12+.08*Math.sin(G.time*6)})`;ctx.fillRect(0,0,cv.width,cv.height)}
}
function renderTitle(t){ctx.setTransform(1,0,0,1,0,0);ctx.fillStyle='#0b0d18';ctx.fillRect(0,0,cv.width,cv.height);if(!ZONE)return;
  const cx=Math.round(clamp(20+(Math.sin(t*.06)*.5+.5)*(WW-VW-40),0,Math.max(0,WW-VW))*AP)/AP,cy=Math.round(clamp(WH*.32-VH/2+Math.sin(t*.09)*30,0,Math.max(0,WH-VH))*AP)/AP;
  ctx.setTransform(AP,0,0,AP,-cx*AP,-cy*AP);const sw=Math.min(VW,WW-cx),sh=Math.min(VH,WH-cy);ctx.drawImage(worldCv,cx*AP,cy*AP,sw*AP,sh*AP,cx,cy,sw,sh);
  const L=PROPS.filter(p=>p.x>cx-60&&p.x<cx+VW+60&&p.y>cy-20&&p.y<cy+VH+100).map(p=>[p.y,()=>drawImg(p.img,p.x,p.y)]);
  NPCS.forEach(n=>L.push([n.y,()=>{shadow(n.x,n.y,imgW(n.spr)*.3);drawImg(n.spr,n.x,n.y+Math.sin(t*2+n.x)*.3,false)}]));L.sort((a,b)=>a[0]-b[0]).forEach(l=>l[1]());
  ctx.globalCompositeOperation='lighter';for(let i=0;i<6;i++){const bx=Math.floor(cx/180)*180+i*180-60,w=26+(i%3)*14;const g=ctx.createLinearGradient(bx,cy,bx+90,cy+VH);g.addColorStop(0,'rgba(255,240,190,.1)');g.addColorStop(1,'rgba(255,240,190,0)');ctx.fillStyle=g;ctx.beginPath();ctx.moveTo(bx,cy-10);ctx.lineTo(bx+w,cy-10);ctx.lineTo(bx+w+110,cy+VH+10);ctx.lineTo(bx+110,cy+VH+10);ctx.fill()}ctx.globalCompositeOperation='source-over';
  ctx.setTransform(1,0,0,1,0,0);ctx.drawImage(vg,0,0)}
