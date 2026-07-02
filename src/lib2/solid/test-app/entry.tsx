/**
 * Client entry for the Solid test app. Pattern A: import every DOM behavior
 * handler, render the app, then `mount()` to wire the `data-js` behaviors onto
 * the rendered markup (client-side render — hydration is a stretch goal).
 */
import '~/lib2/dom/all';

import { render } from 'solid-js/web';

import { mount } from '~/lib2/dom';
import { App } from '~/lib2/solid/test-app/app';

const root = document.getElementById('root');
if (root) {
	render(() => <App />, root);
	mount();
}
