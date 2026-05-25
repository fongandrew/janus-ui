const ONLY = Symbol('only');
const CONCAT = Symbol('concat');
const OVERRIDE = Symbol('override');

export interface Only {
	__type: typeof ONLY;
	value: string;
}
export interface Concat {
	__type: typeof CONCAT;
	value: string;
}
export interface Override {
	__type: typeof OVERRIDE;
	value: string;
}

export type Wrapped = Only | Concat | Override;
export type AttrValue = string | boolean | number | Wrapped | undefined;
export type Attrs = Record<string, AttrValue>;

export function only(value: string): Only {
	return { __type: ONLY, value };
}

export function concat(value: string): Concat {
	return { __type: CONCAT, value };
}

export function override(value: string): Override {
	return { __type: OVERRIDE, value };
}

function isWrapped(v: AttrValue): v is Wrapped {
	return typeof v === 'object' && v !== null && '__type' in v;
}

type Resolution = 'throw' | 'concat';

interface DefaultMap {
	[key: string]: Resolution;
}

function getResolution(defaults: DefaultMap, key: string): Resolution {
	if (key in defaults) return defaults[key]!;
	if (key.startsWith('data-') && 'data-*' in defaults) return defaults['data-*']!;
	if ('...' in defaults) return defaults['...']!;
	return 'throw';
}

export class CombineAttrs {
	private defaults: DefaultMap;

	constructor(defaults: DefaultMap) {
		this.defaults = defaults;
	}

	combine(...sources: (Attrs | undefined | null | false)[]): Attrs {
		const result: Record<string, AttrValue> = {};
		const seen: Record<string, { type: 'raw' | 'only' | 'concat' | 'override'; value: string }> =
			{};

		for (const source of sources) {
			if (!source) continue;
			for (const [key, val] of Object.entries(source)) {
				if (val === undefined) continue;

				if (isWrapped(val)) {
					const existing = seen[key];
					if (val.__type === ONLY) {
						if (existing) {
							if (existing.type === 'only' && existing.value === val.value) continue;
							throw new Error(
								`ca: conflict on "${key}" — only(${val.value}) vs existing ${existing.type}(${existing.value})`,
							);
						}
						seen[key] = { type: 'only', value: val.value };
						result[key] = val.value;
					} else if (val.__type === CONCAT) {
						if (existing) {
							if (existing.type === 'only' || existing.type === 'override') {
								throw new Error(
									`ca: conflict on "${key}" — concat(${val.value}) vs existing ${existing.type}(${existing.value})`,
								);
							}
							const joined = existing.value + ' ' + val.value;
							seen[key] = { type: 'concat', value: joined };
							result[key] = joined;
						} else {
							seen[key] = { type: 'concat', value: val.value };
							result[key] = val.value;
						}
					} else if (val.__type === OVERRIDE) {
						if (existing && existing.type === 'override') {
							throw new Error(
								`ca: conflict on "${key}" — two override values: "${existing.value}" vs "${val.value}"`,
							);
						}
						seen[key] = { type: 'override', value: val.value };
						result[key] = val.value;
					}
				} else {
					const strVal = String(val);
					const existing = seen[key];
					if (existing) {
						if (existing.type !== 'raw') {
							throw new Error(
								`ca: conflict on "${key}" — raw "${strVal}" vs existing ${existing.type}(${existing.value})`,
							);
						}
						const resolution = getResolution(this.defaults, key);
						if (resolution === 'throw') {
							throw new Error(`ca: conflict on "${key}" — duplicate raw values: "${existing.value}" vs "${strVal}"`);
						}
						const joined = existing.value + ' ' + strVal;
						seen[key] = { type: 'raw', value: joined };
						result[key] = joined;
					} else {
						seen[key] = { type: 'raw', value: strVal };
						result[key] = val;
					}
				}
			}
		}

		return result;
	}
}

const defaultCa = new CombineAttrs({
	id: 'throw',
	role: 'throw',
	'data-js': 'concat',
	'data-*': 'throw',
	class: 'concat',
	'aria-labelledby': 'concat',
	'aria-describedby': 'concat',
	style: 'concat',
	'...': 'throw',
});

export function ca(...sources: (Attrs | undefined | null | false)[]): Attrs {
	return defaultCa.combine(...sources);
}
