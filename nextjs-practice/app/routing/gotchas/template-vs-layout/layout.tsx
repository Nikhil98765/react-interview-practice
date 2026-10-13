/* layout.tsx persists across navigation: its client state is kept. */

import Link from "next/link";
import { LabelledCounter } from "./labelled-counter";

const DemoLayout = ({ children }: LayoutProps<"/routing/gotchas/template-vs-layout">) => {
  return (
    <div className="demo-box">
      <span className="tag">layout.tsx — kept on navigation</span>
      <LabelledCounter label="layout counter" />
      <Link href="/routing/gotchas/template-vs-layout/a">Page A</Link>{" · "}
      <Link href="/routing/gotchas/template-vs-layout/b">Page B</Link>
      {children}
    </div>
  );
};

export default DemoLayout;
