export type Mutex = <Data>(task: () => Promise<Data>) => Promise<Data>;

/**
 * Creates a mutex that runs the tasks handed to it one at a time (concurrency 1).
 *
 * Unlike `once`, every task runs — they are just serialized so they never
 * overlap. Share a single mutex instance across multiple functions that mutate
 * the same state to guarantee mutual exclusion between them.
 */
export const mutex = (): Mutex => {
  let tail = Promise.resolve();

  return async <Data>(task: () => Promise<Data>): Promise<Data> => {
    const run = tail.then(task);
    tail = run.then(
      () => undefined,
      () => undefined,
    );
    return run;
  };
};
