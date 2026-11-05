import { Gfx, fractal, rng, type Ctx, type Env, type Layer, type P } from "./core";
import { blob } from "./gallery";
import * as W from "./gokWorld";

// STUDIO KIT · the reusable parts of a finished film:
// timing helpers, plates + camera, the inked narration band, the watercolour logo watermark, the
// ink-drop opening and the logo close. A film imports this and keeps only its own world and shots.
//
//   const K = kit({ fps: 30, duration: DURATION });
//   draw(): ...shots...; K.opening(ctx, env, f); K.closing(ctx, env, f); g.paper(...);
//           K.narration(ctx, env, f, LINES); K.watermark(ctx, env, f);
//   assets: K.ASSETS   (logo_renkli.png / logo_beyaz.png in the project's assets/)

// ---------------------------------------------------------------- timing
export const clamp01 = (v: number) => (v <= 0 ? 0 : v >= 1 ? 1 : v);
export const ease = (t: number) => { const x = clamp01(t); return x * x * (3 - 2 * x); };
export const seg = (f: number, a: number, b: number) => clamp01((f - a) / (b - a));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const eo = (x: number) => 1 - (1 - x) * (1 - x);

// ---------------------------------------------------------------- plates and the camera
// A plate is a layer drawn ONCE at pz times the frame's resolution, so the camera can push in up to pz
// without softening. Faded copies are computed from pixels (ctx.filter is not allowed).
export type Cam = { x: number; y: number; z: number };
export const HOME: Cam = { x: 540, y: 960, z: 1 };
export const plate = (env: Env, key: string, opaque: boolean, draw: (g: Gfx) => void, pz = 1.6): Layer => {
  const k = `kd:${key}:${env.scale}`; let L = env.cache.get(k) as Layer | undefined; if (L) return L;
  const pe: Env = { ...env, scale: env.scale * pz };
  L = env.canvas(Math.round(env.W * pe.scale), Math.round(env.H * pe.scale));
  if (opaque) { L.ctx.setTransform(1, 0, 0, 1, 0, 0); L.ctx.fillStyle = W.PAPER; L.ctx.fillRect(0, 0, L.canvas.width, L.canvas.height); }
  draw(new Gfx(L.ctx, pe, 0, W.INK_M)); L.ctx.setTransform(1, 0, 0, 1, 0, 0); L.ctx.globalAlpha = 1; L.ctx.globalCompositeOperation = "source-over";
  env.cache.set(k, L); return L;
};
// most of the colour drained toward a warm grey (for "it is over" beats), a little contrast lost
export const faded = (env: Env, key: string, src: () => Layer): Layer => {
  const k = `kd:${key}:faded:${env.scale}`; let L = env.cache.get(k) as Layer | undefined; if (L) return L;
  const S = src(), w = S.canvas.width, h = S.canvas.height; L = env.canvas(w, h);
  L.ctx.setTransform(1, 0, 0, 1, 0, 0); L.ctx.drawImage(S.canvas as CanvasImageSource, 0, 0);
  const id = L.ctx.getImageData(0, 0, w, h), d = id.data;
  for (let i = 0; i < d.length; i += 4) { const y = 0.3 * d[i] + 0.59 * d[i + 1] + 0.11 * d[i + 2], g = y * 0.9 + 22; d[i] = Math.min(255, g * 1.02 * 0.88 + d[i] * 0.12); d[i + 1] = Math.min(255, g * 0.99 * 0.88 + d[i + 1] * 0.12); d[i + 2] = Math.min(255, g * 0.93 * 0.88 + d[i + 2] * 0.12); }
  L.ctx.putImageData(id, 0, 0); env.cache.set(k, L); return L;
};
// keep the camera inside the drawn world (a camera looking past the plate's edge shows bare canvas)
export const clampCam = (c: Cam): Cam => ({ x: Math.min(1080 - 540 / c.z, Math.max(540 / c.z, c.x)), y: Math.min(1920 - 960 / c.z, Math.max(960 / c.z, c.y)), z: c.z });
export const camLerp = (a: Cam, b: Cam, t: number): Cam => { const e = ease(t); return { x: lerp(a.x, b.x, e), y: lerp(a.y, b.y, e), z: lerp(a.z, b.z, e) }; };
export const camXf = (ctx: Ctx, env: Env, c: Cam) => ctx.setTransform(env.scale * c.z, 0, 0, env.scale * c.z, (540 - c.x * c.z) * env.scale, (960 - c.y * c.z) * env.scale);
// a plate through the camera, optionally clipped to regions given in world coordinates
export const showP = (ctx: Ctx, env: Env, L: Layer, c: Cam, pz: number, alpha = 1, clip?: P[][]) => {
  if (alpha <= 0.002) return; ctx.save();
  if (clip) { camXf(ctx, env, c); ctx.beginPath(); clip.forEach((pts) => { pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.closePath(); }); ctx.clip(); }
  const k = c.z / pz; ctx.setTransform(k, 0, 0, k, (540 - c.x * c.z) * env.scale, (960 - c.y * c.z) * env.scale);
  ctx.globalAlpha = alpha; ctx.drawImage(L.canvas as CanvasImageSource, 0, 0); ctx.restore();
};
// a close look: its plate with a slow push in over the shot (t = 0..1)
export const look = (ctx: Ctx, env: Env, L: Layer, t: number, dz = 0.06, pz = 1.1) => showP(ctx, env, L, { x: 540, y: 960, z: 1 + dz * ease(t) }, pz);

