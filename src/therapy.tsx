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

// A "stroke strategy" is a bundle multiplier: how many 10µl strokes are grouped
// into a single delivery. bundle=1 is the most continuous (minimum interval);
// larger bundles mean fewer, larger deliveries spaced further apart.
export type StrokeStrategy = 1 | 2 | 4 | 8 | 16;
export type DayPattern = 'same' | 'weekday-weekend' | 'per-day';

export const STROKE_OPTIONS: { bundle: StrokeStrategy; label: string }[] = [
  { bundle: 1,  label: 'Most continuous' },
  { bundle: 2,  label: 'Continuous' },
  { bundle: 4,  label: 'Balanced' },
  { bundle: 8,  label: 'Spaced' },
  { bundle: 16, label: 'Most spaced' },
];

// Pump physics: each stroke delivers a fixed micro-volume, and the hardware can
// push at most a fixed number of times per minute. Stroke volume is 4 nl
// (0.004 µl) — at the default 360 µg/d Baclofen @ 100 mg/ml this yields a
// most-continuous interval of ~1.6 min (matching the Figma reference).
export const STROKE_VOLUME_UL = 0.004;
export const MAX_PUSHES_PER_MIN = 15; // → minimum interval 1/15 min = 4 s

export type DeliveryPlan = {
  ugPerStroke: number;
  strokesPerDay: number;
  intervalMin: number;     // minutes between deliveries
  dosePerDelivery: number; // µg per delivery (bundle × per-stroke)
  deliveriesPerDay: number;
};

/**
 * Compute the medication delivery schedule for a given base dose and (primary)
 * medication concentration. Concentration in mg/ml equals µg/µl numerically.
 * `bundle` groups that many strokes into one delivery (default 1 = most
 * continuous = minimum possible interval). The interval is clamped so we never
 * exceed MAX_PUSHES_PER_MIN.
 */
export function deliveryPlan(baseDoseUgDay: number, concMgPerMl: number, bundle = 1): DeliveryPlan {
  const ugPerStroke = STROKE_VOLUME_UL * concMgPerMl;            // 10 µg @ conc 1 mg/ml
  const strokesPerDay = ugPerStroke > 0 ? baseDoseUgDay / ugPerStroke : 0; // 360/10 = 36
  const baseInterval = strokesPerDay > 0 ? 1440 / strokesPerDay : Infinity; // 40 min
  const intervalMin = Math.max(baseInterval * bundle, 1 / MAX_PUSHES_PER_MIN);
  return {
    ugPerStroke,
    strokesPerDay,
    intervalMin,
    dosePerDelivery: ugPerStroke * bundle,
    deliveriesPerDay: bundle > 0 ? strokesPerDay / bundle : 0,
  };
}

export type DayGroup = 'weekdays' | 'weekend';

