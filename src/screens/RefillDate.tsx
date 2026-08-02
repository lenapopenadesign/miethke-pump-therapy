import { useState } from 'react';
import { useNavigate } from '../navigation';
import { useTherapy, RESERVOIR_ML, REFILL_MIN_LEAD_DAYS } from '../therapy';
import { WizardShell } from '../components/WizardShell';
import { WizardTotalsFooter, SaveButton, StepButton, InfoBadge } from '../components/WizardParts';
import { DatePickerSheet } from '../components/DatePickerSheet';
import { DepletionChart, formatMl } from '../components/DepletionChart';

const imgEditPencil = "/icons/edit-pencil.svg";

const wdth = { fontVariationSettings: "'wdth' 100" } as const;
const FONT = "font-['Roboto',sans-serif]";

// A refill more than three months ahead of the alarm says more about a stalled
// therapy than about planning, so the stepper stops there.
const MAX_LEAD_WEEKS = 12;

/** dd.mm — the short form the chart puts under a projected marker. */
function shortDate(date: string) {
  return date.length === 10 ? date.slice(0, 5) : '—';
}

/**
 * Refill · "Refill Date" step (Figma 10021:40841). The alert level set on the
 * previous step fixes *when the pump will complain*; this step plans *when the
 * patient comes in*, which is a scheduling decision and so the clinician's to
 * make. The chart is the one from that step with the refill drawn onto it, and
 * the shaded span between the two is what the step really sets: the buffer —
 * never less than a week — between the refill and the alarm. Either control
 * writes the same date: step the lead in weeks, or pick the day outright.
 */
