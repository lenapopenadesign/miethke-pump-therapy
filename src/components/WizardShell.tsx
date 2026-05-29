import type { ReactNode } from 'react';

const imgBack = "/icons/01195f3c-ce0c-4269-a4cc-2742bc124f77.svg";
const imgSignet = "/icons/9f250784-cad4-4195-99ce-4b9dc94364a5.svg";
const imgMedication = "/icons/medication.svg";

export type WizardStep = 'therapy' | 'review' | 'transfer';

const STEPS: { key: WizardStep; label: string }[] = [
  { key: 'therapy',  label: 'Therapy' },
  { key: 'review',   label: 'Review' },
  { key: 'transfer', label: 'Transfer' },
];

function Check() {
  return (
    <svg width="20" height="20" viewBox="0 0 22 22" fill="none">
      <path d="M4 11.5L9 16L18 6" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Stepper({ step }: { step: WizardStep }) {
  const activeIdx = STEPS.findIndex(s => s.key === step);
  // Dot centers sit at 22px and 1018px within the 1040px track (44px dots, justify-between).
  const trackStart = 22;
  const trackEnd = 1018;
  const centerAt = (i: number) => trackStart + ((trackEnd - trackStart) * i) / (STEPS.length - 1);
  const progressW = centerAt(activeIdx) - trackStart;

  return (
    <div className="relative w-[1040px] mx-auto h-[80px]">
      {/* Rail + completed progress */}
      <div className="absolute top-[20px] h-[2px] bg-[#b5d4e3]" style={{ left: trackStart, right: 1040 - trackEnd }} />
      <div className="absolute top-[20px] h-[2px] bg-[#0094c5]" style={{ left: trackStart, width: progressW }} />
      {/* Dots + labels */}
      <div className="absolute inset-0 flex items-start justify-between">
        {STEPS.map((s, i) => {
          const state = i < activeIdx ? 'done' : i === activeIdx ? 'active' : 'upcoming';
          return (
            <div key={s.key} className="flex flex-col items-center gap-[10px] w-[44px]">
              <div className="size-[44px] flex items-center justify-center">
                {state === 'active' ? (
                  <div className="size-[44px] rounded-full bg-[#b2e0f0] flex items-center justify-center">
                    <div className="size-[20px] rounded-full bg-[#0094c5]" />
                  </div>
                ) : state === 'done' ? (
                  <div className="size-[34px] rounded-full bg-[#0094c5] flex items-center justify-center">
                    <Check />
                  </div>
                ) : (
                  <div className="size-[34px] rounded-full bg-white border-2 border-[#b5c3cc]" />
                )}
              </div>
              <p
                className={`font-['Roboto',sans-serif] text-[20px] tracking-[0.1px] whitespace-nowrap absolute top-[52px] ${state === 'upcoming' ? 'font-normal text-[#9aa7b0]' : 'font-normal text-[#00769e]'}`}
                style={{ fontVariationSettings: "'wdth' 100" }}
              >
                {s.label}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

type Props = {
  step: WizardStep;
  onBack: () => void;
  children: ReactNode;
};

/**
 * Shared chrome for the "Edit Therapy" wizard: purple status bar, a centered
 * "Edit Therapy" header (back arrow / title / signet) and the 3-step
 * Therapy → Review → Transfer dots stepper. Screens supply their body as
 * children — the body area is a padded flex column filling the remaining height.
 */
export function WizardShell({ step, onBack, children }: Props) {
  return (
    <div className="bg-white relative w-[1200px] h-[1920px] flex flex-col overflow-hidden">
      <div className="bg-[#3b2d7c] h-[35px] w-[1200px] shrink-0" />
      {/* Header band */}
      <div className="bg-[#e6f4f9] w-[1200px] shrink-0 flex flex-col pb-[24px]">
        <div className="flex h-[120px] items-center justify-between px-[40px]">
          <div onClick={onBack} className="flex items-center justify-center shrink-0 cursor-pointer w-[56px]">
            <div className="rotate-180 overflow-clip relative size-[56px]">
              <div className="absolute inset-[20%_0.03%_17.61%_0]">
                <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgBack} />
              </div>
            </div>
          </div>
          <div className="flex gap-[16px] items-center">
            <img alt="" src={imgMedication} className="size-[48px] block" />
            <p className="font-['Roboto',sans-serif] font-extrabold leading-[56px] text-[#00769e] text-[44px] tracking-[0.1px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
              Edit Therapy
            </p>
          </div>
          <div className="h-[62px] overflow-clip relative shrink-0 w-[53px]">
            <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgSignet} />
          </div>
        </div>
        <Stepper step={step} />
      </div>
      {/* Body */}
      <div className="flex-1 flex flex-col px-[80px] pt-[40px] pb-[80px] w-[1200px] min-h-0">
        {children}
      </div>
    </div>
  );
}
