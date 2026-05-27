import { render, screen, waitFor } from "@testing-library/react";
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

// Dashboard fetches products on mount. Returning one product makes the Products
// section render after the mocked API call resolves.
vi.mock("../../context/AxiosContext.jsx", () => ({
  useAxios: () => ({
    get: vi.fn().mockResolvedValue({
      data: {
        products: [
          {
            id: 1,
            title: "Essence Mascara Lash Princess",
            description:
              "The Essence Mascara Lash Princess is a popular mascara known for its volumizing and lengthening effects. Achieve dramatic lashes with this long-lasting and cruelty-free formula.",
            category: "beauty",
            price: 9.99,
            discountPercentage: 7.17,
            rating: 4.94,
            stock: 5,
            tags: ["beauty", "mascara"],
            brand: "Essence",
            sku: "RCH45Q1A",
            weight: 2,
            dimensions: {
              width: 23.17,
              height: 14.43,
              depth: 28.01,
            },
            warrantyInformation: "1 month warranty",
            shippingInformation: "Ships in 1 month",
            availabilityStatus: "Low Stock",
            reviews: [
              {
                rating: 2,
                comment: "Very unhappy with my purchase!",
                date: "2024-05-23T08:56:21.618Z",
                reviewerName: "John Doe",
                reviewerEmail: "john.doe@x.dummyjson.com",
              },
              {
                rating: 2,
                comment: "Not as described!",
                date: "2024-05-23T08:56:21.618Z",
                reviewerName: "Nolan Gonzalez",
                reviewerEmail: "nolan.gonzalez@x.dummyjson.com",
              },
              {
                rating: 5,
                comment: "Very satisfied!",
                date: "2024-05-23T08:56:21.618Z",
                reviewerName: "Scarlett Wright",
                reviewerEmail: "scarlett.wright@x.dummyjson.com",
              },
            ],
            returnPolicy: "30 days return policy",
            minimumOrderQuantity: 24,
            meta: {
              createdAt: "2024-05-23T08:56:21.618Z",
              updatedAt: "2024-05-23T08:56:21.618Z",
              barcode: "9164035109868",
              qrCode: "...",
            },
            thumbnail: "...",
            images: ["...", "...", "..."],
          },
        ],
        // products: []
      },
    }),
  }),
}));

describe('Dashboard Component', () => {
  it('renders the component', async () => {
    render(
      <Dashboard />
    );

    // findByText waits for React Testing Library to observe the rendered heading
    // after Dashboard's mount effects have had a chance to run.
    expect(await screen.findByText("Dashboard")).toBeInTheDocument();
  });

  it('should wait for products API to finish before loading the products', async () => {
    render(<Dashboard />);

    // waitFor keeps retrying until the async products request finishes and the
    // component renders the loaded state.
    await waitFor(() => {
      expect(screen.getByText('Loaded')).toBeInTheDocument();
    });

    screen.debug();
    expect(screen.getByText('Products')).toBeInTheDocument();
  })
})
