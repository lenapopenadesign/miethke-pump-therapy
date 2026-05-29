import { Fragment } from 'react';
import { coDoseUgDay, doseStrings, type Medication } from '../therapy';

function fmtDay(ug: number): { value: string; unit: string } {
  const s = doseStrings(ug);
  return { value: s.perDay, unit: `${s.unit}/d` };
}

function Chip({ value, unit, bg }: { value: string; unit: string; bg: string }) {
  return (
    <div className={`${bg} rounded-[10px] px-[18px] py-[12px] flex items-baseline gap-[6px]`}>
      <span className="font-['Roboto',sans-serif] font-bold text-[#00658a] text-[24px] tracking-[0.1px]" style={{ fontVariationSettings: "'wdth' 100" }}>{value}</span>
      <span className="font-['Roboto',sans-serif] font-normal text-[#5f8aa0] text-[20px]" style={{ fontVariationSettings: "'wdth' 100" }}>{unit}</span>
    </div>
  );
}

const hdr = "font-['Roboto',sans-serif] text-[18px] tracking-[1px] pb-[6px]";

/**
 * The per-medication 24h summary — the headline data on the Intervals, Review
 * and Home (active) screens. A flat, prominent light-blue card with filled
 * Base dose / Total 24 h cells. When `currentUg` is provided (Home active) an
 * extra "Current" column shows the dose of the interval running right now.
 */
export function MedSummary({
  baseDose, estDaily, medications, currentUg,
}: {
  baseDose: number;
  estDaily: number;
  medications: Medication[];
  currentUg?: number;
}) {
  const c0 = medications[0]?.concentration ?? 1;
  const showCurrent = currentUg != null;
  const co = (ug: number, m: Medication, i: number) => (i === 0 ? ug : coDoseUgDay(ug, c0, m.concentration));
  const rows = medications.map((m, i) => ({
    med: m,
    base: fmtDay(co(baseDose, m, i)),
    total: fmtDay(co(estDaily, m, i)),
    current: showCurrent ? fmtDay(co(currentUg as number, m, i)) : null,
  }));
  const cols = showCurrent
    ? '[grid-template-columns:1.2fr_0.9fr_1fr_1fr_1fr]'
    : '[grid-template-columns:1.2fr_1fr_1fr_1.1fr]';
  const grid = `grid ${cols} gap-x-[14px] gap-y-[10px] items-center`;
  return (
    <div className="w-full rounded-[20px] border border-[#bcdcec] bg-[#e6f4f9] px-[28px] py-[24px]">
      <div className={grid}>
        {/* Header */}
        <p className={`${hdr} font-bold text-[#00769e]`}>MEDICATION</p>
        <p className={`${hdr} font-normal text-[#5f8aa0]`}>Concentration</p>
        <p className={`${hdr} font-normal text-[#00769e] pl-[18px]`}>Base dose</p>
        <p className={`${hdr} font-bold text-[#00769e] pl-[18px]`}>Total 24 h</p>
        {showCurrent && <p className={`${hdr} font-bold text-[#00769e] pl-[18px]`}>Current</p>}

        {/* Rows */}
        {rows.map(r => (
          <Fragment key={r.med.id}>
            <p className="font-['Roboto',sans-serif] font-bold text-[#00769e] text-[24px] tracking-[0.1px]" style={{ fontVariationSettings: "'wdth' 100" }}>{r.med.name}</p>
            <p className="font-['Roboto',sans-serif] text-[22px] tracking-[0.1px]" style={{ fontVariationSettings: "'wdth' 100" }}>
              <span className="font-bold text-[#00769e]">{r.med.concentration}</span> <span className="font-normal text-[#5f8aa0]">{r.med.unit}</span>
            </p>
            <Chip value={r.base.value} unit={r.base.unit} bg="bg-[#d6eaf3]" />
            <Chip value={r.total.value} unit={r.total.unit} bg="bg-[#bfdeee]" />
            {r.current && <Chip value={r.current.value} unit={r.current.unit} bg="bg-[#c9e9f5]" />}
          </Fragment>
        ))}
      </div>
    </div>
  );
}
