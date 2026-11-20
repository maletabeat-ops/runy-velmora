'use strict';
/* ===== render ===== */
const cv=$('cv'),ctx=cv.getContext('2d');
let VW=320,VH=200,SCALE=3;const dk=cnv(1,1),dctx=dk.getContext('2d'),vg=cnv(1,1);
function resize(){const w=innerWidth,h=innerHeight;SCALE=Math.max(2,Math.round(Math.min(w,h)/230));
  VW=Math.ceil(w/SCALE);VH=Math.ceil(h/SCALE);cv.width=VW;cv.height=VH;cv.style.width=VW*SCALE+'px';cv.style.height=VH*SCALE+'px';ctx.imageSmoothingEnabled=false;
  dk.width=VW;dk.height=VH;vg.width=VW;vg.height=VH;const vx=vg.getContext('2d'),g=vx.createRadialGradient(VW/2,VH/2,Math.min(VW,VH)*.35,VW/2,VH/2,Math.max(VW,VH)*.75);
  g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(1,'rgba(8,4,16,.45)');vx.fillStyle=g;vx.fillRect(0,0,VW,VH)}
addEventListener('resize',resize);
const TINT=[null,null,'rgba(0,25,10,.16)','rgba(30,45,0,.16)',null,'rgba(30,10,55,.22)',null];
function shadow(x,y,rx=5){ctx.fillStyle='rgba(0,0,0,.28)';ctx.beginPath();ctx.ellipse(x,y+3,rx,2,0,0,7);ctx.fill()}
function spr(img,x,y,flip,white,w,h){const s=flip?(white?img.fw:img.f):(white?img.w:img);if(w)ctx.drawImage(s,Math.round(x),Math.round(y),Math.round(w),Math.round(h));else ctx.drawImage(s,Math.round(x),Math.round(y))}
function drawEnemy(e){const f=e.f,wh=e.flash>0,S=SPR[f.spr];
  if(e.elite||f.boss){ctx.globalAlpha=.35+.15*Math.sin(G.time*6);ctx.fillStyle=f.boss?'#e0402e':'#f2c14e';ctx.beginPath();ctx.ellipse(e.x,e.y+3,e.r+4,3.5,0,0,7);ctx.fill();ctx.globalAlpha=1}
  shadow(e.x,e.y,e.r);const jit=e.wind>0?rr(1):0;
  if(f.ai==='ghost')ctx.globalAlpha=.55+.25*Math.sin(G.time*4+e.hx);
  if(f.ai==='hop'||e.type==='queen'){const big=e.type==='queen'?2:f.small?.7:1;const ph=e.t%1.1;let s=ph<.45?Math.sin(ph/.45*Math.PI)*.25:0,z=0;
    if(e.type==='queen'){s=0;z=e.jump>0?Math.sin((1-e.jump/.8)*Math.PI)*22:0}
    const w=16*big*(1-s*.5),h=16*big*(1+s);spr(S,e.x-w/2+jit,e.y+3*big-h-s*6-z,e.fl,wh,w,h);
    if(e.type==='queen'){const cx=e.x,cy=e.y+6-h-z;px(ctx,'#f2c14e',cx-6,cy+2,12,3);px(ctx,'#f2c14e',cx-6,cy-1,2,3);px(ctx,'#f2c14e',cx-1,cy-2,2,4);px(ctx,'#f2c14e',cx+4,cy-1,2,3);px(ctx,'#e0402e',cx-1,cy+3,2,1)}}
  else if(f.big){const fl=e.type==='lich'?Math.sin(G.time*2.5)*2:0;spr(S,e.x-16+jit,e.y-29+fl,e.fl,wh,32,32)}
  else spr(S,e.x-8+jit,e.y-13+(f.ai==='ghost'?Math.sin(G.time*3+e.hx)*2:0),e.fl,wh);
  ctx.globalAlpha=1;
  if(e.wind>0){const b=e.f.big?30:18;px(ctx,'#1a1420',e.x-2,e.y-b-9,4,9);px(ctx,'#e0402e',e.x-1,e.y-b-8,2,5);px(ctx,'#e0402e',e.x-1,e.y-b-2,2,1)}
  if(e.swing>0){const a=Math.atan2(P.y-e.y,P.x-e.x);ctx.strokeStyle='rgba(255,120,100,.8)';ctx.lineWidth=2;ctx.beginPath();ctx.arc(e.x,e.y-4,12,a-.9,a+.9);ctx.stroke()}
  if((e.hp<e.maxHp||e.elite)&&!f.boss){const y=e.y-(f.big?32:18);px(ctx,'#1a1420',e.x-8,y,16,3);px(ctx,e.elite?'#f2c14e':'#e0402e',e.x-7,y+1,14*Math.max(0,e.hp)/e.maxHp,1);
    ctx.font='bold 6px monospace';ctx.textAlign='right';ctx.fillStyle=e.lvl>=P.lvl+3?'#ff6a5a':e.lvl>P.lvl?'#f2c14e':'#ecdfc3';ctx.fillText(e.lvl,e.x-9,y+3)}}
