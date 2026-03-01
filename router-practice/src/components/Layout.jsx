// Layout.jsx
import { Outlet, Link } from "react-router-dom";
import { Newsletter } from "./Newsletter";

export default function Layout() {
  return (
    <div>
      {/* Navigation */}
      <nav>
        <Link to="/">Home</Link> | <Link to="/about">About</Link>
      </nav>

      {/* Current page renders here */}
      <main>
        <Outlet />
      </main>

      {/* Newsletter always visible in footer — on every page */}
      <footer>
        <Newsletter />
      </footer>
    </div>
  );
}
