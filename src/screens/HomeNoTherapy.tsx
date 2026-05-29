import { useNavigate } from '../navigation';
import { useTherapy } from '../therapy';
import { HomeShell } from '../components/HomeShell';

const imgWarning = "/icons/c667ceb3-ed53-4c5b-b4f8-9b7620e8b97b.svg";

type Row = { name: string; concentration: string; dotColor: string };
const DOT_COLORS = ['#063b66', '#0b7fa8', '#b5d4f4', '#4da6d6', '#055273'];

function SubstanceTable({ rows }: { rows: Row[] }) {
  return (
    <div className="content-stretch flex flex-col items-start overflow-clip relative rounded-[12px] shrink-0 w-full">
      <div className="flex items-stretch w-full">
        <div className="bg-white flex-1 flex items-center px-[20px] py-[12px]">
          <p className="font-['Roboto',sans-serif] font-bold text-[#00769e] text-[20px] tracking-[1px]" style={{ fontVariationSettings: "'wdth' 100" }}>MEDICATION</p>
        </div>
        <div className="bg-white w-[220px] flex items-center px-[20px] py-[12px]">
          <p className="font-['Roboto',sans-serif] font-normal text-[#00769e] text-[20px] tracking-[1px]" style={{ fontVariationSettings: "'wdth' 100" }}>CONCENTRATION</p>
        </div>
        <div className="bg-white w-[180px] flex items-center px-[20px] py-[12px]">
          <p className="font-['Roboto',sans-serif] font-bold text-[#00769e] text-[20px] tracking-[1px]" style={{ fontVariationSettings: "'wdth' 100" }}>24H DOSE</p>
        </div>
      </div>
      {rows.map(row => (
        <div key={row.name} className="flex items-stretch w-full border-b border-white">
          <div className="bg-[#f3f9fc] flex-1 flex items-center gap-[12px] px-[20px] py-[14px]">
            <div className="rounded-full shrink-0" style={{ width: 14, height: 14, background: row.dotColor }} />
            <p className="font-['Roboto',sans-serif] font-bold text-[#00769e] text-[24px] leading-[32px] tracking-[0.1px]" style={{ fontVariationSettings: "'wdth' 100" }}>{row.name}</p>
          </div>
          <div className="bg-[#e6f4f9] w-[220px] flex items-center justify-end px-[20px] py-[14px]">
            <p className="font-['Roboto',sans-serif] font-normal text-[#00769e] text-[22px]" style={{ fontVariationSettings: "'wdth' 100" }}>{row.concentration}</p>
          </div>
          <div className="bg-[#dceaf3] w-[180px] flex items-center justify-end px-[20px] py-[14px]">
            <p className="font-['Roboto',sans-serif] font-bold text-[#00769e] text-[22px]" style={{ fontVariationSettings: "'wdth' 100" }}>N/A</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function NoTherapyBody({ onCta, rows }: { onCta: () => void; rows: Row[] }) {
  return (
    <div className="content-stretch flex flex-col gap-[16px] items-start relative shrink-0 w-[984px]">
      <SubstanceTable rows={rows} />
      <div onClick={onCta} className="bg-[#fdf3d1] content-stretch flex flex-1 gap-[24px] items-center overflow-clip p-[24px] relative rounded-[24px] w-full cursor-pointer">
        <div className="h-[40px] overflow-clip relative shrink-0 w-[41px]">
          <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgWarning} />
        </div>
        <p className="font-['Roboto',sans-serif] font-normal leading-[32px] relative shrink-0 text-[#45483c] text-[24px] tracking-[0.1px]" style={{ fontVariationSettings: "'wdth' 100" }}>
          Add a 24h dose and intervals (optional) to start the therapy for your patient.
        </p>
      </div>
    </div>
  );
}

export function HomeNoTherapy() {
  const navigate = useNavigate();
  const { medications } = useTherapy();
  const rows: Row[] = medications.map((m, i) => ({
    name: m.name || '—',
    concentration: `${m.concentration} ${m.unit}`,
    dotColor: DOT_COLORS[i % DOT_COLORS.length],
  }));
  return (
    <HomeShell
      therapyStatus="not-active"
      onTherapyClick={() => navigate('add-medication')}
      therapyBody={<NoTherapyBody onCta={() => navigate('add-medication')} rows={rows} />}
    />
  );
}
