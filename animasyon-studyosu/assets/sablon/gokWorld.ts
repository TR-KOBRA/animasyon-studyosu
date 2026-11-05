// Derived from anidoodle (Copyright 2026 Alex Greenshpun), modified for this project.
// Licensed under the Apache License 2.0: see LICENSES/Apache-2.0.txt and NOTICE.
import { Gfx, rng, tube, type Ctx, type Env, type Medium, type P } from "./core";
import { blob, bounds, clamp, clipped, fillShape, mix, smooth } from "./gallery";
import { GLYPHS, glyph, advance, measure, type Face } from "./scrapbookKit";

// The world of the example film (a vaulted corridor), its people, its lettering; reused for brushes, figures and captions.
// Drawn once into plates by the film; this module only knows how to draw, never when.
//
// MEDIUM, physically (the wren hand): washes go down first and wet, flood a little past where the
// line will be, the pigment settles along the bottom edge of each shape; then a flexible nib, thick
// on the press and hair-thin on the lift, contours left open where the light eats the edge.
// SUBJECT (from news photographs, used as reference only): the mall's long corridor under a barrel
// vault of ribbed translucent panels whose arched ribs are painted green, red and teal; thin red tie
// rods across; at the far end the gable carries concentric red, orange and blue arcs: the rainbow.
// Tall white walls hung with poster banners, shop fronts both sides (signs and posters as colour
// only, never lettering or faces), stone pillars with round clocks, a polished tile floor. Down the
// middle the food court: tables with yellow, orange, red and green plastic chairs. Soft daylight
// through the vault, warm light from the shops.
// FOCAL: the painted ribs leading to the rainbow gable. Everything else is full but quieter.
// LAYOUT for Reels: nothing that matters above y 250, below y 1470 or right of x 950; the caption
// sits on the floor band just above y 1470, never over the focal area.

const accent = (base: string, extra: P[][], curves: P[][] = []) => ({ ...GLYPHS[base], l: [...(GLYPHS[base].l ?? []), ...extra], c: [...(GLYPHS[base].c ?? []), ...curves] });
const CEDILLA: P[] = [[2.0, 5.9], [2.25, 6.7], [1.5, 7.3]];
Object.assign(GLYPHS, {
  "Ç": accent("C", [CEDILLA]), "Ş": accent("S", [CEDILLA]),
  "Ğ": accent("G", [], [[[1.0, -1.5], [1.5, -0.7], [2.5, -0.7], [3.0, -1.5]]]),
  "İ": accent("I", [[[0.9, -1.3], [1.1, -0.8]]]),
  "Ö": accent("O", [[[1.2, -1.2], [1.35, -0.75]], [[2.65, -1.2], [2.8, -0.75]]]),
  "Ü": accent("U", [[[1.2, -1.2], [1.35, -0.75]], [[2.65, -1.2], [2.8, -0.75]]]),
  "Â": accent("A", [[[1.2, -0.6], [2, -1.4], [2.8, -0.6]]]),
  "?": { c: [[[0.4, 1.3], [1.0, 0.2], [2.4, 0.1], [3.4, 1.0], [3.3, 2.2], [2.0, 3.1], [1.9, 4.2]]], l: [[[1.85, 5.5], [1.95, 5.9]]], w: 3.6 },
  "₺": { l: [[[1.3, 0], [1.3, 5.9], [3.8, 4.6]], [[0.1, 2.9], [2.7, 1.9]], [[0.1, 4.2], [2.7, 3.2]]], w: 4 },
});

const FPS = 30, BPM = 60, DURATION = 2670;
const INK_M: Medium = { nib: 1.7, taper: 1, pressure: 1.75, retrace: false, wobble: 1.35, rough: 0.6 };
const INK = "#16131f", PAPER = "#fbf8f0";
const RIBS = ["#5f9a58", "#c8433a", "#3f9a98"];             // green, red, teal, as painted
const GABLE = ["#c8433a", "#de8a2e", "#e2c043", "#3f74b0"];  // the far end's concentric arcs
const CHAIRS = ["#e7b52c", "#e7b52c", "#e7b52c", "#e58a2c", "#c8433a", "#6aa04a"];   // mostly yellow, the food court's others
const STONE = "#b9ab98", WARM = "#f0d39a", COOL = "#b9c6cf", TILE = "#e6dccb";
const SIGNS = ["#b8322a", "#2f5f8a", "#e2b54a", "#3f7f5a", "#8a3a5a", "#d07a2a", "#455a7a", "#2d7f86"];
const CLOTH = ["#2f3d5c", "#7a2f2f", "#56603a", "#c08a2e", "#5a5a5e", "#8a5a7a", "#2d6b6b", "#b25a3a"];

// ---------------------------------------------------------------- wet media (after wren.ts)
const wet = (g: Gfx, pts: P[], color: string, o: { alpha: number; seed: number; pool?: number; edge?: number }) => {
  const { alpha, seed, pool = 0.55, edge = 1 } = o, b = bounds(pts);
  g.group("paint", () => {
    g.wash(pts, color, { alpha, seed, dx: 6 * edge, dy: 5 * edge, shrink: 1 + 0.05 * edge, rim: true });
    clipped(g, pts, () => {
      const c = g.cur, gr = c.createLinearGradient(0, b.y0 + (b.y1 - b.y0) * 0.45, 0, b.y1 + 2);
      gr.addColorStop(0, color + "00"); gr.addColorStop(0.75, color + Math.round(255 * alpha * pool * 0.6).toString(16).padStart(2, "0")); gr.addColorStop(1, color + Math.round(255 * clamp(alpha * pool * 1.3)).toString(16).padStart(2, "0"));
      c.fillStyle = gr; c.fillRect(b.x0 - 20, b.y0, b.x1 - b.x0 + 40, b.y1 - b.y0 + 20);
    });
  });
};
// small shapes take a tight wet edge or they dissolve into a blot
const dab = (g: Gfx, pts: P[], color: string, seed: number, alpha = 0.88) => wet(g, pts, color, { alpha, seed, pool: 0.7, edge: 0.25 });
const pen = (g: Gfx, pts: P[], w: number, seed: number, op = 0.95, wob = 0.9, color = INK) => g.pen(pts, { w, color, seed, wobble: wob, boil: 0, taper: 1, opacity: op, retrace: false });
const ink = (g: Gfx, fn: () => void) => g.group("plain", fn);

// ---------------------------------------------------------------- perspective
// a near cross-section (z = 1, the picture plane) scaled toward the vanishing point by 1/z
const VP: P = [520, 1000], SPRING = 860, FLOOR = 1640, R = 600, ZB = 5.4;
const at = ([x, y]: P, z: number): P => [VP[0] + (x - VP[0]) / z, VP[1] + (y - VP[1]) / z];
const CX = 520;
const arch = (z: number, r = R, n = 44): P[] => Array.from({ length: n + 1 }, (_, i) => { const a = Math.PI + (Math.PI * i) / n; return at([CX + r * Math.cos(a), SPRING + r * Math.sin(a)], z); });
const wallX = (side: number) => CX + side * R;
const ZRIB = [0.78, 0.98, 1.22, 1.52, 1.9, 2.35, 2.9, 3.6, 4.4];
const quad = (X: number, y0: number, y1: number, za: number, zb: number): P[] => [at([X, y0], za), at([X, y0], zb), at([X, y1], zb), at([X, y1], za)];

