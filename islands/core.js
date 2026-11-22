'use strict';
/* ===== core: utils, world map, sprites, tiles ===== */
const $=id=>document.getElementById(id);
const TS=16,W=160,H=120,WW=W*TS,WH=H*TS;
const T={GRASS:0,TREE:1,WATER:2,PATH:3,WALL:4,FLOOR:5,HOUSE:6,BRIDGE:7,GATE:8,FLOWER:9,SHRINE:10,ROCK:11,MUD:12,GRAVE:13,TENT:14,BONES:15,LAVA:16,SAND:17,SHALLOW:18,STAIRS:19,DOOR:20,PLATE:21,SPIKE:22,ENTRANCE:23,VOID:24,EXIT:25,LIGHT:26,PLATEON:27};
const SOLID=new Set([1,2,4,6,8,10,11,13,14,16,20,24,26]);
const BOATOK=new Set([2,18,7]);
const PSOLID=new Set([1,4,6,8,10,11,13,14,20,24,26]);
const map=new Uint8Array(W*H),reg=new Uint8Array(W*H);
const at=(x,y)=>(x<0||y<0||x>=W||y>=H)?T.TREE:map[y*W+x];
const RG=(x,y)=>(x<0||y<0||x>=W||y>=H)?0:reg[y*W+x];
const set=(x,y,v)=>{if(x>=0&&y>=0&&x<W&&y<H)map[y*W+x]=v};
const rect=(x0,y0,x1,y1,v)=>{for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++)set(x,y,v)};
const disc=(cx,cy,r,v)=>{for(let y=cy-r;y<=cy+r;y++)for(let x=cx-r;x<=cx+r;x++)if((x-cx)**2+(y-cy)**2<=r*r)set(x,y,v)};
const ell=(cx,cy,rx,ry,v)=>{for(let y=cy-ry;y<=cy+ry;y++)for(let x=cx-rx;x<=cx+rx;x++)if(((x-cx)/rx)**2+((y-cy)/ry)**2<=1)set(x,y,v)};
const rr=n=>(Math.random()*2-1)*n,rint=n=>(Math.random()*n)|0,pick=a=>a[rint(a.length)];
const clamp=(v,a,b)=>v<a?a:v>b?b:v;
function pickW(o){let s=0;for(const k in o)s+=o[k];let r=Math.random()*s;for(const k in o){r-=o[k];if(r<0)return k}return Object.keys(o)[0]}
function mulberry32(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
function hash(x,y,s){let h=(Math.imul(x,374761393)+Math.imul(y,668265263)+Math.imul(s|0,982451653))|0;h=Math.imul(h^(h>>>13),1274126177);return((h^(h>>>16))>>>0)/4294967296}
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
let UIDN=1;const uid=()=>Date.now().toString(36)+'_'+(UIDN++);
function cnv(w,h){const c=document.createElement('canvas');c.width=w;c.height=h;return c}

/* ----- layout ----- */
const RN=['home','village','palm','mangrove','pirate','wrecks','temple','ice','volcano','sea','dungeon'];
const HOME={x:80,y:62};
const VIL={x0:68,y0:54,x1:92,y1:70};
const inVil=(tx,ty)=>tx>=VIL.x0&&tx<=VIL.x1&&ty>=VIL.y0&&ty<=VIL.y1;
const inCrypt=()=>false;
const ISLANDS=[{cx:80,cy:62,rx:19,ry:14,r:0},{cx:40,cy:38,rx:14,ry:11,r:2},{cx:34,cy:92,rx:15,ry:11,r:3},{cx:122,cy:40,rx:15,ry:11,r:4},{cx:124,cy:96,rx:14,ry:10,r:5},{cx:80,cy:15,rx:18,ry:9,r:7},{cx:146,cy:68,rx:10,ry:12,r:8},{cx:80,cy:104,rx:7,ry:6,r:6}];
const HOUSES=[
 {x:70,y:56,roof:'#a8432e',dark:'#7e2c1d'},{x:75,y:56,roof:'#5a6274',dark:'#3d4352',smith:true},{x:84,y:56,roof:'#4f7a3a',dark:'#365a27'},{x:89,y:56,roof:'#3a5fc8',dark:'#24398a',guard:true},
 {x:70,y:65,roof:'#8a5a32',dark:'#5e3a1e',tavern:true},{x:75,y:65,roof:'#2f7a8a',dark:'#1f5560'},{x:84,y:65,roof:'#e8e0d0',dark:'#b8ac98',chapel:true},{x:89,y:65,roof:'#a8432e',dark:'#7e2c1d'},
 {x:38,y:85,roof:'#4a5a2e',dark:'#2e3a1c'}];
const NPC_DEF=[
 {id:'elder',name:'Капитан Брандт',hx:70,hy:56,spr:'elder'},{id:'smith',name:'Кузнец Гарра',hx:75,hy:56,spr:'smith'},{id:'herb',name:'Знахарка Мирра',hx:84,hy:56,spr:'herb'},{id:'tara',name:'Стражница Нэлла',hx:89,hy:56,spr:'tara'},
 {id:'tavern',name:'Боцман Гром',hx:70,hy:65,spr:'boatswain'},{id:'ship',name:'Корабел Ульф',hx:75,hy:65,spr:'shipwright'},{id:'priest',name:'Отец Марин',hx:84,hy:65,spr:'priest'},
 {id:'keeper',name:'Смотритель Ян',x:94*16+8,y:57*16+8,spr:'keeper'},{id:'ilva',name:'Старая Илва',hx:38,hy:85,spr:'ilva'},
 {id:'qm',name:'Квартирмейстер Рыжий',x:117*16+8,y:45*16+8,spr:'pirate'},{id:'timcage',name:'Юнга Тим',x:120*16+8,y:45*16+8,spr:'tim',cage:true}];
const SHRINE_DEF=[
 {id:'tide',x:40,y:33,boss:'crabking',lvl:6,name:'Жемчужина Прилива',col:'#8fe8ff',where:'на Пальмовом острове на северо-западе'},
 {id:'mire',x:30,y:95,boss:'ila',lvl:10,name:'Жемчужина Топей',col:'#7fe07a',where:'в Мангровых топях на юго-западе'},
 {id:'gold',x:127,y:36,boss:'barracuda',lvl:12,name:'Жемчужина Золота',col:'#f2c14e',where:'в Пиратской бухте на северо-востоке'},
 {id:'frost',x:70,y:14,boss:'yeti',lvl:16,name:'Жемчужина Инея',col:'#d8e8ff',where:'на Ледяном острове на севере'},
 {id:'fire',x:147,y:64,boss:'ashlord',lvl:19,name:'Жемчужина Пламени',col:'#ff9a4a',where:'на Острове Вулкан на востоке'}];
const ENTRANCES=[{id:'smug',x:113,y:46},{id:'grotto',x:90,y:16},{id:'temple',x:80,y:103}];
const LIGHTHOUSE={x:94,y:55};
const TENTS=[[116,36],[129,44],[121,32],[132,39],[111,40]];
let CHEST_POS=[],PEARL_CHEST=-1;
const GATE={x:80,y:103};
const SPAWN={x:1296,y:992};
const REGTILES=[];
function islandAt(x,y){let best=null,bd=9;for(const I of ISLANDS){const d=Math.hypot((x-I.cx)/I.rx,(y-I.cy)/I.ry)+(hash(x,y,5)-.5)*.12+Math.sin(x*.5+I.cx)*Math.cos(y*.45+I.cy)*.06;if(d<bd){bd=d;best=I}}return[best,bd]}
function genMap(){
  const R=mulberry32(777);
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){
    const[I,d]=islandAt(x,y);let r=9,t=T.WATER;const q=R(),n=Math.sin(x*.45)*Math.cos(y*.38)+Math.sin((x+y)*.2);
    if(d<1.28){r=I.r;if(inVil(x,y))r=1;
      if(d>=1.0)t=T.SHALLOW;else if(d>=.82)t=(q<.02&&r!==7&&r!==8)?T.TREE:T.SAND;
      else{t=T.GRASS;
        if(r===0){if(q<.06)t=T.FLOWER;else if(q<.12)t=T.TREE;else if(q<.135)t=T.ROCK}
        else if(r===2){if(q<.32)t=T.TREE;else if(q<.35)t=T.ROCK;else if(q<.42)t=T.FLOWER}
        else if(r===3){if(n>1.05)t=T.SHALLOW;else if(q<.32)t=T.MUD;else if(q<.40)t=T.TREE;else if(q<.43)t=T.FLOWER}
        else if(r===4){if(q<.05)t=T.ROCK;else if(q<.1)t=T.TREE;else if(q<.13)t=T.BONES}
        else if(r===5){if(q<.1&&x%3===0)t=T.GRAVE;else if(q<.16)t=T.TREE;else if(q<.24)t=T.BONES}
        else if(r===7){if(n>1.2)t=T.SHALLOW;else if(q<.2)t=T.TREE;else if(q<.25)t=T.ROCK}
        else if(r===8){if(n>1.1)t=T.LAVA;else if(q<.06)t=T.TREE;else if(q<.13)t=T.ROCK;else if(q<.17)t=T.BONES}
        else if(r===6){t=q<.5?T.FLOOR:T.SAND;if(q<.06)t=T.WALL}
        else if(r===1){if(q<.05)t=T.FLOWER}}}
    else if(q<.003)t=T.ROCK;
    reg[y*W+x]=r;map[y*W+x]=t;
  }
  rect(VIL.x0,VIL.y0,VIL.x1,VIL.y1,T.GRASS);for(let y=VIL.y0;y<=VIL.y1;y++)for(let x=VIL.x0;x<=VIL.x1;x++)if(R()<.05)set(x,y,T.FLOWER);
  const land=(x,y,r)=>{disc(x,y,r,T.GRASS);for(let yy=y-r;yy<=y+r;yy++)for(let xx=x-r;xx<=x+r;xx++)if((xx-x)**2+(yy-y)**2<=r*r&&reg[yy*W+xx]===9)reg[yy*W+xx]=regionOfIsle(x,y)};
  SHRINE_DEF.forEach(s=>land(s.x,s.y,5));ENTRANCES.forEach(e=>land(e.x,e.y,3));land(LIGHTHOUSE.x,LIGHTHOUSE.y,3);land(117,45,3);land(40,87,4);
  const path=(x,y)=>{const t=at(x,y);set(x,y,t===T.WATER||t===T.SHALLOW||t===T.BRIDGE||t===T.LAVA?T.BRIDGE:T.PATH)};
  const hl=(y,x0,x1)=>{for(let x=x0;x<=x1;x++)path(x,y)},vl=(x,y0,y1)=>{for(let y=y0;y<=y1;y++)path(x,y)};
  hl(61,VIL.x0,VIL.x1);hl(62,VIL.x0,VIL.x1);vl(80,VIL.y0-3,82);vl(81,VIL.y0-3,82);hl(57,90,94);
  SHRINE_DEF.forEach(s=>rect(s.x-1,s.y-1,s.x+1,s.y+1,T.PATH));
  HOUSES.forEach(h=>rect(h.x,h.y,h.x+3,h.y+2,T.HOUSE));
  TENTS.forEach(([x,y])=>set(x,y,T.TENT));
  SHRINE_DEF.forEach(s=>set(s.x,s.y,T.SHRINE));
  ENTRANCES.forEach(e=>{rect(e.x-1,e.y-1,e.x+1,e.y+1,T.PATH);set(e.x,e.y,T.ENTRANCE)});
  set(LIGHTHOUSE.x,LIGHTHOUSE.y,T.LIGHT);
  rect(119,44,121,46,T.PATH);
  CHEST_POS=[];PEARL_CHEST=-1;
  [0,2,3,4,5,7,8].forEach(r=>{let got=0;for(let k=0;k<400&&got<(r===0?1:2);k++){const x=2+((R()*(W-4))|0),y=2+((R()*(H-4))|0);
    if(reg[y*W+x]!==r||map[y*W+x]!==T.GRASS&&map[y*W+x]!==T.FLOWER&&map[y*W+x]!==T.MUD)continue;if(CHEST_POS.some(([a,b])=>Math.abs(a-x)+Math.abs(b-y)<10))continue;
    if(SHRINE_DEF.some(s=>Math.abs(s.x-x)+Math.abs(s.y-y)<8))continue;CHEST_POS.push([x,y]);if(r===5&&PEARL_CHEST<0)PEARL_CHEST=CHEST_POS.length-1;got++}});
  CHEST_POS.forEach(([x,y])=>{rect(x-1,y-1,x+1,y+1,T.GRASS);carve(x,y)});
  SHRINE_DEF.forEach(s=>carve(s.x,s.y+2));ENTRANCES.forEach(e=>carve(e.x,e.y+1));carve(LIGHTHOUSE.x,LIGHTHOUSE.y+2);
  buildRegTiles();
}
function regionOfIsle(x,y){const[I]=islandAt(x,y);return I.r}
function buildRegTiles(){for(let r=0;r<11;r++)REGTILES[r]=[];for(let i=0;i<W*H;i++){const t=map[i];if(SOLID.has(t)||t===T.SHALLOW||t===T.ENTRANCE)continue;REGTILES[reg[i]].push(i)}}
/* carve a walkable route from (sx,sy) to the nearest beach/path */
function carve(sx,sy){const prev=new Int32Array(W*H).fill(-1),q=[sy*W+sx];prev[q[0]]=q[0];let end=-1;
  for(let h=0;h<q.length;h++){const i=q[h],x=i%W,y=(i/W)|0;const t=map[i];if((t===T.PATH||t===T.SAND||t===T.BRIDGE)&&h>0){end=i;break}
    for(const[dx,dy]of[[1,0],[-1,0],[0,1],[0,-1]]){const nx=x+dx,ny=y+dy;if(nx<1||ny<1||nx>=W-1||ny>=H-1)continue;const j=ny*W+nx;if(prev[j]>=0)continue;
      const tt=map[j];if(tt===T.WALL||tt===T.HOUSE||tt===T.SHRINE||tt===T.TENT||tt===T.ENTRANCE||tt===T.LIGHT||tt===T.WATER)continue;prev[j]=i;q.push(j)}}
  if(end<0)return;let i=end;while(i!==prev[i]){const t=map[i];if(t===T.LAVA)map[i]=T.BRIDGE;else if(SOLID.has(t)||t===T.MUD)map[i]=T.GRASS;i=prev[i]}}

