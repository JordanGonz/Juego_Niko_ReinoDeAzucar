import type { PointerEvent } from "react";
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
        <span><small>{state === "map" || state === "atlas" ? "RUTA" : "NIVEL"}</small>{state === "map" || state === "atlas" ? unlockedLevel + 1 : levelIndex + 1}/{LEVELS.length}</span>
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

export function WorldMap({ unlockedLevel, adventure, onPlay }: { unlockedLevel: number; adventure: { visited: number[]; completed: number[]; coins: number[]; currentRegion: number }; onPlay: (index: number) => void }) {
  const icons = ["✿", "☀", "◆", "♛"];
  return (
    <div className="world-map">
      <div className="map-heading"><div className="eyebrow">ATLAS DEL REINO DE AZÚCAR</div><h2>Un reino para explorar</h2><p>Avanza a pie por los extremos de cada región. Puedes regresar; los caminos no son botones de teletransporte.</p></div>
      <div className={`map-ability ${unlockedLevel >= 2 ? "obtained" : ""}`}>
        <span aria-hidden="true">✦</span>
        {unlockedLevel >= 2 ? "SALTO DOBLE DESBLOQUEADO · Pulsa salto otra vez en el aire. Regresa a las alturas de la Pradera." :
          "PODER POR DESCUBRIR · La Salamandra guarda un movimiento que abrirá rutas anteriores."}
      </div>
      {unlockedLevel >= 3 && <div className="map-ability obtained"><span aria-hidden="true">➤</span>IMPULSO ASTRAL · Shift / C o botón en celular. Atraviesa distancias largas y vuelve por tesoros.</div>}
      <div className="map-route" aria-label="Ruta de niveles">
        {LEVELS.map((world, index) => {
          const locked = index > unlockedLevel;
          const current = index === adventure.currentRegion;
          const completed = adventure.completed.includes(index);
          const visited = adventure.visited.includes(index);
          return (
            <button type="button" key={world.name} className={`map-stop biome-${world.biome}${completed ? " completed" : ""}${current ? " current" : ""}${locked ? " locked" : ""}`} disabled={!current} onClick={() => onPlay(index)} aria-label={current ? `Continuar en ${world.name}` : `${world.name}, llega caminando`}>
              <span className="map-node">{locked ? "🔒" : icons[index]}{completed && <i aria-label="completado">✓</i>}</span>
              <span className="map-number">MUNDO {index + 1}</span><strong>{world.name}</strong>
              <small>{locked ? "POR DESCUBRIR" : `${adventure.coins[index] ?? 0}/${world.coins.length} estrellas · ${current ? "CONTINUAR AQUÍ" : completed ? "EXPLORADO" : visited ? "DESCUBIERTO" : "RUTA FUTURA"}`}</small>
            </button>
          );
        })}
      </div>
      <div className="map-ability obtained">RUTA CONTINUA · Pradera → Cañón → Grutas → Castillo. Un paso alto con doble salto une la Pradera y las Grutas.</div>
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
      <div className="controls"><kbd>←</kbd><kbd>→</kbd> mover <kbd>ESPACIO</kbd> saltar / doble salto <kbd>CLIC IZQ. / X</kbd> espada <kbd>SHIFT / C</kbd> impulso <kbd>M</kbd> mapa <kbd>P / ESC</kbd> pausa</div>
    </div>
  );
}

export function MobileControls({ onTouch, dashUnlocked }: { onTouch: (key: string, pressed: boolean) => void; dashUnlocked: boolean }) {
  const handlers = (key: string) => ({
    onPointerDown: (event: PointerEvent<HTMLButtonElement>) => {
      event.preventDefault();
      event.currentTarget.setPointerCapture(event.pointerId);
      onTouch(key, true);
    },
    onPointerUp: () => onTouch(key, false),
    onPointerCancel: () => onTouch(key, false),
    onLostPointerCapture: () => onTouch(key, false),
  });
  return (
    <div className="mobile-controls"><div className="move-controls">
      <button aria-label="Mover a la izquierda" {...handlers("ArrowLeft")}>←</button>
      <button aria-label="Mover a la derecha" {...handlers("ArrowRight")}>→</button>
    </div><div className="action-controls">
      {dashUnlocked && <button className="dash" aria-label="Impulso astral" {...handlers("KeyC")}>➤</button>}
      <button className="attack" aria-label="Atacar con espada" {...handlers("KeyX")}>⚔</button>
      <button className="jump" aria-label="Saltar" {...handlers("Space")}>↑</button>
    </div></div>
  );
}

export function GameFooter({ state, levelIndex, level }: { state: GameState; levelIndex: number; level: Level }) {
  const mapOpen = state === "map" || state === "atlas";
  return <footer><span>{mapOpen ? "RUTA PRINCIPAL" : `CAPÍTULO ${String(levelIndex + 1).padStart(2, "0")}`}</span><b>{mapOpen ? "MAPA DEL REINO" : level.name.toUpperCase()}</b><span>{mapOpen ? "CAMINA PARA EXPLORAR" : level.mission.toUpperCase()}</span></footer>;
}
