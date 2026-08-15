// Mapa do mundo: grade de tiles (chão) + locais (prédios) definidos em coordenadas de pixel.
// Tile codes: 0 grama | 1 caminho | 2 parede/limite | 3 árvore (decoração sólida)

function buildMapData() {
  const data = [];
  for (let row = 0; row < MAP_ROWS; row++) {
    const line = [];
    for (let col = 0; col < MAP_COLS; col++) {
      let code = 0; // grama
      const isBorder = row === 0 || row === MAP_ROWS - 1 || col === 0 || col === MAP_COLS - 1;
      if (isBorder) {
        code = 2; // parede/limite do mundo
      } else if (col === 9 || col === 10) {
        code = 1; // corredor vertical central
      } else if (row === 7) {
        code = 1; // corredor horizontal central
      }
      line.push(code);
    }
    data.push(line);
  }
  return data;
}

const mapData = buildMapData();

// Árvores de decoração (tile sólido) em posições fixas, longe dos caminhos e prédios
const treeTiles = [
  { col: 2, row: 5 }, { col: 17, row: 5 }, { col: 2, row: 6 }, { col: 17, row: 6 },
  { col: 5, row: 5 }, { col: 14, row: 5 }, { col: 5, row: 6 }, { col: 14, row: 6 },
];
for (const t of treeTiles) {
  if (mapData[t.row] && mapData[t.row][t.col] === 0) {
    mapData[t.row][t.col] = 3;
  }
}

function isSolidTile(code) {
  return code === 2 || code === 3;
}

// Locais (prédios) do mundo, em coordenadas de pixel.
const locations = [
  {
    id: 'bank', name: 'Banco', emoji: '🏦',
    x: 100, y: 60, width: 160, height: 110,
    color: COLORS.bank, roofColor: COLORS.bankRoof,
  },
  {
    id: 'stock', name: 'Bolsa de Valores', emoji: '📈',
    x: 540, y: 60, width: 160, height: 110,
    color: COLORS.stock, roofColor: COLORS.stockRoof,
  },
  {
    id: 'shop', name: 'Loja', emoji: '🛍️',
    x: 100, y: 390, width: 160, height: 110,
    color: COLORS.shop, roofColor: COLORS.shopRoof,
  },
  {
    id: 'house', name: 'Casa', emoji: '🏠',
    x: 540, y: 390, width: 160, height: 110,
    color: COLORS.house, roofColor: COLORS.houseRoof,
  },
  {
    id: 'job', name: 'Trabalhinho', emoji: '💼',
    x: 360, y: 250, width: 80, height: 70,
    color: COLORS.job, roofColor: COLORS.jobRoof,
  },
];

// Zona de interação: faixa logo abaixo do prédio, onde o jogador pode pressionar E
for (const loc of locations) {
  loc.zone = { x: loc.x, y: loc.y + loc.height, w: loc.width, h: TILE_SIZE };
}

function getSolidRects() {
  return locations.map(loc => ({ x: loc.x, y: loc.y, w: loc.width, h: loc.height }));
}

function isSolidAtPixel(x, y) {
  const col = Math.floor(x / TILE_SIZE);
  const row = Math.floor(y / TILE_SIZE);
  if (row < 0 || row >= MAP_ROWS || col < 0 || col >= MAP_COLS) return true;
  if (isSolidTile(mapData[row][col])) return true;
  for (const rect of getSolidRects()) {
    if (x >= rect.x && x <= rect.x + rect.w && y >= rect.y && y <= rect.y + rect.h) {
      return true;
    }
  }
  return false;
}

function getLocationPlayerIsIn(playerRect) {
  const cx = playerRect.x + playerRect.w / 2;
  const cy = playerRect.y + playerRect.h / 2;
  for (const loc of locations) {
    const z = loc.zone;
    if (cx >= z.x && cx <= z.x + z.w && cy >= z.y && cy <= z.y + z.h) {
      return loc;
    }
  }
  return null;
}