/* ----- sprites ----- */
const PAL={k:'#1a1420',s:'#f0c8a0',b:'#3a5fc8',B:'#24398a',h:'#6b4226',H:'#4a2a18',y:'#f2c14e',w:'#f4f0e6',W:'#c9c2b2',g:'#8a8f98',G:'#4f535c',r:'#e0402e',R:'#7a2018',p:'#c48aff',P:'#4a2580',v:'#2e1650',e:'#6ac04a',E:'#2f7a35',c:'#8fe8ff',t:'#8a5a32',T:'#5e3a1e',n:'#2d5e2a',N:'#1b3a1c',m:'#3f7d35',l:'#7ab04a',L:'#4f7a30',u:'#d8cfa0',x:'#3a2a30',z:'#7a9a7a',Z:'#4f6a50',q:'#e87ab8',o:'#e8822e'};
const SRC={
mage:["......kk........",".....kbbk.......","....kbbbbk......","....kbbbbk....k.","...kbbbbbbk..kck","..kyyyyyyyyk..k.","...kssssssk...h.","...kskssksk...h.","...kssssssk...h.","..kbbbbbbbbk..h.",".kbbbbybbbbbk.h.",".ksbbbybbbbbsshk","..kbbbybbbbbk.h.","..kBBBBBBBBBk.h.","...khk...khk..h.","...kk.....kk...."],
warrior:[".....kkkkk......","....kgwgggk.....","...kgwggggGk....","...kggggggGk....","...kkGkkkGkk....","...ksskssksk....","....kssssk...k..","...krrrrrrk.kwk.","..kgrrrrrrgkkwk.",".kGkgrryrrgkkwk.",".kGGkrrrrrkskwk.",".kGGkrrrrrk.kgk.","..kGkGGGGGk..y..","...k.kGkGk..kk..",".....kk.kk......","................"],
ranger:["................",".....kkkkk......","....kEEEEEk.....","...kEEEEEEEk.k..","...kEsssssEk.kh.","...kEsksksEk.k.h","...kEssssskk.k.h","..kEEtttttEEkk.h","..ktttttttttkk.h",".kstttyttttskk.h","..kttttytttk.k.h","..kTTTTTTTTk.kh.","...kTk..kTk..k..","...kTk..kTk.....","...kk....kk.....","................"],
elder:["................",".....kkkkk......","....kwwwwwk.....","....kssssk......","....kskskk......","....kwwwwwk.....","...kwwwwwwwk....","...ktwwwwwtk.h..","..kttwwwwwttkh..","..ktttwwwtttkh..","..ksttttttttsh..","..kttttttttttk..","..kttttttttttk..","..kTTTTTTTTTTk..","...kk.....kk....","................"],
smith:["................",".....kkkkk......","....ksssssk.....","....kskskk......","....ksssssk.....","....khhhhhk.....","...kshhhhhsk....","..kssHHHHHssk.gg","..ksktttttksk.gG","..ksktttttksk..h","...kkttttttkk..h","....ktttttk....h","....ktttttk.....","....kGGGGGk.....","....kk...kk.....","................"],
herb:["................",".....kkkkk......","....kEEEEEk.....","...kEEsssEEk....","...kEskskEEk....","...kEsssssEk....","...kEEEEEEEk.e..","..kEEeEEEeEEkee.","..kEeeEEEeeEk.t.","..ksEEEEEEEsk.t.","..kEEEEEEEEEk.t.","..kEEEEEEEEEk...","..kEEEEEEEEEk...","...kEEEEEEEk....","....kk...kk.....","................"],
slime:["................","................","................","................","................","......kkkk......","....kkeeeekk....","...keeweeeeek...","..keewweeeeeek..","..keeeeeeeeeek..","..keekkeeekkek..",".keeekkeeekkeek.",".keeeeeeeeeeeek.",".kEEEEEEEEEEEEk.","..kkkkkkkkkkkk..","................"],
wolf:["................","................","................","...........kk...","..........kgk.k.",".........kgggkgk",".........kgrgggk","..k.kkkkkkgggggk",".kgkgggggggkkkk.","..kggggggggk....","..kgWggggWggk...","..kGWgggggWGk...","..kGk.kGk.kGk...","..kGk.kGk.kGk...","..kk..kk..kk....","................"],
spider:["................","................","................","................","..k..kkkk..k....","...kkxxxxkk.....","k.kxxxxxxxxk.k..",".kkxrxxxxrxkk...","k.kxxxxxxxxk.k..","..kkxxxxxxkk....",".k..kkkkkk..k...","k...k....k...k..","................","................","................","................"],
goblin:["................","................","...k.......k....","...kekkkkkek....","....keeeeek.....","...keyeeyeek....","...keeeeeeek....","....kekkkek.....","...ktttttttk..g.","..kettttttek.kg.","..ke.ttttt.ekhk.","....kttttt.k.h..","....kTk.kTk.....","....kk...kk.....","................","................"],
ogre:["................",".....kkkkkk.....","....kllllllk....","...klkllklllk...","...kllllllllk...","...klwkkkkwlk...","..kkllllllllkk..",".klllttttttlllk.","klllkttttttklllk","kllk.tttttt.kllk","kllk.tttttt.kllk",".kk..TTTTTT..kk.",".....kllkllk....",".....kllkllk....","....kkkk.kkkk...","................"],
zombie:["................",".....kkkkk......","....kzzzzzk.....","....kzrzzrk.....","....kzzzzzk.....",".....kzkzk......","...kkGGGGGkkkk..","..kzGGGGGGGzzzk.","..kzkGGGGGk.kk..","....kGGGGGk.....","....kGGGGGk.....","....kHHHHHk.....","....kzk.kzk.....","....kzk.kzk.....","....kk..kk......","................"],
witch:[".......k........","......kPk.......",".....kPPPk......","....kPPPPPk.....","..kkPPPPPPPkk...","...kzzzzzzk..c..","...kzkzzkzk.kpk.","...kzzzzzzk..h..","..kPPPPPPPPk.h..",".kPPPPpPPPPPkh..",".kzPPPpPPPPzzhk.","..kPPPPPPPPPkh..","..kPPPPPPPPPkh..","..kvvvvvvvvvk...","...kk....kk.....","................"],
skel:["................",".....kkkkk......","....kwwwwwk.....","....kwkwkwk.....","....kwwwwwk.....",".....kwkwk......","......kwk.......","....kwwwwwk.....","...kwkwwwkwk....","...kwkwwwkwk....","...k.kwwwk.k....","......kwk.......",".....kwkwk......",".....kw.kw......",".....kw.kw......",".....kk.kk......"],
ghost:["................",".....kkkkk......","....kwwwwwk.....","...kwwwwwwwk....","...kwkwwwkwk....","...kwkwwwkwk....","...kwwwwwwwk....","...kwwwkwwwk....","..kwwwwwwwwwk...","..kwwwwwwwwwk...","..kWwwwwwwwWk...","..kWWwwwwwWWk...","..kWkWWkWWkWk...","..kk.kk.kk.kk...","................","................"],
lich:["....y..y..y.....","....yyyyyyy.....","....kwwwwwk.....","...kwkwwwkwk....","...kwpwwwpwk....","...kwwwwwwwk....","....kwkwkwk.....","...kPPkkkPPk..c.","..kPPPPPPPPPk.c.",".kPPpPPPPPpPPkg.",".kPpPPPpPPPpPkg.",".kwPPPPpPPPPwkg.","..kPPPPpPPPPk.g.","..kPPPPPPPPPk.g.","...kPPvPvPPk..g.","....kvkvkvk....."],
tree:[".....kkkkkk.....","...kknmmmmnkk...","..knmmllmmmmnk..",".knmmllllmmmmnk.",".knmllllmmmmnnk.","knmmllmmmmmmnnNk","knmmmmmmmmlmnnNk","knnmmmmmmllmnnNk","knnnmmmmmmmnnNNk",".knnnmmmmnnnNNk.",".kNnnnnnnnnNNNk.","..kNNNnnnNNNNk..","...kkNNNNNNkk...","......kTTk......","......kTtk......",".......kk......."],
pine:[".......kk.......","......knnk......",".....knmnnk.....","....knmmnnnk....",".....knnnNk.....","....knmmnnNk....","...knmmnnnNNk...","....knnnnNNk....","...knmmnnnNNk...","..knmmnnnnnNNk..",".knnnnnnnnnNNNk.","..kkkNNNNNNkkk..","......kTTk......","......kTtk......",".......kk.......","................"],
dead:["................","..k.....k...k...",".kTk...kTk.kTk..","..kTk..kTkkTk...","...kTk.kTTTk....","....kTkTTk......","..k..kTTk.......",".kTkkTTk........","..kTTTTk........","....kTTk........","....kTTk........","....kTTk........","...kTTTTk.......","..kTkTTkTk......","..kk.kk.kk......","................"],
rock:["................","................","................","................","................","......kkkk......","....kkggggkk....","...kgggwggggk...","..kggwwgggggGk..","..kgggggggGGGk..","..kGggggggGGGk..","...kGGGGGGGGk...","....kkkkkkkk....","................","................","................"],
grave:["................","................","................","......kkkk......",".....kggggk.....","....kggwgggk....","....kgwwwggk....","....kggwgggk....","....kggwggGk....","....kgggggGk....","....kgggggGk....","...kkGGGGGGkk...","..kTTTTTTTTTTk..","...kkkkkkkkkk...","................","................"],
tent:[".......kk.......","......kyyk......",".....kttTtk.....","....kttTTttk....","....kttTTttk....","...kttTkkTttk...","...ktTkHHkTtk...","..kttkHHHHkttk..","..ktTkHHHHkTtk..",".kttkHHHHHHkttk.",".kTTkHHHHHHkTTk.","kkkkkkkkkkkkkkkk"],
shrine:["......kkkk......",".....kggggk.....",".....kgwggk.....",".....kg..gk.....",".....kg..gk.....",".....kggggk.....",".....kgGggk.....",".....kgGggk.....",".....kggGgk.....",".....kgggGk.....","....kggggggk....","...kgggggggGk...","...kGGGGGGGGk...","..kggggggggggk..","..kGGGGGGGGGGk..","...kkkkkkkkkk..."],
chest:["................","................","................","................","...kkkkkkkkkk...","..khhhhhhhhhhk..","..khHHHHHHHHhk..","..kkkkkyykkkkk..","..khhhhyyhhhhk..","..khhhhhhhhhhk..","..khHHHHHHHHhk..","..kkkkkkkkkkkk.."],
chesto:["................","...kkkkkkkkkk...","..khhhhhhhhhhk..","..kHHHHHHHHHHk..","..kkkkkkkkkkkk..","..kyyyywyyyyyk..","..kyyykyyyyyyk..","..kkkkkkkkkkkk..","..khhhhhhhhhhk..","..khhhhhhhhhhk..","..khHHHHHHHHhk..","..kkkkkkkkkkkk.."],
palm:["..k.kk...kk.k...",".kmklmk.kmlkmk..","kmlllmmkmmlllmk.",".kmmkkmmmkkmmk..","..kk.kmTmk.kk...","......kTk.......","......kTk.......",".....kTtk.......",".....kTk........",".....kTk........","....kTtk........","....kTk.........","....kTk.........","...kTTk.........","..kTTTTk........","..kkkkkk........"],
crab:["................","................","................","................",".kk..........kk.","krrk........krrk","krrk.kkkkkk.krrk",".kkkkrrrrrrkkkk.","....krwkkwrk....","...krrrrrrrrk...","..krrRrrrrRrrk..","..krrrrrrrrrrk..","...kRRRRRRRRk...","..k.k.k..k.k.k..",".k..k......k..k.","................"],
pirate:["................","....kkkkkk......","...kRRRRRRk.....","..kRRRRRRRRk....","...kssssssk.....","...kskkssksk....","...kssssssk.....","....khhhhk..kk..","...kwrwrwrk.kgk.","..ksrwrwrwrskgk.","..kskwrwrwkskgk.","....kTTTTTk.kk..","....kHk.kHk.....","....kHk.kHk.....","....kk..kk......","................"],
shark:["................","................","................","................",".......kk.......","......kGgk......",".....kGggk......","....kGgggk......","...kkkkkkkkkkk..","..kGgggggggwggk.",".kGgggggggggggk.","kkkkkk.kGGGGkk..","........kk......","................","................","................"],
serpent:["................","..........kkk...",".........kcEck..","........kEEEEk..","........kEyEEk..",".........kEEk...",".........kEk....","........kEEk....","..kk...kEEk.....",".kEEk.kEEk......","kEkkEkEEk.......","kE..kEEk........",".k...kk.........","................","................","................"],
boat:["................","................","................","......kk........",".....kwwk.......",".....kwwwk......",".....kwwwwk.....",".....kkhkkkk....","..kkkkkhkkkkkk..",".kTttttttttttTk.","kTttttttttttttTk",".kTttttttttttTk.","..kkkkkkkkkkkk..","................","................","................"],
parrot:["................","................","................","......kkk.......",".....krrrk......","....krrwkrk.....","....krrrkyk.....","....kbrrrk......","...kbbrrrk......","...kbbbrrk......","....kbbrk.......",".....kyyk.......","....k...k.......","................","................","................"],
staff:["..........kk",".........kck","........kcpk",".......kkpk.","......khkk..",".....khk....","....khk.....","...khk......","..khk.......",".khk........","khk.........","kk.........."],
dagger:["..........kk",".........kwk","........kwk.",".......kwk..","......kwk...",".....kwk....","..k.kwk.....","...kyk......","..kyyk......",".khk........","khk.........","kk.........."],
sword:["..........kk",".........kwk","........kwgk",".......kwgk.","......kwgk..",".....kwgk...","..k.kwgk....","...kygk.....","..kyyk......",".khk.k......","khk.........","kk.........."],
bow:["....kkk.....","...khhkk....","..khk..wk...","..kh....w...",".kh.....w...",".kh..kkkwkk.",".kh.....w...","..kh....w...","..khk..wk...","...khhkk....","....kkk.....","............"],
armor:["..kk....kk..",".kggk..kggk.",".kgggkkgggk.","..kgggggggk.","..kgggwgggk.","..kgggwgggk.","..kgggggggk.","..kgggggggk.","..kGGGGGGGk.","...kkkkkkk..","............","............"],
amulet:["..k......k..","...k....k...","....k..k....",".....kk.....","....kyyk....","...kyrryk...","...kyrryk...","....kyyk....",".....kk.....","............","............","............"],
ring:["....kkk.....","...kcwck....","....kkk.....","...kyyyk....","..ky...yk...","..ky...yk...","..ky...yk...","...kyyyk....","....kkk.....","............","............","............"],
pot:["....kkk.....","....khk.....","...kk.kk....","..kwrrrrk...",".kwrrrrrrk..",".krrrrrrrk..",".krrrrrrrk..","..kRrrrRk...","...kkkkk....","............","............","............"]
};
const ALT={jelly:['slime',{e:'#7ac8f0',E:'#3a7ab0',w:'#ffffff'}],tjelly:['slime',{e:'#e87ab8',E:'#9a3a78',w:'#ffe0f0'}],monkey:['goblin',{e:'#a87a4a',E:'#6b4226',y:'#f0c8a0',t:'#6b4226'}],pgunner:['pirate',{R:'#2f4a7a',r:'#3a5fc8'}],captain:['pirate',{R:'#1a1420',w:'#c8402e',r:'#7a2018',h:'#f2c14e'}],captain2:['pirate',{R:'#4a3a2c',w:'#6a5440',r:'#3a2c20'}],tim:['pirate',{R:'#3a5fc8',r:'#3a5fc8',w:'#f4f0e6'}],brute:['ogre',{l:'#c89a70',L:'#8a6440',t:'#3a5fc8',T:'#24398a'}],crabking:['crab',{r:'#ff5a3a',R:'#a82a14'}],pcrab:['crab',{r:'#4a8fd0',R:'#24398a'}],ila:['witch',{P:'#2f5a2c',p:'#9fe060',v:'#1b3a1c',z:'#9ab08a'}],morven:['lich',{w:'#a8e8e0',P:'#1f4a6a',p:'#7fe0d0',v:'#0f2a3a',y:'#7fe0d0'}],boatswain:['smith',{H:'#2f4a7a',t:'#3a5fc8',h:'#e8e0d0'}],shipwright:['smith',{t:'#8a5a32',H:'#5e3a1e',G:'#2f4a7a'}],priest:['elder',{t:'#e8e0d0',T:'#b8ac98',w:'#f4f0e6'}],keeper:['elder',{t:'#2f4a7a',T:'#1f3456'}],ilva:['herb',{E:'#4a2580',e:'#9a5fe0'}],healer:['herb',{E:'#c84a7a',e:'#ff9ac0'}],snowpine:['pine',{n:'#5a7a8a',m:'#e8f0f8',l:'#ffffff',N:'#3a5060'}],burnt:['dead',{T:'#2a2020'}],yeti:['ogre',{l:'#e8f0f8',L:'#9ab0c8',t:'#6a8aa8',T:'#3a5070'}],ashlord:['lich',{w:'#3a2a2a',P:'#8a2a14',p:'#ff9a3a',v:'#4a1010',y:'#ff6a3a'}],iwolf:['wolf',{g:'#c8dcf0',G:'#7a9ab8',W:'#ffffff'}],troll:['ogre',{l:'#a8c0d0',L:'#6a8098'}],wraith:['ghost',{w:'#a8d8ff',W:'#6a9ad0'}],imp:['goblin',{e:'#d8402e',E:'#8a1a10',t:'#3a2020'}],golem:['ogre',{l:'#6a5a50',L:'#3a2e28',t:'#c8401e',T:'#8a2a14',w:'#ffb03a'}],tslime:['slime',{e:'#b07ad8',E:'#5a2a80',w:'#f0d8ff'}],queen:['slime',{e:'#e87ab8',E:'#9a3a78',w:'#ffe0f0'}],fang:['wolf',{g:'#4a4450',G:'#2a2430',W:'#6a6470',r:'#ff3020'}],
 garcher:['goblin',{t:'#5a6a3a',T:'#3a4a2a',g:'#8a5a32'}],grokk:['ogre',{l:'#8a7a50',L:'#5a4a30',t:'#7a2018',T:'#4a1010'}],sarcher:['skel',{w:'#d8cfa0'}],
 tara:['warrior',{r:'#3a5fc8',g:'#b8bcc4'}],potmp:['pot',{r:'#4a7fe0',R:'#24398a'}]};
