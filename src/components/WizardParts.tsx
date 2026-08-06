import {
  useTherapy,
  concUgPerUl,
  coDoseUgDay,
  doseStringsFor,
  estimatedDailyTotal,
  dailyVolumeUl,
  type Interval,
} from '../therapy';
import { useRef, type ReactNode } from 'react';
import { BolusBars, PerDelAxis, HourAxis } from './TherapyHeaderChart';

const CARD_H = 214;
const BASELINE_FROM_BOTTOM = 78; // two label rows below the baseline: window times, then the hour axis
const AXIS_L = 78; // left gutter for the dose-per-delivery labels
// The base-dose bar fills this fraction of the plot; the rest is headroom the
// customised-delivery bars grow into as their dose is raised.
const BAR_BASE_FRAC = 0.6;

export type Highlight = { startMin: number; endMin: number; label?: string };

/**
 * Small blue-circle "?" help affordance. Sits inline next to a page-header title
 * by default; pass a positioning `className` (e.g. absolute corner) to place it
 * elsewhere. Click stops propagation so it works inside a clickable header row.
 */
export function HelpBadge({ onClick, className = '' }: { onClick?: () => void; className?: string }) {
  return (
    <div
      onClick={onClick ? (e) => { e.stopPropagation(); onClick(); } : undefined}
      className={`size-[44px] rounded-full bg-[#0094c5] flex items-center justify-center shrink-0 ${onClick ? 'cursor-pointer' : ''} ${className}`}
    >
      <span className="font-['Roboto',sans-serif] font-bold text-white text-[28px] leading-none" style={{ fontVariationSettings: "'wdth' 100" }}>?</span>
    </div>
  );
}

/** Smaller "i" sibling of {@link HelpBadge}, set beside a step's title. */
export function InfoBadge({ onClick }: { onClick?: () => void }) {
  return (
    <div
      onClick={onClick}
      className={`size-[36px] rounded-full bg-[#0094c5] flex items-center justify-center shrink-0 ${onClick ? 'cursor-pointer' : ''}`}
    >
      <span className="font-['Roboto',sans-serif] font-bold text-white text-[24px] leading-none" style={{ fontVariationSettings: "'wdth' 100" }}>i</span>
    </div>
  );
}

/**
 * Track-and-thumb switch used to reveal an optional section of a step (Figma
 * 10218:53206). Off is a hollow track, so a row of them reads as "nothing here
 * is set" at a glance rather than as a row of live controls.
 */
export function ToggleSwitch({ on, onChange, label }: { on: boolean; onChange: (on: boolean) => void; label?: string }) {
  return (
    <button
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={() => onChange(!on)}
      className={`relative h-[40px] w-[65px] rounded-[32px] shrink-0 cursor-pointer border-2 ${on ? 'bg-[#0094c5] border-[#0094c5]' : 'bg-white border-[#cbcbcb]'}`}
    >
      <span
        className={`absolute top-1/2 -translate-y-1/2 size-[30px] rounded-full ${on ? 'right-[4px] bg-white' : 'left-[4px] bg-[#a5a5a5]'}`}
      />
    </button>
  );
}

/**
 * Grey panel answering one "what is this?" question, opened from the `i` badge
 * beside the setting it explains. It sits in the flow rather than floating over
 * it, so opening it never covers the control the reader is asking about.
 */
export function Explainer({ title, children }: { title: string; children: ReactNode }) {
  const wdth = { fontVariationSettings: "'wdth' 100" } as const;
  return (
    <div className="bg-[#f3f5f7] rounded-[16px] flex gap-[20px] items-start px-[28px] py-[26px]">
      <div className="size-[36px] rounded-full bg-[#0094c5] flex items-center justify-center shrink-0">
        <span className="font-['Roboto',sans-serif] font-bold text-white text-[24px] leading-none" style={wdth}>i</span>
      </div>
      <div className="flex flex-col gap-[8px] flex-1 min-w-px">
        <p className="font-['Roboto',sans-serif] font-bold text-[#00769e] text-[28px] leading-[32px] tracking-[0.1px]" style={wdth}>{title}</p>
        <p className="font-['Roboto',sans-serif] font-normal text-[#6b7880] text-[24px] leading-[32px] tracking-[0.1px]" style={wdth}>{children}</p>
      </div>
    </div>
  );
}

