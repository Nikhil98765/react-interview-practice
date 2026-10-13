/* ROUTE GROUP LAYOUT — `(shop)` is in the folder path but NOT in the URL:
   app/routing/(shop)/products -> /routing/products. Shop and Cart share this layout.

   DEMO: bump the counter, then go Products <-> Cart. The count survives (same layout, never
   remounted). Go to About and back: it resets, because About is outside the group. */

import { Suspense } from "react";
import Link from "next/link";
import { Counter } from "./counter";
import { CurrentUrl } from "./current-url";

// ❌ What this used to be:
//      const ShopLayout = async ({ children, searchParams }: { ...; searchParams: Promise<...> }) => {
//        const queryParams = await searchParams;
//    MEASURED: queryParams logged `undefined` on every request, and `tsc` rejected the file —
//      TS2344: Property 'searchParams' is missing in type 'LayoutProps<"/">'
//    A layout only receives `children` and `params` (sheet, Gotcha 1). `next build` fails on it.
const ShopLayout = ({ children }: LayoutProps<"/routing">) => {
  return (
    <section className="demo-box">
      <span className="tag">(shop) layout</span>
      <h2>Shop</h2>
      <Link href="/routing/products">Products</Link>{" · "}
      <Link href="/routing/cart">Cart</Link>{" · "}
      <Link href="/routing/products?sort=price">Products ?sort=price</Link>
      <br />
      {/* ✅ The fix for Gotcha 1: read the URL in a CLIENT component rendered inside the layout.
          Client components re-render on navigation; the layout itself does not. */}
      <Suspense fallback={<p>reading URL…</p>}>
        <CurrentUrl />
      </Suspense>
      <Counter />
      {children}
    </section>
  )
}

export default ShopLayout;