export type DayKey = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
export const DAY_KEYS: DayKey[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
export const WEEKDAY_KEYS: DayKey[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
export const WEEKEND_KEYS: DayKey[] = ['saturday', 'sunday'];

export type IntervalsByDay = Record<DayKey, Interval[]>;

export type Medication = {
  id: string;
  name: string;
  concentration: number; // mg/ml (== µg/µl numerically)
  unit: string;
};

type TherapyState = {
  // Editable medication list. medications[0] is the primary drug (Baclofen) and
  // drives the base dose + delivery-interval calculation.
  medications: Medication[];
  addMedication: () => void;
  updateMedication: (id: string, patch: Partial<Omit<Medication, 'id'>>) => void;
  removeMedication: (id: string) => void;
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
  label: '',
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

const SEED_MEDICATIONS: Medication[] = [
  { id: 'med-baclofen',    name: 'Baclofen',    concentration: 100, unit: 'µg/ml' },
  { id: 'med-morphine',    name: 'Morphine',    concentration: 10,  unit: 'mg/ml' },
  { id: 'med-bupivacaine', name: 'Bupivacaine', concentration: 5,   unit: 'mg/ml' },
];

export function TherapyProvider({ children }: { children: ReactNode }) {
  const [medications, setMedications] = useState<Medication[]>(SEED_MEDICATIONS);
  const [baseDose, setBaseDoseRaw] = useState(360);
  const [intervalsByDay, setIntervalsByDay] = useState<IntervalsByDay>(SEED_BY_DAY);
  const [editingScope, setEditingScope] = useState<DayKey[]>([...WEEKDAY_KEYS]);
  const [draft, setDraft] = useState<Draft>(DEFAULT_DRAFT);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [strokeStrategy, setStrokeStrategy] = useState<StrokeStrategy>(1);

  const addMedication = () =>
    setMedications(prev => [...prev, { id: uid(), name: '', concentration: 0, unit: 'mg/ml' }]);
  const updateMedication = (id: string, patch: Partial<Omit<Medication, 'id'>>) =>
    setMedications(prev => prev.map(m => (m.id === id ? { ...m, ...patch } : m)));
  const removeMedication = (id: string) =>
    setMedications(prev => prev.filter(m => m.id !== id));
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
      medications, addMedication, updateMedication, removeMedication,
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

export const hourlyUg = (dailyUg: number) => dailyUg / 24;

/**
 * Daily mass (µg/day) of a co-delivered medication. The primary drug's dose
 * fixes the delivered volume (primaryUgDay / primaryConc); every other drug in
 * the mixture is co-delivered in that same volume, so its mass scales by the
 * concentration ratio. Concentration is mg/ml, which equals µg/µl numerically.
 */
export function coDoseUgDay(primaryUgDay: number, primaryConc: number, medConc: number): number {
  if (primaryConc <= 0) return 0;
  return primaryUgDay * (medConc / primaryConc);
}

/**
 * The mass-unit family ('mg' or 'µg') implied by a medication's concentration
 * unit. A drug dosed at mg/ml is reported in mg; one at µg/ml is reported in µg.
 * `div` converts an internal µg amount into that unit.
 */
export function doseUnitFor(concUnit: string): { unit: 'mg' | 'µg'; div: number } {
  return concUnit.includes('µg') ? { unit: 'µg', div: 1 } : { unit: 'mg', div: 1000 };
}

// Adaptive formatter: integer-ish above 100, more decimals as the value shrinks
// (mg doses are numerically tiny). Keeps ~3 significant figures.
function fmtDose(v: number): string {
  if (!isFinite(v) || v === 0) return '0';
  const a = Math.abs(v);
  if (a >= 100) return Math.round(v).toString();
  if (a >= 1) return v.toFixed(1);
  if (a >= 0.1) return v.toFixed(2);
  if (a >= 0.01) return v.toFixed(3);
  return v.toFixed(4);
}

/**
 * Format a µg/day mass in the unit family the medication's concentration unit
 * implies. perDay and perHour are derived from the SAME value (perHour =
 * perDay / 24) so the two readings are always linked and consistent.
 */
export function doseStringsFor(ugDay: number, concUnit: string): { unit: string; perDay: string; perHour: string } {
  const { unit, div } = doseUnitFor(concUnit);
  const perDayVal = ugDay / div;
  return { unit, perDay: fmtDose(perDayVal), perHour: fmtDose(perDayVal / 24) };
}

/**
 * Legacy magnitude-based formatter (auto-switches to mg above 1000 µg). Retained
 * for hardware-level pump readouts that aren't tied to a medication's unit.
 */
export function doseStrings(ugDay: number): { unit: string; perDay: string; perHour: string } {
  const useMg = ugDay >= 1000;
  const div = useMg ? 1000 : 1;
  const fmt = (v: number) => (useMg ? v.toFixed(2) : v >= 100 ? Math.round(v).toString() : v.toFixed(1));
  return { unit: useMg ? 'mg' : 'µg', perDay: fmt(ugDay / div), perHour: fmt(ugDay / 24 / div) };
}

// Color tier for a dose relative to base dose.
export function doseColor(dose: number, base: number): string {
  const r = dose / base;
  if (r < 0.7) return '#8cc7e8';   // light
  if (r < 0.9) return '#4da6d6';   // medium-light
  if (r < 1.3) return '#0b7fa8';   // normal teal
  return '#055273';                // dark navy
}

/** Human-readable delivery interval, e.g. "40 minutes", "1.6 minutes", "4 seconds". */
export function fmtInterval(min: number): string {
  if (min < 1) return `${Math.round(min * 60)} seconds`;
  const rounded = min >= 10 ? Math.round(min) : Math.round(min * 10) / 10;
  return `${rounded} minutes`;
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
