// Funções de desenho do mundo (tiles, prédios, decorações) e do jogador

function drawWorld(ctx) {
  for (let row = 0; row < MAP_ROWS; row++) {
    for (let col = 0; col < MAP_COLS; col++) {
      const code = mapData[row][col];
      const x = col * TILE_SIZE;
      const y = row * TILE_SIZE;
      drawTile(ctx, code, x, y);
    }
  }

  for (const loc of locations) {
    drawBuilding(ctx, loc);
  }
}

function drawTile(ctx, code, x, y) {
  if (code === 2) {
    ctx.fillStyle = COLORS.wall;
    ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
    ctx.fillStyle = 'rgba(255,255,255,0.08)';
    ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE / 4);
    return;
  }

  // base grama
  ctx.fillStyle = (Math.floor(x / TILE_SIZE) + Math.floor(y / TILE_SIZE)) % 2 === 0 ? COLORS.grass : COLORS.grassDark;
  ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);

  if (code === 1) {
    ctx.fillStyle = COLORS.path;
    ctx.fillRect(x + 2, y + 2, TILE_SIZE - 4, TILE_SIZE - 4);
  } else if (code === 3) {
    drawTree(ctx, x + TILE_SIZE / 2, y + TILE_SIZE / 2 + 6);
  }
}

function drawTree(ctx, cx, cy) {
  ctx.fillStyle = '#8a5a2b';
  ctx.fillRect(cx - 4, cy - 6, 8, 14);
  ctx.fillStyle = '#4a9e4a';
  ctx.beginPath();
  ctx.arc(cx, cy - 14, 16, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#5cb85c';
  ctx.beginPath();
  ctx.arc(cx - 6, cy - 20, 11, 0, Math.PI * 2);
  ctx.fill();
}

function drawBuilding(ctx, loc) {
  const { x, y, width: w, height: h, color, roofColor, emoji, name } = loc;

  // sombra
  ctx.fillStyle = 'rgba(0,0,0,0.15)';
  roundRect(ctx, x + 6, y + h - 6, w, 16, 8);
  ctx.fill();

  // corpo do prédio
  ctx.fillStyle = color;
  roundRect(ctx, x, y + h * 0.35, w, h * 0.65, 10);
  ctx.fill();

  // telhado (triângulo)
  ctx.fillStyle = roofColor;
  ctx.beginPath();
  ctx.moveTo(x - 8, y + h * 0.4);
  ctx.lineTo(x + w / 2, y - 10);
  ctx.lineTo(x + w + 8, y + h * 0.4);
  ctx.closePath();
  ctx.fill();

  // porta
  const doorW = w * 0.22;
  const doorH = h * 0.4;
  ctx.fillStyle = 'rgba(0,0,0,0.35)';
  roundRect(ctx, x + w / 2 - doorW / 2, y + h - doorH, doorW, doorH, 6);
  ctx.fill();

  // janelas
  ctx.fillStyle = 'rgba(255,255,255,0.75)';
  roundRect(ctx, x + w * 0.15, y + h * 0.55, w * 0.15, w * 0.15, 4);
  ctx.fill();
  roundRect(ctx, x + w * 0.7, y + h * 0.55, w * 0.15, w * 0.15, 4);
  ctx.fill();

  // emoji + nome
  ctx.font = 'bold 26px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(emoji, x + w / 2, y - 14);

  ctx.font = 'bold 13px "Trebuchet MS", sans-serif';
  ctx.fillStyle = '#fff';
  ctx.lineWidth = 3;
  ctx.strokeStyle = 'rgba(0,0,0,0.5)';
  ctx.strokeText(name, x + w / 2, y + h + TILE_SIZE - 6);
  ctx.fillText(name, x + w / 2, y + h + TILE_SIZE - 6);
  ctx.textAlign = 'start';
}

function drawPlayer(ctx, player) {
  const cx = player.x + player.width / 2;
  const cy = player.y + player.height / 2;

  // sombra
  ctx.fillStyle = 'rgba(0,0,0,0.25)';
  ctx.beginPath();
  ctx.ellipse(cx, player.y + player.height + 2, player.width / 2, 5, 0, 0, Math.PI * 2);
  ctx.fill();

  // corpo
  ctx.fillStyle = player.outfitColor || '#4a90d9';
  roundRect(ctx, player.x, player.y + player.height * 0.35, player.width, player.height * 0.65, 8);
  ctx.fill();

  // cabeça
  ctx.fillStyle = '#f5c99b';
  ctx.beginPath();
  ctx.arc(cx, player.y + player.height * 0.28, player.width * 0.42, 0, Math.PI * 2);
  ctx.fill();

  // chapéu/acessório
  if (player.hat) {
    ctx.font = '18px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(player.hat, cx, player.y + player.height * 0.1);
    ctx.textAlign = 'start';
  }

  // olhos (direção)
  ctx.fillStyle = '#333';
  const eyeOffsets = {
    down: [[-5, 0], [5, 0]],
    up: [[-5, -2], [5, -2]],
    left: [[-6, 0]],
    right: [[6, 0]],
  };
  const eyes = eyeOffsets[player.direction] || eyeOffsets.down;
  for (const [ox, oy] of eyes) {
    ctx.beginPath();
    ctx.arc(cx + ox, player.y + player.height * 0.3 + oy, 2, 0, Math.PI * 2);
    ctx.fill();
  }
}
