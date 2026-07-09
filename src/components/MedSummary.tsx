import { coDoseUgDay, concUgPerUl, doseStringsFor, type Medication } from '../therapy';

// Match the Review page's bars: medium-blue medication header, light value bars.
const HEAD_BG = '#c4e1ef';
const VAL_BG = '#d8ecf7';
const wdth = { fontVariationSettings: "'wdth' 100" } as const;

function ValueBar({ value, unit }: { value: string; unit: string }) {
  return (
    <div className="rounded-[8px] h-[60px] flex items-baseline px-[20px]" style={{ background: VAL_BG }}>
      <span className="font-['Roboto',sans-serif] font-bold text-[#00769e] text-[32px] tracking-[0.1px] self-center" style={wdth}>{value}</span>
      <span className="font-['Roboto',sans-serif] font-normal text-[#5f8aa0] text-[22px] ml-[8px] self-center" style={wdth}>{unit}</span>
    </div>
  );
}

const hdr = "font-['Roboto',sans-serif] font-bold text-[#00769e] text-[22px] tracking-[1px] pb-[2px] pl-[4px]";

/**
 * The per-medication 24h summary used on the Home (active) and Intervals screens.
 * Presented like the Review page: each medication name + concentration sits in a
 * filled header bar, with a configurable set of value columns in light bars.
 *
 * Columns render only when their data is supplied:
 *  - Base dose      (per day)          — `baseDose`
 *  - Default delivery (per delivery)   — `baseDose` + `bolusCount`
 *  - Total 24 h     (per day)          — `estDaily`
 *  - Last delivery  (per delivery)     — `lastDeliveryUg` + `bolusCount`
 */
export function MedSummary({
  baseDose, estDaily, lastDeliveryUg, bolusCount, medications,
}: {
  baseDose?: number;
  estDaily?: number;
  lastDeliveryUg?: number;
  bolusCount?: number;
  medications: Medication[];
}) {
  const c0 = medications[0] ? concUgPerUl(medications[0]) : 1;
  const bolusN = Math.max(1, bolusCount ?? 1);
  const co = (ug: number, m: Medication, i: number) => (i === 0 ? ug : coDoseUgDay(ug, c0, concUgPerUl(m)));
  const perDay = (ug: number, unit: string) => ({ value: doseStringsFor(ug, unit).perDay, unit: `${doseStringsFor(0, unit).unit}/d` });
  const perDel = (ug: number, unit: string) => ({ value: doseStringsFor(ug / bolusN, unit).perDay, unit: `${doseStringsFor(0, unit).unit}/del` });

  const showBase = baseDose != null;
  const showTotal = estDaily != null;
  const showLast = lastDeliveryUg != null && bolusCount != null;

  const rows = medications.map((m, i) => ({
    med: m,
    base: showBase ? perDay(co(baseDose as number, m, i), m.unit) : null,
    total: showTotal ? perDay(co(estDaily as number, m, i), m.unit) : null,
    last: showLast ? perDel(co(lastDeliveryUg as number, m, i), m.unit) : null,
  }));
  const valCols = (showBase ? 1 : 0) + (showTotal ? 1 : 0) + (showLast ? 1 : 0);
  const gridTemplateColumns = `minmax(0, 1.6fr) ${'minmax(0, 1fr) '.repeat(valCols).trim()}`;

  return (
    <div className="w-full flex flex-col gap-[8px]">
      {/* Column headers */}
      <div className="grid gap-[12px] items-center" style={{ gridTemplateColumns }}>
        <span />
        {showBase && <p className={hdr}>Dose per day</p>}
        {showTotal && <p className={hdr}>Total 24 h</p>}
        {showLast && <p className={hdr}>Last delivery</p>}
      </div>

      {/* One row per medication */}
      {rows.map(r => (
        <div key={r.med.id} className="grid gap-[12px] items-center" style={{ gridTemplateColumns }}>
          <div className="rounded-[8px] h-[60px] flex items-baseline px-[20px]" style={{ background: HEAD_BG }}>
            <span className="font-['Roboto',sans-serif] font-bold text-[#00769e] text-[28px] tracking-[0.1px] self-center" style={wdth}>{r.med.name}</span>
            <span className="font-['Roboto',sans-serif] font-normal text-[#5f8aa0] text-[22px] ml-[10px] self-center" style={wdth}>{r.med.concentration} {r.med.unit}</span>
          </div>
          {r.base && <ValueBar value={r.base.value} unit={r.base.unit} />}
          {r.total && <ValueBar value={r.total.value} unit={r.total.unit} />}
          {r.last && <ValueBar value={r.last.value} unit={r.last.unit} />}
        </div>
      ))}
    </div>
  );
}
