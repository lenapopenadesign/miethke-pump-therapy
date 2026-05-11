import { useTherapy, fmtTime, morphineMgDay, bupivacaineMgDay, doseColor } from '../therapy';

export function IntervalPreview() {
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

  // Positioned inside .screen (1200x1920 frame). Backdrop fills the whole
  // device viewport; the card is centered horizontally and roughly
  // vertically over the visible area (the device-shell crops at 768px tall,
  // which is the top half of the 1920 content).
  return (
    <div
      onClick={close}
      className="absolute inset-0 flex items-center justify-center cursor-pointer"
      style={{ background: 'rgba(13, 13, 26, 0.55)', zIndex: 100 }}
    >
      <div
        onClick={e => e.stopPropagation()}
        className="bg-white rounded-[24px] cursor-default"
        style={{ width: 980, padding: 40, boxShadow: '0 24px 60px rgba(0,0,0,0.3)', marginTop: -200 }}
      >
        <div className="flex items-center gap-[20px]">
          <div className="rounded-[6px] flex-shrink-0" style={{ width: 12, height: 72, background: doseColor(iv.dose, baseDose) }} />
          <div className="flex-1">
            <p className="font-bold not-italic text-[#063b66] text-[44px] leading-[52px]" style={{ fontFamily: 'Inter, sans-serif' }}>{iv.label}</p>
            <p className="not-italic text-[#667380] text-[24px] leading-[32px]" style={{ fontFamily: 'Inter, sans-serif' }}>
              {fmtTime(iv.startMin)} – {endDisplay}  ·  {lengthH}h {lengthM}m
            </p>
          </div>
          <button
            onClick={close}
            className="bg-transparent border-0 cursor-pointer flex items-center justify-center"
            style={{ width: 64, height: 64 }}
            aria-label="Close"
          >
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
              <path d="M10 10 L30 30 M30 10 L10 30" stroke="#9ea8b2" strokeWidth="3" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className="bg-[#d9dbde]" style={{ height: 1, marginTop: 28, marginBottom: 28 }} />

        <div className="flex flex-col gap-[20px]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-[14px]">
              <p className="font-bold not-italic text-[#063b66] text-[28px]" style={{ fontFamily: 'Inter, sans-serif' }}>Baclofen</p>
              <div className="bg-[#0b7fa8] rounded-[14px] flex items-center" style={{ paddingLeft: 14, paddingRight: 14, height: 28 }}>
                <p className="font-bold not-italic text-white text-[14px]" style={{ fontFamily: 'Inter, sans-serif' }}>PRIMARY</p>
              </div>
            </div>
            <p className="font-bold not-italic text-[#063b66] text-[28px]" style={{ fontFamily: 'Inter, sans-serif' }}>{hourlyUgH.toFixed(1)} µg/h</p>
          </div>
          <div className="flex items-center justify-between">
            <p className="not-italic text-[#063b66] text-[24px]" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500 }}>Morphine</p>
            <p className="not-italic text-[#667380] text-[24px]" style={{ fontFamily: 'Inter, sans-serif' }}>{morMgH.toFixed(3)} mg/h</p>
          </div>
          <div className="flex items-center justify-between">
            <p className="not-italic text-[#063b66] text-[24px]" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500 }}>Bupivacaine</p>
            <p className="not-italic text-[#667380] text-[24px]" style={{ fontFamily: 'Inter, sans-serif' }}>{bupMgH.toFixed(3)} mg/h</p>
          </div>
        </div>
      </div>
    </div>
  );
}
