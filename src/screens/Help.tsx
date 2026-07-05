import { useState } from 'react';
import { useNavigate } from '../navigation';

const imgSignet = "/icons/9f250784-cad4-4195-99ce-4b9dc94364a5.svg";
// Self-contained pump animation served from /public. Clicking the help video opens it.
const VIDEO_SRC = "/catheter_sync_animation.html";
const wdth = { fontVariationSettings: "'wdth' 100" } as const;

function BackArrow({ onClick }: { onClick: () => void }) {
  return (
    <button onClick={onClick} className="size-[56px] flex items-center justify-center cursor-pointer" aria-label="Back">
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none"><path d="M15 5l-7 7 7 7" stroke="#00769e" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
    </button>
  );
}

function HelpGlyph() {
  return (
    <svg width="44" height="44" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="3" width="18" height="18" rx="6" stroke="#00769e" strokeWidth="1.8" />
      <path d="M9.5 9.2a2.5 2.5 0 1 1 3.2 2.4c-.7.25-1.2.9-1.2 1.7v.4" stroke="#00769e" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="11.5" cy="16.8" r="1" fill="#00769e" />
    </svg>
  );
}

function PlayIcon() {
  return (
    <div className="size-[96px] rounded-full bg-[#0094c5] flex items-center justify-center">
      <svg width="40" height="40" viewBox="0 0 24 24" fill="white"><path d="M8 5v14l11-7z" /></svg>
    </div>
  );
}

function StepIcon() {
  return <div className="size-[48px] rounded-[10px] bg-[#d1eaf8] shrink-0" />;
}

function ArrowRight() {
  return <svg width="40" height="40" viewBox="0 0 24 24" fill="none"><path d="M9 5l7 7-7 7" stroke="#0094c5" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

const STEPS = [
  { title: 'Base dose', desc: 'Set the continuous background dose per medication' },
  { title: 'Delivery Frequency', desc: 'Choose how often the pump delivers over the day' },
  { title: 'Dosing windows', desc: 'Add time windows that raise or lower the dose' },
];

export function Help() {
  const navigate = useNavigate();
  const [videoOpen, setVideoOpen] = useState(false);
  return (
    <div className="bg-white relative w-[1200px] h-[1920px] flex flex-col overflow-hidden">
      <div className="bg-[#3b2d7c] h-[35px] w-[1200px] shrink-0" />
      {/* Header */}
      <div className="bg-[#e6f4f9] flex h-[96px] items-center justify-between px-[40px] shrink-0">
        <div className="flex gap-[16px] items-center">
          <BackArrow onClick={() => navigate('home-active')} />
          <HelpGlyph />
          <p className="font-['Roboto',sans-serif] font-extrabold text-[#00769e] text-[40px] tracking-[0.1px]" style={wdth}>How the pump works</p>
        </div>
        <div className="h-[62px] w-[53px] overflow-clip"><img alt="" className="block size-full" src={imgSignet} /></div>
      </div>

      <div className="flex flex-col gap-[48px] px-[80px] pt-[48px]">
        {/* Adding a therapy */}
        <div className="flex flex-col gap-[24px]">
          <p className="font-['Roboto',sans-serif] font-bold text-[#00769e] text-[32px] tracking-[0.1px]" style={wdth}>Adding a therapy</p>
          <div onClick={() => setVideoOpen(true)} className="bg-[#e6f4f9] rounded-[24px] p-[32px] flex gap-[32px] items-center cursor-pointer">
            <div className="bg-[#c4dfec] rounded-[16px] w-[320px] h-[220px] flex items-center justify-center shrink-0"><PlayIcon /></div>
            <div className="flex flex-col gap-[12px]">
              <span className="self-start bg-[#0094c5] rounded-[20px] px-[20px] py-[4px] font-['Roboto',sans-serif] font-bold text-white text-[22px] tracking-[1px]" style={wdth}>VIDEO</span>
              <p className="font-['Roboto',sans-serif] font-bold text-[#00769e] text-[30px] tracking-[0.1px]" style={wdth}>How the pump works</p>
              <p className="font-['Roboto',sans-serif] font-normal text-[#5f7180] text-[24px] tracking-[0.1px] max-w-[560px]" style={wdth}>A short animation of how your pump stores and delivers medication over 24 hours.</p>
              <div className="flex items-center gap-[10px] pt-[4px]">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="#0094c5" strokeWidth="1.8" /><path d="M12 7v5l3 2" stroke="#0094c5" strokeWidth="1.8" strokeLinecap="round" /></svg>
                <span className="font-['Roboto',sans-serif] font-bold text-[#0094c5] text-[24px]" style={wdth}>1 min 30 sec</span>
              </div>
            </div>
          </div>
        </div>

        {/* Steps in this flow */}
        <div className="flex flex-col gap-[24px]">
          <p className="font-['Roboto',sans-serif] font-bold text-[#00769e] text-[30px] tracking-[0.1px]" style={wdth}>Steps in this flow</p>
          {STEPS.map(s => (
            <div key={s.title} className="flex items-center gap-[24px]">
              <StepIcon />
              <div className="flex flex-col">
                <p className="font-['Roboto',sans-serif] font-bold text-[#45483c] text-[28px] tracking-[0.1px]" style={wdth}>{s.title}</p>
                <p className="font-['Roboto',sans-serif] font-normal text-[#8a97a1] text-[24px] tracking-[0.1px]" style={wdth}>{s.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* More help */}
        <div className="flex flex-col gap-[24px]">
          <p className="font-['Roboto',sans-serif] font-bold text-[#00769e] text-[30px] tracking-[0.1px]" style={wdth}>More help</p>
          {['Frequently asked questions', 'Contact our care team'].map(label => (
            <div key={label} className="border-2 border-[#cfdbe3] rounded-[16px] h-[100px] flex items-center px-[32px] gap-[20px] cursor-pointer">
              <HelpGlyph />
              <p className="flex-1 font-['Roboto',sans-serif] font-bold text-[#00769e] text-[30px] tracking-[0.1px]" style={wdth}>{label}</p>
              <ArrowRight />
            </div>
          ))}
        </div>
      </div>

      {/* Video overlay — plays the self-contained pump animation full-page. */}
      {videoOpen && (
        <div className="absolute inset-0 z-50 bg-[#d9eef7]">
          <iframe
            src={VIDEO_SRC}
            title="How the pump works"
            className="absolute inset-0 w-full h-full border-0"
          />
          <button
            onClick={() => setVideoOpen(false)}
            aria-label="Close video"
            className="absolute top-[40px] right-[40px] size-[72px] rounded-full bg-white flex items-center justify-center cursor-pointer shadow-lg"
          >
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none"><path d="M6 6l12 12M18 6L6 18" stroke="#00769e" strokeWidth="2.6" strokeLinecap="round" /></svg>
          </button>
        </div>
      )}
    </div>
  );
}
