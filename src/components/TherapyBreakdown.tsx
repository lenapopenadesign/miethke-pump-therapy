import { useState } from 'react';
import {
  useTherapy,
  coDoseUgDay,
  concUgPerUl,
  doseStringsFor,
  doseUnitFor,
  fmtTime,
  type Interval,
} from '../therapy';
import { BolusBars } from './TherapyHeaderChart';
import { HelpBadge } from './WizardParts';
import { TherapyIcon } from './HomeShell';

const wdth = { fontVariationSettings: "'wdth' 100" } as const;
const labelCls = "font-['Roboto',sans-serif] font-bold text-[#00769e] text-[24px] tracking-[0.1px]";

const HEAD_BG = '#c4e1ef';
const TOTAL_BG = '#d8ecf7';
const ROW_BG = '#eef6fb';

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

/** Label + a filled value bar (bold value + grey unit). */
export function ValueRow({ label, value, unit, bg }: { label: string; value: string; unit: string; bg: string }) {
  return (
    <div className="grid items-center gap-[24px] [grid-template-columns:220px_1fr]">
      <p className={labelCls}>{label}</p>
      <div className="rounded-[8px] h-[60px] flex items-baseline px-[24px]" style={{ background: bg }}>
        <span className="font-['Roboto',sans-serif] font-bold text-[#00769e] text-[28px] tracking-[0.1px] self-center" style={wdth}>{value}</span>
        <span className="font-['Roboto',sans-serif] font-normal text-[#5f8aa0] text-[22px] ml-[8px] self-center" style={wdth}>{unit}</span>
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
const NOW_POS = `calc(24px + (100% - 48px) * ${NOW_MIN / 1440})`;

/**
 * The 24-hour bolus chart card, shared by the Therapy detail page and the home
 * therapy teaser so both render at the same height. `showNow` adds the
 * current-time marker.
 */
export function ProfileChart({ baseDose, bolusCount, maxBoluses, windows, showNow = false, onHelp }: { baseDose: number; bolusCount: number; maxBoluses: number; windows: Interval[]; showNow?: boolean; onHelp?: () => void }) {
  return (
    <div className="relative w-full bg-white border border-[#d9dbde] rounded-[16px]" style={{ height: 250 }}>
      {onHelp && <HelpBadge onClick={onHelp} />}
      <div className="absolute left-[24px] right-[24px] top-[24px]" style={{ bottom: 48 }}>
        <div className="absolute inset-0">
          <BolusBars baseDose={baseDose} bolusCount={bolusCount} maxBoluses={maxBoluses} windows={windows} nominalH={48} maxH={170} minH={18} barWidth={9} />
        </div>
      </div>
      <div className="absolute left-[24px] right-[24px] h-px bg-[#e3e6e9]" style={{ bottom: 48 }} />
      {showNow && (
        <>
          <div className="absolute w-[2px] bg-[#063b66]" style={{ left: NOW_POS, top: 24, bottom: 48 }} />
          <div className="absolute" style={{ left: NOW_POS, top: 14, transform: 'translateX(-50%)', width: 0, height: 0, borderLeft: '8px solid transparent', borderRight: '8px solid transparent', borderTop: '10px solid #063b66' }} />
        </>
      )}
      <p className="absolute left-[24px] bottom-[14px] font-['Roboto',sans-serif] text-[#9ea8b2] text-[22px]" style={wdth}>00:00</p>
      <p className="absolute right-[24px] bottom-[14px] font-['Roboto',sans-serif] text-[#9ea8b2] text-[22px]" style={wdth}>24:00</p>
    </div>
  );
}

/**
 * The pinned top of the Medication & Therapy pages: the section header and the
 * 24-hour bolus chart. Kept separate from the scrolling breakdown below so the
 * chart can stay visible while the medication list scrolls.
 */
export function TherapyChartCard({ showNow = false, onHelp }: { showNow?: boolean; onHelp?: () => void }) {
  const { baseDose, bolusCount, maxBoluses, intervals } = useTherapy();
  const windows = [...intervals].sort((a, b) => a.startMin - b.startMin);
  return (
    <div className="flex flex-col gap-[24px]">
      {/* Section header */}
      <div className="flex items-center gap-[16px]">
        <TherapyIcon size={48} />
        <p className="flex-1 font-['Roboto',sans-serif] font-bold text-[#00769e] text-[32px] tracking-[0.1px]" style={wdth}>
          Medication &amp; Therapy
        </p>
        <KebabIcon />
      </div>

      {/* 24-hour view */}
      <div className="flex flex-col gap-[12px]">
        <p className="font-['Roboto',sans-serif] font-bold text-[#00769e] text-[24px] tracking-[0.1px]" style={wdth}>24-hour view</p>
        <ProfileChart baseDose={baseDose} bolusCount={bolusCount} maxBoluses={maxBoluses} windows={windows} showNow={showNow} onHelp={onHelp} />
      </div>
    </div>
  );
}

/**
 * The scrolling body of the Medication & Therapy pages: the bolus-frequency line
 * and the per-medication breakdown (Base Dose + one row per dosing window). The
 * first medication is expanded; the others collapse to just their header.
 */
export function TherapyMedBreakdown() {
  const { baseDose, bolusCount, intervals, medications } = useTherapy();
  const windows = [...intervals].sort((a, b) => a.startMin - b.startMin);
  const c0 = medications[0] ? concUgPerUl(medications[0]) : 1;
  const minsBetween = bolusCount > 0 ? Math.round(1440 / bolusCount) : 0;
  const [expandedId, setExpandedId] = useState<string | null>(medications[0]?.id ?? null);

  return (
    <div className="flex flex-col gap-[24px]">
      {/* Bolus frequency */}
      <ValueRow label="Bolus frequency" value={`${bolusCount}`} unit={`boluses · every ~${minsBetween} min`} bg={TOTAL_BG} />

      {/* Per-medication breakdown. */}
      {medications.map((m, i) => {
        const cm = concUgPerUl(m);
        const u = m.unit;
        const unit = doseUnitFor(u).unit;
        const baseUg = i === 0 ? baseDose : coDoseUgDay(baseDose, c0, cm);
        const expanded = expandedId === m.id;
        return (
          <div key={m.id} className="flex flex-col gap-[8px]">
            {/* Collapsible header */}
            <button
              onClick={() => setExpandedId(id => (id === m.id ? null : m.id))}
              className="grid items-center gap-[24px] [grid-template-columns:220px_1fr] cursor-pointer text-left"
            >
              <p className={labelCls}>Medication</p>
              <div className="rounded-[8px] h-[60px] flex items-center justify-between px-[24px]" style={{ background: HEAD_BG }}>
                <span className="flex items-baseline">
                  <span className="font-['Roboto',sans-serif] font-bold text-[#00769e] text-[28px] tracking-[0.1px]" style={wdth}>{m.name || (i === 0 ? 'Primary' : 'Medication')}</span>
                  <span className="font-['Roboto',sans-serif] font-normal text-[#5f8aa0] text-[22px] ml-[8px]" style={wdth}>{m.concentration} {m.unit}</span>
                </span>
                <Chevron up={expanded} />
              </div>
            </button>
            {expanded && (
              <>
                <ValueRow label="Base Dose" value={doseStringsFor(baseUg, u).perDay} unit={`${unit}/day`} bg={ROW_BG} />
                {windows.map(w => {
                  const rateUg = i === 0 ? w.dose : coDoseUgDay(w.dose, c0, cm);
                  const intervalUg = rateUg * (w.endMin - w.startMin) / 1440;
                  return (
                    <ValueRow
                      key={w.id}
                      label={`${fmtTime(w.startMin)} - ${fmtTime(w.endMin >= 1440 ? 1439 : w.endMin)}`}
                      value={doseStringsFor(intervalUg, u).perDay}
                      unit={`${unit}/w`}
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
