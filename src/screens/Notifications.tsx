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
  critical: '#cc5457', // red error circle
  warning: '#b3850e',  // amber warning triangle
  routine: '#0b786a',  // blue info circle
};

/** Soft background used by an ongoing card, keyed by severity. */
const TINT: Record<Severity, string> = {
  critical: '#f7d7d5',
  warning: '#fdf3d1',
  routine: '#f5fcf9',
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
    date: '22 Jul 2026', time: '09:52', daysAgo: 2,
    severity: 'warning', category: 'device', source: 'Patient',
    title: 'User silenced an active audible alarm',
    ongoing: true, status: 'Muted — condition still active',
  },
  {
    id: 'low-reservoir',
    date: '22 Jul 2026', time: '09:41', daysAgo: 2,
    severity: 'warning', category: 'refill', source: 'System',
    // Headline and summary are both restated against the live reservoir in
    // {@link Notifications}; these are the shape of them.
    title: 'Reservoir reached alert level',
    summary: 'Refill recommended before the next session.',
    ongoing: true, status: 'Active — refill recommended',
  },
  {
    id: 'phys-bolus',
    date: '21 Jul 2026', time: '18:40', daysAgo: 3,
    severity: 'routine', category: 'therapy', source: 'Patient',
    title: 'Physician bolus completed',
    detail: 'Clinician-initiated bolus of 0.05 ml was delivered successfully.',
    status: 'Resolved · 18:40',
  },
  {
    id: 'pat-bolus-req',
    date: '21 Jul 2026', time: '18:12', daysAgo: 3,
    severity: 'routine', category: 'therapy', source: 'Patient',
    title: 'Patient bolus request',
    detail: 'Patient requested an on-demand bolus from the handset. Request was accepted and queued.',
  },
  {
    id: 'prog-3-5',
    date: '21 Jul 2026', time: '09:12', daysAgo: 3,
    severity: 'routine', category: 'admin', source: 'System',
    title: 'Programming step (3-5)',
    detail: 'Therapy programming sequence — step 3 of 5 recorded.',
  },
  {
    id: 'next-refill',
    date: '21 Jul 2026', time: '09:10', daysAgo: 3,
    severity: 'warning', category: 'refill', source: 'System',
    title: 'Non-critical alarm – Next refill date',
    detail: 'A reminder was generated for the upcoming scheduled refill.',
    status: 'Acknowledged · 09:15',
  },
  {
    id: 'telemetry',
    date: '12 Jul 2026', time: '14:05', daysAgo: 12,
    severity: 'routine', category: 'device', source: 'System',
    title: 'Telemetry recovery occurred',
    detail: 'The wireless link to the pump was re-established after a brief interruption.',
    status: 'Resolved · 14:05',
  },
  {
    id: 'handshake',
    date: '12 Jul 2026', time: '13:58', daysAgo: 12,
    severity: 'critical', category: 'device', source: 'System',
    title: 'Critical alarm – Infusion handshake error',
    detail: 'The pump reported a handshake error during an infusion cycle. The session was halted and later recovered once telemetry returned.',
    status: 'Resolved · 14:05',
  },
  {
    id: 'prog-7-7',
    date: '08 Jul 2026', time: '11:30', daysAgo: 16,
    severity: 'routine', category: 'admin', source: 'System',
    title: 'Programming step (7-7)',
    detail: 'Therapy programming sequence — final step 7 of 7 recorded.',
  },
  {
    id: 'status-cleared',
    date: '08 Jul 2026', time: '11:28', daysAgo: 16,
    severity: 'routine', category: 'admin', source: 'System',
    title: 'Event status cleared',
    detail: 'Outstanding event flags were reset by the clinician.',
  },
  {
    id: 'infusion-hist-cleared',
    date: '08 Jul 2026', time: '11:27', daysAgo: 16,
    severity: 'warning', category: 'admin', source: 'System',
    title: 'Non-critical alarm – Infusion history cleared',
    detail: 'Stored infusion history was cleared from the device memory.',
    status: 'Acknowledged · 11:27',
  },
  {
    id: 'counters-cleared',
    date: '30 Jun 2026', time: '16:44', daysAgo: 24,
    severity: 'routine', category: 'admin', source: 'System',
    title: 'Patient activation event counters cleared',
    detail: 'Patient activation counters were reset to zero.',
  },
  {
    id: 'log-cleared',
    date: '30 Jun 2026', time: '16:40', daysAgo: 24,
    severity: 'routine', category: 'admin', source: 'System',
    title: 'System event log cleared',
    detail: 'The full system event log was cleared from the device.',
  },
  {
    id: 'pat-bolus-done',
    date: '24 Jun 2026', time: '08:15', daysAgo: 30,
    severity: 'routine', category: 'therapy', source: 'Patient',
    title: 'Patient bolus completed',
    detail: 'Patient-requested bolus of 0.02 ml was delivered successfully.',
    status: 'Resolved · 08:15',
  },
];

