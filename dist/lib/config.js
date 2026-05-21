import pino from 'pino';
import { LoggingFormatter } from './formatter.js';
import { Severity, SeverityName } from './types.js';
export class Configuration {
    debug;
    severity;
    transport;
    /**
     * Batching configuration
     */
    batchLogging;
    maxBatchSize;
    autoFlushMs;
    constructor(options = {}) {
        if (process.env['DEBUG']) {
            this.debug = process.env['DEBUG'].split(',');
        }
        // Safely get severity from environment variable
        this.severity = process.env['LOG_LEVEL'] ? this.getSeverityFromString(process.env['LOG_LEVEL']) : Severity.INFO;
        const transportOptions = {
            level: 'trace',
            base: null,
            timestamp: false,
        };
        if (process.env['NODE_ENV'] === 'production') {
            const formatter = new LoggingFormatter();
            transportOptions.formatters = {
                log: (obj) => formatter.log(obj),
            };
        }
        this.transport = pino(transportOptions);
        // Initialize batching configuration
        this.batchLogging = options.batchLogging ?? false;
        this.maxBatchSize = options.maxBatchSize ?? 100;
        this.autoFlushMs = options.autoFlushMs ?? 5000;
    }
    getSeverity(name) {
        if (this.debug && name && this.debug.includes(name)) {
            return Severity.DEBUG;
        }
        return this.severity;
    }
    setDebug(debug) {
        this.debug = debug.split(',');
    }
    /**
     * Configure batching options
     * @param options - Batching configuration options
     */
    configureBatching(options) {
        if (options.batchLogging !== undefined) {
            this.batchLogging = options.batchLogging;
        }
        if (options.maxBatchSize !== undefined) {
            this.maxBatchSize = options.maxBatchSize;
        }
        if (options.autoFlushMs !== undefined) {
            this.autoFlushMs = options.autoFlushMs;
        }
    }
    /**
     * Safely convert a string to a SeverityKind
     * @param levelName - The string severity level
     * @returns The corresponding SeverityKind or Severity.INFO as fallback
     */
    getSeverityFromString(levelName) {
        // Check if the level name is a valid severity
        if (Object.values(SeverityName).includes(levelName)) {
            return Severity[levelName];
        }
        return Severity.INFO;
    }
}
export const configuration = new Configuration();
//# sourceMappingURL=config.js.map