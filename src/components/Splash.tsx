import { useEffect, useState, type ReactNode } from 'react';

// Clarisa × B. Braun Miethke start screen (Figma 13327:67678). Shown once per
// browser session over the app: the logos fade in, hold, then the whole screen
// fades away to reveal the home screen underneath. Click/tap or any key skips.
const SESSION_KEY = 'miethke-splash-seen';
const HOLD_MS = 2600; // logo fade-in + hold before the screen starts leaving
const LEAVE_MS = 700;

function readSeen() {
  try {
    return sessionStorage.getItem(SESSION_KEY) === '1';
  } catch {
    return false;
  }
}

export function Splash({ children }: { children: ReactNode }) {
  const [phase, setPhase] = useState<'showing' | 'leaving' | 'done'>(() =>
    readSeen() ? 'done' : 'showing',
  );

  useEffect(() => {
    if (phase === 'showing') {
      try {
        sessionStorage.setItem(SESSION_KEY, '1');
      } catch {
        // Storage blocked: the splash just shows again next load.
      }
      const t = setTimeout(() => setPhase('leaving'), HOLD_MS);
      const skip = () => setPhase('leaving');
      window.addEventListener('keydown', skip);
      return () => {
        clearTimeout(t);
        window.removeEventListener('keydown', skip);
      };
    }
    if (phase === 'leaving') {
      const t = setTimeout(() => setPhase('done'), LEAVE_MS);
      return () => clearTimeout(t);
    }
  }, [phase]);

  return (
    <>
      {children}
      {phase !== 'done' && (
        <div
          role="presentation"
          onClick={() => setPhase('leaving')}
          className={`splash fixed inset-0 z-50 cursor-pointer overflow-hidden ${
            phase === 'leaving' ? 'splash-leaving' : ''
          }`}
        >
          <img
            src="/splash/watermark.svg"
            alt=""
            className="splash-watermark absolute"
          />
          <div className="splash-artwork absolute flex items-center">
            <img src="/splash/clarisa-logo.svg" alt="Clarisa" className="splash-clarisa" />
            <img
              src="/splash/bbraun-miethke.svg"
              alt="B. Braun Miethke"
              className="splash-bbraun"
            />
          </div>
        </div>
      )}
    </>
  );
}
