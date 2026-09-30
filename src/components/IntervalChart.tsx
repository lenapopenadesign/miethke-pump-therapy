import { withBaseFillers, doseColor, doseStringsFor, type Interval } from '../therapy';

/**
 * 24h dose chart: base-dose fillers + interval bars, with time-axis labels.
 * Shared by the Intervals and Add-interval screens so the diagram looks
 * identical on both.
 */
export function IntervalChart({ intervals, baseDose, unit }: { intervals: Interval[]; baseDose: number; unit: string }) {
  const slots = withBaseFillers(intervals, baseDose);
  const maxDose = Math.max(baseDose, ...slots.map(s => s.dose), 1);
  const CHART_H = 330, FLOOR = 256, MAX_BAR = 210;
  return (
    <div className="relative w-full bg-[#fafcfb] border border-[#cedfd9] rounded-[16px]" style={{ height: CHART_H }}>
      {['00:00', '06:00', '12:00', '18:00', '24:00'].map((t, i) => {
        const first = i === 0, last = i === 4;
        return (
          <p key={t} className="absolute font-['Roboto',sans-serif] text-[#9db3ad] text-[26px] top-[18px] whitespace-nowrap"
             style={{ left: last ? undefined : first ? 16 : `${(i / 4) * 100}%`, right: last ? 16 : undefined, transform: first || last ? undefined : 'translateX(-50%)', fontVariationSettings: "'wdth' 100" }}>{t}</p>
        );
      })}
      {slots.map(slot => {
        const left = (slot.startMin / 1440) * 100;
        const width = ((slot.endMin - slot.startMin) / 1440) * 100;
        const height = (slot.dose / maxDose) * MAX_BAR;
        return (
          <div key={slot.id} className="absolute rounded-[4px] flex items-start justify-center overflow-hidden"
            style={{ left: `${left}%`, width: `${width}%`, top: FLOOR - height, height, background: doseColor(slot.dose, baseDose), opacity: slot.isBase ? 0.7 : 1 }}>
            {width > 7 && (
              <p className="font-['Roboto',sans-serif] font-bold text-[20px] text-white pt-[10px] tracking-[0.1px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
                {doseStringsFor(slot.dose, unit).perHour} {doseStringsFor(slot.dose, unit).unit}/h
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
