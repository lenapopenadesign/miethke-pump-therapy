import { useState } from 'react';
import { useNavigate } from '../navigation';
import {
  useTherapy, fmtTime, doseColor, estimatedDailyTotal, withBaseFillers,
  DAY_KEYS, WEEKDAY_KEYS, WEEKEND_KEYS,
  type DayPattern, type DayKey, type Interval,
} from '../therapy';
import { WizardShell } from '../components/WizardShell';
import { MedSummary } from '../components/MedSummary';

const imgEditPencil = "/icons/edit-pencil.svg";

type ChipKey =
  | 'weekdays' | 'weekend'
  | 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

const PER_DAY_CHIPS: { key: ChipKey; label: string; full: string }[] = [
  { key: 'monday',    label: 'Mon', full: 'Monday' },
  { key: 'tuesday',   label: 'Tue', full: 'Tuesday' },
  { key: 'wednesday', label: 'Wed', full: 'Wednesday' },
  { key: 'thursday',  label: 'Thu', full: 'Thursday' },
  { key: 'friday',    label: 'Fri', full: 'Friday' },
  { key: 'saturday',  label: 'Sat', full: 'Saturday' },
  { key: 'sunday',    label: 'Sun', full: 'Sunday' },
];
const WEEKDAY_WEEKEND_CHIPS: { key: ChipKey; label: string; full: string }[] = [
  { key: 'weekdays', label: 'Mon–Fri', full: 'Weekdays' },
  { key: 'weekend',  label: 'Sat–Sun', full: 'Weekend' },
];

const DAY_PATTERNS: { key: DayPattern; label: string }[] = [
  { key: 'same',            label: 'Same Daily' },
  { key: 'weekday-weekend', label: 'Weekday / Weekend' },
  { key: 'per-day',         label: 'Different every day' },
];

function IntervalsIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
      <rect x="5"  y="20" width="8" height="15" rx="2" fill="#0094c5" />
      <rect x="16" y="10" width="8" height="25" rx="2" fill="#0094c5" />
      <rect x="27" y="16" width="8" height="19" rx="2" fill="#0094c5" />
    </svg>
  );
}

function timeRangeLabel(startMin: number, endMin: number): string {
  const endDisplay = endMin >= 1440 ? '23:59' : fmtTime(Math.max(0, endMin - 1));
  return `${fmtTime(startMin)} - ${endDisplay}`;
}

