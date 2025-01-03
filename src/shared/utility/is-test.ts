export function isTest() {
	return import.meta.env.MODE === 'test';
}
