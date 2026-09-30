import { useState } from 'react';
import { useNavigate } from '../navigation';
import { useTherapy } from '../therapy';
import { WizardShell } from '../components/WizardShell';
import { MedicationIcon } from '../components/MedicationIcon';
import { fieldLabelCls } from '../components/Field';

const UNITS = ['mg/ml', 'mcg/ml'];

/**
 * Decimal concentration input. Keeps a local text buffer while editing so
 * partial entries like "0", "0." and "0.5" all display as typed (a controlled
 * number input would drop the leading zero). Commits the parsed number on each
 * keystroke; reverts to the formatted value on blur.
 */
function ConcentrationField({ value, onChange, className }: { value: number; onChange: (n: number) => void; className: string }) {
  const [text, setText] = useState<string | null>(null);
  const display = text ?? (value > 0 ? String(value) : '');
  return (
    <input
      type="text"
      inputMode="decimal"
      className={className}
      value={display}
      placeholder="0"
      onFocus={e => e.currentTarget.select()}
      onChange={e => {
        const raw = e.target.value.replace(/[^0-9.]/g, '');
        setText(raw);
        const v = parseFloat(raw);
        onChange(isNaN(v) ? 0 : v);
      }}
      onBlur={() => setText(null)}
    />
  );
}

function TrashIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
      <path d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2M19 6l-1 14a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1L5 6M10 11v6M14 11v6"
        stroke="#0b786a" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// These rows are plain <input>/<select> elements rather than the Field wrapper,
// so they carry the Input_Master chrome (2377:6255) as classes instead.
const fieldLabel = `${fieldLabelCls} pb-[8px]`;
const fieldBox = "h-[72px] bg-white border border-[#9db3ad] rounded-[8px] px-[16px] flex items-center font-['Roboto',sans-serif] font-bold text-[#183d38] text-[36px] tracking-[0.1px] w-full outline-none focus:border-[#096657] placeholder:font-normal placeholder:text-[#9db3ad]";

export function AddMedication() {
  const navigate = useNavigate();
  const { medications, addMedication, updateMedication, removeMedication, cancelTherapyEdit } = useTherapy();
  // Backing out abandons the draft and restores the committed therapy; in a
  // refill that lands back on the "same medication?" gate the edit began from.
  const onBack = () => navigate(cancelTherapyEdit());

  return (
    <WizardShell step="medication" onBack={onBack} onHelp={() => navigate('help')}>
      <div className="flex-1 flex flex-col gap-[24px]">
        {/* Title */}
        <div className="flex gap-[16px] items-center">
          <MedicationIcon size={48} />
          <p className="font-['Roboto',sans-serif] font-extrabold leading-[40px] text-[#096657] text-[36px] tracking-[0.1px]" style={{ fontVariationSettings: "'wdth' 100" }}>
            Medication
          </p>
        </div>

        {/* Rows */}
        <div className="flex flex-col gap-[24px]">
          {medications.map(med => (
            <div key={med.id} className="flex gap-[24px] items-end">
              <div className="flex flex-col flex-1 min-w-px">
                <label className={fieldLabel}>Medication name</label>
                <input
                  className={fieldBox}
                  value={med.name}
                  placeholder="Name"
                  onChange={e => updateMedication(med.id, { name: e.target.value })}
                />
              </div>
              <div className="flex flex-col w-[260px]">
                <label className={fieldLabel}>Concentration</label>
                <ConcentrationField
                  className={fieldBox}
                  value={med.concentration}
                  onChange={n => updateMedication(med.id, { concentration: n })}
                />
              </div>
              <div className="flex flex-col w-[260px]">
                <label className={fieldLabel}>Unit</label>
                <div className="relative">
                  <select
                    className={`${fieldBox} appearance-none cursor-pointer pr-[44px]`}
                    value={med.unit}
                    onChange={e => updateMedication(med.id, { unit: e.target.value })}
                  >
                    {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                  </select>
                  <svg className="absolute right-[16px] top-1/2 -translate-y-1/2 pointer-events-none" width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M6 9l6 6 6-6" stroke="#596d68" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </div>
              <button
                onClick={() => removeMedication(med.id)}
                className="size-[64px] flex items-center justify-center shrink-0 cursor-pointer"
                aria-label="Remove medication"
              >
                <TrashIcon />
              </button>
            </div>
          ))}
        </div>

        {/* Add medication */}
        <button
          onClick={addMedication}
          className="self-start flex gap-[16px] h-[88px] items-center justify-center px-[40px] rounded-[80px] border-2 border-[#0b786a] cursor-pointer"
        >
          <span className="text-[#0b786a] text-[40px] leading-none">+</span>
          <span className="font-['Roboto',sans-serif] font-bold text-[#0b786a] text-[28px] tracking-[0.1px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
            Add medication
          </span>
        </button>

        {/* Save CTA */}
        <div
          onClick={() => navigate('base-dose')}
          className="mt-auto flex gap-[16px] h-[88px] items-center justify-center min-w-[240px] px-[40px] rounded-[80px] w-full bg-[#0b786a] cursor-pointer"
        >
          <p className="font-['Roboto',sans-serif] font-bold leading-[32px] text-white text-[24px] tracking-[0.1px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
            Next
          </p>
        </div>
      </div>
    </WizardShell>
  );
}
