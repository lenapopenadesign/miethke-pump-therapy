import {
  type DayPattern, type DayKey, WEEKEND_KEYS,
} from '../therapy';

const wdth = { fontVariationSettings: "'wdth' 100" } as const;

const MODES: { key: DayPattern; label: string }[] = [
  { key: 'same',            label: 'Daily' },
  { key: 'weekday-weekend', label: 'Weekday / Weekend' },
  { key: 'per-day',         label: 'Different every day' },
];

const WEEKDAY_WEEKEND_CHIPS: { key: DayKey; label: string }[] = [
  { key: 'monday',   label: 'Mon–Fri' },
  { key: 'saturday', label: 'Sat–Sun' },
];
const PER_DAY_CHIPS: { key: DayKey; label: string }[] = [
  { key: 'monday',    label: 'Mon' },
  { key: 'tuesday',   label: 'Tue' },
  { key: 'wednesday', label: 'Wed' },
  { key: 'thursday',  label: 'Thu' },
  { key: 'friday',    label: 'Fri' },
  { key: 'saturday',  label: 'Sat' },
  { key: 'sunday',    label: 'Sun' },
];

/** Segmented pill control shared by the two toggles. */
function Segmented<T extends string>({ options, isActive, onPick, size = 26 }:
  { options: { key: T; label: string }[]; isActive: (k: T) => boolean; onPick: (k: T) => void; size?: number }) {
  return (
    <div className="flex gap-[6px] p-[4px] rounded-[12px] bg-white border border-[#cedfd9]">
      {options.map(o => {
        const active = isActive(o.key);
        return (
          <div key={o.key} onClick={() => onPick(o.key)}
            className={`flex-1 flex items-center justify-center py-[14px] rounded-[8px] cursor-pointer select-none ${active ? 'bg-[#0b786a]' : ''}`}>
            <p className={`font-['Roboto',sans-serif] font-bold tracking-[0.1px] whitespace-nowrap ${active ? 'text-white' : 'text-[#596d68]'}`}
               style={{ ...wdth, fontSize: size }}>{o.label}</p>
          </div>
        );
      })}
    </div>
  );
}

/** Mode selector: Daily / Weekday-Weekend / Different every day. */
export function ModeToggle({ dayPattern, onChange }: { dayPattern: DayPattern; onChange: (p: DayPattern) => void }) {
  return <Segmented options={MODES} isActive={k => dayPattern === k} onPick={onChange} />;
}

// Normalise an arbitrary day to the representative key for the current pattern
// (weekday-weekend collapses the whole group onto Mon / Sat).
export function repDay(pattern: DayPattern, day: DayKey): DayKey {
  if (pattern === 'weekday-weekend') return WEEKEND_KEYS.includes(day) ? 'saturday' : 'monday';
  return day;
}

/**
 * Day-group switcher: Mon–Fri / Sat–Sun (weekday-weekend) or Mon…Sun (per-day).
 * Renders nothing for the 'same' pattern.
 */
export function DayGroupToggle({ dayPattern, viewDay, onPick }:
  { dayPattern: DayPattern; viewDay: DayKey; onPick: (d: DayKey) => void }) {
  if (dayPattern === 'same') return null;
  const chips = dayPattern === 'per-day' ? PER_DAY_CHIPS : WEEKDAY_WEEKEND_CHIPS;
  const rep = repDay(dayPattern, viewDay);
  return <Segmented options={chips} isActive={k => k === rep} onPick={onPick} size={dayPattern === 'per-day' ? 24 : 26} />;
}