/**
 * The redesigned 24-hour chart card (Edit Therapy flow): a white, subtly bordered
 * card with teal bolus bars, a "?" help badge, and 00:00 / 24:00 axis labels. One
 * or more `highlights` outline a dosing window with a dashed box + centred label.
 */
export function WizardChart({ highlights = [], baseOnly = false, windowsOverride }: { highlights?: Highlight[]; baseOnly?: boolean; windowsOverride?: Interval[] }) {
  const { baseDose, bolusCount, maxBoluses, intervals, medications } = useTherapy();
  // windowsOverride lets the dosing-window editor preview the in-progress dose so
  // the bars grow/shrink live as the +/- stepper changes the value.
  const barWindows = baseOnly ? [] : (windowsOverride ?? intervals);
  const unit = medications[0]?.unit ?? 'mg/ml';
  return (
    <div className="relative w-full bg-white rounded-[16px] border border-[#dbe3e8] overflow-hidden shrink-0" style={{ height: CARD_H }}>
      {/* Rough dose-per-delivery axis */}
      <PerDelAxis baseDose={baseDose} bolusCount={bolusCount} windows={barWindows} unit={unit} baseFrac={BAR_BASE_FRAC}
        barMaxH={CARD_H - BASELINE_FROM_BOTTOM - 40} left={AXIS_L} right={30} baseline={BASELINE_FROM_BOTTOM} labelSize={22} />
      {/* Plot area */}
      <div className="absolute right-[30px] top-[40px]" style={{ left: AXIS_L, bottom: BASELINE_FROM_BOTTOM }}>
        {highlights.map((hl, i) => {
          if (hl.endMin <= hl.startMin) return null;
          const left = (hl.startMin / 1440) * 100;
          const width = ((hl.endMin - hl.startMin) / 1440) * 100;
          return (
            <div
              key={i}
              className="absolute top-[-16px] bottom-0 rounded-[6px] border-2 border-dashed border-[#0094c5]"
              style={{ left: `${left}%`, width: `${width}%`, background: 'rgba(0,148,197,0.10)' }}
            />
          );
        })}
        <BolusBars baseDose={baseDose} bolusCount={bolusCount} maxBoluses={maxBoluses} windows={barWindows} maxH={CARD_H - BASELINE_FROM_BOTTOM - 40} baseFrac={BAR_BASE_FRAC} />
      </div>
      {/* Baseline */}
      <div className="absolute right-[30px] h-px bg-[#e3e6e9]" style={{ left: AXIS_L, bottom: BASELINE_FROM_BOTTOM }} />
      {/* Hour axis (the customised-window time labels are intentionally omitted). */}
      <HourAxis left={AXIS_L} right={30} />
    </div>
  );
}

/**
 * Pinned light-blue "Total 24 h" footer shown at the bottom of the Edit Therapy
 * steps: delivery count on the left, per-medication daily totals on the right.
 * Full-bleed across the 1200px canvas.
 */
