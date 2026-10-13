
/**
 ** Dynamic segments
 * [id] => one part
 * [...slug] => one or more match => docs/react matches but docs URL will fail.
 * [[...slug]] => zero or more match => docs/react and docs URL's will match
 *
 * ✅ MEASURED: /routing/docs -> 404 (a catch-all needs at least one part),
 *    /routing/docs/a/b -> 200 with slug = ["a", "b"].
 * ⚠️ So for [...slug] the param is ALWAYS a string[] — never undefined. `slug?: string[]` is
 *    the type for the OPTIONAL form [[...slug]]. PageProps gets this right from the folder name.
 */

import { notFound } from "next/navigation";

const DocsPage = async ({ params }: PageProps<"/routing/docs/[...slug]">) => {
  const { slug } = await params;
  console.log("🚀 ~ DocsPage ~ slug:", slug)

  // No loading.tsx sits above this page, so nothing has been streamed yet when this runs.
  // Compare the status code with /routing/products/999, which has a loading.tsx (sheet, Gotcha 6).
  if (slug[0] === "missing") notFound();
  
  return (
    <>
      <h2>Docs Page</h2>
      <p>slug = <code>{JSON.stringify(slug)}</code> ({slug.length} part{slug.length === 1 ? "" : "s"})</p>
    </>
  );
}

export default DocsPage;
