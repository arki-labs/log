/** The six levels, with their OpenTelemetry severity numbers (RFC §4). */
export declare const Level: {
    readonly trace: 1;
    readonly debug: 5;
    readonly info: 9;
    readonly warn: 13;
    readonly error: 17;
    readonly fatal: 21;
};
export type LevelName = keyof typeof Level;
/** A level name, or an OpenTelemetry severity number from 1 to 24. */
export type LevelInput = LevelName | number;
/** The level name (OTel SeverityText) for a severity number from 1 to 24. */
export declare function levelNameOf(level: number): LevelName;
/** Turns a level name or a severity number into a severity number. Throws `ARKI_LOG_E003` when it is neither. */
export declare function toLevel(input: LevelInput): number;
//# sourceMappingURL=levels.d.ts.map