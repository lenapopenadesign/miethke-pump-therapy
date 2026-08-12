import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { useNavigate } from '../navigation';
import { useTherapy, fmtTime, concUgPerUl, coDoseUgDay, doseStringsFor, strokesPerDay, windowDeliverySpan, pctVsDefault, BOLUS_VOLUME_UL, scopeForDay, type Medication, type Interval, type DayKey, type DayPattern } from '../therapy';
import { WizardShell } from '../components/WizardShell';
import { WizardChart, WizardTotalsFooter, SaveButton, WindowsIcon, SectionHeader, StepButton, WarningBanner } from '../components/WizardParts';
import { MedicationIcon } from '../components/MedicationIcon';
import { Caption, Field, Readout, SelectField, fieldValueCls, fieldUnitCls } from '../components/Field';
import { ModeToggle, DayGroupToggle, repDay } from '../components/DayToggles';

const imgEditPencil = "/icons/edit-pencil.svg";

/**
 * The one width every input in the add/edit sheet is drawn at. Kept in step with
 * the field track of ROW_GRID below — Tailwind only sees class names it can read
 * in the source, so that grid has to spell the number out rather than build it.
 */
const FIELD_W = 340;
/**
 * Gap between the From and To menus, set so the To menu occupies exactly the
 * dose field's column: 340 + 24 = 364 = 268 + 16 + 64 + 16. The two therefore
 * share a left edge and a right edge, and the From / To pair ends where the dose
 * field ends.
 */
const TIMES_GAP = 24;

/** The dose rows: label · − · field · + · figure, the field track one FIELD_W. */
const ROW_GRID = '[grid-template-columns:268px_64px_340px_64px_240px]';

/**
 * Dev aid, alongside App.tsx's `#raw=`: `#sheet=add` opens the add-delivery
 * editor on mount with a sample run picked, so the sheet — which otherwise only
 * exists after a click — can be linked to, screenshotted, or captured as a
 * screen. Read once at module load, like the other hash flags.
 */
