import { render, screen } from "@testing-library/react";
import App from "./App";

test("renders dashboard routes (Trips)", () => {
  render(<App />);
  expect(screen.getByText(/Trips/i)).toBeInTheDocument();
});
