// handles API communication
// This will be the single Axios client used by all your API modules.
// instead of writing entire api url in api call functions on components create the api foundation here

import axios from "axios";
import { env } from "../config/env";

const apiClient = axios.create({
  baseURL: env.backendUrl,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

// Sent as a bearer token on every request once the user signs in.
export function setAuthToken(token: string | null) {
  if (token) {
    apiClient.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete apiClient.defaults.headers.common.Authorization;
  }
}

let onUnauthorized: (() => void) | null = null;

// Called when a request that carried a token comes back 401 (expired or
// revoked), so the app can sign the user out.
export function setUnauthorizedHandler(handler: (() => void) | null) {
  onUnauthorized = handler;
}

apiClient.interceptors.response.use(
  response => response,
  error => {
    if (
      axios.isAxiosError(error) &&
      error.response?.status === 401 &&
      error.config?.headers?.Authorization
    ) {
      onUnauthorized?.();
    }
    return Promise.reject(error);
  }
);

export default apiClient;
