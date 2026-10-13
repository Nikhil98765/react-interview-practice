/* Suspense fallback for this segment's PAGE. It is streamed immediately, which is why the
   status code is already 200 by the time the page throws or calls notFound(). */

const ProductLoading = () => {
  return (
    <p>Loading Product...</p>
  );
}

export default ProductLoading;
