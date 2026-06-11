import { useState } from 'react';
import { useNavigate } from '../navigation';
import { useTherapy, coDoseUgDay, concUgPerUl, doseStringsFor, doseUnitFor, type Medication } from '../therapy';
import { WizardShell } from '../components/WizardShell';
import { MedicationIcon } from '../components/MedicationIcon';

const imgEditPencil = "/icons/edit-pencil.svg";

// 4-column grid: MEDICATION (name + subtle concentration) | Dose/day | Dose/hour | edit-pencil.
// Mirrors the Medication / Add-interval rows: identity on the left, values on the
// right. The base dose (primary) is editable by default; other medications can be
// edited on demand via the pencil. Whichever row is active shows the input box;
// the rest stay subtle.
const GRID = 'grid items-center gap-[24px] w-[1040px] [grid-template-columns:1fr_340px_280px_56px]';
const colLabel = "font-['Roboto',sans-serif] font-bold text-[#00769e] text-[20px] tracking-[1px]";
const colLabelSubtle = "font-['Roboto',sans-serif] font-normal text-[#9ea8b2] text-[20px] tracking-[1px]";

/** Medication identity: bold name + subtle concentration inline (Add-interval style). */
function NameCell({ name, concentration }: { name: string; concentration: string }) {
  return (
    <p className="font-['Roboto',sans-serif] tracking-[0.1px]" style={{ fontVariationSettings: "'wdth' 100" }}>
      <span className="font-bold text-[#00769e] text-[32px] leading-[40px]">{name}</span>
      <span className="font-normal text-[#9ea8b2] text-[24px]"> {concentration}</span>
    </p>
  );
}

/** Read-only dose value, rendered subtly (normal weight, grey). */
function SubtleDose({ value, unit }: { value: string; unit: string }) {
  return (
    <p className="font-['Roboto',sans-serif] font-normal text-[#9ea8b2] tracking-[0.1px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
      <span className="text-[36px] leading-[48px]">{value}</span>
      <span className="text-[26px]"> {unit}</span>
    </p>
  );
}

export function BaseDose() {
  const navigate = useNavigate();
  const { baseDose, setBaseDose, medications } = useTherapy();
  const c0 = medications[0] ? concUgPerUl(medications[0]) : 1;
  // The medication whose dose is currently editable. Defaults to the primary
  // (the base dose itself); the pencil on any other row switches editing to it.
  const [editingId, setEditingId] = useState<string | undefined>(medications[0]?.id);
  // Raw text of the field while it's being typed into. Kept separate from the
  // formatted dose so a keystroke isn't reformatted mid-entry (typing "360"
  // would otherwise collapse to "3.0"). Reset to null (→ show formatted) on blur
  // or when switching the edited row.
  const [draftText, setDraftText] = useState<string | null>(null);
  const ctaEnabled = baseDose > 0;

  // Each med's 24h dose (µg/day). The primary (index 0) is the base dose itself;
  // every other drug is co-delivered in the same volume.
  const ugFor = (m: Medication, i: number) => (i === 0 ? baseDose : coDoseUgDay(baseDose, c0, concUgPerUl(m)));
  // The base dose is entered per DAY. Editing any med back-solves the shared
  // delivered volume (the primary's µg/day) so the rest of the table stays
  // consistent; the per-hour readout is always dayUg / 24.
  const applyEditDaily = (m: Medication, i: number, ugPerDay: number) => {
    const mc = concUgPerUl(m);
    const primary = i === 0 ? ugPerDay : (mc > 0 ? (ugPerDay * c0) / mc : 0);
    setBaseDose(Math.max(0, Math.min(20000, Math.round(primary))));
  };

  return (
    <WizardShell step="base-dose" onBack={() => navigate('add-medication')}>
      <div className="flex-1 flex flex-col gap-[40px]">
        {/* Title */}
        <div className="flex gap-[16px] items-center">
          <MedicationIcon size={48} />
          <p className="font-['Roboto',sans-serif] font-extrabold leading-[40px] text-[#00769e] text-[36px] tracking-[0.1px]" style={{ fontVariationSettings: "'wdth' 100" }}>
            Base Dose
          </p>
        </div>

        {/* Table */}
        <div className="flex flex-col gap-[24px]">
          {/* Column headers */}
          <div className={GRID}>
            <p className={colLabel}>MEDICATION</p>
            <p className={colLabel}>Dose/day</p>
            <p className={colLabelSubtle}>Dose/hour</p>
            <span />
          </div>

          {medications.map((m, i) => {
            const ug = ugFor(m, i);
            const d = doseStringsFor(ug, m.unit);
            const div = doseUnitFor(m.unit).div; // µg per displayed unit (mg → 1000, µg → 1)
            const editing = m.id === editingId;
            return (
              <div key={m.id} className={GRID}>
                <NameCell name={m.name} concentration={`${m.concentration} ${m.unit}`} />

                {/* Dose/day — editable input for the active med, subtle otherwise */}
                {editing ? (
                  <div className="bg-white border border-[#c4ccd4] rounded-[8px] h-[76px] w-full flex items-center px-[20px] gap-[8px] focus-within:border-[#0094c5]">
                    <input
                      type="text" inputMode="decimal" pattern="[0-9]*\.?[0-9]*"
                      value={draftText ?? d.perDay}
                      onChange={e => {
                        const raw = e.target.value.replace(/[^0-9.]/g, '');
                        setDraftText(raw);
                        const v = parseFloat(raw);
                        applyEditDaily(m, i, (isNaN(v) ? 0 : v) * div); // displayed unit/d → µg/d
                      }}
                      onBlur={() => setDraftText(null)}
                      className="flex-1 min-w-px font-bold text-[#1a1a1a] text-[40px] bg-transparent outline-none border-0 p-0"
                      style={{ fontFamily: 'Roboto, sans-serif', fontVariationSettings: "'wdth' 100" }}
                    />
                    <span className="font-['Roboto',sans-serif] font-normal text-[#a5a5a5] text-[28px]" style={{ fontVariationSettings: "'wdth' 100" }}>{d.unit}/d</span>
                  </div>
                ) : (
                  <SubtleDose value={d.perDay} unit={`${d.unit}/d`} />
                )}

                {/* Dose/hour — always read-only, derived as dose/day ÷ 24 */}
                <SubtleDose value={d.perHour} unit={`${d.unit}/h`} />

                {/* Edit pencil — selects this row for editing (hidden on the active row) */}
                {editing ? <span /> : (
                  <img
                    alt="Edit dose" src={imgEditPencil}
                    onClick={() => { setDraftText(null); setEditingId(m.id); }}
                    className="size-[40px] shrink-0 block cursor-pointer justify-self-end"
                  />
                )}
              </div>
            );
          })}
        </div>

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
