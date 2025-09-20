# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

**Important**: You **must** follow [these rules](./node_modules/@peerigon/configs/ai/rules.mdc) and its language-specific rules referenced in that file.

## Project Overview

Fractals-TypeScript is a collection of small, focused TypeScript utility functions. Each utility is designed to be tree-shakeable and lives in its own sub-package (e.g., `@peerigon/fractals-typescript/match`).

## Development Commands

This project uses npm scripts for all development tasks:

- **Test all**: `npm test` - Runs all tests in parallel (format, lint, types, unit)
- **Unit tests**: `npm run test:unit` - Run Vitest tests once
- **Watch tests**: `npm run vitest` - Run Vitest in watch mode
- **Lint**: `npm run test:lint` - ESLint with zero warnings allowed
- **Type check**: `npm run test:types` - TypeScript compiler check
- **Format check**: `npm run test:format` - Prettier format validation

**Important**: Use the typescript-lsp MCP to get diagnostics and type information
**Important**: Use the vitest-server MCP to run individual tests.
**Important**: Use the eslint MCP to check for linting errors.

## Project Structure

- **Source**: `src/` - All source code and tests
- **Tests**: Co-located with source files using `.test.ts` suffix
- **Configuration**: Uses `@peerigon/configs` for shared TypeScript, ESLint, and Prettier configs

## Code Organization

- Functions are implemented in individual files in `src/`
- Each function has comprehensive unit tests using Vitest
- Uses ES module syntax throughout (`.ts` extensions in imports)

## Architecture

This is a **utility library** where each function is:

- Located in its own directory under `/src`
- Exported as a sub-package (e.g., `/match`, `/assert`)
- Accompanied by tests (`*.test.ts`) and often a README
- Tree-shakeable with no default exports

Current utilities include:

- `match` - Pattern matching with TypeScript exhaustiveness
- `assert` - Type assertion helpers
- `result` - Result type for error handling with pending, success, and error states
- `reject` - Error throwing utilities
- `need` - Required value utilities
- `unwrap` - Unwrapping utilities
- `enums` - Enum utilities
- `dedupe` - Deduplication utilities
- `errors` - Structured error interface
- `casing` - TypeScript literal types and type guards for casing conventions

The `/src/lib` folder contains shared types, functions, and values that may be reused across sub-packages. These are internal utilities not exposed as public exports.

## Key Development Notes

1. **No default exports** - All exports must be named (enforced by ESLint)
2. **Sub-package pattern** - Each utility has its own export path configured in package.json
3. **Test alongside code** - Tests are colocated with implementation files
4. **Shared configs** - Uses `@peerigon/configs` for ESLint and TypeScript settings
5. **Semantic commits** - Follow conventional commits for automated releases

## Adding New Utilities

When adding a new utility:

1. Create a new directory under `/src`
2. Add the implementation file(s)
3. Add tests in the same directory
4. Update package.json exports to include the new sub-package
5. Add a `README.md` in `/src/<utility-name>.md`. Use `./src/assert/README.md` as blueprint.
6. Update the main `README.md` and `CLAUDE.md`
