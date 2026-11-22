/**
 * Centralized API configuration for Asif Raza Portfolio
 * Automatically switches between local development server and production Render backend.
 */
const PRODUCTION_API_URL = 'https://portfolio-asif.onrender.com';

const CONFIG = {
  PRODUCTION_API_URL,

  API_BASE_URL: (() => {
    // 1. Allow manual override via ?api=... query parameter, window variable, or localStorage
    if (window.PORTFOLIO_API_URL) return window.PORTFOLIO_API_URL;
    try {
      const savedApi = localStorage.getItem('asif_portfolio_custom_api');
      if (savedApi) return savedApi;
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('api')) {
        localStorage.setItem('asif_portfolio_custom_api', urlParams.get('api'));
        return urlParams.get('api');
      }
    } catch (e) { }

    const hostname = window.location.hostname;
    // 2. Local development: ALWAYS point to backend on port 5050
    // (regardless of whether frontend is opened on port 5500 Live Server, 3000, 5050, or file://)
    if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '') {
      return 'http://localhost:5050';
    }

    // 3. Production on Netlify / Custom Domain: Point to live Render backend
    return PRODUCTION_API_URL;
  })(),

  DEFAULT_STATS: {
    experienceYears: '2+',
    projectsDone: '50+',
    happyClients: '20+',
  },
};

window.CONFIG = CONFIG;
