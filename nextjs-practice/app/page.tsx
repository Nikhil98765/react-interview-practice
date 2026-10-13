/* HOME — the index of sheets, built from app/_lib/topics.ts. */

import Link from "next/link";
import { topics } from "./_lib/topics";

export default function Home() {
  return (
    <article className="sheet">
      <h1>Next.js — interview revision sheets</h1>
      <p className="muted">
        Each topic is a folder under <code>app/</code>: a sheet you read at <code>/&lt;topic&gt;</code>,
        and live demo routes beside it. To add one, see <code>app/_lib/topics.ts</code>.
      </p>
      {topics.map((t) => (
        <div className={`card ${t.status === "planned" ? "planned" : ""}`} key={t.slug}>
          <h3>
            {t.status === "ready" ? <Link href={`/${t.slug}`}>{t.title}</Link> : t.title}
            {t.status === "planned" && <span className="muted"> · planned</span>}
          </h3>
          <p>{t.summary}</p>
        </div>
      ))}
    </article>
  );
}
