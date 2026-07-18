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
             pay: { 2: 20, 3: 40, 4: 60, 5: 200 } },
  wolf:    { emoji: '🐺', name: 'WOLF',    kind: 'high', weight: 4,
             pay: { 2: 8, 3: 16, 4: 32, 5: 80 } },
  // Buffalo replaces the old bear + boar pair.
  buffalo: { emoji: '🦬', name: 'BUFFALO', kind: 'high', weight: 6,
             pay: { 3: 8, 4: 16, 5: 32 } },
  eagle:   { emoji: '🦅', name: 'EAGLE',   kind: 'high', weight: 6,
             pay: { 3: 4, 4: 8, 5: 24 } },
  ace:     { emoji: 'A',  name: 'A',       kind: 'card', weight: 8,
             pay: { 3: 2, 4: 6, 5: 16 } },
  king:    { emoji: 'K',  name: 'K',       kind: 'card', weight: 8,
             pay: { 3: 2, 4: 6, 5: 16 } },
  queen:   { emoji: 'Q',  name: 'Q',       kind: 'card', weight: 9,
             pay: { 3: 1, 4: 4, 5: 8 } },
  jack:    { emoji: 'J',  name: 'J',       kind: 'card', weight: 9,
             pay: { 3: 1, 4: 4, 5: 8 } },
  ten:     { emoji: '10', name: '10',      kind: 'card', weight: 10,
             pay: { 3: 1, 4: 2, 5: 4 } },
  nine:    { emoji: '9',  name: '9',       kind: 'card', weight: 10,
             pay: { 3: 1, 4: 2, 5: 4 } },
  // WILD is the fire — substitutes for all but the scatter and doubles per wild.
  // Uncapped per reel, so it can land 3 stacked in one column.
  wild:    { emoji: '🔥', name: 'WILD',    kind: 'wild', weight: 3, pay: {} },
  scatter: { emoji: '🏚️', name: 'BONUS',   kind: 'scatter', weight: 2, pay: {} },
  // GOLD appears only on the first and last reel; it carries a 1-9x win
  // multiplier and 3+ on the board trigger the wild bonus spins.
  gold:    { emoji: '🪙', name: 'GOLD',    kind: 'gold', weight: 4, pay: {} },
};

/* Which reels each symbol may appear on (0-indexed). Scatter only on the
 * three middle reels (1,2,3) per the rules. Wild not on reel 0 (common).
 * Gold only on the first and last reels. */
const MIDDLE_REELS = [1, 2, 3];
const GOLD_REELS = [0, 4];

/* Weighted gold multiplier value: 1, 1.5 or 2x (higher = rarer, max 2x). */
const GOLD_MULT_WEIGHTS = [
  [1, 60], [1.5, 28], [2, 12],
];
const GOLD_MAX_MULT = 2;
function randomGoldMult() {
  const total = GOLD_MULT_WEIGHTS.reduce((s, [, w]) => s + w, 0);
  let n = Math.random() * total;
  for (const [v, w] of GOLD_MULT_WEIGHTS) { if ((n -= w) < 0) return v; }
  return 1;
}
const GOLD_BONUS_SPINS = 5;   // free spins awarded by 3+ gold
const GOLD_TRIGGER = 3;       // gold symbols needed on the board

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
  5.00, 6.00, 7.00, 8.00, 9.00, 10.00,
  25.00, 50.00, 75.00, 100.00, 150.00, 200.00, 1000.00];
const LINES = PAYLINES.length; // 20
const START_CREDIT = 10.00;
const MAX_STICKY_RESPINS = 6;
const FREE_SPINS_AWARD = 10;   // 3 scatters award 10 free games

/* Payout balance (RTP). The paytable's natural return at scale 1.0 was
 * measured (~581%), so every win is scaled to hit the chosen target RTP.
 * Adjustable with a slider from 80% up to 120%. */
const BASE_RTP = 5.81;
const RTP_MIN = 80, RTP_MAX = 120, RTP_DEFAULT = 96;   // percent
function winScale() { return (state.rtp / 100) / BASE_RTP; }

/* ------------------------------- State ---------------------------------- */

const state = {
  credit: START_CREDIT,
  betIndex: 0,            // 0.10 total bet (minimum)
  grid: [],               // grid[col][row] = symbol id
  goldValues: {},         // 'c,r' -> gold multiplier value
  spinning: false,
  freeSpins: 0,
  inFreeGame: false,
  goldSpins: 0,           // remaining gold-bonus spins
  inGoldGame: false,
  auto: false,
  lastWin: 0,
  gambleAmount: 0,        // win currently available to gamble (double-or-nothing)
  rtp: RTP_DEFAULT,       // payout balance in percent (80-120)
};