// ---------------------------------------------------------------- the vault
const vault = (g: Gfx) => {
  const shell = [...arch(0.7, R + 40), ...arch(ZB).reverse()];
  wet(g, shell, COOL, { alpha: 0.38, seed: 3, pool: 0.25 });
  // daylight through the panels: warm overhead, cooler down the flanks
  g.group("paint", () => { g.wash(blob(520, 430, 300, 230, 4, 0.3, 20), "#fff4dc", { alpha: 0.55, seed: 4, dx: 0, dy: 0, shrink: 1 }); g.wash(blob(520, 720, 160, 120, 5, 0.3, 16), "#fff0d0", { alpha: 0.45, seed: 5, dx: 0, dy: 0, shrink: 1 }); });
  [-1, 1].forEach((sd) => g.group("paint", () => g.wash(blob(520 + sd * 430, 640, 120, 300, 6 + sd, 0.3, 16), "#8fa6b8", { alpha: 0.22, seed: 6 + sd, dx: 0, dy: 0, shrink: 1 })));
  // the ribbed panels: many fine lines along the vault, every fourth one firmer (a purlin)
  ink(g, () => { for (let k = 1; k < 48; k++) { const a = Math.PI + (Math.PI * k) / 48, p: P = [CX + R * Math.cos(a), SPRING + R * Math.sin(a)], firm = k % 4 === 0; pen(g, [at(p, 0.7), at(p, 1.6), at(p, ZB)], firm ? 1.4 : 0.7, 10 + k, firm ? 0.5 : 0.22, 0.35); } });
  // a seam across each bay, halfway between ribs
  ink(g, () => ZRIB.slice(0, -1).forEach((z, k) => pen(g, arch((z + ZRIB[k + 1]) / 2), 0.9 / Math.sqrt(z), 300 + k, 0.35, 0.5)));
};
// one painted rib: a coloured band, its darker underside, then the pen
const rib = (g: Gfx, k: number) => {
  const z = ZRIB[k], col = RIBS[k % 3], line = arch(z), w = 28 / z;
  wet(g, tube(line, w, w, false), col, { alpha: 0.88, seed: 20 + k, pool: 0.6 });
  wet(g, tube(arch(z * 1.025), w * 0.35, w * 0.35, false), mix(col, INK, 0.35), { alpha: 0.6, seed: 40 + k, pool: 0.4, edge: 0.4 });
  ink(g, () => { pen(g, arch(z * 0.985), 2.6 / Math.sqrt(z), 30 + k, 0.85, 0.6); pen(g, arch(z * 1.035), 1.3 / Math.sqrt(z), 50 + k, 0.55, 0.6); });
};
// the region a rib occupies on screen (for fading one rib at a time)
const ribZone = (k: number): P[] => { const z = ZRIB[k], w = 28 / z; return tube(arch(z * 1.01), w * 2.2, w * 2.2, false); };
const rods = (g: Gfx) => {
  // red tie rods across, just under the springing, with their turnbuckles
  ink(g, () => ZRIB.slice(1, 8).forEach((z, k) => { const a = at([wallX(-1), SPRING + 40], z), b = at([wallX(1), SPRING + 40], z); pen(g, [a, b], 2.4 / z + 0.6, 60 + k, 0.85, 0.3, "#b8322a"); const m: P = [(a[0] + b[0]) / 2, a[1]]; fillShape(g, blob(m[0], m[1], 7 / z, 4 / z, 70 + k, 0.1, 8), "#7a1f1a", 0.9); }));
};
// lamps hung on wires down the middle of the vault, each with a warm pool of light below
const lamps = (g: Gfx, z: number, seed: number) => {
  const top = at([CX, SPRING - R], z), bot = at([CX, SPRING - 70], z), w = 70 / z, h = 26 / z;
  ink(g, () => pen(g, [top, bot], 1, seed, 0.6, 0.2));
  g.group("paint", () => g.wash(blob(bot[0], bot[1] + 30 / z, 90 / z, 60 / z, seed + 1, 0.3, 14), "#ffe2a0", { alpha: 0.5, seed: seed + 1, dx: 0, dy: 0, shrink: 1 }));
  const box: P[] = [[bot[0] - w, bot[1]], [bot[0] + w, bot[1]], [bot[0] + w * 0.8, bot[1] + h], [bot[0] - w * 0.8, bot[1] + h]];
  dab(g, box, "#3a3a44", seed + 2, 0.85);
  ink(g, () => pen(g, [box[3], box[2]], 1.6 / Math.sqrt(z), seed + 3, 0.8, 0.2));
};

// the far end: a glazed gable and its concentric arcs (the rainbow), a café balcony, the stair and its ivy
const gable = (g: Gfx) => {
  const z = ZB, face = [...arch(z), at([wallX(1), FLOOR], z), at([wallX(-1), FLOOR], z)];
  wet(g, face, "#efe3cb", { alpha: 0.75, seed: 70, pool: 0.25 });
  // glazing inside the arcs: mullions radiating from the centre, sky behind
  wet(g, [...arch(z, R * 0.64)], "#cfe0ea", { alpha: 0.6, seed: 84, pool: 0.2, edge: 0.4 });
  ink(g, () => { const c = at([CX, SPRING], z); for (let k = 1; k < 8; k++) { const a = Math.PI + (Math.PI * k) / 8; pen(g, [c, at([CX + R * 0.64 * Math.cos(a), SPRING + R * 0.64 * Math.sin(a)], z)], 0.9, 85 + k, 0.6, 0.2); } });
  // café balcony with a rail, warm windows behind it
  const bal = SPRING + 110;
  wet(g, [at([CX - 330, SPRING + 10], z), at([CX + 330, SPRING + 10], z), at([CX + 330, bal], z), at([CX - 330, bal], z)], WARM, { alpha: 0.75, seed: 94, pool: 0.5, edge: 0.4 });
  ink(g, () => { pen(g, [at([wallX(-1), bal], z), at([wallX(1), bal], z)], 1.6, 90, 0.85, 0.3); for (let k = 0; k < 15; k++) { const x = CX - 350 + k * 50; pen(g, [at([x, bal], z), at([x, bal + 80], z)], 0.9, 91 + k, 0.6, 0.2); } pen(g, [at([wallX(-1), bal + 80], z), at([wallX(1), bal + 80], z)], 1.2, 110, 0.7, 0.3); });
  // the ground floor of the end wall: a lit café front, glazed in bays, its door in the middle,
  // a pot either side of the door, a few people far off; clear enough to read as where the walk ends
  const G0 = bal + 95, G1 = FLOOR - 4, q = (x0: number, x1: number, y0: number, y1: number): P[] => [at([x0, y0], z), at([x1, y0], z), at([x1, y1], z), at([x0, y1], z)];
  wet(g, q(CX - 520, CX + 520, G0, G1), "#f2cf8a", { alpha: 0.75, seed: 130, pool: 0.5, edge: 0.3 });
  dab(g, q(CX - 520, CX + 520, G0, G0 + 40), "#7a2f2f", 131, 0.85);   // the fascia, colour only
  dab(g, q(CX - 70, CX + 70, G0 + 70, G1), "#d9a95a", 132, 0.8);       // the open door, warmer inside
  ink(g, () => { [-520, -380, -230, -70, 70, 230, 380, 520].forEach((x, k) => pen(g, [at([CX + x, G0 + 40], z), at([CX + x, G1], z)], 1.1, 133 + k, 0.75, 0.2)); pen(g, [at([CX - 520, G0 + 40], z), at([CX + 520, G0 + 40], z)], 1.3, 141, 0.8, 0.2); pen(g, [at([CX - 520, G1 - 60], z), at([CX + 520, G1 - 60], z)], 0.9, 142, 0.5, 0.2); });
  // inside the glass: little tables and a counter, just suggested
  const r = rng(120); [-450, -300, 300, 450].forEach((x, k) => { dab(g, q(CX + x - 40, CX + x + 40, G1 - 110, G1 - 95), "#b88a1e", 150 + k, 0.8); ink(g, () => pen(g, [at([CX + x, G1 - 95], z), at([CX + x, G1], z)], 1, 155 + k, 0.6, 0.1)); });
  dab(g, q(CX - 200, CX - 90, G1 - 170, G1), "#8a5a3a", 160, 0.7); dab(g, q(CX + 90, CX + 200, G1 - 170, G1), "#8a5a3a", 161, 0.7);
  [-1, 1].forEach((sd) => { const x = CX + sd * 120; dab(g, q(x - 30, x + 30, G1 - 70, G1), "#a8573a", 170 + sd, 0.9); for (let k = 0; k < 6; k++) { const [px, py] = at([x + (r() - 0.5) * 70, G1 - 90 - r() * 110], z); dab(g, blob(px, py, 5 + r() * 4, 4 + r() * 3, 172 + k + sd * 10, 0.4, 8), mix("#4f8a3e", "#2f6a4a", r()), 172 + k + sd * 10, 0.85); } });
};

