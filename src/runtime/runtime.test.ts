// This test uses @ts-expect-error to test for specific type errors
import { describe, expect, expectTypeOf, it, vi } from "vitest";
import { createRuntime, isOperation, type Workflow } from "./runtime.ts";

type User = { id: string; name: string };

type AppContext = {
  db: { findUser: (id: string) => User; recordAudit: (user: User) => void };
  logger: { info: (message: string) => void };
};

type AppWorkflow<Return> = Workflow<Return, AppContext>;

const createContext = (overrides: Partial<AppContext> = {}): AppContext => ({
  db: {
    findUser: vi.fn((id: string) => ({ id, name: "Ada" })),
    recordAudit: vi.fn(),
  },
  logger: { info: vi.fn() },
  ...overrides,
});

describe("createRuntime()", () => {
  const { action, call, provide, run } = createRuntime<AppContext>();
  const getUser = action((context, id: string) => context.db.findUser(id));
  const log = action((context, message: string) => {
    context.logger.info(message);
  });

  it("runs a workflow against a context and resolves with its return value", async () => {
    const getUsername = function* (id: string): AppWorkflow<string> {
      const user = yield* getUser(id);
      return user.name;
    };

    const context = createContext();
    const name = await run(() => getUsername("42"))(context);

    expect(name).toBe("Ada");
    expect(context.db.findUser).toHaveBeenCalledWith("42");
  });

  it("only calls the actions a workflow actually yields", async () => {
    const onlyLogs = function* (): AppWorkflow<void> {
      yield* log("hello");
    };

    const context = createContext();
    await run(onlyLogs)(context);

    expect(context.logger.info).toHaveBeenCalledWith("hello");
    expect(context.db.findUser).not.toHaveBeenCalled();
  });

  it("propagates a thrown error into the workflow's try/catch", async () => {
    const boom = new Error("boom");
    const failingAction = action(() => {
      throw boom;
    });

    const recovers = function* (): AppWorkflow<string> {
      try {
        yield* failingAction();
        return "unreachable";
      } catch (error) {
        return `recovered: ${(error as Error).message}`;
      }
    };

    const result = await run(recovers)(createContext());

    expect(result).toBe("recovered: boom");
  });

  it("rejects when a workflow doesn't catch a thrown error", async () => {
    const boom = new Error("boom");
    const failingAction = action(() => {
      throw boom;
    });

    const uncaught = function* (): AppWorkflow<void> {
      yield* failingAction();
    };

    await expect(run(uncaught)(createContext())).rejects.toThrow(boom);
  });

  it("rejects when the workflow body itself throws after an action resumed it", async () => {
    const boom = new Error("boom");
    const throwsAfterResuming = function* (): AppWorkflow<void> {
      yield* log("before");
      throw boom;
    };

    const context = createContext();

    await expect(run(throwsAfterResuming)(context)).rejects.toThrow(boom);
    expect(context.logger.info).toHaveBeenCalledWith("before");
  });

  it("composes a nested workflow via call(), reusing the same context", async () => {
    const auditTrail = function* (user: User): AppWorkflow<void> {
      yield* log(`audit: touched user ${user.id}`);
      yield* action((context, u: User) => context.db.recordAudit(u))(user);
    };

    const updateProfile = function* (id: string): AppWorkflow<User> {
      yield* log(`updating ${id}`);
      const user = yield* getUser(id);
      yield* call(auditTrail(user));
      return user;
    };

    const context = createContext();
    const user = await run(() => updateProfile("42"))(context);

    expect(user).toEqual({ id: "42", name: "Ada" });
    expect(context.db.recordAudit).toHaveBeenCalledWith(user);
    expect(context.logger.info).toHaveBeenCalledWith("updating 42");
    expect(context.logger.info).toHaveBeenCalledWith("audit: touched user 42");
  });

  it("provide() scopes an override to the nested workflow only", async () => {
    const auditTrail = function* (user: User): AppWorkflow<void> {
      yield* action((context, u: User) => context.db.recordAudit(u))(user);
    };

    const updateProfile = function* (id: string): AppWorkflow<User> {
      const user = yield* getUser(id);
      const auditDb = {
        findUser: vi.fn(),
        recordAudit: vi.fn(),
      };
      yield* provide({ db: auditDb }, auditTrail(user));
      // Back in the outer context: recording here must hit the primary db.
      yield* action((context, u: User) => context.db.recordAudit(u))(user);
      return user;
    };

    const context = createContext();
    const user = await run(() => updateProfile("42"))(context);

    expect(user).toEqual({ id: "42", name: "Ada" });
    // The primary db only saw the call made after provide() returned.
    expect(context.db.recordAudit).toHaveBeenCalledTimes(1);
    expect(context.db.recordAudit).toHaveBeenCalledWith(user);
  });

  it("run() re-invokes the workflow thunk, so it can be called more than once", async () => {
    const getUsername = function* (id: string): AppWorkflow<string> {
      const user = yield* getUser(id);
      return user.name;
    };

    const runGetUsername = run(() => getUsername("1"));
    const firstContext = createContext();
    const secondContext = createContext();

    await expect(runGetUsername(firstContext)).resolves.toBe("Ada");
    await expect(runGetUsername(secondContext)).resolves.toBe("Ada");
    expect(firstContext.db.findUser).toHaveBeenCalledTimes(1);
    expect(secondContext.db.findUser).toHaveBeenCalledTimes(1);
  });

  it("re-runs a workflow that composes via call(), since each run builds a fresh operation", async () => {
    const inner = function* (id: string): AppWorkflow<User> {
      return yield* getUser(id);
    };

    const outer = function* (id: string): AppWorkflow<string> {
      const user = yield* call(inner(id));

      return user.name;
    };

    const runOuter = run(() => outer("1"));

    await expect(runOuter(createContext())).resolves.toBe("Ada");
    await expect(runOuter(createContext())).resolves.toBe("Ada");
  });

  it("rejects with a clear error when a workflow yields something that isn't an Operation", async () => {
    const invalid = function* (): AppWorkflow<void> {
      yield* [1, 2, 3] as unknown as AppWorkflow<void>;
    };

    await expect(run(invalid)(createContext())).rejects.toThrow(
      /Only yield\* the result of action\(\)/,
    );
  });

  it("rejects when a call() operation is yielded a second time", async () => {
    const inner = function* (): AppWorkflow<string> {
      const user = yield* getUser("42");

      return user.name;
    };

    const reusesTheOperation = function* (): AppWorkflow<void> {
      const operation = call(inner());

      yield* operation;
      yield* operation;
    };

    await expect(run(reusesTheOperation)(createContext())).rejects.toThrow(
      /The workflow has already run/,
    );
  });

  it("rejects when a provide() operation is yielded a second time", async () => {
    const inner = function* (): AppWorkflow<void> {
      yield* log("inner");
    };

    const reusesTheOperation = function* (): AppWorkflow<void> {
      const operation = provide({ logger: { info: vi.fn() } }, inner());

      yield* operation;
      yield* operation;
    };

    await expect(run(reusesTheOperation)(createContext())).rejects.toThrow(
      /The workflow has already run/,
    );
  });

  it("allows an action() operation to be yielded more than once", async () => {
    const reusesTheOperation = function* (): AppWorkflow<string> {
      const operation = getUser("42");
      const first = yield* operation;
      const second = yield* operation;

      return first.name + second.name;
    };

    const context = createContext();

    await expect(run(reusesTheOperation)(context)).resolves.toBe("AdaAda");
    expect(context.db.findUser).toHaveBeenCalledTimes(2);
  });
});

