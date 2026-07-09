import { useRef } from 'react';
import { useNavigate } from '../navigation';
import { useTherapy, fmtDose, doseUnitFor, concUgPerUl, coDoseUgDay, BOLUS_VOLUME_UL } from '../therapy';
import { WizardShell } from '../components/WizardShell';
import { TherapyHeaderChart } from '../components/TherapyHeaderChart';

/**
 * Pointer-driven slider. The whole prototype canvas is rendered inside a CSS
 * `transform: scale()`, where native <input type=range> dragging is unreliable
 * (notably Safari/touch). Deriving the value from getBoundingClientRect() — which
 * reflects the transform — makes dragging work at any scale, on any browser.
 */
function RangeSlider({ min, max, value, disabled, steps, onChange }: { min: number; max: number; value: number; disabled?: boolean; steps?: number[]; onChange: (n: number) => void }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const idx = steps ? Math.max(0, steps.indexOf(value)) : 0;
  const pct = steps
    ? (steps.length > 1 ? idx / (steps.length - 1) : 1)
    : (max > min ? (value - min) / (max - min) : 1);
  const setFromX = (clientX: number) => {
    const el = trackRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const ratio = r.width > 0 ? Math.min(1, Math.max(0, (clientX - r.left) / r.width)) : 0;
    if (steps) {
      if (!steps.length) return;
      onChange(steps[Math.round(ratio * (steps.length - 1))]);
    } else {
      onChange(Math.round(min + ratio * (max - min)));
    }
  };
  return (
    <div
      ref={trackRef}
      onPointerDown={e => { if (disabled) return; e.currentTarget.setPointerCapture(e.pointerId); setFromX(e.clientX); }}
      onPointerMove={e => { if (disabled) return; if (!e.currentTarget.hasPointerCapture(e.pointerId)) return; setFromX(e.clientX); }}
      className={`relative w-full h-[44px] flex items-center select-none touch-none ${disabled ? '' : 'cursor-pointer'}`}
    >
      <div className="absolute left-0 right-0 h-[12px] rounded-full bg-[#cfe6f1]" />
      <div className="absolute left-0 h-[12px] rounded-full bg-[#0094c5]" style={{ width: `${pct * 100}%` }} />
      <div
        className="absolute size-[44px] rounded-full bg-[#0094c5] border-4 border-white -translate-x-1/2"
        style={{ left: `${pct * 100}%`, boxShadow: '0 2px 6px rgba(0,0,0,0.2)' }}
      />
    </div>
  );
}

function SyringeIcon() {
  return (
    <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#0094c5" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="m18 2 4 4" />
      <path d="m17 7 3-3" />
      <path d="M19 9 8.7 19.3c-1 1-2.5 1-3.4 0l-.6-.6c-1-1-1-2.5 0-3.4L15 5" />
      <path d="m9 11 4 4" />
      <path d="m5 19-3 3" />
      <path d="m14 4 6 6" />
    </svg>
  );
}

