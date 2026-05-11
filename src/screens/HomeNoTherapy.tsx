const imgAndroidTopBar = "/icons/f4023c80-3d8b-42df-9948-8009c9d76bd9.svg";
const imgVector = "/icons/ca626163-e7d7-4956-ad91-c6ccc9d75c1e.svg";
const imgVector1 = "/icons/f7d990dd-760b-4c75-ad06-a9e25792163f.svg";
const imgVector2 = "/icons/34c72d33-da0a-4524-baf8-8740816e1c94.svg";
const imgVector3 = "/icons/9abb359f-8740-4fa9-b48f-b8901ba56a97.svg";
const imgVector4 = "/icons/37e6818a-754b-4e9b-b353-0ad921147c10.svg";
const imgVector5 = "/icons/f04447fa-418c-41ba-99a3-878c9f1c122c.svg";
const imgGroup81 = "/icons/8e769376-bb2c-4c40-bf16-19717acbcf24.svg";
const imgEbene1 = "/icons/5a33dcf5-7db9-4c58-93be-23c8e66ada1b.svg";
const imgVector6 = "/icons/7cf6110f-7172-44a4-8f95-609bd4c024ab.svg";
const imgVector7 = "/icons/c67caef4-85c6-4a2e-bdc9-0d6744048896.svg";
const imgVector8 = "/icons/2eda2d01-d4e8-442a-91df-65a1be850736.svg";
const imgVector9 = "/icons/6d08d65a-50cc-4fbb-ade0-78f165f059ad.svg";
const imgVector10 = "/icons/5c4597bb-f138-4bae-b64a-ccdbe8066dba.svg";
const imgVector11 = "/icons/55045c4e-8ae2-4a6b-83f6-5833a9ee58b0.svg";
const imgVector12 = "/icons/86041251-eefc-437f-9c68-eee545a2721d.svg";
const imgVector13 = "/icons/8d31e267-ec75-4add-9d89-97211b424d32.svg";
const imgVector14 = "/icons/e9e53145-0ec5-40b7-8359-a720dcd02449.svg";
const imgVector15 = "/icons/40b89d5b-ffe5-4ab8-a1ce-bfa401c1a860.svg";
const imgVector16 = "/icons/65f0d980-9729-4820-ba8b-314977019341.svg";
const imgVector17 = "/icons/4c65984c-3093-4ed3-96f1-606e9b65eb73.svg";
const imgVector18 = "/icons/80271cf8-433b-4d48-ade8-2f5e1943b05d.svg";
const imgVector19 = "/icons/da0a9424-bf45-4276-a9d3-60677cd311aa.svg";
const imgVector20 = "/icons/f748d09e-4a0f-4f03-8813-8c6d958b3ef3.svg";
const imgVector21 = "/icons/08079513-b51d-4f09-a094-e858ea891284.svg";
const imgVector22 = "/icons/3c7eb014-c471-4859-b52f-023af2e3fc6b.svg";
const imgIcons = "/icons/c667ceb3-ed53-4c5b-b4f8-9b7620e8b97b.svg";
const imgSelector = "/icons/257336f4-1d98-46f9-92eb-855702fd3118.svg";
const imgGroup1795 = "/icons/30358e4e-226d-42ef-8449-98c02bc14dfe.svg";
const imgSelector1 = "/icons/f7e2f5be-7c5c-48a1-a1bb-4744028ad99c.svg";
const imgVector23 = "/icons/f43ab566-6a79-43f1-8230-988a96a2ac6b.svg";
const imgVector24 = "/icons/d4761d07-a394-46cc-b8b7-96ecd274fe6d.svg";
const imgVector25 = "/icons/b639babc-6e83-49b8-a7f5-b0eda9114e3c.svg";
const imgVector26 = "/icons/f134ae2c-bafc-4073-a41b-aaa36e92986f.svg";
const imgVector27 = "/icons/d7053ac7-a32c-462f-88ba-6acd1574508a.svg";
const imgVector28 = "/icons/ffa0a4a9-b856-485d-8967-a9029c76d495.svg";
const imgVector29 = "/icons/ede58cf6-80f3-4275-8151-47d242a8aaf5.svg";
const imgVector30 = "/icons/9d2556e9-9baa-4db1-815d-a33eaf659b1e.svg";
const imgVector31 = "/icons/55a98702-3033-4817-bb0f-e44c83a955b2.svg";
const imgVector32 = "/icons/fcf399ba-6668-46c9-b379-f182c2091469.svg";
const imgVector33 = "/icons/bc873195-0503-4562-8ce9-b5204c557bb1.svg";
const imgVector34 = "/icons/88c200de-1e6e-42ac-9965-ed9de49be00d.svg";
const imgVector35 = "/icons/3c1a1008-dea2-4a9c-af97-dc6fc9a112fb.svg";
const imgVector36 = "/icons/ced50c85-e082-4928-b96c-f93d9b91ef55.svg";
const imgVector37 = "/icons/98f94e05-20f9-41a1-9f04-28708220c770.svg";
const imgVector38 = "/icons/5408434b-43da-41f0-9b6b-2681e93f0321.svg";
const imgVector39 = "/icons/b0a53228-784c-4f24-af16-11dc67302018.svg";
const imgVector40 = "/icons/0421e3ea-ed82-4a7b-bfd5-b93e14598d36.svg";
const imgEbene2 = "/icons/d27fa211-b646-4694-a8e2-740d137a7c84.svg";
const imgGroup85 = "/icons/109674c9-3940-44e4-9672-28139cb9e304.svg";
const imgGroup1794 = "/icons/cb04e1a6-33a3-484f-a9d2-9f0910fa9fc3.svg";

