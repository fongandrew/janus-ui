import '~/lib/components/callbacks/disabled';
import '~/lib/utility/callback-attrs/index';

import * as checkbox from '~/lib/components/callbacks/checkbox';
import * as codeBlock from '~/lib/components/callbacks/code-block';
import * as dropdown from '~/lib/components/callbacks/dropdown';
import * as errorFallback from '~/lib/components/callbacks/error-fallback';
import * as form from '~/lib/components/callbacks/form';
import * as img from '~/lib/components/callbacks/img';
import * as label from '~/lib/components/callbacks/label';
import * as listBox from '~/lib/components/callbacks/list-box';
import * as menu from '~/lib/components/callbacks/menu';
import * as modal from '~/lib/components/callbacks/modal';
import * as modalForm from '~/lib/components/callbacks/modal-form';
import * as optionList from '~/lib/components/callbacks/option-list';
import * as placeholder from '~/lib/components/callbacks/placeholder';
import * as scroll from '~/lib/components/callbacks/scroll';
import * as select from '~/lib/components/callbacks/select';
import * as sidebar from '~/lib/components/callbacks/sidebar';
import * as slider from '~/lib/components/callbacks/slider';
import * as tabs from '~/lib/components/callbacks/tabs';
import * as toggle from '~/lib/components/callbacks/toggle';
import * as toggleSwitch from '~/lib/components/callbacks/toggle-switch';
import * as tooltip from '~/lib/components/callbacks/tooltip';
import * as topNav from '~/lib/components/callbacks/top-nav';
import { loadCallbacks } from '~/lib/utility/callback-attrs/load-callbacks';

loadCallbacks(
	checkbox,
	codeBlock,
	dropdown,
	errorFallback,
	form,
	img,
	label,
	listBox,
	menu,
	modal,
	modalForm,
	optionList,
	placeholder,
	scroll,
	select,
	sidebar,
	slider,
	tabs,
	toggle,
	toggleSwitch,
	tooltip,
	topNav,
);
