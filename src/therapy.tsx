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
 * The dose the pump can actually deliver over 24 h for a programmed dose.
 *
 * Two constraints stack: the pump moves whole 10 µl strokes, and every delivery
 * must carry the same whole number of them. So the day's stroke count is snapped
 * to the nearest multiple of the delivery count — a dose programmed at 0.49 mg
 * over 50 deliveries is delivered as 0.50 mg (50 strokes, one per delivery).
 *
 * The Default Delivery step shows this beside the programmed value so the
 * clinician sees what the pump will really do before transferring.
 */
export function achievableDoseUgDay(
  baseDoseUgDay: number,
  primaryConcUgPerUl: number,
  bolusCount: number,
): number {
  if (primaryConcUgPerUl <= 0 || baseDoseUgDay <= 0) return 0;
  const n = Math.max(1, bolusCount);
  const rawStrokes = dailyVolumeUl(baseDoseUgDay, primaryConcUgPerUl) / BOLUS_VOLUME_UL;
  // At least one stroke per delivery, so the frequency the clinician picked is
  // always honoured even for a dose that rounds down to nothing.
  const strokes = Math.max(n, Math.round(rawStrokes / n) * n);
  return strokes * BOLUS_VOLUME_UL * primaryConcUgPerUl;
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
 * count in ascending order, floored at MIN_DELIVERIES_PER_DAY (the pump must
 * deliver at least a few times a day), up to one delivery per stroke.
 */
export const MIN_DELIVERIES_PER_DAY = 4;
export function deliveryFrequencyOptions(baseDoseUgDay: number, primaryConcUgPerUl: number): number[] {
  const strokes = strokesPerDay(baseDoseUgDay, primaryConcUgPerUl);
  if (strokes <= 0) return [];
  const divisors: number[] = [];
  for (let d = 1; d <= strokes; d++) if (strokes % d === 0) divisors.push(d);
  const floored = divisors.filter(d => d >= MIN_DELIVERIES_PER_DAY);
  // If the dose is too small to reach the floor, keep the single highest option
  // so the frequency control still has a valid value.
  return floored.length ? floored : divisors.slice(-1);
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
// Below 2 ml the pump can no longer guarantee it delivers what was programmed,
// so the low-reservoir alarm cannot be parked under it.
export const MIN_ALERT_ML = 2;
export const MAX_ALERT_ML = RESERVOIR_ML / 2;
// A refill booked on the day the alarm fires is no plan at all — the patient
// has to be got in, so every refill sits at least a week ahead of the alert.
export const REFILL_MIN_LEAD_DAYS = 7;
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
  intervalsByDay: IntervalsByDay;
};

// The days a window edit touches, given the current day-pattern and the day
// currently being viewed/edited. 'same' → every day; 'weekday-weekend' → the
// whole weekday or weekend group; 'per-day' → just that day.
export function scopeForDay(pattern: DayPattern, day: DayKey): DayKey[] {
  if (pattern === 'same') return DAY_KEYS;
  if (pattern === 'weekday-weekend') return WEEKEND_KEYS.includes(day) ? WEEKEND_KEYS : WEEKDAY_KEYS;
  return [day];
}

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
  // Scoped variants — edit only the given days (weekday/weekend/per-day support).
  addWindowFor: (scope: DayKey[], w: Draft) => string;
  updateWindowFor: (scope: DayKey[], id: string, patch: Partial<Draft>) => void;
  removeWindowFor: (scope: DayKey[], id: string) => void;
  // Copy one day's schedule onto every day (used when returning to "Same Daily").
  syncAllDaysTo: (day: DayKey) => void;
  // Drop every customised delivery on every day (used when the base dose or
  // delivery frequency changes and the windows no longer apply).
  clearWindows: () => void;
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
  // Reservoir refill bookkeeping. completeRefill() tops the reservoir up; the
  // fill level is a physical property, so it only changes on refill, NOT when a
  // therapy is added.
  fillFraction: number; // 0..1 of the 40 ml reservoir
  // Set when the physical fill finishes, so the reservoir reads full from that
  // moment on rather than when the therapy transfer commits at the end.
  setFillLevel: (fraction: number) => void;
  // Reservoir volume (ml) at which the pump raises the low-fill alert.
  alertLevelMl: number;
  setAlertLevelMl: (ml: number) => void;
  // When the reservoir is projected to hit `alertLevelMl` at the therapy's
  // current consumption rate, dd.mm.yyyy ('N/A' with no therapy running). This
  // is a physical projection, not a plan — it is never editable.
  alertDate: string;
  // Days from today until the alert fires — null with nothing being delivered.
  daysToAlert: number | null;
  // When the reservoir is projected to run dry, dd.mm.yyyy — the far end of the
  // depletion chart. Also a projection, never a plan.
  emptyDate: string;
  daysToEmpty: number | null;
  // Volume the therapy draws from the reservoir each day (ml/day), 0 when idle.
  volMlPerDay: number;
  // Volume in the reservoir today, i.e. the high end of that projection.
  fillMl: number;
  // The planned refill, dd.mm.yyyy. Either hand-picked, or `refillLeadWeeks`
  // ahead of `alertDate`, or — with neither set — the alert date itself.
  refillDate: string;
  // Days from today until the planned refill — null with no therapy running.
  daysToRefill: number | null;
  // True when `refillDate` is a hand-picked date rather than a derived one.
  refillDateIsManual: boolean;
  // Override the derived date with a hand-picked one; pass null to go back to
  // the derived date. Changing the alert level or therapy also resets it.
  setRefillDate: (d: string | null) => void;
  // How many weeks ahead of the alert date the refill is planned. Being
  // relative, it survives a change to the alert level — the date just moves.
  refillLeadWeeks: number | null;
  setRefillLeadWeeks: (w: number | null) => void;
  // Days the planned refill sits ahead of the alert, however it was set — the
  // buffer the Refill Date step reports. Null with no therapy running.
  refillLeadDays: number | null;
  completeRefill: () => void;
  // Refill branch picked at the "same medication?" gate. 'same' re-confirms the
  // delivery steps; 'different' adds the Medication step and a bridge bolus.
  refillBranch: RefillBranch;
  setRefillBranch: (b: RefillBranch) => void;
  // When the bridge bolus started by a medication-change refill ends (epoch ms),
  // or null when none is running. Set on transfer.
  bridgeBolusUntil: number | null;
  startBridgeBolus: () => void;
  // Delivery paused from the Stop action: the therapy stays programmed (and on
  // the home screen) but nothing is delivered until it is resumed.
  therapyPaused: boolean;
  setTherapyPaused: (b: boolean) => void;
  // True while the paused therapy is being re-confirmed (Review → Transfer)
  // before delivery resumes. Abandoning the edit clears it.
  resumingTherapy: boolean;
  beginResumeTherapy: (returnTo?: ScreenId) => void;
  // Whether a therapy has been set up + activated on the implant. Drives which
  // home screen ("home-active" vs "home-no-therapy") the chrome returns to.
  therapyActive: boolean;
  setTherapyActive: (b: boolean) => void;
  // The home screen matching the current therapy state — use for "back to home".
  homeScreen: ScreenId;
};

