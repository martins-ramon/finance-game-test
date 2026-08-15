// Minigame "Trabalhinho": coletar moedas por tempo limitado (fonte de renda inicial)

const JOB_DURATION = 10; // segundos
const JOB_COIN_VALUE = 5;
const JOB_COIN_COUNT = 8;
const JOB_COIN_RADIUS = 12;

const jobState = {
  active: false,
  timeLeft: 0,
  coins: [],
  collected: 0,
};

function randomWalkableSpot() {
  for (let attempt = 0; attempt < 60; attempt++) {
    const x = randomRange(60, CANVAS_WIDTH - 60);
    const y = randomRange(60, CANVAS_HEIGHT - 60);
    if (!isSolidAtPixel(x, y)) return { x, y };
  }
  return { x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT / 2 };
}

function startJobMinigame() {
  jobState.active = true;
  jobState.timeLeft = JOB_DURATION;
  jobState.collected = 0;
  jobState.coins = [];
  for (let i = 0; i < JOB_COIN_COUNT; i++) {
    const spot = randomWalkableSpot();
    jobState.coins.push({ x: spot.x, y: spot.y, collected: false });
  }
  document.getElementById('job-hud').classList.remove('hidden');
  updateJobHud();
}

function updateJobHud() {
  document.getElementById('job-timer').textContent = Math.ceil(Math.max(jobState.timeLeft, 0)) + 's';
  document.getElementById('job-coins').textContent = formatMoney(jobState.collected);
}

function updateJob(dt) {
  if (!jobState.active) return;

  jobState.timeLeft -= dt;

  const p = player.getRect();
  const pcx = p.x + p.w / 2;
  const pcy = p.y + p.h / 2;

  for (const coin of jobState.coins) {
    if (coin.collected) continue;
    const dist = Math.hypot(pcx - coin.x, pcy - coin.y);
    if (dist < JOB_COIN_RADIUS + p.w / 2) {
      coin.collected = true;
      jobState.collected += JOB_COIN_VALUE;
    }
  }

  updateJobHud();

  if (jobState.timeLeft <= 0) {
    endJobMinigame();
  }
}

function endJobMinigame() {
  jobState.active = false;
  document.getElementById('job-hud').classList.add('hidden');
  gameState.cash += jobState.collected;
  gameState.jobDoneToday = true;
  updateHUD();
  persistGame();
  showDialogue([
    { text: `💼 Bom trabalho! Você coletou ${formatMoney(jobState.collected)}. Agora pense: vai gastar, guardar na poupança ou investir na Bolsa?` },
  ]);
}
