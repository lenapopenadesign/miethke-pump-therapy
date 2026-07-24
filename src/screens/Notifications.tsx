import { useMemo, useState } from 'react';
import { useNavigate } from '../navigation';
import { useTherapy, RESERVOIR_ML } from '../therapy';
import { DetailShell } from '../components/DetailShell';

const imgBell = "/icons/nav-notifications.svg";

const wdth = { fontVariationSettings: "'wdth' 100" } as const;
const FONT = "font-['Roboto',sans-serif]";

/* ── Domain model ──────────────────────────────────────────────────────────
 * A single flat, chronological event log (Figma 9794:39961) with two filter
 * axes — severity and category — plus a time range. Some events are still
 * *ongoing* (the condition has not cleared): those render as tinted cards that
 * stand apart from the flat, resolved history rows below them.
 */

type Tone = 'critical' | 'warning' | 'success' | 'patient' | 'routine';
type Severity = 'critical' | 'warning' | 'routine';
type CategoryKey = 'therapy' | 'refill' | 'device' | 'admin';
type Source = 'Patient' | 'System';

/** Dot colour per tone. */
const TONE: Record<Tone, string> = {
  critical: '#e5484d',
  warning: '#e8a400',
  success: '#24ab5e',
  patient: '#0094c5',
  routine: '#9ea8b2',
};

/** Soft background used by an ongoing card of each tone. */
const TINT: Record<Tone, string> = {
  critical: '#fdecee',
  warning: '#fdf3d1',
  success: '#e7f6ee',
  patient: '#e6f4f9',
  routine: '#f1f2f4',
};

/** The three severity chips group the five dot tones. */
const severityOf = (t: Tone): Severity =>
  t === 'critical' ? 'critical' : t === 'warning' ? 'warning' : 'routine';

const CATEGORY_LABEL: Record<CategoryKey, string> = {
  therapy: 'Therapy & bolus',
  refill: 'Refill & reservoir',
  device: 'Device & connection',
  admin: 'Admin',
};

type LogEvent = {
  id: string;
  date: string;
  time: string;
  daysAgo: number;
  tone: Tone;
  category: CategoryKey;
  source: Source;
  title: string;
  detail: string;
  /** Present while the condition is still valid; also drives the card styling. */
  ongoing?: boolean;
  /** Short status shown on ongoing cards / resolved history rows. */
  status?: string;
};

/**
 * Seeded log, newest first. Static apart from the two ongoing entries at the
 * top, which are stitched to the live reservoir state in {@link Notifications}.
 */
