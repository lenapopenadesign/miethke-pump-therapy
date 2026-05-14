import { useNavigate } from '../navigation';
import { useTherapy, morphineMgDay, bupivacaineMgDay, hourlyUg } from '../therapy';

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
// Stepper assets
const imgEllipse72 = "/icons/815f2ff8-cf86-4d26-a856-f4dd1c28b94d.svg";
const imgEllipse73 = "/icons/8f4c5654-4dce-4ae1-96fb-6192337f71e1.svg";
const imgChevronOn = "/icons/bb340433-66d7-4d99-8d2c-4b4aad876d8f.svg";
const imgChevronOff = "/icons/1d72df2a-e2fa-44b5-b500-8101e9ef3cec.svg";
const imgChevronEnd = "/icons/f251b7a9-1365-427b-a36c-890bb6984572.svg";
const imgStepperEmpty = "/icons/7c235bc5-7127-424c-9618-232d0f9906e7.svg";
// New Figma icons (saved from MCP assets)
const imgMedication = "/icons/medication.svg";
const imgEditPencil = "/icons/edit-pencil.svg";

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

export function BaseDose() {
  const navigate = useNavigate();
  const { baseDose, setBaseDose } = useTherapy();
  const stepDown = () => setBaseDose(Math.max(0, baseDose - 10));
  const stepUp = () => setBaseDose(Math.min(2000, baseDose + 10));
  const hourly = hourlyUg(baseDose);
  const morMgD = morphineMgDay(baseDose);
  const morMgH = morMgD / 24;
  const bupMgD = bupivacaineMgDay(baseDose);
  const bupMgH = bupMgD / 24;
  const ctaEnabled = baseDose > 0;
  return (
    <div className="bg-white relative size-full">
      {/* Top status bar */}
      <div className="absolute bg-[#3b2d7c] h-[35px] left-0 top-0 w-[1200px]" />

      {/* Nav bar */}
      <div className="absolute bg-[#e6f4f9] content-stretch flex h-[120px] items-center justify-between left-0 px-[40px] py-[8px] top-[35px] w-[1200px]">
        <div className="content-stretch flex gap-[40px] items-center relative shrink-0">
          <div onClick={() => navigate('home-no-therapy')} className="flex items-center justify-center relative shrink-0 cursor-pointer">
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
              Therapy
            </p>
          </div>
        </div>
        <div className="content-stretch flex items-center relative shrink-0">
          <div className="h-[62px] overflow-clip relative shrink-0 w-[53px]">
            <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgBBraunMiethkeSignet} />
          </div>
        </div>
      </div>

      {/* 3-step stepper: Dosage (active), Review, Activate */}
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

      {/* Body — flex column matching the Figma frame, with content top + button bottom */}
      <div className="absolute left-0 top-[235px] h-[1685px] w-[1200px] flex flex-col items-start justify-between px-[80px] py-[80px]">
        {/* Content group */}
        <div className="flex flex-col gap-[40px] items-start w-full">
          {/* Title + helper */}
          <div className="flex flex-col gap-[24px] items-start w-full">
            <div className="flex gap-[16px] items-start w-full">
              <img alt="" src={imgMedication} className="size-[56px] shrink-0 block" />
              <div className="flex flex-col items-start justify-center pt-[8px]">
                <p className="font-['Roboto',sans-serif] font-bold leading-[40px] text-[#00769e] text-[36px] tracking-[0.1px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
                  Base Dose
                </p>
              </div>
            </div>
            <p className="font-['Roboto',sans-serif] font-normal leading-[32px] text-[#45483c] text-[24px] tracking-[0.1px] w-[1040px]" style={{ fontVariationSettings: "'wdth' 100" }}>
              Type the primary dose or use ± to adjust.
            </p>
          </div>

          {/* Chart + medications */}
          <div className="flex flex-col gap-[80px] items-start w-full">
            {/* 24-hour view */}
            <div className="flex flex-col gap-[24px] items-start">
              <p className="font-['Roboto',sans-serif] font-bold leading-[32px] text-[#00769e] text-[28px] tracking-[0.1px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
                24-hour view
              </p>
              <div className="bg-[#f7fafc] border border-[#d9dbde] border-solid h-[200px] relative rounded-[16px] w-[1040px]">
                {['00:00', '06:00', '12:00', '18:00', '24:00'].map((t, i) => (
                  <p key={t} className="absolute font-['Roboto',sans-serif] font-normal text-[#9ea8b2] text-[16px] top-[10px] whitespace-nowrap"
                     style={{ left: [27, 252.5, 499, 744, 965][i], fontVariationSettings: "'wdth' 100" }}>
                    {t}
                  </p>
                ))}
                {baseDose > 0 && (
                  <div
                    className="absolute bg-[#8cc7e8] rounded-[4px] flex items-center px-[24px]"
                    style={{ left: 20, right: 20, bottom: 24, height: 60 }}
                  >
                    <p className="font-['Roboto',sans-serif] font-semibold text-white text-[20px] tracking-[0.1px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
                      Base dose {baseDose} µg/d ≈ {hourly.toFixed(1)} µg/h
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Medication rows */}
            <div className="flex flex-col gap-[24px] items-start w-[1040px]">
              {/* Baclofen — primary, editable */}
              <div className="flex gap-[24px] items-center w-full">
                <p className="font-['Roboto',sans-serif] text-[#00769e] tracking-[0.1px] w-[262px]" style={{ fontVariationSettings: "'wdth' 100" }}>
                  <span className="font-bold leading-[32px] text-[28px]">Baclofen</span>
                  <span className="leading-[32px] text-[24px]"> 1 mg/ml</span>
                </p>
                <div className="flex gap-[24px] items-center">
                  <div className="flex h-full items-start pt-[23px]">
                    <div
                      onClick={stepDown}
                      className="bg-[#e6f4f9] border border-[#00769e] border-solid flex flex-col items-center justify-center overflow-clip px-[12px] py-[8px] rounded-[12px] size-[72px] cursor-pointer select-none"
                    >
                      <p className="font-['Roboto',sans-serif] font-extrabold leading-[56px] text-[#00769e] text-[48px] text-center tracking-[0.1px] w-full" style={{ fontVariationSettings: "'wdth' 100" }}>
                        −
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col h-[124px] items-start justify-center w-[205px]">
                    <div className="flex items-center px-[16px] w-full">
                      <p className="font-['Roboto',sans-serif] font-bold h-[33px] leading-[24px] text-[#00769e] text-[24px] text-left tracking-[0.1px] w-full" style={{ fontVariationSettings: "'wdth' 100" }}>
                        Dose/day
                      </p>
                    </div>
                    <div className="bg-white border border-[#a5a5a5] border-solid flex gap-[8px] h-[72px] items-center pb-[16px] pl-[16px] pr-[8px] pt-[12px] rounded-[8px] w-full">
                      <input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        value={baseDose}
                        onChange={e => {
                          const n = parseInt(e.target.value.replace(/[^0-9]/g, ''), 10) || 0;
                          setBaseDose(Math.max(0, Math.min(2000, n)));
                        }}
                        className="flex-[1_0_0] min-w-px font-bold text-[#45483c] text-[36px] leading-[48px] tracking-[0.1px] bg-transparent outline-none border-0 p-0 text-left"
                        style={{ fontFamily: 'Roboto, sans-serif', fontVariationSettings: "'wdth' 100" }}
                      />
                      <div className="flex items-center justify-center pr-[8px]">
                        <p className="font-['Roboto',sans-serif] font-normal leading-[32px] text-[#a5a5a5] text-[24px] text-right tracking-[0.1px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
                          µg/d
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex h-full items-start pt-[23px]">
                    <div
                      onClick={stepUp}
                      className="bg-[#e6f4f9] border border-[#00769e] border-solid flex flex-col items-center justify-center overflow-clip px-[12px] py-[8px] rounded-[12px] size-[72px] cursor-pointer select-none"
                    >
                      <p className="font-['Roboto',sans-serif] font-extrabold leading-[56px] text-[#00769e] text-[48px] text-center tracking-[0.1px] w-full" style={{ fontVariationSettings: "'wdth' 100" }}>
                        +
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex-[1_0_0] flex flex-col gap-[4px] items-start min-w-px self-stretch justify-end">
                  <div className="flex items-center px-[16px]">
                    <p className="font-['Roboto',sans-serif] font-bold h-[24px] leading-[24px] text-[#00769e] text-[24px] tracking-[0.1px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
                      Dose/hour
                    </p>
                  </div>
                  <div className="flex gap-[24px] h-[72px] items-center w-full">
                    <div className="flex flex-[1_0_0] h-[72px] items-center min-w-px pb-[16px] pl-[16px] pr-[8px] pt-[12px]">
                      <p className="flex-[1_0_0] font-['Roboto',sans-serif] text-[#a5a5a5] tracking-[0.1px]" style={{ fontVariationSettings: "'wdth' 100" }}>
                        <span className="font-semibold leading-[48px] text-[32px]">≈ </span>
                        <span className="leading-[48px] text-[32px]">{hourly.toFixed(1)}</span>
                      </p>
                      <p className="font-['Roboto',sans-serif] font-normal leading-[32px] text-[#a5a5a5] text-[24px] text-right tracking-[0.1px] pr-[8px]" style={{ fontVariationSettings: "'wdth' 100" }}>
                        µg/h
                      </p>
                    </div>
                    <img alt="" src={imgEditPencil} className="size-[40px] shrink-0 block" />
                  </div>
                </div>
              </div>

              <DerivedMedicationRow label="Morphine" concentration="10 mg/ml" daily={morMgD} hourly={morMgH} />
              <DerivedMedicationRow label="Bupivacaine" concentration="5 mg/ml" daily={bupMgD} hourly={bupMgH} />
            </div>
          </div>
        </div>

        {/* Continue CTA */}
        <div
          onClick={() => { if (ctaEnabled) navigate('intervals-empty'); }}
          className={`flex gap-[16px] h-[88px] items-center justify-center min-w-[240px] px-[40px] rounded-[80px] w-full ${ctaEnabled ? 'bg-[#0094c5] cursor-pointer' : 'bg-[#cbcbcb] cursor-not-allowed'}`}
        >
          <p className={`font-['Roboto',sans-serif] font-bold leading-[32px] text-[24px] tracking-[0.1px] whitespace-nowrap ${ctaEnabled ? 'text-white' : 'text-[#a5a5a5]'}`} style={{ fontVariationSettings: "'wdth' 100" }}>
            Continue to intervals
          </p>
        </div>
      </div>
    </div>
  );
}

