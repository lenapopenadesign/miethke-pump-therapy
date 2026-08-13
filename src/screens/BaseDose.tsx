import { useState } from 'react';
import { useNavigate } from '../navigation';
import {
  useTherapy, coDoseUgDay, concUgPerUl, doseStringsFor, doseUnitFor, fmtDose,
  type Medication,
} from '../therapy';
import { WizardShell } from '../components/WizardShell';
import { MedicationIcon } from '../components/MedicationIcon';
import { WizardChart, WizardTotalsFooter, SaveButton, RangeSlider, DeliveryIcon, ReadoutField, WindowsIcon, ArrowForward, SectionHeader, InfoBadge, Explainer, WarningBanner } from '../components/WizardParts';
import { Field, FieldLabel, fieldUnitCls, fieldValueCls } from '../components/Field';

const imgEditPencil = "/icons/edit-pencil.svg";

// Per-row display. The primary (index 0) IS the base dose; co-meds are derived
// from the shared delivered volume. Each shows in the unit its concentration
// implies (mg or µg).
function rowDisplay(m: Medication, i: number, baseDose: number, c0: number) {
  const ug = i === 0 ? baseDose : coDoseUgDay(baseDose, c0, concUgPerUl(m));
  const d = doseStringsFor(ug, m.unit);
  return { unit: d.unit, div: doseUnitFor(m.unit).div, perDay: baseDose > 0 ? d.perDay : '', ug };
}

