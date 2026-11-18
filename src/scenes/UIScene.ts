import Phaser from 'phaser';
import { KEYS } from '@/config';
import { EventBus, GameEvents, type PlayerStatsPayload } from '@/core/EventBus';
import { Skills } from '@/data/registry';
import { GameState, expToNext } from '@/core/GameState';
import { Skin, uiText } from '@/ui/skin';

/**
 * HUD 场景，叠在 WorldScene 上方，切图时不重启。只通过 EventBus 收数据。
 * 皮肤见 ART-08 / src/ui/skin.ts。
 */
interface Slot {
  bg: Phaser.GameObjects.Image | Phaser.GameObjects.Rectangle;
  icon: Phaser.GameObjects.Image;
  cd: Phaser.GameObjects.Rectangle;
  until: number;
  total: number;
}

export class UIScene extends Phaser.Scene {
  private bars!: Phaser.GameObjects.Graphics;
  private hudPanel!: Phaser.GameObjects.Graphics;
  private levelText!: Phaser.GameObjects.Text;
  private slots: Slot[] = [];
  private banner!: Phaser.GameObjects.Text;
  private bannerBg!: Phaser.GameObjects.Graphics;
  private toast!: Phaser.GameObjects.Text;
  private dialog!: Phaser.GameObjects.Container;
  private dialogText!: Phaser.GameObjects.Text;
  private dialogName!: Phaser.GameObjects.Text;
  private dialogHint!: Phaser.GameObjects.Text;
  private dialogLines: string[] = [];
  private typing = false;
  private fullLine = '';
  private typeEvent?: Phaser.Time.TimerEvent;

  constructor() { super('UI'); }

  create() {
    const { width, height } = this.scale;
    void document.fonts?.load?.('16px "ZCOOL KuaiLe"').catch(() => undefined);

    this.hudPanel = this.add.graphics();
    this.hudPanel.fillStyle(Skin.panel, 0.82);
    this.hudPanel.fillRoundedRect(8, 6, 236, 76, 10);
    this.hudPanel.lineStyle(2, Skin.accent, 0.75);
    this.hudPanel.strokeRoundedRect(8, 6, 236, 76, 10);

    this.bars = this.add.graphics();
    this.levelText = this.add.text(18, 12, '', uiText(15, Skin.textAccent));

    const size = 48, gap = 10, total = KEYS.skills.length * size + (KEYS.skills.length - 1) * gap;
    KEYS.skills.forEach((key, i) => {
      const x = width / 2 - total / 2 + i * (size + gap) + size / 2, y = height - 42;
      const bg = this.textures.exists('ui_slot')
        ? this.add.image(x, y, 'ui_slot').setDisplaySize(size, size)
        : this.add.rectangle(x, y, size, size, Skin.panel, Skin.panelAlpha).setStrokeStyle(2, Skin.accent, 0.85);
      const icon = this.add.image(x, y, 'icon_slash').setDisplaySize(size - 12, size - 12).setVisible(false);
      const cd = this.add.rectangle(x - size / 2, y + size / 2, size, 0, 0x000000, 0.55).setOrigin(0, 1);
      this.add.text(x + size / 2 - 5, y + size / 2 - 3, key, uiText(12, Skin.textAccent)).setOrigin(1, 1);
      this.slots.push({ bg, icon, cd, until: 0, total: 1 });
    });

    this.bannerBg = this.add.graphics().setAlpha(0);
    this.banner = this.add.text(width / 2, 70, '', { ...uiText(28, Skin.text), strokeThickness: 5 }).setOrigin(0.5).setAlpha(0);
    this.toast = this.add.text(width / 2, height - 108, '', uiText(17, Skin.textWarn)).setOrigin(0.5).setAlpha(0);

    const dw = width - 120, dh = 118;
    const box = this.textures.exists('ui_panel')
      ? this.add.nineslice(0, 0, 'ui_panel', undefined, dw, dh, 16, 16, 16, 16).setOrigin(0.5)
      : this.add.rectangle(0, 0, dw, dh, Skin.panel, 0.94).setStrokeStyle(2, Skin.accent).setOrigin(0.5);
    this.dialogName = this.add.text(-dw / 2 + 20, -dh / 2 + 12, '', uiText(16, Skin.textAccent));
    this.dialogText = this.add.text(-dw / 2 + 20, -dh / 2 + 40, '', { ...uiText(17), wordWrap: { width: dw - 40 } });
    this.dialogHint = this.add.text(dw / 2 - 16, dh / 2 - 12, '▼ E', uiText(13, Skin.textMuted)).setOrigin(1, 1);
    this.dialog = this.add.container(width / 2, height - 92, [box, this.dialogName, this.dialogText, this.dialogHint]).setVisible(false);
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

    const p = GameState.data.player;
    this.drawStats({ ...p, nextExp: expToNext(p.level) });
    this.setSlots(GameState.data.slots);
  }

