/* GOTCHA 3 — a layout that waits. The [ms] param keeps the route dynamic, so the wait
   happens on every request instead of once at build time.

   loading.tsx in THIS folder wraps the page, not this layout: layout.tsx sits above
   loading.tsx in the hierarchy. So the fallback you see is the PARENT's. */

const SlowLayout = async ({ params, children }: LayoutProps<"/routing/gotchas/slow-layout/[ms]">) => {
  const { ms } = await params;
  await new Promise<void>((res) => setTimeout(res, Number(ms) || 0));

  return (
    <div className="demo-box">
      <span className="tag">slow layout — waited {ms}ms</span>
      {children}
    </div>
  );
};

export default SlowLayout;
