// Bootstrap do jogo: canvas 3D, game loop e orquestração geral

let canvas, player, lastTime;

function init() {
  canvas = document.getElementById('game-canvas');

  applyLoadedState(loadGame());

  player = new Player();
  if (gameState.equippedOutfit) {
    const outfit = shopItems.find(i => i.id === gameState.equippedOutfit);
    if (outfit) player.outfitColor = outfit.color;
  }
  if (gameState.equippedHat) {
    const hat = shopItems.find(i => i.id === gameState.equippedHat);
    if (hat) player.hat = hat.emoji;
  }

  initScene(canvas);
  updateHUD();

  if (!gameState.flags.seenWelcome) {
    gameState.flags.seenWelcome = true;
    persistGame();
    showDialogue([
      { text: '🦉 Olá! Eu sou o Professor Coruja e vou te ajudar a aprender sobre dinheiro nesta aventura!' },
      { text: 'Use as SETAS do teclado para andar pelo mundo, e as teclas W A S D para girar e aproximar/afastar a câmera. Visite o Trabalhinho 💼 para ganhar seu primeiro dinheiro.' },
      { text: 'Depois, decida: guardar no Banco 🏦, investir na Bolsa 📈, ou comprar coisas legais na Loja 🛍️!' },
    ]);
  }

  lastTime = performance.now();
  requestAnimationFrame(loop);
}

function loop(now) {
  const dt = Math.min((now - lastTime) / 1000, 0.05);
  lastTime = now;

  update(dt);
  draw(dt);

  requestAnimationFrame(loop);
}

function update(dt) {
  if (!isAnyModalOpen()) {
    player.update(dt, keysPressed);
    updateCameraOrbit(dt, keysPressed);
  }
  if (jobState.active) {
    updateJob(dt);
  }

  const loc = getLocationPlayerIsIn(player.getRect());
  setCurrentLocation(loc);
}

function draw(dt) {
  updatePlayerMesh(player);
  updateCamera(player, dt);
  syncCoinMeshes();
  renderScene();
}

document.addEventListener('DOMContentLoaded', init);