const OPEN_SHEET = new URLSearchParams(
  typeof window !== 'undefined' ? window.location.hash.replace(/^#/, '') : '',
).get('sheet') === 'add';

/** The teal name at the head of a {@link ROW_GRID} row. */
function RowLabel({ children }: { children: ReactNode }) {
  return (
    <span className="font-['Roboto',sans-serif] font-bold text-[#00769e] text-[30px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
      {children}
    </span>
  );
}

function Kebab({ onClick }: { onClick: () => void }) {
  return (
    <button onClick={onClick} className="size-[56px] flex items-center justify-center cursor-pointer shrink-0" aria-label="Window options">
      <svg width="8" height="32" viewBox="0 0 8 32" fill="#98a4ad"><circle cx="4" cy="5" r="4" /><circle cx="4" cy="16" r="4" /><circle cx="4" cy="27" r="4" /></svg>
    </button>
  );
}

export function DosingWindows() {
  const navigate = useNavigate();
  const { baseDose, bolusCount, intervalsByDay, dayPattern, setDayPattern, addWindowFor, updateWindowFor, removeWindowFor, syncAllDaysTo, medications, flowMode } = useTherapy();
  const isRefill = flowMode === 'refill';
  // Which day-group is being edited/viewed. displayDay is its representative day;
  // scope is the set of days an edit touches.
  const [viewDay, setViewDay] = useState<DayKey>('monday');
  const displayDay = repDay(dayPattern, viewDay);
  const scope = scopeForDay(dayPattern, viewDay);
  const windows = intervalsByDay[displayDay];
  // Switching back to "Same Daily" unifies every day onto the schedule on screen.
  const onModeChange = (p: DayPattern) => { if (p === 'same') syncAllDaysTo(displayDay); setViewDay('monday'); setDayPattern(p); };
  const c0 = medications[0] ? concUgPerUl(medications[0]) : 1;

  // Selectable delivery moments = the delivery frequency chosen on the previous
  // (Base Dose) step: n boluses/day ⇒ n evenly-spaced moments. slotEdges[i] is the
  // time of moment i; slot i "owns" the span up to the next moment (slotEdges[i+1]).
  const slotCount = Math.max(1, bolusCount);
  const slotEdges = useMemo(
    () => Array.from({ length: slotCount + 1 }, (_, i) => Math.round((i * 1440) / slotCount)),
    [slotCount],
  );
  const minToSlot = (min: number) => Math.min(slotCount - 1, Math.max(0, Math.floor((min * slotCount) / 1440)));

  // A window's label = its first and last *actual* delivery time (snapped to the
  // delivery grid), so it always matches the times shown in the picker.
  const deliveryRangeLabel = (startMin: number, endMinExclusive: number) => {
    const { firstMin, lastMin } = windowDeliverySpan(startMin, endMinExclusive, bolusCount);
    return firstMin === lastMin ? fmtTime(firstMin) : `${fmtTime(firstMin)} – ${fmtTime(lastMin)}`;
  };

  // Add / edit editor state. `editingId` is the window being edited (null = new).
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  // The two ends of the selected run, as slot indices. Which of a / b is the
  // lower one doesn't matter — a drag can cross over its own anchor.
  const [range, setRange] = useState<{ a: number; b: number } | null>(null);
  // Dose for this customised delivery, counted in whole 10 µl strokes per
  // delivery (the pump's minimum increment). null = not opened yet.
  const [strokes, setStrokes] = useState<number | null>(null);
  const [refIndex, setRefIndex] = useState(0); // which medication the dose readout refers to

  const minSlot = range ? Math.min(range.a, range.b) : null;
  const maxSlot = range ? Math.max(range.a, range.b) : null;
  const selStartMin = minSlot != null ? slotEdges[minSlot] : null;
  const selEndMin = maxSlot != null ? slotEdges[maxSlot + 1] : null;
  const selCount = minSlot != null && maxSlot != null ? maxSlot - minSlot + 1 : 0;

  // The FROM / TO menus offer exactly the delivery moments the frequency implies
  // — the same list the editor used to make you tick one row at a time. TO never
  // offers a moment before FROM, so the range can't be inverted.
  const slotOptions = useMemo(
    () => Array.from({ length: slotCount }, (_, i) => ({ value: i, label: fmtTime(slotEdges[i]) })),
    [slotCount, slotEdges],
  );
  const toOptions = useMemo(
    () => (minSlot == null ? slotOptions : slotOptions.slice(minSlot)),
    [slotOptions, minSlot],
  );

  // Windows are expressed per delivery: one delivery is 1/bolusCount of the day.
  const bolusN = Math.max(1, bolusCount);

  // Dose is built from whole 10 µl strokes. One stroke carries `primaryStrokeUg`
  // of the primary drug; `baseK` is how many strokes each delivery gets at the
  // plain base dose (an integer, since bolusCount divides the day's strokes).
  const primaryStrokeUg = c0 * BOLUS_VOLUME_UL;
  const totalStrokes = strokesPerDay(baseDose, c0);
  const baseK = Math.max(1, Math.round(totalStrokes / bolusN));
  const MAX_K = Math.max(baseK * 4, totalStrokes); // generous ceiling for the +/- stepper
  const strokeK = strokes ?? baseK;
  // Daily-equivalent primary µg this delivery rate implies (what a window stores).
  const primaryDose = strokeK * primaryStrokeUg * bolusN;

  // Per-delivery dose of medication i, given the primary's daily µg, in its unit.
  const perDelivery = (primaryDailyUg: number, m: Medication, i: number) => {
    const ug = i === 0 ? primaryDailyUg : coDoseUgDay(primaryDailyUg, c0, concUgPerUl(m));
    const d = doseStringsFor(ug / bolusN, m.unit);
    return { value: d.perDay, unit: `${d.unit}/del` };
  };

  // While the editor is open, preview the window being edited at its live dose so
  // the chart bars grow/shrink as the +/- stepper changes the value.
  // The schedule without the window being edited — the "before" the footer
  // measures the edit's contribution against.
  const restWindows: Interval[] = useMemo(
    () => (editingId ? windows.filter(w => w.id !== editingId) : windows),
    [windows, editingId],
  );
  const previewWindows: Interval[] = useMemo(() => {
    if (!open || selStartMin == null || selEndMin == null) return windows;
    return [...restWindows, { id: editingId ?? '__preview', startMin: selStartMin, endMin: selEndMin, dose: Math.round(primaryDose), label: 'Customised delivery' }];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [windows, restWindows, open, editingId, selStartMin, selEndMin, primaryDose]);

  const resetEditor = () => { setOpen(false); setEditingId(null); setRange(null); setStrokes(null); setRefIndex(0); setWarnDismissedAt(null); };

  const openNew = () => { setEditingId(null); setRange(null); setStrokes(baseK); setRefIndex(0); setWarnDismissedAt(null); setOpen(true); };

  // #sheet=add — open the editor on a representative morning run, so the
  // captured screen shows the sheet filled in rather than empty.
  useEffect(() => {
    if (!OPEN_SHEET) return;
    setEditingId(null); setRefIndex(0); setWarnDismissedAt(null);
    setRange({ a: Math.round(slotCount * 0.3), b: Math.round(slotCount * 0.55) });
    setStrokes(baseK * 2);
    setOpen(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const openEdit = (id: string) => {
    const w = windows.find(x => x.id === id);
    if (!w) return;
    setEditingId(id);
    setRange({ a: minToSlot(w.startMin), b: minToSlot(w.endMin - 1) });
    setRefIndex(0);
    setWarnDismissedAt(null);
    // Recover the stored dose as a whole stroke-per-delivery count.
    setStrokes(primaryStrokeUg > 0 ? Math.max(0, Math.round(w.dose / bolusN / primaryStrokeUg)) : baseK);
    setOpen(true);
  };

  // The chart reports a whole range as it is dragged — sweeping the plot or
  // dragging a handle both land here, as does each menu pick, so the chart and
  // the From / To fields can never disagree.
  const setRangeSlots = (min: number, max: number) => setRange({ a: min, b: max });
  const pickFrom = (i: number) => setRange(prev => ({ a: i, b: Math.max(i, prev ? Math.max(prev.a, prev.b) : i) }));
  const pickTo = (i: number) => setRange(prev => ({ a: Math.min(i, prev ? Math.min(prev.a, prev.b) : i), b: i }));

  const selPct = pctVsDefault(primaryDose, baseDose);

  // More than double the default delivery is the same "check for a decimal slip"
  // moment the Default Delivery step warns about. Dismissing records the stroke
  // count it was dismissed at, so the warning comes back if the dose is raised
  // again rather than staying gone for the rest of the edit.
  const [warnDismissedAt, setWarnDismissedAt] = useState<number | null>(null);
  const increasePct = baseDose > 0 ? Math.round((primaryDose / baseDose - 1) * 100) : 0;
  const bigIncrease = selCount > 0 && baseDose > 0 && primaryDose > baseDose * 2;
  const showBigIncrease = bigIncrease && (warnDismissedAt == null || strokeK > warnDismissedAt);
  // A caution the reader hasn't seen is no caution at all: if the sheet is tall
  // enough that it appears below the fold, bring it up. A no-op when it already
  // fits, which is the usual case.
  const warnRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (showBigIncrease) warnRef.current?.scrollIntoView({ block: 'nearest' });
  }, [showBigIncrease]);

  // Number of deliveries a stored window covers (its slot span).
  const windowDeliveries = (w: { startMin: number; endMin: number }) =>
    windowDeliverySpan(w.startMin, w.endMin, bolusCount).count;

  // Step the dose by whole strokes (10 µl each), clamped to [0, MAX_K].
  const stepStrokes = (delta: number) => setStrokes(Math.max(0, Math.min(MAX_K, strokeK + delta)));
  // Pen tap: switch which medication the readout refers to. A stroke is a fixed
  // volume, so switching only changes the unit shown — never the dose itself.
  const switchRef = (j: number) => setRefIndex(j);

  const commit = () => {
    if (selStartMin == null || selEndMin == null) return;
    const dose = Math.round(primaryDose);
    if (editingId) updateWindowFor(scope, editingId, { startMin: selStartMin, endMin: selEndMin, dose });
    else addWindowFor(scope, { label: 'Customised delivery', startMin: selStartMin, endMin: selEndMin, dose });
    resetEditor();
  };

  return (
    <WizardShell
      step="windows"
      onBack={() => navigate('base-dose')}
      onHelp={() => navigate('help')}
      pinnedTop={<WizardChart windowsOverride={windows} />}
      footer={
        <>
          <WizardTotalsFooter windowsOverride={windows} />
          <div className="bg-[#e6f4f9] px-[80px] pt-[24px] pb-[40px]">
            {/* A refill routes through the Refill Alert step before Review. */}
            <SaveButton label="Next" onClick={() => navigate(isRefill ? 'refill-date' : 'review')} />
          </div>
        </>
      }
      overlay={open && (
        <div className="absolute inset-0 flex flex-col justify-end">
          {/* Backdrop — click to dismiss */}
          <div className="absolute inset-0 bg-[#0b1220]/60" onClick={resetEditor} />

          {/* Full-width bottom sheet */}
          {/* A fixed height, not a content-driven one: the dose block and the
              warning both appear part-way through, and a sheet that grew each
              time would shove everything already on screen upwards. Sized for
              the fullest state (~1570px, dose + warning) and still clear of the
              215px of header + stepper above; the body scrolls if a therapy has
              enough medications to exceed it. */}
          <div className="relative w-[1200px] h-[1580px] bg-white rounded-t-[44px] flex flex-col" style={{ boxShadow: '0 -16px 70px rgba(0,0,0,0.35)' }}>
            {/* Drag handle */}
            <div className="flex justify-center pt-[20px] shrink-0"><div className="w-[96px] h-[8px] rounded-full bg-[#d4dde3]" /></div>

            {/* Header — just the close control. No title or subtitle: the two
                section headings below name the two decisions, and in edit mode
                the Delete action in the footer marks the sheet as an edit. */}
            <div className="flex justify-end px-[80px] pt-[12px] pb-[8px] shrink-0">
              <button onClick={resetEditor} aria-label="Close" className="size-[56px] rounded-full flex items-center justify-center text-[#00769e] cursor-pointer shrink-0">
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" /></svg>
              </button>
            </div>

            {/* Body — three blocks, generously spaced: the diagram, which
                deliveries, what dose. Everything derived (the window subtotal,
                the day's new total) is stated once, quietly, rather than given a
                column of its own. */}
            <div className="flex-1 min-h-0 overflow-y-auto px-[80px] pt-[8px] pb-[32px] flex flex-col gap-[36px]">
              {/* 1. Diagram — the visual way to pick: tap a bar for the first
                     delivery, another for the last. Taller than the pinned chart
                     so the bars are a workable target, and it previews the dose
                     as the stepper changes it. */}
              <WizardChart
                windowsOverride={previewWindows}
                height={320}
                selection={{ slotCount, selMin: minSlot, selMax: maxSlot, onRange: setRangeSlots }}
              />

              {/* 2. Delivery times — the same moments the list used to spell out,
                     as two menus, so a long run is two taps rather than 40. The
                     count sits on the caption line instead of in a box. */}
              <div className="flex flex-col gap-[20px]">
                <SectionHeader icon={<WindowsIcon size={44} />} title="Select the deliveries" />
                {/* The pair starts at the left edge, spaced so the To menu lands
                    in the dose field's column below. The running count sits on
                    the same line, reading as a result of the two fields beside
                    it rather than a heading of its own. */}
                {/* The trailing track runs to the content edge so the count
                    right-aligns on the same line the CHANGE figures do. */}
                <div
                  className="grid items-center"
                  style={{ gridTemplateColumns: `${FIELD_W}px ${FIELD_W}px 1fr`, columnGap: TIMES_GAP, rowGap: 10 }}
                >
                  <Caption>From</Caption>
                  <Caption>To</Caption>
                  <span />
                  <SelectField name="First delivery" value={minSlot} options={slotOptions} onChange={pickFrom} />
                  <SelectField name="Last delivery" value={maxSlot} options={toOptions} onChange={pickTo} />
                  {/* Set like the CHANGE figure on the dose rows: both are the
                      trailing readout of the control to their left. */}
                  <span className="text-right font-['Roboto',sans-serif] font-bold text-[#b3850e] text-[32px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
                    {selCount > 0 ? `${selCount} selected` : ''}
                  </span>
                </div>
              </div>

              {/* 3. Dose — only once there is something to dose. Showing it
                     dimmed from the start put the busiest view in front of the
                     reader before they had done anything; revealing it also makes
                     the order of the two decisions self-evident. */}
              {selCount > 0 && (
              <div className="flex flex-col gap-[20px]">
                <SectionHeader icon={<MedicationIcon size={48} />} title="Adjust the dose" />
                <div className="flex flex-col gap-[20px]">
                {/* Captions sit over the columns they name, on the same grid. */}
                <div className={`grid items-baseline gap-[16px] ${ROW_GRID}`}>
                  <span />
                  <span />
                  <Caption className="whitespace-nowrap">Per delivery</Caption>
                  <span />
                  <span />
                </div>
                {medications.map((m, i) => {
                  const editing = i === refIndex;
                  const pd = perDelivery(primaryDose, m, i);
                  return (
                    /* Only the reference medication carries the stepper — a
                       stroke is a fixed volume, so the others follow from it and
                       are read-only, with a pen in the +'s slot to switch which
                       one is being dialled. */
                    <div key={m.id} className={`grid items-center gap-[16px] ${ROW_GRID}`}>
                      <RowLabel>{m.name || 'Medication'}</RowLabel>

                      {editing
                        ? <StepButton label="−" ariaLabel="Decrease dose by one 10 µl stroke" onClick={() => stepStrokes(-1)} disabled={strokeK <= 0} />
                        : <span />}

                      {editing ? (
                        <Field>
                          <span className={fieldValueCls} style={{ fontVariationSettings: "'wdth' 100" }}>{pd.value}</span>
                          <span className={fieldUnitCls} style={{ fontVariationSettings: "'wdth' 100" }}>{pd.unit}</span>
                        </Field>
                      ) : (
                        <Readout>
                          <span className="font-['Roboto',sans-serif] font-bold text-[#00769e] text-[32px]" style={{ fontVariationSettings: "'wdth' 100" }}>{pd.value}</span>
                          <span className="font-['Roboto',sans-serif] font-normal text-[#5e8aa1] text-[24px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>{pd.unit}</span>
                        </Readout>
                      )}

                      {editing ? (
                        <StepButton label="+" ariaLabel="Increase dose by one 10 µl stroke" onClick={() => stepStrokes(1)} disabled={strokeK >= MAX_K} />
                      ) : (
                        <button onClick={() => switchRef(i)} aria-label={`Set the dose in ${m.name || 'this medication'}`} className="size-[64px] flex items-center justify-center cursor-pointer">
                          <img alt="" src={imgEditPencil} className="size-[40px]" />
                        </button>
                      )}

                      {/* Share of the default delivery, in the same amber the
                          Review page uses for a changed value. */}
                      <span className="font-['Roboto',sans-serif] font-bold text-[#b3850e] text-[32px] whitespace-nowrap text-right" style={{ fontVariationSettings: "'wdth' 100" }}>{selPct ?? ''}</span>
                    </div>
                  );
                })}
                </div>

                {/* Sits under the control that caused it, so the value and the
                    caution about it are read together. */}
                {showBigIncrease && (
                  <div ref={warnRef} className="mt-[20px]">
                    <WarningBanner
                      title={`Large dose increase (+${increasePct}%)`}
                      onDismiss={() => setWarnDismissedAt(strokeK)}
                    >
                      Please double-check for a decimal slip. You can keep this value if it’s intended.
                    </WarningBanner>
                  </div>
                )}
              </div>
              )}
            </div>

            {/* Footer — the running 24-hour totals the change feeds into, then the actions. */}
            <div className="shrink-0">
              <WizardTotalsFooter windowsOverride={previewWindows} deltaFrom={restWindows} />
              <div className="bg-[#e6f4f9] px-[80px] pt-[24px] pb-[40px] flex gap-[40px]">
                {editingId && (
                  <button onClick={() => { removeWindowFor(scope, editingId); resetEditor(); }} className="flex-1 h-[88px] rounded-[80px] bg-white border-2 border-[#c0392b] font-['Roboto',sans-serif] font-extrabold text-[#c0392b] text-[24px] cursor-pointer" style={{ fontVariationSettings: "'wdth' 100" }}>Delete</button>
                )}
                <button onClick={resetEditor} className="flex-1 h-[88px] rounded-[80px] bg-white border-2 border-[#0094c4] font-['Roboto',sans-serif] font-extrabold text-[#00769e] text-[24px] cursor-pointer" style={{ fontVariationSettings: "'wdth' 100" }}>Cancel</button>
                <button onClick={commit} disabled={selCount === 0} className={`flex-1 h-[88px] rounded-[80px] font-['Roboto',sans-serif] font-extrabold text-[24px] ${selCount === 0 ? 'bg-[#ccc] text-[#a5a5a5]' : 'bg-[#0094c5] text-white cursor-pointer'}`} style={{ fontVariationSettings: "'wdth' 100" }}>{editingId ? 'Save delivery' : 'Add delivery'}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    >
      <div className="flex flex-col gap-[32px]">
        {/* Title */}
        <SectionHeader icon={<WindowsIcon />} title="Customised Delivery" />

        {/* Day-differentiation: choose the pattern first; for weekday-weekend /
            per-day, a second toggle opens to pick which day-group to edit. */}
        <div className="flex flex-col gap-[12px]">
          <ModeToggle dayPattern={dayPattern} onChange={onModeChange} />
          <DayGroupToggle dayPattern={dayPattern} viewDay={viewDay} onPick={setViewDay} />
        </div>

        {/* Existing windows list */}
        {windows.length > 0 && (
          <div className="flex flex-col gap-[16px]">
            <p className="font-['Roboto',sans-serif] font-normal text-[#8a97a1] text-[22px] tracking-[1px] uppercase" style={{ fontVariationSettings: "'wdth' 100" }}>
              Customised deliveries ({windows.length})
            </p>
            {[...windows].sort((a, b) => a.startMin - b.startMin).map(w => {
              const pct = pctVsDefault(w.dose, baseDose);
              const pd = perDelivery(w.dose, medications[0], 0);
              const td = doseStringsFor((w.dose / bolusN) * windowDeliveries(w), medications[0].unit);
              return (
                <div key={w.id} className="bg-white border border-[#cfdbe3] rounded-[16px] h-[96px] grid items-center [grid-template-columns:1fr_210px_210px_100px_56px] gap-[16px] pl-[32px] pr-[12px]">
                  <p onClick={() => openEdit(w.id)} className="font-['Roboto',sans-serif] font-bold text-[#00769e] text-[32px] tracking-[0.1px] cursor-pointer whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
                    {deliveryRangeLabel(w.startMin, w.endMin)}
                  </p>
                  {/* Same order as the therapy/review breakdown: per delivery · total · %. */}
                  <span className="flex items-baseline whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
                    <span className="font-['Roboto',sans-serif] font-bold text-[#00769e] text-[32px] tracking-[0.1px]">{pd.value}</span>
                    <span className="font-['Roboto',sans-serif] font-normal text-[#5f8aa0] text-[22px] ml-[8px]">{pd.unit}</span>
                  </span>
                  <span className="flex items-baseline whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
                    <span className="font-['Roboto',sans-serif] font-bold text-[#00769e] text-[32px] tracking-[0.1px]">{td.perDay}</span>
                    <span className="font-['Roboto',sans-serif] font-normal text-[#5f8aa0] text-[22px] ml-[8px]">{td.unit} total</span>
                  </span>
                  {/* Share of the default delivery — same reading, same amber as the editor's. */}
                  <span className="font-['Roboto',sans-serif] font-bold text-[#b3850e] text-[32px] tracking-[0.1px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>{pct ?? ''}</span>
                  <Kebab onClick={() => openEdit(w.id)} />
                </div>
              );
            })}
          </div>
        )}

        {/* Add customised delivery — opens the editor modal */}
        <button
          onClick={openNew}
          className="self-start flex gap-[16px] h-[88px] items-center justify-center px-[40px] rounded-[80px] border-2 border-[#0094c5] cursor-pointer"
        >
          <span className="text-[#0094c5] text-[40px] leading-none">+</span>
          <span className="font-['Roboto',sans-serif] font-bold text-[#0094c5] text-[28px] tracking-[0.1px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>Add customised delivery</span>
        </button>
      </div>
    </WizardShell>
  );
}
