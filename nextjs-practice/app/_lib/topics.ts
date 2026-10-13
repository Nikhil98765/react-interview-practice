/* ============================================================================
   TOPIC REGISTRY — the one list the nav and the home page are built from
   ============================================================================
   TO ADD A TOPIC
     1. copy app/_template to app/<slug>          (a private `_folder` is never a route)
     2. fill in app/<slug>/sheet.ts and build its demo routes beside it
     3. add or flip its entry below to status: "ready"

   A "planned" entry shows on the home page greyed out and is not linked, so the list can
   double as your roadmap. The three planned ones here are placeholders — rename, reorder or
   delete them to match what you actually study next.
   ============================================================================ */

export type Topic = {
  /** the folder name under app/, and the URL prefix */
  slug: string;
  title: string;
  summary: string;
  status: "ready" | "planned";
};

export const topics: Topic[] = [
  {
    slug: "routing",
    title: "App Router",
    summary:
      "File conventions, layouts that persist, dynamic segments, and where loading / error / not-found sit in the hierarchy.",
    status: "ready",
  },
  {
    slug: "server-client",
    title: "Server & Client Components",
    summary: "The 'use client' boundary, what can cross it, and composition patterns.",
    status: "planned",
  },
  {
    slug: "data-fetching",
    title: "Data fetching & caching",
    summary: "fetch, React.cache, streaming with Suspense, revalidation.",
    status: "planned",
  },
  {
    slug: "server-actions",
    title: "Server Actions",
    summary: "'use server', forms, useActionState on the server boundary.",
    status: "planned",
  },
];

export const readyTopics = topics.filter((t) => t.status === "ready");
