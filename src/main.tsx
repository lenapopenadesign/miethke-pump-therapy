import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { App } from './App';
import { PasswordGate } from './components/PasswordGate';
import { Splash } from './components/Splash';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PasswordGate>
      <Splash>
        <App />
      </Splash>
    </PasswordGate>
  </StrictMode>,
);
