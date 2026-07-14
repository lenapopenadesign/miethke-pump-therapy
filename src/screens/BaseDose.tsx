import { useState } from 'react';
import { useNavigate } from '../navigation';
import {
  useTherapy, coDoseUgDay, concUgPerUl, doseStringsFor, doseUnitFor, fmtDose,
  type Medication,
} from '../therapy';
import { WizardShell } from '../components/WizardShell';
import { MedicationIcon } from '../components/MedicationIcon';
import { WizardChart, WizardTotalsFooter, SaveButton, RangeSlider, DeliveryIcon, ReadoutField } from '../components/WizardParts';

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
  const { baseDose, setBaseDose, medications, bolusCount, maxBoluses, freqOptions, setBolusCount, cancelTherapyEdit } = useTherapy();
  const c0 = medications[0] ? concUgPerUl(medications[0]) : 1;
  const [editingId, setEditingId] = useState<string | undefined>(medications[0]?.id);
  const [draftText, setDraftText] = useState<string | null>(null);
  const ctaEnabled = baseDose > 0;
  // Reference dose on entry — a >100% jump likely means a decimal slip, so warn.
  const [initialBase] = useState(baseDose);
  const bigIncrease = initialBase > 0 && baseDose > initialBase * 2;

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
          <WizardTotalsFooter baseOnly />
          <div className="bg-[#e6f4f9] px-[80px] pt-[24px] pb-[40px]">
            <SaveButton enabled={ctaEnabled} onClick={() => navigate('windows')} />
          </div>
        </>
      }
    >
      <div className="flex flex-col gap-[40px]">
        {/* Base Dose table */}
        <div className="flex flex-col gap-[24px]">
          <div className="flex gap-[16px] items-center">
            <MedicationIcon size={48} />
            <p className="font-['Roboto',sans-serif] font-bold leading-[40px] text-[#00769e] text-[36px] tracking-[0.1px]" style={{ fontVariationSettings: "'wdth' 100" }}>
              Default delivery
            </p>
          </div>

          {bigIncrease && (
            <div className="bg-[#fdf3d1] rounded-[12px] px-[28px] py-[20px] flex gap-[20px] items-start">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" className="shrink-0 mt-[2px]"><path d="M12 3L2 20h20L12 3z" stroke="#b3850e" strokeWidth="1.8" strokeLinejoin="round" /><path d="M12 10v4" stroke="#b3850e" strokeWidth="2" strokeLinecap="round" /><circle cx="12" cy="17" r="1.1" fill="#b3850e" /></svg>
              <div className="flex flex-col gap-[4px]">
                <p className="font-['Roboto',sans-serif] font-bold text-[#b3850e] text-[26px] tracking-[0.1px]" style={{ fontVariationSettings: "'wdth' 100" }}>Large dose increase &gt; 100%</p>
                <p className="font-['Roboto',sans-serif] font-normal text-[#7a5c0a] text-[24px] tracking-[0.1px]" style={{ fontVariationSettings: "'wdth' 100" }}>Please double-check for a decimal slip — e.g. 80 instead of 8 mcg/d.</p>
              </div>
            </div>
          )}

          <div className="grid items-center gap-x-[16px] gap-y-[20px] [grid-template-columns:260px_1fr_1fr_56px]">
            {/* Column headers above the value fields */}
            <span />
            <p className="font-['Roboto',sans-serif] font-bold text-[#00769e] text-[24px] leading-[28px] tracking-[0.1px]" style={{ fontVariationSettings: "'wdth' 100" }}>Default delivery per day</p>
            <p className="font-['Roboto',sans-serif] font-bold text-[#00769e] text-[24px] leading-[28px] tracking-[0.1px]" style={{ fontVariationSettings: "'wdth' 100" }}>Dose per delivery</p>
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
                    <div className="bg-white border-2 border-[#6b7785] rounded-[8px] h-[72px] flex items-center pl-[20px] pr-[16px] gap-[8px] focus-within:border-[#0094c5]">
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
                        className="flex-1 min-w-px font-bold text-[#45483c] text-[40px] leading-[52px] bg-transparent outline-none border-0 p-0 placeholder:font-normal placeholder:text-[#9ea8b2] placeholder:text-[28px]"
                        placeholder="0"
                        style={{ fontFamily: 'Roboto, sans-serif', fontVariationSettings: "'wdth' 100" }}
                      />
                      <span className="font-['Roboto',sans-serif] font-normal text-[#a5a5a5] text-[28px] text-right" style={{ fontVariationSettings: "'wdth' 100" }}>{d.unit}/d</span>
                    </div>
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
        <div className={`flex flex-col gap-[28px] mt-[36px] ${freqValid ? '' : 'opacity-40 pointer-events-none'}`}>
          <div className="flex gap-[16px] items-center">
            <DeliveryIcon size={44} />
            <p className="font-['Roboto',sans-serif] font-bold leading-[40px] text-[#00769e] text-[36px] tracking-[0.1px]" style={{ fontVariationSettings: "'wdth' 100" }}>
              Delivery Frequency
            </p>
          </div>

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
      </div>
    </WizardShell>
  );
}
