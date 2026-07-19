import { useState } from 'react';
import { useNavigate } from '../navigation';
import { useTherapy, RESERVOIR_ML } from '../therapy';
import { WizardShell } from '../components/WizardShell';
import { WizardTotalsFooter, SaveButton } from '../components/WizardParts';
import { DatePickerSheet } from '../components/DatePickerSheet';
import { PUMP_BODY, PUMP_PORT, PUMP_W, PUMP_H, RES_CX, RES_CY, RES_R } from '../components/pumpPaths';

const wdth = { fontVariationSettings: "'wdth' 100" } as const;
const FONT = "font-['Roboto',sans-serif]";
const BLUE = '#0094c5';
const GOLD = '#b3850e';

// The clinician can park the alert anywhere from 1 ml up to half the reservoir.
const MIN_ALERT_ML = 1;
const MAX_ALERT_ML = RESERVOIR_ML / 2;

// Layout of the graphic block: the pump sits centred in the body's 1040px gutter,
// and the alert line runs wider than the pump so its tag clears the silhouette.
const BOX_W = 1040;
const PUMP_LEFT = (BOX_W - PUMP_W) / 2;
const LINE_X1 = 300;
const LINE_X2 = 740;

/**
 * The pump silhouette with the reservoir filled to the alert threshold and a
 * gold rule marking it. Driven entirely by `alertMl`, so the ± stepper and the
 * graphic stay in lockstep.
 */
function AlertLevelPump({ alertMl }: { alertMl: number }) {
  const frac = alertMl / RESERVOIR_ML;
  const bottom = RES_CY + RES_R;
  const fillH = frac * RES_R * 2;
  const lineY = bottom - fillH;

  return (
    <div className="relative" style={{ width: BOX_W, height: PUMP_H }}>
      <svg
        className="absolute"
        style={{ left: PUMP_LEFT, top: 0, width: PUMP_W, height: PUMP_H }}
        viewBox={`0 0 ${PUMP_W} ${PUMP_H}`}
        fill="none"
      >
        <defs><clipPath id="alertResClip"><circle cx={RES_CX} cy={RES_CY} r={RES_R} /></clipPath></defs>
        {/* Fluid remaining when the alert fires */}
        <rect
          x="50" width="287" y={bottom - fillH} height={fillH}
          fill={BLUE} clipPath="url(#alertResClip)"
          style={{ transition: 'y 250ms ease-out, height 250ms ease-out' }}
        />
        <circle cx={RES_CX} cy={RES_CY} r="148.66" fill="none" stroke={BLUE} strokeWidth="14.46" />
        <path d={PUMP_BODY} fill={BLUE} />
        <path d={PUMP_PORT} fill={BLUE} />
      </svg>

      {/* Alert threshold rule + tag, tracking the fill line */}
      <div
        className="absolute h-[6px]"
        style={{ left: LINE_X1, width: LINE_X2 - LINE_X1, top: lineY - 3, background: GOLD, transition: 'top 250ms ease-out' }}
      />
      <div
        className="absolute rounded-[999px] px-[16px] py-[6px]"
        style={{ left: LINE_X2 - 8, top: lineY - 22, background: GOLD, transition: 'top 250ms ease-out' }}
      >
        <p className={`${FONT} font-bold text-white text-[20px] whitespace-nowrap`} style={wdth}>
          Alert level: {alertMl}ml
        </p>
      </div>
    </div>
  );
}

function StepButton({ label, onClick, disabled }: { label: string; onClick: () => void; disabled: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`size-[64px] rounded-[32px] flex items-center justify-center shrink-0 ${disabled ? 'bg-[#e8eef2] cursor-not-allowed' : 'bg-[#cce4f1] cursor-pointer'}`}
    >
      <span className={`${FONT} font-extrabold text-[40px] ${disabled ? 'text-[#a5a5a5]' : 'text-[#00769e]'}`} style={wdth}>
        {label}
      </span>
    </button>
  );
}

