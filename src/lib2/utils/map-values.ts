/**
 * Utility that takes the keys and values of a record and returns a new
 * record with the same keys and the values transformed by a function.
 */
export function mapValues<TRecord extends Record<string, any>, TTransform>(
	obj: TRecord,
	fn: (value: TRecord[keyof TRecord], key: keyof TRecord) => TTransform,
): { [K in keyof TRecord]: TTransform } {
	const result: Partial<Record<keyof TRecord, any>> = {};
	const keys = Object.keys(obj);
	for (const key of keys) {
		result[key as keyof TRecord] = fn(obj[key as keyof TRecord], key as keyof TRecord);
	}
	return result as Record<keyof TRecord, TTransform>;
}