// ---------------------------------------------------------------- the narration band
// LINES: [startSec, endSec, "UPPER-CASE TEXT"], one per spoken phrase. Keep this exact literal format:
// the Python tools (seslendirme_oturt.py, sesmiks.py) read and rewrite it with a regex.
// The line is inked in letter by letter on the lower band (y 1495), never in the middle of the picture.
export type Line = [number, number, string];

// ---------------------------------------------------------------- the logo
// The supplied logo, outline never moved, rendered as a watercolour + pencil attempt at the real thing:
// the white letters left as bare paper, a dark wash behind them that thins softly into the paper (no
// disc, no frame), the reds in watercolour, a pencil line round the shapes. "pencil" is the alternative:
// the colour logo as a faded graphite study.
let LOGO_SRC = { x: 151, y: 284, w: 777, h: 511 };   // the content box inside the logo files (set yours: kit({ logo: { box } }))
type Style = "wash" | "pencil" | "plain";   // plain: the logo exactly as supplied (flat 2D, 3D, any non-painted style)
const drawnMark = (env: Env, style: Style, lw: number, base: number): Layer | null => {
  const key = `kd:mark:${style}:${lw}:${env.scale}`; let M = env.cache.get(key) as Layer | undefined; if (M) return M;
  const img = env.image?.(style === "wash" ? "logoW" : "logoC"); if (!img) return null;
  if (style === "plain") { const w = Math.round(lw * env.scale), h = Math.round(lw * LOGO_SRC.h / LOGO_SRC.w * env.scale), L = env.canvas(w, h); L.ctx.setTransform(1, 0, 0, 1, 0, 0); L.ctx.drawImage(img, LOGO_SRC.x, LOGO_SRC.y, LOGO_SRC.w, LOGO_SRC.h, 0, 0, w, h); env.cache.set(key, L); return L; }
  const S = env.scale * lw / base, w = Math.round(base * S), h = Math.round((base * LOGO_SRC.h / LOGO_SRC.w) * S), pad = Math.round(34 * S), W2 = w + 2 * pad, H2 = h + 2 * pad;
  const src = env.canvas(w, h); src.ctx.setTransform(1, 0, 0, 1, 0, 0); src.ctx.drawImage(img, LOGO_SRC.x, LOGO_SRC.y, LOGO_SRC.w, LOGO_SRC.h, 0, 0, w, h);
  const sd = src.ctx.getImageData(0, 0, w, h).data, A = new Float32Array(W2 * H2), T = new Float32Array(W2 * H2), RED = new Float32Array(W2 * H2);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const i = (y * w + x) * 4, j = (y + pad) * W2 + x + pad, rr = sd[i], gg = sd[i + 1], bb = sd[i + 2]; A[j] = sd[i + 3] / 255; T[j] = 1 - (0.3 * rr + 0.59 * gg + 0.11 * bb) / 255; RED[j] = rr > 150 && gg < 90 && bb < 90 ? 1 : 0; }
  const edge = new Float32Array(W2 * H2), er = Math.max(1, Math.round(1.2 * S));
  for (let y = er; y < H2 - er; y++) for (let x = er; x < W2 - er; x++) { const j = y * W2 + x; let mn = 1, dt = 0; for (let q = -er; q <= er; q++) { mn = Math.min(mn, A[j + q], A[j + q * W2]); dt = Math.max(dt, Math.abs(T[j] - T[j + q]) * A[j + q], Math.abs(T[j] - T[j + q * W2]) * A[j + q * W2]); } edge[j] = Math.max(A[j] - mn, A[j] > 0.5 ? Math.min(1, dt * 1.6) : 0); }
  const out = env.canvas(W2, H2), od = out.ctx.createImageData(W2, H2), o = od.data; rng(style === "pencil" ? 501 : 502);
  const put = (j: number, rgb: number[], a: number) => { const sa = o[j * 4 + 3] / 255, na = a + sa * (1 - a); if (na <= 0) return; for (let c = 0; c < 3; c++) o[j * 4 + c] = (rgb[c] * a + o[j * 4 + c] * sa * (1 - a)) / na; o[j * 4 + 3] = Math.round(255 * na); };
  const P = 3.4 * S, tooth = (x: number, y: number) => 0.55 + 0.45 * fractal(611, x * 1.7 / S, y * 1.7 / S, 0.6, 0.6, 2);
  const hatch = (x: number, y: number, ang: number) => { const v = (-x * Math.sin(ang) + y * Math.cos(ang)) / S, u = (x * Math.cos(ang) + y * Math.sin(ang)) / P + 0.35 * (fractal(614, v * 0.05, ang * 9, 0.6, 0.6, 2) - 0.5), k = Math.floor(u), lift = fractal(615 + k, v * 0.04, k * 3.1, 0.7, 0.7, 2) > 0.3 ? 1 : 0; return lift * (0.75 + 0.25 * fractal(616, v * 0.08, k, 0.6, 0.6, 1)) * (1 - Math.abs((u - k) - 0.5) * 2); };
  if (style === "wash") {
    const D = Float32Array.from(A), br = Math.round(15 * S), tmp = new Float32Array(W2 * H2);
    for (let pass = 0; pass < 3; pass++) {
      for (let y = 0; y < H2; y++) { let acc = 0; for (let x = -br; x < W2 + br; x++) { if (x + br < W2) acc += D[y * W2 + x + br]; if (x - br - 1 >= 0) acc -= D[y * W2 + x - br - 1]; if (x >= 0 && x < W2) tmp[y * W2 + x] = acc / (2 * br + 1); } }
      for (let x = 0; x < W2; x++) { let acc = 0; for (let y = -br; y < H2 + br; y++) { if (y + br < H2) acc += tmp[(y + br) * W2 + x]; if (y - br - 1 >= 0) acc -= tmp[(y - br - 1) * W2 + x]; if (y >= 0 && y < H2) D[y * W2 + x] = acc / (2 * br + 1); } }
    }
    for (let y = 0; y < H2; y++) for (let x = 0; x < W2; x++) { const j = y * W2 + x, ny = (y - H2 / 2) / (H2 / 2);
      if (A[j] > 0.4 && T[j] < 0.25) { put(j, [246, 241, 228], 1); continue; }                                   // the white, reserved as bare paper
      const dens = 0.78 + 0.22 * fractal(613, x / S, y / S, 0.02, 0.02, 3), pool = 1 + 0.2 * Math.max(0, ny);
      if (A[j] > 0.4 && RED[j]) { put(j, [196, 44, 38], Math.min(1, 0.9 * dens * pool)); continue; }            // the reds in watercolour
      const nx = (x - W2 / 2) / (W2 / 2 - 6 * S), nyy = (y - H2 / 2) / (H2 / 2 - 6 * S), wob = 0.3 * (fractal(612, x / S, y / S, 0.02, 0.02, 4) - 0.5), sh = Math.abs(nx) ** 2.2 + Math.abs(nyy) ** 2.2;
      const e = Math.min(1, Math.max(0, (0.98 + wob - sh) / 0.55)), n = Math.max(e * e * (3 - 2 * e) * 0.92, Math.min(1, D[j] * 1.6) + 0.12 * (fractal(618, x / S, y / S, 0.03, 0.03, 3) - 0.5)), k = Math.min(1, Math.max(0, n)), fade = k * k * (3 - 2 * k);
      if (fade > 0.01) put(j, [52, 48, 58], Math.min(1, 0.84 * dens * pool * fade)); }
  }
  for (let y = 0; y < H2; y++) for (let x = 0; x < W2; x++) {
    const j = y * W2 + x; if (A[j] <= 0.02 && edge[j] <= 0) continue; const tt = tooth(x, y);
    if (style === "pencil") {
      const t = T[j] * A[j]; let c = 0;
      if (t > 0.18 && hatch(x, y, 0.78) > 1 - Math.min(0.85, t * 0.95)) c = 0.6;
      if (t > 0.7 && hatch(x, y, -0.78) > 0.55) c = Math.max(c, 0.55);
      c = Math.max(c, t * 0.14, edge[j] * 0.85);
      if (c > 0) put(j, [74, 72, 70], Math.min(1, c * tt * 0.85));
    } else if (edge[j] > 0.2) put(j, [58, 56, 54], Math.min(1, edge[j] * 0.75 * tt));
  }
  out.ctx.putImageData(od, 0, 0);
  env.cache.set(key, out); return out;
};

