import { useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { type Speed, advance } from "./playback";

export interface Playback {
  t: number;
  clock: number;
  playing: boolean;
  speed: Speed;
  reduced: boolean;
  setT: (t: number) => void;
  setPlaying: (p: boolean) => void;
  setSpeed: (s: Speed) => void;
}

const REDUCED_STEP_MS = 1500;

// One animation loop drives both the hour of day and the particle clock
export function usePlayback(initialHour: number): Playback {
  const reduced = useReducedMotion() ?? false;
  const [t, setT] = useState(initialHour);
  const [clock, setClock] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState<Speed>(1);
  const last = useRef<number | null>(null);
  const acc = useRef(0);

  useEffect(() => {
    let raf = 0;
    const tick = (now: number) => {
      const dt = last.current === null ? 0 : Math.min(now - last.current, 100);
      last.current = now;
      if (!reduced) setClock((c) => c + dt / 1000);
      if (playing && reduced) {
        acc.current += dt * speed;
        if (acc.current >= REDUCED_STEP_MS) {
          acc.current = 0;
          setT((h) => (Math.floor(h) >= 23 ? 4 : Math.floor(h) + 1));
        }
      } else if (playing) {
        setT((h) => advance(h, dt, speed));
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      last.current = null;
    };
  }, [playing, speed, reduced]);

  return { t, clock, playing, speed, reduced, setT, setPlaying, setSpeed };
}
