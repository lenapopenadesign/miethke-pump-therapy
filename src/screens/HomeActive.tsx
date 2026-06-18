import { useNavigate } from '../navigation';
import { HomeShell } from '../components/HomeShell';
import { MedSummary } from '../components/MedSummary';
import { useTherapy, withBaseFillers, estimatedDailyTotal } from '../therapy';
import { ProfileChart } from '../components/TherapyBreakdown';

const NOW_MIN = 716; // "11:56"

function ActiveBody() {
  const { baseDose, bolusCount, intervals, useBaseOnly, medications } = useTherapy();
  const sourceIntervals = useBaseOnly ? [] : intervals;
  const hasIntervals = sourceIntervals.length > 0;
  const estDaily = hasIntervals ? estimatedDailyTotal(baseDose, sourceIntervals) : baseDose;
  // Dose of the window running right now (NOW_MIN), falling back to base dose.
  const cur = withBaseFillers(sourceIntervals, baseDose).find(s => NOW_MIN >= s.startMin && NOW_MIN < s.endMin);
  const currentPrimaryUg = cur ? cur.dose : baseDose;

  return (
    <div className="content-stretch flex flex-col gap-[16px] items-start relative shrink-0 w-[984px]">
      {hasIntervals && (
        <ProfileChart baseDose={baseDose} bolusCount={bolusCount} windows={sourceIntervals} showNow />
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