// the rainbow at the far end: concentric arcs, the token of the film
const gableArcs = (g: Gfx) => {
  const z = ZB;
  GABLE.forEach((col, i) => { const r0 = R * (0.98 - i * 0.085), band = [...arch(z, r0), ...arch(z, r0 - R * 0.075).reverse()]; wet(g, band, col, { alpha: 0.92, seed: 71 + i, pool: 0.5, edge: 0.5 }); });
  ink(g, () => [0.98, 0.895, 0.81, 0.725, 0.645].forEach((f, i) => pen(g, arch(z, R * f), 1.5, 80 + i, 0.75, 0.4)));
};
const GABLE_ZONE = (): P[] => [...arch(ZB, R * 1.02), ...arch(ZB, R * 0.62).reverse()];

// ---------------------------------------------------------------- the walls: banners above, shops below
const BAYS = [0.82, 1.05, 1.32, 1.68, 2.15, 2.75, 3.5, 4.4, ZB];
const wall = (g: Gfx, sd: number, allShut = false) => {
  const r = rng(100 + sd), X = wallX(sd), SIGN = SPRING + 120, GLASS = SPRING + 190, BASE = FLOOR - 90;
  // the high white wall above the shops, banners hung on it: colour fields only
  wet(g, quad(X, SPRING - 10, SIGN, BAYS[0], ZB), "#ece6da", { alpha: 0.6, seed: 200 + sd, pool: 0.3 });
  BAYS.slice(0, -1).forEach((za, i) => {
    const zb = BAYS[i + 1], zm0 = za + (zb - za) * 0.15, zm1 = zb - (zb - za) * 0.15;
    if (i % 2 === (sd > 0 ? 0 : 1)) {   // a poster banner: a field, a band of second colour, a bright block
      const c0 = SIGNS[(i * 5 + (sd > 0 ? 3 : 0)) % SIGNS.length], c1 = SIGNS[(i * 3 + 1) % SIGNS.length];
      wet(g, quad(X, SPRING + 5, SIGN - 15, zm0, zm1), c0, { alpha: 0.78, seed: 210 + i * 3 + sd, pool: 0.6, edge: 0.5 });
      dab(g, quad(X, SPRING + 60, SIGN - 25, zm0 + (zm1 - zm0) * 0.1, zm0 + (zm1 - zm0) * 0.55), c1, 211 + i * 3 + sd, 0.8);
      dab(g, quad(X, SPRING + 18, SPRING + 42, zm0 + (zm1 - zm0) * 0.1, zm1 - (zm1 - zm0) * 0.1), "#f6eedd", 212 + i * 3 + sd, 0.85);
      ink(g, () => pen(g, [at([X, SPRING + 5], zm0), at([X, SIGN - 15], zm0), at([X, SIGN - 15], zm1)], 1.2 / Math.sqrt(za), 213 + i, 0.6, 0.4));
    }
    // the shop: a sign board (colour, a pale strip where letters would be, never letters)
    const sc = SIGNS[(i * 3 + (sd > 0 ? 2 : 0)) % SIGNS.length];
    wet(g, quad(X, SIGN, GLASS - 10, za, zb), sc, { alpha: 0.82, seed: 230 + i * 2 + sd, pool: 0.6, edge: 0.5 });
    dab(g, quad(X, SIGN + 22, SIGN + 44, za + (zb - za) * 0.2, zb - (zb - za) * 0.3), mix(sc, "#ffffff", 0.55), 231 + i * 2 + sd, 0.6);
    const shut = allShut || (i + (sd > 0 ? 1 : 0)) % 4 === 3;
    if (shut) {   // a shutter, down
      wet(g, quad(X, GLASS, BASE, za, zb), "#a6a29c", { alpha: 0.7, seed: 250 + i, pool: 0.6, edge: 0.5 });
      ink(g, () => { for (let y = GLASS + 12; y < BASE; y += 16) pen(g, [at([X, y], za), at([X, y], zb)], 0.9 / Math.sqrt(za), 260 + y, 0.45, 0.2); });
    } else {
      wet(g, quad(X, GLASS, BASE, za + (zb - za) * 0.04, zb - (zb - za) * 0.04), WARM, { alpha: 0.6, seed: 270 + i * 2 + sd, pool: 0.5, edge: 0.6 });
      // what is for sale: a rail of hanging clothes, a mannequin, shelves of coloured boxes
      const kind = (i + (sd > 0 ? 2 : 0)) % 3, zz = (t: number) => za + (zb - za) * t;
      if (kind === 0) { ink(g, () => pen(g, [at([X, GLASS + 60], zz(0.12)), at([X, GLASS + 60], zz(0.88))], 1.4 / Math.sqrt(za), 280 + i, 0.8, 0.3)); for (let k = 0; k < 7; k++) { const t0 = 0.14 + k * 0.11; dab(g, quad(X, GLASS + 64, GLASS + 64 + 170 + r() * 90, zz(t0), zz(t0 + 0.08)), CLOTH[(k + i) % CLOTH.length], 281 + k + i * 9, 0.85); } }
      else if (kind === 1) { const mz = zz(0.4), [mx, my] = at([X, BASE - 10], mz), s = 330 / mz; dab(g, smooth([[mx - 0.12 * s, my - 0.8 * s], [mx + 0.12 * s, my - 0.8 * s], [mx + 0.1 * s, my - 0.45 * s], [mx + 0.16 * s, my - 0.05 * s], [mx - 0.16 * s, my - 0.05 * s], [mx - 0.1 * s, my - 0.45 * s]], true, 3), CLOTH[(i * 2) % CLOTH.length], 290 + i, 0.85); fillShape(g, blob(mx, my - 0.88 * s, 0.05 * s, 0.065 * s, 291 + i, 0.05, 10), "#d9d2c6", 0.9); dab(g, quad(X, GLASS + 40, GLASS + 200, zz(0.62), zz(0.9)), CLOTH[(i * 3 + 1) % CLOTH.length], 292 + i, 0.75); }
      else { [GLASS + 110, GLASS + 260, GLASS + 410].forEach((y, row) => { ink(g, () => pen(g, [at([X, y], zz(0.08)), at([X, y], zz(0.92))], 1.2 / Math.sqrt(za), 300 + row + i * 3, 0.7, 0.3)); for (let k = 0; k < 6; k++) { const t0 = 0.1 + k * 0.135, h = 40 + r() * 60; dab(g, quad(X, y - h, y - 2, zz(t0), zz(t0 + 0.1)), SIGNS[(k * 3 + row + i) % SIGNS.length], 310 + k + row * 7 + i * 30, 0.8); } }); }
    }
    ink(g, () => { pen(g, [at([X, SIGN], za), at([X, SIGN], zb)], 1.8 / Math.sqrt(za), 330 + i, 0.8, 0.4); pen(g, [at([X, GLASS - 10], za), at([X, GLASS - 10], zb)], 1.4 / Math.sqrt(za), 340 + i, 0.7, 0.4); pen(g, [at([X, BASE], za), at([X, BASE], zb)], 1.6 / Math.sqrt(za), 350 + i, 0.75, 0.4); pen(g, [at([X, SIGN], zb), at([X, FLOOR], zb)], 1.6 / Math.sqrt(zb), 360 + i, 0.7, 0.4); });
    dab(g, quad(X, BASE, FLOOR, za, zb), "#9a8e80", 370 + i * 2 + sd, 0.55);
  });
};
// stone pillars with round clocks, standing proud of the shop line
const pillar = (g: Gfx, z: number, sd: number, seed: number, clock: boolean, hands = true) => {
  const X = wallX(sd) - sd * 50, w = 76, pil: P[] = [at([X - w / 2, SPRING + 50], z), at([X + w / 2, SPRING + 50], z), at([X + w / 2, FLOOR], z), at([X - w / 2, FLOOR], z)];
  wet(g, pil, STONE, { alpha: 0.8, seed, pool: 0.8, edge: 0.6 });
  const r = rng(seed); for (let y = SPRING + 80; y < FLOOR - 20; y += 70) { const yy = y + (r() - 0.5) * 10; dab(g, [at([X - w / 2, yy], z), at([X + w / 2, yy], z), at([X + w / 2, yy + 60], z), at([X - w / 2, yy + 60], z)], mix(STONE, r() < 0.5 ? "#8a7a68" : "#d8cfc0", 0.4), seed + y, 0.35); }
  ink(g, () => { pen(g, [pil[0], pil[3]], 2.4 / Math.sqrt(z), seed + 1, 0.85, 0.5); pen(g, [pil[1], pil[2]], 1.4 / Math.sqrt(z), seed + 2, 0.6, 0.5); for (let y = SPRING + 120; y < FLOOR; y += 140) pen(g, [at([X - w / 2, y], z), at([X + w / 2, y], z)], 0.8 / Math.sqrt(z), seed + y, 0.4, 0.3); });
  if (clock) { const [cx, cy] = at([X, SPRING + 260], z), cr = 38 / z; fillShape(g, blob(cx, cy, cr, cr, seed + 5, 0.03, 18), PAPER, 0.97); ink(g, () => { pen(g, smooth(blob(cx, cy, cr, cr, seed + 6, 0.03, 12), true, 3), 2 / Math.sqrt(z), seed + 7, 0.9, 0.2); for (let k = 0; k < 12; k++) { const a = (k / 12) * 6.283; pen(g, [[cx + Math.cos(a) * cr * 0.78, cy + Math.sin(a) * cr * 0.78], [cx + Math.cos(a) * cr * 0.9, cy + Math.sin(a) * cr * 0.9]], 0.9, seed + 8 + k, 0.8, 0.05); } if (hands) { pen(g, [[cx, cy], [cx + cr * 0.12, cy - cr * 0.6]], 1.6, seed + 30, 0.9, 0.1); pen(g, [[cx, cy], [cx + cr * 0.45, cy + cr * 0.18]], 1.6, seed + 31, 0.9, 0.1); } }); }
};

