import { useState } from 'react';
import { HomeNoTherapy } from './screens/HomeNoTherapy';
import { BaseDose } from './screens/BaseDose';
import { IntervalsEmpty } from './screens/IntervalsEmpty';
import { AddIntervalSheetWhen, AddIntervalSheetDose } from './screens/AddIntervalSheet';
import { IntervalsPopulated } from './screens/IntervalsPopulated';
import { Review } from './screens/Review';
import { Activate } from './screens/Activate';
import { HomeActive } from './screens/HomeActive';

type ScreenId =
  | 'home-no-therapy'
  | 'base-dose'
  | 'intervals-empty'
  | 'add-interval-when'
  | 'add-interval-dose'
  | 'intervals-populated'
  | 'review'
  | 'activate'
  | 'home-active';

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

  const idx = ORDER.indexOf(screen);
  const next = () => setScreen(ORDER[Math.min(idx + 1, ORDER.length - 1)]);
  const prev = () => setScreen(ORDER[Math.max(idx - 1, 0)]);

  return (
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
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontFamily: 'system-ui', fontSize: 14 }}>
        <strong>{screen}</strong>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={prev} disabled={idx === 0}>←</button>
          <button onClick={next} disabled={idx === ORDER.length - 1}>→</button>
        </div>
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
              }}
            >
              {s}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
