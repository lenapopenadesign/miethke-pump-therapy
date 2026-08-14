import { useState } from 'react';
import {
  useTherapy,
  coDoseUgDay,
  concUgPerUl,
  doseStringsFor,
  estimatedDailyTotal,
  windowDeliverySpan,
  fmtTime,
  splitNum,
  type Interval,
  type Medication,
  type BeforeTherapy,
  type DayKey,
} from '../therapy';
import { TherapyMedBreakdown } from './TherapyBreakdown';
import { DayGroupToggle, repDay } from './DayToggles';

// Shared styling with the rest of the breakdown so the before/after view reads as
// the same system — only the "changed" amber highlight + delta are new. Values
// sit a touch smaller than the 32px elsewhere because each pill packs a
// per-delivery dose, its total, and (after) the change %.
const wdth = { fontVariationSettings: "'wdth' 100" } as const;
const FONT = "font-['Roboto',sans-serif]";
const labelCls = `${FONT} font-bold text-[#00769e] text-[22px] leading-[24px] tracking-[0.1px]`;
const HEAD_BG = '#c4e1ef';
const ROW_BG = '#eef6fb';
const CHANGE_BG = '#fce3a0'; // yellow — highlight for a changed "after" chip
const GOLD = '#b3850e';

// Outer row: label · before chip · arrow · after chip · change-icon/chevron. The
// after column is a touch wider than the before column so its % never gets cut.
// The label column is sized to "Medication", the longest one that has to stay on
// a single line, and no wider — the chips need the rest.
const GRID = 'grid items-center gap-[8px] [grid-template-columns:120px_0.95fr_24px_1.1fr_32px]';
// Inside every chip: main (per-delivery / med name) · total integer · total
// fraction + word · % — split at the decimal so the totals line up in a column.
// The before chip carries no %, so its trailing column is minimal; the after chip
// gives the % a wide slot so 2–3 digit changes fit.
//
// The totals column has to hold INT_W + FRAC_W + the trailing unit, and units run
// as long as "mcg/24h" (179px all told). Anything narrower pushes the unit under
// the % beside it, so the column is sized to that worst case and the main column
// — which never needs more than ~135px, for "0.010 mg/del" — gives up the room.
const CHIP_BEFORE = 'rounded-[8px] h-[60px] grid items-baseline content-center px-[14px] gap-x-[6px] [grid-template-columns:1fr_184px_16px]';
const CHIP_AFTER = 'rounded-[8px] h-[60px] grid items-baseline content-center px-[14px] gap-x-[6px] [grid-template-columns:1fr_184px_78px]';
// Right-aligned integer box + fixed fraction box: the decimal point lands on one
// x (digits stay joined, "1.6") AND the trailing label ("total"/"mg/day") always
// starts on the same x, since the fraction slot is a constant width.
const INT_W = '46px';
const FRAC_W = '64px';

const BEFORE_COLOR = '#00769e';
const AFTER_COLOR = GOLD; // dark yellow — the whole "after" section reads in this

type Val = { value: string; ug: number };
type Cell = { v: Val; total: Val | null } | null;

function ArrowIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
      <path d="M4 12h13M12 6l6 6-6 6" stroke="#0094c5" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// Circular "changed" marker (filled gold sync disc) — the Figma update icon.
function ChangeIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path fillRule="evenodd" clipRule="evenodd" d="M16 0C7.168 0 0 7.168 0 16C0 24.832 7.168 32 16 32C24.832 32 32 24.832 32 16C32 7.168 24.832 0 16 0ZM9.6 23.136V24.8C9.6 25.456 9.056 26 8.4 26C7.744 26 7.2 25.456 7.2 24.8V20C7.2 19.344 7.744 18.8 8.4 18.8H13.2C13.856 18.8 14.4 19.344 14.4 20C14.4 20.656 13.856 21.2 13.2 21.2H11.04C11.04 21.2 11.136 21.312 11.2 21.344C11.312 21.472 11.44 21.568 11.568 21.664C14.384 23.888 18.496 23.696 21.088 21.088L22.24 19.952C22.24 19.952 22.368 19.84 22.432 19.792C22.88 19.52 23.472 19.584 23.872 19.952C24.128 20.208 24.256 20.528 24.256 20.864C24.256 20.928 24.256 20.992 24.256 21.056C24.24 21.136 24.208 21.2 24.192 21.264C24.128 21.408 24.048 21.536 23.936 21.648L22.8 22.784C21.872 23.712 20.784 24.416 19.632 24.896C17.904 25.6 16 25.776 14.176 25.424C13.872 25.36 13.584 25.296 13.28 25.2C12.976 25.12 12.688 25.008 12.4 24.896C12.112 24.784 11.824 24.64 11.552 24.496C11.28 24.352 11.008 24.192 10.736 24.016C10.464 23.84 10.208 23.648 9.952 23.44C9.84 23.344 9.728 23.248 9.616 23.136H9.6ZM25.2 12C25.2 12.656 24.656 13.2 24 13.2H19.136C19.136 13.2 19.024 13.184 18.96 13.168C18.896 13.168 18.832 13.152 18.768 13.12C18.448 12.992 18.208 12.752 18.08 12.432C18.048 12.368 18.032 12.304 18.032 12.24C18.016 12.176 18 12.128 18 12.064V12C18 11.84 18.032 11.68 18.096 11.536C18.144 11.408 18.224 11.28 18.336 11.184C18.368 11.136 18.4 11.104 18.448 11.088C18.528 10.992 18.624 10.944 18.736 10.896C18.8 10.864 18.88 10.848 18.96 10.832C19.024 10.816 19.072 10.8 19.136 10.8H20.96C20.96 10.8 20.864 10.704 20.816 10.656C20.688 10.544 20.56 10.432 20.432 10.336C17.6 8.112 13.504 8.32 10.912 10.912L10.448 11.376C10.272 11.552 10.064 11.648 9.84 11.696C9.472 11.76 9.072 11.648 8.784 11.376C8.48 11.072 8.368 10.672 8.432 10.288C8.448 10.208 8.48 10.144 8.496 10.08C8.544 9.936 8.64 9.792 8.752 9.68L9.216 9.216C12.96 5.472 19.04 5.472 22.784 9.216H22.8V7.2C22.8 6.544 23.344 6 24 6C24.656 6 25.2 6.544 25.2 7.2V12Z" fill="#B3850E" />
    </svg>
  );
}

