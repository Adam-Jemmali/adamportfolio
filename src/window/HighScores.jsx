import { useEffect, useState } from "react";
import WindowsControls from "#components/WindowsControls.jsx";
import { Frog } from "#components/AppMascots.jsx";
import WindowWrapper from "#hoc/WindowWrapper.jsx";
import useWindowStore from "#store/window.js";
import { GAME_SCORES, getGameStats, readHighScores } from "#game/highscores.js";

const MEDALS = ["🥇", "🥈", "🥉"];

const formatWhen = (ts) => {
    if (!ts) return "best on record";
    const delta = Date.now() - ts;
    if (delta < 60_000) return "just now";
    if (delta < 3_600_000) return `${Math.max(1, Math.round(delta / 60_000))}m ago`;
    if (delta < 86_400_000) return `${Math.round(delta / 3_600_000)}h ago`;
    return `${Math.round(delta / 86_400_000)}d ago`;
};

const HighScores = () => {
    // Subscribing to the focused window means this component re-renders (and
    // therefore re-reads the leaderboard) every time the window regains focus,
    // so a best earned in another window appears the moment you look here.
    const focusedWindow = useWindowStore((s) => s.focusedWindow);
    const isFocused = focusedWindow === "highscores";
    const [expandedId, setExpandedId] = useState(null);

    // Cross-tab safety: another tab recording a score fires `storage`, which
    // nudges this component to re-read the same persisted values.
    const [storageTick, setStorageTick] = useState(0);
    useEffect(() => {
        const onStorage = () => setStorageTick((n) => n + 1);
        window.addEventListener("storage", onStorage);
        return () => window.removeEventListener("storage", onStorage);
    }, []);

    const scores = readHighScores();
    const stats = Object.fromEntries(GAME_SCORES.map((game) => [game.id, getGameStats(game.id)]));
    const totalGames = GAME_SCORES.length;
    const played = scores.filter((s) => s.score > 0).length;
    const top = scores[0];

    return (
        <>
            <div id="window-header">
                <WindowsControls target="highscores" />
                <h2><Frog />High Scores</h2>
            </div>

            <div className={`highscores-body ${isFocused ? "is-focused" : ""}`} data-tick={storageTick}>
                <div className="highscores-hero">
                    <span className="highscores-crown">🏆</span>
                    <div>
                        <h3>{played > 0 ? `${top.name} leads the lobby` : "No scores yet"}</h3>
                        <p>
                            {played > 0
                                ? `${played} of ${totalGames} games played, best ${top.score} ${top.unit}`
                                : "Play any game and your best score will show up here."}
                        </p>
                    </div>
                </div>

                <ol className="highscores-list">
                    {scores.map((game, i) => {
                        const gameStats = stats[game.id];
                        const expanded = expandedId === game.id;
                        return (
                            <li
                                key={game.id}
                                className={`highscore-row ${game.score > 0 ? "has-score" : "is-empty"} ${expanded ? "is-open" : ""}`}
                            >
                                <button
                                    type="button"
                                    className="highscore-main"
                                    onClick={() => setExpandedId(expanded ? null : game.id)}
                                    aria-expanded={expanded}
                                >
                                    <span className="highscore-rank">{MEDALS[i] ?? i + 1}</span>
                                    <span className="highscore-game">
                                        <span className="highscore-dot" style={{ background: game.accent }} />
                                        {game.name}
                                    </span>
                                    <span className="highscore-value">
                                        {game.score > 0 ? (
                                            <>
                                                <b>{game.score.toLocaleString()}</b>
                                                <small>{game.unit}</small>
                                            </>
                                        ) : (
                                            <small className="highscore-none">no score yet</small>
                                        )}
                                    </span>
                                    <span className={`highscore-chevron ${expanded ? "is-open" : ""}`}>▾</span>
                                </button>

                                {expanded && (
                                    <div className="highscore-detail">
                                        <div className="highscore-metrics">
                                            <span>plays <b>{gameStats.plays}</b></span>
                                            <span>best <b>{gameStats.best.toLocaleString()}</b></span>
                                            <span className="highscore-streak-stat">
                                                🔥 streak <b>{gameStats.currentStreak}</b>
                                            </span>
                                            <span>best streak <b>{gameStats.bestStreak}</b></span>
                                        </div>

                                        <div className="highscore-history" aria-label={`${game.name} recent scores`}>
                                            {gameStats.recent.length > 0 ? (
                                                gameStats.recent.map((entry, idx) => (
                                                    <span
                                                        key={`${entry.ts ?? "best"}-${idx}`}
                                                        className={`history-chip ${entry.score === gameStats.best ? "is-best" : ""} ${entry.score === 0 ? "is-zero" : ""}`}
                                                        title={`${entry.score} ${game.unit}, ${formatWhen(entry.ts)}`}
                                                    >
                                                        {entry.score}
                                                    </span>
                                                ))
                                            ) : (
                                                <span className="history-none">No runs yet — go set a score.</span>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </li>
                        );
                    })}
                </ol>

                <p className="highscores-foot">
                    🏆 Click a game to see its history and streaks.
                </p>
            </div>
        </>
    );
};

const HighScoresWindow = WindowWrapper(HighScores, "highscores");
export default HighScoresWindow;
