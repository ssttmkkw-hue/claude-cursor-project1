import Phaser from 'phaser';

/**
 * 角色动画约定（详见 docs/ART_SPEC.md §角色）：
 *   spritesheet，帧 32x48，4 行 × 4 列：行 = down / left / right / up，列 0 = 站立，列 0-3 = 走路循环。
 * 可选：继续往下加行提供动作帧（见 ACTIONS），整图 128×384 = 行走 + attack，128×576 = 再加 cast。
 * 若纹理不是 16 帧的 spritesheet（例如占位图），自动退化为“程序化弹跳 + 左右翻转”。
 */
export type Dir = 'down' | 'left' | 'right' | 'up';
export const DIRS: Dir[] = ['down', 'left', 'right', 'up'];
const COLS = 4;
/** 动作行顺序（spritesheet 第 4 行起，每个动作占 4 行 = 4 个方向） */
export const ACTIONS = ['attack', 'cast'] as const;

export function dirFromVector(x: number, y: number, fallback: Dir = 'down'): Dir {
  if (x === 0 && y === 0) return fallback;
  if (Math.abs(x) > Math.abs(y)) return x < 0 ? 'left' : 'right';
  return y < 0 ? 'up' : 'down';
}

/** 为纹理创建 walk/idle 动画；返回是否是真正的 spritesheet。重复调用安全。 */
export function ensureCharacterAnims(scene: Phaser.Scene, key: string): boolean {
  const tex = scene.textures.get(key);
  if (tex.frameTotal - 1 < DIRS.length * COLS) return false;
  DIRS.forEach((dir, row) => {
    const walk = `${key}_walk_${dir}`;
    if (!scene.anims.exists(walk)) {
      scene.anims.create({
        key: walk,
        frames: scene.anims.generateFrameNumbers(key, { start: row * COLS, end: row * COLS + COLS - 1 }),
        frameRate: 9,
        repeat: -1,
      });
    }
    const idle = `${key}_idle_${dir}`;
    if (!scene.anims.exists(idle)) {
      scene.anims.create({ key: idle, frames: [{ key, frame: row * COLS }], frameRate: 1 });
    }
  });
  // 可选动作行：第 4–7 行 = attack，第 8–11 行 = cast（方向顺序同上），各 4 帧、播一次
  ACTIONS.forEach((action, ai) => {
    DIRS.forEach((dir, d) => {
      const row = DIRS.length * (ai + 1) + d;
      const k = `${key}_${action}_${dir}`;
      if (tex.frameTotal - 1 < (row + 1) * COLS || scene.anims.exists(k)) return;
      scene.anims.create({
        key: k,
        frames: scene.anims.generateFrameNumbers(key, { start: row * COLS, end: row * COLS + COLS - 1 }),
        frameRate: 16,
        repeat: 0,
      });
    });
  });
  return true;
}
