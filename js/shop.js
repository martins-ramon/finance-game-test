// Loja: itens cosméticos (roupa) e de decoração (casa)

const shopItems = [
  { id: 'chapeu_azul', name: 'Boné Azul', price: 15, type: 'hat', emoji: '🧢' },
  { id: 'coroa', name: 'Coroa Dourada', price: 35, type: 'hat', emoji: '👑' },
  { id: 'roupa_vermelha', name: 'Roupa Vermelha', price: 25, type: 'outfit', color: '#e05555', emoji: '👕' },
  { id: 'roupa_verde', name: 'Roupa Verde', price: 25, type: 'outfit', color: '#4aa15a', emoji: '👕' },
  { id: 'planta', name: 'Planta pra Casa', price: 20, type: 'decoration', emoji: '🪴' },
  { id: 'quadro', name: 'Quadro Decorativo', price: 30, type: 'decoration', emoji: '🖼️' },
  { id: 'sofa', name: 'Sofá Novo', price: 60, type: 'decoration', emoji: '🛋️' },
];

function shopBuy(itemId) {
  const item = shopItems.find(i => i.id === itemId);
  if (!item) return false;
  if (gameState.ownedItems.includes(itemId)) return false;
  if (item.price > gameState.cash) return false;

  gameState.cash -= item.price;
  gameState.ownedItems.push(itemId);

  if (item.type === 'outfit') {
    gameState.equippedOutfit = itemId;
    player.outfitColor = item.color;
  } else if (item.type === 'hat') {
    gameState.equippedHat = itemId;
    player.hat = item.emoji;
  } else if (item.type === 'decoration') {
    gameState.houseDecorations.push(itemId);
  }
  return true;
}

function refreshShopPanel() {
  document.getElementById('shop-cash-display').textContent = formatMoney(gameState.cash);
  const list = document.getElementById('shop-list');
  list.innerHTML = '';

  for (const item of shopItems) {
    const owned = gameState.ownedItems.includes(item.id);
    const row = document.createElement('div');
    row.className = 'shop-item';
    row.innerHTML = `
      <span class="shop-item-emoji">${item.emoji}</span>
      <div class="shop-item-info">
        <div class="shop-item-name">${item.name}</div>
        <div class="shop-item-price">${formatMoney(item.price)}</div>
      </div>
      <button class="shop-buy-btn ${owned ? 'owned' : ''}" ${owned || item.price > gameState.cash ? 'disabled' : ''}>
        ${owned ? 'Comprado ✓' : 'Comprar'}
      </button>
    `;
    if (!owned) {
      row.querySelector('button').addEventListener('click', () => {
        if (shopBuy(item.id)) {
          refreshShopPanel();
          updateHUD();
          persistGame();
        }
      });
    }
    list.appendChild(row);
  }
}

function refreshHousePanel() {
  const container = document.getElementById('house-decorations');
  if (gameState.houseDecorations.length === 0) {
    container.textContent = 'Nenhuma decoração ainda. Visite a Loja! 🛍️';
    return;
  }
  container.innerHTML = gameState.houseDecorations
    .map(id => {
      const item = shopItems.find(i => i.id === id);
      return item ? `<span style="font-size:32px; margin-right:8px;">${item.emoji}</span>` : '';
    })
    .join('');
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('house-sleep').addEventListener('click', () => {
    document.getElementById('house-modal').classList.add('hidden');
    advanceDay();
  });
});