/* ── Filter definitions ────────────────────────────────────────────────── */

type SeverityFilter = Severity | 'all';
type CategoryFilter = CategoryKey | 'all';
type RangeKey = 'connection' | '7d' | '30d';

/**
 * Each filter axis is one select. The first entry of each is the unfiltered
 * state, and its label is what the closed select reads when nothing is picked —
 * so the toolbar always says what it is currently showing.
 */
const SEVERITY_OPTIONS: { key: SeverityFilter; label: string; color: string }[] = [
  { key: 'all', label: 'All severities', color: '#096657' },
  { key: 'critical', label: 'Critical', color: '#cc5457' },
  { key: 'warning', label: 'Warnings', color: '#b3850e' },
  { key: 'routine', label: 'Routine', color: '#096657' },
];

const CATEGORY_OPTIONS: { key: CategoryFilter; label: string }[] = [
  { key: 'all', label: 'All categories' },
  ...(Object.keys(CATEGORY_LABEL) as CategoryKey[]).map(k => ({ key: k, label: CATEGORY_LABEL[k] })),
];

/**
 * The device only retains events since it last established a connection, so the
 * full range is bounded by that date rather than being open-ended; the shorter
 * ranges cut into it from the present.
 */
const CONNECTED_SINCE = '24 Jun 2026';

const RANGE_OPTIONS: { key: RangeKey; label: string; chip: string; days: number | null }[] = [
  { key: 'connection', label: 'Last connection', chip: 'Since last connection', days: null },
  { key: '7d', label: 'Last 7 days', chip: 'Last 7 days', days: 7 },
  { key: '30d', label: 'Last 30 days', chip: 'Last 30 days', days: 30 },
];

/** Patient the log belongs to — named on the export sheet, as on the Review step. */
const PATIENT_ID = '930230393';

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

