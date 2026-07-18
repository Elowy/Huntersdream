/* =========================================================================
 * HUNTER'S DREAM 2 — slot machine game
 * 5 reels · 3 rows · 20 paylines
 * Features: WILD (substitutes + x2 per wild), SCATTER on 3 middle reels
 *           -> 10 sticky free spins.
 * ========================================================================= */

'use strict';

/* --------------------------- Configuration ------------------------------ */

const COLS = 5;
const ROWS = 3;

/* Symbol definitions.
 * id      : internal key
 * emoji   : glyph shown on the reel
 * name    : short label
 * kind    : 'high' | 'card' | 'wild' | 'scatter'
 * pay     : { matchCount: multiplier of the LINE BET }
 * weight  : relative frequency on the reel strips
 */
const SYMBOLS = {
  // Premium symbols: the hunter and the wolf lead the paytable and pay
  // already from TWO of a kind.
  hunter:  { emoji: '🏹', name: 'HUNTER',  kind: 'high', weight: 3,
             pay: { 2: 5, 3: 20, 4: 60, 5: 200 } },
  wolf:    { emoji: '🐺', name: 'WOLF',    kind: 'high', weight: 4,
             pay: { 2: 2, 3: 12, 4: 32, 5: 80 } },
  // Buffalo replaces the old bear + boar pair, keeping the bear paytable.
  buffalo: { emoji: '🦬', name: 'BUFFALO', kind: 'high', weight: 6,
             pay: { 3: 10, 4: 20, 5: 50 } },
  eagle:   { emoji: '🦅', name: 'EAGLE',   kind: 'high', weight: 6,
             pay: { 3: 6, 4: 12, 5: 24 } },
  ace:     { emoji: 'A',  name: 'A',       kind: 'card', weight: 8,
             pay: { 3: 4, 4: 8, 5: 16 } },
  king:    { emoji: 'K',  name: 'K',       kind: 'card', weight: 9,
             pay: { 3: 3, 4: 6, 5: 12 } },
  queen:   { emoji: 'Q',  name: 'Q',       kind: 'card', weight: 9,
             pay: { 3: 3, 4: 5, 5: 10 } },
  jack:    { emoji: 'J',  name: 'J',       kind: 'card', weight: 10,
             pay: { 3: 2, 4: 4, 5: 8 } },
  ten:     { emoji: '10', name: '10',      kind: 'card', weight: 10,
             pay: { 3: 2, 4: 3, 5: 5 } },
  nine:    { emoji: '9',  name: '9',       kind: 'card', weight: 10,
             pay: { 3: 1, 4: 2, 5: 5 } },
  // WILD is the fire — substitutes for all but the scatter and doubles per wild.
  wild:    { emoji: '🔥', name: 'WILD',    kind: 'wild', weight: 2, pay: {} },
  scatter: { emoji: '🏚️', name: 'BONUS',   kind: 'scatter', weight: 2, pay: {} },
};

/* Which reels each symbol may appear on (0-indexed). Scatter only on the
 * three middle reels (1,2,3) per the rules. Wild not on reel 0 (common). */
const MIDDLE_REELS = [1, 2, 3];

/* 20 paylines. Each entry is the row index (0=top,1=mid,2=bottom) per reel. */
const PAYLINES = [
  [1, 1, 1, 1, 1],
  [0, 0, 0, 0, 0],
  [2, 2, 2, 2, 2],
  [0, 1, 2, 1, 0],
  [2, 1, 0, 1, 2],
  [0, 0, 1, 2, 2],
  [2, 2, 1, 0, 0],
  [1, 2, 2, 2, 1],
  [1, 0, 0, 0, 1],
  [0, 1, 1, 1, 0],
  [2, 1, 1, 1, 2],
  [1, 2, 1, 0, 1],
  [1, 0, 1, 2, 1],
  [0, 1, 0, 1, 0],
  [2, 1, 2, 1, 2],
  [1, 1, 2, 1, 1],
  [1, 1, 0, 1, 1],
  [0, 2, 2, 2, 0],
  [2, 0, 0, 0, 2],
  [0, 2, 0, 2, 0],
];

