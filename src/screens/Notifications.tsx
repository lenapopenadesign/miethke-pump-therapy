import { useMemo, useState, type ReactNode } from 'react';
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

type Severity = 'critical' | 'warning' | 'routine';
type CategoryKey = 'therapy' | 'refill' | 'device' | 'admin';
type Source = 'Patient' | 'System';

/** Colour is reserved for severity — matched to the dialogue status icons. */
const SEVERITY_COLOR: Record<Severity, string> = {
  critical: '#e5484d', // red error circle
  warning: '#e8a400',  // amber warning triangle
  routine: '#0094c5',  // blue info circle
};

/** Soft background used by an ongoing card, keyed by severity. */
const TINT: Record<Severity, string> = {
  critical: '#fdecee',
  warning: '#fdf3d1',
  routine: '#e6f4f9',
};

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
  severity: Severity;
  category: CategoryKey;
  source: Source;
  title: string;
  /** Full description, revealed when a history row is opened. */
  detail?: string;
  /** Present while the condition is still valid; also drives the card styling. */
  ongoing?: boolean;
  /** Short status shown on ongoing cards / resolved history rows. */
  status?: string;
  /**
   * The single line an ongoing card carries under its headline. Ongoing alerts
   * say what to do rather than restate themselves, so they get their own copy
   * instead of the `detail` a history row expands to; without one the card
   * falls back to the timestamp and status.
   */
  summary?: string;
};

/**
 * Seeded log, newest first. Static apart from the two ongoing entries at the
 * top, which are stitched to the live reservoir state in {@link Notifications}.
 */
const EVENTS: LogEvent[] = [
  {
    id: 'silenced',
    date: '22.07.2026', time: '09:52', daysAgo: 2,
    severity: 'warning', category: 'device', source: 'Patient',
    title: 'User silenced an active audible alarm',
    ongoing: true, status: 'Muted — condition still active',
  },
  {
    id: 'low-reservoir',
    date: '22.07.2026', time: '09:41', daysAgo: 2,
    severity: 'warning', category: 'refill', source: 'System',
    // Headline and summary are both restated against the live reservoir in
    // {@link Notifications}; these are the shape of them.
    title: 'Reservoir reached alert level',
    summary: 'Refill recommended before the next session.',
    ongoing: true, status: 'Active — refill recommended',
  },
  {
    id: 'phys-bolus',
    date: '21.07.2026', time: '18:40', daysAgo: 3,
    severity: 'routine', category: 'therapy', source: 'Patient',
    title: 'Physician bolus completed',
    detail: 'Clinician-initiated bolus of 0.05 ml was delivered successfully.',
    status: 'Resolved · 18:40',
  },
  {
    id: 'pat-bolus-req',
    date: '21.07.2026', time: '18:12', daysAgo: 3,
    severity: 'routine', category: 'therapy', source: 'Patient',
    title: 'Patient bolus request',
    detail: 'Patient requested an on-demand bolus from the handset. Request was accepted and queued.',
  },
  {
    id: 'prog-3-5',
    date: '21.07.2026', time: '09:12', daysAgo: 3,
    severity: 'routine', category: 'admin', source: 'System',
    title: 'Programming step (3-5)',
    detail: 'Therapy programming sequence — step 3 of 5 recorded.',
  },
  {
    id: 'next-refill',
    date: '21.07.2026', time: '09:10', daysAgo: 3,
    severity: 'warning', category: 'refill', source: 'System',
    title: 'Non-critical alarm – Next refill date',
    detail: 'A reminder was generated for the upcoming scheduled refill.',
    status: 'Acknowledged · 09:15',
  },
  {
    id: 'telemetry',
    date: '12.07.2026', time: '14:05', daysAgo: 12,
    severity: 'routine', category: 'device', source: 'System',
    title: 'Telemetry recovery occurred',
    detail: 'The wireless link to the pump was re-established after a brief interruption.',
    status: 'Resolved · 14:05',
  },
  {
    id: 'handshake',
    date: '12.07.2026', time: '13:58', daysAgo: 12,
    severity: 'critical', category: 'device', source: 'System',
    title: 'Critical alarm – Infusion handshake error',
    detail: 'The pump reported a handshake error during an infusion cycle. The session was halted and later recovered once telemetry returned.',
    status: 'Resolved · 14:05',
  },
  {
    id: 'prog-7-7',
    date: '08.07.2026', time: '11:30', daysAgo: 16,
    severity: 'routine', category: 'admin', source: 'System',
    title: 'Programming step (7-7)',
    detail: 'Therapy programming sequence — final step 7 of 7 recorded.',
  },
  {
    id: 'status-cleared',
    date: '08.07.2026', time: '11:28', daysAgo: 16,
    severity: 'routine', category: 'admin', source: 'System',
    title: 'Event status cleared',
    detail: 'Outstanding event flags were reset by the clinician.',
  },
  {
    id: 'infusion-hist-cleared',
    date: '08.07.2026', time: '11:27', daysAgo: 16,
    severity: 'warning', category: 'admin', source: 'System',
    title: 'Non-critical alarm – Infusion history cleared',
    detail: 'Stored infusion history was cleared from the device memory.',
    status: 'Acknowledged · 11:27',
  },
  {
    id: 'counters-cleared',
    date: '30.06.2026', time: '16:44', daysAgo: 24,
    severity: 'routine', category: 'admin', source: 'System',
    title: 'Patient activation event counters cleared',
    detail: 'Patient activation counters were reset to zero.',
  },
  {
    id: 'log-cleared',
    date: '30.06.2026', time: '16:40', daysAgo: 24,
    severity: 'routine', category: 'admin', source: 'System',
    title: 'System event log cleared',
    detail: 'The full system event log was cleared from the device.',
  },
  {
    id: 'pat-bolus-done',
    date: '24.06.2026', time: '08:15', daysAgo: 30,
    severity: 'routine', category: 'therapy', source: 'Patient',
    title: 'Patient bolus completed',
    detail: 'Patient-requested bolus of 0.02 ml was delivered successfully.',
    status: 'Resolved · 08:15',
  },
];

