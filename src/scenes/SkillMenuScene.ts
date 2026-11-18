import Phaser from 'phaser';
import { KEYS, UI_FONT } from '@/config';
import { GameState } from '@/core/GameState';
import { Skills } from '@/data/registry';

/**
 * 技能装备菜单（Tab 开关）。
 * 自启动监听按键，不依赖改 Boot/World；打开时 pause World，关闭时 resume + save。
 */
const PANEL = 0x24343c;
const ACCENT = 0xbff6ff;
const SELECT = 0x9ff0d8;

type Side = 'learned' | 'slots';

const textStyle = (size: number, color = '#ffffff'): Phaser.Types.GameObjects.Text.TextStyle => ({
  fontFamily: UI_FONT, fontSize: `${size}px`, color, stroke: '#1a2830', strokeThickness: 3,
});

export class SkillMenuScene extends Phaser.Scene {
  private open = false;
  private root!: Phaser.GameObjects.Container;
  private side: Side = 'learned';
  private learnedIndex = 0;
  private slotIndex = 0;
  /** 左侧选中、准备装入槽位的技能 */
  private pending: string | null = null;

  constructor() {
    super({ key: 'SkillMenu', active: true });
  }

  create() {
    this.root = this.add.container(0, 0).setVisible(false).setDepth(10000);
    this.rebuild();

    const kb = this.input.keyboard!;
    kb.addCapture([...KEYS.menu]);
    for (const name of KEYS.menu) {
      kb.on(`keydown-${name}`, (e: KeyboardEvent) => {
        e.preventDefault();
        this.toggle();
      });
    }
    kb.on('keydown-ESC', () => { if (this.open) this.closeMenu(); });
    kb.on('keydown-ENTER', () => { if (this.open) this.confirm(); });
    kb.on('keydown-J', () => { if (this.open) this.confirm(); });
    kb.on('keydown-UP', () => { if (this.open) this.move(-1); });
    kb.on('keydown-DOWN', () => { if (this.open) this.move(1); });
    kb.on('keydown-LEFT', () => { if (this.open) this.switchSide('learned'); });
    kb.on('keydown-RIGHT', () => { if (this.open) this.switchSide('slots'); });
    kb.on('keydown-W', () => { if (this.open) this.move(-1); });
    kb.on('keydown-S', () => { if (this.open) this.move(1); });
    kb.on('keydown-A', () => { if (this.open) this.switchSide('learned'); });
    kb.on('keydown-D', () => { if (this.open) this.switchSide('slots'); });
  }

  private worldReady() {
    return this.scene.isActive('World') || this.scene.isPaused('World');
  }

  private toggle() {
    if (!this.worldReady()) return;
    if (this.open) this.closeMenu();
    else this.openMenu();
  }

  private openMenu() {
    this.open = true;
    this.side = 'learned';
    this.learnedIndex = 0;
    this.slotIndex = 0;
    this.pending = GameState.data.learned[0] ?? null;
    this.rebuild();
    this.root.setVisible(true);
    if (this.scene.isActive('World') && !this.scene.isPaused('World')) {
      this.scene.pause('World');
    }
  }

  private closeMenu() {
    this.open = false;
    this.root.setVisible(false);
    GameState.save();
    if (this.scene.isPaused('World')) this.scene.resume('World');
  }

  private learnedIds() {
    return GameState.data.learned.filter((id) => Skills[id]);
  }

  private move(delta: number) {
    if (this.side === 'learned') {
      const list = this.learnedIds();
      if (!list.length) return;
      this.learnedIndex = (this.learnedIndex + delta + list.length) % list.length;
      this.pending = list[this.learnedIndex] ?? null;
    } else {
      this.slotIndex = (this.slotIndex + delta + 4) % 4;
    }
    this.rebuild();
  }

  private switchSide(side: Side) {
    this.side = side;
    this.rebuild();
  }

  private confirm() {
    if (this.side === 'learned') {
      const list = this.learnedIds();
      this.pending = list[this.learnedIndex] ?? null;
      this.side = 'slots';
      this.rebuild();
      return;
    }
    // 槽位侧
    const cur = GameState.data.slots[this.slotIndex];
    if (this.pending) {
      if (cur === this.pending) {
        this.equipTo(this.slotIndex, null);
      } else {
        this.equipTo(this.slotIndex, this.pending);
      }
    } else if (cur) {
      this.equipTo(this.slotIndex, null);
    }
    this.rebuild();
  }

  /** 装到新槽时从其它槽移除同一技能 */
  private equipTo(slot: number, skillId: string | null) {
    if (skillId) {
      GameState.data.slots.forEach((id, i) => {
        if (id === skillId && i !== slot) GameState.equip(i, null);
      });
    }
    GameState.equip(slot, skillId);
  }

