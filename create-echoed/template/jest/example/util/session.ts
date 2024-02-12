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
