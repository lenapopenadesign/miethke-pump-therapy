import { useNavigate } from '../navigation';
import { HomeShell } from '../components/HomeShell';
import { MedSummary } from '../components/MedSummary';
import { useTherapy, withBaseFillers, estimatedDailyTotal } from '../therapy';
import { ProfileChart } from '../components/TherapyBreakdown';
import { BridgeBolusStatus } from '../components/BridgeBolus';

const NOW_MIN = 716; // "11:56"

function ActiveBody() {
  const { baseDose, bolusCount, maxBoluses, intervals, useBaseOnly, medications } = useTherapy();
  const sourceIntervals = useBaseOnly ? [] : intervals;
  const estDaily = sourceIntervals.length > 0 ? estimatedDailyTotal(baseDose, sourceIntervals) : baseDose;
  // Dose rate active right now (NOW_MIN): a covering window's daily-equivalent
  // rate, else the base dose. The last delivery carries this rate / bolusCount.
  const cur = withBaseFillers(sourceIntervals, baseDose).find(s => NOW_MIN >= s.startMin && NOW_MIN < s.endMin);
  const lastDeliveryRateUg = cur ? cur.dose : baseDose;

  return (
    <div className="content-stretch flex flex-col gap-[16px] items-start relative shrink-0 w-[984px]">
      {/* Running after a medication-change refill (Figma 11178:243605). */}
      <BridgeBolusStatus className="w-full" surface="#ffffff" />
      {/* Always show the 24-hour chart for an active therapy — flat when the
          therapy is base-dose only (no windows), with peaks once windows exist. */}
      {baseDose > 0 && (
        <ProfileChart baseDose={baseDose} bolusCount={bolusCount} maxBoluses={maxBoluses} windows={sourceIntervals} unit={medications[0]?.unit ?? 'mg/ml'} showNow />
      )}
      <MedSummary
        estDaily={estDaily}
        bolusCount={bolusCount}
        lastDeliveryUg={lastDeliveryRateUg}
        medications={medications}
      />
    </div>
  );
}

export function HomeActive() {
  const navigate = useNavigate();
  const { therapyPaused } = useTherapy();
  return (
    <HomeShell
      therapyStatus={therapyPaused ? 'paused' : 'active'}
      therapyBody={<ActiveBody />}
      onTherapyClick={() => navigate('therapy-detail')}
      onTherapyHelp={() => navigate('help')}
    />
  );
}
