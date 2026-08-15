// HUD, painéis modais e interação com locais

let currentLocation = null;

function updateHUD() {
  document.getElementById('hud-cash').textContent = formatMoney(gameState.cash);
  document.getElementById('hud-savings').textContent = formatMoney(gameState.savings);
  document.getElementById('hud-portfolio').textContent = formatMoney(getPortfolioValue());
  document.getElementById('hud-day').textContent = gameState.day;
}

function isAnyModalOpen() {
  return !document.getElementById('dialogue-modal').classList.contains('hidden')
    || !document.getElementById('bank-modal').classList.contains('hidden')
    || !document.getElementById('stock-modal').classList.contains('hidden')
    || !document.getElementById('shop-modal').classList.contains('hidden')
    || !document.getElementById('house-modal').classList.contains('hidden');
}

function setCurrentLocation(loc) {
  currentLocation = loc;
  const prompt = document.getElementById('interact-prompt');
  if (loc && !isAnyModalOpen() && !jobState.active) {
    prompt.classList.remove('hidden');
  } else {
    prompt.classList.add('hidden');
  }
}

function closeModal(id) {
  document.getElementById(id).classList.add('hidden');
}

const INTRO_DIALOGUES = {
  bank: [
    { text: '🏦 Bem-vindo ao Banco! Aqui você pode guardar seu dinheiro na poupança.' },
    { text: 'Todo dia, o dinheiro guardado rende juros: ele cresce sozinho! Isso se chama juros compostos.' },
    { text: 'Aqui no jogo a taxa é de 1% ao dia — bem mais rápido que na vida real — só para você ver o efeito dos juros mais rápido!' },
  ],
  stock: [
    { text: '📈 Bem-vindo à Bolsa de Valores! Aqui você compra pedacinhos de empresas, chamados de "ações".' },
    { text: 'O preço das ações sobe e desce todo dia. Empresas de risco alto podem dar mais lucro, mas também podem dar mais prejuízo.' },
    { text: 'Dica: não coloque todo o seu dinheiro em uma empresa só! Espalhar o dinheiro entre várias empresas se chama diversificação.' },
  ],
  shop: [
    { text: '🛍️ Bem-vinda à Loja! Aqui você pode comprar roupas legais e itens para decorar sua casa.' },
    { text: 'Lembre-se: todo dinheiro gasto aqui é dinheiro que não vai render na poupança nem crescer investido. Escolha com sabedoria!' },
  ],
  house: [
    { text: '🏠 Esta é a sua casa! Aqui você pode ver as decorações que comprou e dormir para avançar o dia.' },
  ],
  job: [
    { text: '💼 Este é o quiosque de trabalho! Corra e colete as moedas 🪙 antes que o tempo acabe para ganhar dinheiro.' },
    { text: 'Você pode trabalhar uma vez por dia. Use E ou Enter perto das moedas... na verdade, basta encostar nelas!' },
  ],
};

function openLocationPanel(loc) {
  if (loc.id === 'job') {
    if (jobState.active) return;
    if (gameState.jobDoneToday) {
      showDialogue([{ text: '💼 Você já trabalhou hoje! Volte amanhã (avance o dia) para trabalhar de novo.' }]);
      return;
    }
    if (!gameState.flags.seenJobIntro) {
      gameState.flags.seenJobIntro = true;
      persistGame();
      showDialogue(INTRO_DIALOGUES.job);
      const waitAndStart = setInterval(() => {
        if (document.getElementById('dialogue-modal').classList.contains('hidden')) {
          clearInterval(waitAndStart);
          startJobMinigame();
        }
      }, 200);
      return;
    }
    startJobMinigame();
    return;
  }

  const flagKey = 'seen' + loc.id.charAt(0).toUpperCase() + loc.id.slice(1) + 'Intro';
  const openPanel = () => {
    document.getElementById(loc.id + '-modal').classList.remove('hidden');
    if (loc.id === 'bank') refreshBankPanel();
    if (loc.id === 'stock') refreshStockPanel();
    if (loc.id === 'shop') refreshShopPanel();
    if (loc.id === 'house') refreshHousePanel();
    setCurrentLocation(currentLocation);
  };

  if (!gameState.flags[flagKey]) {
    gameState.flags[flagKey] = true;
    persistGame();
    showDialogue(INTRO_DIALOGUES[loc.id]);
    const waitAndOpen = setInterval(() => {
      if (document.getElementById('dialogue-modal').classList.contains('hidden')) {
        clearInterval(waitAndOpen);
        openPanel();
      }
    }, 200);
  } else {
    openPanel();
  }
}

function handleInteractKey() {
  if (!document.getElementById('dialogue-modal').classList.contains('hidden')) {
    advanceDialogue();
    return;
  }
  if (isAnyModalOpen()) return;
  if (currentLocation) {
    openLocationPanel(currentLocation);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.modal-close').forEach(btn => {
    btn.addEventListener('click', () => {
      closeModal(btn.dataset.close);
      setCurrentLocation(currentLocation);
    });
  });

  document.getElementById('btn-advance-day').addEventListener('click', () => {
    advanceDay();
  });

  document.getElementById('btn-help').addEventListener('click', () => {
    showDialogue([
      { text: '🦉 Dicas rápidas: use as setas ou WASD para andar. Pressione E perto de um prédio para entrar.' },
      { text: '💰 Ganhe dinheiro no Trabalhinho, depois decida: guardar na Poupança, investir na Bolsa, ou gastar na Loja!' },
    ]);
  });
});
