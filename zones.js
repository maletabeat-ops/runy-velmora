'use strict';
/* ===== zones: Act I areas, props, exits, gates ===== */
const PROPDEF={oak:{fw:2,fh:1},spruce:{fw:1,fh:1},birch:{fw:1,fh:1},deadtree:{fw:1,fh:1},cottage:{fw:4,fh:2,win:1},treehouse:{fw:4,fh:2},well:{fw:2,fh:1},lantern:{fw:1,fh:1,light:44},
  signpost:{fw:1,fh:1},fence:{fw:2,fh:1},rock:{fw:2,fh:1},mossrock:{fw:1,fh:1},bush:{fw:1,fh:1},stump:{fw:1,fh:1},pillar:{fw:1,fh:1},campfire:{fw:2,fh:1,light:80,fire:true},shard:{fw:1,fh:1,light:60},mushrooms:{fw:0,fh:0,light:22},
  house2:{fw:4,fh:2,win:1},house3:{fw:5,fh:2,win:1},tavern:{fw:5,fh:3,win:1},smithy:{fw:5,fh:2,win:1,light:50,fire:true},shop:{fw:4,fh:2,win:1},temple:{fw:5,fh:3,win:1,light:60},mill:{fw:3,fh:2},coop:{fw:3,fh:1},tent:{fw:3,fh:1},
  fountain:{fw:3,fh:2},garden:{fw:3,fh:1},stall_r:{fw:2,fh:1},stall_b:{fw:2,fh:1},stall_g:{fw:2,fh:1},statue:{fw:1,fh:1,light:36},board:{fw:2,fh:1},doghouse:{fw:2,fh:1},hay:{fw:2,fh:1},
  cart:{fw:2,fh:1},logs:{fw:2,fh:1},laundry:{fw:0,fh:0},flags:{fw:0,fh:0},garland:{fw:0,fh:0,light:30},gate:{fw:0,fh:0},stairs:{fw:2,fh:1},flowerbed:{fw:2,fh:1},bench:{fw:1,fh:1},
  barrel:{fw:1,fh:1},crates:{fw:1,fh:1},sacks:{fw:1,fh:1},apples:{fw:0,fh:0},pots:{fw:1,fh:1},hive:{fw:1,fh:1},anvil:{fw:1,fh:1},target:{fw:1,fh:1},scarecrow:{fw:1,fh:1},mailbox:{fw:1,fh:1},boat:{fw:0,fh:0}};
const ZONES={
 village:{n:'Светлый Ручей',biome:'village',w:64,h:50,lv:[1,1],safe:true,music:'village',gen:genVillage},
 forest:{n:'Шепчущий лес',biome:'forest',w:72,h:56,lv:[1,4],foes:{wolf:3,spider:2,boar:1,sporeling:2},cap:20,music:'wild',gen:genForest},
 marsh:{n:'Туманные топи',biome:'marsh',w:64,h:52,lv:[4,7],foes:{mistborn:3,sporeling:2,spider:1,cultist:2},cap:22,music:'dark',gen:genMarsh,fog:true}
};
let CRIT=[],CHK=null,ZONE=null,ZID='village',PROPS=[],EXITS=[],SAFE=null,ZPOINTS={};
const inVil=(tx,ty)=>!!SAFE&&tx>=SAFE.x0&&tx<=SAFE.x1&&ty>=SAFE.y0&&ty<=SAFE.y1;
function addProp(img,tx,ty,o={}){const d=PROPDEF[img]||{fw:1,fh:1};const p={img,x:tx*16+8+(o.dx!=null?o.dx:(d.fw>0&&d.fw%2===0?8:0)),y:ty*16+14+(o.dy||0),tx,ty,...d,...o};PROPS.push(p);
  for(let y=ty-d.fh+1;y<=ty;y++)for(let x=tx-((d.fw-1)>>1);x<tx-((d.fw-1)>>1)+d.fw;x++)if(x>=0&&y>=0&&x<W&&y<H&&d.fw>0)col[y*W+x]=1;return p}
