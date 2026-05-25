import { registerBehavior } from '../dispatch';
import { handleSubmit } from '../form/submit';

registerBehavior('t-submit', {
	submit(el, ev) {
		ev.preventDefault();
		if (el instanceof HTMLFormElement) {
			handleSubmit(el);
		}
	},
});
