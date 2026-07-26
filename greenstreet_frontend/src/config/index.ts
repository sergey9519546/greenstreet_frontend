interface Config {
  app: {
    name: string;
    domain: string;
    env: 'development' | 'staging' | 'production' | 'test';
  };
  api: {
    baseUrl: string;
    timeout: number;
  };
  features: {
    betaCalculator: boolean;
    aiNarration: boolean;
    portfolioAnalysis: boolean;
  };
  seo: {
    siteName: string;
    defaultTitle: string;
    defaultDescription: string;
    twitterHandle: string;
  };
  firebase: {
    projectId: string;
    appId: string;
  };
}

function loadConfig(): Config {
  const env = (import.meta.env.MODE || 'development') as Config['app']['env'];
  
  return {
    app: {
      name: 'Greenstreet Finance',
      domain: import.meta.env.VITE_DOMAIN || 'greenstreet.com',
      env,
    },
    api: {
      baseUrl: import.meta.env.VITE_API_URL || '/api',
      timeout: 30000,
    },
    features: {
      betaCalculator: env === 'development' || import.meta.env.VITE_BETA === 'true',
      aiNarration: import.meta.env.VITE_ENABLE_AI === 'true',
      portfolioAnalysis: true,
    },
    seo: {
      siteName: 'Greenstreet Finance',
      defaultTitle: 'DSCR Loan Calculator | Greenstreet Finance',
      defaultDescription: 'Free DSCR calculator for rental property loans. Compare specialized DSCR lender programs, get instant pre-qualification. No W-2 required.',
      twitterHandle: '@greenstreetfin',
    },
    firebase: {
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
      appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
    },
  };
}

export const config = loadConfig();

// Helper functions
export const isDevelopment = config.app.env === 'development';
export const isProduction = config.app.env === 'production';
export const isTest = config.app.env === 'test';

// Full URL builder
export function buildUrl(path: string): string {
  const protocol = isProduction ? 'https' : 'http';
  return `${protocol}://${config.app.domain}${path}`;
}

// API URL builder
export function apiUrl(endpoint: string): string {
  return `${config.api.baseUrl}${endpoint}`;
}
