import { RESERVOIR_ML } from '../therapy';
import { DIAG_PUMP_OUTLINE, DIAG_PUMP_RING, DIAG_PUMP_VALVE, DIAG_RES_CX, DIAG_RES_CY, DIAG_RES_R } from './pumpPaths';

const FONT = 'Roboto, sans-serif';
const wdth = { fontVariationSettings: "'wdth' 100" } as const;

const BLUE = '#0094c5';
const BLUE_DARK = '#00769e';
const RED = '#cc5457';
const RED_LIGHT = '#f7d7d5';
const GREY = '#a5a5a5';
const GREY_TEXT = '#45483c';
const TIE = '#cbcbcb';

/* ── Geometry (Figma 10231:53556 — a 1040 × 419 block) ─────────────────────
 * Both axes are linear in volume: the reservoir drains at a constant rate, so
 * "how much is left" and "how long until it is gone" are the same number read
 * two ways. That is what lets the chart place a date without being handed one.
 */
const W = 1040;
const H = 419;
const X_TODAY = 193; // the day the reservoir holds `fillMl`
const X_EMPTY = 970; // the day it reaches zero
const Y_FULL = 80;   // RESERVOIR_ML
const Y_ZERO = 288;  // 0 ml
const TIE_X0 = 24, TIE_X1 = 1022;   // dashed level lines run past the plot
const AXIS_X0 = 170.5, AXIS_X1 = 1037.5, AXIS_Y = 285.5;
const RULE_W = 5;
const RULE_Y = 321;  // where every marker rule ends
const NAME_Y = 353, DATE_Y = 390;  // text baselines under the axis
// The "Today" rule is decorative: it rises clear of the fill line rather than
// standing for a level of its own.
const TODAY_RULE_TOP = 57;
const CHIP_H = 40;

// The pump is drawn at the size the diagram was authored at, so its reservoir
// interior already straddles the value axis: a level reads across the pump and
// the chart as one line. Right of "Today" it is washed out, letting the plot —
// which starts there — sit on top of it cleanly.
const FADE_W = 150;

// Two markers a couple of days apart would collide. Their labels are nudged
// apart by at least this much — the lines themselves always stay truthful.
// Sized to the widest label pair ("Empty" over "02.11"), so the gap is what
// separates them rather than a round number that costs more room than it needs.
const MIN_LABEL_GAP = 70;
// Furthest a label can be centred and still sit inside the block.
const LABEL_EDGE = W - 40;

/**
 * Volumes to one decimal, dropping a trailing ".0" — so a chip and the sentence
 * under the chart never disagree about the same number.
 */
export function formatMl(ml: number) {
  return ml.toFixed(1).replace(/\.0$/, '');
}

/** Rounded tag naming the volume at a marker, centred on it. */
function Chip({ x, y, label, fill }: { x: number; y: number; label: string; fill: string }) {
  // 20px bold digits are the widest character in a volume, so sizing off the
  // count with a digit's advance never comes out too narrow.
  const w = label.length * 11 + 36;
  return (
    <g>
      <rect x={x - w / 2} y={y - CHIP_H / 2} width={w} height={CHIP_H} rx={CHIP_H / 2} fill={fill} />
      <text x={x} y={y + 7} textAnchor="middle" fontFamily={FONT} fontWeight={700} fontSize={20} letterSpacing={0.1} fill="#fff" style={wdth}>
        {label}
      </text>
    </g>
  );
}

/** Dashed rule marking one volume, running the width of the block. */
function LevelTie({ y }: { y: number }) {
  return <line x1={TIE_X0} y1={y} x2={TIE_X1} y2={y} stroke={TIE} strokeWidth={2} strokeDasharray="5 7" />;
}

/**
 * Vertical stalk under a marker. It starts at the level the marker stands for —
 * or just below the chip covering it — and always ends on the label row, so the
 * four markers share one baseline no matter how far apart their levels are.
 */
