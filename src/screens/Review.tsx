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

import { useEffect } from 'react';
import { useNavigate } from '../navigation';
import {
  useTherapy,
  morphineMgDay,
  bupivacaineMgDay,
  hourlyUg,
  doseColor,
  estimatedDailyTotal,
  STROKE_OPTIONS,
} from '../therapy';
import { IntervalPreview } from '../components/IntervalPreview';

// Mini chart layout
const MINI_LEFT = 92;
const MINI_WIDTH = 1016;
const MINI_SCALE = 0.152; // px per µg
const WEEKDAYS_BOTTOM = 985;
const WEEKEND_BOTTOM = 1115;

function MiniChartBars({
  intervals,
  baseDose,
  bottom,
  onBarClick,
}: {
  intervals: ReturnType<typeof useTherapy>['intervals'];
  baseDose: number;
  bottom: number;
  onBarClick: (id: string) => void;
}) {
  return (
    <>
      {intervals.map(iv => {
        const left = MINI_LEFT + (iv.startMin / 1440) * MINI_WIDTH;
        const width = ((iv.endMin - iv.startMin) / 1440) * MINI_WIDTH;
        const height = iv.dose * MINI_SCALE;
        const top = bottom - height;
        return (
          <div
            key={iv.id}
            onClick={() => onBarClick(iv.id)}
            className="absolute rounded-[3px] cursor-pointer"
            style={{ left, top, width, height, background: doseColor(iv.dose, baseDose) }}
          />
        );
      })}
    </>
  );
}

