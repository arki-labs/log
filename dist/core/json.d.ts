import type { Fields, Value } from './types.js';
export declare function jsonString(value: string): string;
/** One value as JSON. `undefined` becomes `null` (callers skip undefined members). */
export declare function jsonValue(value: Value, depth?: number): string;
/** The members of an object as `"key":value,...`, without braces. Undefined values are skipped. */
export declare function jsonMembers(fields: Fields, depth?: number): string;
/** A value as it appears inside a rendered message: strings as they are, the rest as JSON. */
export declare function formatValue(value: Value): string;
export declare function isValueArray(value: Value): value is readonly Value[];
/** A plain field map: not an array, Date or Error. */
export declare function isFieldMap(value: Value): value is Fields;
//# sourceMappingURL=json.d.ts.map