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

  /* ---- Carved-wood card with gold banding and rivets ------------------- */
  function woodCard(letter, id, w1, w2) {
    const two = letter.length > 1;
    const fs = two ? 44 : 60;
    const y = two ? 64 : 66;
    const T = (fill, stroke, sw) =>
      `<text x="50" y="${y}" text-anchor="middle" font-family="Arial Black, 'Arial', sans-serif"
             font-weight="900" font-size="${fs}" fill="${fill}"${stroke
        ? ` stroke="${stroke}" stroke-width="${sw}" stroke-linejoin="round" paint-order="stroke"` : ''}>${letter}</text>`;
    const rivet = (x, yy) =>
      `<circle cx="${x}" cy="${yy}" r="2.1" fill="#ffe488" stroke="#6a4810" stroke-width="0.8"/>
       <circle cx="${x - 0.5}" cy="${yy - 0.5}" r="0.7" fill="#fff7d0"/>`;
    return `
<svg class="art art-card" viewBox="0 0 100 100">
  <defs>
    <linearGradient id="wcw_${id}" x1="0.1" y1="0" x2="0.2" y2="1">
      <stop offset="0" stop-color="${w1}"/>
      <stop offset=".5" stop-color="${w2}"/>
      <stop offset="1" stop-color="${w1}"/>
    </linearGradient>
    <linearGradient id="wcg_${id}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#ffe692"/>
      <stop offset=".45" stop-color="#e0a838"/>
      <stop offset=".55" stop-color="#a8781a"/>
      <stop offset="1" stop-color="#f2c65a"/>
    </linearGradient>
    <radialGradient id="wcd_${id}" cx="50%" cy="45%" r="60%">
      <stop offset="0" stop-color="${w1}" stop-opacity=".32"/>
      <stop offset="100%" stop-color="${w1}" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <g class="gem">
    ${T('none', '#2e1c06', 14)}
    ${T('url(#wcw_' + id + ')', 'url(#wcg_' + id + ')', 8)}
    ${T('url(#wcw_' + id + ')', '', 0)}
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

    /* ---------------- BUFFALO — bison on a grassy mound -------------- */
    buffalo: `
<svg class="art" viewBox="0 0 100 100">
  <defs>
    ${softShadow('bfSh')}
    <radialGradient id="bfGrass" cx="50%" cy="42%" r="62%">
      <stop offset="0" stop-color="#7cbf52"/><stop offset="70%" stop-color="#3f8a34"/><stop offset="100%" stop-color="#2a5f24"/>
    </radialGradient>
    <radialGradient id="bfBody" cx="42%" cy="34%" r="72%">
      <stop offset="0" stop-color="#8a5f38"/><stop offset="55%" stop-color="#5f3f22"/><stop offset="100%" stop-color="#38240f"/>
    </radialGradient>
    <linearGradient id="bfHorn" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#efe6cc"/><stop offset="1" stop-color="#b8a678"/>
    </linearGradient>
  </defs>
  <g class="breathe" filter="url(#bfSh)">
    <!-- far legs -->
    <rect x="42" y="63" width="5.5" height="15" rx="1.6" fill="#2a1c10"/>
    <rect x="66" y="63" width="5.5" height="15" rx="1.6" fill="#2a1c10"/>
    <!-- body mass with front hump -->
    <path d="M32 61 C27 57 26 45 32 39 C37 34 43 34 47 38 C51 34 60 37 67 40 C77 43 83 49 82 56
             C81 63 73 65 63 65 L40 65 C36 65 34 63 32 61 Z" fill="url(#bfBody)"/>
    <!-- rear lighter highlight -->
    <path d="M64 45 C74 45 80 50 79 56 C78 62 72 64 65 64 L60 64 C63 57 63 51 64 45 Z" fill="#8a6038" opacity=".4"/>
    <!-- shaggy dark forequarter cape -->
    <path d="M32 61 C27 56 26 45 32 39 C37 34 43 34 47 38 C45 46 45 56 47 65 L40 65 C36 65 34 63 32 61 Z" fill="#251810"/>
    <path d="M46 40 C45 48 45 57 47 65" stroke="#3f2a16" stroke-width="1" fill="none" opacity=".6"/>
    <!-- near legs -->
    <rect x="36" y="64" width="6.2" height="15" rx="1.6" fill="#3a2814"/>
    <rect x="59" y="64" width="6.2" height="15" rx="1.6" fill="#3a2814"/>
    <rect x="36" y="76" width="6.2" height="3.2" rx="1" fill="#140d07"/>
    <rect x="59" y="76" width="6.2" height="3.2" rx="1" fill="#140d07"/>
    <!-- head low, front-left -->
    <path d="M19 58 C14 54 14 46 20 43 C26 40 33 43 35 50 C36 59 30 64 25 63 C22 62.5 20 61 19 58 Z" fill="#1f1409"/>
    <!-- shaggy forehead tufts -->
    <path d="M21 45 q3 -4 7 -3 q-2 3 -1 6 q-4 -2 -6 -3 Z" fill="#150d06"/>
    <!-- beard -->
    <path d="M22 60 C20 70 26 74 28 70 C27 66 26 62 26 59 Z" fill="#140c06"/>
    <!-- horn -->
    <path d="M29 43 C32 39 37 40 37 43 C34 43 32 44 31 46 Z" fill="url(#bfHorn)"/>
    <path d="M29.5 43 C32 40 36 41 36.5 43" stroke="#8a7854" stroke-width="0.7" fill="none"/>
    <!-- eye -->
    <circle cx="27" cy="49.5" r="1.8" fill="#0a0603"/>
    <circle cx="27.6" cy="48.8" r="0.6" fill="#8a6534"/>
    <!-- muzzle / nose -->
    <ellipse cx="18.5" cy="55" rx="3.2" ry="2.6" fill="#0e0805"/>
    <ellipse cx="17.5" cy="54" rx="0.8" ry="0.6" fill="#4a3420"/>
    <!-- fur texture -->
    <g stroke="#2a1c10" stroke-width="0.7" opacity=".4" fill="none" stroke-linecap="round">
      <path d="M40 43 q3 5 2 10"/><path d="M49 42 q3 5 2 11"/><path d="M60 47 q2 5 1 9"/><path d="M70 51 q2 4 1 8"/>
    </g>
  </g>
</svg>`,

    /* ---------------- EAGLE — bald eagle in flight ------------------ */
    eagle: `
<svg class="art" viewBox="0 0 100 100">
  <defs>
    ${softShadow('eaSh')}
    <radialGradient id="eSky" cx="50%" cy="38%" r="70%">
      <stop offset="0" stop-color="#bfe0f5"/><stop offset="60%" stop-color="#7db6e0"/><stop offset="100%" stop-color="#4d8ec4"/>
    </radialGradient>
    <linearGradient id="eWing" x1="0.5" y1="0" x2="0.5" y2="1">
      <stop offset="0" stop-color="#6b4f30"/><stop offset="1" stop-color="#33260f"/>
    </linearGradient>
    <linearGradient id="eBodyG" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#5a4126"/><stop offset="1" stop-color="#2c1f0e"/>
    </linearGradient>
    <linearGradient id="eBeak" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#ffd23b"/><stop offset="1" stop-color="#d67e10"/>
    </linearGradient>
  </defs>
  <g class="float" filter="url(#eaSh)">
    <!-- LEFT wing (spread, feathered tips) -->
    <path d="M49 50 C40 42 28 33 15 30 C9 29 6 33 10 37 C17 41 24 45 29 51
             C21 48 13 49 8 54 C15 53 23 54 30 57
             C24 57 18 61 15 66 C22 62 31 61 38 62 C44 58 47 54 49 51 Z" fill="url(#eWing)"/>
    <!-- RIGHT wing -->
    <path d="M51 50 C60 42 72 33 85 30 C91 29 94 33 90 37 C83 41 76 45 71 51
             C79 48 87 49 92 54 C85 53 77 54 70 57
             C76 57 82 61 85 66 C78 62 69 61 62 62 C56 58 53 54 51 51 Z" fill="url(#eWing)"/>
    <!-- wing feather separations -->
    <g stroke="#241a0c" stroke-width="0.9" fill="none" opacity=".55" stroke-linecap="round">
      <path d="M30 40 q-8 3 -16 -1"/><path d="M33 48 q-10 2 -20 3"/><path d="M36 55 q-9 3 -17 6"/>
      <path d="M70 40 q8 3 16 -1"/><path d="M67 48 q10 2 20 3"/><path d="M64 55 q9 3 17 6"/>
    </g>
    <!-- tail -->
    <path d="M44 74 L56 74 L54 90 L50 92 L46 90 Z" fill="#f4f7fa"/>
    <path d="M50 74 L50 91" stroke="#c9d4df" stroke-width="0.8"/>
    <!-- body -->
    <path d="M50 45 C43 45 41 54 43 64 C45 73 50 78 50 78 C50 78 55 73 57 64 C59 54 57 45 50 45 Z" fill="url(#eBodyG)"/>
    <g stroke="#1e1508" stroke-width="0.8" fill="none" opacity=".5"><path d="M46 58 q4 4 8 0"/><path d="M46 65 q4 4 8 0"/></g>
    <!-- talons -->
    <path d="M46 76 l-2 6 M50 78 l0 6 M54 76 l2 6" stroke="#e0a020" stroke-width="2" stroke-linecap="round"/>
    <!-- white head -->
    <circle cx="50" cy="40" r="9.5" fill="#f6f9fc"/>
    <path d="M50 30.5 C44 31 41 35 41 40 C46 37 54 37 59 40 C59 35 56 31 50 30.5 Z" fill="#ffffff"/>
    <g stroke="#cfd9e4" stroke-width="0.8" fill="none" opacity=".8"><path d="M43 38 q7 -3 14 0"/><path d="M43 43 q7 -2 14 0"/></g>
    <!-- eyes -->
    <circle cx="46" cy="39" r="1.4" fill="#1a140a"/>
    <circle cx="54" cy="39" r="1.4" fill="#1a140a"/>
    <circle cx="46.4" cy="38.5" r="0.5" fill="#fff"/>
    <circle cx="54.4" cy="38.5" r="0.5" fill="#fff"/>
    <!-- hooked beak -->
    <path d="M46 43 Q50 41 54 43 Q52 50 50 51 Q48 50 46 43 Z" fill="url(#eBeak)"/>
    <path d="M49 50 q1 2 0 3 -1 -1 0 -3" fill="#c9760e"/>
  </g>
</svg>`,

    /* ---------------- GOLD — multiplier coin ------------------------ */
    gold: `
<svg class="art art-gold" viewBox="0 0 100 100">
  <defs>
    <radialGradient id="goldG" cx="42%" cy="34%" r="70%">
      <stop offset="0" stop-color="#fff4b0"/><stop offset="45%" stop-color="#f5c430"/><stop offset="100%" stop-color="#a9760f"/>
    </radialGradient>
    <linearGradient id="goldRim" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#ffe692"/><stop offset="1" stop-color="#7a5410"/>
    </linearGradient>
  </defs>
  <circle cx="50" cy="52" r="41" fill="url(#goldRim)"/>
  <circle cx="50" cy="50" r="39" fill="url(#goldRim)"/>
  <circle cx="50" cy="50" r="35" fill="url(#goldG)" stroke="#8a5c10" stroke-width="2"/>
  <circle cx="50" cy="50" r="30" fill="none" stroke="#c8960e" stroke-width="1.5" opacity=".7" stroke-dasharray="2 3"/>
  <g fill="#ffdf6a" opacity=".8">
    <circle cx="50" cy="20" r="1.6"/><circle cx="50" cy="80" r="1.6"/><circle cx="20" cy="50" r="1.6"/><circle cx="80" cy="50" r="1.6"/>
  </g>
  <ellipse cx="37" cy="35" rx="11" ry="5" fill="#fff" opacity=".45" transform="rotate(-32 37 35)"/>
</svg>`,

    ace:   woodCard('A', 'ace', '#f0c247', '#a9760f'),
    king:  woodCard('K', 'king', '#d84a3a', '#8f1c14'),
    queen: woodCard('Q', 'queen', '#a94ec9', '#5f238a'),
    jack:  woodCard('J', 'jack', '#3f9f52', '#1c6a2e'),
    ten:   woodCard('10', 'ten', '#e07a24', '#a2450c'),
    nine:  woodCard('9', 'nine', '#3f63d0', '#1b2f8f'),
  };

  window.SYMBOL_ART = ART;
})();
