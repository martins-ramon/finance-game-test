// Captura de teclado
const keysPressed = new Set();

const KEY_MAP = {
  ArrowUp: 'up', KeyW: 'up',
  ArrowDown: 'down', KeyS: 'down',
  ArrowLeft: 'left', KeyA: 'left',
  ArrowRight: 'right', KeyD: 'right',
  KeyE: 'interact', Enter: 'interact',
};

window.addEventListener('keydown', (e) => {
  const action = KEY_MAP[e.code];
  if (action) {
    keysPressed.add(action);
    if (action === 'interact') {
      handleInteractKey();
    }
    e.preventDefault();
  }
});

window.addEventListener('keyup', (e) => {
  const action = KEY_MAP[e.code];
  if (action) {
    keysPressed.delete(action);
  }
});
