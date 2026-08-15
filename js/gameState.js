// Estado central do jogo
const gameState = {
  cash: STARTING_CASH,
  savings: 0,
  day: 1,
  portfolio: {}, // { companyId: { shares, avgBuyPrice } }
  ownedItems: [], // ids de itens comprados na loja
  equippedOutfit: null, // id do item de roupa equipado
  equippedHat: null, // id do item de chapéu equipado
  houseDecorations: [], // ids de itens de decoração aplicados na casa
  flags: {
    seenWelcome: false,
    seenBankIntro: false,
    seenStockIntro: false,
    seenShopIntro: false,
    seenHouseIntro: false,
    seenJobIntro: false,
  },
  jobDoneToday: false,
};

function applyLoadedState(saved) {
  if (!saved) return;
  Object.assign(gameState, saved);
  gameState.flags = Object.assign({
    seenWelcome: false, seenBankIntro: false, seenStockIntro: false,
    seenShopIntro: false, seenHouseIntro: false, seenJobIntro: false,
  }, saved.flags || {});
  gameState.portfolio = saved.portfolio || {};
  gameState.ownedItems = saved.ownedItems || [];
  gameState.houseDecorations = saved.houseDecorations || [];
}

function persistGame() {
  saveGame(gameState);
}

function getPortfolioValue() {
  let total = 0;
  for (const id in gameState.portfolio) {
    const holding = gameState.portfolio[id];
    const company = companies.find(c => c.id === id);
    if (company) total += holding.shares * company.price;
  }
  return total;
}

function getPortfolioProfit() {
  let profit = 0;
  for (const id in gameState.portfolio) {
    const holding = gameState.portfolio[id];
    const company = companies.find(c => c.id === id);
    if (company) profit += (company.price - holding.avgBuyPrice) * holding.shares;
  }
  return profit;
}

function advanceDay() {
  gameState.day += 1;
  const interestEarned = bankApplyDailyInterest();
  const stockEvents = stockUpdatePrices();
  gameState.jobDoneToday = false;

  const summaryParts = [];
  if (interestEarned > 0.004) {
    summaryParts.push(`Sua poupança rendeu ${formatMoney(interestEarned)} de juros! 🏦`);
  }
  for (const ev of stockEvents) {
    summaryParts.push(ev);
  }
  summaryParts.push('Um novo dia começou! O quiosque de trabalho está liberado de novo. 💼');

  updateHUD();
  persistGame();

  showDialogue([{ text: `☀️ Dia ${gameState.day} chegou! ${summaryParts.join(' ')}` }]);
}
