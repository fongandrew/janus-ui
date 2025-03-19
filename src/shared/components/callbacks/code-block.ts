import { createHandler } from '~/shared/utility/callback-attrs/events';
import { evtDoc } from '~/shared/utility/multi-view';

/** Copies the text content of the given element to the clipboard */
export const codeBlockCopy = createHandler(
	'click',
	'$c-code-block__copy',
	(e, detailId: string, beforeId: string, afterId: string) => {
		const detail = evtDoc(e)?.getElementById(detailId);
		const text = detail?.textContent;
		if (!text) return;

		navigator.clipboard.writeText(text);
		const before = evtDoc(e)?.getElementById(beforeId);
		const after = evtDoc(e)?.getElementById(afterId);
		before?.classList.add('t-hidden');
		after?.classList.remove('t-hidden');
	},
);
