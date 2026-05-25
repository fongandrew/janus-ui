let idCounter = 0;

function generateId(prefix: string): string {
	return `${prefix}-${++idCounter}`;
}

export interface LabelledInputIds {
	inputId: string;
	labelId: string;
	descId: string;
	errId: string;
}

export function useLabelledInput(baseId?: string): LabelledInputIds {
	const id = baseId ?? generateId('janus');
	return {
		inputId: id,
		labelId: `${id}-label`,
		descId: `${id}-desc`,
		errId: `${id}-err`,
	};
}

export function getDescribedBy(ids: LabelledInputIds, opts?: { hasDescription?: boolean; hasError?: boolean }): string | undefined {
	const parts: string[] = [];
	if (opts?.hasDescription) parts.push(ids.descId);
	if (opts?.hasError) parts.push(ids.errId);
	return parts.length > 0 ? parts.join(' ') : undefined;
}
