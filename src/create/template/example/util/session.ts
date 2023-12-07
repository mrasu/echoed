import { v4 } from "uuid";

export type Session = {
  userId: string;
  currencyCode: string;
};

export function defaultSession(): Session {
  return {
    userId: v4(),
    currencyCode: "USD",
  };
}
