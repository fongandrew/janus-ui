const ROOT_NAME = 'appDebug';

let debugObject: any;

export function exportToGlobalDebugger(name: string, value: any) {
	if (!debugObject) {
		debugObject = (globalThis as any)[ROOT_NAME] = (globalThis as any)[ROOT_NAME] ?? {};
	}
	debugObject[name] = value;
}
