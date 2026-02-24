# important topics for interview prep in react router ?

Based on everything we've covered and what's commonly tested, here are the most important React Router topics for interviews:

## Core Routing Concepts

- **BrowserRouter vs createBrowserRouter** — know the difference between Declarative and Data mode, when to use each[^1][^2]

```
- **`<Routes>` and `<Route>`** — how matching works, exact matching by default in v6, no more `exact` prop
```

```
- **Nested Routes + `<Outlet />`** — most frequently asked; how parent layout stays mounted, child renders at `<Outlet />`[^3][^4]
```

- **Index Routes** — what `index` means, how it differs from `path="/"`
- **Catch-all route `path="*"`** — 404 handling[^5]

***

## Navigation

- **`useNavigate`** — programmatic navigation, `replace`, going back with `-1`

```
- **`<Link>` vs `<NavLink>`** — difference, `isActive` in NavLink
```

- **`<Navigate />`** — declarative redirect, when to use `replace`
- **Relative vs Absolute paths** — paths with and without leading `/`

***

## Dynamic Routing

- **`useParams`** — reading URL segments, always returns strings[^6][^7]
- **Re-fetching on param change** — adding param to `useEffect` dependency array
- **Optional params and wildcards** — `?` suffix and `*` segments

***

## Data Mode Specific (createBrowserRouter)

- **`loader`** — what it is, runs before render, how to use `useLoaderData()`
- **`action`** — handles form submissions, how to use `useActionData()`
- **`errorElement`** — only works in Data Mode, error bubbling up the route tree, `useRouteError()`[^8][^9]
- **`useFetcher`** — fetch data without navigation

***

## Common Hooks — Know All Of These

```tsx
useNavigate()       // programmatic navigation
useParams()         // dynamic URL params
useSearchParams()   // query string read/write
useLocation()       // current pathname, state, search
useOutletContext()  // pass data from parent to child via Outlet
useRouteError()     // read error in errorElement
useLoaderData()     // read data returned from loader
useNavigation()     // isPending state during navigation
useMatch()          // check if current URL matches a pattern
```


***

## Frequently Asked Interview Questions

**Conceptual:**

- What is the difference between `<BrowserRouter>` and `createBrowserRouter`?
- How do nested routes work? What happens if you forget `<Outlet />`?
- What is the difference between `path="*"` and `errorElement`?
- How do you prevent re-fetching when only query params change?
- What is an index route? How is it different from the parent route?
- How do you pass data between parent and child routes?
- How does error bubbling work with `errorElement`?

**Coding:**

- Implement a protected route that redirects to `/login` if unauthenticated
- Build a nested dashboard layout with sidebar navigation
- Implement search-as-you-type using `useSearchParams`
- Set up lazy loading for route components with `React.lazy` + `Suspense`
- Handle a 404 from an API inside a loader

***

## V5 → V6 Changes (Often Asked)

| V5 | V6/V7 |
| :-- | :-- |
| `<Switch>` | `<Routes>` |
| `<Redirect>` | `<Navigate>` |
| `useHistory()` | `useNavigate()` |
| `exact` prop needed | Exact by default |
| `component={Page}` | `element={<Page />}` |
| `useRouteMatch()` | `useMatch()` |


***

## Most Important Pattern to Know Cold

The **Protected Route** pattern comes up in almost every React interview:

```tsx
function ProtectedRoute({ children }) {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return children;
}

// After login — redirect back to original page
function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  const handleLogin = async () => {
    await login();
    navigate(from, { replace: true });
  };
}
```

Focus most of your prep on **nested routes**, **dynamic routing**, **protected routes**, and the **difference between Declarative vs Data mode** — these cover ~80% of what interviewers ask about React Router.

<div align="center">⁂</div>

[^1]: https://blog.logrocket.com/react-router-v7-modes/

[^2]: https://reactrouter.com/start/modes

[^3]: https://www.robinwieruch.de/react-router-nested-routes/

[^4]: https://www.dhiwise.com/blog/design-converter/react-router-outlet-guide-nested-routes-made-simple

[^5]: https://blog.openreplay.com/catch-all-routes-404-react-router/

[^6]: https://refine.dev/blog/react-router-useparams/

[^7]: https://www.freecodecamp.org/news/use-dynamic-segments-in-react-router/

[^8]: https://reactrouter.com/6.30.3/route/error-element

[^9]: https://reactrouter.com/6.30.2/route/error-element

