'use client';

/* This segment's OWN boundary. It would catch a throw from page.tsx — never from the
   layout.tsx sitting next to it. */

const OwnError = ({ error }: { error: Error & { digest?: string } }) => {
  return (
    <div className="demo-box">
      <span className="tag">caught by the segment&apos;s OWN error.tsx</span>
      <p>{error.message}</p>
    </div>
  );
};

export default OwnError;
