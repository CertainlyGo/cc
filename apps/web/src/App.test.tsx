import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import App from "./App";
import * as api from "./api";

const originalLocalStorage = Object.getOwnPropertyDescriptor(window, "localStorage");

describe("App", () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
    if (originalLocalStorage) {
      Object.defineProperty(window, "localStorage", originalLocalStorage);
    }
  });

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

  it("uses the returned session id for the next request", async () => {
    const sendChatMessage = vi.spyOn(api, "sendChatMessage")
      .mockResolvedValueOnce({
        message: "first response",
        sessionId: "session-from-api"
      })
      .mockResolvedValueOnce({
        message: "second response",
        sessionId: "session-from-api"
      });

    vi.spyOn(crypto, "randomUUID")
      .mockReturnValueOnce("00000000-0000-4000-8000-000000000001")
      .mockReturnValueOnce("00000000-0000-4000-8000-000000000002")
      .mockReturnValueOnce("00000000-0000-4000-8000-000000000003")
      .mockReturnValueOnce("00000000-0000-4000-8000-000000000004")
      .mockReturnValueOnce("00000000-0000-4000-8000-000000000005");

    render(<App />);

    await userEvent.type(screen.getByLabelText("Message"), "first");
    await userEvent.click(screen.getByRole("button", { name: "Send" }));
    expect(await screen.findByText("first response")).toBeInTheDocument();

    await userEvent.type(screen.getByLabelText("Message"), "second");
    await userEvent.click(screen.getByRole("button", { name: "Send" }));
    expect(await screen.findByText("second response")).toBeInTheDocument();

    expect(sendChatMessage).toHaveBeenNthCalledWith(1, {
      message: "first",
      sessionId: "session-00000000-0000-4000-8000-000000000001"
    });
    expect(sendChatMessage).toHaveBeenNthCalledWith(2, {
      message: "second",
      sessionId: "session-from-api"
    });
  });

  it("continues with an in-memory session when localStorage is unavailable", async () => {
    const sendChatMessage = vi.spyOn(api, "sendChatMessage").mockResolvedValue({
      message: "storage is blocked",
      sessionId: "session-from-api"
    });

    vi.spyOn(crypto, "randomUUID")
      .mockReturnValueOnce("00000000-0000-4000-8000-000000000011")
      .mockReturnValueOnce("00000000-0000-4000-8000-000000000012")
      .mockReturnValueOnce("00000000-0000-4000-8000-000000000013");
    Object.defineProperty(window, "localStorage", {
      configurable: true,
      get() {
        throw new Error("storage blocked");
      }
    });

    render(<App />);

    await userEvent.type(screen.getByLabelText("Message"), "hello");
    await userEvent.click(screen.getByRole("button", { name: "Send" }));

    expect(await screen.findByText("storage is blocked")).toBeInTheDocument();
    expect(sendChatMessage).toHaveBeenCalledWith({
      message: "hello",
      sessionId: "session-00000000-0000-4000-8000-000000000011"
    });
  });
});
