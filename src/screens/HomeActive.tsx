import { useEffect, useState } from 'react';
import { HomeShell } from '../components/HomeShell';
import {
  useTherapy,
  doseColor,
  hourlyUg,
  morphineMgDay,
  bupivacaineMgDay,
  withBaseFillers,
  estimatedDailyTotal,
  type Interval,
} from '../therapy';

const imgPolygon = "/icons/84159d24-9892-4249-b82a-c5e588444106.svg";

// Chart geometry — matches the smaller chart shown in the new Figma design.
const HA_LEFT = 16;
const HA_WIDTH = 950;
const HA_CHART_H = 130;
const HA_BAR_BOTTOM = 122;
const HA_SCALE = 0.2; // px-per-µg, scaled so a ~480µg bar reaches ~96px
const NOW_MIN = 716;  // "11:56"

type RowData = {
  name: string;
  concentration: string;
  daily: string; // e.g. "373 µg/d"
  unit: string;
};

function dailyForActive(baseDose: number, intervals: Interval[], hasIntervals: boolean, concentrations: string[]) {
  const baclofenDay = hasIntervals
    ? estimatedDailyTotal(baseDose, intervals)
    : baseDose;
  const fmtBaclofen = baclofenDay >= 1000
    ? (baclofenDay / 1000).toFixed(2)
    : Math.round(baclofenDay).toString();
  const baclofenUnit = baclofenDay >= 1000 ? 'mg/d' : 'µg/d';
  return [
    { name: 'Baclofen',    concentration: concentrations[0] ?? '', daily: fmtBaclofen, unit: baclofenUnit },
    { name: 'Morphine',    concentration: concentrations[1] ?? '', daily: morphineMgDay(baclofenDay).toFixed(2), unit: 'mg/d' },
    { name: 'Bupivacaine', concentration: concentrations[2] ?? '', daily: bupivacaineMgDay(baclofenDay).toFixed(2), unit: 'mg/d' },
  ] as RowData[];
}

