#!/usr/bin/env node
// ElevenLabs voiceover for the demo video: one take with character timestamps, played unbroken with a lead-in
// and tail; sentence and keyword times come from the timestamps. Reuses vo_full.mp3 / vo_align.json unless --regen.
//
// node voiceover.mjs --dir <work> [--script vo.txt] [--voice EXAVITQu4vr4xnSDxMaL] [--env <file with ELEVENLABS_API_KEY>]
//                    [--words layout,spacing,styles,tone] [--lead 0.8] [--tail 1.6] [--speed 0.94] [--regen]
//                    [--split --gap 0.5]   (opt-in: cut at sentence pauses and insert gaps; can audibly clip words)
// --gap (split mode only) takes one value or a comma list (one per sentence break).
// Writes vo_full.mp3, vo_align.json, vo_timed.wav and timing.json / timing.js { dur, sentences: [{text, vs, ve}], words: {word: t} }.
// The key is read from ELEVENLABS_API_KEY or the --env file and never printed.
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const a = {}; const argv = process.argv.slice(2);
for (let i = 0; i < argv.length; i++) if (argv[i].startsWith('--')) { const k = argv[i].slice(2); a[k] = argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[++i] : true; }
process.chdir(path.resolve(a.dir || '.'));
const text = fs.readFileSync(a.script || 'vo.txt', 'utf8').trim().replace(/\s+/g, ' ');
const voice = a.voice || 'EXAVITQu4vr4xnSDxMaL'; // "Sarah": calm, reassuring
const speed = +(a.speed || 0.94);

