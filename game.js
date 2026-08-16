import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.179.1/build/three.module.js';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87b9df);
scene.fog = new THREE.Fog(0x87b9df, 90, 260);

const camera = new THREE.PerspectiveCamera(70, innerWidth / innerHeight, 0.1, 500);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setSize(innerWidth, innerHeight);
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

scene.add(new THREE.HemisphereLight(0xcfe9ff, 0x4b4437, 2));
const sun = new THREE.DirectionalLight(0xffffff, 2.2);
sun.position.set(80, 120, 40);
sun.castShadow = true;
scene.add(sun);

const ground = new THREE.Mesh(new THREE.PlaneGeometry(320, 320), new THREE.MeshStandardMaterial({ color: 0x4e6742 }));
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);

function box(x, y, z, sx, sy, sz, color) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(sx, sy, sz), new THREE.MeshStandardMaterial({ color }));
  m.position.set(x, y, z);
  m.castShadow = m.receiveShadow = true;
  scene.add(m);
  return m;
}

// Roads
box(0, .02, 0, 320, .05, 18, 0x33363a);
box(0, .03, 0, 18, .06, 320, 0x33363a);
for (let i = -140; i <= 140; i += 10) {
  box(i, .05, 0, 4, .02, .35, 0xf1d85b);
  box(0, .05, i, .35, .02, 4, 0xf1d85b);
}

// Buildings
for (let x = -120; x <= 120; x += 24) {
  for (let z = -120; z <= 120; z += 24) {
    if (Math.abs(x) < 22 || Math.abs(z) < 22) continue;
    const h = 8 + Math.random() * 28;
    box(x, h / 2, z, 16, h, 16, 0x69737a + Math.floor(Math.random() * 6) * 0x080808);
  }
}

// Trees
for (let i = 0; i < 90; i++) {
  const x = Math.random() * 280 - 140;
  const z = Math.random() * 280 - 140;
  if (Math.abs(x) < 15 || Math.abs(z) < 15) continue;
  box(x, 2, z, 1, 4, 1, 0x68462d);
  const crown = new THREE.Mesh(new THREE.SphereGeometry(3.2, 12, 10), new THREE.MeshStandardMaterial({ color: 0x285b34 }));
  crown.position.set(x, 6, z);
  crown.castShadow = true;
  scene.add(crown);
}

// Player
const player = new THREE.Group();
const body = new THREE.Mesh(new THREE.BoxGeometry(1.2, 2, .7), new THREE.MeshStandardMaterial({ color: 0x2b6cff }));
body.position.y = 1;
body.castShadow = true;
player.add(body);
scene.add(player);

// Car
const car = new THREE.Group();
const carBody = new THREE.Mesh(new THREE.BoxGeometry(4.2, 1.1, 7), new THREE.MeshStandardMaterial({ color: 0xc52e2e }));
carBody.position.y = 1;
carBody.castShadow = true;
car.add(carBody);
const roof = new THREE.Mesh(new THREE.BoxGeometry(3.1, .9, 3.2), new THREE.MeshStandardMaterial({ color: 0x22252a }));
roof.position.y = 1.9;
roof.castShadow = true;
car.add(roof);
for (const x of [-1.7, 1.7]) for (const z of [-2.4, 2.4]) {
  const w = new THREE.Mesh(new THREE.CylinderGeometry(.65, .65, .35, 16), new THREE.MeshStandardMaterial({ color: 0x111111 }));
  w.rotation.z = Math.PI / 2;
  w.position.set(x, .65, z);
  car.add(w);
}
car.position.set(12, 0, 8);
scene.add(car);

const keys = {};
let yaw = 0;
let driving = false;
let health = 100;
let money = 500;
const clock = new THREE.Clock();
const status = document.getElementById('status');
const msg = document.getElementById('message');

addEventListener('keydown', e => {
  keys[e.code] = true;
  if (e.code === 'KeyE') toggleCar();
  if (e.code === 'KeyR') reset();
});
addEventListener('keyup', e => keys[e.code] = false);

renderer.domElement.addEventListener('click', () => renderer.domElement.requestPointerLock?.());
addEventListener('mousemove', e => {
  if (document.pointerLockElement === renderer.domElement) yaw -= e.movementX * 0.0025;
});
addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});

function toggleCar() {
  const d = player.position.distanceTo(car.position);
  if (!driving && d < 8) {
    driving = true;
    player.visible = false;
    status.textContent = 'DRIVING';
    say('Entered car');
  } else if (driving) {
    driving = false;
    player.visible = true;
    player.position.copy(car.position);
    player.position.x += 4;
    status.textContent = 'WALKING';
    say('Exited car');
  }
}

function say(text) {
  msg.textContent = text;
  msg.style.opacity = 1;
  setTimeout(() => msg.style.opacity = 0, 1200);
}

function reset() {
  player.position.set(0, 0, 0);
  car.position.set(12, 0, 8);
  driving = false;
  player.visible = true;
  status.textContent = 'WALKING';
  health = 100;
  yaw = 0;
  updateHud();
}

function updateHud() {
  document.getElementById('health').textContent = health;
  document.getElementById('money').textContent = money;
}

function move(dt) {
  const speed = driving ? (keys.ShiftLeft ? 25 : 15) : (keys.ShiftLeft ? 10 : 5);
  let forward = 0, side = 0;
  if (keys.KeyW) forward += 1;
  if (keys.KeyS) forward -= 1;
  if (keys.KeyA) side -= 1;
  if (keys.KeyD) side += 1;
  if (!forward && !side) return;

  const len = Math.hypot(forward, side) || 1;
  forward /= len;
  side /= len;
  const sin = Math.sin(yaw), cos = Math.cos(yaw);
  const dx = (side * cos + forward * sin) * speed * dt;
  const dz = (side * sin - forward * cos) * speed * dt;

  if (driving) {
    car.position.x += dx;
    car.position.z += dz;
    car.rotation.y = yaw;
  } else {
    player.position.x += dx;
    player.position.z += dz;
    player.rotation.y = yaw;
  }
}

function updateCamera() {
  const target = driving ? car.position : player.position;
  const distance = driving ? 12 : 8;
  const height = driving ? 6 : 4;
  camera.position.set(
    target.x - Math.sin(yaw) * distance,
    target.y + height,
    target.z + Math.cos(yaw) * distance
  );
  camera.lookAt(target.x, target.y + 1, target.z);
}

function loop() {
  requestAnimationFrame(loop);
  const dt = Math.min(clock.getDelta(), .05);
  move(dt);
  updateCamera();
  updateHud();
  renderer.render(scene, camera);
}

reset();
loop();