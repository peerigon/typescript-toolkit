import {
  isolate,
  isOperation,
  singleUse,
  type Operation,
} from "./runtime.lib.ts";

/**
 * A generator-based workflow that requests context-dependent operations via
 * `yield*`. Annotate every generator function built with a runtime's `action`,
 * `call`, or `provide` as `Workflow<Return, Context>` — plain `yield` isn't
 * usable here since the resumed value always types as `never`; only `yield*`
 * on an `Operation` resolves to its precise `Return` type.
 *
 * `Context` names the dependencies the workflow requests, which is what keeps
 * workflows from different runtimes apart: passing one to a runtime that
 * can't supply its context is a compile error, not a runtime surprise. Alias
 * it once per app to keep annotations short:
 *
 * ```ts
 * type AppWorkflow<Return> = Workflow<Return, AppContext>;
 * ```
 */
export type Workflow<Return, Context> = Generator<
  Operation<unknown, Context>,
  Return,
  never
>;

export type Runtime<Context> = {
  /**
   * Defines a context-dependent operation. The returned function can be
   * called with `yield*` inside a workflow to run `fn` against whatever
   * context `run()` was given.
   */
  action: <Args extends Array<unknown>, Return>(
    fn: (context: Context, ...args: Args) => Return | Promise<Return>,
  ) => (...args: Args) => Operation<Return, Context>;

  /**
   * Composes another workflow into the current one, `yield*`-able, reusing
   * the same context. The resulting operation is single-use, since it owns
   * the generator instance it was given — `yield*` it twice and the second
   * one throws.
   */
  call: <Return>(
    workflow: Workflow<Return, Context>,
  ) => Operation<Return, Context>;

  /**
   * Executes a workflow against a context, resolving with its return value.
   * Errors thrown by an action propagate into the workflow at the `yield*`
   * that requested it, so `try`/`catch` inside the workflow works as usual.
   */
  run: <Return>(
    workflow: () => Workflow<Return, Context>,
  ) => (context: Context) => Promise<Return>;

  /**
   * Composes another workflow into the current one, `yield*`-able, running it
   * against a context that locally overrides some of the current context's
   * values. The override only applies within `workflow` — the outer context
   * is unaffected once it returns. Like `call`, the resulting operation is
   * single-use.
   */
  provide: <Return>(
    overrides: Partial<Context>,
    workflow: Workflow<Return, Context>,
  ) => Operation<Return, Context>;
};

const driveWorkflow = async <Return, Context>(
  workflow: Workflow<Return, Context>,
  context: Context,
): Promise<Return> => {
  let step = workflow.next();

  while (!step.done) {
    const operation = step.value;

    if (!isOperation(operation)) {
      throw new TypeError(
        "Only yield* the result of action(), call() or provide() inside a workflow.",
      );
    }

    let result: unknown;

    try {
      // eslint-disable-next-line no-await-in-loop -- each step depends on the previous one's result, this is the sequential generator driving loop
      result = await operation.run(context);
    } catch (caughtError) {
      // Only the action itself is guarded here: its errors surface at the
      // workflow's `yield*` so the workflow's own try/catch can handle them.
      // Resuming happens outside, so an error thrown by the workflow body
      // propagates instead of being fed back into the workflow it came from.
      step = workflow.throw(caughtError);
      continue;
    }

    step = workflow.next(result as never);
  }

  return step.value;
};

/**
 * Creates a runtime bound to a specific context type: `action` to define
 * context-dependent operations, `call` and `provide` to compose workflows into
 * each other, and `run` to execute a workflow against a real (or mock)
 * context — the generator-context pattern for pulling dependencies on demand
 * instead of threading them through every function signature.
 *
 * @see https://github.com/doeixd/effectively/blob/main/docs/generator-context-pattern.md
 */
export const createRuntime = <Context extends object>(): Runtime<Context> => {
  const action: Runtime<Context>["action"] = (fn) => {
    return (...args) =>
      isolate(async (context: Context) => fn(context, ...args));
  };

  const call: Runtime<Context>["call"] = (workflow) =>
    isolate(
      singleUse(async (context: Context) => driveWorkflow(workflow, context)),
    );

  const provide: Runtime<Context>["provide"] = (overrides, workflow) =>
    isolate(
      singleUse(async (context: Context) =>
        driveWorkflow(workflow, { ...context, ...overrides }),
      ),
    );

  const run: Runtime<Context>["run"] = (workflow) => async (context) =>
    driveWorkflow(workflow(), context);

  return { action, call, provide, run };
};

export { isOperation } from "./runtime.lib.ts";
export type { Operation } from "./runtime.lib.ts";
