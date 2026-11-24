'use strict';
/* ===== core: utils, art loading, zone map, tiles, minimap, audio ===== */
const $=id=>document.getElementById(id);
const TS=16,AP=2;              // logic tile = 16 units; 1 unit = 2 art pixels
let W=60,H=45,WW=W*TS,WH=H*TS;
const T={GRASS:0,PATH:1,WATER:2,SHALLOW:3,MUD:4,BLOCK:5,WALL:6,FLOOR:7,MIST:8,SHADOW:9,BRIDGE:10,FLOWERS:11,DARK:12,EXIT:13,SAND:14};
const SOLID=new Set([T.WATER,T.BLOCK,T.WALL,T.MIST,T.SHADOW]);
const PSOLID=new Set([T.BLOCK,T.WALL]);
let map=new Uint8Array(W*H),col=new Uint8Array(W*H);
const at=(x,y)=>(x<0||y<0||x>=W||y>=H)?T.BLOCK:map[y*W+x];
const set=(x,y,v)=>{if(x>=0&&y>=0&&x<W&&y<H)map[y*W+x]=v};
const rect=(x0,y0,x1,y1,v)=>{for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++)set(x,y,v)};
const disc=(cx,cy,r,v)=>{for(let y=cy-r;y<=cy+r;y++)for(let x=cx-r;x<=cx+r;x++)if((x-cx)**2+(y-cy)**2<=r*r)set(x,y,v)};
const rr=n=>(Math.random()*2-1)*n,rint=n=>(Math.random()*n)|0,pick=a=>a[rint(a.length)];
const clamp=(v,a,b)=>v<a?a:v>b?b:v;
function pickW(o){let s=0;for(const k in o)s+=o[k];let r=Math.random()*s;for(const k in o){r-=o[k];if(r<0)return k}return Object.keys(o)[0]}
function mulberry32(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
function hash(x,y,s){let h=(Math.imul(x,374761393)+Math.imul(y,668265263)+Math.imul(s|0,982451653))|0;h=Math.imul(h^(h>>>13),1274126177);return((h^(h>>>16))>>>0)/4294967296}
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
let UIDN=1;const uid=()=>Date.now().toString(36)+'_'+(UIDN++);
function cnv(w,h){const c=document.createElement('canvas');c.width=w;c.height=h;return c}
function px(c,col,x,y,w=1,h=1){c.fillStyle=col;c.fillRect(x,y,w,h)}

/* ----- art (images made by the player in Nano Banana) ----- */
const ART_NAMES='irel,hare,moth,guard,wolf,p_irel,campfire,cultist,mistborn,p_glowbug,mushrooms,b_mistwitch,b_devourer,p_moth,p_motta,birch,b_nox,boar,pillar,bush,p_nox,deadtree,nox,glowbug,p_hare,oak,shard,mossrock,motta,rock,p_shard,spider,spruce,well,chest_open,treehouse,cottage,p_halfmoon,halfmoon_n,fence,signpost,p_kornel,kornel,p_rootfolk,rootfolk,sporeling,b_executioner,stump,halfmoon_d,lantern,chest'.split(',');
const IMG={};
function prepImg(name,img){const w=img.width,h=img.height,c=cnv(w,h);c.getContext('2d').drawImage(img,0,0);
  const f=cnv(w,h),fx=f.getContext('2d');fx.translate(w,0);fx.scale(-1,1);fx.drawImage(c,0,0);
  const wh=s=>{const o=cnv(w,h),ox=o.getContext('2d');ox.drawImage(s,0,0);ox.globalCompositeOperation='source-in';ox.fillStyle='#fff';ox.fillRect(0,0,w,h);return o};
  IMG[name]={c,f,w:wh(c),fw:wh(f),W:w,H:h,url:null}}
const ATLAS={};
function loadAtlas(){return Promise.all([['base','tiles/lpc_base.png'],['build','tiles/lpc_build.png']].map(([k,u])=>new Promise(res=>{const i=new Image();i.onload=()=>{ATLAS[k]=i;res()};i.onerror=()=>res();i.src=u})))}
const OPT_ART=['rein_guardian','rein_blade','rein_ranger','rein_mage','rein_druid','rein_light','p_rein'];
function loadArt(){return Promise.all([loadAtlas(),...OPT_ART.map(n=>new Promise(res=>{const i=new Image();i.onload=()=>{prepImg(n,i);res()};i.onerror=()=>res();i.src='art/'+n+'.png'})),...ART_NAMES.map(n=>new Promise(res=>{const i=new Image();i.onload=()=>{prepImg(n,i);res()};i.onerror=()=>{console.error('art missing',n);res()};i.src='art/'+n+'.png'}))])}
function artURL(n,scale=1){const I=IMG[n];if(!I)return'';const k='u'+scale;if(I[k])return I[k];const c=cnv(I.W*scale,I.H*scale),x=c.getContext('2d');x.imageSmoothingEnabled=false;x.drawImage(I.c,0,0,c.width,c.height);return I[k]=c.toDataURL()}

/* ----- small code-drawn sprites: item icons ----- */
const PAL={k:'#1a1420',s:'#f0c8a0',b:'#3a5fc8',B:'#24398a',h:'#6b4226',H:'#4a2a18',y:'#f2c14e',w:'#f4f0e6',W:'#c9c2b2',g:'#8a8f98',G:'#4f535c',r:'#e0402e',R:'#7a2018',p:'#c48aff',P:'#4a2580',c:'#8fe8ff',e:'#6ac04a',E:'#2f7a35',t:'#8a5a32',T:'#5e3a1e'};
const SRC={
staff:["..........kk",".........kck","........kcpk",".......kkpk.","......khkk..",".....khk....","....khk.....","...khk......","..khk.......",".khk........","khk.........","kk.........."],
sword:["..........kk",".........kwk","........kwgk",".......kwgk.","......kwgk..",".....kwgk...","..k.kwgk....","...kygk.....","..kyyk......",".khk.k......","khk.........","kk.........."],
bow:["....kkk.....","...khhkk....","..khk..wk...","..kh....w...",".kh.....w...",".kh..kkkwkk.",".kh.....w...","..kh....w...","..khk..wk...","...khhkk....","....kkk.....","............"],
shield:["..kkkkkkkk..",".kggggggggk.",".kgcggggcgk.",".kgggyyggg k",".kggyccyggk.",".kggyccyggk.",".kgggyyggk..","..kggggggk..","..kkggggkk..","....kggk....",".....kk.....","............"],
branch:[".........kek","........keEk",".......kTk..","......kTk...",".....kTtk...","....kTk.....","...kTk......","..kTk.......",".kTtk.......","kTk.........","kk..........","............"],
lamp:["....kkkk....","...k....k...","..kkkkkkkk..","..kyyyyyyk..","..kywwwwyk..","..kywccwyk..","..kywccwyk..","..kywwwwyk..","..kyyyyyyk..","..kkkkkkkk..","....kkkk....","............"],
armor:["..kk....kk..",".kggk..kggk.",".kgggkkgggk.","..kgggggggk.","..kgggwgggk.","..kgggwgggk.","..kgggggggk.","..kgggggggk.","..kGGGGGGGk.","...kkkkkkk..","............","............"],
amulet:["..k......k..","...k....k...","....k..k....",".....kk.....","....kyyk....","...kyccyk...","...kyccyk...","....kyyk....",".....kk.....","............","............","............"],
ring:["....kkk.....","...kcwck....","....kkk.....","...kyyyk....","..ky...yk...","..ky...yk...","..ky...yk...","...kyyyk....","....kkk.....","............","............","............"],
pot:["....kkk.....","....khk.....","...kk.kk....","..kwrrrrk...",".kwrrrrrrk..",".krrrrrrrk..",".krrrrrrrk..","..kRrrrRk...","...kkkkk....","............","............","............"]};
function mk(rows,ov){const pal=ov?{...PAL,...ov}:PAL;const w=Math.max(...rows.map(r=>r.length)),h=rows.length,c=cnv(w,h),x=c.getContext('2d');
  rows.forEach((r,j)=>{for(let i=0;i<r.length;i++){const col=pal[r[i]];if(col&&r[i]!=='.'){x.fillStyle=col;x.fillRect(i,j,1,1)}}});return c}
const SPR={};for(const k in SRC)SPR[k]=mk(SRC[k]);SPR.potmp=mk(SRC.pot,{r:'#4a7fe0',R:'#24398a'});
function bigURL(s,scale){const c=cnv(s.width*scale,s.height*scale),x=c.getContext('2d');x.imageSmoothingEnabled=false;x.drawImage(s,0,0,c.width,c.height);return c.toDataURL()}
const ICON={};Object.keys(SPR).forEach(k=>ICON[k]=bigURL(SPR[k],3));

/* ----- tiles: painted at 32 art pixels per tile ----- */
const BIOME={village:{g:['#4a7d3e','#3d6c34','#5e9449','#6fa654'],p:['#8e6c44','#77593a','#a8845a']},forest:{g:['#2f5a33','#264d2c','#3b6b3c','#4a7a44'],p:['#6e5434','#5a4429','#86683f']},
  marsh:{g:['#45563a','#384830','#556846','#62744e'],p:['#5c5136','#4a4129','#6e6244']},ruin:{g:['#4a4a52','#3c3c44','#5a5a64','#6a6a74'],p:['#6e6a64','#5a5650','#86827a']}};
let BIO=BIOME.village;
let worldCv=cnv(1,1),wx=worldCv.getContext('2d');
function drawTile(c,tx,ty,over){const t=at(tx,ty),X=tx*32,Y=ty*32,h=s=>hash(tx,ty,s),g=BIO.g,p=BIO.p;
  if(over){if(t===T.FLOWERS){const cols=['#e8e0f8','#f2d48a','#c8a8ff','#8fd8ff'];for(let i=0;i<5;i++){const x=X+3+((h(i+60)*25)|0),y=Y+3+((h(i+70)*25)|0);px(c,'#2e5a2a',x+1,y+2,1,2);px(c,cols[(h(i+90)*4)|0],x,y,3,2);px(c,'#fff8d0',x+1,y,1,1)}}
    else if(t===T.DARK){for(let i=0;i<8;i++)px(c,'rgba(20,50,25,.35)',X+((h(i+200)*28)|0),Y+((h(i+210)*28)|0),4,3)}
    else if(t===T.BRIDGE){px(c,'#8a6038',X+2,Y,28,32);for(let i=0;i<4;i++){px(c,'#5e3e22',X+2,Y+i*8+6,28,2);px(c,'#a87848',X+2,Y+i*8,28,1)}px(c,'#4a2e18',X,Y,3,32);px(c,'#4a2e18',X+29,Y,3,32)}return}
  const grass=(dark)=>{px(c,dark?g[1]:g[0],X,Y,32,32);for(let i=0;i<22;i++){const x=X+((h(i)*31)|0),y=Y+((h(i+40)*29)|0);px(c,i%3?g[1]:g[2],x,y,1,2+((h(i+80)*2)|0))}
    for(let i=0;i<4;i++)if(h(i+120)<.5){const x=X+((h(i+130)*29)|0),y=Y+((h(i+140)*28)|0);px(c,g[3],x,y,1,1);px(c,g[2],x,y+1,1,2)}};
  const edge=(fn,isSame)=>{for(const[dx,dy]of[[0,-1],[0,1],[-1,0],[1,0]]){if(isSame(at(tx+dx,ty+dy)))continue;for(let i=0;i<32;i+=1){const d=2+((hash(tx*32+i,ty*32+dx*7+dy*3,9)*4)|0);
      if(dy)fn(X+i,dy<0?Y:Y+32-d,1,d);else fn(dx<0?X:X+32-d,Y+i,d,1)}}};
  switch(t){
  case T.GRASS:case T.BLOCK:case T.EXIT:case T.MIST:case T.SHADOW:grass(false);break;
  case T.DARK:grass(false);for(let i=0;i<16;i++)px(c,g[1],X+((h(i+200)*31)|0),Y+((h(i+210)*29)|0),1,3);for(let i=0;i<5;i++)px(c,g[3],X+((h(i+230)*31)|0),Y+((h(i+240)*29)|0),1,1);break;
  case T.FLOWERS:grass(false);{const cols=['#e8e0f8','#f2d48a','#c8a8ff','#8fd8ff'];for(let i=0;i<5;i++){const x=X+3+((h(i+60)*25)|0),y=Y+3+((h(i+70)*25)|0);px(c,'#2e5a2a',x+1,y+2,1,2);px(c,cols[(h(i+90)*4)|0],x,y,3,2);px(c,'#fff8d0',x+1,y,1,1)}}break;
  case T.PATH:px(c,p[0],X,Y,32,32);for(let i=0;i<14;i++)px(c,i%2?p[1]:p[2],X+((h(i)*30)|0),Y+((h(i+20)*30)|0),2,1);edge((x,y,w,hh)=>px(c,g[0],x,y,w,hh),v=>v===T.PATH||v===T.BRIDGE||v===T.EXIT);break;
  case T.SAND:px(c,'#c8b07a',X,Y,32,32);for(let i=0;i<10;i++)px(c,i%2?'#b09868':'#dcc898',X+((h(i)*31)|0),Y+((h(i+20)*31)|0),1,1);break;
  case T.MUD:px(c,'#4b4530',X,Y,32,32);for(let i=0;i<3;i++)px(c,'#36504a',X+((h(i)*20)|0),Y+((h(i+5)*24)|0),8+((h(i+9)*6)|0),3);for(let i=0;i<6;i++)px(c,'#5c5640',X+((h(i+30)*30)|0),Y+((h(i+40)*30)|0),2,1);edge((x,y,w,hh)=>px(c,g[0],x,y,w,hh),v=>v!==T.GRASS&&v!==T.DARK&&v!==T.FLOWERS&&v!==T.BLOCK);break;
  case T.WATER:case T.SHALLOW:{const deep=t===T.WATER,base=BIO===BIOME.marsh?(deep?'#2a4a44':'#3d6458'):(deep?'#24507c':'#3a7898');px(c,base,X,Y,32,32);
    for(let i=0;i<4;i++)px(c,deep?(BIO===BIOME.marsh?'#355a50':'#30628e'):'#5090aa',X+((h(i)*24)|0),Y+4+i*7,6,1);
    edge((x,y,w,hh)=>px(c,BIO===BIOME.marsh?'#4b4530':'#c8b07a',x,y,w,hh),v=>v===T.WATER||v===T.SHALLOW||v===T.BRIDGE);break}
  case T.BRIDGE:px(c,'#24507c',X,Y,32,32);px(c,'#8a6038',X+2,Y,28,32);for(let i=0;i<4;i++){px(c,'#5e3e22',X+2,Y+i*8+6,28,2);px(c,'#a87848',X+2,Y+i*8,28,1)}px(c,'#4a2e18',X,Y,3,32);px(c,'#4a2e18',X+29,Y,3,32);break;
  case T.WALL:px(c,'#4a4a52',X,Y,32,32);for(let r=0;r<4;r++){px(c,'#3a3a42',X,Y+r*8+7,32,1);const o=(r%2)*8;for(let k=0;k<2;k++)px(c,'#3a3a42',X+o+k*16+6,Y+r*8,1,7)}break;
  case T.FLOOR:px(c,'#5a5650',X,Y,32,32);px(c,'#4a4640',X,Y,32,1);px(c,'#4a4640',X,Y,1,32);break;
  }}
/* LPC terrain blocks: 3x6 cells; quarters are picked from neighbours (edges, outer and inner corners) */
const TB={grass:{c:21,r:0},dirt:{c:18,r:0},sand:{c:15,r:0},water:{c:9,r:9},swamp:{c:9,r:9}};
const TSAME={dirt:v=>v===T.PATH||v===T.EXIT||v===T.BRIDGE,sand:v=>v===T.SAND,water:v=>v===T.WATER||v===T.SHALLOW||v===T.BRIDGE,swamp:v=>v===T.MUD};
function terrQ(c,name,tx,ty){const A=ATLAS.base,b=TB[name],same=TSAME[name];if(!A)return false;
  for(const qy of[0,1])for(const qx of[0,1]){const dx=qx?1:-1,dy=qy?1:-1,h=same(at(tx+dx,ty)),v=same(at(tx,ty+dy)),d=same(at(tx+dx,ty+dy));let col,row;
    if(h&&v&&d){col=(hash(tx,ty,77)*3)|0;row=5}
    else if(h&&v){col=qx?1:2;row=qy?0:1}
    else if(h){col=1;row=qy?4:2}
    else if(v){col=qx?2:0;row=3}
    else{col=qx?2:0;row=qy?4:2}
    c.drawImage(A,(b.c+col)*32+qx*16,(b.r+row)*32+qy*16,16,16,tx*32+qx*16,ty*32+qy*16,16,16)}return true}
function baseGrass(c,tx,ty){const A=ATLAS.base;if(!A)return false;const b=TB.grass,v=(hash(tx,ty,31)*3)|0;c.drawImage(A,(b.c+v)*32,(b.r+5)*32,32,32,tx*32,ty*32,32,32);return true}
const BTINT={village:null,forest:'rgba(20,50,40,.32)',marsh:'rgba(60,70,30,.38)',ruin:'rgba(40,40,60,.3)'};
function renderWorld(){worldCv=cnv(W*32,H*32);wx=worldCv.getContext('2d');const useA=!!ATLAS.base;
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){const t=at(x,y);
    if(useA&&t!==T.WALL&&t!==T.FLOOR){baseGrass(wx,x,y);
      if(t===T.FLOWERS||t===T.DARK)drawTile(wx,x,y,true)}
    else drawTile(wx,x,y)}
  if(useA){for(let y=0;y<H;y++)for(let x=0;x<W;x++){const t=at(x,y);
      if(TSAME.water(t)){terrQ(wx,'water',x,y);if(t===T.BRIDGE)drawTile(wx,x,y,true);}
      else if(t===T.PATH||t===T.EXIT)terrQ(wx,'dirt',x,y);else if(t===T.SAND)terrQ(wx,'sand',x,y);else if(t===T.MUD){terrQ(wx,'swamp',x,y);wx.globalCompositeOperation='source-atop';wx.fillStyle='rgba(70,80,40,.6)';wx.fillRect(x*32,y*32,32,32);wx.globalCompositeOperation='source-over'}}
    const tint=BTINT[ZONE?ZONE.biome:'village'];if(tint){wx.globalCompositeOperation='multiply';wx.fillStyle=tint.replace(/rgba\(([^,]+),([^,]+),([^,]+),[^)]+\)/,'rgb($1,$2,$3)');wx.globalAlpha=+tint.match(/,([\d.]+)\)$/)[1];wx.fillRect(0,0,worldCv.width,worldCv.height);wx.globalAlpha=1;wx.globalCompositeOperation='source-over'}}}

