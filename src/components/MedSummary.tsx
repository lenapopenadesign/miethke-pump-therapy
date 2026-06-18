import { coDoseUgDay, concUgPerUl, doseStringsFor, type Medication } from '../therapy';

function fmtDay(ug: number, concUnit: string): { value: string; unit: string } {
  const s = doseStringsFor(ug, concUnit);
  return { value: s.perDay, unit: `${s.unit}/d` };
}

function fmtHour(ug: number, concUnit: string): { value: string; unit: string } {
  const s = doseStringsFor(ug, concUnit);
  return { value: s.perHour, unit: `${s.unit}/h` };
}

// Match the Review page's bars: medium-blue medication header, light value bars.
const HEAD_BG = '#c4e1ef';
const VAL_BG = '#d8ecf7';
const wdth = { fontVariationSettings: "'wdth' 100" } as const;

function ValueBar({ value, unit }: { value: string; unit: string }) {
  return (
    <div className="rounded-[8px] h-[60px] flex items-baseline px-[20px]" style={{ background: VAL_BG }}>
      <span className="font-['Roboto',sans-serif] font-bold text-[#00769e] text-[28px] tracking-[0.1px] self-center" style={wdth}>{value}</span>
      <span className="font-['Roboto',sans-serif] font-normal text-[#5f8aa0] text-[22px] ml-[8px] self-center" style={wdth}>{unit}</span>
    </div>
  );
}

const hdr = "font-['Roboto',sans-serif] font-bold text-[#00769e] text-[22px] tracking-[1px] pb-[2px] pl-[4px]";

/**
 * The per-medication 24h summary used on the Home (active) and Intervals
 * screens. Presented like the Review page: each medication name + concentration
 * sits in a filled header bar, with its Total 24 h — plus an optional Base dose /
 * Current window — in light value bars.
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
  const valCols = (showBase ? 1 : 0) + 1 + (showCurrent ? 1 : 0);
  const gridTemplateColumns = `minmax(0, 1.6fr) ${'minmax(0, 1fr) '.repeat(valCols).trim()}`;

  return (
    <div className="w-full flex flex-col gap-[8px]">
      {/* Column headers */}
      <div className="grid gap-[12px] items-center" style={{ gridTemplateColumns }}>
        <span />
        {showBase && <p className={hdr}>Base dose</p>}
        <p className={hdr}>Total 24 h</p>
        {showCurrent && <p className={hdr}>Current window</p>}
      </div>

      {/* One row per medication */}
      {rows.map(r => (
        <div key={r.med.id} className="grid gap-[12px] items-center" style={{ gridTemplateColumns }}>
          <div className="rounded-[8px] h-[60px] flex items-baseline px-[20px]" style={{ background: HEAD_BG }}>
            <span className="font-['Roboto',sans-serif] font-bold text-[#00769e] text-[28px] tracking-[0.1px] self-center" style={wdth}>{r.med.name}</span>
            <span className="font-['Roboto',sans-serif] font-normal text-[#5f8aa0] text-[22px] ml-[10px] self-center" style={wdth}>{r.med.concentration} {r.med.unit}</span>
          </div>
          {r.base && <ValueBar value={r.base.value} unit={r.base.unit} />}
          <ValueBar value={r.total.value} unit={r.total.unit} />
          {r.current && <ValueBar value={r.current.value} unit={r.current.unit} />}
        </div>
      ))}
    </div>
  );
}
