// Derived from anidoodle (Copyright 2026 Alex Greenshpun), modified for this project.
// Licensed under the Apache License 2.0: see LICENSES/Apache-2.0.txt and NOTICE.
import { Gfx, type Ctx, type Env, type P } from "./core";
import { Film } from "./film";
import * as W from "./gokWorld";
import { kit, plate, look, showP, clampCam, camLerp, seg, HOME, standAt, walkPose, type Line } from "./kdKit";

// __AD__ · story film, full-bleed 9:16. Drawing technique: __TARZ__
// (its marks: ~/.claude/skills/anidoodle/engine/src/canvas-core/__TARZ__.ts and the anidoodle
// style notes; the approved ink-wash preset is references/tarz-murekkep-lavis.md in animasyon-studyosu).
// Starter made by yeni_proje.sh: two placeholder shots to replace with the chosen style's own marks. Keep the LINES / SHOTS / DURATION
// literals in this exact shape: the Python tools read and rewrite them (seslendirme_oturt.py, sesmiks.py).

const FPS = 30, DURATION = 180, PZ = 1.6;
const s2f = (s: number) => Math.round(s * FPS);
// painted styles open with an ink drop, close under paper and wear the watercolour logo; the others fade and wear the logo as supplied
const PAINTED = ["wren", "ranunculus", "storybook", "storybookDraw", "folkTale", "sumiE", "charcoalErasure", "colouredPencil", "pocketWatch"].includes("__TARZ__");
const K = kit(PAINTED ? { fps: FPS, duration: DURATION } : { fps: FPS, duration: DURATION, opening: "fade", closing: "fade", logo: { style: "plain" }, caption: "clean" });

// ---------------------------------------------------------------- the narration (seconds), retimed to the recording later
const LINES: Line[] = [
  [0.0, 2.6, "BURASI BİR ÖRNEK CÜMLE."],
  [2.7, 4.9, "İKİNCİ CÜMLE BURAYA GELİR."],
];

// ---------------------------------------------------------------- plates (drawn once; the camera moves over them)
const box = (x0: number, y0: number, x1: number, y1: number): P[] => [[x0, y0], [x1, y0], [x1, y1], [x0, y1]];
// a fill in the film's hand: a wet wash for painted styles, a flat fill for the rest (replace with the style's own marks)
const area = (g: Gfx, pts: P[], color: string, seed: number) => PAINTED ? W.wet(g, pts, color, { alpha: 0.9, seed, pool: 0.4 }) : g.group("plain", () => { const c = g.cur; c.fillStyle = color; c.beginPath(); pts.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y))); c.closePath(); c.fill(); });
const P_ = {
  steppe: (e: Env) => plate(e, "steppe", true, (g) => {
    area(g, box(-20, -20, 1100, 1100), "#e9dcc0", 10);
    area(g, [[-20, 1000], [300, 960], [700, 990], [1100, 950], [1100, 1940], [-20, 1940]], "#c9a96a", 11);
    W.ink(g, () => W.pen(g, [[-20, 1000], [300, 960], [700, 990], [1100, 950]], 2, 12, 0.9, 0.6));
  }, PZ),
  card: (e: Env) => plate(e, "card", true, (g) => {
    area(g, box(-20, -20, 1100, 1940), "#efe6d2", 20);
    area(g, box(240, 560, 840, 1240), "#fbfaf6", 21);
    W.ink(g, () => W.pen(g, [...box(240, 560, 840, 1240), [240, 560]], 1.6, 22, 0.8, 0.4));
  }, 1.1),
};

// ---------------------------------------------------------------- the shots: one picture per spoken phrase
type Shot = { a: number; b: number; k: string };
const SHOTS: Shot[] = [
  { a: 0.0, b: 2.65, k: "steppe" },
  { a: 2.65, b: 6.0, k: "card" },
];
const shotAt = (f: number) => { const t = f / FPS; return SHOTS.find((s) => t >= s.a && t < s.b) ?? SHOTS[SHOTS.length - 1]; };

const draw = (ctx: Ctx, f: number, env: Env) => {
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.fillStyle = W.PAPER; ctx.fillRect(0, 0, env.W * env.scale, env.H * env.scale);
  const sh = shotAt(f), t = Math.min(1, Math.max(0, (f - s2f(sh.a)) / (s2f(sh.b) - s2f(sh.a)))), g = new Gfx(ctx, env, f, W.INK_M), at = (s: number) => s2f(sh.a + s);
  switch (sh.k) {
    case "steppe": showP(ctx, env, P_.steppe(env), clampCam(camLerp(HOME, { x: 540, y: 1000, z: 1.15 }, t)), PZ);
      standAt(g, 300 + 200 * t, 1300, 520, walkPose("side", (f / FPS) * 6.283), "side", W.LOOKS[3], 400, { face: 1 }); break;   // a live figure, drawn every frame on top of the plate
    case "card": look(ctx, env, P_.card(env), t, 0.05); W.note(ctx, env, "2026", 540, 900, 80, Math.floor(4 * seg(f, at(0.1), at(0.6)))); break;
  }
  K.opening(ctx, env, f); K.closing(ctx, env, f);
  if (PAINTED) { g.paper("coldpress", 0.14); g.paper("paper", 0.07); }   // paper grain only under painted styles
  K.narration(ctx, env, f, LINES);
  K.watermark(ctx, env, f);
};

export const __AD__: Film = {
  meta: { title: "__AD__", W: 1080, H: 1920, fps: FPS, bpm: 60, durationFrames: DURATION, kind: "story" },
  assets: K.ASSETS,
  shots: [{ id: "film", start: 0, end: DURATION, draw }],
};
