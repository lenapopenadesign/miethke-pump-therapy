import { useNavigate } from '../navigation';
import { useTherapy, STROKE_OPTIONS, type StrokeStrategy } from '../therapy';

const imgBBraunMiethkeSignet = "/icons/9f250784-cad4-4195-99ce-4b9dc94364a5.svg";
const imgBack = "/icons/01195f3c-ce0c-4269-a4cc-2742bc124f77.svg";
// Therapy logo composite (11 vectors)
const imgT1 = "/icons/276995c3-95e7-4f89-aaac-132fc8d43cfe.svg";
const imgT2 = "/icons/8a2869d6-387c-43ba-be53-477de865f0e6.svg";
const imgT3 = "/icons/7c7b5b07-d4a6-4c25-a285-b5ae561ae337.svg";
const imgT4 = "/icons/a29a0a50-cce1-4dd6-a110-cfbbd664ae38.svg";
const imgT5 = "/icons/e72c4c73-98ad-4a8b-acf6-a5ffea6349ac.svg";
const imgT6 = "/icons/1168ccbe-efdb-4ea7-abe5-bf07b47af2b9.svg";
const imgT7 = "/icons/07dfd97a-21eb-447c-b439-a9ca61e3faa6.svg";
const imgT8 = "/icons/81a225f9-9876-43c1-9aaf-5b1d51426454.svg";
const imgT9 = "/icons/7ff92c71-c015-413d-ad24-dec25e6e350b.svg";
const imgT10 = "/icons/00f7418e-34cd-4431-ae37-ec0eb64b05e6.svg";
const imgT11 = "/icons/889ea9b6-c9de-4f9c-bf91-3c37bf141ad0.svg";
// Stepper assets — Dosage active, Review/Activate inactive
const imgEllipse72 = "/icons/815f2ff8-cf86-4d26-a856-f4dd1c28b94d.svg";
const imgEllipse73 = "/icons/8f4c5654-4dce-4ae1-96fb-6192337f71e1.svg";
const imgChevronOn = "/icons/bb340433-66d7-4d99-8d2c-4b4aad876d8f.svg";
const imgChevronOff = "/icons/1d72df2a-e2fa-44b5-b500-8101e9ef3cec.svg";
const imgChevronEnd = "/icons/f251b7a9-1365-427b-a36c-890bb6984572.svg";
const imgStepperEmpty = "/icons/7c235bc5-7127-424c-9618-232d0f9906e7.svg";

function TherapyLogo() {
  return (
    <div className="overflow-clip relative shrink-0 size-[64px]">
      <div className="-translate-x-1/2 absolute aspect-[400/400] bottom-0 left-1/2 overflow-clip top-0">
        <div className="absolute contents inset-[18.92%_30.29%_32.95%_15.2%]">
          <div className="absolute inset-[18.92%_30.29%_71%_15.2%]"><img alt="" className="absolute block inset-0 max-w-none size-full" src={imgT1} /></div>
          <div className="absolute inset-[27.82%_50.03%_32.95%_15.2%]"><img alt="" className="absolute block inset-0 max-w-none size-full" src={imgT2} /></div>
        </div>
        <div className="absolute inset-[12.67%_35.51%_78.7%_20.41%]"><img alt="" className="absolute block inset-0 max-w-none size-full" src={imgT3} /></div>
        <div className="absolute inset-[47.67%_52.31%_41.86%_37.22%]"><img alt="" className="absolute block inset-0 max-w-none size-full" src={imgT4} /></div>
        <div className="absolute inset-[26.63%_30.29%_70.99%_15.2%]"><img alt="" className="absolute block inset-0 max-w-none size-full" src={imgT5} /></div>
        <div className="absolute inset-[47.67%_66.88%_41.86%_22.65%]"><img alt="" className="absolute block inset-0 max-w-none size-full" src={imgT6} /></div>
        <div className="absolute inset-[33.1%_66.88%_56.43%_22.65%]"><img alt="" className="absolute block inset-0 max-w-none size-full" src={imgT7} /></div>
        <div className="absolute inset-[33.1%_52.31%_56.43%_37.22%]"><img alt="" className="absolute block inset-0 max-w-none size-full" src={imgT8} /></div>
        <div className="absolute inset-[32.13%_22.02%_58.18%_61.41%]"><img alt="" className="absolute block inset-0 max-w-none size-full" src={imgT9} /></div>
        <div className="absolute inset-[39.42%_15.2%_12.67%_54.61%]"><img alt="" className="absolute block inset-0 max-w-none size-full" src={imgT10} /></div>
        <div className="absolute inset-[28.93%_31.08%_71%_64.17%]"><img alt="" className="absolute block inset-0 max-w-none size-full" src={imgT11} /></div>
      </div>
    </div>
  );
}

