import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { initAnalytics } from "./lib/analytics";

gsap.registerPlugin(useGSAP, ScrollTrigger);

// No-op unless VITE_PLAUSIBLE_DOMAIN is set; an unconfigured build emits no
// third-party request at all. See src/lib/analytics.ts for why this is injected
// here rather than added to index.html.
initAnalytics();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
