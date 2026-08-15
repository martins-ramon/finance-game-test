// Funções utilitárias
function formatMoney(value) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function randomRange(min, max) {
  return min + Math.random() * (max - min);
}

function randomInt(min, max) {
  return Math.floor(randomRange(min, max + 1));
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function saveGame(state) {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(state));
  } catch (e) {
    console.warn('Não foi possível salvar o jogo:', e);
  }
}

function loadGame() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    console.warn('Não foi possível carregar o jogo salvo:', e);
    return null;
  }
}
