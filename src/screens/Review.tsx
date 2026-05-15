const imgBBraunMiethkeSignet = "/icons/4f8511f8-f529-46a8-b909-a49950430add.svg";
const imgStatePrevious = "/icons/65fb638f-64a2-4cac-bf27-061b6ca7199c.svg";
const imgEllipse72 = "/icons/08cd4787-4961-4d6a-9886-b5856dbf65e9.svg";
const imgIconsStepper = "/icons/e48e1004-7e0d-402b-b742-fd74751b3e3f.svg";
const imgVector38 = "/icons/7444f284-9ad5-4c1d-bcb5-80661ae78ee9.svg";
const imgVector37 = "/icons/cd030e9c-ad07-4728-85a2-bc3e609805f7.svg";
const imgVector39 = "/icons/09d07ee1-8497-4320-a868-84e51ec30008.svg";
const imgEllipse73 = "/icons/2667e458-37cf-431c-a238-5fbadd480475.svg";
const imgVector40 = "/icons/d3922ae3-48fa-4a8c-b9fd-781b12f78719.svg";
const imgVector41 = "/icons/9ac87c4f-6f94-47ff-96c4-c7da718ee15e.svg";
const imgVector = "/icons/8172abaa-def6-4d2f-91e4-03fcf6cb9429.svg";
const imgVector1 = "/icons/21a8a1af-d0f0-4862-8dbe-069c6a3885a7.svg";
const imgVector2 = "/icons/d4932741-ef5a-4772-a5b4-10133d63d891.svg";
const imgVector3 = "/icons/b23ffef8-9ede-4c38-8d31-10400b76cc50.svg";
const imgVector4 = "/icons/610be446-08e6-48b3-9889-80c21d161e90.svg";
const imgVector5 = "/icons/c9b4c79f-5345-4f19-b53b-f80e8716fdab.svg";
const imgVector6 = "/icons/ea41a2ff-a138-4288-add9-1f3bad871c34.svg";
const imgVector7 = "/icons/bb364f37-79f6-4aae-8d09-b7b061515a80.svg";
const imgVector8 = "/icons/f8441590-ac94-4592-b9ea-75582cd9b2e5.svg";
const imgVector9 = "/icons/dae19ef2-ca0a-4e2a-8883-938d92b9ed4d.svg";
const imgVector10 = "/icons/f3399ffd-1309-4048-b882-41f39faccb60.svg";
const imgVector11 = "/icons/1f248429-07ac-4993-9d0a-a561106261d9.svg";

function BBraunMiethkeSignet({ className }: { className?: string }) {
  return (
    <div className={className || "h-[105.45px] overflow-clip relative w-[89.17px]"}>
      <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgBBraunMiethkeSignet} />
    </div>
  );
}

function IconsStepper({ className }: { className?: string }) {
  return (
    <div className={className || "relative size-[40px]"}>
      <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgStatePrevious} />
    </div>
  );
}

import { useEffect, useState } from 'react';
import { useNavigate } from '../navigation';
import {
  useTherapy,
  doseColor,
  estimatedDailyTotal,
  withBaseFillers,
  STROKE_OPTIONS,
  type Interval,
} from '../therapy';
import { IntervalPreview } from '../components/IntervalPreview';
import { DailyTotalsCard } from '../components/DailyTotalsCard';

// Mini chart geometry within the 1040px chart container.
const MINI_LEFT_PAD = 12;
const MINI_RIGHT_PAD = 12;

