/** Combine an aribtrary number of iterators */
export function* combine<T>(...iterators: Iterable<T>[]): Iterable<T> {
	for (const it of iterators) yield* it;
}
