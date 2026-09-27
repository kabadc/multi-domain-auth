import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Badge } from "./badge";

describe("Badge (Atomic Design - Atom Component)", () => {
  it("renders text content properly", () => {
    render(<Badge>Verified Domain</Badge>);
    expect(screen.getByText("Verified Domain")).toBeInTheDocument();
  });

  it("applies variant classes correctly", () => {
    render(<Badge variant="success">Active</Badge>);
    const element = screen.getByTestId("badge");
    expect(element).toHaveClass("bg-emerald-100", "text-emerald-800");
  });
});
