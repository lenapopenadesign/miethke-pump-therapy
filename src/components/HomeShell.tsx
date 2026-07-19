import type { ReactNode } from 'react';
import { useNavigate } from '../navigation';
import { useTherapy, CATHETER, RESERVOIR_ML } from '../therapy';
import { HelpBadge } from './WizardParts';

// Existing assets in /public/icons/
const imgImplantOuter = "/icons/34c72d33-da0a-4524-baf8-8740816e1c94.svg";
const imgImplantInner = "/icons/9abb359f-8740-4fa9-b48f-b8901ba56a97.svg";
const imgImplantCenter = "/icons/37e6818a-754b-4e9b-b353-0ad921147c10.svg";
const imgArrowFwd = "/icons/f04447fa-418c-41ba-99a3-878c9f1c122c.svg";
const imgBluetooth = "/icons/5a33dcf5-7db9-4c58-93be-23c8e66ada1b.svg";
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
const imgNavNotifications = "/icons/nav-notifications.svg";

// New assets downloaded for the updated home screens
const imgCathInline = "/icons/f1df5fc9-3123-4343-bf12-b6bacbd170ab.svg";
const imgActiveCheck = "/icons/b3500d59-7e08-4cd9-a69d-8fff2c2f40b7.gif";
const imgActionsHand = "/icons/5d577001-d49c-4bb9-9a48-3948e35d4261.svg";
// Action-card tile icons (from the redesigned home Figma)
const imgActPrefillSyringe = "/icons/act-prefill-syringe.svg";
const imgActPrefillPump = "/icons/act-prefill-pump.svg";
const imgActAccess = "/icons/act-access.svg";
const imgActPrime1 = "/icons/act-prime-1.svg";
const imgActPrime2 = "/icons/act-prime-2.svg";
const imgActPrime3 = "/icons/act-prime-3.svg";
// Blue (light-tile) variants — the white originals are for the dark tiles.
const imgActClinician1 = "/icons/act-clinician-1-blue.svg";
const imgActClinician2 = "/icons/act-clinician-2-blue.svg";
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

