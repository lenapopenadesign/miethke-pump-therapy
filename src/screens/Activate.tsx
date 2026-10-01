import { useEffect, useState } from 'react';
import { useNavigate } from '../navigation';
import { useTherapy } from '../therapy';
import { WizardShell } from '../components/WizardShell';
import { BridgeBolusStatus } from '../components/BridgeBolus';
import type { ScreenId } from '../navigation';

function LoadingBar() {
  return (
    <div className="border-2 border-[#62dec2] border-solid p-[2px] rounded-[20px] w-full overflow-clip">
      {/* Gradient fill animates its width from 0 → 100% as the transfer runs. */}
      <div
        className="progress-fill h-[28px] rounded-[14px]"
        style={{ backgroundImage: "linear-gradient(90deg, rgb(9, 102, 87) 0%, rgb(98, 222, 194) 100%)" }}
      />
    </div>
  );
}

// Success check in a solid green disc (Figma success_green_dark #23ab5e).
function SuccessCheck() {
  return (
    <div className="size-[40px] rounded-full bg-[#23ab5e] flex items-center justify-center shrink-0">
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <path d="M4 11.5L9 16L18 6" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

// Syringe + vial beside the next-refill line (Figma icons/refill 2325:27713).
function RefillIcon() {
  return <img alt="" src="/icons/next-refill.svg" className="block shrink-0 size-[40px]" />;
}

export function Activate() {
  const navigate = useNavigate();
  const { flowMode, setFlowMode, completeRefill, therapyActive, commitTherapy, refillDate, refillBranch, setRefillBranch, startBridgeBolus, resumingTherapy } = useTherapy();
  // Captured on entry: commitTherapy clears the flag once the transfer lands.
  const [resumed] = useState(resumingTherapy);
  const isRefill = flowMode === 'refill';
  // Once the bar finishes, the therapy is committed/activated and we reveal the
  // success message + "Back to Mainscreen" button (Figma 9579:176417). The user
  // then returns home on their own instead of an automatic redirect.
  const [done, setDone] = useState(false);
  const [homeTarget, setHomeTarget] = useState<ScreenId>('home-active');
  useEffect(() => {
    const t = setTimeout(() => {
      if (flowMode === 'refill') {
        // A refill doesn't create a therapy, but both branches re-confirm it
        // (and may have changed it), so commit what was reviewed. A medication
        // change also starts the bridge bolus.
        completeRefill();
        if (refillBranch != null) commitTherapy();
        if (refillBranch === 'different') startBridgeBolus();
        setHomeTarget(therapyActive || refillBranch != null ? 'home-active' : 'home-no-therapy');
      } else {
        // Setup flow finished: commit the new/adjusted therapy as active.
        commitTherapy();
        setHomeTarget('home-active');
      }
      setDone(true);
    }, 2500);
    return () => clearTimeout(t);
    // Runs once, when the transfer starts.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  // Leaving drops the refill chrome only now, so the success screen keeps it.
  const finish = () => {
    if (isRefill) { setFlowMode('setup'); setRefillBranch(null); }
    navigate(homeTarget);
  };
  return (
    <WizardShell step="transfer" onBack={() => navigate('review')} onHelp={() => navigate('help')}>
      <div className="flex flex-col gap-[40px]">
        <p className="font-['Roboto',sans-serif] font-bold leading-[40px] text-[#096657] text-[36px] tracking-[0.1px]" style={{ fontVariationSettings: "'wdth' 100" }}>
          {isRefill ? (done ? 'Successfully transferred to implant' : 'Transfer to implant') : 'Transfer to pump'}
        </p>
        <LoadingBar />
        {done && (
          <>
            <div className="bg-[#e9f7ef] flex gap-[24px] items-center p-[24px] rounded-[24px]">
              <SuccessCheck />
              <p className="flex-1 font-['Roboto',sans-serif] font-normal leading-[32px] text-[#183d38] text-[24px] tracking-[0.1px]" style={{ fontVariationSettings: "'wdth' 100" }}>
                {isRefill || resumed ? 'The therapy was successfully reactivated.' : 'Therapy successfully transferred and activated.'}
              </p>
            </div>
            {isRefill && <BridgeBolusStatus />}
            {/* When the pump is due next — the one thing the clinician needs to
                carry out of this screen, so it sits with the confirmation. */}
            <div className="bg-[#f5fcf9] flex gap-[16px] items-center px-[24px] py-[20px] rounded-[24px]">
              <RefillIcon />
              <span className="font-['Roboto',sans-serif] font-normal leading-[32px] text-[#096657] text-[24px] tracking-[0.1px]" style={{ fontVariationSettings: "'wdth' 100" }}>
                Next refill before:
              </span>
              <span className="font-['Roboto',sans-serif] font-bold leading-[32px] text-[#096657] text-[26px] tracking-[0.1px]" style={{ fontVariationSettings: "'wdth' 100" }}>
                {refillDate}
              </span>
            </div>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={finish}
                className="bg-[#0b786a] flex gap-[16px] h-[88px] items-center justify-center min-w-[240px] px-[40px] rounded-[80px] cursor-pointer"
              >
                <span className="font-['Roboto',sans-serif] font-bold leading-[32px] text-white text-[24px] tracking-[0.1px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
                  {isRefill ? 'Complete refill' : 'Back to Mainscreen'}
                </span>
              </button>
            </div>
          </>
        )}
      </div>
    </WizardShell>
  );
}
