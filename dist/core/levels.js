import { invalidLevelError } from './errors.js';
/** The six levels, with their OpenTelemetry severity numbers (RFC §4). */
export const Level = { trace: 1, debug: 5, info: 9, warn: 13, error: 17, fatal: 21 };
const NAMES = ['trace', 'debug', 'info', 'warn', 'error', 'fatal'];
/** The level name (OTel SeverityText) for a severity number from 1 to 24. */
export function levelNameOf(level) {
    return NAMES[(level - 1) >> 2] ?? 'fatal';
}
/** Turns a level name or a severity number into a severity number. Throws `ARKI_LOG_E003` when it is neither. */
export function toLevel(input) {
    if (typeof input === 'number') {
        if (Number.isInteger(input) && input >= 1 && input <= 24)
            return input;
        throw invalidLevelError(input);
    }
    if (Object.hasOwn(Level, input))
        return Level[input];
    throw invalidLevelError(input);
}
//# sourceMappingURL=levels.js.map