const LINE_COLORS = [
  '#ff3b3b', '#ffd23b', '#3bff5a', '#3bc8ff', '#c03bff',
  '#ff8a3b', '#3bffd2', '#ff3bce', '#8aff3b', '#3b6bff',
  '#ff5a8a', '#d2ff3b', '#3bffa0', '#b03bff', '#ff3b3b',
  '#ffa53b', '#3bd2ff', '#ff3b6b', '#6aff3b', '#3b8aff',
];

const BET_STEPS = [0.10, 0.30, 0.50, 0.70, 1.00, 2.00, 3.00, 4.00,
  5.00, 6.00, 7.00, 8.00, 9.00, 10.00];
const LINES = PAYLINES.length; // 20
const START_CREDIT = 10.00;
const FREE_SPINS_AWARD = 10;
const MAX_STICKY_RESPINS = 6;

/* ------------------------------- State ---------------------------------- */

const state = {
  credit: START_CREDIT,
  betIndex: 0,            // 0.10 total bet (minimum)
  grid: [],               // grid[col][row] = symbol id
  spinning: false,
  freeSpins: 0,
  inFreeGame: false,
  auto: false,
  lastWin: 0,
};

/* ------------------------------ Helpers --------------------------------- */

const $ = (sel) => document.querySelector(sel);
const fmt = (n) => n.toFixed(2);
const totalBet = () => BET_STEPS[state.betIndex];
const lineBet = () => totalBet() / LINES;

function reelSymbols(col) {
  // Build the pool of symbols allowed on this reel.
  const pool = [];
  for (const [id, def] of Object.entries(SYMBOLS)) {
    if (def.kind === 'scatter' && !MIDDLE_REELS.includes(col)) continue;
    if (def.kind === 'wild' && col === 0) continue; // no wild on first reel
    for (let i = 0; i < def.weight; i++) pool.push(id);
  }
  return pool;
}

function randomSymbol(col) {
  const pool = reelSymbols(col);
  return pool[Math.floor(Math.random() * pool.length)];
}

/* Assign the visible symbols of reel `col` into state.grid, guaranteeing at
 * most ONE scatter/Bonus per reel. Held positions (during sticky free-spin
 * respins) are left untouched but counted toward the limit. */
function spinReelSymbols(col, holdSet) {
  let scatters = 0;
  for (let r = 0; r < ROWS; r++) {
    if (holdSet && holdSet.has(col + ',' + r) && state.grid[col][r] === 'scatter') {
      scatters++;
    }
  }
  for (let r = 0; r < ROWS; r++) {
    if (holdSet && holdSet.has(col + ',' + r)) continue;
    let sym = randomSymbol(col);
    if (sym === 'scatter') {
      if (scatters >= 1) {
        while (sym === 'scatter') sym = randomSymbol(col); // no second scatter
      } else {
        scatters++;
      }
    }
    state.grid[col][r] = sym;
  }
}

/* ------------------------- DOM construction ----------------------------- */

const reelsEl = $('#reels');
const cellEls = []; // cellEls[col][row]

function buildBoard() {
  reelsEl.innerHTML = '';
  for (let c = 0; c < COLS; c++) {
    const reel = document.createElement('div');
    reel.className = 'reel';
    cellEls[c] = [];
    state.grid[c] = [];
    for (let r = 0; r < ROWS; r++) {
      const cell = document.createElement('div');
      cell.className = 'cell';
      cell.innerHTML = '<div class="sym"></div>';
      reel.appendChild(cell);
      cellEls[c][r] = cell;
      state.grid[c][r] = 'nine';
    }
    spinReelSymbols(c, null);   // fill with the max-one-scatter rule
    reelsEl.appendChild(reel);
  }
  renderGrid();
}

const ART = window.SYMBOL_ART || {};

