/* =========================================================================
 * ADVENTURE SPINS — Roulette (European single-zero)
 * Shares the slot's balance (window.HD.state.credit). Full table:
 *   inside bets (straight/split/street/corner/six-line/trio) +
 *   outside bets (red/black, even/odd, low/high, dozens, columns).
 * Clickable SVG table. No external files. Exposed as window.RL for tests.
 * ========================================================================= */
'use strict';

(function () {
  const $ = (s) => document.querySelector(s);
  const NS = 'http://www.w3.org/2000/svg';

  const RED = new Set([1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36]);
  const colorOf = (n) => (n === 0 ? 'green' : (RED.has(n) ? 'red' : 'black'));
  // European wheel order (0 at top), used for the spin animation.
  const WHEEL = [0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26];

  const PAY = { straight: 35, split: 17, street: 11, corner: 8, sixline: 5, trio: 11, column: 2, dozen: 2, even: 1 };
  const CHIPS = [1, 5, 25, 100, 500];

  // Table geometry (SVG units).
  const CW = 46, CH = 48, CW0 = 46, COLW = 46, DH = 36, EH = 36;
  const W = CW0 + 12 * CW + COLW, H = 3 * CH + DH + EH;
  const xNum = (c) => CW0 + c * CW;
  const numAt = (r, c) => 3 * c + (3 - r);   // r 0=top..2=bottom, c 0..11

  const r2 = (n) => (window.HD ? window.HD.round2(n) : Math.round(n * 100) / 100);
  const money = (n) => (window.HD ? window.HD.fmt(n) : (Math.round(n * 100) / 100).toFixed(2));
  const credit = () => (window.HD ? window.HD.state.credit : 0);
  function adjust(delta) { if (window.HD) window.HD.state.credit = r2(window.HD.state.credit + delta); sync(); }
  function sync() {
    const c = $('#rlCredit'); if (c) c.textContent = money(credit());
    if (window.HD) { window.HD.updateMeters(); window.HD.saveGame(); }
  }

  let activeChip = 5;
  let bets = {};            // key -> { def, amount }
  let placeOrder = [];      // stack of keys for UNDO
  let lastBets = null;      // for REBET
  let history = [];         // recent winning numbers
  let spinning = false;
  let wheelAngle = 0, ballAngle = 0;   // accumulated rotation of the wheel + ball
  const defByKey = {};      // key -> bet def (all spots)

  /* ----------------------- Spinning wheel (SVG) ------------------------ */
  function buildWheel() {
    const step = 360 / WHEEL.length;
    const cx = 100, cy = 100, rOuter = 96, rInner = 60, rText = 79, rBall = 90;
    const xy = (r, deg) => { const a = (deg - 90) * Math.PI / 180; return [cx + r * Math.cos(a), cy + r * Math.sin(a)]; };
    let sectors = '';
    WHEEL.forEach((n, i) => {
      const a0 = i * step - step / 2, a1 = i * step + step / 2;
      const [x0, y0] = xy(rOuter, a0), [x1, y1] = xy(rOuter, a1);
      const [ix1, iy1] = xy(rInner, a1), [ix0, iy0] = xy(rInner, a0);
      const fill = n === 0 ? '#1a7a3a' : (RED.has(n) ? '#c41818' : '#141414');
      sectors += `<path d="M${x0.toFixed(2)},${y0.toFixed(2)} A${rOuter},${rOuter} 0 0 1 ${x1.toFixed(2)},${y1.toFixed(2)} L${ix1.toFixed(2)},${iy1.toFixed(2)} A${rInner},${rInner} 0 0 0 ${ix0.toFixed(2)},${iy0.toFixed(2)} Z" fill="${fill}" stroke="#d4af37" stroke-width="0.4"/>`;
      const [tx, ty] = xy(rText, i * step);
      sectors += `<text x="${tx.toFixed(2)}" y="${ty.toFixed(2)}" fill="#fff" font-size="8" font-weight="800" text-anchor="middle" dominant-baseline="central" transform="rotate(${(i * step).toFixed(2)}, ${tx.toFixed(2)}, ${ty.toFixed(2)})">${n}</text>`;
    });
    const [bx, by] = xy(rBall, 0);
    return `<svg viewBox="0 0 200 200" class="rl-wheel-svg" aria-hidden="true">
      <circle cx="100" cy="100" r="99" fill="#2a1a0c" stroke="#8a5a2a" stroke-width="2.5"/>
      <g id="rlWheelRot" class="rl-rot">${sectors}<circle cx="100" cy="100" r="${rInner}" fill="#241608" stroke="#8a5a2a" stroke-width="1.5"/><circle cx="100" cy="100" r="18" fill="#3a2410" stroke="#d4af37" stroke-width="1"/></g>
      <g id="rlBallRot" class="rl-rot"><circle cx="${bx.toFixed(2)}" cy="${by.toFixed(2)}" r="4.6" fill="#fff" stroke="#999" stroke-width="0.6"/></g>
    </svg>`;
  }

  // Rotate the wheel so the winning pocket ends under the top pointer; the ball
  // counter-rotates and settles at the top. Returns the animation length (ms).
  function animateWheel(winner) {
    const step = 360 / WHEEL.length;
    const idx = WHEEL.indexOf(winner);
    const turbo = window.HD && window.HD.state && window.HD.state.turbo;
    const dur = turbo ? 1.4 : 4.4;
    const wheelEl = $('#rlWheelRot'), ballEl = $('#rlBallRot');
    // wheel: several forward turns, then bring the winner's pocket to the top (0°)
    const target = ((-idx * step) % 360 + 360) % 360;
    const cur = ((wheelAngle % 360) + 360) % 360;
    wheelAngle += 360 * (turbo ? 4 : 7) + ((target - cur + 360) % 360);
    // ball: opposite direction, lands back at the top (a whole number of turns)
    ballAngle -= 360 * (turbo ? 6 : 11);
    if (wheelEl) { wheelEl.style.transition = `transform ${dur}s cubic-bezier(.16,.62,.2,1)`; wheelEl.style.transform = `rotate(${wheelAngle}deg)`; }
    if (ballEl) { ballEl.style.transition = `transform ${dur}s cubic-bezier(.1,.5,.2,1)`; ballEl.style.transform = `rotate(${ballAngle}deg)`; }
    return dur * 1000;
  }

  /* ------------------------- Bet definitions --------------------------- */
  const mkKey = (type, nums) => type + ':' + nums.slice().sort((a, b) => a - b).join('-');
  function def(type, nums, cx, cy) {
    const pay = PAY[type];
    const key = mkKey(type, nums);
    const d = { type, numbers: nums, pay, key, cx, cy };
    defByKey[key] = d;
    return d;
  }
  const rowNums = (r) => Array.from({ length: 12 }, (_, c) => numAt(r, c));
  const dozenNums = (k) => Array.from({ length: 12 }, (_, i) => 12 * k + i + 1);

  /* --------------------------- Build table SVG ------------------------- */
  function buildTable() {
    const svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    svg.setAttribute('class', 'rl-svg');
    let cells = '', hots = '';

    const cell = (x, y, w, h, fill, label, cls, key, fontsize) =>
      `<g class="rl-cell ${cls}" data-key="${key}">` +
      `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}" stroke="#0b3a1e" stroke-width="1"/>` +
      `<text x="${x + w / 2}" y="${y + h / 2}" fill="#fff" font-size="${fontsize || 18}" font-weight="800" text-anchor="middle" dominant-baseline="central">${label}</text></g>`;

    // zero
    cells += cell(0, 0, CW0, 3 * CH, '#1a7a3a', '0', 'zero', def('straight', [0], CW0 / 2, 1.5 * CH).key);
    // numbers
    for (let r = 0; r < 3; r++) for (let c = 0; c < 12; c++) {
      const n = numAt(r, c);
      const fill = RED.has(n) ? '#c41818' : '#17130d';
      cells += cell(xNum(c), r * CH, CW, CH, fill, n, 'num', def('straight', [n], xNum(c) + CW / 2, r * CH + CH / 2).key);
    }
    // column 2:1
    for (let r = 0; r < 3; r++) {
      const d = def('column', rowNums(r), xNum(12) + COLW / 2, r * CH + CH / 2);
      cells += cell(xNum(12), r * CH, COLW, CH, '#0f3a20', '2:1', 'col', d.key, 15);
    }
    // dozens
    const dozLabels = ['1–12', '13–24', '25–36'];
    for (let k = 0; k < 3; k++) {
      const d = def('dozen', dozenNums(k), xNum(k * 4) + 2 * CW, 3 * CH + DH / 2);
      cells += cell(xNum(k * 4), 3 * CH, 4 * CW, DH, '#0f3a20', dozLabels[k], 'doz', d.key, 15);
    }
    // even-money (each spans 2 number columns)
    const evens = [
      { nums: Array.from({ length: 18 }, (_, i) => i + 1), label: '1–18', fill: '#0f3a20' },
      { nums: Array.from({ length: 36 }, (_, i) => i + 1).filter((n) => n % 2 === 0), label: 'PÁROS', fill: '#0f3a20' },
      { nums: [...RED], label: 'PIROS', fill: '#c41818' },
      { nums: Array.from({ length: 36 }, (_, i) => i + 1).filter((n) => n !== 0 && !RED.has(n)), label: 'FEKETE', fill: '#17130d' },
      { nums: Array.from({ length: 36 }, (_, i) => i + 1).filter((n) => n % 2 === 1), label: 'PÁRATLAN', fill: '#0f3a20' },
      { nums: Array.from({ length: 18 }, (_, i) => i + 19), label: '19–36', fill: '#0f3a20' },
    ];
    evens.forEach((e, i) => {
      const cx = xNum(i * 2) + CW, cy = 3 * CH + DH + EH / 2;
      const d = def('even', e.nums, cx, cy);
      cells += cell(xNum(i * 2), 3 * CH + DH, 2 * CW, EH, e.fill, e.label, 'even', d.key, 14);
    });

    // ---- inside combo hotspots (drawn on top, transparent) ----
    const hot = (nums, type, cx, cy, rad) => {
      const d = def(type, nums, cx, cy);
      return `<circle class="rl-hot" data-key="${d.key}" cx="${cx}" cy="${cy}" r="${rad || 9}" fill="rgba(255,255,255,0.001)"/>`;
    };
    // vertical splits (horizontal neighbours in the grid)
    for (let r = 0; r < 3; r++) for (let c = 0; c < 11; c++)
      hots += hot([numAt(r, c), numAt(r, c + 1)], 'split', xNum(c + 1), r * CH + CH / 2);
    // horizontal splits (vertical neighbours)
    for (let r = 0; r < 2; r++) for (let c = 0; c < 12; c++)
      hots += hot([numAt(r, c), numAt(r + 1, c)], 'split', xNum(c) + CW / 2, (r + 1) * CH);
    // zero splits (0 with 1,2,3)
    for (let r = 0; r < 3; r++) hots += hot([0, numAt(r, 0)], 'split', CW0, r * CH + CH / 2);
    // corners
    for (let r = 0; r < 2; r++) for (let c = 0; c < 11; c++)
      hots += hot([numAt(r, c), numAt(r, c + 1), numAt(r + 1, c), numAt(r + 1, c + 1)], 'corner', xNum(c + 1), (r + 1) * CH);
    // zero trios (0-1-2, 0-2-3)
    hots += hot([0, 3, 2], 'trio', CW0, CH);
    hots += hot([0, 2, 1], 'trio', CW0, 2 * CH);
    // streets (bottom edge of each column)
    for (let c = 0; c < 12; c++) hots += hot([numAt(0, c), numAt(1, c), numAt(2, c)], 'street', xNum(c) + CW / 2, 3 * CH);
    // six-lines (bottom edge between two columns)
    for (let c = 0; c < 11; c++) hots += hot(rowNums(0).slice(c, c + 2).concat(rowNums(1).slice(c, c + 2)).concat(rowNums(2).slice(c, c + 2)), 'sixline', xNum(c + 1), 3 * CH, 10);

    svg.innerHTML = `<g class="rl-cells">${cells}</g><g class="rl-hots">${hots}</g><g class="rl-chips" id="rlChipLayer"></g><g class="rl-highlight" id="rlHi"></g>`;
    return svg;
  }

  /* ------------------------------ Betting ------------------------------ */
  const totalStaked = () => r2(Object.values(bets).reduce((s, b) => s + b.amount, 0));

  function placeKey(key) {
    if (spinning) return;
    const d = defByKey[key]; if (!d) return;
    if (totalStaked() + activeChip > credit()) { flash('Nincs elég kredit ehhez a téthez.'); return; }
    // Building a new bet abandons any pending gamble offer (win stays in credit).
    if (!totalStaked() && window.HD && window.HD.clearGamble) window.HD.clearGamble();
    if (!bets[key]) bets[key] = { def: d, amount: 0 };
    bets[key].amount = r2(bets[key].amount + activeChip);
    placeOrder.push({ key, amount: activeChip });
    renderChips(); renderInfo();
  }
  function undo() {
    if (spinning || !placeOrder.length) return;
    const last = placeOrder.pop();
    const b = bets[last.key]; if (!b) return;
    b.amount = r2(b.amount - last.amount);
    if (b.amount <= 0) delete bets[last.key];
    renderChips(); renderInfo();
  }
  function clearBets() {
    if (spinning) return;
    bets = {}; placeOrder = [];
    renderChips(); renderInfo();
  }
  function rebet() {
    if (spinning || !lastBets) return;
    const t = Object.values(lastBets).reduce((s, b) => s + b.amount, 0);
    if (t > credit()) { flash('Nincs elég kredit az ismétléshez.'); return; }
    bets = {}; placeOrder = [];
    for (const k of Object.keys(lastBets)) { bets[k] = { def: lastBets[k].def, amount: lastBets[k].amount }; placeOrder.push({ key: k, amount: lastBets[k].amount }); }
    renderChips(); renderInfo();
  }

  /* ------------------------------ Spin --------------------------------- */
  let forced = null;
  async function spin() {
    if (spinning) return;
    const stake = totalStaked();
    if (stake <= 0) { flash('Tegyél téteket, majd PÖRGESS!'); return; }
    if (stake > credit()) { flash('Nincs elég kredit.'); return; }
    spinning = true;
    setBusy(true);
    adjust(-stake);
    lastBets = {}; for (const k of Object.keys(bets)) lastBets[k] = { def: bets[k].def, amount: bets[k].amount };

    const winner = (forced != null) ? forced : Math.floor(Math.random() * 37);
    forced = null;

    // Spin the wheel + ball; the ball settles on the winning pocket at the top.
    const disp = $('#rlBall');
    if (disp) { disp.textContent = '…'; disp.className = 'rl-result spinning'; }
    const durMs = animateWheel(winner);
    if (window.SFX) { const t0 = Date.now(); const tick = () => { if (Date.now() - t0 < durMs - 400 && spinning) { SFX.play('reelStop'); setTimeout(tick, 90 + (Date.now() - t0) / durMs * 220); } }; tick(); }
    await sleep(durMs);
    if (disp) { disp.textContent = winner; disp.className = 'rl-result ' + colorOf(winner); }

    // resolve
    let credited = 0;
    for (const k of Object.keys(bets)) {
      const b = bets[k];
      if (b.def.numbers.includes(winner)) credited = r2(credited + b.amount * (b.def.pay + 1));
    }
    if (credited > 0) adjust(credited);
    const net = r2(credited - stake);
    highlightWinner(winner);
    history.unshift(winner); if (history.length > 14) history.pop();
    renderHistory();
    if (window.SFX) SFX.play(net > 0 ? 'win' : 'gambleLose');
    flash(`${winner} ${colorHu(winner)} — ${credited > 0 ? 'nyeremény +' + money(credited) + ' €' : 'nincs nyeremény'} (${net >= 0 ? '+' : ''}${money(net)} €)`);

    // Clear the table for the next round (chips already staked). ISMÉT repeats.
    bets = {}; placeOrder = [];
    spinning = false;
    setBusy(false);
    renderChips(); renderInfo();
    // Offer to gamble the round's net profit (shared with the slot/blackjack).
    if (window.HD && window.HD.offerGamble) window.HD.offerGamble(net > 0 ? net : 0);
  }

  const colorHu = (n) => (n === 0 ? '🟢' : (RED.has(n) ? '🔴' : '⚫'));
  function sleep(ms) { return new Promise((r) => setTimeout(r, ms)); }

  /* ------------------------------ Rendering ---------------------------- */
  function chipTier(a) { return a >= 500 ? 4 : a >= 100 ? 3 : a >= 25 ? 2 : a >= 5 ? 1 : 0; }
  function renderChips() {
    const layer = $('#rlChipLayer'); if (!layer) return;
    const colors = ['#2a6cff', '#ff5a5a', '#4dff77', '#2a2f38', '#f6c445'];
    layer.innerHTML = Object.values(bets).map((b) => {
      const col = colors[chipTier(b.amount)];
      const txt = b.amount >= 1000 ? Math.round(b.amount / 1000) + 'k' : b.amount;
      return `<g><circle cx="${b.def.cx}" cy="${b.def.cy}" r="12" fill="${col}" stroke="#fff" stroke-width="2"/>` +
        `<text x="${b.def.cx}" y="${b.def.cy}" fill="${b.amount >= 25 && b.amount < 500 ? '#06210f' : '#fff'}" font-size="11" font-weight="900" text-anchor="middle" dominant-baseline="central">${txt}</text></g>`;
    }).join('');
  }
  function highlightWinner(n) {
    const hi = $('#rlHi'); if (!hi) return;
    let x, y, w, h;
    if (n === 0) { x = 0; y = 0; w = CW0; h = 3 * CH; }
    else { for (let r = 0; r < 3; r++) for (let c = 0; c < 12; c++) if (numAt(r, c) === n) { x = xNum(c); y = r * CH; w = CW; h = CH; } }
    hi.innerHTML = `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="none" stroke="#fff3cf" stroke-width="4"><animate attributeName="opacity" values="1;0.3;1" dur="0.8s" repeatCount="4"/></rect>`;
    setTimeout(() => { if (hi) hi.innerHTML = ''; }, 3500);
  }
  function renderHistory() {
    const el = $('#rlHistory'); if (!el) return;
    el.innerHTML = history.map((n) => `<span class="rl-hist ${colorOf(n)}">${n}</span>`).join('');
  }
  function renderInfo() {
    const st = $('#rlStake'); if (st) st.textContent = money(totalStaked());
    const c = $('#rlCredit'); if (c) c.textContent = money(credit());
  }
  let flashTimer = null;
  function flash(text) { const m = $('#rlMsg'); if (m) m.textContent = text; }
  function setBusy(on) {
    ['#rlSpin', '#rlClear', '#rlUndo', '#rlRebet'].forEach((s) => { const el = $(s); if (el) el.disabled = on; });
  }
  function renderChipTray() {
    const wrap = $('#rlChips'); if (!wrap) return;
    if (wrap.dataset.built !== '1') {
      wrap.innerHTML = CHIPS.map((v) => `<button class="rl-chip" data-chip="${v}" type="button">${v}</button>`).join('');
      wrap.dataset.built = '1';
      wrap.querySelectorAll('.rl-chip').forEach((b) => b.addEventListener('click', () => { activeChip = +b.dataset.chip; renderChipTray(); }));
    }
    wrap.querySelectorAll('.rl-chip').forEach((b) => b.classList.toggle('active', +b.dataset.chip === activeChip));
  }

  /* ------------------------- View toggle + wiring ---------------------- */
  function openTable() {
    const rv = $('#rlView'), cab = $('#slotView');
    if (!rv || !cab) return;
    if (window.HD && window.HD.stopAutoplay) window.HD.stopAutoplay();
    if (window.HD && window.HD.clearGamble) window.HD.clearGamble();  // drop any pending slot gamble (win stays in credit)
    cab.classList.add('hidden');
    const bv = $('#bjView'); if (bv) bv.classList.add('hidden');
    rv.classList.remove('hidden');
    renderChips(); renderInfo(); renderHistory();
  }
  function closeTable() {
    const rv = $('#rlView'), cab = $('#slotView');
    if (rv) rv.classList.add('hidden');
    if (cab) cab.classList.remove('hidden');
    if (window.HD && window.HD.updateMeters) window.HD.updateMeters();
  }

  function wire() {
    const host = $('#rlTable');
    if (host && !host.dataset.built) { host.appendChild(buildTable()); host.dataset.built = '1'; }
    const wheelHost = $('#rlWheel');
    if (wheelHost && !wheelHost.dataset.built) { wheelHost.innerHTML = buildWheel(); wheelHost.dataset.built = '1'; }
    renderChipTray();
    const svg = host && host.querySelector('svg');
    if (svg) svg.addEventListener('click', (e) => {
      const g = e.target.closest('[data-key]'); if (!g) return;
      if (window.SFX) SFX.play('click');
      placeKey(g.getAttribute('data-key'));
    });
    const rlBtn = $('#rlBtn'); if (rlBtn) rlBtn.addEventListener('click', () => { if (window.SFX) SFX.resume(); openTable(); });
    const back = $('#rlBackBtn'); if (back) back.addEventListener('click', closeTable);
    const on = (id, fn) => { const el = $(id); if (el) el.addEventListener('click', fn); };
    on('#rlSpin', () => spin());
    on('#rlClear', clearBets);
    on('#rlUndo', undo);
    on('#rlRebet', rebet);
    on('#rlGambleBtn', () => { if (window.HD && window.HD.openGamble) window.HD.openGamble(); });
    renderInfo();
  }
  document.addEventListener('DOMContentLoaded', wire);

  /* Test hook */
  window.RL = {
    RED, colorOf, PAY, defByKey,
    getBets: () => bets, totalStaked,
    place: placeKey, setChip: (v) => { activeChip = v; }, clear: clearBets, undo, rebet,
    spinTo: (n) => { forced = n; return spin(); },
    // pure resolve for tests: given a winner, total credited from current bets
    settle: (winner) => r2(Object.values(bets).reduce((s, b) => s + (b.def.numbers.includes(winner) ? b.amount * (b.def.pay + 1) : 0), 0)),
    history: () => history,
    _wire: wire,
  };
})();
