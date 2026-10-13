/* PARENT segment's Suspense fallback. The slow-layout demo proves this is the one that shows
   while a CHILD segment's layout is waiting. */

const GotchasLoading = () => {
  return <p>⏳ PARENT loading.tsx (app/routing/gotchas/loading.tsx)</p>;
};

export default GotchasLoading;
