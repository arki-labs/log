import type { LevelName } from '../core/levels.js';
import type { Fields, LogRecord } from '../core/types.js';
/** What a captured record must match. Every given part must match; `fields` matches a subset. */
export type RecordMatch = {
    readonly level?: LevelName;
    readonly category?: string;
    readonly template?: string;
    readonly message?: string;
    readonly eventName?: string;
    readonly fields?: Fields;
};
/** A record and the channel names it was routed to. */
export type CapturedRecord = {
    readonly record: LogRecord;
    readonly channels: readonly string[];
};
export type FakeLog = {
    /** Every record, from every category, at every level. */
    readonly records: readonly LogRecord[];
    /** Every record with the channels it was routed to (`to()`, else the configured category rule). */
    readonly captured: readonly CapturedRecord[];
    assertLogged(match: RecordMatch): void;
    assertNotLogged(match: RecordMatch): void;
    assertSentTo(channel: string, match?: RecordMatch): void;
    /** Gives the default instance back, with its configuration as it was. */
    restore(): void;
    [Symbol.dispose](): void;
};
/**
 * Takes over the default instance: level `trace`, every category captured,
 * no sink written. `restore()` (or `using`) gives it back. One fake at a time
 * per process; a second one throws `ARKI_LOG_E004`.
 */
export declare function fakeLog(): FakeLog;
export declare class LogAssertionError extends Error {
    constructor(message: string);
}
//# sourceMappingURL=index.d.ts.map