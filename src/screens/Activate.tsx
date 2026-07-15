import { useEffect, useState } from 'react';
import { useNavigate } from '../navigation';
import { useTherapy } from '../therapy';
import { WizardShell } from '../components/WizardShell';
import type { ScreenId } from '../navigation';

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

// Success check in a solid green disc (Figma success_green_dark #24ab5e).
function SuccessCheck() {
  return (
    <div className="size-[40px] rounded-full bg-[#24ab5e] flex items-center justify-center shrink-0">
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <path d="M4 11.5L9 16L18 6" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

export function Activate() {
  const navigate = useNavigate();
  const { flowMode, setFlowMode, completeRefill, therapyActive, commitTherapy } = useTherapy();
  // Once the bar finishes, the therapy is committed/activated and we reveal the
  // success message + "Back to Mainscreen" button (Figma 9579:176417). The user
  // then returns home on their own instead of an automatic redirect.
  const [done, setDone] = useState(false);
  const [homeTarget, setHomeTarget] = useState<ScreenId>('home-active');
  useEffect(() => {
    const t = setTimeout(() => {
      if (flowMode === 'refill') {
        // A refill doesn't create a therapy — return to whichever home matches
        // the current state.
        completeRefill();
        setFlowMode('setup');
        setHomeTarget(therapyActive ? 'home-active' : 'home-no-therapy');
      } else {
        // Setup flow finished: commit the new/adjusted therapy as active.
        commitTherapy();
        setHomeTarget('home-active');
      }
      setDone(true);
    }, 2500);
    return () => clearTimeout(t);
  }, [flowMode, setFlowMode, completeRefill, therapyActive, commitTherapy]);
  return (
    <WizardShell step="transfer" onBack={() => navigate('review')} onHelp={() => navigate('help')}>
      <div className="flex flex-col gap-[40px]">
        <p className="font-['Roboto',sans-serif] font-bold leading-[40px] text-[#00769e] text-[36px] tracking-[0.1px]" style={{ fontVariationSettings: "'wdth' 100" }}>
          Transfer to pump
        </p>
        <LoadingBar />
        {done && (
          <>
            <div className="bg-[#d0f6e4] flex gap-[24px] items-center p-[24px] rounded-[24px]">
              <SuccessCheck />
              <p className="flex-1 font-['Roboto',sans-serif] font-normal leading-[32px] text-[#45483c] text-[24px] tracking-[0.1px]" style={{ fontVariationSettings: "'wdth' 100" }}>
                Therapy successfully transferred and activated.
              </p>
            </div>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => navigate(homeTarget)}
                className="bg-[#0094c5] flex gap-[16px] h-[88px] items-center justify-center min-w-[240px] px-[40px] rounded-[80px] cursor-pointer"
              >
                <span className="font-['Roboto',sans-serif] font-bold leading-[32px] text-white text-[24px] tracking-[0.1px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
                  Back to Mainscreen
                </span>
              </button>
            </div>
          </>
        )}
      </div>
    </WizardShell>
  );
}
