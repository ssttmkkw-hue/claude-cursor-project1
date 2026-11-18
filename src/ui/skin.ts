import type Phaser from 'phaser';
import { UI_FONT } from '@/config';

/** UI 统一皮肤：深青半透明底 + 浅青描边（ART-08）。 */
export const Skin = {
  panel: 0x1e3038,
  panelAlpha: 0.9,
  panelInner: 0x24343c,
  accent: 0xbff6ff,
  accentSoft: 0x9ff0d8,
  select: 0x9ff0d8,
  danger: 0xff8fa3,
  mana: 0x8fc8ff,
  exp: 0xfff0a8,
  text: '#ffffff',
  textMuted: '#a8b8c2',
  textAccent: '#9ff0d8',
  textWarn: '#fff6c8',
  stroke: '#1a2830',
} as const;

export const uiText = (
  size: number,
  color: string = Skin.text,
  strokeThickness = 3,
): Phaser.Types.GameObjects.Text.TextStyle => ({
  fontFamily: UI_FONT,
  fontSize: `${size}px`,
  color,
  stroke: Skin.stroke,
  strokeThickness,
});