// ---------------------------------------------------------------- opening and close, in watercolour blooms
type Bloom = { x: number; y: number; r: number; seed: number; tide: number };
const bloomPath = (c: Ctx, b: Bloom, k: number) => { c.beginPath(); for (let i = 0; i <= 140; i++) { const a = (i / 140) * 6.283, w = 1 + 0.2 * (fractal(b.seed, Math.cos(a) * 2.2 + 5, Math.sin(a) * 2.2 + 5, 0.9, 0.9, 3) - 0.5) + 0.04 * (fractal(b.seed + 50, Math.cos(a) * 9 + 5, Math.sin(a) * 9 + 5, 0.9, 0.9, 2) - 0.5); c.lineTo(b.x + Math.cos(a) * b.r * k * w, b.y + Math.sin(a) * b.r * k * w); } c.closePath(); };
// paper lifted off the picture (open) or laid back over it, with a feathered edge and a fading tide line
const veil = (ctx: Ctx, env: Env, blooms: Bloom[], open: boolean) => {
  const S = env.scale, key = `kd:veil:${S}`; let V = env.cache.get(key) as Layer | undefined; if (!V) { V = env.canvas(Math.round(1080 * S), Math.round(1920 * S)); env.cache.set(key, V); }
  const c = V.ctx; c.setTransform(1, 0, 0, 1, 0, 0); c.globalCompositeOperation = "source-over"; c.globalAlpha = 1; c.clearRect(0, 0, V.canvas.width, V.canvas.height); c.setTransform(S, 0, 0, S, 0, 0);
  c.fillStyle = W.PAPER; if (open) { c.fillRect(0, 0, 1080, 1920); c.globalCompositeOperation = "destination-out"; }
  blooms.forEach((b) => { if (b.r <= 0) return; [1, 0.975, 0.95, 0.925].forEach((k) => { c.globalAlpha = 0.3; bloomPath(c, b, k); c.fill(); }); c.globalAlpha = 1; bloomPath(c, b, 0.9); c.fill(); });
  c.globalCompositeOperation = "source-over"; c.strokeStyle = "#8a7458"; c.lineWidth = 2.5;
  blooms.forEach((b) => { if (b.r <= 0 || b.tide <= 0) return; c.globalAlpha = 0.16 * b.tide; bloomPath(c, b, 0.995); c.stroke(); });
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.drawImage(V.canvas as CanvasImageSource, 0, 0); ctx.restore();
};

