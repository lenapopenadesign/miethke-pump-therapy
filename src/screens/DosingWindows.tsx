import { useState } from 'react';
import { useNavigate } from '../navigation';
import { useTherapy, fmtDose, doseColor, doseUnitFor } from '../therapy';
import { WizardShell } from '../components/WizardShell';
import { TherapyHeaderChart } from '../components/TherapyHeaderChart';
import { TimeField } from '../components/TimeField';

function WindowsIcon() {
  return (
    <svg width="44" height="44" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="11" width="4" height="9" rx="1" fill="#0094c5" />
      <rect x="10" y="5" width="4" height="15" rx="1" fill="#0094c5" />
      <rect x="17" y="8" width="4" height="12" rx="1" fill="#0094c5" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
      <path d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2M19 6l-1 14a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1L5 6M10 11v6M14 11v6"
        stroke="#0094c5" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const COLS = 'grid items-start gap-[24px] [grid-template-columns:330px_230px_1fr_56px]';
const fieldLabel = "font-['Roboto',sans-serif] font-bold text-[#00769e] text-[24px] tracking-[0.1px]";

export function DosingWindows() {
  const navigate = useNavigate();
  const { baseDose, intervals, addWindow, updateWindow, removeWindow, medications } = useTherapy();
  const windows = intervals; // shared schedule (every day identical)
  const [focusedId, setFocusedId] = useState<string | null>(null);
  // Raw text of the dose field being typed into (kept off the committed value).
  const [draft, setDraft] = useState<{ id: string; text: string } | null>(null);

  // Window doses are stored as µg/day; shown + edited in the primary med's unit.
  const doseU = doseUnitFor(medications[0]?.unit ?? 'µg/ml');
  const baseRate = baseDose / 24;
  const onAdd = () => {
    const id = addWindow({ label: 'Window', startMin: 6 * 60, endMin: 8 * 60, dose: baseDose });
    setFocusedId(id);
  };

  // The window outlined on the chart: the one being edited, else the first.
  const highlightId = focusedId ?? windows[0]?.id ?? null;
  const highlightWin = windows.find(w => w.id === highlightId);
  const highlight = highlightWin ? { startMin: highlightWin.startMin, endMin: highlightWin.endMin } : null;

  return (
    <WizardShell step="windows" onBack={() => navigate('frequency')} banner={<TherapyHeaderChart highlight={highlight} />}>
      <div className="flex-1 flex flex-col">
        <div className="flex flex-col gap-[32px]">
          {/* Title */}
          <div className="flex gap-[16px] items-center">
            <WindowsIcon />
            <div className="flex flex-col">
              <p className="font-['Roboto',sans-serif] font-bold leading-[40px] text-[#00769e] text-[36px] tracking-[0.1px]" style={{ fontVariationSettings: "'wdth' 100" }}>
                Dosing Windows
              </p>
              <p className="font-['Roboto',sans-serif] font-normal text-[#667380] text-[26px] tracking-[0.1px]" style={{ fontVariationSettings: "'wdth' 100" }}>
                Select a time window, raise or lower its dose.
              </p>
            </div>
          </div>

          {windows.length > 0 && (
            <div className="flex flex-col gap-[28px]">
              {/* Column headers */}
              <div className={COLS}>
                <p className={fieldLabel}>Time window</p>
                <p className={fieldLabel}>Dose in this window</p>
                <p className={fieldLabel}>Rate in this window</p>
                <span />
              </div>

              {windows.map(w => {
                const rateUgH = w.dose / 24;
                const text = draft && draft.id === w.id ? draft.text : (w.dose > 0 ? fmtDose(rateUgH / doseU.div) : '');
                return (
                  <div key={w.id} className={COLS}>
                    {/* Time window */}
                    <div className="flex items-center gap-[12px]">
                      <TimeField value={w.startMin} onChange={min => { setFocusedId(w.id); updateWindow(w.id, { startMin: min }); }} />
                      <span className="font-['Roboto',sans-serif] font-bold text-[#667380] text-[28px]">–</span>
                      <TimeField value={w.endMin} onChange={min => { setFocusedId(w.id); updateWindow(w.id, { endMin: min }); }} />
                    </div>

                    {/* Dose in this window (editable µg/h) */}
                    <div className="bg-white border-2 border-[#6b7785] rounded-[12px] h-[72px] flex items-center px-[18px] gap-[8px] focus-within:border-[#0094c5]">
                      <input
                        type="text" inputMode="decimal" pattern="[0-9]*\.?[0-9]*"
                        value={text}
                        onFocus={e => { setFocusedId(w.id); e.currentTarget.select(); }}
                        onChange={e => {
                          const raw = e.target.value.replace(/[^0-9.]/g, '');
                          setDraft({ id: w.id, text: raw });
                          const v = parseFloat(raw);
                          updateWindow(w.id, { dose: Math.max(0, Math.round((isNaN(v) ? 0 : v) * doseU.div * 24)) });
                        }}
                        onBlur={() => setDraft(null)}
                        className="flex-1 min-w-px font-['Roboto',sans-serif] font-bold text-[#45483c] text-[32px] tracking-[0.1px] bg-transparent outline-none border-0 p-0"
                        style={{ fontVariationSettings: "'wdth' 100" }}
                      />
                      <span className="font-['Roboto',sans-serif] font-normal text-[#a5a5a5] text-[24px]" style={{ fontVariationSettings: "'wdth' 100" }}>{doseU.unit}/h</span>
                    </div>

                    {/* Rate in this window (read-out, coloured vs base) */}
                    <div className="h-[72px] flex items-center gap-[12px]">
                      <span className="font-['Roboto',sans-serif] font-bold text-[36px] tracking-[0.1px]" style={{ color: doseColor(w.dose || baseDose, baseDose || 1), fontVariationSettings: "'wdth' 100" }}>
                        {fmtDose(rateUgH / doseU.div)}
                      </span>
                      <span className="font-['Roboto',sans-serif] font-normal text-[#667380] text-[24px]">{doseU.unit}/h</span>
                      {baseRate > 0 && (
                        <span className="font-['Roboto',sans-serif] font-bold text-[#0094c5] text-[24px] tracking-[0.1px]" style={{ fontVariationSettings: "'wdth' 100" }}>
                          {rateUgH >= baseRate ? '+' : '−'}{Math.abs(Math.round(((rateUgH - baseRate) / baseRate) * 100))}%
                        </span>
                      )}
                    </div>

                    {/* Remove window */}
                    <button onClick={() => { removeWindow(w.id); if (focusedId === w.id) setFocusedId(null); }} className="size-[56px] flex items-center justify-center cursor-pointer" aria-label="Remove window">
                      <TrashIcon />
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* Add window */}
          <button
            onClick={onAdd}
            className="self-start flex gap-[16px] h-[88px] items-center justify-center px-[40px] rounded-[80px] border-2 border-[#0094c5] cursor-pointer"
          >
            <span className="text-[#0094c5] text-[40px] leading-none">+</span>
            <span className="font-['Roboto',sans-serif] font-bold text-[#0094c5] text-[28px] tracking-[0.1px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
              Add window
            </span>
          </button>
        </div>

        {/* Save CTA — windows are optional, so this is always enabled */}
        <div
          onClick={() => navigate('review')}
          className="mt-auto flex h-[88px] items-center justify-center px-[40px] rounded-[80px] w-full bg-[#0094c5] cursor-pointer"
        >
          <p className="font-['Roboto',sans-serif] font-bold leading-[32px] text-white text-[24px] tracking-[0.1px]" style={{ fontVariationSettings: "'wdth' 100" }}>
            Save
          </p>
        </div>
      </div>
    </WizardShell>
  );
}