function Chevron({ up }: { up?: boolean }) {
  return (
    <svg width="30" height="30" viewBox="0 0 24 24" fill="none" style={{ transform: up ? 'rotate(180deg)' : undefined }}>
      <path d="M6 9l6 6 6-6" stroke="#00769e" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Chip({ bg, after, children }: { bg: string; after: boolean; children: React.ReactNode }) {
  return <div className={after ? CHIP_AFTER : CHIP_BEFORE} style={{ background: bg }}>{children}</div>;
}

function Dash() {
  return <span className={`${FONT} font-normal text-[#9aa7b0] text-[28px]`} style={wdth}>—</span>;
}

/**
 * The four grid cells inside a dose chip: per-delivery · total-integer (right,
 * to the decimal column) · total-fraction + "total" (left) · % (after only).
 * Splitting the total at its decimal keeps every total's point on one x.
 */
function doseCells(cell: Cell, unit: string, after: boolean, pct: number | null, changed: boolean) {
  const gold = after && changed; // only a *changed* after value goes gold; unchanged stays blue
  const color = gold ? AFTER_COLOR : BEFORE_COLOR;
  const labelColor = gold ? AFTER_COLOR : '#5f8aa0';
  if (!cell) return (<><span className="flex items-baseline"><Dash /></span><span /><span /></>);
  const [ip, fp] = cell.total ? splitNum(cell.total.value) : ['', ''];
  return (
    <>
      <span className="flex items-baseline whitespace-nowrap min-w-0">
        <span className={`${FONT} font-normal text-[30px] tracking-[0.1px]`} style={{ color, ...wdth }}>{cell.v.value}</span>
        <span className={`${FONT} font-normal text-[18px] ml-[5px]`} style={{ color: labelColor, ...wdth }}>{unit}</span>
      </span>
      <span className="whitespace-nowrap">
        {cell.total && (
          <>
            <span className={`${FONT} inline-block text-right font-bold text-[30px] tracking-[0.1px]`} style={{ width: INT_W, color, ...wdth }}>{ip}</span>
            <span className={`${FONT} inline-block font-bold text-[30px] tracking-[0.1px]`} style={{ width: FRAC_W, color, ...wdth }}>{fp ? `.${fp}` : ''}</span>
            <span className={`${FONT} font-normal text-[17px]`} style={{ color: labelColor, ...wdth }}>total</span>
          </>
        )}
      </span>
      <span className="flex items-baseline whitespace-nowrap">
        {pct != null && pct !== 0 && (
          <span className={`${FONT} font-bold text-[24px]`} style={{ color: AFTER_COLOR, ...wdth }}>{pct > 0 ? '+' : '−'}{Math.abs(pct)} %</span>
        )}
      </span>
    </>
  );
}

function cellChanged(before: Cell, after: Cell): boolean {
  if (!before || !after) return true; // added or removed
  return before.v.value !== after.v.value || (before.total?.value ?? '') !== (after.total?.value ?? '');
}
function deltaPct(before: Cell, after: Cell): number | null {
  if (!before || !after || before.v.ug <= 0) return null;
  return Math.round((after.v.ug / before.v.ug - 1) * 100);
}

/** A before/after row for a dose metric (Frequency, Total 24 h, Default delivery, a window). */
function DoseRow({ label, unit, before, after }: { label: string; unit: string; before: Cell; after: Cell }) {
  const changed = cellChanged(before, after);
  const delta = changed ? deltaPct(before, after) : null;
  return (
    <div className={GRID}>
      <p className={labelCls}>{label}</p>
      <Chip bg={ROW_BG} after={false}>{doseCells(before, unit, false, null, false)}</Chip>
      <span />
      <Chip bg={changed ? CHANGE_BG : ROW_BG} after={true}>{doseCells(after, unit, true, delta, changed)}</Chip>
      <span className="flex justify-center">{changed && <ChangeIcon />}</span>
    </div>
  );
}

type MedHeadData = { name: string; concentration: string; total: Val };

/**
 * Header chip cells: med name (left) · Total 24 h split at its decimal so it lines
 * up with the totals column below. Concentration is dropped here — the totals sit
 * right after the ~150px per-delivery values, leaving no room for it.
 */
function medCells(m: MedHeadData | null, unit: string, after: boolean, pct: number | null, changed: boolean) {
  const gold = after && changed; // only a *changed* after header goes gold; unchanged stays blue
  const color = gold ? AFTER_COLOR : BEFORE_COLOR;
  if (!m) return (<><span className="flex items-baseline"><Dash /></span><span /><span /></>);
  const labelColor = gold ? AFTER_COLOR : '#5f8aa0';
  const [ip, fp] = splitNum(m.total.value);
  return (
    <>
      <span className="flex items-baseline whitespace-nowrap min-w-0">
        <span className={`${FONT} font-bold text-[26px] tracking-[0.1px] truncate`} style={{ color, ...wdth }}>{m.name}</span>
      </span>
      <span className="whitespace-nowrap">
        <span className={`${FONT} inline-block text-right font-bold text-[30px] tracking-[0.1px]`} style={{ width: INT_W, color, ...wdth }}>{ip}</span>
        <span className={`${FONT} inline-block font-bold text-[30px] tracking-[0.1px]`} style={{ width: FRAC_W, color, ...wdth }}>{fp ? `.${fp}` : ''}</span>
        <span className={`${FONT} font-normal text-[17px]`} style={{ color: labelColor, ...wdth }}>{unit}</span>
      </span>
      {/* Total 24 h change %, in the same column as the delivery-row %. */}
      <span className="flex items-baseline whitespace-nowrap">
        {pct != null && pct !== 0 && (
          <span className={`${FONT} font-bold text-[24px]`} style={{ color: AFTER_COLOR, ...wdth }}>{pct > 0 ? '+' : '−'}{Math.abs(pct)} %</span>
        )}
      </span>
    </>
  );
}

/**
 * The medication header line: name + Total 24 h, before→after. Collapsible (like
 * the therapy detail accordion) — the chevron toggles the medication's rows; the
 * amber tint still flags a changed total when collapsed.
 */
function MedHeaderRow({ before, after, unit, expanded, onToggle }: { before: MedHeadData | null; after: MedHeadData; unit: string; expanded: boolean; onToggle: () => void }) {
  const changed = !before || before.name !== after.name || before.concentration !== after.concentration || before.total.value !== after.total.value;
  const totalPct = before && before.total.ug > 0 ? Math.round((after.total.ug / before.total.ug - 1) * 100) : null;
  return (
    <button onClick={onToggle} className={`${GRID} cursor-pointer text-left w-full`}>
      <p className={labelCls}>Medication</p>
      <Chip bg={HEAD_BG} after={false}>{medCells(before, unit, false, null, false)}</Chip>
      <span className="flex justify-center"><ArrowIcon /></span>
      <Chip bg={changed ? CHANGE_BG : HEAD_BG} after={true}>{medCells(after, unit, true, changed ? totalPct : null, changed)}</Chip>
      <span className="flex justify-center"><Chevron up={expanded} /></span>
    </button>
  );
}

type TherapyLike = { medications: Medication[]; baseDose: number; bolusCount: number; intervals: Interval[] };
type MedComputed = {
  name: string;
  concentration: string;
  unitLabel: string;
  total24h: Val;
  defaultDelivery: { v: Val; total: Val };
  winMap: Map<string, { startMin: number; endMin: number; v: Val; total: Val }>;
};

function computeMed(t: TherapyLike, i: number): MedComputed | null {
  const m = t.medications[i];
  if (!m) return null;
  const windows = [...t.intervals].sort((a, b) => a.startMin - b.startMin);
  const c0 = t.medications[0] ? concUgPerUl(t.medications[0]) : 1;
  const cm = concUgPerUl(m);
  const bolusN = Math.max(1, t.bolusCount);
  const baseUg = i === 0 ? t.baseDose : coDoseUgDay(t.baseDose, c0, cm);
  const primaryDaily = estimatedDailyTotal(t.baseDose, windows);
  const totalUg = i === 0 ? primaryDaily : coDoseUgDay(primaryDaily, c0, cm);
  const val = (ug: number): Val => ({ value: doseStringsFor(ug, m.unit).perDay, ug });

  // Deliveries running at the default (base) dose = all deliveries the windows
  // don't carve out — used to sum the default deliveries, mirroring each window.
  const windowCount = windows.reduce((s, w) => s + windowDeliverySpan(w.startMin, w.endMin, t.bolusCount).count, 0);
  const defaultCount = Math.max(0, t.bolusCount - windowCount);

  const winMap = new Map<string, { startMin: number; endMin: number; v: Val; total: Val }>();
  for (const w of windows) {
    const rateUg = i === 0 ? w.dose : coDoseUgDay(w.dose, c0, cm);
    const span = windowDeliverySpan(w.startMin, w.endMin, t.bolusCount);
    winMap.set(w.id, { startMin: w.startMin, endMin: w.endMin, v: val(rateUg / bolusN), total: val((rateUg / bolusN) * span.count) });
  }
  return {
    name: m.name || (i === 0 ? 'Primary' : 'Medication'),
    concentration: `${m.concentration} ${m.unit}`,
    unitLabel: doseStringsFor(0, m.unit).unit,
    total24h: val(totalUg),
    defaultDelivery: { v: val(baseUg / bolusN), total: val((baseUg / bolusN) * defaultCount) },
    winMap,
  };
}

/**
 * The Review-page body as a before/after comparison: the committed therapy (from
 * the pre-edit snapshot) beside the edited one, with changed rows highlighted and
 * their +/-% change. Falls back to the plain breakdown if there is no snapshot.
 */
export function TherapyChangeReview() {
  const { medications, baseDose, bolusCount, intervalsByDay, editBefore, dayPattern } = useTherapy();
  // All medications folded in by default; the clinician expands one to inspect it.
  const [expandedId, setExpandedId] = useState<string | null>(null);
  // When days differ, the day-group toggle picks which day's schedule to compare.
  const [viewDay, setViewDay] = useState<DayKey>('monday');
  const beforeSnap: BeforeTherapy | null = editBefore;
  if (!beforeSnap) return <TherapyMedBreakdown />;

  const displayDay = repDay(dayPattern, viewDay);
  const before: BeforeTherapy = { ...beforeSnap, intervals: beforeSnap.intervalsByDay[displayDay] };
  const after: TherapyLike = { medications, baseDose, bolusCount, intervals: intervalsByDay[displayDay] };
  const freqBefore: Cell = { v: { value: `${before.bolusCount}`, ug: before.bolusCount }, total: null };
  const freqAfter: Cell = { v: { value: `${bolusCount}`, ug: bolusCount }, total: null };

  return (
    <div className="flex flex-col gap-[32px]">
      {/* Day-group switcher — only when the schedule differs by day. */}
      <DayGroupToggle dayPattern={dayPattern} viewDay={viewDay} onPick={setViewDay} />

      {/* Before / After column captions */}
      <div className={GRID}>
        <span />
        <p className={`${FONT} font-normal text-[#8a97a1] text-[22px] tracking-[1px] uppercase`} style={wdth}>Before</p>
        <span />
        <p className={`${FONT} font-normal text-[#8a97a1] text-[22px] tracking-[1px] uppercase`} style={wdth}>After</p>
        <span />
      </div>

      {/* Delivery frequency (therapy-wide) */}
      <DoseRow label="Frequency" unit="deliveries" before={freqBefore} after={freqAfter} />

      {/* One block per medication */}
      {medications.map((m, i) => {
        const aMed = computeMed(after, i);
        if (!aMed) return null;
        const bm = before.medications[i];
        const bMed = bm && bm.id === m.id ? computeMed(before, i) : null;

        // Union of window ids, ordered by start time (from whichever side has it).
        const winIds = new Map<string, { startMin: number; endMin: number }>();
        aMed.winMap.forEach((w, id) => winIds.set(id, { startMin: w.startMin, endMin: w.endMin }));
        bMed?.winMap.forEach((w, id) => { if (!winIds.has(id)) winIds.set(id, { startMin: w.startMin, endMin: w.endMin }); });
        const orderedWins = [...winIds.entries()].sort((a, b) => a[1].startMin - b[1].startMin);

        const perDelUnit = `${aMed.unitLabel}/del`;
        return (
          <div key={m.id} className="flex flex-col gap-[12px]">
            <MedHeaderRow
              unit={`${aMed.unitLabel}/24h`}
              before={bMed ? { name: bMed.name, concentration: bMed.concentration, total: bMed.total24h } : null}
              after={{ name: aMed.name, concentration: aMed.concentration, total: aMed.total24h }}
              expanded={expandedId === m.id}
              onToggle={() => setExpandedId(id => (id === m.id ? null : m.id))}
            />
            {expandedId === m.id && (
              <>
                <DoseRow label="Default delivery" unit={perDelUnit} before={bMed ? bMed.defaultDelivery : null} after={aMed.defaultDelivery} />
                {orderedWins.map(([id, span]) => {
                  const aw = aMed.winMap.get(id);
                  const bw = bMed?.winMap.get(id);
                  const s = windowDeliverySpan(span.startMin, span.endMin, aw ? bolusCount : before.bolusCount);
                  const label = s.firstMin === s.lastMin ? fmtTime(s.firstMin) : `${fmtTime(s.firstMin)}–${fmtTime(s.lastMin)}`;
                  return (
                    <DoseRow
                      key={id}
                      label={label}
                      unit={perDelUnit}
                      before={bw ? { v: bw.v, total: bw.total } : null}
                      after={aw ? { v: aw.v, total: aw.total } : null}
                    />
                  );
                })}
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}
