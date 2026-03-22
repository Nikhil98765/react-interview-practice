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
| `react-with-typescript` | React + TypeScript practice with typed refs, generic components, context/reducer typing, and a custom typed hook. |
| `redux-basics` | Basic Redux fundamentals in plain JavaScript (store, reducer, dispatch, subscribe) via a small counter demo script. |
| `redux-practice` | React + Redux Toolkit basics with separate auth/counter slices, global state selection, and conditional UI rendering. |
| `router-practice` | React Router practice with nested layouts, dynamic routes, loaders/actions, form actions, and route-level error handling. |
| `styled-components-practice` | Styling-focused React practice (currently CSS Modules based) with reusable component styles and class composition (`composes`). |
| `tanstack-query` | Event management app using TanStack Query for server state plus a local Express backend for CRUD APIs. |

## Learning Roadmap (Beginner to Advanced)

Use this order if you want a structured prep path:

1. `redux-basics` - Understand core Redux concepts first (`store`, `reducer`, `dispatch`, `subscribe`).
2. `hooks-practice` - Build confidence with modern React behavior (`use()`, `Suspense`, error boundaries).
3. `Context-API-Practice` - Practice shared state without Redux using `Context API + useReducer`.
4. `redux-practice` - Move to Redux Toolkit basics in a React app (auth + counter slices).
5. `router-practice` - Add routing fundamentals: nested routes, loaders/actions, and error handling.
6. `performance-optimization` - Learn practical optimization patterns like lazy loading and efficient form handling.
7. `component-patterns` - Strengthen component architecture with compound components, HOCs, and render props.
8. `styled-components-practice` - Practice component-level styling organization with CSS Modules and style composition.
9. `react-with-typescript` - Add type safety to common React patterns (refs, generics, typed hooks/context).
10. `advanced-redux-practice` - Work with async Redux Toolkit logic and server synchronization.
11. `tanstack-query` - Shift to server-state management with caching, fetching, and CRUD workflows.
12. `auth-practice` - Capstone full-stack flow combining auth, protected routes, and backend APIs.

If you are short on time, a high-impact fast track is:
`hooks-practice` -> `Context-API-Practice` -> `redux-practice` -> `router-practice` -> `tanstack-query` -> `auth-practice`.

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

For `tanstack-query`, run both frontend and backend in separate terminals:

```bash
# Terminal 1
cd tanstack-query/backend && npm install && npm start

# Terminal 2
cd tanstack-query && npm install && npm run dev
```
