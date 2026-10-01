import type { ReactNode } from 'react';

const wdth = { fontVariationSettings: "'wdth' 100" } as const;
const FONT = "font-['Roboto',sans-serif]";

/**
 * Modal confirmation in the "dialogue long" style (Figma 5181:174409): info
 * icon, bold title with a close cross, body copy, and an outlined secondary +
 * filled primary button. Rendered as a screen overlay (DetailShell `overlay`),
 * centred over a scrim; the scrim and the cross both cancel.
 */
export function ConfirmDialog({ title, children, confirmLabel, cancelLabel = 'Cancel', onConfirm, onCancel }: {
  title: string;
  children: ReactNode;
  confirmLabel: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="absolute inset-0 flex items-center justify-center" role="dialog" aria-modal="true" aria-label={title}>
      <div onClick={onCancel} className="absolute inset-0 bg-[#183d38]/40" />
      <div className="relative w-[944px] bg-[#f5fcf9] rounded-[24px] p-[24px] flex flex-col gap-[16px] shadow-[0px_12px_40px_0px_rgba(0,0,0,0.18)]">
        <div className="flex gap-[24px] items-start w-full">
          <img alt="" src="/icons/dialog-info.svg" className="block shrink-0 h-[40px] w-[41px]" />
          <div className="flex-1 min-w-px flex flex-col gap-[24px] pt-[8px]">
            <div className="flex gap-[24px] items-start w-full">
              <p className={`${FONT} flex-1 min-w-px font-bold text-[28px] leading-[32px] text-[#183d38] tracking-[0.1px]`} style={wdth}>{title}</p>
              <button onClick={onCancel} aria-label="Close" className="shrink-0 size-[40px] cursor-pointer">
                <img alt="" src="/icons/dialog-close.svg" className="block size-full" />
              </button>
            </div>
            <p className={`${FONT} font-normal text-[24px] leading-[32px] text-[#183d38] tracking-[0.1px]`} style={wdth}>{children}</p>
          </div>
        </div>
        <div className="flex gap-[24px] items-start justify-end w-full">
          <button onClick={onCancel} className="h-[72px] min-w-[240px] px-[24px] rounded-[40px] border-[3px] border-[#0b786a] cursor-pointer">
            <span className={`${FONT} font-bold text-[24px] leading-[32px] text-[#0b786a] tracking-[0.1px]`} style={wdth}>{cancelLabel}</span>
          </button>
          <button onClick={onConfirm} className="h-[72px] min-w-[240px] px-[24px] rounded-[40px] bg-[#0b786a] hover:bg-[#096657] cursor-pointer">
            <span className={`${FONT} font-bold text-[24px] leading-[32px] text-white tracking-[0.1px]`} style={wdth}>{confirmLabel}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

/** The "stop therapy?" confirmation used by every Stop action. */
export function StopTherapyDialog({ onConfirm, onCancel }: { onConfirm: () => void; onCancel: () => void }) {
  return (
    <ConfirmDialog title="Do you really want to stop the therapy?" confirmLabel="Stop therapy" onConfirm={onConfirm} onCancel={onCancel}>
      Delivery will be paused until the therapy is resumed. The therapy stays programmed on the implant.
    </ConfirmDialog>
  );
}
