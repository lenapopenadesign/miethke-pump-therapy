import type { ReactNode } from 'react';
import { useNavigate } from '../navigation';
import { useTherapy } from '../therapy';

// Existing assets in /public/icons/
const imgImplantOuter = "/icons/34c72d33-da0a-4524-baf8-8740816e1c94.svg";
const imgImplantInner = "/icons/9abb359f-8740-4fa9-b48f-b8901ba56a97.svg";
const imgImplantCenter = "/icons/37e6818a-754b-4e9b-b353-0ad921147c10.svg";
const imgArrowFwd = "/icons/f04447fa-418c-41ba-99a3-878c9f1c122c.svg";
const imgBluetooth = "/icons/5a33dcf5-7db9-4c58-93be-23c8e66ada1b.svg";
const imgPumpBody = "/icons/8e769376-bb2c-4c40-bf16-19717acbcf24.svg";
const imgPatientHead = "/icons/2eda2d01-d4e8-442a-91df-65a1be850736.svg";
const imgPatientBody = "/icons/6d08d65a-50cc-4fbb-ade0-78f165f059ad.svg";
const imgTherapy01 = "/icons/86041251-eefc-437f-9c68-eee545a2721d.svg";
const imgTherapy02 = "/icons/8d31e267-ec75-4add-9d89-97211b424d32.svg";
const imgTherapy03 = "/icons/e9e53145-0ec5-40b7-8359-a720dcd02449.svg";
const imgTherapy04 = "/icons/40b89d5b-ffe5-4ab8-a1ce-bfa401c1a860.svg";
const imgTherapy05 = "/icons/65f0d980-9729-4820-ba8b-314977019341.svg";
const imgTherapy06 = "/icons/4c65984c-3093-4ed3-96f1-606e9b65eb73.svg";
const imgTherapy07 = "/icons/80271cf8-433b-4d48-ade8-2f5e1943b05d.svg";
const imgTherapy08 = "/icons/da0a9424-bf45-4276-a9d3-60677cd311aa.svg";
const imgTherapy09 = "/icons/f748d09e-4a0f-4f03-8813-8c6d958b3ef3.svg";
const imgTherapy10 = "/icons/08079513-b51d-4f09-a094-e858ea891284.svg";
const imgTherapy11 = "/icons/3c7eb014-c471-4859-b52f-023af2e3fc6b.svg";
const imgNavOverviewPill = "/icons/257336f4-1d98-46f9-92eb-855702fd3118.svg";
const imgNavOverviewIcon = "/icons/30358e4e-226d-42ef-8449-98c02bc14dfe.svg";
const imgNavInactivePill = "/icons/f7e2f5be-7c5c-48a1-a1bb-4744028ad99c.svg";
const imgNavHelp = "/icons/d27fa211-b646-4694-a8e2-740d137a7c84.svg";
const imgNavSettings = "/icons/109674c9-3940-44e4-9672-28139cb9e304.svg";
const imgNavDisconnect = "/icons/cb04e1a6-33a3-484f-a9d2-9f0910fa9fc3.svg";

// New assets downloaded for the updated home screens
const imgCathInline = "/icons/f1df5fc9-3123-4343-bf12-b6bacbd170ab.svg";
const imgActiveCheck = "/icons/b3500d59-7e08-4cd9-a69d-8fff2c2f40b7.gif";
const imgActionsHand = "/icons/5d577001-d49c-4bb9-9a48-3948e35d4261.svg";
// Action-card tile icons (from the redesigned home Figma)
const imgActOnboarding = "/icons/act-onboarding.svg";
const imgActPrefillSyringe = "/icons/act-prefill-syringe.svg";
const imgActPrefillPump = "/icons/act-prefill-pump.svg";
const imgActAccess = "/icons/act-access.svg";
const imgActPrime1 = "/icons/act-prime-1.svg";
const imgActPrime2 = "/icons/act-prime-2.svg";
const imgActPrime3 = "/icons/act-prime-3.svg";
const imgActClinician1 = "/icons/act-clinician-1.svg";
const imgActClinician2 = "/icons/act-clinician-2.svg";
const imgWarning = "/icons/c667ceb3-ed53-4c5b-b4f8-9b7620e8b97b.svg";

