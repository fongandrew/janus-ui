declare module 'colorparsley' {
	/**
	 * Parse a color string into its components.
	 * @param str The color string to parse.
	 * @returns [r, g, b, a, isValid, format]
	 */
	export function colorParsley(str: string): [number, number, number, number, boolean, string];
}
