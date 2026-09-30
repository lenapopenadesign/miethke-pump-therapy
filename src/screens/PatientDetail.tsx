import { DetailShell } from '../components/DetailShell';
import { PatientIcon } from '../components/HomeShell';

const labelCls = "font-['Roboto',sans-serif] font-bold text-[#096657] text-[24px] tracking-[0.1px]";
const valueCls = "font-['Roboto',sans-serif] font-bold text-[#096657] text-[32px] tracking-[0.1px]";

function Field({ label, value, multiline = false }: { label: string; value: string; multiline?: boolean }) {
  return (
    <div className="flex flex-col gap-[8px] w-full">
      <label className={labelCls}>{label}</label>
      <div className={`bg-[#f5fcf9] rounded-[8px] px-[20px] ${multiline ? 'py-[20px]' : 'h-[72px] flex items-center'}`}>
        <p className={`${valueCls} ${multiline ? 'font-normal leading-[40px]' : 'whitespace-nowrap'}`}>{value}</p>
      </div>
    </div>
  );
}

export function PatientDetail() {
  return (
    <DetailShell icon={<PatientIcon size={56} />} title="Frida Kenton">
      <div className="flex flex-col gap-[24px] flex-1">
        {/* Name row */}
        <div className="flex gap-[24px]">
          <div className="flex-1 min-w-px"><Field label="Name*" value="Frida" /></div>
          <div className="flex-1 min-w-px"><Field label="Middle name" value="Kenton" /></div>
          <div className="flex-1 min-w-px"><Field label="Family name*" value="Patient" /></div>
        </div>
        {/* Birth / Gender */}
        <div className="flex gap-[24px]">
          <div className="flex-[1.6] min-w-px"><Field label="Birth Date" value="01 Apr 1985" /></div>
          <div className="flex-1 min-w-px"><Field label="Gender" value="Female" /></div>
        </div>
        <Field label="Patient ID" value="930230393" />
        <Field label="Condition" value="Cancer" />
        <Field
          label="Notes"
          multiline
          value={
            'The patient has a documented history of allergic reactions to multiple antibiotics. Reported allergies include: Penicillin, Sulfa drugs (e.g., sulfamethoxazole), Macrolides.\n' +
            'Alternative classes such as fluoroquinolones or tetracyclines may be considered, depending on the clinical scenario and prior tolerance.'
          }
        />

        {/* Edit button — pinned to the bottom of the page */}
        <div className="flex justify-center mt-auto pt-[40px]">
          <button className="bg-[#0b786a] rounded-[16px] size-[200px] flex flex-col items-center justify-center gap-[16px] cursor-pointer">
            <svg width="56" height="56" viewBox="0 0 24 24" fill="none">
              <path d="M4 20h4l10-10-4-4L4 16v4z" stroke="white" strokeWidth="1.8" strokeLinejoin="round" />
              <path d="M14 6l4 4" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
            <span className="font-['Roboto',sans-serif] font-bold text-white text-[28px] tracking-[0.1px]" style={{ fontVariationSettings: "'wdth' 100" }}>Edit</span>
          </button>
        </div>
      </div>
    </DetailShell>
  );
}
