/* =========================================================================
 * HUNTER'S DREAM 2 — symbol artwork
 * Each symbol is a self-contained inline SVG (viewBox 0 0 100 100) with
 * gradients, highlights and animation hooks (.flame, .breathe, .float …).
 * Exposed as window.SYMBOL_ART = { id: '<svg>…</svg>' }.
 * ========================================================================= */

'use strict';

(function () {
  /* ---- Playing-card gem generator (cohesive faceted look) -------------- */
  function gem(letter, id, top, bottom) {
    const two = letter.length > 1;
    return `
<svg class="art art-card" viewBox="0 0 100 100">
  <defs>
    <linearGradient id="cg_${id}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${top}"/>
      <stop offset="1" stop-color="${bottom}"/>
    </linearGradient>
    <linearGradient id="cs_${id}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#ffffff" stop-opacity=".9"/>
      <stop offset="1" stop-color="#ffffff" stop-opacity="0"/>
    </linearGradient>
  </defs>
  <g class="gem">
    <polygon points="50,7 87,31 77,80 23,80 13,31"
             fill="url(#cg_${id})" stroke="rgba(0,0,0,.4)" stroke-width="2.5"
             stroke-linejoin="round"/>
    <polygon points="50,7 87,31 50,42 13,31" fill="url(#cs_${id})" opacity=".55"/>
    <polygon points="13,31 50,42 23,80" fill="#000" opacity=".07"/>
    <polygon points="87,31 50,42 77,80" fill="#000" opacity=".16"/>
    <polygon points="50,42 77,80 23,80" fill="#fff" opacity=".06"/>
    <text x="50" y="${two ? 65 : 66}" text-anchor="middle"
          font-family="Georgia, 'Times New Roman', serif" font-weight="900"
          font-size="${two ? 30 : 40}" fill="#fff"
          stroke="rgba(0,0,0,.35)" stroke-width="1"
          paint-order="stroke">${letter}</text>
  </g>
</svg>`;
  }

  const ART = {
    /* ---------------- WILD — a flickering camp fire ------------------- */
    wild: `
<svg class="art art-wild" viewBox="0 0 100 100">
  <defs>
    <radialGradient id="fireG" cx="50%" cy="72%" r="65%">
      <stop offset="0" stop-color="#fff6c2"/>
      <stop offset="35%" stop-color="#ffd23b"/>
      <stop offset="70%" stop-color="#ff7a18"/>
      <stop offset="100%" stop-color="#c1121f"/>
    </radialGradient>
  </defs>
  <g class="logs">
    <rect x="24" y="82" width="52" height="9" rx="4" fill="#7a4a24"/>
    <rect x="28" y="79" width="44" height="8" rx="4" fill="#9a6a34"
          transform="rotate(-9 50 83)"/>
    <rect x="30" y="80" width="40" height="7" rx="3" fill="#5a3418"
          transform="rotate(8 50 84)"/>
  </g>
  <path class="flame f1"
        d="M50 12 C39 33 28 41 32 60 C35 76 46 84 50 84 C54 84 66 76 68 60 C72 41 61 33 50 12 Z"
        fill="url(#fireG)"/>
  <path class="flame f2"
        d="M50 33 C43 46 39 53 43 64 C46 74 50 78 50 78 C50 78 57 71 57 61 C57 50 53 45 50 33 Z"
        fill="#fff3b0" opacity=".92"/>
  <circle class="spark s1" cx="36" cy="30" r="2" fill="#ffe08a"/>
  <circle class="spark s2" cx="64" cy="24" r="1.6" fill="#ffd23b"/>
</svg>`,

    /* ---------------- SCATTER / BONUS — a snowy cabin ---------------- */
    scatter: `
<svg class="art art-scatter" viewBox="0 0 100 100">
  <defs>
    <linearGradient id="wallG" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#9a6134"/><stop offset="1" stop-color="#5f3a1c"/>
    </linearGradient>
    <linearGradient id="roofG" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#c9d8ea"/><stop offset="1" stop-color="#9fb2c9"/>
    </linearGradient>
  </defs>
  <g class="breathe">
    <rect x="27" y="47" width="46" height="37" rx="2" fill="url(#wallG)"/>
    <line x1="27" y1="57" x2="73" y2="57" stroke="#3f2611" stroke-width="1.5"/>
    <line x1="27" y1="67" x2="73" y2="67" stroke="#3f2611" stroke-width="1.5"/>
    <line x1="27" y1="77" x2="73" y2="77" stroke="#3f2611" stroke-width="1.5"/>
    <path d="M18 50 L50 24 L82 50 Z" fill="#5a3418"/>
    <path d="M18 47 L50 21 L82 47 Z" fill="url(#roofG)" opacity=".92"/>
    <rect x="43" y="60" width="15" height="24" rx="1.5" fill="#33200f"/>
    <circle cx="54" cy="72" r="1.5" fill="#ffd23b"/>
    <rect x="31" y="58" width="9" height="9" rx="1" fill="#ffd76a"/>
    <rect x="31" y="58" width="9" height="9" rx="1" fill="none" stroke="#33200f" stroke-width="1.5"/>
  </g>
  <g class="bonus-ribbon">
    <rect x="14" y="86" width="72" height="12" rx="6" fill="#b8161f"/>
    <text x="50" y="95" text-anchor="middle" font-family="Arial Black, sans-serif"
          font-weight="900" font-size="9" fill="#ffd76a" letter-spacing="1">BONUS</text>
  </g>
</svg>`,

    /* ---------------- HUNTER — bearded hunter with rifle ------------- */
    hunter: `
<svg class="art" viewBox="0 0 100 100">
  <g class="breathe">
    <rect x="18" y="28" width="64" height="5" rx="2.5" fill="#2c2016"
          transform="rotate(-27 50 52)"/>
    <rect x="70" y="47" width="10" height="8" rx="2" fill="#3a2a1a"
          transform="rotate(-27 50 52)"/>
    <path d="M20 94 C20 75 33 66 50 66 C67 66 80 75 80 94 Z" fill="#3d5a34"/>
    <path d="M42 66 h16 l-3 8 h-10 Z" fill="#2f4728"/>
    <rect x="44" y="57" width="12" height="12" rx="3" fill="#d79a6a"/>
    <circle cx="50" cy="47" r="16" fill="#eab98c"/>
    <path d="M35 49 C35 66 44 73 50 73 C56 73 65 66 65 49 C65 60 57 63 50 63 C43 63 35 60 35 49 Z"
          fill="#5a3f24"/>
    <ellipse cx="50" cy="35" rx="25" ry="6.5" fill="#3f2e1a"/>
    <path d="M34 36 C34 21 41 15 50 15 C59 15 66 21 66 36 Z" fill="#5a4127"/>
    <rect x="34" y="30" width="32" height="6" rx="1" fill="#7a2e1f"/>
    <circle cx="44" cy="46" r="2.3" fill="#2a1a0e"/>
    <circle cx="56" cy="46" r="2.3" fill="#2a1a0e"/>
    <path d="M40 40 q4 -3 8 0" stroke="#3a2a18" stroke-width="1.6" fill="none"/>
    <path d="M52 40 q4 -3 8 0" stroke="#3a2a18" stroke-width="1.6" fill="none"/>
  </g>
</svg>`,

    /* ---------------- WOLF — howling grey wolf head ----------------- */
    wolf: `
<svg class="art" viewBox="0 0 100 100">
  <defs>
    <linearGradient id="wolfG" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#a9bcd4"/><stop offset="1" stop-color="#465a74"/>
    </linearGradient>
  </defs>
  <g class="breathe">
    <path d="M27 42 L22 11 L45 31 Z" fill="url(#wolfG)" stroke="#2c3a4d" stroke-width="2.2" stroke-linejoin="round"/>
    <path d="M73 42 L78 11 L55 31 Z" fill="url(#wolfG)" stroke="#2c3a4d" stroke-width="2.2" stroke-linejoin="round"/>
    <path d="M50 28 C33 28 25 43 27 60 C29 75 39 86 50 90 C61 86 71 75 73 60 C75 43 67 28 50 28 Z"
          fill="url(#wolfG)" stroke="#2c3a4d" stroke-width="2.2"/>
    <path d="M41 60 L50 55 L59 60 L55 80 L50 85 L45 80 Z" fill="#e3ebf4"/>
    <path d="M50 55 L50 85" stroke="#c2cdda" stroke-width="1.4"/>
    <circle cx="50" cy="79" r="4.2" fill="#161e29"/>
    <path d="M36 55 l10 -3 -7 7 Z" fill="#ffd23b"/>
    <path d="M64 55 l-10 -3 7 7 Z" fill="#ffd23b"/>
    <circle cx="41.5" cy="55" r="1.4" fill="#161e29"/>
    <circle cx="58.5" cy="55" r="1.4" fill="#161e29"/>
  </g>
</svg>`,

    /* ---------------- BEAR — brown bear head ------------------------ */
    bear: `
<svg class="art" viewBox="0 0 100 100">
  <defs>
    <radialGradient id="bearG" cx="50%" cy="38%" r="72%">
      <stop offset="0" stop-color="#b5844f"/><stop offset="1" stop-color="#6b4423"/>
    </radialGradient>
  </defs>
  <g class="breathe">
    <circle cx="27" cy="33" r="13" fill="url(#bearG)" stroke="#432a13" stroke-width="2.2"/>
    <circle cx="73" cy="33" r="13" fill="url(#bearG)" stroke="#432a13" stroke-width="2.2"/>
    <circle cx="27" cy="33" r="5.5" fill="#3a2412"/>
    <circle cx="73" cy="33" r="5.5" fill="#3a2412"/>
    <circle cx="50" cy="57" r="31" fill="url(#bearG)" stroke="#432a13" stroke-width="2.2"/>
    <ellipse cx="50" cy="68" rx="17" ry="13" fill="#dcb98d"/>
    <circle cx="40" cy="50" r="4" fill="#241608"/>
    <circle cx="60" cy="50" r="4" fill="#241608"/>
    <circle cx="41.4" cy="48.6" r="1.2" fill="#fff" opacity=".8"/>
    <circle cx="61.4" cy="48.6" r="1.2" fill="#fff" opacity=".8"/>
    <ellipse cx="50" cy="61" rx="6.5" ry="4.8" fill="#241608"/>
    <path d="M50 66 v7" stroke="#241608" stroke-width="2" stroke-linecap="round"/>
  </g>
</svg>`,

    /* ---------------- BOAR — dark boar with tusks ------------------- */
    boar: `
<svg class="art" viewBox="0 0 100 100">
  <defs>
    <linearGradient id="boarG" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#6b5b4a"/><stop offset="1" stop-color="#33261c"/>
    </linearGradient>
  </defs>
  <g class="breathe">
    <path d="M30 34 L24 20 L40 30 Z" fill="#3a2c20"/>
    <path d="M70 34 L76 20 L60 30 Z" fill="#3a2c20"/>
    <path d="M50 28 C34 28 25 41 27 57 C29 73 40 84 50 84 C60 84 71 73 73 57 C75 41 66 28 50 28 Z"
          fill="url(#boarG)" stroke="#1f1710" stroke-width="2"/>
    <path d="M40 40 L48 42 M60 40 L52 42" stroke="#c9b89a" stroke-width="2" stroke-linecap="round"/>
    <circle cx="41" cy="52" r="3.4" fill="#ffb020"/>
    <circle cx="59" cy="52" r="3.4" fill="#ffb020"/>
    <circle cx="41" cy="52" r="1.4" fill="#1f1710"/>
    <circle cx="59" cy="52" r="1.4" fill="#1f1710"/>
    <ellipse cx="50" cy="70" rx="12" ry="9" fill="#4a3a2c"/>
    <ellipse cx="45" cy="70" rx="2.2" ry="3.2" fill="#1f1710"/>
    <ellipse cx="55" cy="70" rx="2.2" ry="3.2" fill="#1f1710"/>
    <path d="M40 74 C34 78 33 66 38 62" fill="none" stroke="#efe6d2" stroke-width="4" stroke-linecap="round"/>
    <path d="M60 74 C66 78 67 66 62 62" fill="none" stroke="#efe6d2" stroke-width="4" stroke-linecap="round"/>
  </g>
</svg>`,

    /* ---------------- EAGLE — bald eagle head ----------------------- */
    eagle: `
<svg class="art" viewBox="0 0 100 100">
  <defs>
    <linearGradient id="eagleB" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#5a4632"/><stop offset="1" stop-color="#2e2116"/>
    </linearGradient>
  </defs>
  <g class="float">
    <path d="M50 84 C34 84 26 70 30 56 L70 56 C74 70 66 84 50 84 Z" fill="url(#eagleB)"/>
    <path d="M50 18 C33 18 24 33 26 49 C27 56 33 60 50 60 C67 60 73 56 74 49 C76 33 67 18 50 18 Z"
          fill="#ffffff"/>
    <path d="M50 20 C36 20 27 33 28 47 C40 43 60 43 72 47 C73 33 64 20 50 20 Z"
          fill="#f0f3f6"/>
    <circle cx="42" cy="40" r="3.4" fill="#20242a"/>
    <circle cx="43.2" cy="38.8" r="1.1" fill="#fff"/>
    <path d="M28 46 C16 46 14 52 22 55 C28 57 34 53 34 49 Z" fill="#f5a623"/>
    <path d="M20 52 C15 53 16 57 21 56 Z" fill="#e08a12"/>
    <path d="M34 49 q-3 4 -8 4" stroke="#c97a10" stroke-width="1.4" fill="none"/>
  </g>
</svg>`,

    ace:   gem('A', 'ace', '#ffe07a', '#b8860b'),
    king:  gem('K', 'king', '#ff6b6b', '#a01818'),
    queen: gem('Q', 'queen', '#d78bef', '#7a2ea0'),
    jack:  gem('J', 'jack', '#7ee89a', '#1f8a3f'),
    ten:   gem('10', 'ten', '#ffb877', '#c05a10'),
    nine:  gem('9', 'nine', '#8ec2ff', '#1f5fc0'),
  };

  window.SYMBOL_ART = ART;
})();
