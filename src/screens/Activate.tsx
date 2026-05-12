const imgMaterialSymbolsFitbitCheckSmallRounded = "/icons/9f696640-976b-4195-a9c5-662c75d84b76.svg";
const imgBBraunMiethkeSignet = "/icons/230034e4-b766-483c-908a-4f2237dd8b0f.svg";
const imgEllipse72 = "/icons/b44ab979-bc20-44ed-b25d-ebfee85bf883.svg";
const imgIconsStepper = "/icons/1a72a38a-ccf6-4cca-b1a8-053c2651cf0f.svg";
const imgVector38 = "/icons/930ecccf-c0f1-49ae-a2d1-3187daa3a044.svg";
const imgVector37 = "/icons/427da504-523f-48e7-a355-72088efb252b.svg";
const imgVector39 = "/icons/eb7cb0a5-4e44-4bb0-aa03-74b066bb7ee1.svg";
const imgEllipse73 = "/icons/550e2233-9931-4bc9-a65e-c79fb4c13b26.svg";
const imgVector = "/icons/42a63ce9-8f05-4c22-b921-cc548fc57bbd.svg";
const imgVector1 = "/icons/86be0314-f58b-40ff-a7e4-772d7dee7b49.svg";
const imgVector2 = "/icons/f404cf23-2dc2-40cf-ab45-d7db0ab09437.svg";
const imgVector3 = "/icons/22348995-8f43-44cb-b8c5-97377c3cbeea.svg";
const imgVector4 = "/icons/db9c641b-d896-49ea-8610-23917a046939.svg";
const imgVector5 = "/icons/85be43ae-6d1d-4d60-9598-8d96fafa972a.svg";
const imgVector6 = "/icons/6b94d6c2-01b5-48a6-9fcb-84e865d177f5.svg";
const imgVector7 = "/icons/cc359495-48c1-451c-b6db-b956b80b7eaa.svg";
const imgVector8 = "/icons/998fc20e-6f79-4891-91ea-6ff85b2e31d8.svg";
const imgVector9 = "/icons/5d69b526-bdd4-4eb0-9117-aa6d0931f84b.svg";
const imgVector10 = "/icons/0978a2e4-d8cf-423b-8dc2-b08490292a4b.svg";
const imgVector11 = "/icons/bb3001f6-d104-42de-94b3-180e2c544d16.svg";

