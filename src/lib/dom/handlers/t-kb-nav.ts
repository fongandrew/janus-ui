import { registerBehavior } from '../dispatch';

let installed = false;

function onKeyDown(ev: KeyboardEvent) {
	if (ev.key === 'Tab' || ev.key.startsWith('Arrow')) {
		document.body.setAttribute('data-v-kb-nav', 'true');
	}
}

function onMouseDown() {
	document.body.removeAttribute('data-v-kb-nav');
}

registerBehavior('t-kb-nav', {
	mount() {
		if (installed) return;
		installed = true;
		document.addEventListener('keydown', onKeyDown, true);
		document.addEventListener('mousedown', onMouseDown, true);
	},
});
