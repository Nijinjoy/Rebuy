// On Android (emulator or USB device) run `adb reverse tcp:5000 tcp:5000` so
// the device's localhost:5000 reaches the backend on this machine. Without a
// USB connection, replace this with your computer's LAN IP.
const DEV_HOST = 'localhost';

// Backend settings for each build.
// - apiUrl: password reset; while empty that request is simulated instead
//   of calling a server.
// - backendUrl: the ReBuy Node API used for auth. Must be HTTPS in production.
const ENV = {
  development: {
    apiUrl: '',
    backendUrl: `http://${DEV_HOST}:5000/api/v1`,
  },
  production: {
    apiUrl: '',
    backendUrl: '',
  },
};

export const env = __DEV__ ? ENV.development : ENV.production;

export const useMockApi = !env.apiUrl;

// Turns a path the backend returns (e.g. /uploads/avatars/x.jpg) into a full
// URL on the backend's host.
export function backendAssetUrl(path?: string | null): string | undefined {
  if (!path) {
    return undefined;
  }
  if (/^https?:\/\//.test(path)) {
    return path;
  }
  const origin = env.backendUrl.replace(/\/api\/v\d+\/?$/, '');
  return `${origin}${path}`;
}
