// Classe do jogador: posição, movimento e colisão
class Player {
  constructor() {
    this.width = PLAYER_SIZE;
    this.height = PLAYER_SIZE;
    this.x = CANVAS_WIDTH / 2 - this.width / 2;
    this.y = 400; // ponto de partida livre, entre o quiosque de trabalho e as lojas
    this.direction = 'down';
    this.outfitColor = '#4a90d9';
    this.hat = null;
  }

  update(dt, keys) {
    let dx = 0;
    let dy = 0;
    if (keys.has('up')) { dy -= 1; this.direction = 'up'; }
    if (keys.has('down')) { dy += 1; this.direction = 'down'; }
    if (keys.has('left')) { dx -= 1; this.direction = 'left'; }
    if (keys.has('right')) { dx += 1; this.direction = 'right'; }

    if (dx !== 0 && dy !== 0) {
      const norm = Math.SQRT1_2;
      dx *= norm;
      dy *= norm;
    }

    const moveX = dx * PLAYER_SPEED * dt;
    const moveY = dy * PLAYER_SPEED * dt;

    // colisão eixo a eixo: testa X, aplica se livre; testa Y, aplica se livre
    if (moveX !== 0) {
      const newX = this.x + moveX;
      if (!this.collidesAt(newX, this.y)) {
        this.x = newX;
      }
    }
    if (moveY !== 0) {
      const newY = this.y + moveY;
      if (!this.collidesAt(this.x, newY)) {
        this.y = newY;
      }
    }

    this.x = clamp(this.x, 0, CANVAS_WIDTH - this.width);
    this.y = clamp(this.y, 0, CANVAS_HEIGHT - this.height);
  }

  collidesAt(x, y) {
    const corners = [
      [x, y],
      [x + this.width, y],
      [x, y + this.height],
      [x + this.width, y + this.height],
    ];
    return corners.some(([cx, cy]) => isSolidAtPixel(cx, cy));
  }

  getRect() {
    return { x: this.x, y: this.y, w: this.width, h: this.height };
  }
}
