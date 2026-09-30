import { useNavigate } from '../navigation';
import { useTherapy, STROKE_OPTIONS, deliveryPlan, doseUnitFor, fmtPerDelivery, fmtInterval, type StrokeStrategy } from '../therapy';
import { WizardShell } from '../components/WizardShell';

function DeliveryIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
      <path d="M6 8v24M34 8v24" stroke="#0b786a" strokeWidth="3" strokeLinecap="round" />
      <path d="M12 20h16M14 15l-5 5 5 5M26 15l5 5-5 5" stroke="#0b786a" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/**
 * Delivery-interval diagram: one tick per delivery across a 00:00–24:00 axis
 * (dense for short intervals, sparse for long ones); tick height ∝ per-delivery
 * dose, scaled to the largest per-delivery dose across all strategies (the
 * most-spaced one). Edge-to-edge, time axis only — the dose value lives in the
 * card heading above it.
 */
function DeliveryDiagram({ deliveriesPerDay, dosePerDelivery, baseDose }:
  { deliveriesPerDay: number; dosePerDelivery: number; baseDose: number }) {
  const W = 1000, H = 240, LEFT = 8, RIGHT = 8, TOP = 16, BASE = 194;
  const plotW = W - LEFT - RIGHT;
  const maxBarH = BASE - TOP;
  // Fixed dose scale = most-spaced per-delivery dose (fewest deliveries/day).
  const minDeliveries = 1440 / Math.max(...STROKE_OPTIONS.map(o => o.intervalMin));
  const maxDose = baseDose / minDeliveries;
  const n = Math.max(1, Math.round(deliveriesPerDay));
  const barH = maxDose > 0 ? (dosePerDelivery / maxDose) * maxBarH : 0;
  const barW = Math.min(10, (plotW / n) * 0.5);
  const times = ['00:00', '06:00', '12:00', '18:00', '24:00'];
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full block" style={{ height: 240 }}>
      {/* delivery ticks */}
      {Array.from({ length: n }).map((_, i) => {
        const x = LEFT + ((i + 0.5) / n) * plotW - barW / 2;
        return <rect key={i} x={x} y={BASE - barH} width={barW} height={barH} rx={Math.min(2, barW / 2)} fill="#0b786a" />;
      })}
      {/* baseline */}
      <line x1={LEFT} y1={BASE} x2={W - RIGHT} y2={BASE} stroke="#cedfd9" strokeWidth="1.5" />
      {/* time axis labels (first/last anchored inward so they don't clip) */}
      {times.map((t, i) => {
        const last = times.length - 1;
        const anchor = i === 0 ? 'start' : i === last ? 'end' : 'middle';
        return (
          <text key={t} x={LEFT + (i / last) * plotW} y={BASE + 34} textAnchor={anchor} fontFamily="Roboto, sans-serif" fontSize="22" fill="#596d68">{t}</text>
        );
      })}
    </svg>
  );
}

export function RegularTherapy() {
  const navigate = useNavigate();
  const { baseDose, strokeStrategy, setStrokeStrategy, medications } = useTherapy();
  const selectedIdx = STROKE_OPTIONS.findIndex(o => o.bundle === strokeStrategy);
  const selected = STROKE_OPTIONS[selectedIdx >= 0 ? selectedIdx : 0];
  const plan = deliveryPlan(baseDose, selected.intervalMin);
  const { unit, div } = doseUnitFor(medications[0]?.unit ?? 'mcg/ml');
  const perDeliveryStr = fmtPerDelivery(plan.dosePerDelivery / div, unit);

  return (
    <WizardShell step="delivery" onBack={() => navigate('intervals-empty')}>
      <div className="flex-1 flex flex-col">
        <div className="flex flex-col gap-[40px]">
          {/* Title */}
          <div className="flex items-center gap-[16px] py-[20px]">
            <DeliveryIcon />
            <p className="font-['Roboto',sans-serif] font-extrabold leading-[48px] text-[#096657] text-[36px] tracking-[0.1px]" style={{ fontVariationSettings: "'wdth' 100" }}>
              Delivery frequency
            </p>
            <div className="bg-[#0b786a] h-[36px] px-[16px] rounded-[18px] flex items-center shrink-0">
              <p className="font-['Roboto',sans-serif] font-bold text-[16px] text-white tracking-[0.1px]" style={{ fontVariationSettings: "'wdth' 100" }}>optional</p>
            </div>
          </div>

          {/* Combined card: heading + per-stroke value + delivery diagram */}
          <div className="w-full border-2 border-[#0b786a] rounded-[16px] bg-[#f5fcf9] px-[32px] py-[28px] flex flex-col gap-[20px]">
            <div className="flex items-baseline justify-between gap-[16px]">
              <p className="font-['Roboto',sans-serif] font-bold text-[#096657] text-[32px] tracking-[0.1px]" style={{ fontVariationSettings: "'wdth' 100" }}>
                {selected.label} · every {fmtInterval(plan.intervalMin)}
              </p>
              <div className="flex items-baseline gap-[10px] shrink-0">
                <p className="font-['Roboto',sans-serif] font-normal text-[#596d68] text-[28px] tracking-[0.1px]" style={{ fontVariationSettings: "'wdth' 100" }}>
                  Per delivery
                </p>
                <p className="font-['Roboto',sans-serif] font-bold text-[#096657] text-[36px] tracking-[0.1px]" style={{ fontVariationSettings: "'wdth' 100" }}>
                  {perDeliveryStr} {unit}
                </p>
              </div>
            </div>
            <DeliveryDiagram
              deliveriesPerDay={plan.deliveriesPerDay}
              dosePerDelivery={plan.dosePerDelivery}
              baseDose={baseDose}
            />
            <p className="font-['Roboto',sans-serif] font-normal text-[#596d68] text-[32px] tracking-[0.1px]" style={{ fontVariationSettings: "'wdth' 100" }}>
              {Math.round(plan.deliveriesPerDay)} deliveries/24h
            </p>
          </div>

          {/* 5-dot slider */}
          <div className="relative w-full h-[60px]">
            <div className="absolute left-[24px] right-[24px] top-[27px] h-[6px] bg-[#cedfd9] rounded-[3px]" />
            <div className="absolute inset-0 flex items-center justify-between px-[0px]">
              {STROKE_OPTIONS.map((opt, i) => {
                const active = i === selectedIdx;
                return (
                  <div
                    key={opt.bundle}
                    onClick={() => setStrokeStrategy(opt.bundle as StrokeStrategy)}
                    className={`size-[48px] rounded-full cursor-pointer border-2 ${active ? 'bg-[#0b786a] border-[#0b786a]' : 'bg-white border-[#cedfd9]'}`}
                    title={opt.label}
                  />
                );
              })}
            </div>
          </div>
        </div>

        {/* Continue CTA */}
        <div
          onClick={() => navigate('review')}
          className="mt-auto flex h-[88px] items-center justify-center px-[40px] rounded-[80px] w-full bg-[#0b786a] cursor-pointer"
        >
          <p className="font-['Roboto',sans-serif] font-bold leading-[32px] text-white text-[24px] tracking-[0.1px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
            Continue to review
          </p>
        </div>
      </div>
    </WizardShell>
  );
}
