/* =========================================================================
 * ADVENTURE SPINS — slot machine game
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
  // already from TWO of a kind. (Reel weights are on a x10 scale for fine
  // RTP control; wins pay per line.)
  hunter:  { emoji: '🏹', name: 'HUNTER',  kind: 'high', weight: 30,
             pay: { 2: 20, 3: 40, 4: 60, 5: 200 } },
  wolf:    { emoji: '🐺', name: 'WOLF',    kind: 'high', weight: 40,
             pay: { 2: 8, 3: 16, 4: 32, 5: 80 } },
  // Buffalo replaces the old bear + boar pair.
  buffalo: { emoji: '🦬', name: 'BUFFALO', kind: 'high', weight: 60,
             pay: { 3: 8, 4: 16, 5: 32 } },
  eagle:   { emoji: '🦅', name: 'EAGLE',   kind: 'high', weight: 60,
             pay: { 3: 4, 4: 8, 5: 24 } },
  ace:     { emoji: 'A',  name: 'A',       kind: 'card', weight: 80,
             pay: { 3: 2, 4: 6, 5: 16 } },
  king:    { emoji: 'K',  name: 'K',       kind: 'card', weight: 80,
             pay: { 3: 2, 4: 6, 5: 16 } },
  queen:   { emoji: 'Q',  name: 'Q',       kind: 'card', weight: 90,
             pay: { 3: 1, 4: 4, 5: 8 } },
  jack:    { emoji: 'J',  name: 'J',       kind: 'card', weight: 90,
             pay: { 3: 1, 4: 4, 5: 8 } },
  ten:     { emoji: '10', name: '10',      kind: 'card', weight: 100,
             pay: { 3: 1, 4: 2, 5: 4 } },
  nine:    { emoji: '9',  name: '9',       kind: 'card', weight: 100,
             pay: { 3: 1, 4: 2, 5: 4 } },
  // WILD is the fire — substitutes for all but the scatter and doubles per
  // wild. Its weight is the RTP lever, applied dynamically in reelSymbols.
  wild:    { emoji: '🔥', name: 'WILD',    kind: 'wild', weight: 0, pay: {} },
  scatter: { emoji: '🏚️', name: 'BONUS',   kind: 'scatter', weight: 20, pay: {} },
  // GOLD appears only on the first and last reel; it carries a 1-9x win
  // multiplier and 3+ on the board trigger the wild bonus spins.
  gold:    { emoji: '🪙', name: 'GOLD',    kind: 'gold', weight: 40, pay: {} },
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
const START_CREDIT = 100.00;   // ~50 spins at the 0.10 line bet (2.00 total)
const MAX_STICKY_RESPINS = 6;
const FREE_SPINS_AWARD = 10;   // 3 scatters award 10 free games

/* Payout balance (RTP). Wins pay exactly the paytable per line (like the
 * original machine); the return is controlled on the REELS by how often the
 * WILD symbol appears — a real, paying-helper symbol, not a filler. More
 * wild => more (and bigger) wins => higher RTP. WILD_TABLE[rtp-80] is the
 * wild weight (on the x10 reel scale) measured by Monte Carlo per target.
 * The base game uses the slider RTP (80-120%); the scatter free game runs
 * richer at BONUS_RTP, so the table is calibrated all the way up to 150%. */
const RTP_MIN = 80, RTP_MAX = 120, RTP_DEFAULT = 96;   // percent (base slider)
const BONUS_RTP = 150;   // scatter free games are more generous than the base game
// WILD is rare on the first two reels: reel 1 never has it, reel 2 gets only
// this fraction of the normal weight. (The RTP calibration accounts for this.)
const WILD_COL1_FACTOR = 0.5;
const WILD_TABLE = [
  114, 115, 116, 117, 118, 119, 121, 122, 123, 124, 125, 126, 127, 127, 128, 130, 131, 131, 132, 133, // 80-99%
  134, 135, 136, 137, 138, 139, 140, 141, 142, 143, 144, 144, 145, 146, 147, 148, 149, 150, 151, 152, // 100-119%
  153, 154, 154, 155, 156, 157, 158, 159, 159, 160, 161, 162, 163, 163, 164, 165, 166, 167, 167, 168, // 120-139%
  169, 170, 171, 172, 173, 173, 174, 175, 176, 177, 178,   // 140-150% (BONUS_RTP lookup)
];
let activeWild = null;   // wild weight snapshot for the current spin
function wildWeightFor(rtp) {
  const i = Math.max(0, Math.min(WILD_TABLE.length - 1, Math.round(rtp) - RTP_MIN));
  return WILD_TABLE[i];
}
/* Effective wild weight for the current mode: the base slider RTP normally,
 * the richer BONUS_RTP during the scatter free game, and an extra ×4 during
 * the signature "wild spins" gold bonus. */
function effectiveWildWeight() {
  if (state.inGoldGame) return wildWeightFor(state.rtp) * 4;
  if (state.inFreeGame) return wildWeightFor(BONUS_RTP);
  return wildWeightFor(state.rtp);
}
function wildWeight() { return activeWild != null ? activeWild : effectiveWildWeight(); }

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
  autoRemaining: 0,       // remaining autoplay spins (Infinity for endless)
  autoStopBonus: true,    // stop autoplay when a bonus triggers
  autoStopBig: false,     // stop autoplay on a big win
  lastWin: 0,
  turbo: false,           // lightning mode: fast spins, win counted in one go
  bonusWin: 0,            // running total accumulated during the current bonus session
  gambleAmount: 0,        // win currently available to gamble (double-or-nothing)
  gambleNet: 0,           // cumulative gamble result so far (won minus lost)
  gambleHistory: [],      // last 10 drawn cards (kept across sessions + reloads)
  rtp: RTP_DEFAULT,       // payout balance in percent (80-120)
  deposited: START_CREDIT,// total credits ever put in (initial + top-ups)
  withdrawn: 0,           // total credits ever taken out (cashed out)
  deposits: [],           // cash-flow log (+ deposits / − withdrawals) for the panel
};

const TOPUP_AMOUNT = 50;       // credit added by the top-up button
const WITHDRAW_AMOUNT = 50;    // credit removed by the withdraw (cash-out) button
const BUY_BONUS_COST = 50;     // free-spin bonus buy costs 50x total bet
const SFX = window.SFX || { play() {}, toggleMute() { return false; }, setMuted() {}, get muted() { return false; }, resume() {} };

const GAMBLE_MAX_ROUNDS = 5;   // safety cap on consecutive doublings
const GAMBLE_MAX_WIN = 5000;   // and on the amount

/* ------------------------------ Helpers --------------------------------- */

