import { LEVELS } from "./levels";
import type { GamePower, GameState, Level } from "./types";

type HudProps = {
  state: GameState; levelIndex: number; unlockedLevel: number;
  score: number; coins: number; coinGoal: number; lives: number;
  sound: boolean; onToggleSound: () => void;
};

export function GameHud(props: HudProps) {
  const { state, levelIndex, unlockedLevel, score, coins, coinGoal, lives, sound, onToggleSound } = props;
  return (
    <header className="topbar">
      <div className="brand"><span className="brand-mark">N</span><div><strong>NIKO</strong><span>y el Reino de Azúcar</span></div></div>
      <div className="hud">
        <span><small>{state === "map" ? "RUTA" : "NIVEL"}</small>{state === "map" ? unlockedLevel + 1 : levelIndex + 1}/{LEVELS.length}</span>
        <span><small>PUNTOS</small>{score.toString().padStart(6, "0")}</span>
        <span><small>ESTRELLAS</small>✦ {coins}/{coinGoal}</span>
        <span><small>VIDAS</small>{"♥".repeat(Math.max(0, lives))}</span>
      </div>
      <button className="sound" onClick={onToggleSound} aria-label={sound ? "Silenciar" : "Activar sonido"}>{sound ? "♫" : "×"}</button>
    </header>
  );
}

export function PowerBadge({ power }: { power: GamePower }) {
  if (!power) return null;
  return <div className={`power-badge power-${power.toLowerCase()}`}><span>{power === "ESCUDO" ? "◆" : "⚡"}</span>{power}</div>;
}

export function WorldMap({ unlockedLevel, onPlay }: { unlockedLevel: number; onPlay: (index: number) => void }) {
  const icons = ["✿", "☀", "◆", "♛"];
  return (
    <div className="world-map">
      <div className="map-heading"><div className="eyebrow">MAPA DEL REINO DE AZÚCAR</div><h2>Elige tu próximo mundo</h2><p>Supera cada parada para abrir el camino hacia el castillo.</p></div>
      <div className="map-route" aria-label="Ruta de niveles">
        {LEVELS.map((world, index) => {
          const locked = index > unlockedLevel;
          const completed = index < unlockedLevel;
          return (
            <button type="button" key={world.name} className={`map-stop biome-${world.biome}${completed ? " completed" : ""}`} disabled={locked} onClick={() => onPlay(index)} aria-label={locked ? `${world.name}, bloqueado` : `Jugar ${world.name}`}>
              <span className="map-node">{locked ? "🔒" : completed ? "✓" : icons[index]}</span>
              <span className="map-number">MUNDO {index + 1}</span><strong>{world.name}</strong>
              <small>{locked ? "BLOQUEADO" : completed ? "COMPLETADO · REPETIR" : "JUGAR AHORA"}</small>
            </button>
          );
        })}
      </div>
      <div className="pickup-legend" aria-label="Objetos especiales">
        <span><b className="legend-heart">♥</b> Recupera vida</span><span><b className="legend-shield">◆</b> Escudo protector</span><span><b className="legend-boost">⚡</b> Turbo y supersalto</span>
      </div>
    </div>
  );
}

export function GameOverlay({ state, score, onStart }: { state: GameState; score: number; onStart: () => void }) {
  const copy = state === "ready"
    ? { eyebrow: "CUATRO MUNDOS · UNA GRAN AVENTURA", title: <>Corre. Salta.<br/><em>Explora.</em></>, text: "Recorre el mapa del Reino de Azúcar y supera cada uno de sus biomas." }
    : state === "won"
      ? { eyebrow: "¡REINO SALVADO!", title: <>¡Misión<br/><em>cumplida!</em></>, text: `Superaste los cuatro mundos con ${score} puntos.` }
      : { eyebrow: "LA MAGIA SE AGOTÓ", title: <>Inténtalo<br/><em>otra vez.</em></>, text: `Tu puntuación fue ${score}. El reino todavía te necesita.` };
  return (
    <div className="overlay">
      <div className="eyebrow">{copy.eyebrow}</div><h1>{copy.title}</h1><p>{copy.text}</p>
      <button type="button" className="play" onClick={onStart}>{state === "ready" ? "VER EL MAPA" : "NUEVA AVENTURA"} <span>→</span></button>
      <div className="controls"><kbd>←</kbd><kbd>→</kbd> mover <kbd>ESPACIO</kbd> saltar</div>
    </div>
  );
}

export function MobileControls({ onTouch }: { onTouch: (key: string, pressed: boolean) => void }) {
  const handlers = (key: string) => ({
    onPointerDown: () => onTouch(key, true), onPointerUp: () => onTouch(key, false),
    onPointerCancel: () => onTouch(key, false), onPointerLeave: () => onTouch(key, false),
  });
  return (
    <div className="mobile-controls"><div className="move-controls">
      <button aria-label="Mover a la izquierda" {...handlers("ArrowLeft")}>←</button>
      <button aria-label="Mover a la derecha" {...handlers("ArrowRight")}>→</button>
    </div><button className="jump" aria-label="Saltar" {...handlers("Space")}>↑</button></div>
  );
}

export function GameFooter({ state, levelIndex, level }: { state: GameState; levelIndex: number; level: Level }) {
  return <footer><span>{state === "map" ? "RUTA PRINCIPAL" : `CAPÍTULO ${String(levelIndex + 1).padStart(2, "0")}`}</span><b>{state === "map" ? "MAPA DEL REINO" : level.name.toUpperCase()}</b><span>{state === "map" ? "ELIGE UN MUNDO" : level.mission.toUpperCase()}</span></footer>;
}
