import { useState } from 'react';
import { useNavigate } from '../navigation';
import {
  useTherapy, fmtTime, doseColor, doseStringsFor, estimatedDailyTotal, withBaseFillers,
  deliveryPlan, doseUnitFor, fmtDose, fmtInterval, STROKE_OPTIONS,
  type Interval,
} from '../therapy';
import { DetailShell } from '../components/DetailShell';
import { MedSummary } from '../components/MedSummary';
import { TherapyIcon } from '../components/HomeShell';

const imgClin1 = "/icons/act-clinician-1.svg";
const imgClin2 = "/icons/act-clinician-2.svg";

function timeRangeLabel(startMin: number, endMin: number): string {
  const endDisplay = endMin >= 1440 ? '23:59' : fmtTime(Math.max(0, endMin - 1));
  return `${fmtTime(startMin)} - ${endDisplay}`;
}

/* 24h dose chart (base-dose fillers + interval bars), same as the Intervals page. */
function Chart({ intervals, baseDose, unit }: { intervals: Interval[]; baseDose: number; unit: string }) {
  const slots = withBaseFillers(intervals, baseDose);
  const maxDose = Math.max(baseDose, ...slots.map(s => s.dose), 1);
  const CHART_H = 330, FLOOR = 256, MAX_BAR = 210;
  return (
    <div className="relative w-full bg-[#f7fafc] border border-[#d9dbde] rounded-[16px]" style={{ height: CHART_H }}>
      {['00:00', '06:00', '12:00', '18:00', '24:00'].map((t, i) => {
        const first = i === 0, last = i === 4;
        return (
          <p key={t} className="absolute font-['Roboto',sans-serif] text-[#9ea8b2] text-[26px] top-[18px] whitespace-nowrap"
             style={{ left: last ? undefined : first ? 16 : `${(i / 4) * 100}%`, right: last ? 16 : undefined, transform: first || last ? undefined : 'translateX(-50%)', fontVariationSettings: "'wdth' 100" }}>{t}</p>
        );
      })}
      {slots.map(slot => {
        const left = (slot.startMin / 1440) * 100;
        const width = ((slot.endMin - slot.startMin) / 1440) * 100;
        const height = (slot.dose / maxDose) * MAX_BAR;
        return (
          <div key={slot.id} className="absolute rounded-[4px] flex items-start justify-center overflow-hidden"
            style={{ left: `${left}%`, width: `${width}%`, top: FLOOR - height, height, background: doseColor(slot.dose, baseDose), opacity: slot.isBase ? 0.7 : 1 }}>
            {width > 7 && (
              <p className="font-['Roboto',sans-serif] font-bold text-[20px] text-white pt-[10px] tracking-[0.1px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
                {doseStringsFor(slot.dose, unit).perHour} {doseStringsFor(slot.dose, unit).unit}/h
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ----- bottom action tiles (filled blue, white glyph) ----- */
function ActionTile({ label, onClick, children }: { label: string; onClick?: () => void; children: React.ReactNode }) {
  return (
    <div onClick={onClick} className="bg-[#0094c5] rounded-[16px] flex-1 h-[230px] flex flex-col items-center justify-center gap-[16px] overflow-clip px-[16px] py-[20px] cursor-pointer">
      <div className="relative size-[96px] flex items-center justify-center shrink-0">{children}</div>
      <span className="font-['Roboto',sans-serif] font-bold text-white text-[28px] tracking-[0.1px] text-center" style={{ fontVariationSettings: "'wdth' 100" }}>{label}</span>
    </div>
  );
}
function ClinicianGlyph() {
  return (
    <div className="relative size-[96px]">
      <div className="absolute inset-[6.25%_33.75%_21.25%_11.25%]"><img alt="" src={imgClin1} className="absolute inset-0 block max-w-none size-full" /></div>
      <div className="absolute inset-[20%_11.25%_5%_66.25%]"><img alt="" src={imgClin2} className="absolute inset-0 block max-w-none size-full" /></div>
    </div>
  );
}
function PencilGlyph() {
  return (
    <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
      <path d="M4 20h4l10-10-4-4L4 16v4z" stroke="white" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M14 6l4 4" stroke="white" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}
function PlusGlyph() {
  return (
    <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
      <path d="M12 4v16M4 12h16" stroke="white" strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  );
}
function StopGlyph() {
  return <div className="size-[52px] rounded-[6px] bg-white" />;
}

/* ----- Mon–Fri / Sat–Sun toggle ----- */
function WeekToggle({ tab, setTab }: { tab: 'weekdays' | 'weekend'; setTab: (t: 'weekdays' | 'weekend') => void }) {
  return (
    <div className="flex gap-[8px] bg-white border border-[#d9dbde] rounded-[12px] p-[6px] w-full">
      {(['weekdays', 'weekend'] as const).map(t => {
        const active = tab === t;
        return (
          <div key={t} onClick={() => setTab(t)}
            className={`flex-1 flex items-center justify-center py-[16px] rounded-[8px] cursor-pointer select-none ${active ? 'bg-[#0094c5]' : ''}`}>
            <p className={`font-['Roboto',sans-serif] font-bold text-[28px] tracking-[0.1px] ${active ? 'text-white' : 'text-[#5f7388]'}`} style={{ fontVariationSettings: "'wdth' 100" }}>
              {t === 'weekdays' ? 'Mon–Fri' : 'Sat–Sun'}
            </p>
          </div>
        );
      })}
    </div>
  );
}

const listGrid = 'grid items-center [grid-template-columns:1fr_220px_160px_180px_56px]';
const listHdr = "font-['Roboto',sans-serif] font-bold text-[#00769e] text-[22px] tracking-[1px]";

export function TherapyDetail() {
  const navigate = useNavigate();
  const {
    intervals, weekendIntervals, baseDose, useBaseOnly, medications, dayPattern,
    startEditingInterval, strokeStrategy, setFlowMode, setTherapyActive,
  } = useTherapy();
  const [tab, setTab] = useState<'weekdays' | 'weekend'>('weekdays');
  const primaryUnit = medications[0]?.unit ?? 'µg/ml';
  const showTabs = !useBaseOnly && dayPattern !== 'same';
  const selected = useBaseOnly ? [] : [...(tab === 'weekend' ? weekendIntervals : intervals)].sort((a, b) => a.startMin - b.startMin);
  const estDaily = useBaseOnly ? baseDose : estimatedDailyTotal(baseDose, selected);

  const strokeOpt = STROKE_OPTIONS.find(s => s.bundle === strokeStrategy) ?? STROKE_OPTIONS[0];
  const plan = deliveryPlan(baseDose, strokeOpt.intervalMin);
  const primary = doseUnitFor(primaryUnit);

  const onEditInterval = (id: string) => { startEditingInterval(id, 'therapy-detail'); navigate('add-interval-when'); };
  const onEdit = () => navigate(useBaseOnly ? 'regular-therapy' : 'intervals-populated');
  const onNew = () => { setFlowMode('setup'); navigate('add-medication'); };
  const onStop = () => { setTherapyActive(false); navigate('home-no-therapy'); };
  const onClinicianBolus = () => navigate('actions');

  return (
    <DetailShell icon={<TherapyIcon size={56} />} title="Therapy">
      <div className="flex flex-col gap-[32px] flex-1">
        {useBaseOnly ? (
          <>
            <MedSummary estDaily={estDaily} medications={medications} />
            {/* Delivery frequency */}
            <div className="flex flex-col gap-[12px]">
              <p className="font-['Roboto',sans-serif] font-bold text-[#00769e] text-[28px] tracking-[0.1px]" style={{ fontVariationSettings: "'wdth' 100" }}>Delivery frequency</p>
              <div className="w-full border-2 border-[#0094c5] rounded-[16px] bg-[#e6f4f9] px-[32px] py-[24px] flex flex-col gap-[10px]">
                <p className="font-['Roboto',sans-serif] font-bold text-[#00769e] text-[30px] tracking-[0.1px]" style={{ fontVariationSettings: "'wdth' 100" }}>
                  {strokeOpt.label} · every {fmtInterval(plan.intervalMin)}
                </p>
                <p className="font-['Roboto',sans-serif] font-normal text-[#667380] text-[24px] tracking-[0.1px]" style={{ fontVariationSettings: "'wdth' 100" }}>
                  {Math.round(plan.deliveriesPerDay)} deliveries/day
                </p>
                <div className="bg-[#bcdcec] h-px w-full my-[6px]" />
                <p className="font-['Roboto',sans-serif] tracking-[0.1px]" style={{ fontVariationSettings: "'wdth' 100" }}>
                  <span className="font-normal text-[#667380] text-[24px]">Per delivery </span>
                  <span className="font-bold text-[#00769e] text-[30px]">{fmtDose(plan.dosePerDelivery / primary.div)} {primary.unit}</span>
                </p>
              </div>
            </div>
          </>
        ) : (
          <>
            {showTabs && <WeekToggle tab={tab} setTab={setTab} />}
            <Chart intervals={selected} baseDose={baseDose} unit={primaryUnit} />

            {/* Interval list */}
            <div className={`${listGrid} px-[16px]`}>
              <p className={listHdr}>INTERVALS</p>
              <p className={listHdr}>Time</p>
              <p className={listHdr}>Δ from base</p>
              <p className={listHdr}>Dose / h</p>
              <span />
            </div>
            <div className="flex flex-col gap-[12px]">
              {selected.map(iv => {
                const pct = baseDose > 0 ? Math.round(((iv.dose - baseDose) / baseDose) * 100) : 0;
                const d = doseStringsFor(iv.dose, primaryUnit);
                return (
                  <div key={iv.id} onClick={() => onEditInterval(iv.id)}
                    className={`${listGrid} bg-white border border-[#d9dbde] rounded-[12px] h-[72px] px-[16px] cursor-pointer`}>
                    <p className="font-['Roboto',sans-serif] font-bold text-[#00769e] text-[28px] tracking-[0.1px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>{iv.label}</p>
                    <p className="font-['Roboto',sans-serif] font-normal text-[#667380] text-[26px] tracking-[0.1px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>{timeRangeLabel(iv.startMin, iv.endMin)}</p>
                    <p className="font-['Roboto',sans-serif] font-bold text-[#0094c5] text-[26px] tracking-[0.1px]" style={{ fontVariationSettings: "'wdth' 100" }}>{pct >= 0 ? '+' : '−'} {Math.abs(pct)} %</p>
                    <p className="font-['Roboto',sans-serif] text-[#00769e] text-[26px] tracking-[0.1px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}><span className="font-bold">{d.perHour}</span> {d.unit}/h</p>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className="justify-self-end">
                      <path d="M9 6l6 6-6 6" stroke="#0094c5" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                );
              })}
            </div>

            <MedSummary baseDose={baseDose} estDaily={estDaily} medications={medications} />
          </>
        )}

        {/* Action tiles — pinned to the bottom */}
        <div className="flex gap-[24px] mt-auto pt-[24px]">
          <ActionTile label="Clinician Bolus" onClick={onClinicianBolus}><ClinicianGlyph /></ActionTile>
          <ActionTile label="Edit" onClick={onEdit}><PencilGlyph /></ActionTile>
          <ActionTile label="New" onClick={onNew}><PlusGlyph /></ActionTile>
          <ActionTile label="Stop" onClick={onStop}><StopGlyph /></ActionTile>
        </div>
      </div>
    </DetailShell>
  );
}