function mk(rows,ov){const pal=ov?{...PAL,...ov}:PAL;const w=Math.max(...rows.map(r=>r.length)),h=rows.length,c=cnv(w,h),x=c.getContext('2d');
  rows.forEach((r,j)=>{for(let i=0;i<r.length;i++){const col=pal[r[i]];if(col&&r[i]!=='.'){x.fillStyle=col;x.fillRect(i,j,1,1)}}});
  const f=cnv(w,h),fx=f.getContext('2d');fx.translate(w,0);fx.scale(-1,1);fx.drawImage(c,0,0);
  const wh=s=>{const o=cnv(w,h),ox=o.getContext('2d');ox.drawImage(s,0,0);ox.globalCompositeOperation='source-in';ox.fillStyle='#fff';ox.fillRect(0,0,w,h);return o};
  c.f=f;c.w=wh(c);c.fw=wh(f);return c}
const SPR={};for(const k in SRC)SPR[k]=mk(SRC[k]);for(const k in ALT)SPR[k]=mk(SRC[ALT[k][0]],ALT[k][1]);
function bigURL(s,scale){const c=cnv(s.width*scale,s.height*scale),x=c.getContext('2d');x.imageSmoothingEnabled=false;x.drawImage(s,0,0,c.width,c.height);return c.toDataURL()}
const ICON={};['staff','dagger','sword','bow','armor','amulet','ring','pot','potmp'].forEach(k=>ICON[k]=bigURL(SPR[k],3));