export function WizardTotalsFooter({ baseOnly = false, bg = '#e6f4f9', windowsOverride }: { baseOnly?: boolean; bg?: string; windowsOverride?: Interval[] }) {
  const { baseDose, bolusCount, medications, intervals } = useTherapy();
  // Default to the context's (Monday) schedule; the dosing-window editor passes
  // the day-group it is showing so the totals always match the chart above.
  const windows = windowsOverride ?? intervals;
  const primary = medications[0];
  const c0 = primary ? concUgPerUl(primary) : 0;
  const active = baseDose > 0 && c0 > 0;
  // On the Base Dose step the dose windows haven't been applied yet, so the daily
  // total is simply the base dose. On later steps the windows raise/lower it.
  const primaryDailyUg = active ? (baseOnly ? baseDose : estimatedDailyTotal(baseDose, windows)) : 0;
  const medUgDay = (m: typeof medications[number], i: number) =>
    i === 0 ? primaryDailyUg : coDoseUgDay(primaryDailyUg, c0, concUgPerUl(m));
  const medTotal = (m: typeof medications[number], i: number) =>
    active ? doseStringsFor(medUgDay(m, i), m.unit).perDay : '--';
  const medUnit = (m: typeof medications[number]) => `${doseStringsFor(0, m.unit).unit}/d`;

  // Daily delivered volume of the reservoir mixture (µl → ml), fixed by the dose
  // regardless of how it's split into deliveries. Trim trailing zeros (1.50→1.5).
  const volMlDay = active ? dailyVolumeUl(primaryDailyUg, c0) / 1000 : 0;
  const volLabel = `${(Math.round(volMlDay * 100) / 100).toString()} ml / day`;

  const wdth = { fontVariationSettings: "'wdth' 100" } as const;
  return (
    <div className="w-[1200px] px-[80px] pt-[22px] pb-[14px] flex flex-col gap-[12px]" style={{ background: bg }}>
      {/* Header: delivery count (left) + "Total per 24 h" filled pill (right) */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-[12px]">
          <div className="border-2 border-[#0094c5] rounded-[40px] px-[26px] py-[8px]">
            <span className="font-['Roboto',sans-serif] font-bold text-[#00769e] text-[32px] tracking-[0.1px]" style={wdth}>
              {active && bolusCount > 0 ? `${bolusCount} deliveries / day` : '— deliveries / day'}
            </span>
          </div>
          <div className="border-2 border-[#0094c5] rounded-[40px] px-[26px] py-[8px]">
            <span className="font-['Roboto',sans-serif] font-bold text-[#00769e] text-[32px] tracking-[0.1px]" style={wdth}>
              {active ? volLabel : '— ml / day'}
            </span>
          </div>
        </div>
        <div className="bg-[#00769e] rounded-[40px] px-[26px] py-[8px]">
          <span className="font-['Roboto',sans-serif] font-bold text-white text-[32px] tracking-[0.1px]" style={wdth}>Total per 24 h</span>
        </div>
      </div>
      {/* Compact per-medication daily totals: name · concentration · value */}
      <div className="flex flex-col gap-[2px]">
        {medications.map((m, i) => (
          <div key={m.id} className="flex items-baseline justify-between gap-[24px]">
            <p className="whitespace-nowrap" style={wdth}>
              <span className="font-['Roboto',sans-serif] font-bold text-[#00769e] text-[32px] tracking-[0.1px]">{m.name || (i === 0 ? 'Primary' : 'Medication')}</span>
              <span className="font-['Roboto',sans-serif] font-normal text-[#5f8aa0] text-[32px] tracking-[0.1px] ml-[16px]">{m.concentration} {m.unit}</span>
            </p>
            <p className="text-right whitespace-nowrap" style={wdth}>
              <span className="font-['Roboto',sans-serif] font-bold text-[#00769e] text-[32px] tracking-[0.1px]">{medTotal(m, i)}</span> <span className="font-['Roboto',sans-serif] font-normal text-[#5f8aa0] text-[22px]">{medUnit(m)}</span>
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Gauge glyph used to title the Delivery Frequency section (matches the Help step icon). */
export function DeliveryIcon({ size = 44 }: { size?: number }) {
  return <img src="/icons/step-frequency.svg" alt="" style={{ width: size, height: size }} className="object-contain shrink-0" />;
}

/**
 * Pointer-driven slider that works under the canvas' CSS transform (native
 * <input type=range> dragging is unreliable when scaled). The value is derived
 * from getBoundingClientRect(), which reflects the transform.
 */
export function RangeSlider({ min, max, value, disabled, steps, onChange }: { min: number; max: number; value: number; disabled?: boolean; steps?: number[]; onChange: (n: number) => void }) {
  const trackRef = useRef<HTMLDivElement>(null);
  // Discrete mode: the thumb snaps to positions in `steps` (evenly spaced along
  // the track, regardless of their numeric gaps) so only valid values are picked.
  const idx = steps ? Math.max(0, steps.indexOf(value)) : 0;
  const pct = steps
    ? (steps.length > 1 ? idx / (steps.length - 1) : 1)
    : (max > min ? (value - min) / (max - min) : 1);
  const setFromX = (clientX: number) => {
    const el = trackRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const ratio = r.width > 0 ? Math.min(1, Math.max(0, (clientX - r.left) / r.width)) : 0;
    if (steps) {
      if (!steps.length) return;
      onChange(steps[Math.round(ratio * (steps.length - 1))]);
    } else {
      onChange(Math.round(min + ratio * (max - min)));
    }
  };
  return (
    <div
      ref={trackRef}
      onPointerDown={e => { if (disabled) return; e.currentTarget.setPointerCapture(e.pointerId); setFromX(e.clientX); }}
      onPointerMove={e => { if (disabled) return; if (!e.currentTarget.hasPointerCapture(e.pointerId)) return; setFromX(e.clientX); }}
      className={`relative w-full h-[44px] flex items-center select-none touch-none ${disabled ? '' : 'cursor-pointer'}`}
    >
      <div className="absolute left-0 right-0 h-[12px] rounded-full bg-[#cfe6f1]" />
      <div className="absolute left-0 h-[12px] rounded-full bg-[#0094c5]" style={{ width: `${pct * 100}%` }} />
      <div
        className="absolute size-[44px] rounded-full bg-[#0094c5] border-4 border-white -translate-x-1/2"
        style={{ left: `${pct * 100}%`, boxShadow: '0 2px 6px rgba(0,0,0,0.2)' }}
      />
    </div>
  );
}

/** Read-only light-blue value field (e.g. Deliveries / Delivery time gap). */
export function ReadoutField({ children }: { children: ReactNode }) {
  return (
    <div className="bg-[#e6f4f9] rounded-[8px] h-[72px] flex items-center px-[24px] w-full">
      <p className="font-['Roboto',sans-serif] font-bold text-[#00769e] text-[32px] tracking-[0.1px]" style={{ fontVariationSettings: "'wdth' 100" }}>{children}</p>
    </div>
  );
}

/**
 * Round − / + button flanking a numeric readout. Shared by the refill steps so
 * the alert-level and lead-time steppers are the same control.
 */
export function StepButton({ label, onClick, disabled }: { label: string; onClick: () => void; disabled: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`size-[64px] rounded-[32px] flex items-center justify-center shrink-0 ${disabled ? 'bg-[#e8eef2] cursor-not-allowed' : 'bg-[#cce4f1] cursor-pointer'}`}
    >
      <span
        className={`font-['Roboto',sans-serif] font-extrabold text-[40px] ${disabled ? 'text-[#a5a5a5]' : 'text-[#00769e]'}`}
        style={{ fontVariationSettings: "'wdth' 100" }}
      >
        {label}
      </span>
    </button>
  );
}

/**
 * Full-width teal CTA pill used at the very bottom of the Edit Therapy steps.
 * `enabledBg` overrides the enabled fill (e.g. the Review step turns it green
 * once the transfer is confirmed).
 */
export function SaveButton({ enabled = true, label = 'Save', enabledBg = '#0094c5', onClick }: { enabled?: boolean; label?: string; enabledBg?: string; onClick?: () => void }) {
  return (
    <div
      onClick={() => { if (enabled) onClick?.(); }}
      className={`flex h-[88px] items-center justify-center px-[40px] rounded-[80px] w-full ${enabled ? 'cursor-pointer' : 'bg-[#cbcbcb] cursor-not-allowed'}`}
      style={enabled ? { background: enabledBg } : undefined}
    >
      <p className={`font-['Roboto',sans-serif] font-bold leading-[32px] text-[24px] tracking-[0.1px] ${enabled ? 'text-white' : 'text-[#a5a5a5]'}`} style={{ fontVariationSettings: "'wdth' 100" }}>
        {label}
      </p>
    </div>
  );
}
