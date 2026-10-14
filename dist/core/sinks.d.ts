import type { Formatter, LogRecord, Sink } from './types.js';
/** A sink that keeps records in memory. */
export type MemorySink = Sink & {
    readonly records: readonly LogRecord[];
    clear(): void;
};
export declare function memorySink(): MemorySink;
/** Formats each record (JSON by default) and hands the line to `write`. */
export declare function lineSink(write: (line: string) => void, options?: {
    readonly format?: Formatter;
}): Sink;
/**
 * Writes to `console`. With `format`, each record is one formatted line.
 * Without it (browser mode), the message is followed by the fields object and
 * the error, so devtools can expand them.
 */
export declare function consoleSink(options?: {
    readonly format?: Formatter;
}): Sink;
//# sourceMappingURL=sinks.d.ts.map