function carve(pts,wd,t=T.PATH){for(let i=1;i<pts.length;i++){const[a,b]=[pts[i-1],pts[i]];const n=Math.max(Math.abs(b[0]-a[0]),Math.abs(b[1]-a[1]))*2||1;
  for(let k=0;k<=n;k++){const x=Math.round(a[0]+(b[0]-a[0])*k/n),y=Math.round(a[1]+(b[1]-a[1])*k/n);for(let dy=0;dy<wd;dy++)for(let dx=0;dx<wd;dx++){const xx=x+dx-(wd>>1),yy=y+dy-(wd>>1);const c=at(xx,yy);if(c===T.WATER||c===T.SHALLOW)set(xx,yy,T.BRIDGE);else if(c!==T.BRIDGE)set(xx,yy,t)}}}}
function distMap(){const d=new Int16Array(W*H).fill(999),q=[];for(let i=0;i<W*H;i++)if(map[i]===T.PATH||map[i]===T.BRIDGE||map[i]===T.EXIT){d[i]=0;q.push(i)}
  for(let h=0;h<q.length;h++){const i=q[h];for(const o of[1,-1,W,-W]){const j=i+o;if(j<0||j>=W*H||d[j]<=d[i]+1)continue;d[j]=d[i]+1;q.push(j)}}return d}
function forestFill(R,dense,kinds,keep){const d=distMap();for(let y=1;y<H-1;y++)for(let x=1;x<W-1;x++){const i=y*W+x;if(col[i]||map[i]!==T.GRASS&&map[i]!==T.DARK&&map[i]!==T.FLOWERS&&map[i]!==T.MUD)continue;if(keep&&keep(x,y))continue;
  const n=(Math.sin(x*.31+y*.17)+Math.cos(y*.27-x*.11)+Math.sin((x+y)*.13))/3;const edge=x<3||y<3||x>W-4||y>H-4;const p=edge?.85:dense*(.5+n)*(d[i]>3?1:d[i]>2?.25:0);
  if(R()<p&&!col[i]&&!col[i-1]&&!col[i+1]){addProp(pickW(kinds),x,y,{dx:rr(4)})}}}
