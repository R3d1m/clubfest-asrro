import { io, Socket } from 'socket.io-client';

/**
 * Returns the backend base URL.
 * 
 * Logic:
 * 1. Checks explicit environment variable VITE_BACKEND_URL or VITE_API_URL.
 * 2. If running locally (localhost / 127.0.0.1), returns empty string so requests
 *    use relative paths and the Vite dev proxy.
 * 3. If running on the backend host itself, returns empty string.
 * 4. If running on a separated frontend deployment (such as https://clubfest-asrro-1.onrender.com
 *    or any external domain), defaults to 'https://clubfest-asrro.onrender.com'.
 */
export const getBackendUrl = (): string => {
  const envUrl = import.meta.env.VITE_BACKEND_URL || import.meta.env.VITE_API_URL;
  if (envUrl && typeof envUrl === 'string' && envUrl.trim() !== '') {
    return envUrl.trim().replace(/\/+$/, '');
  }

  if (typeof window !== 'undefined' && window.location) {
    const hostname = window.location.hostname;
    // Local development - use relative paths with Vite proxy
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return '';
    }
    // If frontend is on the same domain as backend
    if (hostname === 'clubfest-asrro.onrender.com') {
      return '';
    }
    // Deployed separately (e.g. clubfest-asrro-1.onrender.com or custom domain)
    return 'https://clubfest-asrro.onrender.com';
  }

  return import.meta.env.PROD ? 'https://clubfest-asrro.onrender.com' : '';
};

/**
 * Transforms a relative API path (e.g. '/api/player/123') into a full URL if needed.
 */
export const getApiUrl = (path: string): string => {
  const backend = getBackendUrl();
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return backend ? `${backend}${normalizedPath}` : normalizedPath;
};

/**
 * Wrapper around global fetch that automatically resolves backend base URL.
 */
export const apiFetch = async (path: string, options?: RequestInit): Promise<Response> => {
  const url = getApiUrl(path);
  return fetch(url, options);
};

/**
 * Initializes and returns a Socket.IO client instance configured for the active backend.
 */
export const createGameSocket = (): Socket => {
  const backend = getBackendUrl();
  // If backend is empty string (same origin / proxy), pass window.location.origin or undefined
  const socketTarget = backend || undefined;

  return io(socketTarget, {
    transports: ['websocket', 'polling'],
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    timeout: 20000
  });
};
