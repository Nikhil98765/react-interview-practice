'use client';

/* Error boundary for this segment. Must be a Client Component.
   ⚠️ Next 16: the recovery prop is `retry`, not `reset` (the name in older versions and in
      most tutorials). It re-fetches and re-renders the boundary's children.
   ⚠️ In production the message of a Server Component error is replaced with a generic one;
      `error.digest` is the id to look up in server logs. */

const ErrorProductPage = ({ error, retry }: { error: Error & { digest?: string }, retry: () => void }) => {
  return (
    <div>
      <p>Something went wrong: {error.message}</p>
      <button onClick={retry}>Try again</button>
    </div>
  )
}

export default ErrorProductPage;
