import { useEffect, useState } from 'react';
import { useNavigate } from '../navigation';
import { useTherapy, RESERVOIR_ML } from '../therapy';
import { WizardShell } from '../components/WizardShell';

/**
 * Refill · step 1 "Filling". A guided, auto-playing simulation of the physical
 * reservoir refill: initialise → needle in port → drain old fluid → fill new →
 * complete. The user only acts at the gates ("Complete refill", then "Next").
 */
type Phase = 'init' | 'ready' | 'inserting' | 'draining' | 'filling' | 'filled' | 'done';

// Auto-advance timing (ms). Gate phases ('filled', 'done') wait for a tap.
const NEXT: Partial<Record<Phase, { to: Phase; delay: number }>> = {
  init:      { to: 'ready',     delay: 1700 },
  ready:     { to: 'inserting', delay: 5200 }, // one full slow needle search, then settle
  inserting: { to: 'draining',  delay: 1600 },
  draining:  { to: 'filling',   delay: 5600 }, // stepped drain (see DRAIN_SEQ)
  filling:   { to: 'filled',    delay: 6900 }, // stepped refill (see FILL_SEQ)
};

// Fluid levels (fraction of the 40 ml reservoir) — the pump empties / fills
// monotonically in discrete pulses, each level held briefly (a "stop") before
// the next move. Reached `STEP_MS` apart, with a quick 450ms move then a short
// hold. The fill-level readout (x/40 ml) is derived from the same value, so the
// number drains to 0 and fills to 40 in lockstep with the graphic.
const STEP_MS = 650;
const START_LEVEL = 0.25; // 10/40 ml — matches the implant card before refill
const DRAIN_SEQ = [0.25, 0.19, 0.19, 0.125, 0.125, 0.06, 0.06, 0];
const FILL_SEQ = [0, 0.12, 0.12, 0.32, 0.32, 0.55, 0.55, 0.78, 0.78, 1];

const GREEN = '#24ab5e';
const BLUE = '#0094c5';

// Real B.Braun pump silhouette (ring wall + fill-port spout) from the Figma
// asset, viewBox 0 0 385 451. The reservoir interior is centred at (193, 258)
// with inner radius ~142; we draw an animated fill clipped to that circle.
const PUMP_BODY = "M380.451 216.362C376.872 199.853 372.676 182.598 364.325 169.014C353.224 150.958 340.565 132.087 323.275 116.253L309.592 98.8154L327.752 84.1063L312.791 64.8832C313.942 61.2411 314.391 56.5724 312.188 51.1444C309.353 44.1695 303.753 41.5539 300.048 39.8243C299.683 39.6555 299.333 39.4868 298.954 39.318C278.309 29.3198 255.868 19.659 232.263 10.6029C229.428 9.50608 226.874 8.42329 224.418 7.36862C215.969 3.75462 207.983 0.337494 194.637 0H194.37L189.627 0.12656H189.57C164.491 1.01248 144.338 11.7279 126.178 33.8619C116.536 45.6179 107.077 58.1755 97.9266 70.3394C85.787 86.4547 73.2403 103.133 60.2726 117.856C58.799 119.529 57.0307 121.217 55.1641 122.988C53.2976 124.76 51.3749 126.588 49.5224 128.613C37.2704 142.057 16.612 171.264 11.3632 188.87C-1.99747 233.672 -3.49913 270.487 6.45117 308.216C15.9664 344.244 35.9793 376.657 64.3145 401.955C92.6497 427.253 127.09 443.481 163.93 448.867C173.656 450.287 183.297 451.004 192.868 451.004C215.211 451.004 237.09 447.123 258.198 439.417C286.463 429.081 312.356 411.869 333.071 389.637C353.785 367.39 369.153 340.306 377.503 311.31C386.401 280.401 387.384 248.452 380.423 216.348L380.451 216.362ZM358.95 305.952C351.442 332.024 337.618 356.394 318.966 376.418C300.329 396.429 277.032 411.925 251.616 421.221C224.516 431.12 195.97 433.975 166.765 429.7C99.4563 419.857 42.5614 369.036 25.1869 303.266C16.1769 269.18 17.6365 235.613 29.9305 194.425C34.0706 180.531 53.0871 153.489 63.8373 141.691C65.2267 140.172 66.8126 138.654 68.5107 137.037C70.6018 135.04 72.7631 132.987 74.8121 130.68C88.271 115.395 101.042 98.4217 113.392 82.011C122.416 70.0159 131.763 57.613 141.138 46.1664C155.916 28.1667 170.596 20.1934 190.244 19.4903L194.426 19.3637C203.913 19.6309 209.078 21.8527 216.853 25.1714C219.351 26.2402 222.186 27.4636 225.372 28.6729C248.472 37.5321 270.408 46.9679 290.561 56.7271C290.996 56.938 291.445 57.149 291.866 57.3458C292.722 57.7536 293.887 58.288 294.364 58.6255C294.406 58.7099 294.421 58.7802 294.421 58.8224C294.364 59.0614 294.112 59.7083 293.186 61.3536L291.908 63.6035L290.715 62.127L272.766 83.1782L309.1 129.471L309.704 130.02C325.506 144.349 337.393 162.096 347.877 179.139C354.642 190.122 358.347 205.562 361.575 220.44C367.848 249.366 366.964 278.123 358.964 305.924L358.95 305.952Z";
const PUMP_PORT = "M192.822 31.0002C176.647 31.0002 163.5 43.7489 163.5 59.4331C163.5 75.1174 176.647 87.866 192.822 87.866C208.996 87.866 222.129 75.1174 222.129 59.4331C222.129 43.7489 208.982 31.0002 192.822 31.0002ZM192.822 73.6151C184.749 73.6151 178.196 67.2477 178.196 59.4331C178.196 51.6186 184.763 45.2511 192.822 45.2511C200.881 45.2511 207.447 51.6186 207.447 59.4331C207.447 67.2477 200.881 73.6151 192.822 73.6151Z";

