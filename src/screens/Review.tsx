import { useState } from 'react';
import { useNavigate } from '../navigation';
import { WizardShell } from '../components/WizardShell';
import { WizardTotalsFooter, SaveButton, CalendarIcon } from '../components/WizardParts';
import { TherapyChartCard } from '../components/TherapyBreakdown';
import { TherapyChangeReview } from '../components/TherapyChangeReview';
import { useTherapy, BRIDGE_BOLUS, fmtTime } from '../therapy';
import { BridgeBolusIcon, BridgeBolusExplainer } from '../components/BridgeBolus';
import { InfoBadge } from '../components/WizardParts';

// Seed patient (matches the home + patient-detail screens).
const PATIENT = { name: 'Frida Kenton', dob: '01 Apr 1984', id: '930230393' };
const wdth = { fontVariationSettings: "'wdth' 100" } as const;
const FONT = "font-['Roboto',sans-serif]";

/** One label + value line of a refill summary section (Figma 5194:58141). */
function SummaryRow({ label, value, unit }: { label: string; value: string; unit?: string }) {
  return (
    <div className="grid grid-cols-[213px_1fr] gap-[16px] items-center">
      <p className={`${FONT} font-bold text-[#096657] text-[24px] tracking-[0.1px]`} style={wdth}>{label}</p>
      <div className="bg-[#f5fcf9] rounded-[8px] h-[60px] flex items-baseline gap-[8px] px-[24px]">
        <p className={`${FONT} font-extrabold text-[#096657] text-[32px] leading-[60px] tracking-[0.1px]`} style={wdth}>{value}</p>
        {unit && <p className={`${FONT} font-normal text-[#596d68] text-[22px]`} style={wdth}>{unit}</p>}
      </div>
    </div>
  );
}

/**
 * Refill with a medication change: the bridge bolus the transfer will start
 * (Figma refill_07 11123:236567), with its "what is this?" panel.
 */
function BridgeBolusSection() {
  const [info, setInfo] = useState(false);
  return (
    <div className="flex flex-col gap-[24px] pt-[32px] border-t border-[#0b786a]">
      <div className="flex gap-[16px] items-center">
        <BridgeBolusIcon size={48} />
        <p className={`${FONT} font-bold text-[#096657] text-[32px] leading-[48px] tracking-[0.1px]`} style={wdth}>Bridge Bolus</p>
        <InfoBadge onClick={() => setInfo(v => !v)} />
      </div>
      {info && <BridgeBolusExplainer />}
      <SummaryRow label="Total volume" value={BRIDGE_BOLUS.volumeMl.toFixed(2)} unit="ml" />
      <SummaryRow label="Time" value={fmtTime(BRIDGE_BOLUS.minutes)} unit="h" />
    </div>
  );
}

/**
 * Summary of the Refill Date step (Figma 9718:48194), so the day the
 * patient is being booked in for is confirmed alongside the therapy changes.
 * Only the date: the alert level behind it is a threshold the step leaves alone
 * unless asked, and the projected alarm date is a consequence of the two rather
 * than a third thing to sign off.
 */
function RefillDateSection() {
  const { refillDate } = useTherapy();
  return (
    <div className="flex flex-col gap-[24px] pt-[32px] border-t border-[#0b786a]">
      <div className="flex gap-[16px] items-center">
        <CalendarIcon size={40} />
        <p className={`${FONT} font-bold text-[#096657] text-[32px] leading-[48px] tracking-[0.1px]`} style={wdth}>Refill date</p>
      </div>
      <SummaryRow label="Scheduled for" value={refillDate} />
    </div>
  );
}

export function Review() {
  const navigate = useNavigate();
  const [confirmed, setConfirmed] = useState(false);
  const { flowMode, refillBranch } = useTherapy();
  const isRefill = flowMode === 'refill';
  // Same-medication refill re-confirms the therapy; anything else is a change.
  const title = isRefill && refillBranch === 'same' ? 'Review for' : 'Review changes for';

  return (
    <WizardShell
      step="review"
      // A refill-date adjustment (from Notifications) has no therapy branch.
      onBack={() => navigate(isRefill && refillBranch == null ? 'refill-date' : 'windows')}
      onHelp={() => navigate('help')}
      pinnedTop={
        <div className="flex flex-col gap-[24px]">
          {/* Title */}
          <p className="font-['Roboto',sans-serif] tracking-[0.1px]" style={wdth}>
            <span className="font-bold text-[#096657] text-[36px]">{title} {PATIENT.name} </span>
            <span className="font-normal text-[#596d68] text-[26px]">*{PATIENT.dob}, Patient Nr. {PATIENT.id}</span>
          </p>
          <TherapyChartCard />
        </div>
      }
      footer={
        <>
          <WizardTotalsFooter />
          <div className="bg-[#f5fcf9] px-[80px] pt-[24px] pb-[40px] flex flex-col gap-[24px]">
            <label className="flex items-center gap-[16px] cursor-pointer select-none">
              <span onClick={() => setConfirmed(c => !c)}
                className={`size-[40px] rounded-[6px] flex items-center justify-center border-2 shrink-0 ${confirmed ? 'bg-[#0b786a] border-[#0b786a]' : 'bg-white border-[#9db3ad]'}`}>
                {confirmed && (
                  <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><path d="M4 11.5L9 16L18 6" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" /></svg>
                )}
              </span>
              <p onClick={() => setConfirmed(c => !c)} className="font-['Roboto',sans-serif] font-normal text-[#183d38] text-[26px] tracking-[0.1px]" style={wdth}>
                I confirm that the data is correct and is transferred to the pump.
              </p>
            </label>
            <SaveButton enabled={confirmed} label="Transfer" enabledBg="#23ab5e" onClick={() => navigate('activate')} />
          </div>
        </>
      }
    >
      {/* Scrollable before/after comparison of the committed vs. edited therapy. */}
      <div className="flex flex-col gap-[32px]">
        <TherapyChangeReview />
        {isRefill && refillBranch === 'different' && <BridgeBolusSection />}
        {isRefill && refillBranch == null && <RefillDateSection />}
      </div>
    </WizardShell>
  );
}