/** Amber "start the onboarding…" note used in the no-therapy Patient/Therapy cards. */
function WarningNote({ text }: { text: string }) {
  return (
    <div className="bg-[#fdf3d1] flex gap-[16px] items-center rounded-[16px] px-[24px] py-[16px] w-full">
      <div className="h-[40px] w-[41px] shrink-0 relative">
        <img alt="" src={imgWarning} className="absolute inset-0 block size-full" />
      </div>
      <p className="font-['Roboto',sans-serif] font-normal text-[#45483c] text-[24px] leading-[32px] tracking-[0.1px]" style={{ fontVariationSettings: "'wdth' 100" }}>{text}</p>
    </div>
  );
}

// White "Add Therapy" icon (medication calendar + bottle + plus) — exact Figma
// composition (node 7963:45207), white assets for the filled action tile.
const atImg = (n: number) => `/icons/at-${n}.svg`;
const IMGF = "absolute block inset-0 max-w-none size-full";
function AddTherapyIcon() {
  return (
    <div className="absolute inset-0" style={{ transform: 'translate(18px, 16px)' }}>
      <div className="absolute left-[-14px] overflow-clip size-[104.145px] top-[1.18px]">
        <div className="-translate-x-1/2 absolute aspect-[400/400] bottom-0 left-1/2 overflow-clip top-0">
          <div className="absolute contents inset-[18.92%_30.29%_32.95%_15.2%]">
            <div className="absolute inset-[18.92%_30.29%_71%_15.2%]"><img alt="" className={IMGF} src={atImg(1)} /></div>
            <div className="absolute inset-[27.82%_50.03%_32.95%_15.2%]"><img alt="" className={IMGF} src={atImg(2)} /></div>
          </div>
          <div className="absolute inset-[12.67%_35.51%_78.7%_20.41%]"><img alt="" className={IMGF} src={atImg(3)} /></div>
          <div className="absolute inset-[47.67%_52.31%_41.86%_37.22%]"><img alt="" className={IMGF} src={atImg(4)} /></div>
          <div className="absolute inset-[26.63%_30.29%_70.99%_15.2%]"><img alt="" className={IMGF} src={atImg(5)} /></div>
          <div className="absolute inset-[47.67%_66.88%_41.86%_22.65%]"><img alt="" className={IMGF} src={atImg(6)} /></div>
          <div className="absolute inset-[33.1%_66.88%_56.43%_22.65%]"><img alt="" className={IMGF} src={atImg(7)} /></div>
          <div className="absolute inset-[33.1%_52.31%_56.43%_37.22%]"><img alt="" className={IMGF} src={atImg(8)} /></div>
          <div className="absolute inset-[32.13%_22.02%_58.18%_61.41%]"><img alt="" className={IMGF} src={atImg(9)} /></div>
          <div className="absolute inset-[39.42%_15.2%_12.67%_54.61%]"><img alt="" className={IMGF} src={atImg(10)} /></div>
          <div className="absolute inset-[28.93%_31.08%_71%_64.17%]"><img alt="" className={IMGF} src={atImg(11)} /></div>
        </div>
      </div>
      <div className="absolute content-stretch flex flex-col h-[77.335px] items-center justify-center left-[74.51px] overflow-clip px-[3.025px] py-[4.537px] top-[-19.95px] w-[49.494px]">
        <div className="h-[30.382px] overflow-clip relative shrink-0 w-[30.248px]">
          <img alt="" className={IMGF} src="/icons/at-plus.svg" />
        </div>
      </div>
    </div>
  );
}

