import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App, { detachStaticHomepage } from './App.tsx';
import './index.css';
import { initializeAnalytics } from './analytics/analytics';
import { initializeWebVitals } from './analytics/webVitals';
import { resolveRoute } from './router/resolve';

import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(useGSAP, ScrollTrigger);

if (resolveRoute(window.location.pathname) !== 'marketing') {
  // Static hosts may still return the full homepage shell. Remove and stop it
  // before React renders; the application server already omits it entirely.
  detachStaticHomepage();
}

initializeAnalytics();
initializeWebVitals();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