// a clock's hands, live: angles in turns from twelve o'clock
const clockHands = (g: Gfx, z: number, sd: number, seed: number, hour: number, minute: number) => {
  const X = wallX(sd) - sd * 50, [cx, cy] = at([X, SPRING + 260], z), cr = 38 / z, hand = (turns: number, len: number, w: number, s2: number) => { const a = turns * 6.283 - Math.PI / 2; pen(g, [[cx, cy], [cx + Math.cos(a) * cr * len, cy + Math.sin(a) * cr * len]], w, s2, 0.9, 0.05); };
  ink(g, () => { hand(hour, 0.48, 2, seed + 30); hand(minute, 0.72, 1.5, seed + 31); });
};

// ---------------------------------------------------------------- the floor
const FLOOR_POLY = (): P[] => [at([wallX(-1), FLOOR], 0.75), at([wallX(1), FLOOR], 0.75), at([wallX(1), FLOOR], ZB), at([wallX(-1), FLOOR], ZB)];
const floor = (g: Gfx) => {
  const f = FLOOR_POLY();
  wet(g, f, TILE, { alpha: 0.65, seed: 400, pool: 0.3 });
  // the darker border strip along each shop line, as laid in the photographs
  [-1, 1].forEach((sd) => dab(g, [at([wallX(sd), FLOOR], 0.75), at([wallX(sd) - sd * 120, FLOOR], 0.75), at([wallX(sd) - sd * 120, FLOOR], ZB), at([wallX(sd), FLOOR], ZB)], "#b08a6a", 401 + sd, 0.5));
  // the vault's light and colour lying on the polished tiles: reflections under each rib, and down the middle
  g.group("paint", () => g.wash(blob(520, 1260, 150, 220, 405, 0.3, 18), "#fffaf0", { alpha: 0.6, seed: 405, dx: 0, dy: 0, shrink: 1 }));
  ink(g, () => { for (let u = -60; u < 1120; u += 110) pen(g, [at([u, FLOOR], 0.75), at([u, FLOOR], ZB)], 0.9, 420 + u, 0.3, 0.3); [0.85, 1.0, 1.2, 1.45, 1.8, 2.3, 3.0, 4.0].forEach((z, k) => pen(g, [at([wallX(-1), FLOOR], z), at([wallX(1), FLOOR], z)], 0.9, 440 + k, 0.3, 0.3)); });
};

const floorRefl = (g: Gfx) => {
  const f = FLOOR_POLY();
  // the far ribs mirrored in the polished tiles: reflected about the floor plane they land on the
  // near floor, faint coloured arcs under everything (clipped to the floor so they never climb a wall)
  g.group("paint", () => clipped(g, f, () => ZRIB.slice(4).forEach((z, k) => {
    const mirror = Array.from({ length: 41 }, (_, i) => { const a = Math.PI + (Math.PI * i) / 40; return at([CX + R * Math.cos(a), 2 * FLOOR - (SPRING + R * Math.sin(a))], z); });
    g.wash(tube(mirror, 22 / z, 22 / z, false), RIBS[(k + 4) % 3], { alpha: 0.2, seed: 460 + k, dx: 4, dy: 3, shrink: 1.02, rim: false });
  })));
  // (far floor only: near the viewer the same reflections read as stains)
  ZRIB.slice(4).forEach((z, k) => [-1, 1].forEach((sd) => { const [x, y] = at([CX + sd * (R - 160), FLOOR], z); g.group("paint", () => g.wash(blob(x, y + 40 / z, 22 / z, 70 / z, 410 + k * 2 + sd, 0.3, 10), RIBS[(k + 4) % 3], { alpha: 0.2, seed: 410 + k * 2 + sd, dx: 0, dy: 0, shrink: 1 })); }));
};