/* ── Filter definitions ────────────────────────────────────────────────── */

const SEVERITY_CHIPS: { key: Severity | 'all'; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'critical', label: 'Critical' },
  { key: 'warning', label: 'Warnings' },
  { key: 'routine', label: 'Routine' },
];

/**
 * The chips filter by coarser groups than the badges name: a clinician looks for
 * "anything about the pump", not for the exact log category the device recorded.
 * `match` is the set of categories a group covers — between them the three
 * groups cover all four, so every event stays reachable.
 */
const CATEGORY_CHIPS: { key: string; label: string; match: CategoryKey[] }[] = [
  { key: 'all', label: 'All', match: [] },
  { key: 'therapy', label: 'Therapy', match: ['therapy'] },
  { key: 'pump', label: 'Pump & Catheter', match: ['refill'] },
  { key: 'tech', label: 'Tech & Status', match: ['device', 'admin'] },
];

/**
 * The device only retains events since it last established a connection, so the
 * log is bounded by this date rather than by a user-chosen time range.
 */
const CONNECTED_SINCE = '24.06.2026';

/* ── Small pieces ──────────────────────────────────────────────────────── */

/** Small uppercase caption naming a filter axis. */
function FilterLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className={`${FONT} font-bold text-[#6b7880] text-[22px] leading-[26px] tracking-[1px] uppercase`} style={wdth}>
      {children}
    </p>
  );
}

/**
 * Status glyph mirroring the dialogue icons (Figma 5181:174414): a red error
 * circle, an amber warning triangle, or a blue info circle — used wherever a
 * log entry's severity is shown.
 */