export type FlowMode = 'setup' | 'refill';

// Short month names for the app's canonical date string.
export const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/**
 * Format a Date as `19 Aug 2026` — the app's canonical date string. The final
 * design spells the month out so a date can never be read day-first or
 * month-first by mistake.
 */
export type RefillBranch = 'same' | 'different' | null;

// Bridge bolus run after a medication change: keeps delivering the old
// medication until the new one reaches the catheter tip (Figma 11103:191450).
export const BRIDGE_BOLUS = { volumeMl: 0.16, minutes: 6 * 60 };

export function formatDate(d: Date): string {
  const dd = String(d.getDate()).padStart(2, '0');
  return `${dd} ${MONTHS_SHORT[d.getMonth()]} ${d.getFullYear()}`;
}

// Next-refill date `days` from today, as a canonical date string.
export function refillDateInDays(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return formatDate(d);
}

// Whole days from today to a canonical `19 Aug 2026` date — negative once it is
// in the past, null if the string isn't a date. Both ends are floored to
// midnight so the result counts calendar days rather than elapsed hours.
export function daysUntil(date: string): number | null {
  const m = /^(\d{2}) ([A-Za-z]{3}) (\d{4})$/.exec(date);
  if (!m) return null;
  const month = MONTHS_SHORT.indexOf(m[2]);
  if (month < 0) return null;
  const target = new Date(Number(m[3]), month, Number(m[1]));
  const today = new Date();
  target.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - today.getTime()) / 86_400_000);
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
// baclofen co-delivered) on a flat default delivery. Morphine is the primary
// drug at 0.5 mg/day @ 1 mg/mL:
//   500 µg/day ÷ 1 mg/mL (= 1 µg/µL) = 500 µL/day ÷ 10 µL = 50 strokes, so the
//   frequency options are the divisors of 50 and the default (highest) is 50
//   deliveries/day — one 10 µl stroke each, 0.010 mg of morphine per delivery.
const ACTIVE_BASE_DOSE = 500; // µg/day Morphine (= 0.5 mg/day @ 1 mg/mL)
const ACTIVE_MEDICATIONS: Medication[] = [
  { id: 'med-morphine', name: 'Morphine', concentration: 1,  unit: 'mg/ml' },
  { id: 'med-baclofen', name: 'Baclofen', concentration: 500, unit: 'mcg/ml' },
];
// Default example: a plain default delivery at the default (max) frequency and no
// customised delivery windows — a flat 0.5 mg/day. The customised-delivery flow
// starts from this empty schedule.
const ACTIVE_WINDOWS: Interval[] = [];
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
  const [fillFraction, setFillFraction] = useState(0.95); // 38 / 40 ml
  const [alertLevelMl, setAlertLevelMlRaw] = useState(2); // 5% of the 40 ml reservoir
  // The refill date is normally derived (see `refillDate` below); this holds a
  // date the clinician picked from the calendar instead.
  const [refillDateOverride, setRefillDateOverride] = useState<string | null>(null);
  // ...or, in the other direction, a lead time: refill this many weeks before
  // the reservoir reaches the alert level. One week is both the floor — so the
  // plan can never land on the day the alarm fires — and the default: the step
  // opens on the latest date that still clears the alarm, and the clinician
  // moves it earlier from there.
  const [refillLeadWeeks, setRefillLeadWeeksRaw] = useState<number | null>(1);
  // The two ways of setting the date are exclusive — picking one clears the other.
  const setRefillDate = (d: string | null) => {
    setRefillDateOverride(d);
    if (d != null) setRefillLeadWeeksRaw(null);
  };
  const setRefillLeadWeeks = (w: number | null) => {
    setRefillLeadWeeksRaw(w);
    if (w != null) setRefillDateOverride(null);
  };
  // Retuning the alert level moves the projection, so a hand-picked date no
  // longer means what it did. A lead time is relative and survives untouched.
  const setAlertLevelMl = (ml: number) => { setAlertLevelMlRaw(ml); setRefillDateOverride(null); };
  // The reservoir is topped up; the due date follows from the new fill level.
  const completeRefill = () => { setFillFraction(1); };
  const [refillBranch, setRefillBranch] = useState<RefillBranch>(null);
  const [therapyPaused, setTherapyPaused] = useState(false);
  const [resumingTherapy, setResumingTherapy] = useState(false);
  const [bridgeBolusUntil, setBridgeBolusUntil] = useState<number | null>(null);
  const startBridgeBolus = () => setBridgeBolusUntil(Date.now() + BRIDGE_BOLUS.minutes * 60_000);
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
    // Lock the current delivery frequency so changing the base dose doesn't re-grid
    // the day — which would shift the dosing windows drawn on that grid.
    setBolusCountRaw(bolusCount);
  };
  // Abandon the wizard: restore the snapshot and return to where it was started.
  const cancelTherapyEdit = (): ScreenId => {
    setResumingTherapy(false);
    const s = snapshotRef.current;
    snapshotRef.current = null;
    if (s) restoreSnapshot(s);
    return setupReturnRef.current;
  };
  // Activation completed: keep the working state and drop the snapshot. A
  // resume that reaches the transfer restarts delivery.
  const commitTherapy = () => {
    snapshotRef.current = null;
    setTherapyActive(true);
    if (resumingTherapy) { setTherapyPaused(false); setResumingTherapy(false); }
  };
  // Resume Therapy re-confirms the paused therapy on Review before transfer,
  // through the edit lifecycle so a back-out returns home unchanged.
  const beginResumeTherapy = (returnTo: ScreenId = 'home-active') => {
    setFlowMode('setup');
    beginEditTherapy(returnTo);
    setResumingTherapy(true);
  };

  const setBaseDose = (n: number) => {
    const next = Math.max(0, n);
    const prev = baseDose;
    // Dosing windows are relative adjustments to the default delivery (e.g. a
    // +60% morning peak). When the base dose changes, scale every window by the
    // same factor so those proportions — and therefore the chart's shape — are
    // preserved: the windows grow and shrink in place instead of the whole
    // diagram re-normalising and flipping when the base crosses a window level.
    if (prev > 0 && next > 0 && next !== prev) {
      const f = next / prev;
      setAllDays(list => list.map(iv => ({ ...iv, dose: Math.round(iv.dose * f) })));
      // Hold the delivery-frequency slider where the user left it. The maximum
      // possible deliveries scales with the dose (more volume ⇒ more strokes),
      // so scale the chosen count by the same factor: the count changes but the
      // thumb's position on the track does not. (null means "max frequency",
      // which already tracks the max, so leave it be.)
      const conc = medications[0] ? concUgPerUl(medications[0]) : 0;
      const oldMax = maxBolusesPerDay(prev, conc);
      const newMax = maxBolusesPerDay(next, conc);
      if (bolusCountRaw != null && oldMax > 0 && newMax > 0) {
        const scaled = Math.round(bolusCountRaw * (newMax / oldMax));
        setBolusCountRaw(nearestFrequency(deliveryFrequencyOptions(next, conc), scaled));
      }
    }
    setBaseDoseRaw(next);
  };

  // Derived "representative" weekday + weekend views — used by Review and
  // HomeActive which still toggle by group rather than per day.
  const intervals = intervalsByDay.monday;
  const weekendIntervals = intervalsByDay.saturday;

  // -------- Alert projection and planned refill --------
  // The pump raises its low-fill alert when the reservoir drops to
  // `alertLevelMl`, so the alert fires once the therapy has consumed the volume
  // above that threshold. Consumption is the daily delivered volume of the
  // reservoir mixture — the same figure the wizard footer shows as "x ml / day".
  // That projection is physics and is never edited; the *refill* is the plan
  // laid on top of it, either a lead time or a hand-picked date.
  const primaryConcForVol = medications[0] ? concUgPerUl(medications[0]) : 0;
  const dailyUgForVol = baseDose > 0 && primaryConcForVol > 0 ? estimatedDailyTotal(baseDose, intervals) : 0;
  const volMlPerDay = dailyUgForVol > 0 ? dailyVolumeUl(dailyUgForVol, primaryConcForVol) / 1000 : 0;
  const fillMl = fillFraction * RESERVOIR_ML;
  // Volume the pump can still deliver before the alert fires.
  const usableMl = Math.max(0, fillMl - alertLevelMl);
  // Round down — the alert fires on the day the level is reached, not after.
  const daysToAlert = volMlPerDay > 0 ? Math.floor(usableMl / volMlPerDay) : null;
  const alertDate = daysToAlert != null ? refillDateInDays(daysToAlert) : 'N/A';
  // Past the alert the pump keeps delivering until the reservoir is dry.
  const daysToEmpty = volMlPerDay > 0 ? Math.floor(fillMl / volMlPerDay) : null;
  const emptyDate = daysToEmpty != null ? refillDateInDays(daysToEmpty) : 'N/A';
  // A hand-picked date wins outright; otherwise pull the refill `refillLeadWeeks`
  // ahead of the alert. Either way the refill has to clear the alarm by a week,
  // so there is always room to get the patient in — and it can never fall in the
  // past, which would leave the plan pointing at a day that has already gone.
  const latestRefillDays = daysToAlert != null ? daysToAlert - REFILL_MIN_LEAD_DAYS : null;
  const daysToRefill = refillDateOverride != null
    ? daysUntil(refillDateOverride)
    : latestRefillDays != null
      ? Math.max(0, Math.min(latestRefillDays, daysToAlert! - (refillLeadWeeks ?? 1) * 7))
      : null;
  const refillDate = refillDateOverride
    ?? (daysToRefill != null ? refillDateInDays(daysToRefill) : 'N/A');
  const refillLeadDays = daysToAlert != null && daysToRefill != null ? daysToAlert - daysToRefill : null;

  // -------- Bolus frequency --------
  const primaryConc = medications[0] ? concUgPerUl(medications[0]) : 0;
  // Only divisors of the day's 10 µl stroke count are valid, so every delivery
  // carries a whole number of 10 µl strokes.
  const freqOptions = deliveryFrequencyOptions(baseDose, primaryConc);
  const maxBoluses = freqOptions.length ? freqOptions[freqOptions.length - 1] : 0;
  // Effective count: the maximum (most frequent) until the user picks a frequency,
  // then that exact value (capped at the current max). It is NOT re-snapped when the
  // base dose changes, so the delivery grid — and the dosing windows on it — stay put.
  const bolusCount = bolusCountRaw == null
    ? maxBoluses
    : (maxBoluses > 0 ? Math.min(bolusCountRaw, maxBoluses) : bolusCountRaw);
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
    const bc = s.bolusCountRaw == null ? maxB : (maxB > 0 ? Math.min(s.bolusCountRaw, maxB) : s.bolusCountRaw);
    return { medications: s.medications, baseDose: s.baseDose, bolusCount: bc, intervals: s.intervalsByDay.monday, intervalsByDay: s.intervalsByDay };
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

  // Scoped variants: apply an edit to just the listed days.
  const setDays = (scope: DayKey[], fn: (list: Interval[]) => Interval[]) =>
    setIntervalsByDay(prev => {
      const next: IntervalsByDay = { ...prev };
      for (const day of scope) next[day] = fn(next[day].map(iv => ({ ...iv })));
      return next;
    });
  const addWindowFor = (scope: DayKey[], w: Draft): string => {
    const id = uid();
    setDays(scope, list => [...list, { id, ...w }]);
    return id;
  };
  const updateWindowFor = (scope: DayKey[], id: string, patch: Partial<Draft>) =>
    setDays(scope, list => list.map(iv => (iv.id === id ? { ...iv, ...patch } : iv)));
  const removeWindowFor = (scope: DayKey[], id: string) =>
    setDays(scope, list => list.filter(iv => iv.id !== id));
  const syncAllDaysTo = (day: DayKey) =>
    setIntervalsByDay(prev => {
      const src = prev[day].map(iv => ({ ...iv }));
      const next: IntervalsByDay = { ...prev };
      for (const d of DAY_KEYS) next[d] = src.map(iv => ({ ...iv }));
      return next;
    });
  const clearWindows = () => setAllDays(() => []);

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
      addWindowFor, updateWindowFor, removeWindowFor, syncAllDaysTo, clearWindows,
      dayPattern, setDayPattern,
      useBaseOnly, setUseBaseOnly,
      flowMode, setFlowMode,
      alertDate, daysToAlert, emptyDate, daysToEmpty, volMlPerDay, fillMl,
      refillDate, daysToRefill, refillDateIsManual: refillDateOverride != null,
      setRefillDate, refillLeadWeeks, setRefillLeadWeeks, refillLeadDays,
      fillFraction, setFillLevel: setFillFraction, alertLevelMl, setAlertLevelMl, completeRefill,
      refillBranch, setRefillBranch, bridgeBolusUntil, startBridgeBolus,
      therapyPaused, setTherapyPaused, resumingTherapy, beginResumeTherapy,
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
 * 1 mg/mL = 1 µg/µL; 1 mcg/mL = 0.001 µg/µL. Use this whenever concentrations of
 * different medications are compared, since the reservoir mixes mg/mL and mcg/mL
 * agents and raw values are not directly comparable.
 */
