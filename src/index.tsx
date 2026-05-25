import { render } from 'solid-js/web';

import '~/lib/dom/all';
import { mount } from '~/lib/dom';
import { App } from '~/demos/app';

mount();

const root = document.getElementById('app');
if (root) {
	render(() => <App />, root);
}
