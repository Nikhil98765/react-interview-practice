# React Interview Practice

A collection of focused React practice projects for interview preparation.  
Each folder explores a specific concept with small, hands-on examples.

## Projects

| Project | What it covers |
| --- | --- |
| `Context-API-Practice` | A shopping-cart style app using `Context API + useReducer` for shared state, with add/update cart item flows. |
| `advanced-redux-practice` | Redux Toolkit cart app with async thunks (`fetchCartData` / `sendCartData`) and UI notifications for request states. |
| `auth-practice` | Full-stack auth + events app (`React Router` frontend + `Express` backend) with login/signup, token handling, and protected create/edit/delete routes. |
| `component-patterns` | Practice playground for common React component patterns: compound components, higher-order components, and render props. |
| `hooks-practice` | React hooks experiments including `use()` with `Suspense` and a custom `ErrorBoundary` integration. |
| `performance-optimization` | Performance-focused examples like lazy loading (`React.lazy`, `Suspense`) and controlled vs uncontrolled form handling. |
| `real-world-scenarios` | TypeScript-first practice sandbox for practical app patterns (forms + schema validation) using `react-hook-form` and `zod`. |
| `real-world-scenarios-js` | JavaScript practice sandbox with auth/session handling (Axios interceptors, token refresh), role-based routing, error boundaries, React Portals modal, upload/scroll/WebSocket/debounce/throttle exercises, Vitest + RTL tests, React Compiler, and Prettier + Husky pre-commit hooks. |
| `intersection-observer-js` | Vanilla JavaScript (no React) playground for the Intersection Observer API — scroll-triggered class toggling and an infinite-scroll pattern with dynamic card loading. |
| `react-with-typescript` | React + TypeScript practice with typed refs, generic components, context/reducer typing, and a custom typed hook. |
| `redux-basics` | Basic Redux fundamentals in plain JavaScript (store, reducer, dispatch, subscribe) via a small counter demo script. |
| `redux-practice` | React + Redux Toolkit basics with separate auth/counter slices, global state selection, and conditional UI rendering. |
| `router-practice` | React Router practice with nested layouts, dynamic routes, loaders/actions, form actions, and route-level error handling. |
| `react-router-v6-practice` | React Router v6 auth flow practice with a `Context API`-based `AuthProvider`/`useAuth` hook, login via the DummyJSON auth API, and a `ProtectedRoute` wrapper (`Outlet` + `Navigate`) guarding `/profile`, `/dashboard`, and `/settings`. |
| `styled-components-practice` | Styling playground with `styled-components` (prop-based button variants), plus CSS Modules composition and SVG component imports via `vite-plugin-svgr`. |
| `tanstack-query` | Event management app using TanStack Query for server state plus a local Express backend for CRUD APIs. |

## Learning Roadmap (Beginner to Advanced)

Use this order if you want a structured prep path:

1. `redux-basics` - Understand core Redux concepts first (`store`, `reducer`, `dispatch`, `subscribe`).
2. `hooks-practice` - Build confidence with modern React behavior (`use()`, `Suspense`, error boundaries).
3. `Context-API-Practice` - Practice shared state without Redux using `Context API + useReducer`.
4. `redux-practice` - Move to Redux Toolkit basics in a React app (auth + counter slices).
5. `router-practice` - Add routing fundamentals: nested routes, loaders/actions, and error handling.
6. `react-router-v6-practice` - Layer auth on top of routing with a Context-based `AuthProvider` and a `ProtectedRoute` that redirects unauthenticated users.
7. `performance-optimization` - Learn practical optimization patterns like lazy loading and efficient form handling.
8. `component-patterns` - Strengthen component architecture with compound components, HOCs, and render props.
9. `styled-components-practice` - Practice modern React styling with `styled-components`, dynamic props, and reusable visual variants.
10. `react-with-typescript` - Add type safety to common React patterns (refs, generics, typed hooks/context).
11. `real-world-scenarios-js` - Combine routing, auth state, Axios interceptors, role-based guards, error boundaries, React Portals, and reusable real-world hooks in JavaScript. Run `npm test` to exercise the Vitest + RTL suite.
12. `intersection-observer-js` - Step outside React to understand the native Intersection Observer API that powers infinite scroll, lazy loading, and scroll-animation patterns.
13. `real-world-scenarios` - Apply TypeScript in practical UI workflows with validated forms (`react-hook-form` + `zod`).
14. `advanced-redux-practice` - Work with async Redux Toolkit logic and server synchronization.
15. `tanstack-query` - Shift to server-state management with caching, fetching, and CRUD workflows.
16. `auth-practice` - Capstone full-stack flow combining auth, protected routes, and backend APIs.

If you are short on time, a high-impact fast track is:
`hooks-practice` -> `Context-API-Practice` -> `redux-practice` -> `router-practice` -> `real-world-scenarios-js` -> `tanstack-query` -> `auth-practice`.

## Running a project

Most projects can be run independently from their own folder:

```bash
cd <project-folder>
npm install
npm run dev
```

For `create-react-app` based projects (`redux-practice`, `advanced-redux-practice`), use:

```bash
npm start
```

For `intersection-observer-js`, it is a plain HTML/JS project with no framework:

```bash
cd intersection-observer-js
npm install
npm run dev
```

For `real-world-scenarios-js`, additional useful scripts:

```bash
npm test            # run Vitest unit tests
npm run format      # format with Prettier
npm run lint        # ESLint check
npm run stage       # staging build + preview
```

For `tanstack-query`, run both frontend and backend in separate terminals:

```bash
# Terminal 1
cd tanstack-query/backend && npm install && npm start

# Terminal 2
cd tanstack-query && npm install && npm run dev
```
