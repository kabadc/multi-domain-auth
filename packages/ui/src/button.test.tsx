import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { Button } from "./button";

describe("Button (UI Atom Component)", () => {
  it("renders children correctly", () => {
    render(<Button appName="web">Click me</Button>);
    expect(
      screen.getByRole("button", { name: /click me/i }),
    ).toBeInTheDocument();
  });

  it("triggers click action when clicked", () => {
    const alertMock = vi.spyOn(window, "alert").mockImplementation(() => {});
    render(<Button appName="web">Submit</Button>);

    const button = screen.getByRole("button", { name: /submit/i });
    fireEvent.click(button);

    expect(alertMock).toHaveBeenCalledWith("Hello from your web app!");
    alertMock.mockRestore();
  });
});
