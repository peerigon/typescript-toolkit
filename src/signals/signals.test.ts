import { describe, expect, it, vi } from "vitest";
import { signal } from "./signals.ts";

describe("signal()", () => {
  it("get returns the initial value", () => {
    const counter = signal(0);

    expect(counter.get()).toBe(0);
  });

  it("set updates the value returned by get", () => {
    const counter = signal(0);

    counter.set(1);
    counter.set(2);

    expect(counter.get()).toBe(2);
  });

  it("notifies watchers on set with value and previousValue", () => {
    const counter = signal(0);
    const watcher = vi.fn();

    counter.watch(watcher);
    counter.set(1);

    expect(watcher).toHaveBeenCalledExactlyOnceWith({
      value: 1,
      previousValue: 0,
    });
  });

  it("returns an unwatch function that stops notifications", () => {
    const counter = signal(0);
    const watcher = vi.fn();

    const unwatch = counter.watch(watcher);
    unwatch();
    counter.set(1);

    expect(watcher).not.toHaveBeenCalled();
  });

  it("notifies multiple watchers on each set", () => {
    const counter = signal(0);
    const first = vi.fn();
    const second = vi.fn();

    counter.watch(first);
    counter.watch(second);
    counter.set(1);

    expect(first).toHaveBeenCalledWith({ value: 1, previousValue: 0 });
    expect(second).toHaveBeenCalledWith({ value: 1, previousValue: 0 });
  });

  it("does not register the same watcher twice", () => {
    const counter = signal(0);
    const watcher = vi.fn();

    counter.watch(watcher);
    counter.watch(watcher);
    counter.set(1);

    expect(watcher).toHaveBeenCalledOnce();
  });

  it("passes the prior set as previousValue on consecutive sets", () => {
    const counter = signal("a");
    const watcher = vi.fn();

    counter.watch(watcher);
    counter.set("b");
    counter.set("c");

    expect(watcher).toHaveBeenNthCalledWith(1, {
      value: "b",
      previousValue: "a",
    });
    expect(watcher).toHaveBeenNthCalledWith(2, {
      value: "c",
      previousValue: "b",
    });
  });

  it("does not notify when there are no watchers", () => {
    const counter = signal(0);

    expect(() => {
      counter.set(1);
    }).not.toThrow();
    expect(counter.get()).toBe(1);
  });

  it("exposes watch on get and on the signal", () => {
    const counter = signal(0);
    const fromSignal = vi.fn();
    const fromGet = vi.fn();

    counter.watch(fromSignal);
    counter.get.watch(fromGet);
    counter.set(1);

    expect(fromSignal).toHaveBeenCalledOnce();
    expect(fromGet).toHaveBeenCalledOnce();
  });

  it("dispose clears watchers so later sets do not notify", () => {
    const counter = signal(0);
    const watcher = vi.fn();

    counter.watch(watcher);
    counter[Symbol.dispose]();
    counter.set(1);

    expect(watcher).not.toHaveBeenCalled();
    expect(counter.get()).toBe(1);
  });
});

describe("signal.from()", () => {
  it("get returns the initial value from the source", () => {
    const derived = signal.from(
      () => 42,
      () => () => {},
    );

    expect(derived.get()).toBe(42);
  });

  it("does not subscribe to the source until the first watcher watches", () => {
    const subscribeToSource = vi.fn(() => () => {});

    signal.from(() => 0, subscribeToSource);

    expect(subscribeToSource).not.toHaveBeenCalled();
  });

  it("updates get when the source notifies", () => {
    let sourceValue = 1;
    let notify: (() => void) | undefined;

    const derived = signal.from(
      () => sourceValue,
      (onNotify) => {
        notify = onNotify;
        return () => {};
      },
    );
    derived.watch(() => {});

    sourceValue = 2;
    notify?.();

    expect(derived.get()).toBe(2);
  });

  it("notifies watchers when the source notifies", () => {
    let sourceValue = 0;
    let notify: (() => void) | undefined;
    const watcher = vi.fn();

    const derived = signal.from(
      () => sourceValue,
      (onNotify) => {
        notify = onNotify;
        return () => {};
      },
    );
    derived.watch(watcher);
    sourceValue = 1;
    notify?.();

    expect(watcher).toHaveBeenCalledExactlyOnceWith({
      value: 1,
      previousValue: 0,
    });
  });

  it("subscribes to the source only once with multiple watchers", () => {
    const subscribeToSource = vi.fn(() => () => {});

    const derived = signal.from(() => 0, subscribeToSource);
    const unwatchFirst = derived.watch(() => {});
    derived.watch(() => {});

    expect(subscribeToSource).toHaveBeenCalledOnce();

    unwatchFirst();
    derived.watch(() => {});

    expect(subscribeToSource).toHaveBeenCalledOnce();
  });

  it("unsubscribes from the source when the last watcher unwatches", () => {
    const unsubscribeFromSource = vi.fn();
    const subscribeToSource = vi.fn(() => unsubscribeFromSource);

    const derived = signal.from(() => 0, subscribeToSource);
    const unwatchFirst = derived.watch(() => {});
    const unwatchSecond = derived.watch(() => {});

    unwatchFirst();
    expect(unsubscribeFromSource).not.toHaveBeenCalled();

    unwatchSecond();
    expect(unsubscribeFromSource).toHaveBeenCalledOnce();
  });

  it("dispose unsubscribes from the source and clears watchers", () => {
    const unsubscribeFromSource = vi.fn();
    const derived = signal.from(
      () => 0,
      () => unsubscribeFromSource,
    );
    const watcher = vi.fn();

    derived.watch(watcher);
    derived[Symbol.dispose]();

    expect(unsubscribeFromSource).toHaveBeenCalledOnce();
  });
});
