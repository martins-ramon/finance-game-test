// Cena 3D (Three.js): mundo, prédios, árvores, personagem e câmera em 3ª pessoa.
// Toda a lógica de jogo (movimento, colisão, zonas de interação) continua em coordenadas
// 2D de "mapa" (x, y em pixels); aqui só convertemos essas coordenadas para o espaço 3D.

let scene, camera, renderer;
let playerGroup, playerBody, playerHead, playerHatSprite;
const coinMeshes = new Map(); // índice do coin -> Sprite
const buildingColliders = []; // paredes dos prédios, usadas para evitar a câmera atravessar prédios
const cameraRaycaster = new THREE.Raycaster();

const BUILDING_WALL_HEIGHT = 90;
const BUILDING_ROOF_HEIGHT = 55;
const BORDER_WALL_HEIGHT = 55;
const PLAYER_BODY_HEIGHT = 34;
const PLAYER_HEAD_RADIUS = 13;

// Converte coordenadas 2D do mapa (pixels) para o plano X/Z da cena 3D (Y é a altura)
function worldToScene(x, y) {
  return { x: x - CANVAS_WIDTH / 2, z: y - CANVAS_HEIGHT / 2 };
}

function makeEmojiSprite(emoji, worldSize) {
  const canvasSize = 128;
  const c = document.createElement('canvas');
  c.width = c.height = canvasSize;
  const cctx = c.getContext('2d');
  cctx.font = (canvasSize * 0.8) + 'px sans-serif';
  cctx.textAlign = 'center';
  cctx.textBaseline = 'middle';
  cctx.fillText(emoji, canvasSize / 2, canvasSize / 2 + canvasSize * 0.05);
  const texture = new THREE.CanvasTexture(c);
  const material = new THREE.SpriteMaterial({ map: texture, transparent: true, depthWrite: false });
  const sprite = new THREE.Sprite(material);
  sprite.scale.set(worldSize, worldSize, 1);
  return sprite;
}

function makeLabelSprite(text) {
  const c = document.createElement('canvas');
  c.width = 256;
  c.height = 64;
  const cctx = c.getContext('2d');
  cctx.font = 'bold 34px "Trebuchet MS", sans-serif';
  cctx.textAlign = 'center';
  cctx.textBaseline = 'middle';
  cctx.lineWidth = 6;
  cctx.strokeStyle = 'rgba(0,0,0,0.6)';
  cctx.strokeText(text, c.width / 2, c.height / 2);
  cctx.fillStyle = '#fff';
  cctx.fillText(text, c.width / 2, c.height / 2);
  const texture = new THREE.CanvasTexture(c);
  const material = new THREE.SpriteMaterial({ map: texture, transparent: true, depthWrite: false });
  const sprite = new THREE.Sprite(material);
  sprite.scale.set(90, 22, 1);
  return sprite;
}

function addTreeMesh(col, row) {
  const { x, z } = worldToScene(col * TILE_SIZE + TILE_SIZE / 2, row * TILE_SIZE + TILE_SIZE / 2);

  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(4, 5, 18, 8),
    new THREE.MeshLambertMaterial({ color: '#8a5a2b' })
  );
  trunk.position.set(x, 9, z);
  trunk.castShadow = true;
  scene.add(trunk);

  const foliage = new THREE.Mesh(
    new THREE.SphereGeometry(17, 10, 8),
    new THREE.MeshLambertMaterial({ color: '#4a9e4a' })
  );
  foliage.position.set(x, 30, z);
  foliage.castShadow = true;
  scene.add(foliage);

  const foliageTop = new THREE.Mesh(
    new THREE.SphereGeometry(11, 10, 8),
    new THREE.MeshLambertMaterial({ color: '#5cb85c' })
  );
  foliageTop.position.set(x - 5, 40, z - 2);
  foliageTop.castShadow = true;
  scene.add(foliageTop);
}

function addPathTile(col, row) {
  const { x, z } = worldToScene(col * TILE_SIZE + TILE_SIZE / 2, row * TILE_SIZE + TILE_SIZE / 2);
  const tile = new THREE.Mesh(
    new THREE.BoxGeometry(TILE_SIZE - 2, 2, TILE_SIZE - 2),
    new THREE.MeshLambertMaterial({ color: COLORS.path })
  );
  tile.position.set(x, 1, z);
  tile.receiveShadow = true;
  scene.add(tile);
}

function addBorderWallTile(col, row) {
  const { x, z } = worldToScene(col * TILE_SIZE + TILE_SIZE / 2, row * TILE_SIZE + TILE_SIZE / 2);
  const wall = new THREE.Mesh(
    new THREE.BoxGeometry(TILE_SIZE, BORDER_WALL_HEIGHT, TILE_SIZE),
    new THREE.MeshLambertMaterial({ color: COLORS.wall })
  );
  wall.position.set(x, BORDER_WALL_HEIGHT / 2, z);
  wall.castShadow = true;
  wall.receiveShadow = true;
  scene.add(wall);
}

