import '~/shared/components/callbacks/disabled';

import * as comboBox from '~/shared/components/callbacks/combo-box';
import * as dropdown from '~/shared/components/callbacks/dropdown';
import * as form from '~/shared/components/callbacks/form';
import * as label from '~/shared/components/callbacks/label';
import * as listBox from '~/shared/components/callbacks/list-box';
import * as menu from '~/shared/components/callbacks/menu';
import * as modal from '~/shared/components/callbacks/modal';
import * as modalForm from '~/shared/components/callbacks/modal-form';
import * as optionList from '~/shared/components/callbacks/option-list';
import * as scroll from '~/shared/components/callbacks/scroll';
import * as select from '~/shared/components/callbacks/select';
import * as sidebar from '~/shared/components/callbacks/sidebar';
import * as tabs from '~/shared/components/callbacks/tabs';
import * as toggle from '~/shared/components/callbacks/toggle';
import * as toggleSwitch from '~/shared/components/callbacks/toggle-switch';
import * as tooltip from '~/shared/components/callbacks/tooltip';
import * as topNav from '~/shared/components/callbacks/top-nav';
import { loadCallbacks } from '~/shared/utility/callback-attrs/callback-registry';
import { processRoot } from '~/shared/utility/callback-attrs/mount';
import * as validation from '~/shared/utility/callback-attrs/validate';
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
