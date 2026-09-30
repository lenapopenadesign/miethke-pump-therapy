/**
 * The base-dose-only 24h chart: a single base-dose bar across the day, shown on
 * the (empty) Intervals page before any intervals are added. The Add-interval
 * screen reuses it so its diagram looks identical, optionally overlaying a dashed
 * "NEW" column for the interval being placed.
 */
export function BaseDoseChart({
  hourly, unit, newStart, newEnd,
}: {
  hourly: string;
  unit: string;
  newStart?: number;
  newEnd?: number;
}) {
  const hasNew = newStart != null && newEnd != null && newEnd > newStart;
  const newLeft = hasNew ? (newStart! / 1440) * 100 : 0;
  const newWidth = hasNew ? ((newEnd! - newStart!) / 1440) * 100 : 0;
  return (
    <div className="relative w-full h-[330px] bg-[#fafcfb] border border-[#cedfd9] rounded-[16px]">
      {['00:00', '06:00', '12:00', '18:00', '24:00'].map((t, i) => {
        const first = i === 0, last = i === 4;
        return (
          <p key={t} className="absolute font-['Roboto',sans-serif] text-[#9db3ad] text-[26px] top-[18px] whitespace-nowrap"
             style={{ left: last ? undefined : first ? 16 : `${(i / 4) * 100}%`, right: last ? 16 : undefined, transform: first || last ? undefined : 'translateX(-50%)', fontVariationSettings: "'wdth' 100" }}>{t}</p>
        );
      })}
      {/* Plotting band (inset like a chart): base bar sits at the bottom. */}
      <div className="absolute left-[24px] right-[24px] bottom-[24px] h-[160px]">
        <div className="absolute left-0 right-0 bottom-0 h-[72px] bg-[#188d7b] rounded-[4px] flex items-center px-[24px]">
          <p className="font-['Roboto',sans-serif] font-bold text-[24px] text-white tracking-[0.1px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
            Base dose {hourly} {unit}/h
          </p>
        </div>
        {hasNew && (
          <div
            className="absolute bottom-0 h-[160px] rounded-[4px] flex items-start justify-center pt-[12px]"
            style={{ left: `${newLeft}%`, width: `${newWidth}%`, background: 'rgba(255, 255, 255, 0.55)', border: '2px dashed #0b786a' }}
          >
            <p className="font-['Roboto',sans-serif] font-bold text-[24px] text-[#096657] tracking-[0.1px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>NEW</p>
          </div>
        )}
      </div>
    </div>
  );
}
