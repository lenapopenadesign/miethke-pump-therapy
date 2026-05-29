import { useState } from 'react';
import { useNavigate } from '../navigation';
import { useTherapy, coDoseUgDay, doseStrings, type Medication } from '../therapy';
import { WizardShell } from '../components/WizardShell';
import { MedicationIcon } from '../components/MedicationIcon';

const imgEditPencil = "/icons/edit-pencil.svg";

// Shared 4-column grid: MEDICATION | Concentration | Dose/day | Dose/hour
const GRID = 'grid items-center gap-[24px] w-[1040px] [grid-template-columns:240px_180px_400px_1fr]';
const colLabel = "font-['Roboto',sans-serif] font-bold text-[#00769e] text-[20px] tracking-[1px]";

function NameCell({ name, concentration }: { name: string; concentration: string }) {
  return (
    <>
      <p className="font-['Roboto',sans-serif] font-bold text-[#00769e] text-[28px] leading-[32px] tracking-[0.1px]" style={{ fontVariationSettings: "'wdth' 100" }}>{name}</p>
      <p className="font-['Roboto',sans-serif] font-normal text-[#00769e] text-[24px] tracking-[0.1px]" style={{ fontVariationSettings: "'wdth' 100" }}>{concentration}</p>
    </>
  );
}

export function BaseDose() {
  const navigate = useNavigate();
  const { baseDose, setBaseDose, medications } = useTherapy();
  const c0 = medications[0]?.concentration ?? 1;
  const [editingId, setEditingId] = useState<string | undefined>(medications[0]?.id);
  const ctaEnabled = baseDose > 0;

  // Each med's 24h dose (µg/day). The primary (index 0) is the base dose itself;
  // every other drug is co-delivered in the same volume.
  const ugFor = (m: Medication, i: number) => (i === 0 ? baseDose : coDoseUgDay(baseDose, c0, m.concentration));
  // Editing any med's dose back-solves the shared delivered volume (the primary
  // dose), so the rest of the table stays consistent.
  const applyEdit = (m: Medication, i: number, ug: number) => {
    const primary = i === 0 ? ug : (m.concentration > 0 ? (ug * c0) / m.concentration : 0);
    setBaseDose(Math.max(0, Math.min(20000, Math.round(primary))));
  };

  return (
    <WizardShell step="therapy" onBack={() => navigate('add-medication')}>
      <div className="flex-1 flex flex-col gap-[40px]">
        {/* Title */}
        <div className="flex gap-[16px] items-center">
          <MedicationIcon size={48} />
          <p className="font-['Roboto',sans-serif] font-extrabold leading-[40px] text-[#00769e] text-[36px] tracking-[0.1px]" style={{ fontVariationSettings: "'wdth' 100" }}>
            Base Dose
          </p>
        </div>

        {/* Column headers */}
        <div className={GRID}>
          <p className={colLabel}>MEDICATION</p>
          <p className="font-['Roboto',sans-serif] font-normal text-[#00769e] text-[20px] tracking-[1px]">Concentration</p>
          <p className={colLabel}>Dose/day</p>
          <p className={colLabel}>Dose/hour</p>
        </div>

        {medications.map((m, i) => {
          const ug = ugFor(m, i);
          const d = doseStrings(ug);
          const editing = m.id === editingId;
          return (
            <div key={m.id} className={GRID}>
              <NameCell name={m.name} concentration={`${m.concentration} ${m.unit}`} />

              {/* Dose/day — editable input for the selected med, read-only otherwise */}
              {editing ? (
                <div className="bg-white border border-[#c4ccd4] rounded-[8px] h-[64px] w-[300px] flex items-center px-[20px] gap-[8px] focus-within:border-[#0094c5]">
                  <input
                    type="text" inputMode="numeric" pattern="[0-9]*"
                    value={Math.round(ug)}
                    onChange={e => applyEdit(m, i, parseInt(e.target.value.replace(/[^0-9]/g, ''), 10) || 0)}
                    className="flex-1 min-w-px font-bold text-[#1a1a1a] text-[28px] bg-transparent outline-none border-0 p-0"
                    style={{ fontFamily: 'Roboto, sans-serif', fontVariationSettings: "'wdth' 100" }}
                  />
                  <span className="font-['Roboto',sans-serif] font-normal text-[#a5a5a5] text-[22px]" style={{ fontVariationSettings: "'wdth' 100" }}>µg/d</span>
                </div>
              ) : (
                <div className="flex items-baseline gap-[8px]">
                  <span className="font-['Roboto',sans-serif] font-normal text-[#45483c] text-[36px] leading-[40px]" style={{ fontVariationSettings: "'wdth' 100" }}>{d.perDay}</span>
                  <span className="font-['Roboto',sans-serif] font-normal text-[#a5a5a5] text-[24px]" style={{ fontVariationSettings: "'wdth' 100" }}>{d.unit}/d</span>
                </div>
              )}

              {/* Dose/hour + edit pencil (hidden on the row being edited) */}
              <div className="flex items-center justify-between">
                <p className="font-['Roboto',sans-serif] text-[#a5a5a5] tracking-[0.1px]" style={{ fontVariationSettings: "'wdth' 100" }}>
                  <span className="font-semibold text-[32px] leading-[48px]">≈ </span>
                  <span className="text-[32px] leading-[48px]">{d.perHour}</span>
                  <span className="text-[24px]"> {d.unit}/h</span>
                </p>
                {!editing && (
                  <img
                    alt="Edit dose" src={imgEditPencil}
                    onClick={() => setEditingId(m.id)}
                    className="size-[40px] shrink-0 block cursor-pointer"
                  />
                )}
              </div>
            </div>
          );
        })}

        {/* Save CTA */}
        <div
          onClick={() => { if (ctaEnabled) navigate('intervals-empty'); }}
          className={`mt-auto flex h-[88px] items-center justify-center px-[40px] rounded-[80px] w-full ${ctaEnabled ? 'bg-[#0094c5] cursor-pointer' : 'bg-[#cbcbcb] cursor-not-allowed'}`}
        >
          <p className={`font-['Roboto',sans-serif] font-bold leading-[32px] text-[24px] tracking-[0.1px] ${ctaEnabled ? 'text-white' : 'text-[#a5a5a5]'}`} style={{ fontVariationSettings: "'wdth' 100" }}>
            Save
          </p>
        </div>
      </div>
    </WizardShell>
  );
}