function artFor(id) {
  return ART[id] || `<div class="sym-fallback">${SYMBOLS[id].emoji}</div>`;
}

function renderCell(c, r) {
  const id = state.grid[c][r];
  const def = SYMBOLS[id];
  const cell = cellEls[c][r];
  cell.querySelector('.sym').innerHTML = artFor(id);
  cell.className = 'cell ' + def.kind + ' sym-' + id;
}

function renderGrid() {
  for (let c = 0; c < COLS; c++)
    for (let r = 0; r < ROWS; r++) renderCell(c, r);
}

/* ------------------------- Win evaluation ------------------------------- */

/* Evaluate one payline. Returns { symbol, count, wilds, win } or null. */
function evaluateLine(line) {
  const symbolsOnLine = line.map((row, col) => state.grid[col][row]);

  // Determine the base paying symbol: first non-wild symbol.
  let base = null;
  for (const s of symbolsOnLine) {
    if (SYMBOLS[s].kind === 'wild') continue;
    if (SYMBOLS[s].kind === 'scatter') break; // scatter never part of line win
    base = s;
    break;
  }
  if (!base) return null; // all wild / no payable base

  // Count consecutive matches from the left (wild substitutes).
  let count = 0;
  let wilds = 0;
  for (const s of symbolsOnLine) {
    if (s === base) {
      count++;
    } else if (SYMBOLS[s].kind === 'wild') {
      count++;
      wilds++;
    } else {
      break;
    }
  }

  const pay = SYMBOLS[base].pay[count];
  if (!pay) return null;

  // Win is a multiple of the TOTAL bet, so the lowest paying combination
  // (e.g. three 9s) returns exactly the stake. Each active wild in the
  // winning run then multiplies that win by 2.
  const multiplier = Math.pow(2, wilds);
  const win = round2(pay * totalBet() * multiplier);

  return { symbol: base, count, wilds, multiplier, win };
}

/* Evaluate the whole grid: returns { totalWin, lineWins:[{lineIndex,...}],
 *  scatterCount, positions:Set('c,r') } */
function evaluateGrid() {
  const lineWins = [];
  let totalWin = 0;
  const positions = new Set();

  PAYLINES.forEach((line, idx) => {
    const res = evaluateLine(line);
    if (res) {
      totalWin += res.win;
      lineWins.push({ lineIndex: idx, line, ...res });
      for (let col = 0; col < res.count; col++) {
        positions.add(col + ',' + line[col]);
      }
    }
  });

  // Scatter: count on the three middle reels.
  let scatterCount = 0;
  const scatterPositions = [];
  for (const c of MIDDLE_REELS) {
    for (let r = 0; r < ROWS; r++) {
      if (state.grid[c][r] === 'scatter') {
        scatterCount++;
        scatterPositions.push(c + ',' + r);
      }
    }
  }

  return { totalWin, lineWins, scatterCount, positions, scatterPositions };
}

/* ----------------------------- Rendering wins --------------------------- */

const overlay = $('#lineOverlay');

function clearWinVisuals() {
  overlay.innerHTML = '';
  for (let c = 0; c < COLS; c++)
    for (let r = 0; r < ROWS; r++)
      cellEls[c][r].classList.remove('win-cell');
}

/* Draw a single winning line's polyline and flash its cells. */
function drawLine(lw) {
  overlay.setAttribute('viewBox', `0 0 ${COLS} ${ROWS}`);
  const color = LINE_COLORS[lw.lineIndex % LINE_COLORS.length];
  const pts = [];
  for (let col = 0; col < lw.count; col++) {
    const row = lw.line[col];
    pts.push(`${col + 0.5},${row + 0.5}`);
    cellEls[col][row].classList.add('win-cell');
  }
  const pl = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
  pl.setAttribute('points', pts.join(' '));
  pl.setAttribute('fill', 'none');
  pl.setAttribute('stroke', color);
  pl.setAttribute('stroke-width', '0.09');
  pl.setAttribute('stroke-linecap', 'round');
  pl.setAttribute('stroke-linejoin', 'round');
  pl.setAttribute('opacity', '0.95');
  overlay.appendChild(pl);
}

