import { morphineMgDay, bupivacaineMgDay } from '../therapy';

const img24h = "/icons/24h.gif";

type Props = {
  // Total Baclofen µg/day delivered over 24h (base + intervals weighted by length).
  estDailyUg: number;
  className?: string;
  style?: React.CSSProperties;
};

// "24 h" icon + 3 medication rows (Baclofen µg/d / Morphine mg/d / Bupivacaine mg/d).
// Matches the totals card in Figma IntervalsPopulated / Review / HomeActive.
export function DailyTotalsCard({ estDailyUg, className = '', style }: Props) {
  const morMgD = morphineMgDay(estDailyUg);
  const bupMgD = bupivacaineMgDay(estDailyUg);
  return (
    <div className={`flex items-center gap-[32px] ${className}`} style={style}>
      <div className="shrink-0 relative size-[140px]">
        <img alt="" src={img24h} className="absolute inset-0 size-full block" />
        <p
          className="absolute inset-0 flex items-center justify-center font-['Roboto',sans-serif] font-bold text-[#00769e] text-[32px] tracking-[0.1px]"
          style={{ fontVariationSettings: "'wdth' 100" }}
        >
          24 h
        </p>
      </div>
      <div className="flex flex-col gap-[12px] flex-1 min-w-px">
        <DailyRow label="Baclofen" value={fmtUg(estDailyUg)} unit="µg/d" />
        <DailyRow label="Morphine" value={fmtMg(morMgD)} unit="mg/d" />
        <DailyRow label="Bupivacaine" value={fmtMg(bupMgD)} unit="mg/d" />
      </div>
    </div>
  );
}

function DailyRow({ label, value, unit }: { label: string; value: string; unit: string }) {
  return (
    <div className="flex items-center gap-[24px]">
      <p className="font-['Roboto',sans-serif] font-bold text-[#00769e] text-[26px] tracking-[0.1px] w-[220px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
        {label}
      </p>
      <div className="flex-1 bg-[#e6f4f9] rounded-[8px] px-[24px] py-[14px] flex items-baseline gap-[10px]">
        <p className="font-['Roboto',sans-serif] font-bold text-[#00769e] text-[34px] tracking-[0.1px] leading-none" style={{ fontVariationSettings: "'wdth' 100" }}>
          {value}
        </p>
        <p className="font-['Roboto',sans-serif] font-normal text-[#667380] text-[24px] tracking-[0.1px]" style={{ fontVariationSettings: "'wdth' 100" }}>
          {unit}
        </p>
      </div>
    </div>
  );
}

function fmtUg(ugPerDay: number): string {
  return Math.round(ugPerDay).toString();
}

function fmtMg(mgPerDay: number): string {
  if (mgPerDay === 0) return '0';
  if (mgPerDay < 0.01) return mgPerDay.toFixed(3);
  return mgPerDay.toFixed(2);
}
