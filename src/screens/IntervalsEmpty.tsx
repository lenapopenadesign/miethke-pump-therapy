import { useNavigate } from '../navigation';
import { useTherapy, doseStringsFor, type DayPattern } from '../therapy';
import { WizardShell } from '../components/WizardShell';

function IntervalsIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
      <rect x="5"  y="20" width="8" height="15" rx="2" fill="#0094c5" />
      <rect x="16" y="10" width="8" height="25" rx="2" fill="#0094c5" />
      <rect x="27" y="16" width="8" height="19" rx="2" fill="#0094c5" />
    </svg>
  );
}

const DAY_PATTERNS: { key: DayPattern; label: string }[] = [
  { key: 'same',            label: 'Same Daily' },
  { key: 'weekday-weekend', label: 'Weekdays / Weekends' },
  { key: 'per-day',         label: 'Different every day' },
];

function BaseDoseChart({ hourly, unit }: { hourly: string; unit: string }) {
  return (
    <div className="relative w-full h-[200px] bg-[#f7fafc] border border-[#d9dbde] rounded-[16px]">
      {['00:00', '06:00', '12:00', '18:00', '24:00'].map((t, i) => (
        <p key={t} className="absolute font-['Roboto',sans-serif] text-[#9ea8b2] text-[16px] top-[14px] whitespace-nowrap"
           style={{ left: `${[2, 24.5, 49, 73, 95.5][i]}%`, fontVariationSettings: "'wdth' 100" }}>{t}</p>
      ))}
      <div className="absolute left-[24px] right-[24px] bottom-[24px] h-[50px] bg-[#8cc7e8] rounded-[4px] flex items-center px-[24px]">
        <p className="font-['Roboto',sans-serif] font-bold text-[16px] text-white tracking-[0.1px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
          Base dose {hourly} {unit}/h
        </p>
      </div>
    </div>
  );
}

export function IntervalsEmpty() {
  const navigate = useNavigate();
  const { startAddingInterval, dayPattern, setDayPattern, setUseBaseOnly, baseDose, medications } = useTherapy();
  const base = doseStringsFor(baseDose, medications[0]?.unit ?? 'µg/ml');
  const onAdd = () => { startAddingInterval('intervals-empty'); navigate('add-interval-when'); };
  const onSkip = () => { setUseBaseOnly(true); navigate('regular-therapy'); };

  return (
    <WizardShell step="therapy" onBack={() => navigate('base-dose')}>
      <div className="flex-1 flex flex-col gap-[24px]">
        {/* Title */}
        <div className="flex items-center gap-[16px]">
          <IntervalsIcon />
          <p className="font-['Roboto',sans-serif] font-extrabold text-[#00769e] text-[36px] tracking-[0.1px]" style={{ fontVariationSettings: "'wdth' 100" }}>
            Intervals
          </p>
          <div className="bg-[#0094c5] h-[36px] px-[16px] rounded-[18px] flex items-center">
            <p className="font-['Roboto',sans-serif] font-bold text-[16px] text-white tracking-[0.1px]" style={{ fontVariationSettings: "'wdth' 100" }}>optional</p>
          </div>
        </div>
        <p className="font-['Roboto',sans-serif] font-normal leading-[32px] text-[#45483c] text-[22px] tracking-[0.1px] w-full" style={{ fontVariationSettings: "'wdth' 100" }}>
          Therapy will run at the base dose around the clock. Add intervals to vary the dose at specific times of day (e.g. higher during physiotherapy, lower at night).
        </p>

        {/* Day-pattern tabs */}
        <div className="flex gap-[6px] p-[4px] rounded-[12px] bg-[#f7fafc] border border-[#d9dbde] w-full">
          {DAY_PATTERNS.map(p => {
            const active = dayPattern === p.key;
            return (
              <div key={p.key} onClick={() => setDayPattern(p.key)}
                className={`flex-1 flex items-center justify-center py-[12px] rounded-[8px] cursor-pointer select-none ${active ? 'bg-[#0094c5]' : ''}`}>
                <p className={`font-['Roboto',sans-serif] font-bold text-[22px] tracking-[0.1px] whitespace-nowrap ${active ? 'text-white' : 'text-[#667380]'}`} style={{ fontVariationSettings: "'wdth' 100" }}>
                  {p.label}
                </p>
              </div>
            );
          })}
        </div>

        <BaseDoseChart hourly={base.perHour} unit={base.unit} />

        {/* Empty state */}
        <p className="font-['Roboto',sans-serif] font-bold text-center text-[#9ea8b2] text-[36px] tracking-[0.1px] my-[80px]" style={{ fontVariationSettings: "'wdth' 100" }}>
          No intervals added yet
        </p>

        {/* CTAs pinned bottom */}
        <div className="mt-auto flex flex-col gap-[24px]">
          <div onClick={onAdd} className="bg-[#0094c5] h-[100px] rounded-[50px] w-full cursor-pointer flex items-center justify-center">
            <p className="font-['Roboto',sans-serif] font-bold text-[28px] text-white tracking-[0.1px] whitespace-pre" style={{ fontVariationSettings: "'wdth' 100" }}>{`+  Add your first interval`}</p>
          </div>
          <div onClick={onSkip} className="bg-white border-2 border-[#0094c5] h-[90px] rounded-[45px] w-full cursor-pointer flex items-center justify-center">
            <p className="font-['Roboto',sans-serif] font-bold text-[#0094c5] text-[24px] tracking-[0.1px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
              Skip - use base dose only
            </p>
          </div>
        </div>
      </div>
    </WizardShell>
  );
}
