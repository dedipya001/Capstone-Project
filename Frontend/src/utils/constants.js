// API endpoints
export const API_BASE_URL = 'https://api.electoraldata.gov.in';
export const API_ENDPOINTS = {
  LOGIN: '/auth/login',
  LOGOUT: '/auth/logout',
  MAP_DATA: '/map/data',
  STATES: '/states',
  CONSTITUENCIES: '/constituencies',
  USER_PROFILE: '/user/profile',
};

// Map constants
export const DEFAULT_MAP_CENTER = {
  lat: 20.5937,
  lng: 78.9629,
};

export const DEFAULT_ZOOM = 4;

// Dashboard constants
export const DATA_REFRESH_INTERVAL = 5 * 60 * 1000; // 5 minutes