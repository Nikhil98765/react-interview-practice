import { useCallback, useRef } from 'react';

export const useThrottle = (cb, delay) => {
  const lastCall = useRef(0);

  return useCallback(
    (...args) => {
      const now = Date.now();
      if (now - lastCall.current >= delay) {
        lastCall.current = now;
        cb(args);
      }
    },
    [cb, delay],
  );
};
