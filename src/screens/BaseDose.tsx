import { useState } from 'react';
import { useNavigate } from '../navigation';
import { useTherapy, coDoseUgDay, concUgPerUl, doseStringsFor, doseUnitFor, type Medication } from '../therapy';
import { WizardShell } from '../components/WizardShell';
import { TherapyHeaderChart } from '../components/TherapyHeaderChart';
import { MedicationIcon } from '../components/MedicationIcon';

const imgEditPencil = "/icons/edit-pencil.svg";

// MEDICATION | Concentration | Dose/day | Dose/hour | edit-pencil.
const GRID = 'grid items-center gap-[8px] w-[1040px] [grid-template-columns:184px_216px_385px_1fr_40px]';
const hdr = "font-['Roboto',sans-serif] text-[#00769e] text-[24px] leading-[32px] tracking-[0.1px] whitespace-nowrap";

/** Read-only dose value, rendered subtly (grey) so only the editable field stands out. */
function SubtleDose({ value, unit }: { value: string; unit: string }) {
  return (
    <p className="font-['Roboto',sans-serif] text-[#9ea8b2] text-[28px] leading-[36px] tracking-[0.1px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
      <span className="font-bold">{value}</span> <span className="font-normal">{unit}</span>
    </p>
  );
}

// Per-row display. Every medication — including the primary (index 0) — is shown
// and edited in the unit its concentration implies (mg or µg), so the unit chosen
// on the Medication page carries through here. The primary IS the base dose; the
// co-meds are derived from the shared delivered volume.
function rowDisplay(m: Medication, i: number, baseDose: number, c0: number) {
  const ug = i === 0 ? baseDose : coDoseUgDay(baseDose, c0, concUgPerUl(m));
  const d = doseStringsFor(ug, m.unit);
  return { unit: d.unit, div: doseUnitFor(m.unit).div, perDay: baseDose > 0 ? d.perDay : '', perHour: baseDose > 0 ? d.perHour : '--' };
}

export function BaseDose() {
  const navigate = useNavigate();
  const { baseDose, setBaseDose, medications } = useTherapy();
  const c0 = medications[0] ? concUgPerUl(medications[0]) : 1;
  // The medication whose dose is currently editable. Defaults to the primary
  // (the base dose itself); the pencil on any other row switches editing to it.
  const [editingId, setEditingId] = useState<string | undefined>(medications[0]?.id);
  // Raw text while a field is being typed into (kept separate from the formatted
  // dose so a keystroke isn't reformatted mid-entry). Reset on blur / row switch.
  const [draftText, setDraftText] = useState<string | null>(null);
  const ctaEnabled = baseDose > 0;

  // Editing any med back-solves the shared delivered volume (the primary's
  // µg/day) so the rest of the table stays consistent.
  const applyEditDaily = (m: Medication, i: number, ugPerDay: number) => {
    const mc = concUgPerUl(m);
    const primary = i === 0 ? ugPerDay : (mc > 0 ? (ugPerDay * c0) / mc : 0);
    setBaseDose(Math.max(0, Math.min(20000, Math.round(primary))));
  };

  return (
    <WizardShell step="base-dose" onBack={() => navigate('add-medication')} banner={<TherapyHeaderChart />}>
      <div className="flex-1 flex flex-col">
        <div className="flex flex-col gap-[24px]">
          {/* Title */}
          <div className="flex gap-[16px] items-center">
            <MedicationIcon size={56} />
            <p className="font-['Roboto',sans-serif] font-bold leading-[40px] text-[#00769e] text-[36px] tracking-[0.1px]" style={{ fontVariationSettings: "'wdth' 100" }}>
              Base Dose
            </p>
          </div>

          {/* Table */}
          <div className="flex flex-col gap-[40px]">
            {/* Column headers */}
            <div className={GRID}>
              <p className={`${hdr} font-normal`}>MEDICATION</p>
              <p className={`${hdr} font-normal`}>Concentration</p>
              <p className={`${hdr} font-bold`}>Dose/day</p>
              <p className={`${hdr} font-normal`}>Dose/hour</p>
              <span />
            </div>

            {medications.map((m, i) => {
              const d = rowDisplay(m, i, baseDose, c0);
              const editing = m.id === editingId;
              return (
                <div key={m.id} className={GRID}>
                  {/* Medication name */}
                  <p className="font-['Roboto',sans-serif] font-bold text-[#00769e] text-[28px] leading-[36px] tracking-[0.1px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>{m.name || (i === 0 ? 'Primary' : 'Medication')}</p>

                  {/* Concentration */}
                  <p className="font-['Roboto',sans-serif] text-[28px] leading-[36px] tracking-[0.1px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
                    <span className="font-bold text-[#00769e]">{m.concentration}</span> <span className="font-normal text-[#00769e]">{m.unit}</span>
                  </p>

                  {/* Dose/day — editable field for the active med, subtle otherwise */}
                  {editing ? (
                    <div className="bg-white border-2 border-[#6b7785] rounded-[8px] h-[72px] w-[260px] flex items-center pl-[16px] pr-[8px] gap-[8px] focus-within:border-[#0094c5]">
                      <input
                        type="text" inputMode="decimal" pattern="[0-9]*\.?[0-9]*"
                        autoFocus
                        onFocus={e => e.currentTarget.select()}
                        value={draftText ?? d.perDay}
                        onChange={e => {
                          const raw = e.target.value.replace(/[^0-9.]/g, '');
                          setDraftText(raw);
                          const v = parseFloat(raw);
                          applyEditDaily(m, i, (isNaN(v) ? 0 : v) * d.div); // displayed unit/d → µg/d
                        }}
                        onBlur={() => setDraftText(null)}
                        className="flex-1 min-w-px font-bold text-[#45483c] text-[40px] leading-[52px] bg-transparent outline-none border-0 p-0 placeholder:font-normal placeholder:text-[#9ea8b2] placeholder:text-[28px]"
                        style={{ fontFamily: 'Roboto, sans-serif', fontVariationSettings: "'wdth' 100" }}
                      />
                      <span className="font-['Roboto',sans-serif] font-normal text-[#a5a5a5] text-[28px] text-right pr-[8px]" style={{ fontVariationSettings: "'wdth' 100" }}>{d.unit}/d</span>
                    </div>
                  ) : (
                    <SubtleDose value={d.perDay || '--'} unit={`${d.unit}/d`} />
                  )}

                  {/* Dose/hour — always read-only, derived as dose/day ÷ 24 */}
                  <SubtleDose value={d.perHour} unit={`${d.unit}/h`} />

                  {/* Edit pencil — selects this row for editing (hidden on the active row) */}
                  {editing ? <span /> : (
                    <img
                      alt="Edit dose" src={imgEditPencil}
                      onClick={() => { setDraftText(null); setEditingId(m.id); }}
                      className="size-[40px] shrink-0 block cursor-pointer"
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Save CTA */}
        <div
          onClick={() => { if (ctaEnabled) navigate('frequency'); }}
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
