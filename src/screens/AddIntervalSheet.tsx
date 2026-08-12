import { useNavigate } from '../navigation';
import {
  useTherapy, fmtTime, coDoseUgDay, concUgPerUl, doseStringsFor, doseUnitFor,
  doseColor,
} from '../therapy';
import { useEffect, useState, type ReactNode } from 'react';
import { BaseDoseChart } from '../components/BaseDoseChart';
import { fieldValueCls } from '../components/Field';

const imgEditPencil = "/icons/edit-pencil.svg";

/* Parse a partial time entry into minutes. Accepts "9", "9:3", "09:30", "0930",
   "930" etc. Returns null while the entry isn't yet a usable time. */
function parseTime(raw: string): number | null {
  const digits = raw.replace(/[^0-9]/g, '');
  if (digits.length === 0) return null;
  let h: number, min: number;
  if (raw.includes(':')) {
    const [hp, mp = ''] = raw.split(':');
    h = parseInt(hp || '0', 10);
    min = parseInt(mp || '0', 10);
  } else if (digits.length <= 2) {
    h = parseInt(digits, 10);
    min = 0;
  } else {
    // 3–4 digits: last two are minutes.
    h = parseInt(digits.slice(0, digits.length - 2), 10);
    min = parseInt(digits.slice(-2), 10);
  }
  if (isNaN(h) || isNaN(min)) return null;
  h = Math.min(23, h);
  min = Math.min(59, min);
  return h * 60 + min;
}

/* Plain 24-hour HH:MM field (no native clock icon / AM-PM). Keeps a local text
   buffer so partial entries can be typed; commits to minutes whenever the text
   parses, and normalises back to HH:MM on blur. */
