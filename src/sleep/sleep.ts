/**
 * Resolve after `ms` milliseconds. Pass an `AbortSignal` to cancel the wait.
 */
export const sleep = async (
  ms: number,
  signal?: AbortSignal,
): Promise<void> => {
  signal?.throwIfAborted();

  await new Promise<void>((resolve, reject) => {
    const id = setTimeout(() => {
      signal?.removeEventListener("abort", onAbort);
      resolve();
    }, ms);

    const onAbort = () => {
      clearTimeout(id);
      const { reason } = signal!;
      reject(
        reason instanceof Error
          ? reason
          : new Error("This operation was aborted", {
              cause: reason,
            }),
      );
    };

    signal?.addEventListener("abort", onAbort, { once: true });
  });
};