function ArrowForward({ size = 40 }: { size?: number }) {
  return (
    <div className="content-stretch flex items-center justify-center min-w-[72px] px-[24px] relative rounded-[40px] shrink-0 size-[72px]">
      <div className="overflow-clip relative shrink-0" style={{ width: size * 1.273, height: size * 1.279 }}>
        <div className="absolute inset-[20%_0.03%_17.61%_0]">
          <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgArrowFwd} />
        </div>
      </div>
    </div>
  );
}

export function PatientIcon({ size = 64 }: { size?: number }) {
  return (
    <div className="overflow-clip relative shrink-0" style={{ width: size, height: size }}>
      <div className="absolute inset-[6.8%_18.28%_5.93%_16.48%]">
        <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgPatientHead} />
      </div>
      <div className="absolute inset-[68.86%_30.94%_17.45%_55.37%]">
        <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgPatientBody} />
      </div>
    </div>
  );
}

export function ImplantIcon({ size = 64 }: { size?: number }) {
  return (
    <div className="overflow-clip relative shrink-0" style={{ width: size, height: size }}>
      <div className="absolute inset-[9.91%_15.71%]">
        <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgImplantOuter} />
      </div>
      <div className="absolute inset-[27.92%_22.15%_16.35%_22.11%]">
        <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgImplantInner} />
      </div>
      <div className="absolute inset-[15.44%_44.63%_74.24%_45.06%]">
        <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgImplantCenter} />
      </div>
    </div>
  );
}

export function TherapyIcon({ size = 64 }: { size?: number }) {
  return (
    <div className="overflow-clip relative shrink-0" style={{ width: size, height: size }}>
      <div className="-translate-x-1/2 absolute aspect-[400/400] bottom-0 left-1/2 overflow-clip top-0">
        <div className="absolute contents inset-[18.92%_30.29%_32.95%_15.2%]">
          <div className="absolute inset-[18.92%_30.29%_71%_15.2%]"><img alt="" className="absolute block inset-0 max-w-none size-full" src={imgTherapy01} /></div>
          <div className="absolute inset-[27.82%_50.03%_32.95%_15.2%]"><img alt="" className="absolute block inset-0 max-w-none size-full" src={imgTherapy02} /></div>
        </div>
        <div className="absolute inset-[12.67%_35.51%_78.7%_20.41%]"><img alt="" className="absolute block inset-0 max-w-none size-full" src={imgTherapy03} /></div>
        <div className="absolute inset-[47.67%_52.31%_41.86%_37.22%]"><img alt="" className="absolute block inset-0 max-w-none size-full" src={imgTherapy04} /></div>
        <div className="absolute inset-[26.63%_30.29%_70.99%_15.2%]"><img alt="" className="absolute block inset-0 max-w-none size-full" src={imgTherapy05} /></div>
        <div className="absolute inset-[47.67%_66.88%_41.86%_22.65%]"><img alt="" className="absolute block inset-0 max-w-none size-full" src={imgTherapy06} /></div>
        <div className="absolute inset-[33.1%_66.88%_56.43%_22.65%]"><img alt="" className="absolute block inset-0 max-w-none size-full" src={imgTherapy07} /></div>
        <div className="absolute inset-[33.1%_52.31%_56.43%_37.22%]"><img alt="" className="absolute block inset-0 max-w-none size-full" src={imgTherapy08} /></div>
        <div className="absolute inset-[32.13%_22.02%_58.18%_61.41%]"><img alt="" className="absolute block inset-0 max-w-none size-full" src={imgTherapy09} /></div>
        <div className="absolute inset-[39.42%_15.2%_12.67%_54.61%]"><img alt="" className="absolute block inset-0 max-w-none size-full" src={imgTherapy10} /></div>
        <div className="absolute inset-[28.93%_31.08%_71%_64.17%]"><img alt="" className="absolute block inset-0 max-w-none size-full" src={imgTherapy11} /></div>
      </div>
    </div>
  );
}

