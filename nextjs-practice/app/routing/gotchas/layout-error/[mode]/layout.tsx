/* GOTCHA 2 — a layout that throws. error.tsx in THIS folder cannot catch it: the boundary is
   rendered INSIDE the layout, so the error has already escaped by the time it would mount.
   It lands in the nearest boundary ABOVE: the parent segment's error.tsx.
   ([mode] keeps the route dynamic, so `next build` doesn't try to prerender a throw.) */

const ThrowingLayout = async ({ params, children }: LayoutProps<"/routing/gotchas/layout-error/[mode]">) => {
  const { mode } = await params;
  if (mode === "throw") throw new Error("thrown inside layout-error/[mode]/layout.tsx");

  return (
    <div className="demo-box">
      <span className="tag">layout rendered fine (mode = {mode})</span>
      {children}
    </div>
  );
};

export default ThrowingLayout;
