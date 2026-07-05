import { useNavigate } from '../navigation';
import { useTherapy } from '../therapy';
import { WizardShell } from '../components/WizardShell';
import { WizardTotalsFooter } from '../components/WizardParts';
import { TherapyChartCard, TherapyMedBreakdown } from '../components/TherapyBreakdown';

const wdth = { fontVariationSettings: "'wdth' 100" } as const;

/**
 * Edit Therapy entry: shows the current Medication & Therapy at a glance (the same
 * shared breakdown used on the Therapy detail and Review pages), then asks whether
 * to edit the existing therapy or start from scratch before dropping into Base Dose.
 */
export function EditEntry() {
  const navigate = useNavigate();
  const { beginEditTherapy, beginScratchTherapy } = useTherapy();

  const editExisting = () => { beginEditTherapy('therapy-detail'); navigate('base-dose'); };
  const startFresh = () => { beginScratchTherapy('therapy-detail'); navigate('base-dose'); };

  return (
    <WizardShell
      step="base-dose"
      onBack={() => navigate('therapy-detail')}
      pinnedTop={<TherapyChartCard onHelp={() => navigate('help')} />}
      footer={
        <>
          <WizardTotalsFooter />
          <div className="bg-[#e6f4f9] px-[80px] pt-[28px] pb-[40px] flex flex-col gap-[24px]">
            <p className="font-['Roboto',sans-serif] font-bold text-[#00769e] text-[30px] tracking-[0.1px]" style={wdth}>
              Do you want to start from scratch or edit the existing therapy?
            </p>
            <div className="flex gap-[24px]">
              <button onClick={editExisting} className="flex-1 h-[88px] rounded-[80px] bg-[#0094c5] font-['Roboto',sans-serif] font-bold text-white text-[28px] cursor-pointer" style={wdth}>Edit existing</button>
              <button onClick={startFresh} className="flex-1 h-[88px] rounded-[80px] bg-[#0094c5] font-['Roboto',sans-serif] font-bold text-white text-[28px] cursor-pointer" style={wdth}>Start from scratch</button>
            </div>
          </div>
        </>
      }
    >
      {/* Scrollable medication breakdown (delivery frequency + accordion). */}
      <TherapyMedBreakdown />
    </WizardShell>
  );
}
