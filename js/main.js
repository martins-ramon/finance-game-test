// Bootstrap do jogo: canvas, game loop e orquestração geral

let canvas, ctx, player, lastTime;

function init() {
  canvas = document.getElementById('game-canvas');
  ctx = canvas.getContext('2d');

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

  updateHUD();

  if (!gameState.flags.seenWelcome) {
    gameState.flags.seenWelcome = true;
    persistGame();
    showDialogue([
      { text: '🦉 Olá! Eu sou o Professor Coruja e vou te ajudar a aprender sobre dinheiro nesta aventura!' },
      { text: 'Use as setas ou WASD para andar pelo mundo. Visite o Trabalhinho 💼 para ganhar seu primeiro dinheiro.' },
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
  draw();

  requestAnimationFrame(loop);
}

function update(dt) {
  if (!isAnyModalOpen()) {
    player.update(dt, keysPressed);
  }
  if (jobState.active) {
    updateJob(dt);
  }

  const loc = getLocationPlayerIsIn(player.getRect());
  setCurrentLocation(loc);
}

function draw() {
  ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  drawWorld(ctx);
  drawPlayer(ctx, player);
  drawJobMinigame(ctx);
}

document.addEventListener('DOMContentLoaded', init);
