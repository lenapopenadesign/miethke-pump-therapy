import { useState, type ReactNode } from 'react';
import { useNavigate } from '../navigation';
import { useTherapy } from '../therapy';
import { DetailShell } from '../components/DetailShell';
import { StopTherapyDialog } from '../components/ConfirmDialog';
import { PatientIcon, ImplantIcon, TherapyIcon } from '../components/HomeShell';

const imgHand = "/icons/5d577001-d49c-4bb9-9a48-3948e35d4261.svg";
// White icons (filled "Recommended" tiles)
const imgRefillSyringeW = "/icons/act-prefill-syringe.svg";
const imgRefillPumpW = "/icons/act-prefill-pump.svg";
const imgClin1W = "/icons/act-clinician-1.svg";
const imgClin2W = "/icons/act-clinician-2.svg";
// Blue icons (outline section tiles)
const imgRefillSyringeB = "/icons/act-refill-syringe-b.svg";
const imgRefillPumpB = "/icons/act-refill-pump-b.svg";
const imgClin1B = "/icons/act-clinician-1-b.svg";
const imgClin2B = "/icons/act-clinician-2-b.svg";
const imgPrime1 = "/icons/act-prime-1.svg";
const imgPrime2 = "/icons/act-prime-2.svg";
const imgPrime3 = "/icons/act-prime-3.svg";
const imgAccess = "/icons/act-access.svg";
const imgRevision = "/icons/act-revision-b.svg";
const imgEdit = "/icons/act-edit.svg";

const IMG = "absolute block inset-0 max-w-none size-full";

/* ----- tile icon compositions (exact Figma insets) ----- */
function RefillIcon({ white = false }: { white?: boolean }) {
  return (
    <>
      <div className="absolute flex inset-[-8.75%_-3.93%_29.79%_23.01%] items-center justify-center" style={{ containerType: "size" }}>
        <div className="flex-none h-[hypot(36.3553cqw,-67.1953cqh)] rotate-[-153.3deg] skew-x-[-2.31deg] w-[hypot(-63.6447cqw,-32.8047cqh)]">
          <div className="relative size-full"><img alt="" src={white ? imgRefillSyringeW : imgRefillSyringeB} className={IMG} /></div>
        </div>
      </div>
      <div className="absolute inset-[37.62%_52.29%_9.03%_0]"><img alt="" src={white ? imgRefillPumpW : imgRefillPumpB} className={IMG} /></div>
    </>
  );
}

function ClinicianIcon({ white = false }: { white?: boolean }) {
  return (
    <>
      <div className="absolute inset-[6.25%_33.75%_21.25%_11.25%]"><img alt="" src={white ? imgClin1W : imgClin1B} className={IMG} /></div>
      <div className="absolute inset-[20%_11.25%_5%_66.25%]"><img alt="" src={white ? imgClin2W : imgClin2B} className={IMG} /></div>
    </>
  );
}

function PrimeIcon() {
  return (
    <>
      <div className="absolute inset-[52.65%_20%_10.53%_56.61%]"><div className="absolute inset-[-1.94%_-3.06%_-1.94%_-3.05%]"><img alt="" src={imgPrime1} className="block max-w-none size-full" /></div></div>
      <div className="absolute inset-[10%_35.58%_53.18%_41.06%]"><div className="absolute inset-[-1.94%_-3.05%_-1.94%_-3.07%]"><img alt="" src={imgPrime2} className="block max-w-none size-full" /></div></div>
      <div className="absolute inset-[42.84%_56.65%_20.35%_20%]"><div className="absolute inset-[-1.94%_-3.06%_-1.93%_-3.06%]"><img alt="" src={imgPrime3} className="block max-w-none size-full" /></div></div>
    </>
  );
}

function AccessIcon() {
  return <div className="absolute inset-[0_-1.25%_-1.25%_0.39%]"><img alt="" src={imgAccess} className={IMG} /></div>;
}

function RevisionIcon() {
  return <div className="absolute inset-[3.14%_7.5%_3.14%_7.53%]"><img alt="" src={imgRevision} className={IMG} /></div>;
}

function EditIcon() {
  return <img alt="" src={imgEdit} className="h-[101px] w-[67px] block" />;
}