function drawPlayer(){const S=SPR[CLS[P.cls].spr];
  for(const t of trails){ctx.globalAlpha=t.life*1.6;spr(S,t.x-8,t.y-13,t.fl,true);}ctx.globalAlpha=1;
  if(P.buff>0){ctx.globalAlpha=.35+.15*Math.sin(G.time*8);ctx.fillStyle='#e0402e';ctx.beginPath();ctx.ellipse(P.x,P.y+3,9,3.5,0,0,7);ctx.fill();ctx.globalAlpha=1}
  if(P.inv>0&&P.dash<=0&&(G.time*20|0)%2)return;shadow(P.x,P.y);const bob=P.moving&&((P.anim*8)|0)%2?-1:0;spr(S,P.x-8,P.y-13+bob,P.fl)}
function drawItemIcon(it,x,y){const s=itemSpr(it);ctx.drawImage(s,Math.round(x-6),Math.round(y-6))}
function render(dt){
  ctx.fillStyle='#0f0d14';ctx.fillRect(0,0,VW,VH);if(!P)return;
  const k=Math.min(1,dt*7);G.cx+=(P.x-VW/2-G.cx)*k;G.cy+=(P.y-VH/2-G.cy)*k;
  if(VW>=WW)G.cx=(WW-VW)/2;else G.cx=clamp(G.cx,0,WW-VW);if(VH>=WH)G.cy=(WH-VH)/2;else G.cy=clamp(G.cy,0,WH-VH);
  let cx=Math.round(G.cx),cy=Math.round(G.cy);if(G.shake>0&&!reduced){cx+=Math.round(rr(2));cy+=Math.round(rr(2))}
  G.camX=cx;G.camY=cy;
  ctx.save();ctx.translate(-cx,-cy);ctx.drawImage(worldCv,cx,cy,VW,VH,cx,cy,VW,VH);
  const x0=Math.max(0,cx/16|0),y0=Math.max(0,cy/16|0),x1=Math.min(W-1,x0+(VW/16|0)+1),y1=Math.min(H-1,y0+(VH/16|0)+1),tq=Math.floor(G.time*2);
  for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++)if(at(x,y)===T.WATER&&hash(x,y,tq)<.12)px(ctx,'#cfeaff',x*16+2+((hash(x,y,tq+7)*11)|0),y*16+3+((hash(x,y,tq+3)*10)|0),3,1);
  if(!G.gateOpen){ctx.globalAlpha=.25+.2*Math.sin(G.time*3);ctx.fillStyle='#b07aff';ctx.fillRect(GATE.x*16-2,GATE.y*16,20,16);ctx.globalAlpha=1}
  for(const w of warns){const pr=1-w.t/w.max,col=w.friendly?'255,150,70':'224,64,46';ctx.fillStyle=`rgba(${col},.16)`;ctx.strokeStyle=`rgba(${col},.7)`;ctx.lineWidth=1;
    if(w.kind==='circle'){ctx.beginPath();ctx.arc(w.x,w.y,w.r,0,7);ctx.fill();ctx.stroke();ctx.fillStyle=`rgba(${col},.3)`;ctx.beginPath();ctx.arc(w.x,w.y,w.r*pr,0,7);ctx.fill()}
    else{ctx.save();ctx.translate(w.x,w.y);ctx.rotate(w.a);ctx.fillRect(0,-w.w/2,w.len,w.w);ctx.strokeRect(0,-w.w/2,w.len,w.w);ctx.fillStyle=`rgba(${col},.3)`;ctx.fillRect(0,-w.w/2,w.len*pr,w.w);ctx.restore()}}
  for(const z of zones){ctx.strokeStyle='rgba(242,193,78,.5)';ctx.setLineDash([3,3]);ctx.beginPath();ctx.arc(z.x,z.y,z.r,0,7);ctx.stroke();ctx.setLineDash([])}
  const inView=(x,y,m=40)=>x>cx-m&&x<cx+VW+m&&y>cy-m&&y<cy+VH+m;
  const L=[];
  for(const s of SHRINES)if(inView(s.x*16,s.y*16))L.push([s.y*16+14,()=>{const X=s.x*16,Y=s.y*16-4;ctx.drawImage(SPR.shrine,X,Y);const pulse=.6+.4*Math.sin(G.time*4+s.x);
    if(!s.done){ctx.globalAlpha=pulse;px(ctx,s.col,X+7,Y+3,2,2);ctx.globalAlpha=.25*pulse;ctx.fillStyle=s.col;ctx.beginPath();ctx.arc(X+8,Y+4,6,0,7);ctx.fill();ctx.globalAlpha=1}else px(ctx,'#4f535c',X+7,Y+3,2,2);
    if(s.active){ctx.globalAlpha=.18+.1*Math.sin(G.time*10);ctx.fillStyle=s.col;ctx.fillRect(X+5,Y-60,6,64);ctx.globalAlpha=1}}]);
  for(const c of CHESTS)if(inView(c.x,c.y))L.push([c.y,()=>{shadow(c.x,c.y-2,7);ctx.drawImage(c.open?SPR.chesto:SPR.chest,c.x-8,c.y-12);
    if(!c.open&&Math.sin(G.time*3+c.x)>.85)px(ctx,'#fff3c4',c.x-3+((G.time*7|0)%7),c.y-9,1,1)}]);
  for(const n of NPCS)if(inView(n.x,n.y))L.push([n.y,()=>{shadow(n.x,n.y);spr(SPR[n.spr],n.x-8,n.y-13,n.x>P.x);
    const mark=(n.id==='elder'&&G.quest===0)||(n.id==='tara'&&P.bounty.active&&BOUNTIES[P.bounty.i]&&P.bounty.prog>=BOUNTIES[P.bounty.i].n)||(n.id==='tara'&&G.quest>0&&!P.bounty.active&&BOUNTIES[P.bounty.i]);
    if(mark){const b=Math.abs(Math.sin(G.time*4))*2;px(ctx,'#1a1420',n.x-2,n.y-25-b,4,9);px(ctx,'#f2c14e',n.x-1,n.y-24-b,2,5);px(ctx,'#f2c14e',n.x-1,n.y-18-b,2,2)}}]);
  for(const p of pickups)if(inView(p.x,p.y))L.push([p.y,()=>{if(p.k!=='item'&&p.t>35&&(G.time*8|0)%2)return;const b=Math.abs(Math.sin(p.t*4))*2;shadow(p.x,p.y-1,3);
    if(p.k==='gold'){px(ctx,'#8a5f14',p.x-2,p.y-4-b,5,5);px(ctx,'#f2c14e',p.x-2,p.y-5-b,4,4);px(ctx,'#fff3c4',p.x-1,p.y-4-b,1,1);if(p.v>20){px(ctx,'#f2c14e',p.x+2,p.y-3-b,3,3)}}
    else if(p.k==='pot')ctx.drawImage(SPR[p.kind==='hp'?'pot':'potmp'],Math.round(p.x-6),Math.round(p.y-10-b));
    else{const c=RAR[p.it.rar].c;if(p.it.rar>=2){ctx.globalAlpha=.18+.08*Math.sin(G.time*4);ctx.fillStyle=c;ctx.fillRect(p.x-2,p.y-60,4,58);ctx.globalAlpha=1}
      ctx.globalAlpha=.5;ctx.fillStyle=c;ctx.beginPath();ctx.arc(p.x,p.y-6-b,7,0,7);ctx.fill();ctx.globalAlpha=1;drawItemIcon(p.it,p.x,p.y-6-b)}}]);
  for(const e of enemies)if(inView(e.x,e.y))L.push([e.y,()=>drawEnemy(e)]);
  L.push([P.y,drawPlayer]);
  L.sort((a,b)=>a[0]-b[0]).forEach(l=>l[1]());
  if(P.swing){const s=P.swing,pr=1-s.t/s.max,a=Math.atan2(s.a.y,s.a.x);ctx.strokeStyle=`rgba(255,250,235,${.9-pr*.7})`;ctx.lineWidth=2;ctx.beginPath();
    if(s.spin)ctx.arc(P.x,P.y-5,s.r,a+pr*6.283,a+pr*6.283+4);else ctx.arc(P.x,P.y-5,s.r,a-s.w*.8+pr*.6,a+s.w*.2+pr);ctx.stroke()}
  for(const p of proj){
    if(p.kind==='fire'){ctx.fillStyle='#ff7a2a';ctx.beginPath();ctx.arc(p.x,p.y,3.5,0,7);ctx.fill();ctx.fillStyle='#ffe08a';ctx.beginPath();ctx.arc(p.x,p.y,1.8,0,7);ctx.fill()}
    else if(p.kind==='arcane'){ctx.fillStyle='#5a6ad8';ctx.beginPath();ctx.arc(p.x,p.y,3.2,0,7);ctx.fill();ctx.fillStyle='#d8e0ff';ctx.beginPath();ctx.arc(p.x,p.y,1.6,0,7);ctx.fill()}
    else if(p.kind==='spark'){ctx.fillStyle='#ffb04a';ctx.beginPath();ctx.arc(p.x,p.y,2.2,0,7);ctx.fill();px(ctx,'#fff3c4',p.x-.5,p.y-.5,1,1)}
    else if(p.kind==='arrow'||p.kind==='parrow'){const a=Math.atan2(p.vy,p.vx);ctx.save();ctx.translate(p.x,p.y);ctx.rotate(a);px(ctx,p.kind==='parrow'?'#9fe060':'#c9a070',-6,-.5,8,1);px(ctx,'#e8e4da',2,-1,3,2);px(ctx,'#f4f0e6',-7,-1.5,2,3);ctx.restore()}
    else if(p.kind==='wave'){ctx.globalAlpha=.7;ctx.strokeStyle='#fff3c4';ctx.lineWidth=2;const a=Math.atan2(p.vy,p.vx);ctx.beginPath();ctx.arc(p.x-Math.cos(a)*6,p.y-Math.sin(a)*6,8,a-1,a+1);ctx.stroke();ctx.globalAlpha=1}
    else if(p.kind==='web'){ctx.strokeStyle='#e8e4da';ctx.lineWidth=1;ctx.beginPath();ctx.arc(p.x,p.y,3,0,7);ctx.moveTo(p.x-4,p.y);ctx.lineTo(p.x+4,p.y);ctx.moveTo(p.x,p.y-4);ctx.lineTo(p.x,p.y+4);ctx.stroke()}
    else if(p.kind==='rock'){px(ctx,'#1a1420',p.x-3,p.y-3,6,6);px(ctx,'#8a8f98',p.x-2,p.y-2,4,4)}
    else if(p.kind==='poison'){ctx.fillStyle='#5a2a80';ctx.beginPath();ctx.arc(p.x,p.y,4,0,7);ctx.fill();ctx.fillStyle='#b07ad8';ctx.beginPath();ctx.arc(p.x,p.y,2.6,0,7);ctx.fill()}
    else{ctx.fillStyle='#4a2580';ctx.beginPath();ctx.arc(p.x,p.y,4.5,0,7);ctx.fill();ctx.fillStyle=p.kind==='hex'?'#7fe07a':'#c48aff';ctx.beginPath();ctx.arc(p.x,p.y,3,0,7);ctx.fill();px(ctx,'#fff',p.x-1,p.y-1,2,2)}}
  for(const b of bolts){ctx.strokeStyle=`rgba(200,216,255,${b.life*4})`;ctx.lineWidth=2;ctx.beginPath();b.pts.forEach((p,i)=>{if(!i)ctx.moveTo(p.x,p.y);else{const q=b.pts[i-1];ctx.lineTo((p.x+q.x)/2+rr(5),(p.y+q.y)/2+rr(5));ctx.lineTo(p.x,p.y)}});ctx.stroke();
    ctx.strokeStyle=`rgba(255,255,255,${b.life*4})`;ctx.lineWidth=1;ctx.stroke()}
  for(const r of rings){ctx.strokeStyle=`rgba(${r.col||'150,235,255'},${Math.min(1,r.life*2.5)})`;ctx.lineWidth=2;ctx.beginPath();ctx.arc(r.x,r.y,r.r,0,7);ctx.stroke()}
  for(const p of parts){ctx.globalAlpha=Math.min(1,p.life/p.max*1.5);ctx.fillStyle=p.col;const s=p.size;ctx.fillRect(p.x-s/2,p.y-s/2,s,s)}ctx.globalAlpha=1;
  if(G.state==='play'&&G.near){const n=G.near;ctx.font='bold 7px monospace';const tw=Math.ceil(ctx.measureText(n.label).width)+14,bx=Math.round(n.x-tw/2),by=Math.round(n.y)-34;
    px(ctx,'#1a1420',bx,by,tw,11);px(ctx,'#ecdfc3',bx+1,by+1,tw-2,9);px(ctx,'#1a1420',bx+2,by+2,8,7);ctx.fillStyle='#ecdfc3';ctx.textAlign='center';ctx.fillText('E',bx+6,by+8);ctx.fillStyle='#1a1420';ctx.textAlign='left';ctx.fillText(n.label,bx+12,by+8)}
  ctx.textAlign='center';ctx.lineWidth=2;ctx.strokeStyle='#1a1420';
  for(const t of texts){ctx.font=t.big?'bold 9px monospace':'bold 7px monospace';ctx.globalAlpha=Math.min(1,t.life*2);ctx.strokeText(t.s,t.x,t.y);ctx.fillStyle=t.col;ctx.fillText(t.s,t.x,t.y)}ctx.globalAlpha=1;
  ctx.restore();
  const r=RG(P.x/16|0,P.y/16|0);if(TINT[r]){ctx.fillStyle=TINT[r];ctx.fillRect(0,0,VW,VH)}
  const inR=r===6;G.dark+=((inR?1:0)-G.dark)*Math.min(1,dt*3);
  if(G.dark>.01){dctx.globalCompositeOperation='source-over';dctx.clearRect(0,0,VW,VH);dctx.fillStyle=`rgba(10,6,20,${.82*G.dark})`;dctx.fillRect(0,0,VW,VH);dctx.globalCompositeOperation='destination-out';
    const light=(x,y,rad)=>{const g=dctx.createRadialGradient(x-cx,y-cy,0,x-cx,y-cy,rad);g.addColorStop(0,'rgba(0,0,0,1)');g.addColorStop(1,'rgba(0,0,0,0)');dctx.fillStyle=g;dctx.beginPath();dctx.arc(x-cx,y-cy,rad,0,7);dctx.fill()};
    light(P.x,P.y-6,95);for(const p of proj)if(p.owner==='p'&&(p.kind==='fire'||p.kind==='spark'||p.kind==='arcane'))light(p.x,p.y,40);for(const e of enemies)if(e.type==='lich')light(e.x,e.y-14,45);for(const w of warns)light(w.x,w.y,30);ctx.drawImage(dk,0,0)}
  ctx.drawImage(vg,0,0);
  if(P.hp<P.S.maxHp*.25){ctx.fillStyle=`rgba(180,20,20,${.12+.08*Math.sin(G.time*6)})`;ctx.fillRect(0,0,VW,VH)}
}