export function Filling() {
  return (
    <div className="h-[170px] overflow-clip relative w-[165px] shrink-0">
      <div className="absolute inset-[11.67%_16.38%]">
        <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgPumpBody} />
      </div>
    </div>
  );
}

function PatientCard({ noTherapy }: { noTherapy: boolean }) {
  const navigate = useNavigate();
  return (
    <div onClick={() => navigate('patient-detail')} className="bg-[#e6f4f9] content-stretch flex flex-col items-start relative rounded-[24px] shrink-0 w-[1040px] cursor-pointer">
      <div className="content-stretch flex gap-[24px] h-[112px] items-center pl-[16px] pr-[40px] py-[16px] relative shrink-0 w-[1040px]">
        <div className="content-stretch flex flex-1 gap-[16px] items-center min-w-px relative">
          <PatientIcon />
          <p className="font-['Roboto',sans-serif] font-extrabold leading-[56px] relative shrink-0 text-[#00769e] text-[48px] tracking-[0.1px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
            {noTherapy ? 'Patient' : 'Frida Kenton'}
          </p>
        </div>
        <ArrowForward />
      </div>
      <div className="bg-[rgba(255,255,255,0.5)] content-stretch flex flex-col gap-[25px] items-start p-[16px] relative rounded-bl-[24px] rounded-br-[24px] shrink-0 w-full">
        <div className="content-stretch flex items-start px-[24px] relative shrink-0 w-full">
          {noTherapy ? (
            <WarningNote text="Start the onboarding to enter patient data" />
          ) : (
            <div className="content-stretch flex flex-1 flex-col gap-[24px] items-start min-w-px relative">
              <div className="content-stretch flex font-['Roboto',sans-serif] font-normal gap-[40px] items-center relative shrink-0 text-[#00769e] text-[24px] tracking-[0.1px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
                <p className="leading-[32px] relative shrink-0">*01.04.1984</p>
                <p className="leading-[32px] relative shrink-0">Gender: Female</p>
                <p className="leading-[0] relative shrink-0">
                  <span className="leading-[32px]">{`Condition: `}</span>
                  <span className="leading-[32px]">RRMS</span>
                </p>
                <p className="leading-[0] relative shrink-0">
                  <span className="leading-[32px]">{`Patient N°: `}</span>
                  <span className="font-light leading-[32px]">930230393</span>
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ImplantCard({ refillDate, noTherapy }: { refillDate: string; noTherapy: boolean }) {
  const navigate = useNavigate();
  const noDate = refillDate === 'N/A';
  return (
    <div onClick={() => navigate('implant-detail')} className="bg-[#e6f4f9] content-stretch flex flex-col items-start relative rounded-[24px] shrink-0 w-[1040px] cursor-pointer">
      <div className="content-stretch flex gap-[24px] h-[112px] items-center pl-[16px] pr-[40px] py-[16px] relative shrink-0 w-[1040px]">
        <div className="content-stretch flex flex-1 gap-[16px] items-center min-w-px relative">
          <ImplantIcon />
          <p className="font-['Roboto',sans-serif] font-extrabold leading-[56px] relative shrink-0 text-[#00769e] text-[48px] tracking-[0.1px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
            Implant
          </p>
        </div>
        <div className="content-stretch flex gap-[16px] items-center relative shrink-0">
          <p className="font-['Roboto',sans-serif] font-normal leading-[32px] relative shrink-0 text-[#24ab5e] text-[24px] tracking-[0.1px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
            Connected
          </p>
          <div className="h-[32px] overflow-clip relative shrink-0 w-[33px]">
            <div className="-translate-y-1/2 absolute aspect-square left-[2.44%] overflow-clip right-0 top-1/2">
              <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgBluetooth} />
            </div>
          </div>
        </div>
        <ArrowForward />
      </div>
      <div className="bg-[rgba(255,255,255,0.5)] content-stretch flex flex-col gap-[25px] items-start p-[16px] relative rounded-bl-[24px] rounded-br-[24px] shrink-0 w-full">
        <div className="content-stretch flex items-center pr-[24px] relative shrink-0 w-full">
          <div className="content-stretch flex flex-1 gap-[24px] items-center min-w-px relative">
            <Filling />
            <div className="content-stretch flex flex-1 items-center justify-between min-w-px relative">
              {/* Fill level */}
              <div className="content-stretch flex flex-col items-start justify-center relative shrink-0 text-[#00769e] tracking-[0.1px] whitespace-nowrap">
                <p className="font-['Roboto',sans-serif] font-normal leading-[24px] relative shrink-0 text-[20px]" style={{ fontVariationSettings: "'wdth' 100" }}>Fill level</p>
                <p className="font-['Roboto',sans-serif] font-bold leading-[0] relative shrink-0 text-[0px]" style={{ fontVariationSettings: "'wdth' 100" }}>
                  <span className="leading-[48px] text-[32px]">{noTherapy ? '10/' : '40/'}</span>
                  <span className="font-normal leading-[48px] text-[32px]">40 ml</span>
                </p>
                <p className="font-['Roboto',sans-serif] font-normal leading-[32px] relative shrink-0 text-[24px]" style={{ fontVariationSettings: "'wdth' 100" }}>{noTherapy ? '25 %' : '100 %'}</p>
              </div>
              {/* Catheter */}
              <div className="content-stretch flex items-center relative shrink-0">
                <div className="overflow-clip relative shrink-0 size-[144px]">
                  <div className="-translate-y-1/2 absolute aspect-[294.87/441.66] left-[15%] right-[17.5%] top-1/2">
                    <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgCathInline} />
                  </div>
                </div>
                <div className="content-stretch flex flex-col items-start justify-center relative shrink-0 text-[#00769e] tracking-[0.1px] whitespace-nowrap">
                  <p className="font-['Roboto',sans-serif] font-normal leading-[24px] relative shrink-0 text-[20px]" style={{ fontVariationSettings: "'wdth' 100" }}>Catheter</p>
                  <p className="font-['Roboto',sans-serif] font-bold leading-[0] relative shrink-0 text-[0px]" style={{ fontVariationSettings: "'wdth' 100" }}>
                    <span className="leading-[48px] text-[32px]">{noTherapy ? 'N/A' : '0.3'}</span>
                    <span className="font-normal leading-[48px] text-[32px]">{` ml`}</span>
                  </p>
                  <p className="font-['Roboto',sans-serif] font-normal leading-[32px] relative shrink-0 text-[24px]" style={{ fontVariationSettings: "'wdth' 100" }}>{noTherapy ? 'N/A cm' : '53 cm'}</p>
                </div>
              </div>
              {/* Next refill */}
              <div className="flex flex-row items-center self-stretch">
                <div className="content-stretch flex flex-col h-full items-start relative shrink-0">
                  <div className="content-stretch flex items-center justify-center px-[24px] relative shrink-0">
                    <p className="font-['Roboto',sans-serif] font-normal leading-[24px] relative shrink-0 text-[#00769e] text-[20px] tracking-[0.1px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
                      Next refill before
                    </p>
                  </div>
                  <div className={`content-stretch flex items-center justify-center px-[24px] relative rounded-[24px] shrink-0 ${noDate ? '' : 'bg-[#fdf3d1]'}`}>
                    <p className={`font-['Roboto',sans-serif] font-bold leading-[48px] relative shrink-0 text-[32px] tracking-[0.1px] whitespace-nowrap ${noDate ? 'text-[#9ea8b2]' : 'text-[#b3850e]'}`} style={{ fontVariationSettings: "'wdth' 100" }}>
                      {refillDate}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

type TherapyStatus = 'not-active' | 'active' | 'none';

function TherapyHeader({ status }: { status: TherapyStatus }) {
  return (
    <div className="content-stretch flex gap-[24px] h-[112px] items-center pl-[16px] pr-[40px] py-[16px] relative shrink-0 w-[1040px]">
      <div className="content-stretch flex flex-1 gap-[16px] items-center min-w-px relative">
        <TherapyIcon />
        <p className="font-['Roboto',sans-serif] font-extrabold leading-[56px] relative shrink-0 text-[#00769e] text-[48px] tracking-[0.1px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
          Therapy
        </p>
      </div>
      {status === 'not-active' && (
        <div className="content-stretch flex items-center relative shrink-0">
          <p className="font-['Roboto',sans-serif] font-normal leading-[32px] relative shrink-0 text-[#b3850e] text-[24px] tracking-[0.1px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
            not active
          </p>
        </div>
      )}
      {status === 'active' && (
        <div className="content-stretch flex gap-[16px] items-center relative shrink-0">
          <p className="font-['Roboto',sans-serif] font-normal leading-[32px] relative shrink-0 text-[#24ab5e] text-[24px] tracking-[0.1px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
            active
          </p>
          <div className="overflow-clip relative shrink-0 size-[40px]">
            <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgActiveCheck} />
          </div>
        </div>
      )}
      <ArrowForward />
    </div>
  );
}

function ActionTile({ filled, label, children, onClick }: { filled?: boolean; label: string; children: ReactNode; onClick?: () => void }) {
  return (
    <div onClick={onClick} className={`content-stretch flex flex-col gap-[18px] h-[237px] items-center justify-center overflow-clip px-[20px] py-[26px] relative rounded-[16px] shrink-0 w-[229px] ${onClick ? 'cursor-pointer' : ''} ${filled ? 'bg-[#0094c5]' : 'border-2 border-[#0094c5] border-solid'}`}>
      <div className="overflow-clip relative shrink-0 size-[140px]">{children}</div>
      <p className={`font-['Roboto',sans-serif] font-bold leading-[32px] text-[28px] text-center tracking-[0.1px] ${filled ? 'text-white' : 'text-[#0094c5]'}`} style={{ fontVariationSettings: "'wdth' 100" }}>
        {label}
      </p>
    </div>
  );
}

function ActionsCard({ noTherapy }: { noTherapy: boolean }) {
  const navigate = useNavigate();
  const { setFlowMode } = useTherapy();
  const startRefill = () => { setFlowMode('refill'); navigate('refill-filling'); };
  const startSetup = () => { setFlowMode('setup'); navigate('add-medication'); };
  return (
    <div className="bg-[#e6f4f9] content-stretch flex flex-col items-start relative rounded-[24px] shrink-0 w-[1040px]">
      <div onClick={() => navigate('actions')} className="content-stretch flex gap-[24px] h-[112px] items-center pl-[16px] pr-[40px] py-[16px] relative shrink-0 w-[1040px] cursor-pointer">
        <div className="content-stretch flex flex-1 gap-[16px] items-center min-w-px relative">
          <div className="content-stretch flex items-center justify-center relative shrink-0 size-[64px]">
            <div className="h-[60px] relative shrink-0 w-[36px]">
              <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgActionsHand} />
            </div>
          </div>
          <p className="font-['Roboto',sans-serif] font-extrabold leading-[56px] relative shrink-0 text-[#00769e] text-[48px] tracking-[0.1px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
            Actions
          </p>
        </div>
        <ArrowForward />
      </div>
      <div className="bg-[rgba(255,255,255,0.5)] content-stretch flex gap-[25px] items-start overflow-clip p-[24px] relative rounded-bl-[24px] rounded-br-[24px] shrink-0 w-full">
        {/* First tile: Add Therapy (no therapy) or Onboarding (active) */}
        {noTherapy ? (
          <ActionTile filled label="Add Therapy" onClick={startSetup}>
            <AddTherapyIcon />
          </ActionTile>
        ) : (
          <ActionTile filled label="Onboarding" onClick={() => navigate('add-medication')}>
            <div className="absolute inset-[5.51%_0_4.49%_0]">
              <img alt="" src={imgActOnboarding} className="block max-w-none size-full" />
            </div>
          </ActionTile>
        )}
        {/* Refill */}
        <ActionTile filled label="Refill" onClick={startRefill}>
          <div className="absolute flex inset-[-8.75%_-3.93%_29.79%_23.01%] items-center justify-center" style={{ containerType: "size" }}>
            <div className="flex-none h-[hypot(36.3553cqw,-67.1953cqh)] rotate-[-153.3deg] skew-x-[-2.31deg] w-[hypot(-63.6447cqw,-32.8047cqh)]">
              <div className="relative size-full">
                <img alt="" src={imgActPrefillSyringe} className="absolute block inset-0 max-w-none size-full" />
              </div>
            </div>
          </div>
          <div className="absolute inset-[37.62%_52.29%_9.03%_0]">
            <img alt="" src={imgActPrefillPump} className="absolute block inset-0 max-w-none size-full" />
          </div>
        </ActionTile>
        {/* Access */}
        <ActionTile label="Access">
          <div className="absolute inset-[0_-1.25%_-1.25%_0.39%]">
            <img alt="" src={imgActAccess} className="absolute block inset-0 max-w-none size-full" />
          </div>
        </ActionTile>
        {/* Prime Bolus */}
        <ActionTile label="Prime Bolus">
          <div className="absolute inset-[52.65%_20%_10.53%_56.61%]"><div className="absolute inset-[-1.94%_-3.06%_-1.94%_-3.05%]"><img alt="" src={imgActPrime1} className="block max-w-none size-full" /></div></div>
          <div className="absolute inset-[10%_35.58%_53.18%_41.06%]"><div className="absolute inset-[-1.94%_-3.05%_-1.94%_-3.07%]"><img alt="" src={imgActPrime2} className="block max-w-none size-full" /></div></div>
          <div className="absolute inset-[42.84%_56.65%_20.35%_20%]"><div className="absolute inset-[-1.94%_-3.06%_-1.93%_-3.06%]"><img alt="" src={imgActPrime3} className="block max-w-none size-full" /></div></div>
        </ActionTile>
        {/* Clinician Bolus — active only */}
        {!noTherapy && (
          <ActionTile filled label="Clinician Bolus">
            <div className="absolute inset-[6.25%_33.75%_21.25%_11.25%]"><img alt="" src={imgActClinician1} className="absolute block inset-0 max-w-none size-full" /></div>
            <div className="absolute inset-[20%_11.25%_5%_66.25%]"><img alt="" src={imgActClinician2} className="absolute block inset-0 max-w-none size-full" /></div>
          </ActionTile>
        )}
      </div>
    </div>
  );
}

export function BottomNav() {
  return (
    <div className="absolute bg-[#e6f4f9] bottom-0 content-stretch flex h-[120px] items-center justify-center left-0 overflow-x-clip overflow-y-auto px-[16px] py-[8px] w-[1200px]">
      <div className="content-stretch flex flex-1 gap-[16px] items-start justify-center min-w-px relative">
        {/* Overview (active) */}
        <a className="content-stretch flex flex-col gap-[8px] items-center justify-center min-h-[80px] relative shrink-0 w-[100px] cursor-pointer">
          <div className="bg-[#b2ecff] h-[56px] relative rounded-[24px] shrink-0 w-[80px]">
            <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgNavOverviewPill} />
            <div className="absolute left-[11.5px] overflow-clip size-[56px] top-0">
              <div className="absolute inset-[12.5%_12.5%_13.25%_12.5%]">
                <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgNavOverviewIcon} />
              </div>
            </div>
          </div>
          <p className="font-['Roboto',sans-serif] font-bold leading-[24px] overflow-hidden relative shrink-0 text-[#00769e] text-[20px] text-center tracking-[0.1px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
            Overview
          </p>
        </a>
        {/* Help */}
        <a className="content-stretch flex flex-col gap-[8px] items-center justify-center min-h-[80px] relative shrink-0 w-[100px] cursor-pointer">
          <div className="h-[56px] relative shrink-0 w-[64px]">
            <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgNavInactivePill} />
            <div className="absolute left-[3.5px] overflow-clip size-[56px] top-0">
              <div className="absolute inset-[2.5%_0_0_2.5%]">
                <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgNavHelp} />
              </div>
            </div>
          </div>
          <p className="font-['Roboto',sans-serif] font-normal leading-[24px] overflow-hidden relative shrink-0 text-[#45483c] text-[20px] text-center tracking-[0.1px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
            Help
          </p>
        </a>
        {/* Settings */}
        <a className="content-stretch flex flex-col gap-[8px] items-center justify-center min-h-[80px] relative shrink-0 w-[100px] cursor-pointer">
          <div className="h-[56px] relative shrink-0 w-[64px]">
            <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgNavInactivePill} />
            <div className="absolute left-[3.5px] overflow-clip size-[56px] top-0">
              <div className="absolute inset-[7.5%_10.7%_7.5%_9.3%]">
                <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgNavSettings} />
              </div>
            </div>
          </div>
          <p className="font-['Roboto',sans-serif] font-normal leading-[24px] overflow-hidden relative shrink-0 text-[#45483c] text-[20px] text-center tracking-[0.1px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
            Settings
          </p>
        </a>
        {/* Disconnect */}
        <a className="content-stretch flex flex-col gap-[8px] items-center justify-center min-h-[80px] relative shrink-0 w-[100px] cursor-pointer">
          <div className="h-[56px] relative shrink-0 w-[64px]">
            <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgNavInactivePill} />
            <div className="absolute left-[3.5px] overflow-clip size-[56px] top-0">
              <div className="-translate-y-1/2 absolute left-[15.25%] right-[16.27%] top-1/2 aspect-[159.49/151.76]">
                <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgNavDisconnect} />
              </div>
            </div>
          </div>
          <p className="font-['Roboto',sans-serif] font-normal leading-[24px] overflow-hidden relative shrink-0 text-[#45483c] text-[20px] text-center tracking-[0.1px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
            Disconnect
          </p>
        </a>
      </div>
    </div>
  );
}

