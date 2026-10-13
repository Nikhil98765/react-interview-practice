/* /routing/products/[id] — one page that exercises loading.tsx, error.tsx and not-found.tsx.
     /1     -> 2s of "Loading Product...", then the page
     /0     -> throws        -> error.tsx
     /999   -> notFound() AFTER the slow work  -> not-found.tsx after 2s
     /404   -> notFound() BEFORE the slow work -> not-found.tsx at once
   Both are HTTP 200: loading.tsx had already started the response (sheet, Gotcha 6). */

import { notFound } from "next/navigation";

const ProductPage = async ({ params, searchParams }: PageProps<"/routing/products/[id]">) => {
  // ❌ Do not log `params` before awaiting it. `console.log(params)` enumerates the Promise and
  //    Next prints, on EVERY request:
  //      Error: Route "/products/[id]" used `...params` or similar expression. `params` is a
  //      Promise and must be unwrapped with `await` or `React.use()` before accessing its properties.
  // ** params works in both pages and layouts, for layout example see layout.tsx
  const { id } = await params;
  console.log("🚀 ~ ProductPage ~ id:", id);

  // ** searchParams works in pages only, same key more than once in URL then values will return as an array.
  const queryParams = await searchParams;
  console.log("🚀 ~ ProductPage ~ queryParams:", queryParams)
  // => ?color=red&color=blue&size=m logs { color: [ 'red', 'blue' ], size: 'm' } ✅
  // ⚠️ Reading searchParams opts this route into dynamic rendering (`ƒ` in the build output).

  // notFound() BEFORE anything slow. Faster for the user (14ms vs 2s, measured) — but still
  // HTTP 200, because this page renders INSIDE loading.tsx's Suspense boundary.
  if (id === '404') notFound();

  await new Promise<void>((res) => {
    setTimeout(() => {
      res();
    }, 2000);
  });
  if (id === '0') throw new Error('boom');
  // notFound() AFTER the wait: same 200, just 2 seconds later.
  if (id === '999') notFound();

  return (
    <>
      <h3>Product {id}</h3>
      <p>searchParams = <code>{JSON.stringify(queryParams)}</code></p>
    </>
  );
}

export default ProductPage;