function DerivedMedicationRow({ label, concentration, daily, hourly }: { label: string; concentration: string; daily: number; hourly: number }) {
  const dailyStr = daily === 0 ? '0' : daily.toFixed(2);
  const hourlyStr = hourly === 0 ? '0.0' : hourly.toFixed(3);
  return (
    <div className="flex gap-[24px] items-center w-full">
      <p className="font-['Roboto',sans-serif] text-[#00769e] tracking-[0.1px] w-[262px]" style={{ fontVariationSettings: "'wdth' 100" }}>
        <span className="font-bold leading-[32px] text-[28px]">{label}</span>
        <span className="leading-[32px] text-[24px]"> {concentration}</span>
      </p>
      <div className="flex gap-[24px] items-center">
        <div className="w-[72px]" />
        <div className="flex flex-col h-[124px] items-start justify-center w-[205px]">
          <div className="bg-white flex gap-[8px] h-[72px] items-center pb-[16px] pl-[16px] pr-[8px] pt-[12px] rounded-[8px] w-full">
            <p className="flex-[1_0_0] font-['Roboto',sans-serif] font-normal leading-[40px] text-[#45483c] text-[36px] tracking-[0.1px]" style={{ fontVariationSettings: "'wdth' 100" }}>
              {dailyStr}
            </p>
            <p className="font-['Roboto',sans-serif] font-normal leading-[32px] text-[#a5a5a5] text-[24px] text-right tracking-[0.1px] pr-[8px]" style={{ fontVariationSettings: "'wdth' 100" }}>
              mg/d
            </p>
          </div>
        </div>
        <div className="w-[72px]" />
      </div>
      <div className="flex-[1_0_0] flex flex-col gap-[4px] items-start min-w-px self-stretch justify-end">
        <div className="flex gap-[24px] h-[72px] items-center w-full">
          <div className="flex flex-[1_0_0] h-[72px] items-center min-w-px pb-[16px] pl-[16px] pr-[8px] pt-[12px]">
            <p className="flex-[1_0_0] font-['Roboto',sans-serif] text-[#a5a5a5] tracking-[0.1px]" style={{ fontVariationSettings: "'wdth' 100" }}>
              <span className="font-semibold leading-[48px] text-[32px]">≈</span>
              <span className="leading-[48px] text-[32px]">{hourlyStr}</span>
            </p>
            <p className="font-['Roboto',sans-serif] font-normal leading-[32px] text-[#a5a5a5] text-[24px] text-right tracking-[0.1px] pr-[8px]" style={{ fontVariationSettings: "'wdth' 100" }}>
              mg/h
            </p>
          </div>
          <img alt="" src={imgEditPencil} className="size-[40px] shrink-0 block" />
        </div>
      </div>
    </div>
  );
}
