import { useNavigate } from '../navigation';
import { useTherapy } from '../therapy';
import { WizardShell } from '../components/WizardShell';

const wdth = { fontVariationSettings: "'wdth' 100" } as const;

/**
 * Edit Therapy entry: a minimal decision screen (Figma 9175-181833). The user
 * chooses to edit the existing therapy or start from scratch before dropping into
 * the Base Dose step. The stepper shows no active step yet (`filling` isn't a
 * setup step, so every dot renders inactive).
 */
export function EditEntry() {
  const navigate = useNavigate();
  const { setFlowMode, beginEditTherapy, beginScratchTherapy } = useTherapy();

  const editExisting = () => { setFlowMode('setup'); beginEditTherapy('therapy-detail'); navigate('base-dose'); };
  const startFresh = () => { setFlowMode('setup'); beginScratchTherapy('therapy-detail'); navigate('base-dose'); };

  const btn = "h-[88px] px-[44px] rounded-[80px] bg-[#0094c5] font-['Roboto',sans-serif] font-bold text-white text-[28px] tracking-[0.1px] cursor-pointer whitespace-nowrap";

  return (
    <WizardShell step="filling" onBack={() => navigate('therapy-detail')}>
      <div className="flex flex-col gap-[56px] pt-[24px]">
        <p className="font-['Roboto',sans-serif] font-bold text-[#00769e] text-[40px] leading-[52px] tracking-[0.1px]" style={wdth}>
          Do you want to edit the existing therapy or start from scratch?
        </p>
        <div className="flex gap-[24px] justify-end">
          <button onClick={editExisting} className={btn} style={wdth}>Edit existing therapy</button>
          <button onClick={startFresh} className={btn} style={wdth}>Start from scratch</button>
        </div>
      </div>
    </WizardShell>
  );
}
