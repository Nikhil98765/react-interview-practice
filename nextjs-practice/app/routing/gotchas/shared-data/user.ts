/* GOTCHA 4 — a layout cannot hand data to its page, so both ask for it. React.cache makes the
   second ask free: calls with the same argument share one result WITHIN a single request.
   (fetch() gets the same de-duplication automatically; cache() is for a database/ORM call.) */

import { cache } from "react";

let calls = 0;

export const getUser = cache(async (id: string) => {
  calls++;
  console.log(`🚀 ~ getUser(${id}) actually ran — call #${calls} since the server started`);
  await new Promise<void>((res) => setTimeout(res, 100));
  return { id, name: `User ${id}`, fetchedAt: new Date().toISOString() };
});
