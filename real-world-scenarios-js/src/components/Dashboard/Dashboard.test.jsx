import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { Dashboard } from "./Dashboard";
import { AuthContext, AuthProvider } from "../../context/AuthContext";

// Dashboard only needs the logout function from auth in this test, so the full
// provider setup can be replaced with a small mock.
vi.mock('../../context/AuthContext.jsx', () => ({
  useAuth: () => ({ logout: () => { } })
}));

// The component calls showBoundary when async requests fail; mock it so the test
// can focus on rendering instead of error-boundary behavior.
vi.mock('react-error-boundary', () => ({ useErrorBoundary: () => ({ showBoundary: () => { } }) }));

// Dashboard fetches data on mount. Returning an empty product list keeps the
// effect predictable while still exercising the async render path.
vi.mock('../../context/AxiosContext.jsx', () => ({ useAxios: () => ({ get: vi.fn().mockResolvedValue({ data: { products: [] } }) }) }));

describe('Dashboard Component', () => {
  it('renders the component', async() => {
    render(
        <Dashboard />
    );

    // findByText waits for React Testing Library to observe the rendered heading
    // after Dashboard's mount effects have had a chance to run.
    expect(await screen.findByText("Dashboard")).toBeInTheDocument();
   })
})