function makeGrassTexture() {
  const c = document.createElement('canvas');
  c.width = c.height = MAP_COLS * 2;
  const cctx = c.getContext('2d');
  for (let row = 0; row < c.height; row++) {
    for (let col = 0; col < c.width; col++) {
      cctx.fillStyle = (row + col) % 2 === 0 ? COLORS.grass : COLORS.grassDark;
      cctx.fillRect(col, row, 1, 1);
    }
  }
  const texture = new THREE.CanvasTexture(c);
  texture.magFilter = THREE.NearestFilter;
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(1, 1);
  return texture;
}

function buildGround() {
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(CANVAS_WIDTH, CANVAS_HEIGHT),
    new THREE.MeshLambertMaterial({ map: makeGrassTexture() })
  );
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);
}

function buildMapMeshes() {
  for (let row = 0; row < MAP_ROWS; row++) {
    for (let col = 0; col < MAP_COLS; col++) {
      const code = mapData[row][col];
      if (code === 1) addPathTile(col, row);
      else if (code === 2) addBorderWallTile(col, row);
      else if (code === 3) addTreeMesh(col, row);
    }
  }
}

function buildLocationMesh(loc) {
  const { x, z } = worldToScene(loc.x + loc.width / 2, loc.y + loc.height / 2);
  const group = new THREE.Group();
  group.position.set(x, 0, z);

  const walls = new THREE.Mesh(
    new THREE.BoxGeometry(loc.width, BUILDING_WALL_HEIGHT, loc.height),
    new THREE.MeshLambertMaterial({ color: loc.color })
  );
  walls.position.y = BUILDING_WALL_HEIGHT / 2;
  walls.castShadow = true;
  walls.receiveShadow = true;
  group.add(walls);
  buildingColliders.push(walls);

  const roofRadius = Math.max(loc.width, loc.height) * 0.62;
  const roof = new THREE.Mesh(
    new THREE.ConeGeometry(roofRadius, BUILDING_ROOF_HEIGHT, 4),
    new THREE.MeshLambertMaterial({ color: loc.roofColor })
  );
  roof.rotation.y = Math.PI / 4;
  roof.position.y = BUILDING_WALL_HEIGHT + BUILDING_ROOF_HEIGHT / 2;
  roof.castShadow = true;
  group.add(roof);

  // porta
  const door = new THREE.Mesh(
    new THREE.BoxGeometry(loc.width * 0.22, BUILDING_WALL_HEIGHT * 0.5, 2),
    new THREE.MeshLambertMaterial({ color: '#2a2a2a' })
  );
  door.position.set(0, BUILDING_WALL_HEIGHT * 0.25, loc.height / 2 + 1);
  group.add(door);

  const emojiSprite = makeEmojiSprite(loc.emoji, 40);
  emojiSprite.position.set(0, BUILDING_WALL_HEIGHT + BUILDING_ROOF_HEIGHT + 26, 0);
  group.add(emojiSprite);

  const labelSprite = makeLabelSprite(loc.name);
  labelSprite.position.set(0, BUILDING_WALL_HEIGHT + BUILDING_ROOF_HEIGHT + 4, 0);
  group.add(labelSprite);

  scene.add(group);
}

function buildPlayerMesh() {
  playerGroup = new THREE.Group();

  playerBody = new THREE.Mesh(
    new THREE.CylinderGeometry(9, 12, PLAYER_BODY_HEIGHT, 12),
    new THREE.MeshLambertMaterial({ color: '#4a90d9' })
  );
  playerBody.position.y = PLAYER_BODY_HEIGHT / 2 + 2;
  playerBody.castShadow = true;
  playerGroup.add(playerBody);

  playerHead = new THREE.Mesh(
    new THREE.SphereGeometry(PLAYER_HEAD_RADIUS, 14, 12),
    new THREE.MeshLambertMaterial({ color: '#f5c99b' })
  );
  playerHead.position.y = PLAYER_BODY_HEIGHT + PLAYER_HEAD_RADIUS + 2;
  playerHead.castShadow = true;
  playerGroup.add(playerHead);

  const eyeGeo = new THREE.SphereGeometry(1.6, 6, 6);
  const eyeMat = new THREE.MeshLambertMaterial({ color: '#333' });
  const eyeL = new THREE.Mesh(eyeGeo, eyeMat);
  eyeL.position.set(-4.5, playerHead.position.y, PLAYER_HEAD_RADIUS - 3);
  const eyeR = new THREE.Mesh(eyeGeo, eyeMat);
  eyeR.position.set(4.5, playerHead.position.y, PLAYER_HEAD_RADIUS - 3);
  playerGroup.add(eyeL);
  playerGroup.add(eyeR);

  scene.add(playerGroup);
}

const DIRECTION_VECTORS = {
  down: { x: 0, z: 1 },
  up: { x: 0, z: -1 },
  left: { x: -1, z: 0 },
  right: { x: 1, z: 0 },
};

