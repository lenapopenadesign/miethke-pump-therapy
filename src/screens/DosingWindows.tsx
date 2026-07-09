import { useMemo, useState } from 'react';
import { useNavigate } from '../navigation';
import { useTherapy, fmtTime, doseUnitFor, concUgPerUl, coDoseUgDay, doseStringsFor, strokesPerDay, windowDeliverySpan, BOLUS_VOLUME_UL, type Medication } from '../therapy';
import { WizardShell } from '../components/WizardShell';
import { WizardChart, WizardTotalsFooter, SaveButton, type Highlight } from '../components/WizardParts';

const imgEditPencil = "/icons/edit-pencil.svg";

function WindowsIcon() {
  return (
    <svg width="44" height="44" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="11" width="4" height="9" rx="1" fill="#0094c5" />
      <rect x="10" y="5" width="4" height="15" rx="1" fill="#0094c5" />
      <rect x="17" y="8" width="4" height="12" rx="1" fill="#0094c5" />
    </svg>
  );
}

function Kebab({ onClick }: { onClick: () => void }) {
  return (
    <button onClick={onClick} className="size-[56px] flex items-center justify-center cursor-pointer shrink-0" aria-label="Window options">
      <svg width="8" height="32" viewBox="0 0 8 32" fill="#98a4ad"><circle cx="4" cy="5" r="4" /><circle cx="4" cy="16" r="4" /><circle cx="4" cy="27" r="4" /></svg>
    </button>
  );
}

/** Percentage delta of a window's dose vs the base dose, e.g. "+30%". */
function deltaPct(dose: number, base: number): { text: string; up: boolean } | null {
  if (base <= 0) return null;
  const pct = Math.round((dose / base - 1) * 100);
  if (pct === 0) return null;
  return { text: `${pct > 0 ? '+' : '−'}${Math.abs(pct)}%`, up: pct > 0 };
}

