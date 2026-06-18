import { Fragment } from 'react';
import { coDoseUgDay, concUgPerUl, doseStringsFor, type Medication } from '../therapy';

function fmtDay(ug: number, concUnit: string): { value: string; unit: string } {
  const s = doseStringsFor(ug, concUnit);
  return { value: s.perDay, unit: `${s.unit}/d` };
}

function fmtHour(ug: number, concUnit: string): { value: string; unit: string } {
  const s = doseStringsFor(ug, concUnit);
  return { value: s.perHour, unit: `${s.unit}/h` };
}

function Chip({ value, unit }: { value: string; unit: string }) {
  return (
    <div className="bg-[#bcdcec] rounded-[10px] px-[18px] py-[12px] flex items-baseline gap-[6px] w-full">
      <span className="font-['Roboto',sans-serif] font-bold text-[#00658a] text-[28px] tracking-[0.1px]" style={{ fontVariationSettings: "'wdth' 100" }}>{value}</span>
      <span className="font-['Roboto',sans-serif] font-normal text-[#5f8aa0] text-[22px]" style={{ fontVariationSettings: "'wdth' 100" }}>{unit}</span>
    </div>
  );
}

const hdr = "font-['Roboto',sans-serif] text-[22px] tracking-[1px] pb-[6px]";

/**
 * The per-medication 24h summary — the headline data on the Intervals, Review
 * and Home (active) screens (Figma 7471:64607 / 7780:70952). Columns are evenly
 * distributed: MEDICATION · Concentration · Total 24 h, plus an optional
 * "Base dose" column (when `baseDose` is given) and a "Current interval" column
 * (when `currentUg` is given, i.e. an interval is running).
 */
export function MedSummary({
  baseDose, estDaily, medications, currentUg,
}: {
  baseDose?: number;
  estDaily: number;
  medications: Medication[];
  currentUg?: number;
}) {
  const c0 = medications[0] ? concUgPerUl(medications[0]) : 1;
  const showBase = baseDose != null;
  const showCurrent = currentUg != null;
  const co = (ug: number, m: Medication, i: number) => (i === 0 ? ug : coDoseUgDay(ug, c0, concUgPerUl(m)));
  const rows = medications.map((m, i) => ({
    med: m,
    base: showBase ? fmtDay(co(baseDose as number, m, i), m.unit) : null,
    total: fmtDay(co(estDaily, m, i), m.unit),
    current: showCurrent ? fmtHour(co(currentUg as number, m, i), m.unit) : null,
  }));
  // Evenly distributed columns (one each for the optional Base dose / Current).
  const colCount = 2 + (showBase ? 1 : 0) + 1 + (showCurrent ? 1 : 0);
  return (
    <div className="w-full rounded-[20px] border border-[#bcdcec] bg-[#e6f4f9] px-[28px] py-[24px]">
      <div className="grid gap-x-[16px] gap-y-[12px] items-center" style={{ gridTemplateColumns: `repeat(${colCount}, minmax(0, 1fr))` }}>
        {/* Header */}
        <span />
        <p className={`${hdr} font-normal text-[#5f8aa0]`}>Concentration</p>
        {showBase && <p className={`${hdr} font-normal text-[#00769e] pl-[18px]`}>Base dose</p>}
        <p className={`${hdr} font-bold text-[#00769e] pl-[18px]`}>Total 24 h</p>
        {showCurrent && <p className={`${hdr} font-bold text-[#00769e] pl-[18px]`}>Current window</p>}

        {/* Rows */}
        {rows.map(r => (
          <Fragment key={r.med.id}>
            <p className="font-['Roboto',sans-serif] font-bold text-[#00769e] text-[28px] tracking-[0.1px]" style={{ fontVariationSettings: "'wdth' 100" }}>{r.med.name}</p>
            <p className="font-['Roboto',sans-serif] text-[26px] tracking-[0.1px]" style={{ fontVariationSettings: "'wdth' 100" }}>
              <span className="font-bold text-[#00769e]">{r.med.concentration}</span> <span className="font-normal text-[#5f8aa0]">{r.med.unit}</span>
            </p>
            {r.base && <Chip value={r.base.value} unit={r.base.unit} />}
            <Chip value={r.total.value} unit={r.total.unit} />
            {r.current && <Chip value={r.current.value} unit={r.current.unit} />}
          </Fragment>
        ))}
      </div>
    </div>
  );
}
