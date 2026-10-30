/**
 * Coded errors for mistakes in logging setup. A log call itself never throws
 * these unless it is given a level that does not exist.
 */
export declare const LOG_ERROR_CODES: {
    /**
     * `configure()` ran a second time on the same logging instance.
     *
     * @fix Call `configure()` once at the app entry, with `{ owner: import.meta.url }` so a dev re-run of the entry is allowed. Use `reconfigure()` on its handle to change the setup.
     * @verify bun run test -- src/core/logging.test.ts
     */
    readonly alreadyConfigured: 'ARKI_LOG_E001';
    /**
     * A category rule or `to()` names a channel that `configure({ channels })` does not define.
     *
     * @fix Add the channel to `configure({ channels })`, or use one of the defined names.
     * @verify bun run test -- src/core/logging.test.ts
     */
    readonly unknownChannel: 'ARKI_LOG_E002';
    /**
     * A level is neither one of the six names nor a severity number from 1 to 24.
     *
     * @fix Use `trace`, `debug`, `info`, `warn`, `error` or `fatal`, or a number from 1 to 24.
     * @verify bun run test -- src/core/logging.test.ts
     */
    readonly invalidLevel: 'ARKI_LOG_E003';
    /**
     * `fakeLog()` ran while another fake was active, or `configure()` ran while a fake owns the instance.
     *
     * @fix Restore the active fake first with `restore()` or `using`. Keep one fake at a time.
     * @verify bun run test -- src/testing/fake.test.ts
     */
    readonly fakeActive: 'ARKI_LOG_E004';
    /**
     * `reconfigure()` was called on a handle that no longer owns the configuration.
     *
     * @fix Use the handle returned by the latest `configure()` call.
     * @verify bun run test -- src/core/logging.test.ts
     */
    readonly staleHandle: 'ARKI_LOG_E005';
    /**
     * `file({ path })` could not open the file for appending (missing folder, no permission, or a directory).
     *
     * @fix Create the folder, fix its permissions, or point `path` at a writable file.
     * @verify bun run test -- src/node/node.test.ts
     */
    readonly fileOpenFailed: 'ARKI_LOG_E006';
};
export type LogErrorCode = (typeof LOG_ERROR_CODES)[keyof typeof LOG_ERROR_CODES];
export declare class LogError extends Error {
    readonly code: LogErrorCode;
    readonly remediation: string;
    constructor(args: {
        readonly code: LogErrorCode;
        readonly message: string;
        readonly remediation: string;
        readonly cause?: unknown;
    });
}
/** `configure()` ran a second time on the same `Logging`. */
export declare function alreadyConfiguredError(): LogError;
/** A category rule or `to()` names a channel that `configure({ channels })` does not define. */
export declare function unknownChannelError(name: string, known: readonly string[]): LogError;
/** A level is neither one of the six names nor an integer from 1 to 24. */
export declare function invalidLevelError(level: unknown): LogError;
/** `fakeLog()` ran while another fake was active, or `configure()` ran while a fake owns the instance. */
export declare function fakeActiveError(): LogError;
/** `reconfigure()` was called on a handle whose configuration is no longer the active one. */
export declare function staleHandleError(): LogError;
/** `file()` could not open its path for appending. */
export declare function fileOpenError(path: string, cause: unknown): LogError;
//# sourceMappingURL=errors.d.ts.map