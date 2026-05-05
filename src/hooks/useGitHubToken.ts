'use client';

import { useCallback, useSyncExternalStore } from 'react';

export const GH_TOKEN_KEY = 'gh_access_token';

function readToken(): string {
  try {
    return (localStorage.getItem(GH_TOKEN_KEY) ?? '').trim();
  } catch {
    return '';
  }
}

// Cross-tab sync via native 'storage' event; same-tab sync via manual dispatch
function subscribeToToken(onStoreChange: () => void): () => void {
  window.addEventListener('storage', onStoreChange);
  return () => window.removeEventListener('storage', onStoreChange);
}

export function useGitHubToken() {
  const token = useSyncExternalStore(subscribeToToken, readToken, () => '');

  /** Returns an error message string on failure, or null on success. */
  const saveToken = useCallback((value: string): string | null => {
    const trimmed = value.trim();
    try {
      localStorage.setItem(GH_TOKEN_KEY, trimmed);
      // Notify same-tab subscribers (native 'storage' only fires for other tabs)
      window.dispatchEvent(new StorageEvent('storage', { key: GH_TOKEN_KEY, newValue: trimmed }));
      return null;
    } catch {
      return 'Unable to save — your browser may be blocking local storage.';
    }
  }, []);

  /** Returns an error message string on failure, or null on success. */
  const clearToken = useCallback((): string | null => {
    try {
      localStorage.removeItem(GH_TOKEN_KEY);
      window.dispatchEvent(new StorageEvent('storage', { key: GH_TOKEN_KEY, newValue: null }));
      return null;
    } catch {
      return 'Unable to clear — your browser may be blocking local storage.';
    }
  }, []);

  return {
    token,
    hasToken: token.length > 0,
    saveToken,
    clearToken,
  };
}
