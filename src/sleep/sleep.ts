/**
 * Resolve after `ms` milliseconds. Pass an `AbortSignal` to cancel the wait.
 */
export const sleep = async (ms: number, signal?: AbortSignal) => {
  signal?.throwIfAborted();

  await new Promise<void>((resolve, reject) => {
    const id = setTimeout(() => {
      signal?.removeEventListener("abort", onAbort);
      resolve();
    }, ms);

    const onAbort = () => {
      clearTimeout(id);
      reject(
        signal!.reason instanceof Error
          ? signal!.reason
          : new Error("This operation was aborted", {
              cause: signal!.reason,
            }),
      );
    };

    signal?.addEventListener("abort", onAbort, { once: true });
  });
};
