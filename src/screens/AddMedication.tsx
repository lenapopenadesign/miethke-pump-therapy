import { useNavigate } from '../navigation';
import { useTherapy } from '../therapy';
import { WizardShell } from '../components/WizardShell';
import { MedicationIcon } from '../components/MedicationIcon';

const UNITS = ['mg/ml', 'µg/ml'];

function TrashIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
      <path d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2M19 6l-1 14a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1L5 6M10 11v6M14 11v6"
        stroke="#0094c5" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const fieldLabel = "font-['Roboto',sans-serif] font-bold text-[#00769e] text-[20px] tracking-[0.1px] mb-[8px]";
const fieldBox = "h-[76px] bg-white border border-[#c4ccd4] rounded-[8px] px-[20px] flex items-center font-['Roboto',sans-serif] text-[#1a1a1a] text-[32px] tracking-[0.1px] w-full outline-none focus:border-[#0094c5]";

export function AddMedication() {
  const navigate = useNavigate();
  const { medications, addMedication, updateMedication, removeMedication, flowMode } = useTherapy();
  const isRefill = flowMode === 'refill';

  return (
    <WizardShell step="medication" onBack={() => navigate(isRefill ? 'refill-filling' : 'home-no-therapy')}>
      <div className="flex-1 flex flex-col gap-[24px]">
        {/* Title */}
        <div className="flex gap-[16px] items-center">
          <MedicationIcon size={48} />
          <p className="font-['Roboto',sans-serif] font-extrabold leading-[40px] text-[#00769e] text-[36px] tracking-[0.1px]" style={{ fontVariationSettings: "'wdth' 100" }}>
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
                <input
                  type="number"
                  className={fieldBox}
                  value={Number.isFinite(med.concentration) ? med.concentration : ''}
                  onChange={e => updateMedication(med.id, { concentration: parseFloat(e.target.value) || 0 })}
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
                    <path d="M6 9l6 6 6-6" stroke="#5f7388" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
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
          className="self-start flex gap-[12px] h-[64px] items-center justify-center px-[32px] rounded-[40px] border-2 border-[#0094c5] cursor-pointer"
        >
          <span className="text-[#0094c5] text-[32px] leading-none">+</span>
          <span className="font-['Roboto',sans-serif] font-bold text-[#0094c5] text-[24px] tracking-[0.1px]" style={{ fontVariationSettings: "'wdth' 100" }}>
            Add medication
          </span>
        </button>

        {/* Save CTA */}
        <div
          onClick={() => navigate('base-dose')}
          className="mt-auto flex gap-[16px] h-[88px] items-center justify-center min-w-[240px] px-[40px] rounded-[80px] w-full bg-[#0094c5] cursor-pointer"
        >
          <p className="font-['Roboto',sans-serif] font-bold leading-[32px] text-white text-[24px] tracking-[0.1px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
            Save
          </p>
        </div>
      </div>
    </WizardShell>
  );
}
