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

  it("notifies watchers when set is called with the same value", () => {
    const counter = signal(0);
    const watcher = vi.fn();

    counter.watch(watcher);
    counter.set(0);

    expect(watcher).toHaveBeenCalledOnce();
    expect(watcher.mock.calls[0]?.[0]).toEqual(
      expect.objectContaining({ new: 0, old: 0 }),
    );
  });

  it("notifies watchers on set with new and old", () => {
    const counter = signal(0);
    const watcher = vi.fn();

    counter.watch(watcher);
    counter.set(1);

    expect(watcher).toHaveBeenCalledOnce();
    expect(watcher.mock.calls[0]?.[0]).toEqual(
      expect.objectContaining({ new: 1, old: 0 }),
    );
  });

  it("returns an unwatch function that stops notifications", () => {
    const counter = signal(0);
    const watcher = vi.fn();

    const unwatch = counter.watch(watcher);
    unwatch();
    counter.set(1);

    expect(watcher).not.toHaveBeenCalled();
  });

  it("returns an unwatch function with Symbol.dispose that stops notifications", () => {
    const counter = signal(0);
    const watcher = vi.fn();

    const unwatch = counter.watch(watcher);
    unwatch[Symbol.dispose]();
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

    expect(first.mock.calls[0]?.[0]).toEqual(
      expect.objectContaining({ new: 1, old: 0 }),
    );
    expect(second.mock.calls[0]?.[0]).toEqual(
      expect.objectContaining({ new: 1, old: 0 }),
    );
  });

  describe("when the same watcher is registered twice", () => {
    it("does not register the same watcher twice", () => {
      const counter = signal(0);
      const watcher = vi.fn();

      counter.watch(watcher);
      counter.watch(watcher);
      counter.set(1);

      expect(watcher).toHaveBeenCalledOnce();
    });

    it("stops notifying after the first unwatch even with a second handle", () => {
      const counter = signal(0);
      const watcher = vi.fn();

      const firstUnwatch = counter.watch(watcher);
      counter.watch(watcher);
      firstUnwatch();
      counter.set(1);

      expect(watcher).not.toHaveBeenCalled();
    });
  });

  it("does not call the watcher when watch is first registered", () => {
    const counter = signal(0);
    const watcher = vi.fn();

    counter.watch(watcher);

    expect(watcher).not.toHaveBeenCalled();
  });

  it("passes the prior set as old on consecutive sets", () => {
    const counter = signal("a");
    const watcher = vi.fn();

    counter.watch(watcher);
    counter.set("b");
    counter.set("c");

    expect(watcher.mock.calls[0]?.[0]).toEqual(
      expect.objectContaining({ new: "b", old: "a" }),
    );
    expect(watcher.mock.calls[1]?.[0]).toEqual(
      expect.objectContaining({ new: "c", old: "b" }),
    );
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

  describe("get.watch", () => {
    it("subscribes to the source when watching via get.watch", () => {
      const subscribeToSource = vi.fn(() => () => {});

      const derived = signal.from(() => 0, subscribeToSource);
      derived.get.watch(() => {});

      expect(subscribeToSource).toHaveBeenCalledOnce();
    });

    it("updates get when the source notifies after watching via get.watch", () => {
      let sourceValue = 1;
      let notify: (() => void) | undefined;
      const subscribeToSource = vi.fn((onNotify) => {
        notify = onNotify;
        return () => {};
      });

      const derived = signal.from(() => sourceValue, subscribeToSource);
      derived.get.watch(() => {});

      sourceValue = 2;
      notify?.();

      expect(derived.get()).toBe(2);
    });
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

    expect(watcher).toHaveBeenCalledOnce();
    expect(watcher.mock.calls[0]?.[0]).toEqual(
      expect.objectContaining({ new: 1, old: 0 }),
    );
  });

  it("does not call the watcher when first watched", () => {
    let notify: (() => void) | undefined;
    const watcher = vi.fn();

    const derived = signal.from(
      () => 0,
      (onNotify) => {
        notify = onNotify;
        return () => {};
      },
    );
    derived.watch(watcher);

    expect(watcher).not.toHaveBeenCalled();
    expect(notify).toBeDefined();
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

  describe("when the same watcher is registered twice", () => {
    it("keeps the source subscribed after the first unwatch", () => {
      const unsubscribeFromSource = vi.fn();
      const subscribeToSource = vi.fn(() => unsubscribeFromSource);
      const watcher = vi.fn();

      const derived = signal.from(() => 0, subscribeToSource);
      const firstUnwatch = derived.watch(watcher);
      derived.watch(watcher);
      firstUnwatch();

      expect(unsubscribeFromSource).not.toHaveBeenCalled();
    });
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

  describe("dispose", () => {
    it("unsubscribes from the source and clears watchers", () => {
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

    it("does not unsubscribe from the source twice after dispose and unwatch", () => {
      const unsubscribeFromSource = vi.fn();
      const derived = signal.from(
        () => 0,
        () => unsubscribeFromSource,
      );

      const unwatch = derived.watch(() => {});
      derived[Symbol.dispose]();
      unwatch();

      expect(unsubscribeFromSource).toHaveBeenCalledOnce();
    });
  });
});
