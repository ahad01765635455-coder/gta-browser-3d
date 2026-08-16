const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const keys = {};
let player = { x: 0, z: 0, angle: 0 };
let car = { x: 90, z: 40, angle: 0 };
let driving = false;
let health = 100;
let money = 500;
let last = performance.now();

function resize(){ canvas.width=innerWidth; canvas.height=innerHeight; }
addEventListener('resize', resize); resize();
addEventListener('keydown', e=>{ keys[e.code]=true; if(e.code==='KeyE') toggleCar(); if(e.code==='KeyR') reset(); });
addEventListener('keyup', e=>keys[e.code]=false);

function reset(){ player={x:0,z:0,angle:0}; car={x:90,z:40,angle:0}; driving=false; health=100; money=500; }
function dist(a,b){ return Math.hypot(a.x-b.x,a.z-b.z); }
function toggleCar(){ if(driving){ player.x=car.x+55; player.z=car.z; driving=false; return; } if(dist(player,car)<75) driving=true; }
function move(dt){
  const speed=driving?(keys.ShiftLeft?240:150):(keys.ShiftLeft?105:65);
  let f=(keys.KeyW?1:0)-(keys.KeyS?1:0), s=(keys.KeyD?1:0)-(keys.KeyA?1:0);
  if(!f&&!s)return;
  const n=Math.hypot(f,s)||1; f/=n;s/=n;
  const a=player.angle;
  const dx=(s*Math.cos(a)+f*Math.sin(a))*speed*dt;
  const dz=(s*Math.sin(a)-f*Math.cos(a))*speed*dt;
  if(driving){car.x+=dx;car.z+=dz;car.angle=a;}else{player.x+=dx;player.z+=dz;}
}

function worldToScreen(x,z){
  const scale=Math.min(canvas.width,canvas.height)/700;
  return {x:canvas.width/2+(x-player.x)*scale,y:canvas.height/2+(z-player.z)*scale};
}
function rectWorld(x,z,w,h,color){const p=worldToScreen(x,z);ctx.fillStyle=color;ctx.fillRect(p.x-w/2,p.y-h/2,w,h);}
function draw(){
  ctx.clearRect(0,0,canvas.width,canvas.height);
  ctx.fillStyle='#6b8f55';ctx.fillRect(0,0,canvas.width,canvas.height);
  const scale=Math.min(canvas.width,canvas.height)/700;
  // roads
  const roadW=42*scale;
  ctx.fillStyle='#30343a';
  let p=worldToScreen(0,0);ctx.fillRect(0,p.y-roadW/2,canvas.width,roadW);ctx.fillRect(p.x-roadW/2,0,roadW,canvas.height);
  // city blocks
  for(let x=-300;x<=300;x+=80) for(let z=-300;z<=300;z+=80){
    if(Math.abs(x)<45||Math.abs(z)<45)continue;
    const h=25+((Math.abs(x*13+z*7)%35));
    const q=worldToScreen(x,z);
    ctx.fillStyle='#70777c';ctx.fillRect(q.x-26*scale,q.y-26*scale,52*scale,52*scale);
    ctx.fillStyle='#4d5459';ctx.fillRect(q.x-20*scale,q.y-20*scale,40*scale,40*scale);
  }
  // trees
  for(let x=-280;x<=280;x+=70)for(let z=-280;z<=280;z+=70){if(Math.abs(x)<55||Math.abs(z)<55)continue;const q=worldToScreen(x,z);ctx.fillStyle='#553d2a';ctx.fillRect(q.x-3,q.y,6,12);ctx.fillStyle='#285b34';ctx.beginPath();ctx.arc(q.x,q.y,15,0,Math.PI*2);ctx.fill();}
  // car
  const c=worldToScreen(car.x,car.z);ctx.save();ctx.translate(c.x,c.y);ctx.rotate(-car.angle);ctx.fillStyle='#c52e2e';ctx.fillRect(-22,-36,44,72);ctx.fillStyle='#20242a';ctx.fillRect(-16,-14,32,28);ctx.fillStyle='#111';ctx.fillRect(-27,-27,7,15);ctx.fillRect(20,-27,7,15);ctx.fillRect(-27,12,7,15);ctx.fillRect(20,12,7,15);ctx.restore();
  if(!driving){const q=worldToScreen(player.x,player.z);ctx.fillStyle='#2368e8';ctx.beginPath();ctx.arc(q.x,q.y,12,0,Math.PI*2);ctx.fill();ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(q.x,q.y-5,4,0,Math.PI*2);ctx.fill();}
  document.getElementById('health').textContent=health;document.getElementById('money').textContent=money;document.getElementById('status').textContent=driving?'DRIVING':'WALKING';
}
function loop(now){const dt=Math.min((now-last)/1000,.05);last=now;move(dt);draw();requestAnimationFrame(loop);} reset(); requestAnimationFrame(loop);
