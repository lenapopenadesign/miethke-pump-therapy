import {
  useTherapy,
  concUgPerUl,
  coDoseUgDay,
  doseStringsFor,
  estimatedDailyTotal,
  dailyVolumeUl,
  fmtTime,
  splitNum,
  type Interval,
} from '../therapy';
import { Fragment, useRef, type ReactNode } from 'react';
import { BolusBars, PerDelAxis, HourAxis, SELECTED_BAR, SELECTION_BAND } from './TherapyHeaderChart';
import { readoutValueCls } from './Field';

const CARD_H = 214;
const BASELINE_FROM_BOTTOM = 78; // two label rows below the baseline: window times, then the hour axis
const AXIS_L = 78; // left gutter for the dose-per-delivery labels
// The base-dose bar fills this fraction of the plot; the rest is headroom the
// customised-delivery bars grow into as their dose is raised.
const BAR_BASE_FRAC = 0.6;

/**
 * Makes a {@link WizardChart} pickable: the plot is divided into `slotCount`
 * columns, one per delivery, and `selMin`/`selMax` mark the run currently
 * chosen. Dragging anywhere across the plot sweeps a new run; dragging either
 * handle moves that end while the other stays put. The chart owns the gesture
 * but no state — it reports the range and draws what it is told, so it and the
 * From / To fields can never disagree.
 */
export type SlotSelection = {
  slotCount: number;
  selMin: number | null;
  selMax: number | null;
  onRange: (min: number, max: number) => void;
};

/**
 * Grab handle on an edge of the selection band (Figma 10482:169938): a rounded
 * blue pill with a three-dot grip. The pill is deliberately slim, so it sits in
 * a much larger invisible target — a 14px-wide control would be unusable.
 */
function SelectionHandle({ leftPct, label, onDown, onMove, onUp }: {
  leftPct: number;
  label: string;
  onDown: (e: React.PointerEvent) => void;
  onMove: (e: React.PointerEvent) => void;
  onUp: () => void;
}) {
  return (
    <div
      role="slider"
      aria-label={label}
      onPointerDown={onDown}
      onPointerMove={onMove}
      onPointerUp={onUp}
      onPointerCancel={onUp}
      className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-[64px] h-[130px] flex items-center justify-center cursor-ew-resize touch-none z-10"
      style={{ left: `${leftPct}%` }}
    >
      <div className="w-[14px] h-[64px] rounded-full flex flex-col items-center justify-center gap-[6px]" style={{ background: SELECTED_BAR }}>
        <span className="size-[4px] rounded-full bg-white/70" />
        <span className="size-[4px] rounded-full bg-white/70" />
        <span className="size-[4px] rounded-full bg-white/70" />
      </div>
    </div>
  );
}

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

const imgWarningTriangle = "/icons/warning-triangle.svg";
// A plus glyph; turned 45° it is the dismiss cross (Figma 10482:169939).
const imgCloseCross = "/icons/close-x.svg";
// A plus rotated 45° spans √2 × its side, so this is the side length that makes
// the finished cross exactly 40px across.
const CROSS_SIDE = 40 / Math.SQRT2;

/**
 * Amber caution panel (Figma 10482:169939) — a value the pump would accept but a
 * clinician should look at twice. Pass `onDismiss` to give it a cross; leave it
 * off for notices that state a consequence rather than ask for a second look.
 */
