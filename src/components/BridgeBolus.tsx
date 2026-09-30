import { useEffect, useState } from 'react';
import { useTherapy } from '../therapy';
import { InfoBadge } from './WizardParts';

const wdth = { fontVariationSettings: "'wdth' 100" } as const;
const FONT = "font-['Roboto',sans-serif]";

export const BRIDGE_BOLUS_INFO =
  'A bridge bolus is used during a medication change in a drug Implant. It continues delivering the old medication at the old dosage until the new medication has reached the tip of the catheter. Only then is the switch to the new medication and dosage made.';

/** Syringe + drop glyph (Figma icons/bolus 2377:12288). */
export function BridgeBolusIcon({ size = 56 }: { size?: number }) {
  return <img src="/icons/bridge-bolus.svg" alt="" className="shrink-0 block" style={{ width: size, height: size * 0.975 }} />;
}

/** The info panel opened from the `i` beside "Bridge Bolus" (Figma 11103:191450). */
export function BridgeBolusExplainer() {
  return (
    <div className="bg-[#f5fcf9] rounded-[24px] flex gap-[24px] items-center px-[32px] py-[28px]">
      <InfoBadge />
      <p className={`${FONT} font-normal text-[#096657] text-[24px] leading-[34px] tracking-[0.1px]`} style={wdth}>
        {BRIDGE_BOLUS_INFO}
      </p>
    </div>
  );
}

/** Remaining bridge-bolus time, ticking once a minute; null when none is running. */
export function useBridgeBolusRemaining(): { hours: number; minutes: number } | null {
  const { bridgeBolusUntil } = useTherapy();
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    if (bridgeBolusUntil == null) return;
    const t = setInterval(() => setNow(Date.now()), 15_000);
    return () => clearInterval(t);
  }, [bridgeBolusUntil]);
  if (bridgeBolusUntil == null) return null;
  const left = Math.ceil((bridgeBolusUntil - now) / 60_000);
  if (left <= 0) return null;
  return { hours: Math.floor(left / 60), minutes: left % 60 };
}

/**
 * "Bridge bolus in place" card with the time left (Figma refill_different-
 * medication + mainscreen 11178:243605). Renders nothing once the bolus is over.
 */
export function BridgeBolusStatus({ className = '', surface = '#f5fcf9' }: { className?: string; surface?: string }) {
  const remaining = useBridgeBolusRemaining();
  const [info, setInfo] = useState(false);
  if (!remaining) return null;
  const unit = (value: string, label: string) => (
    <div className="flex flex-col items-center w-[96px]">
      <span className={`${FONT} font-bold text-[#096657] text-[44px] leading-[52px]`} style={wdth}>{value}</span>
      <span className={`${FONT} font-normal text-[#096657] text-[22px] leading-[28px]`} style={wdth}>{label}</span>
    </div>
  );
  return (
    <div className={`flex flex-col gap-[16px] ${className}`}>
      <div className="rounded-[24px] flex items-center gap-[24px] px-[40px] py-[20px]" style={{ background: surface }}>
        <BridgeBolusIcon />
        <p className={`${FONT} font-bold text-[#096657] text-[36px] leading-[40px] tracking-[0.1px] whitespace-nowrap`} style={wdth}>
          Bridge bolus in place
        </p>
        {/* Own the click: on home this card sits inside the clickable Therapy card. */}
        <span onClick={e => { e.stopPropagation(); setInfo(v => !v); }} className="cursor-pointer"><InfoBadge /></span>
        <div className="ml-auto flex gap-[8px]">
          {unit(String(remaining.hours), 'Hours')}
          {unit(String(remaining.minutes).padStart(2, '0'), 'Minutes')}
        </div>
      </div>
      {info && <div onClick={e => e.stopPropagation()}><BridgeBolusExplainer /></div>}
    </div>
  );
}
