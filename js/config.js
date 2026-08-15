// Configurações globais do jogo
const TILE_SIZE = 40;
const MAP_COLS = 20;
const MAP_ROWS = 15;
const CANVAS_WIDTH = TILE_SIZE * MAP_COLS;
const CANVAS_HEIGHT = TILE_SIZE * MAP_ROWS;

const PLAYER_SPEED = 160; // pixels por segundo
const PLAYER_SIZE = 28;

const SAVINGS_DAILY_RATE = 0.01; // 1% ao dia (exagerado de propósito para fins didáticos)

const STARTING_CASH = 10;

const SAVE_KEY = 'mundoDaPoupancaSave';

const COLORS = {
  grass: '#7cc576',
  grassDark: '#6bb566',
  path: '#e8c79a',
  wall: '#4a7a3a',
  bank: '#3a6ea5',
  bankRoof: '#f4c542',
  stock: '#8e5bd9',
  stockRoof: '#6a3aa8',
  shop: '#e85d8a',
  shopRoof: '#c23e69',
  house: '#c99a5b',
  houseRoof: '#a67638',
  job: '#5bab8a',
  jobRoof: '#3a7a5a',
};
