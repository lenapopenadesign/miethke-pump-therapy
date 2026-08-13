import { useEffect, useRef, useState, type ReactNode } from 'react';

const wdth = { fontVariationSettings: "'wdth' 100" } as const;
const FONT = "font-['Roboto',sans-serif]";

/** Height every field in the prototype shares (Figma Input_Master 2377:6255). */
export const FIELD_H = 72;

// One definition of how a value reads inside a field — every editable field in
// the prototype uses it, so they can't drift apart. Set bold and a size up from
// the surrounding body text: in this app a field always holds a number someone
// has to read at arm's length.
const fieldValueType = `${FONT} font-bold text-[36px] tracking-[0.1px]`;
/** Value typography inside a field: Roboto Regular on the dark grey ink. */
export const fieldValueCls = `${fieldValueType} text-[#45483c]`;
/** The same type, greyed — an empty field, or one showing a placeholder. */
export const fieldPlaceholderCls = `${fieldValueType} text-[#a5a5a5]`;
/** The grey unit that trails a value ("mg/d", "mg/del"). */
export const fieldUnitCls = `${FONT} font-normal text-[#a5a5a5] text-[24px] tracking-[0.1px] whitespace-nowrap`;
/**
 * The label above a field — bold teal, sentence case, flush with the field's
 * left edge. One definition for the whole app, so the Default Delivery table,
 * the medication rows and the customised-delivery sheet all name their fields
 * the same way.
 */
export const fieldLabelCls = `${FONT} font-bold text-[#00769e] text-[24px] leading-[28px] tracking-[0.1px]`;

export function FieldLabel({ className = '', children }: { className?: string; children: ReactNode }) {
  return <p className={`${fieldLabelCls} pb-[8px] ${className}`} style={wdth}>{children}</p>;
}

/**
 * The one input frame the prototype uses everywhere (Figma Input_Master
 * 2377:6255): 72px tall, 8px radius, a hairline grey border that turns teal
 * while the field has focus, and an optional bold teal label above it.
 *
 * The frame owns only the chrome. Screens drop whatever they need inside — a
 * text input, a value + unit pair, a stepper readout, a dropdown — so every
 * field in the app lines up at the same height and weight even where the
 * contents differ.
 */
export function Field({ label, children, trailing, active = false, className = '', style }: {
  label?: ReactNode;
  children: ReactNode;
  /** Slot pinned to the right edge — a caret, a pencil, a unit. */
  trailing?: ReactNode;
  /** Force the focus (teal) border, e.g. while this field's menu is open. */
  active?: boolean;
  className?: string;
  /** Sizing the caller owns, e.g. a fixed width. */
  style?: React.CSSProperties;
}) {
  return (
    <div className={`flex flex-col min-w-0 ${className}`} style={style}>
      {label != null && <FieldLabel>{label}</FieldLabel>}
      <div
        className={`bg-white border rounded-[8px] flex items-center gap-[8px] pl-[16px] ${trailing ? 'pr-[8px]' : 'pr-[16px]'} ${
          active ? 'border-[#00769e]' : 'border-[#a5a5a5] focus-within:border-[#00769e]'
        }`}
        style={{ height: FIELD_H }}
      >
        <div className="flex-1 min-w-px flex items-baseline gap-[8px] overflow-hidden">{children}</div>
        {trailing}
      </div>
    </div>
  );
}

/** {@link Field} wrapping a plain text entry, with an optional trailing unit. */
export function TextField({
  label, value, onChange, placeholder, unit, inputMode = 'text', autoFocus,
  onFocus, onBlur, className = '', inputClassName = '', unitClassName = '',
}: {
  label?: ReactNode;
  value: string;
  onChange: (raw: string) => void;
  placeholder?: string;
  /** Static unit shown after the value, inside the frame. */
  unit?: ReactNode;
  inputMode?: 'text' | 'decimal' | 'numeric';
  autoFocus?: boolean;
  onFocus?: (e: React.FocusEvent<HTMLInputElement>) => void;
  onBlur?: () => void;
  className?: string;
  /** Overrides the value typography where a screen wants a louder readout. */
  inputClassName?: string;
  unitClassName?: string;
}) {
  return (
    <Field label={label} className={className}>
      <input
        type="text"
        inputMode={inputMode}
        value={value}
        autoFocus={autoFocus}
        onFocus={onFocus}
        onBlur={onBlur}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className={`flex-1 min-w-px bg-transparent outline-none border-0 p-0 placeholder:text-[#a5a5a5] ${inputClassName || fieldValueCls}`}
        style={{ fontFamily: 'Roboto, sans-serif', ...wdth }}
      />
      {unit != null && <span className={unitClassName || fieldUnitCls} style={wdth}>{unit}</span>}
    </Field>
  );
}

/**
 * Read-only sibling of {@link Field}: the same box at the same height, filled
 * light blue instead of outlined, for values the screen derives rather than
 * asks for.
 */
export function Readout({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={`bg-[#e6f4f9] rounded-[8px] flex items-center gap-[8px] px-[20px] min-w-0 ${className}`}
      style={{ height: FIELD_H }}
    >
      {children}
    </div>
  );
}