export function RefillDate() {
  const navigate = useNavigate();
  const {
    alertLevelMl, alertDate, daysToAlert, emptyDate, volMlPerDay, fillMl,
    refillDate, daysToRefill, refillLeadDays, setRefillDate, setRefillLeadWeeks,
  } = useTherapy();
  const [pickerOpen, setPickerOpen] = useState(false);

  const noTherapy = daysToAlert == null;

  // The refill can be no later than a week before the alarm, and no earlier
  // than today — which caps how far the lead can be stepped out.
  const maxLead = noTherapy ? 0 : Math.floor(daysToAlert / 7);
  const leadDays = refillLeadDays ?? 0;
  // Stepping works in whole weeks; a hand-picked day rarely lands on one, so the
  // read-out switches to days rather than rounding the clinician's date away.
  const leadIsWeeks = leadDays % 7 === 0;
  const leadValue = leadIsWeeks ? leadDays / 7 : leadDays;
  const leadUnit = leadIsWeeks ? (leadValue === 1 ? 'week' : 'weeks') : 'days';
  const stepLead = (deltaWeeks: number) => {
    const weeks = Math.floor(leadDays / 7) + deltaWeeks;
    setRefillLeadWeeks(Math.max(1, Math.min(MAX_LEAD_WEEKS, maxLead, weeks)));
  };

  // Reservoir left on the planned day, at the current consumption rate.
  const levelAtRefill = daysToRefill != null
    ? Math.max(0, fillMl - volMlPerDay * daysToRefill)
    : fillMl;
  const pctAtRefill = Math.round((levelAtRefill / RESERVOIR_ML) * 100);
  // A hand-picked date can eat into the week of headroom, or land past the
  // alarm entirely; the chart shows it and the note below says so.
  const isTooLate = !noTherapy && leadDays < REFILL_MIN_LEAD_DAYS;

  return (
    <WizardShell
      step="refill-date"
      onBack={() => navigate('refill-alert')}
      onHelp={() => navigate('help')}
      footer={
        <>
          <WizardTotalsFooter />
          <div className="bg-[#e6f4f9] px-[80px] pt-[24px] pb-[40px]">
            <SaveButton label="Next" onClick={() => navigate('review')} />
          </div>
        </>
      }
      overlay={pickerOpen && (
        <DatePickerSheet
          value={refillDate}
          onPick={setRefillDate}
          onClose={() => setPickerOpen(false)}
        />
      )}
    >
      <div className="flex-1 flex flex-col gap-[80px]">
        {/* Title */}
        <div className="flex gap-[16px] items-center">
          <svg width="56" height="56" viewBox="0 0 24 24" fill="none">
            <rect x="3" y="5" width="18" height="16" rx="2.5" stroke="#0094c5" strokeWidth="1.6" />
            <path d="M3 10h18" stroke="#0094c5" strokeWidth="1.6" />
            <path d="M8 3v4M16 3v4" stroke="#0094c5" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
          <p className={`${FONT} font-bold text-[#00769e] text-[36px] leading-[40px] tracking-[0.1px]`} style={wdth}>
            Set refill date
          </p>
          <InfoBadge onClick={() => navigate('help')} />
        </div>

        <DepletionChart
          fillMl={fillMl}
          alertMl={alertLevelMl}
          todayLabel={new Date().toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })}
          alertLabel={shortDate(alertDate)}
          emptyLabel={shortDate(emptyDate)}
          refill={noTherapy ? null : { ml: levelAtRefill, label: shortDate(refillDate) }}
        />

        {/* Controls — the lead and the date are two views of one setting */}
        <div className="flex flex-col gap-[26px]">
          {/* Label, stepper, "on" and the date have to share 1040px — the gaps
              are as wide as that allows without wrapping the label. */}
          <div className="flex gap-[24px] items-center">
            <p className={`${FONT} font-extrabold text-[#00769e] text-[30px] w-[320px] shrink-0`} style={wdth}>
              Refill ahead of the alert
            </p>
            <div className="flex gap-[16px] items-center">
              <StepButton label="−" disabled={noTherapy || leadDays <= REFILL_MIN_LEAD_DAYS} onClick={() => stepLead(-1)} />
              <div className="bg-white border-2 border-[#6b7885] rounded-[8px] h-[76px] w-[169px] flex gap-[8px] items-center px-[16px]">
                <p className={`${FONT} font-extrabold text-[#00769e] text-[36px]`} style={wdth}>{leadValue}</p>
                <p className={`${FONT} font-normal text-[#8c99a6] text-[24px] flex-1`} style={wdth}>{leadUnit}</p>
              </div>
              <StepButton label="+" disabled={noTherapy || leadDays >= Math.min(MAX_LEAD_WEEKS * 7, maxLead * 7)} onClick={() => stepLead(1)} />
            </div>

            <p className={`${FONT} font-extrabold text-[#00769e] text-[30px] shrink-0`} style={wdth}>on</p>
            <div className="flex gap-[24px] items-center">
              <div
                onClick={() => setPickerOpen(true)}
                className="bg-[#e6f4f9] rounded-[8px] h-[76px] w-[210px] flex items-center pl-[24px] cursor-pointer"
              >
                <p className={`${FONT} font-extrabold text-[#00769e] text-[32px] whitespace-nowrap`} style={wdth}>{refillDate}</p>
              </div>
              <img
                alt="Pick the refill date" src={imgEditPencil}
                onClick={() => setPickerOpen(true)}
                className="size-[40px] shrink-0 block cursor-pointer"
              />
            </div>
          </div>

          {noTherapy ? (
            <p className={`${FONT} font-normal text-[#6b7880] text-[24px] leading-[32px] tracking-[0.1px]`} style={wdth}>
              No delivery running — set a therapy to plan the refill against the alert date.
            </p>
          ) : isTooLate ? (
            <p className={`${FONT} font-normal text-[#cc5457] text-[24px] leading-[32px] tracking-[0.1px]`} style={wdth}>
              This leaves under a week before the alert level is reached on {alertDate}.{' '}
              <span onClick={() => setRefillLeadWeeks(1)} className="text-[#0094c5] font-bold cursor-pointer underline">
                Move it a week ahead
              </span>
            </p>
          ) : (
            <p className={`${FONT} font-normal text-[#6b7880] text-[24px] leading-[32px] tracking-[0.1px]`} style={wdth}>
              Alert level is reached on {alertDate}. Refilling {leadDays} days earlier leaves {formatMl(levelAtRefill)} ml ({pctAtRefill} %) in the reservoir.
            </p>
          )}
        </div>
      </div>
    </WizardShell>
  );
}
