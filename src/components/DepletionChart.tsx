import { RESERVOIR_ML } from '../therapy';
import { PUMP_BODY, PUMP_PORT, PUMP_W, PUMP_H, RES_CX, RES_CY, RES_R } from './pumpPaths';

const FONT = 'Roboto, sans-serif';
const wdth = { fontVariationSettings: "'wdth' 100" } as const;

const BLUE = '#0094c5';
const BLUE_DARK = '#00769e';
const RED = '#cc5457';
const RED_LIGHT = '#f7d7d5';
const GREY = '#a5a5a5';
const GREY_TEXT = '#6f7470';
const TIE = '#daddd7';
const WATERMARK = '#f0f0f0';

/* ── Geometry (Figma 10076:139147 — a 1033 × 416 block) ─────────────────────
 * Both axes are linear in volume: the reservoir drains at a constant rate, so
 * "how much is left" and "how long until it is gone" are the same number read
 * two ways. That is what lets the chart place a date without being handed one.
 */
const W = 1033;
const H = 416;
const X_TODAY = 176; // the day the reservoir holds `fillMl`
const X_EMPTY = 876; // the day it reaches zero
const Y_FULL = 113;  // RESERVOIR_ML
const Y_ZERO = 299;  // 0 ml
const TIE_X0 = 24, TIE_X1 = 923;   // dotted level lines run past the plot
const AXIS_X0 = 154, AXIS_X1 = 933;
const TICK_Y = 329;  // where every marker line ends
const NAME_Y = 356, DATE_Y = 388;  // text baselines under the axis

// The watermark is the pump itself, sized so its reservoir interior lands on
// the value axis: a level then reads across the pump and the chart as one line.
const GAUGE_CX = X_TODAY;
const GAUGE_CY = (Y_FULL + Y_ZERO) / 2;
const GAUGE_R = (Y_ZERO - Y_FULL) / 2;
const PUMP_SCALE = GAUGE_R / RES_R;

// Two markers a couple of days apart would collide. Their labels are nudged
// apart by at least this much — the lines themselves always stay truthful.
const MIN_LABEL_GAP = 104;

/**
 * Volumes to one decimal, dropping a trailing ".0" — so a pill and the sentence
 * under the chart never disagree about the same number.
 */
export function formatMl(ml: number) {
  return ml.toFixed(1).replace(/\.0$/, '');
}

/** Rounded tag naming the volume at a marker, centred on it. */
function Pill({ x, y, label, fill, stroke }: { x: number; y: number; label: string; fill: string; stroke?: string }) {
  // Digits are the widest character in a volume, so sizing off the count with a
  // digit's advance never comes out too narrow.
  const w = label.length * 12.5 + 30;
  return (
    <g>
      <rect x={x - w / 2} y={y - 20} width={w} height={40} rx={20} fill={fill} stroke={stroke} strokeWidth={stroke ? 1 : 0} />
      <text x={x} y={y + 8} textAnchor="middle" fontFamily={FONT} fontWeight={700} fontSize={22} fill="#fff" style={wdth}>
        {label}
      </text>
    </g>
  );
}

/** Dashed rule marking one volume, running the width of the block. */
function LevelTie({ y }: { y: number }) {
  return <line x1={TIE_X0} y1={y} x2={TIE_X1} y2={y} stroke={TIE} strokeWidth={2} strokeDasharray="5 7" />;
}

type Props = {
  /** Volume in the reservoir today — the high end of the drain line. */
  fillMl: number;
  /** Volume at which the pump raises its low-reservoir alarm. */
  alertMl: number;
  /** Full date under the "Today" marker. */
  todayLabel: string;
  /** Short dates under the projections; '—' when no therapy is running. */
  alertLabel: string;
  emptyLabel: string;
  /**
   * The planned refill. Adds a third marker and shades the buffer it leaves
   * above the alarm — the span the Refill Date step exists to set.
   */
  refill?: { ml: number; label: string } | null;
};

/**
 * The reservoir emptying over time: full today at the left, zero at the right,
 * with the alarm threshold (and optionally the planned refill) marked along the
 * way. Everything is derived from two volumes and the drain being linear, so
 * the picture cannot drift from the figures the step reports.
 */
