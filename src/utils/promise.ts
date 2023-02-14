export function isolate<T>(cb: () => T): Promise<T> {
  return new Promise((r) => {
    r(cb());
  });
}
