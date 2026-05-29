import { useNavigate } from '../navigation';
import { HomeShell } from '../components/HomeShell';

const imgWarning = "/icons/c667ceb3-ed53-4c5b-b4f8-9b7620e8b97b.svg";

function NoTherapyBody({ onCta }: { onCta: () => void }) {
  return (
    <div className="content-stretch flex flex-col gap-[16px] items-start relative shrink-0 w-[984px]">
      <div onClick={onCta} className="bg-[#fdf3d1] content-stretch flex flex-1 gap-[24px] items-center overflow-clip p-[24px] relative rounded-[24px] w-full cursor-pointer">
        <div className="h-[40px] overflow-clip relative shrink-0 w-[41px]">
          <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgWarning} />
        </div>
        <p className="font-['Roboto',sans-serif] font-normal leading-[32px] relative shrink-0 text-[#45483c] text-[24px] tracking-[0.1px]" style={{ fontVariationSettings: "'wdth' 100" }}>
          Set-up a therapy for your patient to start the medication delivery.
        </p>
      </div>
    </div>
  );
}

export function HomeNoTherapy() {
  const navigate = useNavigate();
  return (
    <HomeShell
      therapyStatus="none"
      onTherapyClick={() => navigate('add-medication')}
      therapyBody={<NoTherapyBody onCta={() => navigate('add-medication')} />}
    />
  );
}
