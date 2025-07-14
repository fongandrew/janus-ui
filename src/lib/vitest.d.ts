import 'vitest';

interface CustomMatchers {
	toHaveBeenCalledWithFirstArgs(...args: any[]): void;
}
declare module 'vitest' {
	interface Assertion extends CustomMatchers {}
	interface AsymmetricMatchersContaining extends CustomMatchers {}
}
