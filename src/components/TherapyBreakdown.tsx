import {
  useTherapy,
  coDoseUgDay,
  concUgPerUl,
  doseStringsFor,
  doseUnitFor,
  estimatedDailyTotal,
  fmtTime,
} from '../therapy';
import { BolusBars } from './TherapyHeaderChart';
import { TherapyIcon } from './HomeShell';

const wdth = { fontVariationSettings: "'wdth' 100" } as const;
const labelCls = "font-['Roboto',sans-serif] font-bold text-[#00769e] text-[24px] tracking-[0.1px]";

const HEAD_BG = '#a6d2e6';
const TOTAL_BG = '#cce4f1';
const ROW_BG = '#e9f4fa';

function KebabIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="#0094c5">
      <circle cx="12" cy="5" r="2" /><circle cx="12" cy="12" r="2" /><circle cx="12" cy="19" r="2" />
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

export function TherapyBreakdown({ showNow = false }: { showNow?: boolean }) {
  const { baseDose, bolusCount, intervals, medications } = useTherapy();
  const windows = [...intervals].sort((a, b) => a.startMin - b.startMin);
  const c0 = medications[0] ? concUgPerUl(medications[0]) : 1;
  const primaryDailyUg = estimatedDailyTotal(baseDose, windows);
  const minsBetween = bolusCount > 0 ? Math.round(1440 / bolusCount) : 0;

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
        <div className="relative w-full bg-white border border-[#d9dbde] rounded-[16px]" style={{ height: 250 }}>
          <div className="absolute left-[24px] right-[24px] top-[24px]" style={{ bottom: 48 }}>
            <div className="absolute inset-0">
              <BolusBars baseDose={baseDose} bolusCount={bolusCount} windows={windows} nominalH={92} maxH={150} minH={20} barWidth={12} />
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
      </div>

      {/* Bolus frequency */}
      <ValueRow label="Bolus frequency" value={`${bolusCount}`} unit={`boluses · every ~${minsBetween} min`} bg={TOTAL_BG} />

      {/* Per-medication breakdown */}
      {medications.map((m, i) => {
        const cm = concUgPerUl(m);
        const u = m.unit;
        const unit = doseUnitFor(u).unit;
        const dailyUg = i === 0 ? primaryDailyUg : coDoseUgDay(primaryDailyUg, c0, cm);
        const baseUg = i === 0 ? baseDose : coDoseUgDay(baseDose, c0, cm);
        return (
          <div key={m.id} className="flex flex-col gap-[8px]">
            <ValueRow label="Medication" value={m.name || (i === 0 ? 'Primary' : 'Medication')} unit={`${m.concentration} ${m.unit}`} bg={HEAD_BG} />
            <ValueRow label="Total 24 h" value={doseStringsFor(dailyUg, u).perDay} unit={`${unit}/day`} bg={TOTAL_BG} />
            <ValueRow label="Base Dose" value={doseStringsFor(baseUg, u).perDay} unit={`${unit}/day`} bg={ROW_BG} />
            {windows.map(w => {
              const rateUg = i === 0 ? w.dose : coDoseUgDay(w.dose, c0, cm);
              const intervalUg = rateUg * (w.endMin - w.startMin) / 1440;
              return (
                <ValueRow
                  key={w.id}
                  label={`${fmtTime(w.startMin)} - ${fmtTime(w.endMin >= 1440 ? 1439 : w.endMin)}`}
                  value={doseStringsFor(intervalUg, u).perDay}
                  unit={`${unit}/interval`}
                  bg={ROW_BG}
                />
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
