'use strict';
/* ===== core: utils, world map, sprites, tiles ===== */
const $=id=>document.getElementById(id);
const TS=16,W=140,H=110,WW=W*TS,WH=H*TS;
const T={GRASS:0,TREE:1,WATER:2,PATH:3,WALL:4,FLOOR:5,HOUSE:6,BRIDGE:7,GATE:8,FLOWER:9,SHRINE:10,ROCK:11,MUD:12,GRAVE:13,TENT:14,BONES:15,LAVA:16};
const SOLID=new Set([1,2,4,6,8,10,11,13,14,16]);
const PSOLID=new Set([1,4,6,8,10,11,13,14]);
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
const RN=['meadow','village','forest','swamp','hills','grave','crypt','snow','ash'];
const VIL={x0:60,y0:45,x1:80,y1:61},CRYPT={x0:105,y0:86,x1:130,y1:104},GATE={x:117,y:86};
const inVil=(tx,ty)=>tx>=VIL.x0&&tx<=VIL.x1&&ty>=VIL.y0&&ty<=VIL.y1;
const inCrypt=(tx,ty)=>tx>CRYPT.x0&&tx<CRYPT.x1&&ty>CRYPT.y0&&ty<CRYPT.y1;
const HOUSES=[{x:63,y:47,roof:'#a8432e',dark:'#7e2c1d'},{x:73,y:47,roof:'#5a6274',dark:'#3d4352',smith:true},{x:63,y:55,roof:'#4f7a3a',dark:'#365a27'},{x:73,y:55,roof:'#3a5fc8',dark:'#24398a',guard:true}];
const SHRINE_DEF=[
 {id:'frost',x:14,y:38,boss:'fang',lvl:8,name:'Руна Инея',col:'#8fe8ff',where:'в Тёмном лесу на западе'},
 {id:'fire',x:108,y:30,boss:'grokk',lvl:11,name:'Руна Пламени',col:'#ff9a4a',where:'на Гоблинских холмах на северо-востоке'},
 {id:'life',x:24,y:96,boss:'queen',lvl:14,name:'Руна Жизни',col:'#7fe07a',where:'в Гнилых топях на юго-западе'},
 {id:'storm',x:78,y:9,boss:'yeti',lvl:18,name:'Руна Бури',col:'#d8e8ff',where:'на Ледяном перевале далеко на севере'},
 {id:'shadow',x:130,y:40,boss:'ashlord',lvl:21,name:'Руна Тени',col:'#b07aff',where:'в Пепельных пустошах на крайнем востоке'}];
