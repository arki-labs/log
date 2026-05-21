import type { Logger } from 'pino';
import type { SeverityKind } from './types.js';
/**
 * Logger configuration options
 */
export type LoggerConfigOptions = {
    /**
     * Enable batch logging mode
     * @default false
     */
    batchLogging?: boolean;
    /**
     * Maximum batch size before auto-flush
     * @default 100
     */
    maxBatchSize?: number;
    /**
     * Auto-flush interval in milliseconds
     * @default 5000
     */
    autoFlushMs?: number;
};
export declare class Configuration {
    debug?: string[];
    severity: SeverityKind;
    transport: Logger;
    /**
     * Batching configuration
     */
    batchLogging: boolean;
    maxBatchSize: number;
    autoFlushMs: number;
    constructor(options?: LoggerConfigOptions);
    getSeverity(name?: string): SeverityKind;
    setDebug(debug: string): void;
    /**
     * Configure batching options
     * @param options - Batching configuration options
     */
    configureBatching(options: Pick<LoggerConfigOptions, 'batchLogging' | 'maxBatchSize' | 'autoFlushMs'>): void;
    /**
     * Safely convert a string to a SeverityKind
     * @param levelName - The string severity level
     * @returns The corresponding SeverityKind or Severity.INFO as fallback
     */
    private getSeverityFromString;
}
export declare const configuration: Configuration;
//# sourceMappingURL=config.d.ts.map