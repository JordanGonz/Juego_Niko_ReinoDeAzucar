let sharedAudioContext: AudioContext | null = null;

function getAudioContext() {
  if (sharedAudioContext) return sharedAudioContext;
  const AudioContextClass = window.AudioContext || (window as typeof window & { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  sharedAudioContext = new AudioContextClass();
  return sharedAudioContext;
}

export function playTone(enabled: boolean, frequency: number, duration = 0.08) {
  if (!enabled) return;
  try {
    const audio = getAudioContext();
    if (audio.state === "suspended") void audio.resume();
    const osc = audio.createOscillator();
    const gain = audio.createGain();
    osc.type = "sine";
    osc.frequency.value = frequency;
    gain.gain.setValueAtTime(0.09, audio.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audio.currentTime + duration);
    osc.connect(gain).connect(audio.destination);
    osc.addEventListener("ended", () => { osc.disconnect(); gain.disconnect(); }, { once: true });
    osc.start();
    osc.stop(audio.currentTime + duration);
  } catch {}
}
