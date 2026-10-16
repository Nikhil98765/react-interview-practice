/* Server component passed to SearchBox as children: it stays on the server even though its parent is a client component. */

import { getUsers } from "../_lib/db";

export const ServerStats = async () => {

  await getUsers();

  return (
    <>
      <h2>Server Component</h2>
    </>
  );
}