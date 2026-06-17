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

// Each strategy maps to a fixed time between deliveries, from "most continuous"
// (28 min) to "most spaced" (~4 h). Intervals are intentionally uneven.
export const STROKE_OPTIONS: { bundle: StrokeStrategy; label: string; intervalMin: number }[] = [
  { bundle: 1,  label: 'Most continuous', intervalMin: 28 },
  { bundle: 2,  label: 'Continuous',      intervalMin: 59 },
  { bundle: 4,  label: 'Balanced',        intervalMin: 124 },
  { bundle: 8,  label: 'Spaced',          intervalMin: 182 },
  { bundle: 16, label: 'Most spaced',     intervalMin: 239 },
];

// Pump physics: each stroke delivers a fixed micro-volume, and the hardware can
// push at most a fixed number of times per minute. Stroke volume is 4 nl
// (0.004 µl) — at the default 360 µg/d Baclofen @ 100 mg/ml this yields a
// most-continuous interval of ~1.6 min (matching the Figma reference).
export const STROKE_VOLUME_UL = 0.004;
export const MAX_PUSHES_PER_MIN = 15; // → minimum interval 1/15 min = 4 s

// Physical implant spec — single source of truth for the pump reservoir and the
// catheter. The implant detail page and the home implant card both read these so
// the values can never drift apart.
export const RESERVOIR_ML = 40;
export const CATHETER = {
  brand: 'B.Braun',
  originalLengthCm: 43,
  removedLengthCm: 11,
  implantedLengthCm: 32,
  insideDiameterMm: 0.8,
  outsideDiameterMm: 0.9,
  volumeMl: 0.2,
} as const;

export type DeliveryPlan = {
  ugPerStroke: number;
  strokesPerDay: number;
  intervalMin: number;     // minutes between deliveries
  dosePerDelivery: number; // µg per delivery (bundle × per-stroke)
  deliveriesPerDay: number;
};

/**
 * Delivery schedule for a chosen time-between-deliveries (intervalMin). The
 * reservoir delivers the base dose spread evenly across the day, so each
 * delivery carries baseDose / deliveriesPerDay. All values track the base dose.
 */
