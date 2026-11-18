/**
 * 生成简易 CC0 自制 WAV（短循环 BGM + 音效）。运行：node tools/gen-audio.mjs
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const SR = 22050;

function wav(samples) {
  const data = Buffer.alloc(44 + samples.length * 2);
  data.write('RIFF', 0);
  data.writeUInt32LE(36 + samples.length * 2, 4);
  data.write('WAVE', 8);
  data.write('fmt ', 12);
  data.writeUInt32LE(16, 16);
  data.writeUInt16LE(1, 20);
  data.writeUInt16LE(1, 22);
  data.writeUInt32LE(SR, 24);
  data.writeUInt32LE(SR * 2, 28);
  data.writeUInt16LE(2, 32);
  data.writeUInt16LE(16, 34);
  data.write('data', 36);
  data.writeUInt32LE(samples.length * 2, 40);
  for (let i = 0; i < samples.length; i++) {
    const v = Math.max(-1, Math.min(1, samples[i]));
    data.writeInt16LE((v * 32767) | 0, 44 + i * 2);
  }
  return data;
}

function tone(freq, dur, vol = 0.2, type = 'sine') {
  const n = Math.floor(SR * dur);
  const out = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    const env = Math.min(1, i / (SR * 0.01)) * Math.min(1, (n - i) / (SR * 0.05));
    let s = Math.sin(2 * Math.PI * freq * t);
    if (type === 'square') s = s > 0 ? 1 : -1;
    if (type === 'noise') s = Math.random() * 2 - 1;
    out[i] = s * vol * env;
  }
  return out;
}

function concat(parts) {
  let len = 0;
  for (const p of parts) len += p.length;
  const out = new Float32Array(len);
  let o = 0;
  for (const p of parts) { out.set(p, o); o += p.length; }
  return out;
}

function melody(notes, beat = 0.22, vol = 0.12) {
  const parts = [];
  for (const [f, d] of notes) parts.push(tone(f, beat * d, vol, 'sine'));
  return concat(parts);
}

const bgmDir = join(root, 'public/assets/audio/bgm');
const sfxDir = join(root, 'public/assets/audio/sfx');
mkdirSync(bgmDir, { recursive: true });
mkdirSync(sfxDir, { recursive: true });

// 短循环旋律（自制）
writeFileSync(join(bgmDir, 'village.wav'), wav(melody([[392, 1], [440, 1], [494, 1], [440, 1], [392, 1], [349, 1], [330, 2], [349, 2]], 0.25, 0.1)));
writeFileSync(join(bgmDir, 'forest.wav'), wav(melody([[262, 2], [294, 1], [330, 1], [349, 2], [330, 1], [294, 1], [262, 2], [220, 2]], 0.28, 0.1)));
writeFileSync(join(bgmDir, 'lake.wav'), wav(melody([[523, 2], [494, 1], [440, 1], [392, 2], [440, 2], [494, 2]], 0.3, 0.09)));
writeFileSync(join(bgmDir, 'beach.wav'), wav(melody([[349, 1], [392, 1], [440, 2], [392, 1], [349, 1], [330, 2], [294, 2]], 0.26, 0.1)));

writeFileSync(join(sfxDir, 'slash.wav'), wav(concat([tone(880, 0.04, 0.25, 'square'), tone(660, 0.06, 0.18, 'square')])));
writeFileSync(join(sfxDir, 'cast.wav'), wav(tone(520, 0.08, 0.2, 'sine')));
writeFileSync(join(sfxDir, 'pickup.wav'), wav(concat([tone(660, 0.06, 0.2), tone(880, 0.08, 0.2), tone(1175, 0.1, 0.18)])));
writeFileSync(join(sfxDir, 'levelup.wav'), wav(concat([tone(523, 0.1, 0.2), tone(659, 0.1, 0.2), tone(784, 0.16, 0.22)])));
writeFileSync(join(sfxDir, 'ui.wav'), wav(tone(740, 0.04, 0.15, 'square')));
writeFileSync(join(sfxDir, 'kill.wav'), wav(concat([tone(300, 0.05, 0.2, 'noise'), tone(180, 0.1, 0.15, 'sine')])));

console.log('audio written');
