import { Page } from "@playwright/test";
import { v4 } from "uuid";

export type Session = {
  userId: string;
  currencyCode: string;
};

export function createSession(): Session {
  return {
    userId: v4(),
    currencyCode: "USD",
  };
}

export async function getSession(page: Page): Promise<Session> {
  const sessionId = await page.evaluate(() => localStorage.getItem("session"));
  const { userId, currencyCode } = JSON.parse(sessionId!);

  return { userId, currencyCode };
}