function TimeField({ value, onChange }: { value: number; onChange: (min: number) => void }) {
  const [text, setText] = useState(() => fmtTime(value));
  const [focused, setFocused] = useState(false);

  // Reflect external changes to the committed value while not actively editing.
  useEffect(() => {
    if (!focused) setText(fmtTime(value));
  }, [value, focused]);

  return (
    <div className="bg-white border border-[#a5a5a5] rounded-[8px] h-[72px] flex items-center px-[16px] focus-within:border-[#00769e]">
      <input
        type="text"
        inputMode="numeric"
        value={text}
        onFocus={() => setFocused(true)}
        onChange={e => {
          const raw = e.target.value;
          setText(raw);
          const min = parseTime(raw);
          if (min !== null) onChange(min);
        }}
        onBlur={() => {
          setFocused(false);
          const min = parseTime(text);
          if (min !== null) onChange(min);
          setText(fmtTime(min ?? value));
        }}
        className={`flex-1 bg-transparent outline-none border-0 p-0 ${fieldValueCls}`}
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
/* 24h preview chart — the base-dose bar (same as the empty       */
/* Intervals page) with a dashed NEW column for the new interval. */
/* ------------------------------------------------------------- */

function PreviewChart({ baseDose, newStart, newEnd, unit }: { baseDose: number; newStart: number; newEnd: number; unit: string }) {
  const baseStr = doseStringsFor(baseDose, unit);
  return (
    <div className="absolute left-[80px] right-[80px] top-[130px]">
      <BaseDoseChart hourly={baseStr.perHour} unit={baseStr.unit} newStart={newStart} newEnd={newEnd} />
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
  const { baseDose, draft, setDraft, intervals, editingId, removeInterval, sheetReturnTo, medications } = useTherapy();
  const primaryUnit = medications[0]?.unit ?? 'µg/ml';
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
      <PreviewChart baseDose={baseDose} newStart={draft.startMin} newEnd={draft.endMin} unit={primaryUnit} />
      {/* Label */}
      <div className="absolute left-[80px] right-[80px] top-[500px] flex flex-col gap-[8px]">
        <p className="font-['Roboto',sans-serif] font-bold text-[#00769e] text-[24px] tracking-[0.1px]" style={{ fontVariationSettings: "'wdth' 100" }}>
          Label
        </p>
        <div className="bg-white border border-[#a5a5a5] rounded-[8px] h-[72px] flex items-center px-[16px] focus-within:border-[#00769e]">
          <input
            type="text"
            value={draft.label}
            onChange={e => setDraft({ ...draft, label: e.target.value })}
            placeholder='e.g. "Morning peak", "Physio", "Wind-down"'
            className={`flex-1 bg-transparent outline-none border-0 p-0 placeholder:text-[#a5a5a5] ${fieldValueCls}`}
            style={{ fontVariationSettings: "'wdth' 100" }}
          />
        </div>
        <p className="font-['Roboto',sans-serif] font-normal text-[#9ea8b2] text-[26px] tracking-[0.1px]" style={{ fontVariationSettings: "'wdth' 100" }}>{`e.g. "Morning peak", "Physio", "Wind-down"`}</p>
      </div>

      {/* Start / End time fields */}
      <div className="absolute left-[80px] right-[80px] top-[740px] flex gap-[24px] items-end">
        <div className="flex-1 flex flex-col gap-[8px]">
          <p className="font-['Roboto',sans-serif] font-bold text-[#00769e] text-[24px] tracking-[0.1px]" style={{ fontVariationSettings: "'wdth' 100" }}>
            Start
          </p>
          <TimeField value={draft.startMin} onChange={min => setDraft({ ...draft, startMin: min })} />
        </div>
        <p className="font-['Roboto',sans-serif] font-bold text-[#667380] text-[32px] pb-[20px]" style={{ fontVariationSettings: "'wdth' 100" }}>→</p>
        <div className="flex-1 flex flex-col gap-[8px]">
          <p className="font-['Roboto',sans-serif] font-bold text-[#00769e] text-[24px] tracking-[0.1px]" style={{ fontVariationSettings: "'wdth' 100" }}>
            End
          </p>
          <TimeField value={draft.endMin} onChange={min => setDraft({ ...draft, endMin: min })} />
        </div>
      </div>

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
  const pctDelta = baseDose > 0 ? Math.round(((draft.dose - baseDose) / baseDose) * 100) : 0;
  const primaryConc = medications[0] ? concUgPerUl(medications[0]) : 1;
  const primaryUnit = medications[0]?.unit ?? 'µg/ml';
  const primaryDiv = doseUnitFor(primaryUnit).div; // µg per displayed unit
  const primaryDose = doseStringsFor(draft.dose, primaryUnit);
  const coMeds = medications.slice(1);
  const lengthFraction = Math.max(0, draft.endMin - draft.startMin) / 1440;
  const ugInterval = draft.dose * lengthFraction; // primary µg over the interval
  // .perDay just reformats a raw µg amount into the primary unit (value/div).
  const intervalPrimary = doseStringsFor(ugInterval, primaryUnit);
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
      <PreviewChart baseDose={baseDose} newStart={draft.startMin} newEnd={draft.endMin} unit={primaryUnit} />
      {/* Summary row */}
      <div
        onClick={() => navigate('add-interval-when')}
        className="absolute bg-white border border-[#d9dbde] rounded-[12px] h-[80px] left-[80px] right-[80px] top-[480px] flex items-center px-[24px] gap-[24px] cursor-pointer"
      >
        <div className="w-[8px] h-[48px] rounded-[4px]" style={{ background: doseColor(draft.dose || baseDose, baseDose) }} />
        <div className="flex flex-col gap-[2px] w-[240px] shrink-0">
          <p className="font-['Roboto',sans-serif] font-bold text-[#00769e] text-[28px] tracking-[0.1px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
            {draft.label || '(no label)'}
          </p>
          <p className="font-['Roboto',sans-serif] font-normal text-[#667380] text-[18px] tracking-[0.1px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
            {fmtTime(draft.startMin)} – {endDisplay}
          </p>
        </div>
        <p className="font-['Roboto',sans-serif] font-bold text-[#0094c5] text-[40px] tracking-[0.1px] w-[120px] shrink-0" style={{ fontVariationSettings: "'wdth' 100" }}>
          {pctDelta >= 0 ? '+' : '−'} {Math.abs(pctDelta)} %
        </p>
        <p className="flex-1 font-['Roboto',sans-serif] text-[#00769e] text-[32px] tracking-[0.1px] min-w-px" style={{ fontVariationSettings: "'wdth' 100" }}>
          <span className="font-bold">{primaryDose.perHour}</span> {primaryDose.unit}/h
        </p>
        <img alt="" src={imgEditPencil} className="size-[32px] shrink-0 block" />
      </div>

      {/* Column headers */}
      <div className="absolute left-[80px] right-[80px] top-[592px] flex items-center gap-[24px]">
        <div className="w-[330px]" />
        <p className="w-[300px] font-['Roboto',sans-serif] font-bold text-[#00769e] text-[24px] tracking-[0.1px]" style={{ fontVariationSettings: "'wdth' 100" }}>Dose/h</p>
        <p className="flex-1 text-right font-['Roboto',sans-serif] font-bold text-[#00769e] text-[24px] tracking-[0.1px]" style={{ fontVariationSettings: "'wdth' 100" }}>Dose/interval</p>
      </div>

      {/* Baclofen ± row */}
      <div className="absolute left-[80px] right-[80px] top-[640px] flex items-center gap-[24px]">
        <div className="w-[330px]">
          <p className="font-['Roboto',sans-serif] tracking-[0.1px]" style={{ fontVariationSettings: "'wdth' 100" }}>
            <span className="font-bold text-[#00769e] text-[30px]">{medications[0]?.name || 'Baclofen'}</span>
            <span className="text-[#9ea8b2] text-[26px]"> {conc(0)}</span>
          </p>
        </div>
        <div className="bg-white border border-[#a5a5a5] rounded-[8px] h-[72px] w-[300px] flex items-center px-[16px] gap-[8px] focus-within:border-[#00769e]">
          <input
            type="text"
            inputMode="decimal"
            pattern="[0-9]*\.?[0-9]*"
            value={primaryDose.perHour}
            onChange={e => {
              const v = parseFloat(e.target.value.replace(/[^0-9.]/g, ''));
              const ugH = (isNaN(v) ? 0 : v) * primaryDiv; // displayed unit/h → µg/h
              setDraft({ ...draft, dose: Math.max(0, Math.min(2000, Math.round(ugH * 24))) });
            }}
            className={`flex-1 min-w-px bg-transparent outline-none border-0 p-0 text-left ${fieldValueCls}`}
            style={{ fontVariationSettings: "'wdth' 100" }}
          />
          <span className="font-['Roboto',sans-serif] font-normal text-[#a5a5a5] text-[26px] tracking-[0.1px]" style={{ fontVariationSettings: "'wdth' 100" }}>{primaryDose.unit}/h</span>
        </div>
        <div className="flex-1 flex flex-col items-end justify-center">
          <p className="font-['Roboto',sans-serif] font-bold text-[#00769e] text-[32px] tracking-[0.1px]" style={{ fontVariationSettings: "'wdth' 100" }}>
            ≈ {intervalPrimary.perDay} {intervalPrimary.unit}
          </p>
        </div>
      </div>

      {/* Co-delivered medications — derived from the primary dose + concentration */}
      {coMeds.map((m, i) => (
        <DerivedRow
          key={m.id}
          label={m.name}
          concentration={conc(i + 1)}
          unit={m.unit}
          ugDay={coDoseUgDay(draft.dose, primaryConc, concUgPerUl(m))}
          lengthFraction={lengthFraction}
          top={740 + i * 80}
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
  label, concentration, unit, ugDay, lengthFraction, top,
}: {
  label: string;
  concentration: string;
  unit: string;         // co-med concentration unit (drives mg vs µg display)
  ugDay: number;        // co-med dose at the primary's interval rate (µg/day)
  lengthFraction: number; // interval length as a fraction of the day
  top: number;
}) {
  const d = doseStringsFor(ugDay, unit);
  // .perDay reformats a raw µg amount into `unit` (value/div).
  const intervalStr = doseStringsFor(ugDay * lengthFraction, unit).perDay;
  return (
    <div className="absolute left-[80px] right-[80px] flex items-center gap-[24px]" style={{ top }}>
      <div className="w-[330px]">
        <p className="font-['Roboto',sans-serif] tracking-[0.1px]" style={{ fontVariationSettings: "'wdth' 100" }}>
          <span className="font-bold text-[#00769e] text-[30px]">{label}</span>
          <span className="text-[#9ea8b2] text-[26px]"> {concentration}</span>
        </p>
      </div>
      <div className="w-[300px] flex items-baseline gap-[8px] px-[20px]">
        <span className="font-['Roboto',sans-serif] font-normal text-[#45483c] text-[40px] tracking-[0.1px]" style={{ fontVariationSettings: "'wdth' 100" }}>{d.perHour}</span>
        <span className="font-['Roboto',sans-serif] font-normal text-[#9ea8b2] text-[26px] tracking-[0.1px]" style={{ fontVariationSettings: "'wdth' 100" }}>{d.unit}/h</span>
      </div>
      <div className="flex-1 flex flex-col items-end justify-center">
        <p className="font-['Roboto',sans-serif] font-bold text-[#00769e] text-[32px] tracking-[0.1px]" style={{ fontVariationSettings: "'wdth' 100" }}>
          ≈ {intervalStr} {d.unit}
        </p>
      </div>
    </div>
  );
}