export function Review() {
  const navigate = useNavigate();
  const { baseDose, intervals, weekendIntervals, strokeStrategy, setPreviewIntervalId } = useTherapy();
  useEffect(() => {
    setPreviewIntervalId(null);
    return () => setPreviewIntervalId(null);
  }, [setPreviewIntervalId]);
  const ordered = [...intervals].sort((a, b) => a.startMin - b.startMin);
  const orderedWeekend = [...weekendIntervals].sort((a, b) => a.startMin - b.startMin);
  const onBarClick = (id: string) => setPreviewIntervalId(id);
  const stroke = STROKE_OPTIONS.find(s => s.min === strokeStrategy) ?? STROKE_OPTIONS[2];
  const baclofenH = hourlyUg(baseDose);
  const morMgD = morphineMgDay(baseDose);
  const morMgH = morMgD / 24;
  const bupMgD = bupivacaineMgDay(baseDose);
  const bupMgH = bupMgD / 24;
  const estDaily = estimatedDailyTotal(baseDose, intervals);
  const estMorMgD = morphineMgDay(estDaily);
  const estBupMgD = bupivacaineMgDay(estDaily);
  return (
    <div className="bg-white relative size-full">
      <div className="absolute bg-[#3b2d7c] h-[35px] left-0 top-0 w-[1200px]" />
      <p className="absolute font-['Inter:Bold',sans-serif] font-bold leading-[normal] left-[80px] not-italic text-[#063b66] text-[36px] top-[270px] w-[1040px]">
        Review your therapy
      </p>
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[normal] left-[80px] not-italic text-[#667380] text-[24px] top-[322px] whitespace-nowrap">
        Frida K. · 42 yo · RRMS
      </p>
      <div className="absolute bg-[#d9dbde] h-px left-[80px] top-[388px] w-[1040px]" />
      <p className="absolute font-['Inter:Bold',sans-serif] font-bold leading-[normal] left-[80px] not-italic text-[#063b66] text-[26px] top-[408px] whitespace-nowrap">{`Base dose & delivery`}</p>
      <p className="absolute font-['Roboto:Regular',sans-serif] font-normal leading-[24px] left-[540px] text-[#9ea8b2] text-[24px] top-[435px] tracking-[0.1px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
        Daily dose
      </p>
      <p className="absolute font-['Roboto:Regular',sans-serif] font-normal leading-[24px] left-[540px] text-[#9ea8b2] text-[24px] top-[1314px] tracking-[0.1px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
        Daily total
      </p>
      <p className="absolute font-['Roboto:Regular',sans-serif] font-normal leading-[24px] left-[880px] text-[#9ea8b2] text-[24px] top-[435px] tracking-[0.1px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
        Hourly dose
      </p>
      <div className="absolute bg-white border-2 border-[#0b7fa8] border-solid h-[56px] left-[80px] overflow-clip rounded-[8px] top-[468px] w-[1040px]">
        <div className="absolute content-stretch flex gap-[12px] items-center left-[14px] top-[14px]">
          <p className="font-['Inter:Bold',sans-serif] font-bold leading-[normal] not-italic relative shrink-0 text-[#063b66] text-[24px] whitespace-nowrap">
            Baclofen
          </p>
          <div className="bg-[#0b7fa8] h-[22px] overflow-clip relative rounded-[11px] shrink-0 w-[72px]">
            <p className="absolute font-['Inter:Bold',sans-serif] font-bold leading-[normal] left-[10.5px] not-italic text-[11px] text-white top-[4.5px] whitespace-nowrap">
              PRIMARY
            </p>
          </div>
        </div>
        <p className="absolute font-['Inter:Bold',sans-serif] font-bold leading-[normal] left-[458px] not-italic text-[#063b66] text-[22px] top-[15px] whitespace-nowrap">
          {baseDose} µg/day
        </p>
        <p className="absolute font-['Inter:Bold',sans-serif] font-bold leading-[normal] left-[798px] not-italic text-[#063b66] text-[22px] top-[15px] whitespace-nowrap">
          ≈ {baclofenH.toFixed(1)} µg/h
        </p>
      </div>
      <div className="absolute bg-[#d9ebf5] border-2 border-[#0b7fa8] border-solid h-[56px] left-[80px] overflow-clip rounded-[8px] top-[1347px] w-[1040px]">
        <div className="absolute content-stretch flex gap-[12px] items-center left-[14px] top-[14px]">
          <p className="font-['Inter:Bold',sans-serif] font-bold leading-[normal] not-italic relative shrink-0 text-[#063b66] text-[24px] whitespace-nowrap">
            Baclofen
          </p>
          <div className="bg-[#0b7fa8] h-[22px] overflow-clip relative rounded-[11px] shrink-0 w-[72px]">
            <p className="absolute font-['Inter:Bold',sans-serif] font-bold leading-[normal] left-[10.5px] not-italic text-[11px] text-white top-[4.5px] whitespace-nowrap">
              PRIMARY
            </p>
          </div>
        </div>
        <p className="absolute font-['Inter:Bold',sans-serif] font-bold leading-[normal] left-[458px] not-italic text-[#063b66] text-[22px] top-[15px] whitespace-nowrap">
          {estDaily.toFixed(0)} µg/day
        </p>
      </div>
      <div className="absolute bg-white border border-[#d9dbde] border-solid h-[56px] leading-[normal] left-[80px] not-italic overflow-clip rounded-[8px] top-[532px] w-[1040px] whitespace-nowrap">
        <p className="absolute font-['Inter:Semi_Bold',sans-serif] font-semibold left-[23px] text-[#063b66] text-[24px] top-[13px]">
          Morphine
        </p>
        <p className="absolute font-['Inter:Medium',sans-serif] font-medium left-[459px] text-[#667380] text-[22px] top-[15px]">
          {morMgD.toFixed(2)} mg/day
        </p>
        <p className="absolute font-['Inter:Regular',sans-serif] font-normal left-[799px] text-[#667380] text-[22px] top-[15px]">
          {morMgH.toFixed(3)} mg/h
        </p>
      </div>
      <div className="absolute bg-[#d9ebf5] border border-[#d9dbde] border-solid h-[56px] leading-[normal] left-[80px] not-italic overflow-clip rounded-[8px] top-[1411px] w-[1040px] whitespace-nowrap">
        <p className="absolute font-['Inter:Semi_Bold',sans-serif] font-semibold left-[23px] text-[#063b66] text-[24px] top-[13px]">
          Morphine
        </p>
        <p className="absolute font-['Inter:Medium',sans-serif] font-medium left-[459px] text-[#667380] text-[22px] top-[15px]">
          {estMorMgD.toFixed(2)} mg/day
        </p>
      </div>
      <div className="absolute bg-white border border-[#d9dbde] border-solid h-[56px] leading-[normal] left-[80px] not-italic overflow-clip rounded-[8px] top-[596px] w-[1040px] whitespace-nowrap">
        <p className="absolute font-['Inter:Semi_Bold',sans-serif] font-semibold left-[23px] text-[#063b66] text-[24px] top-[13px]">
          Bupivacaine
        </p>
        <p className="absolute font-['Inter:Medium',sans-serif] font-medium left-[459px] text-[#667380] text-[22px] top-[15px]">
          {bupMgD.toFixed(2)} mg/day
        </p>
        <p className="absolute font-['Inter:Regular',sans-serif] font-normal left-[799px] text-[#667380] text-[22px] top-[15px]">
          {bupMgH.toFixed(3)} mg/h
        </p>
      </div>
      <div className="absolute bg-[#d9ebf5] border border-[#d9dbde] border-solid h-[56px] leading-[normal] left-[80px] not-italic overflow-clip rounded-[8px] top-[1475px] w-[1040px] whitespace-nowrap">
        <p className="absolute font-['Inter:Semi_Bold',sans-serif] font-semibold left-[23px] text-[#063b66] text-[24px] top-[13px]">
          Bupivacaine
        </p>
        <p className="absolute font-['Inter:Medium',sans-serif] font-medium left-[459px] text-[#667380] text-[22px] top-[15px]">
          {estBupMgD.toFixed(2)} mg/day
        </p>
      </div>
      <div className="absolute bg-[#f7fafc] h-[56px] leading-[normal] left-[80px] not-italic overflow-clip rounded-[8px] top-[660px] w-[1040px]">
        <p className="absolute font-['Inter:Semi_Bold',sans-serif] font-semibold left-[24px] text-[#063b66] text-[24px] top-[16px] whitespace-nowrap">
          Delivery stroke
        </p>
        <p className="absolute font-['Inter:Medium',sans-serif] font-medium left-[460px] text-[#667380] text-[22px] top-[18px] whitespace-pre">{`${stroke.min} min  ·  ${stroke.label}  ·  ${stroke.strokesPerDay} strokes/day`}</p>
      </div>
      <div className="absolute bg-[#d9dbde] h-px left-[80px] top-[778px] w-[1040px]" />
      <div className="absolute bg-[#d9dbde] h-px left-[80px] top-[1252px] w-[1040px]" />
      <p className="absolute font-['Inter:Bold',sans-serif] font-bold leading-[normal] left-[80px] not-italic text-[#063b66] text-[26px] top-[798px] whitespace-nowrap">
        Intervals
      </p>
      <p className="absolute font-['Inter:Bold',sans-serif] font-bold leading-[normal] left-[80px] not-italic text-[#063b66] text-[26px] top-[1282px] whitespace-nowrap">
        Estimated daily total
      </p>
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[normal] left-[220px] not-italic text-[#667380] text-[22px] top-[804px] whitespace-pre">{`Weekday / weekend  ·  5 + 5`}</p>
      <p className="absolute font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[normal] left-[80px] not-italic text-[#0b7fa8] text-[18px] top-[838px] whitespace-nowrap">{`↓ Tap a bar to see the interval's details`}</p>
      <p className="absolute font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[normal] left-[80px] not-italic text-[#063b66] text-[20px] top-[878px] whitespace-pre">{`Weekdays  ·  Mon-Fri`}</p>
      <div className="absolute bg-[#f7fafc] border border-[#d9dbde] border-solid h-[90px] left-[80px] rounded-[8px] top-[902px] w-[1040px]" />
      <MiniChartBars intervals={ordered} baseDose={baseDose} bottom={WEEKDAYS_BOTTOM} onBarClick={onBarClick} />
      <p className="absolute font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[normal] left-[80px] not-italic text-[#063b66] text-[20px] top-[1008px] whitespace-pre">{`Weekend  ·  Sat-Sun`}</p>
      <div className="absolute bg-[#f7fafc] border border-[#d9dbde] border-solid h-[90px] left-[80px] rounded-[8px] top-[1032px] w-[1040px]" />
      <MiniChartBars intervals={orderedWeekend} baseDose={baseDose} bottom={WEEKEND_BOTTOM} onBarClick={onBarClick} />
      {/* Inline preview — sits over the intervals area */}
      <IntervalPreview top={870} left={80} width={1040} />
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
                <p className="flex-[1_0_0] font-['Roboto:Regular',sans-serif] font-normal leading-[24px] min-w-px relative text-[#00769e] text-[24px] tracking-[0.1px]" style={{ fontVariationSettings: "'wdth' 100" }}>
                  Base Dose
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
          <div className="bg-[#e6f4f9] content-stretch flex flex-[1_0_0] h-[64px] items-start min-w-px overflow-clip px-[16px] py-[8px] relative">
            <div className="content-stretch flex flex-[1_0_0] items-start min-w-px relative">
              <div className="content-stretch flex gap-[16px] h-[48px] items-center relative shrink-0 w-[184px]">
                <div className="relative shrink-0 size-[40px]">
                  <div className="absolute aspect-[34/34] left-0 right-0 top-0">
                    <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgEllipse72} />
                  </div>
                  <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgIconsStepper} />
                </div>
                <p className="flex-[1_0_0] font-['Roboto:Regular',sans-serif] font-normal leading-[24px] min-w-px relative text-[#00769e] text-[24px] tracking-[0.1px]" style={{ fontVariationSettings: "'wdth' 100" }}>
                  Intervals
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
            <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgVector39} />
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
                <p className="flex-[1_0_0] font-['Roboto:Regular',sans-serif] font-normal leading-[24px] min-w-px relative text-[#00769e] text-[24px] tracking-[0.1px]" style={{ fontVariationSettings: "'wdth' 100" }}>
                  Review
                </p>
              </div>
            </div>
          </div>
          <div className="h-[64px] relative shrink-0 w-[28px]">
            <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgVector40} />
          </div>
        </div>
        <div className="content-stretch flex flex-[1_0_0] h-[64px] items-center min-w-px relative">
          <div className="h-[64px] relative shrink-0 w-[30px]">
            <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgVector41} />
          </div>
          <div className="bg-[#f0f0f0] content-stretch flex flex-[1_0_0] h-[64px] items-start min-w-px overflow-clip px-[16px] py-[8px] relative">
            <div className="content-stretch flex flex-[1_0_0] items-start min-w-px relative">
              <div className="content-stretch flex gap-[16px] h-[48px] items-center relative shrink-0 w-[184px]">
                <IconsStepper className="relative shrink-0 size-[40px]" />
                <p className="flex-[1_0_0] font-['Roboto:Regular',sans-serif] font-normal leading-[24px] min-w-px relative text-[#a5a5a5] text-[24px] tracking-[0.1px]" style={{ fontVariationSettings: "'wdth' 100" }}>
                  Activate
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="absolute bg-[#e6f4f9] content-stretch flex h-[120px] items-center justify-between left-0 overflow-x-clip overflow-y-auto px-[40px] py-[8px] top-[35px] w-[1200px]">
        <div className="content-stretch flex gap-[40px] items-center relative shrink-0 w-[669px]">
          <div onClick={() => navigate('intervals-populated')} className="flex items-center justify-center relative shrink-0 cursor-pointer">
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
            <p className="font-['Roboto:ExtraBold',sans-serif] font-extrabold leading-[56px] relative shrink-0 text-[#00769e] text-[48px] tracking-[0.1px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
              Therapy
            </p>
          </div>
        </div>
        <div className="content-stretch flex gap-[100px] items-center relative shrink-0">
          <BBraunMiethkeSignet className="h-[62px] overflow-clip relative shrink-0 w-[53px]" />
        </div>
      </div>
      <div onClick={() => navigate('activate')} className="absolute bg-[#2eab6b] h-[90px] left-[80px] overflow-clip rounded-[45px] top-[1778px] w-[1040px] cursor-pointer">
        <p className="absolute font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[normal] left-[412px] not-italic text-[28px] text-white top-[28px] whitespace-nowrap">
          Activate
        </p>
      </div>
    </div>
  );
}
