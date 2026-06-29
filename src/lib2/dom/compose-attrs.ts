/**
 * `ca` — attribute composition (§12.2.1).
 *
 * `ca(...sources)` merges objects of HTML attributes into one object suitable for
 * spreading onto a JSX element (or applying to a raw DOM node via {@link apply}).
 * It is the canonical way to combine prop objects produced by handler helpers with
 * a consumer's own props.
 *
 * Default conflict resolution (configurable via {@link CombineAttrs}):
 *
 * | Attribute pattern                                          | Duplicate behavior |
 * |------------------------------------------------------------|--------------------|
 * | `id`, `role`                                               | throw              |
 * | `data-js`                                                  | concat (space)     |
 * | `data-*`                                                   | throw              |
 * | `class`, `aria-labelledby`, `aria-describedby`, `style`    | concat             |
 * | everything else                                            | throw              |
 *
 * Producers pin per-attribute behavior with the {@link only} / {@link concat} /
 * {@link override} wrappers, irrespective of the global defaults. Any wrapper
 * mismatch throws; same-wrapper-same-value is the only no-op.
 */

export type Strategy = 'throw' | 'concat';

type WrapperKind = 'only' | 'concat' | 'override';

const WRAPPED = Symbol('janus.wrapped');

interface Wrapped {
	[WRAPPED]: true;
	kind: WrapperKind;
	value: string;
}

function wrap(kind: WrapperKind, value: string): Wrapped {
	return { [WRAPPED]: true, kind, value };
}

function isWrapped(v: unknown): v is Wrapped {
	return typeof v === 'object' && v !== null && (v as Record<symbol, unknown>)[WRAPPED] === true;
}

/** Must be the sole contribution for this attribute (a duplicate `only` with the same value is idempotent). */
export function only(value: string): Wrapped {
	return wrap('only', value);
}

/** Joins with other `concat` contributions. Throws if combined with `only` or `override`. */
export function concat(value: string): Wrapped {
	return wrap('concat', value);
}

/** Wins regardless of source order. Two `override`s throw. */
export function override(value: string): Wrapped {
	return wrap('override', value);
}

type Attrs = Record<string, unknown>;
type Source = Attrs | null | undefined | false;

/** Per-attribute join separator. `style` joins with `;`, everything else with a space. */
function separator(key: string): string {
	return key === 'style' ? '; ' : ' ';
}

/** Default strategy for an unwrapped attribute key. */
function defaultStrategy(config: Record<string, Strategy>, key: string): Strategy {
	if (key in config) return config[key]!;
	if (key.startsWith('data-')) return config['data-*'] ?? 'throw';
	return config['...'] ?? 'throw';
}

interface Contribution {
	kind: WrapperKind | 'plain';
	value: unknown;
}

function resolveKey(
	config: Record<string, Strategy>,
	key: string,
	contribs: Contribution[],
): unknown {
	if (contribs.length === 1 && contribs[0]!.kind === 'plain') {
		return contribs[0]!.value;
	}

	const kinds = new Set(contribs.map((c) => c.kind));

	// `only` must be the sole contribution (idempotent duplicates collapse to one value).
	if (kinds.has('only')) {
		const values = new Set(contribs.map((c) => String(c.value)));
		if (contribs.some((c) => c.kind !== 'only') || values.size > 1) {
			throw new Error(
				`ca(): conflicting contributions for "${key}" (only() must be the sole value)`,
			);
		}
		return contribs[0]!.value;
	}

	// `concat` throws if combined with `override` (mirrors the `only` rule).
	if (kinds.has('concat') && kinds.has('override')) {
		throw new Error(`ca(): concat() and override() both contribute to "${key}"`);
	}

	// `override` wins, but two overrides throw.
	const overrides = contribs.filter((c) => c.kind === 'override');
	if (overrides.length > 1) {
		throw new Error(`ca(): two override() contributions for "${key}"`);
	}
	if (overrides.length === 1) {
		return overrides[0]!.value;
	}

	// Remaining contributions are `concat` and/or `plain`.
	const explicitConcat = kinds.has('concat');
	const strategy = explicitConcat ? 'concat' : defaultStrategy(config, key);

	if (strategy === 'concat') {
		const parts = contribs
			.map((c) => c.value)
			.filter((v): v is string => typeof v === 'string' && v.length > 0);
		return parts.length ? parts.join(separator(key)) : (contribs[0]?.value ?? undefined);
	}

	// `throw` strategy with multiple plain contributions.
	throw new Error(`ca(): conflicting values for "${key}" (default strategy is "throw")`);
}

function combine(config: Record<string, Strategy>, sources: Source[]): Attrs {
	const collected = new Map<string, Contribution[]>();

	for (const source of sources) {
		if (!source) continue;
		for (const [key, raw] of Object.entries(source)) {
			if (raw === undefined || raw === null) continue;
			const contrib: Contribution = isWrapped(raw)
				? { kind: raw.kind, value: raw.value }
				: { kind: 'plain', value: raw };
			const list = collected.get(key);
			if (list) list.push(contrib);
			else collected.set(key, [contrib]);
		}
	}

	const out: Attrs = {};
	for (const [key, contribs] of collected) {
		const value = resolveKey(config, key, contribs);
		if (value !== undefined) out[key] = value;
	}
	return out;
}

export type Combiner = (...sources: Source[]) => Attrs;

/**
 * Factory for a configured attribute combiner. The library exports a default
 * `ca`; most consumers never construct their own. Returns a callable.
 */
export class CombineAttrs {
	constructor(config: Record<string, Strategy>) {
		const combiner: Combiner = (...sources: Source[]) => combine(config, sources);
		return combiner as unknown as CombineAttrs;
	}
}

/** The configured default combiner. */
export const ca = new CombineAttrs({
	id: 'throw',
	role: 'throw',
	'data-js': 'concat',
	'data-*': 'throw',
	class: 'concat',
	'aria-labelledby': 'concat',
	'aria-describedby': 'concat',
	style: 'concat',
	'...': 'throw',
}) as unknown as Combiner;

/**
 * Apply a merged attribute object to a raw DOM node. Booleans toggle presence;
 * `null` / `undefined` / `false` remove the attribute; everything else stringifies.
 */
export function apply(el: Element, attrs: Attrs): void {
	for (const [key, value] of Object.entries(attrs)) {
		if (value === undefined || value === null || value === false) {
			el.removeAttribute(key);
		} else if (value === true) {
			el.setAttribute(key, '');
		} else {
			el.setAttribute(key, String(value));
		}
	}
}
