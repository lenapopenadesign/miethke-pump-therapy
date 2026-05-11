const imgStatePrevious = "/icons/7c235bc5-7127-424c-9618-232d0f9906e7.svg";
const imgBBraunMiethkeSignet = "/icons/9f250784-cad4-4195-99ce-4b9dc94364a5.svg";
const imgVector = "/icons/01195f3c-ce0c-4269-a4cc-2742bc124f77.svg";
const imgVector1 = "/icons/889ea9b6-c9de-4f9c-bf91-3c37bf141ad0.svg";
const imgVector2 = "/icons/276995c3-95e7-4f89-aaac-132fc8d43cfe.svg";
const imgVector3 = "/icons/8a2869d6-387c-43ba-be53-477de865f0e6.svg";
const imgVector4 = "/icons/7c7b5b07-d4a6-4c25-a285-b5ae561ae337.svg";
const imgVector5 = "/icons/a29a0a50-cce1-4dd6-a110-cfbbd664ae38.svg";
const imgVector6 = "/icons/e72c4c73-98ad-4a8b-acf6-a5ffea6349ac.svg";
const imgVector7 = "/icons/1168ccbe-efdb-4ea7-abe5-bf07b47af2b9.svg";
const imgVector8 = "/icons/07dfd97a-21eb-447c-b439-a9ca61e3faa6.svg";
const imgVector9 = "/icons/81a225f9-9876-43c1-9aaf-5b1d51426454.svg";
const imgVector10 = "/icons/7ff92c71-c015-413d-ad24-dec25e6e350b.svg";
const imgVector11 = "/icons/00f7418e-34cd-4431-ae37-ec0eb64b05e6.svg";
const imgEllipse72 = "/icons/815f2ff8-cf86-4d26-a856-f4dd1c28b94d.svg";
const imgEllipse73 = "/icons/8f4c5654-4dce-4ae1-96fb-6192337f71e1.svg";
const imgVector38 = "/icons/bb340433-66d7-4d99-8d2c-4b4aad876d8f.svg";
const imgVector37 = "/icons/1d72df2a-e2fa-44b5-b500-8101e9ef3cec.svg";
const imgVector39 = "/icons/f251b7a9-1365-427b-a36c-890bb6984572.svg";
const imgEbene1 = "/icons/13e8ee59-64ce-4c00-b8ac-c632e18518f1.svg";

type IconsStepperProps = {
  className?: string;
  state?: "previous";
};

function IconsStepper({ className }: IconsStepperProps) {
  return (
    <div className={className || "relative size-[40px]"}>
      <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgStatePrevious} />
    </div>
  );
}

function BBraunMiethkeSignet({ className }: { className?: string }) {
  return (
    <div className={className || "h-[105.45px] overflow-clip relative w-[89.17px]"}>
      <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgBBraunMiethkeSignet} />
    </div>
  );
}

import { useNavigate } from '../navigation';
import { useTherapy, morphineMgDay, bupivacaineMgDay, hourlyUg, STROKE_OPTIONS, type StrokeStrategy } from '../therapy';

