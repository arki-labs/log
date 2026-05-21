export var SeverityName;
(function (SeverityName) {
    SeverityName["TRACE"] = "TRACE";
    SeverityName["DEBUG"] = "DEBUG";
    SeverityName["INFO"] = "INFO";
    SeverityName["WARN"] = "WARN";
    SeverityName["ERROR"] = "ERROR";
    SeverityName["FATAL"] = "FATAL";
})(SeverityName || (SeverityName = {}));
export class Severity {
    static TRACE = {
        text: SeverityName.TRACE,
        number: 1,
    };
    static DEBUG = {
        text: SeverityName.DEBUG,
        number: 5,
    };
    static INFO = {
        text: SeverityName.INFO,
        number: 9,
    };
    static WARN = {
        text: SeverityName.WARN,
        number: 13,
    };
    static ERROR = {
        text: SeverityName.ERROR,
        number: 17,
    };
    static FATAL = {
        text: SeverityName.FATAL,
        number: 21,
    };
}
//# sourceMappingURL=types.js.map