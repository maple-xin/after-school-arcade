import{mountPinball}from'./pinball.mjs';
import{mountSpider}from'./spider.mjs';
import{mountBubble}from'./bubble.mjs';
import{enableSound,soundOn,tone}from'./common.mjs';
const $=s=>document.querySelector(s),params=new URLSearchParams(location.search),embedded=params.get('embed')==='1';
if(embedded)document.body.classList.add('embed');
const games={pinball:{title:'轨道弹珠台',tag:'ORBIT PINBALL',mount:mountPinball},spider:{title:'蜘蛛纸牌',tag:'SPIDER SOLITAIRE',mount:mountSpider},bubble:{title:'泡泡龙',tag:'BUBBLE PARADE',mount:mountBubble}};
let active=null,current=null;
const ui={area:$('#game-area'),status(value){if($('#status').textContent!==value)$('#status').textContent=value;},stat(value){if($('#stats').textContent!==value)$('#stats').textContent=value;},help(value){$('#help').textContent=value;}};
function openGame(id){if(!games[id])return;active?.destroy();ui.area.replaceChildren();$('#controls').replaceChildren();$('#help').hidden=true;$('#menu').hidden=true;$('#play').hidden=false;current=id;$('#window-title').textContent=games[id].title;$('#game-name').textContent=games[id].tag;$('#footer-note').textContent='点击右上角 ⌂ 返回游戏收藏';$('#restart').textContent=id==='spider'?'新局':'重来';active=games[id].mount(ui);const next=new URL(location.href);next.searchParams.set('game',id);history.replaceState(null,'',next);if(window.parent!==window)window.parent.postMessage({type:'arcade:ready',game:id},'*');}
function home(){active?.destroy();active=null;current=null;ui.area.replaceChildren();$('#controls').replaceChildren();$('#play').hidden=true;$('#menu').hidden=false;$('#window-title').textContent='我的游戏收藏';$('#footer-note').textContent='一台电脑，三个小世界。';const u=new URL(location.href);u.searchParams.delete('game');history.replaceState(null,'',u);}
document.querySelectorAll('[data-game]').forEach(b=>b.addEventListener('click',()=>{tone(380);openGame(b.dataset.game);}));
$('#home').addEventListener('click',home);
$('#restart').addEventListener('click',()=>{active?.restart();});
$('#help-toggle').addEventListener('click',()=>$('#help').hidden=!$('#help').hidden);
$('#sound').addEventListener('click',()=>{const on=enableSound(!soundOn());$('#sound').textContent=on?'♪ 开':'♪ 关';$('#sound').setAttribute('aria-label',on?'关闭声音':'打开声音');tone(540);});
$('#fullscreen').addEventListener('click',async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await $('.window').requestFullscreen();}catch{ui.status('当前环境不支持全屏，请在浏览器中打开游戏。');}});
function tick(){$('#clock').textContent=new Date().toLocaleTimeString('zh-CN',{hour:'2-digit',minute:'2-digit'});}tick();setInterval(tick,1000);
window.addEventListener('message',e=>{if(e.source!==window.parent||!e.data||typeof e.data!=='object')return;if(e.data.type==='arcade:pause')active?.pause(true);if(e.data.type==='arcade:resume')active?.pause(false);if(e.data.type==='arcade:mute'){enableSound(false);$('#sound').textContent='♪ 关';}});
window.addEventListener('error',e=>{ui.status('游戏运行出现问题，请重试或重新打开页面。');console.error(e.error);});
const requested=params.get('game')||document.body.dataset.defaultGame;
if(games[requested])openGame(requested);
