/* =========================================================================
 * ADVENTURE SPINS — Blackjack table (machine blackjack)
 * Shares the slot's balance (window.HD.state.credit). Classic rules:
 *   6 decks · dealer stands on soft 17 · blackjack pays 3:2 · double + split.
 * Side bets: Perfect Pairs, 21+3, Lucky Lucky, plus Insurance.
 * No external files. Exposed as window.BJ for tests.
 * ========================================================================= */
'use strict';

(function () {
  const $ = (s) => document.querySelector(s);

  const RANKS = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
  const SUITS = ['♠', '♥', '♦', '♣'];
  const RED = (s) => s === '♥' || s === '♦';
  const DECKS = 6;
  const BJ_PAY = 1.5;                 // 3:2
  const DEALER_HITS_SOFT17 = false;   // S17
  const CHIPS = [1, 5, 25, 100, 500];
  const MIN_BET = 1;

  // Side-bet paytables (X:1 — win returns stake × (X+1)).
  const PP_PAY = { perfect: 25, colored: 12, mixed: 6 };
  const T3_PAY = { suitedTrips: 100, straightFlush: 40, trips: 30, straight: 10, flush: 5 };

  const r2 = (n) => (window.HD ? window.HD.round2(n) : Math.round(n * 100) / 100);
  const money = (n) => (window.HD ? window.HD.fmt(n) : (Math.round(n * 100) / 100).toFixed(2));
  const credit = () => (window.HD ? window.HD.state.credit : 0);
  function adjust(delta) {
    if (window.HD) window.HD.state.credit = r2(window.HD.state.credit + delta);
    sync();
  }
  function sync() {
    const c = $('#bjCredit'); if (c) c.textContent = money(credit());
    if (window.HD) { window.HD.updateMeters(); window.HD.saveGame(); }
  }

  let activeChip = 25;
  let bj = null;

  /* --------------------------- Card helpers ---------------------------- */
  function buildShoe() {
    const shoe = [];
    for (let d = 0; d < DECKS; d++)
      for (const r of RANKS)
        for (const s of SUITS)
          shoe.push({ r, s });
    // Fisher–Yates
    for (let i = shoe.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const t = shoe[i]; shoe[i] = shoe[j]; shoe[j] = t;
    }
    return shoe;
  }
  function ensureShoe() {
    if (bj.noAutoShoe) return;   // a rigged shoe (tests) must not be rebuilt
    if (!bj.shoe || bj.shoe.length < DECKS * 52 * 0.25) bj.shoe = buildShoe();
  }
  const draw = () => bj.shoe.shift();

  function value(cards) {
    let total = 0, aces = 0;
    for (const c of cards) {
      if (c.r === 'A') { total += 11; aces++; }
      else if (c.r === 'K' || c.r === 'Q' || c.r === 'J' || c.r === '10') total += 10;
      else total += +c.r;
    }
    while (total > 21 && aces > 0) { total -= 10; aces--; }
    return { total, soft: aces > 0 };
  }
  const isBlackjack = (cards) => cards.length === 2 && value(cards).total === 21;

  /* --------------------------- Side bets ------------------------------- */
  function evalPP(a, b) {
    if (a.r !== b.r) return null;
    if (a.s === b.s) return { mult: PP_PAY.perfect, name: 'Tökéletes pár' };
    if (RED(a.s) === RED(b.s)) return { mult: PP_PAY.colored, name: 'Szín-pár' };
    return { mult: PP_PAY.mixed, name: 'Vegyes pár' };
  }
  function evalT3(cards) {
    const suits = cards.map((c) => c.s), ranks = cards.map((c) => c.r);
    const flush = suits.every((s) => s === suits[0]);
    const counts = {}; ranks.forEach((r) => (counts[r] = (counts[r] || 0) + 1));
    const trips = Object.values(counts).some((n) => n === 3);
    const order = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
    const consec = (a) => a[0] + 1 === a[1] && a[1] + 1 === a[2];
    let straight = false;
    if (new Set(ranks).size === 3) {
      const idx = ranks.map((r) => order.indexOf(r)).sort((x, y) => x - y);
      straight = consec(idx);
      if (!straight && ranks.includes('A')) {
        const idx2 = ranks.map((r) => (r === 'A' ? 13 : order.indexOf(r))).sort((x, y) => x - y);
        straight = consec(idx2);
      }
    }
    if (trips && flush) return { mult: T3_PAY.suitedTrips, name: 'Színazonos trió' };
    if (straight && flush) return { mult: T3_PAY.straightFlush, name: 'Színsor' };
    if (trips) return { mult: T3_PAY.trips, name: 'Drill' };
    if (straight) return { mult: T3_PAY.straight, name: 'Sor' };
    if (flush) return { mult: T3_PAY.flush, name: 'Szín' };
    return null;
  }
  function llSum(cards) {
    let base = 0, aces = 0;
    for (const c of cards) {
      if (c.r === 'A') { base += 1; aces++; }
      else if (c.r === 'K' || c.r === 'Q' || c.r === 'J' || c.r === '10') base += 10;
      else base += +c.r;
    }
    const sums = new Set();
    for (let j = 0; j <= aces; j++) sums.add(base + 10 * j);
    for (const t of [21, 20, 19]) if (sums.has(t)) return t;
    return 0;
  }
  function evalLL(cards) {
    const ranks = cards.map((c) => c.r), suits = cards.map((c) => c.s);
    const suited = suits.every((s) => s === suits[0]);
    const all7 = ranks.every((r) => r === '7');
    const is678 = new Set(ranks).size === 3 && ['6', '7', '8'].every((r) => ranks.includes(r));
    if (all7 && suited) return { mult: 100, name: '777 színazonos' };
    if (is678 && suited) return { mult: 50, name: '6-7-8 színazonos' };
    if (all7) return { mult: 30, name: '777' };
    if (is678) return { mult: 15, name: '6-7-8' };
    const s = llSum(cards);
    if (s === 21 && suited) return { mult: 10, name: '21 színazonos' };
    if (s === 21) return { mult: 3, name: '21' };
    if (s === 20) return { mult: 2, name: '20' };
    if (s === 19) return { mult: 2, name: '19' };
    return null;
  }

  /* --------------------------- Betting --------------------------------- */
  function newRound() {
    bj = bj || { shoe: null };
    bj.phase = 'bet';
    bj.bets = { main: 0, pp: 0, t3: 0, ll: 0 };
    bj.dealer = [];
    bj.hideHole = true;
    bj.hands = [];
    bj.active = 0;
    bj.insurance = 0;
    bj.msg = 'Tedd meg a téted, majd OSZT!';
    render();
  }
  const totalStaked = () => r2(bj.bets.main + bj.bets.pp + bj.bets.t3 + bj.bets.ll);

  function placeBet(spot) {
    if (bj.phase !== 'bet' && bj.phase !== 'done') return;
    if (bj.phase === 'done') resetTable();
    if (totalStaked() + activeChip > credit()) { flash('Nincs elég kredit ehhez a téthez.'); return; }
    bj.bets[spot] = r2(bj.bets[spot] + activeChip);
    render();
  }
  function clearBets() {
    if (bj.phase !== 'bet' && bj.phase !== 'done') return;
    if (bj.phase === 'done') resetTable();
    bj.bets = { main: 0, pp: 0, t3: 0, ll: 0 };
    render();
  }
  function rebet() {
    if (!bj.lastBets) return;
    if (bj.phase === 'done') resetTable();
    if (bj.phase !== 'bet') return;
    const t = bj.lastBets.main + bj.lastBets.pp + bj.lastBets.t3 + bj.lastBets.ll;
    if (t > credit()) { flash('Nincs elég kredit az ismétléshez.'); return; }
    bj.bets = Object.assign({}, bj.lastBets);
    render();
  }
  function resetTable() {
    bj.phase = 'bet';
    bj.dealer = []; bj.hideHole = true; bj.hands = []; bj.active = 0; bj.insurance = 0;
    bj.bets = { main: 0, pp: 0, t3: 0, ll: 0 };
  }

  /* --------------------------- Deal ------------------------------------ */
  function deal() {
    if (bj.phase === 'done') resetTable();
    if (bj.phase !== 'bet') return;
    if (bj.bets.main < MIN_BET) { flash('Adj meg egy fő tétet (TÉT).'); return; }
    const stake = totalStaked();
    if (stake > credit()) { flash('Nincs elég kredit.'); return; }
    ensureShoe();
    adjust(-stake);                       // take all bets up front
    bj.lastBets = Object.assign({}, bj.bets);
    bj.sideMsgs = [];
    bj.hands = [{ cards: [draw()], bet: bj.bets.main, done: false, doubled: false, splitAce: false }];
    bj.dealer = [draw()];                 // up card
    bj.hands[0].cards.push(draw());
    bj.dealer.push(draw());               // hole card
    bj.hideHole = true;

    resolveSideBets();

    const up = bj.dealer[0];
    if (up.r === 'A') { bj.phase = 'insurance'; bj.msg = 'Az osztónál Ász — kérsz biztosítást?'; render(); return; }
    peekAndContinue();
  }

  function resolveSideBets() {
    const p = bj.hands[0].cards, up = bj.dealer[0];
    const three = [p[0], p[1], up];
    const wins = [];
    if (bj.bets.pp > 0) {
      const r = evalPP(p[0], p[1]);
      if (r) { const pay = r2(bj.bets.pp * (r.mult + 1)); adjust(pay); wins.push(`Perfect Pairs: ${r.name} ${r.mult}:1 → +${money(pay - bj.bets.pp)} €`); }
      else wins.push('Perfect Pairs: nincs');
    }
    if (bj.bets.t3 > 0) {
      const r = evalT3(three);
      if (r) { const pay = r2(bj.bets.t3 * (r.mult + 1)); adjust(pay); wins.push(`21+3: ${r.name} ${r.mult}:1 → +${money(pay - bj.bets.t3)} €`); }
      else wins.push('21+3: nincs');
    }
    if (bj.bets.ll > 0) {
      const r = evalLL(three);
      if (r) { const pay = r2(bj.bets.ll * (r.mult + 1)); adjust(pay); wins.push(`Lucky Lucky: ${r.name} ${r.mult}:1 → +${money(pay - bj.bets.ll)} €`); }
      else wins.push('Lucky Lucky: nincs');
    }
    bj.sideMsgs = wins;
  }

  function takeInsurance(yes) {
    if (bj.phase !== 'insurance') return;
    if (yes) {
      const cost = r2(bj.bets.main / 2);
      if (cost <= credit()) { bj.insurance = cost; adjust(-cost); }
      else flash('Nincs elég kredit a biztosításhoz.');
    }
    peekAndContinue();
  }

  function peekAndContinue() {
    const dealerBJ = isBlackjack(bj.dealer);
    if (bj.insurance > 0) {
      if (dealerBJ) { const pay = r2(bj.insurance * 3); adjust(pay); bj.sideMsgs.push(`Biztosítás nyert 2:1 → +${money(pay - bj.insurance)} €`); }
      else bj.sideMsgs.push('Biztosítás elveszett');
    }
    if (dealerBJ) { bj.hideHole = false; return finishRound('Az osztónak BLACKJACK-je van.'); }
    if (isBlackjack(bj.hands[0].cards)) { bj.hideHole = false; return finishRound(null); } // player natural
    bj.phase = 'player';
    bj.active = 0;
    bj.msg = 'Te jössz — LAP vagy MEGÁLL?';
    render();
  }

  /* --------------------------- Player actions -------------------------- */
  const hand = () => bj.hands[bj.active];
  function canDouble() { const h = hand(); return bj.phase === 'player' && h.cards.length === 2 && !h.splitAce && credit() >= h.bet; }
  function canSplit() {
    const h = hand();
    if (bj.phase !== 'player' || h.cards.length !== 2 || bj.hands.length >= 4) return false;
    const [a, b] = h.cards;
    const same = a.r === b.r || (value([a]).total === 10 && value([b]).total === 10);
    return same && credit() >= h.bet;
  }

  function hit() {
    if (bj.phase !== 'player') return;
    hand().cards.push(draw());
    const v = value(hand().cards).total;
    if (v >= 21) { hand().done = true; advance(); } else render();
  }
  function stand() { if (bj.phase !== 'player') return; hand().done = true; advance(); }
  function double() {
    if (!canDouble()) return;
    const h = hand();
    adjust(-h.bet); h.bet = r2(h.bet * 2); h.doubled = true;
    h.cards.push(draw()); h.done = true; advance();
  }
  function split() {
    if (!canSplit()) return;
    const h = hand();
    adjust(-h.bet);
    const moved = h.cards.pop();
    const isAce = h.cards[0].r === 'A';
    const nh = { cards: [moved], bet: h.bet, done: false, doubled: false, splitAce: isAce };
    h.cards.push(draw());
    nh.cards.push(draw());
    h.splitAce = isAce;
    if (isAce) { h.done = true; nh.done = true; }       // split aces: one card each, stand
    bj.hands.splice(bj.active + 1, 0, nh);
    if (h.done) advance(); else render();
  }

  function advance() {
    while (bj.active < bj.hands.length && bj.hands[bj.active].done) bj.active++;
    if (bj.active < bj.hands.length) {
      // a fresh split hand with a natural 21 or single card auto-resolves
      if (value(hand().cards).total >= 21) { hand().done = true; return advance(); }
      bj.msg = bj.hands.length > 1 ? `${bj.active + 1}. kéz — LAP vagy MEGÁLL?` : 'Te jössz — LAP vagy MEGÁLL?';
      render();
    } else {
      dealerPlay();
    }
  }

  /* --------------------------- Dealer + resolve ------------------------ */
  function dealerPlay() {
    bj.phase = 'dealer';
    bj.hideHole = false;
    const anyLive = bj.hands.some((h) => value(h.cards).total <= 21);
    if (anyLive) {
      // S17: hit while below 17, stand on all 17s.
      let guard = 0;
      while (guard++ < 20) {
        const v = value(bj.dealer);
        if (v.total < 17 || (DEALER_HITS_SOFT17 && v.total === 17 && v.soft)) bj.dealer.push(draw());
        else break;
      }
    }
    finishRound(null);
  }

  function finishRound(msg) {
    const dv = value(bj.dealer).total;
    const dealerBJ = isBlackjack(bj.dealer);
    const dealerBust = dv > 21;
    const results = [];
    for (const h of bj.hands) {
      const pv = value(h.cards).total;
      const playerBJ = isBlackjack(h.cards) && bj.hands.length === 1;
      let out, pay = 0;
      if (pv > 21) { out = 'Beégett'; }
      else if (playerBJ && !dealerBJ) { pay = r2(h.bet + h.bet * BJ_PAY); out = 'BLACKJACK! 3:2'; }
      else if (dealerBJ && !playerBJ) { out = 'Osztó BJ'; }
      else if (playerBJ && dealerBJ) { pay = h.bet; out = 'Push (BJ)'; }
      else if (dealerBust || pv > dv) { pay = r2(h.bet * 2); out = 'Nyertél'; }
      else if (pv === dv) { pay = h.bet; out = 'Push'; }
      else { out = 'Vesztettél'; }
      if (pay > 0) adjust(pay);
      h.outcome = out;
      results.push(bj.hands.length > 1 ? `${out}` : out);
    }
    bj.phase = 'done';
    bj.lastResult = results;
    bj.msg = msg ? msg : results.join(' · ');
    bj.lastBets = Object.assign({}, bj.bets);
    render();
  }

  /* --------------------------- Rendering ------------------------------- */
  function cardHTML(c, faceDown) {
    if (faceDown) return '<div class="bj-card back"></div>';
    return `<div class="bj-card ${RED(c.s) ? 'red' : 'black'}"><span class="cr">${c.r}</span><span class="cs">${c.s}</span></div>`;
  }
  function handHTML(cards, hideLast) {
    return cards.map((c, i) => cardHTML(c, hideLast && i === cards.length - 1)).join('');
  }
  function flash(text) { bj.msg = text; const m = $('#bjMsg'); if (m) m.textContent = text; }

  function render() {
    if (!bj) return;
    // dealer
    const dc = $('#bjDealerCards'); if (dc) dc.innerHTML = handHTML(bj.dealer, bj.hideHole);
    const dv = $('#bjDealerVal');
    if (dv) {
      if (!bj.dealer.length) dv.textContent = '';
      else if (bj.hideHole) dv.textContent = value([bj.dealer[0]]).total + ' + ?';
      else dv.textContent = value(bj.dealer).total + (isBlackjack(bj.dealer) ? ' · BJ' : '');
    }
    // player hands
    const ph = $('#bjPlayerHands');
    if (ph) {
      ph.innerHTML = bj.hands.map((h, i) => {
        const v = value(h.cards);
        const act = (bj.phase === 'player' && i === bj.active) ? ' active' : '';
        const tag = h.outcome ? `<span class="bj-outcome">${h.outcome}</span>` : '';
        const split = bj.hands.length > 1 ? `<span class="bj-hand-idx">${i + 1}. kéz</span>` : '';
        return `<div class="bj-hand${act}"><div class="bj-hand-top">${split}<span class="bj-hand-val">${v.total}${v.soft ? ' (soft)' : ''}</span> <span class="bj-hand-bet">tét ${money(h.bet)} €</span>${tag}</div><div class="bj-cards">${handHTML(h.cards, false)}</div></div>`;
      }).join('');
    }
    // bet spots
    const setSpot = (id, v) => { const el = $(id); if (el) el.textContent = money(v); };
    setSpot('#bjBetMain', bj.bets.main); setSpot('#bjBetPp', bj.bets.pp);
    setSpot('#bjBetT3', bj.bets.t3); setSpot('#bjBetLl', bj.bets.ll);
    const st = $('#bjStake'); if (st) st.textContent = money(totalStaked());
    // message + side messages
    const m = $('#bjMsg'); if (m) m.textContent = bj.msg || '';
    const sm = $('#bjSideMsg');
    if (sm) sm.innerHTML = (bj.phase !== 'bet' && bj.sideMsgs && bj.sideMsgs.length)
      ? bj.sideMsgs.map((t) => `<span class="bj-side-line">${t}</span>`).join('') : '';
    // credit
    const c = $('#bjCredit'); if (c) c.textContent = money(credit());
    // action groups
    const show = (id, on) => { const el = $(id); if (el) el.classList.toggle('hidden', !on); };
    const betting = bj.phase === 'bet' || bj.phase === 'done';
    show('#bjBetActions', betting);
    show('#bjChips', betting);
    show('#bjSpots', true);
    show('#bjPlayActions', bj.phase === 'player');
    show('#bjInsActions', bj.phase === 'insurance');
    if (bj.phase === 'player') {
      const dbl = $('#bjDouble'), spl = $('#bjSplit');
      if (dbl) dbl.disabled = !canDouble();
      if (spl) spl.disabled = !canSplit();
    }
    const dealBtn = $('#bjDeal'); if (dealBtn) dealBtn.textContent = bj.phase === 'done' ? 'ÚJ LEOSZTÁS' : 'OSZT';
    renderChips();
  }
  function renderChips() {
    const wrap = $('#bjChips'); if (!wrap) return;
    if (wrap.dataset.built !== '1') {
      wrap.innerHTML = CHIPS.map((v) => `<button class="bj-chip" data-chip="${v}" type="button">${v}</button>`).join('');
      wrap.dataset.built = '1';
      wrap.querySelectorAll('.bj-chip').forEach((b) => b.addEventListener('click', () => {
        activeChip = +b.dataset.chip; renderChips();
      }));
    }
    wrap.querySelectorAll('.bj-chip').forEach((b) => b.classList.toggle('active', +b.dataset.chip === activeChip));
  }

  /* --------------------------- View toggle + wiring -------------------- */
  function openTable() {
    const bv = $('#bjView'), cab = $('#slotView');
    if (!bv || !cab) return;
    if (window.HD && window.HD.stopAutoplay) window.HD.stopAutoplay();
    cab.classList.add('hidden');
    bv.classList.remove('hidden');
    if (!bj) newRound(); else { sync(); render(); }
  }
  function closeTable() {
    const bv = $('#bjView'), cab = $('#slotView');
    if (bv) bv.classList.add('hidden');
    if (cab) cab.classList.remove('hidden');
    if (window.HD && window.HD.updateMeters) window.HD.updateMeters();
  }

  function wire() {
    const bjBtn = $('#bjBtn'); if (bjBtn) bjBtn.addEventListener('click', () => { if (window.SFX) SFX.resume(); openTable(); });
    const back = $('#bjBackBtn'); if (back) back.addEventListener('click', closeTable);
    $('#bjSpots') && $('#bjSpots').querySelectorAll('.bj-spot').forEach((el) => {
      el.addEventListener('click', () => { if (window.SFX) SFX.play('click'); placeBet(el.dataset.spot); });
    });
    const on = (id, fn) => { const el = $(id); if (el) el.addEventListener('click', fn); };
    on('#bjDeal', () => { if (window.SFX) SFX.play('cardFlip'); deal(); });
    on('#bjClear', clearBets);
    on('#bjRebet', rebet);
    on('#bjHit', () => { if (window.SFX) SFX.play('cardFlip'); hit(); });
    on('#bjStand', stand);
    on('#bjDouble', () => { if (window.SFX) SFX.play('cardFlip'); double(); });
    on('#bjSplit', () => { if (window.SFX) SFX.play('cardFlip'); split(); });
    on('#bjInsYes', () => takeInsurance(true));
    on('#bjInsNo', () => takeInsurance(false));
    newRound();
  }

  document.addEventListener('DOMContentLoaded', wire);

  /* Test hook. `rig` sets the exact cards the next draws return (front first). */
  window.BJ = {
    state: () => bj,
    value, isBlackjack, evalPP, evalT3, evalLL, llSum,
    newRound, placeBet, clearBets, deal, hit, stand, double, split, takeInsurance,
    setChip: (v) => { activeChip = v; },
    rig: (cards) => { if (!bj) newRound(); bj.shoe = cards.slice(); bj.noAutoShoe = true; },
    setBets: (b) => { bj.bets = Object.assign({ main: 0, pp: 0, t3: 0, ll: 0 }, b); },
  };
})();