// ---------------------------------------------------------------- the food court: tables, chairs, people
// a plastic chair: seat, a curved back with a hand slot, four splayed legs; `face` turns its back toward or away from us
const chair = (g: Gfx, u: number, z: number, col: string, seed: number, back: number) => {
  const T = (x: number, h: number, dz = 0) => at([u + x, FLOOR - h], z * (1 + dz));
  const seat: P[] = [T(-34, 100, -0.03), T(34, 100, -0.03), T(36, 96, 0.03), T(-36, 96, 0.03)];
  const bz = back * 0.032, bk = smooth([T(-34, 100, bz), T(-36, 170, bz * 1.1), T(-30, 215, bz * 1.15), T(0, 222, bz * 1.15), T(30, 215, bz * 1.15), T(36, 170, bz * 1.1), T(34, 100, bz)], true, 4);
  ink(g, () => [[-30, -0.025], [30, -0.025], [-32, 0.025], [32, 0.025]].forEach(([x, dz], k) => pen(g, [T(x * 0.95, 98, dz), T(x * 1.15, 0, dz * 1.4)], 1.5 / Math.sqrt(z), seed + k, 0.7, 0.2, mix(col, INK, 0.5))));
  if (back > 0) { dab(g, seat, col, seed + 5); dab(g, bk, col, seed + 6); } else { dab(g, bk, col, seed + 6); dab(g, seat, col, seed + 5); }
  dab(g, blob(...T(0, 196, bz * 1.12), 11 / z, 5 / z, seed + 7, 0.1, 8), mix(col, INK, 0.55), seed + 7, 0.7);   // the hand slot
  ink(g, () => { pen(g, bk, 1.3 / Math.sqrt(z), seed + 8, 0.75, 0.3); pen(g, [seat[3], seat[2]], 1.4 / Math.sqrt(z), seed + 9, 0.8, 0.3); });
};
// ---------------------------------------------------------------- people: a posable figure
// Joints in units of body height, y up negative, x to the figure's right (side views face +x and
// are mirrored by `face`). Limbs are wash tubes in the clothes' colour, the head a wash in skin and
// hair or a headscarf, no features ever drawn; the pen only on the shaded side.
type J = { head: P; shN: P; shF: P; elN: P; elF: P; haN: P; haF: P; hpN: P; hpF: P; knN: P; knF: P; ftN: P; ftF: P };
type View = "back" | "front" | "side";
type Look = { coat: string; legs: string; skin: string; hair: string; scarf?: string; bag?: string; pack?: string; long?: boolean };
const STAND: J = { head: [0, -0.925], shN: [0.115, -0.82], shF: [-0.115, -0.82], elN: [0.14, -0.63], elF: [-0.14, -0.63], haN: [0.15, -0.45], haF: [-0.15, -0.45], hpN: [0.075, -0.48], hpF: [-0.075, -0.48], knN: [0.07, -0.25], knF: [-0.07, -0.25], ftN: [0.075, 0], ftF: [-0.075, 0] };
const POSE: Record<string, J> = {
  stand: STAND,
  // walking away or toward: the trailing foot sits higher on screen (further off), arms swing opposite
  stride: { ...STAND, elN: [0.15, -0.63], haN: [0.18, -0.47], elF: [-0.12, -0.64], haF: [-0.11, -0.48], knN: [0.075, -0.24], ftN: [0.08, 0.012], knF: [-0.065, -0.27], ftF: [-0.06, -0.035] },
  // looking up at the vault and pointing: head tipped back, one arm raised
  lookUp: { ...STAND, head: [0.005, -0.915], elN: [0.17, -0.95], haN: [0.21, -1.1] },
  walkSide: { head: [0.02, -0.925], shN: [0.01, -0.82], shF: [-0.01, -0.82], elN: [0.07, -0.64], elF: [-0.06, -0.64], haN: [0.13, -0.5], haF: [-0.1, -0.5], hpN: [0.005, -0.48], hpF: [-0.005, -0.48], knN: [0.075, -0.26], knF: [-0.045, -0.25], ftN: [0.15, 0], ftF: [-0.13, -0.015] },
  talkSide: { head: [0.015, -0.925], shN: [0.01, -0.82], shF: [-0.01, -0.82], elN: [0.08, -0.66], elF: [-0.03, -0.63], haN: [0.17, -0.6], haF: [0.0, -0.46], hpN: [0.005, -0.48], hpF: [-0.005, -0.48], knN: [0.025, -0.25], knF: [-0.015, -0.25], ftN: [0.05, 0], ftF: [-0.02, 0] },
  // seated: hips at the chair seat, forearms on the table top (its height is 0.375)
  sitFront: { head: [0, -0.665], shN: [0.115, -0.565], shF: [-0.115, -0.565], elN: [0.14, -0.42], elF: [-0.14, -0.42], haN: [0.06, -0.38], haF: [-0.06, -0.38], hpN: [0.08, -0.25], hpF: [-0.08, -0.25], knN: [0.08, -0.26], knF: [-0.08, -0.26], ftN: [0.08, 0], ftF: [-0.08, 0] },
  sitBack: { head: [0, -0.665], shN: [0.115, -0.565], shF: [-0.115, -0.565], elN: [0.13, -0.43], elF: [-0.13, -0.43], haN: [0.08, -0.38], haF: [-0.08, -0.38], hpN: [0.08, -0.25], hpF: [-0.08, -0.25], knN: [0.08, -0.26], knF: [-0.08, -0.26], ftN: [0.08, 0], ftF: [-0.08, 0] },
  sitSide: { head: [0.015, -0.69], shN: [0.0, -0.595], shF: [-0.01, -0.595], elN: [0.07, -0.44], elF: [0.05, -0.45], haN: [0.2, -0.39], haF: [0.17, -0.4], hpN: [0.0, -0.25], hpF: [-0.01, -0.25], knN: [0.2, -0.27], knF: [0.19, -0.26], ftN: [0.22, 0], ftF: [0.2, -0.01] },
};
const figure = (g: Gfx, u: number, z: number, pose: J, view: View, look: Look, seed: number, o: { face?: number; legs?: boolean; shadow?: boolean } = {}) => {
  const { face = 1, legs = true, shadow = true } = o, [fx, fy] = at([u, FLOOR], z), s = 400 / z, T = ([x, y]: P): P => [fx + x * s * face, fy + y * s], sw = 1 / Math.sqrt(z);
  const limb = (pts: P[], r0: number, r1: number, col: string, sd: number, a = 0.9) => dab(g, tube(pts.map(T), r0 * s, r1 * s, true), col, sd, a);
  if (shadow) g.group("paint", () => g.wash(blob(fx, fy, 0.22 * s, 0.03 * s, seed + 90, 0.2, 10), INK, { alpha: 0.16, seed: seed + 90, dx: 0, dy: 0, shrink: 1 }));
  const far = (c: string) => mix(c, INK, 0.25), side = view === "side";
  // the far limbs first, a shade darker
  if (legs) { limb([pose.hpF, pose.knF, pose.ftF], 0.05, 0.04, far(look.legs), seed + 1); dab(g, blob(...T([pose.ftF[0] + (side ? 0.025 : 0), pose.ftF[1] - 0.01]), 0.04 * s, 0.018 * s, seed + 2, 0.1, 8), "#24201e", seed + 2, 0.9); }
  if (side) limb([pose.shF, pose.elF, pose.haF], 0.036, 0.03, far(look.coat), seed + 3);
  if (look.pack && view !== "back") { const b = side ? [-0.13, -0.8] : [0, -0.78]; dab(g, [T([b[0] - 0.05, b[1]]), T([b[0] + 0.05, b[1]]), T([b[0] + 0.05, b[1] + 0.25]), T([b[0] - 0.05, b[1] + 0.25])], look.pack, seed + 4); }
  if (legs) { limb([pose.hpN, pose.knN, pose.ftN], 0.05, 0.04, look.legs, seed + 5); dab(g, blob(...T([pose.ftN[0] + (side ? 0.025 : 0), pose.ftN[1] - 0.01]), 0.04 * s, 0.018 * s, seed + 6, 0.1, 8), "#24201e", seed + 6, 0.9); }
  // the torso: a coat to the hips, longer for a long coat or a pardösü
  const hem = (look.long ? 0.2 : 0.06), w0 = side ? 0.065 : 0.13, w1 = side ? 0.075 : 0.11, sh = (pose.shN[1] + pose.shF[1]) / 2, hp = (pose.hpN[1] + pose.hpF[1]) / 2, cx0 = (pose.shN[0] + pose.shF[0]) / 2, cx1 = (pose.hpN[0] + pose.hpF[0]) / 2;
  const torso = smooth([[cx0 - w0 * 0.55, sh - 0.01], [cx0 + w0 * 0.55, sh - 0.01], [cx0 + w0, sh + 0.04], [cx1 + w1, hp + hem], [cx1 - w1, hp + hem], [cx0 - w0, sh + 0.04]].map((p) => T(p as P)), true, 3);
  dab(g, torso, look.coat, seed + 7, 0.92);
  if (look.pack && view === "back") dab(g, [T([-0.085, sh + 0.04]), T([0.085, sh + 0.04]), T([0.08, sh + 0.3]), T([-0.08, sh + 0.3])], look.pack, seed + 8);
  // arms: in front and back views both are visible at the sides; in a side view the near one over the torso
  if (!side) limb([pose.shF, pose.elF, pose.haF], 0.036, 0.03, far(look.coat), seed + 9);
  limb([pose.shN, pose.elN, pose.haN], 0.036, 0.03, look.coat, seed + 10);
  if (view !== "back" || pose === POSE.lookUp) dab(g, blob(...T(pose.haN), 0.022 * s, 0.022 * s, seed + 11, 0.1, 8), look.skin, seed + 11, 0.9);
  if (look.bag) dab(g, [T([pose.haN[0] - 0.04, pose.haN[1] + 0.01]), T([pose.haN[0] + 0.05, pose.haN[1] + 0.01]), T([pose.haN[0] + 0.055, pose.haN[1] + 0.17]), T([pose.haN[0] - 0.045, pose.haN[1] + 0.17])], look.bag, seed + 12);
  // the head: skin, then hair or a scarf over it; from behind only hair or scarf shows
  const [hx, hy] = T(pose.head), hr = 0.06 * s;
  if (look.scarf) { dab(g, smooth([[hx - hr * 1.15, hy - hr * 0.2], [hx, hy - hr * 1.35], [hx + hr * 1.15, hy - hr * 0.2], [hx + hr * 1.5, hy + hr * 1.9], [hx - hr * 1.5, hy + hr * 1.9]], true, 4), look.scarf, seed + 13, 0.92); if (view !== "back") dab(g, blob(hx + (side ? hr * 0.35 * face : 0), hy + hr * 0.15, hr * 0.62, hr * 0.78, seed + 14, 0.05, 10), look.skin, seed + 14, 0.92); }
  else {
    if (view === "back") dab(g, blob(hx, hy, hr, hr * (pose === POSE.lookUp ? 1.05 : 1.2), seed + 13, 0.06, 12), look.hair, seed + 13, 0.92);
    else { dab(g, blob(hx, hy, hr * 0.92, hr * 1.15, seed + 13, 0.05, 12), look.skin, seed + 13, 0.92); dab(g, side ? blob(hx - hr * 0.35 * face, hy - hr * 0.45, hr * 0.8, hr * 0.75, seed + 14, 0.1, 10) : blob(hx, hy - hr * 0.75, hr * 0.98, hr * 0.5, seed + 14, 0.1, 10), look.hair, seed + 14, 0.92); }
  }
  ink(g, () => { pen(g, [T([cx0 + w0, sh + 0.04]), T([cx1 + w1, hp + hem])], 1.6 * sw, seed + 20, 0.7, 0.5); if (legs) pen(g, [T(pose.hpN), T(pose.knN), T(pose.ftN)], 1.2 * sw, seed + 21, 0.55, 0.4); pen(g, [T(pose.shN), T(pose.elN), T(pose.haN)], 1.1 * sw, seed + 22, 0.5, 0.4); });
  if (s > 120) detail(g, pose, view, look, seed, T, s, face, side, legs, { cx0, cx1, sh, hp, hem, w0, w1 });   // close enough to be read: the finer things
};
// THE FINER THINGS, for people seen near enough to read them (drawn over the figure, same light from
// the upper left): the shaded side of the body, creases at the waist, elbow and knee, a collar, hair
// with its strands, hands as hands (not dots) along the forearm, shoes with a heel and a toe.
const detail = (g: Gfx, pose: J, view: View, look: Look, seed: number, T: (p: P) => P, s: number, face: number, side: boolean, legs: boolean, b: { cx0: number; cx1: number; sh: number; hp: number; hem: number; w0: number; w1: number }) => {
  const sw = Math.max(0.6, s / 400), shade = (c: string) => mix(c, INK, 0.4);
  // the side away from the light, a thin darker wash over the coat and the near leg
  const sd = side ? -1 : 1;
  dab(g, smooth([[b.cx0 + sd * b.w0 * 0.15, b.sh + 0.03], [b.cx0 + sd * b.w0, b.sh + 0.05], [b.cx1 + sd * b.w1, b.hp + b.hem], [b.cx1 + sd * b.w1 * 0.25, b.hp + b.hem]].map((p) => T(p as P)), true, 3), shade(look.coat), seed + 40, 0.32);
  if (legs) dab(g, tube([T([pose.hpN[0] + 0.02 * sd, pose.hpN[1]]), T([pose.knN[0] + 0.02 * sd, pose.knN[1]]), T([pose.ftN[0] + 0.02 * sd, pose.ftN[1] - 0.02])], 0.02 * s, 0.016 * s, false), shade(look.legs), seed + 41, 0.3);
  // shoes: a heel and a toe, the toe the way the figure faces
  const shoe = (f: P, sdd: number) => { const toe = side ? 0.075 : 0.012, q: P[] = side ? [[f[0] - 0.035, f[1] - 0.035], [f[0] + 0.03, f[1] - 0.03], [f[0] + toe, f[1] - 0.008], [f[0] + toe, f[1]], [f[0] - 0.04, f[1]]] : [[f[0] - 0.036, f[1] - 0.03], [f[0] + 0.036, f[1] - 0.03], [f[0] + 0.04, f[1]], [f[0] - 0.04, f[1]]]; dab(g, q.map(T), "#1f1b1a", seed + sdd, 0.95); ink(g, () => pen(g, [T([f[0] - 0.04, f[1] - 0.004]), T([f[0] + toe, f[1] - 0.004])], 1.2 * sw, seed + sdd + 1, 0.6, 0.2, "#6a625a")); };
  if (legs) { shoe(pose.ftF, 50); shoe(pose.ftN, 52); }
  // hands: a mitten along the forearm, the thumb a short tick; in the skin colour unless seen from behind
  const hand = (el: P, ha: P, sdd: number) => { const dx = ha[0] - el[0], dy = ha[1] - el[1], l = Math.hypot(dx, dy) || 1, ux = dx / l, uy = dy / l, nx = -uy, ny = ux, L = 0.05, Wd = 0.021; const q: P[] = [[ha[0] + nx * Wd, ha[1] + ny * Wd], [ha[0] + ux * L + nx * Wd * 0.7, ha[1] + uy * L + ny * Wd * 0.7], [ha[0] + ux * (L + 0.012), ha[1] + uy * (L + 0.012)], [ha[0] + ux * L - nx * Wd * 0.7, ha[1] + uy * L - ny * Wd * 0.7], [ha[0] - nx * Wd, ha[1] - ny * Wd]]; dab(g, smooth(q.map(T), true, 3), look.skin, seed + sdd, 0.95); ink(g, () => pen(g, [T([ha[0] + nx * Wd, ha[1] + ny * Wd]), T([ha[0] + ux * 0.02 + nx * Wd * 1.5, ha[1] + uy * 0.02 + ny * Wd * 1.5])], 1 * sw, seed + sdd + 1, 0.5, 0.2)); };
  if (view !== "back" || pose === POSE.lookUp) { hand(pose.elN, pose.haN, 60); if (!side) hand(pose.elF, pose.haF, 62); }
  ink(g, () => {
    // creases: across the waist, in the crook of the elbow, behind the knee
    pen(g, [T([b.cx1 - b.w1 * 0.8, b.hp - 0.02]), T([b.cx1, b.hp - 0.01]), T([b.cx1 + b.w1 * 0.7, b.hp - 0.025])], 0.9 * sw, seed + 70, 0.4, 0.6, shade(look.coat));
    pen(g, [T([pose.elN[0] - 0.012, pose.elN[1] - 0.01]), T([pose.elN[0] + 0.015, pose.elN[1] + 0.012])], 0.9 * sw, seed + 71, 0.45, 0.4, shade(look.coat));
    if (legs) pen(g, [T([pose.knN[0] - 0.02, pose.knN[1] - 0.005]), T([pose.knN[0] + 0.02, pose.knN[1] + 0.01])], 0.9 * sw, seed + 72, 0.4, 0.4, shade(look.legs));
    // a fold running down from the near shoulder
    pen(g, [T([b.cx0 + b.w0 * 0.5, b.sh + 0.06]), T([b.cx0 + b.w0 * 0.35, b.sh + 0.16]), T([b.cx1 + b.w1 * 0.5, b.hp - 0.04])], 0.8 * sw, seed + 73, 0.3, 0.8, shade(look.coat));
  });
  // the collar, and the hair's strands (or the scarf's folds)
  const [hx, hy] = T(pose.head), hr = 0.06 * s;
  ink(g, () => {
    if (view === "front" && !look.scarf) pen(g, [T([b.cx0 - 0.04, b.sh - 0.005]), T([b.cx0, b.sh + 0.05]), T([b.cx0 + 0.04, b.sh - 0.005])], 1.1 * sw, seed + 80, 0.6, 0.3, shade(look.coat));
    if (view === "back" && !look.scarf) pen(g, [T([b.cx0 - 0.05, b.sh]), T([b.cx0, b.sh + 0.012]), T([b.cx0 + 0.05, b.sh])], 1 * sw, seed + 81, 0.5, 0.3, shade(look.coat));
    const r = rng(seed + 82), col = look.scarf ? shade(look.scarf) : mix(look.hair, "#000000", 0.35);
    for (let k = 0; k < 6; k++) { const a0 = -2.6 + k * 0.38 + r() * 0.1, top = view === "back" ? 1 : 0.6; pen(g, [[hx + Math.cos(a0) * hr * 0.9 * top, hy + Math.sin(a0) * hr * 1.0], [hx + Math.cos(a0 + 0.5) * hr * 0.5, hy + Math.sin(a0 + 0.5) * hr * 0.4]], 0.8 * sw, seed + 83 + k, 0.45, 0.6, col); }
  });
};