function showWinLines(result) {
  clearWinVisuals();
  if (!result.lineWins.length) return;
  result.lineWins.forEach((lw) => drawLine(lw));
}

/* Present winning lines ONE BY ONE: each line flashes on its own with its
 * amount, ticking the win meter and credit up, then a combined total. */
async function presentWins(result, { fast } = {}) {
  const wins = [...result.lineWins].sort((a, b) => b.win - a.win);
  if (!wins.length) return 0;

  const per = fast ? 600 : 900;
  state.lastWin = 0;
  updateMeters();

  for (const lw of wins) {
    clearWinVisuals();
    drawLine(lw);
    state.lastWin = round2(state.lastWin + lw.win);
    state.credit = round2(state.credit + lw.win);
    updateMeters();
    const wildTag = lw.wilds > 0 ? `  🔥×${lw.multiplier}` : '';
    showWinPopup(`${SYMBOLS[lw.symbol].name} ${lw.count}×  ${fmt(lw.win)} €${wildTag}`);
    await sleep(per);
  }

  // Combined view + total.
  clearWinVisuals();
  showWinLines(result);
  const big = state.lastWin >= totalBet() * 15;
  if (wins.length > 1 || big) {
    showWinPopup(`${big ? 'NAGY NYEREMÉNY!  ' : 'ÖSSZESEN  '}${fmt(state.lastWin)} €`);
    await sleep(fast ? 950 : 1400);
  }
  return state.lastWin;
}

function showWinPopup(text) {
  const el = $('#winPopup');
  el.textContent = text;
  el.classList.remove('hidden');
  // restart animation
  el.style.animation = 'none';
  void el.offsetWidth;
  el.style.animation = '';
}
function hideWinPopup() { $('#winPopup').classList.add('hidden'); }

/* ------------------------------ UI update ------------------------------- */

function updateMeters() {
  $('#credit').textContent = fmt(state.credit);
  $('#betValue').textContent = fmt(totalBet());
  $('#win').textContent = fmt(state.lastWin);
  $('#freeSpinsLeft').textContent = state.freeSpins;
  $('#freeBanner').classList.toggle('hidden', !state.inFreeGame);
}

function setControlsEnabled(enabled) {
  ['#betMinus', '#betPlus', '#maxBet'].forEach((s) => {
    $(s).disabled = !enabled || state.inFreeGame;
  });
}

/* --------------------------- Spin animation ----------------------------- */

function sleep(ms) { return new Promise((res) => setTimeout(res, ms)); }

async function animateSpin(holdSet) {
  // holdSet: Set of 'c,r' positions to keep sticky (free game respins)
  const spinFrames = 12;
  for (let c = 0; c < COLS; c++) {
    for (let r = 0; r < ROWS; r++) {
      if (holdSet && holdSet.has(c + ',' + r)) continue;
      cellEls[c][r].classList.add('spinning');
    }
  }
  // Rapidly cycle symbol art, then stop reel by reel left-to-right.
  for (let f = 0; f < spinFrames; f++) {
    for (let c = 0; c < COLS; c++) {
      for (let r = 0; r < ROWS; r++) {
        if (holdSet && holdSet.has(c + ',' + r)) continue;
        cellEls[c][r].querySelector('.sym').innerHTML = artFor(randomSymbol(c));
      }
    }
    await sleep(45);
  }

  // Stop each reel with a short stagger and a landing bounce.
  for (let c = 0; c < COLS; c++) {
    spinReelSymbols(c, holdSet);   // at most one scatter per reel
    for (let r = 0; r < ROWS; r++) {
      if (holdSet && holdSet.has(c + ',' + r)) continue;
      renderCell(c, r);
      const cell = cellEls[c][r];
      cell.classList.remove('spinning');
      cell.classList.remove('land');
      void cell.offsetWidth;      // restart animation
      cell.classList.add('land');
    }
    await sleep(150); // stagger reel stop
  }
}

