import { useNavigate } from '../navigation';
import { HomeShell } from '../components/HomeShell';
import { MedSummary } from '../components/MedSummary';
import { useTherapy, withBaseFillers, estimatedDailyTotal } from '../therapy';
import { ProfileChart } from '../components/TherapyBreakdown';

const NOW_MIN = 716; // "11:56"

function ActiveBody() {
  const { baseDose, bolusCount, maxBoluses, intervals, useBaseOnly, medications } = useTherapy();
  const sourceIntervals = useBaseOnly ? [] : intervals;
  const hasIntervals = sourceIntervals.length > 0;
  const estDaily = hasIntervals ? estimatedDailyTotal(baseDose, sourceIntervals) : baseDose;
  // Total dose delivered during the window running right now (NOW_MIN). cur.dose
  // is the window's daily-equivalent rate; scale it by the window's length.
  const cur = withBaseFillers(sourceIntervals, baseDose).find(s => NOW_MIN >= s.startMin && NOW_MIN < s.endMin);
  const currentWindowUg = cur ? cur.dose * (cur.endMin - cur.startMin) / 1440 : baseDose;

  return (
    <div className="content-stretch flex flex-col gap-[16px] items-start relative shrink-0 w-[984px]">
      {hasIntervals && (
        <ProfileChart baseDose={baseDose} bolusCount={bolusCount} maxBoluses={maxBoluses} windows={sourceIntervals} showNow />
      )}
      <MedSummary
        estDaily={estDaily}
        medications={medications}
        currentUg={hasIntervals ? currentWindowUg : undefined}
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
