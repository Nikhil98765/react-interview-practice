'use client';

/* The one way a layout can "know" the current path or query string: delegate to a Client
   Component. usePathname / useSearchParams re-run on every navigation.
   ⚠️ useSearchParams needs a <Suspense> above it, or a prerendered route falls back to
      client-side rendering up to the nearest boundary (see the layout that renders this). */

import { usePathname, useSearchParams } from "next/navigation";

export const CurrentUrl = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const query = searchParams.toString();

  return (
    <p>
      pathname = <code>{pathname}</code> · query = <code>{query || "(none)"}</code>
    </p>
  );
}
