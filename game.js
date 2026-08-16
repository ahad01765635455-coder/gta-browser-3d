import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.179.1/build/three.module.js';
import { PointerLockControls } from 'https://cdn.jsdelivr.net/npm/three@0.179.1/examples/jsm/controls/PointerLockControls.js';

const scene=new THREE.Scene(); scene.background=new THREE.Color(0x87b9df); scene.fog=new THREE.Fog(0x87b9df,90,260);
const camera=new THREE.PerspectiveCamera(70,innerWidth/innerHeight,.1,500); camera.position.set(0,4,12);
const renderer=new THREE.WebGLRenderer({antialias:true}); renderer.setPixelRatio(Math.min(devicePixelRatio,2)); renderer.setSize(innerWidth,innerHeight); renderer.shadowMap.enabled=true; document.body.appendChild(renderer.domElement);
scene.add(new THREE.HemisphereLight(0xcfe9ff,0x4b4437,2)); const sun=new THREE.DirectionalLight(0xffffff,2.2); sun.position.set(80,120,40); sun.castShadow=true; scene.add(sun);
const ground=new THREE.Mesh(new THREE.PlaneGeometry(320,320),new THREE.MeshStandardMaterial({color:0x4e6742})); ground.rotation.x=-Math.PI/2; ground.receiveShadow=true; scene.add(ground);
function box(x,y,z,sx,sy,sz,c){const m=new THREE.Mesh(new THREE.BoxGeometry(sx,sy,sz),new THREE.MeshStandardMaterial({color:c}));m.position.set(x,y,z);m.castShadow=m.receiveShadow=true;scene.add(m);return m}
// roads
box(0,.02,0,320,.05,18,0x33363a); box(0,.03,0,18,.06,320,0x33363a);
for(let i=-140;i<=140;i+=10){box(i,.05,0,4,.02,.35,0xf1d85b);box(0,.05,i,.35,.02,4,0xf1d85b)}
// city blocks
for(let x=-120;x<=120;x+=24)for(let z=-120;z<=120;z+=24){if(Math.abs(x)<22||Math.abs(z)<22)continue;const h=8+Math.random()*28;box(x,h/2,z,16,h,16,0x69737a+Math.floor(Math.random()*6)*0x080808)}
// trees
for(let i=0;i<90;i++){const x=(Math.random()*280-140),z=(Math.random()*280-140);if(Math.abs(x)<15||Math.abs(z)<15)continue;const trunk=box(x,2,z,1,4,1,0x68462d);const crown=new THREE.Mesh(new THREE.SphereGeometry(3.2,12,10),new THREE.MeshStandardMaterial({color:0x285b34}));crown.position.set(x,6,z);crown.castShadow=true;scene.add(crown)}
// player
const player=new THREE.Group(); const body=box(0,1,0,1.2,2,0.7,0x2b6cff); body.position.set(0,1,0); player.add(body); scene.add(player);
const car=new THREE.Group(); const carBody=box(0,1,0,4.2,1.1,7,0xc52e2e); carBody.position.y=1; car.add(carBody); const roof=box(0,1.9,-.2,3.1,.9,3.2,0x22252a); car.add(roof); for(const x of[-1.7,1.7])for(const z of[-2.4,2.4]){const w=new THREE.Mesh(new THREE.CylinderGeometry(.65,.65,.35,16),new THREE.MeshStandardMaterial({color:0x111111}));w.rotation.z=Math.PI/2;w.position.set(x,.65,z);car.add(w)} car.position.set(12,0,8); car.visible=true; scene.add(car);
const controls=new PointerLockControls(camera,renderer.domElement); renderer.domElement.addEventListener('click',()=>controls.lock());
const keys={}; addEventListener('keydown',e=>{keys[e.code]=true;if(e.code==='KeyE')toggleCar();if(e.code==='KeyR')reset()});addEventListener('keyup',e=>keys[e.code]=false);addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight)});
let driving=false,health=100,money=500; const clock=new THREE.Clock(); const status=document.getElementById('status'); const msg=document.getElementById('message');
function toggleCar(){const d=player.position.distanceTo(car.position);if(!driving&&d<8){driving=true;player.visible=false;status.textContent='DRIVING';say('Entered car');}else if(driving){driving=false;player.visible=true;player.position.copy(car.position);player.position.x+=4;status.textContent='WALKING';say('Exited car')}}
function say(t){msg.textContent=t;msg.style.opacity=1;setTimeout(()=>msg.style.opacity=0,1200)}
function reset(){player.position.set(0,0,0);car.position.set(12,0,8);driving=false;player.visible=true;status.textContent='WALKING';health=100;updateHud()}
function updateHud(){document.getElementById('health').textContent=health;document.getElementById('money').textContent=money}
function move(dt){const speed=driving?(keys.ShiftLeft?25:15):(keys.ShiftLeft?10:5);let dx=0,dz=0;if(keys.KeyW)dz-=1;if(keys.KeyS)dz+=1;if(keys.KeyA)dx-=1;if(keys.KeyD)dx+=1;if(!dx&&!dz)return;const len=Math.hypot(dx,dz);dx/=len;dz/=len;if(driving){car.position.x+=dx*speed*dt;car.position.z+=dz*speed*dt;car.rotation.y=Math.atan2(dx,dz);camera.position.lerp(new THREE.Vector3(car.position.x,car.position.y+5,car.position.z+10),.12);camera.lookAt(car.position.x,1,car.position.z)}else{player.position.x+=dx*speed*dt;player.position.z+=dz*speed*dt;player.rotation.y=Math.atan2(dx,dz);}}
function loop(){requestAnimationFrame(loop);const dt=Math.min(clock.getDelta(),.05);move(dt);if(!driving){camera.position.x=player.position.x;camera.position.z=player.position.z+8;camera.position.y=player.position.y+4;camera.lookAt(player.position.x,1,player.position.z)}updateHud();renderer.render(scene,camera)}loop();