/* ----- minimap + fog ----- */
let mmBase=cnv(W,H),mmb=mmBase.getContext('2d'),fogCv=cnv(W,H),fogx=fogCv.getContext('2d'),explored=new Uint8Array(W*H);
function mmColor(x,y){const t=at(x,y),i=y*W+x;if(col[i])return'#1e3a22';return{0:BIO.g[0],1:BIO.p[0],2:'#24507c',3:'#3a7898',4:'#4b4530',5:'#1e3a22',6:'#3a3a42',7:'#5a5650',8:'#c8d0e0',9:'#5a2a8a',10:'#8a6038',11:BIO.g[2],12:BIO.g[1],13:'#f2d48a',14:'#c8b07a'}[t]||'#000'}
function buildMM(){mmBase=cnv(W,H);mmb=mmBase.getContext('2d');for(let y=0;y<H;y++)for(let x=0;x<W;x++){mmb.fillStyle=mmColor(x,y);mmb.fillRect(x,y,1,1)}}
function resetFog(){fogCv=cnv(W,H);fogx=fogCv.getContext('2d');explored=new Uint8Array(W*H);fogx.fillStyle='#0b0910';fogx.fillRect(0,0,W,H)}
function reveal(cx,cy,r){for(let y=cy-r;y<=cy+r;y++)for(let x=cx-r;x<=cx+r;x++){if(x<0||y<0||x>=W||y>=H)continue;if((x-cx)**2+(y-cy)**2>r*r)continue;const i=y*W+x;if(!explored[i]){explored[i]=1;fogx.clearRect(x,y,1,1)}}}
function fogPack(){let s='';for(let i=0;i<explored.length;i+=8){let b=0;for(let k=0;k<8;k++)if(explored[i+k])b|=1<<k;s+=String.fromCharCode(b)}return btoa(s)}
function fogUnpack(str){resetFog();try{const s=atob(str);for(let j=0;j<s.length;j++){const b=s.charCodeAt(j);for(let k=0;k<8;k++)if(b&(1<<k)){const i=j*8+k;if(i<explored.length){explored[i]=1;fogx.clearRect(i%W,(i/W)|0,1,1)}}}}catch(_){}}