function Rule({ x, top, fill }: { x: number; top: number; fill: string }) {
  return <rect x={x - RULE_W / 2} y={top} width={RULE_W} height={Math.max(0, RULE_Y - top)} rx={RULE_W / 2} fill={fill} />;
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

  // Left to right, so the nudge below can walk them in order.
  const marks = [
    { key: 'today', x: X_TODAY, name: 'Today', date: todayLabel, color: GREY_TEXT, nameBold: false, dateBold: false },
    ...(refill && refillMl != null
      ? [{ key: 'refill', x: xRefill, name: 'Refill', date: refill.label, color: BLUE_DARK, nameBold: true, dateBold: true }]
      : []),
    { key: 'alert', x: xAlert, name: 'Alert', date: alertLabel, color: RED, nameBold: true, dateBold: false },
    { key: 'empty', x: X_EMPTY, name: 'Empty', date: emptyLabel, color: GREY_TEXT, nameBold: false, dateBold: false },
  ];
  // The alert is the marker the whole plan is read against, so it is the one
  // that keeps its own line and the labels either side give way around it:
  // "Empty" slides right towards the edge of the block, and everything to the
  // left walks left in turn. (Anchoring on the rightmost marker instead would
  // push the alert label off its red rule whenever the two fall close together,
  // which is exactly when it matters most.)
  const labelX = marks.map(m => m.x);
  const iAlert = marks.findIndex(m => m.key === 'alert');
  for (let i = iAlert + 1; i < labelX.length; i++) {
    labelX[i] = Math.min(LABEL_EDGE, Math.max(labelX[i], labelX[i - 1] + MIN_LABEL_GAP));
  }
  for (let i = iAlert - 1; i >= 0; i--) {
    labelX[i] = Math.min(labelX[i], labelX[i + 1] - MIN_LABEL_GAP);
  }

  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} fill="none" className="shrink-0">
      <defs>
        <clipPath id="depletionGauge">
          <circle cx={DIAG_RES_CX} cy={DIAG_RES_CY} r={DIAG_RES_R} />
        </clipPath>
      </defs>

      {/* The reservoir, filled to the same levels as the plot beside it */}
      <g clipPath="url(#depletionGauge)">
        <rect x={DIAG_RES_CX - DIAG_RES_R} y={yFill} width={DIAG_RES_R * 2} height={Y_ZERO - yFill} fill={BLUE} fillOpacity={0.4} />
        {refillMl != null && (
          <rect x={DIAG_RES_CX - DIAG_RES_R} y={yRefill} width={DIAG_RES_R * 2} height={Math.max(0, yAlert - yRefill)} fill={BLUE} fillOpacity={0.5} />
        )}
        <rect x={DIAG_RES_CX - DIAG_RES_R} y={yAlert} width={DIAG_RES_R * 2} height={Y_ZERO - yAlert} fill={RED_LIGHT} />
      </g>

      {/* The pump around it — wall, reservoir ring and fill port */}
      <path d={DIAG_PUMP_OUTLINE} fill={BLUE} />
      <path d={DIAG_PUMP_RING} fill={BLUE} fillRule="evenodd" clipRule="evenodd" />
      <path d={DIAG_PUMP_VALVE} fill={BLUE} />
      {/* …washed out from "Today" rightwards, where the plot takes over */}
      <rect x={X_TODAY} y={0} width={FADE_W} height={H} fill="#fff" fillOpacity={0.75} />

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

      <line x1={AXIS_X0} y1={AXIS_Y} x2={AXIS_X1} y2={AXIS_Y} stroke={GREY} strokeWidth={5} strokeLinecap="round" />
      <line x1={X_TODAY} y1={yFill} x2={X_EMPTY} y2={Y_ZERO} stroke={BLUE} strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" />

      {/* Marker rules — each drops from the level it stands for to the labels */}
      <Rule x={X_TODAY} top={TODAY_RULE_TOP} fill={GREY} />
      {refillMl != null && <Rule x={xRefill} top={yRefill + CHIP_H / 2} fill={BLUE} />}
      <Rule x={xAlert} top={yAlert + CHIP_H / 2} fill={RED} />
      <Rule x={X_EMPTY} top={Y_ZERO + 2} fill={GREY} />

      {refillMl != null && (
        <Chip x={xRefill} y={yRefill} label={`${formatMl(refillMl)} ml`} fill={BLUE_DARK} />
      )}
      <Chip x={xAlert} y={yAlert} label={`${formatMl(alertMl)} ml`} fill={RED} />

      {marks.map((m, i) => (
        <g key={m.key}>
          <text
            x={labelX[i]} y={NAME_Y} textAnchor="middle"
            fontFamily={FONT} fontWeight={m.nameBold ? 700 : 400} fontSize={24} letterSpacing={0.1} fill={m.color} style={wdth}
          >
            {m.name}
          </text>
          <text
            x={labelX[i]} y={DATE_Y} textAnchor="middle"
            fontFamily={FONT} fontWeight={m.dateBold ? 700 : 400} fontSize={24} letterSpacing={0.1} fill={m.color} style={wdth}
          >
            {m.date}
          </text>
        </g>
      ))}
    </svg>
  );
}
