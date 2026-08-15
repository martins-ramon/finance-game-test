// Sistema de diálogo do Professor Coruja
let dialogueQueue = [];

function showDialogue(messages) {
  dialogueQueue = messages.slice();
  const modal = document.getElementById('dialogue-modal');
  modal.classList.remove('hidden');
  advanceDialogue();
}

function advanceDialogue() {
  if (dialogueQueue.length === 0) {
    document.getElementById('dialogue-modal').classList.add('hidden');
    return;
  }
  const next = dialogueQueue.shift();
  document.getElementById('dialogue-text').textContent = next.text;
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('dialogue-next').addEventListener('click', advanceDialogue);
});