/* ----- audio ----- */
let AC=null,muted=false,lastHit=0;const SET={music:.5,sfx:.8,autoFull:true};
const SFX={swing:['triangle',600,200,.05,.08],bow:['triangle',900,300,.04,.07],fire:['sawtooth',340,90,.04,.22],hit:['square',220,70,.035,.06],coin:['square',880,1400,.025,.08],hurt:['sawtooth',170,60,.07,.22],lvl:['triangle',440,990,.07,.5],heal:['sine',500,1000,.06,.35],nova:['sine',1000,180,.07,.45],rune:['triangle',330,1100,.08,.8],boss:['sawtooth',110,40,.07,.9],orb:['sine',300,180,.02,.15],die:['square',220,40,.06,.6],deny:['square',140,120,.03,.08],boom:['sawtooth',120,30,.09,.5],zap:['square',1200,300,.04,.15],growl:['sawtooth',90,60,.06,.4],item:['triangle',660,1320,.05,.25],legend:['triangle',220,1760,.08,1.2],moon:['sine',660,1760,.06,.9]};
function sfx(n){if(!AC||muted)return;if(n==='hit'){const now=performance.now();if(now-lastHit<45)return;lastHit=now}
  const p=SFX[n];if(!p)return;const t=AC.currentTime,o=AC.createOscillator(),g=AC.createGain();o.type=p[0];o.frequency.setValueAtTime(p[1],t);o.frequency.exponentialRampToValueAtTime(p[2],t+p[4]);g.gain.setValueAtTime(Math.max(.0002,p[3]*SET.sfx),t);g.gain.exponentialRampToValueAtTime(.0001,t+p[4]);o.connect(g);g.connect(AC.destination);o.start(t);o.stop(t+p[4]+.03)}