function apiKey() {
  if (process.env.ELEVENLABS_API_KEY) return process.env.ELEVENLABS_API_KEY.trim();
  if (a.env) { const m = fs.readFileSync(a.env, 'utf8').match(/^ELEVENLABS_API_KEY\s*=\s*["']?([^"'\n]+)/m); if (m) return m[1].trim(); }
  throw new Error('No ELEVENLABS_API_KEY in the environment or --env file');
}

if (a.regen || !fs.existsSync('vo_full.mp3') || !fs.existsSync('vo_align.json')) {
  const KEY = apiKey();
  const sub = await (await fetch('https://api.elevenlabs.io/v1/user/subscription', { headers: { 'xi-api-key': KEY } })).json();
  const left = (sub.character_limit ?? 0) - (sub.character_count ?? 0);
  console.log(`ElevenLabs plan: ${sub.tier}, ${left} characters left, script needs ${text.length}`);
  if (sub.tier === 'free') console.log('Note: the free plan has no commercial licence and asks for attribution. Tell the user.');
  if (left < text.length) { console.log('Not enough characters left. Stop and tell the user.'); process.exit(1); }
  const r = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voice}/with-timestamps?output_format=mp3_44100_128`, {
    method: 'POST', headers: { 'xi-api-key': KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, model_id: 'eleven_multilingual_v2', voice_settings: { stability: 0.55, similarity_boost: 0.75, style: 0.1, use_speaker_boost: true, speed } }),
  });
  const j = await r.json();
  if (!j.audio_base64) { console.log('ElevenLabs error', r.status, JSON.stringify(j).slice(0, 300)); process.exit(1); }
  fs.writeFileSync('vo_full.mp3', Buffer.from(j.audio_base64, 'base64'));
  fs.writeFileSync('vo_align.json', JSON.stringify(j.alignment));
  console.log('Generated vo_full.mp3 with voice', voice);
} else console.log('Reusing vo_full.mp3 (pass --regen for a new take)');

const A = JSON.parse(fs.readFileSync('vo_align.json', 'utf8'));
const ch = A.characters, st = A.character_start_times_seconds, en = A.character_end_times_seconds;
const full = ch.join('');
const sents = []; let s0 = 0;
for (let i = 0; i < ch.length; i++) if (/[.?!]/.test(ch[i]) && (i === ch.length - 1 || ch[i + 1] === ' ')) { sents.push([s0, i]); s0 = i + 2; }
if (s0 < ch.length) sents.push([s0, ch.length - 1]);
const total = parseFloat(execSync('ffprobe -v error -show_entries format=duration -of csv=p=0 vo_full.mp3').toString());
const S = sents.map(([x, y]) => ({ text: full.slice(x, y + 1), start: st[x], end: en[y], i0: x, i1: y }));
const lead = +(a.lead ?? 0.8), tail = +(a.tail ?? 1.6);

// Default: the take plays unbroken, only shifted by the lead-in and padded with the tail. Cutting the take at
// sentence pauses and inserting gaps made the voice audibly break at every scene transition (Ivo, Nov 2026), so
// the visuals follow the voice's own pauses instead. --split keeps the old cut-and-gap behaviour.
if (!a.split) {
  const out = S.map(s => ({ text: s.text, vs: +(lead + s.start).toFixed(3), ve: +(lead + s.end).toFixed(3) }));
  const dur = +(lead + total + tail).toFixed(2);
  const words = {}; let cursor = 0;
  for (const w of String(a.words || '').split(',').map(x => x.trim()).filter(Boolean)) {
    const re = new RegExp(`\\b${w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'ig'); re.lastIndex = cursor; // words are found in order, after the previous one
    const m = re.exec(full); if (m) cursor = m.index + w.length;
    if (!m) { console.log('word not found:', w); continue; }
    words[w] = +(lead + st[m.index]).toFixed(3);
  }
  execSync(`ffmpeg -v error -y -i vo_full.mp3 -af "adelay=${Math.round(lead * 1000)}:all=1,apad,atrim=0:${dur}" -ar 48000 -ac 2 vo_timed.wav`);
  fs.writeFileSync('timing.json', JSON.stringify({ dur, sentences: out, words }, null, 1));
  fs.writeFileSync('timing.js', 'window.T = ' + JSON.stringify({ dur, sentences: out, words }) + ';');
  console.log(`duration ${dur}s (continuous take)`);
  if (dur > 40) console.log('Over 40s: shorten the script and regenerate rather than cutting or speeding the take.');
  if (dur < 38) console.log('Under 38s: a longer tail or a slightly slower --speed with --regen fills it.');
  out.forEach((s, i) => console.log(`${i + 1}. ${s.vs.toFixed(2)} → ${s.ve.toFixed(2)}  ${s.text}`));
  if (Object.keys(words).length) console.log('words', JSON.stringify(words));
  process.exit(0);
}
console.log('Split mode: the take is cut at sentence pauses. Listen at every cut for clipped words or breaths.');
const cuts = [0, ...S.slice(0, -1).map((s, i) => (s.end + S[i + 1].start) / 2), total];
const gaps = String(a.gap ?? 0.5).split(',').map(Number);
let t = lead; const parts = [], out = [];
S.forEach((s, i) => {
  const place = t; parts.push({ a: cuts[i], b: cuts[i + 1], place });
  out.push({ text: s.text, vs: +(place + s.start - cuts[i]).toFixed(3), ve: +(place + s.end - cuts[i]).toFixed(3) });
  t = place + (cuts[i + 1] - cuts[i]) + (gaps[Math.min(i, gaps.length - 1)] || 0);
});
const last = parts.at(-1);
const dur = +(last.place + last.b - last.a + tail).toFixed(2);
const words = {}; let cursor = 0;
for (const w of String(a.words || '').split(',').map(x => x.trim()).filter(Boolean)) {
  const m = new RegExp(`\\b${w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i').exec(full);
  if (!m) { console.log('word not found:', w); continue; }
  const k = S.findIndex(s => m.index >= s.i0 && m.index <= s.i1);
  words[w] = +(parts[k].place + st[m.index] - parts[k].a).toFixed(3);
}
const fc = parts.map((p, i) => `[${i}:a]atrim=${p.a.toFixed(3)}:${p.b.toFixed(3)},asetpts=PTS-STARTPTS,afade=t=in:d=0.02,afade=t=out:st=${Math.max(0, p.b - p.a - 0.03).toFixed(3)}:d=0.03,adelay=${Math.round(p.place * 1000)}|${Math.round(p.place * 1000)}[s${i}]`).join(';')
  + ';' + parts.map((_, i) => `[s${i}]`).join('') + `amix=inputs=${parts.length}:normalize=0,apad,atrim=0:${dur}[out]`;
execSync(`ffmpeg -v error -y ${parts.map(() => '-i vo_full.mp3').join(' ')} -filter_complex "${fc}" -map "[out]" -ar 48000 -ac 2 vo_timed.wav`);
fs.writeFileSync('timing.json', JSON.stringify({ dur, sentences: out, words }, null, 1));
fs.writeFileSync('timing.js', 'window.T = ' + JSON.stringify({ dur, sentences: out, words }) + ';');
console.log(`duration ${dur}s`);
out.forEach((s, i) => console.log(`${i + 1}. ${s.vs.toFixed(2)} → ${s.ve.toFixed(2)}  ${s.text}`));
if (Object.keys(words).length) console.log('words', JSON.stringify(words));