function sprinkle(R,n,kinds,ok){for(let k=0;k<n*8&&n>0;k++){const x=2+((R()*(W-4))|0),y=2+((R()*(H-4))|0),i=y*W+x;if(col[i]||SOLID.has(map[i])||map[i]===T.PATH)continue;if(ok&&!ok(x,y))continue;addProp(pick(kinds),x,y);n--}}
function baseFill(R,dark){for(let y=0;y<H;y++)for(let x=0;x<W;x++){const q=R(),n=Math.sin(x*.23+y*.11)+Math.cos(y*.19-x*.07);map[y*W+x]=q<.05?T.FLOWERS:(dark&&n>.4)?T.DARK:T.GRASS}}
function exitBand(x0,y0,x1,y1,to,arrive){rect(x0,y0,x1,y1,T.EXIT);EXITS.push({x0,y0,x1,y1,to,arrive})}
/* ----- village: Светлый Ручей ----- */
function genVillage(){const R=mulberry32(101);baseFill(R,false);CRIT=[];
  const sx=y=>55+Math.round(Math.sin(y*.25)*1.2);
  for(let y=0;y<H;y++){const c=sx(y);for(let x=c-2;x<=c+2;x++)set(x,y,Math.abs(x-c)<=1?T.WATER:T.SHALLOW)}
  carve([[30,0],[30,46]],2);carve([[2,24],[62,24]],2);rect(23,19,37,29,T.PATH);
  carve([[30,14],[41,14]],2);carve([[21,12],[30,12]],2);carve([[9,24],[9,13]],2);carve([[17,25],[17,40]],2);carve([[9,40],[17,40]],2);carve([[37,29],[46,34]],2);carve([[30,42],[38,42]],2);
  exitBand(29,0,31,0,'forest','s');SAFE={x0:0,y0:0,x1:W-1,y1:H-1};const P_=(k,x,y)=>ZPOINTS[k]={x:x*16+8,y:y*16+8};
  /* north: gate, guard drill, temple, Irel */
  addProp('gate',30,3,{dx:0});addProp('target',35,5);addProp('target',37,7);addProp('barrel',26,4);addProp('crates',25,5);
  addProp('treehouse',21,10);P_('irel',22,12);addProp('lantern',25,11);addProp('flowerbed',17,12);
  addProp('temple',41,11);P_('owl',41,13);addProp('statue',37,12);addProp('statue',45,12);addProp('bench',35,16);P_('turtle',36,16);addProp('pots',47,10);
  /* plaza & market */
  addProp('fountain',30,26);P_('spawn',30,21);P_('n',30,2);
  addProp('stall_r',25,20);addProp('stall_b',34,20);addProp('stall_g',25,29);addProp('apples',23,20);addProp('crates',37,20);addProp('sacks',23,29);addProp('barrel',27,29);
  addProp('flags',27,18);addProp('garland',33,18);addProp('garland',23,24);addProp('flags',37,26);addProp('bench',24,26);addProp('bench',36,23);
  P_('mouse',25,22);P_('baker',27,27);P_('kids',33,27);addProp('board',35,29);P_('born',37,30);
  [[27,16],[33,16],[22,21],[38,21],[22,28],[38,28],[27,32],[33,32],[13,22],[47,22],[33,40],[21,38]].forEach(([x,y])=>addProp('lantern',x,y));
  /* west: smithy, mill, farm, mine */
  addProp('smithy',17,19);P_('kornel',17,21);addProp('anvil',21,21);addProp('logs',12,20);addProp('barrel',21,18);
  addProp('mill',6,11);addProp('hay',2,14);addProp('hay',12,13);addProp('scarecrow',12,16);addProp('garden',5,17);addProp('garden',5,20);addProp('hive',1,17);addProp('hive',1,19);
  addProp('stairs',12,29);P_('mole',14,30);addProp('crates',9,29);addProp('sacks',9,30);
  addProp('house3',8,37);P_('motta',8,39);addProp('pots',3,38);addProp('mushrooms',13,38);
  addProp('coop',18,44);addProp('hay',22,44);
  /* east: tavern, shop, homes, stream */
  addProp('tavern',41,19);P_('cat',41,21);addProp('barrel',45,19);addProp('barrel',46,20);addProp('bench',38,17);
  addProp('house2',49,18);addProp('doghouse',51,21);addProp('mailbox',47,20);
  addProp('shop',46,31);P_('lucia',46,33);addProp('mailbox',43,32);addProp('flowerbed',49,33);
  addProp('house2',39,40);addProp('laundry',43,38);addProp('pots',35,40);addProp('mailbox',41,42);
  addProp('cottage',24,40);addProp('flowerbed',27,41);P_('squirrel',26,44);addProp('cart',24,44);addProp('logs',21,41);
  addProp('tent',59,28);P_('raven',59,30);addProp('campfire',61,31,{dx:0});addProp('boat',sx(37),37);P_('frog',sx(33)-3,33);addProp('crates',57,27);
  /* green */
  addProp('oak',14,8);addProp('birch',48,5);addProp('oak',52,11);addProp('birch',34,45);addProp('oak',46,45);addProp('bush',19,14);addProp('bush',43,27);addProp('bush',51,37);addProp('stump',4,27);addProp('mossrock',13,46);addProp('birch',3,32);addProp('oak',36,35);
  forestFill(R,.18,{oak:3,spruce:2,birch:3},(x,y)=>x>3&&x<W-4&&y>3&&y<H-4);
  /* critters */
  const C=(img,x,y,o)=>CRIT.push({lf:img!=='cat',img,x:x*16+8,y:y*16+8,hx:x*16+8,hy:y*16+8,t:R()*5,vx:0,vy:0,fl:false,...o});
  for(let i=0;i<5;i++)C('chicken',16+i%3*2,46-(i>>1)%2,{r:28,sp:16});for(let i=0;i<3;i++)C('duck',sx(12+i*10),12+i*10,{r:30,sp:8,water:1});
  C('cat',40,22,{r:40,sp:14});C('crow',5,15,{r:20,sp:10,crow:1});C('crow',10,18,{r:20,sp:10,crow:1});C('crow',33,44,{r:20,sp:10,crow:1});
  [[18,13],[50,22],[28,42],[6,16],[34,15],[50,35],[3,36]].forEach(([x,y])=>C('butterfly',x,y,{r:24,sp:12,fly:1}))}
