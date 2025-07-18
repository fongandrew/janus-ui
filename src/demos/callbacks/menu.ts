import { createHandler } from '~/lib/utility/callback-attrs/events';
import { elmDoc } from '~/lib/utility/multi-view';

export const menuUpdateText = createHandler(
	'click',
	'$p-menu__update-text',
	(event, writeTargetId: string) => {
		const clickTarget = event.target as HTMLElement;
		const writeTarget = elmDoc(clickTarget)?.getElementById(writeTargetId);
		if (!writeTarget) return;

		const value = clickTarget.closest<HTMLButtonElement>('[value]')?.value;
		writeTarget.textContent = `Selected: ${value ?? 'None'}`;
	},
);
