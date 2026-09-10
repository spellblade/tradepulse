import { useState, useEffect } from 'react';

/** Default semantic version fallback if static /VERSION fetch fails or times out. */
const FALLBACK_VERSION = '0.1.0';

/**
 * Custom React hook that dynamically queries the single-source-of-truth static `/VERSION`
 * endpoint at runtime to display the active deployed application version.
 *
 * @returns {string} Cleaned SemVer version string (e.g., '0.1.0').
 */
export function useAppVersion(): string {
  const [version, setVersion] = useState<string>(FALLBACK_VERSION);

  useEffect(() => {
    let isMounted = true;
    fetch('/VERSION')
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.text();
      })
      .then((text) => {
        const cleaned = text.trim();
        if (cleaned && isMounted) {
          setVersion(cleaned);
        }
      })
      .catch(() => {
        // Fallback to FALLBACK_VERSION
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return version;
}
