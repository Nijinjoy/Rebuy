// Backend settings for each build. While apiUrl is empty the app serves the
// sample data in src/data instead of calling a server.
const ENV = {
  development: { apiUrl: '' },
  production: { apiUrl: '' },
};

export const env = __DEV__ ? ENV.development : ENV.production;

export const useMockApi = !env.apiUrl;
