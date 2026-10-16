/* /server-client/basics — Products (server) renders SearchBox (client), which receives
   ServerStats (server) as children. Static (○): it prerenders at build time. */

import Products from "../_components/products";

export default function BasicsPage() {
  return (
    <>
      <Products />
    </>
  )
}