const $ = (sel) => document.querySelector(sel);
const fmt = (n) => n.toFixed(2);
/* The player sets and pays a single total bet (totalBet). Internally the
 * paytable pays per line, so lineBet = totalBet / 20 drives the win math —
 * but the UI only ever shows the total TÉT, like the original machine.
 * BET_STEPS holds the per-line values; the displayed/charged bet is ×20. */
const lineBet = () => BET_STEPS[state.betIndex];
const totalBet = () => round2(lineBet() * LINES);

function reelSymbols(col) {
  // Build the pool of symbols allowed on this reel.
  const pool = [];
  for (const [id, def] of Object.entries(SYMBOLS)) {
    if (def.kind === 'wild') continue; // wild is added below with the dynamic RTP weight
    if (def.kind === 'scatter' && !MIDDLE_REELS.includes(col)) continue;
    if (def.kind === 'gold' && !GOLD_REELS.includes(col)) continue; // gold: ends only
    // During the scatter free game there are no gold or scatter symbols
    // (no retrigger, no gold bonus) — only paying symbols and wild.
    if (state.inFreeGame && (def.kind === 'scatter' || def.kind === 'gold')) continue;
    for (let i = 0; i < def.weight; i++) pool.push(id);
  }
  // WILD frequency is the RTP lever — a real, paying-helper symbol, not a
  // filler. Never on reel 1; rare on reel 2 (WILD_COL1_FACTOR); normal on the
  // last three. The mode-specific weight (base / richer free game / ×4 gold
  // bonus) is resolved by effectiveWildWeight().
  if (col !== 0) {
    let ww = wildWeight();
    if (col === 1) ww = Math.round(ww * WILD_COL1_FACTOR);
    for (let i = 0; i < ww; i++) pool.push('wild');
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
  // The gold multiplier badge is NOT drawn here: a gold coin only shows a
  // number when it actually multiplies a win (revealed in revealGoldMultipliers).
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

  // Win = paytable × line bet × wild multiplier (like the original 20-line
  // machine). The paytable pays exactly its listed value; RTP is balanced on
  // the reels (WILD frequency), never by scaling the wins. Each WILD on the
  // line adds ×2 LINEARLY: 1→×2, 2→×4, 3→×6, 4→×8.
  const multiplier = wilds > 0 ? 2 * wilds : 1;
  const win = round2(pay * lineBet() * multiplier);

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
  totalWin = round2(totalWin);   // avoid float drift when summing many lines

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
 * amount, then a combined total. In `bonus` mode the wins are NOT credited
 * per spin — they accumulate into state.bonusWin (shown as the running total)
 * and are banked in one lump when the bonus ends. Base spins pay as they go. */
async function presentWins(result, { fast, bonus } = {}) {
  const wins = [...result.lineWins].sort((a, b) => b.win - a.win);
  if (!wins.length) return 0;

  // Lightning mode: count the whole win in one go — no per-line presentation.
  if (state.turbo) {
    const roundWin = wins.reduce((s, lw) => round2(s + lw.win), 0);
    if (bonus) {
      state.bonusWin = round2(state.bonusWin + roundWin);
      state.lastWin = state.bonusWin;
    } else {
      state.lastWin = roundWin;
      state.credit = round2(state.credit + roundWin);
    }
    clearWinVisuals();
    showWinLines(result);
    updateMeters();
    SFX.play('win');
    const goldTag = result.goldMultiplier > 1 ? `🪙×${result.goldMultiplier}  ` : '';
    showWinPopup(`${goldTag}${bonus ? 'BÓNUSZ  ' : ''}${fmt(bonus ? state.bonusWin : roundWin)} €`);
    await sleep(320);
    return roundWin;
  }

  const per = fast ? 600 : 900;
  if (!bonus) { state.lastWin = 0; updateMeters(); }

  let roundWin = 0;
  for (const lw of wins) {
    clearWinVisuals();
    drawLine(lw);
    roundWin = round2(roundWin + lw.win);
    if (bonus) {
      state.bonusWin = round2(state.bonusWin + lw.win);
      state.lastWin = state.bonusWin;                    // keep the running total on screen
    } else {
      state.lastWin = round2(state.lastWin + lw.win);
      state.credit = round2(state.credit + lw.win);      // base game pays line by line
    }
    updateMeters();
    SFX.play('win');
    const wildTag = lw.wilds > 0 ? `  🔥×${lw.multiplier}` : '';
    showWinPopup(`${SYMBOLS[lw.symbol].name} ${lw.count}×  ${fmt(lw.win)} €${wildTag}`);
    await sleep(per);
  }

  // Combined view + total.
  clearWinVisuals();
  showWinLines(result);
  const big = roundWin >= totalBet() * 15;
  const goldTag = result.goldMultiplier > 1 ? `🪙×${result.goldMultiplier}  ` : '';
  if (wins.length > 1 || big || goldTag) {
    const shown = bonus ? state.bonusWin : state.lastWin;
    const label = bonus ? 'BÓNUSZ ÖSSZ.  ' : (big ? 'NAGY NYEREMÉNY!  ' : 'ÖSSZESEN  ');
    showWinPopup(`${goldTag}${label}${fmt(shown)} €`);
    await sleep(fast ? 950 : 1400);
  }
  return roundWin;
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
  $('#betValue').textContent = fmt(totalBet());   // single TÉT = the amount actually staked
  $('#win').textContent = fmt(state.lastWin);
  const gold = state.inGoldGame;
  const banner = state.inFreeGame || gold;
  $('#freeBanner').classList.toggle('hidden', !banner);
  $('#freeBanner').classList.toggle('gold', gold);
  const title = $('#freeBanner .fb-title');
  if (title) title.textContent = gold ? 'ARANY BÓNUSZ' : 'INGYENES JÁTÉKOK';
  $('#freeSpinsLeft').textContent = gold ? state.goldSpins : state.freeSpins;
  const buyCost = $('#buyCost');
  if (buyCost) buyCost.textContent = fmt(buyBonusCost());
  updateHistoryPanel();
}

/* Net result (+/-): money still on the table + money cashed out − money put in.
 * This is the value the leaderboard ranks by. */
function currentNet() { return round2(state.credit + state.withdrawn - state.deposited); }

/* History panel: total deposited vs. current balance, and the running net
 * result (+/-) so the player can see how far up or down they are. */
function updateHistoryPanel() {
  const dep = round2(state.deposited);
  const bal = round2(state.credit);
  const net = currentNet();
  const setTxt = (sel, txt) => { const el = $(sel); if (el) el.textContent = txt; };
  setTxt('#hpDeposited', fmt(dep) + ' €');
  setTxt('#hpBalance', fmt(bal) + ' €');
  const n = $('#hpNet');
  if (n) {
    n.textContent = (net >= 0 ? '+' : '−') + fmt(Math.abs(net)) + ' €';
    n.classList.toggle('pos', net >= 0);
    n.classList.toggle('neg', net < 0);
  }
  const log = $('#hpLog');
  if (log) {
    log.innerHTML = state.deposits.slice(-6).reverse().map((e) => {
      const out = e.amount < 0;
      return `<span class="hp-log-item${out ? ' out' : ''}">${out ? '−' : '+'}${fmt(Math.abs(e.amount))} €</span>`;
    }).join('');
  }
}

function setControlsEnabled(enabled) {
  const busy = !enabled || state.inFreeGame || state.inGoldGame;
  ['#betMinus', '#betPlus', '#maxBet'].forEach((s) => { $(s).disabled = busy; });
  ['#buyBonusBtn', '#topupBtn', '#withdrawBtn', '#restartBtn'].forEach((s) => { const el = $(s); if (el) el.disabled = busy; });
}

/* ------------------------------ Leaderboard ----------------------------- */
/* A local high-score table (survives restarts), ranked by the net result. */

/* The leaderboard now starts EMPTY — only real, player-submitted scores ever
 * appear on it. These are the demo names that used to seed it; a one-time
 * migration strips them from any existing save so every player starts clean.
 * After that the board is never touched programmatically (restart keeps it). */
const LEGACY_SEED = [
  { name: 'VadászKirály', result: 1240 }, { name: 'TűzMester', result: 760 },
  { name: 'AranyÁsó', result: 430 }, { name: 'SzerencseLovag', result: 220 },
  { name: 'ErdeiFarkas', result: 90 }, { name: 'KezdőKaland', result: 20 },
];
let leaderboard = [];

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function loadBoard() {
  try {
    const b = JSON.parse(localStorage.getItem('hd_board'));
    if (Array.isArray(b)) leaderboard = b.filter((e) => e && typeof e.name === 'string' && typeof e.result === 'number');
  } catch (e) { /* ignore */ }
  // One-time cleanup: drop the old seeded demo entries so the board starts
  // empty. Runs once per browser; real player scores are always kept.
  try {
    if (!localStorage.getItem('hd_board_cleared')) {
      const isSeed = (e) => LEGACY_SEED.some((s) => s.name === e.name && s.result === e.result);
      leaderboard = leaderboard.filter((e) => !isSeed(e));
      localStorage.setItem('hd_board_cleared', '1');
      saveBoard();
    }
  } catch (e) { /* ignore */ }
}

function saveBoard() {
  try { localStorage.setItem('hd_board', JSON.stringify(leaderboard.slice(0, 50))); } catch (e) { /* ignore */ }
}

function renderBoard() {
  const list = $('#boardList');
  if (list) {
    const sorted = [...leaderboard].sort((a, b) => b.result - a.result).slice(0, 20);
    if (!sorted.length) {
      list.innerHTML = '<li class="board-empty">Még senki sincs a toplistán — légy te az első! 🏆</li>';
    } else
    list.innerHTML = sorted.map((e, i) => {
      const cls = e.result >= 0 ? 'pos' : 'neg';
      const rank = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : (i + 1) + '.';
      const sign = e.result >= 0 ? '+' : '−';
      return `<li class="board-row${e.you ? ' you' : ''}"><span class="br-rank">${rank}</span>`
        + `<span class="br-name">${escapeHtml(e.name)}</span>`
        + `<span class="br-res ${cls}">${sign}${fmt(Math.abs(e.result))} €</span></li>`;
    }).join('');
  }
  const yr = $('#boardYour');
  if (yr) {
    const n = currentNet();
    yr.textContent = (n >= 0 ? '+' : '−') + fmt(Math.abs(n)) + ' €';
    yr.classList.toggle('pos', n >= 0);
    yr.classList.toggle('neg', n < 0);
  }
}

function openBoard() {
  renderBoard();
  const msg = $('#boardMsg'); if (msg) msg.textContent = '';
  $('#boardModal').classList.remove('hidden');
}

function submitScore() {
  const input = $('#boardName');
  const name = (input && input.value || '').trim().slice(0, 14);
  const msg = $('#boardMsg');
  if (!name) { if (msg) msg.textContent = 'Adj meg egy nevet!'; return; }
  leaderboard.forEach((e) => { delete e.you; });
  leaderboard.push({ name, result: currentNet(), you: true });
  leaderboard.sort((a, b) => b.result - a.result);
  leaderboard = leaderboard.slice(0, 50);
  saveBoard();
  const rank = leaderboard.findIndex((e) => e.you) + 1;
  if (msg) msg.textContent = `Felkerültél a toplistára — ${rank}. hely!`;
  SFX.play('coin');
  renderBoard();
}

/* ------------------------------- Restart -------------------------------- */

function restartGame() {
  if (state.spinning || state.inFreeGame || state.inGoldGame) return;
  stopAutoplay();
  clearGamble();
  state.credit = START_CREDIT;
  state.deposited = START_CREDIT;
  state.withdrawn = 0;
  state.deposits = [{ amount: START_CREDIT }];
  state.gambleNet = 0;
  state.gambleHistory = [];
  state.betIndex = 0;
  state.lastWin = 0;
  state.bonusWin = 0;
  saveGame();
  updateMeters();
  SFX.play('click');
  showWinPopup('ÚJRAINDÍTVA');
  setTimeout(hideWinPopup, 1200);
}

/* --------------------------- Gamble odds -------------------------------- */
/* Empirical chances from the last (up to) 10 drawn gamble cards. */

function renderGambleOdds() {
  const el = $('#gOdds');
  if (!el) return;
  const h = state.gambleHistory.slice(0, 10);
  const n = h.length;
  if (!n) { el.innerHTML = '<span class="go-empty">Esélyek: húzz lapokat a statisztikához</span>'; return; }
  const red = h.filter((c) => c.red).length;
  const black = n - red;
  const suits = { '♥': 0, '♦': 0, '♠': 0, '♣': 0 };
  h.forEach((c) => { if (suits[c.s] != null) suits[c.s]++; });
  const pct = (x) => Math.round((x / n) * 100);
  el.innerHTML = `<div class="go-title">Esélyek az utolsó ${n} lap alapján</div>`
    + `<div class="go-bars"><span class="go-red">🔴 ${pct(red)}% <i>(${red})</i></span>`
    + `<span class="go-black">⚫ ${pct(black)}% <i>(${black})</i></span></div>`
    + `<div class="go-suits">`
    + Object.entries(suits).map(([s, c]) => `<span class="go-suit ${'♥♦'.includes(s) ? 'red' : 'black'}">${s} ${pct(c)}%</span>`).join('')
    + `</div>`;
}

/* ------------------------------ Persistence ----------------------------- */

function saveGame() {
  try {
    localStorage.setItem('hd_save', JSON.stringify({
      credit: state.credit, betIndex: state.betIndex,
      deposited: state.deposited, withdrawn: state.withdrawn,
      deposits: state.deposits.slice(-40), gambleNet: state.gambleNet,
      gambleHistory: state.gambleHistory.slice(0, 10),
    }));
  } catch (e) { /* ignore */ }
}

function loadGame() {
  try {
    const s = JSON.parse(localStorage.getItem('hd_save'));
    if (s) {
      if (typeof s.credit === 'number' && s.credit >= 0) state.credit = round2(s.credit);
      if (Number.isInteger(s.betIndex) && s.betIndex >= 0 && s.betIndex < BET_STEPS.length) {
        state.betIndex = s.betIndex;
      }
      if (typeof s.deposited === 'number' && s.deposited >= 0) state.deposited = round2(s.deposited);
      if (typeof s.withdrawn === 'number' && s.withdrawn >= 0) state.withdrawn = round2(s.withdrawn);
      if (Array.isArray(s.deposits)) {
        state.deposits = s.deposits.filter((d) => d && typeof d.amount === 'number').slice(-40);
      }
      if (typeof s.gambleNet === 'number') state.gambleNet = round2(s.gambleNet);
      if (Array.isArray(s.gambleHistory)) {
        state.gambleHistory = s.gambleHistory
          .filter((c) => c && typeof c.rank === 'string' && typeof c.s === 'string')
          .slice(0, 10);
      }
    }
  } catch (e) { /* ignore */ }
}

/* ------------------------- Top-up & bonus buy --------------------------- */

function topUp() {
  if (state.spinning || state.inFreeGame || state.inGoldGame) return;
  state.credit = round2(state.credit + TOPUP_AMOUNT);
  state.deposited = round2(state.deposited + TOPUP_AMOUNT);
  logCashFlow(TOPUP_AMOUNT);
  SFX.play('coin');
  updateMeters();
  saveGame();
}

/* Cash out: take a fixed amount off the balance. Counts as withdrawn money,
 * so the net +/- result is unchanged (realized profit, not a loss). */
function withdraw() {
  if (state.spinning || state.inFreeGame || state.inGoldGame) return;
  if (state.credit < WITHDRAW_AMOUNT) {
    showWinPopup('NINCS ELÉG KREDIT');
    SFX.play('gambleLose');
    setTimeout(hideWinPopup, 1000);
    return;
  }
  state.credit = round2(state.credit - WITHDRAW_AMOUNT);
  state.withdrawn = round2(state.withdrawn + WITHDRAW_AMOUNT);
  logCashFlow(-WITHDRAW_AMOUNT);
  SFX.play('click');
  updateMeters();
  saveGame();
}

function logCashFlow(amount) {
  state.deposits.push({ amount });
  if (state.deposits.length > 40) state.deposits = state.deposits.slice(-40);
}

function buyBonusCost() { return round2(totalBet() * BUY_BONUS_COST); }

async function buyBonus() {
  if (state.spinning || state.inFreeGame || state.inGoldGame || state.auto) return;
  const cost = buyBonusCost();
  if (state.credit < cost) {
    showWinPopup('NINCS ELÉG KREDIT');
    SFX.play('gambleLose');
    await sleep(1200);
    hideWinPopup();
    return;
  }
  clearGamble();
  state.credit = round2(state.credit - cost);
  SFX.play('click');
  updateMeters();
  saveGame();
  state.bonusWin = 0;              // fresh bonus accumulator
  state.inFreeGame = true;
  state.freeSpins = FREE_SPINS_AWARD;
  SFX.play('freespins');
  showWinPopup(`🏚️ ${FREE_SPINS_AWARD} INGYENES JÁTÉK!`);
  updateMeters();
  await sleep(1600);
  hideWinPopup();
  doSpin();
}

/* ------------------------------ Autoplay -------------------------------- */

function openAutoModal() {
  if (state.spinning || state.inFreeGame || state.inGoldGame) return;
  $('#autoModal').classList.remove('hidden');
}

function startAutoplay(count) {
  state.autoRemaining = count === 0 ? Infinity : count;
  state.auto = true;
  state.autoStopBonus = $('#autoStopBonus').checked;
  state.autoStopBig = $('#autoStopBig').checked;
  $('#autoBtn').classList.add('active');
  $('#autoModal').classList.add('hidden');
  if (!state.spinning && !state.inFreeGame && !state.inGoldGame) doSpin();
}

let autoTimer = null;

function stopAutoplay() {
  state.auto = false;
  state.autoRemaining = 0;
  if (autoTimer) { clearTimeout(autoTimer); autoTimer = null; }
  $('#autoBtn').classList.remove('active');
}

/* Decide whether another autoplay spin should run, and schedule it. */
function scheduleNext() {
  if (state.spinning || state.inFreeGame || state.inGoldGame) return;
  if (!state.auto) return;
  if (state.autoRemaining <= 0 || state.credit < totalBet()) { stopAutoplay(); return; }
  if (autoTimer) clearTimeout(autoTimer);
  autoTimer = setTimeout(() => {
    autoTimer = null;
    // Re-check every condition at fire time (autoplay may have been stopped).
    if (state.auto && !state.spinning && !state.inFreeGame && !state.inGoldGame
        && state.autoRemaining > 0 && state.credit >= totalBet()) {
      doSpin();
    }
  }, state.turbo ? 120 : 500);
}

/* ------------------------------ Win juice ------------------------------- */

const fxCanvas = $('#fxCanvas');
const fxCtx = fxCanvas ? fxCanvas.getContext('2d') : null;
let fxParticles = [];
let fxRunning = false;

function fxResize() {
  if (!fxCanvas) return;
  const r = fxCanvas.getBoundingClientRect();
  fxCanvas.width = r.width;
  fxCanvas.height = r.height;
}

function fxTick() {
  if (!fxCtx) return;
  fxCtx.clearRect(0, 0, fxCanvas.width, fxCanvas.height);
  fxParticles = fxParticles.filter((p) => p.life > 0);
  for (const p of fxParticles) {
    p.vy += 0.35;              // gravity
    p.x += p.vx; p.y += p.vy;
    p.rot += p.vr; p.life--;
    fxCtx.save();
    fxCtx.translate(p.x, p.y);
    fxCtx.rotate(p.rot);
    fxCtx.globalAlpha = Math.max(0, Math.min(1, p.life / 24));
    fxCtx.beginPath();
    fxCtx.ellipse(0, 0, p.r, p.r * 0.7, 0, 0, Math.PI * 2);
    fxCtx.fillStyle = p.color;
    fxCtx.fill();
    fxCtx.strokeStyle = 'rgba(120,80,0,0.6)';
    fxCtx.lineWidth = 1.5;
    fxCtx.stroke();
    fxCtx.restore();
  }
  if (fxParticles.length > 0) requestAnimationFrame(fxTick);
  else fxRunning = false;
}

function burstCoins(count) {
  if (!fxCtx) return;
  fxResize();
  const cx = fxCanvas.width / 2;
  const top = fxCanvas.height * 0.28;
  const colors = ['#ffd23b', '#ffe488', '#f5b420', '#fff2b0'];
  for (let i = 0; i < count; i++) {
    fxParticles.push({
      x: cx + (Math.random() - 0.5) * fxCanvas.width * 0.5,
      y: top + (Math.random() - 0.5) * 40,
      vx: (Math.random() - 0.5) * 9,
      vy: -6 - Math.random() * 7,
      r: 5 + Math.random() * 5,
      rot: Math.random() * Math.PI,
      vr: (Math.random() - 0.5) * 0.4,
      life: 60 + Math.random() * 30,
      color: colors[Math.floor(Math.random() * colors.length)],
    });
  }
  if (!fxRunning) { fxRunning = true; requestAnimationFrame(fxTick); }
}

/* Escalating big-win banner with a counting-up amount. */
function winTier(win) {
  const bet = totalBet();
  if (win >= bet * 100) return { title: 'EPIKUS NYEREMÉNY', coins: 90, sound: 'megawin' };
  if (win >= bet * 50) return { title: 'MEGA NYEREMÉNY', coins: 60, sound: 'megawin' };
  if (win >= bet * 20) return { title: 'NAGY NYEREMÉNY', coins: 40, sound: 'bigwin' };
  return null;
}

async function bigWinCelebration(win) {
  const tier = winTier(win);
  if (!tier) return;
  SFX.play(tier.sound);
  burstCoins(tier.coins);
  const banner = $('#bigWinBanner');
  $('#bwTitle').textContent = tier.title;
  banner.classList.remove('hidden');
  banner.style.animation = 'none'; void banner.offsetWidth; banner.style.animation = '';

  // count the amount up
  const dur = 1100;
  const start = performance.now ? performance.now() : Date.now();
  await new Promise((resolve) => {
    function step() {
      const now = (performance.now ? performance.now() : Date.now());
      const t = Math.min(1, (now - start) / dur);
      const val = win * (1 - Math.pow(1 - t, 3));
      $('#bwAmount').textContent = fmt(round2(val)) + ' €';
      if (Math.random() < 0.4) SFX.play('coin');
      if (t < 1) requestAnimationFrame(step); else resolve();
    }
    requestAnimationFrame(step);
  });
  $('#bwAmount').textContent = fmt(win) + ' €';
  await sleep(900);
  banner.classList.add('hidden');
}

/* --------------------------- Spin animation ----------------------------- */

function sleep(ms) { return new Promise((res) => setTimeout(res, ms)); }

async function animateSpin(holdSet) {
  // holdSet: Set of 'c,r' positions to keep sticky (free game respins)
  const turbo = state.turbo;
  const spinFrames = turbo ? 3 : 12;
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
    await sleep(turbo ? 16 : 45);
  }

  // Stop each reel with a short stagger and a landing bounce.
  for (let c = 0; c < COLS; c++) {
    // Scatter anticipation: if reels 1 & 2 already show 2 scatters, the last
    // scatter reel (3) teases a slower, highlighted stop. (Skipped in turbo.)
    if (c === 3 && !turbo) {
      let sc = 0;
      for (const mc of [1, 2]) for (let r = 0; r < ROWS; r++) if (state.grid[mc][r] === 'scatter') sc++;
      if (sc === 2) {
        SFX.play('anticipation');
        for (let r = 0; r < ROWS; r++) cellEls[c][r].classList.add('anticipate');
        for (let f = 0; f < 10; f++) {
          for (let r = 0; r < ROWS; r++) {
            if (holdSet && holdSet.has(c + ',' + r)) continue;
            cellEls[c][r].querySelector('.sym').innerHTML = artFor(randomSymbol(c));
          }
          await sleep(80);
        }
        for (let r = 0; r < ROWS; r++) cellEls[c][r].classList.remove('anticipate');
      }
    }

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
    SFX.play('reelStop');
    await sleep(turbo ? 30 : 150); // stagger reel stop
  }

  // Gold multipliers are revealed later, only if the spin actually wins (#8).
}

/* Ensure a gold cell has its multiplier badge element (created on demand so
 * the coin shows no number until it multiplies a win). */
function goldBadge(c, r) {
  const sym = cellEls[c][r].querySelector('.sym');
  let el = sym.querySelector('.gold-mult');
  if (!el) { el = document.createElement('span'); el.className = 'gold-mult'; sym.appendChild(el); }
  return el;
}

/* Roll every board gold coin's multiplier number, then settle on the real
 * value. Called only when there is a line win to multiply, so a gold coin
 * never shows a number on a losing spin. */
async function revealGoldMultipliers() {
  const cells = [];
  for (const c of GOLD_REELS)
    for (let r = 0; r < ROWS; r++)
      if (state.grid[c][r] === 'gold') cells.push([c, r]);
  if (!cells.length) return;
  const vals = ['1', '1.5', '2'];
  const rolls = state.turbo ? 0 : 9;   // no rolling animation in lightning mode
  for (let f = 0; f < rolls; f++) {
    for (const [c, r] of cells) goldBadge(c, r).textContent = vals[Math.floor(Math.random() * vals.length)] + '×';
    SFX.play('goldRoll');
    await sleep(75);
  }
  for (const [c, r] of cells) {
    const el = goldBadge(c, r);
    el.textContent = (state.goldValues[c + ',' + r] || 1) + '×';
    el.classList.remove('reveal');
    void el.offsetWidth;
    el.classList.add('reveal');
  }
  SFX.play('gold');
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
  // Whether this spin was auto-initiated. Captured up front so the gamble is
  // never offered on an autoplay spin, even if autoplay is stopped mid-flight.
  const wasAuto = state.auto;

  if (!freeMode) {
    if (state.credit < totalBet()) {
      showWinPopup('NINCS ELÉG KREDIT');
      await sleep(1200);
      hideWinPopup();
      return;
    }
    state.credit = round2(state.credit - totalBet());
  }

  state.spinning = true;
  // During a bonus keep the accumulated total on screen; base spins reset.
  state.lastWin = freeMode ? state.bonusWin : 0;
  // Snapshot the mode-aware reel WILD weight so a mid-spin RTP slider change
  // never affects the symbols still landing on the in-flight spin.
  activeWild = effectiveWildWeight();
  clearWinVisuals();
  hideWinPopup();
  updateMeters();
  setControlsEnabled(false);
  $('#startBtn').textContent = freeMode ? '...' : 'STOP';
  $('#startBtn').classList.add('stop');
  SFX.play('spin');

  let ok = false;
  try {
    if (state.inFreeGame) {
      await freeSpinRound();                 // scatter sticky respins
    } else {
      await animateSpin(null);               // base game or gold bonus spin
      const result = evaluateGrid();
      // If autoplay is set to stop on a big win and this spin is one, stop it
      // now and let the gamble be offered on this final (stopping) spin.
      const bigStop = !goldSpinNow && state.auto && state.autoStopBig
        && result.totalWin >= totalBet() * 20;
      if (bigStop) stopAutoplay();
      await settleResult(result, goldSpinNow, wasAuto && !bigStop);
    }

    if (goldSpinNow) state.goldSpins = Math.max(0, state.goldSpins - 1);

    // A base-game autoplay spin consumes one of the remaining count.
    if (!freeMode && state.auto && Number.isFinite(state.autoRemaining)) {
      state.autoRemaining = Math.max(0, state.autoRemaining - 1);
    }
    // Stop autoplay on a big base-game win if requested (already handled above
    // when a gamble was offered; this covers any remaining case defensively).
    if (!freeMode && state.auto && state.autoStopBig && state.lastWin >= totalBet() * 20) {
      stopAutoplay();
    }
    ok = true;
  } catch (err) {
    console.error('spin error', err);       // never leave the game frozen
    stopAutoplay();
  } finally {
    activeWild = null;
    state.spinning = false;
    $('#startBtn').textContent = 'START';
    $('#startBtn').classList.remove('stop');
    setControlsEnabled(true);
    updateMeters();
    saveGame();
  }
  if (!ok) return;

  // Continue free game / gold bonus / autoplay chains.
  if (state.inFreeGame && state.freeSpins > 0) {
    await sleep(state.turbo ? 160 : 700); doSpin();
  } else if (state.inFreeGame) {
    endFreeGame();
    await sleep(state.turbo ? 200 : 500); scheduleNext();
  } else if (state.inGoldGame && state.goldSpins > 0) {
    await sleep(state.turbo ? 160 : 650); doSpin();
  } else if (state.inGoldGame) {
    endGoldGame();
    await sleep(state.turbo ? 200 : 500); scheduleNext();
  } else {
    scheduleNext();
  }
}

/* Settle a base-game or gold-bonus spin result. */
async function settleResult(result, isFree, wasAuto) {
  if (result.totalWin > 0) {
    if (result.goldCount > 0) await revealGoldMultipliers();  // #8: reveal only on a win
    await presentWins(result, { fast: state.auto || isFree, bonus: isFree });
    if (!isFree) await bigWinCelebration(result.totalWin);
    hideWinPopup();
  }

  if (!isFree) {
    // Base game: scatter takes priority, otherwise gold triggers its bonus.
    if (result.scatterCount >= 3) {
      if (state.auto && state.autoStopBonus) stopAutoplay();
      await triggerFreeGames(result);
    } else if (result.goldCount >= GOLD_TRIGGER) {
      if (state.auto && state.autoStopBonus) stopAutoplay();
      await triggerGoldGame(result);
    } else if (result.totalWin > 0 && !wasAuto) {
      offerGamble(result.totalWin);        // base win -> gamble (never on an autoplay spin)
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
  if (!state.inGoldGame) state.bonusWin = 0;   // start a fresh bonus accumulator
  state.goldSpins += GOLD_BONUS_SPINS;
  state.inGoldGame = true;
  SFX.play('freespins');
  showWinPopup(`🪙 ${GOLD_BONUS_SPINS} WILD PÖRGETÉS!`);
  updateMeters();
  await sleep(1800);
  hideWinPopup();
}

function endGoldGame() {
  state.inGoldGame = false;
  state.goldSpins = 0;
  finishBonus('ARANY BÓNUSZ VÉGE');
}

/* Close out a bonus session: bank the whole accumulated total at once, show
 * it, and offer to gamble it (unless autoplay is still running). */
function finishBonus(label) {
  const total = round2(state.bonusWin);
  state.bonusWin = 0;
  if (total > 0) {
    state.credit = round2(state.credit + total);   // pay the bonus in one lump at the end
    state.lastWin = total;
  }
  updateMeters();
  saveGame();
  if (total > 0) {
    showWinPopup(`${label} — ${fmt(total)} €`);
    if (!state.auto) offerGamble(total);            // scatter/gold total is gambleable (#2)
  } else {
    showWinPopup(label);
  }
  setTimeout(hideWinPopup, 1800);
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
  if (first) state.bonusWin = 0;               // start a fresh bonus accumulator
  state.freeSpins += FREE_SPINS_AWARD;
  SFX.play('freespins');
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
  finishBonus('INGYENES JÁTÉKOK VÉGE');
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
  await sleep(state.turbo ? 200 : 800);

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
    await sleep(state.turbo ? 150 : 500);

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
      await sleep(state.turbo ? 200 : 800);
    } else {
      // no higher win -> stop respinning
      break;
    }
  }

  clearStickies();

  // Accumulate the best win of this free spin (banked in one lump at the end).
  if (bestWin > 0) {
    // Restore the best grid so the highlighted cells match the payout.
    state.grid = bestGrid;
    renderGrid();
    if (result.goldCount > 0) await revealGoldMultipliers();  // #8: reveal only on a win
    await presentWins(result, { fast: true, bonus: true });
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
  SFX.play('click');
  updateMeters();
  saveGame();
}

function maxBet() {
  if (state.spinning || state.inFreeGame || state.inGoldGame || state.auto) return;
  state.betIndex = BET_STEPS.length - 1;
  updateMeters();
  saveGame();
  doSpin();
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

/* ------------------------- Landscape layout ----------------------------- */
/* In phone landscape the game and the controls sit side by side. The choice
 * (game left / game right / off) is a saved setting. */

function applyLayout(v) {
  const val = ['left', 'right', 'off'].includes(v) ? v : 'left';
  document.body.classList.remove('ls-left', 'ls-right', 'ls-off');
  document.body.classList.add('ls-' + val);
  document.querySelectorAll('#layoutOpts .layout-opt').forEach((b) => b.classList.toggle('sel', b.dataset.layout === val));
  try { localStorage.setItem('hd_layout', val); } catch (e) { /* ignore */ }
  fxResize();   // the fx canvas may have changed size
}

function loadLayout() {
  try { const v = localStorage.getItem('hd_layout'); if (['left', 'right', 'off'].includes(v)) return v; } catch (e) { /* ignore */ }
  return 'left';
}

/* ------------------------------- Gamble --------------------------------- */
/* Double-or-nothing on the last base-game win: guess the card colour. */

let gambleRounds = 0;
let gambleBusy = false;   // gamble history persists in state.gambleHistory (last 10)

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
  renderGambleHistory();   // keep the previous cards; the last 10 stay visible
  renderGambleOdds();      // chances from the last 10 cards
  updateGambleUI();
  const card = $('#gCard');
  card.className = 'gamble-card';
  card.innerHTML = '<span>?</span>';
  $('#gMsg').textContent = 'Tippelj: szín ×2, szimbólum ×4 vagy lap ×13';
  $('#gMsg').className = 'gamble-msg';
  setGambleChoicesEnabled(true);
  $('#gambleModal').classList.remove('hidden');
}

function updateGambleUI() {
  $('#gStake').textContent = fmt(state.gambleAmount);
  const w2 = $('#gWin2'), w4 = $('#gWin4'), w13 = $('#gWin13');
  if (w2) w2.textContent = fmt(round2(state.gambleAmount * 2));
  if (w4) w4.textContent = fmt(round2(state.gambleAmount * 4));
  if (w13) w13.textContent = fmt(round2(state.gambleAmount * 13));
  const net = $('#gNet');
  if (net) {
    const v = round2(state.gambleNet);
    net.textContent = (v >= 0 ? '+' : '−') + fmt(Math.abs(v)) + ' €';
    net.classList.toggle('pos', v >= 0);
    net.classList.toggle('neg', v < 0);
  }
}

function setGambleChoicesEnabled(on) {
  $('#gRed').disabled = !on;
  $('#gBlack').disabled = !on;
  document.querySelectorAll('#gambleModal .g-suit, #gambleModal .g-rank').forEach((b) => { b.disabled = !on; });
  $('#gCollect').disabled = !on;
}

/* Render the ladder of previously drawn cards (most recent first). */
function renderGambleHistory() {
  const wrap = $('#gHistory');
  if (!wrap) return;
  if (!state.gambleHistory.length) { wrap.innerHTML = '<span class="gh-empty">Előzmények</span>'; return; }
  wrap.innerHTML = state.gambleHistory
    .map((c) => `<span class="gh-card ${c.red ? 'red' : 'black'}">${c.rank}<i>${c.s}</i></span>`)
    .join('');
}

/* Resolve one gamble. `choice` is { mult, test, label }: colour guesses pay ×2
 * (match red/black), exact-suit guesses pay ×4 (match the suit), and exact-rank
 * guesses pay ×13 (match the card rank) — each multiplier is proportional to
 * its odds. test receives (suit, rank). Cumulative +/- is tracked in gambleNet. */
async function gambleGuess(choice) {
  if (gambleBusy || state.gambleAmount <= 0) return;
  gambleBusy = true;
  setGambleChoicesEnabled(false);

  const rank = CARD_RANKS[Math.floor(Math.random() * CARD_RANKS.length)];
  const suit = CARD_SUITS[Math.floor(Math.random() * CARD_SUITS.length)];
  const card = $('#gCard');
  card.className = 'gamble-card flip';
  card.innerHTML = '<span>?</span>';
  SFX.play('cardFlip');
  await sleep(160);
  card.innerHTML = `<span class="${suit.red ? 'red' : 'black'}">${rank} ${suit.s}</span>`;
  card.className = 'gamble-card ' + (suit.red ? 'is-red' : 'is-black');

  // Record the draw in the history ladder (most recent first, keep last 10).
  state.gambleHistory.unshift({ rank, s: suit.s, red: suit.red });
  if (state.gambleHistory.length > 10) state.gambleHistory.pop();
  renderGambleHistory();
  renderGambleOdds();
  saveGame();

  const staked = state.gambleAmount;
  if (choice.test(suit, rank)) {
    const gain = round2(staked * (choice.mult - 1));
    state.credit = round2(state.credit + gain);            // top up to the multiplied amount
    state.gambleAmount = round2(staked * choice.mult);
    state.lastWin = state.gambleAmount;
    state.gambleNet = round2(state.gambleNet + gain);      // +/- statistics
    gambleRounds++;
    updateGambleUI();
    updateMeters();
    SFX.play('gambleWin');
    $('#gMsg').textContent = `NYERTÉL! ×${choice.mult} → ${fmt(state.gambleAmount)} €`;
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
    state.credit = round2(state.credit - staked);          // lose the staked win
    state.gambleAmount = 0;
    state.lastWin = 0;
    state.gambleNet = round2(state.gambleNet - staked);    // +/- statistics
    updateGambleUI();
    updateMeters();
    saveGame();
    SFX.play('gambleLose');
    $('#gMsg').textContent = 'VESZTETTÉL';
    $('#gMsg').className = 'gamble-msg lose';
    await sleep(1500);
    clearGamble();
  }
  saveGame();
}

function gambleCollect() {
  clearGamble();   // amount already in credit
  updateMeters();
  saveGame();
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
        if (def.pay[n]) rows += `<div class="pt-row"><span>${n}×</span><span>${def.pay[n]}×</span></div>`;
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
  loadGame();          // restore saved credit / bet
  loadBoard();         // restore the leaderboard
  if (!state.deposits.length) state.deposits.push({ amount: state.deposited });  // seed the log
  buildBoard();
  buildPaytable();
  updateMeters();

  // Load any bitmap art from images/, then re-render so it replaces the SVG.
  probeImages().then(() => { renderGrid(); buildPaytable(); });

  $('#startBtn').addEventListener('click', () => {
    SFX.resume();
    if (state.auto) { stopAutoplay(); return; }
    if (state.inFreeGame || state.inGoldGame) return;  // bonus drives itself
    doSpin();
  });
  $('#betMinus').addEventListener('click', () => changeBet(-1));
  $('#betPlus').addEventListener('click', () => changeBet(1));
  $('#maxBet').addEventListener('click', maxBet);
  $('#autoBtn').addEventListener('click', () => {
    SFX.resume();
    if (state.auto) stopAutoplay(); else openAutoModal();
  });

  $('#rulesBtn').addEventListener('click', () => $('#rulesModal').classList.remove('hidden'));
  $('#rulesClose').addEventListener('click', () => $('#rulesModal').classList.add('hidden'));
  $('#rulesModal').addEventListener('click', (e) => {
    if (e.target.id === 'rulesModal') $('#rulesModal').classList.add('hidden');
  });

  // Leaderboard (toplista).
  $('#boardBtn').addEventListener('click', () => { SFX.resume(); openBoard(); });
  $('#boardOpenBtn').addEventListener('click', () => { SFX.resume(); openBoard(); });
  $('#boardClose').addEventListener('click', () => $('#boardModal').classList.add('hidden'));
  $('#boardModal').addEventListener('click', (e) => { if (e.target.id === 'boardModal') $('#boardModal').classList.add('hidden'); });
  $('#boardSubmit').addEventListener('click', () => { SFX.resume(); submitScore(); });
  $('#boardName').addEventListener('keydown', (e) => { if (e.key === 'Enter') submitScore(); });

  // Restart (újraindítás) with a confirm modal.
  $('#restartBtn').addEventListener('click', () => {
    if (state.spinning || state.inFreeGame || state.inGoldGame) return;
    SFX.resume();
    $('#resetModal').classList.remove('hidden');
  });
  $('#resetCancel').addEventListener('click', () => $('#resetModal').classList.add('hidden'));
  $('#resetModal').addEventListener('click', (e) => { if (e.target.id === 'resetModal') $('#resetModal').classList.add('hidden'); });
  $('#resetConfirm').addEventListener('click', () => { $('#resetModal').classList.add('hidden'); restartGame(); });

  // RTP / payout balance slider.
  setRtp(loadRtp());
  $('#rtpSlider').addEventListener('input', (e) => setRtp(+e.target.value));

  // Landscape layout setting (game left / right / off).
  applyLayout(loadLayout());
  document.querySelectorAll('#layoutOpts .layout-opt').forEach((b) => {
    b.addEventListener('click', () => { SFX.resume(); applyLayout(b.dataset.layout); });
  });

  // Sound mute toggle.
  const savedMute = (() => { try { return localStorage.getItem('hd_mute') === '1'; } catch (e) { return false; } })();
  SFX.setMuted(savedMute);
  $('#muteBtn').textContent = savedMute ? '🔇' : '🔊';
  $('#muteBtn').addEventListener('click', () => {
    SFX.resume();
    const m = SFX.toggleMute();
    $('#muteBtn').textContent = m ? '🔇' : '🔊';
    try { localStorage.setItem('hd_mute', m ? '1' : '0'); } catch (e) { /* ignore */ }
  });

  // Lightning (turbo) mode: fast spins, win counted in one go.
  state.turbo = (() => { try { return localStorage.getItem('hd_turbo') === '1'; } catch (e) { return false; } })();
  $('#turboBtn').classList.toggle('active', state.turbo);
  $('#turboBtn').addEventListener('click', () => {
    state.turbo = !state.turbo;
    $('#turboBtn').classList.toggle('active', state.turbo);
    SFX.play('click');
    try { localStorage.setItem('hd_turbo', state.turbo ? '1' : '0'); } catch (e) { /* ignore */ }
  });

  // Top-up and bonus buy.
  $('#topupBtn').addEventListener('click', () => { SFX.resume(); topUp(); });
  $('#withdrawBtn').addEventListener('click', () => { SFX.resume(); withdraw(); });
  $('#buyBonusBtn').addEventListener('click', () => { SFX.resume(); buyBonus(); });

  // Autoplay modal.
  $('#autoClose').addEventListener('click', () => $('#autoModal').classList.add('hidden'));
  $('#autoModal').addEventListener('click', (e) => {
    if (e.target.id === 'autoModal') $('#autoModal').classList.add('hidden');
  });
  let autoCount = 10;
  $('#autoModal').querySelectorAll('.auto-count').forEach((btn) => {
    btn.addEventListener('click', () => {
      autoCount = +btn.dataset.n;
      $('#autoModal').querySelectorAll('.auto-count').forEach((b) => b.classList.remove('sel'));
      btn.classList.add('sel');
    });
  });
  $('#autoStartBtn').addEventListener('click', () => { SFX.resume(); startAutoplay(autoCount); });

  // Resize the FX canvas with the window.
  fxResize();
  window.addEventListener('resize', fxResize);

  // Gamble wiring: colour guess = ×2, exact suit guess = ×4.
  $('#gambleBtn').addEventListener('click', openGamble);
  $('#gRed').addEventListener('click', () => gambleGuess({ mult: 2, test: (s) => s.red === true }));
  $('#gBlack').addEventListener('click', () => gambleGuess({ mult: 2, test: (s) => s.red === false }));
  document.querySelectorAll('#gambleModal .g-suit').forEach((b) => {
    b.addEventListener('click', () => gambleGuess({ mult: 4, test: (s) => s.s === b.dataset.suit }));
  });
  document.querySelectorAll('#gambleModal .g-rank').forEach((b) => {
    b.addEventListener('click', () => gambleGuess({ mult: 13, test: (s, r) => r === b.dataset.rank }));
  });
  $('#gCollect').addEventListener('click', () => { if (!gambleBusy) gambleCollect(); });
  $('#gambleModal').addEventListener('click', (e) => {
    if (e.target.id === 'gambleModal' && !gambleBusy) gambleCollect();
  });

  // Keyboard: space to spin (ignored while any modal is open, mid-spin,
  // during a bonus, or during autoplay — and it never hijacks form inputs).
  document.addEventListener('keydown', (e) => {
    if (e.code !== 'Space') return;
    const tag = (e.target && e.target.tagName) || '';
    if (/^(INPUT|BUTTON|TEXTAREA|SELECT)$/.test(tag)) return;
    if (document.querySelector('.modal:not(.hidden)')) return;
    e.preventDefault();
    if (!state.spinning && !state.auto && !state.inFreeGame && !state.inGoldGame) doSpin();
  });
}

document.addEventListener('DOMContentLoaded', init);

/* Debug / test hook — lets the browser console (and automated tests) inspect
 * and drive the game state. Harmless in normal play. */
window.HD = { state, SYMBOLS, PAYLINES, evaluateGrid, lineBet, totalBet, renderGrid, showWinLines, presentWins, spinReelSymbols, offerGamble, openGamble, gambleGuess, gambleCollect, setRtp, wildWeight, wildWeightFor, effectiveWildWeight, reelSymbols, finishBonus, updateHistoryPanel, updateMeters, revealGoldMultipliers, settleResult, clearGamble, topUp, withdraw, currentNet, openBoard, submitScore, renderBoard, restartGame, renderGambleOdds, applyLayout, loadLayout, getBoard: () => leaderboard };