// who is where: varied people, nobody a copy of another
const LOOKS: Look[] = [
  { coat: "#2f3d5c", legs: "#2a2a33", skin: "#d9b494", hair: "#2b211c", pack: "#c8433a" },
  { coat: "#7a2f2f", legs: "#3a3440", skin: "#e0bc9c", hair: "#3a2a20", scarf: "#d9a5a0", long: true },
  { coat: "#56603a", legs: "#33302c", skin: "#c99c7a", hair: "#1e1a18" },
  { coat: "#c08a2e", legs: "#2a2a33", skin: "#dcb898", hair: "#4a3424", bag: "#2f5f8a" },
  { coat: "#5a5a5e", legs: "#27303c", skin: "#d4ae8c", hair: "#2a2420", scarf: "#3f6f8a", long: true },
  { coat: "#8a5a7a", legs: "#2e2a30", skin: "#e2c0a2", hair: "#2a1e18", scarf: "#e2b54a" },
  { coat: "#2d6b6b", legs: "#2f2c2a", skin: "#cfa284", hair: "#151313", pack: "#3a3a44" },
  { coat: "#b25a3a", legs: "#33363e", skin: "#d8b090", hair: "#3e2c22" },
  { coat: "#e6e0d2", legs: "#2c3446", skin: "#d6b090", hair: "#2a2220", bag: "#b8322a" },
  { coat: "#3e4a6a", legs: "#2a2a2e", skin: "#c99878", hair: "#1c1816", scarf: "#6a8a4a", long: true },
  { coat: "#4a6a8a", legs: "#2a2a30", skin: "#d2a888", hair: "#2a201a", pack: "#e2b54a" },
  { coat: "#a2483a", legs: "#2c2c34", skin: "#e4c4a6", hair: "#1a1614", scarf: "#2f3d5c", long: true },
  { coat: "#3a5a3a", legs: "#33302e", skin: "#c79a78", hair: "#2e2620" },
  { coat: "#d7b56a", legs: "#3a3a44", skin: "#dcb696", hair: "#1f1a18", scarf: "#8a3a5a" },
  { coat: "#2a2a34", legs: "#4a4a52", skin: "#d0a686", hair: "#3a2c22", bag: "#e7b52c" },
  { coat: "#6a8aa2", legs: "#2a2a2e", skin: "#e0bea0", hair: "#2a221e", pack: "#5f9a58" },
  { coat: "#8a6a4a", legs: "#2a2a33", skin: "#c49474", hair: "#161412" },
  { coat: "#5f9a58", legs: "#2c2c34", skin: "#dfbb9c", hair: "#2a1e18", scarf: "#c8433a" },
  { coat: "#33415a", legs: "#2a2a2e", skin: "#cda080", hair: "#1e1a18" },
  { coat: "#c9a27a", legs: "#3a3440", skin: "#e0bc9c", hair: "#3a2a20", scarf: "#455a7a", long: true },
  { coat: "#9a3a4a", legs: "#2a2a33", skin: "#d4ae8c", hair: "#2b211c" },
];   // each look is worn by one person only
// a litter bin on the near floor: a short steel drum with a dark mouth
const bin = (g: Gfx, u: number, z: number, seed: number) => {
  const T = (x: number, h: number) => at([u + x, FLOOR - h], z), [cx, cy] = T(0, 125), rx = 34 / z;
  dab(g, [T(-34, 125), T(34, 125), T(32, 0), T(-32, 0)], "#8a9096", seed, 0.85);
  dab(g, blob(cx, cy, rx, rx * 0.28, seed + 1, 0.03, 14), "#2a2a30", seed + 1, 0.9);
  ink(g, () => { pen(g, [T(-34, 125), T(-32, 0)], 1.8 / Math.sqrt(z), seed + 2, 0.8, 0.3); pen(g, [T(34, 125), T(32, 0)], 1.2 / Math.sqrt(z), seed + 3, 0.6, 0.3); pen(g, [T(-33, 40), T(33, 40)], 1 / Math.sqrt(z), seed + 4, 0.5, 0.2); });
};
type Seat = { look: number; at: "fl" | "fr" | "nl" | "nr" | "end" };
// a chair put up on the table at closing: seat on the top, legs in the air, the back hanging over the near edge
const chairUp = (g: Gfx, u: number, z: number, col: string, seed: number) => {
  const T = (x: number, h: number, dz = 0) => at([u + x, FLOOR - h], z * (1 + dz));
  const seat: P[] = [T(-34, 152, -0.03), T(34, 152, -0.03), T(36, 156, 0.03), T(-36, 156, 0.03)];
  const bk = smooth([T(-34, 152, -0.05), T(-36, 120, -0.058), T(-30, 84, -0.062), T(0, 78, -0.062), T(30, 84, -0.062), T(36, 120, -0.058), T(34, 152, -0.05)], true, 4);
  ink(g, () => [[-30, -0.025], [30, -0.025], [-32, 0.025], [32, 0.025]].forEach(([x, dz], k) => pen(g, [T(x * 0.95, 156, dz), T(x * 1.15, 252, dz * 1.4)], 1.5 / Math.sqrt(z), seed + k, 0.7, 0.2, mix(col, INK, 0.5))));
  dab(g, seat, col, seed + 5); dab(g, bk, col, seed + 6);
  ink(g, () => pen(g, bk, 1.3 / Math.sqrt(z), seed + 8, 0.75, 0.3));
};
// a table and its chairs. mode: "life" as people use it, "trays" on the last day (the stock set out
// for the students), "empty" after closing (nobody, chairs up on the top). The colour picks run in the
// same order in every mode, so a chair keeps its colour from one state to the next.
const table = (g: Gfx, u: number, z: number, seed: number, seats: Seat[] = [], empty: string[] = [], mode: "life" | "trays" | "empty" = "life") => {
  const r = rng(seed), T = (x: number, h: number, dz = 0) => at([u + x, FLOOR - h], z * (1 + dz));
  const pick = () => CHAIRS[Math.floor(r() * CHAIRS.length)], has = (k: string) => !empty.includes(k), who = (k: string) => (mode === "empty" ? undefined : seats.find((q) => q.at === k));
  const up: [number, string, number][] = [];
  // far side: chairs, then whoever sits facing us (the table top will hide their lap)
  ([["fl", -70], ["fr", 70]] as const).forEach(([k, x], i) => { const c = pick(); if (has(k)) { if (mode === "empty") up.push([x, c, seed + 10 + i * 10]); else chair(g, u + x, z * 1.06, c, seed + 10 + i * 10, -1); } const p = who(k); if (p) figure(g, u + x, z * 1.06, POSE.sitFront, "front", LOOKS[p.look], seed + 200 + i * 40, { legs: false, shadow: false }); });
  const top: P[] = [T(-62, 150, -0.05), T(62, 150, -0.05), T(64, 146, 0.05), T(-64, 146, 0.05)];
  ink(g, () => { pen(g, [T(0, 146), T(0, 6)], 3 / Math.sqrt(z), seed + 1, 0.85, 0.2); pen(g, [T(-34, 2), T(34, 2)], 2 / Math.sqrt(z), seed + 2, 0.75, 0.2); });
  dab(g, top, "#e9c13e", seed + 3, 0.95); dab(g, [top[3], top[2], T(64, 138, 0.05), T(-64, 138, 0.05)], "#b88a1e", seed + 4, 0.9);
  ink(g, () => pen(g, [top[0], top[1], top[2], top[3], top[0]], 1.3 / Math.sqrt(z), seed + 5, 0.8, 0.3));
  // a tea glass or two on the table: the narrow-waisted kind, amber
  const glass = r() < 0.7, gx = -14 + r() * 28;
  if (glass && mode !== "empty") { const [tx, ty] = T(gx, 150, 0); dab(g, [[tx - 4 / z, ty - 20 / z], [tx + 4 / z, ty - 20 / z], [tx + 2 / z, ty - 10 / z], [tx + 4 / z, ty], [tx - 4 / z, ty], [tx - 2 / z, ty - 10 / z]], "#b5541e", seed + 6, 0.8); }
  // the last day: whatever was left in the shops, set out to be taken: boxes, packets, bottles
  if (mode === "trays") { const rt = rng(seed + 77); for (let k = 0; k < 4; k++) { const x0 = -54 + k * 28 + rt() * 6, w = 18 + rt() * 10, h = 16 + rt() * 34; dab(g, [T(x0, 150 + h, -0.01), T(x0 + w, 150 + h, -0.01), T(x0 + w, 150, -0.01), T(x0, 150, -0.01)], SIGNS[Math.floor(rt() * SIGNS.length)], seed + 80 + k, 0.9); } }
  // one at the table's end, side on, forearms on the top
  const e = who("end"); if (e) figure(g, u + 112, z, POSE.sitSide, "side", LOOKS[e.look], seed + 300, { face: -1 });
  // near side: whoever sits with their back to us, then the chair backs in front of them
  ([["nl", -70], ["nr", 70]] as const).forEach(([k, x], i) => { const c = pick(); const p = who(k); if (p) figure(g, u + x, z * 0.94, POSE.sitBack, "back", LOOKS[p.look], seed + 400 + i * 40, { legs: false, shadow: false }); if (has(k)) { if (mode === "empty") up.push([x, c, seed + 30 + i * 10]); else chair(g, u + x, z * 0.94, c, seed + 30 + i * 10, 1); } });
  up.forEach(([x, c, s2], i) => chairUp(g, u + x * (i % 2 ? 0.55 : 0.75), z, c, s2));
};
// a potted plant at the foot of a pillar
const plant = (g: Gfx, u: number, z: number, seed: number) => {
  const T = (x: number, h: number) => at([u + x, FLOOR - h], z), r = rng(seed);
  dab(g, [T(-30, 70), T(30, 70), T(24, 0), T(-24, 0)], "#a8573a", seed, 0.85);
  for (let k = 0; k < 9; k++) { const [x, y] = T((r() - 0.5) * 90, 90 + r() * 120); dab(g, blob(x, y, (14 + r() * 12) / z, (9 + r() * 8) / z, seed + k + 1, 0.4, 10, r() * 3), mix("#4f8a3e", "#2f6a4a", r()), seed + k + 1, 0.85); }
  ink(g, () => { pen(g, [T(-30, 70), T(30, 70)], 1.4 / Math.sqrt(z), seed + 20, 0.8, 0.2); for (let k = 0; k < 5; k++) pen(g, [T(0, 72), T((r() - 0.5) * 70, 120 + r() * 90)], 1 / Math.sqrt(z), seed + 21 + k, 0.6, 0.6); });
};