/* Edit Therapy / Edit Medication: exact Figma icons, blue for the outline tiles. */
function EditTherapyGlyph() {
  return <img alt="" src="/icons/act-edit-therapy-b.svg" className="h-[110px] w-[119px] block object-contain" />;
}
function EditMedicationGlyph() {
  return <img alt="" src="/icons/act-edit-medication-b.svg" className="h-[110px] w-[101px] block object-contain" />;
}

function StopIcon() {
  return <div className="bg-[#0b786a] rounded-[6px] size-[44px]" />;
}

/* ----- tile + section ----- */
function Tile({ filled = false, label, children, onClick }: { filled?: boolean; label: string; children: ReactNode; onClick?: () => void }) {
  return (
    <div onClick={onClick} className={`flex flex-col gap-[18px] items-center justify-center overflow-clip px-[20px] py-[26px] rounded-[16px] size-[230px] shrink-0 cursor-pointer ${filled ? 'bg-[#0b786a]' : 'bg-white border-2 border-[#0b786a]'}`}>
      <div className="overflow-clip relative shrink-0 size-[140px] flex items-center justify-center">{children}</div>
      <p className={`font-['Roboto',sans-serif] font-bold leading-[32px] text-[28px] text-center tracking-[0.1px] ${filled ? 'text-white' : 'text-[#0b786a]'}`} style={{ fontVariationSettings: "'wdth' 100" }}>{label}</p>
    </div>
  );
}

function SectionCard({ icon, label, children }: { icon?: ReactNode; label: string; children: ReactNode }) {
  return (
    <div className="bg-[#f5fcf9] rounded-[24px] px-[24px] py-[20px] flex flex-col gap-[16px] w-full">
      <div className="flex items-center gap-[20px]">
        {icon}
        <p className="font-['Roboto',sans-serif] font-extrabold leading-[48px] text-[#096657] text-[40px] tracking-[2px]" style={{ fontVariationSettings: "'wdth' 100" }}>{label}</p>
      </div>
      <div className="flex gap-[24px]">{children}</div>
    </div>
  );
}

function HandIcon() {
  return (
    <div className="flex items-center justify-center shrink-0 size-[56px]">
      <img alt="" src={imgHand} className="h-[52px] w-[31px] block" />
    </div>
  );
}

export function ActionsScreen() {
  const navigate = useNavigate();
  const { setFlowMode, beginEditTherapy, setTherapyPaused } = useTherapy();
  const startRefill = () => { setFlowMode('refill'); navigate('refill-filling'); };
  // Same therapy actions as the Therapy subpage: Edit Therapy opens the decision
  // screen; Edit Medication jumps to the medication page (add/remove); Stop pauses delivery.
  const editTherapy = () => { setFlowMode('setup'); beginEditTherapy('actions'); navigate('base-dose'); };
  const editMedication = () => { setFlowMode('setup'); beginEditTherapy('actions'); navigate('add-medication'); };
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
  return (
    <DetailShell icon={<HandIcon />} title="Actions" overlay={stopDialog}>
      <div className="flex flex-col gap-[32px]">
        <SectionCard label="Recommended">
          <Tile filled label="Refill" onClick={startRefill}><RefillIcon white /></Tile>
          <Tile filled label="Clinician Bolus"><ClinicianIcon white /></Tile>
        </SectionCard>

        <SectionCard icon={<PatientIcon size={56} />} label="Patient">
          <Tile label="Edit"><EditIcon /></Tile>
        </SectionCard>

        <SectionCard icon={<ImplantIcon size={56} />} label="Implant">
          <Tile label="Refill" onClick={startRefill}><RefillIcon /></Tile>
          <Tile label="Prime Bolus"><PrimeIcon /></Tile>
          <Tile label="Access"><AccessIcon /></Tile>
          <Tile label="Revision"><RevisionIcon /></Tile>
        </SectionCard>

        <SectionCard icon={<TherapyIcon size={56} />} label="Therapy">
          <Tile label="Clinician Bolus"><ClinicianIcon /></Tile>
          <Tile label="Edit Therapy" onClick={editTherapy}><EditTherapyGlyph /></Tile>
          <Tile label="Edit Medication" onClick={editMedication}><EditMedicationGlyph /></Tile>
          <Tile label="Stop" onClick={onStop}><StopIcon /></Tile>
        </SectionCard>
      </div>
    </DetailShell>
  );
}
