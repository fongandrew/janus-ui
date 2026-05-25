import { registerBehavior } from '../dispatch';
import { isTouched, validateElement, writeError } from '../form/validate';

registerBehavior('t-validate-group', {
	change(el, ev) {
		const target = ev.target as HTMLElement;
		if (!el.contains(target)) return;

		const fields = el.querySelectorAll('input, select, textarea');
		for (const field of fields) {
			if (field === target) continue;
			if (!isTouched(field)) continue;
			validateElement(field as HTMLElement).then((msg) => {
				writeError(field, msg);
			});
		}
	},
});
