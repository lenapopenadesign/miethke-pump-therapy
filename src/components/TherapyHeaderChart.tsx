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
            <p className={`font-['Roboto',sans-serif] text-right text-white tracking-[0.1px] ${i === 0 ? 'font-bold text-[28px]' : 'font-normal text-[24px]'}`} style={{ fontVariationSettings: "'wdth' 100" }}>
              {m.name || (i === 0 ? 'Primary' : 'Medication')}
            </p>
            <p className={`font-['Roboto',sans-serif] text-right text-white tracking-[0.1px] ${i === 0 ? 'font-bold text-[28px]' : 'font-normal text-[24px]'}`} style={{ fontVariationSettings: "'wdth' 100" }}>
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
  const { baseDose, bolusCount, maxBoluses, intervals } = useTherapy();
  return (
    <div className="w-[1200px] shrink-0">
      <TherapyTotalsBand />
      {/* 24-hour view */}
      <div className="bg-[#00769e] px-[80px] pb-[40px]">
        <p className="font-['Roboto',sans-serif] font-bold text-white text-[28px] tracking-[0.1px] mb-[12px]" style={{ fontVariationSettings: "'wdth' 100" }}>
          24-hour view
        </p>
        <BolusChart baseDose={baseDose} bolusCount={bolusCount} maxBoluses={maxBoluses} windows={intervals} highlight={highlight} />
      </div>
    </div>
  );
}

const CARD_H = 240;
const BASELINE_FROM_BOTTOM = 52; // room for the axis labels under the bars
const MAX_BARS = 60;             // cap rendered bars so dense schedules stay legible

/** Dose rate (µg/h) at a given minute: a covering window's rate, else the base. */
function rateAt(min: number, baseRate: number, windows: Interval[]): number {
  const w = windows.find(iv => min >= iv.startMin && min < iv.endMin);
  return w ? w.dose / 24 : baseRate;
}

/**
 * The bolus "strokes": one fixed-width bar per delivered bolus, evenly spaced
 * across the day. A bar's height tracks the dose rate at that time, so dosing
 * windows read as taller/shorter runs. Sizes are caller-tunable so the same
 * profile renders in the big header chart and the smaller home/detail charts.
 * Place inside a relative, bottom-anchored box of height `maxH`.
 */
export function BolusBars({
  baseDose, bolusCount, maxBoluses, windows, nominalH = 48, maxH = 150, minH = 18, barWidth = 9,
}: {
  baseDose: number;
  bolusCount: number;
  // Reference (maximum) frequency. Bar height scales by maxBoluses/bolusCount, so
  // fewer boluses → taller bars (each bolus carries a larger dose). Defaults to
  // bolusCount (no scaling) when omitted.
  maxBoluses?: number;
  windows: Interval[];
  nominalH?: number;
  maxH?: number;
  minH?: number;
  barWidth?: number;
}) {
  const baseRate = baseDose / 24;
  const n = baseDose > 0 && bolusCount > 0 ? Math.min(bolusCount, MAX_BARS) : 0;
  const freqFactor = maxBoluses && maxBoluses > 0 && bolusCount > 0 ? maxBoluses / bolusCount : 1;
  const bars = Array.from({ length: n }, (_, i) => {
    const midMin = ((i + 0.5) / n) * 1440;
    const rate = rateAt(midMin, baseRate, windows);
    const ratio = baseRate > 0 ? rate / baseRate : 1;
    return Math.max(minH, Math.min(maxH, ratio * nominalH * freqFactor));
  });
  return (
    <div className="absolute inset-0 flex items-end justify-between">
      {bars.map((h, i) => (
        <div key={i} className="shrink-0 rounded-[3px] bg-[#0094c5]" style={{ width: barWidth, height: h }} />
      ))}
    </div>
  );
}

function BolusChart({
  baseDose, bolusCount, maxBoluses, windows, highlight,
}: {
  baseDose: number;
  bolusCount: number;
  maxBoluses: number;
  windows: Interval[];
  highlight?: { startMin: number; endMin: number } | null;
}) {
  const hl = highlight && highlight.endMin > highlight.startMin ? highlight : null;
  const hlLeft = hl ? (hl.startMin / 1440) * 100 : 0;
  const hlWidth = hl ? ((hl.endMin - hl.startMin) / 1440) * 100 : 0;
  const hlCenter = hlLeft + hlWidth / 2;
  const endDisplay = hl ? (hl.endMin >= 1440 ? '24:00' : fmtTime(hl.endMin)) : '';

  return (
    <div className="relative w-full bg-white rounded-[16px] overflow-hidden" style={{ height: CARD_H }}>
      {/* Plotting area (bars sit on the baseline; labels live below it) */}
      <div className="absolute left-[30px] right-[30px] top-[24px]" style={{ bottom: BASELINE_FROM_BOTTOM }}>
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
      <div className="absolute left-[30px] right-[30px] h-px bg-[#e3e6e9]" style={{ bottom: BASELINE_FROM_BOTTOM }} />

      {/* Axis + window label */}
      <p className="absolute left-[30px] bottom-[16px] font-['Roboto',sans-serif] text-[#9ea8b2] text-[22px]" style={{ fontVariationSettings: "'wdth' 100" }}>00:00</p>
      <p className="absolute right-[30px] bottom-[16px] font-['Roboto',sans-serif] text-[#9ea8b2] text-[22px]" style={{ fontVariationSettings: "'wdth' 100" }}>24:00</p>
      {hl && (
        <p
          className="absolute bottom-[16px] -translate-x-1/2 font-['Roboto',sans-serif] font-bold text-[#00769e] text-[21px] whitespace-nowrap"
          style={{ left: `calc(30px + (100% - 60px) * ${hlCenter / 100})`, fontVariationSettings: "'wdth' 100" }}
        >
          {fmtTime(hl.startMin)} – {endDisplay}
        </p>
      )}
    </div>
  );
}