function Chart({ intervals, baseDose }: { intervals: Interval[]; baseDose: number }) {
  const slots = withBaseFillers(intervals, baseDose);
  const maxDose = Math.max(baseDose, ...slots.map(s => s.dose), 1);
  const CHART_H = 200;
  const FLOOR = 150;       // bar baseline within the chart
  const MAX_BAR = 116;
  return (
    <div className="relative w-full bg-[#f7fafc] border border-[#d9dbde] rounded-[16px]" style={{ height: CHART_H }}>
      {['00:00', '06:00', '12:00', '18:00', '24:00'].map((t, i) => (
        <p key={t} className="absolute font-['Roboto',sans-serif] text-[#9ea8b2] text-[16px] top-[14px] whitespace-nowrap"
           style={{ left: `${[1.5, 24.5, 48.5, 72.5, 95.5][i]}%`, fontVariationSettings: "'wdth' 100" }}>{t}</p>
      ))}
      {slots.map(slot => {
        const left = (slot.startMin / 1440) * 100;
        const width = ((slot.endMin - slot.startMin) / 1440) * 100;
        const height = (slot.dose / maxDose) * MAX_BAR;
        return (
          <div key={slot.id}
            className="absolute rounded-[4px] flex items-start justify-center overflow-hidden"
            style={{ left: `${left}%`, width: `${width}%`, top: FLOOR - height, height, background: doseColor(slot.dose, baseDose), opacity: slot.isBase ? 0.7 : 1 }}>
            {width > 7 && (
              <p className="font-['Roboto',sans-serif] font-bold text-[13px] text-white pt-[6px] tracking-[0.1px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
                {(slot.dose / 24).toFixed(1)} µg/h
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}

export function IntervalsPopulated() {
  const navigate = useNavigate();
  const { intervalsByDay, baseDose, startAddingInterval, startEditingInterval, dayPattern, setDayPattern, medications } = useTherapy();
  const [activeChip, setActiveChip] = useState<ChipKey>('weekdays');
  const effectiveChip: ChipKey = (() => {
    if (dayPattern === 'per-day') return PER_DAY_CHIPS.some(c => c.key === activeChip) ? activeChip : 'monday';
    return WEEKDAY_WEEKEND_CHIPS.some(c => c.key === activeChip) ? activeChip : 'weekdays';
  })();
  const scope: DayKey[] = (() => {
    if (dayPattern === 'same') return DAY_KEYS;
    if (dayPattern === 'weekday-weekend') return effectiveChip === 'weekend' ? WEEKEND_KEYS : WEEKDAY_KEYS;
    return [effectiveChip as DayKey];
  })();
  const displayDay: DayKey = scope[0];
  const activeSet = intervalsByDay[displayDay];
  const addLabel = [...WEEKDAY_WEEKEND_CHIPS, ...PER_DAY_CHIPS].find(c => c.key === effectiveChip)?.full ?? 'Weekdays';
  const onAdd = () => { startAddingInterval('intervals-populated', scope); navigate('add-interval-when'); };
  const onEdit = (id: string) => { startEditingInterval(id, 'intervals-populated', scope); navigate('add-interval-when'); };
  const ordered = [...activeSet].sort((a, b) => a.startMin - b.startMin);
  const estDaily = estimatedDailyTotal(baseDose, activeSet);
  const chipDefs = dayPattern === 'per-day' ? PER_DAY_CHIPS : WEEKDAY_WEEKEND_CHIPS;

  return (
    <WizardShell step="therapy" onBack={() => navigate('base-dose')}>
      <div className="flex-1 flex flex-col gap-[24px]">
        {/* Title */}
        <div className="flex items-center gap-[16px]">
          <IntervalsIcon />
          <p className="font-['Roboto',sans-serif] font-extrabold text-[#00769e] text-[36px] tracking-[0.1px]" style={{ fontVariationSettings: "'wdth' 100" }}>Intervals</p>
          <div className="bg-[#0094c5] h-[36px] px-[16px] rounded-[18px] flex items-center">
            <p className="font-['Roboto',sans-serif] font-bold text-[16px] text-white tracking-[0.1px]" style={{ fontVariationSettings: "'wdth' 100" }}>optional</p>
          </div>
        </div>
        <p className="font-['Roboto',sans-serif] font-normal leading-[32px] text-[#45483c] text-[22px] tracking-[0.1px]" style={{ fontVariationSettings: "'wdth' 100" }}>
          Therapy will run at the base dose around the clock. Add intervals to vary the dose at specific times of day (e.g. higher during physiotherapy, lower at night).
        </p>

        {/* Day-pattern tabs */}
        <div className="flex gap-[6px] p-[4px] rounded-[12px] bg-[#f7fafc] border border-[#d9dbde]">
          {DAY_PATTERNS.map(p => {
            const active = dayPattern === p.key;
            return (
              <div key={p.key} onClick={() => setDayPattern(p.key)}
                className={`flex-1 flex items-center justify-center py-[12px] rounded-[8px] cursor-pointer select-none ${active ? 'bg-[#0094c5]' : ''}`}>
                <p className={`font-['Roboto',sans-serif] font-bold text-[22px] tracking-[0.1px] whitespace-nowrap ${active ? 'text-white' : 'text-[#667380]'}`} style={{ fontVariationSettings: "'wdth' 100" }}>{p.label}</p>
              </div>
            );
          })}
        </div>

        {/* Sub-tabs */}
        {dayPattern !== 'same' && (
          <div className="flex gap-[8px]">
            {chipDefs.map(chip => {
              const active = effectiveChip === chip.key;
              return (
                <div key={chip.key} onClick={() => setActiveChip(chip.key)}
                  className={`flex-1 flex items-center justify-center h-[60px] rounded-[12px] cursor-pointer select-none ${active ? 'bg-[#0094c5]' : 'bg-[#e6f4f9]'}`}>
                  <p className={`font-['Roboto',sans-serif] font-bold text-[22px] tracking-[0.1px] whitespace-nowrap ${active ? 'text-white' : 'text-[#5f7388]'}`} style={{ fontVariationSettings: "'wdth' 100" }}>{chip.label}</p>
                </div>
              );
            })}
          </div>
        )}

        <Chart intervals={activeSet} baseDose={baseDose} />

        {/* Interval list with Δ-from-base */}
        <div className="grid items-center [grid-template-columns:1fr_220px_160px_180px_56px] px-[16px]">
          <p className="font-['Roboto',sans-serif] font-bold text-[#00769e] text-[18px] tracking-[1px]">INTERVALS</p>
          <p className="font-['Roboto',sans-serif] font-bold text-[#00769e] text-[18px] tracking-[1px]">Time</p>
          <p className="font-['Roboto',sans-serif] font-bold text-[#00769e] text-[18px] tracking-[1px]">Δ from base</p>
          <p className="font-['Roboto',sans-serif] font-bold text-[#00769e] text-[18px] tracking-[1px]">Dose / h</p>
          <span />
        </div>
        <div className="flex flex-col gap-[12px]">
          {ordered.map(iv => {
            const pct = baseDose > 0 ? Math.round(((iv.dose - baseDose) / baseDose) * 100) : 0;
            return (
              <div key={iv.id} onClick={() => onEdit(iv.id)}
                className="grid items-center [grid-template-columns:1fr_220px_160px_180px_56px] bg-white border border-[#d9dbde] rounded-[12px] h-[72px] px-[16px] cursor-pointer">
                <p className="font-['Roboto',sans-serif] font-bold text-[#00769e] text-[24px] tracking-[0.1px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>{iv.label}</p>
                <p className="font-['Roboto',sans-serif] font-normal text-[#667380] text-[22px] tracking-[0.1px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>{timeRangeLabel(iv.startMin, iv.endMin)}</p>
                <p className="font-['Roboto',sans-serif] font-bold text-[#0094c5] text-[22px] tracking-[0.1px]" style={{ fontVariationSettings: "'wdth' 100" }}>{pct >= 0 ? '+' : '−'} {Math.abs(pct)} %</p>
                <p className="font-['Roboto',sans-serif] text-[#00769e] text-[22px] tracking-[0.1px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}><span className="font-bold">{(iv.dose / 24).toFixed(0)}</span> µg/h</p>
                <img alt="" src={imgEditPencil} className="size-[40px] block justify-self-end" />
              </div>
            );
          })}
        </div>

        {/* + Add interval */}
        <div onClick={onAdd} className="bg-white border-2 border-[#0094c5] h-[80px] rounded-[40px] w-full cursor-pointer flex items-center justify-center">
          <p className="font-['Roboto',sans-serif] font-bold text-[#0094c5] text-[24px] tracking-[0.1px] whitespace-pre" style={{ fontVariationSettings: "'wdth' 100" }}>{`+  Add interval to ${addLabel}`}</p>
        </div>

        <MedSummary baseDose={baseDose} estDaily={estDaily} medications={medications} />

        {/* Continue */}
        <div onClick={() => navigate('review')} className="mt-auto bg-[#0094c5] h-[88px] rounded-[80px] w-full cursor-pointer flex items-center justify-center">
          <p className="font-['Roboto',sans-serif] font-bold text-[24px] text-white tracking-[0.1px]" style={{ fontVariationSettings: "'wdth' 100" }}>Continue to review</p>
        </div>
      </div>
    </WizardShell>
  );
}
