import { useState } from 'react';
import { HomeNoTherapy } from './screens/HomeNoTherapy';
import { BaseDose } from './screens/BaseDose';
import { IntervalsEmpty } from './screens/IntervalsEmpty';
import { AddIntervalSheetWhen, AddIntervalSheetDose } from './screens/AddIntervalSheet';
import { IntervalsPopulated } from './screens/IntervalsPopulated';
import { Review } from './screens/Review';
import { Activate } from './screens/Activate';
import { HomeActive } from './screens/HomeActive';
import { NavProvider, type ScreenId } from './navigation';
import { TherapyProvider } from './therapy';

const ORDER: ScreenId[] = [
  'home-no-therapy',
  'base-dose',
  'intervals-empty',
  'add-interval-when',
  'add-interval-dose',
  'intervals-populated',
  'review',
  'activate',
  'home-active',
];

export function App() {
  const [screen, setScreen] = useState<ScreenId>('home-no-therapy');

  return (
    <TherapyProvider>
      <NavProvider value={setScreen}>
        <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
        <div className="device-shell">
          <div className="device-inner">
            <div className="screen">
              {screen === 'home-no-therapy' && <HomeNoTherapy />}
              {screen === 'base-dose' && <BaseDose />}
              {screen === 'intervals-empty' && <IntervalsEmpty />}
              {screen === 'add-interval-when' && <AddIntervalSheetWhen />}
              {screen === 'add-interval-dose' && <AddIntervalSheetDose />}
              {screen === 'intervals-populated' && <IntervalsPopulated />}
              {screen === 'review' && <Review />}
              {screen === 'activate' && <Activate />}
              {screen === 'home-active' && <HomeActive />}
            </div>
          </div>
        </div>
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
        </div>
      </NavProvider>
    </TherapyProvider>
  );
}
