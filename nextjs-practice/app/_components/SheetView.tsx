/* Renders any Sheet (app/_lib/sheet.ts). A Server Component: it ships no JavaScript, the
   sheet is plain HTML. Topics never edit this file — they only supply data. */

import Link from "next/link";
import type { Demo, Sheet } from "../_lib/sheet";

/** `backticks` -> <code>. Everything else is rendered as plain text. */
function Inline({ text }: { text: string }) {
  return (
    <>
      {text.split("`").map((part, i) =>
        i % 2 === 1 ? <code key={i}>{part}</code> : <span key={i}>{part}</span>,
      )}
    </>
  );
}

function DemoLink({ demo }: { demo: Demo }) {
  return (
    <p className="demo">
      <Link href={demo.href}>▶ {demo.label}</Link>
      <span className="muted"> — <Inline text={demo.lookFor} /></span>
    </p>
  );
}

export function SheetView({ sheet }: { sheet: Sheet }) {
  return (
    <article className="sheet">
      <h1>{sheet.title} 🎯</h1>
      <p className="muted">{sheet.verifiedOn}</p>
      <p className="legend">
        ✅ verified · ❌ broken (the failure is the lesson) · ⚠️ gotcha · 💡 interview takeaway
      </p>

      <section className="card">
        <h2>The model 🧠</h2>
        {sheet.model.map((p, i) => (
          <p key={i}><Inline text={p} /></p>
        ))}
        <p className="one-liner">💡 <Inline text={sheet.oneLiner} /></p>
      </section>

      {sheet.blocks?.map((b) => (
        <section key={b.title}>
          <h2>{b.title}</h2>
          <pre>{b.pre}</pre>
          {b.caption && <p className="muted"><Inline text={b.caption} /></p>}
        </section>
      ))}

      {sheet.tables?.map((t) => (
        <section key={t.title}>
          <h2>{t.title}</h2>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>{t.head.map((h) => <th key={h}><Inline text={h} /></th>)}</tr>
              </thead>
              <tbody>
                {t.rows.map((row, i) => (
                  <tr key={i}>
                    {row.map((cell, j) => <td key={j}><Inline text={cell} /></td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {t.caption && <p className="muted"><Inline text={t.caption} /></p>}
        </section>
      ))}

      <section>
        <h2>Live demos ▶️</h2>
        <p className="muted">Open each one with the terminal running <code>npm run dev</code> beside it — half of the proof is in the server log.</p>
        {sheet.demos.map((d) => <DemoLink key={d.href + d.label} demo={d} />)}
      </section>

      <section>
        <h2>Gotchas ⚠️</h2>
        {sheet.gotchas.map((g, i) => (
          <div className="card" key={g.title}>
            <h3>{i + 1}. <Inline text={g.title} /></h3>
            {g.note && <p className="yours"><Inline text={g.note} /></p>}
            {g.verified?.map((v, j) => <p key={`v${j}`}>✅ <Inline text={v} /></p>)}
            {g.warn?.map((w, j) => <p key={`w${j}`}>⚠️ <Inline text={w} /></p>)}
            {g.tip && <p>💡 <Inline text={g.tip} /></p>}
            {g.demo && <DemoLink demo={g.demo} />}
          </div>
        ))}
      </section>

      <section>
        <h2>When not to use ❌</h2>
        <ol>
          {sheet.whenNotToUse.map((w, i) => <li key={i}><Inline text={w} /></li>)}
        </ol>
      </section>

      <section>
        <h2>Interview Q&amp;A 🎤</h2>
        {sheet.qa.map((item, i) => (
          <details key={item.q}>
            <summary>Q{i + 1}. <Inline text={item.q} /></summary>
            <p><Inline text={item.a} /></p>
          </details>
        ))}
      </section>

      {sheet.next && <p className="muted">👉 NEXT: <Inline text={sheet.next} /></p>}
    </article>
  );
}
