import type { ReactNode } from 'react';
import { useNavigate } from '../navigation';
import { BottomNav } from './HomeShell';

const imgBack = "/icons/01195f3c-ce0c-4269-a4cc-2742bc124f77.svg";
const imgSignet = "/icons/9f250784-cad4-4195-99ce-4b9dc94364a5.svg";

type Props = {
  icon: ReactNode;
  title: string;
  headerRight?: ReactNode;
  children: ReactNode;
};

/**
 * Chrome for the home "detail" screens (Patient, Implant) reached by tapping a
 * card on the overview: purple status bar, a left-aligned header with back
 * arrow / icon / title (+ optional right-hand status) / signet, a scrollable
 * body and the shared bottom navigation. Back always returns to the active home.
 */
export function DetailShell({ icon, title, headerRight, children }: Props) {
  const navigate = useNavigate();
  return (
    <div className="bg-white relative w-[1200px] h-[1920px] overflow-hidden">
      <div className="absolute bg-[#3b2d7c] h-[35px] left-0 top-0 w-[1200px]" />
      {/* Header band */}
      <div className="absolute left-0 top-[35px] w-[1200px] bg-[#e6f4f9] flex h-[140px] items-center justify-between px-[40px]">
        <div className="flex flex-1 min-w-px items-center gap-[24px]">
          <div onClick={() => navigate('home-active')} className="flex items-center justify-center shrink-0 cursor-pointer w-[56px]">
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
        </div>
        <div className="flex items-center gap-[24px] shrink-0">
          {headerRight}
          <div className="h-[62px] overflow-clip relative shrink-0 w-[53px]">
            <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgSignet} />
          </div>
        </div>
      </div>
      {/* Body — flex column so screens can pin their action area to the bottom (mt-auto). */}
      <div className="absolute left-0 top-[175px] bottom-[120px] w-[1200px] flex flex-col overflow-y-auto px-[80px] pt-[56px] pb-[40px]">
        {children}
      </div>
      <BottomNav />
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