export function WarningBanner({ title, children, onDismiss }: { title: string; children: ReactNode; onDismiss?: () => void }) {
  const wdth = { fontVariationSettings: "'wdth' 100" } as const;
  return (
    <div className="bg-[#fdf3d1] rounded-[24px] p-[24px] flex gap-[24px] items-start w-full">
      <img alt="" src={imgWarningTriangle} className="w-[41px] h-[40px] block shrink-0" />
      <div className="flex-1 min-w-px flex flex-col gap-[24px] pt-[8px]">
        <div className="flex gap-[24px] items-start">
          <p className="flex-1 min-w-px font-['Roboto',sans-serif] font-bold text-[#45483c] text-[28px] leading-[32px] tracking-[0.1px]" style={wdth}>{title}</p>
          {onDismiss && (
            <button onClick={onDismiss} aria-label="Dismiss warning" className="size-[40px] shrink-0 flex items-center justify-center cursor-pointer">
              <img alt="" src={imgCloseCross} className="block rotate-45" style={{ width: CROSS_SIDE, height: CROSS_SIDE }} />
            </button>
          )}
        </div>
        <p className="font-['Roboto',sans-serif] font-normal text-[#45483c] text-[24px] leading-[32px] tracking-[0.1px]" style={wdth}>{children}</p>
      </div>
    </div>
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
export function WizardChart({ baseOnly = false, windowsOverride, selection, height }: { baseOnly?: boolean; windowsOverride?: Interval[]; selection?: SlotSelection; height?: number }) {
  const { baseDose, bolusCount, maxBoluses, intervals, medications } = useTherapy();
  // windowsOverride lets the dosing-window editor preview the in-progress dose so
  // the bars grow/shrink live as the +/- stepper changes the value.
  const barWindows = baseOnly ? [] : (windowsOverride ?? intervals);
  const unit = medications[0]?.unit ?? 'mg/ml';
  // The pickable chart is given more room so the bars are a comfortable target.
  const cardH = height ?? CARD_H;
  const barMaxH = cardH - BASELINE_FROM_BOTTOM - 40;

  // --- Selection gesture -----------------------------------------------------
  // One model covers both ways of picking: a sweep across the plot anchors on
  // the delivery it started from, and a handle drag anchors on the opposite end
  // of the run. Everything after that is "extend from the anchor to the pointer".
  const plotRef = useRef<HTMLDivElement>(null);
  const anchorRef = useRef<number | null>(null);
  const slotCount = selection?.slotCount ?? 0;
  const slotAt = (clientX: number) => {
    const el = plotRef.current;
    if (!el || slotCount === 0) return 0;
    const r = el.getBoundingClientRect();
    // A ratio, so the canvas' CSS scale cancels out.
    const ratio = r.width > 0 ? (clientX - r.left) / r.width : 0;
    return Math.max(0, Math.min(slotCount - 1, Math.floor(ratio * slotCount)));
  };
  const extend = (to: number) => {
    const a = anchorRef.current;
    if (a == null) return;
    selection?.onRange(Math.min(a, to), Math.max(a, to));
  };
  const beginDrag = (e: React.PointerEvent, anchor: number, to: number) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    anchorRef.current = anchor;
    selection?.onRange(Math.min(anchor, to), Math.max(anchor, to));
  };
  const onDragMove = (e: React.PointerEvent) => {
    if (anchorRef.current == null) return;
    extend(slotAt(e.clientX));
  };
  const endDrag = () => { anchorRef.current = null; };

  const selMin = selection?.selMin ?? null;
  const selMax = selection?.selMax ?? null;
  const hasSel = selection != null && selMin != null && selMax != null;

  return (
    <div className="relative w-full bg-white rounded-[16px] border border-[#dbe3e8] overflow-hidden shrink-0" style={{ height: cardH }}>
      {/* Rough dose-per-delivery axis */}
      <PerDelAxis baseDose={baseDose} bolusCount={bolusCount} windows={barWindows} unit={unit} baseFrac={BAR_BASE_FRAC}
        barMaxH={barMaxH} left={AXIS_L} right={30} baseline={BASELINE_FROM_BOTTOM} labelSize={22} />
      {/* Plot area */}
      <div ref={plotRef} className="absolute right-[30px] top-[40px]" style={{ left: AXIS_L, bottom: BASELINE_FROM_BOTTOM }}>
        {/* Selection band — a plain light fill hugging the picked slots, drawn
            under the bars so it reads as ground rather than a box around them. */}
        {hasSel && (
          <div
            className="absolute top-[-16px] bottom-0 rounded-[4px]"
            style={{
              left: `${(selMin! / slotCount) * 100}%`,
              width: `${((selMax! - selMin! + 1) / slotCount) * 100}%`,
              background: SELECTION_BAND,
            }}
          />
        )}
        <BolusBars baseDose={baseDose} bolusCount={bolusCount} maxBoluses={maxBoluses} windows={barWindows} maxH={barMaxH} baseFrac={BAR_BASE_FRAC}
          slotAligned={!!selection} selMin={selMin} selMax={selMax} />

        {/* Drag surface — sweeps a run. Reaches above the tallest bar and below
            the baseline so a delivery stays grabbable at any frequency, and sits
            over the bars, which are not interactive themselves. */}
        {selection && (
          <div
            className="absolute inset-x-0 top-[-16px] bottom-[-30px] cursor-ew-resize touch-none"
            onPointerDown={e => { const i = slotAt(e.clientX); beginDrag(e, i, i); }}
            onPointerMove={onDragMove}
            onPointerUp={endDrag}
            onPointerCancel={endDrag}
          />
        )}

        {/* Handles — each anchors on the opposite end, so dragging one moves
            only its own edge. */}
        {hasSel && (
          <>
            <SelectionHandle
              leftPct={(selMin! / slotCount) * 100}
              label={`First delivery, ${fmtTime(Math.round((selMin! * 1440) / slotCount))}`}
              onDown={e => beginDrag(e, selMax!, selMin!)}
              onMove={onDragMove}
              onUp={endDrag}
            />
            <SelectionHandle
              leftPct={((selMax! + 1) / slotCount) * 100}
              label={`Last delivery, ${fmtTime(Math.round((selMax! * 1440) / slotCount))}`}
              onDown={e => beginDrag(e, selMin!, selMax!)}
              onMove={onDragMove}
              onUp={endDrag}
            />
          </>
        )}
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
export function WizardTotalsFooter({ baseOnly = false, bg = '#e6f4f9', windowsOverride, deltaFrom }: { baseOnly?: boolean; bg?: string; windowsOverride?: Interval[]; deltaFrom?: Interval[] }) {
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
  const medUnit = (m: typeof medications[number]) => `${doseStringsFor(0, m.unit).unit}/24h`;

  // What the edit in progress adds to the day, shown beside the total it lands
  // in — the editor passes the schedule as it stands without that edit. Answers
  // "how much is this costing me" without a separate line to reconcile.
  const baselinePrimaryUg = deltaFrom && active && !baseOnly ? estimatedDailyTotal(baseDose, deltaFrom) : null;
  const medDelta = (m: typeof medications[number], i: number) => {
    if (baselinePrimaryUg == null) return null;
    const before = i === 0 ? baselinePrimaryUg : coDoseUgDay(baselinePrimaryUg, c0, concUgPerUl(m));
    const diff = medUgDay(m, i) - before;
    const d = doseStringsFor(Math.abs(diff), m.unit);
    // Below the unit's own resolution there is nothing to report.
    if (parseFloat(d.perDay) === 0) return null;
    return `${diff > 0 ? '+' : '−'}${d.perDay} ${d.unit}`;
  };

  // Daily delivered volume of the reservoir mixture (µl → ml), fixed by the dose
  // regardless of how it's split into deliveries. Trim trailing zeros (1.50→1.5).
  const volMlDay = active ? dailyVolumeUl(primaryDailyUg, c0) / 1000 : 0;
  const volLabel = `${(Math.round(volMlDay * 100) / 100).toString()} ml / 24h`;

  const wdth = { fontVariationSettings: "'wdth' 100" } as const;
  return (
    <div className="w-[1200px] px-[80px] pt-[22px] pb-[14px] flex flex-col gap-[12px]" style={{ background: bg }}>
      {/* Header: delivery count (left) + "Total per 24 h" filled pill (right) */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-[12px]">
          <div className="border-2 border-[#0094c5] rounded-[40px] px-[26px] py-[8px]">
            <span className="font-['Roboto',sans-serif] font-bold text-[#00769e] text-[32px] tracking-[0.1px]" style={wdth}>
              {active && bolusCount > 0 ? `${bolusCount} deliveries / 24h` : '— deliveries / 24h'}
            </span>
          </div>
          <div className="border-2 border-[#0094c5] rounded-[40px] px-[26px] py-[8px]">
            <span className="font-['Roboto',sans-serif] font-bold text-[#00769e] text-[32px] tracking-[0.1px]" style={wdth}>
              {active ? volLabel : '— ml / 24h'}
            </span>
          </div>
        </div>
        <div className="bg-[#00769e] rounded-[40px] px-[26px] py-[8px]">
          <span className="font-['Roboto',sans-serif] font-bold text-white text-[32px] tracking-[0.1px]" style={wdth}>Total per 24 h</span>
        </div>
      </div>
      {/* Compact per-medication daily totals: name · concentration · value.
          One grid for every medication rather than a row each, so the columns
          size themselves to the widest entry: the totals' decimal points land on
          a single x and the units end flush right, whatever the digits do. The
          integer and fraction sit in adjacent columns with no gap between them,
          so "15.0" still reads as one number. */}
      <div className="grid items-baseline gap-y-[2px] [grid-template-columns:1fr_auto_auto_auto_auto]">
        {medications.map((m, i) => {
          const [ip, fp] = splitNum(medTotal(m, i));
          const delta = medDelta(m, i);
          return (
          <Fragment key={m.id}>
            <p className="whitespace-nowrap" style={wdth}>
              <span className="font-['Roboto',sans-serif] font-bold text-[#00769e] text-[32px] tracking-[0.1px]">{m.name || (i === 0 ? 'Primary' : 'Medication')}</span>
              <span className="font-['Roboto',sans-serif] font-normal text-[#5f8aa0] text-[32px] tracking-[0.1px] ml-[16px]">{m.concentration} {m.unit}</span>
            </p>
            {/* The day's total per medication is what the footer is for, so it
                is set a size above the name and concentration beside it — and,
                while an edit is open, what that edit contributes to it. */}
            <span className={`font-['Roboto',sans-serif] font-bold text-[#b3850e] text-[32px] tracking-[0.1px] whitespace-nowrap ${delta ? 'px-[24px]' : ''}`} style={wdth}>{delta}</span>
            <span className="font-['Roboto',sans-serif] font-bold text-[#00769e] text-[44px] leading-[52px] tracking-[0.1px] text-right" style={wdth}>{ip}</span>
            <span className="font-['Roboto',sans-serif] font-bold text-[#00769e] text-[44px] leading-[52px] tracking-[0.1px]" style={wdth}>{fp && `.${fp}`}</span>
            <span className="font-['Roboto',sans-serif] font-normal text-[#5f8aa0] text-[26px] text-right ml-[10px]" style={wdth}>{medUnit(m)}</span>
          </Fragment>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Icon + bold teal title naming a section of a step (Figma 10482:169916 /
 * 10482:169922). Every block that opens with a heading uses this, so the steps
 * and the sheets that sit over them read at the same level. `children` are laid
 * out after the title — a badge beside it, or an `ml-auto` note pushed right.
 */
export function SectionHeader({ icon, title, children, className = '' }: { icon: ReactNode; title: string; children?: ReactNode; className?: string }) {
  return (
    <div className={`flex gap-[16px] items-center ${className}`}>
      {icon}
      <p className="font-['Roboto',sans-serif] font-bold leading-[40px] text-[#00769e] text-[36px] tracking-[0.1px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
        {title}
      </p>
      {children}
    </div>
  );
}

/** Bar-chart glyph titling the Customised Delivery section, on either step. */
export function WindowsIcon({ size = 44 }: { size?: number }) {
  return <img src="/icons/windows-bars.svg" alt="" style={{ width: size, height: size }} className="block shrink-0" />;
}

/**
 * Forward arrow on the "Customise deliveries" button. The exported glyph is a
 * wide 40 × 25 arrow, so it is drawn at that ratio inside the 40px icon box
 * rather than stretched to fill it.
 */
export function ArrowForward({ size = 40 }: { size?: number }) {
  return (
    <div className="relative shrink-0 overflow-clip" style={{ width: size, height: size }}>
      <img src="/icons/arrow-forward.svg" alt="" className="absolute left-0 block" style={{ width: size, height: size * 0.6239, top: size * 0.2 }} />
    </div>
  );
}

/**
 * Calendar glyph titling the Refill Date step and its Review section (Figma
 * "calendar" icon, 2340:27709). The exported glyph is 27 × 28 and Figma insets
 * it 17.5%/15% inside its icon box, so it is drawn at that ratio rather than
 * stretched to fill the box.
 */
export function CalendarIcon({ size = 56 }: { size?: number }) {
  return (
    <div className="relative shrink-0 overflow-clip" style={{ width: size, height: size }}>
      <img
        src="/icons/step-refill-date.svg" alt=""
        className="absolute block"
        style={{ width: size * 0.675, height: size * 0.7, left: size * 0.175, top: size * 0.15 }}
      />
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
      <p className={readoutValueCls} style={{ fontVariationSettings: "'wdth' 100" }}>{children}</p>
    </div>
  );
}

/**
 * Round − / + button flanking a numeric readout. Shared by the refill steps so
 * the alert-level and lead-time steppers are the same control.
 */
export function StepButton({ label, onClick, disabled, ariaLabel }: { label: string; onClick: () => void; disabled: boolean; ariaLabel?: string }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
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