/* ----- forest: Шепчущий лес ----- */
function genForest(){const R=mulberry32(202);baseFill(R,true);
  disc(14,40,4,T.WATER);disc(14,40,5,T.SHALLOW);disc(14,40,3,T.WATER);
  carve([[36,55],[35,46],[30,40],[33,32],[36,24]],2);carve([[36,24],[44,20],[54,19],[62,19],[71,19]],2);carve([[30,40],[20,32],[12,28]],2);carve([[36,24],[34,12],[40,6]],2);
  rect(64,17,66,21,T.MIST);exitBand(71,18,71,20,'marsh','w');exitBand(35,55,37,55,'village','n');
  disc(36,24,5,T.GRASS);disc(12,28,4,T.DARK);disc(40,6,4,T.GRASS);
  ZPOINTS.shard={x:36*16+8,y:23*16+8};addProp('shard',36,23,{quest:'shard'});
  ZPOINTS.nest={x:12*16,y:28*16};ZPOINTS.chest1={tx:40,ty:5};ZPOINTS.chest2={tx:9,ty:26};
  forestFill(R,.55,{oak:3,spruce:4,birch:2,deadtree:.4},(x,y)=>Math.hypot(x-36,y-24)<6||Math.hypot(x-12,y-28)<5||Math.hypot(x-40,y-6)<4||Math.hypot(x-14,y-40)<6);
  sprinkle(R,18,['bush','stump','mossrock','rock'],null);
  ZPOINTS.mush=[];for(let k=0;k<300&&ZPOINTS.mush.length<7;k++){const x=4+((R()*(W-8))|0),y=4+((R()*(H-8))|0),i=y*W+x;if(col[i]||SOLID.has(map[i])||map[i]===T.PATH||map[i]===T.EXIT||map[i]===T.MIST)continue;
    if(ZPOINTS.mush.some(m=>Math.abs(m.tx-x)+Math.abs(m.ty-y)<10))continue;ZPOINTS.mush.push({tx:x,ty:y});addProp('mushrooms',x,y,{quest:'mush',mid:ZPOINTS.mush.length-1})}
  ZPOINTS.s={x:36*16+8,y:53*16};ZPOINTS.n={x:36*16+8,y:53*16};ZPOINTS.e={x:69*16,y:19*16+8};ZPOINTS.spawn=ZPOINTS.s}
/* ----- marsh: Туманные топи ----- */
function genMarsh(){const R=mulberry32(303);for(let y=0;y<H;y++)for(let x=0;x<W;x++){const n=Math.sin(x*.42)*Math.cos(y*.37)+Math.sin((x-y)*.21);const q=R();const m=Math.sin(x*.17+1)*Math.cos(y*.21)+Math.sin((x+y)*.09);map[y*W+x]=n>1.05?T.WATER:n>.75?T.SHALLOW:m>.55?T.MUD:q<.04?T.FLOWERS:T.GRASS}
  carve([[0,20],[10,21],[20,26],[30,30],[32,20],[32,10]],2);carve([[30,30],[44,32],[54,30],[63,30]],2);carve([[20,26],[14,40],[22,46]],2);
  exitBand(0,19,0,21,'forest','e');rect(58,28,60,32,T.SHADOW);exitBand(63,29,63,31,'hills','w');
  disc(32,9,7,T.GRASS);disc(30,31,4,T.GRASS);disc(22,46,3,T.GRASS);
  ZPOINTS.arena={x:32*16+8,y:9*16+8};[[26,5],[38,5],[25,11],[39,11],[32,3]].forEach(([x,y])=>addProp('pillar',x,y));
  addProp('campfire',30,31);[[26,29],[34,29],[27,34],[33,34]].forEach(([x,y])=>addProp('fence',x,y));ZPOINTS.camp={x:30*16,y:31*16};
  ZPOINTS.chest1={tx:22,ty:46};ZPOINTS.chest2={tx:50,ty:12};disc(50,12,2,T.GRASS);
  forestFill(R,.4,{deadtree:4,spruce:1,birch:.5},(x,y)=>Math.hypot(x-32,y-9)<8||Math.hypot(x-30,y-31)<5||Math.hypot(x-22,y-46)<4||Math.hypot(x-50,y-12)<3);
  sprinkle(R,16,['mossrock','stump','mushrooms','bush'],null);
  ZPOINTS.w={x:2*16,y:20*16+8};ZPOINTS.e={x:56*16,y:30*16+8};ZPOINTS.spawn=ZPOINTS.w}

