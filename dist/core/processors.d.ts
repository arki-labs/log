import type { Fields, LogRecord, Processor, Value } from './types.js';
export type Censor = string | ((value: Value, path: string) => Value);
/**
 * Replaces the values at dot paths (RFC §7). `*` matches one level of keys or
 * array items (`'*.token'`). Paths are matched against the fields and the
 * serialised error. The copy renders its message from the redacted fields, so
 * a secret never reaches the message text.
 */
export declare function redact(paths: readonly string[], options?: {
    readonly censor?: Censor;
}): Processor;
/** Adds fields from `fn`. Never overwrites a key the record already has. */
export declare function enrich(fn: (record: LogRecord) => Fields): Processor;
/** Drops records the predicate matches. */
export declare function dropWhen(predicate: (record: LogRecord) => boolean): Processor;
//# sourceMappingURL=processors.d.ts.map