function LoadingBar({ className }: { className?: string }) {
  return (
    <div className={className || "border-2 border-[#65d8fe] border-solid content-stretch flex flex-col items-start justify-center p-[2px] relative rounded-[76px] w-[622px]"}>
      <div className="content-stretch flex gap-[8px] h-[20px] items-center justify-center overflow-clip px-[40px] py-[16px] relative rounded-[47px] shrink-0 w-full" style={{ backgroundImage: "linear-gradient(-89.99999977035728deg, rgb(101, 216, 254) 0%, rgb(0, 118, 158) 100%)" }}>
        <div className="relative shrink-0 size-[24px]">
          <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgMaterialSymbolsFitbitCheckSmallRounded} />
        </div>
        <p className="font-['Poppins',sans-serif] leading-[normal] not-italic relative shrink-0 text-[16px] text-[rgba(255,255,255,0)] text-center whitespace-nowrap">
          Done
        </p>
      </div>
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

import { useEffect } from 'react';
import { useNavigate } from '../navigation';

export function Activate() {
  const navigate = useNavigate();
  useEffect(() => {
    const t = setTimeout(() => navigate('home-active'), 2500);
    return () => clearTimeout(t);
  }, [navigate]);
  return (
    <div className="bg-white relative size-full">
      <div className="absolute bg-[#3b2d7c] h-[35px] left-0 top-0 w-[1200px]" />
      <div className="absolute content-stretch flex items-center left-0 top-[164px] w-[1200px]">
        {/* Step 1 — done */}
        <div className="content-stretch flex flex-[1_0_0] h-[64px] items-center min-w-px mr-[-10px] relative">
          <div className="bg-[#e6f4f9] content-stretch flex flex-[1_0_0] h-[64px] items-start min-w-px overflow-clip pl-[40px] pr-[16px] py-[8px] relative">
            <div className="content-stretch flex flex-[1_0_0] items-start min-w-px relative">
              <div className="content-stretch flex gap-[16px] h-[48px] items-center relative shrink-0 w-[184px]">
                <div className="relative shrink-0 size-[40px]">
                  <div className="absolute aspect-[34/34] left-0 right-0 top-0"><img alt="" className="absolute block inset-0 max-w-none size-full" src={imgEllipse72} /></div>
                  <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgIconsStepper} />
                </div>
                <p className="flex-[1_0_0] font-['Roboto',sans-serif] font-normal leading-[24px] min-w-px relative text-[#00769e] text-[20px] tracking-[0.1px]" style={{ fontVariationSettings: "'wdth' 100" }}>Base Dose</p>
              </div>
            </div>
          </div>
          <div className="h-[64px] relative shrink-0 w-[28px]"><img alt="" className="absolute block inset-0 max-w-none size-full" src={imgVector38} /></div>
        </div>
        {/* Step 2 — done */}
        <div className="content-stretch flex flex-[1_0_0] h-[64px] items-center min-w-px mr-[-10px] relative">
          <div className="h-[64px] relative shrink-0 w-[30px]"><img alt="" className="absolute block inset-0 max-w-none size-full" src={imgVector37} /></div>
          <div className="bg-[#e6f4f9] content-stretch flex flex-[1_0_0] h-[64px] items-start min-w-px overflow-clip px-[16px] py-[8px] relative">
            <div className="content-stretch flex flex-[1_0_0] items-start min-w-px relative">
              <div className="content-stretch flex gap-[16px] h-[48px] items-center relative shrink-0 w-[184px]">
                <div className="relative shrink-0 size-[40px]">
                  <div className="absolute aspect-[34/34] left-0 right-0 top-0"><img alt="" className="absolute block inset-0 max-w-none size-full" src={imgEllipse72} /></div>
                  <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgIconsStepper} />
                </div>
                <p className="flex-[1_0_0] font-['Roboto',sans-serif] font-normal leading-[24px] min-w-px relative text-[#00769e] text-[20px] tracking-[0.1px]" style={{ fontVariationSettings: "'wdth' 100" }}>Intervals</p>
              </div>
            </div>
          </div>
          <div className="h-[64px] relative shrink-0 w-[28px]"><img alt="" className="absolute block inset-0 max-w-none size-full" src={imgVector38} /></div>
        </div>
        {/* Step 3 — done */}
        <div className="content-stretch flex flex-[1_0_0] h-[64px] items-center min-w-px mr-[-10px] relative">
          <div className="h-[64px] relative shrink-0 w-[30px]"><img alt="" className="absolute block inset-0 max-w-none size-full" src={imgVector37} /></div>
          <div className="bg-[#e6f4f9] content-stretch flex flex-[1_0_0] h-[64px] items-start min-w-px overflow-clip px-[16px] py-[8px] relative">
            <div className="content-stretch flex flex-[1_0_0] items-start min-w-px relative">
              <div className="content-stretch flex gap-[16px] h-[48px] items-center relative shrink-0 w-[184px]">
                <div className="relative shrink-0 size-[40px]">
                  <div className="absolute aspect-[34/34] left-0 right-0 top-0"><img alt="" className="absolute block inset-0 max-w-none size-full" src={imgEllipse72} /></div>
                  <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgIconsStepper} />
                </div>
                <p className="flex-[1_0_0] font-['Roboto',sans-serif] font-normal leading-[24px] min-w-px relative text-[#00769e] text-[20px] tracking-[0.1px]" style={{ fontVariationSettings: "'wdth' 100" }}>Review</p>
              </div>
            </div>
          </div>
          <div className="h-[64px] relative shrink-0 w-[28px]"><img alt="" className="absolute block inset-0 max-w-none size-full" src={imgVector38} /></div>
        </div>
        {/* Step 4 — active */}
        <div className="content-stretch flex flex-[1_0_0] h-[64px] items-center min-w-px relative">
          <div className="h-[64px] relative shrink-0 w-[30px]"><img alt="" className="absolute block inset-0 max-w-none size-full" src={imgVector39} /></div>
          <div className="bg-[#d1eaf8] content-stretch flex flex-[1_0_0] h-[64px] items-start min-w-px overflow-clip px-[16px] py-[8px] relative">
            <div className="content-stretch flex flex-[1_0_0] items-start min-w-px relative">
              <div className="content-stretch flex gap-[16px] h-[48px] items-center relative shrink-0 w-[184px]">
                <div className="relative shrink-0 size-[40px]">
                  <div className="absolute aspect-[34/34] left-0 right-0 top-0"><img alt="" className="absolute block inset-0 max-w-none size-full" src={imgEllipse72} /></div>
                  <div className="absolute aspect-[34/34] left-[32.5%] right-[32.5%] top-[13px]"><img alt="" className="absolute block inset-0 max-w-none size-full" src={imgEllipse73} /></div>
                </div>
                <p className="flex-[1_0_0] font-['Roboto',sans-serif] font-normal leading-[24px] min-w-px relative text-[#00769e] text-[20px] tracking-[0.1px]" style={{ fontVariationSettings: "'wdth' 100" }}>Activate</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="absolute bg-[#e6f4f9] content-stretch flex h-[120px] items-center justify-between left-0 overflow-x-clip overflow-y-auto px-[40px] py-[8px] top-[35px] w-[1200px]">
        <div className="content-stretch flex gap-[40px] items-center relative shrink-0 w-[669px]">
          <div className="flex items-center justify-center relative shrink-0">
            <div className="flex-none rotate-180">
              <div className="overflow-clip relative size-[56px]">
                <div className="absolute inset-[20%_0.03%_17.61%_0]"><img alt="" className="absolute block inset-0 max-w-none size-full" src={imgVector} /></div>
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
      {/* Title */}
      <div className="absolute content-stretch flex flex-col items-start left-[80px] top-[298px] w-[1024px]">
        <p className="font-['Roboto',sans-serif] font-bold leading-[40px] relative shrink-0 text-[#00769e] text-[36px] tracking-[0.1px] w-full" style={{ fontVariationSettings: "'wdth' 100" }}>
          Activate therapy on implant
        </p>
      </div>
      {/* Loading bar */}
      <div className="absolute content-stretch flex flex-col items-start left-[80px] top-[381px] w-[1024px]">
        <LoadingBar className="border-2 border-[#65d8fe] border-solid content-stretch flex flex-col items-start justify-center p-[2px] relative rounded-[76px] shrink-0 w-full" />
      </div>
    </div>
  );
}
