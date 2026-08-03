/**
 * A description of a context-dependent unit of work. `Operation` objects are
 * created by `action()`, `call()`, and `provide()` — never constructed directly.
 *
 * `Context` is what binds an operation to the runtime that created it. It only
 * occurs in `run`'s parameter position, so it behaves contravariantly: a
 * runtime accepts operations whose context it can satisfy and rejects the
 * rest, which is what stops workflows from two different runtimes being mixed.
 */
export type Operation<Return, Context> = {
  readonly run: (context: Context) => Return | Promise<Return>;
  [Symbol.iterator]: () => Iterator<Operation<Return, Context>, Return, Return>;
};

const operationInstances = new WeakSet();

/**
 * Checks if the given value is an `Operation` created by `action()`, `call()`,
 * or `provide()`.
 *
 * @param maybeValue - The value to check
 * @returns True if the value is an Operation, false otherwise
 */
export const isOperation = (
  maybeValue: unknown,
): maybeValue is Operation<unknown, never> => {
  // WeakSet#has is spec'd to return false for anything that can't be held
  // weakly, so primitives need no separate guard.
  return operationInstances.has(maybeValue as object);
};

/**
 * Wraps `fn` so that a second call throws instead of running it again. Used for
 * operations that own a generator instance: a generator can only be driven to
 * completion once, so re-running one would silently resolve to `undefined`
 * instead of the workflow's return value.
 *
 * Not to be confused with `concurrency/exactlyOnce`, which is async-only and
 * carries a passive `promise` — more than this needs, and more bytes.
 *
 * @param fn - The function to run at most once
 * @returns A wrapped `fn` that throws once it has already been called
 */
export const singleUse = <Arg, Return>(
  fn: (arg: Arg) => Return,
): ((arg: Arg) => Return) => {
  let called = false;

  return (arg) => {
    if (called) {
      throw new Error(
        "The workflow has already run. Create a new one for each yield*.",
      );
    }

    called = true;

    return fn(arg);
  };
};

/**
 * Wraps a context-dependent function into a single-yield `Operation`. Yielding
 * it via `yield*` inside a workflow pauses the generator, hands `operation` to
 * the runtime driving loop, and resumes with whatever `run` returned — typed
 * precisely as `Return`, without a cast.
 */
export const isolate = <Return, Context>(
  run: (context: Context) => Return | Promise<Return>,
): Operation<Return, Context> => {
  const operation: Operation<Return, Context> = {
    run,
    // Delegating to a generator gives us the full iterator protocol for one
    // line — including the `throw` that yield* needs to forward an injected
    // error into the workflow's try/catch. Without it the spec's yield*
    // AbruptCompletion handling raises its own "iterator does not provide a
    // 'throw' method" TypeError instead.
    *[Symbol.iterator]() {
      return yield operation;
    },
  };

  operationInstances.add(operation);

  return operation;
};