/* ----- zone switching ----- */
const REGTILES=[];
function loadZone(id,arrive){const Z=ZONES[id];if(!Z){toast('Этот путь откроется во втором акте','#cfd8ff');return false}
  if(P&&ZID&&G.zoneFog)G.zoneFog[ZID]=fogPack();
  ZID=id;ZONE=Z;W=Z.w;H=Z.h;WW=W*TS;WH=H*TS;map=new Uint8Array(W*H);col=new Uint8Array(W*H);PROPS=[];EXITS=[];CRIT=[];SAFE=null;ZPOINTS={};BIO=BIOME[Z.biome];
  Z.gen();renderWorld();buildMM();const mm=$('mm'),k=Math.max(2,Math.floor(Math.min(180/W,130/H)));mm.width=W*k;mm.height=H*k;mm.style.width=W*k+'px';mm.style.height=H*k+'px';mm.dataset.k=k;
  if(G.zoneFog&&G.zoneFog[id])fogUnpack(G.zoneFog[id]);else resetFog();
  REGTILES.length=0;for(let i=0;i<W*H;i++){const t=map[i];if(!SOLID.has(t)&&!col[i]&&t!==T.EXIT&&t!==T.SHALLOW&&t!==T.WATER)REGTILES.push(i)}
  enemies=[];proj=[];pickups=[];parts=[];warns=[];zones=[];G.boss=null;
  CHESTS=[];['chest1','chest2'].forEach((k,i)=>{const c=ZPOINTS[k];if(!c)return;const key=id+':'+i;CHESTS.push({key,tx:c.tx,ty:c.ty,x:c.tx*16+8,y:c.ty*16+12,open:!!(P&&P.chests&&P.chests[key]),lvl:Z.lv[1]+ngOff()})});
  NPCS=zoneNpcs(id);
  const a=ZPOINTS[arrive]||ZPOINTS.spawn;if(P){P.x=a.x;P.y=a.y;P.zone=id;if(P.cmp){P.cmp.x=P.x;P.cmp.y=P.y}}
  if(Z.cap)for(let i=0;i<Z.cap;i++)spawnInZone(160);
  G.cx=(P?P.x:0)-VW/2;G.cy=(P?P.y:0)-VH/2;G.regionCur=-1;storyZoneEnter(id);return true}
function spawnInZone(minD){const Z=ZONE;if(!Z.foes||!REGTILES.length)return false;const night=nightF()>.5;
  for(let i=0;i<30;i++){const idx=REGTILES[rint(REGTILES.length)],tx=idx%W,ty=(idx/W)|0;const x=tx*16+8,y=ty*16+8;
    if(Math.hypot(x-P.x,y-P.y)<minD||blocked(x,y,6,'e'))continue;if(EXITS.some(e=>Math.abs(e.x0-tx)<6&&Math.abs(e.y0-ty)<6))continue;
    const type=pickW(Z.foes),lvl=Z.lv[0]+rint(Z.lv[1]-Z.lv[0]+1)+ngOff()+(night?1:0),el=Math.random()<(night?.16:.08);
    spawn(type,x,y,{lvl,elite:el,reg:0});if(FOES[type].pack)for(let k=0;k<1+rint(2);k++){const ax=x+rr(20),ay=y+rr(20);if(!blocked(ax,ay,6,'e'))spawn(type,ax,ay,{lvl,reg:0})}return true}return false}
function checkExits(){const tx=P.x/16|0,ty=P.y/16|0;for(const e of EXITS)if(tx>=e.x0&&tx<=e.x1&&ty>=e.y0&&ty<=e.y1){if(!ZONES[e.to]){toast('Дальше начинается второй акт. Скоро!','#cfd8ff');P.x-=P.fx*20;P.y-=P.fy*20;return}
  const from=ZID;save();loadZone(e.to,e.arrive);save();return}}
