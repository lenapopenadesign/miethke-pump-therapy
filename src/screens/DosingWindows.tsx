import { useMemo, useState } from 'react';
import { useNavigate } from '../navigation';
import { useTherapy, fmtDose, fmtTime, doseUnitFor, concUgPerUl, coDoseUgDay, doseStringsFor, type Medication } from '../therapy';
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
  const doseU = doseUnitFor(medications[0]?.unit ?? 'µg/ml');
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

  const minSlot = range ? Math.min(range.a, range.b) : null;
  const maxSlot = range ? Math.max(range.a, range.b) : null;
  const selStartMin = minSlot != null ? slotEdges[minSlot] : null;
  const selEndMin = maxSlot != null ? slotEdges[maxSlot + 1] : null;
  const selCount = minSlot != null && maxSlot != null ? maxSlot - minSlot + 1 : 0;

  // Per-window total dose (µg over its duration) in the primary med's unit.
  const windowTotal = (dose: number, startMin: number, endMin: number) => {
    const dur = Math.max(0, endMin - startMin);
    return fmtDose((dose * dur / 1440) / doseU.div);
  };

  const highlights: Highlight[] = useMemo(() => {
    const list: Highlight[] = windows.map(w => ({ startMin: w.startMin, endMin: w.endMin }));
    if (open && selStartMin != null && selEndMin != null) list.push({ startMin: selStartMin, endMin: selEndMin });
    return list;
  }, [windows, open, selStartMin, selEndMin]);

  const resetEditor = () => { setOpen(false); setEditingId(null); setDropdownOpen(false); setRange(null); setDoseText(''); };

  const openNew = () => { setEditingId(null); setRange(null); setDoseText(''); setDropdownOpen(false); setOpen(true); };
  const openEdit = (id: string) => {
    const w = windows.find(x => x.id === id);
    if (!w) return;
    setEditingId(id);
    setRange({ a: minToSlot(w.startMin), b: minToSlot(w.endMin - 1) });
    setDoseText(String(Math.round(w.dose / doseU.div)));
    setDropdownOpen(false);
    setOpen(true);
  };

  // Clicking a slot: first click sets the anchor; the next extends the range from
  // the anchor so the selection is always contiguous.
  const clickSlot = (i: number) => {
    setRange(prev => (!prev ? { a: i, b: i } : { a: prev.a, b: i }));
  };

  const commit = () => {
    if (selStartMin == null || selEndMin == null) return;
    const dose = doseText ? Math.round(parseFloat(doseText) * doseU.div) : baseDose;
    if (editingId) updateWindow(editingId, { startMin: selStartMin, endMin: selEndMin, dose });
    else addWindow({ label: 'Window', startMin: selStartMin, endMin: selEndMin, dose });
    resetEditor();
  };

  // "Set all selected to" — dose applied to the primary; co-meds shown subtle.
  const primaryDose = doseText ? parseFloat(doseText) * doseU.div : baseDose;
  const coRow = (m: Medication, i: number) => {
    const ug = i === 0 ? primaryDose : coDoseUgDay(primaryDose, c0, concUgPerUl(m));
    const d = doseStringsFor(ug, m.unit);
    return { name: m.name || 'Medication', value: d.perDay, unit: `${d.unit}/d` };
  };
  const selDelta = deltaPct(primaryDose, baseDose);

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
              return (
                <div key={w.id} className="bg-white border border-[#cfdbe3] rounded-[16px] h-[96px] flex items-center pl-[32px] pr-[12px] gap-[16px]">
                  <p onClick={() => openEdit(w.id)} className="flex-1 font-['Roboto',sans-serif] font-bold text-[#00769e] text-[32px] tracking-[0.1px] cursor-pointer" style={{ fontVariationSettings: "'wdth' 100" }}>
                    {fmtTime(w.startMin)} – {w.endMin >= 1440 ? '24:00' : fmtTime(w.endMin)}
                  </p>
                  {delta && (
                    <p className="font-['Roboto',sans-serif] font-bold text-[#b3850e] text-[28px] tracking-[0.1px]" style={{ fontVariationSettings: "'wdth' 100" }}>{delta.text}</p>
                  )}
                  <p className="font-['Roboto',sans-serif] font-bold text-[#00769e] text-[28px] tracking-[0.1px] min-w-[150px] text-right" style={{ fontVariationSettings: "'wdth' 100" }}>
                    {windowTotal(w.dose, w.startMin, w.endMin)} {doseU.unit}
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

            {/* Deliveries in selection */}
            {selCount > 0 && !dropdownOpen && (
              <div className="flex flex-col gap-[12px] pl-[236px] pr-[72px]">
                <p className="font-['Roboto',sans-serif] font-normal text-[#8a97a1] text-[22px] tracking-[1px] uppercase" style={{ fontVariationSettings: "'wdth' 100" }}>Deliveries in selection</p>
                {Array.from({ length: selCount }, (_, k) => {
                  const slot = (minSlot as number) + k;
                  const isStart = k === 0, isEnd = k === selCount - 1;
                  return (
                    <div key={slot} className="bg-white border border-[#cfdbe3] rounded-[12px] h-[80px] flex items-center px-[24px] gap-[16px]">
                      <span className="w-[6px] h-[40px] rounded-full bg-[#0094c5]" />
                      <span className="font-['Roboto',sans-serif] font-bold text-[#00769e] text-[28px]" style={{ fontVariationSettings: "'wdth' 100" }}>{fmtTime(slotEdges[slot])}</span>
                      {(isStart || isEnd) && (
                        <span className="px-[14px] py-[2px] rounded-full bg-[#00769e] text-white font-['Roboto',sans-serif] text-[18px] tracking-[1px]" style={{ fontVariationSettings: "'wdth' 100" }}>{isStart ? 'START' : 'END'}</span>
                      )}
                      <span className="flex-1" />
                      <span className="font-['Roboto',sans-serif] font-bold text-[#00769e] text-[26px]" style={{ fontVariationSettings: "'wdth' 100" }}>{windowTotal(primaryDose, 0, 1440 / selCount)} {doseU.unit}</span>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Set all selected to */}
            <div className="grid items-center gap-x-[16px] gap-y-[16px] [grid-template-columns:220px_1fr_56px]">
              <span />
              <p className="font-['Roboto',sans-serif] font-bold text-[#00769e] text-[24px] tracking-[0.1px]" style={{ fontVariationSettings: "'wdth' 100" }}>Set all selected to</p>
              <span />

              {medications.map((m, i) => {
                const r = coRow(m, i);
                return (
                  <div key={m.id} className="contents">
                    <p className="font-['Roboto',sans-serif] font-bold text-[#00769e] text-[28px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>{r.name}</p>
                    {i === 0 ? (
                      <div className="bg-white border-2 border-[#6b7785] rounded-[8px] h-[72px] flex items-center pl-[20px] pr-[16px] gap-[8px] focus-within:border-[#0094c5]">
                        <input
                          type="text" inputMode="decimal" pattern="[0-9]*\.?[0-9]*"
                          value={doseText}
                          onChange={e => setDoseText(e.target.value.replace(/[^0-9.]/g, ''))}
                          placeholder={String(Math.round(baseDose / doseU.div))}
                          className="flex-1 min-w-px font-bold text-[#45483c] text-[36px] bg-transparent outline-none border-0 p-0 placeholder:font-normal placeholder:text-[#9ea8b2] placeholder:text-[28px]"
                          style={{ fontFamily: 'Roboto, sans-serif', fontVariationSettings: "'wdth' 100" }}
                        />
                        <span className="font-['Roboto',sans-serif] text-[#a5a5a5] text-[28px]" style={{ fontVariationSettings: "'wdth' 100" }}>{doseU.unit}/d</span>
                      </div>
                    ) : (
                      <div className="bg-[#e6f4f9] rounded-[8px] h-[72px] flex items-center px-[20px]">
                        <p className="font-['Roboto',sans-serif] text-[#00769e] text-[28px]" style={{ fontVariationSettings: "'wdth' 100" }}>
                          <span className="font-bold">{r.value}</span> <span className="font-normal text-[#5f8aa0]">{r.unit}</span>
                        </p>
                      </div>
                    )}
                    {i === 0 && selDelta ? (
                      <p className="font-['Roboto',sans-serif] font-bold text-[#b3850e] text-[24px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>{selDelta.text}</p>
                    ) : i === 0 ? <span /> : (
                      <img alt="" src={imgEditPencil} className="size-[36px] justify-self-end opacity-60" />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Editor actions */}
            <div className="flex flex-col gap-[16px]">
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
