/* =========================================================================
 * ADVENTURE SPINS — "Lucky Sevens" — second slot machine (3x3)
 * Shares the main game's balance (window.HD.state.credit) and its DUPLÁZÁS
 * (gamble), bet steps and round-history strip. Self-contained; exposed as
 * window.SLOT2 for tests.
 *
 * Symbols (3-of-a-kind on a payline pays mult × TOTAL bet):
 *   7 (60×, max 1/reel · also SCATTER), Gold Bar (40×, max 1/reel),
 *   Bell (30×, max 1/reel), Purple star (16×), Green star (16×),
 *   Grape/Orange/Lemon/Cherry (2× each).
 * Full screen (all 9 the same symbol) → total win ×2.
 * 3 sevens (one per reel — very rare) → WILD-7 bonus: the sevens turn sticky
 * wild, the rest respin once, lines re-score with 7 substituting anything,
 * and that respin win is ×7. Calibrated to ~94.75% RTP.
 * ========================================================================= */
'use strict';

(function () {
  const $ = (s) => document.querySelector(s);
  const HD = () => window.HD;
  const r2 = (n) => (window.HD ? window.HD.round2(n) : Math.round(n * 100) / 100);
  const money = (n) => (window.HD ? window.HD.fmt(n) : (Math.round(n * 100) / 100).toFixed(2));
  const credit = () => (window.HD ? window.HD.state.credit : 0);
  const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

  const COLS = 3, ROWS = 3;
  const LINES = [
    { cells: [[0, 0], [1, 0], [2, 0]], name: 'felső sor' },
    { cells: [[0, 1], [1, 1], [2, 1]], name: 'középső sor' },
    { cells: [[0, 2], [1, 2], [2, 2]], name: 'alsó sor' },
    { cells: [[0, 0], [1, 1], [2, 2]], name: 'átló ↘' },
    { cells: [[0, 2], [1, 1], [2, 0]], name: 'átló ↗' },
  ];
  // id -> { emoji, mult, weight, restricted (max 1 per reel), cls }
  const SYM = {
    seven:  { emoji: '7', mult: 60, weight: 3,  restricted: true,  cls: 'sv-seven' },
    goldbar:{ emoji: 'BAR', mult: 40, weight: 6,  restricted: true,  cls: 'sv-bar' },
    bell:   { emoji: '🔔', mult: 30, weight: 11, restricted: true,  cls: 'sv-bell' },
    pstar:  { emoji: '★', mult: 16, weight: 52, restricted: false, cls: 'sv-pstar' },
    gstar:  { emoji: '★', mult: 16, weight: 52, restricted: false, cls: 'sv-gstar' },
    grape:  { emoji: '🍇', mult: 2, weight: 42, restricted: false, cls: 'sv-fruit' },
    orange: { emoji: '🍊', mult: 2, weight: 44, restricted: false, cls: 'sv-fruit' },
    lemon:  { emoji: '🍋', mult: 2, weight: 46, restricted: false, cls: 'sv-fruit' },
    cherry: { emoji: '🍒', mult: 2, weight: 48, restricted: false, cls: 'sv-fruit' },
  };
  const IDS = Object.keys(SYM);
  const POOL = (() => { const p = []; for (const id of IDS) for (let i = 0; i < SYM[id].weight; i++) p.push(id); return p; })();

  const betSteps = () => (window.HD && window.HD.BET_STEPS) ? window.HD.BET_STEPS : [1];
  const s2 = { grid: [], betIndex: 0, spinning: false, winHistory: [] };
  for (let c = 0; c < COLS; c++) { s2.grid[c] = []; for (let r = 0; r < ROWS; r++) s2.grid[c][r] = IDS[(c + r) % IDS.length]; }
  const totalBet = () => betSteps()[s2.betIndex];

  /* --------------------------- Reel spin ------------------------------- */
  const pick = () => POOL[(Math.random() * POOL.length) | 0];
  function spinReel(col) {
    const used = new Set();
    for (let r = 0; r < ROWS; r++) {
      let s = pick();
      if (SYM[s].restricted && used.has(s)) { let g = 0; while (SYM[s].restricted && used.has(s) && g++ < 50) s = pick(); }
      if (SYM[s].restricted) used.add(s);
      s2.grid[col][r] = s;
    }
  }

  /* --------------------------- Evaluation ------------------------------ */
  // Returns { totalWin (in currency), lines:[{idx, sym, win}], full, sevens }.
  function evaluate(sevenWild) {
    const tb = totalBet();
    const lines = [];
    let total = 0;
    LINES.forEach((line, idx) => {
      const cells = line.cells.map(([c, r]) => s2.grid[c][r]);
      let sym = null;
      if (cells[0] === cells[1] && cells[1] === cells[2]) sym = cells[0];
      else if (sevenWild) {
        const base = cells.find((s) => s !== 'seven');
        if (base && cells.every((s) => s === base || s === 'seven')) sym = base;
        else if (cells.every((s) => s === 'seven')) sym = 'seven';
      }
      if (sym) { const win = r2(SYM[sym].mult * tb); total = r2(total + win); lines.push({ idx, sym, win }); }
    });
    // full screen: all nine cells identical
    const first = s2.grid[0][0];
    let full = true;
    for (let c = 0; c < COLS && full; c++) for (let r = 0; r < ROWS; r++) if (s2.grid[c][r] !== first) { full = false; break; }
    if (full && total > 0) total = r2(total * 2);
    let sevens = 0;
    for (let c = 0; c < COLS; c++) for (let r = 0; r < ROWS; r++) if (s2.grid[c][r] === 'seven') sevens++;
    return { totalWin: total, lines, full, sevens };
  }

  /* --------------------------- Rendering ------------------------------- */
  function cellHTML(id) { const d = SYM[id]; return `<div class="sv-cell ${d.cls}"><span>${d.emoji}</span></div>`; }
  function render() {
    const host = $('#s2Reels');
    if (host) {
      let html = '';
      for (let c = 0; c < COLS; c++) { html += '<div class="sv-reel">'; for (let r = 0; r < ROWS; r++) html += cellHTML(s2.grid[c][r]); html += '</div>'; }
      host.innerHTML = html;
    }
    const bet = $('#s2Bet'); if (bet) bet.textContent = money(totalBet());
    const cr = $('#s2Credit'); if (cr) cr.textContent = money(credit());
    const win = $('#s2Win'); if (win) win.textContent = money(s2.lastWin || 0);
  }
  function markWins(lines, cls) {
    const host = $('#s2Reels'); if (!host) return;
    const reels = host.querySelectorAll('.sv-reel');
    for (const lw of lines) for (const [c, r] of LINES[lw.idx].cells) {
      const cell = reels[c] && reels[c].children[r];
      if (cell) cell.classList.add(cls || 'sv-hit');
    }
  }
  function clearWins() {
    const host = $('#s2Reels'); if (!host) return;
    host.querySelectorAll('.sv-cell').forEach((c) => c.classList.remove('sv-hit', 'sv-wild'));
  }

  function flash(msg, kind) {
    const m = $('#s2Msg'); if (!m) return;
    m.textContent = msg; m.className = 'sv-msg' + (kind ? ' ' + kind : '');
  }

  /* --------------------------- Spin flow ------------------------------- */
  async function spin() {
    if (s2.spinning) return;
    if (window.HD && !$('#gambleModal').classList.contains('hidden')) return;   // busy gambling
    if (window.HD && window.HD.clearGamble) window.HD.clearGamble();
    const tb = totalBet();
    if (credit() < tb) { flash('Nincs elég kredit ehhez a téthez.', 'lose'); return; }
    s2.spinning = true; setBusy(true); clearWins();
    adjust(-tb);
    s2.lastWin = 0; render();
    if (window.SFX) SFX.play('spin');

    // quick spin animation: shuffle each reel a few times
    const turbo = window.HD && window.HD.state && window.HD.state.turbo;
    const frames = turbo ? 3 : 8;
    for (let f = 0; f < frames; f++) {
      for (let c = 0; c < COLS; c++) spinReel(c);
      render();
      await sleep(turbo ? 30 : 60);
    }
    for (let c = 0; c < COLS; c++) spinReel(c);
    render();

    let res = evaluate(false);
    let win = res.totalWin;

    // WILD-7 bonus: 3 sevens (one per reel) -> sticky-wild respin, ×7.
    if (res.sevens >= 3) {
      flash('🎰 SUPER 7! WILD-7 BÓNUSZ ×7', 'bonus');
      if (window.SFX) SFX.play('freespins');
      // mark the sevens as wild
      markSevensWild();
      await sleep(turbo ? 400 : 1100);
      // respin non-seven cells
      for (let c = 0; c < COLS; c++) for (let r = 0; r < ROWS; r++) if (s2.grid[c][r] !== 'seven') s2.grid[c][r] = pick();
      render(); markSevensWild();
      await sleep(turbo ? 150 : 500);
      const bonus = evaluate(true);
      const bwin = r2(bonus.totalWin * 7);
      win = r2(win + bwin);
      if (bonus.lines.length) markWins(bonus.lines, 'sv-hit');
      flash(`WILD-7 ×7 → +${money(bwin)} €`, 'win');
      await sleep(turbo ? 300 : 900);
    } else if (res.lines.length) {
      markWins(res.lines, 'sv-hit');
    }

    if (win > 0) {
      adjust(win);
      s2.lastWin = win;
      if (res.sevens < 3) flash(`NYEREMÉNY +${money(win)} €${res.full ? ' · TELI KÉP ×2!' : ''}`, 'win');
      if (window.SFX) SFX.play(win >= tb * 20 ? 'bigwin' : 'win');
    } else {
      flash('Nincs nyeremény — pörgess újra!', '');
    }
    render();

    // round-history strip + gamble offer (shared with the other games)
    if (window.HD && window.HD.pushRoundWin) {
      window.HD.pushRoundWin(s2.winHistory, win);
      window.HD.renderRoundHistory('s2RoundHistory', s2.winHistory);
    }
    s2.spinning = false; setBusy(false);
    if (window.HD && window.HD.offerGamble) window.HD.offerGamble(win > 0 ? win : 0);
  }

  function markSevensWild() {
    const host = $('#s2Reels'); if (!host) return;
    const reels = host.querySelectorAll('.sv-reel');
    for (let c = 0; c < COLS; c++) for (let r = 0; r < ROWS; r++) if (s2.grid[c][r] === 'seven') {
      const cell = reels[c] && reels[c].children[r]; if (cell) cell.classList.add('sv-wild');
    }
  }

  function adjust(delta) { if (window.HD) { window.HD.state.credit = r2(window.HD.state.credit + delta); window.HD.updateMeters(); window.HD.saveGame(); } render(); }
  function setBusy(on) {
    ['#s2Spin', '#s2BetMinus', '#s2BetPlus'].forEach((s) => { const el = $(s); if (el) el.disabled = on; });
  }
  function changeBet(dir) {
    if (s2.spinning) return;
    const n = betSteps().length;
    s2.betIndex = Math.max(0, Math.min(n - 1, s2.betIndex + dir));
    if (window.HD && window.HD.clearGamble) window.HD.clearGamble();   // new bet drops a pending gamble
    render();
  }

  /* --------------------------- View toggle ----------------------------- */
  function openTable() {
    const v = $('#s2View'), cab = $('#slotView');
    if (!v || !cab) return;
    if (window.HD && window.HD.stopAutoplay) window.HD.stopAutoplay();
    if (window.HD && window.HD.clearGamble) window.HD.clearGamble();
    cab.classList.add('hidden');
    const bj = $('#bjView'); if (bj) bj.classList.add('hidden');
    const rl = $('#rlView'); if (rl) rl.classList.add('hidden');
    v.classList.remove('hidden');
    render();
    if (window.HD && window.HD.renderRoundHistory) window.HD.renderRoundHistory('s2RoundHistory', s2.winHistory);
    flash('Tedd meg a téted, majd PÖRGESS!', '');
  }
  function closeTable() {
    const v = $('#s2View'), cab = $('#slotView');
    if (v) v.classList.add('hidden');
    if (cab) cab.classList.remove('hidden');
    if (window.HD && window.HD.updateMeters) window.HD.updateMeters();
  }

  function buildPaytable() {
    const el = $('#s2Paytable'); if (!el) return;
    const order = ['seven', 'goldbar', 'bell', 'pstar', 'gstar', 'cherry', 'lemon', 'orange', 'grape'];
    el.innerHTML = order.map((id) => {
      const d = SYM[id];
      return `<div class="sv-pt-row"><span class="sv-cell ${d.cls} mini"><span>${d.emoji}</span></span><b>3×</b><span>${d.mult}× tét</span></div>`;
    }).join('') + '<div class="sv-pt-note">3× 7-es (nagyon ritka) → WILD-7 bónusz ×7 · teli kép → ×2</div>';
  }

  function wire() {
    buildPaytable();
    const on = (id, fn) => { const el = $(id); if (el) el.addEventListener('click', fn); };
    on('#s2Btn', () => { if (window.SFX) SFX.resume(); openTable(); });
    on('#s2BackBtn', closeTable);
    on('#s2Spin', () => { if (window.SFX) SFX.resume(); spin(); });
    on('#s2BetMinus', () => changeBet(-1));
    on('#s2BetPlus', () => changeBet(1));
    on('#s2GambleBtn', () => { if (window.HD && window.HD.openGamble) window.HD.openGamble(); });
    render();
  }
  document.addEventListener('DOMContentLoaded', wire);

  /* Pure spin resolution (no animation) — the exact win logic spin() applies,
   * used for tests + RTP verification. Returns the total win in currency. */
  function resolvePure() {
    for (let c = 0; c < COLS; c++) spinReel(c);
    const res = evaluate(false);
    let win = res.totalWin;
    if (res.sevens >= 3) {
      for (let c = 0; c < COLS; c++) for (let r = 0; r < ROWS; r++) if (s2.grid[c][r] !== 'seven') s2.grid[c][r] = pick();
      const bonus = evaluate(true);
      win = r2(win + r2(bonus.totalWin * 7));
    }
    return win;
  }

  // Test hook.
  window.SLOT2 = {
    state: () => s2, SYM, LINES, evaluate, totalBet, resolvePure,
    setGrid: (g) => { for (let c = 0; c < COLS; c++) for (let r = 0; r < ROWS; r++) s2.grid[c][r] = g[c][r]; },
    setBetIndex: (i) => { s2.betIndex = i; },
    spin, openTable, closeTable,
  };
})();
