import { createContext, useContext, useRef, useState, type ReactNode } from 'react';
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

// A delivered "bolus" is a fixed micro-volume of the reservoir mixture (10 µl).
// The base dose is split into whole 10 µl boluses across the day, so the maximum
// bolus frequency is bounded by how much volume the dose actually represents.
export const BOLUS_VOLUME_UL = 10;

/**
 * Daily delivered volume (µl) implied by a primary base dose. volume = mass /
 * concentration, with concentration in canonical µg/µl. Returns 0 for a missing
 * or zero-concentration primary so callers can show an empty state.
 */
export function dailyVolumeUl(baseDoseUgDay: number, primaryConcUgPerUl: number): number {
  if (primaryConcUgPerUl <= 0) return 0;
  return baseDoseUgDay / primaryConcUgPerUl;
}

/**
 * Whole number of 10 µl strokes the daily volume represents. The pump can only
 * deliver in 10 µl units, so the day's dose is quantised to this many strokes.
 */
export function strokesPerDay(baseDoseUgDay: number, primaryConcUgPerUl: number): number {
  return Math.round(dailyVolumeUl(baseDoseUgDay, primaryConcUgPerUl) / BOLUS_VOLUME_UL);
}

/**
 * Snap a window [startMin, endMin) onto the delivery grid implied by bolusCount
 * (n evenly-spaced deliveries/day). Returns the first and last *actual* delivery
 * time the window covers, and how many deliveries that is. endMin is the exclusive
 * edge one slot past the last delivery, so the last delivery is at endMin − 1's slot.
 */
export function windowDeliverySpan(startMin: number, endMin: number, bolusCount: number): { firstMin: number; lastMin: number; count: number } {
  const n = Math.max(1, bolusCount);
  const slotOf = (min: number) => Math.min(n - 1, Math.max(0, Math.floor((min * n) / 1440)));
  const timeAt = (slot: number) => Math.round((slot * 1440) / n);
  const first = slotOf(startMin);
  const last = slotOf(Math.max(startMin, endMin - 1));
  return { firstMin: timeAt(first), lastMin: timeAt(last), count: last - first + 1 };
}

/**
 * Valid delivery frequencies (deliveries per day). Each delivery must carry a
 * whole number of 10 µl strokes, so the deliveries-per-day count has to divide
 * the day's total stroke count evenly. Returns every divisor of the stroke
 * count in ascending order — from 1 delivery/day (the whole dose at once) up to
 * one delivery per stroke — with no artificial floor or ceiling.
 */
export function deliveryFrequencyOptions(baseDoseUgDay: number, primaryConcUgPerUl: number): number[] {
  const strokes = strokesPerDay(baseDoseUgDay, primaryConcUgPerUl);
  if (strokes <= 0) return [];
  const divisors: number[] = [];
  for (let d = 1; d <= strokes; d++) if (strokes % d === 0) divisors.push(d);
  return divisors;
}

/** Snap an arbitrary frequency to the nearest valid option (ties → higher). */
export function nearestFrequency(options: number[], value: number): number {
  if (!options.length) return 0;
  return options.reduce((best, o) => Math.abs(o - value) <= Math.abs(best - value) ? o : best, options[0]);
}

/**
 * Maximum number of whole 10 µl boluses the daily volume can be split into,
 * respecting the divisibility constraint — i.e. the highest valid delivery
 * frequency. This is the default the setup flow selects.
 */
export function maxBolusesPerDay(baseDoseUgDay: number, primaryConcUgPerUl: number): number {
  const opts = deliveryFrequencyOptions(baseDoseUgDay, primaryConcUgPerUl);
  return opts.length ? opts[opts.length - 1] : 0;
}

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

