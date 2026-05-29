import { useNavigate } from '../navigation';
import { useTherapy, STROKE_OPTIONS, deliveryPlan, fmtInterval, type StrokeStrategy } from '../therapy';
import { WizardShell } from '../components/WizardShell';

function DeliveryIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
      <path d="M6 8v24M34 8v24" stroke="#0094c5" strokeWidth="3" strokeLinecap="round" />
      <path d="M12 20h16M14 15l-5 5 5 5M26 15l5 5-5 5" stroke="#0094c5" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function RegularTherapy() {
  const navigate = useNavigate();
  const { baseDose, strokeStrategy, setStrokeStrategy, medications } = useTherapy();
  const selectedIdx = STROKE_OPTIONS.findIndex(o => o.bundle === strokeStrategy);
  const selected = STROKE_OPTIONS[selectedIdx >= 0 ? selectedIdx : 0];
  const plan = deliveryPlan(baseDose, medications[0]?.concentration ?? 1, selected.bundle);

  return (
    <WizardShell step="therapy" onBack={() => navigate('intervals-empty')}>
      <div className="flex-1 flex flex-col">
        <div className="flex flex-col gap-[40px]">
          {/* Title */}
          <div className="flex flex-col gap-[16px]">
            <div className="flex items-center gap-[16px]">
              <DeliveryIcon />
              <p className="font-['Roboto',sans-serif] font-extrabold leading-[40px] text-[#00769e] text-[36px] tracking-[0.1px]" style={{ fontVariationSettings: "'wdth' 100" }}>
                Time interval between medication delivery
              </p>
              <div className="bg-[#0094c5] h-[36px] px-[16px] rounded-[18px] flex items-center shrink-0">
                <p className="font-['Roboto',sans-serif] font-bold text-[16px] text-white tracking-[0.1px]" style={{ fontVariationSettings: "'wdth' 100" }}>optional</p>
              </div>
            </div>
            <p className="font-['Roboto',sans-serif] font-normal leading-[32px] text-[#45483c] text-[24px] tracking-[0.1px]" style={{ fontVariationSettings: "'wdth' 100" }}>
              Adjust the interval between medication delivery
            </p>
          </div>

          {/* 5-dot slider */}
          <div className="relative w-full h-[60px]">
            <div className="absolute left-[24px] right-[24px] top-[27px] h-[6px] bg-[#d9dbde] rounded-[3px]" />
            <div className="absolute inset-0 flex items-center justify-between px-[0px]">
              {STROKE_OPTIONS.map((opt, i) => {
                const active = i === selectedIdx;
                return (
                  <div
                    key={opt.bundle}
                    onClick={() => setStrokeStrategy(opt.bundle as StrokeStrategy)}
                    className={`size-[48px] rounded-full cursor-pointer border-2 ${active ? 'bg-[#0094c5] border-[#0094c5]' : 'bg-white border-[#d9dbde]'}`}
                    title={opt.label}
                  />
                );
              })}
            </div>
          </div>

          {/* Selected option card */}
          <div className="w-full border-2 border-[#0094c5] rounded-[16px] bg-[#e6f4f9] px-[32px] py-[24px] flex flex-col gap-[12px]">
            <p className="font-['Roboto',sans-serif] font-bold text-[#00769e] text-[32px] tracking-[0.1px]" style={{ fontVariationSettings: "'wdth' 100" }}>
              {selected.label} · every {fmtInterval(plan.intervalMin)}
            </p>
            <p className="font-['Roboto',sans-serif] font-normal text-[#667380] text-[20px] tracking-[0.1px]" style={{ fontVariationSettings: "'wdth' 100" }}>
              {Math.round(plan.deliveriesPerDay)} deliveries/day
            </p>
            <div className="bg-[#d9dbde] h-px w-full my-[8px]" />
            <p className="font-['Roboto',sans-serif] font-normal text-[#667380] text-[16px] tracking-[0.1px]" style={{ fontVariationSettings: "'wdth' 100" }}>
              Per delivery
            </p>
            <p className="font-['Roboto',sans-serif] font-bold text-[#00769e] text-[28px] tracking-[0.1px]" style={{ fontVariationSettings: "'wdth' 100" }}>
              {plan.dosePerDelivery.toFixed(1)} µg
            </p>
          </div>
        </div>

        {/* Continue CTA */}
        <div
          onClick={() => navigate('review')}
          className="mt-auto flex h-[88px] items-center justify-center px-[40px] rounded-[80px] w-full bg-[#0094c5] cursor-pointer"
        >
          <p className="font-['Roboto',sans-serif] font-bold leading-[32px] text-white text-[24px] tracking-[0.1px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
            Continue to review
          </p>
        </div>
      </div>
    </WizardShell>
  );
}
