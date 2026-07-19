import { useState } from 'react';

const wdth = { fontVariationSettings: "'wdth' 100" } as const;
const FONT = "font-['Roboto',sans-serif]";

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
// Monday-first, matching the European date format the app uses throughout.
const WEEKDAYS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

/** Parse a dd.mm.yyyy string; falls back to today if it isn't well-formed. */
export function parseDate(s: string): Date {
  const m = /^(\d{2})\.(\d{2})\.(\d{4})$/.exec(s);
  if (!m) return new Date();
  return new Date(Number(m[3]), Number(m[2]) - 1, Number(m[1]));
}

/** Format a Date as dd.mm.yyyy — the app's canonical date string. */
export function formatDate(d: Date): string {
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  return `${dd}.${mm}.${d.getFullYear()}`;
}

const sameDay = (a: Date, b: Date) =>
  a.getDate() === b.getDate() && a.getMonth() === b.getMonth() && a.getFullYear() === b.getFullYear();

function Chevron({ dir }: { dir: 'left' | 'right' }) {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className={dir === 'left' ? 'rotate-180' : ''}>
      <path d="M9 5l7 7-7 7" stroke="#00769e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
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
  title = 'Refill due by',
}: {
  value: string;
  onPick: (d: string) => void;
  onClose: () => void;
  title?: string;
}) {
  const selected = parseDate(value);
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
      <div className="absolute inset-0 bg-[#0b1220]/60" onClick={onClose} />
      <div className="relative w-[1200px] bg-white rounded-t-[44px] flex flex-col px-[80px] pt-[24px] pb-[48px]">
        <div className="mx-auto w-[96px] h-[8px] rounded-full bg-[#d9dbde] shrink-0" />

        {/* Sheet header */}
        <div className="flex items-center justify-between pt-[24px] pb-[16px]">
          <p className={`${FONT} font-bold text-[#00769e] text-[36px] tracking-[0.1px]`} style={wdth}>{title}</p>
          <button onClick={onClose} className="size-[56px] rounded-full flex items-center justify-center cursor-pointer" aria-label="Close">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
              <path d="M6 6l12 12M18 6L6 18" stroke="#00769e" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Month navigation */}
        <div className="flex items-center justify-between py-[16px]">
          <button onClick={() => shiftMonth(-1)} className="size-[64px] rounded-full bg-[#cce4f1] flex items-center justify-center cursor-pointer" aria-label="Previous month">
            <Chevron dir="left" />
          </button>
          <p className={`${FONT} font-extrabold text-[#00769e] text-[32px] tracking-[0.1px]`} style={wdth}>
            {MONTHS[month]} {year}
          </p>
          <button onClick={() => shiftMonth(1)} className="size-[64px] rounded-full bg-[#cce4f1] flex items-center justify-center cursor-pointer" aria-label="Next month">
            <Chevron dir="right" />
          </button>
        </div>

        {/* Weekday header */}
        <div className="grid grid-cols-7 gap-[8px] pb-[8px]">
          {WEEKDAYS.map(d => (
            <p key={d} className={`${FONT} font-normal text-[#8a97a1] text-[22px] text-center tracking-[0.1px]`} style={wdth}>{d}</p>
          ))}
        </div>

        {/* Day grid */}
        <div className="grid grid-cols-7 gap-[8px]">
          {cells.map((day, i) => {
            if (day == null) return <div key={`pad-${i}`} className="h-[76px]" />;
            const date = new Date(year, month, day);
            const isSel = sameDay(date, selected);
            const isToday = sameDay(date, today);
            return (
              <button
                key={day}
                onClick={() => { onPick(formatDate(date)); onClose(); }}
                className={`h-[76px] rounded-[8px] flex items-center justify-center cursor-pointer ${
                  isSel ? 'bg-[#0094c5]' : isToday ? 'bg-[#e6f4f9] border-2 border-[#0094c5]' : 'bg-[#eef6fb]'
                }`}
              >
                <span
                  className={`${FONT} text-[28px] tracking-[0.1px] ${isSel ? 'font-extrabold text-white' : 'font-bold text-[#00769e]'}`}
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
