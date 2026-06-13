import type { ReactNode } from 'react';
import { useTherapy } from '../therapy';

const imgBack = "/icons/01195f3c-ce0c-4269-a4cc-2742bc124f77.svg";
const imgSignet = "/icons/9f250784-cad4-4195-99ce-4b9dc94364a5.svg";
// Refill icon (pump + syringe) — same as the Refill action tile that opens the flow.
const imgRefillSyringe = "/icons/act-refill-syringe-b.svg";
const imgRefillPump = "/icons/act-refill-pump-b.svg";

// Granular step a screen reports it belongs to. The setup wizard shows all of
// these as distinct dots; the refill wizard shows them as a segmented bar.
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

// Refill shows the full granular path as a segmented bar (Figma 8146:52117).
const REFILL_BAR_STEPS = [
  { key: 'filling', label: 'Filling' },
  { key: 'medication', label: 'Medication' },
  { key: 'base-dose', label: 'Base Dose' },
  { key: 'intervals', label: 'Intervals' },
  { key: 'delivery', label: 'Delivery' },
  { key: 'review', label: 'Review' },
  { key: 'transfer', label: 'Transfer' },
];

/** Build the setup-flow dot list + active key for the current step / decision. */
function buildSetupStepper(step: WizardStep, decision: SetupDecision) {
  const middle =
    decision === 'intervals' ? [INTERVALS] :
    decision === 'regular' ? [DELIVERY] :
    [INTERVALS, DELIVERY];
  return { steps: [MEDICATION, BASE_DOSE, ...middle, REVIEW, TRANSFER], activeKey: step };
}

function RefillTitleIcon({ size = 64 }: { size?: number }) {
  return (
    <div className="relative shrink-0 overflow-clip" style={{ width: size, height: size }}>
      <div className="absolute flex inset-[-8.75%_-3.93%_29.79%_23.01%] items-center justify-center" style={{ containerType: 'size' }}>
        <div className="flex-none h-[hypot(36.3553cqw,-67.1953cqh)] rotate-[-153.3deg] skew-x-[-2.31deg] w-[hypot(-63.6447cqw,-32.8047cqh)]">
          <div className="relative size-full"><img alt="" src={imgRefillSyringe} className="absolute inset-0 block max-w-none size-full" /></div>
        </div>
      </div>
      <div className="absolute inset-[37.62%_52.29%_9.03%_0]"><img alt="" src={imgRefillPump} className="absolute inset-0 block max-w-none size-full" /></div>
    </div>
  );
}

function BackArrow({ onBack }: { onBack: () => void }) {
  return (
    <div onClick={onBack} className="flex items-center justify-center shrink-0 cursor-pointer w-[56px]">
      <div className="rotate-180 overflow-clip relative size-[56px]">
        <div className="absolute inset-[20%_0.03%_17.61%_0]">
          <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgBack} />
        </div>
      </div>
    </div>
  );
}