const EVENTS: LogEvent[] = [
  {
    id: 'silenced',
    date: '22.07.2026', time: '09:52', daysAgo: 2,
    tone: 'patient', category: 'device', source: 'Patient',
    title: 'User silenced an active audible alarm',
    detail: 'The audible alarm was muted on the device. The condition that raised it has not yet cleared, so the alert stays active until the reservoir is refilled.',
    ongoing: true, status: 'Muted — condition still active',
  },
  {
    id: 'low-reservoir',
    date: '22.07.2026', time: '09:41', daysAgo: 2,
    tone: 'warning', category: 'refill', source: 'System',
    title: 'Non-critical alarm – Low reservoir',
    detail: 'Reservoir reached the configured alert level. A refill is recommended before the next session.',
    ongoing: true, status: 'Active — refill recommended',
  },
  {
    id: 'phys-bolus',
    date: '21.07.2026', time: '18:40', daysAgo: 3,
    tone: 'success', category: 'therapy', source: 'Patient',
    title: 'Physician bolus completed',
    detail: 'Clinician-initiated bolus of 0.05 ml was delivered successfully.',
    status: 'Resolved · 18:40',
  },
  {
    id: 'pat-bolus-req',
    date: '21.07.2026', time: '18:12', daysAgo: 3,
    tone: 'patient', category: 'therapy', source: 'Patient',
    title: 'Patient bolus request',
    detail: 'Patient requested an on-demand bolus from the handset. Request was accepted and queued.',
  },
  {
    id: 'prog-3-5',
    date: '21.07.2026', time: '09:12', daysAgo: 3,
    tone: 'routine', category: 'admin', source: 'System',
    title: 'Programming step (3-5)',
    detail: 'Therapy programming sequence — step 3 of 5 recorded.',
  },
  {
    id: 'next-refill',
    date: '21.07.2026', time: '09:10', daysAgo: 3,
    tone: 'warning', category: 'refill', source: 'System',
    title: 'Non-critical alarm – Next refill date',
    detail: 'A reminder was generated for the upcoming scheduled refill.',
    status: 'Acknowledged · 09:15',
  },
  {
    id: 'telemetry',
    date: '12.07.2026', time: '14:05', daysAgo: 12,
    tone: 'success', category: 'device', source: 'System',
    title: 'Telemetry recovery occurred',
    detail: 'The wireless link to the pump was re-established after a brief interruption.',
    status: 'Resolved · 14:05',
  },
  {
    id: 'handshake',
    date: '12.07.2026', time: '13:58', daysAgo: 12,
    tone: 'critical', category: 'device', source: 'System',
    title: 'Critical alarm – Infusion handshake error',
    detail: 'The pump reported a handshake error during an infusion cycle. The session was halted and later recovered once telemetry returned.',
    status: 'Resolved · 14:05',
  },
  {
    id: 'prog-7-7',
    date: '08.07.2026', time: '11:30', daysAgo: 16,
    tone: 'routine', category: 'admin', source: 'System',
    title: 'Programming step (7-7)',
    detail: 'Therapy programming sequence — final step 7 of 7 recorded.',
  },
  {
    id: 'status-cleared',
    date: '08.07.2026', time: '11:28', daysAgo: 16,
    tone: 'routine', category: 'admin', source: 'System',
    title: 'Event status cleared',
    detail: 'Outstanding event flags were reset by the clinician.',
  },
  {
    id: 'infusion-hist-cleared',
    date: '08.07.2026', time: '11:27', daysAgo: 16,
    tone: 'warning', category: 'admin', source: 'System',
    title: 'Non-critical alarm – Infusion history cleared',
    detail: 'Stored infusion history was cleared from the device memory.',
    status: 'Acknowledged · 11:27',
  },
  {
    id: 'counters-cleared',
    date: '30.06.2026', time: '16:44', daysAgo: 24,
    tone: 'routine', category: 'admin', source: 'System',
    title: 'Patient activation event counters cleared',
    detail: 'Patient activation counters were reset to zero.',
  },
  {
    id: 'log-cleared',
    date: '30.06.2026', time: '16:40', daysAgo: 24,
    tone: 'routine', category: 'admin', source: 'System',
    title: 'System event log cleared',
    detail: 'The full system event log was cleared from the device.',
  },
  {
    id: 'pat-bolus-done',
    date: '24.06.2026', time: '08:15', daysAgo: 30,
    tone: 'success', category: 'therapy', source: 'Patient',
    title: 'Patient bolus completed',
    detail: 'Patient-requested bolus of 0.02 ml was delivered successfully.',
    status: 'Resolved · 08:15',
  },
];

/* ── Filter definitions ────────────────────────────────────────────────── */

const SEVERITY_CHIPS: { key: Severity | 'all'; label: string; dot?: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'critical', label: 'Critical', dot: TONE.critical },
  { key: 'warning', label: 'Warnings', dot: TONE.warning },
  { key: 'routine', label: 'Routine', dot: TONE.routine },
];

const CATEGORY_CHIPS: { key: CategoryKey | 'all'; label: string }[] = [
  { key: 'all', label: 'All categories' },
  { key: 'therapy', label: 'Therapy & bolus' },
  { key: 'refill', label: 'Refill & reservoir' },
  { key: 'device', label: 'Device & connection' },
  { key: 'admin', label: 'Admin' },
];

const RANGES = [
  { label: 'Last 7 days', days: 7 },
  { label: 'Last 30 days', days: 30 },
  { label: 'Last 90 days', days: 90 },
  { label: 'All time', days: Infinity },
] as const;