  update(time: number) {
    for (const s of this.slots) {
      const left = Math.max(0, s.until - time);
      s.cd.height = left > 0 ? -48 * (left / s.total) : 0;
    }
  }

  private drawStats(p: PlayerStatsPayload) {
    const g = this.bars.clear();
    const bar = (y: number, v: number, max: number, color: number) => {
      g.fillStyle(Skin.panelInner, 0.95).fillRoundedRect(16, y, 212, 14, 6);
      g.lineStyle(1, Skin.accent, 0.35).strokeRoundedRect(16, y, 212, 14, 6);
      g.fillStyle(color).fillRoundedRect(18, y + 2, Math.max(0, 208 * (v / max)), 10, 4);
    };
    bar(34, p.hp, p.maxHp, Skin.danger);
    bar(52, p.mp, p.maxMp, Skin.mana);
    g.fillStyle(Skin.exp).fillRoundedRect(18, 70, Math.max(0, 208 * (p.exp / p.nextExp)), 4, 2);
    this.levelText.setText(`Lv.${p.level}   HP ${Math.ceil(p.hp)}/${p.maxHp}   MP ${Math.floor(p.mp)}/${p.maxMp}`);
  }

  private setSlots(ids: (string | null)[]) {
    ids.forEach((id, i) => {
      const s = this.slots[i]; if (!s) return;
      const skill = id ? Skills[id] : null;
      s.icon.setVisible(!!skill);
      if (skill && this.textures.exists(skill.icon)) s.icon.setTexture(skill.icon).setDisplaySize(34, 34);
    });
  }

  private showBanner(name: string) {
    const { width } = this.scale;
    this.banner.setText(name).setAlpha(0).setY(58);
    this.bannerBg.clear().setAlpha(0);
    const tw = Math.min(360, Math.max(160, name.length * 28 + 48));
    this.bannerBg.fillStyle(Skin.panel, 0.88).fillRoundedRect(width / 2 - tw / 2, 48, tw, 44, 12);
    this.bannerBg.lineStyle(2, Skin.accent, 0.8).strokeRoundedRect(width / 2 - tw / 2, 48, tw, 44, 12);
    this.tweens.killTweensOf(this.banner);
    this.tweens.killTweensOf(this.bannerBg);
    this.tweens.add({ targets: this.bannerBg, alpha: 1, duration: 380, ease: 'Cubic.easeOut', yoyo: false,
      onComplete: () => this.tweens.add({ targets: this.bannerBg, alpha: 0, delay: 1300, duration: 550 }) });
    this.tweens.chain({ targets: this.banner, tweens: [
      { alpha: 1, y: 66, duration: 380, ease: 'Cubic.easeOut' },
      { alpha: 0, duration: 550, delay: 1300 },
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
    this.startTyping(this.dialogLines.shift() ?? '');
  }

  private startTyping(line: string) {
    this.typeEvent?.remove(false);
    this.fullLine = line;
    this.typing = line.length > 0;
    this.dialogText.setText('');
    this.dialogHint.setText(this.typing ? '▼ E 跳过' : '▼ E');
    if (!this.typing) return;
    let i = 0;
    this.typeEvent = this.time.addEvent({
      delay: 26,
      repeat: Math.max(0, line.length - 1),
      callback: () => {
        i += 1;
        this.dialogText.setText(line.slice(0, i));
        if (i >= line.length) {
          this.typing = false;
          this.dialogHint.setText('▼ E');
        }
      },
    });
  }

  private advanceDialog() {
    if (!this.dialog.visible) return;
    if (this.typing) {
      this.typeEvent?.remove(false);
      this.dialogText.setText(this.fullLine);
      this.typing = false;
      this.dialogHint.setText('▼ E');
      return;
    }
    const next = this.dialogLines.shift();
    if (next !== undefined) { this.startTyping(next); return; }
    this.dialog.setVisible(false);
    this.time.delayedCall(50, () => EventBus.emit(GameEvents.DIALOG_CLOSED));
  }
}
