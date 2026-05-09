import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { initializeMobile } from './lib/mobileInit';

import { HashRouter } from 'react-router-dom';

// Initialize mobile-specific features
initializeMobile();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </StrictMode>,
);
