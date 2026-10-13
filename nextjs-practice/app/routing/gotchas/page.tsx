/* Index of the runnable gotcha demos. Each one makes a claim from the sheet observable. */

import Link from "next/link";

const GotchasIndex = () => {
  return (
    <>
      <h1>Gotcha demos</h1>
      <ul>
        <li><Link href="/routing/gotchas/slow-layout/2000">Slow layout</Link> — whose loading.tsx shows while a LAYOUT waits? (Gotcha 3)</li>
        <li><Link href="/routing/gotchas/layout-error/throw">Layout that throws</Link> — whose error.tsx catches it? (Gotcha 2)</li>
        <li><Link href="/routing/gotchas/layout-error/ok">…the same layout, not throwing</Link></li>
        <li><Link href="/routing/gotchas/shared-data/7">Layout and page need the same data</Link> — one call or two? (Gotcha 4)</li>
        <li><Link href="/routing/gotchas/template-vs-layout/a">template.tsx vs layout.tsx</Link> — which counter resets on navigation?</li>
      </ul>
    </>
  );
};

export default GotchasIndex;
