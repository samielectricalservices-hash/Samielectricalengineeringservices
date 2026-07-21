type LogContext = Record<string, unknown>;

function serializeContext(context?: LogContext) {
  return context && Object.keys(context).length > 0 ? context : undefined;
}

export const logger = {
  info(message: string, context?: LogContext) {
    console.info(message, serializeContext(context));
  },
  warn(message: string, context?: LogContext) {
    console.warn(message, serializeContext(context));
  },
  error(message: string, context?: LogContext) {
    console.error(message, serializeContext(context));
  }
};
