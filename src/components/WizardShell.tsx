import type { ReactNode } from 'react';
import { useTherapy } from '../therapy';

const imgBack = "/icons/01195f3c-ce0c-4269-a4cc-2742bc124f77.svg";
const imgSignet = "/icons/9f250784-cad4-4195-99ce-4b9dc94364a5.svg";
// Refill icon (pump + syringe) — same as the Refill action tile that opens the flow.
const imgRefillSyringe = "/icons/act-refill-syringe-b.svg";
const imgRefillPump = "/icons/act-refill-pump-b.svg";

// Granular step a screen reports it belongs to. The setup wizard shows all of
// these as distinct dots; the refill wizard shows them as a segmented bar.
// 'intervals'/'delivery' are legacy keys kept so the now-orphaned old screens
// still render; they map onto the 'windows' step.
export type WizardStep = 'filling' | 'medication' | 'base-dose' | 'frequency' | 'windows' | 'intervals' | 'delivery' | 'review' | 'transfer';

// Retained for back-compat with screens that still pass a `decision` prop; it no
// longer changes the (now linear) stepper.
export type SetupDecision = 'undecided' | 'intervals' | 'regular';

// The redesigned Edit Therapy wizard is a single linear path:
// Base Dose · Windows · Review · Transfer. (Medication + Frequency were folded
// into Base Dose in the simplified flow.)
const SETUP_STEPS = [
  { key: 'base-dose', label: 'Default delivery' },
  { key: 'windows', label: 'Customised Delivery' },
  { key: 'review', label: 'Review' },
  { key: 'transfer', label: 'Transfer' },
];

// Refill prepends the Filling step; the rest of the path matches the edit flow.
const REFILL_BAR_STEPS = [{ key: 'filling', label: 'Filling' }, ...SETUP_STEPS];

// Legacy step keys collapse onto the closest current step so old screens don't
// highlight a missing dot.
function normalizeStep(step: WizardStep): string {
  if (step === 'medication' || step === 'frequency') return 'base-dose';
  if (step === 'intervals' || step === 'delivery') return 'windows';
  return step;
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
              className={`flex-1 min-w-px font-['Roboto',sans-serif] leading-[22px] text-[20px] tracking-[0.1px] ${state === 'upcoming' ? 'font-normal text-[#a5a5a5]' : state === 'active' ? 'font-bold text-[#00769e]' : 'font-normal text-[#00769e]'}`}
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
    <div className="flex gap-[8px] h-[48px] items-start w-full">
      {steps.map((s, i) => {
        const upcoming = i > activeIdx;
        const active = i === activeIdx;
        return (
          <div key={s.key} className="flex-1 min-w-px flex flex-col gap-[4px] h-[48px] items-start">
            <div className={`h-[8px] w-full rounded-[4px] shrink-0 ${upcoming ? 'bg-[#cbcbcb]' : 'bg-[#0094c5]'}`} />
            <p
              className={`font-['Roboto',sans-serif] leading-[34px] text-[29px] tracking-[0.1px] w-full whitespace-nowrap ${upcoming ? 'font-normal text-[#a5a5a5]' : active ? 'font-bold text-[#00769e]' : 'font-normal text-[#00769e]'}`}
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
      <BarStepper activeKey={normalizeStep(step)} steps={REFILL_BAR_STEPS} />
    </div>
  );
}

/** Setup header band: left-aligned "Add Therapy" title + chevron stepper (Figma 8409:53071). */
function SetupHeaderBand({ step, onBack }: { step: WizardStep; onBack: () => void }) {
  const activeKey = normalizeStep(step);
  const steps = SETUP_STEPS;
  return (
    <div className="w-[1200px] shrink-0 flex flex-col gap-[8px]">
      <div className="bg-[#e6f4f9] flex h-[96px] items-center justify-between px-[40px]">
        <div className="flex gap-[20px] items-center">
          <BackArrow onBack={onBack} />
          <p className="font-['Roboto',sans-serif] font-extrabold text-[#00769e] text-[40px] tracking-[0.1px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
            Edit Therapy
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
  // Optional full-bleed band rendered between the stepper and the padded body.
  banner?: ReactNode;
  // Optional region pinned below the stepper that does NOT scroll — used for the
  // 24-hour diagram so it stays visible while the body scrolls under it.
  pinnedTop?: ReactNode;
  // Optional full-bleed region pinned to the bottom of the canvas (below the
  // scrollable body) — used by the Edit Therapy steps for the "Total 24 h"
  // summary + Save CTA.
  footer?: ReactNode;
  // Optional overlay layer rendered on top of the whole canvas (e.g. a modal +
  // its backdrop). Covers the header/body/footer and is clipped to the shell.
  overlay?: ReactNode;
  // Retained for back-compat with old screens that still pass it; ignored.
  decision?: SetupDecision;
};

/**
 * Shared chrome for the therapy wizard: purple status bar, a header and a linear
 * stepper (Medication · Base Dose · Frequency · Windows · Review · Transfer).
 * The setup flow shows an "Add Therapy" title with chevron steps; the refill
 * flow shows a left-aligned "Refill" title with a segmented bar. An optional
 * `banner` is rendered full width under the stepper; screens supply the rest of
 * their body as children — a padded flex column filling the remaining height.
 */
export function WizardShell({ step, onBack, children, banner, pinnedTop, footer, overlay }: Props) {
  const { flowMode } = useTherapy();
  const isRefill = flowMode === 'refill';
  return (
    <div className="bg-white relative w-[1200px] h-[1920px] flex flex-col overflow-hidden">
      <div className="bg-[#3b2d7c] h-[35px] w-[1200px] shrink-0" />
      {isRefill
        ? <RefillHeaderBand step={step} onBack={onBack} />
        : <SetupHeaderBand step={step} onBack={onBack} />}
      {banner}
      {/* Pinned top region (e.g. the 24-hour diagram) — stays put while the body scrolls. */}
      {pinnedTop && <div className="shrink-0 w-[1200px] px-[80px] pt-[40px]">{pinnedTop}</div>}
      {/* Scrollable body */}
      <div className={`flex-1 min-h-0 overflow-y-auto flex flex-col px-[80px] pb-[40px] w-[1200px] ${pinnedTop ? 'pt-[32px]' : 'pt-[40px]'}`}>
        {children}
      </div>
      {/* Pinned footer (full-bleed) */}
      {footer && <div className="shrink-0 w-[1200px]">{footer}</div>}
      {/* Full-canvas overlay (modals) — clipped to the shell. */}
      {overlay && <div className="absolute inset-0 z-50">{overlay}</div>}
    </div>
  );
}
