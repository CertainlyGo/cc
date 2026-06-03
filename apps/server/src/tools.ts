import { tool } from "@langchain/core/tools";
import { z } from "zod";

const calculatorPattern = /^[\d\s+\-*/().%]+$/;

export function calculateExpression(expression: string): string {
  if (!calculatorPattern.test(expression)) {
    return "Invalid calculator expression. Use only numbers and arithmetic operators.";
  }

  try {
    const result = Function(`"use strict"; return (${expression});`)();

    if (typeof result !== "number" || !Number.isFinite(result)) {
      return "Invalid calculator expression. Result must be a finite number.";
    }

    return String(result);
  } catch {
    return "Invalid calculator expression. Check the syntax and try again.";
  }
}

export function getCurrentTimeText(now = new Date()): string {
  return now.toISOString();
}

export function createAgentTools() {
  const calculator = tool(
    async ({ expression }) => calculateExpression(expression),
    {
      name: "calculator",
      description: "Calculate a simple arithmetic expression.",
      schema: z.object({
        expression: z.string().describe("Arithmetic expression using numbers and operators.")
      })
    }
  );

  const currentTime = tool(
    async () => getCurrentTimeText(),
    {
      name: "current_time",
      description: "Return the current server time as an ISO timestamp.",
      schema: z.object({})
    }
  );

  return [calculator, currentTime];
}
