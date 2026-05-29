import { useEffect } from 'react';
import { useNavigate } from '../navigation';
import { WizardShell } from '../components/WizardShell';

const imgCheck = "/icons/9f696640-976b-4195-a9c5-662c75d84b76.svg";

function LoadingBar() {
  return (
    <div className="border-2 border-[#65d8fe] border-solid flex flex-col items-start justify-center p-[2px] rounded-[76px] w-full">
      <div className="flex gap-[8px] h-[20px] items-center justify-center overflow-clip px-[40px] py-[16px] rounded-[47px] w-full" style={{ backgroundImage: "linear-gradient(-90deg, rgb(101, 216, 254) 0%, rgb(0, 118, 158) 100%)" }}>
        <div className="relative shrink-0 size-[24px]">
          <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgCheck} />
        </div>
        <p className="font-['Poppins',sans-serif] text-[16px] text-[rgba(255,255,255,0)] text-center whitespace-nowrap">Done</p>
      </div>
    </div>
  );
}

export function Activate() {
  const navigate = useNavigate();
  useEffect(() => {
    const t = setTimeout(() => navigate('home-active'), 2500);
    return () => clearTimeout(t);
  }, [navigate]);
  return (
    <WizardShell step="transfer" onBack={() => navigate('review')}>
      <div className="flex flex-col gap-[24px]">
        <p className="font-['Roboto',sans-serif] font-bold leading-[40px] text-[#00769e] text-[36px] tracking-[0.1px]" style={{ fontVariationSettings: "'wdth' 100" }}>
          Activate therapy on implant
        </p>
        <LoadingBar />
      </div>
    </WizardShell>
  );
}
