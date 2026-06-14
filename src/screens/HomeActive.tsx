import { useEffect, useState } from 'react';
import { useNavigate } from '../navigation';
import { HomeShell } from '../components/HomeShell';
import { MedSummary } from '../components/MedSummary';
import {
  useTherapy,
  doseColor,
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

function WeekTabs({ active, onChange }: { active: 'weekdays' | 'weekend'; onChange: (t: 'weekdays' | 'weekend') => void }) {
  return (
    <div className="bg-[#e6f4f9] flex flex-1 gap-[6px] items-start p-[4px] rounded-[12px] w-full">
      {(['weekdays', 'weekend'] as const).map(tab => {
        const isActive = tab === active;
        const label = tab === 'weekdays' ? 'Mon–Fri' : 'Sat–Sun';
        return (
          <div
            key={tab}
            onClick={() => onChange(tab)}
            className={`flex flex-1 items-center justify-center py-[16px] rounded-[8px] cursor-pointer ${isActive ? 'bg-[#0094c5]' : ''}`}
          >
            <p className={`font-['Roboto',sans-serif] font-bold text-[28px] whitespace-pre ${isActive ? 'text-white' : 'text-[#5f7388]'}`} style={{ fontVariationSettings: "'wdth' 100" }}>
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
            onClick={slot.isBase ? undefined : (e) => { e.stopPropagation(); onBarClick(slot.id); }}
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

function ActiveBody() {
  const { baseDose, intervals, weekendIntervals, useBaseOnly, setPreviewIntervalId, medications } = useTherapy();
  const [activeTab, setActiveTab] = useState<'weekdays' | 'weekend'>('weekdays');
  useEffect(() => { setPreviewIntervalId(null); }, [activeTab, setPreviewIntervalId]);
  const source = activeTab === 'weekend' ? weekendIntervals : intervals;
  const sourceIntervals = useBaseOnly ? [] : source;
  const hasIntervals = sourceIntervals.length > 0;
  const estDaily = hasIntervals ? estimatedDailyTotal(baseDose, sourceIntervals) : baseDose;
  // Dose of the interval running right now (NOW_MIN), falling back to base dose.
  const cur = withBaseFillers(sourceIntervals, baseDose).find(s => NOW_MIN >= s.startMin && NOW_MIN < s.endMin);
  const currentPrimaryUg = cur ? cur.dose : baseDose;

  return (
    <div className="content-stretch flex flex-col gap-[16px] items-start relative shrink-0 w-[984px]">
      {hasIntervals && <WeekTabs active={activeTab} onChange={setActiveTab} />}
      {hasIntervals && (
        <IntervalsChart baseDose={baseDose} intervals={sourceIntervals} onBarClick={setPreviewIntervalId} />
      )}
      <MedSummary
        estDaily={estDaily}
        medications={medications}
        currentUg={hasIntervals ? currentPrimaryUg : undefined}
      />
    </div>
  );
}

export function HomeActive() {
  const navigate = useNavigate();
  return (
    <HomeShell therapyStatus="active" therapyBody={<ActiveBody />} onTherapyClick={() => navigate('therapy-detail')} />
  );
}
