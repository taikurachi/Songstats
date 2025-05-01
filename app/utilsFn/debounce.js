/**
 * Creates a debounced function that delays invoking the provided function
 * until after `wait` milliseconds have elapsed since the last time it was called.
 * Preserves the return value for async functions.
 * @param {Function} fn - The function to debounce
 * @param {number} wait - The number of milliseconds to delay
 * @returns {Function} A debounced version of the function
 */
export const debounce = (fn, wait) => {
  let timeout;
  let pendingPromise = null;

  return function (...args) {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const context = this;

    // If there's already a pending promise for this debounce, return it
    if (pendingPromise) return pendingPromise;

    // Create a new promise that will resolve with the result of fn
    pendingPromise = new Promise((resolve) => {
      if (timeout) clearTimeout(timeout);

      timeout = setTimeout(() => {
        const result = fn.apply(context, args);
        pendingPromise = null;
        resolve(result);
      }, wait);
    });

    return pendingPromise;
  };
};
