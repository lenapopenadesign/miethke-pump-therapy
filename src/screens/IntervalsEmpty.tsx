const imgBBraunMiethkeSignet = "/icons/edaf665e-67bf-4efa-b71e-2b2cf05eebc7.svg";
const imgStatePrevious = "/icons/db095a8b-7fe0-4c5d-8d5c-98bc49cc3be7.svg";
const imgEllipse72 = "/icons/de0cfa38-66af-4be1-ac0e-486a457230c7.svg";
const imgIconsStepper = "/icons/58674b12-536c-46cd-a9eb-ce4f3ba3efce.svg";
const imgVector38 = "/icons/8e0d49e8-acc6-4153-ab6a-7e285fb5cf7b.svg";
const imgVector37 = "/icons/3334ad34-0d87-4b9b-b80d-a6921fbef7f8.svg";
const imgEllipse73 = "/icons/77af51c8-bf6f-47d2-80c2-ba7292690aa6.svg";
const imgVector39 = "/icons/a7ad4c2c-3327-4160-8b72-ca0b89d3f129.svg";
const imgVector40 = "/icons/a7d4c06f-fec7-4947-bc91-0d0b85783d66.svg";
const imgVector41 = "/icons/4051d079-5616-4f8f-9aed-dd13f69945a3.svg";
const imgVector = "/icons/fda31d58-baf1-4bcb-9223-5c125f0fbdce.svg";
const imgVector1 = "/icons/e7954d26-a0c2-40b4-b119-f808bee4cc62.svg";
const imgVector2 = "/icons/af870ea9-65c1-41b8-a66b-77fe50071f81.svg";
const imgVector3 = "/icons/c847db80-80eb-4266-a4e4-9516cbb51e77.svg";
const imgVector4 = "/icons/e82a0e98-c11c-4738-8c81-8ac3df3b284e.svg";
const imgVector5 = "/icons/cfb974a6-dd92-4dfc-8912-17d416a1f44a.svg";
const imgVector6 = "/icons/1cda738f-c18e-4a15-9e29-c2d9ea18f5e7.svg";
const imgVector7 = "/icons/c06d9c47-c4df-4cc2-b596-542e4ed43677.svg";
const imgVector8 = "/icons/706553bc-9240-4005-9764-d5ddfa83ec08.svg";
const imgVector9 = "/icons/cc159c93-e208-4fc9-9b35-982ff6e776d7.svg";
const imgVector10 = "/icons/f42b10c7-25fc-46f2-8b49-2ea4d520ce20.svg";
const imgVector11 = "/icons/8746d5f5-ff84-40bf-adb7-d5618f38c19e.svg";

function BBraunMiethkeSignet({ className }: { className?: string }) {
  return (
    <div className={className || "h-[105.45px] overflow-clip relative w-[89.17px]"}>
      <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgBBraunMiethkeSignet} />
    </div>
  );
}

type IconsStepperProps = { className?: string };

function IconsStepper({ className }: IconsStepperProps) {
  return (
    <div className={className || "relative size-[40px]"}>
      <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgStatePrevious} />
    </div>
  );
}

import { useNavigate } from '../navigation';
import { useTherapy, type DayPattern } from '../therapy';

const DAY_PATTERNS: { key: DayPattern; label: string; x: number; w: number }[] = [
  { key: 'same',             label: 'Same daily',         x: 84,      w: 338.667 },
  { key: 'weekday-weekend',  label: 'Weekday / weekend',  x: 430.67,  w: 338.667 },
  { key: 'per-day',          label: 'Per day',            x: 777.33,  w: 338.667 },
];

