export const buildEnv = (
  envDefinition: Record<string, string | null>,
): Record<string, string> => {
  const env: Record<string, string> = {};
  for (const [key, defaultValue] of Object.entries(envDefinition)) {
    const envValue = process.env[key];
    if (envValue && envValue.length > 0) {
      env[key] = envValue;
    } else {
      if (defaultValue === null) {
        throw new Error(`Missing environment variable: ${key}`);
      }
      env[key] = defaultValue;
    }
  }

  return env;
};