function AndroidTopBar({ className }: { className?: string }) {
  return (
    <div className={className || "h-[35px] relative w-[1200px]"}>
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <img alt="" className="absolute h-[5485.71%] left-0 max-w-none top-0 w-full" src={imgAndroidTopBar} />
      </div>
    </div>
  );
}

type IconsProps = {
  className?: string;
  property1?: "implant" | "refill" | "arrow_forward";
};

function Icons({ className, property1 = "refill" }: IconsProps) {
  const isArrowForward = property1 === "arrow_forward";
  const isImplant = property1 === "implant";
  return (
    <div className={className || "overflow-clip relative size-[40px]"} id={isArrowForward ? "node-2333_44553" : isImplant ? "node-2325_27717" : "node-2325_27713"}>
      <div className={`absolute ${isArrowForward ? "inset-[20%_0.03%_17.61%_0]" : isImplant ? "inset-[9.91%_15.71%]" : "inset-[8.17%_31.76%_8.18%_14.47%]"}`} id={isArrowForward ? "node-2333_44556" : isImplant ? "node-2325_21705" : "node-2325_21724"}>
        <img alt="" className="absolute block inset-0 max-w-none size-full" src={isArrowForward ? imgVector5 : isImplant ? imgVector2 : imgVector} />
      </div>
      {["refill", "implant"].includes(property1) && (
        <div className={`absolute ${isImplant ? "inset-[27.92%_22.15%_16.35%_22.11%]" : "inset-[57.95%_28.15%_8.67%_52.67%]"}`} id={isImplant ? "node-2325_21706" : "node-2325_21725"}>
          <img alt="" className="absolute block inset-0 max-w-none size-full" src={isImplant ? imgVector3 : imgVector1} />
        </div>
      )}
      {isImplant && (
        <div className="absolute inset-[15.44%_44.63%_74.24%_45.06%]">
          <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgVector4} />
        </div>
      )}
    </div>
  );
}

type FillingProps = {
  className?: string;
  property1?: "full";
};

function Filling({ className }: FillingProps) {
  return (
    <div className={className || "h-[300px] overflow-clip relative w-[293px]"}>
      <div className="absolute contents inset-[11.67%_16.38%]">
        <div className="absolute inset-[11.67%_16.38%]">
          <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgGroup81} />
        </div>
      </div>
    </div>
  );
}

import { useNavigate } from '../navigation';

