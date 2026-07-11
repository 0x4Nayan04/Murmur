const unauthorizedHandlers = new Set();

export const onUnauthorized = (handler) => {
  unauthorizedHandlers.add(handler);
  return () => unauthorizedHandlers.delete(handler);
};

export const emitUnauthorized = ({ isAuthCheck = false } = {}) => {
  if (isAuthCheck) return;
  for (const handler of unauthorizedHandlers) {
    handler();
  }
};