const GAMBLE_MAX_ROUNDS = 5;   // safety cap on consecutive doublings
const GAMBLE_MAX_WIN = 5000;   // and on the amount

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
    if (def.kind === 'gold' && !GOLD_REELS.includes(col)) continue; // gold: ends only
    if (def.kind === 'wild' && col === 0) continue; // no wild on first reel
    let w = def.weight;
    if (def.kind === 'wild' && state.inGoldGame) w *= 4; // more wilds in gold bonus
    for (let i = 0; i < w; i++) pool.push(id);
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
    // Each freshly-landed gold gets a weighted 1-9 multiplier value.
    if (sym === 'gold') state.goldValues[col + ',' + r] = randomGoldMult();
    else delete state.goldValues[col + ',' + r];
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

/* Optional bitmap art. Drop PNG files into the images/ folder using these
 * exact base names and the game uses them instead of the built-in SVG.
 * If a file is missing, the SVG drawing stays as the fallback. */
const IMAGE_BASENAMES = {
  nine: '9', ten: '10', ace: 'A', jack: 'J', queen: 'Q', king: 'K',
  hunter: 'Hunter', wolf: 'Wolf', buffalo: 'Buffalo', eagle: 'Eagle',
  wild: 'Wild', scatter: 'Scatter', gold: 'Gold',
};
const symbolImage = {}; // id -> resolved image url (once found)

function probeImages() {
  const exts = ['png', 'PNG'];
  const jobs = Object.entries(IMAGE_BASENAMES).map(([id, base]) => {
    const names = [...new Set([base, base.toLowerCase()])];
    const candidates = [];
    for (const n of names) for (const e of exts) candidates.push(`images/${n}.${e}`);
    return new Promise((resolve) => {
      let i = 0;
      const next = () => {
        if (i >= candidates.length) return resolve(false);
        const url = candidates[i++];
        const img = new Image();
        img.onload = () => { symbolImage[id] = url; resolve(true); };
        img.onerror = next;
        img.src = url;
      };
      next();
    });
  });
  return Promise.all(jobs);
}

function artFor(id) {
  if (symbolImage[id]) {
    return `<img class="sym-img" src="${symbolImage[id]}" alt="${SYMBOLS[id].name}" draggable="false">`;
  }
  return ART[id] || `<div class="sym-fallback">${SYMBOLS[id].emoji}</div>`;
}

