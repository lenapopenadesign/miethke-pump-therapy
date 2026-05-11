const imgBBraunMiethkeSignet = "/icons/08bf4412-569a-401d-a90f-bd23286d464d.svg";
const imgStatePrevious = "/icons/8361ab29-6450-4423-8e9a-5a45d453bdea.svg";
const imgEbene1 = "/icons/e0741e51-fbfe-4c1d-aed3-87fc611b9e9d.svg";
const imgVector2 = "/icons/15eb1c6e-d12f-4cc0-9096-1161ba43eaad.svg";
const imgVector3 = "/icons/cc56e168-df73-4ccd-92eb-fca4dd8e735b.svg";
const imgEllipse72 = "/icons/8100034c-d930-4d4a-a10f-ec33f8c9edd8.svg";
const imgIconsStepper = "/icons/24039d0e-45fb-4c2a-b196-7b5bd04b3a7b.svg";
const imgVector38 = "/icons/d05c3bb1-a686-4c5b-9f8d-065cc6c7a013.svg";
const imgVector37 = "/icons/75b39856-9f04-42af-bf2e-38b6b57780e0.svg";
const imgEllipse73 = "/icons/05d574cf-3f66-4593-82a0-9d48f0d5e75d.svg";
const imgVector39 = "/icons/7adb0463-6115-4cdb-ace7-5315ba52c432.svg";
const imgVector40 = "/icons/7190ae4a-2b51-4c66-9eb5-58834bf85829.svg";
const imgVector41 = "/icons/d15a96a9-6f60-48e7-a5b3-b224ca0efbd8.svg";
const imgVector4 = "/icons/4c64bedb-28eb-4bb9-851f-7a2b7700980c.svg";
const imgVector5 = "/icons/da58a0ef-b7cf-4737-96ce-e71e7a1146db.svg";
const imgVector6 = "/icons/423bfe12-2170-487b-891b-8da1e871a6fd.svg";
const imgVector7 = "/icons/b420f9e0-cd01-4812-9fb9-d946cd2efb25.svg";
const imgVector8 = "/icons/b4aeed7c-5caa-44b1-90c4-06d49dd4bef8.svg";
const imgVector9 = "/icons/15dbed1f-b0e4-404a-b0b4-15979bf49307.svg";
const imgVector10 = "/icons/cc5eeb6b-1b2c-4a85-a991-d7a65f6dc165.svg";
const imgVector11 = "/icons/a5237c6d-64f3-476b-82f2-91028f6046c9.svg";
const imgVector12 = "/icons/2815ba81-bd2b-4f78-a05c-e0179936f3f3.svg";
const imgVector13 = "/icons/8c66ca66-18a7-4d56-a4f2-0076d13a951f.svg";
const imgVector14 = "/icons/5de4f542-f549-4925-9769-59d3613d0ff9.svg";
const imgVector15 = "/icons/3a521010-eadc-4a7d-b4c2-c8359b0e8bce.svg";

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

function EditIcon({ className }: { className?: string }) {
  return (
    <div className={className || "overflow-clip relative size-[40px]"}>
      <div className="-translate-x-1/2 absolute aspect-[278.97/222.15] bottom-[17.5%] left-[calc(50%-0.05px)] overflow-clip top-[15%]">
        <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgEbene1} />
        <div className="absolute inset-[23.23%_0_0_0]">
          <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgVector2} />
        </div>
        <div className="absolute inset-[0_17.44%_58.55%_48.83%]">
          <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgVector3} />
        </div>
      </div>
    </div>
  );
}

type Interval = {
  top: number;
  barColor: string;
  label: string;
  time: string;
  dose: string;
};

const INTERVALS: Interval[] = [
  { top: 1106, barColor: '#8cc7e8', label: 'Night',        time: '00:00 – 07:59', dose: '200 µg/day' },
  { top: 1190, barColor: '#055273', label: 'Morning peak', time: '08:00 – 10:29', dose: '480 µg/day' },
  { top: 1274, barColor: '#0b7fa8', label: 'Daytime',      time: '10:30 – 16:29', dose: '360 µg/day' },
  { top: 1358, barColor: '#0b7fa8', label: 'Evening',      time: '16:30 – 20:59', dose: '450 µg/day' },
  { top: 1442, barColor: '#4da6d6', label: 'Wind-down',    time: '21:00 – 23:59', dose: '280 µg/day' },
];

