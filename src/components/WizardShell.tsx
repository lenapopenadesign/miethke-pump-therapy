import type { ReactNode } from 'react';
import { MedicationIcon } from './MedicationIcon';
import { useTherapy, type FlowMode } from '../therapy';

const imgBack = "/icons/01195f3c-ce0c-4269-a4cc-2742bc124f77.svg";
const imgSignet = "/icons/9f250784-cad4-4195-99ce-4b9dc94364a5.svg";
// Refill icon (pump + syringe) — same as the Refill action tile that opens the flow.
const imgRefillSyringe = "/icons/act-refill-syringe-b.svg";
const imgRefillPump = "/icons/act-refill-pump-b.svg";

// Granular step a screen reports it belongs to. The setup wizard shows all of
// these as distinct dots; the refill wizard collapses the therapy-editing steps
// (base-dose / intervals / delivery) into a single "Therapy" dot.
export type WizardStep = 'filling' | 'medication' | 'base-dose' | 'intervals' | 'delivery' | 'review' | 'transfer';

// Which middle path the setup user has taken. 'undecided' previews BOTH the
// Intervals and Delivery steps; once the user adds an interval ('intervals') or
// skips to base-dose-only delivery ('regular'), the unused step collapses away.
export type SetupDecision = 'undecided' | 'intervals' | 'regular';

const MEDICATION = { key: 'medication' as const, label: 'Medication' };
const BASE_DOSE = { key: 'base-dose' as const, label: 'Base Dose' };
const INTERVALS = { key: 'intervals' as const, label: 'Intervals' };
const DELIVERY = { key: 'delivery' as const, label: 'Delivery' };
const REVIEW = { key: 'review' as const, label: 'Review' };
const TRANSFER = { key: 'transfer' as const, label: 'Transfer' };

const REFILL_STEPS = [
  { key: 'filling', label: 'Filling' },
  { key: 'medication', label: 'Medication' },
  { key: 'therapy', label: 'Therapy' },
  { key: 'review', label: 'Review' },
  { key: 'transfer', label: 'Transfer' },
];

// Refill collapses the granular therapy-editing steps into one "Therapy" dot.
const REFILL_KEY: Record<WizardStep, string> = {
  filling: 'filling',
  medication: 'medication',
  'base-dose': 'therapy',
  intervals: 'therapy',
  delivery: 'therapy',
  review: 'review',
  transfer: 'transfer',
};

/** Build the dot list + active key for the current flow / step / decision. */
function buildStepper(flowMode: FlowMode, step: WizardStep, decision: SetupDecision) {
  if (flowMode === 'refill') {
    return { steps: REFILL_STEPS, activeKey: REFILL_KEY[step] };
  }
  const middle =
    decision === 'intervals' ? [INTERVALS] :
    decision === 'regular' ? [DELIVERY] :
    [INTERVALS, DELIVERY];
  return { steps: [MEDICATION, BASE_DOSE, ...middle, REVIEW, TRANSFER], activeKey: step };
}

function RefillTitleIcon() {
  return (
    <div className="relative shrink-0 overflow-clip" style={{ width: 60, height: 60 }}>
      <div className="absolute flex inset-[-8.75%_-3.93%_29.79%_23.01%] items-center justify-center" style={{ containerType: 'size' }}>
        <div className="flex-none h-[hypot(36.3553cqw,-67.1953cqh)] rotate-[-153.3deg] skew-x-[-2.31deg] w-[hypot(-63.6447cqw,-32.8047cqh)]">
          <div className="relative size-full"><img alt="" src={imgRefillSyringe} className="absolute inset-0 block max-w-none size-full" /></div>
        </div>
      </div>
      <div className="absolute inset-[37.62%_52.29%_9.03%_0]"><img alt="" src={imgRefillPump} className="absolute inset-0 block max-w-none size-full" /></div>
    </div>
  );
}

function Check() {
  return (
    <svg width="20" height="20" viewBox="0 0 22 22" fill="none">
      <path d="M4 11.5L9 16L18 6" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Stepper({ activeKey, steps }: { activeKey: string; steps: { key: string; label: string }[] }) {
  const activeIdx = steps.findIndex(s => s.key === activeKey);
  // Dot centers sit at 22px and 1018px within the 1040px track (44px dots, justify-between).
  const trackStart = 22;
  const trackEnd = 1018;
  const centerAt = (i: number) => trackStart + ((trackEnd - trackStart) * i) / (steps.length - 1);
  const progressW = centerAt(activeIdx) - trackStart;

  return (
    <div className="relative w-[1040px] mx-auto h-[80px]">
      {/* Rail + completed progress */}
      <div className="absolute top-[20px] h-[2px] bg-[#b5d4e3]" style={{ left: trackStart, right: 1040 - trackEnd }} />
      <div className="absolute top-[20px] h-[2px] bg-[#0094c5]" style={{ left: trackStart, width: progressW }} />
      {/* Dots + labels */}
      <div className="absolute inset-0 flex items-start justify-between">
        {steps.map((s, i) => {
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
                className={`font-['Roboto',sans-serif] text-[28px] tracking-[0.1px] whitespace-nowrap absolute top-[52px] ${state === 'upcoming' ? 'font-normal text-[#9aa7b0]' : 'font-bold text-[#00769e]'}`}
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
  // Setup-flow override for which middle path is shown. Omit to derive it from
  // the current step + base-dose-only choice (see deriveDecision below). The
  // intervals-populated screen passes 'intervals' explicitly.
  decision?: SetupDecision;
};

/**
 * Shared chrome for the therapy wizard: purple status bar, a centered header
 * (back arrow / title / signet) and the dots stepper. The setup flow shows
 * granular steps (Medication · Base Dose · Intervals/Delivery · Review ·
 * Transfer) with the middle path collapsing once the user decides; the refill
 * flow shows Filling · Medication · Therapy · Review · Transfer. Screens supply
 * their body as children — a padded flex column filling the remaining height.
 */
export function WizardShell({ step, onBack, children, decision }: Props) {
  const { flowMode, useBaseOnly } = useTherapy();
  const isRefill = flowMode === 'refill';
  // Default decision: delivery → regular; review/transfer follow the path taken
  // (base-dose-only ⇒ regular); everything earlier previews both paths.
  const resolvedDecision: SetupDecision =
    decision ??
    (step === 'delivery' ? 'regular'
      : step === 'review' || step === 'transfer' ? (useBaseOnly ? 'regular' : 'intervals')
      : 'undecided');
  const { steps, activeKey } = buildStepper(flowMode, step, resolvedDecision);
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
            {isRefill ? <RefillTitleIcon /> : <MedicationIcon size={48} />}
            <p className="font-['Roboto',sans-serif] font-extrabold leading-[56px] text-[#00769e] text-[44px] tracking-[0.1px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
              {isRefill ? 'Refill' : 'Edit Therapy'}
            </p>
          </div>
          <div className="h-[62px] overflow-clip relative shrink-0 w-[53px]">
            <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgSignet} />
          </div>
        </div>
        <Stepper activeKey={activeKey} steps={steps} />
      </div>
      {/* Body */}
      <div className="flex-1 flex flex-col px-[80px] pt-[40px] pb-[80px] w-[1200px] min-h-0">
        {children}
      </div>
    </div>
  );
}