export function RegularTherapy() {
  const navigate = useNavigate();
  const { baseDose, strokeStrategy, setStrokeStrategy } = useTherapy();
  const selectedIdx = STROKE_OPTIONS.findIndex(o => o.min === strokeStrategy);
  const selected = STROKE_OPTIONS[selectedIdx >= 0 ? selectedIdx : 2];
  const perStrokeUg = selected.strokesPerDay > 0 ? baseDose / selected.strokesPerDay : 0;

  // Slider geometry — 5 dots equally spaced across the body width.
  const sliderLeft = 80;
  const sliderWidth = 1040;
  const dotSize = 48;
  const dotCx = (i: number) => sliderLeft + (sliderWidth - dotSize) * (i / (STROKE_OPTIONS.length - 1)) + dotSize / 2;

  return (
    <div className="bg-white relative size-full">
      {/* Status bar */}
      <div className="absolute bg-[#3b2d7c] h-[35px] left-0 top-0 w-[1200px]" />

      {/* Nav bar */}
      <div className="absolute bg-[#e6f4f9] content-stretch flex h-[120px] items-center justify-between left-0 px-[40px] py-[8px] top-[35px] w-[1200px]">
        <div className="content-stretch flex gap-[40px] items-center relative shrink-0">
          <div onClick={() => navigate('intervals-empty')} className="flex items-center justify-center relative shrink-0 cursor-pointer">
            <div className="flex-none rotate-180">
              <div className="overflow-clip relative size-[56px]">
                <div className="absolute inset-[20%_0.03%_17.61%_0]">
                  <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgBack} />
                </div>
              </div>
            </div>
          </div>
          <div className="content-stretch flex gap-[16px] items-center relative shrink-0">
            <TherapyLogo />
            <p className="font-['Roboto',sans-serif] font-extrabold leading-[56px] relative shrink-0 text-[#00769e] text-[48px] tracking-[0.1px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
              Regular Therapy
            </p>
          </div>
        </div>
        <div className="content-stretch flex items-center relative shrink-0">
          <div className="h-[62px] overflow-clip relative shrink-0 w-[53px]">
            <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgBBraunMiethkeSignet} />
          </div>
        </div>
      </div>

      {/* 3-step stepper — Dosage active */}
      <div className="absolute content-stretch flex items-center left-0 top-[164px] w-[1200px]">
        <div className="content-stretch flex flex-[1_0_0] h-[64px] items-center min-w-px mr-[-10px] relative">
          <div className="bg-[#d1eaf8] content-stretch flex flex-[1_0_0] h-[64px] items-start min-w-px overflow-clip pl-[40px] pr-[16px] py-[8px] relative">
            <div className="content-stretch flex gap-[16px] h-[48px] items-center relative shrink-0 w-[184px]">
              <div className="relative shrink-0 size-[40px]">
                <div className="absolute aspect-[34/34] left-0 right-0 top-0">
                  <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgEllipse72} />
                </div>
                <div className="absolute aspect-[34/34] left-[32.5%] right-[32.5%] top-[13px]">
                  <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgEllipse73} />
                </div>
              </div>
              <p className="font-['Roboto',sans-serif] font-normal leading-[24px] relative text-[#00769e] text-[20px] tracking-[0.1px]" style={{ fontVariationSettings: "'wdth' 100" }}>
                Dosage
              </p>
            </div>
          </div>
          <div className="h-[64px] relative shrink-0 w-[28px]">
            <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgChevronOn} />
          </div>
        </div>
        <div className="content-stretch flex flex-[1_0_0] h-[64px] items-center min-w-px mr-[-10px] relative">
          <div className="h-[64px] relative shrink-0 w-[30px]">
            <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgChevronOff} />
          </div>
          <div className="bg-[#f0f0f0] content-stretch flex flex-[1_0_0] h-[64px] items-start min-w-px overflow-clip px-[16px] py-[8px] relative">
            <div className="content-stretch flex gap-[16px] h-[48px] items-center relative shrink-0 w-[184px]">
              <div className="relative shrink-0 size-[40px]">
                <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgStepperEmpty} />
              </div>
              <p className="font-['Roboto',sans-serif] font-normal leading-[24px] relative text-[#a5a5a5] text-[20px] tracking-[0.1px]" style={{ fontVariationSettings: "'wdth' 100" }}>
                Review
              </p>
            </div>
          </div>
          <div className="h-[64px] relative shrink-0 w-[28px]">
            <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgChevronEnd} />
          </div>
        </div>
        <div className="content-stretch flex flex-[1_0_0] h-[64px] items-center min-w-px relative">
          <div className="h-[64px] relative shrink-0 w-[30px]">
            <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgChevronOff} />
          </div>
          <div className="bg-[#f0f0f0] content-stretch flex flex-[1_0_0] h-[64px] items-start min-w-px overflow-clip px-[16px] py-[8px] relative">
            <div className="content-stretch flex gap-[16px] h-[48px] items-center relative shrink-0 w-[184px]">
              <div className="relative shrink-0 size-[40px]">
                <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgStepperEmpty} />
              </div>
              <p className="font-['Roboto',sans-serif] font-normal leading-[24px] relative text-[#a5a5a5] text-[20px] tracking-[0.1px]" style={{ fontVariationSettings: "'wdth' 100" }}>
                Activate
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="absolute left-0 top-[235px] h-[1685px] w-[1200px] flex flex-col items-start justify-between px-[80px] py-[80px]">
        <div className="flex flex-col gap-[40px] items-start w-full">
          {/* Title row */}
          <div className="flex flex-col gap-[16px] items-start w-full">
            <div className="flex items-center gap-[16px]">
              <p className="font-['Roboto',sans-serif] font-bold text-[#00769e] text-[20px] tracking-[0.1px]" style={{ fontVariationSettings: "'wdth' 100" }}>
                |↔|
              </p>
              <p className="font-['Roboto',sans-serif] font-bold leading-[40px] text-[#00769e] text-[36px] tracking-[0.1px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
                Time interval between medication delivery
              </p>
              <div className="bg-[#0094c5] h-[36px] px-[16px] rounded-[18px] flex items-center">
                <p className="font-['Roboto',sans-serif] font-bold text-[16px] text-white tracking-[0.1px]" style={{ fontVariationSettings: "'wdth' 100" }}>
                  optional
                </p>
              </div>
            </div>
            <p className="font-['Roboto',sans-serif] font-normal leading-[32px] text-[#45483c] text-[24px] tracking-[0.1px]" style={{ fontVariationSettings: "'wdth' 100" }}>
              Adjust the interval between medication delivery
            </p>
          </div>

          {/* 5-dot slider */}
          <div className="relative w-[1040px] h-[60px]">
            {/* Rail */}
            <div className="absolute left-[24px] right-[24px] top-[27px] h-[6px] bg-[#d9dbde] rounded-[3px]" />
            {STROKE_OPTIONS.map((opt, i) => {
              const active = i === selectedIdx;
              const cx = dotCx(i) - sliderLeft;
              return (
                <div
                  key={opt.min}
                  onClick={() => setStrokeStrategy(opt.min as StrokeStrategy)}
                  className={`absolute top-[6px] size-[48px] rounded-full cursor-pointer flex items-center justify-center border-2 ${active ? 'bg-[#0094c5] border-[#0094c5]' : 'bg-white border-[#d9dbde]'}`}
                  style={{ left: cx - 24 }}
                  title={`${opt.min} min · ${opt.label}`}
                />
              );
            })}
          </div>

          {/* Selected option card */}
          <div className="w-[1040px] border-2 border-[#0094c5] rounded-[16px] bg-[#e6f4f9] px-[32px] py-[24px] flex flex-col gap-[12px]">
            <p className="font-['Roboto',sans-serif] font-bold text-[#00769e] text-[32px] tracking-[0.1px]" style={{ fontVariationSettings: "'wdth' 100" }}>
              {selected.label} · every {selected.min} minutes
            </p>
            <p className="font-['Roboto',sans-serif] font-normal text-[#667380] text-[20px] tracking-[0.1px]" style={{ fontVariationSettings: "'wdth' 100" }}>
              {selected.strokesPerDay} strokes/day
            </p>
            <div className="bg-[#d9dbde] h-px w-full my-[8px]" />
            <p className="font-['Roboto',sans-serif] font-normal text-[#667380] text-[16px] tracking-[0.1px]" style={{ fontVariationSettings: "'wdth' 100" }}>
              Per stroke
            </p>
            <p className="font-['Roboto',sans-serif] font-bold text-[#00769e] text-[28px] tracking-[0.1px]" style={{ fontVariationSettings: "'wdth' 100" }}>
              {perStrokeUg.toFixed(1)} µg
            </p>
          </div>
        </div>

        {/* Continue CTA */}
        <div
          onClick={() => navigate('review')}
          className="flex gap-[16px] h-[88px] items-center justify-center min-w-[240px] px-[40px] rounded-[80px] w-full bg-[#0094c5] cursor-pointer"
        >
          <p className="font-['Roboto',sans-serif] font-bold leading-[32px] text-white text-[24px] tracking-[0.1px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
            Continue to review
          </p>
        </div>
      </div>
    </div>
  );
}
