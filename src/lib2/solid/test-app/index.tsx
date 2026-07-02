/**
 * Client entry for the Solid test app (v2-solid.html) — Pattern A (§12.4):
 * import every handler, render the app, then mount() the behavior system.
 */
import '~/lib2/css/index.css';
import '~/lib2/dom/all';

import { render } from 'solid-js/web';

import { mount } from '~/lib2/dom';
import { App } from '~/lib2/solid/test-app/app';

// eslint-disable-next-line no-restricted-globals -- client-only entry; no SSR here
const root = document.getElementById('root');
if (root) {
	render(() => <App />, root);
	mount();
}
