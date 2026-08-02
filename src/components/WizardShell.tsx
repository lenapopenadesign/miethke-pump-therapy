import type { ReactNode } from 'react';
import { useTherapy } from '../therapy';
import { useNavigate, type ScreenId } from '../navigation';
import { HelpBadge } from './WizardParts';

const imgBack = "/icons/01195f3c-ce0c-4269-a4cc-2742bc124f77.svg";
const imgSignet = "/icons/9f250784-cad4-4195-99ce-4b9dc94364a5.svg";
// Refill icon (pump + syringe) — same as the Refill action tile that opens the flow.
const imgRefillSyringe = "/icons/act-refill-syringe-b.svg";
const imgRefillPump = "/icons/act-refill-pump-b.svg";

// Granular step a screen reports it belongs to. The setup wizard shows all of
// these as distinct dots; the refill wizard shows them as a segmented bar.
// 'intervals'/'delivery' are legacy keys kept so the now-orphaned old screens
// still render; they map onto the 'windows' step.
export type WizardStep = 'filling' | 'medication' | 'base-dose' | 'frequency' | 'windows' | 'intervals' | 'delivery' | 'refill-alert' | 'refill-date' | 'review' | 'transfer';

// Retained for back-compat with screens that still pass a `decision` prop; it no
// longer changes the (now linear) stepper.
export type SetupDecision = 'undecided' | 'intervals' | 'regular';

// The redesigned Edit Therapy wizard is a single linear path:
// Base Dose · Windows · Review · Transfer. (Medication + Frequency were folded
// into Base Dose in the simplified flow.)
const SETUP_STEPS = [
  { key: 'base-dose', label: 'Default Delivery' },
  { key: 'windows', label: 'Customised Delivery' },
  { key: 'review', label: 'Review' },
  { key: 'transfer', label: 'Transfer' },
];

// Refill flow: Filling + a distinct Medication step, then the delivery steps and
// Transfer (Figma refill variant 9466:48180). Rendered with the chevron stepper.
// Seven steps across 1200px leaves each label very little room, so the two-word
// ones are broken over two lines and `basis` hands each segment only the width
// its longest line needs. That buys back the space "Medication" — one long word
// that cannot break — was being clipped for.
const REFILL_STEPS = [
  { key: 'filling', label: 'Filling', basis: 62 },
  { key: 'medication', label: 'Medication', basis: 100 },
  { key: 'base-dose', label: 'Default\nDelivery', basis: 74 },
  { key: 'windows', label: 'Custom\nDelivery', basis: 74 },
  { key: 'refill-alert', label: 'Refill\nAlert', basis: 58 },
  { key: 'refill-date', label: 'Refill\nDate', basis: 58 },
  { key: 'transfer', label: 'Transfer', basis: 74 },
];

// Screen each stepper segment jumps to when clicked. Only steps already
// completed are clickable (see ChevronStepper), so these are always safe to
// re-enter — 'transfer' is the last step and therefore never "done".
const SETUP_STEP_SCREEN: Record<string, ScreenId> = {
  'base-dose': 'base-dose',
  windows: 'windows',
  review: 'review',
  transfer: 'activate',
};

// In a refill the Medication step is entered through the "same therapy?" gate,
// so that — not the medication form — is where clicking it returns you.
const REFILL_STEP_SCREEN: Record<string, ScreenId> = {
  filling: 'refill-filling',
  medication: 'refill-same-therapy',
  'base-dose': 'base-dose',
  windows: 'windows',
  'refill-alert': 'refill-alert',
  'refill-date': 'refill-date',
  transfer: 'activate',
};

// Legacy step keys collapse onto the closest current step so old screens don't
// highlight a missing dot. The edit flow folds Medication into Base Dose.
function normalizeStep(step: WizardStep): string {
  if (step === 'medication' || step === 'frequency') return 'base-dose';
  if (step === 'intervals' || step === 'delivery') return 'windows';
  // The refill-only alert/date steps have no dot in the setup stepper.
  if (step === 'refill-alert' || step === 'refill-date') return 'review';
  return step;
}

