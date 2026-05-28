import { useCallback, useEffect, useRef, useState } from 'react';

export const useInfiniteScroll = (fetchFn) => {
  const [items, setItems] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const observerRef = useRef();

  useEffect(() => {
    let cancelled = false;

    setLoading(true);
    fetchFn(page).then((data) => {
      if (cancelled) return;
      if (!data.length) {
        setHasMore(false);
      } else {
        setItems((prev) => [...prev, ...data]);
      }
      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [page]);

  const lastItemRef = useCallback(
    (node) => {
      if (loading) return;
      if (observerRef.current) observerRef.current.disconnect();

      observerRef.current = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting && hasMore) {
            setPage((prev) => prev + 1);
          }
        },
        { rootMargin: '100px' },
      );

      if (node) observerRef.current.observe(node);
    },
    [hasMore, loading],
  );

  return { items, lastItemRef, hasMore, loading };
};
