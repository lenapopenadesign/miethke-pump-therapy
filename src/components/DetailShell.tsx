import type { ReactNode } from 'react';
import { useNavigate } from '../navigation';
import { useTherapy } from '../therapy';
import { BottomNav, type NavTab } from './HomeShell';
import { HelpBadge } from './WizardParts';

const imgBack = "/icons/01195f3c-ce0c-4269-a4cc-2742bc124f77.svg";
const imgSignet = "/icons/9f250784-cad4-4195-99ce-4b9dc94364a5.svg";

type Props = {
  icon: ReactNode;
  title: string;
  headerRight?: ReactNode;
  // When set, a "?" help badge sits next to the header title (opens the Help page).
  onHelp?: () => void;
  children: ReactNode;
  /** Region pinned below the header that does NOT scroll (e.g. the 24-hour diagram). */
  pinnedTop?: ReactNode;
  /** Full-bleed pinned footer rendered above the bottom navigation. */
  footer?: ReactNode;
  /** Which bottom-navigation tab this screen belongs to. */
  navTab?: NavTab;
  /**
   * Layer drawn over the whole screen — header, body, navigation and all — and
   * clipped to it. Used for modal sheets and their scrim.
   */
  overlay?: ReactNode;
};

/**
 * Chrome for the home "detail" screens (Patient, Implant) reached by tapping a
 * card on the overview: purple status bar, a left-aligned header with back
 * arrow / icon / title (+ optional right-hand status) / signet, a scrollable
 * body and the shared bottom navigation. Back returns to the home screen that
 * matches the current therapy state (active vs. no-therapy).
 */
export function DetailShell({ icon, title, headerRight, onHelp, children, pinnedTop, footer, navTab, overlay }: Props) {
  const navigate = useNavigate();
  const { homeScreen } = useTherapy();
  return (
    <div className="bg-white relative w-[1200px] h-[1920px] flex flex-col overflow-hidden">
      <div className="bg-[#3b2d7c] h-[35px] w-[1200px] shrink-0" />
      {/* Header band */}
      <div className="w-[1200px] bg-[#e6f4f9] flex h-[140px] items-center justify-between px-[40px] shrink-0">
        <div className="flex flex-1 min-w-px items-center gap-[24px]">
          <div onClick={() => navigate(homeScreen)} className="flex items-center justify-center shrink-0 cursor-pointer w-[56px]">
            <div className="rotate-180 overflow-clip relative size-[56px]">
              <div className="absolute inset-[20%_0.03%_17.61%_0]">
                <img alt="Back" className="absolute block inset-0 max-w-none size-full" src={imgBack} />
              </div>
            </div>
          </div>
          {icon}
          <p className="font-['Roboto',sans-serif] font-extrabold leading-[56px] text-[#00769e] text-[44px] tracking-[0.1px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
            {title}
          </p>
          {onHelp && <HelpBadge onClick={onHelp} />}
        </div>
        <div className="flex items-center gap-[24px] shrink-0">
          {headerRight}
          <div className="h-[62px] overflow-clip relative shrink-0 w-[53px]">
            <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgSignet} />
          </div>
        </div>
      </div>
      {/* Pinned top region (e.g. the 24-hour diagram) — stays put while the body scrolls. */}
      {pinnedTop && <div className="shrink-0 w-[1200px] px-[80px] pt-[56px]">{pinnedTop}</div>}
      {/* Body — flex column so screens can pin their action area to the bottom (mt-auto). */}
      <div className={`flex-1 min-h-0 w-[1200px] flex flex-col overflow-y-auto px-[80px] pb-[40px] ${pinnedTop ? 'pt-[24px]' : 'pt-[56px]'}`}>
        {children}
      </div>
      {/* Optional full-bleed footer, pinned above the bottom navigation. */}
      {footer && <div className="shrink-0 w-[1200px]">{footer}</div>}
      {/* Spacer reserving room for the absolutely-positioned BottomNav. */}
      <div className="h-[120px] shrink-0" />
      <BottomNav active={navTab} />
      {/* Full-canvas overlay (modal sheets) — clipped to the shell. */}
      {overlay && <div className="absolute inset-0 z-50">{overlay}</div>}
    </div>
  );
}

/** Small green "Connected ✓" status used in the Implant header. */
export function ConnectedStatus() {
  return (
    <div className="flex items-center gap-[16px]">
      <p className="font-['Roboto',sans-serif] font-normal leading-[32px] text-[#24ab5e] text-[24px] tracking-[0.1px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
        Connected
      </p>
      <div className="size-[36px] rounded-full bg-[#24ab5e] flex items-center justify-center shrink-0">
        <svg width="20" height="20" viewBox="0 0 22 22" fill="none">
          <path d="M4 11.5L9 16L18 6" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </div>
  );
}
