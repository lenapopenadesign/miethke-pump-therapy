// Medication icon (pill bottle) — a two-layer composite of the cap + the body,
// matching the Figma `Icons / medication` component. Rendering both layers fixes
// the missing bottle cap that the old single-file icon dropped.
const imgCap = "/icons/med-cap.svg";
const imgBody = "/icons/med-body.svg";

export function MedicationIcon({ size = 48, className = '' }: { size?: number; className?: string }) {
  return (
    <div className={`relative shrink-0 overflow-clip ${className}`} style={{ width: size, height: size }}>
      <div className="absolute inset-[7.5%_37.5%_77.5%_37.5%]">
        <img alt="" src={imgCap} className="absolute inset-0 block size-full" />
      </div>
      <div className="absolute inset-[20%_27.5%_10%_27.5%]">
        <img alt="" src={imgBody} className="absolute inset-0 block size-full" />
      </div>
    </div>
  );
}
