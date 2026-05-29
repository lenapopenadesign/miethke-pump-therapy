import { Fragment } from 'react';
import { coDoseUgDay, doseStrings, type Medication } from '../therapy';

function fmtDay(ug: number): { value: string; unit: string } {
  const s = doseStrings(ug);
  return { value: s.perDay, unit: `${s.unit}/d` };
}

const GRID = 'grid [grid-template-columns:1.2fr_1fr_1fr_1.1fr] gap-x-[16px] gap-y-[10px] items-center';

function Chip({ value, unit, bg }: { value: string; unit: string; bg: string }) {
  return (
    <div className={`${bg} rounded-[10px] px-[18px] py-[12px] flex items-baseline gap-[6px]`}>
      <span className="font-['Roboto',sans-serif] font-bold text-[#00658a] text-[24px] tracking-[0.1px]" style={{ fontVariationSettings: "'wdth' 100" }}>{value}</span>
      <span className="font-['Roboto',sans-serif] font-normal text-[#5f8aa0] text-[20px]" style={{ fontVariationSettings: "'wdth' 100" }}>{unit}</span>
    </div>
  );
}

/**
 * The per-medication 24h summary — the headline data on the Intervals and
 * Review screens. A flat, prominent light-blue card (no shadow) with filled
 * Base dose and Total 24 h cells, the Total column slightly more saturated.
 */
export function MedSummary({ baseDose, estDaily, medications }: { baseDose: number; estDaily: number; medications: Medication[] }) {
  const c0 = medications[0]?.concentration ?? 1;
  const rows = medications.map((m, i) => ({
    med: m,
    base: fmtDay(i === 0 ? baseDose : coDoseUgDay(baseDose, c0, m.concentration)),
    total: fmtDay(i === 0 ? estDaily : coDoseUgDay(estDaily, c0, m.concentration)),
  }));
  return (
    <div className="w-full rounded-[20px] border border-[#bcdcec] bg-[#e6f4f9] px-[28px] py-[24px]">
      <div className={GRID}>
        {/* Header */}
        <p className="font-['Roboto',sans-serif] font-bold text-[#00769e] text-[18px] tracking-[1px] pb-[6px]">MEDICATION</p>
        <p className="font-['Roboto',sans-serif] font-normal text-[#5f8aa0] text-[18px] tracking-[1px] pb-[6px]">Concentration</p>
        <p className="font-['Roboto',sans-serif] font-normal text-[#00769e] text-[18px] tracking-[1px] pb-[6px] pl-[18px]">Base dose</p>
        <p className="font-['Roboto',sans-serif] font-bold text-[#00769e] text-[18px] tracking-[1px] pb-[6px] pl-[18px]">Total 24 h</p>

        {/* Rows */}
        {rows.map(r => (
          <Fragment key={r.med.id}>
            <p className="font-['Roboto',sans-serif] font-bold text-[#00769e] text-[24px] tracking-[0.1px]" style={{ fontVariationSettings: "'wdth' 100" }}>{r.med.name}</p>
            <p className="font-['Roboto',sans-serif] text-[22px] tracking-[0.1px]" style={{ fontVariationSettings: "'wdth' 100" }}>
              <span className="font-bold text-[#00769e]">{r.med.concentration}</span> <span className="font-normal text-[#5f8aa0]">{r.med.unit}</span>
            </p>
            <Chip value={r.base.value} unit={r.base.unit} bg="bg-[#d6eaf3]" />
            <Chip value={r.total.value} unit={r.total.unit} bg="bg-[#bfdeee]" />
          </Fragment>
        ))}
      </div>
    </div>
  );
}
