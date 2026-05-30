/**
 * Resolves camera stream URL from backend.
 * If backend returned localhost/127.0.0.1 but the frontend is accessed from an external device on the network,
 * it replaces localhost/127.0.0.1 with the backend API hostname to ensure the stream can load.
 */
export const resolveStreamUrl = (url?: string): string => {
  if (!url) return '';
  if (url.includes('localhost') || url.includes('127.0.0.1')) {
    try {
      const apiURL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';
      if (apiURL.startsWith('http')) {
        const apiHostname = new URL(apiURL).hostname;
        return url.replace('localhost', apiHostname).replace('127.0.0.1', apiHostname);
      }
      const clientHostname = window.location.hostname;
      return url.replace('localhost', clientHostname).replace('127.0.0.1', clientHostname);
    } catch (e) {
      console.error('Error resolving stream URL hostname:', e);
      return url;
    }
  }
  return url;
};

/**
 * Checks if a stream URL is reachable and returning 200 OK.
 * Used to wait for MediaMTX to initialize the stream.
 */
export const checkStreamReady = async (url: string, maxAttempts = 15, intervalMs = 1000): Promise<boolean> => {
  if (!url) return false;
  
  const resolvedUrl = resolveStreamUrl(url);
  for (let i = 0; i < maxAttempts; i++) {
    try {
      const response = await fetch(resolvedUrl, { method: 'GET', cache: 'no-store' });
      if (response.ok) {
        return true;
      }
    } catch (e) {
      // Ignore network errors/404 during connection build-up
    }
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }
  return false;
};
