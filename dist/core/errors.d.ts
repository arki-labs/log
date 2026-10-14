/**
 * Coded errors for mistakes in logging setup. A log call itself never throws
 * these unless it is given a level that does not exist.
 */
export declare const LOG_ERROR_CODES: {
    readonly alreadyConfigured: 'ARKI_LOG_E001';
    readonly unknownChannel: 'ARKI_LOG_E002';
    readonly invalidLevel: 'ARKI_LOG_E003';
    readonly fakeActive: 'ARKI_LOG_E004';
    readonly staleHandle: 'ARKI_LOG_E005';
};
export type LogErrorCode = (typeof LOG_ERROR_CODES)[keyof typeof LOG_ERROR_CODES];
export declare class LogError extends Error {
    readonly code: LogErrorCode;
    readonly remediation: string;
    constructor(args: {
        readonly code: LogErrorCode;
        readonly message: string;
        readonly remediation: string;
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
//# sourceMappingURL=errors.d.ts.map