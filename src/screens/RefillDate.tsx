import { useState } from 'react';
import { useNavigate } from '../navigation';
import { useTherapy, formatDate, REFILL_MIN_LEAD_DAYS, MIN_ALERT_ML, MAX_ALERT_ML } from '../therapy';
import { WizardShell } from '../components/WizardShell';
import { WizardTotalsFooter, SaveButton, StepButton, ToggleSwitch, Explainer, CalendarIcon } from '../components/WizardParts';
import { Field, Readout, fieldValueCls, fieldUnitCls, readoutUnitCls, readoutValueCls } from '../components/Field';
import { DatePickerSheet } from '../components/DatePickerSheet';
import { DepletionChart } from '../components/DepletionChart';

const wdth = { fontVariationSettings: "'wdth' 100" } as const;
const FONT = "font-['Roboto',sans-serif]";

/** `19 Aug` — the short form the chart puts under a projected marker. */
function shortDate(date: string) {
  return date.length === 11 ? date.slice(0, 6) : '—';
}

/** Section heading: 56px glyph + title, optionally with an `i` badge. */
function SectionTitle({ icon, children, onInfo }: { icon: React.ReactNode; children: React.ReactNode; onInfo?: () => void }) {
  return (
    <div className="flex gap-[16px] items-center">
      {icon}
      <p className={`${FONT} font-bold text-[#096657] text-[36px] leading-[40px] tracking-[0.1px] whitespace-nowrap`} style={wdth}>
        {children}
      </p>
      {onInfo && (
        <div
          onClick={onInfo}
          className="size-[36px] rounded-full bg-[#0b786a] flex items-center justify-center shrink-0 cursor-pointer"
        >
          <span className={`${FONT} font-bold text-white text-[24px] leading-none`} style={wdth}>i</span>
        </div>
      )}
    </div>
  );
}

/** Label on the left, controls on the right — the row shape both fields share. */
function FieldRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-[26px] items-center pl-[56px]">
      <p className={`${FONT} font-extrabold text-[#096657] text-[30px] flex-1 min-w-px`} style={wdth}>{label}</p>
      {children}
    </div>
  );
}

/** − / value / + at the fixed width the two steppers on this step share. */
function Stepper({ value, unit, minusDisabled, plusDisabled, onMinus, onPlus }: {
  value: string; unit: string; minusDisabled: boolean; plusDisabled: boolean; onMinus: () => void; onPlus: () => void;
}) {
  return (
    <div className="flex gap-[16px] items-center shrink-0">
      <StepButton label="−" disabled={minusDisabled} onClick={onMinus} />
      <Field style={{ width: 427 }}>
        <p className={fieldValueCls} style={wdth}>{value}</p>
        <p className={`${fieldUnitCls} flex-1`} style={wdth}>{unit}</p>
      </Field>
      <StepButton label="+" disabled={plusDisabled} onClick={onPlus} />
    </div>
  );
}

/**
 * Refill · "Refill Date" step (Figma 10189:168958). The one scheduling decision
 * of the refill flow: which day the patient comes in. The chart is the whole
 * argument for it — the reservoir drains at the therapy's own rate, so the day
 * the pump will complain and the day it runs dry are both projections, and what
 * the step really sets is the buffer left between the refill and the alarm.
 * Either control writes the same date: step the lead in weeks, or pick the day
 * outright.
 *
 * The alert level the projections hang off is normally left alone, so it lives
 * behind a toggle at the foot of the step rather than on a step of its own
 * (it had one until the two were merged). Raising it pulls every projection —
 * and with it the refill — forward, which the chart shows as it happens.
 */