function ActiveSubstanceTable({ rows }: { rows: RowData[] }) {
  return (
    <div className="content-stretch flex flex-col items-start overflow-clip relative rounded-[12px] shrink-0 w-full">
      <div className="flex items-stretch w-full">
        <div className="bg-white flex-1 flex items-center px-[20px] py-[12px]">
          <p className="font-['Roboto',sans-serif] font-bold text-[#00769e] text-[20px] tracking-[1px]" style={{ fontVariationSettings: "'wdth' 100" }}>MEDICATION</p>
        </div>
        <div className="bg-white w-[220px] flex items-center px-[20px] py-[12px]">
          <p className="font-['Roboto',sans-serif] font-normal text-[#00769e] text-[20px] tracking-[1px]" style={{ fontVariationSettings: "'wdth' 100" }}>CONCENTRATION</p>
        </div>
        <div className="bg-white w-[180px] flex items-center px-[20px] py-[12px]">
          <p className="font-['Roboto',sans-serif] font-bold text-[#00769e] text-[20px] tracking-[1px]" style={{ fontVariationSettings: "'wdth' 100" }}>24H DOSE</p>
        </div>
      </div>
      {rows.map(row => (
        <div key={row.name} className="flex items-stretch w-full border-b border-white">
          <div className="bg-[#f3f9fc] flex-1 flex items-center px-[20px] py-[14px]">
            <p className="font-['Roboto',sans-serif] font-bold text-[#00769e] text-[24px] leading-[32px] tracking-[0.1px]" style={{ fontVariationSettings: "'wdth' 100" }}>{row.name}</p>
          </div>
          <div className="bg-[#e6f4f9] w-[220px] flex items-center justify-end px-[20px] py-[14px]">
            <p className="font-['Roboto',sans-serif] font-normal text-[#00769e] text-[22px]" style={{ fontVariationSettings: "'wdth' 100" }}>{row.concentration}</p>
          </div>
          <div className="bg-[#dceaf3] w-[180px] flex items-center justify-end gap-[6px] px-[20px] py-[14px]">
            <p className="font-['Roboto',sans-serif] font-bold text-[#00769e] text-[22px]" style={{ fontVariationSettings: "'wdth' 100" }}>{row.daily}</p>
            <p className="font-['Roboto',sans-serif] font-normal text-[#00769e] text-[22px]" style={{ fontVariationSettings: "'wdth' 100" }}>{row.unit}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function WeekTabs({ active, onChange }: { active: 'weekdays' | 'weekend'; onChange: (t: 'weekdays' | 'weekend') => void }) {
  return (
    <div className="bg-[#e6f4f9] flex flex-1 gap-[6px] items-start p-[4px] rounded-[12px] w-full">
      {(['weekdays', 'weekend'] as const).map(tab => {
        const isActive = tab === active;
        const label = tab === 'weekdays' ? 'Weekdays  ·  Mon–Fri' : 'Weekend  ·  Sat–Sun';
        return (
          <div
            key={tab}
            onClick={() => onChange(tab)}
            className={`flex flex-1 items-center justify-center py-[12px] rounded-[8px] cursor-pointer ${isActive ? 'bg-[#0094c5]' : ''}`}
          >
            <p className={`font-['Roboto',sans-serif] font-bold text-[20px] whitespace-pre ${isActive ? 'text-white' : 'text-[#5f7388]'}`} style={{ fontVariationSettings: "'wdth' 100" }}>
              {label}
            </p>
          </div>
        );
      })}
    </div>
  );
}

function IntervalsChart({ baseDose, intervals, onBarClick }: { baseDose: number; intervals: Interval[]; onBarClick: (id: string) => void }) {
  const slots = withBaseFillers(intervals, baseDose);
  const nowLeft = HA_LEFT + (NOW_MIN / 1440) * HA_WIDTH;
  return (
    <div className="relative w-full" style={{ height: HA_CHART_H }}>
      <div className="absolute inset-0 bg-white border border-[#d9dbde] rounded-[12px]" />
      {[
        { t: '00:00', x: 16 }, { t: '06:00', x: 237 }, { t: '12:00', x: 476 }, { t: '18:00', x: 714 }, { t: '24:00', x: 932 },
      ].map(({ t, x }) => (
        <p key={t} className="absolute font-['Inter',sans-serif] text-[#9ea8b2] text-[12px] whitespace-nowrap" style={{ left: x, top: 8 }}>{t}</p>
      ))}
      {slots.map(slot => {
        const left = HA_LEFT + (slot.startMin / 1440) * HA_WIDTH;
        const width = ((slot.endMin - slot.startMin) / 1440) * HA_WIDTH;
        const height = Math.min(HA_BAR_BOTTOM - 26, slot.dose * HA_SCALE);
        const top = HA_BAR_BOTTOM - height;
        return (
          <div
            key={slot.id}
            onClick={slot.isBase ? undefined : () => onBarClick(slot.id)}
            className={`absolute rounded-[3px] ${slot.isBase ? '' : 'cursor-pointer'}`}
            style={{ left, top, width, height, background: doseColor(slot.dose, baseDose), opacity: slot.isBase ? 0.55 : 1 }}
          />
        );
      })}
      <div className="absolute bg-[#063b66] w-[2px]" style={{ left: nowLeft, top: 23, height: 98 }} />
      <div className="absolute" style={{ left: nowLeft - 8, top: 0, width: 16, height: 14 }}>
        <div className="rotate-180 h-[14px] w-[16px] relative">
          <div className="absolute bottom-1/4 left-[6.7%] right-[6.7%] top-0">
            <img alt="" className="block max-w-none size-full" src={imgPolygon} />
          </div>
        </div>
      </div>
    </div>
  );
}

function CurrentReadout({ baseDose, intervals }: { baseDose: number; intervals: Interval[] }) {
  // Find the interval covering NOW_MIN, falling back to base dose.
  const slots = withBaseFillers(intervals, baseDose);
  const current = slots.find(s => NOW_MIN >= s.startMin && NOW_MIN < s.endMin);
  const baclofenUgH = hourlyUg(current ? current.dose : baseDose);
  const baclofenDay = current ? current.dose : baseDose;
  const morMgH = morphineMgDay(baclofenDay) / 24;
  const bupMgH = bupivacaineMgDay(baclofenDay) / 24;
  return (
    <div className="flex gap-[28px] items-start w-[766px]">
      <p className="font-['Roboto',sans-serif] font-bold text-[#00769e] text-[16px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>Current:</p>
      <p className="font-['Roboto',sans-serif] text-[#00769e] text-[16px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
        Baclofen <span className="font-bold">{baclofenUgH.toFixed(1)} µg/h</span>
      </p>
      <p className="font-['Roboto',sans-serif] text-[#00769e] text-[16px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
        Morphine <span className="font-bold">{morMgH.toFixed(3)}</span> mg/h
      </p>
      <p className="font-['Roboto',sans-serif] text-[#00769e] text-[16px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
        Bupivacaine <span className="font-bold">{bupMgH.toFixed(3)}</span> mg/h
      </p>
    </div>
  );
}

function ActiveBody() {
  const { baseDose, intervals, weekendIntervals, useBaseOnly, setPreviewIntervalId, medications } = useTherapy();
  const [activeTab, setActiveTab] = useState<'weekdays' | 'weekend'>('weekdays');
  useEffect(() => { setPreviewIntervalId(null); }, [activeTab, setPreviewIntervalId]);
  const source = activeTab === 'weekend' ? weekendIntervals : intervals;
  const sourceIntervals = useBaseOnly ? [] : source;
  const hasIntervals = sourceIntervals.length > 0;
  const concentrations = medications.map(m => `${m.concentration} ${m.unit}`);
  const rows = dailyForActive(baseDose, sourceIntervals, hasIntervals, concentrations);

  return (
    <div className="content-stretch flex flex-col gap-[16px] items-start relative shrink-0 w-[984px]">
      {hasIntervals && <WeekTabs active={activeTab} onChange={setActiveTab} />}
      <ActiveSubstanceTable rows={rows} />
      {hasIntervals && (
        <>
          <p className="font-['Roboto',sans-serif] font-bold leading-[24px] text-[#00769e] text-[20px] tracking-[0.1px]" style={{ fontVariationSettings: "'wdth' 100" }}>INTERVALS</p>
          <IntervalsChart baseDose={baseDose} intervals={sourceIntervals} onBarClick={setPreviewIntervalId} />
          <CurrentReadout baseDose={baseDose} intervals={sourceIntervals} />
        </>
      )}
    </div>
  );
}

export function HomeActive() {
  return (
    <HomeShell therapyStatus="active" therapyBody={<ActiveBody />} />
  );
}
