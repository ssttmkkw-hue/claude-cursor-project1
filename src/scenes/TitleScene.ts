import Phaser from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH, START_MAP } from '@/config';
import { GameState } from '@/core/GameState';
import { Skin, uiText } from '@/ui/skin';

type MenuId = 'new' | 'continue' | 'settings';

interface MenuItem {
  id: MenuId;
  label: string;
  enabled: boolean;
}

/** 标题画面：新游戏 / 继续 / 设置（占位）。 */
export class TitleScene extends Phaser.Scene {
  private items: MenuItem[] = [];
  private index = 0;
  private labels: Phaser.GameObjects.Text[] = [];
  private cursor!: Phaser.GameObjects.Text;
  private bgSprites: Phaser.GameObjects.Image[] = [];

  constructor() { super('Title'); }

  create() {
    const hasSave = !!this.registry.get('hasSave');
    this.items = [
      { id: 'new', label: '新游戏', enabled: true },
      { id: 'continue', label: '继续', enabled: hasSave },
      { id: 'settings', label: '设置（即将开放）', enabled: false },
    ];
    this.index = hasSave ? 1 : 0;

    this.drawBackdrop();

    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x0a1218, 0.35);

    this.add.text(GAME_WIDTH / 2, 120, '风之旅人', {
      ...uiText(56, Skin.textAccent, 6),
    }).setOrigin(0.5);

    this.add.text(GAME_WIDTH / 2, 178, 'Project 1', uiText(18, Skin.textMuted)).setOrigin(0.5);

    const panel = this.add.rectangle(GAME_WIDTH / 2, 330, 320, 180, Skin.panel, 0.92)
      .setStrokeStyle(2, Skin.accent, 0.85);

    this.cursor = this.add.text(GAME_WIDTH / 2 - 120, 280, '▶', uiText(22, Skin.textAccent)).setOrigin(0.5);
    this.labels = this.items.map((item, i) => {
      const color = item.enabled ? Skin.text : '#667780';
      return this.add.text(GAME_WIDTH / 2, 280 + i * 44, item.label, uiText(22, color)).setOrigin(0.5);
    });

    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 36, '↑↓ 选择　Enter / J 确认', uiText(14, Skin.textMuted)).setOrigin(0.5);

    void panel;
    this.refreshCursor();

    const kb = this.input.keyboard!;
    kb.on('keydown-UP', () => this.move(-1));
    kb.on('keydown-DOWN', () => this.move(1));
    kb.on('keydown-W', () => this.move(-1));
    kb.on('keydown-S', () => this.move(1));
    kb.on('keydown-ENTER', () => this.confirm());
    kb.on('keydown-J', () => this.confirm());
    kb.on('keydown-SPACE', () => this.confirm());
  }

  private drawBackdrop() {
    // 用已有瓦片拼一幅慢速平移的村庄感背景
    const tile = this.textures.exists('tile_grass') ? 'tile_grass' : undefined;
    if (!tile) {
      this.cameras.main.setBackgroundColor('#2a4a3a');
      return;
    }
    const cols = Math.ceil(GAME_WIDTH / 32) + 4;
    const rows = Math.ceil(GAME_HEIGHT / 32) + 2;
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const key = (x + y) % 5 === 0 && this.textures.exists('tile_flowers')
          ? 'tile_flowers'
          : (x + y) % 3 === 0 && this.textures.exists('tile_grass_1')
            ? 'tile_grass_1'
            : 'tile_grass';
        const img = this.add.image(x * 32, y * 32, key).setOrigin(0).setAlpha(0.95);
        this.bgSprites.push(img);
      }
    }
    if (this.textures.exists('obj_tree')) {
      this.add.image(140, 420, 'obj_tree').setOrigin(0.5, 1).setScale(1.2).setAlpha(0.9);
      this.add.image(820, 460, 'obj_tree').setOrigin(0.5, 1).setScale(1.1).setAlpha(0.85);
    }
    if (this.textures.exists('obj_house')) {
      this.add.image(480, 390, 'obj_house').setOrigin(0.5, 1).setScale(0.85).setAlpha(0.95);
    }
    // 慢速左右摇摆，营造微风感（不整体漂移出屏）
    this.tweens.add({
      targets: this.bgSprites,
      x: '+=6',
      duration: 5000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }

  private move(delta: number) {
    const enabled = this.items.map((it, i) => (it.enabled ? i : -1)).filter((i) => i >= 0);
    if (!enabled.length) return;
    let pos = enabled.indexOf(this.index);
    if (pos < 0) pos = 0;
    pos = (pos + delta + enabled.length) % enabled.length;
    this.index = enabled[pos]!;
    this.refreshCursor();
  }

  private refreshCursor() {
    this.cursor.setY(280 + this.index * 44);
    this.labels.forEach((label, i) => {
      const item = this.items[i]!;
      const active = i === this.index;
      label.setColor(item.enabled ? (active ? Skin.textAccent : Skin.text) : '#667780');
      label.setScale(active && item.enabled ? 1.06 : 1);
    });
  }

  private confirm() {
    const item = this.items[this.index];
    if (!item?.enabled) return;
    if (item.id === 'new') {
      GameState.reset();
      this.registry.set('hasSave', false);
      this.enterWorld(START_MAP, 'default');
      return;
    }
    if (item.id === 'continue') {
      GameState.load();
      this.enterWorld(GameState.data.mapId, GameState.data.spawn);
    }
  }

  private enterWorld(mapId: string, spawn: string) {
    this.scene.start('World', { mapId, spawn });
    this.scene.launch('UI');
  }
}
