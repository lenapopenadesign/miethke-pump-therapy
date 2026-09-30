import { useNavigate } from '../navigation';
import { useTherapy } from '../therapy';
import { WizardShell } from '../components/WizardShell';

const wdth = { fontVariationSettings: "'wdth' 100" } as const;
const FONT = "font-['Roboto',sans-serif]";

/**
 * Refill · the medication gate, shown straight after the physical refill
 * completes (Figma 11123:234268). The answer splits the rest of the refill:
 *
 *   Same medication      → Default Delivery · Custom Delivery · Review · Transfer
 *   Different medication → Medication · Default Delivery · Custom Delivery ·
 *                          Review changes (+ bridge bolus) · Transfer
 *
 * Neither branch has a refill-date / alarm-level step any more.
 */
export function RefillSameTherapy() {
  const navigate = useNavigate();
  const { medications, beginEditTherapy, beginScratchTherapy, setRefillBranch } = useTherapy();

  // Snapshotting here is what gives the Review page its before/after comparison.
  // Same medication keeps the therapy to re-confirm; a new medication starts the
  // dose, frequency and customised deliveries from scratch (the medication list
  // stays, to be edited on the Medication step).
  const choose = (branch: 'same' | 'different') => {
    if (branch === 'same') beginEditTherapy('refill-same-therapy');
    else beginScratchTherapy('refill-same-therapy');
    setRefillBranch(branch);
    navigate(branch === 'same' ? 'base-dose' : 'add-medication');
  };

  return (
    <WizardShell
      step="medication"
      onBack={() => navigate('refill-filling')}
      onHelp={() => navigate('help')}
    >
      <div className="flex-1 flex flex-col gap-[40px]">
        <p className={`${FONT} font-bold text-[#096657] text-[36px] leading-[40px] tracking-[0.1px]`} style={wdth}>
          Did you use the same medication for refilling?
        </p>

        {/* The medications currently in the pump. */}
        <div className="bg-[#f5fcf9] rounded-[24px] px-[56px] py-[40px] flex flex-wrap gap-x-[160px] gap-y-[16px]">
          {medications.map(m => (
            <p key={m.id} className={`${FONT} tracking-[0.1px] whitespace-nowrap`} style={wdth}>
              <span className="font-bold text-[#096657] text-[32px]">{m.name}</span>
              <span className="font-normal text-[#183d38] text-[24px]"> {m.concentration} {m.unit}</span>
            </p>
          ))}
        </div>

        {/* Decision CTAs — an equal-width pair per Figma. */}
        <div className="mt-auto pt-[40px] grid grid-cols-2 gap-[40px]">
          {([['same', 'Same medication'], ['different', 'Different medication']] as const).map(([branch, label]) => (
            <button
              key={branch}
              onClick={() => choose(branch)}
              className="h-[88px] rounded-[80px] bg-[#0b786a] hover:bg-[#096657] cursor-pointer"
            >
              <span className={`${FONT} font-bold text-white text-[24px] leading-[32px] tracking-[0.1px]`} style={wdth}>
                {label}
              </span>
            </button>
          ))}
        </div>
      </div>
    </WizardShell>
  );
}