  private rebuild() {
    this.root.removeAll(true);
    const { width, height } = this.scale;
    const dim = this.add.rectangle(width / 2, height / 2, width, height, 0x0a1218, 0.55);
    this.root.add(dim);

    const panelW = Math.min(760, width - 48);
    const panelH = Math.min(400, height - 48);
    const cx = width / 2;
    const cy = height / 2;
    const panel = this.add.rectangle(cx, cy, panelW, panelH, PANEL, 0.96)
      .setStrokeStyle(2, ACCENT, 0.9);
    this.root.add(panel);

    const title = this.add.text(cx, cy - panelH / 2 + 22, '技能装备', textStyle(22, '#9ff0d8')).setOrigin(0.5);
    const hint = this.add.text(
      cx, cy + panelH / 2 - 18,
      '方向键切换　J/Enter 确认　Tab/Esc 关闭',
      textStyle(13, '#c8d6de'),
    ).setOrigin(0.5);
    this.root.add(title);
    this.root.add(hint);

    const leftX = cx - panelW / 2 + 24;
    const rightX = cx + 20;
    const topY = cy - panelH / 2 + 52;

    // --- 左侧：已习得 ---
    const leftLabel = this.add.text(leftX, topY, '已习得', textStyle(15, this.side === 'learned' ? '#9ff0d8' : '#a8b8c2'));
    this.root.add(leftLabel);
    const learned = this.learnedIds();
    const rowH = 56;
    learned.forEach((id, i) => {
      const skill = Skills[id];
      const y = topY + 28 + i * rowH;
      const focused = this.side === 'learned' && i === this.learnedIndex;
      const pending = this.pending === id;
      const bg = this.add.rectangle(leftX + 170, y + 22, 340, 50, focused ? 0x2f4a52 : 0x1c2a32, focused ? 0.95 : 0.75)
        .setStrokeStyle(2, focused ? SELECT : (pending ? ACCENT : 0x3a4a52), focused || pending ? 0.95 : 0.4);
      const icon = this.add.image(leftX + 28, y + 22, skill.icon).setDisplaySize(36, 36);
      if (!this.textures.exists(skill.icon)) icon.setVisible(false);
      const name = this.add.text(leftX + 54, y + 6, skill.name, textStyle(15));
      const meta = `MP ${skill.mp}  CD ${skill.cooldown}ms`;
      const desc = this.add.text(leftX + 54, y + 26, `${skill.description}  ${meta}`, {
        ...textStyle(12, '#b0c0c8'),
        wordWrap: { width: 260 },
      });
      this.root.add([bg, icon, name, desc]);
    });
    if (!learned.length) {
      this.root.add(this.add.text(leftX, topY + 40, '尚未习得其它技能', textStyle(14, '#8899a4')));
    }

    // --- 右侧：4 槽 ---
    this.root.add(this.add.text(rightX, topY, '装备槽', textStyle(15, this.side === 'slots' ? '#9ff0d8' : '#a8b8c2')));
    const slotKeys = KEYS.skills;
    for (let i = 0; i < 4; i++) {
      const y = topY + 36 + i * 68;
      const focused = this.side === 'slots' && i === this.slotIndex;
      const id = GameState.data.slots[i];
      const skill = id ? Skills[id] : null;
      const bg = this.add.rectangle(rightX + 120, y + 24, 240, 56, focused ? 0x2f4a52 : 0x1c2a32, 0.9)
        .setStrokeStyle(2, focused ? SELECT : ACCENT, focused ? 1 : 0.45);
      const keyLabel = this.add.text(rightX + 16, y + 24, slotKeys[i] ?? String(i + 1), textStyle(14, '#9ff0d8')).setOrigin(0, 0.5);
      if (skill) {
        const icon = this.add.image(rightX + 56, y + 24, skill.icon).setDisplaySize(36, 36);
        if (!this.textures.exists(skill.icon)) icon.setVisible(false);
        const name = this.add.text(rightX + 82, y + 10, skill.name, textStyle(15));
        const meta = this.add.text(rightX + 82, y + 30, `MP ${skill.mp} · CD ${skill.cooldown}ms`, textStyle(12, '#b0c0c8'));
        this.root.add([bg, keyLabel, icon, name, meta]);
      } else {
        const empty = this.add.text(rightX + 56, y + 24, '（空）', textStyle(14, '#7a8a94')).setOrigin(0, 0.5);
        this.root.add([bg, keyLabel, empty]);
      }
    }
  }
}