const CHEST_POS=[[6,44],[34,30],[52,34],[88,44],[96,14],[132,10],[56,6],[100,4],[12,64],[30,86],[8,104],[60,92],[90,76],[134,64],[126,30],[96,100],[108,102],[128,102]];
const SPAWN={x:1136,y:848};
const TENTS=[[100,20],[112,22],[116,40],[98,34],[104,14]];
function regionCalc(tx,ty){
  if(inVil(tx,ty))return 1;
  if(tx>=CRYPT.x0&&tx<=CRYPT.x1&&ty>=CRYPT.y0&&ty<=CRYPT.y1)return 6;
  const o=Math.round(Math.sin(tx*.31+ty*.07)*1.6+Math.cos(ty*.27-tx*.05)*1.6);
  if(ty+o<22)return 7;
  if(tx-o>=120&&ty+o<80)return 8;
  if(tx+o<46&&ty-o<74)return 2;
  if(ty+o>=78&&tx-o<84)return 3;
  if(tx-o>=92&&ty+o<62)return 4;
  if(tx-o>=84&&ty+o>=66)return 5;
  return 0;
}
function genMap(){
  const R=mulberry32(4242);
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){
    const r=regionCalc(x,y);reg[y*W+x]=r;let t=T.GRASS;const q=R();const n=Math.sin(x*.45)*Math.cos(y*.38)+Math.sin((x+y)*.2);
    if(r===0){if(q<.06)t=T.FLOWER;else if(q<.11)t=T.TREE;else if(q<.125)t=T.ROCK}
    else if(r===2){if(q<.36)t=T.TREE;else if(q<.39)t=T.ROCK;else if(q<.45)t=T.FLOWER}
    else if(r===3){if(n>1.05)t=T.WATER;else if(q<.32)t=T.MUD;else if(q<.40)t=T.TREE;else if(q<.43)t=T.FLOWER}
    else if(r===4){if(q<.06)t=T.ROCK;else if(q<.09)t=T.TREE;else if(q<.13)t=T.FLOWER}
    else if(r===5){if(q<.12&&x%3===0)t=T.GRAVE;else if(q<.17)t=T.TREE;else if(q<.21)t=T.BONES}
    else if(r===7){if(n>1.2)t=T.WATER;else if(q<.2)t=T.TREE;else if(q<.25)t=T.ROCK}
    else if(r===8){if(n>1.1)t=T.LAVA;else if(q<.06)t=T.TREE;else if(q<.13)t=T.ROCK;else if(q<.17)t=T.BONES}
    else if(r===1){if(q<.05)t=T.FLOWER}
    map[y*W+x]=t;
  }
  for(let x=0;x<=100;x++){const y0=71+Math.round(Math.sin(x*.2)*1.3);for(let k=0;k<3;k++)if(RG(x,y0+k)!==1)set(x,y0+k,T.WATER)}
  for(let x=28;x<=112;x++){const y0=25+Math.round(Math.sin(x*.17)*1.2);for(let k=0;k<2;k++)set(x,y0+k,T.WATER)}
  ell(90,38,5,3,T.WATER);ell(40,60,4,3,T.WATER);ell(100,66,4,3,T.WATER);ell(40,12,6,3,T.WATER);
  rect(CRYPT.x0-2,CRYPT.y0-3,CRYPT.x1+2,CRYPT.y1+1,T.GRASS);
  rect(VIL.x0,VIL.y0,VIL.x1,VIL.y1,T.GRASS);for(let y=VIL.y0;y<=VIL.y1;y++)for(let x=VIL.x0;x<=VIL.x1;x++)if(R()<.05)set(x,y,T.FLOWER);
  SHRINE_DEF.forEach(s=>disc(s.x,s.y,6,T.GRASS));
  CHEST_POS.forEach(([x,y])=>rect(x-1,y-1,x+1,y+1,T.GRASS));
  const path=(x,y)=>{const t=at(x,y);set(x,y,t===T.WATER||t===T.BRIDGE||t===T.LAVA?T.BRIDGE:T.PATH)};
  const hl=(y,x0,x1)=>{for(let x=x0;x<=x1;x++)path(x,y)},vl=(x,y0,y1)=>{for(let y=y0;y<=y1;y++)path(x,y)};
  hl(52,4,135);hl(53,4,135);vl(70,4,100);vl(71,4,100);
  vl(14,38,53);vl(108,30,53);hl(96,24,70);hl(9,71,78);vl(130,40,53);vl(117,53,85);vl(118,53,85);
  SHRINE_DEF.forEach(s=>rect(s.x-1,s.y-1,s.x+1,s.y+1,T.PATH));
  HOUSES.forEach(h=>rect(h.x,h.y,h.x+3,h.y+2,T.HOUSE));
  TENTS.forEach(([x,y])=>set(x,y,T.TENT));
  rect(CRYPT.x0,CRYPT.y0,CRYPT.x1,CRYPT.y1,T.WALL);rect(CRYPT.x0+1,CRYPT.y0+1,CRYPT.x1-1,CRYPT.y1-1,T.FLOOR);
  [[110,91],[124,91],[110,99],[124,99],[117,102]].forEach(([x,y])=>set(x,y,T.WALL));
  set(GATE.x,GATE.y,T.GATE);
  SHRINE_DEF.forEach(s=>set(s.x,s.y,T.SHRINE));
  for(let y=0;y<H;y++)for(let x=0;x<W;x++)if(x<2||y<2||x>=W-2||y>=H-2)set(x,y,T.TREE);
  CHEST_POS.forEach(([x,y])=>{if(!inCrypt(x,y))carve(x,y)});
}
/* carve a walkable route from (sx,sy) to the nearest path tile */
function carve(sx,sy){const prev=new Int32Array(W*H).fill(-1),q=[sy*W+sx];prev[q[0]]=q[0];let end=-1;
  for(let h=0;h<q.length;h++){const i=q[h],x=i%W,y=(i/W)|0;const t=map[i];if((t===T.PATH||t===T.BRIDGE)&&h>0){end=i;break}
    for(const[dx,dy]of[[1,0],[-1,0],[0,1],[0,-1]]){const nx=x+dx,ny=y+dy;if(nx<2||ny<2||nx>=W-2||ny>=H-2)continue;const j=ny*W+nx;if(prev[j]>=0)continue;
      const tt=map[j];if(tt===T.WALL||tt===T.HOUSE||tt===T.GATE||tt===T.SHRINE||tt===T.TENT||inCrypt(nx,ny))continue;prev[j]=i;q.push(j)}}
  if(end<0)return;let i=end;while(i!==prev[i]){const t=map[i];if(t===T.WATER||t===T.LAVA)map[i]=T.BRIDGE;else if(SOLID.has(t)||t===T.MUD)map[i]=T.GRASS;i=prev[i]}}

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
staff:["..........kk",".........kck","........kcpk",".......kkpk.","......khkk..",".....khk....","....khk.....","...khk......","..khk.......",".khk........","khk.........","kk.........."],
dagger:["..........kk",".........kwk","........kwk.",".......kwk..","......kwk...",".....kwk....","..k.kwk.....","...kyk......","..kyyk......",".khk........","khk.........","kk.........."],
sword:["..........kk",".........kwk","........kwgk",".......kwgk.","......kwgk..",".....kwgk...","..k.kwgk....","...kygk.....","..kyyk......",".khk.k......","khk.........","kk.........."],
bow:["....kkk.....","...khhkk....","..khk..wk...","..kh....w...",".kh.....w...",".kh..kkkwkk.",".kh.....w...","..kh....w...","..khk..wk...","...khhkk....","....kkk.....","............"],
armor:["..kk....kk..",".kggk..kggk.",".kgggkkgggk.","..kgggggggk.","..kgggwgggk.","..kgggwgggk.","..kgggggggk.","..kgggggggk.","..kGGGGGGGk.","...kkkkkkk..","............","............"],
amulet:["..k......k..","...k....k...","....k..k....",".....kk.....","....kyyk....","...kyrryk...","...kyrryk...","....kyyk....",".....kk.....","............","............","............"],
ring:["....kkk.....","...kcwck....","....kkk.....","...kyyyk....","..ky...yk...","..ky...yk...","..ky...yk...","...kyyyk....","....kkk.....","............","............","............"],
pot:["....kkk.....","....khk.....","...kk.kk....","..kwrrrrk...",".kwrrrrrrk..",".krrrrrrrk..",".krrrrrrrk..","..kRrrrRk...","...kkkkk....","............","............","............"]
};
const ALT={snowpine:['pine',{n:'#5a7a8a',m:'#e8f0f8',l:'#ffffff',N:'#3a5060'}],burnt:['dead',{T:'#2a2020'}],yeti:['ogre',{l:'#e8f0f8',L:'#9ab0c8',t:'#6a8aa8',T:'#3a5070'}],ashlord:['lich',{w:'#3a2a2a',P:'#8a2a14',p:'#ff9a3a',v:'#4a1010',y:'#ff6a3a'}],iwolf:['wolf',{g:'#c8dcf0',G:'#7a9ab8',W:'#ffffff'}],troll:['ogre',{l:'#a8c0d0',L:'#6a8098'}],wraith:['ghost',{w:'#a8d8ff',W:'#6a9ad0'}],imp:['goblin',{e:'#d8402e',E:'#8a1a10',t:'#3a2020'}],golem:['ogre',{l:'#6a5a50',L:'#3a2e28',t:'#c8401e',T:'#8a2a14',w:'#ffb03a'}],tslime:['slime',{e:'#b07ad8',E:'#5a2a80',w:'#f0d8ff'}],queen:['slime',{e:'#e87ab8',E:'#9a3a78',w:'#ffe0f0'}],fang:['wolf',{g:'#4a4450',G:'#2a2430',W:'#6a6470',r:'#ff3020'}],
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
const GP=[['#4f8a3a','#437a31','#66a34b'],['#4f8a3a','#437a31','#66a34b'],['#2e5a2b','#244a22','#3c6e35'],['#4d5a2e','#404c26','#62703c'],['#8a9248','#767f3c','#a3aa5c'],['#4d4c40','#403f35','#5f5d4c'],['#4d4c40','#403f35','#5f5d4c'],['#dfe6ee','#c4d0dd','#f6f9fc'],['#4a3a36','#3a2c2a','#5c4842']];
const worldCv=cnv(WW,WH),wx=worldCv.getContext('2d');
function px(c,col,x,y,w=1,h=1){c.fillStyle=col;c.fillRect(x,y,w,h)}
function drawTile(c,tx,ty){
  const t=at(tx,ty),X=tx*TS,Y=ty*TS,h=s=>hash(tx,ty,s),r=RG(tx,ty),gp=GP[r];
  const grass=()=>{px(c,gp[0],X,Y,16,16);for(let i=0;i<7;i++)px(c,i<4?gp[1]:gp[2],X+((h(i)*15)|0),Y+((h(i+9)*14)|0),1,2)};
  const isP=v=>v===T.PATH||v===T.BRIDGE||v===T.SHRINE||v===T.GATE;
  const shade=()=>{c.fillStyle='rgba(0,0,0,.25)';c.beginPath();c.ellipse(X+8,Y+14,7,2.5,0,0,7);c.fill()};
  switch(t){
  case T.GRASS:case T.HOUSE:grass();break;
  case T.FLOWER:grass();
    if(r===2){for(let i=0;i<2;i++){const fx=X+2+((h(20+i)*10)|0),fy=Y+3+((h(30+i)*9)|0);px(c,'#e8e0d0',fx+1,fy+2,1,2);px(c,'#c8402e',fx,fy,3,2);px(c,'#fff',fx+1,fy,1,1)}}
    else{const cols=r===7?['#a8c8ff','#ffffff']:r===8?['#ff6a3a','#f2a03a']:r===5?['#c9c2b2','#9a8fa8']:r===3?['#c8d86a','#e8e0a0']:r===4?['#f2c14e','#e8822e']:['#efe6f5','#f2c14e','#e0607a','#9fb7ff'];
      for(let i=0;i<3;i++){const fx=X+2+((h(20+i)*11)|0),fy=Y+2+((h(30+i)*11)|0);px(c,cols[(h(40+i)*cols.length)|0],fx,fy,2,2)}}break;
  case T.TREE:grass();shade();c.drawImage(r===2?SPR.pine:r===7?SPR.snowpine:r===8?SPR.burnt:(r===3||r===5)?SPR.dead:SPR.tree,X,Y-2);break;
  case T.ROCK:grass();c.drawImage(SPR.rock,X,Y);break;
  case T.GRAVE:grass();c.drawImage(SPR.grave,X,Y);break;
  case T.TENT:grass();c.drawImage(SPR.tent,X,Y+4);break;
  case T.BONES:grass();px(c,'#e8e0d0',X+4,Y+10,6,1);px(c,'#e8e0d0',X+3,Y+9,1,3);px(c,'#e8e0d0',X+10,Y+9,1,3);px(c,'#e8e0d0',X+9,Y+3,4,3);px(c,'#1a1420',X+10,Y+4,1,1);break;
  case T.LAVA:{px(c,'#8a2a14',X,Y,16,16);px(c,'#c8401e',X+1,Y+1,14,14);for(let i=0;i<4;i++)px(c,i%2?'#f2a03a':'#ffd36a',X+2+((h(i)*11)|0),Y+2+((h(i+4)*11)|0),2,2);break}
  case T.MUD:px(c,'#4a4630',X,Y,16,16);for(let i=0;i<3;i++)px(c,'#3a5a5a',X+((h(i)*10)|0),Y+((h(i+3)*13)|0),5,2);px(c,'#5a5638',X+((h(8)*12)|0),Y+((h(9)*12)|0),2,1);break;
  case T.WATER:{px(c,'#2c6aa8',X,Y,16,16);for(let i=0;i<3;i++)px(c,'#4a8fd0',X+((h(i)*12)|0),Y+3+i*5,4,1);
    const up=at(tx,ty-1),dn=at(tx,ty+1);if(up!==T.WATER&&up!==T.BRIDGE){px(c,'#3b6e2e',X,Y,16,1);px(c,'#a8d8f0',X,Y+1,16,1)}if(dn!==T.WATER&&dn!==T.BRIDGE)px(c,'#1f4f80',X,Y+14,16,2);break}
  case T.BRIDGE:px(c,'#9a6a3a',X,Y,16,16);for(let i=0;i<4;i++)px(c,'#6b4226',X,Y+i*4+3,16,1);
    if(at(tx-1,ty)!==T.BRIDGE)px(c,'#4a2a18',X,Y,2,16);if(at(tx+1,ty)!==T.BRIDGE)px(c,'#4a2a18',X+14,Y,2,16);break;
  case T.PATH:case T.SHRINE:px(c,'#b39560',X,Y,16,16);for(let i=0;i<5;i++)px(c,i%2?'#97794a':'#c9ad78',X+((h(i)*14)|0),Y+((h(i+5)*14)|0),2,1);
    if(!isP(at(tx,ty-1)))px(c,'#8e8a4e',X,Y,16,1);if(!isP(at(tx,ty+1)))px(c,'#8e8a4e',X,Y+15,16,1);if(!isP(at(tx-1,ty)))px(c,'#8e8a4e',X,Y,1,16);if(!isP(at(tx+1,ty)))px(c,'#8e8a4e',X+15,Y,1,16);break;
  case T.WALL:px(c,'#6b6f78',X,Y,16,16);for(let q=0;q<4;q++){px(c,'#50545d',X,Y+q*4+3,16,1);const o=(q%2)*4;for(let k=0;k<2;k++)px(c,'#50545d',X+o+k*8+3,Y+q*4,1,3)}
    if(at(tx,ty-1)!==T.WALL&&at(tx,ty-1)!==T.GATE)px(c,'#9aa0aa',X,Y,16,2);if(h(5)<.3)px(c,'#4f6a42',X+((h(6)*12)|0),Y+((h(7)*12)|0),3,2);break;
  case T.FLOOR:px(c,'#3b3642',X,Y,16,16);px(c,'#322d39',X,Y,16,1);px(c,'#322d39',X,Y,1,16);if(h(1)<.35)px(c,'#2a2530',X+2+((h(2)*11)|0),Y+2+((h(3)*11)|0),3,1);if(h(4)<.15)px(c,'#4a3f55',X+4+((h(8)*8)|0),Y+6,2,2);break;
  case T.GATE:px(c,'#3b3642',X,Y,16,16);px(c,'#24202b',X+1,Y+2,14,14);for(let i=0;i<4;i++)px(c,'#8a8f98',X+2+i*4,Y+2,1,14);px(c,'#8a8f98',X+1,Y+7,14,1);px(c,'#9a5fe0',X+7,Y+5,2,6);px(c,'#c9a0ff',X+6,Y+7,4,2);break;
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
  if(hs.guard){px(c,'#5a3a22',X+62,Y+20,2,20);px(c,'#3a5fc8',X+64,Y+20,8,10);px(c,'#f2c14e',X+66,Y+23,4,4)}
}
function renderWorld(){for(let y=0;y<H;y++)for(let x=0;x<W;x++)drawTile(wx,x,y);HOUSES.forEach(h=>drawHouse(wx,h))}

/* ----- minimap + fog ----- */
const mmBase=cnv(W,H),mmb=mmBase.getContext('2d'),fogCv=cnv(W,H),fogx=fogCv.getContext('2d');
const explored=new Uint8Array(W*H);
function mmColor(x,y){const t=at(x,y),r=RG(x,y);return{1:'#1f3f1c',2:'#2c6aa8',3:'#b39560',4:'#70747e',5:'#3b3642',6:'#a8432e',7:'#9a6a3a',8:'#9a5fe0',10:'#f2c14e',11:'#7a7f88',12:'#4a4630',13:'#9a9fa8',14:'#8a5a32',16:'#e0602e'}[t]||GP[r][0]}
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
