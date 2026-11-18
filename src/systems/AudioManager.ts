import Phaser from 'phaser';
import { EventBus, GameEvents } from '@/core/EventBus';
import { GameState } from '@/core/GameState';
import { Maps } from '@/data/registry';

const VOL_KEY = 'ccp1.audio.vol';

interface VolSettings { master: number; bgm: number; sfx: number }

/**
 * 音频管理：只听 EventBus，缺文件时静默跳过。
 * 浏览器需用户首次输入后解锁。
 */
export class AudioManager {
  private scene: Phaser.Scene;
  private unlocked = false;
  private currentBgm: string | null = null;
  private bgm?: Phaser.Sound.BaseSound;
  private vol: VolSettings = { master: 0.7, bgm: 0.45, sfx: 0.7 };

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    try {
      const raw = localStorage.getItem(VOL_KEY);
      if (raw) this.vol = { ...this.vol, ...JSON.parse(raw) };
    } catch { /* ignore */ }

    const unlock = () => this.unlock();
    scene.input.on('pointerdown', unlock);
    scene.input.keyboard?.on('keydown', unlock);

    EventBus.on(GameEvents.MAP_ENTERED, this.onMap, this);
    EventBus.on(GameEvents.SKILL_CAST, this.onCast, this);
    EventBus.on(GameEvents.SKILL_LEARNED, this.onLearned, this);
    EventBus.on(GameEvents.LEVEL_UP, this.onLevelUp, this);
    EventBus.on(GameEvents.ENEMY_KILLED, this.onKill, this);
    EventBus.on(GameEvents.TOAST, this.onToast, this);

    scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.destroy());

    // World 可能已先发出 MAP_ENTERED，这里补一次
    scene.time.delayedCall(0, () => {
      const id = GameState.data.mapId;
      if (id && Maps[id]?.bgm) this.onMap({ mapId: id });
    });
  }

  setVolume(partial: Partial<VolSettings>) {
    this.vol = { ...this.vol, ...partial };
    try { localStorage.setItem(VOL_KEY, JSON.stringify(this.vol)); } catch { /* ignore */ }
    if (this.bgm && 'setVolume' in this.bgm) {
      (this.bgm as Phaser.Sound.WebAudioSound).setVolume(this.vol.master * this.vol.bgm);
    }
  }

  private destroy() {
    EventBus.off(GameEvents.MAP_ENTERED, this.onMap, this);
    EventBus.off(GameEvents.SKILL_CAST, this.onCast, this);
    EventBus.off(GameEvents.SKILL_LEARNED, this.onLearned, this);
    EventBus.off(GameEvents.LEVEL_UP, this.onLevelUp, this);
    EventBus.off(GameEvents.ENEMY_KILLED, this.onKill, this);
    EventBus.off(GameEvents.TOAST, this.onToast, this);
  }

  private unlock() {
    if (this.unlocked) return;
    this.unlocked = true;
    try {
      this.scene.sound.unlock();
      if (this.currentBgm) this.playBgm(this.currentBgm, true);
    } catch { /* ignore */ }
  }

  private onMap = ({ mapId }: { mapId: string }) => {
    const key = Maps[mapId]?.bgm;
    if (key) this.playBgm(key);
    else this.stopBgm();
  };

  private onCast = ({ skillId }: { skillId: string }) => {
    if (skillId === 'slash' || skillId === 'triple_slash') this.sfx('sfx_slash');
    else this.sfx('sfx_cast');
  };

  private onLearned = () => this.sfx('sfx_pickup');
  private onLevelUp = () => this.sfx('sfx_levelup');
  private onKill = () => this.sfx('sfx_kill');
  private onToast = () => this.sfx('sfx_ui');

  private playBgm(key: string, force = false) {
    if (!force && this.currentBgm === key && this.bgm?.isPlaying) return;
    this.currentBgm = key;
    if (!this.unlocked) return;
    if (!this.scene.cache.audio.exists(key)) return;

    const prev = this.bgm;
    const next = this.scene.sound.add(key, { loop: true, volume: 0 });
    this.bgm = next;
    next.play();
    this.scene.tweens.add({
      targets: next,
      volume: this.vol.master * this.vol.bgm,
      duration: 600,
    });
    if (prev) {
      this.scene.tweens.add({
        targets: prev,
        volume: 0,
        duration: 500,
        onComplete: () => { try { prev.stop(); prev.destroy(); } catch { /* ignore */ } },
      });
    }
  }

  private stopBgm() {
    this.currentBgm = null;
    if (!this.bgm) return;
    const prev = this.bgm;
    this.bgm = undefined;
    this.scene.tweens.add({
      targets: prev,
      volume: 0,
      duration: 400,
      onComplete: () => { try { prev.stop(); prev.destroy(); } catch { /* ignore */ } },
    });
  }

  private sfx(key: string) {
    if (!this.unlocked) return;
    if (!this.scene.cache.audio.exists(key)) return;
    try {
      this.scene.sound.play(key, { volume: this.vol.master * this.vol.sfx });
    } catch { /* ignore */ }
  }
}

/** 在常驻 UI 场景里挂载，保证切图后仍存活。 */
export function attachAudioManager(scene: Phaser.Scene) {
  const existing = scene.registry.get('audioManager') as AudioManager | undefined;
  if (existing) return existing;
  const am = new AudioManager(scene);
  scene.registry.set('audioManager', am);
  return am;
}
