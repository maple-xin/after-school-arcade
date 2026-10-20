import{Pinball,PIN,clamp}from'./engines.mjs';
import{fitCanvas,listen,round,line,circle,text,metal,control,overlay,record,tone}from'./common.mjs';
export function mountPinball(ui){
 const stage=ui.area;const view=fitCanvas(stage,PIN.W,PIN.H),{ctx,canvas}=view;let game=new Pinball(),paused=false,raf=0,last=0,acc=0,end=null,frameCount=0;const cleanup=[];
 const left=control('◀ 左挡板',null),launch=control('发球 ↑',()=>{if(game.launch()){tone(200,.15,'triangle');ui.status('发射！撞击发光圆盘得分，用挡板把球送回上方。');}},true),right=control('右挡板 ▶',null),pause=control('暂停',()=>{paused=!paused;pause.textContent=paused?'继续':'暂停';game.left=game.right=false;});
 function held(button,side){cleanup.push(listen(button,'pointerdown',e=>{e.preventDefault();button.setPointerCapture(e.pointerId);game[side]=true;button.classList.add('held');tone(130,.04,'triangle');}));for(const name of['pointerup','pointercancel','lostpointercapture'])cleanup.push(listen(button,name,()=>{game[side]=false;button.classList.remove('held');}));}
 held(left,'left');held(right,'right');
 function release(){game.left=game.right=false;left.classList.remove('held');right.classList.remove('held');}
 cleanup.push(listen(window,'blur',release),listen(document,'visibilitychange',release));
 cleanup.push(listen(window,'keydown',e=>{if(['ArrowLeft','ArrowRight','ArrowUp',' ','a','A','d','D','p','P'].includes(e.key))e.preventDefault();if(e.key==='ArrowLeft'||e.key.toLowerCase()==='a')game.left=true;if(e.key==='ArrowRight'||e.key.toLowerCase()==='d')game.right=true;if(!e.repeat&&(e.key===' '||e.key==='ArrowUp'))launch.click();if(!e.repeat&&e.key.toLowerCase()==='p')pause.click();}));
 cleanup.push(listen(window,'keyup',e=>{if(e.key==='ArrowLeft'||e.key.toLowerCase()==='a')game.left=false;if(e.key==='ArrowRight'||e.key.toLowerCase()==='d')game.right=false;}));
 ui.help('点击“发球”或按空格。按住左右挡板按钮，或使用 ← → / A D。球从底部漏掉会消耗一颗，共三颗。P 暂停。');
 ui.status('三颗球，一次小小的太空旅行。按“发球”开始。');
 function restart(){end?.remove();end=null;game=new Pinball();paused=false;pause.textContent='暂停';release();ui.status('新的旅程已准备好。按“发球”开始。');}
 function draw(){
  ctx.clearRect(0,0,480,700);
  const bg=ctx.createLinearGradient(0,0,480,700);bg.addColorStop(0,'#0b1c35');bg.addColorStop(.5,'#182d51');bg.addColorStop(1,'#0b203b');round(ctx,7,5,466,690,30,bg,'#6e92a6',3);round(ctx,18,18,444,668,24,null,'#d0bd8055',1);
  ctx.save();round(ctx,24,28,432,640,26,null);ctx.clip();for(let i=0;i<70;i++){const x=36+(i*97)%368,y=75+(i*53)%480;circle(ctx,x,y,i%5===0?1.7:.8,i%4===0?'#d7c47d88':'#8fb8d255');}
  for(const r of[65,95,128]){ctx.beginPath();ctx.ellipse(236,335,r,r*.55,-.3,0,Math.PI*2);ctx.lineWidth=1;ctx.strokeStyle='#8aa7c326';ctx.stroke();}
  text(ctx,'O R B I T  /  2 0 0 1',235,74,13,'#d8c78d');
  for(let i=0;i<3;i++){round(ctx,115+i*83,103,36,57,17,'#213d5a','#6c91a1',2);line(ctx,133+i*83,115,133+i*83,145,'#e9c77f',3);text(ctx,String(i+1),133+i*83,131,11,'#fff3bf');}
  for(let i=0;i<game.rails.length;i++){const s=game.rails[i];line(ctx,...s,'#041827',12);line(ctx,...s,'#9eb4bc',7);line(ctx,s[0]-1,s[1]-1,s[2]-1,s[3]-1,'#e6e4ca',2);}
  for(const [x,sign]of[[92,1],[346,-1]]){ctx.beginPath();ctx.moveTo(x,446);ctx.lineTo(x+sign*20,500);ctx.lineTo(x+sign*20,521);ctx.closePath();ctx.fillStyle='#e99756';ctx.fill();ctx.strokeStyle='#efd393';ctx.lineWidth=3;ctx.stroke();}
  text(ctx,'100',236,389,17,'#d4be82');text(ctx,'AFTER SCHOOL',236,412,10,'#7c9ca9');text(ctx,'✦',236,453,27,'#b9bd96');
  for(const p of game.bumpers){ctx.save();ctx.shadowColor='#ffd07b';ctx.shadowBlur=p.flash>0?32:12;circle(ctx,p.x,p.y,p.r+5,'#a3afab','#eadcaa',2);const g=ctx.createRadialGradient(p.x-8,p.y-8,1,p.x,p.y,p.r);g.addColorStop(0,p.flash>0?'#fffbd0':'#ffe5a3');g.addColorStop(.45,'#e8b65b');g.addColorStop(1,'#c8783b');circle(ctx,p.x,p.y,p.r,g,'#fff2c3',2);circle(ctx,p.x,p.y,p.r*.36,'#355773','#d3e4db',2);ctx.restore();text(ctx,'✧',p.x,p.y,14,'#f3e1a7');}
  for(const p of game.posts)metal(ctx,p.x,p.y,p.r);
  for(const f of game.flippers){const x=f.x+Math.cos(f.angle)*f.len,y=f.y+Math.sin(f.angle)*f.len;line(ctx,f.x,f.y+4,x,y+4,'#061928',26);line(ctx,f.x,f.y,x,y,'#c0c3b1',23);line(ctx,f.x,f.y,x,y,'#edaf56',16);line(ctx,f.x,f.y-3,x,y-3,'#ffe8a7',3);metal(ctx,f.x,f.y,7);}
  ctx.save();ctx.translate(437,586);text(ctx,'LAUNCH',0,-26,9,'#94a8ab');for(let i=0;i<7;i++)line(ctx,-11,2+i*6,11,5+i*6,'#9eb0b6',2);round(ctx,-13,46,26,13,4,'#c8b38a','#ead4a7');ctx.restore();
  const b=game.ball;for(let i=0;i<game.trail.length;i++){const p=game.trail[i];circle(ctx,p.x,p.y,PIN.R*i/game.trail.length,'rgba(162,213,229,'+(i/game.trail.length*.18)+')');}if(game.state!=='over')metal(ctx,b.x,b.y,PIN.R);
  if(game.state==='ready'){round(ctx,132,476,215,38,8,'#0b263ae8','#e8c77a66');text(ctx,'按「发球」开始',240,495,14,'#e5ca88');}
  if(paused){round(ctx,144,350,192,60,10,'#0a2031ee','#acc8b477');text(ctx,'已 暂 停',240,380,23,'#ecd49a');}
  ctx.restore();text(ctx,'✦  KEEP THE BALL ALIVE  ✦',239,679,9,'#9cb2b4');
 }
 function frame(t){const dt=last?Math.min((t-last)/1000,.05):0;last=t;if(!paused&&!document.hidden){acc+=dt;while(acc>=1/180){game.step(1/180);acc-=1/180;}if(++frameCount%2===0&&game.state==='playing'){game.trail.push({x:game.ball.x,y:game.ball.y});if(game.trail.length>10)game.trail.shift();}}else acc=0;
  for(const e of game.events.splice(0)){if(e==='bumper')tone(580,.07,'sine');if(e==='drain'){tone(150,.2,'triangle');ui.status('还有 '+game.lives+' 颗球。按“发球”继续。');}if(e==='over'&&!end){tone(110,.35,'triangle');end=overlay(stage,'这局很精彩','得分 '+game.score+' · 点击右上角“重来”再玩一局。');ui.status('三颗球已用完，成绩已记录。');}}
  const hi=record('pinball',game.score);ui.stat('分数 '+game.score+'  ·  球 '+game.lives+'  ·  纪录 '+hi);launch.disabled=game.state!=='ready'||paused;launch.textContent=game.state==='ready'?'发球 ↑':'进行中';draw();raf=requestAnimationFrame(frame);
 }
 raf=requestAnimationFrame(frame);
 return{restart,pause(value){paused=value;pause.textContent=paused?'继续':'暂停';release();},destroy(){cancelAnimationFrame(raf);cleanup.forEach(fn=>fn());end?.remove();view.destroy();}};
}
