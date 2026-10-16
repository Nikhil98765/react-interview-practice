/* Server component: fetches on the server and passes ServerStats (also server) into the client SearchBox as children. */
import { SearchBox } from "./search-box";
import { Badge } from "./Badge";
import { ServerStats } from "./server-stats";


type Product = {
  id: number;
  title: string;
}

export default async function Products() {

  const res = await fetch("https://dummyjson.com/products?limit=3");
  const { products } = await res.json();

  return (
    <>
      {/*
        ** If any server components send props to client component, only serializable props work (primitives, objects, date) but not function. so sending function to client component as a prop will cause build issue. Fix: mark it as a server action ('use server')
        ⚠️ It fails while rendering, not compiling. It broke next build only because this page is static (Gotcha 5).
      */}
      <SearchBox prop1={'dsd'} >
        <ServerStats />
      </SearchBox>
      <ul>
        {
          products.map((product: Product) => <li key={product.id}>{ product.title}</li>)
        }
      </ul>
      <Badge />
    </>
  );
} 