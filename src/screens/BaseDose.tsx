import { useNavigate } from '../navigation';
import { useTherapy, hourlyUg, coDoseUgDay, doseStrings } from '../therapy';
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

function DerivedRow({ name, concentration, ugDay }: { name: string; concentration: string; ugDay: number }) {
  const d = doseStrings(ugDay);
  return (
    <div className={GRID}>
      <NameCell name={name} concentration={concentration} />
      <div className="flex items-baseline gap-[8px]">
        <span className="font-['Roboto',sans-serif] font-normal text-[#45483c] text-[36px] leading-[40px]" style={{ fontVariationSettings: "'wdth' 100" }}>{d.perDay}</span>
        <span className="font-['Roboto',sans-serif] font-normal text-[#a5a5a5] text-[24px]" style={{ fontVariationSettings: "'wdth' 100" }}>{d.unit}/d</span>
      </div>
      <div className="flex items-center justify-between">
        <p className="font-['Roboto',sans-serif] text-[#a5a5a5] tracking-[0.1px]" style={{ fontVariationSettings: "'wdth' 100" }}>
          <span className="font-semibold text-[32px] leading-[48px]">≈ </span>
          <span className="text-[32px] leading-[48px]">{d.perHour}</span>
          <span className="text-[24px] text-[#a5a5a5]"> {d.unit}/h</span>
        </p>
        <img alt="" src={imgEditPencil} className="size-[40px] shrink-0 block" />
      </div>
    </div>
  );
}

export function BaseDose() {
  const navigate = useNavigate();
  const { baseDose, setBaseDose, medications } = useTherapy();
  const baclofen = medications[0];
  const primaryConc = baclofen?.concentration ?? 1;
  const coMeds = medications.slice(1);
  const stepDown = () => setBaseDose(Math.max(0, baseDose - 10));
  const stepUp = () => setBaseDose(Math.min(2000, baseDose + 10));
  const hourly = hourlyUg(baseDose);
  const ctaEnabled = baseDose > 0;
  const conc = (m?: { concentration: number; unit: string }) => (m ? `${m.concentration} ${m.unit}` : '');

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

        {/* Baclofen — primary, editable */}
        <div className={GRID}>
          <NameCell name={baclofen?.name || 'Baclofen'} concentration={conc(baclofen)} />
          {/* Dose/day stepper */}
          <div className="flex gap-[16px] items-center">
            <div onClick={stepDown} className="bg-[#e6f4f9] border border-[#00769e] flex items-center justify-center rounded-[12px] size-[72px] cursor-pointer select-none shrink-0">
              <p className="font-['Roboto',sans-serif] font-extrabold leading-none text-[#00769e] text-[48px]" style={{ fontVariationSettings: "'wdth' 100" }}>−</p>
            </div>
            <div className="bg-white border border-[#a5a5a5] flex gap-[8px] h-[72px] items-center pl-[16px] pr-[8px] rounded-[8px] flex-1 min-w-px">
              <input
                type="text" inputMode="numeric" pattern="[0-9]*" value={baseDose}
                onChange={e => setBaseDose(Math.max(0, Math.min(2000, parseInt(e.target.value.replace(/[^0-9]/g, ''), 10) || 0)))}
                className="flex-1 min-w-px font-bold text-[#45483c] text-[36px] leading-[48px] bg-transparent outline-none border-0 p-0"
                style={{ fontFamily: 'Roboto, sans-serif', fontVariationSettings: "'wdth' 100" }}
              />
              <p className="font-['Roboto',sans-serif] font-normal text-[#a5a5a5] text-[24px] pr-[8px]" style={{ fontVariationSettings: "'wdth' 100" }}>µg/d</p>
            </div>
            <div onClick={stepUp} className="bg-[#e6f4f9] border border-[#00769e] flex items-center justify-center rounded-[12px] size-[72px] cursor-pointer select-none shrink-0">
              <p className="font-['Roboto',sans-serif] font-extrabold leading-none text-[#00769e] text-[48px]" style={{ fontVariationSettings: "'wdth' 100" }}>+</p>
            </div>
          </div>
          {/* Dose/hour */}
          <p className="font-['Roboto',sans-serif] text-[#a5a5a5] tracking-[0.1px]" style={{ fontVariationSettings: "'wdth' 100" }}>
            <span className="font-semibold text-[32px] leading-[48px]">≈ </span>
            <span className="text-[32px] leading-[48px]">{hourly.toFixed(1)}</span>
            <span className="text-[24px]"> µg/h</span>
          </p>
        </div>

        {coMeds.map(m => (
          <DerivedRow key={m.id} name={m.name} concentration={conc(m)} ugDay={coDoseUgDay(baseDose, primaryConc, m.concentration)} />
        ))}

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
