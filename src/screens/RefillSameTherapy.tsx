import { useNavigate } from '../navigation';
import { useTherapy } from '../therapy';
import { WizardShell } from '../components/WizardShell';
import { TherapyChartCard, TherapyMedBreakdown } from '../components/TherapyBreakdown';

/**
 * Refill · the therapy decision gate, shown straight after the physical refill
 * completes (Figma 9688:48532). The clinician sees the therapy currently on the
 * pump and either carries it over untouched ("No change" → skip ahead to the
 * refill alert) or steps through Medication · Default Delivery · Custom Delivery
 * to adjust it ("Change"), which lands on the same refill-alert step afterwards.
 */
export function RefillSameTherapy() {
  const navigate = useNavigate();
  const { beginEditTherapy } = useTherapy();

  // "Change" enters the shared therapy-edit screens. Snapshotting here is what
  // gives the Review page its before/after comparison for a refill.
  const onChange = () => {
    beginEditTherapy('refill-same-therapy');
    navigate('add-medication');
  };

  return (
    <WizardShell
      step="medication"
      onBack={() => navigate('refill-filling')}
      onHelp={() => navigate('help')}
    >
      <div className="flex-1 flex flex-col gap-[40px]">
        <p className="font-['Roboto',sans-serif] font-bold text-[#00769e] text-[36px] leading-[40px] tracking-[0.1px]" style={{ fontVariationSettings: "'wdth' 100" }}>
          Do you want to use the same therapy
        </p>

        <TherapyChartCard />
        <TherapyMedBreakdown />

        {/* Decision CTAs — right-aligned pill pair per Figma. */}
        <div className="mt-auto pt-[40px] flex gap-[40px] items-center justify-end">
          <button
            onClick={() => navigate('refill-alert')}
            className="h-[88px] min-w-[240px] px-[40px] rounded-[80px] bg-[#0094c5] cursor-pointer"
          >
            <span className="font-['Roboto',sans-serif] font-bold text-white text-[24px] leading-[32px] tracking-[0.1px]" style={{ fontVariationSettings: "'wdth' 100" }}>
              No change
            </span>
          </button>
          <button
            onClick={onChange}
            className="h-[88px] min-w-[240px] px-[40px] rounded-[80px] bg-[#0094c5] cursor-pointer"
          >
            <span className="font-['Roboto',sans-serif] font-bold text-white text-[24px] leading-[32px] tracking-[0.1px]" style={{ fontVariationSettings: "'wdth' 100" }}>
              Change
            </span>
          </button>
        </div>
      </div>
    </WizardShell>
  );
}