export function BaseDose() {
  const navigate = useNavigate();
  const { baseDose, setBaseDose, strokeStrategy, setStrokeStrategy } = useTherapy();
  const stepDown = () => setBaseDose(Math.max(0, baseDose - 10));
  const stepUp = () => setBaseDose(Math.min(2000, baseDose + 10));
  const morMgD = morphineMgDay(baseDose);
  const morMgH = morMgD / 24;
  const bupMgD = bupivacaineMgDay(baseDose);
  const bupMgH = bupMgD / 24;
  const hourly = hourlyUg(baseDose);
  return (
    <div className="bg-white relative size-full">
      <div className="absolute bg-[#3b2d7c] h-[35px] left-0 top-0 w-[1200px]" />
      <div className="absolute bg-[#e6f4f9] content-stretch flex h-[120px] items-center justify-between left-0 overflow-x-clip overflow-y-auto px-[40px] py-[8px] top-[35px] w-[1200px]">
        <div className="content-stretch flex gap-[40px] items-center relative shrink-0 w-[669px]">
          <div onClick={() => navigate('home-no-therapy')} className="flex items-center justify-center relative shrink-0 cursor-pointer">
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
                  <div className="absolute inset-[18.92%_30.29%_71%_15.2%]">
                    <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgVector1} />
                  </div>
                  <div className="absolute inset-[27.82%_50.03%_32.95%_15.2%]">
                    <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgVector2} />
                  </div>
                </div>
                <div className="absolute inset-[12.67%_35.51%_78.7%_20.41%]">
                  <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgVector3} />
                </div>
                <div className="absolute inset-[47.67%_52.31%_41.86%_37.22%]">
                  <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgVector4} />
                </div>
                <div className="absolute inset-[26.63%_30.29%_70.99%_15.2%]">
                  <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgVector5} />
                </div>
                <div className="absolute inset-[47.67%_66.88%_41.86%_22.65%]">
                  <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgVector6} />
                </div>
                <div className="absolute inset-[33.1%_66.88%_56.43%_22.65%]">
                  <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgVector7} />
                </div>
                <div className="absolute inset-[33.1%_52.31%_56.43%_37.22%]">
                  <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgVector8} />
                </div>
                <div className="absolute inset-[32.13%_22.02%_58.18%_61.41%]">
                  <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgVector9} />
                </div>
                <div className="absolute inset-[39.42%_15.2%_12.67%_54.61%]">
                  <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgVector10} />
                </div>
                <div className="absolute inset-[28.93%_31.08%_71%_64.17%]">
                  <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgVector11} />
                </div>
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
      <div className="absolute content-stretch flex items-center left-0 top-[164px] w-[1200px]">
        <div className="content-stretch flex flex-[1_0_0] h-[64px] items-center min-w-px mr-[-10px] relative">
          <div className="bg-[#d1eaf8] content-stretch flex flex-[1_0_0] h-[64px] items-start min-w-px overflow-clip pl-[40px] pr-[16px] py-[8px] relative">
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
                <p className="flex-[1_0_0] font-['Roboto:Regular',sans-serif] font-normal leading-[24px] min-w-px relative text-[#00769e] text-[20px] tracking-[0.1px]" style={{ fontVariationSettings: "'wdth' 100" }}>
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
          <div className="bg-[#f0f0f0] content-stretch flex flex-[1_0_0] h-[64px] items-start min-w-px overflow-clip px-[16px] py-[8px] relative">
            <div className="content-stretch flex flex-[1_0_0] items-start min-w-px relative">
              <div className="content-stretch flex gap-[16px] h-[48px] items-center relative shrink-0 w-[184px]">
                <IconsStepper className="relative shrink-0 size-[40px]" />
                <p className="flex-[1_0_0] font-['Roboto:Regular',sans-serif] font-normal leading-[24px] min-w-px relative text-[#a5a5a5] text-[20px] tracking-[0.1px]" style={{ fontVariationSettings: "'wdth' 100" }}>
                  Intervals
                </p>
              </div>
            </div>
          </div>
          <div className="h-[64px] relative shrink-0 w-[28px]">
            <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgVector39} />
          </div>
        </div>
        <div className="content-stretch flex flex-[1_0_0] h-[64px] items-center min-w-px mr-[-10px] relative">
          <div className="h-[64px] relative shrink-0 w-[30px]">
            <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgVector37} />
          </div>
          <div className="bg-[#f0f0f0] content-stretch flex flex-[1_0_0] h-[64px] items-start min-w-px overflow-clip px-[16px] py-[8px] relative">
            <div className="content-stretch flex flex-[1_0_0] items-start min-w-px relative">
              <div className="content-stretch flex gap-[16px] h-[48px] items-center relative shrink-0 w-[184px]">
                <IconsStepper className="relative shrink-0 size-[40px]" />
                <p className="flex-[1_0_0] font-['Roboto:Regular',sans-serif] font-normal leading-[24px] min-w-px relative text-[#a5a5a5] text-[20px] tracking-[0.1px]" style={{ fontVariationSettings: "'wdth' 100" }}>
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
            <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgVector37} />
          </div>
          <div className="bg-[#f0f0f0] content-stretch flex flex-[1_0_0] h-[64px] items-start min-w-px overflow-clip px-[16px] py-[8px] relative">
            <div className="content-stretch flex flex-[1_0_0] items-start min-w-px relative">
              <div className="content-stretch flex gap-[16px] h-[48px] items-center relative shrink-0 w-[184px]">
                <IconsStepper className="relative shrink-0 size-[40px]" />
                <p className="flex-[1_0_0] font-['Roboto:Regular',sans-serif] font-normal leading-[24px] min-w-px relative text-[#a5a5a5] text-[20px] tracking-[0.1px]" style={{ fontVariationSettings: "'wdth' 100" }}>
                  Activate
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <p className="absolute font-['Inter:Bold',sans-serif] font-bold leading-[normal] left-[80px] not-italic text-[#063b66] text-[44px] top-[270px] w-[1040px]">
        Set the base dose
      </p>
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[normal] left-[80px] not-italic text-[#667380] text-[22px] top-[340px] w-[1040px]">{`Type the primary dose or use ± to adjust. `}</p>
      <div className="-translate-y-full absolute flex flex-col font-['Roboto:Regular',sans-serif] font-normal justify-end leading-[0] left-[688px] text-[#9ea8b2] text-[20px] top-[433px] tracking-[0.1px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
        <p className="leading-[24px]">Daily dose</p>
      </div>
      <div className="-translate-y-full absolute flex flex-col font-['Roboto:Regular',sans-serif] font-normal justify-end leading-[0] left-[975px] text-[#9ea8b2] text-[20px] top-[433px] tracking-[0.1px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
        <p className="leading-[24px]">Hourly dose</p>
      </div>
      <div className="absolute content-stretch flex flex-col gap-[24px] items-start left-[80px] top-[441px] w-[1040px]">
        <div className="bg-white border-2 border-[#0b7fa8] border-solid content-start flex flex-wrap gap-[0px_366px] items-start overflow-clip px-[24px] py-[20px] relative rounded-[16px] shrink-0 w-full">
          <div className="content-stretch flex flex-col gap-[8px] items-start opacity-80 relative shrink-0">
            <p className="font-['Inter:Bold',sans-serif] font-bold leading-[normal] not-italic relative shrink-0 text-[#063b66] text-[28px] whitespace-nowrap">
              Baclofen
            </p>
            <div className="bg-[#0b7fa8] h-[28px] overflow-clip relative rounded-[14px] shrink-0 w-[96px]">
              <p className="absolute font-['Inter:Bold',sans-serif] font-bold leading-[normal] left-[15.5px] not-italic text-[14px] text-white top-[5.5px] whitespace-nowrap">
                PRIMARY
              </p>
            </div>
          </div>
          <div className="content-stretch flex gap-[20px] items-center relative shrink-0">
            <div className="content-stretch flex gap-[8px] items-center relative shrink-0">
              <div onClick={stepDown} className="bg-[#f7fafc] border border-[#d9dbde] border-solid overflow-clip relative rounded-[12px] shrink-0 size-[60px] cursor-pointer select-none">
                <p className="absolute font-['Inter:Bold',sans-serif] font-bold leading-[normal] left-[16px] not-italic text-[#063b66] text-[36px] top-[7px] whitespace-nowrap">
                  −
                </p>
              </div>
              <div className="grid-cols-[max-content] grid-rows-[max-content] inline-grid leading-[0] place-items-start relative shrink-0">
                <div className="bg-white border-2 border-[#0b7fa8] border-solid col-1 h-[60px] ml-0 mt-0 relative rounded-[12px] row-1 w-[200px]" />
                <div className="col-1 content-stretch flex gap-[21px] items-center leading-[normal] ml-[26px] mt-[8px] not-italic relative row-1 whitespace-nowrap">
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={baseDose}
                    onChange={e => {
                      const n = parseInt(e.target.value.replace(/[^0-9]/g, ''), 10) || 0;
                      setBaseDose(Math.max(0, Math.min(2000, n)));
                    }}
                    className="font-bold not-italic text-[#063b66] text-[36px] bg-transparent outline-none border-0 p-0 w-[80px] text-left"
                    style={{ fontFamily: 'Inter, sans-serif', fontStyle: 'normal' }}
                  />
                  <p className="font-['Inter:Regular',sans-serif] font-normal relative shrink-0 text-[#667380] text-[16px]">
                    µg/day
                  </p>
                </div>
              </div>
              <div onClick={stepUp} className="bg-[#f7fafc] border border-[#d9dbde] border-solid overflow-clip relative rounded-[12px] shrink-0 size-[60px] cursor-pointer select-none">
                <p className="absolute font-['Inter:Bold',sans-serif] font-bold leading-[normal] left-[20px] not-italic text-[#063b66] text-[32px] top-[7px] whitespace-nowrap">
                  +
                </p>
              </div>
            </div>
            <div className="content-stretch flex gap-[20px] items-center leading-[normal] not-italic relative shrink-0 whitespace-nowrap">
              <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold relative shrink-0 text-[#0b7fa8] text-[24px]">
                ≈ {hourly.toFixed(1)}
              </p>
              <p className="font-['Inter:Regular',sans-serif] font-normal relative shrink-0 text-[#9ea8b2] text-[16px]">
                µg/h
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white border border-[#d9dbde] border-solid h-[88px] leading-[normal] not-italic overflow-clip relative rounded-[16px] shrink-0 w-full whitespace-nowrap">
          <p className="absolute font-['Inter:Semi_Bold',sans-serif] font-semibold left-[23px] text-[#063b66] text-[24px] top-[15px]">
            Morphine
          </p>
          <p className="absolute font-['Inter:Medium',sans-serif] font-medium left-[23px] text-[#9ea8b2] text-[16px] top-[49px]">
            calculated · 0.139% of Baclofen
          </p>
          <p className="absolute font-['Inter:Bold',sans-serif] font-bold left-[599px] text-[#667380] text-[26px] top-[26px]">
            {morMgD.toFixed(2)}
          </p>
          <p className="absolute font-['Inter:Regular',sans-serif] font-normal left-[669px] text-[#9ea8b2] text-[18px] top-[34px]">
            mg/day
          </p>
          <p className="absolute font-['Inter:Semi_Bold',sans-serif] font-semibold left-[897px] text-[#667380] text-[22px] top-[28px]">
            {morMgH.toFixed(3)}
          </p>
          <p className="absolute font-['Inter:Regular',sans-serif] font-normal left-[966px] text-[#9ea8b2] text-[16px] top-[34px]">
            mg/h
          </p>
        </div>
        <div className="bg-white border border-[#d9dbde] border-solid h-[88px] leading-[normal] not-italic overflow-clip relative rounded-[16px] shrink-0 w-full whitespace-nowrap">
          <p className="absolute font-['Inter:Semi_Bold',sans-serif] font-semibold left-[23px] text-[#063b66] text-[24px] top-[15px]">
            Bupivacaine
          </p>
          <p className="absolute font-['Inter:Medium',sans-serif] font-medium left-[23px] text-[#9ea8b2] text-[16px] top-[49px]">
            calculated · 0.417% of Baclofen
          </p>
          <p className="absolute font-['Inter:Bold',sans-serif] font-bold left-[605px] text-[#667380] text-[26px] top-[26px]">
            {bupMgD.toFixed(2)}
          </p>
          <p className="absolute font-['Inter:Regular',sans-serif] font-normal left-[669px] text-[#9ea8b2] text-[18px] top-[34px]">
            mg/day
          </p>
          <p className="absolute font-['Inter:Semi_Bold',sans-serif] font-semibold left-[894px] text-[#667380] text-[22px] top-[22px]">
            {bupMgH.toFixed(3)}
          </p>
          <p className="absolute font-['Inter:Regular',sans-serif] font-normal left-[968px] text-[#9ea8b2] text-[16px] top-[28px]">
            mg/h
          </p>
        </div>
      </div>
      <p className="absolute font-['Inter:Bold',sans-serif] font-bold leading-[normal] left-[80px] not-italic text-[#063b66] text-[30px] top-[1000px] whitespace-nowrap">
        Delivery stroke
      </p>
      <div className="absolute bg-[#9ea8b2] content-stretch flex items-center justify-center left-[319px] overflow-clip px-[16px] py-[6px] rounded-[14px] top-[1004px]">
        <p className="font-['Inter:Bold',sans-serif] font-bold leading-[normal] not-italic relative shrink-0 text-[14px] text-white whitespace-nowrap">
          optional
        </p>
      </div>
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[normal] left-[80px] not-italic text-[#667380] text-[22px] top-[1048px] w-[1040px]">
        How the pump releases medication: many small strokes (more continuous) or fewer larger strokes (more spaced).
      </p>
      {STROKE_OPTIONS.map((opt, i) => {
        const per = baseDose / opt.strokesPerDay;
        const perStroke = `${per % 1 === 0 ? per.toFixed(0) : per.toFixed(1)} µg`;
        // Bar widths from the original Figma: 30 → 2.667, 60 → 5.333, 120/240/480 → 8
        const barWidth = i === 0 ? 2.667 : i === 1 ? 5.333 : 8;
        return (
          <DeliveryStrokeCard
            key={opt.min}
            left={80 + i * 208}
            title={`${opt.min} min`}
            subtitle={opt.label}
            detail={`${opt.strokesPerDay} strokes/day`}
            perStroke={perStroke}
            barCount={opt.strokesPerDay}
            barWidth={barWidth}
            selected={strokeStrategy === opt.min}
            onSelect={() => setStrokeStrategy(opt.min as StrokeStrategy)}
          />
        );
      })}
      <div className="absolute content-stretch flex gap-[12px] items-center left-[80px] top-[1460px]">
        <div className="overflow-clip relative shrink-0 size-[28px]">
          <div className="-translate-x-1/2 absolute aspect-[159.24000549316406/159.24000549316406] bottom-0 left-[calc(50%+0.5px)] overflow-clip top-0">
            <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgEbene1} />
          </div>
        </div>
        <div className="font-['Inter:Regular',sans-serif] font-normal leading-[0] not-italic relative shrink-0 text-[#667380] text-[22px] w-[1000px] whitespace-pre-wrap">
          <p className="leading-[normal] mb-0">{`Smaller intervals = smoother delivery, more battery use. `}</p>
          <p className="leading-[normal]">Larger = longer device life, more pulsatile dosing.</p>
        </div>
      </div>
      <div onClick={() => navigate('intervals-empty')} className="absolute bg-[#0b7fa8] h-[90px] left-[80px] overflow-clip rounded-[45px] top-[1778px] w-[1040px] cursor-pointer">
        <p className="absolute font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[normal] left-[458px] not-italic text-[28px] text-white top-[28px] whitespace-nowrap">
          Continue
        </p>
      </div>
    </div>
  );
}

type CardProps = {
  left: number;
  title: string;
  subtitle: string;
  detail: string;
  perStroke: string;
  barCount: number;
  barWidth: number;
  selected: boolean;
  onSelect?: () => void;
};

function DeliveryStrokeCard({ left, title, subtitle, detail, perStroke, barCount, barWidth, selected, onSelect }: CardProps) {
  // Bar layout: bars start at x=14px and step by 8px ( + cardSelected offset adjustments)
  // Total card width = 192px. Bars are centered top area, vertical line at top:27 (selected: 26)
  const barColor = selected ? '#0b7fa8' : '#9ea8b2';
  const titleColor = selected ? '#065879' : '#063b66';
  const perStrokeColor = selected ? '#065879' : '#063b66';
  const bgColor = selected ? '#d9ebf5' : 'white';
  const borderClass = selected
    ? 'border-2 border-[#0b7fa8]'
    : 'border border-[#d9dbde]';
  const yOffset = selected ? 26 : 27;
  const xStart = selected ? 14 : 15;
  // Bars span the full 160px area; choose gap so they fill it evenly
  const totalWidth = 160;
  const step = barCount > 1 ? (totalWidth - barWidth) / (barCount - 1) : 0;
  return (
    <div
      onClick={onSelect}
      className={`absolute ${borderClass} border-solid h-[255px] overflow-clip rounded-[16px] top-[1150px] w-[192px] cursor-pointer select-none`}
      style={{ left, background: bgColor }}
    >
      {Array.from({ length: barCount }).map((_, i) => (
        <div
          key={i}
          className="absolute h-[36px] rounded-[2px]"
          style={{
            left: xStart + i * step,
            top: yOffset,
            width: barWidth,
            background: barColor,
          }}
        />
      ))}
      <p
        className="absolute font-['Inter:Bold',sans-serif] font-bold leading-[normal] not-italic text-[24px] whitespace-nowrap"
        style={{ color: titleColor, left: xStart, top: selected ? 88 : 89 }}
      >
        {title}
      </p>
      <p
        className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[normal] not-italic text-[#667380] text-[18px] whitespace-nowrap"
        style={{ left: xStart, top: selected ? 120 : 121 }}
      >
        {subtitle}
      </p>
      <p
        className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[normal] not-italic text-[#9ea8b2] text-[18px] whitespace-nowrap"
        style={{ left: xStart, top: selected ? 146 : 147 }}
      >
        {detail}
      </p>
      <div
        className="absolute bg-[#d9dbde] h-px w-[160px]"
        style={{ left: xStart, top: selected ? 182 : 183 }}
      />
      <p
        className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[normal] not-italic text-[#9ea8b2] text-[14px] whitespace-nowrap"
        style={{ left: xStart, top: selected ? 193 : 194 }}
      >
        Per stroke
      </p>
      <p
        className="absolute font-['Inter:Bold',sans-serif] font-bold leading-[normal] not-italic text-[18px] whitespace-nowrap"
        style={{ color: perStrokeColor, left: xStart, top: selected ? 211 : 212 }}
      >
        {perStroke}
      </p>
    </div>
  );
}
