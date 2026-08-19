// LocalStorage-backed guestbook entries and a visitor counter. No backend —
// no seeded/fake entries and no fabricated starting count. The counter
// starts at 0 and grows by one per browser per calendar week.

const ENTRIES_KEY = "mj-guestbook-entries";
// v2: earlier builds seeded this with a made-up number and bumped it once
// per session. Renamed so every browser (including ones that already loaded
// this app) starts clean at 0 under the current, honest weekly-bump rule.
const VISITORS_KEY = "mj-guestbook-visitors-v2";
const WEEK_FLAG_KEY = "mj-guestbook-visited-week-v2";
const WEEK_MS = 7 * 24 * 60 * 60 * 1000;
const currentWeekBucket = () => Math.floor(Date.now() / WEEK_MS);

const readJSON = (key, fallback) => {
    try {
        const raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : fallback;
    } catch {
        return fallback;
    }
};

const writeJSON = (key, value) => {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch {
        // Storage unavailable/full — it just won't persist.
    }
};

const readEntries = () => readJSON(ENTRIES_KEY, []);

const addEntry = (name, message) => {
    const entry = {
        id: `entry-${Date.now()}`,
        name: name.trim().slice(0, 40) || "anonymous",
        message: message.trim().slice(0, 240),
        date: new Date().toISOString().slice(0, 10),
    };
    const next = [entry, ...readEntries()];
    writeJSON(ENTRIES_KEY, next);
    return next;
};

const readVisitorCount = () => readJSON(VISITORS_KEY, 0);

// Increments once per calendar week per browser — a reload or a return visit
// within the same week shouldn't count twice.
const bumpVisitorCount = () => {
    const current = readVisitorCount();
    const week = currentWeekBucket();
    if (readJSON(WEEK_FLAG_KEY, null) === week) return current;

    const next = current + 1;
    writeJSON(VISITORS_KEY, next);
    writeJSON(WEEK_FLAG_KEY, week);
    return next;
};

export { readEntries, addEntry, readVisitorCount, bumpVisitorCount };