export function DosingWindows() {
  const navigate = useNavigate();
  const { baseDose, bolusCount, intervals, addWindow, updateWindow, removeWindow, medications } = useTherapy();
  const windows = intervals; // shared schedule (every day identical)
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
  const [range, setRange] = useState<{ a: number; b: number } | null>(null); // slot indices
  // Dose for this customised delivery, counted in whole 10 µl strokes per
  // delivery (the pump's minimum increment). null = not opened yet.
  const [strokes, setStrokes] = useState<number | null>(null);
  const [refIndex, setRefIndex] = useState(0); // which medication the dose readout refers to

  const minSlot = range ? Math.min(range.a, range.b) : null;
  const maxSlot = range ? Math.max(range.a, range.b) : null;
  const selStartMin = minSlot != null ? slotEdges[minSlot] : null;
  const selEndMin = maxSlot != null ? slotEdges[maxSlot + 1] : null;
  const selCount = minSlot != null && maxSlot != null ? maxSlot - minSlot + 1 : 0;
  // Time-range label for the current selection = first–last selected delivery
  // (a single delivery shows just its one time, not "00:00 – 00:00").
  const rangeLabel = minSlot != null && maxSlot != null
    ? (minSlot === maxSlot ? fmtTime(slotEdges[minSlot]) : `${fmtTime(slotEdges[minSlot])} – ${fmtTime(slotEdges[maxSlot])}`)
    : '';

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

  const highlights: Highlight[] = useMemo(() => {
    // Box spans the coverage edge (startMin..endMin) so it aligns with the raised
    // bars; the label shows the first–last delivery so it matches the picker.
    const list: Highlight[] = windows.map(w => ({ startMin: w.startMin, endMin: w.endMin, label: deliveryRangeLabel(w.startMin, w.endMin) }));
    if (open && selStartMin != null && selEndMin != null) list.push({ startMin: selStartMin, endMin: selEndMin, label: rangeLabel });
    return list;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [windows, open, selStartMin, selEndMin, rangeLabel]);

  const resetEditor = () => { setOpen(false); setEditingId(null); setRange(null); setStrokes(null); setRefIndex(0); };

  const openNew = () => { setEditingId(null); setRange(null); setStrokes(baseK); setRefIndex(0); setOpen(true); };
  const openEdit = (id: string) => {
    const w = windows.find(x => x.id === id);
    if (!w) return;
    setEditingId(id);
    setRange({ a: minToSlot(w.startMin), b: minToSlot(w.endMin - 1) });
    setRefIndex(0);
    // Recover the stored dose as a whole stroke-per-delivery count.
    setStrokes(primaryStrokeUg > 0 ? Math.max(0, Math.round(w.dose / bolusN / primaryStrokeUg)) : baseK);
    setOpen(true);
  };

  // Clicking a slot: first click sets the anchor; the next extends the range from
  // the anchor so the selection is always contiguous.
  const clickSlot = (i: number) => {
    setRange(prev => (!prev ? { a: i, b: i } : { a: prev.a, b: i }));
  };

  const selDelta = deltaPct(primaryDose, baseDose);

  // Number of deliveries a stored window covers (its slot span).
  const windowDeliveries = (w: { startMin: number; endMin: number }) =>
    windowDeliverySpan(w.startMin, w.endMin, bolusCount).count;

  // Sum of the dose across every delivery in a window, per med: per-delivery dose
  // (from the window's primary daily µg) × number of deliveries in the window.
  const windowTotalFor = (primaryDailyUg: number, deliveries: number, m: Medication, i: number) => {
    const ug = i === 0 ? primaryDailyUg : coDoseUgDay(primaryDailyUg, c0, concUgPerUl(m));
    const d = doseStringsFor((ug / bolusN) * deliveries, m.unit);
    return `${d.perDay} ${d.unit}`;
  };
  // Current selection total (uses the live stepper dose + selected delivery count).
  const windowTotal = (m: Medication, i: number) => windowTotalFor(primaryDose, selCount, m, i);
  // Step the dose by whole strokes (10 µl each), clamped to [0, MAX_K].
  const stepStrokes = (delta: number) => setStrokes(Math.max(0, Math.min(MAX_K, strokeK + delta)));
  // Pen tap: switch which medication the readout refers to. A stroke is a fixed
  // volume, so switching only changes the unit shown — never the dose itself.
  const switchRef = (j: number) => setRefIndex(j);

  const commit = () => {
    if (selStartMin == null || selEndMin == null) return;
    const dose = Math.round(primaryDose);
    if (editingId) updateWindow(editingId, { startMin: selStartMin, endMin: selEndMin, dose });
    else addWindow({ label: 'Customised delivery', startMin: selStartMin, endMin: selEndMin, dose });
    resetEditor();
  };

  return (
    <WizardShell
      step="windows"
      onBack={() => navigate('base-dose')}
      pinnedTop={<WizardChart highlights={highlights} onHelp={() => navigate('help')} />}
      footer={
        <>
          <WizardTotalsFooter />
          <div className="bg-[#e6f4f9] px-[80px] pt-[24px] pb-[40px]">
            <SaveButton onClick={() => navigate('review')} />
          </div>
        </>
      }
      overlay={open && (
        <div className="absolute inset-0 flex flex-col justify-end">
          {/* Backdrop — click to dismiss */}
          <div className="absolute inset-0 bg-[#0b1220]/60" onClick={resetEditor} />

          {/* Full-width bottom sheet */}
          <div className="relative w-[1200px] bg-white rounded-t-[44px] flex flex-col max-h-[1580px]" style={{ boxShadow: '0 -16px 70px rgba(0,0,0,0.35)' }}>
            {/* Drag handle */}
            <div className="flex justify-center pt-[20px] shrink-0"><div className="w-[96px] h-[8px] rounded-full bg-[#d4dde3]" /></div>

            {/* Header — title + close */}
            <div className="flex items-start justify-between px-[80px] pt-[24px] pb-[20px] shrink-0">
              <div className="flex flex-col gap-[6px]">
                <p className="font-['Roboto',sans-serif] font-bold text-[#00769e] text-[48px] tracking-[0.1px]" style={{ fontVariationSettings: "'wdth' 100" }}>
                  {editingId ? 'Edit customised delivery' : 'Add customised delivery'}
                </p>
                <p className="font-['Roboto',sans-serif] font-normal text-[#8a97a1] text-[26px] tracking-[0.1px]" style={{ fontVariationSettings: "'wdth' 100" }}>
                  Select the deliveries and set their dose
                </p>
              </div>
              <button onClick={resetEditor} aria-label="Close" className="size-[56px] rounded-full flex items-center justify-center text-[#5f8aa0] cursor-pointer shrink-0">
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" /></svg>
              </button>
            </div>

            {/* Body — stacked: diagram · delivery list · count+sum · dose */}
            <div className="flex-1 min-h-0 overflow-y-auto px-[80px] pt-[8px] pb-[24px] flex flex-col gap-[24px]">
              {/* 1. Diagram — always on top, highlights the selected deliveries */}
              <WizardChart highlights={selStartMin != null && selEndMin != null ? [{ startMin: selStartMin, endMin: selEndMin, label: rangeLabel }] : []} />

              {/* 2. Delivery list — check the deliveries to include */}
              <div className="flex flex-col gap-[12px]">
                <p className="font-['Roboto',sans-serif] font-normal text-[#8a97a1] text-[28px] tracking-[1px] uppercase" style={{ fontVariationSettings: "'wdth' 100" }}>
                  Delivery times{selCount > 0 ? ` · ${selCount} selected` : ''}
                </p>
                <div className="border-2 border-[#cfdbe3] rounded-[12px] max-h-[420px] overflow-y-auto">
                  {Array.from({ length: slotCount }, (_, i) => {
                    const selected = minSlot != null && maxSlot != null && i >= minSlot && i <= maxSlot;
                    return (
                      <div
                        key={i}
                        onClick={() => clickSlot(i)}
                        className={`flex items-center gap-[18px] px-[24px] h-[64px] cursor-pointer border-b border-[#eef3f6] last:border-b-0 ${selected ? 'bg-[#e6f4f9]' : ''}`}
                      >
                        <span className={`size-[34px] rounded-[8px] border-2 flex items-center justify-center shrink-0 ${selected ? 'bg-[#0094c5] border-[#0094c5]' : 'bg-white border-[#cdd5da]'}`}>
                          {selected && <svg width="20" height="20" viewBox="0 0 22 22" fill="none"><path d="M4 11.5L9 16L18 6" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                        </span>
                        <span className={`font-['Roboto',sans-serif] text-[26px] ${selected ? 'font-bold text-[#00769e]' : 'text-[#45483c]'}`} style={{ fontVariationSettings: "'wdth' 100" }}>{fmtTime(slotEdges[i])}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 3. Number + sum of the selected deliveries */}
              {selCount > 0 && (
                <div className="flex items-center justify-between gap-[16px] bg-[#e6f4f9] rounded-[12px] px-[32px] h-[84px]">
                  <span className="font-['Roboto',sans-serif] font-normal text-[#5f8aa0] text-[28px] tracking-[1px] uppercase" style={{ fontVariationSettings: "'wdth' 100" }}>Total {rangeLabel} · {selCount} {selCount === 1 ? 'delivery' : 'deliveries'}</span>
                  <span className="font-['Roboto',sans-serif] font-bold text-[#00769e] text-[32px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>{medications.map((m, i) => windowTotal(m, i)).join(' / ')}</span>
                </div>
              )}

              {/* 4. Dose input — disabled until deliveries are checked */}
              <div className={`flex flex-col gap-[16px] transition-opacity ${selCount === 0 ? 'opacity-40 pointer-events-none' : ''}`}>
                <p className="font-['Roboto',sans-serif] font-normal text-[#8a97a1] text-[28px] tracking-[1px] uppercase" style={{ fontVariationSettings: "'wdth' 100" }}>Set all selected to</p>
                {medications.map((m, i) => {
                  const editing = i === refIndex;
                  const mUnit = doseUnitFor(m.unit).unit;
                  const pd = perDelivery(primaryDose, m, i);
                  return (
                    <div key={m.id} className="grid items-center gap-[20px] [grid-template-columns:220px_1fr_56px]">
                      <span className="font-['Roboto',sans-serif] font-bold text-[#00769e] text-[28px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>{m.name || 'Medication'}</span>
                      {editing ? (
                        <div className="flex items-center gap-[12px]">
                          <button
                            onClick={() => stepStrokes(-1)} disabled={strokeK <= 0} aria-label="Decrease dose by one 10 µl stroke"
                            className={`size-[72px] shrink-0 rounded-full text-white text-[44px] leading-none flex items-center justify-center ${strokeK <= 0 ? 'bg-[#cbcbcb] cursor-not-allowed' : 'bg-[#0094c5] cursor-pointer'}`}
                          >−</button>
                          <div className="flex-1 min-w-0 bg-white border-2 border-[#6b7785] rounded-[8px] h-[72px] flex items-center justify-center gap-[8px]">
                            <span className="font-['Roboto',sans-serif] font-bold text-[#45483c] text-[36px]" style={{ fontVariationSettings: "'wdth' 100" }}>{pd.value}</span>
                            <span className="font-['Roboto',sans-serif] text-[#a5a5a5] text-[26px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>{mUnit}/del</span>
                          </div>
                          <button
                            onClick={() => stepStrokes(1)} disabled={strokeK >= MAX_K} aria-label="Increase dose by one 10 µl stroke"
                            className={`size-[72px] shrink-0 rounded-full text-white text-[40px] leading-none flex items-center justify-center ${strokeK >= MAX_K ? 'bg-[#cbcbcb] cursor-not-allowed' : 'bg-[#0094c5] cursor-pointer'}`}
                          >+</button>
                        </div>
                      ) : (
                        <div className="bg-[#e6f4f9] rounded-[8px] h-[72px] flex items-center px-[20px]">
                          <p className="font-['Roboto',sans-serif] text-[#00769e] text-[32px]" style={{ fontVariationSettings: "'wdth' 100" }}>
                            <span className="font-bold">{pd.value}</span> <span className="font-normal text-[#5f8aa0]">{pd.unit}</span>
                          </p>
                        </div>
                      )}
                      {editing
                        ? (selDelta ? <span className="font-['Roboto',sans-serif] font-bold text-[#b3850e] text-[24px] whitespace-nowrap justify-self-end" style={{ fontVariationSettings: "'wdth' 100" }}>{selDelta.text}</span> : <span />)
                        : <img alt="Use as reference" src={imgEditPencil} onClick={() => switchRef(i)} className="size-[32px] opacity-70 cursor-pointer justify-self-end" />}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Footer actions */}
            <div className="px-[80px] py-[32px] border-t border-[#e6eef3] shrink-0 flex gap-[20px]">
              {editingId && (
                <button onClick={() => { removeWindow(editingId); resetEditor(); }} className="flex-1 h-[84px] rounded-[80px] border-2 border-[#c0392b] font-['Roboto',sans-serif] font-bold text-[#c0392b] text-[28px] cursor-pointer" style={{ fontVariationSettings: "'wdth' 100" }}>Delete</button>
              )}
              <button onClick={resetEditor} className="flex-1 h-[84px] rounded-[80px] border-2 border-[#0094c5] font-['Roboto',sans-serif] font-bold text-[#0094c5] text-[28px] cursor-pointer" style={{ fontVariationSettings: "'wdth' 100" }}>Cancel</button>
              <button onClick={commit} disabled={selCount === 0} className={`flex-[2] h-[84px] rounded-[80px] font-['Roboto',sans-serif] font-bold text-[28px] ${selCount === 0 ? 'bg-[#cbcbcb] text-[#a5a5a5]' : 'bg-[#0094c5] text-white cursor-pointer'}`} style={{ fontVariationSettings: "'wdth' 100" }}>{editingId ? 'Save delivery' : 'Add delivery'}</button>
            </div>
          </div>
        </div>
      )}
    >
      <div className="flex flex-col gap-[32px]">
        {/* Title */}
        <div className="flex gap-[16px] items-center">
          <WindowsIcon />
          <p className="font-['Roboto',sans-serif] font-bold leading-[40px] text-[#00769e] text-[36px] tracking-[0.1px]" style={{ fontVariationSettings: "'wdth' 100" }}>
            Customised Delivery
          </p>
        </div>

        {/* Existing windows list */}
        {windows.length > 0 && (
          <div className="flex flex-col gap-[16px]">
            <p className="font-['Roboto',sans-serif] font-normal text-[#8a97a1] text-[22px] tracking-[1px] uppercase" style={{ fontVariationSettings: "'wdth' 100" }}>
              Customised deliveries ({windows.length})
            </p>
            {[...windows].sort((a, b) => a.startMin - b.startMin).map(w => {
              const delta = deltaPct(w.dose, baseDose);
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
                  <span className="font-['Roboto',sans-serif] font-bold text-[#b3850e] text-[32px] tracking-[0.1px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>{delta ? delta.text : ''}</span>
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