/* ----- tiles ----- */
const GP=[['#5a9a3e','#4b8834','#74b452'],['#5a9a3e','#4b8834','#74b452'],['#3a7a30','#2e6a28','#4c9040'],['#4d5a2e','#404c26','#62703c'],['#a89a5a','#94864a','#bcae6c'],['#55524a','#47443d','#66635a'],['#8a8f88','#767a74','#9aa098'],['#dfe6ee','#c4d0dd','#f6f9fc'],['#4a3a36','#3a2c2a','#5c4842'],['#1f5a94','#1a4e84','#2a6aa8'],['#3b3642','#322d39','#4a3f55']];
const DTHEME={cave:{f:['#4a3a2c','#3e3024','#5a4636'],w:['#6a5440','#4e3c2c','#8a7058']},ice:{f:['#8aa8c0','#7898b0','#a8c4d8'],w:['#c8dcf0','#90b0cc','#ffffff']},temple:{f:['#2f5a5a','#264a4a','#3a7070'],w:['#4a7a78','#335a58','#6a9a98']}};
let DUNTHEME=null;
const worldCv=cnv(WW,WH),wx=worldCv.getContext('2d');
function px(c,col,x,y,w=1,h=1){c.fillStyle=col;c.fillRect(x,y,w,h)}
function drawTile(c,tx,ty){
  const t=at(tx,ty),X=tx*TS,Y=ty*TS,h=s=>hash(tx,ty,s),r=RG(tx,ty),gp=GP[r]||GP[0],th=DUNTHEME&&DTHEME[DUNTHEME];
  const grass=()=>{px(c,gp[0],X,Y,16,16);for(let i=0;i<7;i++)px(c,i<4?gp[1]:gp[2],X+((h(i)*15)|0),Y+((h(i+9)*14)|0),1,2)};
  const isP=v=>v===T.PATH||v===T.BRIDGE||v===T.SHRINE||v===T.ENTRANCE;
  const shade=()=>{c.fillStyle='rgba(0,0,0,.25)';c.beginPath();c.ellipse(X+8,Y+14,7,2.5,0,0,7);c.fill()};
  const sand=()=>{px(c,'#e2cf92',X,Y,16,16);for(let i=0;i<6;i++)px(c,i%2?'#cdb97c':'#f2e2b4',X+((h(i)*15)|0),Y+((h(i+6)*15)|0),1,1)};
  const shallow=()=>{px(c,'#3f93c8',X,Y,16,16);for(let i=0;i<3;i++)px(c,'#62b0dc',X+((h(i)*12)|0),Y+2+i*5,4,1);if(h(9)<.4)px(c,'#8ac8d8',X+((h(10)*13)|0),Y+((h(11)*13)|0),2,1)};
  const floor=()=>{const f=th?th.f:['#3b3642','#322d39','#4a3f55'];px(c,f[0],X,Y,16,16);px(c,f[1],X,Y,16,1);px(c,f[1],X,Y,1,16);if(h(1)<.35)px(c,f[1],X+2+((h(2)*11)|0),Y+2+((h(3)*11)|0),3,1);if(h(4)<.15)px(c,f[2],X+4+((h(8)*8)|0),Y+6,2,2)};
  switch(t){
  case T.GRASS:case T.HOUSE:grass();break;
  case T.SAND:sand();{const n=[[0,-1],[0,1],[-1,0],[1,0]];n.forEach(([dx,dy])=>{const tt=at(tx+dx,ty+dy);if(tt===T.SHALLOW||tt===T.WATER){if(dy)px(c,'#f8f0d8',X,dy<0?Y:Y+15,16,1);else px(c,'#f8f0d8',dx<0?X:X+15,Y,1,16)}})}break;
  case T.SHALLOW:shallow();break;
  case T.FLOWER:grass();
    if(r===2){for(let i=0;i<2;i++){const fx=X+2+((h(20+i)*10)|0),fy=Y+3+((h(30+i)*9)|0);px(c,'#e8e0d0',fx+1,fy+2,1,2);px(c,'#c8402e',fx,fy,3,2);px(c,'#fff',fx+1,fy,1,1)}}
    else{const cols=r===7?['#a8c8ff','#ffffff']:r===8?['#ff6a3a','#f2a03a']:r===5?['#c9c2b2','#9a8fa8']:r===3?['#c8d86a','#e8e0a0']:['#ff7ab0','#f2c14e','#ffffff','#ff9a4a'];
      for(let i=0;i<3;i++){const fx=X+2+((h(20+i)*11)|0),fy=Y+2+((h(30+i)*11)|0);px(c,cols[(h(40+i)*cols.length)|0],fx,fy,2,2)}}break;
  case T.TREE:if(r===9||at(tx,ty-1)===T.SAND&&r!==7)sand();else grass();shade();c.drawImage(r===7?SPR.snowpine:r===8?SPR.burnt:(r===3||r===5)?SPR.dead:SPR.palm,X,Y-2);break;
  case T.ROCK:if(r===9){px(c,'#1f5a94',X,Y,16,16);}else grass();c.drawImage(SPR.rock,X,Y);break;
  case T.GRAVE:grass();c.drawImage(SPR.grave,X,Y);break;
  case T.TENT:sand();c.drawImage(SPR.tent,X,Y+4);break;
  case T.BONES:grass();if(r===5){px(c,'#6b4226',X+2,Y+8,12,3);px(c,'#4a2a18',X+2,Y+10,12,1);px(c,'#8a5a32',X+4,Y+4,2,6)}else{px(c,'#e8e0d0',X+4,Y+10,6,1);px(c,'#e8e0d0',X+3,Y+9,1,3);px(c,'#e8e0d0',X+10,Y+9,1,3);px(c,'#e8e0d0',X+9,Y+3,4,3);px(c,'#1a1420',X+10,Y+4,1,1)}break;
  case T.LAVA:{px(c,'#8a2a14',X,Y,16,16);px(c,'#c8401e',X+1,Y+1,14,14);for(let i=0;i<4;i++)px(c,i%2?'#f2a03a':'#ffd36a',X+2+((h(i)*11)|0),Y+2+((h(i+4)*11)|0),2,2);break}
  case T.MUD:px(c,'#4a4630',X,Y,16,16);for(let i=0;i<3;i++)px(c,'#3a5a5a',X+((h(i)*10)|0),Y+((h(i+3)*13)|0),5,2);px(c,'#5a5638',X+((h(8)*12)|0),Y+((h(9)*12)|0),2,1);break;
  case T.WATER:{px(c,'#1f5a94',X,Y,16,16);for(let i=0;i<3;i++)px(c,'#2a6aa8',X+((h(i)*12)|0),Y+3+i*5,4,1);break}
  case T.BRIDGE:{const un=r===9?'#1f5a94':'#3f93c8';px(c,un,X,Y,16,16);px(c,'#9a6a3a',X+1,Y,14,16);for(let i=0;i<4;i++)px(c,'#6b4226',X+1,Y+i*4+3,14,1);
    if(at(tx-1,ty)!==T.BRIDGE)px(c,'#4a2a18',X,Y,2,16);if(at(tx+1,ty)!==T.BRIDGE)px(c,'#4a2a18',X+14,Y,2,16);break}
  case T.PATH:case T.SHRINE:px(c,'#c8ac72',X,Y,16,16);for(let i=0;i<5;i++)px(c,i%2?'#a88a58':'#dcc28c',X+((h(i)*14)|0),Y+((h(i+5)*14)|0),2,1);
    if(!isP(at(tx,ty-1)))px(c,'#9a9a5e',X,Y,16,1);if(!isP(at(tx,ty+1)))px(c,'#9a9a5e',X,Y+15,16,1);if(!isP(at(tx-1,ty)))px(c,'#9a9a5e',X,Y,1,16);if(!isP(at(tx+1,ty)))px(c,'#9a9a5e',X+15,Y,1,16);break;
  case T.WALL:{const w=th?th.w:['#6b6f78','#50545d','#9aa0aa'];px(c,w[0],X,Y,16,16);for(let q=0;q<4;q++){px(c,w[1],X,Y+q*4+3,16,1);const o=(q%2)*4;for(let k=0;k<2;k++)px(c,w[1],X+o+k*8+3,Y+q*4,1,3)}
    if(at(tx,ty-1)!==T.WALL&&at(tx,ty-1)!==T.VOID)px(c,w[2],X,Y,16,2);if(h(5)<.25)px(c,'#4f6a42',X+((h(6)*12)|0),Y+((h(7)*12)|0),3,2);break}
  case T.FLOOR:floor();break;
  case T.VOID:px(c,'#0b0910',X,Y,16,16);break;
  case T.STAIRS:floor();for(let i=0;i<5;i++)px(c,i%2?'#1a1420':'#2a2430',X+2+i,Y+2+i*2,12-i*2,3);px(c,'#f2c14e',X+7,Y+13,2,2);break;
  case T.EXIT:floor();for(let i=0;i<4;i++)px(c,i%2?'#c9c2b2':'#a8a298',X+2,Y+2+i*3,12,3);px(c,'#fff3c4',X+6,Y+1,4,1);break;
  case T.DOOR:floor();px(c,'#2a2430',X+1,Y,14,16);px(c,'#6b4226',X+2,Y+1,12,15);for(let i=0;i<3;i++)px(c,'#8a8f98',X+2,Y+3+i*5,12,1);px(c,'#f2c14e',X+7,Y+7,2,3);break;
  case T.PLATE:case T.PLATEON:floor();px(c,'#1a1420',X+3,Y+3,10,10);px(c,t===T.PLATEON?'#7fe07a':'#8a8f98',X+4,Y+4,8,8);px(c,t===T.PLATEON?'#c8ffb0':'#a8aeb8',X+4,Y+4,8,1);break;
  case T.SPIKE:floor();for(let i=0;i<3;i++)for(let k=0;k<3;k++)px(c,'#1a1420',X+3+i*4,Y+3+k*4,2,2);break;
  case T.ENTRANCE:{if(r===6){px(c,'#8a8f88',X,Y,16,16);for(let i=0;i<4;i++)px(c,i%2?'#3a5a5a':'#2a4444',X+2+i,Y+3+i*3,12-i*2,3);px(c,'#7fe0d0',X+6,Y+1,4,2)}
    else{grass();px(c,'#1a1420',X+1,Y+2,14,14);px(c,r===7?'#c8dcf0':'#6a5440',X,Y,16,4);px(c,r===7?'#c8dcf0':'#6a5440',X,Y,3,16);px(c,r===7?'#c8dcf0':'#6a5440',X+13,Y,3,16);px(c,'#0b0910',X+4,Y+6,8,10)}break}
  case T.LIGHT:sand();break;
  case T.GATE:floor();break;
  }
}
function drawHouse(c,hs){const X=hs.x*16,Y=hs.y*16;
  c.fillStyle='rgba(0,0,0,.25)';c.fillRect(X+5,Y+46,62,4);
  px(c,'#d8b98a',X+3,Y+22,58,26);px(c,'#bf9f70',X+3,Y+44,58,4);px(c,'#5a3a22',X+3,Y+22,58,2);[3,21,41,59].forEach(v=>px(c,'#5a3a22',X+v,Y+22,2,26));
  [8,46].forEach(a=>{px(c,'#3a2618',X+a-1,Y+28,10,10);px(c,'#f2c14e',X+a,Y+29,8,8);px(c,'#ffe7a0',X+a,Y+29,3,3);px(c,'#3a2618',X+a+3,Y+29,2,8);px(c,'#3a2618',X+a,Y+32,8,2)});
  px(c,'#3a2618',X+25,Y+30,14,18);px(c,'#6b4226',X+26,Y+31,12,17);px(c,'#5a3a22',X+31,Y+31,1,17);px(c,'#f2c14e',X+35,Y+40,2,2);
  px(c,hs.roof,X,Y+4,64,20);for(let q=0;q<5;q++){px(c,hs.dark,X,Y+7+q*4,64,1);for(let k=0;k<8;k++)px(c,hs.dark,X+((k*8+(q%2)*4)%64),Y+4+q*4,1,3)}
  px(c,hs.dark,X,Y+22,64,2);px(c,'#2a1410',X+2,Y+1,60,4);px(c,hs.roof,X+3,Y+2,58,1);
  px(c,'#6b6f78',X+46,Y-4,8,9);px(c,'#4f535c',X+45,Y-5,10,2);
  if(hs.smith){px(c,'#5a3a22',X+62,Y+24,2,14);px(c,'#2a2a30',X+60,Y+26,7,5);px(c,'#8a8f98',X+61,Y+27,5,1)}
  if(hs.tavern){px(c,'#5a3a22',X+62,Y+22,2,16);px(c,'#8a5a32',X+58,Y+26,10,8);px(c,'#f2c14e',X+60,Y+28,4,5);px(c,'#fff',X+60,Y+27,4,1)}
  if(hs.chapel){px(c,'#f2c14e',X+30,Y-8,4,12);px(c,'#f2c14e',X+26,Y-4,12,3)}
  if(hs.guard){px(c,'#5a3a22',X+62,Y+20,2,20);px(c,'#3a5fc8',X+64,Y+20,8,10);px(c,'#f2c14e',X+66,Y+23,4,4)}
}
function renderWorld(){for(let y=0;y<H;y++)for(let x=0;x<W;x++)drawTile(wx,x,y);if(!DUNTHEME){HOUSES.forEach(h=>drawHouse(wx,h));drawLighthouse(wx)}}
function drawLighthouse(c){const X=LIGHTHOUSE.x*16,Y=LIGHTHOUSE.y*16;c.fillStyle='rgba(0,0,0,.25)';c.fillRect(X+2,Y+14,16,4);
  for(let i=0;i<6;i++)px(c,i%2?'#c8402e':'#f4f0e6',X+3+(i>>1),Y+12-i*8,10-(i>>1)*2,8);px(c,'#1a1420',X+2,Y-38,12,2);px(c,'#2a2430',X+4,Y-46,8,8);px(c,'#f2c14e',X+5,Y-45,6,6);px(c,'#1a1420',X+3,Y-48,10,2);px(c,'#c8402e',X+5,Y-51,6,3)}

