export type NamespaceOptions = {
  prefix?: string | ReadonlyArray<string>;
  separator?: string;
};

export type { Namespace };

/**
 * A hierarchical namespace with a prefix and exclusive member claims.
 */
class Namespace {
  readonly #prefix: string;
  readonly #separator: string;
  readonly #claimed = new Set<string>();

  constructor(prefix: string, separator: string) {
    this.#prefix = prefix;
    this.#separator = separator;
  }

  /**
   * Claim a member within this namespace.
   *
   * Returns a child namespace whose prefix is this prefix joined with `member`.
   * Throws if `member` was already claimed on this namespace.
   *
   * @param member - The member name to claim
   * @returns A new namespace for the claimed member
   * @throws {Error} When the member was already claimed
   *
   * @example
   * ```ts
   * const root = namespace.define();
   * const a = root.claim("a");
   * const ab = a.claim("b");
   * ab.toString(); // "a.b"
   * ```
   */
  claim(member: string): Namespace {
    if (this.#claimed.has(member)) {
      throw new Error(
        `Namespace member ${JSON.stringify(member)} is already claimed in ${JSON.stringify(this.#prefix)}`,
        {
          cause: { prefix: this.#prefix, member },
        },
      );
    }

    this.#claimed.add(member);

    const childPrefix =
      this.#prefix === "" ? member : this.#prefix + this.#separator + member;

    return new Namespace(childPrefix, this.#separator);
  }

  /**
   * Returns the namespace prefix.
   */
  toString(): string {
    return this.#prefix;
  }
}

const defineNamespace = ({
  prefix,
  separator = ".",
}: NamespaceOptions = {}): Namespace =>
  new Namespace(
    prefix === undefined
      ? ""
      : typeof prefix === "string"
        ? prefix
        : prefix.join(separator),
    separator,
  );

/**
 * Utilities for defining hierarchical namespaces with exclusive member claims.
 */
export const namespace = {
  /**
   * Define a root namespace.
   *
   * @param options - Optional prefix and separator
   * @returns A new namespace instance
   *
   * @example
   * ```ts
   * const myNamespace = namespace.define();
   * const a = myNamespace.claim("a");
   * myNamespace.claim("a"); // throws
   * ```
   */
  define: defineNamespace,
};