export function HomeNoTherapy() {
  const navigate = useNavigate();
  return (
    <div className="bg-white relative size-full">
      <div className="absolute content-stretch flex flex-col gap-[40px] h-[1765px] items-center left-0 p-[80px] top-[35px] w-[1200px]">
        <div className="bg-[#e6f4f9] content-stretch flex flex-col items-start relative rounded-[24px] shrink-0 w-[1040px]">
          <div className="content-stretch flex gap-[24px] h-[112px] items-center pl-[16px] pr-[40px] py-[16px] relative shrink-0 w-[1040px]">
            <div className="content-stretch flex flex-[1_0_0] items-center justify-center min-w-px relative">
              <div className="content-stretch flex flex-[1_0_0] gap-[16px] items-center min-w-px relative">
                <Icons className="overflow-clip relative shrink-0 size-[64px]" property1="implant" />
                <p className="font-['Roboto:ExtraBold',sans-serif] font-extrabold leading-[56px] relative shrink-0 text-[#00769e] text-[48px] tracking-[0.1px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
                  Implant
                </p>
              </div>
            </div>
            <div className="content-stretch flex gap-[16px] items-center relative shrink-0">
              <p className="font-['Roboto:Regular',sans-serif] font-normal leading-[32px] relative shrink-0 text-[#24ab5e] text-[24px] tracking-[0.1px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
                Connected
              </p>
              <div className="h-[32px] overflow-clip relative shrink-0 w-[33px]">
                <div className="-translate-y-1/2 absolute aspect-[159.27999877929688/159.27999877929688] left-[2.44%] overflow-clip right-0 top-1/2">
                  <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgEbene1} />
                </div>
              </div>
            </div>
            <div className="content-stretch flex items-center relative shrink-0">
              <div className="content-stretch flex items-center relative shrink-0">
                <div className="content-stretch flex items-center justify-center relative shrink-0">
                  <div className="content-stretch flex items-center justify-center min-w-[72px] px-[24px] relative rounded-[40px] shrink-0 size-[72px]">
                    <Icons className="h-[51.151px] overflow-clip relative shrink-0 w-[50.926px]" property1="arrow_forward" />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-[rgba(255,255,255,0.5)] content-stretch flex flex-col gap-[25px] items-start p-[16px] relative rounded-bl-[24px] rounded-br-[24px] shrink-0 w-full">
            <div className="content-stretch flex items-center pr-[24px] relative shrink-0 w-full">
              <div className="content-stretch flex flex-[1_0_0] items-center min-w-px relative">
                <div className="content-stretch flex flex-[1_0_0] items-center min-w-px relative">
                  <div className="content-stretch flex items-center relative shrink-0">
                    <Filling className="h-[170px] overflow-clip relative shrink-0 w-[165px]" />
                  </div>
                  <div className="content-stretch flex flex-[1_0_0] items-center justify-between min-w-px relative">
                    <div className="content-stretch flex flex-col items-start justify-center relative shrink-0 text-[#00769e] tracking-[0.1px] whitespace-nowrap">
                      <p className="font-['Roboto:Regular',sans-serif] font-normal leading-[24px] relative shrink-0 text-[20px]" style={{ fontVariationSettings: "'wdth' 100" }}>
                        Fill level
                      </p>
                      <p className="font-['Roboto:Bold',sans-serif] font-bold leading-[0] relative shrink-0 text-[0px]" style={{ fontVariationSettings: "'wdth' 100" }}>
                        <span className="leading-[48px] text-[32px]">40/</span>
                        <span className="font-['Roboto:Regular',sans-serif] font-normal leading-[48px] text-[32px]" style={{ fontVariationSettings: "'wdth' 100" }}>
                          40 ml
                        </span>
                      </p>
                      <p className="font-['Roboto:Regular',sans-serif] font-normal leading-[32px] relative shrink-0 text-[24px]" style={{ fontVariationSettings: "'wdth' 100" }}>
                        100 %
                      </p>
                    </div>
                    <div className="content-stretch flex flex-col items-start justify-center relative shrink-0 text-[#00769e] tracking-[0.1px] whitespace-nowrap">
                      <p className="font-['Roboto:Regular',sans-serif] font-normal leading-[24px] relative shrink-0 text-[20px]" style={{ fontVariationSettings: "'wdth' 100" }}>
                        Catheter
                      </p>
                      <p className="font-['Roboto:Bold',sans-serif] font-bold leading-[0] relative shrink-0 text-[0px]" style={{ fontVariationSettings: "'wdth' 100" }}>
                        <span className="leading-[48px] text-[32px]">n/a</span>
                        <span className="font-['Roboto:Regular',sans-serif] font-normal leading-[48px] text-[32px]" style={{ fontVariationSettings: "'wdth' 100" }}>{` ml`}</span>
                      </p>
                      <p className="font-['Roboto:Regular',sans-serif] font-normal leading-[32px] relative shrink-0 text-[24px]" style={{ fontVariationSettings: "'wdth' 100" }}>
                        n/a cm
                      </p>
                    </div>
                    <div className="flex flex-row items-center self-stretch">
                      <div className="content-stretch flex gap-[40px] h-full items-center relative shrink-0">
                        <div className="content-stretch flex flex-col h-full items-start relative shrink-0 text-[#00769e] tracking-[0.1px] w-[167px] whitespace-nowrap">
                          <p className="font-['Roboto:Regular',sans-serif] font-normal leading-[24px] relative shrink-0 text-[20px]" style={{ fontVariationSettings: "'wdth' 100" }}>
                            Next refill before
                          </p>
                          <p className="font-['Roboto:Bold',sans-serif] font-bold leading-[48px] relative shrink-0 text-[32px]" style={{ fontVariationSettings: "'wdth' 100" }}>
                            n/a
                          </p>
                        </div>
                        <div className="content-stretch flex h-full items-start justify-center relative shrink-0">
                          <div className="content-stretch flex items-center justify-center relative shrink-0">
                            <div className="bg-[#0094c5] content-stretch flex gap-[16px] h-[88px] items-center justify-center min-w-[240px] px-[40px] relative rounded-[80px] shrink-0">
                              <div className="overflow-clip relative shrink-0 size-[48px]">
                                <div className="absolute inset-[8.17%_31.76%_8.18%_14.47%]">
                                  <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgVector6} />
                                </div>
                                <div className="absolute inset-[57.95%_28.15%_8.67%_52.67%]">
                                  <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgVector7} />
                                </div>
                              </div>
                              <div className="flex flex-col font-['Roboto:Bold',sans-serif] font-bold justify-center leading-[0] relative shrink-0 text-[0px] text-white tracking-[0.1px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
                                <p className="leading-[32px] text-[24px]" style={{ fontVariationSettings: "'wdth' 100" }}>
                                  Refill
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-[#e6f4f9] content-stretch flex flex-col items-start relative rounded-[24px] shrink-0 w-[1040px]">
          <div className="content-stretch flex gap-[24px] h-[112px] items-center pl-[16px] pr-[40px] py-[16px] relative shrink-0 w-[1040px]">
            <div className="content-stretch flex flex-[1_0_0] items-center justify-center min-w-px relative">
              <div className="content-stretch flex flex-[1_0_0] gap-[16px] items-center min-w-px relative">
                <div className="overflow-clip relative shrink-0 size-[64px]">
                  <div className="absolute inset-[6.8%_18.28%_5.93%_16.48%]">
                    <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgVector8} />
                  </div>
                  <div className="absolute inset-[68.86%_30.94%_17.45%_55.37%]">
                    <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgVector9} />
                  </div>
                </div>
                <p className="font-['Roboto:ExtraBold',sans-serif] font-extrabold leading-[56px] relative shrink-0 text-[#00769e] text-[48px] tracking-[0.1px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
                  Frida Kenton
                </p>
              </div>
            </div>
            <div className="content-stretch flex items-center relative shrink-0">
              <div className="content-stretch flex items-center relative shrink-0">
                <div className="content-stretch flex items-center justify-center relative shrink-0">
                  <div className="content-stretch flex items-center justify-center min-w-[72px] px-[24px] relative rounded-[40px] shrink-0 size-[72px]">
                    <Icons className="h-[51.151px] overflow-clip relative shrink-0 w-[50.926px]" property1="arrow_forward" />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-[rgba(255,255,255,0.5)] content-stretch flex flex-col gap-[25px] items-start p-[16px] relative rounded-bl-[24px] rounded-br-[24px] shrink-0 w-full">
            <div className="content-stretch flex items-start px-[24px] relative shrink-0 w-full">
              <div className="content-stretch flex flex-[1_0_0] flex-col font-['Roboto:Regular',sans-serif] font-normal gap-[24px] items-start min-w-px relative text-[#00769e] text-[24px] tracking-[0.1px]">
                <div className="content-stretch flex gap-[40px] items-center relative shrink-0 whitespace-nowrap">
                  <p className="leading-[32px] relative shrink-0" style={{ fontVariationSettings: "'wdth' 100" }}>
                    *01.04.1984
                  </p>
                  <p className="leading-[32px] relative shrink-0" style={{ fontVariationSettings: "'wdth' 100" }}>
                    Gender: Female
                  </p>
                  <p className="leading-[0] relative shrink-0" style={{ fontVariationSettings: "'wdth' 100" }}>
                    <span className="leading-[32px]">{`Condition: `}</span>
                    <span className="leading-[32px]" style={{ fontVariationSettings: "'wdth' 100" }}>
                      RRMS
                    </span>
                  </p>
                  <p className="leading-[0] relative shrink-0" style={{ fontVariationSettings: "'wdth' 100" }}>
                    <span className="leading-[32px]">{`Patient N°: `}</span>
                    <span className="font-['Roboto:Light',sans-serif] font-light leading-[32px]" style={{ fontVariationSettings: "'wdth' 100" }}>
                      930230393
                    </span>
                  </p>
                </div>
                <p className="leading-[32px] min-w-full relative shrink-0 w-[min-content]" style={{ fontVariationSettings: "'wdth' 100" }}>
                  Lower limb spasticity, neuropathic pain (burning/shooting), fatigue
                </p>
              </div>
              <div className="overflow-clip relative shrink-0 size-[40px]" />
            </div>
          </div>
        </div>
        <div className="bg-[#e6f4f9] content-stretch flex flex-col items-start relative rounded-[24px] shrink-0 w-[1040px]">
          <div className="content-stretch flex gap-[24px] h-[112px] items-center pl-[16px] pr-[40px] py-[16px] relative shrink-0 w-[1040px]">
            <div className="content-stretch flex flex-[1_0_0] items-center justify-center min-w-px relative">
              <div className="content-stretch flex flex-[1_0_0] gap-[16px] items-center min-w-px relative">
                <div className="overflow-clip relative shrink-0 size-[64px]">
                  <div className="absolute inset-[7.5%_37.5%_77.5%_37.5%]">
                    <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgVector10} />
                  </div>
                  <div className="absolute inset-[20%_27.5%_10%_27.5%]">
                    <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgVector11} />
                  </div>
                </div>
                <p className="font-['Roboto:ExtraBold',sans-serif] font-extrabold leading-[56px] relative shrink-0 text-[#00769e] text-[48px] tracking-[0.1px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
                  Medication
                </p>
              </div>
            </div>
            <div className="content-stretch flex items-center relative shrink-0">
              <div className="content-stretch flex items-center relative shrink-0">
                <div className="content-stretch flex items-center justify-center relative shrink-0">
                  <div className="content-stretch flex items-center justify-center min-w-[72px] px-[24px] relative rounded-[40px] shrink-0 size-[72px]">
                    <Icons className="h-[51.151px] overflow-clip relative shrink-0 w-[50.926px]" property1="arrow_forward" />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-[rgba(255,255,255,0.5)] content-stretch flex flex-col gap-[25px] items-start p-[16px] relative rounded-bl-[24px] rounded-br-[24px] shrink-0 w-full">
            <div className="content-stretch flex gap-[25px] items-start relative shrink-0">
              <div className="bg-white content-stretch flex gap-[24px] items-center overflow-clip px-[23px] py-[10px] relative rounded-[8px] shrink-0">
                <p className="font-['Inter:Bold',sans-serif] font-bold leading-[normal] not-italic relative shrink-0 text-[#063b66] text-[20px] whitespace-nowrap">
                  Baclofen
                </p>
                <div className="bg-[#0b7fa8] h-[22px] overflow-clip relative rounded-[11px] shrink-0 w-[72px]">
                  <p className="absolute font-['Inter:Bold',sans-serif] font-bold leading-[normal] left-[10.5px] not-italic text-[11px] text-white top-[4.5px] whitespace-nowrap">
                    PRIMARY
                  </p>
                </div>
                <p className="font-['Roboto:Regular',sans-serif] font-normal leading-[32px] relative shrink-0 text-[#667380] text-[24px] tracking-[0.1px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
                  1 mg/ml
                </p>
              </div>
              <div className="bg-white content-stretch flex gap-[24px] items-center overflow-clip px-[23px] py-[10px] relative rounded-[8px] shrink-0 whitespace-nowrap">
                <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[normal] not-italic relative shrink-0 text-[#063b66] text-[20px]">
                  Morphine
                </p>
                <p className="font-['Roboto:Regular',sans-serif] font-normal leading-[32px] relative shrink-0 text-[#667380] text-[24px] tracking-[0.1px]" style={{ fontVariationSettings: "'wdth' 100" }}>
                  10 mg/ml
                </p>
              </div>
              <div className="bg-white content-stretch flex gap-[24px] items-center overflow-clip px-[23px] py-[10px] relative rounded-[8px] shrink-0 whitespace-nowrap">
                <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[normal] not-italic relative shrink-0 text-[#063b66] text-[20px]">
                  Bupivacaine
                </p>
                <p className="font-['Roboto:Regular',sans-serif] font-normal leading-[32px] relative shrink-0 text-[#667380] text-[24px] tracking-[0.1px]" style={{ fontVariationSettings: "'wdth' 100" }}>
                  5 mg/ml
                </p>
              </div>
            </div>
          </div>
        </div>
        <div onClick={() => navigate('base-dose')} className="bg-[#e6f4f9] content-stretch flex flex-col items-start relative rounded-[24px] shrink-0 w-[1040px] cursor-pointer">
          <div className="content-stretch flex gap-[24px] h-[112px] items-center pl-[16px] pr-[40px] py-[16px] relative shrink-0 w-[1040px]">
            <div className="content-stretch flex flex-[1_0_0] items-center justify-center min-w-px relative">
              <div className="content-stretch flex flex-[1_0_0] gap-[16px] items-center min-w-px relative">
                <div className="overflow-clip relative shrink-0 size-[64px]">
                  <div className="-translate-x-1/2 absolute aspect-[400/400] bottom-0 left-1/2 overflow-clip top-0">
                    <div className="absolute contents inset-[18.92%_30.29%_32.95%_15.2%]">
                      <div className="absolute inset-[18.92%_30.29%_71%_15.2%]">
                        <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgVector12} />
                      </div>
                      <div className="absolute inset-[27.82%_50.03%_32.95%_15.2%]">
                        <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgVector13} />
                      </div>
                    </div>
                    <div className="absolute inset-[12.67%_35.51%_78.7%_20.41%]">
                      <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgVector14} />
                    </div>
                    <div className="absolute inset-[47.67%_52.31%_41.86%_37.22%]">
                      <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgVector15} />
                    </div>
                    <div className="absolute inset-[26.63%_30.29%_70.99%_15.2%]">
                      <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgVector16} />
                    </div>
                    <div className="absolute inset-[47.67%_66.88%_41.86%_22.65%]">
                      <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgVector17} />
                    </div>
                    <div className="absolute inset-[33.1%_66.88%_56.43%_22.65%]">
                      <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgVector18} />
                    </div>
                    <div className="absolute inset-[33.1%_52.31%_56.43%_37.22%]">
                      <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgVector19} />
                    </div>
                    <div className="absolute inset-[32.13%_22.02%_58.18%_61.41%]">
                      <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgVector20} />
                    </div>
                    <div className="absolute inset-[39.42%_15.2%_12.67%_54.61%]">
                      <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgVector21} />
                    </div>
                    <div className="absolute inset-[28.93%_31.08%_71%_64.17%]">
                      <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgVector22} />
                    </div>
                  </div>
                </div>
                <p className="font-['Roboto:ExtraBold',sans-serif] font-extrabold leading-[56px] relative shrink-0 text-[#00769e] text-[48px] tracking-[0.1px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
                  Therapy
                </p>
              </div>
            </div>
            <div className="content-stretch flex items-center relative shrink-0">
              <div className="content-stretch flex items-center relative shrink-0">
                <div className="content-stretch flex items-center justify-center relative shrink-0">
                  <div className="content-stretch flex items-center justify-center min-w-[72px] px-[24px] relative rounded-[40px] shrink-0 size-[72px]">
                    <Icons className="h-[51.151px] overflow-clip relative shrink-0 w-[50.926px]" property1="arrow_forward" />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-[rgba(255,255,255,0.5)] content-stretch flex flex-col gap-[25px] items-start p-[16px] relative rounded-bl-[24px] rounded-br-[24px] shrink-0 w-full">
            <div className="content-stretch flex items-center relative shrink-0 w-full">
              <div className="content-stretch flex flex-[1_0_0] items-center min-w-px relative">
                <div className="content-stretch flex flex-[1_0_0] items-center min-w-px relative">
                  <div className="bg-[#fdf3d1] content-stretch flex flex-[1_0_0] gap-[24px] items-center min-w-px overflow-clip p-[24px] relative rounded-[24px]">
                    <div className="h-[40px] overflow-clip relative shrink-0 w-[41px]">
                      <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgIcons} />
                    </div>
                    <div className="content-stretch flex flex-[1_0_0] flex-col gap-[24px] items-start justify-center min-w-px relative">
                      <p className="font-['Roboto:Regular',sans-serif] font-normal leading-[32px] relative shrink-0 text-[#45483c] text-[24px] tracking-[0.1px] w-full" style={{ fontVariationSettings: "'wdth' 100" }}>
                        Set up a therapy for your patient to start the medication delivery.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <AndroidTopBar className="absolute h-[35px] left-0 top-0 w-[1200px]" />
      <div className="absolute bg-[#e6f4f9] content-stretch flex h-[120px] items-center justify-center left-0 overflow-x-clip overflow-y-auto px-[16px] py-[8px] top-[1800px] w-[1200px]">
        <div className="content-stretch flex flex-[1_0_0] gap-[16px] items-start justify-center min-w-px relative">
          <a className="content-stretch cursor-pointer flex flex-col gap-[8px] items-center justify-center min-h-[80px] relative shrink-0 w-[100px]">
            <div className="bg-[#b2ecff] h-[56px] relative rounded-[24px] shrink-0 w-[80px]">
              <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgSelector} />
              <div className="absolute left-[11.5px] overflow-clip size-[56px] top-0">
                <div className="-translate-x-1/2 absolute aspect-[24/24] bottom-0 left-1/2 top-0" />
                <div className="absolute inset-[12.5%_12.5%_13.25%_12.5%]">
                  <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgGroup1795} />
                </div>
              </div>
            </div>
            <p className="font-['Roboto:Bold',sans-serif] font-bold leading-[24px] overflow-hidden relative shrink-0 text-[#00769e] text-[20px] text-center text-ellipsis tracking-[0.1px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
              Overview
            </p>
          </a>
          <div className="content-stretch flex flex-col gap-[8px] items-center justify-center min-h-[80px] relative shrink-0 w-[100px]">
            <div className="h-[56px] relative shrink-0 w-[64px]">
              <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgSelector1} />
              <div className="absolute left-[3.5px] overflow-clip size-[56px] top-0">
                <div className="absolute inset-[9.91%_15.71%]">
                  <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgVector23} />
                </div>
                <div className="absolute inset-[27.92%_22.15%_16.35%_22.11%]">
                  <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgVector24} />
                </div>
                <div className="absolute inset-[15.44%_44.63%_74.24%_45.06%]">
                  <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgVector25} />
                </div>
              </div>
            </div>
            <p className="font-['Roboto:Regular',sans-serif] font-normal leading-[24px] min-w-full overflow-hidden relative shrink-0 text-[#45483c] text-[20px] text-center text-ellipsis tracking-[0.1px] w-[min-content] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
              Implant
            </p>
          </div>
          <a className="content-stretch cursor-pointer flex flex-col gap-[8px] items-center justify-center min-h-[80px] relative shrink-0 w-[100px]">
            <div className="h-[56px] relative shrink-0 w-[64px]">
              <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgSelector1} />
              <div className="absolute left-[3.5px] overflow-clip size-[56px] top-0">
                <div className="absolute inset-[6.8%_18.28%_5.93%_16.48%]">
                  <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgVector26} />
                </div>
                <div className="absolute inset-[68.86%_30.94%_17.45%_55.37%]">
                  <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgVector27} />
                </div>
              </div>
            </div>
            <p className="font-['Roboto:Regular',sans-serif] font-normal leading-[24px] min-w-full overflow-hidden relative shrink-0 text-[#45483c] text-[20px] text-center text-ellipsis tracking-[0.1px] w-[min-content] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
              Patient
            </p>
          </a>
          <div className="content-stretch flex flex-col gap-[8px] items-center justify-center min-h-[80px] relative shrink-0 w-[100px]">
            <div className="h-[56px] relative shrink-0 w-[64px]">
              <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgSelector1} />
              <div className="absolute left-[3.5px] overflow-clip size-[56px] top-0">
                <div className="absolute inset-[7.5%_37.5%_77.5%_37.5%]">
                  <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgVector28} />
                </div>
                <div className="absolute inset-[20%_27.5%_10%_27.5%]">
                  <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgVector29} />
                </div>
              </div>
            </div>
            <p className="font-['Roboto:Regular',sans-serif] font-normal leading-[24px] overflow-hidden relative shrink-0 text-[#45483c] text-[20px] text-center text-ellipsis tracking-[0.1px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
              Medication
            </p>
          </div>
          <a className="content-stretch cursor-pointer flex flex-col gap-[8px] items-center justify-center min-h-[80px] relative shrink-0 w-[100px]">
            <div className="h-[56px] relative shrink-0 w-[64px]">
              <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgSelector1} />
              <div className="absolute left-[3.5px] overflow-clip size-[56px] top-0">
                <div className="-translate-x-1/2 absolute aspect-[400/400] bottom-0 left-1/2 overflow-clip top-0">
                  <div className="absolute contents inset-[18.92%_30.29%_32.95%_15.2%]">
                    <div className="absolute inset-[18.92%_30.29%_71%_15.2%]">
                      <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgVector30} />
                    </div>
                    <div className="absolute inset-[27.82%_50.03%_32.95%_15.2%]">
                      <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgVector31} />
                    </div>
                  </div>
                  <div className="absolute inset-[12.67%_35.51%_78.7%_20.41%]">
                    <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgVector32} />
                  </div>
                  <div className="absolute inset-[47.67%_52.31%_41.86%_37.22%]">
                    <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgVector33} />
                  </div>
                  <div className="absolute inset-[26.63%_30.29%_70.99%_15.2%]">
                    <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgVector34} />
                  </div>
                  <div className="absolute inset-[47.67%_66.88%_41.86%_22.65%]">
                    <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgVector35} />
                  </div>
                  <div className="absolute inset-[33.1%_66.88%_56.43%_22.65%]">
                    <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgVector36} />
                  </div>
                  <div className="absolute inset-[33.1%_52.31%_56.43%_37.22%]">
                    <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgVector37} />
                  </div>
                  <div className="absolute inset-[32.13%_22.02%_58.18%_61.41%]">
                    <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgVector38} />
                  </div>
                  <div className="absolute inset-[39.42%_15.2%_12.67%_54.61%]">
                    <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgVector39} />
                  </div>
                  <div className="absolute inset-[28.93%_31.08%_71%_64.17%]">
                    <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgVector40} />
                  </div>
                </div>
              </div>
            </div>
            <p className="font-['Roboto:Regular',sans-serif] font-normal leading-[24px] min-w-full overflow-hidden relative shrink-0 text-[#45483c] text-[20px] text-center text-ellipsis tracking-[0.1px] w-[min-content] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
              Therapy
            </p>
          </a>
          <a className="content-stretch cursor-pointer flex flex-col gap-[8px] items-center justify-center min-h-[80px] relative shrink-0 w-[100px]">
            <div className="h-[56px] relative shrink-0 w-[64px]">
              <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgSelector1} />
              <div className="absolute left-[3.5px] overflow-clip size-[56px] top-0">
                <div className="absolute contents inset-[2.5%_0_0_2.5%]">
                  <div className="absolute inset-[2.5%_0_0_2.5%]">
                    <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgEbene2} />
                  </div>
                </div>
              </div>
            </div>
            <p className="font-['Roboto:Regular',sans-serif] font-normal leading-[24px] min-w-full overflow-hidden relative shrink-0 text-[#45483c] text-[20px] text-center text-ellipsis tracking-[0.1px] w-[min-content] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
              Help
            </p>
          </a>
          <a className="content-stretch cursor-pointer flex flex-col gap-[8px] items-center justify-center min-h-[80px] relative shrink-0 w-[100px]">
            <div className="h-[56px] relative shrink-0 w-[64px]">
              <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgSelector1} />
              <div className="absolute left-[3.5px] overflow-clip size-[56px] top-0">
                <div className="absolute inset-[7.5%_10.7%_7.5%_9.3%]">
                  <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgGroup85} />
                </div>
              </div>
            </div>
            <p className="font-['Roboto:Regular',sans-serif] font-normal leading-[24px] min-w-full overflow-hidden relative shrink-0 text-[#45483c] text-[20px] text-center text-ellipsis tracking-[0.1px] w-[min-content] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
              Settings
            </p>
          </a>
          <a className="content-stretch cursor-pointer flex flex-col gap-[8px] items-center justify-center min-h-[80px] relative shrink-0 w-[100px]">
            <div className="h-[56px] relative shrink-0 w-[64px]">
              <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgSelector1} />
              <div className="absolute left-[3.5px] overflow-clip size-[56px] top-0">
                <div className="-translate-x-1/2 absolute aspect-[24/24] bottom-0 left-1/2 top-0" />
                <div className="-translate-y-1/2 absolute aspect-[159.490234375/151.7631072998047] left-[15.25%] right-[16.27%] top-[calc(50%+0.03px)]">
                  <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgGroup1794} />
                </div>
              </div>
            </div>
            <p className="font-['Roboto:Regular',sans-serif] font-normal leading-[24px] overflow-hidden relative shrink-0 text-[#45483c] text-[20px] text-center text-ellipsis tracking-[0.1px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
              Disconnect
            </p>
          </a>
        </div>
      </div>
    </div>
  );
}