// ---------------------------------------------------------------- the line of narration, inked in, on the floor band
const SUB: Face = { weight: 0.1, track: 1.5, cap: "round", join: "round" };
// on the bare near floor, under everything that stands, just above the Reels caption zone
const CAP_Y = 1495, CAP_X = 540;   // centred on the frame; lines kept to 760 so they stop short of the Reels buttons (x > 950)
const measureW = (text: string, cap: number) => measure(text, cap, SUB);
// words wrapped to at most `maxW` wide (the line breaks fall between words)
const wrap = (text: string, cap: number, maxW: number) => { const out: string[] = []; let cur = ""; text.split(" ").forEach((w) => { const t = cur ? cur + " " + w : w; if (cur && measure(t, cap, SUB) > maxW) { out.push(cur); cur = w; } else cur = t; }); if (cur) out.push(cur); return out; };
// the narration line, inked in: `n` characters written so far, the whole of it faded by `alpha`.
// It never moves: always the same band on the floor, under the people, above the Reels caption zone.
const caption = (ctx: Ctx, env: Env, text: string, cap: number, n = Infinity, alpha = 1) => {
  if (alpha <= 0) return;
  const lines = wrap(text, cap, 760), lh = cap * 1.8, w = Math.max(...lines.map((s) => measure(s, cap, SUB)));
  ctx.setTransform(env.scale, 0, 0, env.scale, 0, 0);
  const g = new Gfx(ctx, env, 0, INK_M);
  g.group("paint", () => g.wash(blob(CAP_X, CAP_Y + (lines.length * lh) / 2 - cap * 0.3, w * 0.58 + 30, lines.length * lh * 0.62 + 6, 900, 0.12, 22), PAPER, { alpha: 0.5 * alpha, seed: 900, dx: 0, dy: 0, shrink: 1 }));
  ctx.setTransform(env.scale, 0, 0, env.scale, 0, 0);
  let left = n;
  lines.forEach((s, i) => { let x = CAP_X - measure(s, cap, SUB) / 2; [...s].forEach((ch) => { if (left-- > 0) glyph(ctx, ch, x, CAP_Y + i * lh, cap, SUB, INK, 0.9 * alpha); x += advance(ch, SUB) * (cap / 6); }); left--; });
};
// a short ink note set anywhere (dates, the sum): the same lettering, written in
const note = (ctx: Ctx, env: Env, text: string, x: number, y: number, cap: number, n = Infinity, alpha = 1, color = INK) => {
  if (alpha <= 0) return; ctx.setTransform(env.scale, 0, 0, env.scale, 0, 0);
  let cx = x - measure(text, cap, SUB) / 2, left = n; [...text].forEach((ch) => { if (left-- > 0) glyph(ctx, ch, cx, y, cap, { ...SUB, weight: 0.12 }, color, 0.92 * alpha); cx += advance(ch, SUB) * (cap / 6); });
};

export {
  INK_M, INK, PAPER, RIBS, GABLE, CHAIRS, CLOTH, WARM, COOL, TILE, STONE, measureW,
  wet, dab, pen, ink, VP, SPRING, FLOOR, R, ZB, at, CX, arch, wallX, ZRIB, quad, BAYS,
  vault, rib, ribZone, rods, gable, gableArcs, GABLE_ZONE, wall, pillar, clockHands, floor, floorRefl, FLOOR_POLY,
  chair, chairUp, table, plant, bin, figure, POSE, LOOKS, SIGNS, caption, note, wrap, SUB, CAP_X, CAP_Y,
};
export type { J, View, Look, Seat };