/* ----- minimap + fog ----- */
const mmBase=cnv(W,H),mmb=mmBase.getContext('2d'),fogCv=cnv(W,H),fogx=fogCv.getContext('2d');
const explored=new Uint8Array(W*H);
function mmColor(x,y){const t=at(x,y),r=RG(x,y);return{1:'#2a5a24',2:'#1f5a94',3:'#c8ac72',4:'#70747e',5:'#3b3642',6:'#a8432e',7:'#9a6a3a',8:'#9a5fe0',10:'#f2c14e',11:'#7a7f88',12:'#4a4630',13:'#9a9fa8',14:'#8a5a32',16:'#e0602e',17:'#e2cf92',18:'#3f93c8',19:'#f2c14e',20:'#c8402e',21:'#7fe07a',22:'#8a8f98',23:'#ff6aff',24:'#0b0910',25:'#ffffff',26:'#ffffff',27:'#7fe07a'}[t]||(GP[r]||GP[0])[0]}
function buildMM(){for(let y=0;y<H;y++)for(let x=0;x<W;x++){mmb.fillStyle=mmColor(x,y);mmb.fillRect(x,y,1,1)}}
function resetFog(){explored.fill(0);fogx.globalCompositeOperation='source-over';fogx.fillStyle='#0b0910';fogx.fillRect(0,0,W,H)}
function reveal(cx,cy,r){for(let y=cy-r;y<=cy+r;y++)for(let x=cx-r;x<=cx+r;x++){if(x<0||y<0||x>=W||y>=H)continue;if((x-cx)**2+(y-cy)**2>r*r)continue;const i=y*W+x;if(!explored[i]){explored[i]=1;fogx.clearRect(x,y,1,1)}}}
function fogPack(){let s='';for(let i=0;i<explored.length;i+=8){let b=0;for(let k=0;k<8;k++)if(explored[i+k])b|=1<<k;s+=String.fromCharCode(b)}return btoa(s)}
function fogUnpack(str){resetFog();try{const s=atob(str);for(let j=0;j<s.length;j++){const b=s.charCodeAt(j);for(let k=0;k<8;k++)if(b&(1<<k)){const i=j*8+k;if(i<explored.length){explored[i]=1;fogx.clearRect(i%W,(i/W)|0,1,1)}}}}catch(_){}}

