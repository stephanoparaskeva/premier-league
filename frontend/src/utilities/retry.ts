/**
 * Retries an asynchronous function a specified number of times before failing.
 *
 * Useful for network requests or operations that may intermittently fail.
 */
export const retry = async <T,>({
  apiCall,
  retries = 10,
  onRetry,
}: {
  apiCall: () => Promise<T>;
  retries?: number;
  onRetry?: (attempt: number, error: unknown) => void;
}): Promise<T> => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await apiCall();
    } catch (err) {
      console.error(`Attempt ${attempt} failed:`, err);

      onRetry?.(attempt, err);

      if (attempt === retries) {
        throw err; 
      }
    }
  }

  throw new Error('Retry reached unreachable state');
};
