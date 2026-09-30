import { useNavigate } from '../navigation';
import { useTherapy, doseStringsFor, type DayPattern } from '../therapy';
import { WizardShell } from '../components/WizardShell';
import { BaseDoseChart } from '../components/BaseDoseChart';

function IntervalsIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
      <rect x="5"  y="20" width="8" height="15" rx="2" fill="#0b786a" />
      <rect x="16" y="10" width="8" height="25" rx="2" fill="#0b786a" />
      <rect x="27" y="16" width="8" height="19" rx="2" fill="#0b786a" />
    </svg>
  );
}

const DAY_PATTERNS: { key: DayPattern; label: string }[] = [
  { key: 'same',            label: 'Same Daily' },
  { key: 'weekday-weekend', label: 'Weekdays / Weekends' },
  { key: 'per-day',         label: 'Different every day' },
];

export function IntervalsEmpty() {
  const navigate = useNavigate();
  const { startAddingInterval, dayPattern, setDayPattern, setUseBaseOnly, baseDose, medications } = useTherapy();
  const base = doseStringsFor(baseDose, medications[0]?.unit ?? 'mcg/ml');
  const onAdd = () => { startAddingInterval('intervals-empty'); navigate('add-interval-when'); };
  const onSkip = () => { setUseBaseOnly(true); navigate('regular-therapy'); };

  return (
    <WizardShell step="intervals" onBack={() => navigate('base-dose')}>
      <div className="flex-1 flex flex-col gap-[24px]">
        {/* Title */}
        <div className="flex items-center gap-[16px]">
          <IntervalsIcon />
          <p className="font-['Roboto',sans-serif] font-extrabold text-[#096657] text-[36px] tracking-[0.1px]" style={{ fontVariationSettings: "'wdth' 100" }}>
            Intervals
          </p>
          <div className="bg-[#0b786a] h-[36px] px-[16px] rounded-[18px] flex items-center">
            <p className="font-['Roboto',sans-serif] font-bold text-[16px] text-white tracking-[0.1px]" style={{ fontVariationSettings: "'wdth' 100" }}>optional</p>
          </div>
        </div>
        <p className="font-['Roboto',sans-serif] font-normal leading-[38px] text-[#183d38] text-[26px] tracking-[0.1px] w-full" style={{ fontVariationSettings: "'wdth' 100" }}>
          Therapy will run at the base dose around the clock. Add intervals to vary the dose at specific times of day (e.g. higher during physiotherapy, lower at night).
        </p>

        {/* Day-pattern tabs */}
        <div className="flex gap-[6px] p-[4px] rounded-[12px] bg-[#fafcfb] border border-[#cedfd9] w-full">
          {DAY_PATTERNS.map(p => {
            const active = dayPattern === p.key;
            return (
              <div key={p.key} onClick={() => setDayPattern(p.key)}
                className={`flex-1 flex items-center justify-center py-[12px] rounded-[8px] cursor-pointer select-none ${active ? 'bg-[#0b786a]' : ''}`}>
                <p className={`font-['Roboto',sans-serif] font-bold text-[26px] tracking-[0.1px] whitespace-nowrap ${active ? 'text-white' : 'text-[#596d68]'}`} style={{ fontVariationSettings: "'wdth' 100" }}>
                  {p.label}
                </p>
              </div>
            );
          })}
        </div>

        <BaseDoseChart hourly={base.perHour} unit={base.unit} />

        {/* Empty state */}
        <p className="font-['Roboto',sans-serif] font-bold text-center text-[#9db3ad] text-[36px] tracking-[0.1px] my-[80px]" style={{ fontVariationSettings: "'wdth' 100" }}>
          No intervals added yet
        </p>

        {/* CTAs pinned bottom */}
        <div className="mt-auto flex flex-col gap-[24px]">
          <div onClick={onAdd} className="bg-[#0b786a] h-[100px] rounded-[50px] w-full cursor-pointer flex items-center justify-center">
            <p className="font-['Roboto',sans-serif] font-bold text-[28px] text-white tracking-[0.1px] whitespace-pre" style={{ fontVariationSettings: "'wdth' 100" }}>{`+  Add your first interval`}</p>
          </div>
          <div onClick={onSkip} className="bg-white border-2 border-[#0b786a] h-[90px] rounded-[45px] w-full cursor-pointer flex items-center justify-center">
            <p className="font-['Roboto',sans-serif] font-bold text-[#0b786a] text-[24px] tracking-[0.1px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
              Skip - use base dose only
            </p>
          </div>
        </div>
      </div>
    </WizardShell>
  );
}
