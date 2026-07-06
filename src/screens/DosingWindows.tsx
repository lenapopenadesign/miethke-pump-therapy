import { useMemo, useState } from 'react';
import { useNavigate } from '../navigation';
import { useTherapy, fmtTime, doseUnitFor, concUgPerUl, coDoseUgDay, doseStringsFor, type Medication } from '../therapy';
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

function Chevron({ up }: { up?: boolean }) {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" style={{ transform: up ? 'rotate(180deg)' : undefined }}>
      <path d="M6 9l6 6 6-6" stroke="#00769e" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
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

  // Add / edit editor state. `editingId` is the window being edited (null = new).
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [range, setRange] = useState<{ a: number; b: number } | null>(null); // slot indices
  const [doseText, setDoseText] = useState('');
  const [refIndex, setRefIndex] = useState(0); // which medication the entered dose refers to

  const minSlot = range ? Math.min(range.a, range.b) : null;
  const maxSlot = range ? Math.max(range.a, range.b) : null;
  const selStartMin = minSlot != null ? slotEdges[minSlot] : null;
  const selEndMin = maxSlot != null ? slotEdges[maxSlot + 1] : null;
  const selCount = minSlot != null && maxSlot != null ? maxSlot - minSlot + 1 : 0;

  // Windows are expressed per delivery: one delivery is 1/bolusCount of the day.
  const bolusN = Math.max(1, bolusCount);
  const refMed = medications[refIndex] ?? medications[0];
  const refU = doseUnitFor(refMed?.unit ?? 'µg/ml');
  const refConc = refMed ? concUgPerUl(refMed) : 1;

  // Per-delivery dose of medication i, given the primary's daily µg, in its unit.
  const perDelivery = (primaryDailyUg: number, m: Medication, i: number) => {
    const ug = i === 0 ? primaryDailyUg : coDoseUgDay(primaryDailyUg, c0, concUgPerUl(m));
    const d = doseStringsFor(ug / bolusN, m.unit);
    return { value: d.perDay, unit: `${d.unit}/del` };
  };

  const highlights: Highlight[] = useMemo(() => {
    const list: Highlight[] = windows.map(w => ({ startMin: w.startMin, endMin: w.endMin }));
    if (open && selStartMin != null && selEndMin != null) list.push({ startMin: selStartMin, endMin: selEndMin });
    return list;
  }, [windows, open, selStartMin, selEndMin]);

  const resetEditor = () => { setOpen(false); setEditingId(null); setDropdownOpen(false); setRange(null); setDoseText(''); setRefIndex(0); };

  const openNew = () => { setEditingId(null); setRange(null); setDoseText(''); setRefIndex(0); setDropdownOpen(false); setOpen(true); };
  const openEdit = (id: string) => {
    const w = windows.find(x => x.id === id);
    if (!w) return;
    setEditingId(id);
    setRange({ a: minToSlot(w.startMin), b: minToSlot(w.endMin - 1) });
    setRefIndex(0);
    // Input shows the per-delivery dose the primary medication carries in this window.
    setDoseText(doseStringsFor(w.dose / bolusN, medications[0]?.unit ?? 'µg/ml').perDay);
    setDropdownOpen(false);
    setOpen(true);
  };

  // Clicking a slot: first click sets the anchor; the next extends the range from
  // the anchor so the selection is always contiguous.
  const clickSlot = (i: number) => {
    setRange(prev => (!prev ? { a: i, b: i } : { a: prev.a, b: i }));
  };

  // The entered per-delivery value (in the reference med's unit) back-solved to the
  // primary medication's daily µg — the canonical value a window stores.
  const primaryDose = (() => {
    if (!doseText) return baseDose;
    const refDailyUg = parseFloat(doseText) * refU.div * bolusN; // reference med µg/day
    if (isNaN(refDailyUg)) return baseDose;
    return refIndex === 0 ? refDailyUg : (refConc > 0 ? (refDailyUg * c0) / refConc : 0);
  })();
  const selDelta = deltaPct(primaryDose, baseDose);

  // Pen tap: switch which medication the input refers to, re-expressing the same
  // physical dose in the newly-selected med's per-delivery unit.
  const switchRef = (j: number) => {
    if (doseText) {
      const ugJ = j === 0 ? primaryDose : coDoseUgDay(primaryDose, c0, concUgPerUl(medications[j]));
      setDoseText(doseStringsFor(ugJ / bolusN, medications[j].unit).perDay);
    }
    setRefIndex(j);
  };

  const commit = () => {
    if (selStartMin == null || selEndMin == null) return;
    const dose = doseText ? Math.round(primaryDose) : baseDose;
    if (editingId) updateWindow(editingId, { startMin: selStartMin, endMin: selEndMin, dose });
    else addWindow({ label: 'Window', startMin: selStartMin, endMin: selEndMin, dose });
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
    >
      <div className="flex flex-col gap-[32px]">
        {/* Title */}
        <div className="flex gap-[16px] items-center">
          <WindowsIcon />
          <p className="font-['Roboto',sans-serif] font-bold leading-[40px] text-[#00769e] text-[36px] tracking-[0.1px]" style={{ fontVariationSettings: "'wdth' 100" }}>
            Dosing Windows
          </p>
        </div>

        {/* Existing windows list */}
        {windows.length > 0 && (
          <div className="flex flex-col gap-[16px]">
            <p className="font-['Roboto',sans-serif] font-normal text-[#8a97a1] text-[22px] tracking-[1px] uppercase" style={{ fontVariationSettings: "'wdth' 100" }}>
              Windows ({windows.length})
            </p>
            {[...windows].sort((a, b) => a.startMin - b.startMin).map(w => {
              const delta = deltaPct(w.dose, baseDose);
              const pd = perDelivery(w.dose, medications[0], 0);
              return (
                <div key={w.id} className="bg-white border border-[#cfdbe3] rounded-[16px] h-[96px] flex items-center pl-[32px] pr-[12px] gap-[16px]">
                  <p onClick={() => openEdit(w.id)} className="flex-1 font-['Roboto',sans-serif] font-bold text-[#00769e] text-[32px] tracking-[0.1px] cursor-pointer" style={{ fontVariationSettings: "'wdth' 100" }}>
                    {fmtTime(w.startMin)} – {w.endMin >= 1440 ? '24:00' : fmtTime(w.endMin)}
                  </p>
                  {delta && (
                    <p className="font-['Roboto',sans-serif] font-bold text-[#b3850e] text-[28px] tracking-[0.1px]" style={{ fontVariationSettings: "'wdth' 100" }}>{delta.text}</p>
                  )}
                  <p className="font-['Roboto',sans-serif] font-bold text-[#00769e] text-[28px] tracking-[0.1px] min-w-[180px] text-right whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
                    {pd.value} {pd.unit}
                  </p>
                  <Kebab onClick={() => openEdit(w.id)} />
                </div>
              );
            })}
          </div>
        )}

        {/* Add / edit editor */}
        {open && (
          <div className="flex flex-col gap-[24px]">
            {/* Preset-time dropdown — left edge aligned with the dose input column below */}
            <div className="flex flex-col gap-[12px] pl-[236px] pr-[72px]">
              <p className="font-['Roboto',sans-serif] font-bold text-[#00769e] text-[24px] tracking-[0.1px]" style={{ fontVariationSettings: "'wdth' 100" }}>Add delivery times</p>
              <button
                onClick={() => setDropdownOpen(v => !v)}
                className="bg-white border-2 border-[#cfdbe3] rounded-[8px] h-[72px] flex items-center justify-between px-[24px] cursor-pointer w-full"
              >
                <span className="font-['Roboto',sans-serif] text-[#667380] text-[28px]" style={{ fontVariationSettings: "'wdth' 100" }}>
                  {selStartMin != null && selEndMin != null ? `${fmtTime(selStartMin)} – ${selEndMin >= 1440 ? '24:00' : fmtTime(selEndMin)}` : 'Select a preset time…'}
                </span>
                <Chevron up={dropdownOpen} />
              </button>

              {dropdownOpen && (
                <div className="border-2 border-[#cfdbe3] rounded-[8px] max-h-[420px] overflow-y-auto">
                  {Array.from({ length: slotCount }, (_, i) => {
                    const selected = minSlot != null && maxSlot != null && i >= minSlot && i <= maxSlot;
                    return (
                      <div
                        key={i}
                        onClick={() => clickSlot(i)}
                        className={`flex items-center justify-between px-[24px] h-[72px] cursor-pointer ${selected ? 'bg-[#e6f4f9]' : ''}`}
                      >
                        <span className={`font-['Roboto',sans-serif] text-[28px] ${selected ? 'font-bold text-[#00769e]' : 'text-[#45483c]'}`} style={{ fontVariationSettings: "'wdth' 100" }}>{fmtTime(slotEdges[i])}</span>
                        {selected ? (
                          <span className="size-[36px] rounded-full bg-[#0094c5] flex items-center justify-center">
                            <svg width="20" height="20" viewBox="0 0 22 22" fill="none"><path d="M4 11.5L9 16L18 6" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" /></svg>
                          </span>
                        ) : (
                          <span className="size-[36px] rounded-full border-2 border-[#cdd5da]" />
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Deliveries in selection — compact; scrolls when more than ~3 are selected */}
            {selCount > 0 && !dropdownOpen && (() => {
              const pd = perDelivery(primaryDose, medications[0], 0);
              return (
                <div className="flex flex-col gap-[10px] pl-[236px] pr-[72px]">
                  <p className="font-['Roboto',sans-serif] font-normal text-[#8a97a1] text-[22px] tracking-[1px] uppercase" style={{ fontVariationSettings: "'wdth' 100" }}>Deliveries in selection ({selCount})</p>
                  <div className="flex flex-col gap-[8px] max-h-[210px] overflow-y-auto pr-[6px]">
                    {Array.from({ length: selCount }, (_, k) => {
                      const slot = (minSlot as number) + k;
                      const isStart = k === 0, isEnd = k === selCount - 1;
                      return (
                        <div key={slot} className="bg-white border border-[#cfdbe3] rounded-[10px] h-[56px] flex items-center px-[20px] gap-[12px] shrink-0">
                          <span className="w-[5px] h-[28px] rounded-full bg-[#0094c5]" />
                          <span className="font-['Roboto',sans-serif] font-bold text-[#00769e] text-[24px]" style={{ fontVariationSettings: "'wdth' 100" }}>{fmtTime(slotEdges[slot])}</span>
                          {(isStart || isEnd) && (
                            <span className="px-[12px] py-[1px] rounded-full bg-[#00769e] text-white font-['Roboto',sans-serif] text-[16px] tracking-[1px]" style={{ fontVariationSettings: "'wdth' 100" }}>{isStart ? 'START' : 'END'}</span>
                          )}
                          <span className="flex-1" />
                          <span className="font-['Roboto',sans-serif] font-bold text-[#00769e] text-[22px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>{pd.value} {pd.unit}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })()}

            {/* Set all selected to */}
            <div className="grid items-center gap-x-[16px] gap-y-[16px] [grid-template-columns:220px_1fr_56px]">
              <span />
              <p className="font-['Roboto',sans-serif] font-bold text-[#00769e] text-[24px] tracking-[0.1px]" style={{ fontVariationSettings: "'wdth' 100" }}>Set all selected to</p>
              <span />

              {medications.map((m, i) => {
                const editing = i === refIndex;
                const mUnit = doseUnitFor(m.unit).unit;
                const pd = perDelivery(primaryDose, m, i);
                const placeholder = perDelivery(baseDose, m, i).value;
                return (
                  <div key={m.id} className="contents">
                    <p className="font-['Roboto',sans-serif] font-bold text-[#00769e] text-[28px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>{m.name || 'Medication'}</p>
                    {editing ? (
                      <div className="bg-white border-2 border-[#6b7785] rounded-[8px] h-[72px] flex items-center pl-[20px] pr-[16px] gap-[8px] focus-within:border-[#0094c5]">
                        <input
                          type="text" inputMode="decimal" pattern="[0-9]*\.?[0-9]*"
                          value={doseText}
                          onChange={e => setDoseText(e.target.value.replace(/[^0-9.]/g, ''))}
                          placeholder={placeholder}
                          className="flex-1 min-w-px font-bold text-[#45483c] text-[36px] bg-transparent outline-none border-0 p-0 placeholder:font-normal placeholder:text-[#9ea8b2] placeholder:text-[28px]"
                          style={{ fontFamily: 'Roboto, sans-serif', fontVariationSettings: "'wdth' 100" }}
                        />
                        <span className="font-['Roboto',sans-serif] text-[#a5a5a5] text-[28px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>{mUnit}/del</span>
                      </div>
                    ) : (
                      <div className="bg-[#e6f4f9] rounded-[8px] h-[72px] flex items-center px-[20px]">
                        <p className="font-['Roboto',sans-serif] text-[#00769e] text-[28px]" style={{ fontVariationSettings: "'wdth' 100" }}>
                          <span className="font-bold">{pd.value}</span> <span className="font-normal text-[#5f8aa0]">{pd.unit}</span>
                        </p>
                      </div>
                    )}
                    {editing ? (
                      selDelta ? <p className="font-['Roboto',sans-serif] font-bold text-[#b3850e] text-[24px] whitespace-nowrap self-center" style={{ fontVariationSettings: "'wdth' 100" }}>{selDelta.text}</p> : <span />
                    ) : (
                      <img alt="Use as reference" src={imgEditPencil} onClick={() => switchRef(i)} className="size-[36px] justify-self-end opacity-70 cursor-pointer" />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Editor actions — aligned under (and as wide as) the "Set all selected to" input */}
            <div className="flex flex-col gap-[16px] pl-[236px] pr-[72px]">
              <div className="flex gap-[16px]">
                <button onClick={resetEditor} className="flex-1 h-[80px] rounded-[80px] border-2 border-[#0094c5] font-['Roboto',sans-serif] font-bold text-[#0094c5] text-[26px] cursor-pointer" style={{ fontVariationSettings: "'wdth' 100" }}>Cancel</button>
                <button onClick={commit} disabled={selCount === 0} className={`flex-1 h-[80px] rounded-[80px] font-['Roboto',sans-serif] font-bold text-[26px] ${selCount === 0 ? 'bg-[#cbcbcb] text-[#a5a5a5]' : 'bg-[#0094c5] text-white cursor-pointer'}`} style={{ fontVariationSettings: "'wdth' 100" }}>{editingId ? 'Save window' : 'Add window'}</button>
              </div>
              {editingId && (
                <button onClick={() => { removeWindow(editingId); resetEditor(); }} className="self-center font-['Roboto',sans-serif] font-bold text-[#c0392b] text-[24px] tracking-[0.1px] cursor-pointer" style={{ fontVariationSettings: "'wdth' 100" }}>Remove window</button>
              )}
            </div>
          </div>
        )}

        {/* Add window trigger */}
        {!open && (
          <button
            onClick={openNew}
            className="self-start flex gap-[16px] h-[88px] items-center justify-center px-[40px] rounded-[80px] border-2 border-[#0094c5] cursor-pointer"
          >
            <span className="text-[#0094c5] text-[40px] leading-none">+</span>
            <span className="font-['Roboto',sans-serif] font-bold text-[#0094c5] text-[28px] tracking-[0.1px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>Add window</span>
          </button>
        )}
      </div>
    </WizardShell>
  );
}
