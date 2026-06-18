import { useState } from 'react';
import { useNavigate } from '../navigation';
import { WizardShell } from '../components/WizardShell';
import { TherapyTotalsBand } from '../components/TherapyHeaderChart';
import { TherapyBreakdown } from '../components/TherapyBreakdown';

// Seed patient (matches the home + patient-detail screens).
const PATIENT = { name: 'Frida Kenton', dob: '01.04.1984', id: '930230393' };
const wdth = { fontVariationSettings: "'wdth' 100" } as const;

export function Review() {
  const navigate = useNavigate();
  const [confirmed, setConfirmed] = useState(false);
  const onTransfer = () => { if (confirmed) navigate('activate'); };

  return (
    <WizardShell step="review" onBack={() => navigate('windows')}>
      <div className="flex-1 flex flex-col min-h-0">
        <div className="flex flex-col gap-[24px]">
          {/* Title */}
          <p className="font-['Roboto',sans-serif] tracking-[0.1px]" style={wdth}>
            <span className="font-bold text-[#00769e] text-[36px]">Review changes for {PATIENT.name} </span>
            <span className="font-normal text-[#667380] text-[26px]">*{PATIENT.dob}, Patient Nr. {PATIENT.id}</span>
          </p>

          <TherapyBreakdown />
        </div>

        {/* Pinned totals band (full-bleed) */}
        <div className="-mx-[80px] mt-auto pt-[24px]">
          <TherapyTotalsBand />
        </div>

        {/* Confirm + Transfer */}
        <div className="flex items-center justify-between gap-[24px] pt-[24px]">
          <label className="flex items-center gap-[16px] cursor-pointer select-none">
            <span onClick={() => setConfirmed(c => !c)}
              className={`size-[40px] rounded-[6px] flex items-center justify-center border-2 ${confirmed ? 'bg-[#0094c5] border-[#0094c5]' : 'bg-white border-[#9ea8b2]'}`}>
              {confirmed && (
                <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                  <path d="M4 11.5L9 16L18 6" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </span>
            <p onClick={() => setConfirmed(c => !c)} className="font-['Roboto',sans-serif] font-normal text-[#45483c] text-[26px] tracking-[0.1px]" style={wdth}>
              I confirm that the data is correct and may be transferred.
            </p>
          </label>
          <div onClick={onTransfer}
            className={`flex items-center justify-center h-[88px] px-[64px] rounded-[80px] shrink-0 ${confirmed ? 'bg-[#0094c5] cursor-pointer' : 'bg-[#cbcbcb] cursor-not-allowed'}`}>
            <p className={`font-['Roboto',sans-serif] font-bold text-[28px] tracking-[0.1px] ${confirmed ? 'text-white' : 'text-[#a5a5a5]'}`} style={wdth}>
              Transfer
            </p>
          </div>
        </div>
      </div>
    </WizardShell>
  );
}
