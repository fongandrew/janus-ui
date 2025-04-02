/** Gets the current test mode environment */
export function getTestMode() {
	return (process.env as Record<string, string>)['TEST_MODE'] as 'ssr' | undefined;
}
