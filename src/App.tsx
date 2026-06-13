import { useEffect, useState } from 'react';
import { HomeNoTherapy } from './screens/HomeNoTherapy';
import { AddMedication } from './screens/AddMedication';
import { BaseDose } from './screens/BaseDose';
import { IntervalsEmpty } from './screens/IntervalsEmpty';
import { AddIntervalSheetWhen, AddIntervalSheetDose } from './screens/AddIntervalSheet';
import { IntervalsPopulated } from './screens/IntervalsPopulated';
import { RegularTherapy } from './screens/RegularTherapy';
import { Review } from './screens/Review';
import { Activate } from './screens/Activate';
import { HomeActive } from './screens/HomeActive';
import { PatientDetail } from './screens/PatientDetail';
import { ImplantDetail } from './screens/ImplantDetail';
import { ActionsScreen } from './screens/ActionsScreen';
import { RefillFilling } from './screens/RefillFilling';
import { NavProvider, type ScreenId } from './navigation';
import { TherapyProvider } from './therapy';

const ORDER: ScreenId[] = [
  'home-no-therapy',
  'add-medication',
  'base-dose',
  'intervals-empty',
  'add-interval-when',
  'add-interval-dose',
  'intervals-populated',
  'regular-therapy',
  'review',
  'activate',
  'home-active',
  'patient-detail',
  'implant-detail',
  'actions',
  'refill-filling',
];

// Design canvas dimensions — every screen is authored against this exact size.
const DESIGN_W = 1200;
const DESIGN_H = 1920;
// At/above this viewport width, we render the desktop preview (scaled device frame + debug panel).
// Below it, we switch to "device mode": the design fills the viewport, scaled to fit.
const DEVICE_BREAKPOINT = 1300;

function useDeviceLayout() {
  const get = () => {
    if (typeof window === 'undefined') {
      return { isDevice: false, scale: 1, w: DESIGN_W, h: DESIGN_H };
    }
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const isDevice = vw < DEVICE_BREAKPOINT;
    if (!isDevice) return { isDevice, scale: 1, w: vw, h: vh };
    const scale = Math.min(vw / DESIGN_W, vh / DESIGN_H);
    return { isDevice, scale, w: vw, h: vh };
  };
  const [layout, setLayout] = useState(get);
  useEffect(() => {
    const onResize = () => setLayout(get());
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);
  return layout;
}

export function App() {
  const [screen, setScreen] = useState<ScreenId>('home-no-therapy');
  const [showNav, setShowNav] = useState(false);
  const { isDevice, scale, w, h } = useDeviceLayout();

  // Toggle the dev jump-list with the backtick key (so it stays out of the way
  // during realistic desktop testing but is one keypress away).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === '`') setShowNav(v => !v);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const screens = (
    <>
      {screen === 'home-no-therapy' && <HomeNoTherapy />}
      {screen === 'add-medication' && <AddMedication />}
      {screen === 'base-dose' && <BaseDose />}
      {screen === 'intervals-empty' && <IntervalsEmpty />}
      {screen === 'add-interval-when' && <AddIntervalSheetWhen />}
      {screen === 'add-interval-dose' && <AddIntervalSheetDose />}
      {screen === 'intervals-populated' && <IntervalsPopulated />}
      {screen === 'regular-therapy' && <RegularTherapy />}
      {screen === 'review' && <Review />}
      {screen === 'activate' && <Activate />}
      {screen === 'home-active' && <HomeActive />}
      {screen === 'patient-detail' && <PatientDetail />}
      {screen === 'implant-detail' && <ImplantDetail />}
      {screen === 'actions' && <ActionsScreen />}
      {screen === 'refill-filling' && <RefillFilling />}
    </>
  );

  if (isDevice) {
    const scaledW = DESIGN_W * scale;
    const scaledH = DESIGN_H * scale;
    return (
      <TherapyProvider>
        <NavProvider value={setScreen}>
          <div
            className="device-mode-shell"
            style={{ width: scaledW, height: scaledH, marginLeft: (w - scaledW) / 2, marginTop: (h - scaledH) / 2 }}
          >
            <div
              className="device-mode-inner"
              style={{ width: DESIGN_W, height: DESIGN_H, transform: `scale(${scale})` }}
            >
              <div className="screen">{screens}</div>
            </div>
          </div>
        </NavProvider>
      </TherapyProvider>
    );
  }

  // Desktop preview: scale the 1200×1920 canvas to fit the window — bound by
  // height so the whole layout (incl. the bottom CTA) is visible without scroll.
  const deskScale = Math.max(0.25, Math.min((h - 48) / DESIGN_H, (w - 48) / DESIGN_W));
  return (
    <TherapyProvider>
      <NavProvider value={setScreen}>
        <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
        <div className="device-shell" style={{ width: DESIGN_W * deskScale, height: DESIGN_H * deskScale }}>
          <div className="device-inner" style={{ transform: `scale(${deskScale})` }}>
            <div className="screen">{screens}</div>
          </div>
        </div>
        {showNav && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontFamily: 'system-ui', fontSize: 13 }}>
            <strong style={{ fontSize: 12, color: '#666' }}>Jump to (dev only)</strong>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {ORDER.map(s => (
                <button
                  key={s}
                  onClick={() => setScreen(s)}
                  style={{
                    fontWeight: s === screen ? 'bold' : 'normal',
                    background: s === screen ? '#0094c5' : 'white',
                    color: s === screen ? 'white' : 'black',
                    border: '1px solid #ccc',
                    padding: '4px 8px',
                    cursor: 'pointer',
                    textAlign: 'left',
                    width: 160,
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}
        </div>
        {/* Unobtrusive toggle for the dev jump-list (also bound to the ` key). */}
        <button
          onClick={() => setShowNav(v => !v)}
          title="Toggle screen list (`)"
          style={{
            position: 'fixed',
            bottom: 12,
            left: 12,
            width: 28,
            height: 28,
            borderRadius: 8,
            border: '1px solid rgba(0,0,0,0.12)',
            background: 'rgba(255,255,255,0.7)',
            color: '#888',
            fontSize: 14,
            lineHeight: '1',
            cursor: 'pointer',
            opacity: 0.5,
          }}
        >
          ⌘
        </button>
      </NavProvider>
    </TherapyProvider>
  );
}