/* ── Small pieces ──────────────────────────────────────────────────────── */

function SeverityChip({ label, active, dot, onClick }: { label: string; active: boolean; dot?: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`h-[56px] px-[24px] rounded-[28px] flex gap-[10px] items-center justify-center cursor-pointer shrink-0 ${
        active ? 'bg-[#0094c5]' : 'bg-white border-2 border-[#b2d6e2]'
      }`}
    >
      {dot && <span className="size-[14px] rounded-full shrink-0" style={{ backgroundColor: dot }} />}
      <span className={`${FONT} font-bold text-[22px] leading-[28px] tracking-[0.1px] whitespace-nowrap ${active ? 'text-white' : 'text-[#00769e]'}`} style={wdth}>
        {label}
      </span>
    </button>
  );
}

function CategoryChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`h-[44px] px-[20px] rounded-[22px] flex items-center justify-center cursor-pointer shrink-0 ${
        active ? 'bg-[#e6f4f9]' : 'bg-white border-2 border-[#b2d6e2]'
      }`}
    >
      <span className={`${FONT} font-bold text-[#00769e] text-[20px] leading-[26px] tracking-[0.1px] whitespace-nowrap`} style={wdth}>
        {label}
      </span>
    </button>
  );
}

function SourceBadge({ source }: { source: Source }) {
  const patient = source === 'Patient';
  return (
    <span
      className={`${FONT} font-normal text-[18px] leading-[24px] tracking-[0.1px] whitespace-nowrap rounded-[14px] px-[16px] py-[4px] shrink-0 ${
        patient ? 'bg-[#e6f4f9] text-[#00769e]' : 'bg-[#f4f5f6] text-[#45483c]'
      }`}
      style={wdth}
    >
      {source}
    </span>
  );
}

