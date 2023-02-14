export function warn(message: string, code = 'DeprecationWarning', detail?: string) {
  process.emitWarning(message, { code, detail });
}
