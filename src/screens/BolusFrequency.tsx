import { useRef } from 'react';
import { useNavigate } from '../navigation';
import { useTherapy, fmtDose, doseUnitFor, BOLUS_VOLUME_UL, MIN_BOLUSES_PER_DAY } from '../therapy';
import { WizardShell } from '../components/WizardShell';
import { TherapyHeaderChart } from '../components/TherapyHeaderChart';

/**
 * Pointer-driven slider. The whole prototype canvas is rendered inside a CSS
 * `transform: scale()`, where native <input type=range> dragging is unreliable
 * (notably Safari/touch). Deriving the value from getBoundingClientRect() — which
 * reflects the transform — makes dragging work at any scale, on any browser.
 */
function RangeSlider({ min, max, value, disabled, onChange }: { min: number; max: number; value: number; disabled?: boolean; onChange: (n: number) => void }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const pct = max > min ? (value - min) / (max - min) : 1;
  const setFromX = (clientX: number) => {
    const el = trackRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const ratio = r.width > 0 ? Math.min(1, Math.max(0, (clientX - r.left) / r.width)) : 0;
    onChange(Math.round(min + ratio * (max - min)));
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
    <svg width="44" height="44" viewBox="0 0 24 24" fill="none">
      <path d="M14 4l6 6M17 7l-9 9-3.5 1.5L6 14l9-9M4.5 19.5L3 21M8 16l-4 4" stroke="#0094c5" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
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
  const { baseDose, bolusCount, maxBoluses, setBolusCount, medications } = useTherapy();

  // Slider runs from the minimum frequency up to the maximum the dose allows.
  const sliderMin = Math.min(MIN_BOLUSES_PER_DAY, maxBoluses);
  const valid = maxBoluses > 0;
  // Bolus dose reported in the primary medication's unit (mg or µg).
  const doseU = doseUnitFor(medications[0]?.unit ?? 'µg/ml');
  const bolusDoseUg = bolusCount > 0 ? baseDose / bolusCount : 0;
  const minutesBetween = bolusCount > 0 ? 1440 / bolusCount : 0;

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
            <RangeSlider min={sliderMin} max={Math.max(sliderMin, maxBoluses)} value={bolusCount} disabled={!valid} onChange={setBolusCount} />
            <div className="flex justify-between">
              <span className="font-['Roboto',sans-serif] font-bold text-[#00769e] text-[32px] tracking-[0.1px]" style={{ fontVariationSettings: "'wdth' 100" }}>{valid ? sliderMin : '--'}</span>
              <span className="font-['Roboto',sans-serif] font-bold text-[#00769e] text-[32px] tracking-[0.1px]" style={{ fontVariationSettings: "'wdth' 100" }}>{valid ? maxBoluses : '--'}</span>
            </div>
          </div>

          {/* Read-out cards */}
          <div className="flex gap-[16px]">
            <StatCard label="Bolus number" value={valid ? String(bolusCount) : '--'} unit="boluses" highlight />
            <StatCard label="Bolus dose" value={valid ? fmtDose(bolusDoseUg / doseU.div) : '--'} unit={`${doseU.unit}/bolus`} highlight />
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
