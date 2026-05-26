import { describe, expect, it, vi } from "vitest";
import { signal } from "./signals.ts";

describe("signal()", () => {
  it("read returns the initial value", () => {
    const counter = signal(0);

    expect(counter.read()).toBe(0);
  });

  it("write updates the value returned by read", () => {
    const counter = signal(0);

    counter.write(1);
    counter.write(2);

    expect(counter.read()).toBe(2);
  });

  it("notifies subscribers on write with value and previousValue", () => {
    const counter = signal(0);
    const reader = vi.fn();

    counter.subscribe(reader);
    counter.write(1);

    expect(reader).toHaveBeenCalledExactlyOnceWith({
      value: 1,
      previousValue: 0,
    });
  });

  it("returns an unsubscribe function that stops notifications", () => {
    const counter = signal(0);
    const reader = vi.fn();

    const unsubscribe = counter.subscribe(reader);
    unsubscribe();
    counter.write(1);

    expect(reader).not.toHaveBeenCalled();
  });

  it("notifies multiple subscribers on each write", () => {
    const counter = signal(0);
    const first = vi.fn();
    const second = vi.fn();

    counter.subscribe(first);
    counter.subscribe(second);
    counter.write(1);

    expect(first).toHaveBeenCalledWith({ value: 1, previousValue: 0 });
    expect(second).toHaveBeenCalledWith({ value: 1, previousValue: 0 });
  });

  it("does not register the same reader twice", () => {
    const counter = signal(0);
    const reader = vi.fn();

    counter.subscribe(reader);
    counter.subscribe(reader);
    counter.write(1);

    expect(reader).toHaveBeenCalledOnce();
  });

  it("passes the prior write as previousValue on consecutive writes", () => {
    const counter = signal("a");
    const reader = vi.fn();

    counter.subscribe(reader);
    counter.write("b");
    counter.write("c");

    expect(reader).toHaveBeenNthCalledWith(1, {
      value: "b",
      previousValue: "a",
    });
    expect(reader).toHaveBeenNthCalledWith(2, {
      value: "c",
      previousValue: "b",
    });
  });

  it("does not notify when there are no subscribers", () => {
    const counter = signal(0);

    expect(() => {
      counter.write(1);
    }).not.toThrow();
    expect(counter.read()).toBe(1);
  });

  it("exposes subscribe on read and on the signal", () => {
    const counter = signal(0);
    const fromSignal = vi.fn();
    const fromRead = vi.fn();

    counter.subscribe(fromSignal);
    counter.read.subscribe(fromRead);
    counter.write(1);

    expect(fromSignal).toHaveBeenCalledOnce();
    expect(fromRead).toHaveBeenCalledOnce();
  });

  it("dispose clears subscribers so later writes do not notify", () => {
    const counter = signal(0);
    const reader = vi.fn();

    counter.subscribe(reader);
    counter[Symbol.dispose]();
    counter.write(1);

    expect(reader).not.toHaveBeenCalled();
    expect(counter.read()).toBe(1);
  });
});

describe("signal.from()", () => {
  it("read returns the initial value from the source", () => {
    const derived = signal.from(
      () => 42,
      () => () => {},
    );

    expect(derived.read()).toBe(42);
  });

  it("does not subscribe to the source until the first reader subscribes", () => {
    const subscribeToSource = vi.fn(() => () => {});

    signal.from(() => 0, subscribeToSource);

    expect(subscribeToSource).not.toHaveBeenCalled();
  });

  it("updates read when the source notifies", () => {
    let sourceValue = 1;
    let notify: (() => void) | undefined;

    const derived = signal.from(
      () => sourceValue,
      (onNotify) => {
        notify = onNotify;
        return () => {};
      },
    );
    derived.subscribe(() => {});

    sourceValue = 2;
    notify?.();

    expect(derived.read()).toBe(2);
  });

  it("notifies readers when the source notifies", () => {
    let sourceValue = 0;
    let notify: (() => void) | undefined;
    const reader = vi.fn();

    const derived = signal.from(
      () => sourceValue,
      (onNotify) => {
        notify = onNotify;
        return () => {};
      },
    );
    derived.subscribe(reader);
    sourceValue = 1;
    notify?.();

    expect(reader).toHaveBeenCalledExactlyOnceWith({
      value: 1,
      previousValue: 0,
    });
  });

  it("subscribes to the source only once with multiple readers", () => {
    const subscribeToSource = vi.fn(() => () => {});

    const derived = signal.from(() => 0, subscribeToSource);
    const unsubscribeFirst = derived.subscribe(() => {});
    derived.subscribe(() => {});

    expect(subscribeToSource).toHaveBeenCalledOnce();

    unsubscribeFirst();
    derived.subscribe(() => {});

    expect(subscribeToSource).toHaveBeenCalledOnce();
  });

  it("unsubscribes from the source when the last reader unsubscribes", () => {
    const unsubscribeFromSource = vi.fn();
    const subscribeToSource = vi.fn(() => unsubscribeFromSource);

    const derived = signal.from(() => 0, subscribeToSource);
    const unsubscribeFirst = derived.subscribe(() => {});
    const unsubscribeSecond = derived.subscribe(() => {});

    unsubscribeFirst();
    expect(unsubscribeFromSource).not.toHaveBeenCalled();

    unsubscribeSecond();
    expect(unsubscribeFromSource).toHaveBeenCalledOnce();
  });

  it("dispose unsubscribes from the source and clears readers", () => {
    const unsubscribeFromSource = vi.fn();
    const derived = signal.from(
      () => 0,
      () => unsubscribeFromSource,
    );
    const reader = vi.fn();

    derived.subscribe(reader);
    derived[Symbol.dispose]();

    expect(unsubscribeFromSource).toHaveBeenCalledOnce();
  });
});
