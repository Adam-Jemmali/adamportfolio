import { test } from "node:test";
import assert from "node:assert/strict";
import { initialSnake, spawnApple, stepSnake, SNAKE_GRID } from "./snake.js";

const { COLS, ROWS } = SNAKE_GRID;

test("initialSnake returns a 4-segment horizontal snake", () => {
    const snake = initialSnake();
    assert.equal(snake.length, 4);
    assert.deepEqual(snake[0], { x: 7, y: 10 });
});

test("stepSnake advances the head and keeps its length when it does not eat", () => {
    const snake = initialSnake();
    const apple = { x: 0, y: 0 };
    const result = stepSnake(snake, { x: 1, y: 0 }, apple, COLS, ROWS);

    assert.equal(result.dead, false);
    assert.equal(result.ate, false);
    assert.equal(result.snake.length, 4);
    assert.deepEqual(result.snake[0], { x: 8, y: 10 });
});

test("stepSnake grows and reports eating when the head lands on the apple", () => {
    const snake = initialSnake();
    const apple = { x: 8, y: 10 }; // one step right of the head
    const result = stepSnake(snake, { x: 1, y: 0 }, apple, COLS, ROWS);

    assert.equal(result.ate, true);
    assert.equal(result.dead, false);
    assert.equal(result.snake.length, 5);
    assert.deepEqual(result.snake[0], { x: 8, y: 10 });
});

test("stepSnake dies when the head moves out of bounds", () => {
    const snake = [{ x: COLS - 1, y: 5 }];
    const result = stepSnake(snake, { x: 1, y: 0 }, { x: 0, y: 0 }, COLS, ROWS);
    assert.equal(result.dead, true);
});

test("stepSnake dies when the head collides with its own body", () => {
    const snake = [
        { x: 5, y: 5 },
        { x: 4, y: 5 },
        { x: 3, y: 5 },
        { x: 2, y: 5 },
    ];
    const result = stepSnake(snake, { x: -1, y: 0 }, { x: 0, y: 0 }, COLS, ROWS);
    assert.equal(result.dead, true);
});

test("spawnApple never lands on the snake", () => {
    const snake = initialSnake();
    for (let i = 0; i < 50; i++) {
        const apple = spawnApple(snake, COLS, ROWS);
        assert.equal(snake.some((s) => s.x === apple.x && s.y === apple.y), false);
    }
});