/* ------------------------------ Game flow ------------------------------- */

async function doSpin() {
  if (state.spinning) return;

  if (!state.inFreeGame) {
    if (state.credit < totalBet()) {
      showWinPopup('NINCS ELÉG KREDIT');
      await sleep(1200);
      hideWinPopup();
      return;
    }
    state.credit -= totalBet();
  }

  state.spinning = true;
  state.lastWin = 0;
  clearWinVisuals();
  hideWinPopup();
  updateMeters();
  setControlsEnabled(false);
  $('#startBtn').textContent = state.inFreeGame ? '...' : 'STOP';
  $('#startBtn').classList.add('stop');

  if (state.inFreeGame) {
    await freeSpinRound();
  } else {
    await animateSpin(null);
    const result = evaluateGrid();
    await settleResult(result, false);
  }

  state.spinning = false;
  $('#startBtn').textContent = 'START';
  $('#startBtn').classList.remove('stop');
  setControlsEnabled(true);
  updateMeters();

  // Continue free game / autoplay chains.
  if (state.freeSpins > 0 && state.inFreeGame) {
    await sleep(700);
    doSpin();
  } else if (state.inFreeGame && state.freeSpins === 0) {
    endFreeGame();
    if (state.auto) { await sleep(600); doSpin(); }
  } else if (state.auto && !state.inFreeGame) {
    if (state.credit >= totalBet()) { await sleep(600); doSpin(); }
    else toggleAuto(false);
  }
}

/* Settle a normal (non free-game) spin result. */
async function settleResult(result, isFree) {
  if (result.totalWin > 0) {
    await presentWins(result, { fast: state.auto });
    hideWinPopup();
  }

  // Scatter -> free spins
  if (result.scatterCount >= 3) {
    await triggerFreeGames(result);
  }
}

function round2(n) { return Math.round(n * 100) / 100; }

/* --------------------------- Free games -------------------------------- */

async function triggerFreeGames(result) {
  // highlight scatters
  result.scatterPositions.forEach((p) => {
    const [c, r] = p.split(',').map(Number);
    cellEls[c][r].classList.add('win-cell');
  });
  const first = !state.inFreeGame;
  state.freeSpins += FREE_SPINS_AWARD;
  showWinPopup(`🏚️ ${FREE_SPINS_AWARD} INGYENES JÁTÉK!`);
  await sleep(1800);
  hideWinPopup();
  if (first) {
    state.inFreeGame = true;
    updateMeters();
  }
}

function endFreeGame() {
  state.inFreeGame = false;
  clearStickies();
  showWinPopup('INGYENES JÁTÉKOK VÉGE');
  updateMeters();
  setTimeout(hideWinPopup, 1600);
}

function clearStickies() {
  for (let c = 0; c < COLS; c++)
    for (let r = 0; r < ROWS; r++)
      cellEls[c][r].classList.remove('sticky');
}

/* A single free spin: sticky respin mechanic.
 * After the initial spin, symbols that form winning combinations are held
 * ("sticky") and the remaining reels respin. As long as the total win keeps
 * increasing, respins continue. The best (final) win is paid. */
async function freeSpinRound() {
  state.freeSpins--;
  clearStickies();

  const cloneGrid = () => state.grid.map((col) => col.slice());

  await animateSpin(null);
  let result = evaluateGrid();
  let bestWin = result.totalWin;
  let bestGrid = cloneGrid();
  showWinLines(result);
  await sleep(800);

  let held = new Set(result.positions);
  let respins = 0;

  while (held.size > 0 && held.size < COLS * ROWS && respins < MAX_STICKY_RESPINS) {
    // Mark held cells as sticky visually.
    clearStickies();
    held.forEach((p) => {
      const [c, r] = p.split(',').map(Number);
      cellEls[c][r].classList.add('sticky');
    });
    await sleep(500);

    await animateSpin(held);
    const next = evaluateGrid();

    if (next.totalWin > bestWin) {
      bestWin = next.totalWin;
      result = next;
      bestGrid = cloneGrid();
      showWinLines(next);
      // grow the held set with the new winning positions
      next.positions.forEach((p) => held.add(p));
      respins++;
      await sleep(800);
    } else {
      // no higher win -> stop respinning
      break;
    }
  }

  clearStickies();

  // Pay the best win found this free spin, line by line.
  if (bestWin > 0) {
    // Restore the best grid so the highlighted cells match the payout.
    state.grid = bestGrid;
    renderGrid();
    await presentWins(result, { fast: true });
    hideWinPopup();
  }

  // Retrigger: 3 scatters during free game award another 10.
  const finalEval = evaluateGrid();
  if (finalEval.scatterCount >= 3) {
    await triggerFreeGames(finalEval);
  }
}

