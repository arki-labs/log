import type { ContextStore, EnvSettings, Formatter, Sink } from '../core/types.js';
type FdSinkOptions = {
    readonly format?: Formatter;
};
/** Writes lines (JSON by default) to standard output. */
export declare function stdout(options?: FdSinkOptions): Sink;
/** Writes lines (JSON by default) to standard error. */
export declare function stderr(options?: FdSinkOptions): Sink;
/** Appends lines (JSON by default) to a file, opened when this is called. */
export declare function file(options: {
    readonly path: string;
    readonly format?: Formatter;
}): Sink;
/**
 * Reads the environment, only when called (RFC §8.5): `LOG_LEVEL` (the
 * default level), `DEBUG` (`arki:kv:*,-arki:kv:noisy`: each match lowers that
 * category to `debug`; `-` excludes) and `NO_COLOR`. Spread the result into
 * `configure()`.
 */
export declare function fromEnv(env?: Readonly<Record<string, string | undefined>>): {
    readonly env: EnvSettings;
};
/** A context store on `AsyncLocalStorage`: `withContext` scopes survive `await`. */
export declare function asyncContext(): ContextStore;
export {};
//# sourceMappingURL=index.d.ts.map