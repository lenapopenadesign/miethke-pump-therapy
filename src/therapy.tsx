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

type TherapyState = {
  baseDose: number;
  setBaseDose: (n: number) => void;
  // Weekday intervals (Mon–Fri). The primary set the user edits on intervals-populated.
  intervals: Interval[];
  // Weekend intervals (Sat–Sun). Distinct schedule (e.g. later morning start).
  weekendIntervals: Interval[];
  draft: Draft;
  setDraft: (d: Draft) => void;
  editingId: string | null;
  startAddingInterval: (returnTo?: ScreenId) => void;
  startEditingInterval: (id: string, returnTo?: ScreenId) => void;
  commitDraft: () => void;
  removeInterval: (id: string) => void;
  sheetReturnTo: ScreenId;
  previewIntervalId: string | null;
  setPreviewIntervalId: (id: string | null) => void;
  strokeStrategy: StrokeStrategy;
  setStrokeStrategy: (s: StrokeStrategy) => void;
  dayPattern: DayPattern;
  setDayPattern: (p: DayPattern) => void;
};

const TherapyContext = createContext<TherapyState | null>(null);

const DEFAULT_DRAFT: Draft = {
  label: 'Morning peak',
  startMin: 8 * 60,
  endMin: 10 * 60 + 30,
  dose: 480,
};

// Weekday schedule: morning peak starts at 06:30.
const SEED_INTERVALS: Interval[] = [
  { id: 'iv-night',   label: 'Night',        startMin: 0,    endMin: 390,  dose: 200 }, // 00:00–06:30
  { id: 'iv-morning', label: 'Morning peak', startMin: 390,  endMin: 630,  dose: 480 }, // 06:30–10:30
  { id: 'iv-day',     label: 'Daytime',      startMin: 630,  endMin: 990,  dose: 360 }, // 10:30–16:30
  { id: 'iv-evening', label: 'Evening',      startMin: 990,  endMin: 1260, dose: 450 }, // 16:30–21:00
  { id: 'iv-wind',    label: 'Wind-down',    startMin: 1260, endMin: 1440, dose: 280 }, // 21:00–24:00
];

// Weekend schedule: morning peak starts ~2h later (08:30) — longer night,
// shorter morning peak. Daytime / Evening / Wind-down match the weekday set.
const SEED_WEEKEND_INTERVALS: Interval[] = [
  { id: 'iv-we-night',   label: 'Night',        startMin: 0,    endMin: 510,  dose: 200 }, // 00:00–08:30
  { id: 'iv-we-morning', label: 'Morning peak', startMin: 510,  endMin: 630,  dose: 480 }, // 08:30–10:30
  { id: 'iv-we-day',     label: 'Daytime',      startMin: 630,  endMin: 990,  dose: 360 }, // 10:30–16:30
  { id: 'iv-we-evening', label: 'Evening',      startMin: 990,  endMin: 1260, dose: 450 }, // 16:30–21:00
  { id: 'iv-we-wind',    label: 'Wind-down',    startMin: 1260, endMin: 1440, dose: 280 }, // 21:00–24:00
];

function uid() {
  return 'iv-' + Math.random().toString(36).slice(2, 9);
}

export function TherapyProvider({ children }: { children: ReactNode }) {
  const [baseDose, setBaseDose] = useState(360);
  const [intervals, setIntervals] = useState<Interval[]>(SEED_INTERVALS);
  const [weekendIntervals] = useState<Interval[]>(SEED_WEEKEND_INTERVALS);
  const [draft, setDraft] = useState<Draft>(DEFAULT_DRAFT);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [strokeStrategy, setStrokeStrategy] = useState<StrokeStrategy>(120);
  const [dayPattern, setDayPattern] = useState<DayPattern>('same');
  const [sheetReturnTo, setSheetReturnTo] = useState<ScreenId>('intervals-populated');
  const [previewIntervalId, setPreviewIntervalId] = useState<string | null>(null);

  function startAddingInterval(returnTo: ScreenId = 'intervals-populated') {
    setEditingId(null);
    setDraft(DEFAULT_DRAFT);
    setSheetReturnTo(returnTo);
  }

  function startEditingInterval(id: string, returnTo: ScreenId = 'intervals-populated') {
    const iv = intervals.find(x => x.id === id);
    if (!iv) return;
    setEditingId(id);
    setDraft({ label: iv.label, startMin: iv.startMin, endMin: iv.endMin, dose: iv.dose });
    setSheetReturnTo(returnTo);
  }

  function commitDraft() {
    if (editingId) {
      setIntervals(prev => prev.map(iv => iv.id === editingId ? { ...iv, ...draft } : iv));
    } else {
      setIntervals(prev => [...prev, { id: uid(), ...draft }]);
    }
    setEditingId(null);
  }

  function removeInterval(id: string) {
    setIntervals(prev => prev.filter(iv => iv.id !== id));
    if (editingId === id) setEditingId(null);
  }

  return (
    <TherapyContext.Provider value={{
      baseDose, setBaseDose,
      intervals, weekendIntervals,
      draft, setDraft,
      editingId,
      startAddingInterval, startEditingInterval, commitDraft, removeInterval, sheetReturnTo,
      previewIntervalId, setPreviewIntervalId,
      strokeStrategy, setStrokeStrategy,
      dayPattern, setDayPattern,
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
