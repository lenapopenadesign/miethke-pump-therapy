import { useEffect, useState } from 'react';
import { fmtTime } from '../therapy';
import { Field, fieldValueCls } from './Field';

/* Parse a partial time entry into minutes. Accepts "9", "9:3", "09:30", "0930",
   "930" etc. Returns null while the entry isn't yet a usable time. */
export function parsePartialTime(raw: string): number | null {
  const digits = raw.replace(/[^0-9]/g, '');
  if (digits.length === 0) return null;
  let h: number, min: number;
  if (raw.includes(':')) {
    const [hp, mp = ''] = raw.split(':');
    h = parseInt(hp || '0', 10);
    min = parseInt(mp || '0', 10);
  } else if (digits.length <= 2) {
    h = parseInt(digits, 10);
    min = 0;
  } else {
    h = parseInt(digits.slice(0, digits.length - 2), 10);
    min = parseInt(digits.slice(-2), 10);
  }
  if (isNaN(h) || isNaN(min)) return null;
  return Math.min(23, h) * 60 + Math.min(59, min);
}

/**
 * Plain 24-hour HH:MM field. Keeps a local text buffer so partial entries can be
 * typed; commits to minutes whenever the text parses, and normalises back to
 * HH:MM on blur.
 */
export function TimeField({ value, onChange, width = 130 }: { value: number; onChange: (min: number) => void; width?: number }) {
  const [text, setText] = useState(() => fmtTime(value));
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    if (!focused) setText(fmtTime(value));
  }, [value, focused]);

  return (
    <Field className="shrink-0" style={{ width }}>
      <input
        type="text"
        inputMode="numeric"
        value={text}
        onFocus={() => setFocused(true)}
        onChange={e => {
          const raw = e.target.value;
          setText(raw);
          const min = parsePartialTime(raw);
          if (min !== null) onChange(min);
        }}
        onBlur={() => {
          setFocused(false);
          const min = parsePartialTime(text);
          if (min !== null) onChange(min);
          setText(fmtTime(min ?? value));
        }}
        className={`w-full bg-transparent outline-none border-0 p-0 ${fieldValueCls}`}
        style={{ fontFamily: 'Roboto, sans-serif', fontVariationSettings: "'wdth' 100" }}
      />
    </Field>
  );
}