/** A read-out tile listing a value per medication (e.g. the bolus dose). */
function MultiDoseCard({ label, rows, highlight }: { label: string; rows: { name: string; value: string; unit: string }[]; highlight?: boolean }) {
  return (
    <div className={`flex-1 rounded-[16px] px-[24px] py-[20px] flex flex-col gap-[10px] ${highlight ? 'bg-[#d1eaf8]' : 'bg-[#e6f4f9]'}`}>
      <p className="font-['Roboto',sans-serif] font-bold text-[#00769e] text-[22px] tracking-[0.1px]" style={{ fontVariationSettings: "'wdth' 100" }}>{label}</p>
      <div className="flex flex-col gap-[10px]">
        {rows.map(r => (
          <div key={r.name} className="flex flex-col whitespace-nowrap">
            <span className="font-['Roboto',sans-serif] font-normal text-[#5f8aa0] text-[20px] tracking-[0.1px]" style={{ fontVariationSettings: "'wdth' 100" }}>{r.name}</span>
            <span>
              <span className="font-['Roboto',sans-serif] font-bold text-[#00769e] text-[30px]" style={{ fontVariationSettings: "'wdth' 100" }}>{r.value}</span>
              <span className="font-['Roboto',sans-serif] font-normal text-[#5f8aa0] text-[20px] ml-[4px]" style={{ fontVariationSettings: "'wdth' 100" }}>{r.unit}</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/** A read-out tile: label on top, big value + small unit below. */
function StatCard({ label, value, unit, highlight }: { label: string; value: string; unit: string; highlight?: boolean }) {
  return (
    <div className={`flex-1 rounded-[16px] px-[24px] py-[20px] flex flex-col gap-[8px] ${highlight ? 'bg-[#d1eaf8]' : 'bg-[#e6f4f9]'}`}>
      <p className="font-['Roboto',sans-serif] font-bold text-[#00769e] text-[22px] tracking-[0.1px]" style={{ fontVariationSettings: "'wdth' 100" }}>{label}</p>
      <p className="font-['Roboto',sans-serif] tracking-[0.1px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
        <span className="font-bold text-[#00769e] text-[40px]">{value}</span>{' '}
        <span className="font-normal text-[#5f8aa0] text-[24px]">{unit}</span>
      </p>
    </div>
  );
}

export function BolusFrequency() {
  const navigate = useNavigate();
  const { baseDose, bolusCount, maxBoluses, freqOptions, setBolusCount, medications } = useTherapy();

  // Slider snaps through the valid frequencies (divisors of the day's stroke count).
  const sliderMin = freqOptions.length ? freqOptions[0] : 0;
  const valid = freqOptions.length > 0;
  const minutesBetween = bolusCount > 0 ? 1440 / bolusCount : 0;
  // Per-bolus dose for every medication, each in its own unit (mg or µg).
  const c0 = medications[0] ? concUgPerUl(medications[0]) : 1;
  const bolusDoses = medications.map((m, i) => {
    const ugDay = i === 0 ? baseDose : coDoseUgDay(baseDose, c0, concUgPerUl(m));
    const perBolusUg = bolusCount > 0 ? ugDay / bolusCount : 0;
    const u = doseUnitFor(m.unit);
    return { name: m.name || (i === 0 ? 'Primary' : 'Medication'), value: valid ? fmtDose(perBolusUg / u.div) : '--', unit: `${u.unit}/bolus` };
  });

  return (
    <WizardShell step="frequency" onBack={() => navigate('base-dose')} banner={<TherapyHeaderChart />}>
      <div className="flex-1 flex flex-col">
        <div className="flex flex-col gap-[40px]">
          {/* Title */}
          <div className="flex gap-[16px] items-center">
            <SyringeIcon />
            <p className="font-['Roboto',sans-serif] font-bold leading-[40px] text-[#00769e] text-[36px] tracking-[0.1px]" style={{ fontVariationSettings: "'wdth' 100" }}>
              Bolus Frequency
            </p>
          </div>

          {/* Slider */}
          <div className="flex flex-col gap-[16px]">
            <RangeSlider min={sliderMin} max={Math.max(sliderMin, maxBoluses)} value={bolusCount} steps={freqOptions} disabled={!valid} onChange={setBolusCount} />
            <div className="flex justify-between">
              <span className="font-['Roboto',sans-serif] font-bold text-[#00769e] text-[32px] tracking-[0.1px]" style={{ fontVariationSettings: "'wdth' 100" }}>{valid ? sliderMin : '--'}</span>
              <span className="font-['Roboto',sans-serif] font-bold text-[#00769e] text-[32px] tracking-[0.1px]" style={{ fontVariationSettings: "'wdth' 100" }}>{valid ? maxBoluses : '--'}</span>
            </div>
          </div>

          {/* Read-out cards */}
          <div className="flex gap-[16px]">
            <StatCard label="Bolus number" value={valid ? String(bolusCount) : '--'} unit="boluses" highlight />
            <MultiDoseCard label="Bolus dose" rows={bolusDoses} highlight />
            <StatCard label="Bolus size" value={String(BOLUS_VOLUME_UL)} unit="µl" />
            <StatCard label="Time between bolus" value={valid ? `~${Math.round(minutesBetween)}` : '--'} unit="min" />
          </div>
        </div>

        {/* Save CTA */}
        <div
          onClick={() => { if (valid) navigate('windows'); }}
          className={`mt-auto flex h-[88px] items-center justify-center px-[40px] rounded-[80px] w-full ${valid ? 'bg-[#0094c5] cursor-pointer' : 'bg-[#cbcbcb] cursor-not-allowed'}`}
        >
          <p className={`font-['Roboto',sans-serif] font-bold leading-[32px] text-[24px] tracking-[0.1px] ${valid ? 'text-white' : 'text-[#a5a5a5]'}`} style={{ fontVariationSettings: "'wdth' 100" }}>
            Save
          </p>
        </div>
      </div>
    </WizardShell>
  );
}
