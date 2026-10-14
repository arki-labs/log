import type { LevelInput } from './levels.js';
import type { FieldsArg } from './template.js';
import type { FieldInput, Fields, LogConfig, LogRecord, TraceContext, Value } from './types.js';
/**
 * Register your app's logging handle to type-check channel names in `to()`
 * (RFC §8.4):
 *
 * ```ts
 * declare module '@arki/log' {
 *   interface Register { logging: typeof logging }
 * }
 * ```
 */
export interface Register {
}
/** The app's channel names once `Register` is declared; any string before that. */
export type ChannelName = Register extends {
    logging: Configured<infer C>;
} ? C : string;
/** A structured event (RFC §5.5). */
export type LogEvent = {
    readonly level: LevelInput;
    readonly eventName: string;
    readonly body?: Value;
    readonly fields?: Fields;
};
/** A logger (RFC §3). `Bound` holds the keys bound with `.with()`, which satisfy placeholders. */
export type Logger<Bound extends string = never> = {
    readonly category: string;
    trace<T extends string>(template: T, ...fields: FieldsArg<T, Bound>): void;
    debug<T extends string>(template: T, ...fields: FieldsArg<T, Bound>): void;
    info<T extends string>(template: T, ...fields: FieldsArg<T, Bound>): void;
    warn<T extends string>(template: T, ...fields: FieldsArg<T, Bound>): void;
    error<T extends string>(template: T, ...fields: FieldsArg<T, Bound>): void;
    /** Logs an error; the template is the error's message. */
    error(error: Error, fields?: FieldInput): void;
    fatal<T extends string>(template: T, ...fields: FieldsArg<T, Bound>): void;
    /** Logs an error; the template is the error's message. It only writes; it never exits. */
    fatal(error: Error, fields?: FieldInput): void;
    log<T extends string>(level: LevelInput, template: T, ...fields: FieldsArg<T, Bound>): void;
    isEnabled(level: LevelInput): boolean;
    emit(event: LogEvent): void;
    /** A logger with bound fields. The original is unchanged. */
    with<F extends Fields>(fields: F): Logger<Bound | (keyof F & string)>;
    /** Extends the category path: `'arki:kv'` → `'arki:kv:redis'`. */
    child(name: string): Logger<Bound>;
    /** Stamps this trace on every record. */
    withTrace(trace: TraceContext): Logger<Bound>;
    /** Sends records only to these channels, instead of the category's channels. */
    to(...channels: readonly [ChannelName, ...ChannelName[]]): Logger<Bound>;
};
/** Type-only key that carries a handle's channel names to `Register`. Never set at runtime. */
declare const CHANNELS: unique symbol;
/** The handle `configure()` returns (RFC §8.1). */
export type Configured<C extends string> = {
    readonly [CHANNELS]?: C;
    flush(): Promise<void>;
    /** Flushes, then closes every sink. The instance is then unconfigured again. */
    close(options?: {
        readonly timeoutMs?: number;
    }): Promise<void>;
    /** Swaps the configuration atomically; the old sinks that are not reused drain and close. */
    reconfigure<const D extends string>(config: LogConfig<D>): Promise<void>;
};
/** A logging instance: the default one behind the global functions, or a private one from `createLogging()`. */
export type Logging = {
    getLogger(category?: string): Logger;
    configure<const C extends string>(config: LogConfig<C>): Configured<C>;
    withContext<R>(fields: Fields, fn: () => R): R;
    shareContext(fields: Fields): void;
};
/** Key of the internal API; `Symbol.for` so two copies of the package share it. */
export declare const INTERNAL: unique symbol;
/** Receives every record while a fake is installed, with the channel names it was routed to. */
export type Capture = (record: LogRecord, channels: readonly string[]) => void;
export type LoggingInternals = {
    /** Routes every category at `trace` to `capture` instead of the sinks. Returns the restore function. */
    installFake(capture: Capture): () => void;
};
export type InternalLogging = {
    readonly [INTERNAL]: LoggingInternals;
} & Logging;
export declare function isInternalLogging(value: unknown): value is InternalLogging;
/** A private logging instance with the same functions as the default one (RFC §8.1). */
export declare function createLogging(): Logging;
/** For the default instance: same as `createLogging`, typed with the internal API. */
export declare function createInternalLogging(): InternalLogging;
export {};
//# sourceMappingURL=logging.d.ts.map