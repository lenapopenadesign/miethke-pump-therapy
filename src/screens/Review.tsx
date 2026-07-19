import { useState } from 'react';
import { useNavigate } from '../navigation';
import { WizardShell } from '../components/WizardShell';
import { WizardTotalsFooter, SaveButton } from '../components/WizardParts';
import { TherapyChartCard } from '../components/TherapyBreakdown';
import { TherapyChangeReview } from '../components/TherapyChangeReview';
import { useTherapy } from '../therapy';

// Seed patient (matches the home + patient-detail screens).
const PATIENT = { name: 'Frida Kenton', dob: '01.04.1984', id: '930230393' };
const wdth = { fontVariationSettings: "'wdth' 100" } as const;
const FONT = "font-['Roboto',sans-serif]";

/** One label + value line of the Fill level alert summary. */
function AlertRow({ label, value, unit }: { label: string; value: string; unit?: string }) {
  return (
    <div className="grid grid-cols-[138px_1fr] gap-[24px] items-center">
      <p className={`${FONT} font-bold text-[#00769e] text-[24px] tracking-[0.1px]`} style={wdth}>{label}</p>
      <div className="bg-[#eef6fb] rounded-[8px] h-[60px] flex items-baseline gap-[8px] px-[24px]">
        <p className={`${FONT} font-bold text-[#00769e] text-[28px] leading-[60px] tracking-[0.1px]`} style={wdth}>{value}</p>
        {unit && <p className={`${FONT} font-normal text-[#5f8aa0] text-[22px]`} style={wdth}>{unit}</p>}
      </div>
    </div>
  );
}

/**
 * Refill-only summary of what was set on the Refill Alert step, so the clinician
 * confirms the alert threshold and due date alongside the therapy changes.
 */
function FillLevelAlertSection() {
  const { alertLevelMl, refillDate } = useTherapy();
  return (
    <div className="flex flex-col gap-[24px] pt-[32px] border-t border-[#0094c5]">
      <div className="flex gap-[16px] items-center">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
          <path d="M12 3a6 6 0 00-6 6c0 4-1.5 5.5-2 6.5h16c-.5-1-2-2.5-2-6.5a6 6 0 00-6-6z" stroke="#0094c5" strokeWidth="1.6" strokeLinejoin="round" />
          <path d="M10 19a2 2 0 004 0" stroke="#0094c5" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
        <p className={`${FONT} font-bold text-[#00769e] text-[30px] tracking-[0.1px]`} style={wdth}>Fill level alert</p>
      </div>
      <AlertRow label="Alert level" value={`${alertLevelMl}`} unit="ml" />
      <AlertRow label="Refill due by" value={refillDate} />
    </div>
  );
}

export function Review() {
  const navigate = useNavigate();
  const [confirmed, setConfirmed] = useState(false);
  const { flowMode } = useTherapy();
  const isRefill = flowMode === 'refill';

  return (
    <WizardShell
      step="review"
      onBack={() => navigate(isRefill ? 'refill-alert' : 'windows')}
      onHelp={() => navigate('help')}
      pinnedTop={
        <div className="flex flex-col gap-[24px]">
          {/* Title */}
          <p className="font-['Roboto',sans-serif] tracking-[0.1px]" style={wdth}>
            <span className="font-bold text-[#00769e] text-[36px]">Review changes for {PATIENT.name} </span>
            <span className="font-normal text-[#667380] text-[26px]">*{PATIENT.dob}, Patient Nr. {PATIENT.id}</span>
          </p>
          <TherapyChartCard />
        </div>
      }
      footer={
        <>
          <WizardTotalsFooter />
          <div className="bg-[#e6f4f9] px-[80px] pt-[24px] pb-[40px] flex flex-col gap-[24px]">
            <label className="flex items-center gap-[16px] cursor-pointer select-none">
              <span onClick={() => setConfirmed(c => !c)}
                className={`size-[40px] rounded-[6px] flex items-center justify-center border-2 shrink-0 ${confirmed ? 'bg-[#0094c5] border-[#0094c5]' : 'bg-white border-[#9ea8b2]'}`}>
                {confirmed && (
                  <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><path d="M4 11.5L9 16L18 6" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" /></svg>
                )}
              </span>
              <p onClick={() => setConfirmed(c => !c)} className="font-['Roboto',sans-serif] font-normal text-[#45483c] text-[26px] tracking-[0.1px]" style={wdth}>
                I confirm that the data is correct and is transferred to the pump.
              </p>
            </label>
            <SaveButton enabled={confirmed} label="Transfer" enabledBg="#24ab5e" onClick={() => navigate('activate')} />
          </div>
        </>
      }
    >
      {/* Scrollable before/after comparison of the committed vs. edited therapy. */}
      <div className="flex flex-col gap-[32px]">
        <TherapyChangeReview />
        {isRefill && <FillLevelAlertSection />}
      </div>
    </WizardShell>
  );
}
