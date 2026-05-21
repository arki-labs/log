export type AttributeValue = string | number | boolean | (null | undefined | string)[] | (null | undefined | number)[] | (null | undefined | boolean)[];
export type Attributes = Record<string, AttributeValue | undefined>;
export type StructuredBody = Record<string, unknown>;
export type Body = string | Error | StructuredBody;
export type SeverityNumber = number;
export declare enum SeverityName {
    TRACE = "TRACE",
    DEBUG = "DEBUG",
    INFO = "INFO",
    WARN = "WARN",
    ERROR = "ERROR",
    FATAL = "FATAL"
}
export type SeverityText = keyof typeof SeverityName;
export type SeverityKind = {
    text: SeverityText;
    number: SeverityNumber;
};
export declare class Severity {
    static TRACE: SeverityKind;
    static DEBUG: SeverityKind;
    static INFO: SeverityKind;
    static WARN: SeverityKind;
    static ERROR: SeverityKind;
    static FATAL: SeverityKind;
}
export type LogRecord = {
    timestamp: number;
    traceId?: string;
    spanId?: string;
    severityText: SeverityText;
    severityNumber: SeverityNumber;
    name?: string;
    body: Body;
    attributes?: Attributes;
    resource?: any;
    /**
     * @internal
     * Used internally for batch processing
     */
    _level?: string;
};
//# sourceMappingURL=types.d.ts.map