// Pointed refill needle (viewBox 22×291.5 — bar with a tapered tip).
const NEEDLE_PATH = "M21.9999 267.5L21.9999 0L0 0L0 267.5L10.9999 291.5L21.9999 267.5Z";

// Exact Figma geometry of the "refill-cap-layout" graphic (node 7945:44165).
const BOX_W = 385;
const BOX_H = 861;
const PUMP_TOP = 410;       // pump body's top within the box
const NEEDLE_LEFT = 181.5;  // 47.14% of 385
const NEEDLE_W = 22;
// Long needle: its top is always clipped at the box's top edge (reaching it),
// while the tip travels from above the reservoir down into the port (y≈469).
const NEEDLE_H = 520;
const NEEDLE_REST_TOP = -50;          // tip at port when translateY = 0
const NEEDLE_TY_IN = 0;               // settled in port (tip at port)
const NEEDLE_TY_UP = -269;            // withdrawn (tip ~201, still meets the top edge)

// Pump-body graphic (native 385×451): animated fill clipped to the reservoir
// interior circle (cx 193.458, cy 257.857, r≈141.4), inner ring, body, port.
function GraphicBox({ fill, color, needle }: { fill: number; color: string; needle: 'search' | 'in' | 'up' }) {
  const cx = 193.458, cy = 257.857, innerR = 141.4;
  const bottom = cy + innerR;
  const fillH = fill * innerR * 2;
  const needleAnim = needle === 'search';
  const ty = needle === 'in' ? NEEDLE_TY_IN : NEEDLE_TY_UP;
  const colorTx = 'fill 600ms ease-in-out, stroke 600ms ease-in-out';
  return (
    <div className="relative overflow-hidden" style={{ width: BOX_W, height: BOX_H }}>
      <div
        className={needleAnim ? 'needle-search' : ''}
        style={{ position: 'absolute', left: NEEDLE_LEFT, top: NEEDLE_REST_TOP, width: NEEDLE_W, height: NEEDLE_H, transform: needleAnim ? undefined : `translateY(${ty}px)`, transition: 'transform 800ms ease-in-out' }}
      >
        <svg viewBox="0 0 22 291.5" preserveAspectRatio="none" fill="none" className="block size-full"><path d={NEEDLE_PATH} fill={color} style={{ transition: colorTx }} /></svg>
      </div>
      <svg className="absolute" style={{ left: 0, top: PUMP_TOP, width: BOX_W, height: 451.005 }} viewBox="0 0 385 451.005" fill="none">
        <defs><clipPath id="resClip"><circle cx={cx} cy={cy} r={innerR} /></clipPath></defs>
        <rect x="50" width="287" y={bottom - fillH} height={fillH} fill={color} clipPath="url(#resClip)" style={{ transition: 'y 450ms ease-in-out, height 450ms ease-in-out, fill 600ms ease-in-out' }} />
        <circle cx={cx} cy={cy} r="148.66" fill="none" stroke={color} strokeWidth="14.46" style={{ transition: colorTx }} />
        <path d={PUMP_BODY} fill={color} style={{ transition: colorTx }} />
        <path d={PUMP_PORT} fill={color} style={{ transition: colorTx }} />
      </svg>
    </div>
  );
}

