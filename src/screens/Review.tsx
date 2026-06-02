import { useState } from 'react';
import { useNavigate } from '../navigation';
import {
  useTherapy,
  coDoseUgDay,
  doseColor,
  doseStringsFor,
  estimatedDailyTotal,
  withBaseFillers,
  deliveryPlan,
  fmtInterval,
  fmtTime,
  STROKE_OPTIONS,
  type Interval,
} from '../therapy';
import { WizardShell } from '../components/WizardShell';
import { MedSummary } from '../components/MedSummary';

function ReviewIcon() {
  return (
    <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
      <circle cx="22" cy="22" r="20" fill="#0094c5" />
      <path d="M30 16a10 10 0 1 0 2 8" stroke="white" strokeWidth="3" strokeLinecap="round" fill="none" />
      <path d="M31 11v6h-6" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

function timeRangeLabel(startMin: number, endMin: number): string {
  const endDisplay = endMin >= 1440 ? '23:59' : fmtTime(Math.max(0, endMin - 1));
  return `${fmtTime(startMin)} - ${endDisplay}`;
}

function Chart({ intervals, baseDose, unit }: { intervals: Interval[]; baseDose: number; unit: string }) {
  const slots = withBaseFillers(intervals, baseDose);
  const maxDose = Math.max(baseDose, ...slots.map(s => s.dose), 1);
  const FLOOR = 150;
  const MAX_BAR = 116;
  return (
    <div className="relative w-full bg-[#f7fafc] border border-[#d9dbde] rounded-[16px]" style={{ height: 200 }}>
      {['00:00', '06:00', '12:00', '18:00', '24:00'].map((t, i) => (
        <p key={t} className="absolute font-['Roboto',sans-serif] text-[#9ea8b2] text-[16px] top-[14px] whitespace-nowrap"
           style={{ left: `${[1.5, 24.5, 48.5, 72.5, 95.5][i]}%`, fontVariationSettings: "'wdth' 100" }}>{t}</p>
      ))}
      {slots.map(slot => {
        const left = (slot.startMin / 1440) * 100;
        const width = ((slot.endMin - slot.startMin) / 1440) * 100;
        const height = (slot.dose / maxDose) * MAX_BAR;
        return (
          <div key={slot.id} className="absolute rounded-[4px] flex items-start justify-center overflow-hidden"
            style={{ left: `${left}%`, width: `${width}%`, top: FLOOR - height, height, background: doseColor(slot.dose, baseDose), opacity: slot.isBase ? 0.7 : 1 }}>
            {width > 7 && (
              <p className="font-['Roboto',sans-serif] font-bold text-[13px] text-white pt-[6px] tracking-[0.1px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
                {doseStringsFor(slot.dose, unit).perHour} {doseStringsFor(slot.dose, unit).unit}/h
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}

export function Review() {
  const navigate = useNavigate();
  const { baseDose, intervals, weekendIntervals, strokeStrategy, dayPattern, useBaseOnly, medications } = useTherapy();
  const [confirmed, setConfirmed] = useState(false);
  const [tab, setTab] = useState<'weekdays' | 'weekend'>('weekdays');
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const toggleExpanded = (id: string) =>
    setExpanded(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const primaryUnit = medications[0]?.unit ?? 'µg/ml';
  const ordered = [...intervals].sort((a, b) => a.startMin - b.startMin);
  const orderedWeekend = [...weekendIntervals].sort((a, b) => a.startMin - b.startMin);
  const showToggle = !useBaseOnly && dayPattern !== 'same';
  const selected = useBaseOnly ? [] : (tab === 'weekend' ? orderedWeekend : ordered);

  const strokeOpt = STROKE_OPTIONS.find(s => s.bundle === strokeStrategy) ?? STROKE_OPTIONS[0];
  const plan = deliveryPlan(baseDose, medications[0]?.concentration ?? 1, strokeOpt.bundle);
  const estDaily = useBaseOnly ? baseDose : estimatedDailyTotal(baseDose, selected);
  const onActivate = () => { if (confirmed) navigate('activate'); };

  return (
    <WizardShell step="review" onBack={() => navigate(useBaseOnly ? 'regular-therapy' : 'intervals-populated')}>
      <div className="flex-1 flex flex-col gap-[24px]">
        {/* Title */}
        <div className="flex items-center gap-[16px]">
          <ReviewIcon />
          <p className="font-['Roboto',sans-serif] font-extrabold text-[#00769e] text-[36px] tracking-[0.1px]" style={{ fontVariationSettings: "'wdth' 100" }}>Review</p>
        </div>

        {useBaseOnly ? (
          /* Base-only: delivery-interval card */
          <div className="w-full border-2 border-[#0094c5] rounded-[16px] bg-[#e6f4f9] px-[32px] py-[24px] flex flex-col gap-[12px]">
            <p className="font-['Roboto',sans-serif] font-bold text-[#00769e] text-[28px] tracking-[0.1px]" style={{ fontVariationSettings: "'wdth' 100" }}>
              {strokeOpt.label} · every {fmtInterval(plan.intervalMin)}
            </p>
            <p className="font-['Roboto',sans-serif] font-normal text-[#667380] text-[18px] tracking-[0.1px]" style={{ fontVariationSettings: "'wdth' 100" }}>
              {Math.round(plan.deliveriesPerDay)} deliveries/day
            </p>
            <div className="bg-[#d9dbde] h-px w-full my-[8px]" />
            <p className="font-['Roboto',sans-serif] font-normal text-[#667380] text-[14px] tracking-[0.1px]" style={{ fontVariationSettings: "'wdth' 100" }}>Per delivery</p>
            <p className="font-['Roboto',sans-serif] font-bold text-[#00769e] text-[24px] tracking-[0.1px]" style={{ fontVariationSettings: "'wdth' 100" }}>{plan.dosePerDelivery.toFixed(1)} µg</p>
          </div>
        ) : (
          <>
            {/* Mon–Fri / Sat–Sun toggle */}
            {showToggle && (
              <div className="flex gap-[8px]">
                {(['weekdays', 'weekend'] as const).map(t => {
                  const active = tab === t;
                  return (
                    <div key={t} onClick={() => setTab(t)}
                      className={`flex-1 flex items-center justify-center h-[60px] rounded-[12px] cursor-pointer select-none ${active ? 'bg-[#0094c5]' : 'bg-[#e6f4f9]'}`}>
                      <p className={`font-['Roboto',sans-serif] font-bold text-[22px] tracking-[0.1px] ${active ? 'text-white' : 'text-[#5f7388]'}`} style={{ fontVariationSettings: "'wdth' 100" }}>
                        {t === 'weekdays' ? 'Mon–Fri' : 'Sat–Sun'}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}

            <Chart intervals={selected} baseDose={baseDose} unit={primaryUnit} />

            {/* Interval detail list */}
            <div className="grid items-center [grid-template-columns:1fr_220px_160px_180px_40px] px-[16px]">
              <p className="font-['Roboto',sans-serif] font-bold text-[#00769e] text-[18px] tracking-[1px]">INTERVALS</p>
              <p className="font-['Roboto',sans-serif] font-bold text-[#00769e] text-[18px] tracking-[1px]">Time</p>
              <p className="font-['Roboto',sans-serif] font-bold text-[#00769e] text-[18px] tracking-[1px]">Δ from base</p>
              <p className="font-['Roboto',sans-serif] font-bold text-[#00769e] text-[18px] tracking-[1px]">Dose / h</p>
              <span />
            </div>
            <div className="flex flex-col gap-[12px]">
              {selected.map(iv => {
                const pct = baseDose > 0 ? Math.round(((iv.dose - baseDose) / baseDose) * 100) : 0;
                const isOpen = expanded.has(iv.id);
                const c0 = medications[0]?.concentration ?? 1;
                return (
                  <div key={iv.id} className="bg-white border border-[#d9dbde] rounded-[12px] overflow-hidden">
                    <div
                      onClick={() => toggleExpanded(iv.id)}
                      className="grid items-center [grid-template-columns:1fr_220px_160px_180px_40px] h-[72px] px-[16px] cursor-pointer select-none">
                      <p className="font-['Roboto',sans-serif] font-bold text-[#00769e] text-[24px] tracking-[0.1px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>{iv.label}</p>
                      <p className="font-['Roboto',sans-serif] font-normal text-[#667380] text-[22px] tracking-[0.1px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>{timeRangeLabel(iv.startMin, iv.endMin)}</p>
                      <p className="font-['Roboto',sans-serif] font-bold text-[#0094c5] text-[22px] tracking-[0.1px]" style={{ fontVariationSettings: "'wdth' 100" }}>{pct >= 0 ? '+' : '−'} {Math.abs(pct)} %</p>
                      <p className="font-['Roboto',sans-serif] text-[#00769e] text-[22px] tracking-[0.1px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}><span className="font-bold">{doseStringsFor(iv.dose, primaryUnit).perHour}</span> {doseStringsFor(iv.dose, primaryUnit).unit}/h</p>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="justify-self-end transition-transform duration-200" style={{ transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)' }}>
                        <path d="M9 6l6 6-6 6" stroke="#0094c5" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                    {isOpen && (
                      <div className="border-t border-[#e3e6e9] bg-[#f7fafc] px-[16px] py-[16px] flex flex-col gap-[10px]">
                        {medications.map((m, i) => {
                          const ug = i === 0 ? iv.dose : coDoseUgDay(iv.dose, c0, m.concentration);
                          const ds = doseStringsFor(ug, m.unit);
                          return (
                            <div key={m.id} className="grid [grid-template-columns:1fr_220px_160px_180px_40px] items-center">
                              <p className="font-['Roboto',sans-serif] font-bold text-[#00769e] text-[20px] tracking-[0.1px]" style={{ fontVariationSettings: "'wdth' 100" }}>{m.name}</p>
                              <span />
                              <span />
                              <p className="font-['Roboto',sans-serif] text-[#00769e] text-[20px] tracking-[0.1px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}><span className="font-bold">{ds.perHour}</span> {ds.unit}/h</p>
                              <span />
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}

        <MedSummary baseDose={baseDose} estDaily={estDaily} medications={medications} />

        {/* Footer — confirm + Activate */}
        <div className="mt-auto w-full flex flex-col gap-[24px]">
          <label className="flex items-center gap-[16px] cursor-pointer select-none">
            <span onClick={() => setConfirmed(c => !c)}
              className={`size-[40px] rounded-[6px] flex items-center justify-center border-2 ${confirmed ? 'bg-[#0094c5] border-[#0094c5]' : 'bg-white border-[#9ea8b2]'}`}>
              {confirmed && (
                <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                  <path d="M4 11.5L9 16L18 6" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </span>
            <p onClick={() => setConfirmed(c => !c)} className="font-['Roboto',sans-serif] font-normal text-[#45483c] text-[22px] tracking-[0.1px]" style={{ fontVariationSettings: "'wdth' 100" }}>
              I confirm that the data is correct and may be transferred.
            </p>
          </label>
          <div onClick={onActivate}
            className={`flex items-center justify-center h-[88px] px-[40px] rounded-[80px] w-full ${confirmed ? 'bg-[#2eab6b] cursor-pointer' : 'bg-[#cbcbcb] cursor-not-allowed'}`}>
            <p className={`font-['Roboto',sans-serif] font-bold leading-[32px] text-[24px] tracking-[0.1px] ${confirmed ? 'text-white' : 'text-[#a5a5a5]'}`} style={{ fontVariationSettings: "'wdth' 100" }}>
              Activate
            </p>
          </div>
        </div>
      </div>
    </WizardShell>
  );
}