type Props = {
  therapyStatus: TherapyStatus;
  therapyBody: ReactNode;
  onTherapyClick?: () => void;
};

export function HomeShell({ therapyStatus, therapyBody, onTherapyClick }: Props) {
  const navigate = useNavigate();
  void navigate; // available for future header buttons
  const { refillDate } = useTherapy();
  const noTherapy = therapyStatus === 'none';
  return (
    <div className="bg-white relative w-[1200px] h-[1920px] overflow-hidden">
      <div className="absolute bg-[#3b2d7c] h-[35px] left-0 top-0 w-[1200px]" />
      <div className="absolute content-stretch flex flex-col gap-[32px] items-center left-0 pb-[80px] pt-[56px] px-[80px] top-[35px] w-[1200px]">
        <PatientCard noTherapy={noTherapy} />
        <ImplantCard refillDate={noTherapy ? 'N/A' : refillDate} noTherapy={noTherapy} />
        <div onClick={onTherapyClick} className={`bg-[#e6f4f9] content-stretch flex flex-col items-start relative rounded-[24px] shrink-0 w-[1040px] ${onTherapyClick ? 'cursor-pointer' : ''}`}>
          <TherapyHeader status={therapyStatus} />
          <div className="bg-[rgba(255,255,255,0.5)] content-stretch flex flex-col gap-[25px] items-start pb-[16px] pt-[8px] px-[24px] relative rounded-bl-[24px] rounded-br-[24px] shrink-0 w-full">
            {therapyBody}
          </div>
        </div>
        <ActionsCard noTherapy={noTherapy} />
      </div>
      <BottomNav />
    </div>
  );
}
