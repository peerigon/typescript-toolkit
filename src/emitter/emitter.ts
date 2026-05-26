// Namespaces are only used to group related types together.
/* eslint-disable @typescript-eslint/no-namespace -- group related types under Emitter */

/**
 * Minimal typed event emitter with payload objects.
 *
 * @example
 * ```ts
 * const emitter = new Emitter<{
 *   click: { x: number; y: number };
 *   error: { error: Error };
 * }>();
 *
 * emitter.on("error", ({ error, target }) => {
 *   console.error(error, target);
 * });
 *
 * emitter.emit("error", { error: new Error("Something went wrong") });
 * ```
 */
export class Emitter<
  Payloads extends Emitter.Payloads,
> implements Emitter.Events<Payloads> {
  readonly #listeners = new Map<
    keyof Payloads,
    Set<(payload: Emitter.EventPayload<Payloads, keyof Payloads>) => void>
  >();

  /**
   * Register a listener for an event.
   *
   * @returns A function that removes the listener
   */
  on<EventName extends keyof Payloads>(
    event: EventName,
    listener: (payload: Emitter.EventPayload<Payloads, EventName>) => void,
  ): Emitter.Unsubscribe {
    const listeners = this.#getOrCreateListeners(event);

    listeners.add(listener);

    return this.#createUnsubscribe(() => {
      listeners.delete(listener);
    });
  }

  /**
   * Register a listener that runs at most once for an event.
   *
   * @returns A function that removes the listener before it runs
   */
  once<EventName extends keyof Payloads>(
    event: EventName,
    listener: (payload: Emitter.EventPayload<Payloads, EventName>) => void,
  ): Emitter.Unsubscribe {
    const remove = this.on(event, (payload) => {
      remove();
      listener(payload);
    });

    return remove;
  }

  readonly events: Emitter.Events<Payloads>["events"] = {
    on: this.on.bind(this),
    once: this.once.bind(this),
  };

  /**
   * Emit a payload to all listeners registered for an event.
   *
   * The `target` property is set to this emitter. For `error` events with no
   * listeners, throws the emitted `error` property.
   */
  emit<EventName extends keyof Payloads>(
    event: EventName,
    payload: Payloads[EventName],
  ): void {
    const listeners = this.#getListeners(event);

    if (!listeners || listeners.size === 0) {
      if (event === "error" && "error" in payload) {
        throw payload["error"];
      }

      return;
    }

    const eventPayload: Emitter.EventPayload<Payloads, EventName> = {
      ...payload,
      target: this,
    };

    for (const listener of listeners) {
      listener(eventPayload);
    }
  }

  #createUnsubscribe(remove: () => void): Emitter.Unsubscribe {
    const unsubscribe = () => {
      remove();
    };
    unsubscribe[Symbol.dispose] = unsubscribe;
    return unsubscribe;
  }

  #getListeners<EventName extends keyof Payloads>(
    event: EventName,
  ):
    | Set<(payload: Emitter.EventPayload<Payloads, EventName>) => void>
    | undefined {
    return this.#listeners.get(event);
  }

  #getOrCreateListeners<EventName extends keyof Payloads>(
    event: EventName,
  ): Set<(payload: Emitter.EventPayload<Payloads, EventName>) => void> {
    const listeners = this.#listeners.get(event);

    if (listeners === undefined) {
      const listeners = new Set<
        (payload: Emitter.EventPayload<Payloads, keyof Payloads>) => void
      >();
      this.#listeners.set(event, listeners);
      return listeners;
    }

    return listeners;
  }
}

type ErrorEventPayload = Record<string, unknown> & { error: Error };

export namespace Emitter {
  export type EventPayload<
    GivenEvents extends Payloads = Payloads,
    EventName extends keyof GivenEvents = keyof GivenEvents,
  > = { target: Emitter<GivenEvents> } & GivenEvents[EventName];

  export type Payloads = Record<string, Record<string, unknown>> & {
    error?: ErrorEventPayload;
  };

  export type Unsubscribe = (() => void) & Disposable;

  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  export interface Events<GivenPayloads extends Payloads = Payloads> {
    readonly events: {
      readonly on: Emitter<GivenPayloads>["on"];
      readonly once: Emitter<GivenPayloads>["once"];
    };
  }
}