function MiniChart({
  intervals,
  baseDose,
  width,
  height,
  onBarClick,
}: {
  intervals: Interval[];
  baseDose: number;
  width: number;
  height: number;
  onBarClick: (id: string) => void;
}) {
  const slots = withBaseFillers(intervals, baseDose);
  const innerWidth = width - MINI_LEFT_PAD - MINI_RIGHT_PAD;
  // Scale bars to fit nicely inside the chart container.
  const maxDose = Math.max(baseDose, ...intervals.map(i => i.dose));
  const scale = maxDose > 0 ? (height - 16) / maxDose : 0;
  return (
    <div className="relative" style={{ width, height }}>
      {/* Tick labels */}
      {['00:00', '06:00', '12:00', '18:00', '24:00'].map((t, i) => (
        <p
          key={t}
          className="absolute font-['Roboto',sans-serif] font-normal text-[#9ea8b2] text-[14px] tracking-[0.1px]"
          style={{
            top: 6,
            left: MINI_LEFT_PAD + (innerWidth * i) / 4 - (i === 0 ? 0 : i === 4 ? 36 : 18),
            fontVariationSettings: "'wdth' 100",
          }}
        >
          {t}
        </p>
      ))}
      {slots.map(slot => {
        const left = MINI_LEFT_PAD + (slot.startMin / 1440) * innerWidth;
        const w = ((slot.endMin - slot.startMin) / 1440) * innerWidth;
        const h = slot.dose * scale;
        const top = height - h;
        return (
          <div
            key={slot.id}
            onClick={slot.isBase ? undefined : () => onBarClick(slot.id)}
            className={`absolute rounded-[3px] flex items-start justify-center ${slot.isBase ? '' : 'cursor-pointer'}`}
            style={{
              left, top, width: w, height: h,
              background: doseColor(slot.dose, baseDose),
              opacity: slot.isBase ? 0.7 : 1,
            }}
          >
            {!slot.isBase && w > 50 && (
              <p className="font-['Roboto',sans-serif] font-bold text-[12px] text-white pt-[4px] tracking-[0.1px]" style={{ fontVariationSettings: "'wdth' 100" }}>
                {(slot.dose / 24).toFixed(1)} µg/h
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
  const { baseDose, intervals, weekendIntervals, strokeStrategy, dayPattern, setPreviewIntervalId, useBaseOnly } = useTherapy();
  const [confirmed, setConfirmed] = useState(false);
  useEffect(() => {
    setPreviewIntervalId(null);
    return () => setPreviewIntervalId(null);
  }, [setPreviewIntervalId]);
  const effectiveIntervals = useBaseOnly ? [] : intervals;
  const effectiveWeekendIntervals = useBaseOnly ? [] : weekendIntervals;
  const ordered = [...effectiveIntervals].sort((a, b) => a.startMin - b.startMin);
  const orderedWeekend = [...effectiveWeekendIntervals].sort((a, b) => a.startMin - b.startMin);
  const onBarClick = (id: string) => setPreviewIntervalId(id);
  const stroke = STROKE_OPTIONS.find(s => s.min === strokeStrategy) ?? STROKE_OPTIONS[0];
  const perStrokeUg = stroke.strokesPerDay > 0 ? baseDose / stroke.strokesPerDay : 0;
  const showTwoCharts = !useBaseOnly && dayPattern !== 'same';
  const estDaily = estimatedDailyTotal(baseDose, effectiveIntervals);
  const onActivate = () => { if (confirmed) navigate('activate'); };

  return (
    <div className="bg-white relative size-full">
      <div className="absolute bg-[#3b2d7c] h-[35px] left-0 top-0 w-[1200px]" />

      {/* Body — flex column so content stacks naturally */}
      <div className="absolute left-0 top-[235px] h-[1685px] w-[1200px] flex flex-col items-start justify-between px-[80px] py-[60px]">
        <div className="flex flex-col gap-[40px] items-start w-full">
          {/* Title row */}
          <div className="flex items-center gap-[16px]">
            <div className="size-[48px] rounded-full bg-[#e6f4f9] border-2 border-[#0094c5] flex items-center justify-center">
              <p className="font-['Roboto',sans-serif] font-bold text-[#0094c5] text-[20px] tracking-[0.1px]" style={{ fontVariationSettings: "'wdth' 100" }}>R</p>
            </div>
            <p className="font-['Roboto',sans-serif] font-bold text-[#00769e] text-[36px] tracking-[0.1px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
              Review
            </p>
          </div>

          {useBaseOnly ? (
            /* Variant 3 — base-only: show the delivery-interval card instead of charts */
            <div className="w-full flex flex-col gap-[16px]">
              <p className="font-['Roboto',sans-serif] font-bold text-[#00769e] text-[24px] tracking-[0.1px]" style={{ fontVariationSettings: "'wdth' 100" }}>
                Delivery Interval
              </p>
              <div className="border-2 border-[#0094c5] rounded-[16px] bg-[#e6f4f9] px-[32px] py-[24px] flex flex-col gap-[12px]">
                <p className="font-['Roboto',sans-serif] font-bold text-[#00769e] text-[28px] tracking-[0.1px]" style={{ fontVariationSettings: "'wdth' 100" }}>
                  {stroke.label} · every {stroke.min} minutes
                </p>
                <p className="font-['Roboto',sans-serif] font-normal text-[#667380] text-[18px] tracking-[0.1px]" style={{ fontVariationSettings: "'wdth' 100" }}>
                  {stroke.strokesPerDay} strokes/day
                </p>
                <div className="bg-[#d9dbde] h-px w-full my-[8px]" />
                <p className="font-['Roboto',sans-serif] font-normal text-[#667380] text-[14px] tracking-[0.1px]" style={{ fontVariationSettings: "'wdth' 100" }}>
                  Per stroke
                </p>
                <p className="font-['Roboto',sans-serif] font-bold text-[#00769e] text-[24px] tracking-[0.1px]" style={{ fontVariationSettings: "'wdth' 100" }}>
                  {perStrokeUg.toFixed(1)} µg
                </p>
              </div>
            </div>
          ) : (
            <div className="w-full flex flex-col gap-[24px]">
              {/* Variant 1 / 2 — one or two charts depending on day pattern */}
              <div className="flex flex-col gap-[12px]">
                <p className="font-['Roboto',sans-serif] font-bold text-[#00769e] text-[24px] tracking-[0.1px]" style={{ fontVariationSettings: "'wdth' 100" }}>
                  {showTwoCharts ? 'Intervals on Weekdays' : 'Intervals'}
                </p>
                <div className="bg-[#f7fafc] border border-[#d9dbde] rounded-[16px] w-full" style={{ height: 180 }}>
                  <MiniChart intervals={ordered} baseDose={baseDose} width={1040 - 2} height={178} onBarClick={onBarClick} />
                </div>
              </div>
              {showTwoCharts && (
                <div className="flex flex-col gap-[12px]">
                  <p className="font-['Roboto',sans-serif] font-bold text-[#00769e] text-[24px] tracking-[0.1px]" style={{ fontVariationSettings: "'wdth' 100" }}>
                    Intervals on Weekends
                  </p>
                  <div className="bg-[#f7fafc] border border-[#d9dbde] rounded-[16px] w-full" style={{ height: 180 }}>
                    <MiniChart intervals={orderedWeekend} baseDose={baseDose} width={1040 - 2} height={178} onBarClick={onBarClick} />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 24h totals — circular icon + 3 medication rows */}
          <DailyTotalsCard estDailyUg={useBaseOnly ? baseDose : estDaily} className="w-full" />

          {/* Inline interval preview (only relevant when bars are clickable) */}
          {!useBaseOnly && (
            <div className="w-full relative">
              <IntervalPreview top={0} left={0} width={1040} />
            </div>
          )}
        </div>

        {/* Footer — confirmation + Activate */}
        <div className="w-full flex flex-col gap-[24px] items-start">
          <label className="flex items-center gap-[16px] cursor-pointer select-none">
            <span
              onClick={() => setConfirmed(c => !c)}
              className={`size-[40px] rounded-[6px] flex items-center justify-center border-2 ${confirmed ? 'bg-[#0094c5] border-[#0094c5]' : 'bg-white border-[#9ea8b2]'}`}
            >
              {confirmed && (
                <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                  <path d="M4 11.5L9 16L18 6" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </span>
            <p
              onClick={() => setConfirmed(c => !c)}
              className="font-['Roboto',sans-serif] font-normal text-[#45483c] text-[22px] tracking-[0.1px]"
              style={{ fontVariationSettings: "'wdth' 100" }}
            >
              I confirm that the data is correct and may be transferred.
            </p>
          </label>
          <div
            onClick={onActivate}
            className={`flex items-center justify-center h-[88px] min-w-[240px] px-[40px] rounded-[80px] w-full ${confirmed ? 'bg-[#2eab6b] cursor-pointer' : 'bg-[#cbcbcb] cursor-not-allowed'}`}
          >
            <p className={`font-['Roboto',sans-serif] font-bold leading-[32px] text-[24px] tracking-[0.1px] whitespace-nowrap ${confirmed ? 'text-white' : 'text-[#a5a5a5]'}`} style={{ fontVariationSettings: "'wdth' 100" }}>
              Activate
            </p>
          </div>
        </div>
      </div>

      {/* Stepper — Dosage done, Review active */}
      <div className="absolute content-stretch flex items-center left-0 top-[164px] w-[1200px]">
        <div className="content-stretch flex flex-[1_0_0] h-[64px] items-center min-w-px mr-[-10px] relative">
          <div className="bg-[#e6f4f9] content-stretch flex flex-[1_0_0] h-[64px] items-start min-w-px overflow-clip pl-[40px] pr-[16px] py-[8px] relative">
            <div className="content-stretch flex flex-[1_0_0] items-start min-w-px relative">
              <div className="content-stretch flex gap-[16px] h-[48px] items-center relative shrink-0 w-[184px]">
                <div className="relative shrink-0 size-[40px]">
                  <div className="absolute aspect-[34/34] left-0 right-0 top-0">
                    <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgEllipse72} />
                  </div>
                  <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgIconsStepper} />
                </div>
                <p className="flex-[1_0_0] font-['Roboto',sans-serif] font-normal leading-[24px] min-w-px relative text-[#00769e] text-[20px] tracking-[0.1px]" style={{ fontVariationSettings: "'wdth' 100" }}>
                  Dosage
                </p>
              </div>
            </div>
          </div>
          <div className="h-[64px] relative shrink-0 w-[28px]">
            <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgVector38} />
          </div>
        </div>
        <div className="content-stretch flex flex-[1_0_0] h-[64px] items-center min-w-px mr-[-10px] relative">
          <div className="h-[64px] relative shrink-0 w-[30px]">
            <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgVector37} />
          </div>
          <div className="bg-[#d1eaf8] content-stretch flex flex-[1_0_0] h-[64px] items-start min-w-px overflow-clip px-[16px] py-[8px] relative">
            <div className="content-stretch flex flex-[1_0_0] items-start min-w-px relative">
              <div className="content-stretch flex gap-[16px] h-[48px] items-center relative shrink-0 w-[184px]">
                <div className="relative shrink-0 size-[40px]">
                  <div className="absolute aspect-[34/34] left-0 right-0 top-0">
                    <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgEllipse72} />
                  </div>
                  <div className="absolute aspect-[34/34] left-[32.5%] right-[32.5%] top-[13px]">
                    <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgEllipse73} />
                  </div>
                </div>
                <p className="flex-[1_0_0] font-['Roboto',sans-serif] font-normal leading-[24px] min-w-px relative text-[#00769e] text-[20px] tracking-[0.1px]" style={{ fontVariationSettings: "'wdth' 100" }}>
                  Review
                </p>
              </div>
            </div>
          </div>
          <div className="h-[64px] relative shrink-0 w-[28px]">
            <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgVector39} />
          </div>
        </div>
        <div className="content-stretch flex flex-[1_0_0] h-[64px] items-center min-w-px relative">
          <div className="h-[64px] relative shrink-0 w-[30px]">
            <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgVector40} />
          </div>
          <div className="bg-[#f0f0f0] content-stretch flex flex-[1_0_0] h-[64px] items-start min-w-px overflow-clip px-[16px] py-[8px] relative">
            <div className="content-stretch flex flex-[1_0_0] items-start min-w-px relative">
              <div className="content-stretch flex gap-[16px] h-[48px] items-center relative shrink-0 w-[184px]">
                <IconsStepper className="relative shrink-0 size-[40px]" />
                <p className="flex-[1_0_0] font-['Roboto',sans-serif] font-normal leading-[24px] min-w-px relative text-[#a5a5a5] text-[20px] tracking-[0.1px]" style={{ fontVariationSettings: "'wdth' 100" }}>
                  Activate
                </p>
              </div>
            </div>
          </div>
          <div className="h-[64px] relative shrink-0 w-[28px]">
            <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgVector41} />
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="absolute bg-[#e6f4f9] content-stretch flex h-[120px] items-center justify-between left-0 overflow-x-clip overflow-y-auto px-[40px] py-[8px] top-[35px] w-[1200px]">
        <div className="content-stretch flex gap-[40px] items-center relative shrink-0 w-[669px]">
          <div onClick={() => navigate(useBaseOnly ? 'regular-therapy' : 'intervals-populated')} className="flex items-center justify-center relative shrink-0 cursor-pointer">
            <div className="flex-none rotate-180">
              <div className="overflow-clip relative size-[56px]">
                <div className="absolute inset-[20%_0.03%_17.61%_0]">
                  <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgVector} />
                </div>
              </div>
            </div>
          </div>
          <div className="content-stretch flex gap-[16px] items-center relative shrink-0">
            <div className="overflow-clip relative shrink-0 size-[64px]">
              <div className="-translate-x-1/2 absolute aspect-[400/400] bottom-0 left-1/2 overflow-clip top-0">
                <div className="absolute contents inset-[18.92%_30.29%_32.95%_15.2%]">
                  <div className="absolute inset-[18.92%_30.29%_71%_15.2%]"><img alt="" className="absolute block inset-0 max-w-none size-full" src={imgVector1} /></div>
                  <div className="absolute inset-[27.82%_50.03%_32.95%_15.2%]"><img alt="" className="absolute block inset-0 max-w-none size-full" src={imgVector2} /></div>
                </div>
                <div className="absolute inset-[12.67%_35.51%_78.7%_20.41%]"><img alt="" className="absolute block inset-0 max-w-none size-full" src={imgVector3} /></div>
                <div className="absolute inset-[47.67%_52.31%_41.86%_37.22%]"><img alt="" className="absolute block inset-0 max-w-none size-full" src={imgVector4} /></div>
                <div className="absolute inset-[26.63%_30.29%_70.99%_15.2%]"><img alt="" className="absolute block inset-0 max-w-none size-full" src={imgVector5} /></div>
                <div className="absolute inset-[47.67%_66.88%_41.86%_22.65%]"><img alt="" className="absolute block inset-0 max-w-none size-full" src={imgVector6} /></div>
                <div className="absolute inset-[33.1%_66.88%_56.43%_22.65%]"><img alt="" className="absolute block inset-0 max-w-none size-full" src={imgVector7} /></div>
                <div className="absolute inset-[33.1%_52.31%_56.43%_37.22%]"><img alt="" className="absolute block inset-0 max-w-none size-full" src={imgVector8} /></div>
                <div className="absolute inset-[32.13%_22.02%_58.18%_61.41%]"><img alt="" className="absolute block inset-0 max-w-none size-full" src={imgVector9} /></div>
                <div className="absolute inset-[39.42%_15.2%_12.67%_54.61%]"><img alt="" className="absolute block inset-0 max-w-none size-full" src={imgVector10} /></div>
                <div className="absolute inset-[28.93%_31.08%_71%_64.17%]"><img alt="" className="absolute block inset-0 max-w-none size-full" src={imgVector11} /></div>
              </div>
            </div>
            <p className="font-['Roboto',sans-serif] font-extrabold leading-[56px] relative shrink-0 text-[#00769e] text-[48px] tracking-[0.1px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
              Therapy
            </p>
          </div>
        </div>
        <div className="content-stretch flex gap-[100px] items-center relative shrink-0">
          <BBraunMiethkeSignet className="h-[62px] overflow-clip relative shrink-0 w-[53px]" />
        </div>
      </div>
    </div>
  );
}
