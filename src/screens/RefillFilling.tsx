import { useEffect, useState } from 'react';
import { useNavigate } from '../navigation';
import { useTherapy, RESERVOIR_ML, refillDateInDays } from '../therapy';
import { WizardShell } from '../components/WizardShell';
import { PUMP_BODY, PUMP_PORT, RES_CX, RES_CY, RES_R } from '../components/pumpPaths';

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
  const cx = RES_CX, cy = RES_CY, innerR = RES_R;
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
  const { flowMode, setFlowMode, setRefillDate } = useTherapy();
  const [phase, setPhase] = useState<Phase>('init');
  const [barFull, setBarFull] = useState(false);
  const [fillLevel, setFillLevel] = useState(START_LEVEL);

  // Ensure refill chrome even if reached directly (e.g. dev jump-list).
  useEffect(() => { if (flowMode !== 'refill') setFlowMode('refill'); }, [flowMode, setFlowMode]);

  // Starting a refill proposes the next due date a full-fill interval out; the
  // Refill Alert step shows it and lets the clinician override it.
  useEffect(() => { setRefillDate(refillDateInDays(78)); }, [setRefillDate]);

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
            <button onClick={() => navigate('refill-same-therapy')} className="h-[88px] w-full rounded-[80px] bg-[#0094c5] cursor-pointer">
              <span className="font-['Roboto',sans-serif] font-bold text-white text-[24px] tracking-[0.1px]" style={{ fontVariationSettings: "'wdth' 100" }}>Next</span>
            </button>
          )}
        </div>
      </div>
    </WizardShell>
  );
}
