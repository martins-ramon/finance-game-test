// Captura de teclado
const keysPressed = new Set();

// Setas: movem o personagem. WASD: orbita/afasta a câmera. E/Enter: interagir.
const KEY_MAP = {
  ArrowUp: 'up',
  ArrowDown: 'down',
  ArrowLeft: 'left',
  ArrowRight: 'right',
  KeyW: 'cam-in', KeyS: 'cam-out',
  KeyA: 'cam-left', KeyD: 'cam-right',
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