/** Caret closing a {@link SelectField} — points down at rest, up while open. */
function Caret({ open }: { open: boolean }) {
  return (
    <svg width="26" height="14" viewBox="0 0 24 12" fill="none" className={`shrink-0 mr-[8px] transition-transform duration-150 ${open ? 'rotate-180' : ''}`}>
      <path d="M2 2L12 10L22 2" stroke="#6b7885" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function OptionCheck() {
  return (
    <svg width="20" height="16" viewBox="0 0 20 16" fill="none" className="shrink-0">
      <path d="M2 8.5L7 13.5L18 2.5" stroke="#0094c5" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export type SelectOption = { value: number; label: string };

const OPTION_H = 76;

/** Nearest ancestor that would clip an overflowing menu. */
function clippingParent(el: HTMLElement | null): HTMLElement | null {
  let n = el?.parentElement ?? null;
  while (n) {
    if (/(auto|scroll|hidden)/.test(getComputedStyle(n).overflowY)) return n;
    n = n.parentElement;
  }
  return null;
}

/**
 * {@link Field} that picks from a fixed list rather than accepting free text.
 * The menu drops beneath the field and scrolls, so a long list — every delivery
 * moment in a 150-per-day schedule — stays usable; it opens parked on the
 * current choice instead of at the top.
 *
 * The menu floats over what follows rather than pushing it, so opening one never
 * moves the page under the reader's finger. These fields live inside sheets that
 * clip their overflow, so on open the menu measures the room left below the
 * field and caps its own height to it — it can grow to `menuMaxH`, never past
 * the edge it would be cut off at.
 */
export function SelectField({
  value, options, onChange, placeholder = '--:--', label, name, className = '', menuMaxH = 380,
}: {
  /** null = nothing picked yet; the field reads `placeholder` in grey. */
  value: number | null;
  options: SelectOption[];
  onChange: (v: number) => void;
  placeholder?: string;
  label?: ReactNode;
  /** Plain-text name of the field, for the control's accessible label. */
  name?: string;
  className?: string;
  menuMaxH?: number;
}) {
  const [open, setOpen] = useState(false);
  // Height the menu is allowed to take, measured against whatever would clip it.
  const [maxH, setMaxH] = useState(menuMaxH);
  const menuRef = useRef<HTMLDivElement>(null);
  const anchorRef = useRef<HTMLDivElement>(null);
  const selected = options.find(o => o.value === value) ?? null;

  // On open: fit the menu to the room below the field, then park it on the
  // current choice — in a 150-entry list that is otherwise far below the fold.
  useEffect(() => {
    if (!open) return;
    const anchor = anchorRef.current;
    const el = menuRef.current;
    if (!anchor || !el) return;

    const clip = clippingParent(anchor);
    if (clip) {
      const rect = anchor.getBoundingClientRect();
      // The canvas is CSS-scaled, so rects are in scaled pixels while our
      // layout values are not; the ratio recovers the scale.
      const scale = anchor.offsetHeight > 0 ? rect.height / anchor.offsetHeight : 1;
      const room = (clip.getBoundingClientRect().bottom - rect.bottom) / (scale || 1) - 16;
      setMaxH(Math.max(2 * OPTION_H, Math.min(menuMaxH, room)));
    }

    const i = options.findIndex(o => o.value === value);
    if (i >= 0) el.scrollTop = Math.max(0, i * OPTION_H - el.clientHeight / 2 + OPTION_H / 2);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  return (
    <div ref={anchorRef} className={`relative min-w-0 ${open ? 'z-40' : ''} ${className}`}>
      {/* Click-away layer. `fixed` resolves against the scaled canvas, so it
          covers the screen without escaping the device frame. */}
      {open && <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />}
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        aria-label={name}
        aria-expanded={open}
        className="w-full text-left cursor-pointer relative z-40"
      >
        <Field label={label} active={open} trailing={<Caret open={open} />}>
          <span className={`${selected ? fieldValueCls : fieldPlaceholderCls} whitespace-nowrap`} style={wdth}>
            {selected ? selected.label : placeholder}
          </span>
        </Field>
      </button>
      {open && (
        <div
          ref={menuRef}
          className="absolute left-0 right-0 top-[calc(100%+8px)] z-40 bg-white border border-[#a5a5a5] rounded-[8px] overflow-y-auto shadow-[0px_12px_32px_0px_rgba(0,0,0,0.16)]"
          style={{ maxHeight: maxH }}
        >
          {options.map((o, i) => (
            <button
              key={o.value}
              type="button"
              onClick={() => { onChange(o.value); setOpen(false); }}
              className={`w-full px-[28px] flex items-center justify-between gap-[16px] cursor-pointer ${i > 0 ? 'border-t-2 border-[#e6f4f9]' : ''} ${o.value === value ? 'bg-[#e6f4f9]' : 'bg-white'}`}
              style={{ height: OPTION_H }}
            >
              <span
                className={`${FONT} text-[28px] tracking-[0.1px] whitespace-nowrap ${o.value === value ? 'font-bold text-[#00769e]' : 'font-normal text-[#45483c]'}`}
                style={wdth}
              >
                {o.label}
              </span>
              {o.value === value && <OptionCheck />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
