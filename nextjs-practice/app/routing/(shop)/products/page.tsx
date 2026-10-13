/* /routing/products — the list. Each link exercises a different special file in [id]/. */

import Link from "next/link";

const ProductsPage = () => {
  return (
    <>
      <h1>Products Page</h1>
      <ul>
        <li><Link href="/routing/products/1">Product 1</Link> — loading.tsx, then the page</li>
        <li><Link href="/routing/products/0">Product 0</Link> — throws → error.tsx (with retry)</li>
        <li><Link href="/routing/products/999">Product 999</Link> — notFound() after the slow work → not-found.tsx (HTTP 200)</li>
        <li><Link href="/routing/products/404">Product 404</Link> — notFound() before the slow work → not-found.tsx at once (still HTTP 200)</li>
        <li><Link href="/routing/products/1?color=red&color=blue&size=m">Product 1 ?color=red&amp;color=blue&amp;size=m</Link> — repeated key becomes an array</li>
      </ul>
    </>
  );
}

export default ProductsPage;