function directionYaw(direction) {
  const v = DIRECTION_VECTORS[direction] || DIRECTION_VECTORS.down;
  return Math.atan2(v.x, v.z);
}

function initScene(canvas) {
  scene = new THREE.Scene();
  scene.background = new THREE.Color('#bee7f5');
  scene.fog = new THREE.Fog('#bee7f5', 500, 1100);

  camera = new THREE.PerspectiveCamera(60, CANVAS_WIDTH / CANVAS_HEIGHT, 1, 2000);

  renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setSize(CANVAS_WIDTH, CANVAS_HEIGHT, false);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.shadowMap.enabled = true;

  const ambient = new THREE.AmbientLight('#ffffff', 0.65);
  scene.add(ambient);

  const sun = new THREE.DirectionalLight('#fff6dd', 0.85);
  sun.position.set(260, 380, -180);
  sun.castShadow = true;
  sun.shadow.mapSize.set(1024, 1024);
  sun.shadow.camera.left = -420;
  sun.shadow.camera.right = 420;
  sun.shadow.camera.top = 420;
  sun.shadow.camera.bottom = -420;
  sun.shadow.camera.far = 900;
  scene.add(sun);

  buildGround();
  buildMapMeshes();
  for (const loc of locations) buildLocationMesh(loc);
  buildPlayerMesh();
}

const CAMERA_DISTANCE = 175;
const CAMERA_HEIGHT = 175;
const CAMERA_LOOK_HEIGHT = 45;
const CAMERA_LOOK_AHEAD = 60;
const CAMERA_SMOOTH = 6; // maior = câmera segue mais rápido

const idealCameraPos = new THREE.Vector3();
const idealLookAt = new THREE.Vector3();
const currentLookAt = new THREE.Vector3(0, 0, 0);

function updatePlayerMesh(player) {
  const { x, z } = worldToScene(player.x + player.width / 2, player.y + player.height / 2);
  playerGroup.position.set(x, 0, z);
  playerGroup.rotation.y = directionYaw(player.direction);

  const hatEmoji = player.hat;
  if (hatEmoji && (!playerHatSprite || playerHatSprite.userData.emoji !== hatEmoji)) {
    if (playerHatSprite) playerGroup.remove(playerHatSprite);
    playerHatSprite = makeEmojiSprite(hatEmoji, 24);
    playerHatSprite.userData.emoji = hatEmoji;
    playerHatSprite.position.set(0, PLAYER_BODY_HEIGHT + PLAYER_HEAD_RADIUS * 2 + 8, 0);
    playerGroup.add(playerHatSprite);
  } else if (!hatEmoji && playerHatSprite) {
    playerGroup.remove(playerHatSprite);
    playerHatSprite = null;
  }

  if (player.outfitColor) {
    playerBody.material.color.set(player.outfitColor);
  }
}

function idealCameraDistance(px, pz, forward) {
  // evita que a câmera atravesse/fique colada num prédio atrás do jogador
  const behind = new THREE.Vector3(-forward.x, 0, -forward.z);
  cameraRaycaster.set(new THREE.Vector3(px, 40, pz), behind);
  cameraRaycaster.far = CAMERA_DISTANCE;
  const hits = cameraRaycaster.intersectObjects(buildingColliders, false);
  if (hits.length > 0) {
    return Math.max(50, hits[0].distance - 20);
  }
  return CAMERA_DISTANCE;
}

function updateCamera(player, dt) {
  const forward = DIRECTION_VECTORS[player.direction] || DIRECTION_VECTORS.down;
  const px = playerGroup.position.x;
  const pz = playerGroup.position.z;
  const distance = idealCameraDistance(px, pz, forward);

  idealCameraPos.set(
    px - forward.x * distance,
    CAMERA_HEIGHT,
    pz - forward.z * distance
  );
  idealLookAt.set(
    px + forward.x * CAMERA_LOOK_AHEAD,
    CAMERA_LOOK_HEIGHT,
    pz + forward.z * CAMERA_LOOK_AHEAD
  );

  const t = 1 - Math.exp(-CAMERA_SMOOTH * dt);
  camera.position.lerp(idealCameraPos, t);
  currentLookAt.lerp(idealLookAt, t);
  camera.lookAt(currentLookAt);
}

function syncCoinMeshes() {
  if (!jobState.active) {
    for (const sprite of coinMeshes.values()) scene.remove(sprite);
    coinMeshes.clear();
    return;
  }

  jobState.coins.forEach((coin, i) => {
    if (coin.collected) {
      const sprite = coinMeshes.get(i);
      if (sprite) {
        scene.remove(sprite);
        coinMeshes.delete(i);
      }
      return;
    }
    if (!coinMeshes.has(i)) {
      const sprite = makeEmojiSprite('🪙', 24);
      const { x, z } = worldToScene(coin.x, coin.y);
      sprite.position.set(x, 20, z);
      scene.add(sprite);
      coinMeshes.set(i, sprite);
    }
  });
}

function renderScene() {
  renderer.render(scene, camera);
}