export function IntervalsEmpty() {
  const navigate = useNavigate();
  const { startAddingInterval, dayPattern, setDayPattern } = useTherapy();
  const onAdd = () => { startAddingInterval(); navigate('add-interval-when'); };
  return (
    <div className="bg-white relative size-full">
      <div className="absolute bg-[#3b2d7c] h-[35px] left-0 top-0 w-[1200px]" />
      <p className="absolute font-['Inter:Bold',sans-serif] font-bold leading-[normal] left-[80px] not-italic text-[#063b66] text-[44px] top-[270px] w-[1040px]">
        Add intervals
      </p>
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[normal] left-[80px] not-italic text-[#667380] text-[22px] top-[340px] w-[1040px]">
        Optional. Add windows where the dose differs from the base dose.
      </p>
      <p className="absolute font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[normal] left-[80px] not-italic text-[#063b66] text-[22px] top-[430px] whitespace-nowrap">
        Day pattern
      </p>
      <div className="absolute bg-[#f7fafc] border border-[#d9dbde] border-solid h-[70px] left-[80px] rounded-[12px] top-[466px] w-[1040px]" />
      {DAY_PATTERNS.map(p => {
        const active = dayPattern === p.key;
        return (
          <div
            key={p.key}
            onClick={() => setDayPattern(p.key)}
            className={`absolute h-[62px] rounded-[10px] top-[470px] cursor-pointer flex items-center justify-center select-none ${active ? 'bg-[#0b7fa8]' : ''}`}
            style={{ left: p.x, width: p.w }}
          >
            <p className={`font-['Inter:Semi_Bold',sans-serif] font-semibold not-italic text-[22px] whitespace-nowrap ${active ? 'text-white' : 'text-[#063b66]'}`}>
              {p.label}
            </p>
          </div>
        );
      })}
      <div className="absolute bg-[#d9dbde] h-px left-[80px] top-[580px] w-[1040px]" />
      <p className="absolute font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[normal] left-[80px] not-italic text-[#063b66] text-[22px] top-[610px] whitespace-nowrap">
        24-hour view
      </p>
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[normal] left-[360px] not-italic text-[#667380] text-[20px] top-[612px] whitespace-nowrap">
        Base dose only · 360 µg/day Baclofen
      </p>
      <div className="absolute bg-[#f7fafc] border border-[#d9dbde] border-solid h-[200px] left-[80px] rounded-[16px] top-[650px] w-[1040px]" />
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[normal] left-[107px] not-italic text-[#9ea8b2] text-[16px] top-[660px] whitespace-nowrap">
        00:00
      </p>
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[normal] left-[332.5px] not-italic text-[#9ea8b2] text-[16px] top-[660px] whitespace-nowrap">
        06:00
      </p>
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[normal] left-[579px] not-italic text-[#9ea8b2] text-[16px] top-[660px] whitespace-nowrap">
        12:00
      </p>
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[normal] left-[824px] not-italic text-[#9ea8b2] text-[16px] top-[660px] whitespace-nowrap">
        18:00
      </p>
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[normal] left-[1045px] not-italic text-[#9ea8b2] text-[16px] top-[660px] whitespace-nowrap">
        24:00
      </p>
      <div className="absolute bg-[rgba(11,127,168,0.47)] h-[50px] left-[110px] rounded-[4px] top-[770px] w-[980px]" />
      <p className="absolute font-['Inter:Bold',sans-serif] font-bold leading-[normal] left-[140px] not-italic text-[16px] text-white top-[790px] whitespace-nowrap">
        360 µg/day · base dose all day
      </p>
      <p className="absolute font-['Inter:Bold',sans-serif] font-bold leading-[normal] left-[455px] not-italic text-[#063b66] text-[30px] top-[960px] whitespace-nowrap">
        No intervals added yet
      </p>
      <p className="-translate-x-1/2 absolute font-['Inter:Regular',sans-serif] font-normal leading-[normal] left-[600px] not-italic text-[#667380] text-[22px] text-center top-[1004px] w-[1040px]">
        Therapy will run at the base dose around the clock. Add intervals to vary the dose at specific times of day (e.g. higher during physiotherapy, lower at night).
      </p>
      <div onClick={onAdd} className="absolute bg-[#0b7fa8] h-[100px] left-[80px] overflow-clip rounded-[50px] top-[1155px] w-[1040px] cursor-pointer">
        <p className="absolute font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[normal] left-[356.5px] not-italic text-[28px] text-white top-[33px] whitespace-pre">{`+  Add your first interval`}</p>
      </div>
      <div onClick={() => navigate('review')} className="absolute bg-white border border-[#d9dbde] border-solid h-[90px] left-[80px] overflow-clip rounded-[45px] top-[1275px] w-[1040px] cursor-pointer">
        <p className="absolute font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[normal] left-[364.5px] not-italic text-[#667380] text-[24px] top-[29.5px] whitespace-nowrap">
          Skip — use base dose only
        </p>
      </div>
      <div className="absolute bg-[#c7c9cc] h-[90px] left-[80px] overflow-clip rounded-[45px] top-[1773px] w-[1040px]">
        <p className="absolute font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[normal] left-[385.5px] not-italic text-[24px] text-white top-[30.5px] whitespace-nowrap">
          Add or skip to continue
        </p>
      </div>
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
                <p className="flex-[1_0_0] font-['Roboto:Regular',sans-serif] font-normal leading-[24px] min-w-px relative text-[#00769e] text-[20px] tracking-[0.1px]" style={{ fontVariationSettings: "'wdth' 100" }}>
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
            <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgVector40} />
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
            <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgVector41} />
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
                <p className="flex-[1_0_0] font-['Roboto:Regular',sans-serif] font-normal leading-[24px] min-w-px relative text-[#a5a5a5] text-[20px] tracking-[0.1px]" style={{ fontVariationSettings: "'wdth' 100" }}>
                  Activate
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="absolute bg-[#e6f4f9] content-stretch flex h-[120px] items-center justify-between left-0 overflow-x-clip overflow-y-auto px-[40px] py-[8px] top-[35px] w-[1200px]">
        <div className="content-stretch flex gap-[40px] items-center relative shrink-0 w-[669px]">
          <div onClick={() => navigate('base-dose')} className="flex items-center justify-center relative shrink-0 cursor-pointer">
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
    </div>
  );
}
