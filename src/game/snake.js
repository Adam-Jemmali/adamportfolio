// Shared snake engine used by both the boot intro and the playable Snake game.

export const SNAKE_GRID = { COLS: 20, ROWS: 20, CELL: 20 };

export const SNAKE_SPEED = { BASE: 150, MIN: 65 };

export const initialSnake = () => [
    { x: 7, y: 10 },
    { x: 6, y: 10 },
    { x: 5, y: 10 },
    { x: 4, y: 10 },
];

// Pick a free cell for the apple.
export const spawnApple = (snake, cols = SNAKE_GRID.COLS, rows = SNAKE_GRID.ROWS) => {
    let pos;
    do {
        pos = { x: Math.floor(Math.random() * cols), y: Math.floor(Math.random() * rows) };
    } while (snake.some((s) => s.x === pos.x && s.y === pos.y));
    return pos;
};

// Advance the snake one cell in `dir`. Returns the new snake, whether it ate, and whether it died.
export const stepSnake = (snake, dir, apple, cols = SNAKE_GRID.COLS, rows = SNAKE_GRID.ROWS) => {
    const head = snake[0];
    const next = { x: head.x + dir.x, y: head.y + dir.y };

    const hitWall = next.x < 0 || next.y < 0 || next.x >= cols || next.y >= rows;
    const hitSelf = snake.some((s) => s.x === next.x && s.y === next.y);
    if (hitWall || hitSelf) return { snake, ate: false, dead: true };

    const ate = apple && next.x === apple.x && next.y === apple.y;
    const nextSnake = [next, ...snake];
    if (!ate) nextSnake.pop();
    return { snake: nextSnake, ate, dead: false };
};

// Render the board, apple, and snake onto a canvas. Colors are configurable.
export const drawSnake = (ctx, {
    snake,
    apple,
    cell,
    headColor = "#86efac",
    bodyColor = "#22c55e",
    appleColor = "#ff5f57",
    glow = false,
    grid = true,
    background = "#0b0f14",
    fadeBody = false,
} = {}) => {
    const { width, height } = ctx.canvas;

    if (background === "transparent") {
        ctx.clearRect(0, 0, width, height);
    } else {
        ctx.fillStyle = background;
        ctx.fillRect(0, 0, width, height);
    }

    if (grid) {
        const cols = Math.floor(width / cell);
        const rows = Math.floor(height / cell);
        ctx.strokeStyle = "rgba(255,255,255,0.04)";
        ctx.lineWidth = 1;
        for (let i = 1; i < cols; i++) {
            ctx.beginPath();
            ctx.moveTo(i * cell, 0);
            ctx.lineTo(i * cell, height);
            ctx.stroke();
        }
        for (let i = 1; i < rows; i++) {
            ctx.beginPath();
            ctx.moveTo(0, i * cell);
            ctx.lineTo(width, i * cell);
            ctx.stroke();
        }
    }

    if (apple) {
        ctx.save();
        if (glow) {
            ctx.shadowColor = "rgba(255, 95, 87, 0.9)";
            ctx.shadowBlur = 14;
        }
        ctx.fillStyle = appleColor;
        ctx.beginPath();
        ctx.arc(apple.x * cell + cell / 2, apple.y * cell + cell / 2, cell / 2 - 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }

    snake.forEach((seg, i) => {
        const t = i / Math.max(snake.length - 1, 1);
        ctx.globalAlpha = i === 0 ? 1 : fadeBody ? 1 - t * 0.55 : 1;
        ctx.fillStyle = i === 0 ? headColor : bodyColor;
        ctx.beginPath();
        ctx.roundRect(seg.x * cell + 1, seg.y * cell + 1, cell - 2, cell - 2, 4);
        ctx.fill();
    });
    ctx.globalAlpha = 1;
};
