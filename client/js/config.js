/**
 * Centralized API configuration for Asif Raza Portfolio
 * Automatically switches between local development server and production Render backend.
 */
const CONFIG = {
  // SET YOUR DEPLOYED RENDER BACKEND URL HERE:
  // e.g., 'https://asif-raza-portfolio-api.onrender.com'
  PRODUCTION_API_URL: 'https://asif-raza-portfolio-api.onrender.com',

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
    } catch (e) {}

    const hostname = window.location.hostname;
    // 2. Local development: use current local origin if running via server, or default to localhost:5050
    if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '') {
      if (window.location.port) {
        return window.location.origin;
      }
      return 'http://localhost:5050';
    }

    // 3. Production: Point to live Render backend
    return 'https://asif-raza-portfolio-api.onrender.com';
  })(),

  DEFAULT_STATS: {
    experienceYears: '2+',
    projectsDone: '50+',
    happyClients: '20+',
  },
};

window.CONFIG = CONFIG;
