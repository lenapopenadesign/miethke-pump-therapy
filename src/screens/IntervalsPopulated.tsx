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

import { useState } from 'react';
import { useNavigate } from '../navigation';
import {
  useTherapy, fmtTime, doseColor, estimatedDailyTotal, withBaseFillers,
  DAY_KEYS, WEEKDAY_KEYS, WEEKEND_KEYS,
  type DayPattern, type DayKey,
} from '../therapy';
import { DailyTotalsCard } from '../components/DailyTotalsCard';

// Sub-tab chip shown below the day-pattern toggle. Drives which interval set is
// displayed/edited.
type ChipKey =
  | 'weekdays' | 'weekend'
  | 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

const PER_DAY_CHIPS: { key: ChipKey; label: string; full: string }[] = [
  { key: 'monday',    label: 'Mon', full: 'Monday' },
  { key: 'tuesday',   label: 'Tue', full: 'Tuesday' },
  { key: 'wednesday', label: 'Wed', full: 'Wednesday' },
  { key: 'thursday',  label: 'Thu', full: 'Thursday' },
  { key: 'friday',    label: 'Fri', full: 'Friday' },
  { key: 'saturday',  label: 'Sat', full: 'Saturday' },
  { key: 'sunday',    label: 'Sun', full: 'Sunday' },
];
const WEEKDAY_WEEKEND_CHIPS: { key: ChipKey; label: string; full: string }[] = [
  { key: 'weekdays', label: 'Weekdays  ·  Mon-Fri', full: 'Weekdays' },
  { key: 'weekend',  label: 'Weekend  ·  Sat-Sun',  full: 'Weekend' },
];

const DAY_PATTERNS: { key: DayPattern; label: string; x: number; w: number }[] = [
  { key: 'same',             label: 'Same daily',         x: 84,      w: 338.667 },
  { key: 'weekday-weekend',  label: 'Weekday / weekend',  x: 430.67,  w: 338.667 },
  { key: 'per-day',          label: 'Per day',            x: 777.33,  w: 338.667 },
];

// Chart layout in 1200x1920 frame. Chart container = top 460, height 200.
const CHART_LEFT = 92;
const CHART_WIDTH = 1016;
const CHART_BOTTOM_Y = 654;
const BAR_HEIGHT_SCALE = 0.32; // px per µg/day — fits 720µg ≈ 180px in 188px budget

function timeRangeLabel(startMin: number, endMin: number): string {
  const endDisplay = endMin >= 1440 ? '23:59' : fmtTime(Math.max(0, endMin - 1));
  return `${fmtTime(startMin)} – ${endDisplay}`;
}

