import { useNavigate } from '../navigation';
import {
  useTherapy, fmtTime, hourlyUg, coDoseUgDay, doseStrings,
  doseColor,
} from '../therapy';
import type { ReactNode } from 'react';

const imgEditPencil = "/icons/edit-pencil.svg";

/* Plain 24-hour HH:MM field (no native clock icon / AM-PM). */
function TimeField({ value, onChange }: { value: number; onChange: (min: number) => void }) {
  return (
    <div className="bg-white border border-[#d9dbde] rounded-[12px] h-[80px] flex items-center px-[20px]">
      <input
        type="text"
        inputMode="numeric"
        value={fmtTime(value)}
        onChange={e => {
          const m = e.target.value.match(/^(\d{1,2}):(\d{2})$/);
          if (m) {
            const h = Math.min(23, parseInt(m[1], 10));
            const min = Math.min(59, parseInt(m[2], 10));
            onChange(h * 60 + min);
          }
        }}
        className="flex-1 font-['Roboto',sans-serif] font-bold text-[#45483c] text-[28px] tracking-[0.1px] bg-transparent outline-none border-0 p-0"
        style={{ fontVariationSettings: "'wdth' 100" }}
      />
    </div>
  );
}

/* ------------------------------------------------------------- */
/* Shared sheet chrome — dark backdrop + white rounded-top sheet */
/* ------------------------------------------------------------- */

