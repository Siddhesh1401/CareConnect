import React, { useRef, useCallback } from 'react';

// Custom hook for managing cancellable API requests
export const useCancellableRequest = () => {
  const abortControllerRef = useRef<AbortController | null>(null);

  const cancelRequest = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }, []);

  const makeRequest = useCallback(async (requestFn: (signal: AbortSignal) => Promise<any>) => {
    // Cancel any existing request
    cancelRequest();

    // Create new abort controller
    abortControllerRef.current = new AbortController();

    try {
      const result = await requestFn(abortControllerRef.current.signal);
      return result;
    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.log('Request was cancelled');
        return null;
      }
      throw error;
    } finally {
      abortControllerRef.current = null;
    }
  }, [cancelRequest]);

  return { makeRequest, cancelRequest };
};

// Hook for managing loading states and preventing multiple clicks
export const useLoadingState = (initialState = false) => {
  const [isLoading, setIsLoading] = React.useState(initialState);
  const [error, setError] = React.useState<string | null>(null);

  const executeWithLoading = useCallback(async (asyncFn: () => Promise<any>) => {
    if (isLoading) return null;

    setIsLoading(true);
    setError(null);

    try {
      const result = await asyncFn();
      return result;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'An error occurred';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [isLoading]);

  return { isLoading, error, executeWithLoading, setError };
};