function Signet() {
  return (
    <div className="h-[62px] overflow-clip relative shrink-0 w-[53px]">
      <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgSignet} />
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

/**
 * Setup-flow stepper: a chevron / breadcrumb row (Figma 8409:53071). Each step is
 * a right-pointing arrow segment with a radio circle + label. Done & active steps
 * use the light-blue fill; upcoming steps are grey. The arrow notch is carved with
 * clip-path so the parent white background shows through as the separator.
 */
const CHEV = 18; // px depth of the arrow point / left notch
const CHEV_GAP = 8; // px white separator left between interlocking arrows
function ChevronStepper({ activeKey, steps }: { activeKey: string; steps: { key: string; label: string }[] }) {
  const activeIdx = steps.findIndex(s => s.key === activeKey);
  return (
    <div className="flex h-[76px] w-[1200px]">
      {steps.map((s, i) => {
        const first = i === 0;
        const last = i === steps.length - 1;
        const state = i < activeIdx ? 'done' : i === activeIdx ? 'active' : 'upcoming';
        const clip = first
          ? `polygon(0 0, calc(100% - ${CHEV}px) 0, 100% 50%, calc(100% - ${CHEV}px) 100%, 0 100%)`
          : last
            ? `polygon(0 0, 100% 0, 100% 100%, 0 100%, ${CHEV}px 50%)`
            : `polygon(0 0, calc(100% - ${CHEV}px) 0, 100% 50%, calc(100% - ${CHEV}px) 100%, 0 100%, ${CHEV}px 50%)`;
        return (
          <div
            key={s.key}
            className="flex-1 min-w-px h-[76px] flex items-center gap-[8px] pr-[6px]"
            // Overlap each arrow's point into the next one's notch, leaving only a
            // thin CHEV_GAP separator (so the arrows read as a tight breadcrumb).
            style={{ background: state === 'upcoming' ? '#f0f0f0' : '#d1eaf8', clipPath: clip, paddingLeft: first ? 28 : 12 + CHEV, marginLeft: first ? 0 : -(CHEV - CHEV_GAP) }}
          >
            {state === 'done' ? (
              <div className="size-[40px] rounded-full bg-[#0094c5] flex items-center justify-center shrink-0"><Check /></div>
            ) : state === 'active' ? (
              <div className="size-[40px] rounded-full border-[3px] border-[#0094c5] bg-white flex items-center justify-center shrink-0">
                <div className="size-[18px] rounded-full bg-[#0094c5]" />
              </div>
            ) : (
              <div className="size-[40px] rounded-full border-2 border-[#cdd5da] bg-white shrink-0" />
            )}
            <p
              className={`flex-1 min-w-px truncate font-['Roboto',sans-serif] leading-[26px] text-[20px] tracking-[0.1px] ${state === 'upcoming' ? 'font-normal text-[#a5a5a5]' : state === 'active' ? 'font-bold text-[#00769e]' : 'font-normal text-[#00769e]'}`}
              style={{ fontVariationSettings: "'wdth' 100" }}
            >
              {s.label}
            </p>
          </div>
        );
      })}
    </div>
  );
}

/** Refill-flow stepper: equal-width segmented bars with labels below (Figma 8146:52117). */
function BarStepper({ activeKey, steps }: { activeKey: string; steps: { key: string; label: string }[] }) {
  const activeIdx = steps.findIndex(s => s.key === activeKey);
  return (
    <div className="flex gap-[8px] h-[40px] items-start w-full">
      {steps.map((s, i) => {
        const upcoming = i > activeIdx;
        const active = i === activeIdx;
        return (
          <div key={s.key} className="flex-1 min-w-px flex flex-col gap-[4px] h-[40px] items-start">
            <div className={`h-[8px] w-full rounded-[4px] shrink-0 ${upcoming ? 'bg-[#cbcbcb]' : 'bg-[#0094c5]'}`} />
            <p
              className={`font-['Roboto',sans-serif] leading-[24px] text-[20px] tracking-[0.1px] w-full ${upcoming ? 'font-normal text-[#a5a5a5]' : active ? 'font-bold text-[#00769e]' : 'font-normal text-[#00769e]'}`}
              style={{ fontVariationSettings: "'wdth' 100" }}
            >
              {s.label}
            </p>
          </div>
        );
      })}
    </div>
  );
}

/** Refill header band: left-aligned title group + segmented-bar stepper. */
function RefillHeaderBand({ step, onBack }: { step: WizardStep; onBack: () => void }) {
  return (
    <div className="bg-[#e6f4f9] w-[1200px] shrink-0 flex flex-col gap-[40px] pt-[24px] pb-[16px] px-[40px]">
      <div className="flex items-center justify-between w-[1120px]">
        <div className="flex gap-[16px] h-[64px] items-center">
          <BackArrow onBack={onBack} />
          <div className="flex gap-[16px] items-center">
            <RefillTitleIcon size={64} />
            <p className="font-['Roboto',sans-serif] font-extrabold leading-[56px] text-[#00769e] text-[48px] tracking-[0.1px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
              Refill
            </p>
          </div>
        </div>
        <Signet />
      </div>
      <BarStepper activeKey={step} steps={REFILL_BAR_STEPS} />
    </div>
  );
}

/** Setup header band: left-aligned "Add Therapy" title + chevron stepper (Figma 8409:53071). */
function SetupHeaderBand({ step, onBack, decision, useBaseOnly }: { step: WizardStep; onBack: () => void; decision?: SetupDecision; useBaseOnly: boolean }) {
  // Default decision: delivery → regular; review/transfer follow the path taken
  // (base-dose-only ⇒ regular); everything earlier previews both paths.
  const resolvedDecision: SetupDecision =
    decision ??
    (step === 'delivery' ? 'regular'
      : step === 'review' || step === 'transfer' ? (useBaseOnly ? 'regular' : 'intervals')
      : 'undecided');
  const { steps, activeKey } = buildSetupStepper(step, resolvedDecision);
  return (
    <div className="w-[1200px] shrink-0 flex flex-col gap-[8px]">
      <div className="bg-[#e6f4f9] flex h-[96px] items-center justify-between px-[40px]">
        <div className="flex gap-[20px] items-center">
          <BackArrow onBack={onBack} />
          <p className="font-['Roboto',sans-serif] font-extrabold text-[#00769e] text-[40px] tracking-[0.1px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
            Add Therapy
          </p>
        </div>
        <Signet />
      </div>
      <ChevronStepper activeKey={activeKey} steps={steps} />
    </div>
  );
}

type Props = {
  step: WizardStep;
  onBack: () => void;
  children: ReactNode;
  // Setup-flow override for which middle path is shown. Omit to derive it from
  // the current step + base-dose-only choice. The intervals-populated screen
  // passes 'intervals' explicitly.
  decision?: SetupDecision;
};

/**
 * Shared chrome for the therapy wizard: purple status bar, a header and a
 * stepper. The setup flow shows a centered "Add Therapy" title with granular
 * dots (Medication · Base Dose · Intervals/Delivery · Review · Transfer); the
 * refill flow shows a left-aligned "Refill" title with a segmented-bar stepper
 * (Filling · Medication · Base Dose · Intervals · Delivery · Review · Transfer).
 * Screens supply their body as children — a padded flex column filling the
 * remaining height.
 */
export function WizardShell({ step, onBack, children, decision }: Props) {
  const { flowMode, useBaseOnly } = useTherapy();
  const isRefill = flowMode === 'refill';
  return (
    <div className="bg-white relative w-[1200px] h-[1920px] flex flex-col overflow-hidden">
      <div className="bg-[#3b2d7c] h-[35px] w-[1200px] shrink-0" />
      {isRefill
        ? <RefillHeaderBand step={step} onBack={onBack} />
        : <SetupHeaderBand step={step} onBack={onBack} decision={decision} useBaseOnly={useBaseOnly} />}
      {/* Body */}
      <div className="flex-1 flex flex-col px-[80px] pt-[40px] pb-[80px] w-[1200px] min-h-0">
        {children}
      </div>
    </div>
  );
}
