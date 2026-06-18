import { useNavigate } from '../navigation';
import { useTherapy } from '../therapy';
import { DetailShell } from '../components/DetailShell';
import { TherapyIcon } from '../components/HomeShell';
import { TherapyBreakdown } from '../components/TherapyBreakdown';

const imgClin1 = "/icons/act-clinician-1.svg";
const imgClin2 = "/icons/act-clinician-2.svg";

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
  const { setFlowMode, setTherapyActive, beginNewTherapy, beginEditTherapy } = useTherapy();

  // Edit keeps the current therapy and walks the wizard from the start; New
  // blanks it. Both snapshot the committed therapy so backing out restores it.
  const onEdit = () => { beginEditTherapy(); setFlowMode('setup'); navigate('add-medication'); };
  const onNew = () => { beginNewTherapy(); setFlowMode('setup'); navigate('add-medication'); };
  const onStop = () => { setTherapyActive(false); navigate('home-no-therapy'); };
  const onClinicianBolus = () => navigate('actions');

  return (
    <DetailShell icon={<TherapyIcon size={56} />} title="Therapy">
      <div className="flex flex-col flex-1 min-h-0">
        {/* Same body as the Review page (chart + per-medication breakdown). */}
        <TherapyBreakdown showNow />

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
