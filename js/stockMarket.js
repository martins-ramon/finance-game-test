// Bolsa de Valores: empresas fictícias com perfis de risco diferentes

const companies = [
  { id: 'batabatata', name: 'BataBatata Alimentos', emoji: '🥔', price: 10, prevPrice: 10, history: [10], volatility: 0.03, drift: 0.002, risk: 'baixo', riskLabel: 'Risco baixo' },
  { id: 'ecoverde', name: 'EcoVerde Energia', emoji: '🌱', price: 20, prevPrice: 20, history: [20], volatility: 0.06, drift: 0.004, risk: 'medio', riskLabel: 'Risco médio' },
  { id: 'techbit', name: 'TechBit Games', emoji: '🎮', price: 15, prevPrice: 15, history: [15], volatility: 0.10, drift: 0.001, risk: 'alto', riskLabel: 'Risco alto' },
  { id: 'fogubrinq', name: 'FoguBrinquedos', emoji: '🧸', price: 8, prevPrice: 8, history: [8], volatility: 0.20, drift: -0.002, risk: 'muito-alto', riskLabel: 'Risco muito alto' },
];

const NEWS_EVENTS = {
  up: (c) => `${c.emoji} ${c.name} teve uma ótima notícia e a ação subiu bastante!`,
  down: (c) => `${c.emoji} ${c.name} teve uma notícia ruim e a ação caiu bastante!`,
};

// Chamada uma vez por dia (advanceDay). Retorna lista de mensagens de eventos.
function stockUpdatePrices() {
  const events = [];
  for (const c of companies) {
    c.prevPrice = c.price;
    let change = randomRange(-c.volatility, c.volatility) + c.drift;

    if (Math.random() < 0.1) {
      const isGoodNews = Math.random() < 0.5;
      const extra = isGoodNews ? randomRange(0.15, 0.25) : -randomRange(0.15, 0.25);
      change += extra;
      events.push(isGoodNews ? NEWS_EVENTS.up(c) : NEWS_EVENTS.down(c));
    }

    c.price = Math.max(0.5, c.price * (1 + change));
    c.history.push(c.price);
    if (c.history.length > 12) c.history.shift();
  }
  return events;
}

function stockBuy(companyId, shares) {
  const company = companies.find(c => c.id === companyId);
  if (!company || shares <= 0) return false;
  const cost = company.price * shares;
  if (cost > gameState.cash) return false;

  gameState.cash -= cost;
  const holding = gameState.portfolio[companyId] || { shares: 0, avgBuyPrice: 0 };
  const totalCost = holding.avgBuyPrice * holding.shares + cost;
  holding.shares += shares;
  holding.avgBuyPrice = totalCost / holding.shares;
  gameState.portfolio[companyId] = holding;
  return true;
}

function stockSell(companyId, shares) {
  const company = companies.find(c => c.id === companyId);
  const holding = gameState.portfolio[companyId];
  if (!company || !holding || shares <= 0 || shares > holding.shares) return false;

  holding.shares -= shares;
  gameState.cash += company.price * shares;
  if (holding.shares <= 0) {
    delete gameState.portfolio[companyId];
  }
  return true;
}

function drawStockChart(canvas, history) {
  const ctx = canvas.getContext('2d');
  const w = canvas.width;
  const h = canvas.height;
  ctx.clearRect(0, 0, w, h);

  const min = Math.min(...history);
  const max = Math.max(...history);
  const range = max - min || 1;

  ctx.strokeStyle = '#6a3aa8';
  ctx.lineWidth = 2;
  ctx.beginPath();
  history.forEach((price, i) => {
    const x = (i / (history.length - 1 || 1)) * (w - 8) + 4;
    const y = h - 4 - ((price - min) / range) * (h - 8);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.stroke();
}

function refreshStockPanel() {
  document.getElementById('stock-cash-display').textContent = formatMoney(gameState.cash);
  document.getElementById('stock-total-display').textContent = formatMoney(getPortfolioValue());
  const profit = getPortfolioProfit();
  const profitEl = document.getElementById('stock-profit-display');
  profitEl.textContent = formatMoney(profit);
  profitEl.className = profit >= 0 ? 'price-up' : 'price-down';

  const list = document.getElementById('stock-list');
  list.innerHTML = '';

  for (const c of companies) {
    const holding = gameState.portfolio[c.id];
    const change = c.price - c.prevPrice;
    const changePct = (change / c.prevPrice) * 100;
    const changeClass = change >= 0 ? 'price-up' : 'price-down';
    const changeSign = change >= 0 ? '▲' : '▼';

    const card = document.createElement('div');
    card.className = 'stock-card';
    card.innerHTML = `
      <div class="stock-card-top">
        <span class="stock-emoji">${c.emoji}</span>
        <span class="stock-name">${c.name}</span>
        <span class="stock-risk risk-${c.risk}">${c.riskLabel}</span>
      </div>
      <div class="stock-price-row">
        <span>Preço: <strong>${formatMoney(c.price)}</strong></span>
        <span class="${changeClass}">${changeSign} ${Math.abs(changePct).toFixed(1)}%</span>
      </div>
      <canvas class="stock-chart" width="480" height="60"></canvas>
      <div class="stock-holdings">
        ${holding
          ? `Você tem ${holding.shares} ações (preço médio: ${formatMoney(holding.avgBuyPrice)}) — Lucro/Prejuízo: ${formatMoney((c.price - holding.avgBuyPrice) * holding.shares)}`
          : 'Você ainda não tem ações desta empresa.'}
      </div>
      <div class="stock-actions">
        <input type="number" min="1" step="1" placeholder="Qtd" class="stock-qty-input">
        <button class="btn-buy" data-action="buy" data-id="${c.id}">Comprar</button>
        <button class="btn-sell" data-action="sell" data-id="${c.id}" ${!holding ? 'disabled' : ''}>Vender</button>
      </div>
    `;
    list.appendChild(card);

    const chartCanvas = card.querySelector('.stock-chart');
    drawStockChart(chartCanvas, c.history);

    const qtyInput = card.querySelector('.stock-qty-input');
    card.querySelector('[data-action="buy"]').addEventListener('click', () => {
      const qty = Math.floor(Number(qtyInput.value));
      if (qty > 0 && stockBuy(c.id, qty)) {
        qtyInput.value = '';
        refreshStockPanel();
        updateHUD();
        persistGame();
      }
    });
    const sellBtn = card.querySelector('[data-action="sell"]');
    if (sellBtn) {
      sellBtn.addEventListener('click', () => {
        const qty = Math.floor(Number(qtyInput.value));
        if (qty > 0 && stockSell(c.id, qty)) {
          qtyInput.value = '';
          refreshStockPanel();
          updateHUD();
          persistGame();
        }
      });
    }
  }
}
