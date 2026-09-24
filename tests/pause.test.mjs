import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import ts from "typescript";
import { InputManager } from "../app/game/core/InputManager.ts";

// Load the controller without creating a canvas or driving the user's game.
const source = readFileSync(new URL("../app/game/core/Game.ts", import.meta.url), "utf8");
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
const moduleExports = {};
new Function("require", "exports", compiled)(() => ({ LEVELS: [{}, {}, {}, {}] }), moduleExports);
const { Game } = moduleExports;

function controller(state = "playing") {
  const game = Object.create(Game.prototype);
  Object.assign(game, {
    state, input: { clear() {}, endStep() {} }, command: null,
    score: 900, lives: 2, coins: 3, activeLevel: 1, unlockedLevel: 2,
    levelStart: { score: 200, lives: 3 }, tick: 80,
    activePower: "TURBO", powerTimer: 120, attackTimer: 6,
    emit() {}, beep() {},
  });
  return game;
}

test("pausa congela simulación, poderes, ataques y renderizado", () => {
  const game = controller();
  game.togglePause();
  assert.equal(game.state, "paused");
  for (let i = 0; i < 120; i++) { game.update(1 / 60); game.render(i); }
  assert.equal(game.tick, 80);
  assert.equal(game.powerTimer, 120);
  assert.equal(game.attackTimer, 6);
  game.primaryAction();
  assert.equal(game.state, "paused");
  game.togglePause();
  assert.equal(game.state, "playing");
});

test("reiniciar restaura el inicio del nivel sin duplicar puntos", () => {
  const game = controller("paused");
  game.restartLevel();
  assert.deepEqual(game.command, { type: "loadLevel", index: 1 });
  assert.equal(game.score, 200);
  assert.equal(game.lives, 3);
  assert.equal(game.state, "playing");
});

test("salir descarta el intento pero conserva los mundos desbloqueados", () => {
  const game = controller("paused");
  game.returnToMap();
  assert.equal(game.state, "map");
  assert.equal(game.unlockedLevel, 2);
  assert.equal(game.score, 200);
  assert.equal(game.coins, 0);
  assert.equal(game.activePower, "");
});

test("P y Escape alternan una sola vez; perder foco limpia las teclas", () => {
  let pauses = 0, focusLost = 0;
  const input = new InputManager({ onPrimaryAction() {}, onToggleDebug() {}, onTogglePause() { pauses++; }, onFocusLost() { focusLost++; } });
  for (const code of ["KeyP", "Escape"]) {
    input.onKeyDown({ code, repeat: false, preventDefault() {} });
    input.onKeyDown({ code, repeat: true, preventDefault() {} });
  }
  assert.equal(pauses, 2);
  input.setTouch("ArrowRight", true);
  input.onFocusLost();
  assert.equal(input.isDown("ArrowRight"), false);
  assert.equal(input.wasPressed("ArrowRight"), false);
  assert.equal(focusLost, 1);
});

test("no se pausa el mapa, la victoria ni la animación de meta", () => {
  for (const state of ["ready", "map", "finishing", "won", "lost"]) {
    const game = controller(state);
    game.togglePause();
    assert.equal(game.state, state);
  }
});

test("el ataque de ratón genera un pulso y no ataca en menús", () => {
  const game = controller();
  const calls = [];
  game.input.setTouch = (...args) => calls.push(args);
  game.attack();
  assert.deepEqual(calls, [["KeyX", true], ["KeyX", false]]);
  game.state = "paused";
  game.attack();
  assert.equal(calls.length, 2);
});