// Refill keeps Medication as its own step; Review (no dot in the refill stepper)
// falls back to the Refill Date step it follows.
function normalizeRefillStep(step: WizardStep): string {
  if (step === 'frequency') return 'base-dose';
  if (step === 'intervals' || step === 'delivery') return 'windows';
  if (step === 'review') return 'refill-date';
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
// Everything in a segment other than its label: notch padding, gap, radio, tail.
const SEG_CHROME = 84;
function ChevronStepper({ activeKey, steps, onPick }: { activeKey: string; steps: { key: string; label: string; basis?: number }[]; onPick: (key: string) => void }) {
  const activeIdx = steps.findIndex(s => s.key === activeKey);
  return (
    <div className="flex h-[76px] w-[1200px]">
      {steps.map((s, i) => {
        const first = i === 0;
        const last = i === steps.length - 1;
        const state = i < activeIdx ? 'done' : i === activeIdx ? 'active' : 'upcoming';
        // Completed steps are re-entrant; the current and upcoming ones aren't
        // (jumping ahead would skip the input the later steps depend on).
        const clickable = state === 'done';
        const clip = first
          ? `polygon(0 0, calc(100% - ${CHEV}px) 0, 100% 50%, calc(100% - ${CHEV}px) 100%, 0 100%)`
          : last
            ? `polygon(0 0, 100% 0, 100% 100%, 0 100%, ${CHEV}px 50%)`
            : `polygon(0 0, calc(100% - ${CHEV}px) 0, 100% 50%, calc(100% - ${CHEV}px) 100%, 0 100%, ${CHEV}px 50%)`;
        return (
          <div
            key={s.key}
            onClick={clickable ? () => onPick(s.key) : undefined}
            className={`min-w-px h-[76px] flex items-center gap-[8px] pr-[6px] ${clickable ? 'cursor-pointer' : ''}`}
            // Overlap each arrow's point into the next one's notch, leaving only a
            // thin CHEV_GAP separator (so the arrows read as a tight breadcrumb).
            // Steps without a `basis` just share the row equally, as before.
            style={{
              flex: s.basis != null ? `1 1 ${s.basis + SEG_CHROME}px` : '1 1 0%',
              background: state === 'upcoming' ? '#f0f0f0' : '#d1eaf8',
              clipPath: clip,
              paddingLeft: first ? 28 : 12 + CHEV,
              marginLeft: first ? 0 : -(CHEV - CHEV_GAP),
            }}
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
              className={`flex-1 min-w-px whitespace-pre-line font-['Roboto',sans-serif] leading-[22px] text-[20px] tracking-[0.1px] ${state === 'upcoming' ? 'font-normal text-[#a5a5a5]' : state === 'active' ? 'font-bold text-[#00769e]' : 'font-normal text-[#00769e]'}`}
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

/** Refill header band: "Refill" title group + chevron stepper (Figma 9466:48180). */
function RefillHeaderBand({ step, onBack, onHelp }: { step: WizardStep; onBack: () => void; onHelp?: () => void }) {
  const navigate = useNavigate();
  return (
    <div className="w-[1200px] shrink-0 flex flex-col gap-[8px]">
      <div className="bg-[#e6f4f9] flex h-[96px] items-center justify-between px-[40px]">
        <div className="flex gap-[16px] items-center">
          <BackArrow onBack={onBack} />
          <RefillTitleIcon size={64} />
          <p className="font-['Roboto',sans-serif] font-extrabold text-[#00769e] text-[40px] tracking-[0.1px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
            Refill
          </p>
          {onHelp && <HelpBadge onClick={onHelp} />}
        </div>
        <Signet />
      </div>
      <ChevronStepper
        activeKey={normalizeRefillStep(step)}
        steps={REFILL_STEPS}
        onPick={key => navigate(REFILL_STEP_SCREEN[key])}
      />
    </div>
  );
}

/** Setup header band: left-aligned "Add Therapy" title + chevron stepper (Figma 8409:53071). */
function SetupHeaderBand({ step, onBack, onHelp }: { step: WizardStep; onBack: () => void; onHelp?: () => void }) {
  const navigate = useNavigate();
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
          {onHelp && <HelpBadge onClick={onHelp} />}
        </div>
        <Signet />
      </div>
      <ChevronStepper
        activeKey={activeKey}
        steps={steps}
        onPick={key => navigate(SETUP_STEP_SCREEN[key])}
      />
    </div>
  );
}

type Props = {
  step: WizardStep;
  onBack: () => void;
  // When set, a "?" help badge sits next to the header title (opens the Help page).
  onHelp?: () => void;
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
export function WizardShell({ step, onBack, onHelp, children, banner, pinnedTop, footer, overlay }: Props) {
  const { flowMode } = useTherapy();
  const isRefill = flowMode === 'refill';
  return (
    <div className="bg-white relative w-[1200px] h-[1920px] flex flex-col overflow-hidden">
      <div className="bg-[#3b2d7c] h-[35px] w-[1200px] shrink-0" />
      {isRefill
        ? <RefillHeaderBand step={step} onBack={onBack} onHelp={onHelp} />
        : <SetupHeaderBand step={step} onBack={onBack} onHelp={onHelp} />}
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
