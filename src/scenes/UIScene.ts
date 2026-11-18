import Phaser from 'phaser';
import { KEYS, UI_FONT } from '@/config';
import { EventBus, GameEvents, type PlayerStatsPayload } from '@/core/EventBus';
import { Skills } from '@/data/registry';
import { GameState, expToNext } from '@/core/GameState';

/**
 * HUD 场景，叠在 WorldScene 上方，切图时不重启。只通过 EventBus 收数据。
 * 视觉部分（面板/字体/图标）是 Cursor 的美术任务，见 docs/cursor-tasks/。
 */
const PANEL = 0x24343c;
const text = (size: number, color = '#ffffff') => ({
  fontFamily: UI_FONT, fontSize: `${size}px`, color, stroke: '#24343c', strokeThickness: 3,
});

interface Slot { bg: Phaser.GameObjects.Rectangle; icon: Phaser.GameObjects.Image; cd: Phaser.GameObjects.Rectangle; until: number; total: number; }

export class UIScene extends Phaser.Scene {
  private bars!: Phaser.GameObjects.Graphics;
  private levelText!: Phaser.GameObjects.Text;
  private slots: Slot[] = [];
  private banner!: Phaser.GameObjects.Text;
  private toast!: Phaser.GameObjects.Text;
  private dialog!: Phaser.GameObjects.Container;
  private dialogText!: Phaser.GameObjects.Text;
  private dialogName!: Phaser.GameObjects.Text;
  private dialogLines: string[] = [];

  constructor() { super('UI'); }

  create() {
    const { width, height } = this.scale;
    this.bars = this.add.graphics();
    this.levelText = this.add.text(16, 12, '', text(14));

    // 技能栏
    const size = 44, gap = 10, total = KEYS.skills.length * size + (KEYS.skills.length - 1) * gap;
    KEYS.skills.forEach((key, i) => {
      const x = width / 2 - total / 2 + i * (size + gap) + size / 2, y = height - 40;
      const bg = this.add.rectangle(x, y, size, size, PANEL, 0.85).setStrokeStyle(2, 0xbff6ff, 0.8);
      const icon = this.add.image(x, y, 'icon_slash').setDisplaySize(size - 8, size - 8).setVisible(false);
      const cd = this.add.rectangle(x - size / 2, y + size / 2, size, 0, 0x000000, 0.55).setOrigin(0, 1);
      this.add.text(x + size / 2 - 4, y + size / 2 - 2, key, text(11)).setOrigin(1, 1);
      this.slots.push({ bg, icon, cd, until: 0, total: 1 });
    });

    this.banner = this.add.text(width / 2, 70, '', { ...text(26), strokeThickness: 5 }).setOrigin(0.5).setAlpha(0);
    this.toast = this.add.text(width / 2, height - 100, '', text(16, '#fff6c8')).setOrigin(0.5).setAlpha(0);

    // 对话框
    const dw = width - 120, dh = 110;
    const box = this.add.rectangle(0, 0, dw, dh, PANEL, 0.92).setStrokeStyle(2, 0xbff6ff).setOrigin(0.5);
    this.dialogName = this.add.text(-dw / 2 + 18, -dh / 2 + 10, '', text(15, '#9ff0d8'));
    this.dialogText = this.add.text(-dw / 2 + 18, -dh / 2 + 36, '', { ...text(16), wordWrap: { width: dw - 36 } });
    const more = this.add.text(dw / 2 - 14, dh / 2 - 10, '▼ E', text(12)).setOrigin(1, 1);
    this.dialog = this.add.container(width / 2, height - 90, [box, this.dialogName, this.dialogText, more]).setVisible(false);
    this.input.keyboard!.on('keydown-E', () => this.advanceDialog());
    this.input.keyboard!.on('keydown-SPACE', () => this.advanceDialog());

    const on = <T>(ev: string, fn: (p: T) => void) => { EventBus.on(ev, fn, this); };
    on<PlayerStatsPayload>(GameEvents.PLAYER_STATS, (p) => this.drawStats(p));
    on<(string | null)[]>(GameEvents.SKILL_SLOTS, (s) => this.setSlots(s));
    on<{ slot: number; cooldown: number }>(GameEvents.SKILL_CAST, ({ slot, cooldown }) => {
      const s = this.slots[slot]; s.until = this.time.now + cooldown; s.total = cooldown;
      this.tweens.add({ targets: s.bg, scale: 1.12, duration: 70, yoyo: true });
    });
    on<{ name: string }>(GameEvents.MAP_ENTERED, ({ name }) => this.showBanner(name));
    on<string>(GameEvents.TOAST, (msg) => this.showToast(msg));
    on<{ level: number }>(GameEvents.LEVEL_UP, ({ level }) => this.showToast(`升级！Lv.${level}`));
    on<{ speaker?: string; lines: string[] }>(GameEvents.DIALOG_OPEN, ({ speaker, lines }) => this.openDialog(speaker, lines));

    // 首次绘制（World 可能比本场景先创建，错过了第一批事件）
    const p = GameState.data.player;
    this.drawStats({ ...p, nextExp: expToNext(p.level) });
    this.setSlots(GameState.data.slots);
  }

