export type RequiredNonNullable<T> = {
	[K in keyof T]-?: NonNullable<T[K]>;
};
