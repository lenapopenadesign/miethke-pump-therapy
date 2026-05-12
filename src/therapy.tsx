import { createContext, useContext, useState, type ReactNode } from 'react';
import type { ScreenId } from './navigation';

export type Interval = {
  id: string;
  label: string;
  startMin: number; // 0..1440
  endMin: number;
  dose: number; // µg/day Baclofen
};

export type Draft = Omit<Interval, 'id'>;

export type StrokeStrategy = 30 | 60 | 120 | 240 | 480;
export type DayPattern = 'same' | 'weekday-weekend' | 'per-day';

export const STROKE_OPTIONS: { min: StrokeStrategy; strokesPerDay: number; label: string }[] = [
  { min: 30,  strokesPerDay: 24, label: 'Most continuous' },
  { min: 60,  strokesPerDay: 12, label: 'Continuous' },
  { min: 120, strokesPerDay: 6,  label: 'Balanced' },
  { min: 240, strokesPerDay: 3,  label: 'Spaced' },
  { min: 480, strokesPerDay: 2,  label: 'Most spaced' },
];

export type DayGroup = 'weekdays' | 'weekend';

export type DayKey = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
export const DAY_KEYS: DayKey[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
export const WEEKDAY_KEYS: DayKey[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
export const WEEKEND_KEYS: DayKey[] = ['saturday', 'sunday'];

export type IntervalsByDay = Record<DayKey, Interval[]>;

type TherapyState = {
  baseDose: number;
  setBaseDose: (n: number) => void;
  // 7 independent per-day interval arrays. Edits propagate to the days listed
  // in editingScope (which the caller sets based on the current day-pattern +
  // active tab).
  intervalsByDay: IntervalsByDay;
  // Convenience getters: representative weekday (= monday) and weekend (= saturday).
  intervals: Interval[];
  weekendIntervals: Interval[];
  draft: Draft;
  setDraft: (d: Draft) => void;
  editingId: string | null;
  editingScope: DayKey[];
  startAddingInterval: (returnTo?: ScreenId, scope?: DayKey[]) => void;
  startEditingInterval: (id: string, returnTo?: ScreenId, scope?: DayKey[]) => void;
  commitDraft: () => void;
  removeInterval: (id: string) => void;
  sheetReturnTo: ScreenId;
  previewIntervalId: string | null;
  setPreviewIntervalId: (id: string | null) => void;
  strokeStrategy: StrokeStrategy;
  setStrokeStrategy: (s: StrokeStrategy) => void;
  dayPattern: DayPattern;
  setDayPattern: (p: DayPattern) => void;
  // When true, Review and HomeActive ignore stored intervals and render a
  // base-dose-only schedule. Set by the "Skip — use base dose only" CTA;
  // cleared automatically when the user starts adding an interval.
  useBaseOnly: boolean;
  setUseBaseOnly: (b: boolean) => void;
};

const TherapyContext = createContext<TherapyState | null>(null);

const DEFAULT_DRAFT: Draft = {
  label: 'Morning peak',
  startMin: 8 * 60,
  endMin: 10 * 60 + 30,
  dose: 480,
};

// Weekday (Mon–Fri) schedule. endMin is exclusive — displays as (endMin-1).
const SEED_INTERVALS: Interval[] = [
  { id: 'iv-night',   label: 'Night (sleep)',  startMin: 0,    endMin: 390,  dose: 200 }, // 00:00 – 06:29
  { id: 'iv-morning', label: 'Morning peak',   startMin: 390,  endMin: 481,  dose: 480 }, // 06:30 – 08:00
  { id: 'iv-day',     label: 'Daytime (base)', startMin: 481,  endMin: 1080, dose: 360 }, // 08:01 – 17:59
  { id: 'iv-evening', label: 'Evening peak',   startMin: 1080, endMin: 1261, dose: 450 }, // 18:00 – 21:00
  { id: 'iv-wind',    label: 'Wind-down',      startMin: 1261, endMin: 1440, dose: 280 }, // 21:01 – 23:59
];

// Weekend (Sat–Sun) schedule.
const SEED_WEEKEND_INTERVALS: Interval[] = [
  { id: 'iv-we-night',   label: 'Night (sleep)',  startMin: 0,    endMin: 510,  dose: 200 }, // 00:00 – 08:29
  { id: 'iv-we-morning', label: 'Morning peak',   startMin: 510,  endMin: 661,  dose: 480 }, // 08:30 – 11:00
  { id: 'iv-we-day',     label: 'Daytime (base)', startMin: 661,  endMin: 1080, dose: 360 }, // 11:01 – 17:59
  { id: 'iv-we-evening', label: 'Evening peak',   startMin: 1080, endMin: 1291, dose: 450 }, // 18:00 – 21:30
  { id: 'iv-we-wind',    label: 'Wind-down',      startMin: 1291, endMin: 1440, dose: 280 }, // 21:31 – 23:59
];

function uid() {
  return 'iv-' + Math.random().toString(36).slice(2, 9);
}

const SEED_BY_DAY: IntervalsByDay = {
  monday:    SEED_INTERVALS.map(iv => ({ ...iv })),
  tuesday:   SEED_INTERVALS.map(iv => ({ ...iv })),
  wednesday: SEED_INTERVALS.map(iv => ({ ...iv })),
  thursday:  SEED_INTERVALS.map(iv => ({ ...iv })),
  friday:    SEED_INTERVALS.map(iv => ({ ...iv })),
  saturday:  SEED_WEEKEND_INTERVALS.map(iv => ({ ...iv })),
  sunday:    SEED_WEEKEND_INTERVALS.map(iv => ({ ...iv })),
};

export function TherapyProvider({ children }: { children: ReactNode }) {
  const [baseDose, setBaseDoseRaw] = useState(360);
  const [intervalsByDay, setIntervalsByDay] = useState<IntervalsByDay>(SEED_BY_DAY);
  const [editingScope, setEditingScope] = useState<DayKey[]>([...WEEKDAY_KEYS]);
  const [draft, setDraft] = useState<Draft>(DEFAULT_DRAFT);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [strokeStrategy, setStrokeStrategy] = useState<StrokeStrategy>(120);
  const [dayPattern, setDayPattern] = useState<DayPattern>('same');
  const [sheetReturnTo, setSheetReturnTo] = useState<ScreenId>('intervals-populated');
  const [previewIntervalId, setPreviewIntervalId] = useState<string | null>(null);
  const [useBaseOnly, setUseBaseOnly] = useState(false);

  // The "Daytime (base)" interval is the base dose by definition — propagate
  // base-dose changes to every day's daytime interval.
  const setBaseDose = (n: number) => {
    setBaseDoseRaw(n);
    const updateBase = (iv: Interval) => iv.label.startsWith('Daytime') ? { ...iv, dose: n } : iv;
    setIntervalsByDay(prev => {
      const next: IntervalsByDay = { ...prev };
      for (const day of DAY_KEYS) next[day] = next[day].map(updateBase);
      return next;
    });
  };

  // Derived "representative" weekday + weekend views — used by Review and
  // HomeActive which still toggle by group rather than per day.
  const intervals = intervalsByDay.monday;
  const weekendIntervals = intervalsByDay.saturday;

  function startAddingInterval(returnTo: ScreenId = 'intervals-populated', scope: DayKey[] = [...WEEKDAY_KEYS]) {
    setEditingId(null);
    setDraft(DEFAULT_DRAFT);
    setSheetReturnTo(returnTo);
    setEditingScope(scope.length ? scope : [...WEEKDAY_KEYS]);
    setUseBaseOnly(false);
  }

  function startEditingInterval(id: string, returnTo: ScreenId = 'intervals-populated', scope?: DayKey[]) {
    // Find the interval in any day's array.
    let iv: Interval | undefined;
    let foundIn: DayKey | undefined;
    for (const day of DAY_KEYS) {
      iv = intervalsByDay[day].find(x => x.id === id);
      if (iv) { foundIn = day; break; }
    }
    if (!iv) return;
    setEditingId(id);
    setDraft({ label: iv.label, startMin: iv.startMin, endMin: iv.endMin, dose: iv.dose });
    setSheetReturnTo(returnTo);
    setEditingScope(scope && scope.length > 0 ? scope : (foundIn ? [foundIn] : [...WEEKDAY_KEYS]));
  }

  function commitDraft() {
    setIntervalsByDay(prev => {
      const next: IntervalsByDay = { ...prev };
      if (editingId) {
        for (const day of editingScope) {
          next[day] = next[day].map(iv => iv.id === editingId ? { ...iv, ...draft } : iv);
        }
      } else {
        const newId = uid();
        for (const day of editingScope) {
          next[day] = [...next[day], { id: newId, ...draft }];
        }
      }
      return next;
    });
    setEditingId(null);
  }

  function removeInterval(id: string) {
    setIntervalsByDay(prev => {
      const next: IntervalsByDay = { ...prev };
      // Delete the id from the days currently in scope. If editingScope is empty,
      // fall back to deleting from any day that contains it.
      const days = editingScope.length > 0 ? editingScope : DAY_KEYS;
      for (const day of days) {
        next[day] = next[day].filter(iv => iv.id !== id);
      }
      return next;
    });
    if (editingId === id) setEditingId(null);
  }

  return (
    <TherapyContext.Provider value={{
      baseDose, setBaseDose,
      intervalsByDay,
      intervals, weekendIntervals,
      draft, setDraft,
      editingId, editingScope,
      startAddingInterval, startEditingInterval, commitDraft, removeInterval, sheetReturnTo,
      previewIntervalId, setPreviewIntervalId,
      strokeStrategy, setStrokeStrategy,
      dayPattern, setDayPattern,
      useBaseOnly, setUseBaseOnly,
    }}>
      {children}
    </TherapyContext.Provider>
  );
}

export function useTherapy() {
  const ctx = useContext(TherapyContext);
  if (!ctx) throw new Error('useTherapy outside provider');
  return ctx;
}

// -------- Derivations --------

export const morphineMgDay = (baclofenUgDay: number) => baclofenUgDay * 0.00139;
export const bupivacaineMgDay = (baclofenUgDay: number) => baclofenUgDay * 0.00417;
export const hourlyUg = (dailyUg: number) => dailyUg / 24;

// Color tier for a dose relative to base dose.
export function doseColor(dose: number, base: number): string {
  const r = dose / base;
  if (r < 0.7) return '#8cc7e8';   // light
  if (r < 0.9) return '#4da6d6';   // medium-light
  if (r < 1.3) return '#0b7fa8';   // normal teal
  return '#055273';                // dark navy
}

export function fmtTime(min: number): string {
  const h = Math.floor(min / 60) % 24;
  const m = min % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export function parseTime(s: string): number {
  const [h, m] = s.split(':').map(Number);
  return h * 60 + m;
}

// A "slot" returned by withBaseFillers: either a real user interval, or a synthetic
// base-dose filler covering a gap between intervals. The chart treats both the same
// (positioned/sized/coloured by dose), but only real intervals are clickable.
export type Slot = {
  id: string;
  startMin: number;
  endMin: number;
  dose: number;
  label: string;
  isBase: boolean; // true → synthetic base-dose filler (no underlying user interval)
};

/** Fill any gap (and leading/trailing edges) with a synthetic base-dose slot. */
export function withBaseFillers(intervals: Interval[], baseDose: number): Slot[] {
  const sorted = [...intervals].sort((a, b) => a.startMin - b.startMin);
  const out: Slot[] = [];
  let cursor = 0;
  for (const iv of sorted) {
    if (iv.startMin > cursor) {
      out.push({ id: `__base-${cursor}`, startMin: cursor, endMin: iv.startMin, dose: baseDose, label: 'Base dose', isBase: true });
    }
    out.push({ id: iv.id, startMin: iv.startMin, endMin: iv.endMin, dose: iv.dose, label: iv.label, isBase: false });
    cursor = Math.max(cursor, iv.endMin);
  }
  if (cursor < 1440) {
    out.push({ id: `__base-${cursor}`, startMin: cursor, endMin: 1440, dose: baseDose, label: 'Base dose', isBase: true });
  }
  return out;
}

// Estimated daily total = weighted average across intervals + base for any uncovered minutes
export function estimatedDailyTotal(base: number, intervals: Interval[]): number {
  let total = 0;
  let coveredMin = 0;
  for (const iv of intervals) {
    const len = Math.max(0, iv.endMin - iv.startMin);
    total += (iv.dose * len) / 1440;
    coveredMin += len;
  }
  const uncovered = Math.max(0, 1440 - coveredMin);
  total += (base * uncovered) / 1440;
  return total;
}
