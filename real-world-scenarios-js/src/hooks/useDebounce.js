import { useEffect, useState } from "react"

export const useDebounce = (value, delay) => {
  const [debouncedQuery, setDebouncedQuery] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(value);
    }, delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedQuery;
}