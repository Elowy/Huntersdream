/* =========================================================================
 * HUNTER'S DREAM 2 — symbol artwork (detailed / semi-realistic SVG set)
 * viewBox 0 0 100 100. Animation hooks: .flame, .breathe, .float, .gem.
 * Exposed as window.SYMBOL_ART.
 * ========================================================================= */

'use strict';

(function () {
  /* Soft radial medallion behind the high symbols. */
  const disc = (id, c) => `
    <radialGradient id="${id}" cx="50%" cy="42%" r="62%">
      <stop offset="0" stop-color="${c}" stop-opacity=".55"/>
      <stop offset="55%" stop-color="${c}" stop-opacity=".18"/>
      <stop offset="100%" stop-color="${c}" stop-opacity="0"/>
    </radialGradient>`;

  /* Reusable soft drop shadow (kept lightweight). */
  const softShadow = (id) => `
    <filter id="${id}" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="1.4" stdDeviation="1.4" flood-color="#000" flood-opacity="0.35"/>
    </filter>`;

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
    <radialGradient id="fireGlow" cx="50%" cy="64%" r="56%">
      <stop offset="0" stop-color="#ffcf5e" stop-opacity=".9"/>
      <stop offset="100%" stop-color="#ff7a18" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="fireG" cx="50%" cy="76%" r="64%">
      <stop offset="0" stop-color="#fffbe0"/>
      <stop offset="26%" stop-color="#ffe066"/>
      <stop offset="55%" stop-color="#ff9a2e"/>
      <stop offset="82%" stop-color="#ef3b1f"/>
      <stop offset="100%" stop-color="#a01018"/>
    </radialGradient>
    <linearGradient id="logG" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#a97a44"/><stop offset="1" stop-color="#54320f"/>
    </linearGradient>
  </defs>
  <circle cx="50" cy="60" r="47" fill="url(#fireGlow)"/>
  <g class="logs">
    <rect x="21" y="83" width="58" height="10" rx="5" fill="url(#logG)"/>
    <rect x="25" y="80" width="50" height="8" rx="4" fill="#b98442" transform="rotate(-10 50 84)"/>
    <rect x="27" y="81" width="46" height="7" rx="3.5" fill="#472a10" transform="rotate(9 50 85)"/>
    <ellipse cx="25" cy="88" rx="4" ry="3.4" fill="#3a2410"/>
    <ellipse cx="75" cy="87" rx="4" ry="3.4" fill="#3a2410"/>
    <path d="M28 85 q6 -3 12 0 M60 85 q6 -3 12 0" stroke="#2a1808" stroke-width="1" fill="none" opacity=".5"/>
  </g>
  <path class="flame f1"
        d="M50 9 C38 32 24 42 30 61 C34 78 46 86 50 86 C54 86 66 78 70 61 C76 42 62 32 50 9 Z"
        fill="url(#fireG)"/>
  <path class="flame f3"  d="M33 45 C26 55 25 66 32 75 C31 66 36 60 41 55 C38 51 35 47 33 45 Z" fill="#ff8a24" opacity=".9"/>
  <path class="flame f3b" d="M67 45 C74 55 75 66 68 75 C69 66 64 60 59 55 C62 51 65 47 67 45 Z" fill="#ff8a24" opacity=".9"/>
  <path class="flame f2"  d="M50 32 C42 46 39 55 44 67 C47 77 50 81 50 81 C50 81 58 73 58 61 C58 50 53 45 50 32 Z" fill="#fff2ad"/>
  <path class="flame f2"  d="M50 48 C46 56 45 62 48 69 C50 74 50 76 50 76 C50 76 54 71 54 63 C54 56 52 53 50 48 Z" fill="#fffdf2" opacity=".85"/>
  <circle class="spark s1" cx="35" cy="27" r="2.2" fill="#ffe08a"/>
  <circle class="spark s2" cx="64" cy="21" r="1.8" fill="#ffd23b"/>
  <circle class="spark s3" cx="52" cy="16" r="1.5" fill="#fff2c0"/>
</svg>`,

    /* ---------------- SCATTER / BONUS — a snowy log cabin ------------ */
    scatter: `
<svg class="art art-scatter" viewBox="0 0 100 100">
  <defs>
    <linearGradient id="wallG" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#a86a38"/><stop offset="1" stop-color="#583619"/>
    </linearGradient>
    <linearGradient id="roofG" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#f4f9fd"/><stop offset="1" stop-color="#b4c6da"/>
    </linearGradient>
    <radialGradient id="skyG" cx="50%" cy="30%" r="75%">
      <stop offset="0" stop-color="#33456a"/><stop offset="55%" stop-color="#1a2740"/><stop offset="100%" stop-color="#0c1424"/>
    </radialGradient>
  </defs>
  <circle cx="50" cy="48" r="46" fill="url(#skyG)"/>
  <circle cx="73" cy="24" r="8" fill="#f6f2da"/>
  <circle cx="73" cy="24" r="8" fill="#0c1424" opacity=".08"/>
  <g fill="#fff" opacity=".8"><circle cx="30" cy="20" r="1"/><circle cx="42" cy="14" r=".8"/><circle cx="60" cy="16" r=".9"/><circle cx="22" cy="32" r=".7"/><circle cx="82" cy="40" r=".8"/></g>
  <g class="breathe">
    <rect x="26" y="48" width="48" height="37" rx="2" fill="url(#wallG)"/>
    <line x1="26" y1="57" x2="74" y2="57" stroke="#3a2410" stroke-width="1.6"/>
    <line x1="26" y1="66" x2="74" y2="66" stroke="#3a2410" stroke-width="1.6"/>
    <line x1="26" y1="75" x2="74" y2="75" stroke="#3a2410" stroke-width="1.6"/>
    <rect x="26" y="48" width="48" height="3" fill="#fff" opacity=".5"/>
    <path d="M17 51 L50 25 L83 51 Z" fill="#4a2c12"/>
    <path d="M17 48 L50 22 L83 48 Z" fill="url(#roofG)"/>
    <path d="M50 22 L83 48 L83 51 L50 25 Z" fill="#000" opacity=".14"/>
    <rect x="44" y="61" width="15" height="24" rx="1.5" fill="#301d0d"/>
    <rect x="44" y="61" width="15" height="24" rx="1.5" fill="none" stroke="#1c1109" stroke-width="1.5"/>
    <circle cx="55.5" cy="73" r="1.5" fill="#ffd23b"/>
    <rect x="30" y="60" width="10" height="10" rx="1" fill="#ffd76a"/>
    <path d="M35 60 v10 M30 65 h10" stroke="#301d0d" stroke-width="1.4"/>
    <rect x="30" y="60" width="10" height="10" rx="1" fill="none" stroke="#301d0d" stroke-width="1.6"/>
    <path d="M31 55 q4 3 9 0 M60 55 q5 2 10 0" stroke="#f4f9fd" stroke-width="2.5" fill="none" stroke-linecap="round"/>
  </g>
  <g class="bonus-ribbon">
    <rect x="12" y="86" width="76" height="13" rx="6.5" fill="#b8161f" stroke="#7a0d13" stroke-width="1"/>
    <text x="50" y="95.5" text-anchor="middle" font-family="Arial Black, sans-serif"
          font-weight="900" font-size="9" fill="#ffe08a" letter-spacing="1.5">BONUS</text>
  </g>
</svg>`,

    /* ---------------- HUNTER ---------------------------------------- */
    hunter: `
<svg class="art" viewBox="0 0 100 100">
  <defs>
    ${disc('hDisc', '#e0a030')}
    ${softShadow('hSh')}
    <linearGradient id="hHat" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#7a5c36"/><stop offset="1" stop-color="#3a2a17"/>
    </linearGradient>
    <linearGradient id="hCoat" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#557a45"/><stop offset="1" stop-color="#284022"/>
    </linearGradient>
    <radialGradient id="hSkin" cx="46%" cy="38%" r="62%">
      <stop offset="0" stop-color="#f6c99c"/><stop offset="1" stop-color="#d0925f"/>
    </radialGradient>
    <linearGradient id="hBeard" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#6d4c2b"/><stop offset="1" stop-color="#432c16"/>
    </linearGradient>
  </defs>
  <circle cx="50" cy="50" r="44" fill="url(#hDisc)"/>
  <g class="breathe" filter="url(#hSh)">
    <g transform="rotate(-27 50 52)">
      <rect x="15" y="29" width="68" height="5.5" rx="2.5" fill="#20160d"/>
      <rect x="15" y="29" width="68" height="1.8" rx="1" fill="#5a4633"/>
      <rect x="71" y="26.4" width="12" height="10.8" rx="2" fill="#3a2a1a"/>
      <rect x="13" y="30" width="8" height="4" rx="1.5" fill="#6a4a28"/>
    </g>
    <path d="M17 96 C17 75 32 66 50 66 C68 66 83 75 83 96 Z" fill="url(#hCoat)"/>
    <path d="M50 66 L43 66 L47 82 L50 84 L53 82 L57 66 Z" fill="#294020"/>
    <path d="M50 66 L50 84" stroke="#1e3018" stroke-width="1" opacity=".6"/>
    <path d="M17 96 C20 82 30 74 34 72" fill="none" stroke="#3a5a2c" stroke-width="1" opacity=".5"/>
    <rect x="44" y="57" width="12" height="12" rx="3" fill="#cf9060"/>
    <ellipse cx="50" cy="47" rx="16.5" ry="17" fill="url(#hSkin)"/>
    <path d="M34 48 C34 47 66 47 66 48 C66 63 58 73 50 74 C42 73 34 63 34 48 Z" fill="url(#hBeard)"/>
    <path d="M36 49 C40 63 45 71 50 72 C55 71 60 63 64 49 C58 57 42 57 36 49 Z" fill="#523620" opacity=".55"/>
    <g stroke="#3a2614" stroke-width="0.7" opacity=".55" fill="none" stroke-linecap="round">
      <path d="M40 55 q2 8 4 13"/><path d="M45 57 q1 8 2 14"/><path d="M50 58 v15"/>
      <path d="M55 57 q-1 8 -2 14"/><path d="M60 55 q-2 8 -4 13"/>
    </g>
    <path d="M40 46 h7 M53 46 h7" stroke="none"/>
    <ellipse cx="44" cy="47" rx="3.2" ry="2.4" fill="#fff"/>
    <ellipse cx="56" cy="47" rx="3.2" ry="2.4" fill="#fff"/>
    <circle cx="44.4" cy="47.2" r="1.7" fill="#4a3220"/>
    <circle cx="56.4" cy="47.2" r="1.7" fill="#4a3220"/>
    <circle cx="44.4" cy="47.2" r="0.8" fill="#1c120a"/>
    <circle cx="56.4" cy="47.2" r="0.8" fill="#1c120a"/>
    <circle cx="45" cy="46.4" r="0.6" fill="#fff"/>
    <circle cx="57" cy="46.4" r="0.6" fill="#fff"/>
    <path d="M39 42 q5 -3 10 0.5" stroke="#4a3016" stroke-width="1.9" fill="none" stroke-linecap="round"/>
    <path d="M51 42.5 q5 -3.5 10 -0.5" stroke="#4a3016" stroke-width="1.9" fill="none" stroke-linecap="round"/>
    <path d="M47 50 q3 3 6 0" stroke="#b06a3a" stroke-width="1.3" fill="none" stroke-linecap="round"/>
    <ellipse cx="41" cy="53" rx="3" ry="2" fill="#e89a6a" opacity=".45"/>
    <ellipse cx="59" cy="53" rx="3" ry="2" fill="#e89a6a" opacity=".45"/>
    <ellipse cx="50" cy="34.5" rx="26" ry="7" fill="#2f2210"/>
    <path d="M33 35 C33 19 41 13 50 13 C59 13 67 19 67 35 Z" fill="url(#hHat)"/>
    <path d="M35 33 C35 21 42 17 50 17 C58 17 65 21 65 33" fill="none" stroke="#2a1e10" stroke-width="1" opacity=".5"/>
    <path d="M34 34 C40 30 60 30 66 34" fill="none" stroke="#8a6a40" stroke-width="1" opacity=".6"/>
    <rect x="33" y="28" width="34" height="6.5" rx="1" fill="#7a2e1f"/>
    <rect x="33" y="28" width="34" height="2" rx="1" fill="#9a4030"/>
    <path d="M58 28 l4 3.2 -4 3.2 Z" fill="#e0b24a"/>
  </g>
</svg>`,

    /* ---------------- WOLF — grey wolf under the moon --------------- */
    wolf: `
<svg class="art" viewBox="0 0 100 100">
  <defs>
    <radialGradient id="wMoon" cx="50%" cy="40%" r="62%">
      <stop offset="0" stop-color="#d4e4f5" stop-opacity=".85"/>
      <stop offset="50%" stop-color="#8aa2c0" stop-opacity=".25"/>
      <stop offset="100%" stop-color="#8aa2c0" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="wolfG" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#c2d1e2"/><stop offset="55%" stop-color="#7d8ea6"/><stop offset="1" stop-color="#3c4e6c"/>
    </linearGradient>
    <linearGradient id="wolfSnout" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#f1f5fa"/><stop offset="1" stop-color="#bcc8d8"/>
    </linearGradient>
    <radialGradient id="wolfEye" cx="50%" cy="45%" r="60%">
      <stop offset="0" stop-color="#ffe89a"/><stop offset="60%" stop-color="#f5b420"/><stop offset="100%" stop-color="#c47a08"/>
    </radialGradient>
    ${softShadow('wSh')}
  </defs>
  <circle cx="50" cy="45" r="45" fill="url(#wMoon)"/>
  <circle cx="50" cy="38" r="21" fill="#eef4fb" opacity=".5"/>
  <g class="breathe" filter="url(#wSh)">
    <path d="M27 45 L20 8 L47 33 Z" fill="url(#wolfG)" stroke="#28374c" stroke-width="2.2" stroke-linejoin="round"/>
    <path d="M73 45 L80 8 L53 33 Z" fill="url(#wolfG)" stroke="#28374c" stroke-width="2.2" stroke-linejoin="round"/>
    <path d="M31 34 L27 17 L41 30 Z" fill="#e0b7c0" opacity=".7"/>
    <path d="M69 34 L73 17 L59 30 Z" fill="#e0b7c0" opacity=".7"/>
    <!-- neck fur ruff -->
    <path d="M22 62 l6 6 3 -7 5 8 4 -8 5 9 3 -8 4 9 5 -9 4 8 4 -8 5 7 4 -6 -6 14 -22 14 -22 -14 Z" fill="#5a6c88" opacity=".9"/>
    <!-- head -->
    <path d="M50 27 C31 27 24 44 26 62 C28 78 40 89 50 93 C60 89 72 78 74 62 C76 44 69 27 50 27 Z"
          fill="url(#wolfG)" stroke="#28374c" stroke-width="2.2"/>
    <!-- forehead lighter blaze -->
    <path d="M50 31 C42 31 37 41 37 53 C42 50 58 50 63 53 C63 41 58 31 50 31 Z" fill="#dbe6f2" opacity=".6"/>
    <!-- cheek shadows -->
    <path d="M27 60 C29 74 38 84 47 88 C40 80 36 70 35 60 Z" fill="#33455f" opacity=".5"/>
    <path d="M73 60 C71 74 62 84 53 88 C60 80 64 70 65 60 Z" fill="#33455f" opacity=".5"/>
    <!-- fur texture -->
    <g stroke="#33455f" stroke-width="0.7" fill="none" opacity=".5" stroke-linecap="round">
      <path d="M33 46 q6 -3 11 -1"/><path d="M67 46 q-6 -3 -11 -1"/>
      <path d="M30 56 q6 -1 10 1"/><path d="M70 56 q-6 -1 -10 1"/>
      <path d="M34 66 q6 0 10 3"/><path d="M66 66 q-6 0 -10 3"/>
    </g>
    <!-- muzzle -->
    <path d="M41 60 L50 54 L59 60 L55 83 L50 89 L45 83 Z" fill="url(#wolfSnout)"/>
    <path d="M50 54 L50 89" stroke="#b0bccc" stroke-width="1" opacity=".6"/>
    <!-- nose -->
    <path d="M44 79 L56 79 L50 86 Z" fill="#1a2230"/>
    <ellipse cx="50" cy="78" rx="5" ry="3.6" fill="#161e2b"/>
    <ellipse cx="48" cy="76.6" rx="1.6" ry="1" fill="#4a5a70" opacity=".8"/>
    <!-- eyes -->
    <path d="M35 55 l11 -3.5 -6 8 Z" fill="url(#wolfEye)" stroke="#b07a10" stroke-width="0.6"/>
    <path d="M65 55 l-11 -3.5 6 8 Z" fill="url(#wolfEye)" stroke="#b07a10" stroke-width="0.6"/>
    <circle cx="41.5" cy="55.5" r="1.7" fill="#12161f"/>
    <circle cx="58.5" cy="55.5" r="1.7" fill="#12161f"/>
    <circle cx="42.2" cy="54.8" r="0.7" fill="#fff"/>
    <circle cx="59.2" cy="54.8" r="0.7" fill="#fff"/>
    <path d="M33 50 q7 -4 13 -1 M67 50 q-7 -4 -13 -1" stroke="#28374c" stroke-width="1.4" fill="none" opacity=".7"/>
  </g>
</svg>`,

    /* ---------------- BEAR — brown bear ----------------------------- */
    bear: `
<svg class="art" viewBox="0 0 100 100">
  <defs>
    ${disc('bDisc', '#c98a45')}
    ${softShadow('brSh')}
    <radialGradient id="bearG" cx="50%" cy="34%" r="74%">
      <stop offset="0" stop-color="#c1935a"/><stop offset="55%" stop-color="#8a5c30"/><stop offset="1" stop-color="#553318"/>
    </radialGradient>
    <radialGradient id="bearEar" cx="50%" cy="40%" r="70%">
      <stop offset="0" stop-color="#9a6f3f"/><stop offset="1" stop-color="#472d15"/>
    </radialGradient>
    <radialGradient id="bearMuz" cx="50%" cy="40%" r="65%">
      <stop offset="0" stop-color="#e7c799"/><stop offset="1" stop-color="#c39a63"/>
    </radialGradient>
  </defs>
  <circle cx="50" cy="50" r="44" fill="url(#bDisc)"/>
  <g class="breathe" filter="url(#brSh)">
    <circle cx="26" cy="31" r="13.5" fill="url(#bearEar)" stroke="#3a2410" stroke-width="2.2"/>
    <circle cx="74" cy="31" r="13.5" fill="url(#bearEar)" stroke="#3a2410" stroke-width="2.2"/>
    <circle cx="26" cy="31" r="6" fill="#b98a5c"/>
    <circle cx="74" cy="31" r="6" fill="#b98a5c"/>
    <circle cx="50" cy="57" r="32" fill="url(#bearG)" stroke="#3a2410" stroke-width="2.2"/>
    <!-- forehead & cheek shading -->
    <path d="M50 28 C36 28 28 40 28 52 C40 47 60 47 72 52 C72 40 64 28 50 28 Z" fill="#cf9f66" opacity=".3"/>
    <path d="M22 60 C24 74 34 84 44 87 C36 78 31 68 30 58 Z" fill="#4a3016" opacity=".4"/>
    <path d="M78 60 C76 74 66 84 56 87 C64 78 69 68 70 58 Z" fill="#4a3016" opacity=".4"/>
    <!-- fur strokes -->
    <g stroke="#4a3016" stroke-width="0.8" fill="none" opacity=".45" stroke-linecap="round">
      <path d="M34 40 q5 -3 10 -1"/><path d="M66 40 q-5 -3 -10 -1"/>
      <path d="M30 52 q6 0 10 2"/><path d="M70 52 q-6 0 -10 2"/>
      <path d="M32 66 q6 1 9 4"/><path d="M68 66 q-6 1 -9 4"/>
    </g>
    <ellipse cx="50" cy="69" rx="18" ry="14" fill="url(#bearMuz)"/>
    <!-- eyes -->
    <ellipse cx="41" cy="51" rx="4.2" ry="4.6" fill="#241608"/>
    <ellipse cx="59" cy="51" rx="4.2" ry="4.6" fill="#241608"/>
    <circle cx="42.4" cy="49.4" r="1.4" fill="#fff" opacity=".9"/>
    <circle cx="60.4" cy="49.4" r="1.4" fill="#fff" opacity=".9"/>
    <path d="M37 46 q4 -3 8 -1 M55 45 q4 -2 8 1" stroke="#2a1a0c" stroke-width="1.3" fill="none" stroke-linecap="round"/>
    <!-- nose -->
    <path d="M43 60 Q50 56 57 60 Q57 66 50 67 Q43 66 43 60 Z" fill="#241608"/>
    <ellipse cx="47" cy="60" rx="1.8" ry="1.1" fill="#5a4632" opacity=".7"/>
    <path d="M50 67 v6 M50 73 q-5 3 -9 1 M50 73 q5 3 9 1" stroke="#241608" stroke-width="1.8" fill="none" stroke-linecap="round"/>
  </g>
</svg>`,

    /* ---------------- BOAR — wild boar with tusks ------------------- */
    boar: `
<svg class="art" viewBox="0 0 100 100">
  <defs>
    ${disc('boDisc', '#8a6a48')}
    ${softShadow('boSh')}
    <radialGradient id="boarG" cx="50%" cy="32%" r="76%">
      <stop offset="0" stop-color="#857057"/><stop offset="55%" stop-color="#4e3d2c"/><stop offset="1" stop-color="#241a12"/>
    </radialGradient>
    <linearGradient id="tuskG" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#d0c2a2"/>
    </linearGradient>
    <radialGradient id="boarEye" cx="50%" cy="45%" r="60%">
      <stop offset="0" stop-color="#ffd35a"/><stop offset="100%" stop-color="#d07a10"/>
    </radialGradient>
  </defs>
  <circle cx="50" cy="50" r="44" fill="url(#boDisc)"/>
  <g class="breathe" filter="url(#boSh)">
    <path d="M31 33 L23 15 L43 29 Z" fill="#2f241a" stroke="#160f0a" stroke-width="1.4" stroke-linejoin="round"/>
    <path d="M69 33 L77 15 L57 29 Z" fill="#2f241a" stroke="#160f0a" stroke-width="1.4" stroke-linejoin="round"/>
    <!-- bristly mane -->
    <path d="M50 22 l-4 8 4 -3 3 8 3 -8 4 3 -4 -8 Z" fill="#5a4632"/>
    <path d="M50 24 C33 24 24 39 26 57 C28 75 40 86 50 86 C60 86 72 75 74 57 C76 39 67 24 50 24 Z"
          fill="url(#boarG)" stroke="#160f0a" stroke-width="2.2"/>
    <!-- bristle texture on top -->
    <g stroke="#2a2016" stroke-width="0.9" fill="none" opacity=".6" stroke-linecap="round">
      <path d="M40 32 l-2 -6"/><path d="M46 30 l-1 -7"/><path d="M50 29 l0 -7"/><path d="M54 30 l1 -7"/><path d="M60 32 l2 -6"/>
    </g>
    <path d="M50 30 C38 30 30 42 31 54 C40 50 60 50 69 54 C70 42 62 30 50 30 Z" fill="#6b5540" opacity=".35"/>
    <!-- brow -->
    <path d="M37 44 L48 46 M63 44 L52 46" stroke="#100b07" stroke-width="2.2" stroke-linecap="round"/>
    <!-- eyes -->
    <ellipse cx="41" cy="52" rx="4" ry="3.6" fill="url(#boarEye)"/>
    <ellipse cx="59" cy="52" rx="4" ry="3.6" fill="url(#boarEye)"/>
    <circle cx="41" cy="52.5" r="1.7" fill="#120c07"/>
    <circle cx="59" cy="52.5" r="1.7" fill="#120c07"/>
    <circle cx="41.7" cy="51.6" r="0.6" fill="#fff"/>
    <circle cx="59.7" cy="51.6" r="0.6" fill="#fff"/>
    <!-- snout -->
    <ellipse cx="50" cy="71" rx="13" ry="10" fill="#4e3d2c"/>
    <ellipse cx="50" cy="71" rx="13" ry="10" fill="none" stroke="#241a12" stroke-width="1.2"/>
    <path d="M50 63 v16" stroke="#33261a" stroke-width="1" opacity=".5"/>
    <ellipse cx="45" cy="71" rx="2.4" ry="3.4" fill="#140d08"/>
    <ellipse cx="55" cy="71" rx="2.4" ry="3.4" fill="#140d08"/>
    <!-- tusks -->
    <path d="M39 77 C30 81 29 62 37 58" fill="none" stroke="url(#tuskG)" stroke-width="4.8" stroke-linecap="round"/>
    <path d="M61 77 C70 81 71 62 63 58" fill="none" stroke="url(#tuskG)" stroke-width="4.8" stroke-linecap="round"/>
    <path d="M39 77 C34 79 33 68 36 62" fill="none" stroke="#000" stroke-width="1" opacity=".2"/>
    <g stroke="#160f0a" stroke-width="0.8" fill="none" opacity=".5" stroke-linecap="round">
      <path d="M31 47 q-6 -2 -9 1"/><path d="M69 47 q6 -2 9 1"/>
      <path d="M30 60 q-6 1 -8 4"/><path d="M70 60 q6 1 8 4"/>
    </g>
  </g>
</svg>`,

    /* ---------------- EAGLE — bald eagle head ----------------------- */
    eagle: `
<svg class="art" viewBox="0 0 100 100">
  <defs>
    ${disc('eDisc', '#5f77a0')}
    ${softShadow('eaSh')}
    <linearGradient id="eBody" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#7a5e3a"/><stop offset="1" stop-color="#33260f"/>
    </linearGradient>
    <radialGradient id="eHead" cx="50%" cy="40%" r="65%">
      <stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#cfd9e6"/>
    </radialGradient>
    <linearGradient id="eBeak" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#ffd23b"/><stop offset="1" stop-color="#d67e10"/>
    </linearGradient>
  </defs>
  <circle cx="50" cy="50" r="44" fill="url(#eDisc)"/>
  <g class="float" filter="url(#eaSh)">
    <!-- body / neck feathers -->
    <path d="M50 94 C31 94 21 79 27 60 C34 66 66 66 73 60 C79 79 69 94 50 94 Z" fill="url(#eBody)"/>
    <g fill="#2a1f0e" opacity=".5">
      <path d="M34 70 q5 7 1 14 -5 -6 -1 -14"/><path d="M44 73 q5 7 1 14 -5 -6 -1 -14"/>
      <path d="M56 73 q5 7 1 14 -5 -6 -1 -14"/><path d="M65 70 q5 7 1 14 -5 -6 -1 -14"/>
    </g>
    <path d="M31 62 q19 8 38 0" fill="none" stroke="#e8ecf1" stroke-width="2" opacity=".5"/>
    <!-- white head -->
    <path d="M54 19 C35 18 23 32 25 50 C26 60 39 66 57 64 C71 62 77 53 77 43 C77 29 68 21 54 19 Z" fill="url(#eHead)"/>
    <!-- head feather texture -->
    <g stroke="#c4cfdd" stroke-width="1.1" fill="none" opacity=".8" stroke-linecap="round">
      <path d="M30 38 q11 -6 24 -3"/><path d="M30 46 q13 -4 27 0"/><path d="M32 54 q13 -3 25 1"/><path d="M40 61 q10 -2 18 1"/>
    </g>
    <!-- yellow brow (fierce) -->
    <path d="M30 35 Q42 28 56 36 L55 41 Q42 33 33 40 Z" fill="#f5a623"/>
    <path d="M31 36 Q42 30 55 37" stroke="#d07e10" stroke-width="1" fill="none"/>
    <!-- eye -->
    <ellipse cx="43" cy="43" rx="5.2" ry="5.4" fill="#161a20"/>
    <circle cx="43" cy="43" r="2.6" fill="#3a2a10"/>
    <circle cx="44.3" cy="41.4" r="1.5" fill="#fff"/>
    <!-- beak -->
    <path d="M28 44 C14 45 10 53 20 58 C27 61 34 57 35 51 C36 46 34 44 28 44 Z" fill="url(#eBeak)"/>
    <path d="M18 56 C13 58 13 62 18 61 C21 60 23 58 22 56 Z" fill="#c9760e"/>
    <path d="M35 49 q-7 4 -15 6" stroke="#b3690c" stroke-width="1.2" fill="none"/>
    <path d="M28 44 q3 3 6 6" stroke="#ffe08a" stroke-width="1" fill="none" opacity=".7"/>
    <ellipse cx="30" cy="47" rx="1.1" ry="0.8" fill="#a85e08"/>
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
