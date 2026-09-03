"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Game } from "./game/core/Game";
import { LEVELS } from "./game/levels";
import type { GameEvent, GamePower, GameState } from "./game/types";
import { GameFooter, GameHud, GameOverlay, MobileControls, PowerBadge, WorldMap } from "./game/ui";

export default function Home() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameRef = useRef<Game | null>(null);
  const [state, setState] = useState<GameState>("ready");
  const [levelIndex, setLevelIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [coins, setCoins] = useState(0);
  const [coinGoal, setCoinGoal] = useState(LEVELS[0].coins.length);
  const [lives, setLives] = useState(3);
  const [unlockedLevel, setUnlockedLevel] = useState(0);
  const [power, setPower] = useState<GamePower>("");
  const [sound, setSound] = useState(true);

  const handleGameEvent = useCallback((event: GameEvent) => {
    switch (event.type) {
      case "stateChanged": setState(event.value); break;
      case "levelChanged": setLevelIndex(event.value); setCoinGoal(event.coinGoal); break;
      case "scoreChanged": setScore(event.value); break;
      case "coinsChanged": setCoins(event.value); break;
      case "livesChanged": setLives(event.value); break;
      case "powerChanged": setPower(event.value); break;
      case "unlockedLevelChanged": setUnlockedLevel(event.value); break;
    }
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const game = new Game(canvas, handleGameEvent);
    gameRef.current = game;
    game.start();
    return () => {
      game.destroy();
      gameRef.current = null;
    };
  }, [handleGameEvent]);

  const startGame = useCallback(() => gameRef.current?.newGame(), []);
  const playLevel = useCallback((index: number) => gameRef.current?.playLevel(index), []);
  const touch = useCallback((key: string, pressed: boolean) => gameRef.current?.setTouch(key, pressed), []);
  const toggleSound = useCallback(() => {
    setSound((enabled) => {
      gameRef.current?.setSound(!enabled);
      return !enabled;
    });
  }, []);

  const level = LEVELS[levelIndex];

  return (
    <main className="game-shell">
      <GameHud state={state} levelIndex={levelIndex} unlockedLevel={unlockedLevel} score={score} coins={coins} coinGoal={coinGoal} lives={lives} sound={sound} onToggleSound={toggleSound} />
      <section className="stage" aria-label={`Nivel ${levelIndex + 1}: ${level.name}`}>
        <canvas ref={canvasRef} width={960} height={540} />
        {state === "playing" && <PowerBadge power={power} />}
        {state === "map" && <WorldMap unlockedLevel={unlockedLevel} onPlay={playLevel} />}
        {state !== "playing" && state !== "finishing" && state !== "map" && <GameOverlay state={state} score={score} onStart={startGame} />}
        {state === "playing" && <MobileControls onTouch={touch} />}
      </section>
      <GameFooter state={state} levelIndex={levelIndex} level={level} />
    </main>
  );
}
