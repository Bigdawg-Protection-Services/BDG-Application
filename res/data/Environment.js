// res/data/Environment.js

const URL = process.env.EXPO_PUBLIC_API_URL || 'https://bdg-backend-app-main-6950f029c3ed.herokuapp.com/'; // note the trailing /

// Keep API keys in env only. Do not hardcode secrets in source control.
const GOOGLE_MAPS_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || '';

export default URL;
export { GOOGLE_MAPS_API_KEY };