function SeverityIcon({ severity, size = 30 }: { severity: Severity; size?: number }) {
  const color = SEVERITY_COLOR[severity];
  const common = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none' } as const;
  if (severity === 'warning') {
    return (
      <svg {...common} className="shrink-0" aria-label="Warning">
        <path d="M12 2.8 22.4 20.6a1.6 1.6 0 0 1-1.4 2.4H3a1.6 1.6 0 0 1-1.4-2.4Z" fill={color} />
        <rect x="10.7" y="8.4" width="2.6" height="7" rx="1.3" fill="#fff" />
        <circle cx="12" cy="18.6" r="1.5" fill="#fff" />
      </svg>
    );
  }
  if (severity === 'critical') {
    return (
      <svg {...common} className="shrink-0" aria-label="Critical">
        <circle cx="12" cy="12" r="11" fill={color} />
        <rect x="10.6" y="5.4" width="2.8" height="8.6" rx="1.4" fill="#fff" />
        <circle cx="12" cy="17.6" r="1.7" fill="#fff" />
      </svg>
    );
  }
  return (
    <svg {...common} className="shrink-0" aria-label="Info">
      <circle cx="12" cy="12" r="11" fill={color} />
      <circle cx="12" cy="7" r="1.7" fill="#fff" />
      <rect x="10.6" y="10" width="2.8" height="8" rx="1.4" fill="#fff" />
    </svg>
  );
}

/** One chip style shared by both filter rows, so their states read identically. */
function FilterChip({ label, active, dot, icon, onClick }: { label: string; active: boolean; dot?: string; icon?: React.ReactNode; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`h-[56px] px-[24px] rounded-[28px] flex gap-[10px] items-center justify-center cursor-pointer shrink-0 ${
        active ? 'bg-[#0094c5]' : 'bg-white border-2 border-[#b2d6e2]'
      }`}
    >
      {icon ?? (dot && <span className="size-[16px] rounded-full shrink-0" style={{ backgroundColor: dot }} />)}
      <span className={`${FONT} font-bold text-[24px] leading-[30px] tracking-[0.1px] whitespace-nowrap ${active ? 'text-white' : 'text-[#00769e]'}`} style={wdth}>
        {label}
      </span>
    </button>
  );
}

/** Neutral area chip — colour stays reserved for the severity dot. */
function CategoryBadge({ category }: { category: CategoryKey }) {
  return (
    <span
      className={`${FONT} font-medium text-[#45483c] text-[22px] leading-[26px] tracking-[0.1px] whitespace-nowrap rounded-[16px] px-[18px] py-[6px] bg-[#eef1f4] shrink-0`}
      style={wdth}
    >
      {CATEGORY_LABEL[category]}
    </span>
  );
}

