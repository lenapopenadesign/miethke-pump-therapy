import { useState } from 'react';
import { formatDate } from '../therapy';

const wdth = { fontVariationSettings: "'wdth' 100" } as const;
const FONT = "font-['Roboto',sans-serif]";

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
// Monday-first, matching the European date format the app uses throughout.
const WEEKDAYS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

/** Parse a dd.mm.yyyy string, or null if it isn't one (the app uses 'N/A'). */
function tryParseDate(s: string | undefined): Date | null {
  const m = s ? /^(\d{2})\.(\d{2})\.(\d{4})$/.exec(s) : null;
  return m ? new Date(Number(m[3]), Number(m[2]) - 1, Number(m[1])) : null;
}

/** Parse a dd.mm.yyyy string; falls back to today if it isn't well-formed. */
export function parseDate(s: string): Date {
  return tryParseDate(s) ?? new Date();
}

/** Re-exported so callers can keep importing the formatter from the sheet. */
export { formatDate };

const sameDay = (a: Date, b: Date) =>
  a.getDate() === b.getDate() && a.getMonth() === b.getMonth() && a.getFullYear() === b.getFullYear();

function Chevron({ dir }: { dir: 'left' | 'right' }) {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className={dir === 'left' ? 'rotate-180' : ''}>
      <path d="M9 5l7 7-7 7" stroke="#096657" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/**
 * Bottom-sheet month calendar for picking the next refill date. Follows the
 * overlay-sheet pattern used by the Customised Delivery editor: a dimmed
 * backdrop that dismisses on click plus a rounded white sheet. Render into
 * WizardShell's `overlay` slot.
 */
export function DatePickerSheet({
  value,
  onPick,
  onClose,
  alertDate,
  title = 'Refill due by',
}: {
  value: string;
  onPick: (d: string) => void;
  onClose: () => void;
  /**
   * dd.mm.yyyy the pump is projected to reach its alert level. Marked in the
   * grid in the alert red, so the day the refill is being planned against is
   * visible while picking rather than something to remember from the chart.
   */
  alertDate?: string;
  title?: string;
}) {
  const selected = parseDate(value);
  const alert = tryParseDate(alertDate);
  // The month the grid is showing — starts on the selected date's month.
  const [cursor, setCursor] = useState(() => new Date(selected.getFullYear(), selected.getMonth(), 1));
  const today = new Date();

  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  // JS weeks start Sunday; shift so Monday is the first column.
  const lead = (new Date(year, month, 1).getDay() + 6) % 7;
  const cells: (number | null)[] = [
    ...Array<null>(lead).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const shiftMonth = (delta: number) => setCursor(new Date(year, month + delta, 1));

  return (
    <div className="absolute inset-0 flex flex-col justify-end">
      <div className="absolute inset-0 bg-[#0a1c19]/60" onClick={onClose} />
      <div className="relative w-[1200px] bg-white rounded-t-[44px] flex flex-col px-[80px] pt-[24px] pb-[48px]">
        <div className="mx-auto w-[96px] h-[8px] rounded-full bg-[#cedfd9] shrink-0" />

        {/* Sheet header */}
        <div className="flex items-center justify-between pt-[24px] pb-[16px]">
          <p className={`${FONT} font-bold text-[#096657] text-[36px] tracking-[0.1px]`} style={wdth}>{title}</p>
          <button onClick={onClose} className="size-[56px] rounded-full flex items-center justify-center cursor-pointer" aria-label="Close">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
              <path d="M6 6l12 12M18 6L6 18" stroke="#096657" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Month navigation */}
        <div className="flex items-center justify-between py-[16px]">
          <button onClick={() => shiftMonth(-1)} className="size-[64px] rounded-full bg-[#e9f7f2] flex items-center justify-center cursor-pointer" aria-label="Previous month">
            <Chevron dir="left" />
          </button>
          <p className={`${FONT} font-extrabold text-[#096657] text-[32px] tracking-[0.1px]`} style={wdth}>
            {MONTHS[month]} {year}
          </p>
          <button onClick={() => shiftMonth(1)} className="size-[64px] rounded-full bg-[#e9f7f2] flex items-center justify-center cursor-pointer" aria-label="Next month">
            <Chevron dir="right" />
          </button>
        </div>

        {/* Weekday header */}
        <div className="grid grid-cols-7 gap-[8px] pb-[8px]">
          {WEEKDAYS.map(d => (
            <p key={d} className={`${FONT} font-normal text-[#7d918b] text-[22px] text-center tracking-[0.1px]`} style={wdth}>{d}</p>
          ))}
        </div>

        {/* Day grid */}
        <div className="grid grid-cols-7 gap-[8px]">
          {cells.map((day, i) => {
            if (day == null) return <div key={`pad-${i}`} className="h-[76px]" />;
            const date = new Date(year, month, day);
            const isSel = sameDay(date, selected);
            const isToday = sameDay(date, today);
            // The pick wins the cell if it lands on the alert day — what the
            // clinician just chose outranks what they chose it against.
            const isAlert = alert != null && sameDay(date, alert);
            return (
              <button
                key={day}
                onClick={() => { onPick(formatDate(date)); onClose(); }}
                aria-label={isAlert ? `${day} — alert level reached` : undefined}
                className={`h-[76px] rounded-[8px] flex items-center justify-center cursor-pointer ${
                  isSel ? 'bg-[#0b786a]'
                    : isAlert ? 'bg-[rgba(204,84,87,0.2)]'
                    : isToday ? 'bg-[#f5fcf9] border-2 border-[#0b786a]'
                    : 'bg-[#f7fcfa]'
                }`}
              >
                <span
                  className={`${FONT} text-[28px] tracking-[0.1px] ${
                    isSel ? 'font-extrabold text-white' : isAlert ? 'font-bold text-[#cc5457]' : 'font-bold text-[#096657]'
                  }`}
                  style={wdth}
                >
                  {day}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