// Edit Therapy tile glyph: the (blue, visible) therapy icon with a small edit
// pencil badge — the white AddTherapyIcon is invisible on the unfilled tile.
const imgEditPencilTile = "/icons/edit-pencil.svg";
function EditTherapyIcon() {
  return (
    <div className="relative size-[140px]">
      <TherapyIcon size={140} />
      <div className="absolute right-[2px] bottom-[6px] size-[52px] rounded-full bg-white flex items-center justify-center">
        <img alt="" src={imgEditPencilTile} className="size-[40px] block" />
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

/** Small horizontal battery glyph (mostly charged) for the implant battery-life line. */
function BatteryIcon() {
  return (
    <svg width="46" height="26" viewBox="0 0 46 26" fill="none">
      <rect x="1.5" y="4.5" width="35" height="17" rx="4" stroke="#00769e" strokeWidth="2.5" />
      <rect x="5" y="8" width="24" height="10" rx="2" fill="#00769e" />
      <rect x="39" y="9" width="4.5" height="8" rx="2" fill="#00769e" />
    </svg>
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

// Pump silhouette (viewBox 197×230): ring wall + fill-port spout, with the
// reservoir interior (circle cx 99, cy 131.5, r 72.58) filled to `fill` (0..1).
const PUMP_RING = "M99 52C54.8913 52 19 87.667 19 131.5C19 175.333 54.8913 211 99 211C143.109 211 179 175.333 179 131.5C179 87.667 143.109 52 99 52ZM99 203.626C58.9749 203.626 26.4208 171.268 26.4208 131.5C26.4208 91.7322 58.9749 59.3745 99 59.3745C139.025 59.3745 171.579 91.725 171.579 131.5C171.579 171.275 139.018 203.626 99 203.626Z";
const PUMP_BODY = "M194.672 110.339C192.841 101.919 190.694 93.1202 186.421 86.1926C180.741 76.9846 174.263 67.3606 165.416 59.2857L158.414 50.3932L167.707 42.8919L160.052 33.0887C160.641 31.2313 160.87 28.8504 159.743 26.0823C158.292 22.5253 155.427 21.1914 153.531 20.3093C153.344 20.2232 153.165 20.1372 152.971 20.0511C142.408 14.9523 130.925 10.0256 118.846 5.40721C117.396 4.84784 116.089 4.29565 114.832 3.7578C110.509 1.91476 106.423 0.172113 99.5934 0H99.4569L97.0297 0.0645424H97.001C84.1682 0.516338 73.856 5.98092 64.5636 17.2686C59.6301 23.2639 54.79 29.6679 50.1079 35.8712C43.8962 44.0896 37.4762 52.5948 30.8408 60.1032C30.0868 60.9566 29.1819 61.8172 28.2268 62.7208C27.2718 63.6243 26.2879 64.5566 25.34 65.5893C19.0709 72.4451 8.50016 87.3401 5.8144 96.3186C-1.02208 119.167 -1.79047 137.941 3.30099 157.182C8.16983 175.555 18.4102 192.085 32.909 204.986C47.4078 217.888 65.0304 226.163 83.881 228.91C88.8575 229.634 93.791 230 98.6886 230C110.121 230 121.316 228.021 132.117 224.091C146.58 218.82 159.829 210.042 170.428 198.704C181.028 187.359 188.891 173.547 193.164 158.76C197.717 142.997 198.22 126.704 194.658 110.331L194.672 110.339ZM183.671 156.027C179.829 169.323 172.755 181.751 163.211 191.963C153.675 202.168 141.754 210.071 128.749 214.811C114.882 219.86 100.276 221.316 85.3316 219.135C50.8906 214.115 21.7782 188.198 12.8879 154.658C8.27754 137.274 9.02439 120.156 15.3151 99.1513C17.4335 92.066 27.164 78.2754 32.6648 72.2587C33.3758 71.4842 34.1872 70.7097 35.0561 69.8849C36.1261 68.8666 37.232 67.8196 38.2805 66.6435C45.1672 58.8482 51.7021 50.1924 58.0215 41.8234C62.639 35.7062 67.4217 29.3811 72.2187 23.5436C79.7805 14.3642 87.292 10.2981 97.3457 9.93951L99.4857 9.87497C104.34 10.0112 106.983 11.1443 110.961 12.8367C112.239 13.3818 113.69 14.0057 115.32 14.6224C127.14 19.1404 138.365 23.9524 148.677 28.9293C148.899 29.0369 149.129 29.1444 149.345 29.2448C149.783 29.4528 150.379 29.7253 150.623 29.8974C150.644 29.9405 150.652 29.9763 150.652 29.9978C150.623 30.1197 150.494 30.4496 150.02 31.2887L149.366 32.4361L148.756 31.6831L139.571 42.4186L158.163 66.0268L158.472 66.3064C166.558 73.6141 172.64 82.6643 178.005 91.356C181.466 96.9569 183.362 104.831 185.013 112.418C188.223 127.17 187.771 141.835 183.678 156.013L183.671 156.027Z";
const PUMP_PORT = "M99.0036 16C90.7273 16 84 22.5015 84 30.5C84 38.4985 90.7273 45 99.0036 45C107.28 45 114 38.4985 114 30.5C114 22.5015 107.273 16 99.0036 16ZM99.0036 37.7324C94.8727 37.7324 91.52 34.4852 91.52 30.5C91.52 26.5148 94.88 23.2676 99.0036 23.2676C103.127 23.2676 106.487 26.5148 106.487 30.5C106.487 34.4852 103.127 37.7324 99.0036 37.7324Z";

export function Filling({ fill = 1 }: { fill?: number }) {
  const cy = 131.5, r = 72.58, bottom = cy + r;
  const f = Math.max(0, Math.min(1, fill));
  const h = f * 2 * r;
  return (
    <div className="h-[170px] overflow-clip relative w-[165px] shrink-0">
      <div className="absolute inset-[11.67%_16.38%]">
        <svg preserveAspectRatio="none" viewBox="0 0 197 230" fill="none" className="absolute block inset-0 size-full">
          <defs><clipPath id="implantResClip"><circle cx="99" cy={cy} r={r} /></clipPath></defs>
          <rect x="19" width="160" y={bottom - h} height={h} fill="#0094C5" clipPath="url(#implantResClip)" />
          <path d={PUMP_RING} fill="#0094C5" />
          <path d={PUMP_BODY} fill="#0094C5" />
          <path d={PUMP_PORT} fill="#0094C5" />
        </svg>
      </div>
    </div>
  );
}

function PatientCard() {
  const navigate = useNavigate();
  return (
    <div onClick={() => navigate('patient-detail')} className="bg-[#e6f4f9] content-stretch flex flex-col items-start relative rounded-[24px] shrink-0 w-[1040px] cursor-pointer">
      <div className="content-stretch flex gap-[24px] h-[112px] items-center pl-[16px] pr-[40px] py-[16px] relative shrink-0 w-[1040px]">
        <div className="content-stretch flex flex-1 gap-[16px] items-center min-w-px relative">
          <PatientIcon />
          <p className="font-['Roboto',sans-serif] font-extrabold leading-[56px] relative shrink-0 text-[#00769e] text-[48px] tracking-[0.1px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
            Frida Kenton
          </p>
        </div>
        <ArrowForward />
      </div>
      <div className="bg-[rgba(255,255,255,0.5)] content-stretch flex flex-col gap-[25px] items-start p-[16px] relative rounded-bl-[24px] rounded-br-[24px] shrink-0 w-full">
        <div className="content-stretch flex items-start px-[24px] relative shrink-0 w-full">
          <div className="content-stretch flex flex-1 flex-col gap-[24px] items-start min-w-px relative">
            <div className="content-stretch flex font-['Roboto',sans-serif] font-normal gap-[36px] items-center relative shrink-0 text-[#00769e] text-[28px] tracking-[0.1px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
              <p className="leading-[36px] relative shrink-0">*01.04.1984</p>
              <p className="leading-[36px] relative shrink-0">Gender: Female</p>
              <p className="leading-[0] relative shrink-0">
                <span className="leading-[36px]">{`Condition: `}</span>
                <span className="leading-[36px]">RRMS</span>
              </p>
              <p className="leading-[0] relative shrink-0">
                <span className="leading-[36px]">{`Patient N°: `}</span>
                <span className="font-light leading-[36px]">930230393</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ImplantCard({ refillDate, fillFraction }: { refillDate: string; fillFraction: number }) {
  const navigate = useNavigate();
  const noDate = refillDate === 'N/A';
  const fillMl = Math.round(fillFraction * RESERVOIR_ML);
  const fillPct = Math.round(fillFraction * 100);
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
            <Filling fill={fillFraction} />
            <div className="content-stretch flex flex-1 items-center justify-between min-w-px relative">
              {/* Fill level — physical reservoir, independent of therapy state */}
              <div className="content-stretch flex flex-col items-start justify-center relative shrink-0 text-[#00769e] tracking-[0.1px] whitespace-nowrap">
                <p className="font-['Roboto',sans-serif] font-normal leading-[24px] relative shrink-0 text-[20px]" style={{ fontVariationSettings: "'wdth' 100" }}>Fill level</p>
                <p className="font-['Roboto',sans-serif] font-bold leading-[0] relative shrink-0 text-[0px]" style={{ fontVariationSettings: "'wdth' 100" }}>
                  <span className="leading-[52px] text-[36px]">{fillMl}/</span>
                  <span className="font-normal leading-[52px] text-[36px]">{RESERVOIR_ML} ml</span>
                </p>
                <p className="font-['Roboto',sans-serif] font-normal leading-[36px] relative shrink-0 text-[32px]" style={{ fontVariationSettings: "'wdth' 100" }}>{fillPct} %</p>
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
                    <span className="leading-[52px] text-[36px]">{CATHETER.volumeMl}</span>
                    <span className="font-normal leading-[52px] text-[36px]">{` ml`}</span>
                  </p>
                  <p className="font-['Roboto',sans-serif] font-normal leading-[36px] relative shrink-0 text-[32px]" style={{ fontVariationSettings: "'wdth' 100" }}>{CATHETER.implantedLengthCm} cm</p>
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
                    <p className={`font-['Roboto',sans-serif] font-bold leading-[52px] relative shrink-0 text-[36px] tracking-[0.1px] whitespace-nowrap ${noDate ? 'text-[#9ea8b2]' : 'text-[#b3850e]'}`} style={{ fontVariationSettings: "'wdth' 100" }}>
                      {refillDate}
                    </p>
                  </div>
                  {/* Battery life */}
                  <div className="flex items-center gap-[12px] px-[24px] pt-[12px]">
                    <BatteryIcon />
                    <p className="font-['Roboto',sans-serif] font-normal leading-[36px] text-[#00769e] text-[28px] tracking-[0.1px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>4 years</p>
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

function TherapyHeader({ status, onHelp }: { status: TherapyStatus; onHelp?: () => void }) {
  return (
    <div className="content-stretch flex gap-[24px] h-[112px] items-center pl-[16px] pr-[40px] py-[16px] relative shrink-0 w-[1040px]">
      <div className="content-stretch flex flex-1 gap-[16px] items-center min-w-px relative">
        <TherapyIcon />
        <p className="font-['Roboto',sans-serif] font-extrabold leading-[56px] relative shrink-0 text-[#00769e] text-[48px] tracking-[0.1px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
          Therapy
        </p>
        {onHelp && <HelpBadge onClick={onHelp} />}
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
    <div onClick={onClick} className={`content-stretch flex flex-col gap-[18px] h-[237px] items-center justify-center overflow-clip px-[20px] py-[26px] relative rounded-[16px] flex-1 min-w-0 ${onClick ? 'cursor-pointer' : ''} ${filled ? 'bg-[#0094c5]' : 'border-2 border-[#0094c5] border-solid'}`}>
      <div className="overflow-clip relative shrink-0 size-[140px]">{children}</div>
      <p className={`font-['Roboto',sans-serif] font-bold leading-[32px] text-[28px] text-center tracking-[0.1px] ${filled ? 'text-white' : 'text-[#0094c5]'}`} style={{ fontVariationSettings: "'wdth' 100" }}>
        {label}
      </p>
    </div>
  );
}

function ActionsCard({ noTherapy }: { noTherapy: boolean }) {
  const navigate = useNavigate();
  const { setFlowMode, beginEditTherapy } = useTherapy();
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
        {/* First tile: Add Therapy (no-therapy only). */}
        {noTherapy && (
          <ActionTile filled label="Add Therapy" onClick={startSetup}>
            <AddTherapyIcon />
          </ActionTile>
        )}
        {/* Refill Pump */}
        <ActionTile filled label="Refill Pump" onClick={startRefill}>
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
        {/* No-therapy keeps the Access / Prime tiles; active therapy shows
            Clinician Bolus + Edit Therapy (the redesigned Overview). */}
        {noTherapy && (
          <ActionTile label="Access">
            <div className="absolute inset-[0_-1.25%_-1.25%_0.39%]">
              <img alt="" src={imgActAccess} className="absolute block inset-0 max-w-none size-full" />
            </div>
          </ActionTile>
        )}
        {noTherapy && (
          <ActionTile label="Prime Bolus">
            <div className="absolute inset-[52.65%_20%_10.53%_56.61%]"><div className="absolute inset-[-1.94%_-3.06%_-1.94%_-3.05%]"><img alt="" src={imgActPrime1} className="block max-w-none size-full" /></div></div>
            <div className="absolute inset-[10%_35.58%_53.18%_41.06%]"><div className="absolute inset-[-1.94%_-3.05%_-1.94%_-3.07%]"><img alt="" src={imgActPrime2} className="block max-w-none size-full" /></div></div>
            <div className="absolute inset-[42.84%_56.65%_20.35%_20%]"><div className="absolute inset-[-1.94%_-3.06%_-1.93%_-3.06%]"><img alt="" src={imgActPrime3} className="block max-w-none size-full" /></div></div>
          </ActionTile>
        )}
        {/* Clinician Bolus — active only */}
        {!noTherapy && (
          <ActionTile label="Clinician Bolus">
            <div className="absolute inset-[6.25%_33.75%_21.25%_11.25%]"><img alt="" src={imgActClinician1} className="absolute block inset-0 max-w-none size-full" /></div>
            <div className="absolute inset-[20%_11.25%_5%_66.25%]"><img alt="" src={imgActClinician2} className="absolute block inset-0 max-w-none size-full" /></div>
          </ActionTile>
        )}
        {/* Edit Therapy — active only; enters the redesigned Edit Therapy flow */}
        {!noTherapy && (
          <ActionTile label="Edit Therapy" onClick={() => { setFlowMode('setup'); beginEditTherapy('home-active'); navigate('base-dose'); }}>
            <EditTherapyIcon />
          </ActionTile>
        )}
      </div>
    </div>
  );
}

/** Which tab of the bottom navigation is highlighted. */
export type NavTab = 'overview' | 'notifications' | 'help';

export function BottomNav({ active = 'overview' }: { active?: NavTab } = {}) {
  const navigate = useNavigate();
  // Active tabs get the filled pill + bold dark-blue label; inactive ones the
  // plain pill and grey label.
  const label = (tab: NavTab) =>
    `font-['Roboto',sans-serif] leading-[24px] overflow-hidden relative shrink-0 text-[20px] text-center tracking-[0.1px] whitespace-nowrap ${
      active === tab ? 'font-bold text-[#00769e]' : 'font-normal text-[#45483c]'
    }`;
  return (
    <div className="absolute bg-[#e6f4f9] bottom-0 content-stretch flex h-[120px] items-center justify-center left-0 overflow-x-clip overflow-y-auto px-[16px] py-[8px] w-[1200px]">
      <div className="content-stretch flex flex-1 gap-[16px] items-start justify-center min-w-px relative">
        {/* Overview */}
        <a onClick={() => navigate('home-active')} className="content-stretch flex flex-col gap-[8px] items-center justify-center min-h-[80px] relative shrink-0 w-[100px] cursor-pointer">
          <div className={`h-[56px] relative rounded-[24px] shrink-0 w-[80px] ${active === 'overview' ? 'bg-[#b2ecff]' : ''}`}>
            <img alt="" className="absolute block inset-0 max-w-none size-full" src={active === 'overview' ? imgNavOverviewPill : imgNavInactivePill} />
            <div className="absolute left-[11.5px] overflow-clip size-[56px] top-0">
              <div className="absolute inset-[12.5%_12.5%_13.25%_12.5%]">
                <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgNavOverviewIcon} />
              </div>
            </div>
          </div>
          <p className={label('overview')}>Overview</p>
        </a>
        {/* Notifications */}
        <a onClick={() => navigate('notifications')} className="content-stretch flex flex-col gap-[8px] items-center justify-center min-h-[80px] relative shrink-0 w-[133px] cursor-pointer">
          <div className={`h-[56px] relative rounded-[24px] shrink-0 w-[64px] ${active === 'notifications' ? 'bg-[#b2ecff]' : ''}`}>
            <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgNavInactivePill} />
            <div className="absolute left-[3.5px] overflow-clip size-[56px] top-0">
              <div className="absolute inset-[5%_12.5%]">
                <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgNavNotifications} />
              </div>
            </div>
          </div>
          <p className={label('notifications')}>Notifications</p>
        </a>
        {/* Help */}
        <a onClick={() => navigate('help')} className="content-stretch flex flex-col gap-[8px] items-center justify-center min-h-[80px] relative shrink-0 w-[100px] cursor-pointer">
          <div className={`h-[56px] relative rounded-[24px] shrink-0 w-[64px] ${active === 'help' ? 'bg-[#b2ecff]' : ''}`}>
            <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgNavInactivePill} />
            <div className="absolute left-[3.5px] overflow-clip size-[56px] top-0">
              <div className="absolute inset-[2.5%_0_0_2.5%]">
                <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgNavHelp} />
              </div>
            </div>
          </div>
          <p className={label('help')}>Help</p>
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
  // When set, a "?" help badge sits next to the Therapy card title (opens Help).
  onTherapyHelp?: () => void;
};

export function HomeShell({ therapyStatus, therapyBody, onTherapyClick, onTherapyHelp }: Props) {
  const { refillDate, fillFraction } = useTherapy();
  const noTherapy = therapyStatus === 'none';
  return (
    <div className="bg-white relative w-[1200px] h-[1920px] overflow-hidden">
      <div className="absolute bg-[#3b2d7c] h-[35px] left-0 top-0 w-[1200px]" />
      <div className="absolute content-stretch flex flex-col gap-[32px] items-center left-0 pb-[80px] pt-[56px] px-[80px] top-[35px] w-[1200px]">
        <PatientCard />
        <ImplantCard refillDate={noTherapy ? 'N/A' : refillDate} fillFraction={fillFraction} />
        <div onClick={onTherapyClick} className={`bg-[#e6f4f9] content-stretch flex flex-col items-start relative rounded-[24px] shrink-0 w-[1040px] ${onTherapyClick ? 'cursor-pointer' : ''}`}>
          <TherapyHeader status={therapyStatus} onHelp={onTherapyHelp} />
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
