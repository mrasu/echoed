import { ZodError } from "zod";

export const formatZodError = (error: ZodError): string => {
  const v = JSON.stringify(
    error.format(),
    (k, v: unknown) => {
      if (Array.isArray(v)) {
        if (v.length === 0) return undefined;
      }
      return v;
    },
    2,
  );

  return v;
};
