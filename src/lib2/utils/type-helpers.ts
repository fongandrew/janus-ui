export type RequiredNonNullable<T> = {
	[K in keyof T]-?: NonNullable<T[K]>;
};

export type Falsey = false | 0 | '' | null | undefined;
