import { result, type Result } from "../../result/result.ts";
import { defineApi, type DefineApiOptions, type FetchInput } from "../api.ts";

/**
 * Like {@link defineApi}, but each call returns `Result.Sync` via
 * `result.fromAsync` instead of throwing.
 *
 * Import from `@peerigon/typescript-toolkit/api/result` so the base
 * `/api` entry stays free of the `result` dependency.
 */
export const defineApiResult = (
  baseUrl: string,
  options: DefineApiOptions = {},
): ((input: FetchInput) => Promise<Result.Sync>) => {
  const api = defineApi(baseUrl, options);

  return async (input) => result.fromAsync(async () => api(input));
};