describe("Workflow<Return, Context>", () => {
  type OtherContext = { mailer: { send: (to: string) => void } };

  const appRuntime = createRuntime<AppContext>();
  const otherRuntime = createRuntime<OtherContext>();
  const getUser = appRuntime.action((context, id: string) =>
    context.db.findUser(id),
  );

  const appWorkflow = function* (): AppWorkflow<User> {
    return yield* getUser("42");
  };

  it("resolves yield* to the operation's return type without a cast", async () => {
    const inferred = function* (): AppWorkflow<string> {
      const user = yield* getUser("42");

      expectTypeOf(user).toEqualTypeOf<User>();

      return user.name;
    };

    await expect(appRuntime.run(inferred)(createContext())).resolves.toBe(
      "Ada",
    );
  });

  it("rejects a workflow from another runtime at compile time", () => {
    // @ts-expect-error a workflow built against AppContext can't run in a
    // runtime that only supplies OtherContext
    const runInWrongRuntime = otherRuntime.run(appWorkflow);

    // @ts-expect-error ...and the same holds for composing it via call()
    otherRuntime.call(appWorkflow());

    expect(runInWrongRuntime).toBeTypeOf("function");
  });

  it("rejects an operation from another runtime at compile time", () => {
    const send = otherRuntime.action((context, to: string) =>
      context.mailer.send(to),
    );

    const mixed = function* (): AppWorkflow<void> {
      // @ts-expect-error the operation needs OtherContext, the workflow supplies AppContext
      yield* send("someone@example.com");
    };

    expect(mixed).toBeTypeOf("function");
  });
});

describe("isOperation()", () => {
  it("returns true for an Operation created by action()", () => {
    const { action } = createRuntime<AppContext>();
    const doNothing = action(() => {});

    expect(isOperation(doNothing())).toBe(true);
  });

  it("returns false for arbitrary values", () => {
    expect(isOperation(null)).toBe(false);
    expect(isOperation(undefined)).toBe(false);
    expect(isOperation({})).toBe(false);
    expect(isOperation([1, 2, 3])).toBe(false);
  });
});