export function concUgPerUl(m: Medication): number {
  return m.unit.includes('mcg') ? m.concentration / 1000 : m.concentration;
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
 * The mass-unit family ('mg' or 'mcg') implied by a medication's concentration
 * unit. A drug dosed at mg/ml is reported in mg; one at mcg/ml is reported in
 * mcg. `div` converts an internal µg amount into that unit.
 */
export function doseUnitFor(concUnit: string): { unit: 'mg' | 'mcg'; div: number } {
  return concUnit.includes('mcg') ? { unit: 'mcg', div: 1 } : { unit: 'mg', div: 1000 };
}

// Every dose reads to two decimal places, whatever its magnitude. The same dose
// is quoted in several places at once — the default-delivery table, the
// per-delivery columns, the 24 h totals, the review's before/after — and a fixed
// precision is what makes those read as one number rather than as several
// roundings of it. Doses only; volumes, counts and times format themselves.
export function fmtDose(v: number): string {
  if (!isFinite(v)) return '0.00';
  return v.toFixed(2);
}

/**
 * Split a formatted number at its decimal point: "1.2"→["1","2"], "105"→["105",""].
 * Screens that stack doses in a column render the two halves in separate cells so
 * every decimal point lands on one x, however many digits precede it.
 */
export function splitNum(s: string): [string, string] {
  const i = s.indexOf('.');
  return i === -1 ? [s, ''] : [s.slice(0, i), s.slice(i + 1)];
}

/**
 * Format a µg/day mass in the unit family the medication's concentration unit
 * implies. perDay and perHour are derived from the SAME value (perHour =
 * perDay / 24) so the two readings are always linked and consistent.
 */
export function doseStringsFor(ugDay: number, concUnit: string): { unit: string; perDay: string; perHour: string } {
  const { unit, div } = doseUnitFor(concUnit);
  const perDayVal = ugDay / div;
  return { unit, perDay: fmtDailyDose(perDayVal, unit), perHour: fmtDose(perDayVal / 24) };
}

/**
 * A daily total in its mass unit. Microgram doses are whole numbers — a tenth of
 * a microgram a day is below anything the pump can act on — while milligram
 * doses keep two decimals (0.50 mg/24h).
 */
export function fmtDailyDose(v: number, unit: string): string {
  if (!isFinite(v)) return unit === 'mcg' ? '0' : '0.00';
  return unit === 'mcg' ? String(Math.round(v)) : v.toFixed(2);
}

/**
 * A single delivery's dose — roughly a fiftieth of the day, so it needs one more
 * decimal than the daily total to stay readable (0.010 mg/del, 5.0 mcg/del).
 */
export function fmtPerDelivery(v: number, unit: string): string {
  if (!isFinite(v)) return unit === 'mcg' ? '0.0' : '0.000';
  return unit === 'mcg' ? v.toFixed(1) : v.toFixed(3);
}

/**
 * Legacy magnitude-based formatter (auto-switches to mg above 1000 µg). Retained
 * for hardware-level pump readouts that aren't tied to a medication's unit.
 */
export function doseStrings(ugDay: number): { unit: string; perDay: string; perHour: string } {
  const useMg = ugDay >= 1000;
  const div = useMg ? 1000 : 1;
  const fmt = (v: number) => (useMg ? v.toFixed(2) : v >= 100 ? Math.round(v).toString() : v.toFixed(1));
  return { unit: useMg ? 'mg' : 'mcg', perDay: fmt(ugDay / div), perHour: fmt(ugDay / 24 / div) };
}

/**
 * A customised delivery's dose as a signed change against the default delivery:
 * "+100%" for twice the default, "−50%" for half. Reads the same in both
 * directions, which a share-of-default figure does not — 50% has to be decoded
 * as a reduction, −50% says so. Null when there is no default to compare
 * against, or when the dose matches it: "0%" on an unchanged row is noise.
 */
export function pctVsDefault(dose: number, base: number): string | null {
  if (base <= 0) return null;
  const pct = Math.round((dose / base - 1) * 100);
  if (pct === 0) return null;
  return `${pct > 0 ? '+' : '−'}${Math.abs(pct)}%`;
}

// Color tier for a dose relative to base dose.
export function doseColor(dose: number, base: number): string {
  const r = dose / base;
  if (r < 0.7) return '#a7e5d7';   // light
  if (r < 0.9) return '#62dec2';   // medium-light
  if (r < 1.3) return '#188d7b';   // normal teal
  return '#096657';                // dark navy
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
