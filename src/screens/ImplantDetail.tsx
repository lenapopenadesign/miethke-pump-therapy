import type { ReactNode } from 'react';
import { DetailShell, ConnectedStatus } from '../components/DetailShell';
import { ImplantIcon, Filling } from '../components/HomeShell';

const imgCathInline = "/icons/f1df5fc9-3123-4343-bf12-b6bacbd170ab.svg";
// Action-tile icons (white line art, from the implant Figma)
const imgRefillSyringe = "/icons/act-prefill-syringe.svg";
const imgRefillPump = "/icons/act-prefill-pump.svg";
const imgPrime1 = "/icons/imp-prime-1.svg";
const imgPrime2 = "/icons/imp-prime-2.svg";
const imgPrime3 = "/icons/imp-prime-3.svg";
const imgAccess = "/icons/imp-access.svg";
const imgRevision = "/icons/imp-revision.svg";

const labelCls = "font-['Roboto',sans-serif] font-normal text-[#00769e] text-[20px] tracking-[0.1px]";

/** Label on the left, light-blue value box on the right. */
function StatPair({ label, value, unit }: { label: string; value: string; unit?: string }) {
  return (
    <div className="flex items-center gap-[20px] flex-1 min-w-px">
      <p className="w-[200px] shrink-0 font-['Roboto',sans-serif] font-bold text-[#00769e] text-[24px] tracking-[0.1px]" style={{ fontVariationSettings: "'wdth' 100" }}>{label}</p>
      <div className="flex-1 min-w-px bg-[#e6f4f9] rounded-[8px] h-[64px] px-[20px] flex items-center gap-[8px]">
        <span className="font-['Roboto',sans-serif] font-bold text-[#00769e] text-[26px] tracking-[0.1px]" style={{ fontVariationSettings: "'wdth' 100" }}>{value}</span>
        {unit && <span className="font-['Roboto',sans-serif] font-normal text-[#5f8aa0] text-[22px]">{unit}</span>}
      </div>
    </div>
  );
}

function Tile({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="bg-[#0094c5] rounded-[16px] flex-1 h-[237px] flex flex-col items-center justify-center gap-[18px] overflow-clip px-[20px] py-[26px] cursor-pointer">
      <div className="overflow-clip relative shrink-0 size-[140px]">{children}</div>
      <span className="font-['Roboto',sans-serif] font-bold text-white text-[28px] tracking-[0.1px]" style={{ fontVariationSettings: "'wdth' 100" }}>{label}</span>
    </div>
  );
}

