'use client';

/* PARENT segment's error boundary. The layout-error demo proves a throwing layout lands
   here, not in its own segment's error.tsx. */

const GotchasError = ({ error, retry }: { error: Error & { digest?: string }, retry: () => void }) => {
  return (
    <div className="demo-box">
      <span className="tag">caught by the PARENT error.tsx (app/routing/gotchas/error.tsx)</span>
      <p>{error.message}</p>
      <button onClick={retry}>Try again</button>
    </div>
  );
};

export default GotchasError;
