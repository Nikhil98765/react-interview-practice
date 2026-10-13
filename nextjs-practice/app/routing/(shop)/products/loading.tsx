/* Suspense fallback for the /routing/products segment. It also covers slow work in the
   CHILD segment's layout ([id]/layout.tsx), which that segment's own loading.tsx cannot
   (sheet, Gotcha 3). */

const ProductsLoader = () => {
  return <p>Products Loader...</p>
}

export default ProductsLoader;