/** Caret on a select — points down at rest, up while its menu is open. */
function Caret({ open }: { open: boolean }) {
  return (
    <svg width="24" height="12" viewBox="0 0 24 12" fill="none" className={`shrink-0 transition-transform duration-150 ${open ? 'rotate-180' : ''}`}>
      <path d="M2 2L12 10L22 2" stroke="#0b786a" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Tick marking the option a select is currently set to. */
function Check() {
  return (
    <svg width="20" height="16" viewBox="0 0 20 16" fill="none" className="shrink-0">
      <path d="M2 8.5L7 13.5L18 2.5" stroke="#0b786a" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/**
 * One filter axis, as a pill that opens a menu beneath itself. The pill reads
 * the current selection rather than the axis name — three of them side by side
 * are the whole filter state, in a row the height of one control.
 */
function Select({ label, open, onToggle, width = 380, children }: {
  label: string; open: boolean; onToggle: () => void; width?: number; children: ReactNode;
}) {
  return (
    // Above the click-away backdrop, so moving straight from one open menu to
    // another is a single click rather than one to dismiss and one to open.
    <div className="relative shrink-0 z-40">
      <button
        onClick={onToggle}
        className={`bg-white border-2 rounded-[60px] h-[88px] px-[32px] flex gap-[12px] items-center justify-center cursor-pointer ${open ? 'border-[#0b786a]' : 'border-[#f5fcf9]'}`}
      >
        <span className={`${FONT} font-bold text-[#096657] text-[22px] leading-[28px] whitespace-nowrap`} style={wdth}>{label}</span>
        <Caret open={open} />
      </button>
      {open && (
        <div
          className="absolute left-0 top-[100px] z-40 bg-white border-2 border-[#f5fcf9] rounded-[24px] py-[12px] overflow-hidden shadow-[0px_12px_32px_0px_rgba(0,0,0,0.16)]"
          style={{ width }}
        >
          {children}
        </div>
      )}
    </div>
  );
}

/**
 * One line of a select menu. The trailing slot carries the tick when this is the
 * current choice, and otherwise whatever the option is worth illustrating — for
 * severity, the same glyph the log rows use.
 */
function Option({ label, color, selected, icon, first, onClick }: {
  label: string; color: string; selected: boolean; icon?: ReactNode; first?: boolean; onClick: () => void;
}) {
  return (
    <>
      {!first && <div className="h-[2px] bg-[#f5fcf9] w-full" />}
      <button
        onClick={onClick}
        className={`h-[76px] px-[28px] flex items-center justify-between gap-[16px] w-full cursor-pointer ${selected ? 'bg-[#f5fcf9]' : 'bg-white'}`}
      >
        <span className={`${FONT} font-bold text-[24px] leading-[32px] tracking-[0.1px] whitespace-nowrap`} style={{ ...wdth, color }}>
          {label}
        </span>
        {selected ? <Check /> : icon}
      </button>
    </>
  );
}

/** Outlined area pill closing a log row — colour stays reserved for severity. */
function CategoryBadge({ category }: { category: CategoryKey }) {
  return (
    <span
      className={`${FONT} font-normal text-[#183d38] text-[20px] leading-[24px] tracking-[0.1px] whitespace-nowrap rounded-[24px] px-[18px] py-[6px] bg-white border-2 border-[#f5fcf9] shrink-0`}
      style={wdth}
    >
      {CATEGORY_LABEL[category]}
    </span>
  );
}

/** Disclosure chevron: points into the row at rest, down once it is open. */
function Chevron({ open, color = '#9db3ad' }: { open: boolean; color?: string }) {
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
        primary ? 'bg-[#0b786a]' : 'border-[3px] border-[#0b786a]'
      }`}
    >
      {icon}
      <span
        className={`${FONT} font-bold text-[24px] leading-[32px] tracking-[0.1px] whitespace-nowrap ${primary ? 'text-white' : 'text-[#0b786a]'}`}
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
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" className="shrink-0">
      <path d="M12 3.5v11" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
      <path d="M7.5 8L12 3.5L16.5 8" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4 15v4.5a1.5 1.5 0 0 0 1.5 1.5h13a1.5 1.5 0 0 0 1.5-1.5V15" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

/** The ✕ that clears a still-valid alert off the "Active now" shelf. */
function DismissIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" className="shrink-0">
      <path d="M6 6L18 18M18 6L6 18" stroke="#596d68" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}

/* ── Export sheet ──────────────────────────────────────────────────────── */

/**
 * The sheet asks two independent questions: what the export *is*, and where it
 * goes. A file format has to be chosen; the destination is answered for you,
 * since emailing the report is what almost every export is for.
 */
type FileFormat = 'pdf' | 'csv';
type SendTo = 'email' | 'ehr';

/** Uppercase caption naming a group of the export sheet. */
function GroupLabel({ children }: { children: ReactNode }) {
  return (
    <p className={`${FONT} font-bold text-[#9db3ad] text-[22px] leading-[26px] tracking-[1px] whitespace-nowrap`} style={wdth}>
      {children}
    </p>
  );
}

/** Read-only pill restating one axis of the filter the export will inherit. */
function IncludeChip({ label, icon }: { label: string; icon?: ReactNode }) {
  return (
    <div className="h-[56px] px-[24px] rounded-[28px] bg-white border-2 border-[#9fd6c6] flex gap-[10px] items-center justify-center shrink-0">
      {icon}
      <span className={`${FONT} font-bold text-[#096657] text-[24px] leading-[30px] tracking-[0.1px] whitespace-nowrap`} style={wdth}>{label}</span>
    </div>
  );
}

function Radio({ on }: { on: boolean }) {
  return (
    <span className={`size-[36px] rounded-full shrink-0 ${on ? 'bg-[#0b786a]' : 'bg-white border-[3px] border-[#9fd6c6]'}`} />
  );
}

/** One destination the export can be sent to, as a selectable card. */
function DestinationRow({ title, sub, selected, disabled, onSelect }: {
  title: string; sub: string; selected: boolean; disabled?: boolean; onSelect: () => void;
}) {
  return (
    <button
      onClick={disabled ? undefined : onSelect}
      className={`w-full rounded-[20px] px-[28px] py-[22px] flex gap-[24px] items-center text-left ${
        disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
      } ${selected ? 'bg-[#f5fcf9] border-[3px] border-[#0b786a]' : 'bg-white border-2 border-[#9fd6c6]'}`}
    >
      <Radio on={selected} />
      <span className="flex-1 min-w-px flex flex-col gap-[6px]">
        <span className={`${FONT} font-bold text-[#183d38] text-[26px] leading-[32px]`} style={wdth}>{title}</span>
        <span className={`${FONT} font-normal text-[#9db3ad] text-[22px] leading-[28px]`} style={wdth}>{sub}</span>
      </span>
    </button>
  );
}

/** Body revealed when a history row is opened: description and meta line. */
function EventDetail({ event }: { event: LogEvent }) {
  return (
    <div className="flex flex-col gap-[16px] pt-[16px]">
      <p className={`${FONT} font-normal text-[#596d68] text-[24px] leading-[34px] tracking-[0.1px]`} style={wdth}>
        {event.detail}
      </p>
      <p className={`${FONT} font-normal text-[#9db3ad] text-[22px] leading-[28px] tracking-[0.1px]`} style={wdth}>
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
function OngoingCard({ event, actions, onDismiss }: { event: LogEvent; actions?: ReactNode; onDismiss: () => void }) {
  return (
    <div
      className="rounded-[24px] w-full p-[24px] flex flex-col gap-[16px] overflow-hidden"
      style={{ backgroundColor: TINT[event.severity] }}
    >
      <div className="flex gap-[24px] items-start w-full">
        <SeverityIcon severity={event.severity} size={40} />
        <div className="flex-1 min-w-px flex flex-col gap-[24px] justify-center pt-[8px]">
          <div className="flex gap-[24px] items-start w-full">
            <p className={`${FONT} font-bold text-[#183d38] text-[28px] leading-[32px] tracking-[0.1px] flex-1 min-w-px`} style={wdth}>
              {event.title}
            </p>
            <button onClick={onDismiss} aria-label="Dismiss" className="cursor-pointer shrink-0">
              <DismissIcon />
            </button>
          </div>
          <p className={`${FONT} font-normal text-[#183d38] text-[24px] leading-[32px] tracking-[0.1px]`} style={wdth}>
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
    <div className="border-b border-[#eef3f1] w-full">
      <button onClick={onToggle} className="flex gap-[24px] items-center w-full py-[16px] text-left cursor-pointer">
        <p className={`${FONT} font-normal text-[#9db3ad] text-[20px] leading-[24px] tracking-[0.1px] w-[220px] shrink-0`} style={wdth}>
          {event.date}&nbsp;&nbsp;{event.time}
        </p>
        <SeverityIcon severity={event.severity} size={32} />
        <p className={`${FONT} font-normal text-[#183d38] text-[24px] leading-[32px] tracking-[0.1px] flex-1 min-w-px`} style={wdth}>
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
 * Logs page (Figma 9910:40343): a filterable, chronological event log reached
 * from the bottom navigation. Three selects — severity, category, time range —
 * narrow the list, and every row opens to reveal its detail. Ongoing alerts
 * (still valid) sit above the resolved history as tinted cards that can be
 * cleared off the shelf once seen; the reservoir one mirrors the live state and
 * offers the refill actions. Export opens a sheet that inherits whatever the
 * three selects are currently showing.
 */
export function Notifications() {
  const navigate = useNavigate();
  const { alertLevelMl, volMlPerDay, setFlowMode, setRefillBranch } = useTherapy();

  const [severity, setSeverity] = useState<SeverityFilter>('all');
  const [category, setCategory] = useState<CategoryFilter>('all');
  const [range, setRange] = useState<RangeKey>('connection');
  const [openSelect, setOpenSelect] = useState<'severity' | 'category' | 'range' | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);
  const [dismissed, setDismissed] = useState<string[]>([]);
  const [exportOpen, setExportOpen] = useState(false);
  const [format, setFormat] = useState<FileFormat | null>(null);
  const [sendTo, setSendTo] = useState<SendTo>('email');

  const alertPct = Math.round((alertLevelMl / RESERVOIR_ML) * 100);
  // The alarm has already fired, so what is left to run down is the volume below
  // the alert level — that, not the time to the alert, is "estimated empty".
  const daysToEmpty = volMlPerDay > 0 ? Math.floor(alertLevelMl / volMlPerDay) : null;

  const startRefill = () => { setFlowMode('refill'); navigate('refill-filling'); };
  // The alert level lives behind the toggle on the Refill Date step.
  const adjustAlert = () => { setFlowMode('refill'); setRefillBranch(null); navigate('refill-date'); };

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

  const rangeOption = RANGE_OPTIONS.find(r => r.key === range)!;
  const visible = events.filter(e =>
    (severity === 'all' || e.severity === severity) &&
    (category === 'all' || e.category === category) &&
    (rangeOption.days == null || e.daysAgo <= rangeOption.days),
  );
  const ongoing = visible.filter(e => e.ongoing && !dismissed.includes(e.id));
  const history = visible.filter(e => !e.ongoing);

  const toggle = (id: string) => setOpenId(cur => (cur === id ? null : id));
  const pickSelect = (which: 'severity' | 'category' | 'range') =>
    setOpenSelect(cur => (cur === which ? null : which));

  const severityLabel = SEVERITY_OPTIONS.find(o => o.key === severity)!.label;
  const categoryLabel = CATEGORY_OPTIONS.find(o => o.key === category)!.label;

  // The log is stored newest-first, so its span runs from the last row to the first.
  const spanFrom = visible.length ? visible[visible.length - 1].date : CONNECTED_SINCE;
  const spanTo = visible.length ? visible[0].date : CONNECTED_SINCE;

  // The CSV is exactly what is on screen — filters and all — to file with the
  // patient's record. The PDF and the two destinations need a backend this
  // prototype has no counterpart for, so they only confirm the choice.
  const downloadCsv = () => {
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

  const runExport = () => {
    if (format === 'csv') downloadCsv();
    setExportOpen(false);
  };

  return (
    <DetailShell
      navTab="notifications"
      icon={<img alt="" src={imgBell} className="size-[56px] shrink-0 block" />}
      title="Logs"
      headerRight={
        <div className="flex flex-col gap-[4px] items-end text-right">
          <p className={`${FONT} font-bold text-[#183d38] text-[26px] leading-[32px] tracking-[0.1px] whitespace-nowrap`} style={wdth}>
            {visible.length} {visible.length === 1 ? 'event' : 'events'}
          </p>
          <p className={`${FONT} font-normal text-[#9db3ad] text-[22px] leading-[28px] tracking-[0.1px] whitespace-nowrap`} style={wdth}>
            Logs since last connection on {CONNECTED_SINCE}
          </p>
        </div>
      }
      overlay={exportOpen && (
        <div className="absolute inset-0 flex flex-col justify-end">
          <div onClick={() => setExportOpen(false)} className="absolute inset-0 bg-black/40" />
          <div className="relative bg-white rounded-t-[40px] shadow-[0px_-8px_40px_0px_rgba(0,0,0,0.18)] px-[64px] pt-[32px] pb-[56px] flex flex-col gap-[40px]">
            <div className="flex justify-center w-full">
              <div className="h-[8px] w-[120px] rounded-[4px] bg-[#cedfd9]" />
            </div>

            <div className="flex flex-col gap-[10px] w-full">
              <p className={`${FONT} font-bold text-[#183d38] text-[40px] leading-[48px] whitespace-nowrap`} style={wdth}>Export logs</p>
              <p className={`${FONT} font-normal text-[#9db3ad] text-[24px] leading-[32px] tracking-[0.1px] whitespace-nowrap`} style={wdth}>
                {visible.length} {visible.length === 1 ? 'event' : 'events'} · {spanFrom} – {spanTo} · Patient ID {PATIENT_ID}
              </p>
            </div>

            {/* What the export carries over from the toolbar */}
            <div className="flex flex-col gap-[14px] w-full">
              <GroupLabel>INCLUDE</GroupLabel>
              <div className="flex gap-[16px] items-start">
                <IncludeChip
                  label={severityLabel}
                  icon={severity === 'all' ? undefined : <SeverityIcon severity={severity} size={26} />}
                />
                <IncludeChip label={categoryLabel} />
                <IncludeChip label={rangeOption.chip} />
              </div>
            </div>

            <div className="flex flex-col gap-[14px] w-full">
              <GroupLabel>SAVE AS</GroupLabel>
              <div className="flex flex-col gap-[16px] w-full">
                <DestinationRow
                  title="Download PDF" sub="Formatted report for printing or manual filing"
                  selected={format === 'pdf'} onSelect={() => setFormat('pdf')}
                />
                <DestinationRow
                  title="Download CSV" sub="Raw event data for analysis"
                  selected={format === 'csv'} onSelect={() => setFormat('csv')}
                />
              </div>
            </div>

            <div className="flex flex-col gap-[14px] w-full">
              <GroupLabel>SEND AS</GroupLabel>
              <div className="flex flex-col gap-[16px] w-full">
                <DestinationRow
                  title="Email" sub="Encrypted Email to a recipient you choose"
                  selected={sendTo === 'email'} onSelect={() => setSendTo('email')}
                />
                <DestinationRow
                  title="Clinical system (KIS / EHR)"
                  sub="Connected: Neurochirurgie St. Marien · attaches to patient file"
                  selected={sendTo === 'ehr'} disabled onSelect={() => setSendTo('ehr')}
                />
              </div>
            </div>

            <div className="flex gap-[24px] items-start justify-end w-full">
              <button
                onClick={() => setExportOpen(false)}
                className="border-[3px] border-[#0b786a] rounded-[80px] h-[88px] min-w-[240px] px-[40px] flex items-center justify-center cursor-pointer"
              >
                <span className={`${FONT} font-bold text-[#0b786a] text-[24px] leading-[32px] tracking-[0.1px]`} style={wdth}>Cancel</span>
              </button>
              <button
                onClick={runExport}
                className="bg-[#0b786a] rounded-[80px] h-[88px] min-w-[240px] px-[40px] flex items-center justify-center cursor-pointer"
              >
                <span className={`${FONT} font-bold text-white text-[24px] leading-[32px] tracking-[0.1px]`} style={wdth}>Export</span>
              </button>
            </div>
          </div>
        </div>
      )}
    >
      <div className="flex flex-col gap-[32px] items-start w-full">
        {/* ── Filter toolbar — one select per axis, export pinned right ── */}
        <div className="w-full flex items-center justify-between relative">
          {/* Clicking anywhere off an open menu closes it. */}
          {openSelect && <div className="fixed inset-0 z-30" onClick={() => setOpenSelect(null)} />}

          <Select label={severityLabel} open={openSelect === 'severity'} onToggle={() => pickSelect('severity')}>
            {SEVERITY_OPTIONS.map((o, i) => (
              <Option
                key={o.key}
                label={o.label}
                color={o.color}
                first={i === 0}
                selected={severity === o.key}
                icon={o.key === 'all' ? undefined : <SeverityIcon severity={o.key} size={26} />}
                onClick={() => { setSeverity(o.key); setOpenSelect(null); }}
              />
            ))}
          </Select>

          <Select label={categoryLabel} open={openSelect === 'category'} onToggle={() => pickSelect('category')}>
            {CATEGORY_OPTIONS.map((o, i) => (
              <Option
                key={o.key}
                label={o.label}
                color="#096657"
                first={i === 0}
                selected={category === o.key}
                onClick={() => { setCategory(o.key); setOpenSelect(null); }}
              />
            ))}
          </Select>

          <Select label={rangeOption.label} open={openSelect === 'range'} onToggle={() => pickSelect('range')}>
            {RANGE_OPTIONS.map((o, i) => (
              <Option
                key={o.key}
                label={o.label}
                color="#096657"
                first={i === 0}
                selected={range === o.key}
                onClick={() => { setRange(o.key); setOpenSelect(null); }}
              />
            ))}
          </Select>

          <button
            onClick={() => { setOpenSelect(null); setExportOpen(true); }}
            className="bg-[#0b786a] rounded-[80px] h-[88px] min-w-[240px] px-[40px] flex gap-[16px] items-center justify-center cursor-pointer shrink-0"
          >
            <ExportIcon />
            <span className={`${FONT} font-bold text-white text-[24px] leading-[32px] tracking-[0.1px]`} style={wdth}>Export</span>
          </button>
        </div>

        {/* ── Log entries ── */}
        <div className="w-full flex flex-col gap-[32px]">
          {/* Ongoing — still-valid alerts, visually distinct from history */}
          {ongoing.length > 0 && (
            <div className="flex flex-col gap-[16px] w-full">
              <p className={`${FONT} font-bold text-[#183d38] text-[28px] leading-[32px] tracking-[0.1px]`} style={wdth}>
                Active now
              </p>
              {ongoing.map(e => (
                <OngoingCard
                  key={e.id}
                  event={e}
                  onDismiss={() => setDismissed(d => [...d, e.id])}
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
            <div className="flex flex-col gap-[8px] w-full">
              <p className={`${FONT} font-bold text-[#183d38] text-[28px] leading-[32px] tracking-[0.1px]`} style={wdth}>
                History
              </p>
              <div className="flex flex-col w-full">
                {history.map(e => (
                  <HistoryRow key={e.id} event={e} open={openId === e.id} onToggle={() => toggle(e.id)} />
                ))}
              </div>
            </div>
          )}

          {visible.length === 0 && (
            <p className={`${FONT} font-normal text-[#9db3ad] text-[24px] leading-[32px] tracking-[0.1px] py-[40px] w-full text-center`} style={wdth}>
              No events match these filters.
            </p>
          )}
        </div>
      </div>
    </DetailShell>
  );
}
