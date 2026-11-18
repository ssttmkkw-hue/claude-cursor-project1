/**
 * 用 SVG 矢量帧拼出主角 spritesheet（128×192，4×4，帧 32×48）。
 * 依赖：sharp（devDependency）。运行：node tools/build-sprites.mjs
 */
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'public/assets/characters/player.png');

const FW = 32;
const FH = 48;
const COLS = 4;
const ROWS = 4;
const OUTLINE = '#3a4a52';
const HAIR = '#6b8fd6';
const HAIR_DARK = '#5476b8';
const SKIN = '#ffe3cf';
const CLOTH = '#ffffff';
const ACCENT = '#7fd3c4';
const BLUSH = '#ffb3b3';

/** @typedef {'down'|'left'|'right'|'up'} Dir */
/** @type {Dir[]} */
const DIRS = ['down', 'left', 'right', 'up'];

/**
 * 走路循环：列 0 站立，列 1–3 迈步。
 * legPhase: -1 左脚前 / 0 并步 / 1 右脚前
 * bob: 身体上下微动
 */
function walkPose(col) {
  const table = [
    { leg: 0, bob: 0, arm: 0 },
    { leg: -1, bob: 1, arm: 1 },
    { leg: 0, bob: 0, arm: 0 },
    { leg: 1, bob: 1, arm: -1 },
  ];
  return table[col] ?? table[0];
}

function frameSvg(dir, col) {
  const { leg, bob, arm } = walkPose(col);
  const by = bob;

  // 腿：朝下/上用左右两腿；朝左/右用前后两腿（透视）
  const legs = (() => {
    if (dir === 'down' || dir === 'up') {
      const lY = 42 + (leg < 0 ? -2 : leg > 0 ? 1 : 0);
      const rY = 42 + (leg > 0 ? -2 : leg < 0 ? 1 : 0);
      const lX = 10 + (leg < 0 ? -1 : 0);
      const rX = 18 + (leg > 0 ? 1 : 0);
      return `
        <rect x="${lX}" y="${lY}" width="4" height="5" rx="1" fill="${OUTLINE}"/>
        <rect x="${rX}" y="${rY}" width="4" height="5" rx="1" fill="${OUTLINE}"/>`;
    }
    // 侧视：近腿 / 远腿
    const near = leg !== 0 ? (leg > 0 ? 1 : -1) : 0;
    const farOff = near === 0 ? 0 : -near;
    const baseX = dir === 'left' ? 13 : 15;
    return `
      <rect x="${baseX + farOff}" y="${43 + (farOff ? 1 : 0)}" width="4" height="4" rx="1" fill="${OUTLINE}" opacity="0.85"/>
      <rect x="${baseX + near}" y="${42 - Math.abs(near)}" width="4" height="5" rx="1" fill="${OUTLINE}"/>`;
  })();

  const bodyY = 24 - by;
  const headCy = 16 - by;
  const hairCy = 9 - by;

  // 手臂微摆（侧视更明显）
  const arms = (() => {
    if (dir === 'left' || dir === 'right') {
      const ax = dir === 'left' ? 7 : 21;
      const ay = 28 - by + arm;
      return `<rect x="${ax}" y="${ay}" width="4" height="8" rx="2" fill="${ACCENT}"/>`;
    }
    const lArm = 6 + (arm < 0 ? -1 : 0);
    const rArm = 22 + (arm > 0 ? 1 : 0);
    return `
      <rect x="${lArm}" y="${28 - by}" width="4" height="7" rx="2" fill="${ACCENT}"/>
      <rect x="${rArm}" y="${28 - by}" width="4" height="7" rx="2" fill="${ACCENT}"/>`;
  })();

  const face = (() => {
    if (dir === 'up') {
      return `
        <ellipse cx="16" cy="${hairCy}" rx="12" ry="7" fill="${HAIR}"/>
        <ellipse cx="16" cy="${hairCy + 2}" rx="11" ry="5" fill="${HAIR_DARK}" opacity="0.35"/>`;
    }
    if (dir === 'down') {
      return `
        <ellipse cx="16" cy="${hairCy}" rx="12" ry="7" fill="${HAIR}"/>
        <circle cx="12" cy="${headCy + 2}" r="2.4" fill="${OUTLINE}"/>
        <circle cx="20" cy="${headCy + 2}" r="2.4" fill="${OUTLINE}"/>
        <rect x="11" y="${headCy}" width="1.2" height="2" fill="#ffffff"/>
        <rect x="19" y="${headCy}" width="1.2" height="2" fill="#ffffff"/>
        <circle cx="9" cy="${headCy + 5}" r="2" fill="${BLUSH}" opacity="0.7"/>
        <circle cx="23" cy="${headCy + 5}" r="2" fill="${BLUSH}" opacity="0.7"/>
        <path d="M14 ${headCy + 7} Q16 ${headCy + 9} 18 ${headCy + 7}" fill="none" stroke="${OUTLINE}" stroke-width="1" stroke-linecap="round"/>`;
    }
    // left / right：侧脸
    const eyeX = dir === 'left' ? 12 : 20;
    const blushX = dir === 'left' ? 8 : 24;
    const hairShift = dir === 'left' ? -2 : 2;
    return `
      <ellipse cx="${16 + hairShift}" cy="${hairCy}" rx="12" ry="7" fill="${HAIR}"/>
      <circle cx="${eyeX}" cy="${headCy + 2}" r="2.4" fill="${OUTLINE}"/>
      <rect x="${eyeX - 1}" y="${headCy}" width="1.2" height="2" fill="#ffffff"/>
      <circle cx="${blushX}" cy="${headCy + 5}" r="2" fill="${BLUSH}" opacity="0.7"/>`;
  })();

  const scarf = dir === 'up'
    ? `<rect x="10" y="${bodyY + 2}" width="12" height="4" rx="2" fill="${ACCENT}"/>`
    : `<rect x="10" y="${bodyY + 1}" width="12" height="5" rx="2" fill="${ACCENT}"/>`;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${FW}" height="${FH}" viewBox="0 0 ${FW} ${FH}">
  ${legs}
  <rect x="8" y="${bodyY}" width="16" height="18" rx="5" fill="${CLOTH}" stroke="${OUTLINE}" stroke-width="1.5"/>
  ${scarf}
  ${arms}
  <circle cx="16" cy="${headCy}" r="11" fill="${SKIN}" stroke="${OUTLINE}" stroke-width="1.5"/>
  ${face}
</svg>`;
}

async function main() {
  const tiles = [];
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      const svg = Buffer.from(frameSvg(DIRS[row], col));
      const png = await sharp(svg).png().toBuffer();
      tiles.push({ input: png, left: col * FW, top: row * FH });
    }
  }

  await mkdir(path.dirname(OUT), { recursive: true });
  await sharp({
    create: {
      width: FW * COLS,
      height: FH * ROWS,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite(tiles)
    .png()
    .toFile(OUT);

  // 顺手写一份预览说明，方便人眼核对布局
  const meta = {
    file: 'public/assets/characters/player.png',
    frameWidth: FW,
    frameHeight: FH,
    cols: COLS,
    rows: ROWS,
    order: DIRS.map((d, i) => ({ row: i, dir: d })),
  };
  await writeFile(path.join(ROOT, 'public/assets/characters/player.meta.json'), `${JSON.stringify(meta, null, 2)}\n`);
  console.log(`wrote ${path.relative(ROOT, OUT)} (${FW * COLS}×${FH * ROWS})`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
