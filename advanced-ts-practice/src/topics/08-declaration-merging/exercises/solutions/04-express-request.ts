// import { get } from "../mock/express";

// export interface User { id: string; email: string }

// // 4a — express puts Request in a GLOBAL namespace, so augment the global scope.
// declare global {
//   namespace Express {
//     interface Request { user?: User }   // 4b — optional
//   }
// }

// get("/profile", (req) => {
//   console.log(req.user?.email);
// });

// // 4b — required `user` errors in mock/express.ts, on `handler({ url, method })`,
// // because express constructs a Request before any auth middleware runs.

// get("/health", (req) => {
//   console.log(req.url, req.method);
// });
