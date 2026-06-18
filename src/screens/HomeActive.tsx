import { useNavigate } from '../navigation';
import { HomeShell } from '../components/HomeShell';
import { MedSummary } from '../components/MedSummary';
import {
  useTherapy,
  withBaseFillers,
  estimatedDailyTotal,
  type Interval,
} from '../therapy';
import { BolusBars } from '../components/TherapyHeaderChart';

const imgPolygon = "/icons/84159d24-9892-4249-b82a-c5e588444106.svg";

// Chart geometry — matches the smaller chart shown in the new Figma design.
const HA_LEFT = 16;
const HA_WIDTH = 950;
const HA_CHART_H = 130;
const HA_BAR_BOTTOM = 122;
const NOW_MIN = 716;  // "11:56"

// 24h dose chart as bolus "strokes" — same style as the Add-Therapy diagrams.
function IntervalsChart({ baseDose, bolusCount, windows }: { baseDose: number; bolusCount: number; windows: Interval[] }) {
  const nowLeft = HA_LEFT + (NOW_MIN / 1440) * HA_WIDTH;
  return (
    <div className="relative w-full" style={{ height: HA_CHART_H }}>
      <div className="absolute inset-0 bg-white border border-[#d9dbde] rounded-[12px]" />
      {[
        { t: '00:00', x: 16 }, { t: '06:00', x: 237 }, { t: '12:00', x: 476 }, { t: '18:00', x: 714 }, { t: '24:00', x: 932 },
      ].map(({ t, x }) => (
        <p key={t} className="absolute font-['Inter',sans-serif] text-[#9ea8b2] text-[12px] whitespace-nowrap" style={{ left: x, top: 8 }}>{t}</p>
      ))}
      <div className="absolute" style={{ left: HA_LEFT, width: HA_WIDTH, bottom: HA_CHART_H - HA_BAR_BOTTOM, height: HA_BAR_BOTTOM - 26 }}>
        <BolusBars baseDose={baseDose} bolusCount={bolusCount} windows={windows} nominalH={56} maxH={HA_BAR_BOTTOM - 26} minH={14} barWidth={10} />
      </div>
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
  const { baseDose, bolusCount, intervals, useBaseOnly, medications } = useTherapy();
  const sourceIntervals = useBaseOnly ? [] : intervals;
  const hasIntervals = sourceIntervals.length > 0;
  const estDaily = hasIntervals ? estimatedDailyTotal(baseDose, sourceIntervals) : baseDose;
  // Dose of the interval running right now (NOW_MIN), falling back to base dose.
  const cur = withBaseFillers(sourceIntervals, baseDose).find(s => NOW_MIN >= s.startMin && NOW_MIN < s.endMin);
  const currentPrimaryUg = cur ? cur.dose : baseDose;

  return (
    <div className="content-stretch flex flex-col gap-[16px] items-start relative shrink-0 w-[984px]">
      {hasIntervals && (
        <IntervalsChart baseDose={baseDose} bolusCount={bolusCount} windows={sourceIntervals} />
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
