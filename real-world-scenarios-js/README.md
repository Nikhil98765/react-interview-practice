# Real World Scenarios in React JS

This project is a JavaScript practice sandbox for React flows that come up in
real applications. The active app currently focuses on authentication,
protected routing, role-gated routes, and axios token handling against the
DummyJSON API.

The same project also keeps small exercises for file uploads, upload progress,
infinite scrolling, WebSocket chat, debounce/throttle utilities, and reusable
hooks.

## Current App Flow

`src/main.jsx` wraps the app with:

- `BrowserRouter` for client-side routing
- `AuthProvider` for user, access token, login, logout, and session restore state
- `AxiosProvider` for the private axios instance configured by
  `useAxiosPrivate`

The active routes in `src/App.jsx` are:

| Route | Access | Purpose |
| --- | --- | --- |
| `/login` | Public | Log in through the auth context |
| `/unauthorized` | Public | Role access fallback |
| `/dashboard` | Authenticated | Load the current profile and a small product list |
| `/profile` | Authenticated | Protected profile placeholder |
| `/admin` | Admin role | Admin panel placeholder |
| `/moderator` | Admin or moderator role | Moderation placeholder |

Unauthenticated users are redirected to `/login` by `ProtectedRoute`. The
role-specific routes are guarded by `RoleRoute`.

## Auth Practice

The authentication flow uses DummyJSON endpoints:

1. `AuthProvider` restores a session from the refresh token saved in
   `sessionStorage`.
2. Login stores the returned refresh token and keeps the access token in React
   state.
3. The private axios client sends the access token in the `Authorization`
   header.
4. A `401` response triggers the refresh hook and retries the original request
   with a new access token.

`useAxiosPrivate` keeps the latest access token in a ref so the interceptor can
read fresh auth state without being recreated every time the token changes.
The render/effect ordering issue behind that approach is captured in
[render-effect-order-axios-interceptor-race.md](./render-effect-order-axios-interceptor-race.md).

## Scenario Exercises

These examples live in `src/components`, `src/hooks`, and `src/utils` even when
they are not mounted by the current routed app:

| Area | Current examples |
| --- | --- |
| File uploads | Single image upload, multi-file upload, XHR progress tracking, `useFileUpload` |
| Scrolling | `InfiniteScrolling` with an Intersection Observer based `useInfiniteScroll` hook |
| Realtime UI | A direct WebSocket chat component and a reconnecting `useWebSocket` hook |
| Input/event control | `useDebounce`, `useThrottle`, and standalone debounce/throttle utilities |
| Auth infrastructure | Auth context, private axios client, refresh-token hook, route guards |

Several of these examples are imported or commented in `src/App.jsx` so they
can be swapped into the screen while practicing a specific scenario.

## Project Map

```text
src/
|- api/          private axios instance
|- components/   routed pages and scenario demos
|- context/      auth and axios providers
|- hooks/        upload, auth, scroll, WebSocket, debounce, throttle hooks
`- utils/        standalone debounce and throttle examples
```

## Run Locally

From this folder:

```bash
npm install
npm run dev
```

Useful checks:

```bash
npm run lint
npm run build
```