export function RefillDate() {
  const navigate = useNavigate();
  const {
    alertLevelMl, setAlertLevelMl, alertDate, daysToAlert, emptyDate, volMlPerDay, fillMl,
    refillDate, daysToRefill, refillLeadDays, setRefillDate, setRefillLeadWeeks,
  } = useTherapy();
  const [pickerOpen, setPickerOpen] = useState(false);
  const [alertOpen, setAlertOpen] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);

  const noTherapy = daysToAlert == null;

  // How much headroom the chosen date leaves before the alarm. Derived from the
  // date rather than set alongside it, so the two can never disagree.
  const leadDays = refillLeadDays ?? 0;

  const clampAlert = (ml: number) => Math.min(MAX_ALERT_ML, Math.max(MIN_ALERT_ML, ml));

  // Reservoir left on the planned day, at the current consumption rate — the
  // volume the chart chips the refill marker with.
  const levelAtRefill = daysToRefill != null
    ? Math.max(0, fillMl - volMlPerDay * daysToRefill)
    : fillMl;
  // A hand-picked date can eat into the week of headroom, or land past the
  // alarm entirely; the chart shows it and the note below says so.
  const isTooLate = !noTherapy && leadDays < REFILL_MIN_LEAD_DAYS;

  return (
    <WizardShell
      step="refill-date"
      onBack={() => navigate('refill-same-therapy')}
      onHelp={() => navigate('help')}
      footer={
        <>
          <WizardTotalsFooter />
          <div className="bg-[#f5fcf9] px-[80px] pt-[24px] pb-[40px]">
            <SaveButton label="Next" onClick={() => navigate('review')} />
          </div>
        </>
      }
      overlay={pickerOpen && (
        <DatePickerSheet
          value={refillDate}
          onPick={setRefillDate}
          alertDate={noTherapy ? undefined : alertDate}
          onClose={() => setPickerOpen(false)}
        />
      )}
    >
      <div className="flex-1 flex flex-col gap-[80px]">
        {/* The refill date, and the two ways of setting it */}
        <div className="flex flex-col gap-[40px]">
          <SectionTitle icon={<CalendarIcon size={56} />}>Set the refill date</SectionTitle>

          <DepletionChart
            fillMl={fillMl}
            alertMl={alertLevelMl}
            todayLabel={formatDate(new Date())}
            alertLabel={shortDate(alertDate)}
            emptyLabel={shortDate(emptyDate)}
            refill={noTherapy ? null : { ml: levelAtRefill, label: shortDate(refillDate) }}
          />

          {/* The date is the decision — a white field, picked from the calendar.
              The lead follows from it, so it reads as a derived light blue
              readout below rather than as a second control to reconcile. */}
          <FieldRow label="Refill date on">
            <button
              onClick={() => setPickerOpen(true)}
              aria-label="Pick the refill date"
              className="cursor-pointer text-left shrink-0"
            >
              <Field style={{ width: 427 }}>
                <p className={fieldValueCls} style={wdth}>{refillDate}</p>
              </Field>
            </button>
          </FieldRow>

          <FieldRow label="Days ahead of the alert">
            <Readout className="w-[427px] shrink-0">
              <span className={readoutValueCls} style={wdth}>{noTherapy ? '--' : leadDays}</span>
              <span className={readoutUnitCls} style={wdth}>days</span>
            </Readout>
          </FieldRow>

          {noTherapy ? (
            <p className={`${FONT} font-normal text-[#596d68] text-[24px] leading-[32px] tracking-[0.1px] pl-[56px]`} style={wdth}>
              No delivery running — set a therapy to plan the refill against the alert date.
            </p>
          ) : isTooLate ? (
            <p className={`${FONT} font-normal text-[#cc5457] text-[24px] leading-[32px] tracking-[0.1px] pl-[56px]`} style={wdth}>
              This leaves under a week before the alert level is reached on {alertDate}.{' '}
              <span onClick={() => setRefillLeadWeeks(1)} className="text-[#0b786a] font-bold cursor-pointer underline">
                Move it a week ahead
              </span>
            </p>
          ) : null}
        </div>

        {/* The threshold those projections hang off — normally left alone */}
        <div className="flex flex-col gap-[40px]">
          <div className="flex items-center justify-between pr-[16px]">
            <SectionTitle
              icon={
                <svg width="56" height="56" viewBox="0 0 24 24" fill="none" className="shrink-0">
                  <path d="M12 3a6 6 0 00-6 6c0 4-1.5 5.5-2 6.5h16c-.5-1-2-2.5-2-6.5a6 6 0 00-6-6z" stroke="#0b786a" strokeWidth="1.6" strokeLinejoin="round" />
                  <path d="M10 19a2 2 0 004 0" stroke="#0b786a" strokeWidth="1.6" strokeLinecap="round" />
                </svg>
              }
              onInfo={() => setInfoOpen(o => !o)}
            >
              Adjust alert level
            </SectionTitle>
            <ToggleSwitch on={alertOpen} onChange={setAlertOpen} label="Adjust alert level" />
          </div>

          {infoOpen && (
            <Explainer title="What is the refill alert level?">
              The lowest amount of medication that should be in the pump before it is refilled.
              When the fill levels drops to this level, the pump starts beeping and the app will
              remind you to refill.
            </Explainer>
          )}

          {alertOpen && (
            <FieldRow label="Alert level of your pump">
              <Stepper
                value={`${alertLevelMl}`}
                unit="ml"
                minusDisabled={alertLevelMl <= MIN_ALERT_ML}
                plusDisabled={alertLevelMl >= MAX_ALERT_ML}
                onMinus={() => setAlertLevelMl(clampAlert(alertLevelMl - 1))}
                onPlus={() => setAlertLevelMl(clampAlert(alertLevelMl + 1))}
              />
            </FieldRow>
          )}
        </div>
      </div>
    </WizardShell>
  );
}
