import { useTherapy, fmtTime, morphineMgDay, bupivacaineMgDay, doseColor } from '../therapy';

type Props = {
  // Position within the screen (1200x1920 frame).
  top: number;
  left: number;
  width: number;
};

/**
 * Inline interval preview — read-only card that sits inside the therapy
 * section (no full-screen backdrop). Each caller positions it where it
 * fits best. Renders nothing when no interval is selected.
 */
export function IntervalPreview({ top, left, width }: Props) {
  const { intervals, baseDose, previewIntervalId, setPreviewIntervalId } = useTherapy();
  const iv = intervals.find(x => x.id === previewIntervalId);
  if (!iv) return null;

  const hourlyUgH = iv.dose / 24;
  const morMgH = morphineMgDay(iv.dose) / 24;
  const bupMgH = bupivacaineMgDay(iv.dose) / 24;
  const endDisplay = iv.endMin >= 1440 ? '23:59' : fmtTime(Math.max(0, iv.endMin - 1));
  const lengthMin = Math.max(0, iv.endMin - iv.startMin);
  const lengthH = Math.floor(lengthMin / 60);
  const lengthM = lengthMin % 60;
  const close = () => setPreviewIntervalId(null);

  return (
    <div
      className="absolute bg-white rounded-[16px] border-2 border-[#0b7fa8]"
      style={{
        top,
        left,
        width,
        padding: 24,
        boxShadow: '0 10px 30px rgba(6, 59, 102, 0.18)',
        zIndex: 20,
      }}
    >
      <div className="flex items-center" style={{ gap: 18 }}>
        <div className="rounded-[4px] flex-shrink-0" style={{ width: 10, height: 56, background: doseColor(iv.dose, baseDose) }} />
        <div className="flex-1">
          <p className="font-bold not-italic text-[#063b66]" style={{ fontFamily: 'Inter, sans-serif', fontSize: 32, lineHeight: '38px' }}>{iv.label}</p>
          <p className="not-italic text-[#667380]" style={{ fontFamily: 'Inter, sans-serif', fontSize: 22, lineHeight: '28px' }}>
            {fmtTime(iv.startMin)} – {endDisplay}  ·  {lengthH}h {lengthM}m
          </p>
        </div>
        <button
          onClick={close}
          className="bg-transparent border-0 cursor-pointer flex items-center justify-center"
          style={{ width: 48, height: 48 }}
          aria-label="Close"
        >
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <path d="M8 8 L24 24 M24 8 L8 24" stroke="#9ea8b2" strokeWidth="3" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      <div className="bg-[#d9dbde]" style={{ height: 1, marginTop: 18, marginBottom: 18 }} />

      <div className="flex flex-col" style={{ gap: 14 }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center" style={{ gap: 12 }}>
            <p className="font-bold not-italic text-[#063b66]" style={{ fontFamily: 'Inter, sans-serif', fontSize: 24 }}>Baclofen</p>
            <div className="bg-[#0b7fa8] rounded-[12px] flex items-center" style={{ paddingLeft: 12, paddingRight: 12, height: 24 }}>
              <p className="font-bold not-italic text-white" style={{ fontFamily: 'Inter, sans-serif', fontSize: 12 }}>PRIMARY</p>
            </div>
          </div>
          <p className="font-bold not-italic text-[#063b66]" style={{ fontFamily: 'Inter, sans-serif', fontSize: 24 }}>{hourlyUgH.toFixed(1)} µg/h</p>
        </div>
        <div className="flex items-center justify-between">
          <p className="not-italic text-[#063b66]" style={{ fontFamily: 'Inter, sans-serif', fontSize: 22, fontWeight: 500 }}>Morphine</p>
          <p className="not-italic text-[#667380]" style={{ fontFamily: 'Inter, sans-serif', fontSize: 22 }}>{morMgH.toFixed(3)} mg/h</p>
        </div>
        <div className="flex items-center justify-between">
          <p className="not-italic text-[#063b66]" style={{ fontFamily: 'Inter, sans-serif', fontSize: 22, fontWeight: 500 }}>Bupivacaine</p>
          <p className="not-italic text-[#667380]" style={{ fontFamily: 'Inter, sans-serif', fontSize: 22 }}>{bupMgH.toFixed(3)} mg/h</p>
        </div>
      </div>
    </div>
  );
}