export function DepletionChart({ fillMl, alertMl, todayLabel, alertLabel, emptyLabel, refill }: Props) {
  // With nothing in the reservoir there is no time axis to draw against; fall
  // back to the full reservoir so the empty chart still has sane proportions.
  const span = fillMl > 0 ? fillMl : RESERVOIR_ML;
  const xFor = (ml: number) => X_TODAY + ((span - ml) / span) * (X_EMPTY - X_TODAY);
  const yFor = (ml: number) => Y_ZERO - (ml / RESERVOIR_ML) * (Y_ZERO - Y_FULL);

  const yFill = yFor(fillMl);
  const yAlert = yFor(alertMl);
  const xAlert = xFor(alertMl);

  const refillMl = refill ? Math.min(Math.max(refill.ml, 0), fillMl) : null;
  const yRefill = refillMl != null ? yFor(refillMl) : 0;
  const xRefill = refillMl != null ? xFor(refillMl) : 0;

  // Left to right, so the nudge below can walk them in order. "Empty" is left
  // out: it always ends the axis, so its label is set beside its line instead of
  // under it, which is what keeps the alert label near where it belongs.
  const marks = [
    { x: X_TODAY, name: 'Today', date: todayLabel, color: GREY_TEXT, bold: false, big: false },
    ...(refill && refillMl != null
      ? [{ x: xRefill, name: 'Refill', date: refill.label, color: BLUE_DARK, bold: true, big: true }]
      : []),
    { x: xAlert, name: 'Alert', date: alertLabel, color: RED, bold: true, big: false },
  ];
  const labelX = marks.map(m => m.x);
  // Clear the "Empty" block first, then let each label to the left give way.
  labelX[labelX.length - 1] = Math.min(labelX[labelX.length - 1], X_EMPTY - 32);
  for (let i = labelX.length - 2; i >= 0; i--) {
    labelX[i] = Math.min(labelX[i], labelX[i + 1] - MIN_LABEL_GAP);
  }

  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} fill="none" className="shrink-0">
      <defs>
        {/* Only the half of the reservoir left of "Today" is drawn — the other
            half would sit under the plot and tint it twice. */}
        <clipPath id="depletionGauge">
          <path d={`M${GAUGE_CX},${GAUGE_CY - GAUGE_R} A${GAUGE_R},${GAUGE_R} 0 0 0 ${GAUGE_CX},${GAUGE_CY + GAUGE_R} Z`} />
        </clipPath>
      </defs>

      {/* The pump, ghosted behind the plot */}
      <svg
        x={GAUGE_CX - RES_CX * PUMP_SCALE}
        y={GAUGE_CY - RES_CY * PUMP_SCALE}
        width={PUMP_W * PUMP_SCALE}
        height={PUMP_H * PUMP_SCALE}
        viewBox={`0 0 ${PUMP_W} ${PUMP_H}`}
      >
        <path d={PUMP_BODY} fill={WATERMARK} />
        <path d={PUMP_PORT} fill={WATERMARK} />
      </svg>

      {/* The same levels inside the pump's reservoir, so the two read as one */}
      <g clipPath="url(#depletionGauge)">
        <rect x={GAUGE_CX - GAUGE_R} y={yFill} width={GAUGE_R} height={Y_ZERO - yFill} fill={BLUE} fillOpacity={0.4} />
        {refillMl != null && (
          <rect x={GAUGE_CX - GAUGE_R} y={yRefill} width={GAUGE_R} height={yAlert - yRefill} fill={BLUE} fillOpacity={0.5} />
        )}
        <rect x={GAUGE_CX - GAUGE_R} y={yAlert} width={GAUGE_R} height={Y_ZERO - yAlert} fill={RED_LIGHT} />
      </g>

      {/* Volume remaining, day by day */}
      <polygon points={`${X_TODAY},${yFill} ${X_EMPTY},${Y_ZERO} ${X_TODAY},${Y_ZERO}`} fill={BLUE} fillOpacity={0.4} />

      {/* The reserve below the alarm — what is left once the pump complains */}
      <polygon
        points={`${X_TODAY},${yAlert} ${xAlert},${yAlert} ${X_EMPTY},${Y_ZERO} ${X_TODAY},${Y_ZERO}`}
        fill={RED_LIGHT}
      />

      {/* The buffer the planned refill leaves above the alarm */}
      {refillMl != null && (
        <polygon
          points={`${X_TODAY},${yRefill} ${xRefill},${yRefill} ${xAlert},${yAlert} ${X_TODAY},${yAlert}`}
          fill={BLUE}
          fillOpacity={0.5}
        />
      )}

      <LevelTie y={yFill} />
      {refillMl != null && <LevelTie y={yRefill} />}
      <LevelTie y={yAlert} />

      <line x1={X_TODAY} y1={yFill} x2={X_EMPTY} y2={Y_ZERO} stroke={BLUE} strokeWidth={5} strokeLinecap="round" />
      <line x1={AXIS_X0} y1={Y_ZERO} x2={AXIS_X1} y2={Y_ZERO} stroke={GREY} strokeWidth={5} />

      {/* Marker lines — each rises from the axis to the level it stands for */}
      <line x1={X_TODAY} y1={Y_FULL - 22} x2={X_TODAY} y2={TICK_Y} stroke={GREY} strokeWidth={5} />
      {refillMl != null && <line x1={xRefill} y1={yRefill} x2={xRefill} y2={TICK_Y} stroke={BLUE_DARK} strokeWidth={5} />}
      <line x1={xAlert} y1={yAlert} x2={xAlert} y2={TICK_Y} stroke={RED} strokeWidth={5} />
      <line x1={X_EMPTY} y1={Y_ZERO + 2} x2={X_EMPTY} y2={TICK_Y} stroke={GREY} strokeWidth={5} />

      {refillMl != null && (
        <Pill x={xRefill} y={yRefill} label={`${formatMl(refillMl)} ml`} fill={BLUE_DARK} />
      )}
      <Pill x={xAlert} y={yAlert} label={`${alertMl} ml`} fill={RED} stroke={BLUE_DARK} />

      {marks.map((m, i) => (
        <g key={m.name}>
          <text
            x={labelX[i]} y={NAME_Y} textAnchor="middle"
            fontFamily={FONT} fontWeight={m.bold ? 700 : 400} fontSize={22} fill={m.color} style={wdth}
          >
            {m.name}
          </text>
          <text
            x={labelX[i]} y={m.big ? DATE_Y + 2 : DATE_Y} textAnchor="middle"
            fontFamily={FONT} fontWeight={m.big ? 700 : 400} fontSize={m.big ? 26 : 22} fill={m.color} style={wdth}
          >
            {m.date}
          </text>
        </g>
      ))}

      <text x={X_EMPTY + 12} y={NAME_Y} fontFamily={FONT} fontWeight={400} fontSize={22} fill={GREY_TEXT} style={wdth}>
        Empty
      </text>
      <text x={X_EMPTY + 12} y={DATE_Y} fontFamily={FONT} fontWeight={400} fontSize={22} fill={GREY_TEXT} style={wdth}>
        {emptyLabel}
      </text>
    </svg>
  );
}
