import type { ReactNode } from 'react';
import { useNavigate } from '../navigation';
import { useTherapy, RESERVOIR_ML } from '../therapy';
import { DetailShell } from '../components/DetailShell';

const imgBell = "/icons/nav-notifications.svg";
const imgWarning = "/icons/notif-warning.svg";
const imgSuccess = "/icons/notif-success.svg";
const imgWarningMuted = "/icons/notif-warning-muted.svg";
const imgInfo = "/icons/notif-info.svg";

const wdth = { fontVariationSettings: "'wdth' 100" } as const;
const FONT = "font-['Roboto',sans-serif]";

/** Seeded history, newest group first. Static — this is a prototype log. */
const HISTORY: { date: string; items: { kind: 'success' | 'warning' | 'info'; title: string; body: string; time: string }[] }[] = [
  {
    date: 'Yesterday',
    items: [
      { kind: 'success', title: 'Bolus delivered', body: 'Clinician bolus of 0.05 ml completed.', time: '18:40' },
      { kind: 'success', title: 'Refill completed', body: 'Reservoir refilled to 40 ml.', time: '09:12' },
    ],
  },
  {
    date: '12.07.2026',
    items: [
      { kind: 'success', title: 'Connection restored', body: 'Pump reconnected after 7 minutes.', time: '14:05' },
      { kind: 'warning', title: 'Connection to pump lost', body: 'Connection interrupted during a session.', time: '13:58' },
    ],
  },
  {
    date: '08.07.2026',
    items: [
      { kind: 'info', title: 'Therapy profile updated', body: 'Dosing schedule adjusted by Dr. Meyer.', time: '11:30' },
    ],
  },
];

function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <p className={`${FONT} font-bold text-[#00769e] text-[32px] leading-[48px] tracking-[0.1px] w-full`} style={wdth}>
      {children}
    </p>
  );
}

/** Status glyph on a history row. 'info' is the circle plus its "i", per Figma. */
function StatusIcon({ kind }: { kind: 'success' | 'warning' | 'info' }) {
  if (kind === 'info') {
    return (
      <div className="h-[40px] w-[41px] shrink-0 relative opacity-40">
        <img alt="" src={imgInfo} className="absolute left-0 top-0 size-[40px]" />
        <p className={`${FONT} absolute left-[16.5px] top-[5px] font-bold text-[26px] text-white`} style={wdth}>i</p>
      </div>
    );
  }
  return <img alt="" src={kind === 'success' ? imgSuccess : imgWarningMuted} className="h-[40px] w-[41px] shrink-0 block" />;
}

function HistoryRow({ kind, title, body, time }: { kind: 'success' | 'warning' | 'info'; title: string; body: string; time: string }) {
  return (
    <div className="bg-[#f4f5f6] rounded-[24px] p-[24px] w-full">
      <div className="flex gap-[24px] items-start w-full">
        <StatusIcon kind={kind} />
        <div className="flex-1 min-w-px flex flex-col gap-[24px] pt-[8px] tracking-[0.1px] leading-[32px]">
          <p className={`${FONT} font-bold text-[#45483c] text-[28px]`} style={wdth}>{title}</p>
          <p className={`${FONT} font-normal text-[#9ea8b2] text-[24px]`} style={wdth}>{body}</p>
        </div>
        <p className={`${FONT} font-normal text-[#9ea8b2] text-[20px] leading-[28px] tracking-[0.1px] whitespace-nowrap shrink-0`} style={wdth}>
          {time}
        </p>
      </div>
    </div>
  );
}

/**
 * Notifications page (Figma 9680:47858): an actionable "Needs attention" alert
 * above a read-only history log, reached from the bottom navigation. The alert
 * mirrors the live reservoir state — the threshold set on the Refill Alert step
 * and how long the current therapy will keep running before it trips.
 */
export function Notifications() {
  const navigate = useNavigate();
  const { alertLevelMl, daysToRefill, setFlowMode } = useTherapy();

  const alertPct = Math.round((alertLevelMl / RESERVOIR_ML) * 100);
  const startRefill = () => { setFlowMode('refill'); navigate('refill-filling'); };
  // The alert level lives on the Refill Alert step of the refill wizard, so
  // adjusting it means entering that flow.
  const adjustAlert = () => { setFlowMode('refill'); navigate('refill-alert'); };

  return (
    <DetailShell
      navTab="notifications"
      icon={<img alt="" src={imgBell} className="size-[56px] shrink-0 block" />}
      title="Notifications"
    >
      <div className="flex flex-col gap-[24px] items-center w-full">
        <SectionTitle>Needs attention</SectionTitle>

        {/* Live reservoir alert */}
        <div className="bg-[#fdf3d1] rounded-[24px] p-[24px] w-full flex flex-col gap-[16px]">
          <div className="flex gap-[24px] items-start w-full">
            <img alt="" src={imgWarning} className="h-[40px] w-[41px] shrink-0 block" />
            <div className="flex-1 min-w-px flex flex-col gap-[24px] pt-[8px] text-[#45483c] tracking-[0.1px] leading-[32px]">
              <p className={`${FONT} font-bold text-[28px]`} style={wdth}>
                Reservoir reached alert level — {alertLevelMl} ml ({alertPct} %)
              </p>
              <p className={`${FONT} font-normal text-[24px]`} style={wdth}>
                Refill recommended before the next session.
                {daysToRefill != null && ` Lasts ≈ ${daysToRefill} days at the current rate.`}
              </p>
            </div>
            <p className={`${FONT} font-normal text-[#45483c] text-[20px] leading-[24px] tracking-[0.1px] whitespace-nowrap shrink-0`} style={wdth}>
              Today · 09:41
            </p>
          </div>
          <div className="flex gap-[24px] items-center justify-end w-full">
            <button
              onClick={adjustAlert}
              className="h-[72px] min-w-[240px] px-[24px] rounded-[40px] border-[3px] border-[#0094c5] bg-transparent cursor-pointer"
            >
              <span className={`${FONT} font-bold text-[#0094c5] text-[24px] leading-[32px] tracking-[0.1px]`} style={wdth}>
                Adjust alert level
              </span>
            </button>
            <button
              onClick={startRefill}
              className="h-[72px] min-w-[240px] px-[24px] rounded-[40px] bg-[#0094c5] cursor-pointer"
            >
              <span className={`${FONT} font-bold text-white text-[24px] leading-[32px] tracking-[0.1px]`} style={wdth}>
                Start refill
              </span>
            </button>
          </div>
        </div>

        <SectionTitle>History</SectionTitle>

        {HISTORY.map(group => (
          <div key={group.date} className="flex flex-col gap-[24px] w-full">
            <p className={`${FONT} font-bold text-[#6b7880] text-[22px] w-full`} style={wdth}>{group.date}</p>
            {group.items.map(item => (
              <HistoryRow key={item.title + item.time} {...item} />
            ))}
          </div>
        ))}
      </div>
    </DetailShell>
  );
}
