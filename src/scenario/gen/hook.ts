type BindVariables = Record<string, unknown>;

export const wrapHook = async (
  bindVariables: BindVariables,
  fn: () => Promise<BindVariables>,
): Promise<BindVariables> => {
  const res = await fn();

  return {
    ...bindVariables,
    ...res,
  };
};
