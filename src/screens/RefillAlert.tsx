import { useNavigate } from '../navigation';
import { useTherapy, MIN_ALERT_ML, MAX_ALERT_ML } from '../therapy';
import { WizardShell } from '../components/WizardShell';
import { WizardTotalsFooter, SaveButton, StepButton, InfoBadge } from '../components/WizardParts';
import { DepletionChart } from '../components/DepletionChart';

const wdth = { fontVariationSettings: "'wdth' 100" } as const;
const FONT = "font-['Roboto',sans-serif]";

/** dd.mm — the short form the chart puts under a projected marker. */
function shortDate(date: string) {
  return date.length === 10 ? date.slice(0, 5) : '—';
}

/**
 * Refill · "Refill Alert" step (Figma 9718:48723). Sets the reservoir volume at
 * which the pump warns. The chart above the stepper is the whole argument for
 * the number: the reservoir drains at the therapy's own rate, so moving the
 * threshold moves the day the alarm fires, and the gap left between that day
 * and the day the pump runs dry is exactly what the clinician is trading. Both
 * dates are projections, never editable — the refill is planned on the next
 * step. Reached from the therapy gate either directly ("No change") or after
 * the medication/delivery screens.
 */
export function RefillAlert() {
  const navigate = useNavigate();
  const {
    alertLevelMl, setAlertLevelMl, fillMl, volMlPerDay,
    alertDate, daysToAlert, emptyDate,
  } = useTherapy();

  const clamp = (ml: number) => Math.min(MAX_ALERT_ML, Math.max(MIN_ALERT_ML, ml));

  return (
    <WizardShell
      step="refill-alert"
      onBack={() => navigate('refill-same-therapy')}
      onHelp={() => navigate('help')}
      footer={
        <>
          <WizardTotalsFooter />
          <div className="bg-[#e6f4f9] px-[80px] pt-[24px] pb-[40px]">
            <SaveButton label="Next" onClick={() => navigate('refill-date')} />
          </div>
        </>
      }
    >
      <div className="flex-1 flex flex-col gap-[80px]">
        {/* Title */}
        <div className="flex gap-[16px] items-center">
          <svg width="56" height="56" viewBox="0 0 24 24" fill="none">
            <path d="M12 3a6 6 0 00-6 6c0 4-1.5 5.5-2 6.5h16c-.5-1-2-2.5-2-6.5a6 6 0 00-6-6z" stroke="#0094c5" strokeWidth="1.6" strokeLinejoin="round" />
            <path d="M10 19a2 2 0 004 0" stroke="#0094c5" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
          <p className={`${FONT} font-bold text-[#00769e] text-[36px] leading-[40px] tracking-[0.1px]`} style={wdth}>
            Set refill alert level
          </p>
          <InfoBadge onClick={() => navigate('help')} />
        </div>

        <DepletionChart
          fillMl={fillMl}
          alertMl={alertLevelMl}
          todayLabel={new Date().toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })}
          alertLabel={shortDate(alertDate)}
          emptyLabel={shortDate(emptyDate)}
        />

        {/* Controls */}
        <div className="flex flex-col gap-[26px] pl-[56px]">
          <div className="flex gap-[26px] items-center">
            <p className={`${FONT} font-extrabold text-[#00769e] text-[30px] w-[425px]`} style={wdth}>
              Set the alert level of your pump
            </p>
            <div className="flex gap-[16px] items-center">
              <StepButton label="−" disabled={alertLevelMl <= MIN_ALERT_ML} onClick={() => setAlertLevelMl(clamp(alertLevelMl - 1))} />
              <div className="bg-white border-2 border-[#6b7885] rounded-[8px] h-[76px] w-[374px] flex gap-[8px] items-center px-[16px]">
                <p className={`${FONT} font-extrabold text-[#00769e] text-[36px]`} style={wdth}>{alertLevelMl}</p>
                <p className={`${FONT} font-normal text-[#8c99a6] text-[24px] flex-1`} style={wdth}>ml</p>
              </div>
              <StepButton label="+" disabled={alertLevelMl >= MAX_ALERT_ML} onClick={() => setAlertLevelMl(clamp(alertLevelMl + 1))} />
            </div>
          </div>

          <p className={`${FONT} font-normal text-[#6b7880] text-[24px] leading-[32px] tracking-[0.1px] w-[985px]`} style={wdth}>
            {daysToAlert != null
              ? `Alert level will be reached on ${alertDate}. Calculated from the current delivery rate (${volMlPerDay.toFixed(2)} ml/day) — in ${daysToAlert} days. The pump runs completely empty on ${emptyDate}.`
              : 'No delivery running — set a therapy to project when the alert level is reached.'}
          </p>
        </div>
      </div>
    </WizardShell>
  );
}
