// Type guarded way to ensure typescript infers the correct outcome from filters/finds
export const isRejected = <T>(input: PromiseSettledResult<T>): input is PromiseRejectedResult =>
  input.status === 'rejected';

export const isFulfilled = <T>(input: PromiseSettledResult<T>): input is PromiseFulfilledResult<T> =>
  input.status === 'fulfilled';
