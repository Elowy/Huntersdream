/* =========================================================================
 * HUNTER'S DREAM 2 — symbol artwork (rich SVG set)
 * Each symbol is a self-contained inline SVG (viewBox 0 0 100 100) with
 * gradients, shading, highlights and animation hooks
 * (.flame, .breathe, .float …). Exposed as window.SYMBOL_ART.
 * ========================================================================= */

'use strict';

(function () {
  /* Soft radial medallion placed behind the high (animal / hunter) symbols
   * so they read as a designed, premium set on the light reel cells. */
  const disc = (id, c) => `
    <radialGradient id="${id}" cx="50%" cy="42%" r="62%">
      <stop offset="0" stop-color="${c}" stop-opacity=".55"/>
      <stop offset="60%" stop-color="${c}" stop-opacity=".18"/>
      <stop offset="100%" stop-color="${c}" stop-opacity="0"/>
    </radialGradient>`;

  /* ---- Playing-card gem generator -------------------------------------- */
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
      <stop offset="0" stop-color="#ffffff" stop-opacity=".95"/>
      <stop offset="1" stop-color="#ffffff" stop-opacity="0"/>
    </linearGradient>
    <radialGradient id="cd_${id}" cx="50%" cy="45%" r="60%">
      <stop offset="0" stop-color="${top}" stop-opacity=".35"/>
      <stop offset="100%" stop-color="${top}" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <g class="gem">
    <circle cx="50" cy="50" r="42" fill="url(#cd_${id})"/>
    <polygon points="50,7 88,31 78,82 22,82 12,31"
             fill="url(#cg_${id})" stroke="rgba(0,0,0,.45)" stroke-width="3"
             stroke-linejoin="round"/>
    <polygon points="50,7 88,31 50,43 12,31" fill="url(#cs_${id})" opacity=".6"/>
    <polygon points="12,31 50,43 22,82" fill="#000" opacity=".08"/>
    <polygon points="88,31 50,43 78,82" fill="#000" opacity=".18"/>
    <polygon points="50,43 78,82 22,82" fill="#fff" opacity=".07"/>
    <polyline points="16,32 50,45 84,32" fill="none" stroke="#fff" stroke-width="1" opacity=".35"/>
    <text x="50" y="${two ? 66 : 67}" text-anchor="middle"
          font-family="Georgia, 'Times New Roman', serif" font-weight="900"
          font-size="${two ? 32 : 42}" fill="#fff"
          stroke="rgba(0,0,0,.4)" stroke-width="1.2"
          paint-order="stroke">${letter}</text>
  </g>
</svg>`;
  }

  const ART = {
    /* ---------------- WILD — a roaring camp fire --------------------- */
    wild: `
<svg class="art art-wild" viewBox="0 0 100 100">
  <defs>
    <radialGradient id="fireGlow" cx="50%" cy="66%" r="55%">
      <stop offset="0" stop-color="#ffcf5e" stop-opacity=".85"/>
      <stop offset="100%" stop-color="#ff7a18" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="fireG" cx="50%" cy="74%" r="62%">
      <stop offset="0" stop-color="#fff7cc"/>
      <stop offset="32%" stop-color="#ffd23b"/>
      <stop offset="66%" stop-color="#ff7a18"/>
      <stop offset="100%" stop-color="#b3151f"/>
    </radialGradient>
    <linearGradient id="logG" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#a06a34"/><stop offset="1" stop-color="#5a3418"/>
    </linearGradient>
  </defs>
  <circle cx="50" cy="60" r="46" fill="url(#fireGlow)"/>
  <g class="logs">
    <rect x="22" y="83" width="56" height="9" rx="4.5" fill="url(#logG)"/>
    <rect x="26" y="80" width="48" height="8" rx="4" fill="#b07a3e"
          transform="rotate(-10 50 84)"/>
    <rect x="28" y="81" width="44" height="7" rx="3.5" fill="#4a2c12"
          transform="rotate(9 50 85)"/>
    <circle cx="26" cy="87" r="3.5" fill="#3a2410"/>
    <circle cx="74" cy="86" r="3.5" fill="#3a2410"/>
  </g>
  <path class="flame f1"
        d="M50 10 C37 32 25 42 30 62 C34 79 46 86 50 86 C54 86 66 79 70 62 C75 42 63 32 50 10 Z"
        fill="url(#fireG)"/>
  <path class="flame f3"
        d="M34 46 C28 56 27 66 33 74 C33 66 37 60 41 55 C39 51 36 48 34 46 Z"
        fill="#ff9a2e" opacity=".85"/>
  <path class="flame f3b"
        d="M66 46 C72 56 73 66 67 74 C67 66 63 60 59 55 C61 51 64 48 66 46 Z"
        fill="#ff9a2e" opacity=".85"/>
  <path class="flame f2"
        d="M50 34 C43 47 40 55 44 66 C47 76 50 80 50 80 C50 80 57 73 57 62 C57 51 53 46 50 34 Z"
        fill="#fff4b8"/>
  <circle class="spark s1" cx="36" cy="28" r="2.2" fill="#ffe08a"/>
  <circle class="spark s2" cx="63" cy="22" r="1.8" fill="#ffd23b"/>
  <circle class="spark s3" cx="52" cy="18" r="1.5" fill="#fff2c0"/>
</svg>`,

    /* ---------------- SCATTER / BONUS — a snowy log cabin ------------ */
    scatter: `
<svg class="art art-scatter" viewBox="0 0 100 100">
  <defs>
    <linearGradient id="wallG" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#a86a38"/><stop offset="1" stop-color="#583619"/>
    </linearGradient>
    <linearGradient id="roofG" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#f2f7fc"/><stop offset="1" stop-color="#b9c9dc"/>
    </linearGradient>
    <radialGradient id="skyG" cx="50%" cy="35%" r="70%">
      <stop offset="0" stop-color="#2a3a58"/><stop offset="1" stop-color="#0e1626"/>
    </radialGradient>
  </defs>
  <circle cx="50" cy="48" r="46" fill="url(#skyG)"/>
  <circle cx="72" cy="26" r="8" fill="#f4f0d8" opacity=".9"/>
  <g class="breathe">
    <rect x="26" y="48" width="48" height="37" rx="2" fill="url(#wallG)"/>
    <line x1="26" y1="57" x2="74" y2="57" stroke="#3a2410" stroke-width="1.6"/>
    <line x1="26" y1="66" x2="74" y2="66" stroke="#3a2410" stroke-width="1.6"/>
    <line x1="26" y1="75" x2="74" y2="75" stroke="#3a2410" stroke-width="1.6"/>
    <path d="M17 51 L50 25 L83 51 Z" fill="#4a2c12"/>
    <path d="M17 48 L50 22 L83 48 Z" fill="url(#roofG)"/>
    <path d="M50 22 L83 48 L83 51 L50 25 Z" fill="#000" opacity=".12"/>
    <rect x="44" y="61" width="15" height="24" rx="1.5" fill="#301d0d"/>
    <rect x="44" y="61" width="15" height="24" rx="1.5" fill="none" stroke="#1c1109" stroke-width="1.5"/>
    <circle cx="55.5" cy="73" r="1.5" fill="#ffd23b"/>
    <rect x="30" y="60" width="10" height="10" rx="1" fill="#ffd76a"/>
    <path d="M35 60 v10 M30 65 h10" stroke="#301d0d" stroke-width="1.4"/>
    <rect x="30" y="60" width="10" height="10" rx="1" fill="none" stroke="#301d0d" stroke-width="1.6"/>
  </g>
  <g class="bonus-ribbon">
    <rect x="12" y="86" width="76" height="13" rx="6.5" fill="#b8161f" stroke="#7a0d13" stroke-width="1"/>
    <text x="50" y="95.5" text-anchor="middle" font-family="Arial Black, sans-serif"
          font-weight="900" font-size="9" fill="#ffe08a" letter-spacing="1.5">BONUS</text>
  </g>
</svg>`,

    /* ---------------- HUNTER — bearded hunter with rifle ------------- */
    hunter: `
<svg class="art" viewBox="0 0 100 100">
  <defs>
    ${disc('hDisc', '#e0a030')}
    <linearGradient id="hHat" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#6f5230"/><stop offset="1" stop-color="#3a2a17"/>
    </linearGradient>
    <linearGradient id="hCoat" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#4c6e40"/><stop offset="1" stop-color="#2c4326"/>
    </linearGradient>
    <radialGradient id="hSkin" cx="50%" cy="40%" r="60%">
      <stop offset="0" stop-color="#f3c396"/><stop offset="1" stop-color="#d79a6a"/>
    </radialGradient>
  </defs>
  <circle cx="50" cy="50" r="44" fill="url(#hDisc)"/>
  <g class="breathe">
    <g transform="rotate(-27 50 52)">
      <rect x="16" y="29" width="66" height="5.5" rx="2.5" fill="#241a10"/>
      <rect x="16" y="29" width="66" height="2" rx="1" fill="#4a3826"/>
      <rect x="72" y="26.5" width="12" height="10.5" rx="2" fill="#3a2a1a"/>
      <rect x="14" y="30" width="8" height="4" rx="1.5" fill="#5a4025"/>
    </g>
    <path d="M18 95 C18 75 32 66 50 66 C68 66 82 75 82 95 Z" fill="url(#hCoat)"/>
    <path d="M50 66 L44 66 L47 80 L50 82 L53 80 L56 66 Z" fill="#2a3f24"/>
    <path d="M42 67 l8 6 8 -6" fill="none" stroke="#22331d" stroke-width="1.6"/>
    <rect x="44" y="57" width="12" height="12" rx="3" fill="#d79a6a"/>
    <circle cx="50" cy="47" r="16.5" fill="url(#hSkin)"/>
    <path d="M35 48 C35 66 44 74 50 74 C56 74 65 66 65 48 C65 61 57 64 50 64 C43 64 35 61 35 48 Z"
          fill="#5a3f24"/>
    <path d="M38 50 q12 6 24 0" fill="none" stroke="#4a3016" stroke-width="1.2" opacity=".6"/>
    <ellipse cx="50" cy="34" rx="26" ry="7" fill="#33260f"/>
    <path d="M33 35 C33 20 41 14 50 14 C59 14 67 20 67 35 Z" fill="url(#hHat)"/>
    <path d="M33 35 C33 27 40 24 50 24 C60 24 67 27 67 35" fill="none" stroke="#241a10" stroke-width="1" opacity=".5"/>
    <rect x="33" y="29" width="34" height="6" rx="1" fill="#7a2e1f"/>
    <rect x="33" y="29" width="34" height="2" rx="1" fill="#9a4030"/>
    <circle cx="44" cy="46" r="2.4" fill="#241208"/>
    <circle cx="56" cy="46" r="2.4" fill="#241208"/>
    <circle cx="44.8" cy="45.2" r="0.8" fill="#fff"/>
    <circle cx="56.8" cy="45.2" r="0.8" fill="#fff"/>
    <path d="M39 41 q5 -3.5 10 0" stroke="#3a2a18" stroke-width="1.8" fill="none" stroke-linecap="round"/>
    <path d="M51 41 q5 -3.5 10 0" stroke="#3a2a18" stroke-width="1.8" fill="none" stroke-linecap="round"/>
    <ellipse cx="42" cy="52" rx="3" ry="2" fill="#e89a7a" opacity=".5"/>
    <ellipse cx="58" cy="52" rx="3" ry="2" fill="#e89a7a" opacity=".5"/>
  </g>
</svg>`,

    /* ---------------- WOLF — howling grey wolf under the moon -------- */
    wolf: `
<svg class="art" viewBox="0 0 100 100">
  <defs>
    <radialGradient id="wMoon" cx="50%" cy="42%" r="60%">
      <stop offset="0" stop-color="#cfe0f2" stop-opacity=".8"/>
      <stop offset="55%" stop-color="#8aa2c0" stop-opacity=".25"/>
      <stop offset="100%" stop-color="#8aa2c0" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="wolfG" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#b7c8dd"/><stop offset="1" stop-color="#3f5271"/>
    </linearGradient>
    <linearGradient id="wolfSnout" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#eef3f9"/><stop offset="1" stop-color="#c3cfdd"/>
    </linearGradient>
  </defs>
  <circle cx="50" cy="46" r="45" fill="url(#wMoon)"/>
  <circle cx="50" cy="40" r="22" fill="#eef4fb" opacity=".55"/>
  <g class="breathe">
    <path d="M26 44 L20 9 L46 32 Z" fill="url(#wolfG)" stroke="#28374c" stroke-width="2.4" stroke-linejoin="round"/>
    <path d="M74 44 L80 9 L54 32 Z" fill="url(#wolfG)" stroke="#28374c" stroke-width="2.4" stroke-linejoin="round"/>
    <path d="M31 34 L26 18 L40 30 Z" fill="#5a6e88" opacity=".7"/>
    <path d="M69 34 L74 18 L60 30 Z" fill="#5a6e88" opacity=".7"/>
    <path d="M50 27 C32 27 24 43 26 61 C28 77 39 88 50 92 C61 88 72 77 74 61 C76 43 68 27 50 27 Z"
          fill="url(#wolfG)" stroke="#28374c" stroke-width="2.4"/>
    <path d="M50 33 C40 33 34 43 34 55 C40 52 60 52 66 55 C66 43 60 33 50 33 Z"
          fill="#dbe4ef" opacity=".55"/>
    <path d="M41 60 L50 54 L59 60 L55 82 L50 88 L45 82 Z" fill="url(#wolfSnout)"/>
    <path d="M50 54 L50 88" stroke="#b3bfd0" stroke-width="1.2" opacity=".7"/>
    <path d="M45 82 L50 88 L55 82 Z" fill="#161e29"/>
    <ellipse cx="50" cy="80" rx="4.4" ry="3.6" fill="#161e29"/>
    <path d="M35 55 l11 -3.5 -7.5 8 Z" fill="#ffd23b" stroke="#c99a10" stroke-width="0.6"/>
    <path d="M65 55 l-11 -3.5 7.5 8 Z" fill="#ffd23b" stroke="#c99a10" stroke-width="0.6"/>
    <circle cx="41.5" cy="55.5" r="1.5" fill="#161e29"/>
    <circle cx="58.5" cy="55.5" r="1.5" fill="#161e29"/>
    <path d="M34 47 q7 -4 13 -2 M66 47 q-7 -4 -13 -2" stroke="#2b3a50" stroke-width="1.3" fill="none" opacity=".6"/>
  </g>
</svg>`,

    /* ---------------- BEAR — fierce brown bear head ----------------- */
    bear: `
<svg class="art" viewBox="0 0 100 100">
  <defs>
    ${disc('bDisc', '#c98a45')}
    <radialGradient id="bearG" cx="50%" cy="36%" r="72%">
      <stop offset="0" stop-color="#b98a52"/><stop offset="1" stop-color="#5f3d1f"/>
    </radialGradient>
    <radialGradient id="bearEar" cx="50%" cy="40%" r="70%">
      <stop offset="0" stop-color="#9a6f3f"/><stop offset="1" stop-color="#4a2f16"/>
    </radialGradient>
  </defs>
  <circle cx="50" cy="50" r="44" fill="url(#bDisc)"/>
  <g class="breathe">
    <circle cx="26" cy="32" r="13.5" fill="url(#bearEar)" stroke="#3a2410" stroke-width="2.4"/>
    <circle cx="74" cy="32" r="13.5" fill="url(#bearEar)" stroke="#3a2410" stroke-width="2.4"/>
    <circle cx="26" cy="32" r="6" fill="#c99a6a"/>
    <circle cx="74" cy="32" r="6" fill="#c99a6a"/>
    <circle cx="50" cy="57" r="32" fill="url(#bearG)" stroke="#3a2410" stroke-width="2.4"/>
    <path d="M50 30 C36 30 28 42 28 52 C40 48 60 48 72 52 C72 42 64 30 50 30 Z" fill="#c99a68" opacity=".35"/>
    <ellipse cx="50" cy="69" rx="18" ry="14" fill="#e3c193"/>
    <ellipse cx="50" cy="69" rx="18" ry="14" fill="none" stroke="#a87840" stroke-width="1" opacity=".5"/>
    <path d="M39 49 q4 -4 9 -1" stroke="#2a1a0c" stroke-width="1.4" fill="none" stroke-linecap="round"/>
    <path d="M52 48 q5 -3 9 1" stroke="#2a1a0c" stroke-width="1.4" fill="none" stroke-linecap="round"/>
    <circle cx="41" cy="52" r="4.3" fill="#241608"/>
    <circle cx="59" cy="52" r="4.3" fill="#241608"/>
    <circle cx="42.4" cy="50.6" r="1.4" fill="#fff" opacity=".85"/>
    <circle cx="60.4" cy="50.6" r="1.4" fill="#fff" opacity=".85"/>
    <ellipse cx="50" cy="62" rx="7" ry="5" fill="#241608"/>
    <ellipse cx="47.5" cy="60.5" rx="2" ry="1.3" fill="#5a4632" opacity=".8"/>
    <path d="M50 67 v6 M50 73 q-4 3 -8 1 M50 73 q4 3 8 1" stroke="#241608" stroke-width="1.8" fill="none" stroke-linecap="round"/>
  </g>
</svg>`,

    /* ---------------- BOAR — fierce wild boar with tusks ------------ */
    boar: `
<svg class="art" viewBox="0 0 100 100">
  <defs>
    ${disc('boDisc', '#8a6a48')}
    <radialGradient id="boarG" cx="50%" cy="34%" r="74%">
      <stop offset="0" stop-color="#7a6650"/><stop offset="1" stop-color="#2b2016"/>
    </radialGradient>
    <linearGradient id="tuskG" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#d8cbb0"/>
    </linearGradient>
  </defs>
  <circle cx="50" cy="50" r="44" fill="url(#boDisc)"/>
  <g class="breathe">
    <path d="M31 33 L23 16 L42 29 Z" fill="#3a2c20" stroke="#1f1710" stroke-width="1.6" stroke-linejoin="round"/>
    <path d="M69 33 L77 16 L58 29 Z" fill="#3a2c20" stroke="#1f1710" stroke-width="1.6" stroke-linejoin="round"/>
    <path d="M50 26 C33 26 24 40 26 57 C28 74 40 85 50 85 C60 85 72 74 74 57 C76 40 67 26 50 26 Z"
          fill="url(#boarG)" stroke="#1a130c" stroke-width="2.2"/>
    <path d="M40 40 C44 36 50 36 54 39" stroke="#5a4a38" stroke-width="1.4" fill="none" opacity=".6"/>
    <path d="M37 42 L47 44 M63 42 L53 44" stroke="#0f0b07" stroke-width="2" stroke-linecap="round"/>
    <ellipse cx="41" cy="52" rx="4" ry="3.6" fill="#ffb020"/>
    <ellipse cx="59" cy="52" rx="4" ry="3.6" fill="#ffb020"/>
    <circle cx="41" cy="52.5" r="1.7" fill="#1a130c"/>
    <circle cx="59" cy="52.5" r="1.7" fill="#1a130c"/>
    <ellipse cx="50" cy="71" rx="13" ry="10" fill="#4a3a2c"/>
    <ellipse cx="50" cy="71" rx="13" ry="10" fill="none" stroke="#2a2016" stroke-width="1.2"/>
    <ellipse cx="45" cy="71" rx="2.4" ry="3.4" fill="#160f09"/>
    <ellipse cx="55" cy="71" rx="2.4" ry="3.4" fill="#160f09"/>
    <path d="M39 76 C31 80 30 63 37 59" fill="none" stroke="url(#tuskG)" stroke-width="4.5" stroke-linecap="round"/>
    <path d="M61 76 C69 80 70 63 63 59" fill="none" stroke="url(#tuskG)" stroke-width="4.5" stroke-linecap="round"/>
    <path d="M32 46 q-6 -3 -9 0 M68 46 q6 -3 9 0" stroke="#1a130c" stroke-width="1.3" fill="none" opacity=".5"/>
  </g>
</svg>`,

    /* ---------------- EAGLE — fierce bald eagle head ---------------- */
    eagle: `
<svg class="art" viewBox="0 0 100 100">
  <defs>
    ${disc('eDisc', '#5f77a0')}
    <linearGradient id="eBody" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#6f5636"/><stop offset="1" stop-color="#382917"/>
    </linearGradient>
    <linearGradient id="eHead" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#d6dfea"/>
    </linearGradient>
    <linearGradient id="eBeak" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#ffd23b"/><stop offset="1" stop-color="#dd8410"/>
    </linearGradient>
  </defs>
  <circle cx="50" cy="50" r="44" fill="url(#eDisc)"/>
  <g class="float">
    <path d="M50 93 C32 93 22 79 27 61 C34 66 66 66 73 61 C78 79 68 93 50 93 Z" fill="url(#eBody)"/>
    <path d="M36 72 q5 6 1 12 M46 74 q5 6 1 12 M56 74 q5 6 1 12 M64 72 q4 6 0 12"
          stroke="#241a0e" stroke-width="1.5" fill="none" opacity=".55"/>
    <path d="M54 20 C36 19 24 32 26 49 C27 59 39 65 57 63 C70 61 76 53 76 44 C76 30 68 22 54 20 Z"
          fill="url(#eHead)"/>
    <path d="M30 40 q11 -6 24 -3 M31 48 q13 -4 26 0 M33 56 q13 -3 24 1"
          stroke="#c6d1de" stroke-width="1.3" fill="none"/>
    <path d="M31 36 Q42 30 55 37 L54 41 Q42 34 33 40 Z" fill="#f6a623"/>
    <path d="M31 37 Q42 32 54 38" stroke="#d98a10" stroke-width="1" fill="none"/>
    <ellipse cx="43" cy="43" rx="5" ry="5.2" fill="#1b1f26"/>
    <circle cx="44" cy="41.4" r="1.6" fill="#fff"/>
    <circle cx="41.5" cy="44.5" r="0.9" fill="#7a4a10"/>
    <path d="M28 45 C15 46 11 53 20 58 C26 61 33 58 34 52 C35 48 33 45 28 45 Z" fill="url(#eBeak)"/>
    <path d="M19 57 C14 59 14 63 19 62 C22 61 24 59 23 57 Z" fill="#c9760e"/>
    <path d="M34 50 q-6 4 -13 5" stroke="#b3690c" stroke-width="1.3" fill="none"/>
    <path d="M28 45 q3 3 5 6" stroke="#ffe08a" stroke-width="1" fill="none" opacity=".7"/>
  </g>
</svg>`,

    ace:   gem('A', 'ace', '#ffe789', '#b8860b'),
    king:  gem('K', 'king', '#ff7b7b', '#9c1616'),
    queen: gem('Q', 'queen', '#dc9bf0', '#772a9e'),
    jack:  gem('J', 'jack', '#83ec9f', '#1c8a3d'),
    ten:   gem('10', 'ten', '#ffc084', '#bd560f'),
    nine:  gem('9', 'nine', '#93c6ff', '#1c5cc0'),
  };

  window.SYMBOL_ART = ART;
})();
