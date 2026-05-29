import { coDoseUgDay, doseStrings, type Medication } from '../therapy';

function fmtDay(ug: number): { value: string; unit: string } {
  const s = doseStrings(ug);
  return { value: s.perDay, unit: `${s.unit}/d` };
}

const GRID = 'grid items-center [grid-template-columns:1.2fr_1fr_1fr_1.1fr]';

/**
 * The per-medication 24h summary — the headline data on the Intervals and
 * Review screens. Rendered as an elevated card with the "Total 24 h" column
 * emphasised so it stands out as the most important information.
 */
export function MedSummary({ baseDose, estDaily, medications }: { baseDose: number; estDaily: number; medications: Medication[] }) {
  const c0 = medications[0]?.concentration ?? 1;
  const rows = medications.map((m, i) => ({
    med: m,
    base: fmtDay(i === 0 ? baseDose : coDoseUgDay(baseDose, c0, m.concentration)),
    total: fmtDay(i === 0 ? estDaily : coDoseUgDay(estDaily, c0, m.concentration)),
  }));
  return (
    <div className="w-full rounded-[20px] border border-[#bcdcec] bg-white overflow-clip shadow-[0_6px_28px_rgba(0,116,158,0.12)]">
      {/* Header band */}
      <div className={`${GRID} bg-[#e6f4f9] px-[28px] py-[16px]`}>
        <p className="font-['Roboto',sans-serif] font-bold text-[#00769e] text-[18px] tracking-[1px]">MEDICATION</p>
        <p className="font-['Roboto',sans-serif] font-normal text-[#5f7388] text-[18px] tracking-[1px]">Concentration</p>
        <p className="font-['Roboto',sans-serif] font-normal text-[#5f7388] text-[18px] tracking-[1px]">Base dose</p>
        <p className="font-['Roboto',sans-serif] font-bold text-[#00769e] text-[18px] tracking-[1px]">Total 24 h</p>
      </div>
      {rows.map((r, i) => (
        <div key={r.med.id} className={`${GRID} px-[28px] py-[16px] ${i > 0 ? 'border-t border-[#eef4f8]' : ''}`}>
          <p className="font-['Roboto',sans-serif] font-bold text-[#00769e] text-[24px] tracking-[0.1px]" style={{ fontVariationSettings: "'wdth' 100" }}>{r.med.name}</p>
          <p className="font-['Roboto',sans-serif] font-normal text-[#5f7388] text-[22px]" style={{ fontVariationSettings: "'wdth' 100" }}>{r.med.concentration} {r.med.unit}</p>
          <p className="font-['Roboto',sans-serif] text-[#5f7388] text-[22px]" style={{ fontVariationSettings: "'wdth' 100" }}>
            <span className="font-bold text-[#00769e]">{r.base.value}</span> {r.base.unit}
          </p>
          {/* Total 24h — emphasised */}
          <div className="bg-[#cfe8f4] rounded-[10px] px-[18px] py-[10px] flex items-baseline gap-[6px] mr-[8px]">
            <span className="font-['Roboto',sans-serif] font-extrabold text-[#00658a] text-[28px] tracking-[0.1px]" style={{ fontVariationSettings: "'wdth' 100" }}>{r.total.value}</span>
            <span className="font-['Roboto',sans-serif] font-normal text-[#00769e] text-[20px]" style={{ fontVariationSettings: "'wdth' 100" }}>{r.total.unit}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
