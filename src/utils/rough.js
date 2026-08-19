// Tiny seeded "rough" path generators for the Excalidraw-style draw canvas.
// Everything is deterministic per seed, so a shape's scribble never changes
// while you drag it around.

// Deterministic PRNG (mulberry32) so the wobble is stable across re-renders.
const mulberry32 = (seed) => {
    let a = seed >>> 0;
    return () => {
        a |= 0;
        a = (a + 0x6d2b79f5) | 0;
        let t = Math.imul(a ^ (a >>> 15), 1 | a);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
};

// FNV-1a hash: turn any string (shape id, edge key) into a stable seed.
export const hashSeed = (str) => {
    let h = 2166136261;
    for (let i = 0; i < str.length; i += 1) {
        h ^= str.charCodeAt(i);
        h = Math.imul(h, 16777619);
    }
    return h >>> 0;
};

const rng = (seed) => {
    const rand = mulberry32(seed);
    const between = (min, max) => min + rand() * (max - min);
    return { rand, between };
};

// One wobbly edge between two points: a quadratic that bulges perpendicular
// to the straight line, plus a little endpoint jitter.
const wobblyEdge = (a, b, r, jitter, bend) => {
    const dx = b[0] - a[0];
    const dy = b[1] - a[1];
    const len = Math.hypot(dx, dy) || 1;
    const px = -dy / len;
    const py = dx / len;
    const bulge = r.between(-bend, bend);
    const cx = (a[0] + b[0]) / 2 + px * bulge + r.between(-jitter, jitter) * 0.4;
    const cy = (a[1] + b[1]) / 2 + py * bulge + r.between(-jitter, jitter) * 0.4;
    return `Q ${cx.toFixed(1)} ${cy.toFixed(1)} ${b[0].toFixed(1)} ${b[1].toFixed(1)}`;
};

// A rough connector: two slightly different passes for the classic
// rough.js double stroke. Returns [pathA, pathB].
export const roughLinePaths = (x1, y1, x2, y2, seed, opts = {}) => {
    const jitter = opts.jitter ?? 1.8;
    const bend = opts.bend ?? 2.6;
    const pass = (s) => {
        const r = rng(s);
        const a = [x1 + r.between(-jitter, jitter), y1 + r.between(-jitter, jitter)];
        const b = [x2 + r.between(-jitter, jitter), y2 + r.between(-jitter, jitter)];
        return `M ${a[0].toFixed(1)} ${a[1].toFixed(1)} ${wobblyEdge(a, b, r, jitter, bend)}`;
    };
    return [pass(seed + 0x1f), pass(seed + 0x5f)];
};

// A wobbly rectangle border, drawn twice. Corners get nudged and each edge
// bulges, which is what makes it read as hand drawn.
export const roughRectPaths = (x, y, w, h, seed, opts = {}) => {
    const scale = Math.min(w, h);
    const jitter = opts.jitter ?? Math.max(1.4, scale * 0.075);
    const bend = opts.bend ?? Math.max(1.6, scale * 0.075);
    const pass = (s) => {
        const r = rng(s);
        const corners = [
            [x + r.between(-jitter, jitter), y + r.between(-jitter, jitter)],
            [x + w + r.between(-jitter, jitter), y + r.between(-jitter, jitter)],
            [x + w + r.between(-jitter, jitter), y + h + r.between(-jitter, jitter)],
            [x + r.between(-jitter, jitter), y + h + r.between(-jitter, jitter)],
        ];
        let d = `M ${corners[0][0].toFixed(1)} ${corners[0][1].toFixed(1)}`;
        for (let i = 0; i < 4; i += 1) {
            d += ` ${wobblyEdge(corners[i], corners[(i + 1) % 4], r, jitter, bend)}`;
        }
        return `${d} Z`;
    };
    return [pass(seed + 0x91), pass(seed + 0x1d1)];
};

// Small filled arrowhead pointing right (+x), tip at (10, 5) — sized for a
// 10x10 marker box. The base is a slightly curved line so it feels sketched.
export const roughArrowHead = (seed = 0xa11ce) => {
    const r = rng(seed);
    const x = 0.8 + r.between(-0.4, 0.4);
    const y1 = 0.8 + r.between(-0.5, 0.5);
    const y2 = 9.2 + r.between(-0.5, 0.5);
    const midX = x + 0.7;
    const midY = 5 + r.between(-1.4, 1.4);
    return `M 10 5 L ${x.toFixed(1)} ${y1.toFixed(1)} Q ${midX.toFixed(1)} ${midY.toFixed(1)} ${x.toFixed(1)} ${y2.toFixed(1)} Z`;
};
