import '~/shared/callback-attrs/disabled';

import * as comboBox from '~/shared/callback-attrs/combo-box';
import * as dropdown from '~/shared/callback-attrs/dropdown';
import * as form from '~/shared/callback-attrs/form';
import * as label from '~/shared/callback-attrs/label';
import * as listBox from '~/shared/callback-attrs/list-box';
import * as menu from '~/shared/callback-attrs/menu';
import * as modal from '~/shared/callback-attrs/modal';
import * as modalForm from '~/shared/callback-attrs/modal-form';
import * as optionList from '~/shared/callback-attrs/option-list';
import * as scroll from '~/shared/callback-attrs/scroll';
import * as select from '~/shared/callback-attrs/select';
import * as sidebar from '~/shared/callback-attrs/sidebar';
import * as tabs from '~/shared/callback-attrs/tabs';
import * as toggle from '~/shared/callback-attrs/toggle';
import * as toggleSwitch from '~/shared/callback-attrs/toggle-switch';
import * as tooltip from '~/shared/callback-attrs/tooltip';
import * as topNav from '~/shared/callback-attrs/top-nav';
import * as validation from '~/shared/callback-attrs/validation';
import { loadCallbacks } from '~/shared/utility/callback-attrs/callback-registry';
import { processRoot } from '~/shared/utility/callback-attrs/mount';
import { registerDocumentSetup } from '~/shared/utility/document-setup';

loadCallbacks(
	comboBox,
	dropdown,
	form,
	label,
	listBox,
	menu,
	modal,
	modalForm,
	optionList,
	scroll,
	select,
	sidebar,
	tabs,
	toggle,
	toggleSwitch,
	tooltip,
	topNav,
	validation,
);

registerDocumentSetup((document) => {
	const window = document.defaultView;
	if (!window) return;
	document.addEventListener('DOMContentLoaded', () => processRoot(window));
});