// A committed therapy reduced to what the breakdown/comparison views need, with
// bolusCount + representative intervals already derived.
export type BeforeTherapy = {
  medications: Medication[];
  baseDose: number;
  bolusCount: number;
  intervals: Interval[];
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
  // Therapy editing lifecycle. The home screen always shows the committed
  // therapy; these snapshot it so backing out of the wizard restores it and only
  // an Activate commits the change. beginNewTherapy blanks the working state;
  // beginEditTherapy keeps it; cancelTherapyEdit restores + returns the home id.
  beginNewTherapy: (returnTo?: ScreenId) => void;
  // Like beginNewTherapy but keeps the current medication list — "start from
  // scratch" in the edit flow clears the dose + windows + frequency while the
  // preset medications stay in place.
  beginScratchTherapy: (returnTo?: ScreenId) => void;
  beginEditTherapy: (returnTo?: ScreenId) => void;
  cancelTherapyEdit: () => ScreenId;
  commitTherapy: () => void;
  // The committed therapy as it was when editing began (the pre-edit snapshot,
  // with bolusCount + representative intervals derived the same way as the live
  // state). Null when no edit is in progress. Used by the Review page to show a
  // before/after comparison. [[editBefore]]
  editBefore: BeforeTherapy | null;
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
  // Bolus frequency: boluses/day chosen by the user (defaults to the maximum the
  // current dose + concentration allow). maxBoluses is that ceiling.
  bolusCount: number;
  maxBoluses: number;
  // Valid delivery frequencies (divisors of the day's stroke count), ascending.
  freqOptions: number[];
  setBolusCount: (n: number) => void;
  // Dosing windows — time spans whose dose is raised/lowered vs the base dose.
  // Backed by intervalsByDay (every day identical); these helpers edit all days.
  addWindow: (w: Draft) => string;
  updateWindow: (id: string, patch: Partial<Draft>) => void;
  removeWindow: (id: string) => void;
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

function uid() {
  return 'iv-' + Math.random().toString(36).slice(2, 9);
}

// -------- Active-therapy seed (the app boots into this) --------
// A patient already on therapy: an intrathecal pain mix (morphine primary +
// bupivacaine co-delivered) with a couple of dosing windows around the flat
// base. Morphine is the primary drug at 1.5 mg/day @ 1 mg/mL:
//   1500 µg/day ÷ 1 mg/mL (= 1 µg/µL) = 1500 µL/day ÷ 10 µL = 150 boluses.
const ACTIVE_BASE_DOSE = 1500; // µg/day Morphine (= 1.5 mg/day @ 1 mg/mL)
const ACTIVE_MEDICATIONS: Medication[] = [
  { id: 'med-morphine', name: 'Morphine', concentration: 1,  unit: 'mg/ml' },
  { id: 'med-baclofen', name: 'Baclofen', concentration: 30, unit: 'mg/ml' },
];
// Windows are deltas vs the base; the base fills every uncovered minute. One
// schedule applies to every day (no weekday/weekend differentiation). Two dosing
// periods: a single-delivery morning spike (+60%) and a raised night (+30%). The
// night crosses midnight (23:00–04:00), so it's stored as two adjacent intervals.
// Doses are daily-equivalent rates vs the 1500 µg/day base (× 1.6 and × 1.3).
const ACTIVE_WINDOWS: Interval[] = [
  { id: 'iv-morning',    label: 'Morning peak', startMin: 360,  endMin: 375,  dose: 2400 }, // 06:00 · one delivery · +60%
  { id: 'iv-night-early', label: 'Night',       startMin: 0,    endMin: 240,  dose: 1950 }, // 00:00–04:00 · +30%
  { id: 'iv-night-late',  label: 'Night',       startMin: 1380, endMin: 1440, dose: 1950 }, // 23:00–24:00 · +30%
];
const ACTIVE_BY_DAY: IntervalsByDay = {
  monday:    ACTIVE_WINDOWS.map(iv => ({ ...iv })),
  tuesday:   ACTIVE_WINDOWS.map(iv => ({ ...iv })),
  wednesday: ACTIVE_WINDOWS.map(iv => ({ ...iv })),
  thursday:  ACTIVE_WINDOWS.map(iv => ({ ...iv })),
  friday:    ACTIVE_WINDOWS.map(iv => ({ ...iv })),
  saturday:  ACTIVE_WINDOWS.map(iv => ({ ...iv })),
  sunday:    ACTIVE_WINDOWS.map(iv => ({ ...iv })),
};

// -------- Empty therapy (a fresh add-therapy flow) --------
// beginNewTherapy() blanks the working state to this so onboarding starts from
// scratch: one blank medication row, no base dose and no dosing windows.
const EMPTY_BY_DAY: IntervalsByDay = {
  monday: [], tuesday: [], wednesday: [], thursday: [], friday: [], saturday: [], sunday: [],
};
const emptyMedications = (): Medication[] => [
  { id: 'med-primary', name: '', concentration: 0, unit: 'mg/ml' },
];

export function TherapyProvider({ children }: { children: ReactNode }) {
  const [medications, setMedications] = useState<Medication[]>(ACTIVE_MEDICATIONS);
  const [baseDose, setBaseDoseRaw] = useState(ACTIVE_BASE_DOSE); // µg/day primary
  const [intervalsByDay, setIntervalsByDay] = useState<IntervalsByDay>(ACTIVE_BY_DAY);
  const [editingScope, setEditingScope] = useState<DayKey[]>([...WEEKDAY_KEYS]);
  const [draft, setDraft] = useState<Draft>(DEFAULT_DRAFT);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [strokeStrategy, setStrokeStrategy] = useState<StrokeStrategy>(1);
  // Chosen bolus frequency (boluses/day). null = "track the maximum" — the
  // default the Frequency screen shows until the user drags the slider, so the
  // count follows the base dose + concentration automatically.
  const [bolusCountRaw, setBolusCountRaw] = useState<number | null>(null);

  // Changing the primary medication invalidates the dose that was set for it, so
  // wipe the base dose / windows / frequency. Keeping the same medication leaves
  // them intact.
  const clearDose = () => {
    setBaseDoseRaw(0);
    setIntervalsByDay(EMPTY_BY_DAY);
    setBolusCountRaw(null);
  };
  const addMedication = () =>
    setMedications(prev => [...prev, { id: uid(), name: '', concentration: 0, unit: 'mg/ml' }]);
  const updateMedication = (id: string, patch: Partial<Omit<Medication, 'id'>>) => {
    const cur = medications.find(m => m.id === id);
    const isPrimary = medications[0]?.id === id;
    const changed = !!cur && (['name', 'concentration', 'unit'] as const).some(k => k in patch && patch[k] !== cur[k]);
    if (isPrimary && changed) clearDose();
    setMedications(prev => prev.map(m => (m.id === id ? { ...m, ...patch } : m)));
  };
  const removeMedication = (id: string) => {
    if (medications[0]?.id === id) clearDose(); // removing the primary changes which drug drives the dose
    setMedications(prev => prev.filter(m => m.id !== id));
  };
  const [dayPattern, setDayPattern] = useState<DayPattern>('same');
  const [sheetReturnTo, setSheetReturnTo] = useState<ScreenId>('intervals-populated');
  const [previewIntervalId, setPreviewIntervalId] = useState<string | null>(null);
  const [useBaseOnly, setUseBaseOnly] = useState(false);
  const [flowMode, setFlowMode] = useState<FlowMode>('setup');
  const [refillDate, setRefillDate] = useState('19.08.2026');
  const [fillFraction, setFillFraction] = useState(0.95); // 38 / 40 ml
  const completeRefill = () => { setRefillDate(refillDateInDays(78)); setFillFraction(1); };
  const [therapyActive, setTherapyActive] = useState(true);
  const homeScreen: ScreenId = therapyActive ? 'home-active' : 'home-no-therapy';

  // The committed therapy shown on the home screen is snapshotted when the user
  // starts editing or creating a therapy, so backing out of the wizard restores
  // it — the home screen only changes once a new/adjusted therapy is activated.
  type Snapshot = { medications: Medication[]; baseDose: number; intervalsByDay: IntervalsByDay; bolusCountRaw: number | null; therapyActive: boolean };
  const snapshotRef = useRef<Snapshot | null>(null);
  const takeSnapshot = (): Snapshot => ({ medications, baseDose, intervalsByDay, bolusCountRaw, therapyActive });
  const restoreSnapshot = (s: Snapshot) => {
    setMedications(s.medications);
    setBaseDoseRaw(s.baseDose);
    setIntervalsByDay(s.intervalsByDay);
    setBolusCountRaw(s.bolusCountRaw);
    setTherapyActive(s.therapyActive);
  };

  // Screen the wizard was entered from, so backing out returns there.
  const setupReturnRef = useRef<ScreenId>('home-active');
  // Start a fresh therapy: snapshot the current one, then blank the working state.
  const beginNewTherapy = (returnTo: ScreenId = 'home-no-therapy') => {
    setupReturnRef.current = returnTo;
    snapshotRef.current = takeSnapshot();
    setMedications(emptyMedications());
    setBaseDoseRaw(0);
    setIntervalsByDay(EMPTY_BY_DAY);
    setBolusCountRaw(null);
    setTherapyActive(false);
  };
  // Start from scratch but keep the preset medications: snapshot, then clear the
  // dose, windows and frequency so the base dose (and the developing chart) start
  // empty while the 3 medications remain.
  const beginScratchTherapy = (returnTo: ScreenId = 'home-active') => {
    setupReturnRef.current = returnTo;
    snapshotRef.current = takeSnapshot();
    setBaseDoseRaw(0);
    setIntervalsByDay(EMPTY_BY_DAY);
    setBolusCountRaw(null);
    setTherapyActive(false);
  };
  // Adjust the existing therapy: snapshot it but keep the data to edit in place.
  const beginEditTherapy = (returnTo: ScreenId = 'home-active') => {
    setupReturnRef.current = returnTo;
    snapshotRef.current = takeSnapshot();
  };
  // Abandon the wizard: restore the snapshot and return to where it was started.
  const cancelTherapyEdit = (): ScreenId => {
    const s = snapshotRef.current;
    snapshotRef.current = null;
    if (s) restoreSnapshot(s);
    return setupReturnRef.current;
  };
  // Activation completed: keep the working state and drop the snapshot.
  const commitTherapy = () => { snapshotRef.current = null; setTherapyActive(true); };

  const setBaseDose = (n: number) => setBaseDoseRaw(Math.max(0, n));

  // Derived "representative" weekday + weekend views — used by Review and
  // HomeActive which still toggle by group rather than per day.
  const intervals = intervalsByDay.monday;
  const weekendIntervals = intervalsByDay.saturday;

  // -------- Bolus frequency --------
  const primaryConc = medications[0] ? concUgPerUl(medications[0]) : 0;
  // Only divisors of the day's 10 µl stroke count are valid, so every delivery
  // carries a whole number of 10 µl strokes.
  const freqOptions = deliveryFrequencyOptions(baseDose, primaryConc);
  const maxBoluses = freqOptions.length ? freqOptions[freqOptions.length - 1] : 0;
  // Effective count: the user's choice snapped to the nearest valid option, or
  // the maximum (most frequent) when the user hasn't touched the slider.
  const bolusCount = bolusCountRaw == null ? maxBoluses : nearestFrequency(freqOptions, bolusCountRaw);
  const setBolusCount = (n: number) => setBolusCountRaw(n);

  // Pre-edit snapshot reduced for the Review before/after view. The snapshot is a
  // ref (set during navigation into the wizard, stable for the page's lifetime),
  // so bolusCount is re-derived from its dose/frequency the same way as above.
  const editBefore: BeforeTherapy | null = (() => {
    const s = snapshotRef.current;
    if (!s) return null;
    const conc0 = s.medications[0] ? concUgPerUl(s.medications[0]) : 0;
    const opts = deliveryFrequencyOptions(s.baseDose, conc0);
    const maxB = opts.length ? opts[opts.length - 1] : 0;
    const bc = s.bolusCountRaw == null ? maxB : nearestFrequency(opts, s.bolusCountRaw);
    return { medications: s.medications, baseDose: s.baseDose, bolusCount: bc, intervals: s.intervalsByDay.monday };
  })();

  // -------- Dosing windows (one shared schedule applied to every day) --------
  // Windows are stored in intervalsByDay so the existing Review / HomeActive /
  // TherapyDetail consumers keep working; every day holds an identical copy.
  const setAllDays = (fn: (list: Interval[]) => Interval[]) =>
    setIntervalsByDay(prev => {
      const next: IntervalsByDay = { ...prev };
      for (const day of DAY_KEYS) next[day] = fn(next[day].map(iv => ({ ...iv })));
      return next;
    });
  const addWindow = (w: Draft): string => {
    const id = uid();
    setAllDays(list => [...list, { id, ...w }]);
    return id;
  };
  const updateWindow = (id: string, patch: Partial<Draft>) =>
    setAllDays(list => list.map(iv => (iv.id === id ? { ...iv, ...patch } : iv)));
  const removeWindow = (id: string) =>
    setAllDays(list => list.filter(iv => iv.id !== id));

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
      beginNewTherapy, beginScratchTherapy, beginEditTherapy, cancelTherapyEdit, commitTherapy,
      editBefore,
      intervalsByDay,
      intervals, weekendIntervals,
      draft, setDraft,
      editingId, editingScope,
      startAddingInterval, startEditingInterval, commitDraft, removeInterval, sheetReturnTo,
      previewIntervalId, setPreviewIntervalId,
      strokeStrategy, setStrokeStrategy,
      bolusCount, maxBoluses, freqOptions, setBolusCount,
      addWindow, updateWindow, removeWindow,
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
