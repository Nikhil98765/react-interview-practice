import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useDebounce } from './useDebounce';

describe('useDebounce hook', () => {
  beforeEach(() => {
    // Fake timers let the test move through the debounce delay instantly instead
    // of waiting for real time to pass.
    vi.useFakeTimers();
  });

  afterEach(() => {
    // Clear pending timeouts and restore real timers so this test setup does not
    // leak into other tests.
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  it('should return debounce query', () => {
    const { result } = renderHook(() => useDebounce('hello', 500));

    // The hook starts with an empty debounced value until the delay completes.
    expect(result.current).toBe('');
  });

  it('should update the debounced query after delay', () => {
    const { result } = renderHook(() => useDebounce('hello', 1000));

    expect(result.current).toBe('');

    // Advancing timers inside act lets React process the state update triggered
    // by the hook's setTimeout callback.
    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(result.current).toBe('hello');
  });
});
