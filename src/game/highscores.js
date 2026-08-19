// Shared high-score helpers for the High Scores app and every game that wants
// to report a personal best. Existing games keep their own legacy localStorage
// keys so nothing about their UI or animation changes — the leaderboard just
// reads those keys, plus the new Imposter MAFIA key.
//
// On top of the single best, we keep a short per-game history of every finished
// run so the High Scores app can show recent scores, total plays, and streaks.

const HISTORY_KEY = "mj-game-history";
const HISTORY_LIMIT = 25;

const readNumber = (key) => {
    try {
        const value = Number(localStorage.getItem(key));
        return Number.isFinite(value) ? Math.max(0, value) : 0;
    } catch {
        return 0;
    }
};

// Dev Quiz stores a best per category/difficulty; the leaderboard shows its
// single highest result across all of them.
const readPopQuizBest = () => {
    try {
        const bests = JSON.parse(localStorage.getItem("mj-popquiz-bests")) || {};
        return Object.values(bests).reduce((max, value) => {
            const n = Number(value);
            return Number.isFinite(n) ? Math.max(max, n) : max;
        }, 0);
    } catch {
        return 0;
    }
};

export const GAME_SCORES = [
    { id: "snake", name: "Snake", unit: "points", accent: "#4ade80", read: () => readNumber("mj-snake-high") },
    { id: "code", name: "Code Racer", unit: "points", accent: "#67e8f9", read: () => readNumber("mj-code-high") },
    { id: "popquiz", name: "Dev Quiz", unit: "points", accent: "#fbbf24", read: readPopQuizBest },
    { id: "mafia", name: "Imposter MAFIA", unit: "points", accent: "#c084fc", read: () => readNumber("mj-mafia-high") },
];

export const readHighScores = () =>
    GAME_SCORES.map((game) => ({ ...game, score: game.read() })).sort((a, b) => b.score - a.score);

export const readHighScore = (key) => readNumber(key);

export const recordHighScore = (key, value) => {
    const score = Math.max(0, Math.round(value));
    const best = Math.max(readNumber(key), score);
    try {
        localStorage.setItem(key, String(best));
    } catch {
        // Storage unavailable — the score simply won't persist.
    }
    return best;
};

const readHistory = () => {
    try {
        const parsed = JSON.parse(localStorage.getItem(HISTORY_KEY)) || {};
        return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
    } catch {
        return {};
    }
};

const writeHistory = (history) => {
    try {
        localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    } catch {
        // Storage unavailable — history simply won't persist.
    }
};

// Record one finished run. History is newest-first and capped so the stored
// payload stays tiny no matter how long someone plays.
export const recordGameResult = (gameId, score, meta = {}) => {
    const value = Math.max(0, Math.round(score));
    const history = readHistory();
    const previous = Array.isArray(history[gameId]) ? history[gameId] : [];
    const next = [{ score: value, ts: Date.now(), ...meta }, ...previous].slice(0, HISTORY_LIMIT);
    writeHistory({ ...history, [gameId]: next });
    return next;
};

export const getGameHistory = (gameId) => {
    const history = readHistory();
    return Array.isArray(history[gameId]) ? history[gameId] : [];
};

export const getGameStats = (gameId) => {
    const game = GAME_SCORES.find((g) => g.id === gameId);
    const best = game ? game.read() : 0;
    const entries = getGameHistory(gameId);

    // Games played before history was added have a best but no runs on record.
    // Synthesize a single "best" entry so their history isn't a blank wall.
    const hasHistory = entries.length > 0;
    const list = hasHistory ? entries : best > 0 ? [{ score: best, ts: null, synth: true }] : [];
    const scores = list.map((entry) => entry.score);

    let currentStreak = 0;
    for (const score of scores) {
        if (score > 0) currentStreak += 1;
        else break;
    }

    let bestStreak = 0;
    let run = 0;
    for (const score of scores) {
        if (score > 0) {
            run += 1;
            bestStreak = Math.max(bestStreak, run);
        } else {
            run = 0;
        }
    }

    return {
        best,
        plays: hasHistory ? entries.length : best > 0 ? 1 : 0,
        recent: list.slice(0, 6),
        currentStreak,
        bestStreak,
        hasHistory,
    };
};