function Chevron({ open, color = '#9ea8b2' }: { open: boolean; color?: string }) {
  return (
    <svg
      width="20" height="20" viewBox="0 0 20 20" fill="none"
      className={`shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
    >
      <path d="M5 7.5L10 12.5L15 7.5" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Shared expanded body: description, meta line, and any extra actions. */
function EventDetail({ event, extra }: { event: LogEvent; extra?: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-[16px] pt-[16px]">
      <p className={`${FONT} font-normal text-[#6b7880] text-[22px] leading-[32px] tracking-[0.1px]`} style={wdth}>
        {event.detail}
      </p>
      <p className={`${FONT} font-normal text-[#9ea8b2] text-[19px] leading-[26px] tracking-[0.1px]`} style={wdth}>
        {CATEGORY_LABEL[event.category]} · {event.source}
        {event.status && !event.ongoing ? ` · ${event.status}` : ''}
      </p>
      {extra}
    </div>
  );
}

/* ── Ongoing card (still-valid alerts) ─────────────────────────────────── */

function OngoingCard({ event, open, onToggle, actions }: { event: LogEvent; open: boolean; onToggle: () => void; actions?: React.ReactNode }) {
  const color = TONE[event.tone];
  return (
    <div className="rounded-[24px] w-full overflow-hidden flex" style={{ backgroundColor: TINT[event.tone] }}>
      <div className="w-[8px] shrink-0" style={{ backgroundColor: color }} />
      <div className="flex-1 min-w-px p-[24px]">
        <button onClick={onToggle} className="flex gap-[20px] items-start w-full text-left cursor-pointer">
          <span className="size-[20px] rounded-full shrink-0 mt-[6px]" style={{ backgroundColor: color }} />
          <div className="flex-1 min-w-px flex flex-col gap-[12px]">
            <div className="flex items-center gap-[16px] flex-wrap">
              <p className={`${FONT} font-bold text-[#45483c] text-[28px] leading-[32px] tracking-[0.1px]`} style={wdth}>
                {event.title}
              </p>
              {/* Ongoing pill with a pulsing dot */}
              <span className="flex items-center gap-[8px] rounded-full border-2 px-[14px] py-[4px] bg-white/70 shrink-0" style={{ borderColor: color }}>
                <span className="size-[10px] rounded-full animate-pulse" style={{ backgroundColor: color }} />
                <span className={`${FONT} font-bold text-[18px] leading-[22px] tracking-[0.1px]`} style={{ ...wdth, color }}>Ongoing</span>
              </span>
            </div>
            <p className={`${FONT} font-normal text-[#6b7880] text-[20px] leading-[28px] tracking-[0.1px]`} style={wdth}>
              {event.date} {event.time} · {event.status}
            </p>
          </div>
          <Chevron open={open} color={color} />
        </button>
        {open && <EventDetail event={event} extra={actions} />}
      </div>
    </div>
  );
}

/* ── History row (flat, resolved) ──────────────────────────────────────── */

function HistoryRow({ event, open, onToggle }: { event: LogEvent; open: boolean; onToggle: () => void }) {
  return (
    <div className="border-b border-[#e3e5e8] w-full">
      <button onClick={onToggle} className="flex gap-[24px] items-center w-full py-[14px] text-left cursor-pointer">
        <p className={`${FONT} font-normal text-[#9ea8b2] text-[20px] leading-[28px] tracking-[0.1px] w-[210px] shrink-0`} style={wdth}>
          {event.date}&nbsp;&nbsp;{event.time}
        </p>
        <span className="size-[12px] rounded-full shrink-0" style={{ backgroundColor: TONE[event.tone] }} />
        <p className={`${FONT} font-bold text-[#45483c] text-[22px] leading-[28px] tracking-[0.1px] flex-1 min-w-px`} style={wdth}>
          {event.title}
        </p>
        <SourceBadge source={event.source} />
        <Chevron open={open} />
      </button>
      {open && (
        <div className="pl-[234px] pb-[20px] pr-[44px]">
          <EventDetail event={event} />
        </div>
      )}
    </div>
  );
}

/**
 * Logs page (Figma 9794:39961): a filterable, chronological event log reached
 * from the bottom navigation. Severity + category chips and a time-range toggle
 * narrow the list; every row opens to reveal its detail. Ongoing alerts (still
 * valid) sit above the resolved history as tinted cards, and the top one mirrors
 * the live reservoir state — offering the same refill actions as before.
 */
export function Notifications() {
  const navigate = useNavigate();
  const { alertLevelMl, daysToRefill, setFlowMode } = useTherapy();

  const [severity, setSeverity] = useState<Severity | 'all'>('all');
  const [category, setCategory] = useState<CategoryKey | 'all'>('all');
  const [rangeIdx, setRangeIdx] = useState(1); // Last 30 days
  const [openId, setOpenId] = useState<string | null>(null);

  const range = RANGES[rangeIdx];
  const alertPct = Math.round((alertLevelMl / RESERVOIR_ML) * 100);

  const startRefill = () => { setFlowMode('refill'); navigate('refill-filling'); };
  // The alert level lives on the Refill Alert step of the refill wizard.
  const adjustAlert = () => { setFlowMode('refill'); navigate('refill-alert'); };

  // Splice the live reservoir figures into the seeded low-reservoir alert.
  const events = useMemo<LogEvent[]>(() => EVENTS.map(e =>
    e.id === 'low-reservoir'
      ? {
          ...e,
          title: `Non-critical alarm – Reservoir at alert level (${alertLevelMl} ml · ${alertPct} %)`,
          detail: `Reservoir reached the configured alert level of ${alertLevelMl} ml (${alertPct} %). A refill is recommended before the next session.${daysToRefill != null ? ` At the current rate the therapy lasts ≈ ${daysToRefill} days.` : ''}`,
        }
      : e,
  ), [alertLevelMl, alertPct, daysToRefill]);

  const visible = events.filter(e =>
    (severity === 'all' || severityOf(e.tone) === severity) &&
    (category === 'all' || e.category === category) &&
    e.daysAgo <= range.days,
  );
  const ongoing = visible.filter(e => e.ongoing);
  const history = visible.filter(e => !e.ongoing);

  const toggle = (id: string) => setOpenId(cur => (cur === id ? null : id));

  return (
    <DetailShell
      navTab="notifications"
      icon={<img alt="" src={imgBell} className="size-[56px] shrink-0 block" />}
      title="Logs"
    >
      <div className="flex flex-col gap-[24px] items-start w-full">
        {/* Severity filter + time range */}
        <div className="flex items-center justify-between w-full gap-[16px]">
          <div className="flex gap-[16px] items-center">
            {SEVERITY_CHIPS.map(c => (
              <SeverityChip
                key={c.key}
                label={c.label}
                dot={c.dot}
                active={severity === c.key}
                onClick={() => setSeverity(c.key)}
              />
            ))}
          </div>
          <button
            onClick={() => setRangeIdx(i => (i + 1) % RANGES.length)}
            className="h-[56px] px-[24px] rounded-[28px] flex gap-[10px] items-center justify-center cursor-pointer shrink-0 bg-white border-2 border-[#b2d6e2]"
          >
            <span className={`${FONT} font-bold text-[#00769e] text-[22px] leading-[28px] tracking-[0.1px] whitespace-nowrap`} style={wdth}>
              {range.label}
            </span>
            <Chevron open={false} color="#00769e" />
          </button>
        </div>

        {/* Category filter */}
        <div className="flex gap-[12px] items-center w-full flex-wrap">
          {CATEGORY_CHIPS.map(c => (
            <CategoryChip
              key={c.key}
              label={c.label}
              active={category === c.key}
              onClick={() => setCategory(c.key)}
            />
          ))}
        </div>

        {/* Count + sync line */}
        <p className={`${FONT} font-normal text-[#9ea8b2] text-[20px] leading-[28px] tracking-[0.1px] w-full`} style={wdth}>
          {visible.length} {visible.length === 1 ? 'event' : 'events'} · Last synchronized: Today, 09:41
        </p>

        {/* Ongoing — still-valid alerts, visually distinct from history */}
        {ongoing.length > 0 && (
          <div className="flex flex-col gap-[16px] w-full">
            <p className={`${FONT} font-bold text-[#6b7880] text-[22px] leading-[28px] tracking-[0.1px]`} style={wdth}>
              Active now
            </p>
            {ongoing.map(e => (
              <OngoingCard
                key={e.id}
                event={e}
                open={openId === e.id}
                onToggle={() => toggle(e.id)}
                actions={e.id === 'low-reservoir' ? (
                  <div className="flex gap-[16px] items-center flex-wrap pt-[4px]">
                    <button onClick={adjustAlert} className="h-[64px] px-[24px] rounded-[36px] border-[3px] border-[#0094c5] bg-transparent cursor-pointer">
                      <span className={`${FONT} font-bold text-[#0094c5] text-[22px] leading-[28px] tracking-[0.1px]`} style={wdth}>Adjust alert level</span>
                    </button>
                    <button onClick={startRefill} className="h-[64px] px-[24px] rounded-[36px] bg-[#0094c5] cursor-pointer">
                      <span className={`${FONT} font-bold text-white text-[22px] leading-[28px] tracking-[0.1px]`} style={wdth}>Start refill</span>
                    </button>
                  </div>
                ) : undefined}
              />
            ))}
          </div>
        )}

        {/* History — flat, resolved */}
        {history.length > 0 && (
          <div className="flex flex-col w-full">
            {ongoing.length > 0 && (
              <p className={`${FONT} font-bold text-[#6b7880] text-[22px] leading-[28px] tracking-[0.1px] mb-[8px]`} style={wdth}>
                History
              </p>
            )}
            {history.map(e => (
              <HistoryRow key={e.id} event={e} open={openId === e.id} onToggle={() => toggle(e.id)} />
            ))}
          </div>
        )}

        {visible.length === 0 && (
          <p className={`${FONT} font-normal text-[#9ea8b2] text-[24px] leading-[32px] tracking-[0.1px] py-[40px] w-full text-center`} style={wdth}>
            No events match these filters.
          </p>
        )}
      </div>
    </DetailShell>
  );
}
