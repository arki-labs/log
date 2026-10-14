// Logging must never throw into the code that logs, and a failure inside a
// timer (buffer, deduplicate) must never become an uncaught exception. A
// failing sink or processor is reported once on `console.error`, then skipped
// quietly. The report does not go through logging, so it cannot recurse.
const reported = new WeakSet();
export function reportFailure(source, what, error) {
    if (reported.has(source))
        return;
    reported.add(source);
    console.error(`@arki/log: ${what} threw; later failures from it are not reported.`, error);
}
//# sourceMappingURL=report.js.map