export function IntervalsPopulated() {
  return (
    <div className="bg-white relative size-full">
      <div className="absolute bg-[#3b2d7c] h-[35px] left-0 top-0 w-[1200px]" />
      <p className="absolute font-['Inter:Bold',sans-serif] font-bold leading-[normal] left-[80px] not-italic text-[#063b66] text-[44px] top-[270px] w-[1040px]">
        Add intervals
      </p>
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[normal] left-[80px] not-italic text-[#667380] text-[22px] top-[340px] w-[1040px]">
        Tap a bar to edit, or + to add a new interval to this day group.
      </p>
      <p className="absolute font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[normal] left-[80px] not-italic text-[#063b66] text-[22px] top-[430px] whitespace-nowrap">
        Day pattern
      </p>
      <div className="absolute bg-[#f7fafc] border border-[#d9dbde] border-solid h-[70px] left-[80px] rounded-[12px] top-[466px] w-[1040px]" />
      <p className="absolute font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[normal] left-[195.34px] not-italic text-[#063b66] text-[22px] top-[487px] whitespace-nowrap">
        Same daily
      </p>
      <div className="absolute bg-[#0b7fa8] h-[62px] left-[430.67px] rounded-[10px] top-[470px] w-[338.667px]" />
      <p className="absolute font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[normal] left-[493px] not-italic text-[22px] text-white top-[487px] whitespace-nowrap">
        Weekday / weekend
      </p>
      <p className="absolute font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[normal] left-[906.66px] not-italic text-[#063b66] text-[22px] top-[487px] whitespace-nowrap">
        Per day
      </p>

      <div className="absolute bg-[#ddf1f6] border-2 border-[#0b7fa8] border-solid h-[60px] left-[80px] overflow-clip rounded-[12px] top-[570px] w-[500px]">
        <p className="absolute font-['Inter:Bold',sans-serif] font-bold leading-[normal] left-[136px] not-italic text-[#063b66] text-[22px] top-[14.5px] whitespace-pre">{`Weekdays  ·  Mon-Fri`}</p>
      </div>
      <div className="absolute bg-white border border-[#d9dbde] border-solid h-[60px] left-[600px] overflow-clip rounded-[12px] top-[570px] w-[500px]">
        <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[normal] left-[143.5px] not-italic text-[#667380] text-[22px] top-[15.5px] whitespace-pre">{`Weekend  ·  Sat-Sun`}</p>
      </div>

      <div className="absolute bg-[#d9dbde] h-px left-[80px] top-[670px] w-[1040px]" />
      <p className="absolute font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[normal] left-[80px] not-italic text-[#063b66] text-[22px] top-[700px] whitespace-nowrap">
        24-hour view
      </p>
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[normal] left-[360px] not-italic text-[#667380] text-[20px] top-[702px] whitespace-nowrap">
        Base dose · 360 µg/day
      </p>

      {/* Chart container */}
      <div className="absolute bg-[#f7fafc] border border-[#d9dbde] border-solid h-[260px] left-[80px] rounded-[16px] top-[740px] w-[1040px]" />
      {['00:00', '06:00', '12:00', '18:00', '24:00'].map((t, i) => (
        <p key={t} className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[normal] not-italic text-[#9ea8b2] text-[16px] top-[750px] whitespace-nowrap"
           style={{ left: [87.5, 332.5, 579, 824, 1067.5][i] }}>
          {t}
        </p>
      ))}
      <div className="absolute bg-[#9ea8b2] h-[2px] left-[110px] top-[910px] w-[980px]" />
      <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[normal] left-[110px] not-italic text-[#667380] text-[14px] top-[916px] whitespace-nowrap">
        Base · 360 µg/d
      </p>
      <div className="absolute bg-[#8cc7e8] h-[76px] left-[110px] rounded-[4px] top-[894px] w-[324.258px]" />
      <p className="absolute font-['Inter:Bold',sans-serif] font-bold leading-[normal] left-[258.63px] not-italic text-[14px] text-white top-[900px] whitespace-nowrap">200</p>
      <div className="absolute bg-[#055273] h-[182.4px] left-[436.67px] rounded-[4px] top-[787.6px] w-[99.675px]" />
      <p className="absolute font-['Inter:Bold',sans-serif] font-bold leading-[normal] left-[473px] not-italic text-[14px] text-white top-[793.6px] whitespace-nowrap">480</p>
      <div className="absolute bg-[#0b7fa8] h-[136.8px] left-[538.75px] rounded-[4px] top-[833.2px] w-[242.592px]" />
      <p className="absolute font-['Inter:Bold',sans-serif] font-bold leading-[normal] left-[646.55px] not-italic text-[14px] text-white top-[839.2px] whitespace-nowrap">360</p>
      <div className="absolute bg-[#0b7fa8] h-[171px] left-[783.75px] rounded-[4px] top-[799px] w-[181.342px]" />
      <p className="absolute font-['Inter:Bold',sans-serif] font-bold leading-[normal] left-[860.92px] not-italic text-[14px] text-white top-[805px] whitespace-nowrap">450</p>
      <div className="absolute bg-[#4da6d6] h-[106.4px] left-[967.5px] rounded-[4px] top-[863.6px] w-[120.092px]" />
      <p className="absolute font-['Inter:Bold',sans-serif] font-bold leading-[normal] left-[1014.55px] not-italic text-[14px] text-white top-[869.6px] whitespace-nowrap">280</p>

      <div className="absolute bg-[#ddf1f6] h-[60px] left-[80px] overflow-clip rounded-[12px] top-[1547px] w-[1040px]">
        <p className="absolute font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[normal] left-[371px] not-italic text-[#0b7fa8] text-[22px] top-[16.5px] whitespace-pre">{`+  Add interval to Weekdays`}</p>
      </div>

      <div className="absolute bg-[#d9dbde] h-px left-[80px] top-[1036px] w-[1040px]" />
      <p className="absolute font-['Inter:Bold',sans-serif] font-bold leading-[normal] left-[80px] not-italic text-[#063b66] text-[22px] top-[1056px] whitespace-nowrap">
        Intervals (5)
      </p>
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[normal] left-[220px] not-italic text-[#9ea8b2] text-[18px] top-[1061px] whitespace-nowrap">
        Tap to edit
      </p>

      {INTERVALS.map((iv) => (
        <div key={iv.label} className="absolute bg-white border border-[#d9dbde] border-solid h-[80px] left-[80px] overflow-clip rounded-[12px] w-[1040px]" style={{ top: iv.top }}>
          <div className="absolute h-[48px] left-[15px] rounded-[4px] top-[15px] w-[8px]" style={{ background: iv.barColor }} />
          <p className="absolute font-['Inter:Bold',sans-serif] font-bold leading-[normal] left-[39px] not-italic text-[#063b66] text-[22px] top-[11px] whitespace-nowrap">{iv.label}</p>
          <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[normal] left-[39px] not-italic text-[#667380] text-[18px] top-[43px] whitespace-nowrap">{iv.time}</p>
          <p className="absolute font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[normal] left-[799px] not-italic text-[#063b66] text-[22px] top-[24px] whitespace-nowrap">{iv.dose}</p>
          <EditIcon className="absolute left-[972px] overflow-clip size-[40px] top-[19px]" />
        </div>
      ))}

      {/* Stepper */}
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
                  Save on implant
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="absolute bg-[#e6f4f9] content-stretch flex h-[120px] items-center justify-between left-0 overflow-x-clip overflow-y-auto px-[40px] py-[8px] top-[35px] w-[1200px]">
        <div className="content-stretch flex gap-[40px] items-center relative shrink-0 w-[669px]">
          <div className="flex items-center justify-center relative shrink-0">
            <div className="flex-none rotate-180">
              <div className="overflow-clip relative size-[56px]">
                <div className="absolute inset-[20%_0.03%_17.61%_0]">
                  <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgVector4} />
                </div>
              </div>
            </div>
          </div>
          <div className="content-stretch flex gap-[16px] items-center relative shrink-0">
            <div className="overflow-clip relative shrink-0 size-[64px]">
              <div className="-translate-x-1/2 absolute aspect-[400/400] bottom-0 left-1/2 overflow-clip top-0">
                <div className="absolute contents inset-[18.92%_30.29%_32.95%_15.2%]">
                  <div className="absolute inset-[18.92%_30.29%_71%_15.2%]"><img alt="" className="absolute block inset-0 max-w-none size-full" src={imgVector5} /></div>
                  <div className="absolute inset-[27.82%_50.03%_32.95%_15.2%]"><img alt="" className="absolute block inset-0 max-w-none size-full" src={imgVector6} /></div>
                </div>
                <div className="absolute inset-[12.67%_35.51%_78.7%_20.41%]"><img alt="" className="absolute block inset-0 max-w-none size-full" src={imgVector7} /></div>
                <div className="absolute inset-[47.67%_52.31%_41.86%_37.22%]"><img alt="" className="absolute block inset-0 max-w-none size-full" src={imgVector8} /></div>
                <div className="absolute inset-[26.63%_30.29%_70.99%_15.2%]"><img alt="" className="absolute block inset-0 max-w-none size-full" src={imgVector9} /></div>
                <div className="absolute inset-[47.67%_66.88%_41.86%_22.65%]"><img alt="" className="absolute block inset-0 max-w-none size-full" src={imgVector10} /></div>
                <div className="absolute inset-[33.1%_66.88%_56.43%_22.65%]"><img alt="" className="absolute block inset-0 max-w-none size-full" src={imgVector11} /></div>
                <div className="absolute inset-[33.1%_52.31%_56.43%_37.22%]"><img alt="" className="absolute block inset-0 max-w-none size-full" src={imgVector12} /></div>
                <div className="absolute inset-[32.13%_22.02%_58.18%_61.41%]"><img alt="" className="absolute block inset-0 max-w-none size-full" src={imgVector13} /></div>
                <div className="absolute inset-[39.42%_15.2%_12.67%_54.61%]"><img alt="" className="absolute block inset-0 max-w-none size-full" src={imgVector14} /></div>
                <div className="absolute inset-[28.93%_31.08%_71%_64.17%]"><img alt="" className="absolute block inset-0 max-w-none size-full" src={imgVector15} /></div>
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

      {/* Continue */}
      <div className="absolute bg-[#0b7fa8] h-[90px] left-[80px] overflow-clip rounded-[45px] top-[1778px] w-[1040px]">
        <p className="absolute font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[normal] left-[458px] not-italic text-[28px] text-white top-[28px] whitespace-nowrap">
          Continue
        </p>
      </div>

    </div>
  );
}
