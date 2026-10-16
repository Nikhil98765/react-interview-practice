//** Even though Badge doesn't have use client directive, if it is imported in client component then it will be a client component no matter if it is imported in any other server component.
// ⚠️ Half right: imported from Products (server) it stays a server component. Each import decides which side that copy runs on (Gotcha 1).
// Not async: an async component imported by a client file errors in dev (Gotcha 2).

export const Badge = () => {
  console.log("🚀 ~ Badge rendered");
  
  return (
    <h1>Badge</h1>
  );
}
