import { useState } from 'react';
import { useNavigate } from '../navigation';
import { useTherapy, type DayKey } from '../therapy';
import { DetailShell } from '../components/DetailShell';
import { StopTherapyDialog } from '../components/ConfirmDialog';
import { TherapyIcon } from '../components/HomeShell';
import { TherapyChartCard, TherapyMedBreakdown } from '../components/TherapyBreakdown';
import { DayGroupToggle, repDay } from '../components/DayToggles';

const imgClin1 = "/icons/act-clinician-1.svg";
const imgClin2 = "/icons/act-clinician-2.svg";

/* ----- bottom action tiles (filled blue, white glyph) ----- */
function ActionTile({ label, onClick, children }: { label: string; onClick?: () => void; children: React.ReactNode }) {
  return (
    <div onClick={onClick} className="bg-[#0b786a] rounded-[16px] flex-1 h-[230px] flex flex-col items-center justify-center gap-[16px] overflow-clip px-[12px] py-[20px] cursor-pointer">
      <div className="relative size-[88px] flex items-center justify-center shrink-0">{children}</div>
      <span className="font-['Roboto',sans-serif] font-bold text-white text-[26px] tracking-[0.1px] text-center leading-[30px]" style={{ fontVariationSettings: "'wdth' 100" }}>{label}</span>
    </div>
  );
}
function ClinicianGlyph() {
  return (
    <div className="relative size-[88px]">
      <div className="absolute inset-[6.25%_33.75%_21.25%_11.25%]"><img alt="" src={imgClin1} className="absolute inset-0 block max-w-none size-full" /></div>
      <div className="absolute inset-[20%_11.25%_5%_66.25%]"><img alt="" src={imgClin2} className="absolute inset-0 block max-w-none size-full" /></div>
    </div>
  );
}
/* Edit Therapy / Edit Medication: exact white Figma icons (schedule+bottle+pencil, bottle+pencil). */
function EditTherapyGlyph() {
  return <img alt="" src="/icons/act-edit-therapy.svg" className="w-[84px] h-[78px] block object-contain" />;
}
function EditMedicationGlyph() {
  return <img alt="" src="/icons/act-edit-medication.svg" className="h-[80px] w-[74px] block object-contain" />;
}
function StopGlyph() {
  return <div className="size-[48px] rounded-[6px] bg-white" />;
}

export function TherapyDetail() {
  const navigate = useNavigate();
  const { setFlowMode, setTherapyPaused, beginEditTherapy, intervalsByDay, dayPattern } = useTherapy();
  const [viewDay, setViewDay] = useState<DayKey>('monday');
  const windows = intervalsByDay[repDay(dayPattern, viewDay)];

  // Edit Therapy opens the Edit-Therapy decision screen; Edit Medication jumps
  // straight to the medication page (add/remove meds), both snapshotting so a
  // back-out restores the current therapy.
  const onEditTherapy = () => { setFlowMode('setup'); beginEditTherapy('therapy-detail'); navigate('base-dose'); };
  const onEditMedication = () => { setFlowMode('setup'); beginEditTherapy('therapy-detail'); navigate('add-medication'); };
  // Stop asks first; confirming pauses delivery and the home screen then offers
  // Resume Therapy.
  const [confirmStop, setConfirmStop] = useState(false);
  const onStop = () => setConfirmStop(true);
  const stopDialog = confirmStop && (
    <StopTherapyDialog
      onCancel={() => setConfirmStop(false)}
      onConfirm={() => { setTherapyPaused(true); navigate('home-active'); }}
    />
  );
  const onClinicianBolus = () => navigate('actions');

  return (
    <DetailShell
      icon={<TherapyIcon size={56} />}
      title="Therapy"
      onHelp={() => navigate('help')}
      overlay={stopDialog}
      pinnedTop={<TherapyChartCard showNow showHeader={false} windowsOverride={windows} />}
      footer={
        <div className="flex gap-[16px] px-[80px] pt-[24px] pb-[32px]">
          <ActionTile label="Clinician Bolus" onClick={onClinicianBolus}><ClinicianGlyph /></ActionTile>
          <ActionTile label="Edit Therapy" onClick={onEditTherapy}><EditTherapyGlyph /></ActionTile>
          <ActionTile label="Edit Medication" onClick={onEditMedication}><EditMedicationGlyph /></ActionTile>
          <ActionTile label="Stop" onClick={onStop}><StopGlyph /></ActionTile>
        </div>
      }
    >
      {/* Day-group switcher (only when the schedule differs by day) + the
          breakdown accordion for the selected day-group. */}
      <div className="flex flex-col gap-[24px]">
        <DayGroupToggle dayPattern={dayPattern} viewDay={viewDay} onPick={setViewDay} />
        <TherapyMedBreakdown windowsOverride={windows} />
      </div>
    </DetailShell>
  );
}
