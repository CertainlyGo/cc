export type ChatRequest = {
  message: string;
  sessionId?: string;
};

export type ChatResponse = {
  message: string;
  sessionId: string;
};

export type ChatErrorResponse = {
  error: string;
};
