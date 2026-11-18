import Phaser from 'phaser';
import { KEYS } from '@/config';

export type Action =
  | 'up' | 'down' | 'left' | 'right'
  | 'dash' | 'interact'
  | 'skill0' | 'skill1' | 'skill2' | 'skill3'
  | 'menu';

const DEADZONE = 0.2;

/** Xbox 布局约定（浏览器 Gamepad API）。 */
const PAD = {
  A: 0, B: 1, X: 2, Y: 3,
  LB: 4, RB: 5,
  DUp: 12, DDown: 13, DLeft: 14, DRight: 15,
} as const;

/**
 * 键盘 + 手柄统一动作查询。
 * 用法：`input.isDown('up')` / `justPressed('skill0')` / `axis()`。
 */
export class InputMap {
  private scene: Phaser.Scene;
  private keys: Record<string, Phaser.Input.Keyboard.Key[]>;
  private prevPadButtons: boolean[] = [];

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    const kb = scene.input.keyboard!;
    const group = (names: readonly string[]) => names.map((n) => kb.addKey(n));
    this.keys = {
      up: group(KEYS.up),
      down: group(KEYS.down),
      left: group(KEYS.left),
      right: group(KEYS.right),
      dash: group(KEYS.dash),
      interact: group(KEYS.interact),
      skill0: group([KEYS.skills[0]!]),
      skill1: group([KEYS.skills[1]!]),
      skill2: group([KEYS.skills[2]!]),
      skill3: group([KEYS.skills[3]!]),
      menu: group(KEYS.menu),
    };
  }

  /** 归一化移动向量，长度 ≤ 1。 */
  axis(): Phaser.Math.Vector2 {
    let x = (this.isDown('right') ? 1 : 0) - (this.isDown('left') ? 1 : 0);
    let y = (this.isDown('down') ? 1 : 0) - (this.isDown('up') ? 1 : 0);

    const pad = this.pad();
    if (pad) {
      let ax = pad.axes[0] ?? 0;
      let ay = pad.axes[1] ?? 0;
      if (Math.abs(ax) < DEADZONE) ax = 0;
      if (Math.abs(ay) < DEADZONE) ay = 0;
      if (ax || ay) { x = ax; y = ay; }
      if (pad.buttons[PAD.DLeft]?.pressed) x = -1;
      if (pad.buttons[PAD.DRight]?.pressed) x = 1;
      if (pad.buttons[PAD.DUp]?.pressed) y = -1;
      if (pad.buttons[PAD.DDown]?.pressed) y = 1;
    }

    const v = new Phaser.Math.Vector2(x, y);
    if (v.length() > 1) v.normalize();
    return v;
  }

  isDown(action: Action): boolean {
    if (this.keys[action]?.some((k) => k.isDown)) return true;
    const pad = this.pad();
    if (!pad) return false;
    switch (action) {
      case 'up': return !!pad.buttons[PAD.DUp]?.pressed || (pad.axes[1] ?? 0) < -DEADZONE;
      case 'down': return !!pad.buttons[PAD.DDown]?.pressed || (pad.axes[1] ?? 0) > DEADZONE;
      case 'left': return !!pad.buttons[PAD.DLeft]?.pressed || (pad.axes[0] ?? 0) < -DEADZONE;
      case 'right': return !!pad.buttons[PAD.DRight]?.pressed || (pad.axes[0] ?? 0) > DEADZONE;
      case 'dash': return !!pad.buttons[PAD.B]?.pressed;
      case 'interact':
      case 'skill0': return !!pad.buttons[PAD.A]?.pressed;
      case 'skill1': return !!pad.buttons[PAD.X]?.pressed;
      case 'skill2': return !!pad.buttons[PAD.Y]?.pressed;
      case 'skill3': return !!pad.buttons[PAD.RB]?.pressed;
      default: return false;
    }
  }

  justPressed(action: Action): boolean {
    if (this.keys[action]?.some((k) => Phaser.Input.Keyboard.JustDown(k))) return true;
    const pad = this.pad();
    if (!pad) return false;
    const idx = this.padButtonIndex(action);
    if (idx < 0) return false;
    const now = !!pad.buttons[idx]?.pressed;
    const was = !!this.prevPadButtons[idx];
    return now && !was;
  }

  /** 每帧末尾调用，刷新手柄边沿检测。 */
  endFrame() {
    const pad = this.pad();
    if (!pad) { this.prevPadButtons = []; return; }
    this.prevPadButtons = pad.buttons.map((b) => !!b?.pressed);
  }

  private padButtonIndex(action: Action): number {
    switch (action) {
      case 'dash': return PAD.B;
      case 'interact':
      case 'skill0': return PAD.A;
      case 'skill1': return PAD.X;
      case 'skill2': return PAD.Y;
      case 'skill3': return PAD.RB;
      default: return -1;
    }
  }

  private pad(): Gamepad | null {
    const pads = this.scene.input.gamepad;
    if (!pads || !pads.total) return null;
    const p = pads.getPad(0);
    // Phaser pad → native for buttons/axes consistency
    const native = navigator.getGamepads?.()?.[p?.index ?? 0];
    return native ?? null;
  }
}
