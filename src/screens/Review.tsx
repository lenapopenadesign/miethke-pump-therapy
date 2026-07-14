import { useState } from 'react';
import { useNavigate } from '../navigation';
import { WizardShell } from '../components/WizardShell';
import { WizardTotalsFooter, SaveButton } from '../components/WizardParts';
import { TherapyChartCard } from '../components/TherapyBreakdown';
import { TherapyChangeReview } from '../components/TherapyChangeReview';

// Seed patient (matches the home + patient-detail screens).
const PATIENT = { name: 'Frida Kenton', dob: '01.04.1984', id: '930230393' };
const wdth = { fontVariationSettings: "'wdth' 100" } as const;

export function Review() {
  const navigate = useNavigate();
  const [confirmed, setConfirmed] = useState(false);

  return (
    <WizardShell
      step="review"
      onBack={() => navigate('windows')}
      pinnedTop={
        <div className="flex flex-col gap-[24px]">
          {/* Title */}
          <p className="font-['Roboto',sans-serif] tracking-[0.1px]" style={wdth}>
            <span className="font-bold text-[#00769e] text-[36px]">Review changes for {PATIENT.name} </span>
            <span className="font-normal text-[#667380] text-[26px]">*{PATIENT.dob}, Patient Nr. {PATIENT.id}</span>
          </p>
          <TherapyChartCard onHelp={() => navigate('help')} />
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
      <TherapyChangeReview />
    </WizardShell>
  );
}