/** Disclosure chevron: points into the row at rest, down once it is open. */
function Chevron({ open, color = '#9ea8b2' }: { open: boolean; color?: string }) {
  return (
    <svg
      width="20" height="20" viewBox="0 0 20 20" fill="none"
      className={`shrink-0 transition-transform duration-200 ${open ? 'rotate-90' : ''}`}
    >
      <path d="M7.5 5L12.5 10L7.5 15" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/**
 * The pill button used across this page — the design system's `.button_master`
 * at its 72px size, filled for the primary action and outlined otherwise.
 */
function PillButton({ label, onClick, primary, icon }: { label: string; onClick: () => void; primary?: boolean; icon?: ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`h-[72px] min-w-[240px] px-[24px] rounded-[40px] flex gap-[16px] items-center justify-center cursor-pointer shrink-0 ${
        primary ? 'bg-[#0094c5]' : 'border-[3px] border-[#0094c5]'
      }`}
    >
      {icon}
      <span
        className={`${FONT} font-bold text-[24px] leading-[32px] tracking-[0.1px] whitespace-nowrap ${primary ? 'text-white' : 'text-[#0094c5]'}`}
        style={wdth}
      >
        {label}
      </span>
    </button>
  );
}

/** Arrow rising out of a tray — the export glyph on the toolbar button. */
function ExportIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" className="shrink-0">
      <path d="M12 3.5v11" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
      <path d="M7.5 8L12 3.5L16.5 8" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4 15v4.5a1.5 1.5 0 0 0 1.5 1.5h13a1.5 1.5 0 0 0 1.5-1.5V15" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

/** Body revealed when a history row is opened: description and meta line. */
function EventDetail({ event }: { event: LogEvent }) {
  return (
    <div className="flex flex-col gap-[16px] pt-[16px]">
      <p className={`${FONT} font-normal text-[#6b7880] text-[24px] leading-[34px] tracking-[0.1px]`} style={wdth}>
        {event.detail}
      </p>
      <p className={`${FONT} font-normal text-[#9ea8b2] text-[22px] leading-[28px] tracking-[0.1px]`} style={wdth}>
        {event.source}
        {event.status ? ` · ${event.status}` : ''}
      </p>
    </div>
  );
}

/* ── Ongoing card (still-valid alerts) ─────────────────────────────────── */

/**
 * A still-valid alert, drawn as the design system's `dialogue_long` card: a
 * tinted panel carrying the severity icon, the headline, one line of context
 * and — where the alert can be acted on — its actions, all in view at once.
 * There is nothing held back, so unlike a history row it has no chevron.
 */
function OngoingCard({ event, actions }: { event: LogEvent; actions?: ReactNode }) {
  return (
    <div
      className="rounded-[24px] w-full p-[24px] flex flex-col gap-[16px] overflow-hidden"
      style={{ backgroundColor: TINT[event.severity] }}
    >
      <div className="flex gap-[24px] items-start w-full">
        <SeverityIcon severity={event.severity} size={40} />
        <div className="flex-1 min-w-px flex flex-col gap-[24px] justify-center pt-[8px]">
          <p className={`${FONT} font-bold text-[#45483c] text-[28px] leading-[32px] tracking-[0.1px]`} style={wdth}>
            {event.title}
          </p>
          <p className={`${FONT} font-normal text-[#45483c] text-[24px] leading-[32px] tracking-[0.1px]`} style={wdth}>
            {event.summary ?? `${event.date} ${event.time} · ${event.status}`}
          </p>
        </div>
      </div>
      {actions && <div className="flex gap-[24px] items-start justify-end w-full">{actions}</div>}
    </div>
  );
}

/* ── History row (flat, resolved) ──────────────────────────────────────── */

function HistoryRow({ event, open, onToggle }: { event: LogEvent; open: boolean; onToggle: () => void }) {
  return (
    <div className="border-b border-[#e3e5e8] w-full">
      <button onClick={onToggle} className="flex gap-[24px] items-center w-full py-[16px] text-left cursor-pointer">
        <p className={`${FONT} font-normal text-[#9ea8b2] text-[22px] leading-[28px] tracking-[0.1px] w-[220px] shrink-0`} style={wdth}>
          {event.date}&nbsp;&nbsp;{event.time}
        </p>
        <SeverityIcon severity={event.severity} size={32} />
        <p className={`${FONT} font-bold text-[#45483c] text-[26px] leading-[32px] tracking-[0.1px] flex-1 min-w-px`} style={wdth}>
          {event.title}
        </p>
        <CategoryBadge category={event.category} />
        <Chevron open={open} />
      </button>
      {open && (
        <div className="pl-[300px] pb-[20px] pr-[44px]">
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
  const { alertLevelMl, volMlPerDay, setFlowMode } = useTherapy();

  const [severity, setSeverity] = useState<Severity | 'all'>('all');
  const [category, setCategory] = useState('all');
  const [openId, setOpenId] = useState<string | null>(null);

  const alertPct = Math.round((alertLevelMl / RESERVOIR_ML) * 100);
  // The alarm has already fired, so what is left to run down is the volume below
  // the alert level — that, not the time to the alert, is "estimated empty".
  const daysToEmpty = volMlPerDay > 0 ? Math.floor(alertLevelMl / volMlPerDay) : null;

  const startRefill = () => { setFlowMode('refill'); navigate('refill-filling'); };
  // The alert level lives on the Refill Alert step of the refill wizard.
  const adjustAlert = () => { setFlowMode('refill'); navigate('refill-alert'); };

  // Splice the live reservoir figures into the seeded low-reservoir alert.
  const events = useMemo<LogEvent[]>(() => EVENTS.map(e =>
    e.id === 'low-reservoir'
      ? {
          ...e,
          title: `Reservoir reached alert level — ${alertLevelMl} ml (${alertPct} %)`,
          summary: `Refill recommended before the next session.${daysToEmpty != null ? ` Estimated empty in ~${daysToEmpty} days.` : ''}`,
        }
      : e,
  ), [alertLevelMl, alertPct, daysToEmpty]);

  const categoryMatch = CATEGORY_CHIPS.find(c => c.key === category)?.match ?? [];
  const visible = events.filter(e =>
    (severity === 'all' || e.severity === severity) &&
    (category === 'all' || categoryMatch.includes(e.category)),
  );
  const ongoing = visible.filter(e => e.ongoing);
  const history = visible.filter(e => !e.ongoing);

  const toggle = (id: string) => setOpenId(cur => (cur === id ? null : id));

  // Export hands back exactly what is on screen — filters and all — as a CSV to
  // file with the patient's record.
  const exportLogs = () => {
    const rows = [
      ['Date', 'Time', 'Severity', 'Category', 'Source', 'Event', 'Status'],
      ...visible.map(e => [e.date, e.time, e.severity, CATEGORY_LABEL[e.category], e.source, e.title, e.status ?? '']),
    ];
    const csv = rows.map(r => r.map(c => `"${c.replace(/"/g, '""')}"`).join(',')).join('\r\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = 'pump-logs.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <DetailShell
      navTab="notifications"
      icon={<img alt="" src={imgBell} className="size-[56px] shrink-0 block" />}
      title="Logs"
      headerRight={
        <div className="flex flex-col gap-[4px] items-end text-right">
          <p className={`${FONT} font-bold text-[#45483c] text-[26px] leading-[32px] tracking-[0.1px] whitespace-nowrap`} style={wdth}>
            {visible.length} {visible.length === 1 ? 'event' : 'events'}
          </p>
          <p className={`${FONT} font-normal text-[#9ea8b2] text-[22px] leading-[28px] tracking-[0.1px] whitespace-nowrap`} style={wdth}>
            Logs since last connection on {CONNECTED_SINCE}
          </p>
        </div>
      }
    >
      <div className="flex flex-col gap-[32px] items-start w-full">
        {/* ── Filter toolbar — the two filter axes, export pinned right ── */}
        <div className="w-full flex gap-[40px] items-start">
          <div className="flex-1 min-w-px flex flex-col gap-[20px]">
            <div className="flex flex-col gap-[12px]">
              <FilterLabel>Severity</FilterLabel>
              <div className="flex gap-[16px] items-center flex-wrap">
                {SEVERITY_CHIPS.map(c => {
                  const active = severity === c.key;
                  return (
                    <FilterChip
                      key={c.key}
                      label={c.label}
                      // Colour icon as a legend on inactive chips; the solid fill marks the active one.
                      icon={c.key !== 'all' && !active ? <SeverityIcon severity={c.key} size={26} /> : undefined}
                      active={active}
                      onClick={() => setSeverity(c.key)}
                    />
                  );
                })}
              </div>
            </div>

            <div className="flex flex-col gap-[12px]">
              <FilterLabel>Category</FilterLabel>
              <div className="flex gap-[16px] items-center flex-wrap">
                {CATEGORY_CHIPS.map(c => (
                  <FilterChip
                    key={c.key}
                    label={c.label}
                    active={category === c.key}
                    onClick={() => setCategory(c.key)}
                  />
                ))}
              </div>
            </div>
          </div>

          <PillButton label="Export logs" primary icon={<ExportIcon />} onClick={exportLogs} />
        </div>

        {/* ── Log entries — set apart from the filters by a hairline ── */}
        <div className="w-full border-t border-[#e3e5e8] pt-[32px] flex flex-col gap-[24px]">
        {/* Ongoing — still-valid alerts, visually distinct from history */}
        {ongoing.length > 0 && (
          <div className="flex flex-col gap-[16px] w-full">
            <p className={`${FONT} font-bold text-[#6b7880] text-[24px] leading-[30px] tracking-[0.1px]`} style={wdth}>
              Active now
            </p>
            {ongoing.map(e => (
              <OngoingCard
                key={e.id}
                event={e}
                actions={e.id === 'low-reservoir' ? (
                  <>
                    <PillButton label="Adjust threshold" onClick={adjustAlert} />
                    <PillButton label="Start refill" primary onClick={startRefill} />
                  </>
                ) : undefined}
              />
            ))}
          </div>
        )}

        {/* History — flat, resolved */}
        {history.length > 0 && (
          <div className="flex flex-col w-full">
            {ongoing.length > 0 && (
              <p className={`${FONT} font-bold text-[#6b7880] text-[24px] leading-[30px] tracking-[0.1px] mb-[8px]`} style={wdth}>
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
      </div>
    </DetailShell>
  );
}
