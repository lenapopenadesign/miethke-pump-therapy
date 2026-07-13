import {
  useTherapy,
  concUgPerUl,
  coDoseUgDay,
  doseStringsFor,
  estimatedDailyTotal,
  fmtTime,
  type Interval,
} from '../therapy';

/**
 * The teal "Total 24 h" band: running bolus count + per-medication daily totals.
 * Used at the top of Base Dose / Frequency / Windows and pinned at the bottom of
 * the Review page. Fills its parent's width (full-bleed when the parent is the
 * 1200px canvas).
 */
export function TherapyTotalsBand() {
  const { baseDose, bolusCount, medications, intervals } = useTherapy();
  const windows = intervals; // shared schedule (every day identical)
  const primary = medications[0];
  const c0 = primary ? concUgPerUl(primary) : 0;
  const active = baseDose > 0 && c0 > 0;

  // Per-med daily totals, each in the unit its concentration implies (so the
  // unit chosen on the Medication page is reflected here). Windows raise/lower
  // the primary mass; co-meds scale with the shared delivered volume.
  const primaryDailyUg = active ? estimatedDailyTotal(baseDose, windows) : 0;
  const medUgDay = (m: typeof medications[number], i: number) =>
    i === 0 ? primaryDailyUg : coDoseUgDay(primaryDailyUg, c0, concUgPerUl(m));
  const medTotal = (m: typeof medications[number], i: number) =>
    active ? doseStringsFor(medUgDay(m, i), m.unit).perDay : '--';
  const medUnit = (m: typeof medications[number]) =>
    `${doseStringsFor(0, m.unit).unit}/day`;

  return (
    <div className="w-full bg-[#00769e] flex items-start justify-between px-[80px] pt-[28px] pb-[24px]">
      <div className="flex flex-col gap-[8px]">
        <p className="font-['Roboto',sans-serif] font-bold leading-[38px] text-white text-[36px] tracking-[0.1px]" style={{ fontVariationSettings: "'wdth' 100" }}>
          Total 24 h
        </p>
        <p className="font-['Roboto',sans-serif] font-normal text-[#cce4ee] text-[24px] tracking-[0.1px]" style={{ fontVariationSettings: "'wdth' 100" }}>
          {active && bolusCount > 0 ? `${bolusCount} boluses` : '— boluses'}
        </p>
      </div>
      <div className="flex flex-col items-end gap-[6px]">
        {medications.map((m, i) => (
          <div key={m.id} className="flex items-baseline gap-[24px] whitespace-nowrap">
            <p className={`font-['Roboto',sans-serif] text-right text-white tracking-[0.1px] ${i === 0 ? 'font-bold text-[32px]' : 'font-normal text-[32px]'}`} style={{ fontVariationSettings: "'wdth' 100" }}>
              {m.name || (i === 0 ? 'Primary' : 'Medication')}
            </p>
            <p className={`font-['Roboto',sans-serif] text-right text-white tracking-[0.1px] ${i === 0 ? 'font-bold text-[32px]' : 'font-normal text-[32px]'}`} style={{ fontVariationSettings: "'wdth' 100" }}>
              {medTotal(m, i)} {medUnit(m)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Pinned therapy header used on Base Dose, Frequency and Dosing Windows: the
 * totals band plus a 24-hour bolus chart that develops as the base dose is
 * entered. The chart draws one bar per delivered bolus, evenly spaced; a bar's
 * height tracks the dose rate at that time, so dosing windows show up as taller
 * (raised) or shorter (lowered) runs. `highlight` outlines a time span (the
 * window being edited) with a dashed box + label.
 */
export function TherapyHeaderChart({ highlight }: { highlight?: { startMin: number; endMin: number } | null }) {
  const { baseDose, bolusCount, maxBoluses, intervals, medications } = useTherapy();
  return (
    <div className="w-[1200px] shrink-0">
      <TherapyTotalsBand />
      {/* 24-hour view */}
      <div className="bg-[#00769e] px-[80px] pb-[40px]">
        <p className="font-['Roboto',sans-serif] font-bold text-white text-[28px] tracking-[0.1px] mb-[12px]" style={{ fontVariationSettings: "'wdth' 100" }}>
          24-hour view
        </p>
        <BolusChart baseDose={baseDose} bolusCount={bolusCount} maxBoluses={maxBoluses} windows={intervals} unit={medications[0]?.unit ?? 'mg/ml'} highlight={highlight} />
      </div>
    </div>
  );
}

const CARD_H = 240;
const BASELINE_FROM_BOTTOM = 52; // room for the axis labels under the bars
const MAX_BARS = 80;             // cap rendered bars so dense schedules stay legible

/** Dose rate (µg/h) at a given minute: a covering window's rate, else the base. */
function rateAt(min: number, baseRate: number, windows: Interval[]): number {
  const w = windows.find(iv => min >= iv.startMin && min < iv.endMin);
  return w ? w.dose / 24 : baseRate;
}

// The schedule's peak delivery reaches this fraction of the plot height, so the
// highest delivery is always on-chart (and windows stay visible at any frequency).
const PEAK_FRAC = 0.9;

/**
 * The bolus "strokes": one fixed-width bar per delivered bolus, evenly spaced
 * across the day. Bars are normalised to the schedule's peak dose — the tallest
 * reaches PEAK_FRAC of `maxH`, the rest scale in proportion — so dosing windows
 * read as taller runs and the profile fills the chart at any delivery frequency.
 * Place inside a relative, bottom-anchored box of height `maxH`.
 */
export function BolusBars({
  baseDose, bolusCount, windows, maxH = 150, minH = 10, barWidth = 9, baseFrac,
}: {
  baseDose: number;
  bolusCount: number;
  maxBoluses?: number; // accepted for call-site compatibility; no longer used
  windows: Interval[];
  nominalH?: number;   // accepted for call-site compatibility; no longer used
  maxH?: number;
  minH?: number;
  barWidth?: number;
  // When set, the base-dose bar is a FIXED fraction of maxH (leaving headroom
  // above) and windows grow into that headroom — so raising one window's dose
  // grows only its bars instead of renormalising (shrinking) all the others.
  // When unset, bars normalise to the schedule's peak (fills the chart).
  baseFrac?: number;
}) {
  const baseRate = baseDose / 24;
  const n = baseDose > 0 && bolusCount > 0 ? Math.min(bolusCount, MAX_BARS) : 0;
  const maxDoseUg = Math.max(baseDose, ...windows.map(w => w.dose), 0);
  const bars = Array.from({ length: n }, (_, i) => {
    const midMin = ((i + 0.5) / n) * 1440;
    const rateDaily = rateAt(midMin, baseRate, windows) * 24; // daily-equivalent µg at this time
    const h = baseFrac != null
      ? (baseDose > 0 ? (rateDaily / baseDose) * baseFrac : 0) * maxH // base → baseFrac; windows scale above
      : (maxDoseUg > 0 ? rateDaily / maxDoseUg : 0) * (PEAK_FRAC * maxH); // normalise to peak
    return Math.max(minH, Math.min(maxH, h));
  });
  return (
    <div className="absolute inset-0 flex items-end justify-between">
      {bars.map((h, i) => (
        <div key={i} className="shrink-0 rounded-[3px] bg-[#0094c5]" style={{ width: barWidth, height: h }} />
      ))}
    </div>
  );
}

/**
 * A rough dose-per-delivery axis, matched to the normalised bars: the top gridline
 * sits at the schedule's peak delivery (always shown, however high), with 1–2 more
 * gridlines below at proportional doses. `barMaxH` is the bars' `maxH`; `left`/
 * `right` are the plot insets and `baseline` the px from the card bottom.
 */
export function PerDelAxis({
  baseDose, bolusCount, windows, unit, barMaxH, left, right, baseline, labelSize = 18, baseFrac,
}: {
  baseDose: number; bolusCount: number; windows: Interval[]; unit: string; barMaxH: number;
  left: number; right: number; baseline: number; labelSize?: number; baseFrac?: number;
}) {
  const bolusN = Math.max(1, bolusCount);
  const maxDoseUg = Math.max(baseDose, ...windows.map(w => w.dose), 0);
  if (!(maxDoseUg > 0)) return null;
  // With a fixed base reference the plot top is base ÷ baseFrac (base sits at
  // baseFrac height, headroom above); otherwise the top is the schedule peak.
  const maxPerDelUg = baseFrac != null ? (baseDose / baseFrac) / bolusN : maxDoseUg / bolusN;
  const top = baseFrac != null ? barMaxH : PEAK_FRAC * barMaxH;
  const gap = labelSize + 10;             // min spacing between tick labels
  const fracs = top >= 3 * gap ? [1, 2 / 3, 1 / 3] : top >= 2 * gap ? [1, 1 / 2] : [1];
  const wdth = { fontVariationSettings: "'wdth' 100" } as const;
  return (
    <>
      <p className="absolute font-['Roboto',sans-serif] text-[#9ea8b2]" style={{ left: 8, top: 4, fontSize: labelSize, ...wdth }}>
        {doseStringsFor(0, unit).unit}/del
      </p>
      {fracs.map((f, i) => (
        <div key={i}>
          <div className="absolute border-t border-dashed" style={{ left, right, bottom: baseline + f * top, borderColor: '#e6eaed' }} />
          <p className="absolute text-right font-['Roboto',sans-serif] text-[#9ea8b2]" style={{ left: 0, width: left - 8, bottom: baseline + f * top - Math.round(labelSize * 0.55), fontSize: labelSize, ...wdth }}>
            {doseStringsFor(maxPerDelUg * f, unit).perDay}
          </p>
        </div>
      ))}
    </>
  );
}

const AXIS_L = 78; // left gutter for the dose-per-delivery labels

function BolusChart({
  baseDose, bolusCount, maxBoluses, windows, unit, highlight,
}: {
  baseDose: number;
  bolusCount: number;
  maxBoluses: number;
  windows: Interval[];
  unit: string;
  highlight?: { startMin: number; endMin: number } | null;
}) {
  const hl = highlight && highlight.endMin > highlight.startMin ? highlight : null;
  const hlLeft = hl ? (hl.startMin / 1440) * 100 : 0;
  const hlWidth = hl ? ((hl.endMin - hl.startMin) / 1440) * 100 : 0;
  const hlCenter = hlLeft + hlWidth / 2;
  const endDisplay = hl ? (hl.endMin >= 1440 ? '24:00' : fmtTime(hl.endMin)) : '';

  return (
    <div className="relative w-full bg-white rounded-[16px] overflow-hidden" style={{ height: CARD_H }}>
      {/* Rough dose-per-delivery axis */}
      <PerDelAxis baseDose={baseDose} bolusCount={bolusCount} windows={windows} unit={unit}
        barMaxH={CARD_H - BASELINE_FROM_BOTTOM - 24} left={AXIS_L} right={30} baseline={BASELINE_FROM_BOTTOM} labelSize={22} />
      {/* Plotting area (bars sit on the baseline; labels live below it) */}
      <div className="absolute right-[30px] top-[24px]" style={{ left: AXIS_L, bottom: BASELINE_FROM_BOTTOM }}>
        {/* Window highlight */}
        {hl && (
          <div
            className="absolute top-[-12px] bottom-0 rounded-[6px] border-2 border-dashed border-[#0094c5]"
            style={{ left: `${hlLeft}%`, width: `${hlWidth}%`, background: 'rgba(0,148,197,0.10)' }}
          />
        )}
        {/* Bolus strokes — fixed width; height scales with the per-bolus dose, so
            fewer boluses make the bars taller. */}
        <BolusBars baseDose={baseDose} bolusCount={bolusCount} maxBoluses={maxBoluses} windows={windows} maxH={CARD_H - BASELINE_FROM_BOTTOM - 24} />
      </div>

      {/* Baseline */}
      <div className="absolute right-[30px] h-px bg-[#e3e6e9]" style={{ left: AXIS_L, bottom: BASELINE_FROM_BOTTOM }} />

      {/* Axis + window label */}
      <p className="absolute bottom-[16px] font-['Roboto',sans-serif] text-[#9ea8b2] text-[22px]" style={{ left: AXIS_L, fontVariationSettings: "'wdth' 100" }}>00:00</p>
      <p className="absolute bottom-[16px] -translate-x-1/2 font-['Roboto',sans-serif] text-[#9ea8b2] text-[22px]" style={{ left: `calc(${AXIS_L}px + (100% - ${AXIS_L + 30}px) * 0.5)`, fontVariationSettings: "'wdth' 100" }}>12:00</p>
      <p className="absolute right-[30px] bottom-[16px] font-['Roboto',sans-serif] text-[#9ea8b2] text-[22px]" style={{ fontVariationSettings: "'wdth' 100" }}>24:00</p>
      {hl && (
        <p
          className="absolute bottom-[16px] -translate-x-1/2 font-['Roboto',sans-serif] font-bold text-[#00769e] text-[21px] whitespace-nowrap"
          style={{ left: `calc(${AXIS_L}px + (100% - ${AXIS_L + 30}px) * ${hlCenter / 100})`, fontVariationSettings: "'wdth' 100" }}
        >
          {fmtTime(hl.startMin)} – {endDisplay}
        </p>
      )}
    </div>
  );
}