  update(time: number) {
    for (const s of this.slots) {
      const left = Math.max(0, s.until - time);
      s.cd.height = left > 0 ? -44 * (left / s.total) : 0; // 负高度 = 自底向上
    }
  }

  private drawStats(p: PlayerStatsPayload) {
    const g = this.bars.clear();
    const bar = (y: number, v: number, max: number, color: number) => {
      g.fillStyle(PANEL, 0.85).fillRoundedRect(14, y, 204, 14, 6);
      g.fillStyle(color).fillRoundedRect(16, y + 2, Math.max(0, 200 * (v / max)), 10, 4);
    };
    bar(34, p.hp, p.maxHp, 0xff8fa3);
    bar(52, p.mp, p.maxMp, 0x8fc8ff);
    g.fillStyle(0xfff0a8).fillRect(16, 70, 200 * (p.exp / p.nextExp), 3);
    this.levelText.setText(`Lv.${p.level}   HP ${Math.ceil(p.hp)}/${p.maxHp}   MP ${Math.floor(p.mp)}/${p.maxMp}`);
  }

  private setSlots(ids: (string | null)[]) {
    ids.forEach((id, i) => {
      const s = this.slots[i]; if (!s) return;
      const skill = id ? Skills[id] : null;
      s.icon.setVisible(!!skill);
      if (skill && this.textures.exists(skill.icon)) s.icon.setTexture(skill.icon).setDisplaySize(36, 36);
    });
  }

  private showBanner(name: string) {
    this.banner.setText(name).setAlpha(0).setY(60);
    this.tweens.killTweensOf(this.banner);
    this.tweens.chain({ targets: this.banner, tweens: [
      { alpha: 1, y: 70, duration: 400, ease: 'Cubic.easeOut' },
      { alpha: 0, duration: 600, delay: 1400 },
    ] });
  }

  private showToast(msg: string) {
    this.toast.setText(msg).setAlpha(1);
    this.tweens.killTweensOf(this.toast);
    this.tweens.add({ targets: this.toast, alpha: 0, delay: 1800, duration: 500 });
  }

  private openDialog(speaker: string | undefined, lines: string[]) {
    this.dialogLines = [...lines];
    this.dialogName.setText(speaker ?? '');
    this.dialog.setVisible(true);
    this.dialogText.setText(this.dialogLines.shift() ?? '');
  }

  private advanceDialog() {
    if (!this.dialog.visible) return;
    const next = this.dialogLines.shift();
    if (next !== undefined) { this.dialogText.setText(next); return; }
    this.dialog.setVisible(false);
    // 延迟一帧再解锁，避免同一次 E 键又触发交互
    this.time.delayedCall(50, () => EventBus.emit(GameEvents.DIALOG_CLOSED));
  }
}
