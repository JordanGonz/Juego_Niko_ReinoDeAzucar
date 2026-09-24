import { useEffect, useRef } from "react";

type Props = {
  levelName: string;
  onResume: () => void;
  onRestart: () => void;
  onExit: () => void;
};

export function PauseMenu({ levelName, onResume, onRestart, onExit }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = dialogRef.current;
    dialog?.showModal();
    return () => { dialog?.close(); };
  }, []);

  return (
    <dialog ref={dialogRef} className="pause-menu" aria-labelledby="pause-title" aria-describedby="pause-description"
      onCancel={(event) => { event.preventDefault(); onResume(); }}
      onKeyDown={(event) => {
        if (event.code === "Escape") {
          event.preventDefault(); event.stopPropagation();
          if (!event.repeat) onResume();
        }
      }}>
      <div className="eyebrow">UN RESPIRO EN LA AVENTURA</div>
      <h2 id="pause-title">Juego en pausa</h2>
      <p className="pause-level">{levelName}</p>
      <div className="pause-actions">
        <button type="button" className="pause-primary" onClick={onResume}>Continuar jugando <span>▶</span></button>
        <button type="button" onClick={onRestart}>Reiniciar nivel <span>↻</span></button>
        <button type="button" onClick={onExit}>Salir al mapa <span>⌂</span></button>
      </div>
      <p id="pause-description">Reiniciar o salir descarta este intento. Tus mundos desbloqueados se conservan.</p>
      <small><kbd>P</kbd> o <kbd>ESC</kbd> para continuar</small>
    </dialog>
  );
}
