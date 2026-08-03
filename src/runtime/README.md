## `runtime`

- 📦 Below 375 Bytes minified + compressed (brotli)
- ✅ Zero dependencies

A generator-based runtime for the [generator context pattern](https://github.com/doeixd/effectively/blob/main/docs/generator-context-pattern.md): workflows request dependencies on demand via `yield*` instead of having them threaded through every function signature.

Write a workflow as a generator function, `yield*` the operations it needs, and pass the actual (or mocked) dependencies only once, at the point where you run it:

```ts
import {
  createRuntime,
  type Workflow,
} from "@peerigon/typescript-toolkit/runtime";

type User = { id: string; name: string };

type AppContext = {
  db: { findUser: (id: string) => User };
  logger: { info: (message: string) => void };
};

type AppWorkflow<Return> = Workflow<Return, AppContext>;

const { action, call, provide, run } = createRuntime<AppContext>();

const getUser = action((context, id: string) => context.db.findUser(id));
const log = action((context, message: string) => context.logger.info(message));

function* getUsername(id: string): AppWorkflow<string> {
  yield* log(`looking up ${id}`);
  const user = yield* getUser(id);
  return user.name;
}

const name = await run(() => getUsername("42"))({
  db: { findUser: (id) => ({ id, name: "Ada" }) },
  logger: { info: console.log },
});
```

`user` above is inferred as `User` — no `as User` cast needed. That's the whole point of `yield*` here: it isn't optional decoration, plain `yield` cannot carry a distinct type per call site (see [Why `yield*`](#why-yield-and-not-yield) below).

### Why `yield*` and not `yield`?

`yield*` resolves to the `TReturn` of whatever you delegate to — each call site gets its own type, because it comes from that specific operation. Plain `yield expr` resolves to the _generator's own_ `TNext` type parameter, which is fixed once for the whole function. A workflow calls many operations with many different return types, so plain `yield` can't give you more than one shared type across all of them without a cast.

`Workflow` pins `TNext` to `never`, which makes this the compiler's rule rather than a convention: writing plain `yield` inside a workflow resolves to `never` and is effectively unusable. Always `yield*`.

### The `Context` type parameter

`Workflow<Return, Context>` names the dependencies a workflow requests, so the compiler can tell workflows from different runtimes apart. Mixing them is a type error rather than a runtime surprise:

```ts
const mailRuntime = createRuntime<MailContext>();

// Error: AppWorkflow needs AppContext, this runtime only supplies MailContext
mailRuntime.run(() => getUsername("42"));
```

`Context` only appears in a parameter position, so it behaves contravariantly: a workflow written against a _narrower_ context still runs in a runtime that supplies more, but never the other way around. Aliasing it once per app — the `AppWorkflow<Return>` line in the example above — keeps annotations to a single type argument at each call site.

### Composing workflows with `call()`

A workflow can delegate into another workflow, reusing the same context:

```ts
function* auditTrail(user: User): AppWorkflow<void> {
  yield* log(`audit: touched user ${user.id}`);
}

function* updateProfile(id: string): AppWorkflow<User> {
  const user = yield* getUser(id);
  yield* call(auditTrail(user));
  return user;
}
```

`call()` takes an already-invoked generator, so the operation it returns owns that generator instance and is single-use — `yield*` the same one twice and the second throws. Call `call(auditTrail(user))` afresh each time instead. (Operations from `action()` hold no state and can be re-yielded freely.)

### Scoping a context override with `provide()`

`provide()` runs a nested workflow against a context that locally overrides some values — useful for pointing a sub-step at a different dependency (a replica, a transaction, a test double) without threading it through the whole call chain. The override only applies inside that nested workflow; the outer context is unaffected once it returns.

```ts
function* updateProfile(id: string): AppWorkflow<User> {
  const user = yield* getUser(id);
  // auditTrail's ctx.db is auditReplicaDb here, and nowhere else
  yield* provide({ db: auditReplicaDb }, auditTrail(user));
  return user;
}
```

Like `call()`, the returned operation is single-use.

### Testing

Because a workflow only ever touches the context it's given, tests can mock exactly what's used and nothing else:

```ts
import { describe, expect, it, vi } from "vitest";

it("looks up the user and returns their name", async () => {
  const context: AppContext = {
    db: { findUser: vi.fn().mockReturnValue({ id: "42", name: "Ada" }) },
    logger: { info: vi.fn() },
  };

  const name = await run(() => getUsername("42"))(context);

  expect(name).toBe("Ada");
  expect(context.db.findUser).toHaveBeenCalledWith("42");
});
```

### Error handling

Errors thrown by an action propagate into the workflow at the `yield*` that requested it, so ordinary `try`/`catch` works:

```ts
function* getUsername(id: string): AppWorkflow<string> {
  try {
    const user = yield* getUser(id);
    return user.name;
  } catch {
    return "unknown";
  }
}
```

An uncaught error rejects the promise returned by `run()`.

### API Reference

#### `createRuntime<Context>()`

Creates a runtime bound to a specific context type.

```ts
createRuntime<Context extends object>(): {
  action: <Args extends unknown[], Return>(
    fn: (context: Context, ...args: Args) => Return | Promise<Return>,
  ) => (...args: Args) => Operation<Return, Context>;
  call: <Return>(
    workflow: Workflow<Return, Context>,
  ) => Operation<Return, Context>;
  provide: <Return>(
    overrides: Partial<Context>,
    workflow: Workflow<Return, Context>,
  ) => Operation<Return, Context>;
  run: <Return>(
    workflow: () => Workflow<Return, Context>,
  ) => (context: Context) => Promise<Return>;
}
```

| Type parameter | Description                                                             |
| -------------- | ----------------------------------------------------------------------- |
| `Context`      | Shape of the dependencies workflows built with this runtime can request |

#### `action(fn)`

Defines a context-dependent operation. The returned function is called with `yield*` inside a workflow.

```ts
action<Args extends unknown[], Return>(
  fn: (context: Context, ...args: Args) => Return | Promise<Return>,
): (...args: Args) => Operation<Return, Context>
```

| Parameter | Type                                                             | Description                                  |
| --------- | ---------------------------------------------------------------- | -------------------------------------------- |
| `fn`      | `(context: Context, ...args: Args) => Return \| Promise<Return>` | Runs against the context supplied to `run()` |

**Returns:** a function that, called with `Args`, produces an `Operation<Return, Context>` to `yield*`. The operation is stateless and may be `yield*`-ed more than once.

#### `call(workflow)`

Composes another workflow into the current one, `yield*`-able, reusing the same context.

```ts
call<Return>(workflow: Workflow<Return, Context>): Operation<Return, Context>
```

| Parameter  | Type                        | Description                                             |
| ---------- | --------------------------- | ------------------------------------------------------- |
| `workflow` | `Workflow<Return, Context>` | An already-invoked generator, e.g. `otherWorkflow(arg)` |

**Returns:** `Operation<Return, Context>` resolving to the nested workflow's return value

**Throws:** `Error` when the returned operation is `yield*`-ed a second time — it owns the generator it was given, and a generator can only be driven to completion once. Like an action's error, this surfaces at the `yield*` site, so a `try`/`catch` around it in the workflow will catch it.

#### `provide(overrides, workflow)`

Composes another workflow into the current one, `yield*`-able, running it against a context that locally overrides some of the current context's values.

```ts
provide<Return>(
  overrides: Partial<Context>,
  workflow: Workflow<Return, Context>,
): Operation<Return, Context>
```

| Parameter   | Type                        | Description                                     |
| ----------- | --------------------------- | ----------------------------------------------- |
| `overrides` | `Partial<Context>`          | Values to override for the nested workflow only |
| `workflow`  | `Workflow<Return, Context>` | An already-invoked generator                    |

**Returns:** `Operation<Return, Context>` resolving to the nested workflow's return value

**Throws:** `Error` when the returned operation is `yield*`-ed a second time, for the same reason as `call()`.

#### `run(workflow)`

Executes a workflow against a context, resolving with its return value.

```ts
run<Return>(
  workflow: () => Workflow<Return, Context>,
): (context: Context) => Promise<Return>
```

| Parameter  | Type                              | Description                                                  |
| ---------- | --------------------------------- | ------------------------------------------------------------ |
| `workflow` | `() => Workflow<Return, Context>` | A thunk invoking the generator, e.g. `() => myWorkflow(arg)` |

**Returns:** a function that takes a `Context` and returns `Promise<Return>`. Since `workflow` is a thunk, the returned function can be called more than once — each call drives a fresh generator instance.

**Note:** `workflow` is a thunk here (unlike `call`/`provide`) so the same `run(...)` result can be reused across multiple contexts, e.g. once per test.

#### `isOperation(value)`

Type guard for `Operation` instances created by `action()`, `call()`, or `provide()`.

```ts
isOperation(value: unknown): value is Operation<unknown, never>
```

| Parameter | Type      | Description    |
| --------- | --------- | -------------- |
| `value`   | `unknown` | Value to check |

**Returns:** `boolean` — `true` when `value` is an `Operation`

### Type Reference

#### `Workflow<Return, Context>`

The type every generator function built with a runtime's `action`, `call`, or `provide` should be annotated with.

```ts
type Workflow<Return, Context> = Generator<
  Operation<unknown, Context>,
  Return,
  never
>;
```

#### `Operation<Return, Context>`

A single-yield description of a context-dependent unit of work, produced by `action()`, `call()`, and `provide()`. Not constructed directly.

### What's out of scope

This is a small runtime, not a full effect system. No retry/backoff, middleware, or scheduling — compose those yourself with plain functions and `try`/`catch` around `yield*`. Cancellation isn't first-class either: put an `AbortSignal` in your own `Context` and check it inside actions, the same convention [`sleep`](../sleep/README.md) uses.
