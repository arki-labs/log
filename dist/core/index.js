/** The core of `@arki/log`: loggers, `configure()`, templates, processors, formatters, core sinks and wrappers. */
// @arki/log core: zero dependencies, web-standard globals only. Importing does nothing.
export { configure, getLogger, shareContext, withContext } from './default.js';
export { LOG_ERROR_CODES, LogError } from './errors.js';
export { json, logfmt, pretty } from './formatters.js';
export { Level } from './levels.js';
export { createLogging, } from './logging.js';
export { dropWhen, enrich, maskSecrets, MIN_SECRET_LENGTH, redact } from './processors.js';
export { updateRecord } from './record.js';
export { serializeError, serializeFailure } from './serialize.js';
export { consoleSink, lineSink, memorySink } from './sinks.js';
export { renderTemplate } from './template.js';
export { buffer, deduplicate, fingersCrossed } from './wrappers.js';
//# sourceMappingURL=index.js.map