function EditPen() {
  return (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
      <path d="M4 20h4l10-10-4-4L4 16v4z" stroke="#0094c5" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M14 6l4 4" stroke="#0094c5" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

/**
 * Refill · "Refill Alert" step (Figma 9718:48723). Sets the reservoir volume at
 * which the pump warns, and the date the next refill is due. Reached from the
 * therapy gate either directly ("No change") or after the medication/delivery
 * screens ("Change"); hands off to Review.
 */
export function RefillAlert() {
  const navigate = useNavigate();
  const { alertLevelMl, setAlertLevelMl, refillDate, setRefillDate, daysToRefill, refillDateIsManual } = useTherapy();
  const [pickerOpen, setPickerOpen] = useState(false);

  const clamp = (ml: number) => Math.min(MAX_ALERT_ML, Math.max(MIN_ALERT_ML, ml));
  const pct = Math.round((alertLevelMl / RESERVOIR_ML) * 100);

  return (
    <WizardShell
      step="refill-alert"
      onBack={() => navigate('refill-same-therapy')}
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
      <div className="flex-1 flex flex-col gap-[40px]">
        {/* Title */}
        <div className="flex gap-[16px] items-center">
          <svg width="56" height="56" viewBox="0 0 24 24" fill="none">
            <path d="M12 3a6 6 0 00-6 6c0 4-1.5 5.5-2 6.5h16c-.5-1-2-2.5-2-6.5a6 6 0 00-6-6z" stroke="#0094c5" strokeWidth="1.6" strokeLinejoin="round" />
            <path d="M10 19a2 2 0 004 0" stroke="#0094c5" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
          <p className={`${FONT} font-bold text-[#00769e] text-[36px] leading-[40px] tracking-[0.1px]`} style={wdth}>
            Set refill alert level
          </p>
        </div>

        {/* Reservoir graphic with its full/empty scale labels */}
        <div className="flex flex-col items-center gap-[8px]">
          <p className={`${FONT} font-normal text-[#00769e] tracking-[0.1px] whitespace-nowrap`} style={wdth}>
            <span className="text-[36px] leading-[40px]">{RESERVOIR_ML} ml </span>
            <span className="text-[28px] leading-[32px]">100%</span>
          </p>
          <AlertLevelPump alertMl={alertLevelMl} />
          <p className={`${FONT} font-normal text-[#00769e] tracking-[0.1px] whitespace-nowrap`} style={wdth}>
            <span className="text-[36px] leading-[40px]">0 ml </span>
            <span className="text-[28px] leading-[32px]">0%</span>
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-col gap-[26px] pl-[56px]">
          {/* Alert level stepper */}
          <div className="flex gap-[125px] items-center">
            <p className={`${FONT} font-extrabold text-[#00769e] text-[30px] whitespace-nowrap`} style={wdth}>Alert level</p>
            <div className="flex gap-[28px] items-center">
              <div className="flex gap-[16px] items-center">
                <StepButton label="−" disabled={alertLevelMl <= MIN_ALERT_ML} onClick={() => setAlertLevelMl(clamp(alertLevelMl - 1))} />
                <div className="bg-white border-2 border-[#6b7885] rounded-[8px] h-[76px] w-[276px] flex gap-[8px] items-center px-[16px]">
                  <p className={`${FONT} font-extrabold text-[#00769e] text-[36px]`} style={wdth}>{alertLevelMl}</p>
                  <p className={`${FONT} font-normal text-[#8c99a6] text-[24px] flex-1`} style={wdth}>ml</p>
                </div>
                <StepButton label="+" disabled={alertLevelMl >= MAX_ALERT_ML} onClick={() => setAlertLevelMl(clamp(alertLevelMl + 1))} />
              </div>
              <p className={`${FONT} font-bold text-[30px] whitespace-nowrap`} style={{ ...wdth, color: GOLD }}>= {pct} %</p>
            </div>
          </div>

          {/* Refill due date */}
          <div className="flex gap-[47px] items-center">
            <div className="flex gap-[148px] items-center w-[629px]">
              <p className={`${FONT} font-extrabold text-[#00769e] text-[30px] w-[199px]`} style={wdth}>Refill due by</p>
              <div
                onClick={() => setPickerOpen(true)}
                className="bg-[#fdf3d1] rounded-[8px] h-[76px] flex-1 flex items-center pl-[24px] cursor-pointer"
              >
                <p className={`${FONT} font-extrabold text-[#00769e] text-[32px] whitespace-nowrap`} style={wdth}>{refillDate}</p>
              </div>
            </div>
            <button onClick={() => setPickerOpen(true)} className="size-[40px] cursor-pointer" aria-label="Edit refill date">
              <EditPen />
            </button>
          </div>

          {refillDateIsManual ? (
            <p className={`${FONT} font-normal text-[#6b7880] text-[22px]`} style={wdth}>
              Set by hand — plan the refill before this date.{' '}
              <span onClick={() => setRefillDate(null)} className="text-[#0094c5] font-bold cursor-pointer underline">
                Use the calculated date
              </span>
            </p>
          ) : (
            <p className={`${FONT} font-normal text-[#6b7880] text-[22px]`} style={wdth}>
              {daysToRefill != null
                ? `Calculated from the current delivery rate — the reservoir reaches ${alertLevelMl} ml in about ${daysToRefill} days. Plan the refill before this date.`
                : 'No delivery running — set a therapy to calculate the refill date.'}
            </p>
          )}
        </div>
      </div>
    </WizardShell>
  );
}
