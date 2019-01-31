/**
 * Generic function type.
 */
export type GenericFunction<R = any> = (...args: any) => R;

/**
 * Returns a function that will be invoked until the timeout is over.
 * This timeout restarts evertime the function gets invoked before
 * the interval stablished.
 *
 * @template R type of return of the function to debounce. Default `any`.
 * @param ms Interval of time to wait for next invocation of the function.
 * By default value is `500`.
 * @param fn function, accepting any number of arguments, to debounce.
 */
export const debounce: <R>(
  ms: number,
  fn: GenericFunction<R>
) => (...args: any) => void = (ms = 500, fn) => {
  let inDebounce: number;
  return (...params: any) => {
    window.clearTimeout(inDebounce);
    inDebounce = window.setTimeout(() => fn.apply(null, params), ms);
  };
};
