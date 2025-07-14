const prefix = '$$mp';
let nameCounter = 0;

/**
 * Create an accessor / setter pair that will lazily assign an arbitrary property (that probably
 * won't conflict with anything) to an object.
 * @param useDefineProperty - Use `Object.defineProperty` to work around issues with certain
 * objects
 */
export function createMagicProp<TValue, TObj = any>(useDefineProperty = false) {
	const name = `${prefix}${nameCounter++}`;
	return [
		(obj: TObj): TValue | undefined => {
			return (obj as any)[name];
		},
		useDefineProperty
			? (obj: TObj, value: TValue | undefined) => {
					Object.defineProperty(obj, name, {
						value,
						writable: true,
						enumerable: false,
					});
				}
			: (obj: TObj, value: TValue | undefined) => {
					(obj as any)[name] = value;
				},
	] as const;
}
