import type { Formatter } from './types.js';
/**
 * One JSON object per record: `time`, `level`, `levelName`, `category`,
 * `template`, `message`, then `eventName`, `body`, `fields`, `error`, trace
 * ids and `resource` when present. Bound fields are written from JSON cached
 * once per `.with()`. When layers share a key, the merged map is written
 * instead, so every key appears once (RFC §5.2 precedence).
 */
export declare function json(): Formatter;
/**
 * Human output: `12:00:00.123 INFO  arki:kv connecting to db.local  pool=main`.
 * Placeholder values are highlighted; fields not used by the template follow.
 * Errors print their stack and cause chain. Colors are off unless asked for.
 */
export declare function pretty(options?: {
    readonly colors?: boolean;
}): Formatter;
/** `key=value` pairs: `time`, `level`, `category`, `msg`, then fields, `error` and trace ids. */
export declare function logfmt(): Formatter;
//# sourceMappingURL=formatters.d.ts.map