function SheetShell({ children }: { children: ReactNode }) {
  return (
    <div className="bg-white relative size-full">
      {/* Dark backdrop fills the whole screen */}
      <div className="absolute bg-[#0d0d1a] h-[1920px] left-0 top-0 w-[1200px]" />
      <div className="absolute bg-[#3b2d7c] h-[35px] left-0 top-0 w-[1200px]" />
      {/* White rounded-top sheet sits over the bottom 2/3 */}
      <div className="absolute bg-white h-[1440px] left-0 overflow-clip rounded-tl-[32px] rounded-tr-[32px] top-[480px] w-[1200px]">
        <div className="absolute bg-[#d9dbde] h-[6px] left-[560px] rounded-[3px] top-[24px] w-[80px]" />
        <p className="absolute font-['Roboto',sans-serif] font-bold leading-[40px] left-[80px] text-[#00769e] text-[36px] tracking-[0.1px] top-[56px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
          Add interval
        </p>
        {children}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------- */
/* 24h preview chart with base bar + dashed NEW placeholder      */
/* ------------------------------------------------------------- */

function PreviewChart({
  baseDose,
  newStart,
  newEnd,
}: {
  baseDose: number;
  newStart: number;
  newEnd: number;
}) {
  const containerW = 1040;
  const containerH = 130;
  const left = 80;
  const top = 130;
  const innerLeft = 12;
  const innerW = containerW - 24;
  const baseHourly = hourlyUg(baseDose);
  const newLeft = innerLeft + (newStart / 1440) * innerW;
  const newWidth = Math.max(0, ((newEnd - newStart) / 1440) * innerW);
  const hasNew = newEnd > newStart;
  // Base bar and NEW box share the same vertical band (NEW sits inline, same height).
  const BAR_TOP = 60;
  const BAR_H = 44;
  return (
    <div className="absolute bg-[#f7fafc] border border-[#d9dbde] rounded-[12px]" style={{ left, top, width: containerW, height: containerH }}>
      {/* Time ticks */}
      {['00:00', '06:00', '12:00', '18:00', '24:00'].map((t, i) => (
        <p
          key={t}
          className="absolute font-['Roboto',sans-serif] font-normal text-[#9ea8b2] text-[14px] tracking-[0.1px]"
          style={{
            top: 12,
            left: innerLeft + (innerW * i) / 4 - (i === 0 ? 0 : i === 4 ? 36 : 18),
            fontVariationSettings: "'wdth' 100",
          }}
        >
          {t}
        </p>
      ))}
      {/* Base dose bar — full width */}
      <div
        className="absolute rounded-[3px] bg-[#8cc7e8] flex items-center px-[12px]"
        style={{ left: innerLeft, right: innerLeft, top: BAR_TOP, height: BAR_H }}
      >
        <p className="font-['Roboto',sans-serif] font-bold text-[14px] text-white tracking-[0.1px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
          Base dose {baseHourly.toFixed(1)} µg/h
        </p>
      </div>
      {/* NEW placeholder — dashed box, same band as base bar */}
      {hasNew && (
        <div
          className="absolute rounded-[3px] flex items-center justify-center"
          style={{
            left: newLeft,
            width: newWidth,
            top: BAR_TOP,
            height: BAR_H,
            background: 'rgba(255,255,255,0.55)',
            border: '2px dashed #0094c5',
          }}
        >
          <p className="font-['Roboto',sans-serif] font-bold text-[12px] text-[#00769e] tracking-[0.1px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
            NEW
          </p>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------- */
/* Shared 3-button footer: Delete / Cancel / Primary             */
/* ------------------------------------------------------------- */

function SheetFooter({
  showDelete,
  onDelete,
  onCancel,
  primaryLabel,
  primaryEnabled,
  onPrimary,
}: {
  showDelete: boolean;
  onDelete: () => void;
  onCancel: () => void;
  primaryLabel: string;
  primaryEnabled: boolean;
  onPrimary: () => void;
}) {
  // Sheet is 1440px tall. Footer 88px high, 80px from bottom → top = 1272.
  return (
    <div className="absolute flex gap-[24px] left-[80px] top-[1272px] w-[1040px]">
      {showDelete ? (
        <div
          onClick={onDelete}
          className="flex-1 h-[88px] rounded-[80px] border-2 border-[#c44539] bg-white flex items-center justify-center cursor-pointer"
        >
          <p className="font-['Roboto',sans-serif] font-bold text-[#c44539] text-[24px] tracking-[0.1px]" style={{ fontVariationSettings: "'wdth' 100" }}>
            Delete
          </p>
        </div>
      ) : (
        <div className="flex-1" />
      )}
      <div
        onClick={onCancel}
        className="flex-1 h-[88px] rounded-[80px] border-2 border-[#0094c5] bg-white flex items-center justify-center cursor-pointer"
      >
        <p className="font-['Roboto',sans-serif] font-bold text-[#0094c5] text-[24px] tracking-[0.1px]" style={{ fontVariationSettings: "'wdth' 100" }}>
          Cancel
        </p>
      </div>
      <div
        onClick={() => { if (primaryEnabled) onPrimary(); }}
        className={`flex-1 h-[88px] rounded-[80px] flex items-center justify-center ${primaryEnabled ? 'bg-[#0094c5] cursor-pointer' : 'bg-[#cbcbcb] cursor-not-allowed'}`}
      >
        <p className={`font-['Roboto',sans-serif] font-bold text-[24px] tracking-[0.1px] ${primaryEnabled ? 'text-white' : 'text-[#a5a5a5]'}`} style={{ fontVariationSettings: "'wdth' 100" }}>
          {primaryLabel}
        </p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------- */
/* Step 1 — when                                                 */
/* ------------------------------------------------------------- */

export function AddIntervalSheetWhen() {
  const navigate = useNavigate();
  const { baseDose, draft, setDraft, intervals, editingId, removeInterval, sheetReturnTo } = useTherapy();
  const lengthMin = Math.max(0, draft.endMin - draft.startMin);
  const lengthH = Math.floor(lengthMin / 60);
  const lengthM = lengthMin % 60;
  const pctDay = ((lengthMin / 1440) * 100).toFixed(1);
  const cancelTarget = (sheetReturnTo === 'intervals-populated' && intervals.length === 0)
    ? 'intervals-empty'
    : sheetReturnTo;
  const onDelete = () => {
    if (!editingId) return;
    removeInterval(editingId);
    const willBeEmpty = intervals.length <= 1;
    navigate(willBeEmpty && sheetReturnTo === 'intervals-populated' ? 'intervals-empty' : sheetReturnTo);
  };
  const validTime = draft.endMin > draft.startMin && draft.label.trim().length > 0;
  return (
    <SheetShell>
      <PreviewChart
        baseDose={baseDose}
        newStart={draft.startMin}
        newEnd={draft.endMin}
      />
      {/* Label */}
      <div className="absolute left-[80px] right-[80px] top-[300px] flex flex-col gap-[8px]">
        <p className="font-['Roboto',sans-serif] font-bold text-[#00769e] text-[20px] tracking-[0.1px]" style={{ fontVariationSettings: "'wdth' 100" }}>
          Label
        </p>
        <div className="bg-white border border-[#d9dbde] rounded-[12px] h-[80px] flex items-center px-[20px]">
          <input
            type="text"
            value={draft.label}
            onChange={e => setDraft({ ...draft, label: e.target.value })}
            placeholder='e.g. "Morning peak", "Physio", "Wind-down"'
            className="flex-1 font-['Roboto',sans-serif] font-bold text-[#45483c] text-[28px] tracking-[0.1px] bg-transparent outline-none border-0 p-0 placeholder:font-normal placeholder:text-[#9ea8b2]"
            style={{ fontVariationSettings: "'wdth' 100" }}
          />
        </div>
        <p className="font-['Roboto',sans-serif] font-normal text-[#9ea8b2] text-[14px] tracking-[0.1px]" style={{ fontVariationSettings: "'wdth' 100" }}>{`e.g. "Morning peak", "Physio", "Wind-down"`}</p>
      </div>

      {/* Start / End time fields */}
      <div className="absolute left-[80px] right-[80px] top-[460px] flex gap-[24px] items-end">
        <div className="flex-1 flex flex-col gap-[8px]">
          <p className="font-['Roboto',sans-serif] font-bold text-[#00769e] text-[20px] tracking-[0.1px]" style={{ fontVariationSettings: "'wdth' 100" }}>
            Start
          </p>
          <TimeField value={draft.startMin} onChange={min => setDraft({ ...draft, startMin: min })} />
        </div>
        <p className="font-['Roboto',sans-serif] font-bold text-[#667380] text-[32px] pb-[20px]" style={{ fontVariationSettings: "'wdth' 100" }}>→</p>
        <div className="flex-1 flex flex-col gap-[8px]">
          <p className="font-['Roboto',sans-serif] font-bold text-[#00769e] text-[20px] tracking-[0.1px]" style={{ fontVariationSettings: "'wdth' 100" }}>
            End
          </p>
          <TimeField value={draft.endMin} onChange={min => setDraft({ ...draft, endMin: min })} />
        </div>
      </div>

      {/* Length caption */}
      <p
        className="absolute font-['Roboto',sans-serif] font-medium text-[#667380] text-[18px] tracking-[0.1px] left-[80px] top-[600px]"
        style={{ fontVariationSettings: "'wdth' 100" }}
      >
        Length: {lengthH}h {lengthM}m · {pctDay}% of the day
      </p>

      <SheetFooter
        showDelete={!!editingId}
        onDelete={onDelete}
        onCancel={() => navigate(cancelTarget)}
        primaryLabel="Set dose"
        primaryEnabled={validTime}
        onPrimary={() => navigate('add-interval-dose')}
      />
    </SheetShell>
  );
}

/* ------------------------------------------------------------- */
/* Step 2 — dose                                                 */
/* ------------------------------------------------------------- */

export function AddIntervalSheetDose() {
  const navigate = useNavigate();
  const { baseDose, draft, setDraft, intervals, editingId, commitDraft, removeInterval, sheetReturnTo, medications } = useTherapy();
  const conc = (i: number) => (medications[i] ? `${medications[i].concentration} ${medications[i].unit}` : '');
  // Interval dose stored as µg/day; UI works in µg/h. Step = 1 µg/h ≈ 24 µg/day.
  const hourly = hourlyUg(draft.dose);
  const pctDelta = baseDose > 0 ? Math.round(((draft.dose - baseDose) / baseDose) * 100) : 0;
  const primaryConc = medications[0]?.concentration ?? 1;
  const coMeds = medications.slice(1);
  const lengthFraction = Math.max(0, draft.endMin - draft.startMin) / 1440;
  const ugInterval = draft.dose * lengthFraction; // primary (Baclofen) µg over the interval
  const onDelete = () => {
    if (!editingId) return;
    removeInterval(editingId);
    const willBeEmpty = intervals.length <= 1;
    navigate(willBeEmpty && sheetReturnTo === 'intervals-populated' ? 'intervals-empty' : sheetReturnTo);
  };
  const save = () => {
    commitDraft();
    const target = sheetReturnTo === 'intervals-empty' ? 'intervals-populated' : sheetReturnTo;
    navigate(target);
  };
  const endDisplay = draft.endMin >= 1440 ? '23:59' : fmtTime(Math.max(0, draft.endMin - 1));
  return (
    <SheetShell>
      <PreviewChart
        baseDose={baseDose}
        newStart={draft.startMin}
        newEnd={draft.endMin}
      />
      {/* Summary row */}
      <div
        onClick={() => navigate('add-interval-when')}
        className="absolute bg-white border border-[#d9dbde] rounded-[12px] h-[80px] left-[80px] right-[80px] top-[280px] flex items-center px-[24px] gap-[24px] cursor-pointer"
      >
        <div className="w-[8px] h-[48px] rounded-[4px]" style={{ background: doseColor(draft.dose || baseDose, baseDose) }} />
        <div className="flex flex-col gap-[2px] w-[240px] shrink-0">
          <p className="font-['Roboto',sans-serif] font-bold text-[#00769e] text-[24px] tracking-[0.1px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
            {draft.label || '(no label)'}
          </p>
          <p className="font-['Roboto',sans-serif] font-normal text-[#667380] text-[18px] tracking-[0.1px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
            {fmtTime(draft.startMin)} – {endDisplay}
          </p>
        </div>
        <p className="font-['Roboto',sans-serif] font-bold text-[#0094c5] text-[22px] tracking-[0.1px] w-[120px] shrink-0" style={{ fontVariationSettings: "'wdth' 100" }}>
          {pctDelta >= 0 ? '+' : '−'} {Math.abs(pctDelta)} %
        </p>
        <p className="flex-1 font-['Roboto',sans-serif] text-[#00769e] text-[24px] tracking-[0.1px] min-w-px" style={{ fontVariationSettings: "'wdth' 100" }}>
          <span className="font-bold">{doseStrings(draft.dose).perHour}</span> {doseStrings(draft.dose).unit}/h
        </p>
        <img alt="" src={imgEditPencil} className="size-[32px] shrink-0 block" />
      </div>

      {/* Column headers */}
      <div className="absolute left-[80px] right-[80px] top-[392px] flex items-center gap-[24px]">
        <div className="w-[260px]" />
        <p className="w-[300px] font-['Roboto',sans-serif] font-bold text-[#00769e] text-[20px] tracking-[0.1px]" style={{ fontVariationSettings: "'wdth' 100" }}>Dose/h</p>
        <p className="flex-1 text-right font-['Roboto',sans-serif] font-bold text-[#00769e] text-[20px] tracking-[0.1px]" style={{ fontVariationSettings: "'wdth' 100" }}>Dose/interval</p>
      </div>

      {/* Baclofen ± row */}
      <div className="absolute left-[80px] right-[80px] top-[440px] flex items-center gap-[24px]">
        <div className="w-[260px]">
          <p className="font-['Roboto',sans-serif] tracking-[0.1px]" style={{ fontVariationSettings: "'wdth' 100" }}>
            <span className="font-bold text-[#00769e] text-[26px]">{medications[0]?.name || 'Baclofen'}</span>
            <span className="text-[#9ea8b2] text-[20px]"> {conc(0)}</span>
          </p>
        </div>
        <div className="bg-white border border-[#c4ccd4] rounded-[8px] h-[76px] w-[300px] flex items-center px-[20px] gap-[8px] focus-within:border-[#0094c5]">
          <input
            type="text"
            inputMode="decimal"
            pattern="[0-9]*\.?[0-9]*"
            value={hourly.toFixed(1)}
            onChange={e => {
              const v = parseFloat(e.target.value.replace(/[^0-9.]/g, ''));
              const ugH = isNaN(v) ? 0 : v;
              setDraft({ ...draft, dose: Math.max(0, Math.min(2000, Math.round(ugH * 24))) });
            }}
            className="flex-1 min-w-px font-['Roboto',sans-serif] font-bold text-[#1a1a1a] text-[32px] tracking-[0.1px] bg-transparent outline-none border-0 p-0 text-left"
            style={{ fontVariationSettings: "'wdth' 100" }}
          />
          <span className="font-['Roboto',sans-serif] font-normal text-[#a5a5a5] text-[22px] tracking-[0.1px]" style={{ fontVariationSettings: "'wdth' 100" }}>µg/h</span>
        </div>
        <div className="flex-1 flex flex-col items-end justify-center">
          <p className="font-['Roboto',sans-serif] font-bold text-[#00769e] text-[24px] tracking-[0.1px]" style={{ fontVariationSettings: "'wdth' 100" }}>
            ≈ {ugInterval.toFixed(0)} µg
          </p>
        </div>
      </div>

      {/* Co-delivered medications — derived from the primary dose + concentration */}
      {coMeds.map((m, i) => (
        <DerivedRow
          key={m.id}
          label={m.name}
          concentration={conc(i + 1)}
          ugDay={coDoseUgDay(draft.dose, primaryConc, m.concentration)}
          lengthFraction={lengthFraction}
          top={540 + i * 80}
        />
      ))}

      <SheetFooter
        showDelete={!!editingId}
        onDelete={onDelete}
        onCancel={() => navigate('add-interval-when')}
        primaryLabel={editingId ? 'Save interval' : 'Add interval'}
        primaryEnabled={draft.dose > 0}
        onPrimary={save}
      />
    </SheetShell>
  );
}

function DerivedRow({
  label, concentration, ugDay, lengthFraction, top,
}: {
  label: string;
  concentration: string;
  ugDay: number;        // co-med dose at the primary's interval rate (µg/day)
  lengthFraction: number; // interval length as a fraction of the day
  top: number;
}) {
  const d = doseStrings(ugDay);
  const intervalUg = ugDay * lengthFraction;
  const intervalStr = d.unit === 'mg' ? (intervalUg / 1000).toFixed(3) : intervalUg.toFixed(1);
  return (
    <div className="absolute left-[80px] right-[80px] flex items-center gap-[24px]" style={{ top }}>
      <div className="w-[260px]">
        <p className="font-['Roboto',sans-serif] tracking-[0.1px]" style={{ fontVariationSettings: "'wdth' 100" }}>
          <span className="font-bold text-[#00769e] text-[26px]">{label}</span>
          <span className="text-[#9ea8b2] text-[20px]"> {concentration}</span>
        </p>
      </div>
      <div className="w-[300px] flex items-baseline gap-[8px] px-[20px]">
        <span className="font-['Roboto',sans-serif] font-normal text-[#45483c] text-[32px] tracking-[0.1px]" style={{ fontVariationSettings: "'wdth' 100" }}>{d.perHour}</span>
        <span className="font-['Roboto',sans-serif] font-normal text-[#9ea8b2] text-[22px] tracking-[0.1px]" style={{ fontVariationSettings: "'wdth' 100" }}>{d.unit}/h</span>
      </div>
      <div className="flex-1 flex flex-col items-end justify-center">
        <p className="font-['Roboto',sans-serif] font-bold text-[#00769e] text-[24px] tracking-[0.1px]" style={{ fontVariationSettings: "'wdth' 100" }}>
          ≈ {intervalStr} {d.unit}
        </p>
      </div>
    </div>
  );
}