// a clean caption for non-painted styles: the same band (centred on y 1495, at most 760 px wide), bold
// sans letters typed in, on a soft rounded plate so they read over any picture
const cleanCaption = (ctx: Ctx, env: Env, text: string, n: number, alpha: number, size = 38) => {
  if (alpha <= 0) return; ctx.save(); ctx.setTransform(env.scale, 0, 0, env.scale, 0, 0);
  ctx.font = `700 ${size}px "Segoe UI", Arial, sans-serif`; ctx.textBaseline = "middle"; ctx.textAlign = "center";
  const lines: string[] = []; let cur = ""; text.split(" ").forEach((w) => { const t = cur ? cur + " " + w : w; if (cur && ctx.measureText(t).width > 760) { lines.push(cur); cur = w; } else cur = t; }); if (cur) lines.push(cur);
  const lh = size * 1.3, w = Math.max(...lines.map((l) => ctx.measureText(l).width)), top = 1495 - (lines.length * lh) / 2;
  ctx.globalAlpha = 0.82 * alpha; ctx.fillStyle = "#fbf8f0"; ctx.beginPath(); (ctx as any).roundRect?.(540 - w / 2 - 28, top - 14, w + 56, lines.length * lh + 28, 22); ctx.fill();
  ctx.globalAlpha = alpha; ctx.fillStyle = W.INK; let left = n;
  lines.forEach((l, i) => { const shown = l.slice(0, Math.max(0, left)); left -= l.length + 1; if (!shown) return; const full = ctx.measureText(l).width; ctx.textAlign = "left"; ctx.fillText(shown, 540 - full / 2, top + lh * (i + 0.5)); });
  ctx.restore();
};