export function deliveryPlan(baseDoseUgDay: number, intervalMin: number): DeliveryPlan {
  const deliveriesPerDay = intervalMin > 0 ? 1440 / intervalMin : 0;
  const dosePerDelivery = deliveriesPerDay > 0 ? baseDoseUgDay / deliveriesPerDay : 0;
  return {
    ugPerStroke: dosePerDelivery,
    strokesPerDay: deliveriesPerDay,
    intervalMin,
    dosePerDelivery,
    deliveriesPerDay,
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
  // Which wizard the shared therapy screens are part of. 'refill' adds the
  // Filling + Medication steps and the "Refill" chrome; 'setup' is onboarding.
  flowMode: FlowMode;
  setFlowMode: (m: FlowMode) => void;
  // Reservoir refill bookkeeping. completeRefill() tops the reservoir up and
  // pushes the next-refill date out by a full-fill interval (~78 days). The fill
  // level is a physical property — it only changes on refill, NOT when a therapy
  // is added.
  refillDate: string;
  fillFraction: number; // 0..1 of the 40 ml reservoir
  completeRefill: () => void;
  // Whether a therapy has been set up + activated on the implant. Drives which
  // home screen ("home-active" vs "home-no-therapy") the chrome returns to.
  therapyActive: boolean;
  setTherapyActive: (b: boolean) => void;
  // The home screen matching the current therapy state — use for "back to home".
  homeScreen: ScreenId;
};

export type FlowMode = 'setup' | 'refill';

// Next-refill date `days` from today, formatted dd.mm.yyyy.
function refillDateInDays(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  return `${dd}.${mm}.${d.getFullYear()}`;
}

const TherapyContext = createContext<TherapyState | null>(null);

// Preset to the (omitted) morning peak, so adding the first interval in a demo
// lands on sensible values the presenter can accept as-is. 06:00–08:59, +50%.
const DEFAULT_DRAFT: Draft = {
  label: 'Morning peak',
  startMin: 6 * 60,   // 06:00
  endMin: 9 * 60,     // end exclusive → displays 08:59
  dose: 450,
};

// Frida's intrathecal pain program (morphine + bupivacaine, one shared flow
// rate). `dose` is the PRIMARY (morphine) µg/day. Daytime base = 300 µg/day
// (0.3 mg/day @ 1 mg/mL). endMin is exclusive — displays as (endMin-1). The
// morning peak is intentionally left out of the seed so it can be added live in
// a demo (see DEFAULT_DRAFT).
const SEED_INTERVALS: Interval[] = [
  { id: 'iv-night',   label: 'Night (sleep)',  startMin: 0,    endMin: 360,  dose: 210 }, // 00:00 – 05:59 · −30%
  { id: 'iv-day',     label: 'Daytime (base)', startMin: 540,  endMin: 1080, dose: 300 }, // 09:00 – 17:59 · base
  { id: 'iv-evening', label: 'Evening peak',   startMin: 1080, endMin: 1380, dose: 360 }, // 18:00 – 22:59 · +20%
];

// Weekend (Sat–Sun): identical to weekdays except the morning runs slightly
// later — the night/sleep interval ends 2h later (sleeps in). Daytime + evening
// match the weekday timings exactly.
const SEED_WEEKEND_INTERVALS: Interval[] = [
  { id: 'iv-we-night',   label: 'Night (sleep)',  startMin: 0,    endMin: 480,  dose: 210 }, // 00:00 – 07:59 · sleeps in
  { id: 'iv-we-day',     label: 'Daytime (base)', startMin: 540,  endMin: 1080, dose: 300 }, // 09:00 – 17:59 · same as weekday
  { id: 'iv-we-evening', label: 'Evening peak',   startMin: 1080, endMin: 1380, dose: 360 }, // 18:00 – 22:59 · same as weekday
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

// Single-reservoir admixture. medications[0] (Morphine) is the primary / flow
// driver (1 mg/mL); bupivacaine is co-delivered in the same volume (30 mg/mL).
const SEED_MEDICATIONS: Medication[] = [
  { id: 'med-morphine',    name: 'Morphine',    concentration: 1,  unit: 'mg/ml' },
  { id: 'med-bupivacaine', name: 'Bupivacaine', concentration: 30, unit: 'mg/ml' },
];

export function TherapyProvider({ children }: { children: ReactNode }) {
  const [medications, setMedications] = useState<Medication[]>(SEED_MEDICATIONS);
  const [baseDose, setBaseDoseRaw] = useState(300); // 300 µg/day morphine = 0.3 mg/day
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
  const [flowMode, setFlowMode] = useState<FlowMode>('setup');
  const [refillDate, setRefillDate] = useState('19.08.2026');
  const [fillFraction, setFillFraction] = useState(0.95); // 38 / 40 ml
  const completeRefill = () => { setRefillDate(refillDateInDays(78)); setFillFraction(1); };
  const [therapyActive, setTherapyActive] = useState(false);
  const homeScreen: ScreenId = therapyActive ? 'home-active' : 'home-no-therapy';

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
      flowMode, setFlowMode,
      refillDate, fillFraction, completeRefill,
      therapyActive, setTherapyActive, homeScreen,
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
 * A medication's concentration in canonical µg/µL (= µg per microlitre).
 * 1 mg/mL = 1 µg/µL; 1 µg/mL = 0.001 µg/µL. Use this whenever concentrations of
 * different medications are compared, since the reservoir mixes mg/mL and µg/mL
 * agents and raw values are not directly comparable.
 */
export function concUgPerUl(m: Medication): number {
  return m.unit.includes('µg') ? m.concentration / 1000 : m.concentration;
}

/**
 * Daily mass (µg/day) of a co-delivered medication. The primary drug's dose
 * fixes the delivered volume (primaryUgDay / primaryConc); every other drug in
 * the mixture is co-delivered in that same volume, so its mass scales by the
 * concentration ratio. Both concentrations MUST be in the same unit — pass the
 * canonical µg/µL values from concUgPerUl().
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
export function fmtDose(v: number): string {
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

/** Human-readable delivery interval, e.g. "28 minutes", "2 h 4 min", "4 seconds". */
export function fmtInterval(min: number): string {
  if (min < 1) return `${Math.round(min * 60)} seconds`;
  if (min >= 60) {
    const h = Math.floor(min / 60);
    const m = Math.round(min % 60);
    return m ? `${h} h ${m} min` : `${h} h`;
  }
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
