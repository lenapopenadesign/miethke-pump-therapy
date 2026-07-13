import { useState } from 'react';
import {
  useTherapy,
  coDoseUgDay,
  concUgPerUl,
  doseStringsFor,
  doseUnitFor,
  estimatedDailyTotal,
  fmtTime,
  windowDeliverySpan,
  type Interval,
} from '../therapy';
import { BolusBars, PerDelAxis } from './TherapyHeaderChart';
import { HelpBadge } from './WizardParts';
import { TherapyIcon } from './HomeShell';

const wdth = { fontVariationSettings: "'wdth' 100" } as const;
const labelCls = "font-['Roboto',sans-serif] font-bold text-[#00769e] text-[24px] tracking-[0.1px]";

const HEAD_BG = '#c4e1ef';
const TOTAL_BG = '#d8ecf7';
const ROW_BG = '#eef6fb';
// Exported so the Therapy detail page can tint its Total 24 h band to match the
// medication summary rows.
export const MED_TOTAL_BG = TOTAL_BG;

function KebabIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="#0094c5">
      <circle cx="12" cy="5" r="2" /><circle cx="12" cy="12" r="2" /><circle cx="12" cy="19" r="2" />
    </svg>
  );
}

function Chevron({ up }: { up?: boolean }) {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" className="shrink-0" style={{ transform: up ? 'rotate(180deg)' : undefined }}>
      <path d="M6 9l6 6 6-6" stroke="#00769e" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// Fixed value slot for the totals so their values (right-aligned) and their
// labels ("mg/day"/"mg total") all land on the same x.
const TOTAL_VAL_W = '88px';

/** A single metric: bold 32px value + grey unit, baseline-aligned. `slotW` puts
 *  the value in a fixed right-aligned box so the trailing labels line up. */
function Metric({ value, unit, bold = true, slotW }: { value: string; unit: string; bold?: boolean; slotW?: string }) {
  return (
    <span className="flex items-baseline whitespace-nowrap">
      <span className={`font-['Roboto',sans-serif] ${bold ? 'font-bold' : 'font-normal'} text-[#00769e] text-[32px] tracking-[0.1px] ${slotW ? 'inline-block text-right shrink-0' : ''}`} style={slotW ? { width: slotW, ...wdth } : wdth}>{value}</span>
      <span className="font-['Roboto',sans-serif] font-normal text-[#5f8aa0] text-[22px] ml-[8px]" style={wdth}>{unit}</span>
    </span>
  );
}

/**
 * A delivery line shared by the default-delivery and per-window rows: label, then
 * three aligned columns — dose per delivery, delivery total, and the +/-% vs the
 * default delivery (blank for the default row itself). Mirrors the Customised
 * Delivery cards so the metrics line up the same way on every page.
 */
export function DeliveryRow({ label, perValue, perUnit, totalValue, totalUnit, bg }: { label: string; perValue: string; perUnit: string; totalValue: string; totalUnit: string; bg: string }) {
  return (
    <div className="grid items-center gap-[24px] [grid-template-columns:220px_1fr]">
      <p className={labelCls}>{label}</p>
      {/* Same 3-column template as the medication header so the totals align. */}
      <div className="rounded-[8px] h-[60px] grid items-center gap-[16px] px-[24px] [grid-template-columns:1fr_1fr_100px]" style={{ background: bg }}>
        <Metric value={perValue} unit={perUnit} bold={false} />
        <Metric value={totalValue} unit={`${totalUnit} total`} slotW={TOTAL_VAL_W} />
        <span />
      </div>
    </div>
  );
}

/** Label + a filled value bar (bold value + grey unit), with an optional total note and +/-% delta. */
export function ValueRow({ label, value, unit, bg, delta, note }: { label: string; value: string; unit: string; bg: string; delta?: number | null; note?: string }) {
  const showDelta = delta != null && delta !== 0;
  return (
    <div className="grid items-center gap-[24px] [grid-template-columns:220px_1fr]">
      <p className={labelCls}>{label}</p>
      <div className="rounded-[8px] h-[60px] flex items-baseline px-[24px]" style={{ background: bg }}>
        <span className="font-['Roboto',sans-serif] font-bold text-[#00769e] text-[32px] tracking-[0.1px] self-center" style={wdth}>{value}</span>
        <span className="font-['Roboto',sans-serif] font-normal text-[#5f8aa0] text-[22px] ml-[8px] self-center" style={wdth}>{unit}</span>
        {note && (
          <span className="ml-[16px] font-['Roboto',sans-serif] font-bold text-[#00769e] text-[22px] self-center whitespace-nowrap" style={wdth}>· {note}</span>
        )}
        {showDelta && (
          <span className="ml-auto font-['Roboto',sans-serif] font-bold text-[#b3850e] text-[40px] self-center whitespace-nowrap" style={wdth}>
            {delta! > 0 ? '+' : '−'}{Math.abs(delta!)}%
          </span>
        )}
      </div>
    </div>
  );
}

/**
 * The "Medication & Therapy" body shared by the Review step and the Therapy
 * detail page: a 24-hour bolus chart, the bolus-frequency line, and a
 * per-medication breakdown (Total 24 h, Base Dose and one row per dosing window).
 */
const NOW_MIN = 716; // "11:56" — current-time marker
const CHART_AXIS_L = 68; // left gutter for the dose-per-delivery labels
const BAR_MAX_H = 96; // bar area height — matched to the (shorter) wizard chart bars
const NOW_POS = `calc(${CHART_AXIS_L}px + (100% - ${CHART_AXIS_L + 24}px) * ${NOW_MIN / 1440})`;

/**
 * The 24-hour bolus chart card, shared by the Therapy detail page and the home
 * therapy teaser so both render at the same height. `showNow` adds the
 * current-time marker; a rough dose-per-delivery axis sits in the left gutter.
 */
export function ProfileChart({ baseDose, bolusCount, maxBoluses, windows, unit, showNow = false, onHelp }: { baseDose: number; bolusCount: number; maxBoluses: number; windows: Interval[]; unit: string; showNow?: boolean; onHelp?: () => void }) {
  return (
    <div className="relative w-full bg-white border border-[#d9dbde] rounded-[16px]" style={{ height: 250 }}>
      {onHelp && <HelpBadge onClick={onHelp} />}
      {/* Shorter bars (to match the wizard chart) but the same 250px card height —
          the extra space sits as headroom above the bars. */}
      <PerDelAxis baseDose={baseDose} bolusCount={bolusCount} windows={windows} unit={unit}
        barMaxH={BAR_MAX_H} left={CHART_AXIS_L} right={24} baseline={48} labelSize={18} />
      <div className="absolute right-[24px] top-[24px]" style={{ left: CHART_AXIS_L, bottom: 48 }}>
        <div className="absolute inset-0">
          <BolusBars baseDose={baseDose} bolusCount={bolusCount} maxBoluses={maxBoluses} windows={windows} nominalH={30} maxH={BAR_MAX_H} minH={10} barWidth={9} />
        </div>
      </div>
      <div className="absolute right-[24px] h-px bg-[#e3e6e9]" style={{ left: CHART_AXIS_L, bottom: 48 }} />
      {showNow && (
        <>
          <div className="absolute w-[2px] bg-[#063b66]" style={{ left: NOW_POS, top: 24, bottom: 48 }} />
          <div className="absolute" style={{ left: NOW_POS, top: 14, transform: 'translateX(-50%)', width: 0, height: 0, borderLeft: '8px solid transparent', borderRight: '8px solid transparent', borderTop: '10px solid #063b66' }} />
        </>
      )}
      <p className="absolute bottom-[14px] font-['Roboto',sans-serif] text-[#9ea8b2] text-[22px]" style={{ left: CHART_AXIS_L, ...wdth }}>00:00</p>
      <p className="absolute bottom-[14px] -translate-x-1/2 font-['Roboto',sans-serif] text-[#9ea8b2] text-[22px]" style={{ left: `calc(${CHART_AXIS_L}px + (100% - ${CHART_AXIS_L + 24}px) * 0.5)`, ...wdth }}>12:00</p>
      <p className="absolute right-[24px] bottom-[14px] font-['Roboto',sans-serif] text-[#9ea8b2] text-[22px]" style={wdth}>24:00</p>
    </div>
  );
}

/**
 * The pinned top of the Medication & Therapy pages: the section header and the
 * 24-hour bolus chart. Kept separate from the scrolling breakdown below so the
 * chart can stay visible while the medication list scrolls.
 */
export function TherapyChartCard({ showNow = false, showHeader = true, onHelp, windowsOverride }: { showNow?: boolean; showHeader?: boolean; onHelp?: () => void; windowsOverride?: Interval[] }) {
  const { baseDose, bolusCount, maxBoluses, intervals, medications } = useTherapy();
  const windows = [...(windowsOverride ?? intervals)].sort((a, b) => a.startMin - b.startMin);
  const unit = medications[0]?.unit ?? 'mg/ml';
  return (
    <div className="flex flex-col gap-[24px]">
      {/* Section header */}
      {showHeader && (
        <div className="flex items-center gap-[16px]">
          <TherapyIcon size={48} />
          <p className="flex-1 font-['Roboto',sans-serif] font-bold text-[#00769e] text-[32px] tracking-[0.1px]" style={wdth}>
            Medication &amp; Therapy
          </p>
          <KebabIcon />
        </div>
      )}

      {/* 24-hour view */}
      <div className="flex flex-col gap-[12px]">
        <p className="font-['Roboto',sans-serif] font-bold text-[#00769e] text-[24px] tracking-[0.1px]" style={wdth}>24-hour view</p>
        <ProfileChart baseDose={baseDose} bolusCount={bolusCount} maxBoluses={maxBoluses} windows={windows} unit={unit} showNow={showNow} onHelp={onHelp} />
      </div>
    </div>
  );
}

/**
 * The scrolling body of the Medication & Therapy pages: the bolus-frequency line
 * and the per-medication breakdown (Base Dose + one row per dosing window). The
 * first medication is expanded; the others collapse to just their header.
 */
export function TherapyMedBreakdown({ showFrequency = true, windowsOverride }: { showFrequency?: boolean; windowsOverride?: Interval[] }) {
  const { baseDose, bolusCount, intervals, medications } = useTherapy();
  const windows = [...(windowsOverride ?? intervals)].sort((a, b) => a.startMin - b.startMin);
  const c0 = medications[0] ? concUgPerUl(medications[0]) : 1;
  const minsBetween = bolusCount > 0 ? Math.round(1440 / bolusCount) : 0;
  const bolusN = Math.max(1, bolusCount); // divisor for per-delivery doses
  // Deliveries that run at the default (base) dose = all deliveries minus the
  // ones the windows carve out. Used to sum the default deliveries, mirroring
  // each window's own total.
  const defaultDeliveryCount = Math.max(0, bolusCount - windows.reduce((s, w) => s + windowDeliverySpan(w.startMin, w.endMin, bolusCount).count, 0));
  const primaryDailyUg = estimatedDailyTotal(baseDose, windows); // primary med's 24h total
  const [expandedId, setExpandedId] = useState<string | null>(medications[0]?.id ?? null);

  return (
    <div className="flex flex-col gap-[24px]">
      {/* Delivery frequency */}
      {showFrequency && (
        <ValueRow label="Delivery frequency" value={`${bolusCount}`} unit={`deliveries · every ~${minsBetween} min`} bg={TOTAL_BG} />
      )}

      {/* Per-medication breakdown. */}
      {medications.map((m, i) => {
        const cm = concUgPerUl(m);
        const u = m.unit;
        const unit = doseUnitFor(u).unit;
        const baseUg = i === 0 ? baseDose : coDoseUgDay(baseDose, c0, cm);
        const totalUg = i === 0 ? primaryDailyUg : coDoseUgDay(primaryDailyUg, c0, cm);
        const expanded = expandedId === m.id;
        return (
          <div key={m.id} className="flex flex-col gap-[8px]">
            {/* Collapsible header */}
            <button
              onClick={() => setExpandedId(id => (id === m.id ? null : m.id))}
              className="grid items-center gap-[24px] [grid-template-columns:220px_1fr] cursor-pointer text-left"
            >
              <p className={labelCls}>Medication</p>
              {/* Same 3-column grid as the delivery rows so the Total 24 h value
                  lines up under the per-window total column, and the chevron under
                  the % column. */}
              <div className="rounded-[8px] h-[60px] grid items-center gap-[16px] px-[24px] [grid-template-columns:1fr_1fr_100px]" style={{ background: HEAD_BG }}>
                <span className="flex items-baseline gap-[8px] min-w-0">
                  <span className="font-['Roboto',sans-serif] font-bold text-[#00769e] text-[28px] tracking-[0.1px] truncate" style={wdth}>{m.name || (i === 0 ? 'Primary' : 'Medication')}</span>
                  <span className="font-['Roboto',sans-serif] font-normal text-[#5f8aa0] text-[22px] whitespace-nowrap" style={wdth}>{m.concentration} {m.unit}</span>
                </span>
                {/* Total 24 h value — aligned with the per-window total column below. */}
                <Metric value={doseStringsFor(totalUg, u).perDay} unit={`${unit}/day`} slotW={TOTAL_VAL_W} />
                <span className="flex justify-end"><Chevron up={expanded} /></span>
              </div>
            </button>
            {expanded && (
              <>
                {/* The dose one default delivery carries, plus the summed total
                    across all default (non-window) deliveries — mirrors the
                    per-window rows below. */}
                <DeliveryRow
                  label="Default delivery"
                  perValue={doseStringsFor(baseUg / bolusN, u).perDay}
                  perUnit={`${unit}/delivery`}
                  totalValue={doseStringsFor((baseUg / bolusN) * defaultDeliveryCount, u).perDay}
                  totalUnit={unit}
                  bg={ROW_BG}
                />
                {/* Each window: the dose delivered in a single delivery during it,
                    with its increase/decrease vs the base dose. */}
                {windows.map(w => {
                  const rateUg = i === 0 ? w.dose : coDoseUgDay(w.dose, c0, cm);
                  const span = windowDeliverySpan(w.startMin, w.endMin, bolusCount);
                  const totalUg = (rateUg / bolusN) * span.count;
                  const rangeLabel = span.firstMin === span.lastMin
                    ? fmtTime(span.firstMin)
                    : `${fmtTime(span.firstMin)} – ${fmtTime(span.lastMin)}`;
                  return (
                    <DeliveryRow
                      key={w.id}
                      label={rangeLabel}
                      perValue={doseStringsFor(rateUg / bolusN, u).perDay}
                      perUnit={`${unit}/delivery`}
                      totalValue={doseStringsFor(totalUg, u).perDay}
                      totalUnit={unit}
                      bg={ROW_BG}
                    />
                  );
                })}
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}
