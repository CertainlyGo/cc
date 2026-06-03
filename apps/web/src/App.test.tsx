import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import App from "./App";
import * as api from "./api";

describe("App", () => {
  it("sends a user message and renders the assistant response", async () => {
    vi.spyOn(api, "sendChatMessage").mockResolvedValue({
      message: "The answer is 4.",
      sessionId: "session-1"
    });

    render(<App />);

    await userEvent.type(screen.getByLabelText("Message"), "2 + 2");
    await userEvent.click(screen.getByRole("button", { name: "Send" }));

    expect(await screen.findByText("2 + 2")).toBeInTheDocument();
    expect(await screen.findByText("The answer is 4.")).toBeInTheDocument();
  });
});