function CheckBadge({ show }: { show: boolean }) {
  return (
    <div className="absolute left-[40px] top-[48px] size-[150px] rounded-full bg-[#24ab5e] flex items-center justify-center transition-opacity duration-[600ms]" style={{ opacity: show ? 1 : 0 }}>
      <svg width="84" height="84" viewBox="0 0 22 22" fill="none">
        <path d="M4 11.5L9 16L18 6" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

export function RefillFilling() {
  const navigate = useNavigate();
  const { flowMode, setFlowMode } = useTherapy();
  const [phase, setPhase] = useState<Phase>('init');
  const [barFull, setBarFull] = useState(false);
  const [fillLevel, setFillLevel] = useState(START_LEVEL);

  // Ensure refill chrome even if reached directly (e.g. dev jump-list).
  useEffect(() => { if (flowMode !== 'refill') setFlowMode('refill'); }, [flowMode, setFlowMode]);

  // Drive the auto-advancing phases.
  useEffect(() => {
    const step = NEXT[phase];
    if (!step) return;
    const t = setTimeout(() => setPhase(step.to), step.delay);
    return () => clearTimeout(t);
  }, [phase]);

  // Kick off the "Initializing" progress bar once mounted.
  useEffect(() => { const t = setTimeout(() => setBarFull(true), 50); return () => clearTimeout(t); }, []);

  // Stepped fluid level: drain/fill move in discrete pulses with pauses; other
  // phases hold a fixed level.
  useEffect(() => {
    if (phase === 'draining' || phase === 'filling') {
      const seq = phase === 'draining' ? DRAIN_SEQ : FILL_SEQ;
      const timers = seq.map((lvl, i) => window.setTimeout(() => setFillLevel(lvl), i * STEP_MS));
      return () => timers.forEach(clearTimeout);
    }
    if (phase === 'filled') setFillLevel(1);
    // 'done' keeps whatever level was reached when the user completed (a partial
    // refill is allowed — completion isn't gated on reaching 100%).
    else if (phase !== 'done') setFillLevel(START_LEVEL);
  }, [phase]);

  const cancel = () => { setFlowMode('setup'); navigate('home-active'); };

  const isGreen = phase === 'inserting' || phase === 'draining' || phase === 'filling' || phase === 'filled';
  const color = isGreen ? GREEN : BLUE;
  const cardBg = isGreen ? 'bg-[#d0f6e4]' : 'bg-[#e6f4f9]';
  const needle: 'search' | 'in' | 'up' = phase === 'ready' ? 'search' : phase === 'done' ? 'up' : 'in';
  const fillMl = Math.round(fillLevel * RESERVOIR_ML);
  const heading = phase === 'ready' ? 'ready to start' : isGreen ? 'needle in port' : 'needle detection deactivated';

  return (
    <WizardShell step="filling" onBack={cancel} onHelp={() => navigate('help')}>
      <div className="flex-1 flex flex-col gap-[32px]">
        {phase === 'init' && (
          <p className="font-['Roboto',sans-serif] font-bold text-[#00769e] text-[36px] tracking-[0.1px]" style={{ fontVariationSettings: "'wdth' 100" }}>
            Initializing refill
          </p>
        )}

        {phase === 'init' ? (
          <div className="border-2 border-[#65d8fe] rounded-[76px] p-[3px] w-full">
            <div className="h-[24px] rounded-[72px] transition-all duration-[1500ms] ease-out" style={{ width: barFull ? '100%' : '4%', backgroundImage: 'linear-gradient(90deg, #00769e 0%, #65d8fe 100%)' }} />
          </div>
        ) : (
          <div className={`relative w-full rounded-[24px] ${cardBg} transition-colors duration-[600ms] flex flex-col items-center px-[40px] pt-[40px] pb-[40px]`}>
            <CheckBadge show={isGreen} />
            {/* Graphic box (385×861) with the state label set to its upper-right (per Figma) */}
            <div className="relative" style={{ width: BOX_W }}>
              <GraphicBox fill={fillLevel} color={color} needle={needle} />
              <p className="absolute font-['Roboto',sans-serif] font-extrabold text-[56px] leading-[64px] tracking-[0.1px]" style={{ left: 282, top: 183, width: 380, color, transition: 'color 600ms ease-in-out', fontVariationSettings: "'wdth' 100" }}>
                {heading}
              </p>
            </div>
            {/* Fill level — 54px below the graphic */}
            <div className="flex flex-col items-center gap-[10px] w-[430px]" style={{ marginTop: 54 }}>
              <p className="font-['Roboto',sans-serif] font-normal text-[48px] leading-[56px] text-center tracking-[0.1px]" style={{ color, transition: 'color 600ms ease-in-out' }}>Fill level:</p>
              <p className="font-['Roboto',sans-serif] text-[64px] leading-[56px] text-center tracking-[0.1px]" style={{ color, transition: 'color 600ms ease-in-out', fontVariationSettings: "'wdth' 100" }}>
                <span className="font-extrabold">{fillMl}</span><span className="font-normal">/{RESERVOIR_ML} ml</span>
              </p>
            </div>
          </div>
        )}

        {/* Action button — full width */}
        <div className="mt-auto w-full">
          {(phase === 'init' || phase === 'ready') && (
            <button onClick={cancel} className="h-[88px] w-full rounded-[80px] bg-[#0094c5] cursor-pointer">
              <span className="font-['Roboto',sans-serif] font-bold text-white text-[24px] tracking-[0.1px]" style={{ fontVariationSettings: "'wdth' 100" }}>Cancel refill</span>
            </button>
          )}
          {(phase === 'inserting' || phase === 'draining') && (
            <button disabled className="h-[88px] w-full rounded-[80px] border-2 border-[#cbcbcb] cursor-not-allowed">
              <span className="font-['Roboto',sans-serif] font-bold text-[#a5a5a5] text-[24px] tracking-[0.1px]" style={{ fontVariationSettings: "'wdth' 100" }}>Complete refill</span>
            </button>
          )}
          {(phase === 'filling' || phase === 'filled') && (
            <button onClick={() => setPhase('done')} className="h-[88px] w-full rounded-[80px] bg-[#0094c5] cursor-pointer">
              <span className="font-['Roboto',sans-serif] font-bold text-white text-[24px] tracking-[0.1px]" style={{ fontVariationSettings: "'wdth' 100" }}>Complete refill</span>
            </button>
          )}
          {phase === 'done' && (
            <button onClick={() => navigate('add-medication')} className="h-[88px] w-full rounded-[80px] bg-[#0094c5] cursor-pointer">
              <span className="font-['Roboto',sans-serif] font-bold text-white text-[24px] tracking-[0.1px]" style={{ fontVariationSettings: "'wdth' 100" }}>Next</span>
            </button>
          )}
        </div>
      </div>
    </WizardShell>
  );
}
