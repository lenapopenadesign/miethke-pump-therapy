import { useNavigate } from '../navigation';
import { useTherapy, estimatedDailyTotal, withBaseFillers, type Interval } from '../therapy';
import { DetailShell } from '../components/DetailShell';
import { TherapyIcon } from '../components/HomeShell';
import { BolusBars } from '../components/TherapyHeaderChart';
import { MedSummary } from '../components/MedSummary';

const imgClin1 = "/icons/act-clinician-1.svg";
const imgClin2 = "/icons/act-clinician-2.svg";

const NOW_MIN = 716; // "11:56" — the current-time marker

/* 24h dose chart as bolus "strokes" with the current-time marker. */
function ProfileChart({ baseDose, bolusCount, windows }: { baseDose: number; bolusCount: number; windows: Interval[] }) {
  const CHART_H = 300, BASELINE = 56;
  const nowPos = `calc(24px + (100% - 48px) * ${NOW_MIN / 1440})`;
  return (
    <div className="relative w-full bg-white border border-[#d9dbde] rounded-[16px]" style={{ height: CHART_H }}>
      {[
        { t: '00:00', f: 0 }, { t: '06:00', f: 0.25 }, { t: '12:00', f: 0.5 }, { t: '18:00', f: 0.75 }, { t: '24:00', f: 1 },
      ].map(({ t, f }, i) => {
        const first = i === 0, last = i === 4;
        return (
          <p key={t} className="absolute font-['Roboto',sans-serif] text-[#9ea8b2] text-[22px] top-[16px] whitespace-nowrap" style={{ left: last ? undefined : `calc(24px + (100% - 48px) * ${f})`, right: last ? 24 : undefined, transform: first || last ? undefined : 'translateX(-50%)', fontVariationSettings: "'wdth' 100" }}>{t}</p>
        );
      })}
      {/* Bars */}
      <div className="absolute left-[24px] right-[24px] top-[56px]" style={{ bottom: BASELINE }}>
        <div className="absolute inset-0">
          <BolusBars baseDose={baseDose} bolusCount={bolusCount} windows={windows} nominalH={104} maxH={180} minH={24} barWidth={12} />
        </div>
      </div>
      {/* Baseline */}
      <div className="absolute left-[24px] right-[24px] h-px bg-[#e3e6e9]" style={{ bottom: BASELINE }} />
      {/* Current-time marker */}
      <div className="absolute w-[2px] bg-[#063b66]" style={{ left: nowPos, top: 48, bottom: BASELINE }} />
      <div className="absolute" style={{ left: nowPos, top: 40, transform: 'translateX(-50%)', width: 0, height: 0, borderLeft: '8px solid transparent', borderRight: '8px solid transparent', borderTop: '10px solid #063b66' }} />
      {/* Axis labels at the bottom */}
      <p className="absolute left-[24px] bottom-[16px] font-['Roboto',sans-serif] text-[#9ea8b2] text-[22px]" style={{ fontVariationSettings: "'wdth' 100" }}>00:00</p>
      <p className="absolute right-[24px] bottom-[16px] font-['Roboto',sans-serif] text-[#9ea8b2] text-[22px]" style={{ fontVariationSettings: "'wdth' 100" }}>24:00</p>
    </div>
  );
}

/* ----- bottom action tiles (filled blue, white glyph) ----- */
function ActionTile({ label, onClick, children }: { label: string; onClick?: () => void; children: React.ReactNode }) {
  return (
    <div onClick={onClick} className="bg-[#0094c5] rounded-[16px] flex-1 h-[230px] flex flex-col items-center justify-center gap-[16px] overflow-clip px-[16px] py-[20px] cursor-pointer">
      <div className="relative size-[96px] flex items-center justify-center shrink-0">{children}</div>
      <span className="font-['Roboto',sans-serif] font-bold text-white text-[28px] tracking-[0.1px] text-center" style={{ fontVariationSettings: "'wdth' 100" }}>{label}</span>
    </div>
  );
}
function ClinicianGlyph() {
  return (
    <div className="relative size-[96px]">
      <div className="absolute inset-[6.25%_33.75%_21.25%_11.25%]"><img alt="" src={imgClin1} className="absolute inset-0 block max-w-none size-full" /></div>
      <div className="absolute inset-[20%_11.25%_5%_66.25%]"><img alt="" src={imgClin2} className="absolute inset-0 block max-w-none size-full" /></div>
    </div>
  );
}
function PencilGlyph() {
  return (
    <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
      <path d="M4 20h4l10-10-4-4L4 16v4z" stroke="white" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M14 6l4 4" stroke="white" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}
function PlusGlyph() {
  return (
    <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
      <path d="M12 4v16M4 12h16" stroke="white" strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  );
}
function StopGlyph() {
  return <div className="size-[52px] rounded-[6px] bg-white" />;
}

export function TherapyDetail() {
  const navigate = useNavigate();
  const { baseDose, bolusCount, intervals, medications, setFlowMode, setTherapyActive, resetTherapy } = useTherapy();

  const windows = [...intervals].sort((a, b) => a.startMin - b.startMin);
  const estDaily = estimatedDailyTotal(baseDose, windows);
  // Dose of the window running right now (NOW_MIN), falling back to base dose.
  const cur = withBaseFillers(windows, baseDose).find(s => NOW_MIN >= s.startMin && NOW_MIN < s.endMin);
  const currentUg = cur ? cur.dose : baseDose;

  const onEdit = () => navigate('windows');
  const onNew = () => { resetTherapy(); setFlowMode('setup'); navigate('add-medication'); };
  const onStop = () => { setTherapyActive(false); navigate('home-no-therapy'); };
  const onClinicianBolus = () => navigate('actions');

  return (
    <DetailShell icon={<TherapyIcon size={56} />} title="Therapy">
      <div className="flex flex-col flex-1 min-h-0">
        <div className="flex flex-col gap-[24px]">
          {/* Section header */}
          <div className="flex items-center gap-[16px]">
            <TherapyIcon size={48} />
            <p className="flex-1 font-['Roboto',sans-serif] font-bold text-[#00769e] text-[32px] tracking-[0.1px]" style={{ fontVariationSettings: "'wdth' 100" }}>
              Medication &amp; Therapy
            </p>
          </div>

          <ProfileChart baseDose={baseDose} bolusCount={bolusCount} windows={windows} />

          <MedSummary estDaily={estDaily} currentUg={currentUg} medications={medications} />
        </div>

        {/* Action tiles */}
        <div className="flex gap-[24px] mt-auto pt-[24px]">
          <ActionTile label="Clinician Bolus" onClick={onClinicianBolus}><ClinicianGlyph /></ActionTile>
          <ActionTile label="Edit" onClick={onEdit}><PencilGlyph /></ActionTile>
          <ActionTile label="New" onClick={onNew}><PlusGlyph /></ActionTile>
          <ActionTile label="Stop" onClick={onStop}><StopGlyph /></ActionTile>
        </div>
      </div>
    </DetailShell>
  );
}