// ---------------------------------------------------------------- the kit, bound to one film's length
export type KitOpts = {
  fps: number; duration: number;          // frames
  logo?: { style?: Style; width?: number; y?: number; box?: { x: number; y: number; w: number; h: number } } | false;   // false: no logo; box: another brand's content box
  drop?: [number, number];                // where the opening's ink drop lands (world px), default upper middle
  closeFrames?: number;                   // length of the close (default 52 = 1.7 s; the logo lands ~18 frames before the end)
  // the style's own way in and out (pick with the chosen drawing technique, see references/tarzlar.md):
  opening?: "ink" | "fade" | "none";      // ink: a drop of ink opens the picture (painted styles); fade: from the background colour
  closing?: "paper" | "fade" | "none";    // paper: watercolour blooms of paper cover the picture; fade: dissolve to the background
  bg?: string;                            // background colour for fade / the close (default the paper colour)
  caption?: "ink" | "clean";              // ink: hand-lettered ink on a paper smudge (painted styles); clean: bold sans on a soft plate (flat 2D, 3D)
};
export const kit = (o: KitOpts) => {
  if (o.logo && o.logo.box) LOGO_SRC = o.logo.box;
  const { fps, duration } = o, LW = o.logo ? o.logo.width ?? 230 : 230, LY = o.logo ? o.logo.y ?? 1650 : 1650, STYLE: Style = o.logo ? o.logo.style ?? "wash" : "wash";
  const BIG = LW * 2, C0 = duration - (o.closeFrames ?? 52), MOVE: [number, number] = [C0 + 4, C0 + 34], [dx, dy] = o.drop ?? [540, 820];
  const narration = (ctx: Ctx, env: Env, f: number, lines: Line[]) => {
    const t = f / fps, L = lines.find(([a, b]) => t >= a && t < b + 0.15); if (!L) return;
    const [a, b, text] = L, write = Math.min(1.6, (b - a) * 0.45), n = Math.floor(text.length * clamp01((t - a) / write)), alpha = 1 - clamp01((t - b) / 0.15);
    if ((o.caption ?? "ink") === "ink") W.caption(ctx, env, text, 24, n, alpha); else cleanCaption(ctx, env, text, n, alpha);
  };
  // bottom centre all film long; spreads in like a drop of paint at the start; rises to the middle at twice the size for the close
  const watermark = (ctx: Ctx, env: Env, f: number) => {
    if (o.logo === false) return;
    const grow = ease(seg(f, 3, 24)); if (grow <= 0) return;
    const p = ease(seg(f, MOVE[0], MOVE[1])), lw = lerp(LW, BIG, p), lh = lw * LOGO_SRC.h / LOGO_SRC.w, top = lerp(LY, 960 - (BIG * LOGO_SRC.h / LOGO_SRC.w) / 2, p);
    const mw = p > 0 ? BIG : LW, M = drawnMark(env, STYLE, mw, LW); if (!M) return;
    const S = env.scale, k = lw / mw, x0 = (540 - lw / 2) * S, y0 = top * S, w = lw * S, h = lh * S, pad = ((M.canvas.width - mw * S) / 2) * k;
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
    if (grow < 1) { const R = Math.hypot(w, h) * 0.6 * grow; ctx.beginPath(); for (let i = 0; i <= 24; i++) { const t = (i / 24) * 6.283, kk = 1 + 0.12 * (fractal(55, Math.cos(t) * 3, Math.sin(t) * 3, 0.9, 0.9, 2) - 0.5); ctx.lineTo(x0 + w / 2 + Math.cos(t) * R * kk, y0 + h / 2 + Math.sin(t) * R * kk); } ctx.closePath(); ctx.clip(); }
    ctx.globalAlpha = STYLE === "pencil" ? 0.8 : STYLE === "plain" ? 1 : 0.95; ctx.drawImage(M.canvas as CanvasImageSource, Math.round(x0 - pad), Math.round(y0 - pad), M.canvas.width * k, M.canvas.height * k); ctx.restore();
  };
  // first 26 frames: a drop of ink on the blank page, the picture opens out of it (adds no time; the voice starts at 0)
  const OPEN = o.opening ?? "ink", CLOSE = o.closing ?? "paper", BG = o.bg ?? W.PAPER;
  const cover = (ctx: Ctx, env: Env, a: number) => { if (a <= 0) return; ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = Math.min(1, a); ctx.fillStyle = BG; ctx.fillRect(0, 0, env.W * env.scale, env.H * env.scale); ctx.restore(); };
  const opening = (ctx: Ctx, env: Env, f: number) => {
    if (f >= 26 || OPEN === "none") return;
    if (OPEN === "fade") return cover(ctx, env, 1 - ease(seg(f, 0, 14)));
    const B = (x: number, y: number, R: number, a: number, b: number, seed: number): Bloom => ({ x, y, r: R * eo(seg(f, a, b)), seed, tide: 1 - seg(f, b - 6, b) });
    veil(ctx, env, [B(dx, dy, 1750, 1, 24, 61), B(250, 1380, 720, 6, 22, 62), B(860, 360, 680, 8, 24, 63)], true);
    const d = 1 - seg(f, 3, 12); if (d > 0) { const g = new Gfx(ctx, env, f, W.INK_M); g.group("paint", () => g.wash(blob(dx, dy, 14 + 60 * seg(f, 0, 8), 14 + 60 * seg(f, 0, 8), 64, 0.15, 14), W.INK, { alpha: 0.9 * d, seed: 64, dx: 0, dy: 0, shrink: 1 })); }
  };
  // the last closeFrames: the picture is washed over with paper (start it just after the last spoken word)
  const closing = (ctx: Ctx, env: Env, f: number) => {
    if (f < C0 || CLOSE === "none") return;
    if (CLOSE === "fade") return cover(ctx, env, ease(seg(f, C0, C0 + 24)));
    const B = (x: number, y: number, R: number, a: number, b: number, seed: number): Bloom => ({ x, y, r: R * eo(seg(f, a, b)), seed, tide: 1 - seg(f, b - 8, b) });
    veil(ctx, env, [B(540, 960, 1750, C0, C0 + 30, 71), B(240, 480, 640, C0 + 4, C0 + 24, 72), B(840, 1520, 640, C0 + 2, C0 + 22, 73)], false);
  };
  return { narration, watermark, opening, closing, closeStart: C0, ASSETS: { images: (o.logo === false ? {} : { logoC: "assets/logo_renkli.png", logoW: "assets/logo_beyaz.png" }) as Record<string, string> } };
};