export function ImplantDetail() {
  return (
    <DetailShell icon={<ImplantIcon size={56} />} title="Implant" headerRight={<ConnectedStatus />}>
      <div className="flex flex-col gap-[40px] flex-1">
        {/* Top stats */}
        <div className="flex items-center gap-[16px]">
          <Filling />
          <div className="flex flex-1 items-start justify-between">
            <div className="flex flex-col text-[#00769e] whitespace-nowrap">
              <p className={labelCls}>Fill level</p>
              <p className="font-['Roboto',sans-serif] tracking-[0.1px]" style={{ fontVariationSettings: "'wdth' 100" }}>
                <span className="font-bold text-[32px] leading-[48px]">40 / </span>
                <span className="font-normal text-[32px] leading-[48px]">40 ml</span>
              </p>
              <p className="font-['Roboto',sans-serif] font-normal text-[24px] leading-[32px]" style={{ fontVariationSettings: "'wdth' 100" }}>100 %</p>
            </div>
            <div className="flex flex-col text-[#00769e] whitespace-nowrap">
              <p className={labelCls}>Medication delivery</p>
              <p className="font-['Roboto',sans-serif] font-bold text-[32px] leading-[48px] tracking-[0.1px]" style={{ fontVariationSettings: "'wdth' 100" }}>active</p>
            </div>
            <div className="flex flex-col items-start whitespace-nowrap">
              <p className={`${labelCls} px-[24px]`}>Next refill before</p>
              <div className="bg-[#fdf3d1] rounded-[24px] px-[24px] flex items-center justify-center">
                <p className="font-['Roboto',sans-serif] font-bold text-[#b3850e] text-[32px] leading-[48px] tracking-[0.1px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>24.07.2025</p>
              </div>
            </div>
          </div>
        </div>

        {/* Pump details */}
        <div className="flex flex-col gap-[16px]">
          <div className="flex gap-[48px]">
            <StatPair label="Implantation" value="12.04.2018" />
            <StatPair label="Con-C Version" value="0.1.7" />
          </div>
          <div className="flex gap-[48px]">
            <StatPair label="Battery Life" value="4" unit="years" />
            <StatPair label="Con-P Version" value="0.1.2" />
          </div>
        </div>

        {/* Catheter */}
        <div className="flex items-center gap-[16px]">
          <div className="overflow-clip relative shrink-0 size-[120px]">
            <div className="-translate-y-1/2 absolute aspect-[294.87/441.66] left-[15%] right-[17.5%] top-1/2">
              <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgCathInline} />
            </div>
          </div>
          <div className="flex flex-col text-[#00769e] whitespace-nowrap">
            <p className={labelCls}>Catheter</p>
            <p className="font-['Roboto',sans-serif] font-bold text-[32px] leading-[48px] tracking-[0.1px]" style={{ fontVariationSettings: "'wdth' 100" }}>B.Braun</p>
          </div>
        </div>

        <div className="flex flex-col gap-[16px]">
          <div className="flex gap-[48px]">
            <StatPair label="Original length" value="43" unit="cm" />
            <StatPair label="Inside diameter" value="0.8" unit="mm" />
          </div>
          <div className="flex gap-[48px]">
            <StatPair label="Removed length" value="11" unit="cm" />
            <StatPair label="Outside diameter" value="0.9" unit="mm" />
          </div>
          <div className="flex gap-[48px]">
            <StatPair label="Implanted" value="32" unit="cm" />
            <StatPair label="Catheter volume" value="0.2" unit="ml" />
          </div>
        </div>

        {/* Action tiles — pinned to the bottom of the page */}
        <div className="flex gap-[24px] mt-auto pt-[24px]">
          <Tile label="Refill">
            <div className="absolute flex inset-[-8.75%_-3.93%_29.79%_23.01%] items-center justify-center" style={{ containerType: "size" }}>
              <div className="flex-none h-[hypot(36.3553cqw,-67.1953cqh)] rotate-[-153.3deg] skew-x-[-2.31deg] w-[hypot(-63.6447cqw,-32.8047cqh)]">
                <div className="relative size-full">
                  <img alt="" src={imgRefillSyringe} className="absolute block inset-0 max-w-none size-full" />
                </div>
              </div>
            </div>
            <div className="absolute inset-[37.62%_52.29%_9.03%_0]">
              <img alt="" src={imgRefillPump} className="absolute block inset-0 max-w-none size-full" />
            </div>
          </Tile>
          <Tile label="Prime Bolus">
            <div className="absolute inset-[52.65%_20%_10.53%_56.61%]"><div className="absolute inset-[-1.94%_-3.06%_-1.94%_-3.05%]"><img alt="" src={imgPrime1} className="block max-w-none size-full" /></div></div>
            <div className="absolute inset-[10%_35.58%_53.18%_41.06%]"><div className="absolute inset-[-1.94%_-3.05%_-1.94%_-3.07%]"><img alt="" src={imgPrime2} className="block max-w-none size-full" /></div></div>
            <div className="absolute inset-[42.84%_56.65%_20.35%_20%]"><div className="absolute inset-[-1.94%_-3.06%_-1.93%_-3.06%]"><img alt="" src={imgPrime3} className="block max-w-none size-full" /></div></div>
          </Tile>
          <Tile label="Access">
            <div className="absolute inset-[0_-1.25%_-1.25%_0.39%]">
              <img alt="" src={imgAccess} className="absolute block inset-0 max-w-none size-full" />
            </div>
          </Tile>
          <Tile label="Revision">
            <div className="absolute inset-[3.14%_7.5%_3.14%_7.53%]">
              <img alt="" src={imgRevision} className="absolute block inset-0 max-w-none size-full" />
            </div>
          </Tile>
        </div>
      </div>
    </DetailShell>
  );
}
