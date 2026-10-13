/* TOPIC LAYOUT for /routing — wraps the sheet and every demo under it.

   DEMO: type in the box, then click around the links. The text survives, because a layout is
   NOT re-rendered or remounted on client navigation — only the page below it is swapped.
   (Verified in Chrome: typed text was still there after three <Link> navigations.) */

import Link from "next/link";

const RoutingLayout = ({ children }: LayoutProps<"/routing">) => {
  return (
    <>
      <nav className="subnav">
        <Link href="/routing">← Sheet</Link>
        <Link href="/routing/products">Shop</Link>
        <Link href="/routing/cart">Cart</Link>
        <Link href="/routing/about">About</Link>
        <Link href="/routing/docs/react/hooks">Docs (catch-all)</Link>
        <Link href="/routing/gotchas">Gotcha demos</Link>
        <input type="text" placeholder="Type, then navigate — I persist" />
      </nav>
      {children}
    </>
  );
};

export default RoutingLayout;