export function IntervalsPopulated() {
  const navigate = useNavigate();
  const { intervalsByDay, baseDose, startAddingInterval, startEditingInterval, dayPattern, setDayPattern } = useTherapy();
  const [activeChip, setActiveChip] = useState<ChipKey>('weekdays');
  // Derive the effective chip in render (not state) so the chip is always valid
  // for the current day-pattern, even on the render right after the user toggles
  // the pattern. This avoids a "stale state" crash where activeChip lags one tick.
  const effectiveChip: ChipKey = (() => {
    if (dayPattern === 'per-day') {
      return PER_DAY_CHIPS.some(c => c.key === activeChip) ? activeChip : 'monday';
    }
    return WEEKDAY_WEEKEND_CHIPS.some(c => c.key === activeChip) ? activeChip : 'weekdays';
  })();
  // Scope = which day arrays this view edits/displays.
  const scope: DayKey[] = (() => {
    if (dayPattern === 'same') return DAY_KEYS;
    if (dayPattern === 'weekday-weekend') {
      return effectiveChip === 'weekend' ? WEEKEND_KEYS : WEEKDAY_KEYS;
    }
    // per-day → effectiveChip is one of DAY_KEYS
    return [effectiveChip as DayKey];
  })();
  // Representative day shown in the chart/list (first day in scope).
  const displayDay: DayKey = scope[0];
  const activeSet = intervalsByDay[displayDay];
  const addLabel = (() => {
    const allChips = [...WEEKDAY_WEEKEND_CHIPS, ...PER_DAY_CHIPS];
    return allChips.find(c => c.key === effectiveChip)?.full ?? 'Weekdays';
  })();
  const onAdd = () => { startAddingInterval('intervals-populated', scope); navigate('add-interval-when'); };
  const onEdit = (id: string) => { startEditingInterval(id, 'intervals-populated', scope); navigate('add-interval-when'); };
  // sort by startMin for chart and list order
  const ordered = [...activeSet].sort((a, b) => a.startMin - b.startMin);
  const chartSlots = withBaseFillers(activeSet, baseDose);
  const estDaily = estimatedDailyTotal(baseDose, activeSet);
  return (
    <div className="bg-white relative size-full">
      <div className="absolute bg-[#3b2d7c] h-[35px] left-0 top-0 w-[1200px]" />
      <div className="absolute left-[80px] top-[270px] flex items-center gap-[16px]">
        <p className="font-['Roboto',sans-serif] font-bold text-[#00769e] text-[36px] tracking-[0.1px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
          Intervals
        </p>
        <div className="bg-[#0094c5] h-[36px] px-[16px] rounded-[18px] flex items-center">
          <p className="font-['Roboto',sans-serif] font-bold text-[16px] text-white tracking-[0.1px]" style={{ fontVariationSettings: "'wdth' 100" }}>
            optional
          </p>
        </div>
      </div>
      <p className="absolute font-['Roboto',sans-serif] font-normal leading-[32px] left-[80px] text-[#45483c] text-[22px] tracking-[0.1px] top-[340px] w-[1040px]" style={{ fontVariationSettings: "'wdth' 100" }}>
        Tap a bar to edit, or + to add a new interval to this day group.
      </p>
      {/* "24-hour view" heading */}
      <p className="absolute font-['Roboto',sans-serif] font-bold text-[#00769e] text-[24px] left-[80px] top-[430px] tracking-[0.1px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
        24-hour view
      </p>

      {/* Chart container — top 460, height 200 */}
      <div className="absolute bg-[#f7fafc] border border-[#d9dbde] border-solid h-[200px] left-[80px] rounded-[16px] top-[460px] w-[1040px]" />
      {['00:00', '06:00', '12:00', '18:00', '24:00'].map((t, i) => (
        <p key={t} className="absolute font-['Roboto',sans-serif] font-normal text-[#9ea8b2] text-[16px] top-[474px] tracking-[0.1px] whitespace-nowrap"
           style={{ left: [95, 332.5, 579, 824, 1056][i], fontVariationSettings: "'wdth' 100" }}>
          {t}
        </p>
      ))}
      {/* Interval bars + base-dose fillers — bars sit on the chart floor at CHART_BOTTOM_Y */}
      {chartSlots.map((slot) => {
        const left = CHART_LEFT + (slot.startMin / 1440) * CHART_WIDTH;
        const width = ((slot.endMin - slot.startMin) / 1440) * CHART_WIDTH;
        const height = slot.dose * BAR_HEIGHT_SCALE;
        const top = CHART_BOTTOM_Y - height;
        return (
          <div
            key={slot.id}
            onClick={slot.isBase ? undefined : () => onEdit(slot.id)}
            className={`absolute rounded-[4px] flex items-start justify-center ${slot.isBase ? '' : 'cursor-pointer'}`}
            style={{
              left, top, width, height,
              background: doseColor(slot.dose, baseDose),
              opacity: slot.isBase ? 0.7 : 1,
            }}
            title={slot.isBase ? 'Base dose' : undefined}
          >
            {width > 80 && (
              <p className="font-['Roboto',sans-serif] font-bold text-[13px] text-white pt-[6px] tracking-[0.1px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
                {slot.isBase ? `Base dose ${(slot.dose / 24).toFixed(1)} µg/h` : `${(slot.dose / 24).toFixed(1)} µg/h`}
              </p>
            )}
          </div>
        );
      })}

      {/* Day pattern tabs — BELOW the chart */}
      <div className="absolute bg-[#f7fafc] border border-[#d9dbde] border-solid h-[70px] left-[80px] rounded-[12px] top-[700px] w-[1040px]" />
      {DAY_PATTERNS.map(p => {
        const active = dayPattern === p.key;
        return (
          <div
            key={p.key}
            onClick={() => setDayPattern(p.key)}
            className={`absolute h-[62px] rounded-[10px] top-[704px] cursor-pointer flex items-center justify-center select-none ${active ? 'bg-[#0094c5]' : ''}`}
            style={{ left: p.x, width: p.w }}
          >
            <p className={`font-['Roboto',sans-serif] font-bold text-[22px] tracking-[0.1px] whitespace-nowrap ${active ? 'text-white' : 'text-[#667380]'}`} style={{ fontVariationSettings: "'wdth' 100" }}>
              {p.label}
            </p>
          </div>
        );
      })}

      {/* Sub-tab chips — visible when weekday/weekend or per-day */}
      {dayPattern !== 'same' && (() => {
        const chipDefs = dayPattern === 'per-day' ? PER_DAY_CHIPS : WEEKDAY_WEEKEND_CHIPS;
        const gap = 8;
        const totalGap = (chipDefs.length - 1) * gap;
        const chipWidth = (1040 - totalGap) / chipDefs.length;
        const isPerDay = dayPattern === 'per-day';
        return chipDefs.map((chip, i) => {
          const active = effectiveChip === chip.key;
          const left = 80 + i * (chipWidth + gap);
          return (
            <div
              key={chip.key}
              onClick={() => setActiveChip(chip.key)}
              className={`absolute h-[60px] overflow-clip rounded-[12px] top-[790px] cursor-pointer flex items-center justify-center select-none ${active ? 'bg-[#ddf1f6] border-2 border-[#0094c5] border-solid' : 'bg-white border border-[#d9dbde] border-solid'}`}
              style={{ left, width: chipWidth }}
            >
              <p className={`font-['Roboto',sans-serif] tracking-[0.1px] whitespace-pre ${active ? 'font-bold text-[#00769e]' : 'font-normal text-[#667380]'} ${isPerDay ? 'text-[22px]' : 'text-[22px]'}`} style={{ fontVariationSettings: "'wdth' 100" }}>
                {chip.label}
              </p>
            </div>
          );
        });
      })()}

      {/* Interval list — starts after tabs (and sub-tabs if shown) */}
      {(() => {
        const rowsStart = dayPattern === 'same' ? 800 : 880;
        return (
          <>
            {ordered.map((iv, i) => (
              <div
                key={iv.id}
                onClick={() => onEdit(iv.id)}
                className="absolute bg-white border border-[#d9dbde] border-solid h-[72px] left-[80px] overflow-clip rounded-[12px] w-[1040px] cursor-pointer"
                style={{ top: rowsStart + i * 78 }}
              >
                <div className="absolute h-[44px] left-[15px] rounded-[4px] top-[14px] w-[8px]" style={{ background: doseColor(iv.dose, baseDose) }} />
                <p className="absolute font-['Roboto',sans-serif] font-bold left-[39px] text-[#00769e] text-[22px] top-[10px] tracking-[0.1px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>{iv.label}</p>
                <p className="absolute font-['Roboto',sans-serif] font-normal left-[39px] text-[#667380] text-[18px] top-[40px] tracking-[0.1px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>{timeRangeLabel(iv.startMin, iv.endMin)}</p>
                <p className="absolute font-['Roboto',sans-serif] font-bold left-[760px] text-[#00769e] text-[24px] top-[22px] tracking-[0.1px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>{(iv.dose / 24).toFixed(0)} µg/h</p>
                <EditIcon className="absolute left-[972px] overflow-clip size-[40px] top-[17px]" />
              </div>
            ))}

            {/* +Add interval — outlined CTA */}
            <div
              onClick={onAdd}
              className="absolute bg-white border-2 border-[#0094c5] h-[80px] left-[80px] overflow-clip rounded-[40px] w-[1040px] cursor-pointer flex items-center justify-center"
              style={{ top: rowsStart + ordered.length * 78 + 16 }}
            >
              <p className="font-['Roboto',sans-serif] font-bold text-[#0094c5] text-[24px] tracking-[0.1px] whitespace-pre" style={{ fontVariationSettings: "'wdth' 100" }}>{`+  Add interval to ${addLabel}`}</p>
            </div>

            {/* DailyTotalsCard — sits below +Add */}
            <DailyTotalsCard
              estDailyUg={estDaily}
              className="absolute left-[80px] w-[1040px]"
              style={{ top: rowsStart + ordered.length * 78 + 16 + 80 + 32 }}
            />
          </>
        );
      })()}

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
                <p className="flex-[1_0_0] font-['Roboto',sans-serif] font-normal leading-[24px] min-w-px relative text-[#00769e] text-[20px] tracking-[0.1px]" style={{ fontVariationSettings: "'wdth' 100" }}>
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
                <p className="flex-[1_0_0] font-['Roboto',sans-serif] font-normal leading-[24px] min-w-px relative text-[#00769e] text-[20px] tracking-[0.1px]" style={{ fontVariationSettings: "'wdth' 100" }}>
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
                <p className="flex-[1_0_0] font-['Roboto',sans-serif] font-normal leading-[24px] min-w-px relative text-[#a5a5a5] text-[20px] tracking-[0.1px]" style={{ fontVariationSettings: "'wdth' 100" }}>
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
                <p className="flex-[1_0_0] font-['Roboto',sans-serif] font-normal leading-[24px] min-w-px relative text-[#a5a5a5] text-[20px] tracking-[0.1px]" style={{ fontVariationSettings: "'wdth' 100" }}>
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
          <div onClick={() => navigate('base-dose')} className="flex items-center justify-center relative shrink-0 cursor-pointer">
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
            <p className="font-['Roboto',sans-serif] font-extrabold leading-[56px] relative shrink-0 text-[#00769e] text-[48px] tracking-[0.1px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
              Therapy
            </p>
          </div>
        </div>
        <div className="content-stretch flex gap-[100px] items-center relative shrink-0">
          <BBraunMiethkeSignet className="h-[62px] overflow-clip relative shrink-0 w-[53px]" />
        </div>
      </div>

      {/* Continue — pinned near the bottom */}
      <div
        onClick={() => navigate('review')}
        className="absolute bg-[#0094c5] h-[88px] left-[80px] overflow-clip rounded-[80px] top-[1780px] w-[1040px] cursor-pointer flex items-center justify-center"
      >
        <p className="font-['Roboto',sans-serif] font-bold text-[24px] text-white tracking-[0.1px]" style={{ fontVariationSettings: "'wdth' 100" }}>
          Continue to review
        </p>
      </div>

    </div>
  );
}
