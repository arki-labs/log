import type { Configured, InternalLogging, Logger } from './logging.js';
import type { Fields, LogConfig } from './types.js';
/** Where the default instance lives, so two copies of the package in one process share it (RFC §8.2). */
export declare const DEFAULT_KEY: unique symbol;
/** The default instance, created on first use (never at import). */
export declare function defaultLogging(): InternalLogging;
/** A logger for a `:`-separated category; no argument is the root category `''`. Safe at module scope. */
export declare function getLogger(category?: string): Logger;
/** Configures the default instance, once, at the app entry. A second call throws `ARKI_LOG_E001`. */
export declare function configure<const C extends string>(config: LogConfig<C>): Configured<C>;
/** Runs `fn` with fields every record inside carries. Async code needs `asyncContext()` installed. */
export declare function withContext<R>(fields: Fields, fn: () => R): R;
/** App-wide fields on every record. Later calls add to (and override) earlier ones. */
export declare function shareContext(fields: Fields): void;
//# sourceMappingURL=default.d.ts.map