// ---------------------------------------------------------------- people (gokWorld's figure system)
// a figure placed in screen space: feet at (x, y), `h` px tall. pose: W.POSE.* or walkPose(); look: W.LOOKS[i]
export const standAt = (g: Gfx, x: number, y: number, h: number, pose: W.J, view: W.View, look: W.Look, seed: number, o: { face?: number; legs?: boolean; shadow?: boolean } = {}) => {
  const k = h / 400; g.push(x - W.CX * k, y - W.FLOOR * k, k); W.figure(g, W.CX, 1, pose, view, look, seed, o); g.pop();
};
// a walk cycle from a phase (radians; e.g. (f / fps) * 6.283 for one step pair a second): legs swing
// from the hip, the trailing knee bends, arms swing opposite
export const walkPose = (view: W.View, ph: number): W.J => {
  const s = Math.sin(ph);
  if (view === "side") {
    const hip: P = [0, -0.48], leg = (th: number, bend: number): [P, P] => { const kn: P = [hip[0] + 0.235 * Math.sin(th), hip[1] + 0.235 * Math.cos(th)]; return [kn, [kn[0] + 0.245 * Math.sin(th - bend), kn[1] + 0.245 * Math.cos(th - bend)]]; };
    const thN = 0.4 * s, thF = -thN, bN = 0.45 * clamp01(-Math.sin(ph + 0.7)), bF = 0.45 * clamp01(Math.sin(ph + 0.7));
    const [knN, ftN] = leg(thN, bN), [knF, ftF] = leg(thF, bF), sh: P = [0.01, -0.82], arm = (al: number): [P, P] => { const el: P = [sh[0] + 0.18 * Math.sin(al), sh[1] + 0.18 * Math.cos(al)]; return [el, [el[0] + 0.17 * Math.sin(al + 0.3), el[1] + 0.17 * Math.cos(al + 0.3)]]; };
    const [elN, haN] = arm(-0.38 * s), [elF, haF] = arm(0.38 * s), bob = 0.006 * Math.cos(2 * ph);
    return { head: [0.02, -0.925 + bob], shN: [sh[0], sh[1] + bob], shF: [sh[0] - 0.01, sh[1] + bob], elN, elF, haN, haF, hpN: [0.005, -0.48 + bob], hpF: [-0.005, -0.48 + bob], knN, knF, ftN: [ftN[0], Math.min(0, ftN[1])], ftF: [ftF[0], Math.min(0, ftF[1])] } as W.J;
  }
  const B = W.POSE.stand, d = 0.03 * s;
  return { ...B, knN: [B.knN[0], B.knN[1] + d * 0.6], ftN: [B.ftN[0], d], knF: [B.knF[0], B.knF[1] - d * 0.6], ftF: [B.ftF[0], -d], elN: [B.elN[0] + 0.01, B.elN[1] - d * 0.4], haN: [B.haN[0] + 0.02, B.haN[1] - d], elF: [B.elF[0] - 0.01, B.elF[1] + d * 0.4], haF: [B.haF[0] - 0.02, B.haF[1] + d] };
};

// ---------------------------------------------------------------- lip sync (scripts/agiz_senkron.sh)
// cues: the mouthCues of Rhubarb's JSON, imported into the film. A-H and X are Rhubarb's mouth shapes.
export type MouthCue = { start: number; end: number; value: string };
export const mouthAt = (cues: MouthCue[], sec: number) => cues.find((c) => sec >= c.start && sec < c.end)?.value ?? "X";
// the same shape as how far the mouth is open (0..1), for a simple character mouth
export const mouthOpen = (shape: string) => ({ X: 0, A: 0.05, B: 0.25, C: 0.55, D: 1, E: 0.6, F: 0.3, G: 0.2, H: 0.45 } as Record<string, number>)[shape] ?? 0;