/* ------------------------------ Controls -------------------------------- */

function changeBet(dir) {
  if (state.spinning || state.inFreeGame) return;
  state.betIndex = Math.min(BET_STEPS.length - 1, Math.max(0, state.betIndex + dir));
  updateMeters();
}

function maxBet() {
  if (state.spinning || state.inFreeGame) return;
  state.betIndex = BET_STEPS.length - 1;
  updateMeters();
  doSpin();
}

function toggleAuto(force) {
  state.auto = force === undefined ? !state.auto : force;
  $('#autoBtn').classList.toggle('active', state.auto);
  if (state.auto && !state.spinning && !state.inFreeGame) doSpin();
}

/* ------------------------------ Paytable UI ----------------------------- */

function buildPaytable() {
  const wrap = $('#paytableWrap');
  wrap.innerHTML = '';
  const order = ['hunter', 'wolf', 'buffalo', 'eagle', 'ace', 'king',
    'queen', 'jack', 'ten', 'nine', 'wild', 'scatter'];
  for (const id of order) {
    const def = SYMBOLS[id];
    const item = document.createElement('div');
    item.className = 'pt-item';
    let rows = '';
    if (Object.keys(def.pay).length) {
      for (const n of [5, 4, 3, 2]) {
        if (def.pay[n]) rows += `<div class="pt-row"><span>${n}×</span><span>${def.pay[n]}× tét</span></div>`;
      }
    } else if (def.kind === 'wild') {
      rows = '<div class="pt-row"><span>Helyettesít + ×2 / wild</span></div>';
    } else {
      rows = '<div class="pt-row"><span>3× → 10 ingyen játék</span></div>';
    }
    item.innerHTML = `<div class="pt-head"><span class="e">${artFor(id)}</span>${def.name}</div>${rows}`;
    wrap.appendChild(item);
  }
}

/* ------------------------------- Wiring --------------------------------- */

function init() {
  buildBoard();
  buildPaytable();
  updateMeters();

  $('#startBtn').addEventListener('click', () => {
    if (state.auto) toggleAuto(false);
    doSpin();
  });
  $('#betMinus').addEventListener('click', () => changeBet(-1));
  $('#betPlus').addEventListener('click', () => changeBet(1));
  $('#maxBet').addEventListener('click', maxBet);
  $('#autoBtn').addEventListener('click', () => toggleAuto());

  $('#rulesBtn').addEventListener('click', () => $('#rulesModal').classList.remove('hidden'));
  $('#rulesClose').addEventListener('click', () => $('#rulesModal').classList.add('hidden'));
  $('#rulesModal').addEventListener('click', (e) => {
    if (e.target.id === 'rulesModal') $('#rulesModal').classList.add('hidden');
  });

  // Keyboard: space to spin
  document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') { e.preventDefault(); if (!state.spinning) doSpin(); }
  });
}

document.addEventListener('DOMContentLoaded', init);

/* Debug / test hook — lets the browser console (and automated tests) inspect
 * and drive the game state. Harmless in normal play. */
window.HD = { state, SYMBOLS, PAYLINES, evaluateGrid, lineBet, totalBet, renderGrid, showWinLines, presentWins, spinReelSymbols };