export function BaseDose() {
  const navigate = useNavigate();
  const { baseDose, setBaseDose, medications, bolusCount, maxBoluses, freqOptions, setBolusCount, cancelTherapyEdit, intervalsByDay, clearWindows } = useTherapy();
  const c0 = medications[0] ? concUgPerUl(medications[0]) : 1;
  const [editingId, setEditingId] = useState<string | undefined>(medications[0]?.id);
  const [draftText, setDraftText] = useState<string | null>(null);
  const [showCustomInfo, setShowCustomInfo] = useState(false);
  const ctaEnabled = baseDose > 0;
  // Reference dose + frequency on entry — a >100% dose jump likely means a decimal
  // slip, so warn; and any change once customised deliveries exist resets them.
  const [initialBase] = useState(baseDose);
  const [initialBolus] = useState(bolusCount);
  const bigIncrease = initialBase > 0 && baseDose > initialBase * 2;
  const increasePct = initialBase > 0 ? Math.round((baseDose / initialBase - 1) * 100) : 0;
  // Dismissing records the dose it was dismissed at, so raising the dose further
  // brings the caution back rather than leaving it gone for the rest of the edit.
  const [warnDismissedAt, setWarnDismissedAt] = useState<number | null>(null);
  const showBigIncrease = bigIncrease && (warnDismissedAt == null || baseDose > warnDismissedAt);
  // Customised deliveries are slot-based, so changing the default delivery or the
  // delivery frequency invalidates them — warn, and clear them on continue.
  const hasCustomDeliveries = Object.values(intervalsByDay).some(list => list.length > 0);
  const baseOrFreqChanged = baseDose !== initialBase || bolusCount !== initialBolus;
  const willResetCustom = hasCustomDeliveries && baseOrFreqChanged;

  // Delivery frequency: the slider snaps through the valid options (divisors of
  // the day's 10 µl stroke count); the gap between deliveries is derived from the
  // chosen count.
  const sliderMin = freqOptions.length ? freqOptions[0] : 0;
  const freqValid = freqOptions.length > 0;
  const gapMin = bolusCount > 0 ? Math.round(1440 / bolusCount) : 0;

  // Editing any med back-solves the shared delivered volume (the primary's
  // µg/day) so the rest of the table stays consistent.
  const applyEditDaily = (m: Medication, i: number, ugPerDay: number) => {
    const mc = concUgPerUl(m);
    const primary = i === 0 ? ugPerDay : (mc > 0 ? (ugPerDay * c0) / mc : 0);
    setBaseDose(Math.max(0, Math.min(20000, Math.round(primary))));
  };

  // Leaving this step in either direction settles the customised deliveries the
  // new default/frequency invalidated, so Review and the Customised Delivery
  // step never disagree about what is still set.
  const leaveTo = (to: 'windows' | 'review') => { if (willResetCustom) clearWindows(); navigate(to); };

  return (
    <WizardShell
      step="base-dose"
      // Backing out of the editing steps abandons the edit: restore the therapy
      // that was in place before, so returning home shows the original teaser.
      onBack={() => { const to = cancelTherapyEdit(); navigate(to); }}
      onHelp={() => navigate('help')}
      pinnedTop={<WizardChart />}
      footer={
        <>
          <WizardTotalsFooter />
          <div className="bg-[#e6f4f9] px-[80px] pt-[24px] pb-[40px]">
            {/* Next goes straight to Review — Customised Delivery is optional and
                is reached from the "Customise deliveries" button above. */}
            <SaveButton enabled={ctaEnabled} label="Next" onClick={() => leaveTo('review')} />
          </div>
        </>
      }
    >
      <div className="flex flex-col gap-[40px]">
        {/* Reset warning — shown once the default delivery or frequency is changed
            while customised deliveries exist; continuing clears them. */}
        {/* A consequence, not a judgement call — so no dismiss cross. */}
        {willResetCustom && (
          <WarningBanner title="Customised deliveries will be reset">
            Changing the default delivery or delivery frequency clears your customised deliveries.
            Tap Next to continue.
          </WarningBanner>
        )}

        {/* Base Dose table */}
        <div className="flex flex-col gap-[24px]">
          <SectionHeader icon={<MedicationIcon size={48} />} title="Default delivery" />

          {showBigIncrease && (
            <WarningBanner
              title={`Large dose increase (+${increasePct}%)`}
              onDismiss={() => setWarnDismissedAt(baseDose)}
            >
              Please double-check for a decimal slip. You can keep this value if it’s intended.
            </WarningBanner>
          )}

          {/* A tight row gap keeps the column headers on their fields; the rows
              themselves are 72px tall, so they stay legible without more. */}
          <div className="grid items-center gap-x-[16px] gap-y-[12px] [grid-template-columns:260px_1fr_1fr_56px]">
            {/* Column headers above the value fields */}
            <span />
            <FieldLabel>Default delivery per day</FieldLabel>
            <FieldLabel>Dose per delivery</FieldLabel>
            <span />

            {medications.map((m, i) => {
              const d = rowDisplay(m, i, baseDose, c0);
              const editing = m.id === editingId;
              // Dose per delivery = daily dose / delivery frequency, in the med's unit.
              const perDelivery = baseDose > 0 ? fmtDose((d.ug / Math.max(1, bolusCount)) / d.div) : '';
              return (
                <div key={m.id} className="contents">
                  <p className="font-['Roboto',sans-serif] font-bold text-[#00769e] text-[28px] leading-[36px] tracking-[0.1px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
                    {m.name || (i === 0 ? 'Primary' : 'Medication')}
                  </p>

                  {editing ? (
                    <Field>
                      <input
                        type="text" inputMode="decimal" pattern="[0-9]*\.?[0-9]*"
                        autoFocus
                        onFocus={e => e.currentTarget.select()}
                        value={draftText ?? d.perDay}
                        onChange={e => {
                          const raw = e.target.value.replace(/[^0-9.]/g, '');
                          setDraftText(raw);
                          const v = parseFloat(raw);
                          applyEditDaily(m, i, (isNaN(v) ? 0 : v) * d.div);
                        }}
                        onBlur={() => setDraftText(null)}
                        className={`flex-1 min-w-px bg-transparent outline-none border-0 p-0 placeholder:text-[#a5a5a5] ${fieldValueCls}`}
                        placeholder="0"
                        style={{ fontFamily: 'Roboto, sans-serif', fontVariationSettings: "'wdth' 100" }}
                      />
                      <span className={fieldUnitCls} style={{ fontVariationSettings: "'wdth' 100" }}>{d.unit}/d</span>
                    </Field>
                  ) : (
                    <div className="bg-[#e6f4f9] rounded-[8px] h-[72px] flex items-center px-[20px]">
                      <p className="font-['Roboto',sans-serif] text-[#00769e] text-[32px] tracking-[0.1px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
                        <span className="font-bold">{d.perDay || '--'}</span> <span className="font-normal text-[#5f8aa0]">{d.unit}/d</span>
                      </p>
                    </div>
                  )}

                  {/* Dose per delivery — derived from the daily dose ÷ delivery frequency */}
                  <div className="bg-[#e6f4f9] rounded-[8px] h-[72px] flex items-center px-[20px]">
                    <p className="font-['Roboto',sans-serif] text-[#00769e] text-[28px] tracking-[0.1px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
                      <span className="font-bold">{perDelivery ? `~ ${perDelivery}` : '--'}</span> <span className="font-normal text-[#5f8aa0]">{d.unit}</span>
                    </p>
                  </div>

                  {editing ? <span /> : (
                    <img
                      alt="Edit dose" src={imgEditPencil}
                      onClick={() => { setDraftText(null); setEditingId(m.id); }}
                      className="size-[40px] shrink-0 block cursor-pointer justify-self-end"
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Delivery Frequency */}
        <div className={`flex flex-col gap-[28px] mt-[68px] ${freqValid ? '' : 'opacity-40 pointer-events-none'}`}>
          <SectionHeader icon={<DeliveryIcon size={44} />} title="Delivery Frequency" />

          <div className="flex flex-col gap-[8px]">
            <RangeSlider min={sliderMin} max={Math.max(sliderMin, maxBoluses)} value={bolusCount} steps={freqOptions} disabled={!freqValid} onChange={setBolusCount} />
            <div className="flex justify-between">
              <span className="font-['Roboto',sans-serif] font-bold text-[#00769e] text-[36px] tracking-[0.1px]" style={{ fontVariationSettings: "'wdth' 100" }}>{freqValid ? sliderMin : '--'}</span>
              <span className="font-['Roboto',sans-serif] font-bold text-[#00769e] text-[36px] tracking-[0.1px]" style={{ fontVariationSettings: "'wdth' 100" }}>{freqValid ? maxBoluses : '--'}</span>
            </div>
          </div>

          <div className="grid items-center gap-x-[16px] gap-y-[16px] [grid-template-columns:260px_1fr]">
            <p className="font-['Roboto',sans-serif] font-bold text-[#00769e] text-[28px] tracking-[0.1px]" style={{ fontVariationSettings: "'wdth' 100" }}>Deliveries</p>
            <ReadoutField>{freqValid ? bolusCount : '--'}</ReadoutField>
            <p className="font-['Roboto',sans-serif] font-bold text-[#00769e] text-[28px] tracking-[0.1px]" style={{ fontVariationSettings: "'wdth' 100" }}>Delivery time gap</p>
            <ReadoutField>{freqValid ? `~ ${gapMin} min` : '--'}</ReadoutField>
          </div>
        </div>

        {/* Customised Delivery — the optional branch of the flow. The section is
            a title and one button: Next continues straight to Review, so this is
            the only way into the Customised Delivery step (Figma 10457:169671). */}
        <div className="flex flex-col gap-[20px] mt-[48px]">
          <div className="flex gap-[24px] items-center">
            <SectionHeader icon={<WindowsIcon size={44} />} title="Customised Delivery" className="flex-1 min-w-px">
              <InfoBadge onClick={() => setShowCustomInfo(v => !v)} />
            </SectionHeader>
            <button
              onClick={() => leaveTo('windows')}
              className="flex gap-[16px] h-[88px] items-center justify-center px-[42px] rounded-[80px] border-2 border-[#0094c5] cursor-pointer shrink-0"
            >
              <ArrowForward />
              <span className="font-['Roboto',sans-serif] font-bold text-[#0094c5] text-[28px] leading-[42px] tracking-[0.1px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
                Customise deliveries
              </span>
            </button>
          </div>
          {showCustomInfo && (
            <Explainer title="What is a customised delivery?">
              A customised delivery raises or lowers the dose for a stretch of the day — for
              example more overnight — while every other delivery keeps the default dose.
            </Explainer>
          )}
        </div>
      </div>
    </WizardShell>
  );
}