/* ----- audio ----- */
let AC=null,muted=false,lastHit=0;const SET={music:.5,sfx:.8,autoFull:true};
const SFX={swing:['triangle',600,200,.05,.08],bow:['triangle',900,300,.04,.07],fire:['sawtooth',340,90,.04,.22],hit:['square',220,70,.035,.06],coin:['square',880,1400,.025,.08],hurt:['sawtooth',170,60,.07,.22],lvl:['triangle',440,990,.07,.5],heal:['sine',500,1000,.06,.35],nova:['sine',1000,180,.07,.45],rune:['triangle',330,1100,.08,.8],boss:['sawtooth',110,40,.07,.9],orb:['sine',300,180,.02,.15],die:['square',220,40,.06,.6],deny:['square',140,120,.03,.08],boom:['sawtooth',120,30,.09,.5],zap:['square',1200,300,.04,.15],growl:['sawtooth',90,60,.06,.4],item:['triangle',660,1320,.05,.25],legend:['triangle',220,1760,.08,1.2]};
function sfx(n){if(!AC||muted)return;if(n==='hit'){const now=performance.now();if(now-lastHit<45)return;lastHit=now}
  const p=SFX[n];if(!p)return;const t=AC.currentTime,o=AC.createOscillator(),g=AC.createGain();o.type=p[0];o.frequency.setValueAtTime(p[1],t);o.frequency.exponentialRampToValueAtTime(p[2],t+p[4]);g.gain.setValueAtTime(Math.max(.0002,p[3]*SET.sfx),t);g.gain.exponentialRampToValueAtTime(.0001,t+p[4]);o.connect(g);g.connect(AC.destination);o.start(t);o.stop(t+p[4]+.03)}
