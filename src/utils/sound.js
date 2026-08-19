// Shared tiny synthesized sounds for Trappie and the OS. No audio assets
// needed — everything is generated with the Web Audio API. Every sound is
// gated by the Trappie mute toggle (localStorage "trappie-sounds-muted"),
// which the tour writes and any component can honor.

let audioCtx = null;
let mutedOverride = null;

// The tour is the source of truth for the mute toggle while it's mounted.
// Until it sets an override we fall back to the persisted preference.
export const setSoundMuted = (value) => {
    mutedOverride = value;
};

export const getStoredMute = () => {
    try {
        return localStorage.getItem("trappie-sounds-muted") === "1";
    } catch {
        return false;
    }
};

const isMuted = () => (mutedOverride === null ? getStoredMute() : mutedOverride);

const getCtx = () => {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return null;
    if (!audioCtx) audioCtx = new AudioCtx();
    if (audioCtx.state === "suspended") audioCtx.resume();
    return audioCtx;
};

// A soft blip for the tour icon pop and small UI ticks.
export const playTick = () => {
    if (isMuted()) return;
    try {
        const ctx = getCtx();
        if (!ctx) return;
        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(820, now);
        osc.frequency.exponentialRampToValueAtTime(1260, now + 0.08);
        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.exponentialRampToValueAtTime(0.1, now + 0.012);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.2);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.22);
    } catch {
        // Audio unavailable — everything stays silent.
    }
};

// A quick rising two-note chirp for the tour outro.
export const playChirp = () => {
    if (isMuted()) return;
    try {
        const ctx = getCtx();
        if (!ctx) return;
        const now = ctx.currentTime;
        const note = (freq, start, dur) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = "sine";
            osc.frequency.setValueAtTime(freq, now + start);
            osc.frequency.exponentialRampToValueAtTime(freq * 1.35, now + start + dur * 0.6);
            gain.gain.setValueAtTime(0.0001, now + start);
            gain.gain.exponentialRampToValueAtTime(0.09, now + start + 0.012);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + start + dur);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(now + start);
            osc.stop(now + start + dur + 0.02);
        };
        note(660, 0, 0.12);
        note(990, 0.09, 0.18);
    } catch {
        // Audio unavailable — Trappie stays quiet.
    }
};

// A soft airy sweep for hops and reordering.
export const playWhoosh = () => {
    if (isMuted()) return;
    try {
        const ctx = getCtx();
        if (!ctx) return;
        const now = ctx.currentTime;
        const length = Math.floor(ctx.sampleRate * 0.26);
        const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < length; i += 1) {
            data[i] = (Math.random() * 2 - 1) * (1 - i / length);
        }
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        const filter = ctx.createBiquadFilter();
        filter.type = "bandpass";
        filter.Q.value = 1.1;
        filter.frequency.setValueAtTime(340, now);
        filter.frequency.exponentialRampToValueAtTime(1500, now + 0.14);
        filter.frequency.exponentialRampToValueAtTime(300, now + 0.26);
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.exponentialRampToValueAtTime(0.07, now + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.26);
        source.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        source.start(now);
        source.stop(now + 0.28);
    } catch {
        // Audio unavailable — Trappie stays quiet.
    }
};

// A short soft blip for drawing connections and placing shapes.
export const playClick = () => {
    if (isMuted()) return;
    try {
        const ctx = getCtx();
        if (!ctx) return;
        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(520, now);
        osc.frequency.exponentialRampToValueAtTime(340, now + 0.06);
        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.exponentialRampToValueAtTime(0.08, now + 0.008);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.14);
    } catch {
        // Audio unavailable — still clicks along silently.
    }
};