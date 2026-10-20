import{Bubble,BUBBLE,clamp}from'./engines.mjs';
import{fitCanvas,listen,round,line,circle,text,control,overlay,record,tone}from'./common.mjs';
const colors=['#ec94a4','#80c7ca','#edc46b','#a99bd5','#94c591'],dark=['#9d4a6c','#327f9e','#b17c34','#685397','#49866e'],symbols=['♥','✦','◆','✿','●'];
export function mountBubble(ui){
 const stage=ui.area,view=fitCanvas(stage,600,720),{canvas,ctx}=view;let game=new Bubble(),last=0,acc=0,raf=0,particles=[],end=null,paused=false,held=0,pointer=null;const clean=[];
 const less=control('↖',null),fire=control('发射 ↑',()=>shoot(),true),more=control('↗',null),swap=control('换球 ⇄',()=>{if(game.swap())tone(360,.05,'triangle');});
 function shoot(){if(game.fire()){tone(420,.08,'triangle');ui.status('五次未消除会增加一排。瞄准同色泡泡，三颗及以上消除。');}}
 for(const[b,dir]of[[less,-1],[more,1]]){clean.push(listen(b,'pointerdown',e=>{e.preventDefault();b.setPointerCapture(e.pointerId);held=dir;game.angle=clamp(game.angle+dir*.07,-Math.PI+.14,-.14);}));for(const ev of['pointerup','pointercancel','lostpointercapture'])clean.push(listen(b,ev,()=>held=0));}
 clean.push(listen(canvas,'pointerdown',e=>{const p=view.point(e);if(p.y>BUBBLE.LAUNCH-25||game.state!=='ready')return;pointer=e.pointerId;canvas.setPointerCapture(pointer);game.aim(p.x,p.y);}),listen(canvas,'pointermove',e=>{if(e.pointerType==='mouse'||pointer===e.pointerId){const p=view.point(e);if(p.y<BUBBLE.LAUNCH-25)game.aim(p.x,p.y);}}),listen(canvas,'pointerup',e=>{if(e.pointerId===pointer){pointer=null;shoot();}}),listen(canvas,'pointercancel',()=>pointer=null));
 clean.push(listen(window,'keydown',e=>{if(['ArrowLeft','ArrowRight',' ','x','X'].includes(e.key))e.preventDefault();if(e.key==='ArrowLeft')held=-1;if(e.key==='ArrowRight')held=1;if(!e.repeat&&e.key===' ')shoot();if(!e.repeat&&e.key.toLowerCase()==='x')swap.click();}),listen(window,'keyup',e=>{if(e.key==='ArrowLeft'||e.key==='ArrowRight')held=0;}),listen(window,'blur',()=>{held=0;pointer=null;}));
 ui.help('拖动或移动鼠标瞄准，松手发射。也可用左右按钮 / 方向键调整，空格发射，X 换球。三颗同色相连会消除，失去顶部连接的泡泡会掉落。五次未消除会增加一排，碰到危险线即结束。');
 ui.status('拖动瞄准，松手发射。先找一组同色泡泡吧。');
 function ball(x,y,r,color,alpha=1){ctx.save();ctx.globalAlpha=alpha;ctx.shadowColor=dark[color];ctx.shadowBlur=6;const g=ctx.createRadialGradient(x-r*.35,y-r*.38,r*.05,x,y,r);g.addColorStop(0,'#f5f1dd');g.addColorStop(.26,colors[color]);g.addColorStop(.7,colors[color]);g.addColorStop(1,dark[color]);circle(ctx,x,y,r,g,'#e7efde99',1.5);ctx.shadowBlur=0;text(ctx,symbols[color],x,y+1,r*.66,'#ffffffb0');ctx.restore();}
 function restart(){game=new Bubble();particles=[];end?.remove();end=null;pointer=null;held=0;ui.status('新的一局开始了。拖动瞄准，松手发射。');}
 function draw(){
  ctx.clearRect(0,0,600,720);const g=ctx.createLinearGradient(0,0,0,720);g.addColorStop(0,'#16394b');g.addColorStop(.7,'#1b4457');g.addColorStop(1,'#143348');round(ctx,8,5,584,708,24,g,'#789a9b',2);round(ctx,17,14,566,690,19,null,'#c5c8a433');
  for(let i=0;i<45;i++)circle(ctx,25+(i*107)%550,20+(i*73)%620,i%6===0?1.5:.8,'#accbb63b');
  text(ctx,'B U B B L E   P A R A D E',300,25,12,'#bdccb8');line(ctx,17,BUBBLE.LINE,583,BUBBLE.LINE,'#df9d9d66',1);text(ctx,'D A N G E R',300,BUBBLE.LINE+14,9,'#d49b9c');
  for(const[k,col]of game.grid){const[r,c]=game.coords(k),p=game.point(r,c);ball(p.x,p.y,22,col);}
  if(game.state==='ready'){let p={x:300,y:BUBBLE.LAUNCH},vx=Math.cos(game.angle)*650,vy=Math.sin(game.angle)*650;for(let i=0;i<95;i++){p.x+=vx*.012;p.y+=vy*.012;if(p.x<23){p.x=46-p.x;vx=Math.abs(vx);}if(p.x>577){p.x=1154-p.x;vx=-Math.abs(vx);}if(p.y<52)break;let collided=false;for(const[k]of game.grid){const q=game.point(...game.coords(k));if(Math.hypot(q.x-p.x,q.y-p.y)<45){collided=true;break;}}if(collided)break;if(i%3===0)circle(ctx,p.x,p.y,2.3,'#dbe0bb77');}}
  for(const p of particles)ball(p.x,p.y,p.r,p.color,p.life);
  if(game.projectile)ball(game.projectile.x,game.projectile.y,22,game.projectile.color);
  circle(ctx,300,BUBBLE.LAUNCH,35,'#1a4152','#7b9c9c',3);const tx=300+Math.cos(game.angle)*43,ty=BUBBLE.LAUNCH+Math.sin(game.angle)*43;line(ctx,300,BUBBLE.LAUNCH,tx,ty,'#b3b9a2',22);line(ctx,300,BUBBLE.LAUNCH,tx,ty,'#e5c683',13);if(!game.projectile)ball(300,BUBBLE.LAUNCH,23,game.current);
  ball(391,BUBBLE.LAUNCH+5,18,game.next);text(ctx,'NEXT',391,BUBBLE.LAUNCH-23,9,'#b4c7b8');
  text(ctx,'增加一排',111,660,10,'#94afab');for(let i=0;i<5;i++)circle(ctx,75+i*18,681,4,i<game.misses?'#ecc577':'#597a7b','#b5bc9d44');
  text(ctx,'✦ MATCH THREE · LET THEM FALL ✦',300,701,9,'#9ebdb4');
 }
 function frame(t){const dt=last?Math.min((t-last)/1000,.05):0;last=t;if(!paused&&!document.hidden){if(game.state==='ready')game.angle=clamp(game.angle+held*dt*1.4,-Math.PI+.14,-.14);acc+=dt;while(acc>=1/180){game.step(1/180);acc-=1/180;}for(const p of particles){p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=600*dt;p.life-=dt*.9;}particles=particles.filter(p=>p.life>0);if(game.lastRemoved.length){const removed=game.lastRemoved.splice(0);for(const p of removed)particles.push({x:p.x,y:p.y,vx:(Math.random()-.5)*150,vy:p.drop?80:-100,life:1,r:p.drop?18:10,color:p.color});tone(removed.length>5?780:600,.12);ui.status('消除了 '+removed.length+' 颗泡泡！');}}else acc=0;
  if((game.state==='won'||game.state==='lost')&&!end){const won=game.state==='won';end=overlay(stage,won?'清空啦！':'再试一次吧','得分 '+game.score+' · 点击“重来”开始新的一局。');ui.status(won?'所有泡泡都消除了，漂亮！':'泡泡碰到了危险线。换个角度再来一次。');tone(won?880:160,.3,'triangle');}
  const hi=record('bubble',game.score);ui.stat('分数 '+game.score+' · 纪录 '+hi);fire.disabled=game.state!=='ready';swap.disabled=game.state!=='ready';draw();raf=requestAnimationFrame(frame);
 }
 raf=requestAnimationFrame(frame);return{restart,pause(v){paused=v;held=0;},destroy(){cancelAnimationFrame(raf);clean.forEach(f=>f());end?.remove();view.destroy();}};
}
