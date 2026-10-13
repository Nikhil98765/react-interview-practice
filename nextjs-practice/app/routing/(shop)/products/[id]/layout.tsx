/* Layout for the [id] segment. A layout gets `params` (unlike searchParams) — and the typed
   helper catches a wrong key: this file used to declare `params: Promise<{ id1: string }>`,
   which `tsc` rejected against LayoutProps<"/products/[id]">. */

const ProductLayout = async ({ params, children }: LayoutProps<"/routing/products/[id]">) => {
  const { id } = await params;

  // ** parent's loader is triggered when child's layout is delayed.
  // await new Promise<void>((res, rej) => { setTimeout(() => res(), 3000)})
  // => There is a runnable version of this at /routing/gotchas/slow-layout (sheet, Gotcha 3).

  return (
    <div className="demo-box">
      <span className="tag">[id] layout — params.id = {id}</span>
      {children}
    </div>
  )
}

export default ProductLayout;
