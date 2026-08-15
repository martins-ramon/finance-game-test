// Banco: poupança com juros compostos

function bankDeposit(amount) {
  if (amount <= 0 || amount > gameState.cash) return false;
  gameState.cash -= amount;
  gameState.savings += amount;
  return true;
}

function bankWithdraw(amount) {
  if (amount <= 0 || amount > gameState.savings) return false;
  gameState.savings -= amount;
  gameState.cash += amount;
  return true;
}

// Aplicada uma vez por dia (advanceDay). Retorna o valor de juros ganho.
function bankApplyDailyInterest() {
  const interest = gameState.savings * SAVINGS_DAILY_RATE;
  gameState.savings += interest;
  return interest;
}

function bankProjection(days) {
  return gameState.savings * Math.pow(1 + SAVINGS_DAILY_RATE, days);
}

function refreshBankPanel() {
  document.getElementById('bank-cash-display').textContent = formatMoney(gameState.cash);
  document.getElementById('bank-savings-display').textContent = formatMoney(gameState.savings);
  document.getElementById('bank-projection').textContent = formatMoney(bankProjection(7));
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('bank-deposit').addEventListener('click', () => {
    const input = document.getElementById('bank-amount');
    const amount = Math.floor(Number(input.value));
    if (bankDeposit(amount)) {
      input.value = '';
      refreshBankPanel();
      updateHUD();
      persistGame();
    }
  });

  document.getElementById('bank-withdraw').addEventListener('click', () => {
    const input = document.getElementById('bank-amount');
    const amount = Math.floor(Number(input.value));
    if (bankWithdraw(amount)) {
      input.value = '';
      refreshBankPanel();
      updateHUD();
      persistGame();
    }
  });
});
