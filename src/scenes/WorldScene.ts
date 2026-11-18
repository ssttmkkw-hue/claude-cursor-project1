import Phaser from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH, START_MAP } from '@/config';
import { EventBus, GameEvents } from '@/core/EventBus';
import { GameState } from '@/core/GameState';
import { Enemies, Maps, Skills } from '@/data/registry';
import { buildMap, type BuiltMap } from '@/systems/MapBuilder';
import type { CombatWorld } from '@/systems/SkillSystem';
import type { Combatant, Team } from '@/entities/Combatant';
import { Player } from '@/entities/Player';
import { Enemy } from '@/entities/Enemy';
import { Npc, Pickup, type Interactable } from '@/entities/Interactables';

interface WorldData { mapId?: string; spawn?: string; }

/** 世界场景：一张地图 = 一次 Scene 启动。切图 = scene.restart(新 mapId)。 */
export class WorldScene extends Phaser.Scene implements CombatWorld {
  map!: BuiltMap;
  player!: Player;
  enemies: Enemy[] = [];
  interactables: Interactable[] = [];
  solids!: Phaser.Physics.Arcade.StaticGroup;
  private transitioning = false;
  private dialogOpen = false;
  private hint!: Phaser.GameObjects.Image;

  constructor() { super('World'); }

  init(data: WorldData) {
    const mapId = data.mapId && Maps[data.mapId] ? data.mapId : START_MAP;
    GameState.data.mapId = mapId;
    GameState.data.spawn = data.spawn ?? 'default';
    this.enemies = [];
    this.interactables = [];
    this.transitioning = false;
    this.dialogOpen = false;
  }

  create() {
    const def = Maps[GameState.data.mapId];
    this.map = buildMap(this, def);
    this.solids = this.map.solids;
    this.physics.world.setBounds(0, 0, this.map.widthPx, this.map.heightPx);

    const sp = this.map.spawnPoint(GameState.data.spawn);
    this.player = new Player(this, sp.x, sp.y);
    this.physics.add.collider(this.player, this.solids);

    for (const e of def.enemies ?? []) {
      const ed = Enemies[e.type];
      if (!ed) { console.warn(`[map] unknown enemy "${e.type}"`); continue; }
      const enemy = new Enemy(this, (e.x + 0.5) * 32, (e.y + 1) * 32, ed);
      this.enemies.push(enemy);
    }
    this.physics.add.collider(this.enemies, this.solids);
    this.physics.add.collider(this.enemies, this.enemies);
    this.physics.add.overlap(this.player, this.enemies, (_p, e) => {
      const enemy = e as Enemy;
      if (!enemy.dead) this.player.takeDamage(enemy.def.contactDamage, enemy.x, enemy.y);
    });

    for (const n of def.npcs ?? []) {
      this.interactables.push(new Npc(this, n, (npc) => this.openDialog(npc.def.name, npc.def.dialog)));
    }
    this.setupPickups();

    for (const { zone, exit } of this.map.exits) {
      this.physics.add.overlap(this.player, zone, () => this.goTo(exit.to, exit.spawn));
    }

    // 镜头：平滑跟随，略微前视；边界 = 地图
    const cam = this.cameras.main;
    cam.setBounds(0, 0, Math.max(this.map.widthPx, GAME_WIDTH), Math.max(this.map.heightPx, GAME_HEIGHT));
    cam.startFollow(this.player, true, 0.12, 0.12);
    cam.setRoundPixels(true);
    cam.fadeIn(250);

    this.hint = this.add.image(0, 0, 'interact_hint').setVisible(false);

    const onDialogClosed = () => { this.dialogOpen = false; this.player.inputLocked = false; };
    EventBus.on(GameEvents.DIALOG_CLOSED, onDialogClosed);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => EventBus.off(GameEvents.DIALOG_CLOSED, onDialogClosed));
    this.events.once('player-died', () => this.onPlayerDied());

    EventBus.emit(GameEvents.MAP_ENTERED, { mapId: def.id, name: def.name });
    EventBus.emit(GameEvents.SKILL_SLOTS, GameState.data.slots);
    GameState.save();
  }

  hostilesOf(team: Team): Combatant[] {
    return team === 'player' ? this.enemies.filter((e) => !e.dead && e.active) : this.player.dead ? [] : [this.player];
  }

  update(time: number, delta: number) {
    this.player.update(time, delta);
    this.enemies = this.enemies.filter((e) => e.active);
    for (const e of this.enemies) e.update({ player: this.player, time, delta });
    this.updateInteraction();
  }

  private updateInteraction() {
    if (this.dialogOpen) { this.hint.setVisible(false); return; }
    const near = this.interactables.find((i) => Phaser.Math.Distance.Between(i.x, i.y, this.player.x, this.player.y) < i.radius);
    this.hint.setVisible(!!near);
    if (!near) return;
    this.hint.setPosition(near.x, near.y - 56).setDepth(1e6);
    if (this.player.justPressedInteract()) near.interact();
  }

  private setupPickups() {
    const def = this.map.def;
    for (const p of def.pickups ?? []) {
      const flag = `pickup:${def.id}:${p.id}`;
      if (GameState.getFlag(flag, false)) continue;
      const obj = new Pickup(this, p);
      this.physics.add.existing(obj, true);
      this.physics.add.overlap(this.player, obj, () => {
        if (!obj.active) return;
        GameState.setFlag(flag, true);
        if (p.skill && GameState.learn(p.skill)) {
          EventBus.emit(GameEvents.TOAST, `习得技能「${Skills[p.skill]?.name ?? p.skill}」！`);
        }
        if (p.heal) this.player.heal(p.heal);
        obj.destroy();
        GameState.save();
      });
    }
  }

  openDialog(speaker: string | undefined, lines: string[]) {
    this.dialogOpen = true;
    this.player.inputLocked = true;
    EventBus.emit(GameEvents.DIALOG_OPEN, { speaker, lines });
  }

  goTo(mapId: string, spawn: string) {
    if (this.transitioning) return;
    if (!Maps[mapId]) {
      EventBus.emit(GameEvents.TOAST, '前方的道路尚未开放……');
      // 把玩家往回推一点，避免反复触发
      this.player.setVelocity(-this.player.facing.x * 300, -this.player.facing.y * 300);
      this.player.stunUntil = this.time.now + 150;
      return;
    }
    this.transitioning = true;
    this.player.inputLocked = true;
    this.cameras.main.fadeOut(220, 20, 30, 40);
    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
      this.scene.restart({ mapId, spawn });
    });
  }

  private onPlayerDied() {
    EventBus.emit(GameEvents.TOAST, '倒下了……在村子里醒来。');
    this.time.delayedCall(900, () => {
      const p = GameState.data.player;
      p.hp = p.maxHp; p.mp = p.maxMp;
      this.goTo(START_MAP, 'default');
    });
  }
}
