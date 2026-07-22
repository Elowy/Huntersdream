/* =========================================================================
 * ADVENTURE SPINS — "Lucky Sevens" — second slot machine (3x3)
 * Shares the main game's balance (window.HD.state.credit) and its DUPLÁZÁS
 * (gamble), bet steps and round-history strip. Self-contained; exposed as
 * window.SLOT2 for tests.
 *
 * 27 lines = every one-cell-per-reel combo, so a symbol pays as soon as it
 * shows up on ALL THREE reels ("all possible lines payable"). Each such symbol
 * pays mult × TOTAL bet (so 3 gold bars = 40× tét); wins sum:
 *   7 (60× · also SCATTER), Gold Bar (40×), Bell (30×) — max 1/reel;
 *   Purple star (16×), Green star (16×), Grape/Orange/Lemon/Cherry (2×).
 * A BLANK strip position never pays and dilutes the reels so the big
 * multipliers can stand at ~98% RTP. Full screen (all 9 same) → total ×2.
 * 3 sevens (one per reel) → the sevens turn wild and the whole spin win ×7.
 * Monte-Carlo calibrated to ~98% RTP. Autoplay + shared DUPLÁZÓ included.
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
  // 27 FIXED paylines: every possible one-cell-per-reel combination
  // ([row0,row1,row2]) — "all possible lines are payable" (3×3×3 = 27).
  const LINES = [];
  for (let a = 0; a < ROWS; a++) for (let b = 0; b < ROWS; b++) for (let c = 0; c < ROWS; c++) LINES.push([[0, a], [1, b], [2, c]]);
  // id -> { emoji, mult (per line, × lineBet), weight, restricted (max 1/reel), cls }
  // Monte-Carlo calibrated to ~98% RTP (lineBet = totalBet / 27).
  const SYM = {
    seven:  { emoji: '7', mult: 60, weight: 3,  restricted: true,  cls: 'sv-seven' },
    goldbar:{ emoji: 'BAR', mult: 40, weight: 6,  restricted: true,  cls: 'sv-bar' },
    bell:   { emoji: '🔔', mult: 30, weight: 11, restricted: true,  cls: 'sv-bell' },
    pstar:  { emoji: '★', mult: 16, weight: 20, restricted: false, cls: 'sv-pstar' },
    gstar:  { emoji: '★', mult: 16, weight: 20, restricted: false, cls: 'sv-gstar' },
    grape:  { emoji: '🍇', mult: 2, weight: 30, restricted: false, cls: 'sv-fruit' },
    orange: { emoji: '🍊', mult: 2, weight: 32, restricted: false, cls: 'sv-fruit' },
    lemon:  { emoji: '🍋', mult: 2, weight: 34, restricted: false, cls: 'sv-fruit' },
    cherry: { emoji: '🍒', mult: 2, weight: 36, restricted: false, cls: 'sv-fruit' },
    // Blank strip position (never pays) — dilutes the reels so the big
    // multipliers can stand at ~98% RTP. Renders as a dim empty cell.
    blank:  { emoji: '', mult: 0, weight: 38, restricted: false, cls: 'sv-blank' },
  };
  const IDS = Object.keys(SYM);
  const PAYIDS = IDS.filter((id) => SYM[id].mult > 0);
  const POOL = (() => { const p = []; for (const id of IDS) for (let i = 0; i < SYM[id].weight; i++) p.push(id); return p; })();

  const betSteps = () => (window.HD && window.HD.BET_STEPS) ? window.HD.BET_STEPS : [1];
  const s2 = { grid: [], betIndex: 0, spinning: false, auto: false, turbo: false, winHistory: [] };
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
  // 27 lines = every one-cell-per-reel combo, so a symbol wins as soon as it
  // shows up on ALL THREE reels ("all possible lines are payable"). Each such
  // symbol pays mult × TOTAL bet (not per line), so 3 gold bars = 40× tét.
  // Wins sum; full screen (all 9 same symbol) → total ×2. The x7 wild-7 bonus
  // (3 sevens) is applied by the caller. Returns
  // { totalWin, winCells (Set 'c,r'), winSyms, full, sevens }.
  function evaluate() {
    const tb = totalBet();
    const present = (id) => s2.grid[0].includes(id) && s2.grid[1].includes(id) && s2.grid[2].includes(id);
    let total = 0; const winSyms = []; const winCells = new Set();
    for (const id of PAYIDS) {
      if (!present(id)) continue;
      total += SYM[id].mult * tb;
      winSyms.push(id);
      for (let c = 0; c < COLS; c++) for (let r = 0; r < ROWS; r++) if (s2.grid[c][r] === id) winCells.add(c + ',' + r);
    }
    const first = s2.grid[0][0];
    let full = first !== 'blank';
    for (let c = 0; c < COLS && full; c++) for (let r = 0; r < ROWS; r++) if (s2.grid[c][r] !== first) { full = false; break; }
    if (full && total > 0) total *= 2;
    total = r2(total);
    let sevens = 0;
    for (let c = 0; c < COLS; c++) for (let r = 0; r < ROWS; r++) if (s2.grid[c][r] === 'seven') sevens++;
    return { totalWin: total, winCells, winSyms, full, sevens };
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
  function markWins(winCells, cls) {
    const host = $('#s2Reels'); if (!host || !winCells) return;
    const reels = host.querySelectorAll('.sv-reel');
    winCells.forEach((key) => {
      const [c, r] = key.split(',').map(Number);
      const cell = reels[c] && reels[c].children[r];
      if (cell) cell.classList.add(cls || 'sv-hit');
    });
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
    const turbo = s2.turbo;
    const frames = turbo ? 3 : 8;
    for (let f = 0; f < frames; f++) {
      for (let c = 0; c < COLS; c++) spinReel(c);
      render();
      await sleep(turbo ? 30 : 60);
    }
    for (let c = 0; c < COLS; c++) spinReel(c);
    render();

    const res = evaluate();
    let win = res.totalWin;
    if (res.winCells.size) markWins(res.winCells, 'sv-hit');

    // WILD-7 bonus: 3 sevens (one per reel) turn wild and multiply the whole
    // spin win ×7 (the seven itself already pays 60× as one of the winners).
    if (res.sevens >= 3) {
      markSevensWild();
      flash('🎰 SUPER 7! WILD-7 ×7', 'bonus');
      if (window.SFX) SFX.play('freespins');
      await sleep(turbo ? 500 : 1300);
      win = r2(win * 7);
    }

    if (win > 0) {
      adjust(win);
      s2.lastWin = win;
      if (res.sevens >= 3) flash(`SUPER 7! ×7 → +${money(win)} €`, 'win');
      else flash(`NYEREMÉNY +${money(win)} €${res.full ? ' · TELI KÉP ×2!' : ''}`, 'win');
      if (window.SFX) SFX.play(win >= tb * 20 ? 'bigwin' : 'win');
    } else {
      flash('Nincs nyeremény — pörgess újra!', '');
    }
    render();
    if (res.winCells.size) markWins(res.winCells, 'sv-hit');   // re-apply after render

    // round-history strip + gamble offer (shared with the other games)
    if (window.HD && window.HD.pushRoundWin) {
      window.HD.pushRoundWin(s2.winHistory, win);
      window.HD.renderRoundHistory('s2RoundHistory', s2.winHistory);
    }
    s2.spinning = false; setBusy(false);
    // Gamble is offered only when NOT auto-spinning (like the main machine).
    if (!s2.auto && window.HD && window.HD.offerGamble) window.HD.offerGamble(win > 0 ? win : 0);
  }

  /* Autoplay: keep spinning until stopped, out of credit, or a bonus hits. */
  async function toggleAuto() {
    if (s2.auto) { stopAuto(); return; }
    if (s2.spinning) return;
    if (window.HD && window.HD.clearGamble) window.HD.clearGamble();
    s2.auto = true;
    const btn = $('#s2AutoBtn'); if (btn) btn.classList.add('active');
    while (s2.auto) {
      if (credit() < totalBet()) { stopAuto(); break; }
      await spin();
      if (!s2.auto) break;
      await sleep(s2.turbo ? 220 : 550);
    }
  }
  function stopAuto() { s2.auto = false; const btn = $('#s2AutoBtn'); if (btn) btn.classList.remove('active'); }
  function toggleTurbo() { s2.turbo = !s2.turbo; const b = $('#s2TurboBtn'); if (b) b.classList.toggle('active', s2.turbo); }
  function toggleInfo() {
    const p = $('#s2Paytable'); if (!p) return;
    const open = p.classList.toggle('hidden') === false;
    const b = $('#s2InfoBtn'); if (b) b.setAttribute('aria-expanded', open ? 'true' : 'false');
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
    flash('TEGYE MEG TÉTJÉT!', '');
  }
  function closeTable() {
    stopAuto();
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
    }).join('') + '<div class="sv-pt-note">27 nyerővonal — bárhol 3 egyforma a tárcsákon fizet (szorzó × tét) · teli kép → ×2 · 3× 7-es → WILD-7 ×7</div>';
  }

  function wire() {
    buildPaytable();
    const on = (id, fn) => { const el = $(id); if (el) el.addEventListener('click', fn); };
    on('#s2Btn', () => { if (window.SFX) SFX.resume(); openTable(); });
    on('#s2BackBtn', closeTable);
    on('#s2MenuBtn', closeTable);
    on('#s2Spin', () => { if (window.SFX) SFX.resume(); if (s2.auto) stopAuto(); else spin(); });
    on('#s2AutoBtn', () => { if (window.SFX) SFX.resume(); toggleAuto(); });
    on('#s2TurboBtn', () => { if (window.SFX) SFX.resume(); toggleTurbo(); });
    on('#s2InfoBtn', toggleInfo);
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
    const res = evaluate();
    let win = res.totalWin;
    if (res.sevens >= 3) win = r2(win * 7);
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
