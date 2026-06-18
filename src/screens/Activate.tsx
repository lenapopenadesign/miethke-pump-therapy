import { useEffect } from 'react';
import { useNavigate } from '../navigation';
import { useTherapy } from '../therapy';
import { WizardShell } from '../components/WizardShell';

function LoadingBar() {
  return (
    <div className="border-2 border-[#65d8fe] border-solid p-[2px] rounded-[20px] w-full overflow-clip">
      {/* Gradient fill animates its width from 0 → 100% as the transfer runs. */}
      <div
        className="progress-fill h-[28px] rounded-[14px]"
        style={{ backgroundImage: "linear-gradient(90deg, rgb(0, 118, 158) 0%, rgb(101, 216, 254) 100%)" }}
      />
    </div>
  );
}

export function Activate() {
  const navigate = useNavigate();
  const { flowMode, setFlowMode, completeRefill, therapyActive, commitTherapy } = useTherapy();
  useEffect(() => {
    const t = setTimeout(() => {
      if (flowMode === 'refill') {
        // A refill doesn't create a therapy — return to whichever home matches
        // the current state.
        completeRefill();
        setFlowMode('setup');
        navigate(therapyActive ? 'home-active' : 'home-no-therapy');
      } else {
        // Setup flow finished: commit the new/adjusted therapy as active.
        commitTherapy();
        navigate('home-active');
      }
    }, 2500);
    return () => clearTimeout(t);
  }, [navigate, flowMode, setFlowMode, completeRefill, therapyActive, commitTherapy]);
  return (
    <WizardShell step="transfer" onBack={() => navigate('review')}>
      <div className="flex flex-col gap-[24px]">
        <p className="font-['Roboto',sans-serif] font-bold leading-[40px] text-[#00769e] text-[36px] tracking-[0.1px]" style={{ fontVariationSettings: "'wdth' 100" }}>
          Activate therapy on implant
        </p>
        <LoadingBar />
      </div>
    </WizardShell>
  );
}
