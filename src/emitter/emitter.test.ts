// This test uses @ts-expect-error to test for specific type errors
import { describe, expect, it, vi } from "vitest";
import { Emitter } from "./emitter.ts";

type TestEvents = {
  click: { x: number; y: number };
  message: { text: string };
};

type TestEventsWithError = TestEvents & { error: { error: Error } };

describe("Emitter", () => {
  it("invokes listeners with the emitted payload including target", () => {
    const emitter = new Emitter<TestEvents>();
    const listener = vi.fn();

    emitter.on("click", listener);
    emitter.emit("click", { x: 1, y: 2 });

    expect(listener).toHaveBeenCalledExactlyOnceWith({
      x: 1,
      y: 2,
      target: emitter,
    });
  });

  it("returns a remove function that unsubscribes the listener", () => {
    const emitter = new Emitter<TestEvents>();
    const listener = vi.fn();

    const remove = emitter.on("click", listener);
    remove();
    emitter.emit("click", { x: 1, y: 2 });

    expect(listener).not.toHaveBeenCalled();
  });

  it("unsubscribes when a using declaration leaves scope", () => {
    const emitter = new Emitter<TestEvents>();
    const listener = vi.fn();

    const run = () => {
      using _unsubscribe = emitter.on("click", listener);
      emitter.emit("click", { x: 1, y: 2 });
    };

    run();
    emitter.emit("click", { x: 3, y: 4 });

    expect(listener).toHaveBeenCalledExactlyOnceWith({
      x: 1,
      y: 2,
      target: emitter,
    });
  });

  it("supports multiple listeners for the same event", () => {
    const emitter = new Emitter<TestEvents>();
    const first = vi.fn();
    const second = vi.fn();

    emitter.on("message", first);
    emitter.on("message", second);
    emitter.emit("message", { text: "hello" });

    expect(first).toHaveBeenCalledWith({ text: "hello", target: emitter });
    expect(second).toHaveBeenCalledWith({ text: "hello", target: emitter });
  });

  it("only notifies listeners registered for the emitted event", () => {
    const emitter = new Emitter<TestEvents>();
    const clickListener = vi.fn();
    const messageListener = vi.fn();

    emitter.on("click", clickListener);
    emitter.on("message", messageListener);
    emitter.emit("click", { x: 0, y: 0 });

    expect(clickListener).toHaveBeenCalledOnce();
    expect(messageListener).not.toHaveBeenCalled();
  });

  it("does nothing when emitting an event with no listeners", () => {
    const emitter = new Emitter<TestEvents>();

    expect(() => {
      emitter.emit("click", { x: 0, y: 0 });
    }).not.toThrow();
  });

  describe("once", () => {
    it("invokes the listener once and removes it on emit", () => {
      const emitter = new Emitter<TestEvents>();
      const listener = vi.fn();

      emitter.once("click", listener);
      emitter.emit("click", { x: 1, y: 2 });
      emitter.emit("click", { x: 3, y: 4 });

      expect(listener).toHaveBeenCalledExactlyOnceWith({
        x: 1,
        y: 2,
        target: emitter,
      });
    });

    it("returns a remove function that unsubscribes before emit", () => {
      const emitter = new Emitter<TestEvents>();
      const listener = vi.fn();

      const remove = emitter.once("click", listener);
      remove();
      emitter.emit("click", { x: 1, y: 2 });

      expect(listener).not.toHaveBeenCalled();
    });

    it("does not remove other listeners for the same event", () => {
      const emitter = new Emitter<TestEvents>();
      const onceListener = vi.fn();
      const onListener = vi.fn();

      emitter.once("message", onceListener);
      emitter.on("message", onListener);
      emitter.emit("message", { text: "a" });
      emitter.emit("message", { text: "b" });

      expect(onceListener).toHaveBeenCalledOnce();
      expect(onListener).toHaveBeenCalledTimes(2);
    });
  });

  describe("events", () => {
    it("registers listeners via events.on bound to the emitter", () => {
      const emitter = new Emitter<TestEvents>();
      const listener = vi.fn();

      emitter.events.on("click", listener);
      emitter.emit("click", { x: 3, y: 4 });

      expect(listener).toHaveBeenCalledExactlyOnceWith({
        x: 3,
        y: 4,
        target: emitter,
      });
    });

    it("registers once listeners via events.once bound to the emitter", () => {
      const emitter = new Emitter<TestEvents>();
      const listener = vi.fn();

      emitter.events.once("click", listener);
      emitter.emit("click", { x: 3, y: 4 });
      emitter.emit("click", { x: 5, y: 6 });

      expect(listener).toHaveBeenCalledExactlyOnceWith({
        x: 3,
        y: 4,
        target: emitter,
      });
    });
  });

  describe("error events", () => {
    it("invokes error listeners with the emitted payload including target", () => {
      const emitter = new Emitter<TestEventsWithError>();
      const listener = vi.fn();
      const error = new Error("failed");

      emitter.on("error", listener);
      emitter.emit("error", { error });

      expect(listener).toHaveBeenCalledExactlyOnceWith({
        error,
        target: emitter,
      });
    });

    it("throws the error when no listeners are registered", () => {
      const emitter = new Emitter<TestEventsWithError>();
      const error = new TypeError("unhandled");

      expect(() => {
        emitter.emit("error", { error });
      }).toThrow(error);
    });

    it("throws the error after all listeners are removed", () => {
      const emitter = new Emitter<TestEventsWithError>();
      const error = new Error("unhandled");
      const remove = emitter.on("error", vi.fn());

      remove();

      expect(() => {
        emitter.emit("error", { error });
      }).toThrow(error);
    });

    it("rejects error payloads that are not { error: Error } at the type level", () => {
      expect.assertions(0);
      // @ts-expect-error error payload must be { error: Error }
      new Emitter<{ error: { message: string } }>();

      // @ts-expect-error error payload must be { error: Error }
      new Emitter<{ error: Error }>();
    });
  });
});