function renderCell(c, r) {
  const id = state.grid[c][r];
  const def = SYMBOLS[id];
  const cell = cellEls[c][r];
  let html = artFor(id);
  if (id === 'gold') {
    const v = state.goldValues[c + ',' + r] || 1;
    html += `<span class="gold-mult">${v}×</span>`;
  }
  cell.querySelector('.sym').innerHTML = html;
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
    // scatter and gold never take part in a line win
    if (SYMBOLS[s].kind === 'scatter' || SYMBOLS[s].kind === 'gold') break;
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

  // Win = paytable × total bet × wild multiplier, then scaled by the RTP
  // setting so the game balances to the chosen return.
  const multiplier = Math.pow(2, wilds);
  const win = round2(pay * totalBet() * multiplier * winScale());

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

  // Gold: only on the end reels. The applied multiplier is the highest gold
  // value on the board (max 2x), and it multiplies the whole win.
  let goldCount = 0;
  let goldMax = 1;
  const goldPositions = [];
  for (const c of GOLD_REELS) {
    for (let r = 0; r < ROWS; r++) {
      if (state.grid[c][r] === 'gold') {
        goldCount++;
        goldMax = Math.max(goldMax, state.goldValues[c + ',' + r] || 1);
        goldPositions.push(c + ',' + r);
      }
    }
  }
  const goldMultiplier = goldCount > 0 ? Math.min(GOLD_MAX_MULT, goldMax) : 1;

  // Apply the gold multiplier to the whole win (every winning line + total).
  if (goldMultiplier > 1 && lineWins.length) {
    totalWin = 0;
    for (const lw of lineWins) {
      lw.baseWin = lw.win;
      lw.win = round2(lw.win * goldMultiplier);
      totalWin += lw.win;
    }
    totalWin = round2(totalWin);
  }

  return {
    totalWin, lineWins, positions,
    scatterCount, scatterPositions,
    goldCount, goldMultiplier, goldPositions,
  };
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
  const goldTag = result.goldMultiplier > 1 ? `🪙×${result.goldMultiplier}  ` : '';
  if (wins.length > 1 || big || goldTag) {
    showWinPopup(`${goldTag}${big ? 'NAGY NYEREMÉNY!  ' : 'ÖSSZESEN  '}${fmt(state.lastWin)} €`);
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
  const gold = state.inGoldGame;
  const banner = state.inFreeGame || gold;
  $('#freeBanner').classList.toggle('hidden', !banner);
  $('#freeBanner').classList.toggle('gold', gold);
  const title = $('#freeBanner .fb-title');
  if (title) title.textContent = gold ? 'ARANY BÓNUSZ' : 'INGYENES JÁTÉKOK';
  $('#freeSpinsLeft').textContent = gold ? state.goldSpins : state.freeSpins;
}

function setControlsEnabled(enabled) {
  ['#betMinus', '#betPlus', '#maxBet'].forEach((s) => {
    $(s).disabled = !enabled || state.inFreeGame || state.inGoldGame;
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

  // Reveal the gold multiplier value with a short rolling animation.
  await revealGoldMultipliers(holdSet);
}

/* Roll the gold coins' multiplier numbers, then settle on the real value. */
async function revealGoldMultipliers(holdSet) {
  const cells = [];
  for (const c of GOLD_REELS) {
    for (let r = 0; r < ROWS; r++) {
      if (state.grid[c][r] === 'gold' && !(holdSet && holdSet.has(c + ',' + r))) {
        cells.push([c, r]);
      }
    }
  }
  if (!cells.length) return;
  const vals = ['1', '1.5', '2'];
  for (let f = 0; f < 9; f++) {
    for (const [c, r] of cells) {
      const el = cellEls[c][r].querySelector('.gold-mult');
      if (el) el.textContent = vals[Math.floor(Math.random() * vals.length)] + '×';
    }
    await sleep(75);
  }
  for (const [c, r] of cells) {
    const el = cellEls[c][r].querySelector('.gold-mult');
    if (el) {
      el.textContent = (state.goldValues[c + ',' + r] || 1) + '×';
      el.classList.remove('reveal');
      void el.offsetWidth;
      el.classList.add('reveal');
    }
  }
  await sleep(200);
}

/* ------------------------------ Game flow ------------------------------- */

async function doSpin() {
  if (state.spinning) return;
  if (!$('#gambleModal').classList.contains('hidden')) return; // busy gambling
  clearGamble();

  // A spin is free (no stake) during scatter free games or gold bonus spins.
  const goldSpinNow = state.inGoldGame;
  const freeMode = state.inFreeGame || state.inGoldGame;

  if (!freeMode) {
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
  $('#startBtn').textContent = freeMode ? '...' : 'STOP';
  $('#startBtn').classList.add('stop');

  if (state.inFreeGame) {
    await freeSpinRound();                 // scatter sticky respins
  } else {
    await animateSpin(null);               // base game or gold bonus spin
    const result = evaluateGrid();
    await settleResult(result, goldSpinNow);
  }

  if (goldSpinNow) state.goldSpins = Math.max(0, state.goldSpins - 1);

  state.spinning = false;
  $('#startBtn').textContent = 'START';
  $('#startBtn').classList.remove('stop');
  setControlsEnabled(true);
  updateMeters();

  // Continue free game / gold bonus / autoplay chains.
  if (state.inFreeGame && state.freeSpins > 0) {
    await sleep(700); doSpin();
  } else if (state.inFreeGame) {
    endFreeGame();
    if (state.auto) { await sleep(600); doSpin(); }
  } else if (state.inGoldGame && state.goldSpins > 0) {
    await sleep(650); doSpin();
  } else if (state.inGoldGame) {
    endGoldGame();
    if (state.auto) { await sleep(600); doSpin(); }
  } else if (state.auto) {
    if (state.credit >= totalBet()) { await sleep(600); doSpin(); }
    else toggleAuto(false);
  }
}

/* Settle a base-game or gold-bonus spin result. */
async function settleResult(result, isFree) {
  if (result.totalWin > 0) {
    await presentWins(result, { fast: state.auto || isFree });
    hideWinPopup();
  }

  if (!isFree) {
    // Base game: scatter takes priority, otherwise gold triggers its bonus.
    if (result.scatterCount >= 3) {
      await triggerFreeGames(result);
    } else if (result.goldCount >= GOLD_TRIGGER) {
      await triggerGoldGame(result);
    } else if (result.totalWin > 0 && !state.auto) {
      offerGamble(result.totalWin);        // base win -> offer double-or-nothing
    }
  } else if (state.inGoldGame && result.goldCount >= GOLD_TRIGGER) {
    await triggerGoldGame(result);         // retrigger more gold spins
  }
}

async function triggerGoldGame(result) {
  result.goldPositions.forEach((p) => {
    const [c, r] = p.split(',').map(Number);
    cellEls[c][r].classList.add('win-cell');
  });
  state.goldSpins += GOLD_BONUS_SPINS;
  state.inGoldGame = true;
  showWinPopup(`🪙 ${GOLD_BONUS_SPINS} WILD PÖRGETÉS!`);
  updateMeters();
  await sleep(1800);
  hideWinPopup();
}

function endGoldGame() {
  state.inGoldGame = false;
  state.goldSpins = 0;
  showWinPopup('ARANY BÓNUSZ VÉGE');
  updateMeters();
  setTimeout(hideWinPopup, 1500);
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

  // Gold sticks during the scatter free game (keeps its multiplier).
  let held = new Set([...result.positions, ...result.goldPositions]);
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
    next.goldPositions.forEach((p) => held.add(p)); // any new gold also sticks

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
  if (state.spinning || state.inFreeGame || state.inGoldGame) return;
  state.betIndex = Math.min(BET_STEPS.length - 1, Math.max(0, state.betIndex + dir));
  updateMeters();
}

function maxBet() {
  if (state.spinning || state.inFreeGame || state.inGoldGame) return;
  state.betIndex = BET_STEPS.length - 1;
  updateMeters();
  doSpin();
}

function toggleAuto(force) {
  state.auto = force === undefined ? !state.auto : force;
  $('#autoBtn').classList.toggle('active', state.auto);
  if (state.auto && !state.spinning && !state.inFreeGame && !state.inGoldGame) doSpin();
}

/* ------------------------------- RTP slider ----------------------------- */

function setRtp(percent) {
  const p = Math.round(Math.max(RTP_MIN, Math.min(RTP_MAX, percent)));
  state.rtp = p;
  const slider = $('#rtpSlider');
  if (slider) slider.value = p;
  const val = $('#rtpValue');
  if (val) val.textContent = p + '%';
  try { localStorage.setItem('hd_rtp', String(p)); } catch (e) { /* ignore */ }
}

function loadRtp() {
  try {
    const v = parseInt(localStorage.getItem('hd_rtp'), 10);
    if (v >= RTP_MIN && v <= RTP_MAX) return v;
  } catch (e) { /* ignore */ }
  return RTP_DEFAULT;
}

/* ------------------------------- Gamble --------------------------------- */
/* Double-or-nothing on the last base-game win: guess the card colour. */

let gambleRounds = 0;
let gambleBusy = false;

const CARD_RANKS = ['A', 'K', 'Q', 'J', '10', '9', '8', '7', '6', '5', '4', '3', '2'];
const CARD_SUITS = [
  { s: '♥', red: true }, { s: '♦', red: true },
  { s: '♠', red: false }, { s: '♣', red: false },
];

function offerGamble(amount) {
  if (amount <= 0 || state.inFreeGame || state.inGoldGame) { clearGamble(); return; }
  state.gambleAmount = round2(amount);
  $('#gambleAmt').textContent = fmt(state.gambleAmount);
  $('#gambleBtn').classList.remove('hidden');
}

function clearGamble() {
  state.gambleAmount = 0;
  $('#gambleBtn').classList.add('hidden');
  $('#gambleModal').classList.add('hidden');
}

function openGamble() {
  if (state.gambleAmount <= 0 || state.spinning || state.inFreeGame || state.inGoldGame) return;
  gambleRounds = 0;
  gambleBusy = false;
  updateGambleUI();
  const card = $('#gCard');
  card.className = 'gamble-card';
  card.innerHTML = '<span>?</span>';
  $('#gMsg').textContent = 'Válassz színt!';
  $('#gMsg').className = 'gamble-msg';
  setGambleChoicesEnabled(true);
  $('#gambleModal').classList.remove('hidden');
}

function updateGambleUI() {
  $('#gStake').textContent = fmt(state.gambleAmount);
  $('#gDouble').textContent = fmt(round2(state.gambleAmount * 2));
}

function setGambleChoicesEnabled(on) {
  $('#gRed').disabled = !on;
  $('#gBlack').disabled = !on;
  $('#gCollect').disabled = !on;
}

async function gambleChoose(guessRed) {
  if (gambleBusy || state.gambleAmount <= 0) return;
  gambleBusy = true;
  setGambleChoicesEnabled(false);

  const rank = CARD_RANKS[Math.floor(Math.random() * CARD_RANKS.length)];
  const suit = CARD_SUITS[Math.floor(Math.random() * CARD_SUITS.length)];
  const card = $('#gCard');
  card.className = 'gamble-card flip';
  card.innerHTML = '<span>?</span>';
  await sleep(160);
  card.innerHTML = `<span class="${suit.red ? 'red' : 'black'}">${rank} ${suit.s}</span>`;
  card.className = 'gamble-card ' + (suit.red ? 'is-red' : 'is-black');

  if (guessRed === suit.red) {
    state.credit = round2(state.credit + state.gambleAmount);   // double
    state.gambleAmount = round2(state.gambleAmount * 2);
    state.lastWin = state.gambleAmount;
    gambleRounds++;
    updateGambleUI();
    updateMeters();
    $('#gMsg').textContent = `NYERTÉL!  ${fmt(state.gambleAmount)} €`;
    $('#gMsg').className = 'gamble-msg win';
    await sleep(1100);
    if (gambleRounds >= GAMBLE_MAX_ROUNDS || state.gambleAmount >= GAMBLE_MAX_WIN) {
      $('#gMsg').textContent = 'Maximum elérve — jóváírva.';
      await sleep(1000);
      gambleCollect();
    } else {
      $('#gMsg').textContent = 'Mehet tovább, vagy elvisz?';
      $('#gMsg').className = 'gamble-msg';
      setGambleChoicesEnabled(true);
      gambleBusy = false;
    }
  } else {
    state.credit = round2(state.credit - state.gambleAmount);   // lose it
    state.gambleAmount = 0;
    state.lastWin = 0;
    updateMeters();
    $('#gMsg').textContent = 'VESZTETTÉL';
    $('#gMsg').className = 'gamble-msg lose';
    await sleep(1500);
    clearGamble();
  }
}

function gambleCollect() {
  clearGamble();   // amount already in credit
  updateMeters();
}

/* ------------------------------ Paytable UI ----------------------------- */

function buildPaytable() {
  const wrap = $('#paytableWrap');
  wrap.innerHTML = '';
  const order = ['hunter', 'wolf', 'buffalo', 'eagle', 'ace', 'king',
    'queen', 'jack', 'ten', 'nine', 'wild', 'scatter', 'gold'];
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
    } else if (def.kind === 'gold') {
      rows = '<div class="pt-row"><span>1 / 1.5 / 2× szorzó · 3× → 5 wild pörgetés</span></div>';
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

  // Load any bitmap art from images/, then re-render so it replaces the SVG.
  probeImages().then(() => { renderGrid(); buildPaytable(); });

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

  // RTP / payout balance slider.
  setRtp(loadRtp());
  $('#rtpSlider').addEventListener('input', (e) => setRtp(+e.target.value));

  // Gamble (double-or-nothing) wiring.
  $('#gambleBtn').addEventListener('click', openGamble);
  $('#gRed').addEventListener('click', () => gambleChoose(true));
  $('#gBlack').addEventListener('click', () => gambleChoose(false));
  $('#gCollect').addEventListener('click', () => { if (!gambleBusy) gambleCollect(); });
  $('#gambleModal').addEventListener('click', (e) => {
    if (e.target.id === 'gambleModal' && !gambleBusy) gambleCollect();
  });

  // Keyboard: space to spin
  document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
      e.preventDefault();
      if (!state.spinning && $('#gambleModal').classList.contains('hidden')) doSpin();
    }
  });
}

document.addEventListener('DOMContentLoaded', init);

/* Debug / test hook — lets the browser console (and automated tests) inspect
 * and drive the game state. Harmless in normal play. */
window.HD = { state, SYMBOLS, PAYLINES, evaluateGrid, lineBet, totalBet, renderGrid, showWinLines, presentWins, spinReelSymbols, offerGamble, openGamble, gambleChoose, gambleCollect, setRtp, winScale, BASE_RTP };
