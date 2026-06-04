import { FormEvent, useMemo, useState } from "react";
import type { ChatResponse } from "@ts-react-agent/shared";
import * as api from "./api";

type Message = {
  id: string;
  role: "user" | "assistant";
  text: string;
};

const sessionStorageKey = "ts-react-agent-session-id";

function createId(prefix: string): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}-${crypto.randomUUID()}`;
  }

  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function getStorage(): Storage | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const storage = window.localStorage;

    if (
      typeof storage?.getItem !== "function"
      || typeof storage.setItem !== "function"
    ) {
      return null;
    }

    return storage;
  } catch {
    return null;
  }
}

function readStoredSessionId(): string | null {
  const storage = getStorage();

  try {
    return storage?.getItem(sessionStorageKey) ?? null;
  } catch {
    return null;
  }
}

function writeStoredSessionId(sessionId: string): void {
  const storage = getStorage();

  try {
    storage?.setItem(sessionStorageKey, sessionId);
  } catch {
    // Keep the in-memory session state when browser storage is unavailable.
  }
}

function getStoredSessionId(): string {
  const existing = readStoredSessionId();

  if (existing) {
    return existing;
  }

  const sessionId = createId("session");
  writeStoredSessionId(sessionId);
  return sessionId;
}

export default function App() {
  const [sessionId, setSessionId] = useState(getStoredSessionId);
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);

  const canSend = useMemo(() => draft.trim().length > 0 && !isSending, [draft, isSending]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const message = draft.trim();

    if (!message || isSending) {
      return;
    }

    const userMessage: Message = {
      id: createId("message"),
      role: "user",
      text: message
    };

    setMessages((current) => [...current, userMessage]);
    setDraft("");
    setError(null);
    setIsSending(true);

    try {
      const response: ChatResponse = await api.sendChatMessage({
        message,
        sessionId
      });

      writeStoredSessionId(response.sessionId);
      setSessionId(response.sessionId);
      setMessages((current) => [
        ...current,
        {
          id: createId("message"),
          role: "assistant",
          text: response.message
        }
      ]);
    } catch (caught) {
      const nextError = caught instanceof Error ? caught.message : "chat request failed";
      setError(nextError);
    } finally {
      setIsSending(false);
    }
  }

  return (
    <main className="app-shell">
      <section className="chat-panel" aria-label="Chat">
        <header className="chat-header">
          <div>
            <p className="eyebrow">TS React Agent</p>
            <h1>Chat</h1>
          </div>
          <span className="session-pill" title={sessionId}>Session active</span>
        </header>

        <div className="message-list" aria-live="polite">
          {messages.length === 0 ? (
            <p className="empty-state">Start a conversation with the agent.</p>
          ) : (
            messages.map((message) => (
              <article className={`message message-${message.role}`} key={message.id}>
                <span className="message-author">
                  {message.role === "user" ? "You" : "Assistant"}
                </span>
                <p>{message.text}</p>
              </article>
            ))
          )}

          {isSending ? <p className="loading-state">Assistant is thinking...</p> : null}
        </div>

        {error ? <p className="error-message" role="alert">{error}</p> : null}

        <form className="composer" onSubmit={handleSubmit}>
          <label htmlFor="message">Message</label>
          <div className="composer-row">
            <textarea
              id="message"
              name="message"
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder="Ask something..."
              rows={2}
            />
            <button type="submit" disabled={!canSend}>
              Send
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}
