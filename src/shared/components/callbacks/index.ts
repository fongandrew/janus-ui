import '~/shared/components/callbacks/disabled';
import '~/shared/utility/callback-attrs/index';

import * as checkbox from '~/shared/components/callbacks/checkbox';
import * as codeBlock from '~/shared/components/callbacks/code-block';
import * as dropdown from '~/shared/components/callbacks/dropdown';
import * as errorFallback from '~/shared/components/callbacks/error-fallback';
import * as form from '~/shared/components/callbacks/form';
import * as img from '~/shared/components/callbacks/img';
import * as label from '~/shared/components/callbacks/label';
import * as listBox from '~/shared/components/callbacks/list-box';
import * as menu from '~/shared/components/callbacks/menu';
import * as modal from '~/shared/components/callbacks/modal';
import * as modalForm from '~/shared/components/callbacks/modal-form';
import * as optionList from '~/shared/components/callbacks/option-list';
import * as scroll from '~/shared/components/callbacks/scroll';
import * as select from '~/shared/components/callbacks/select';
import * as sidebar from '~/shared/components/callbacks/sidebar';
import * as slider from '~/shared/components/callbacks/slider';
import * as tabs from '~/shared/components/callbacks/tabs';
import * as toggle from '~/shared/components/callbacks/toggle';
import * as toggleSwitch from '~/shared/components/callbacks/toggle-switch';
import * as tooltip from '~/shared/components/callbacks/tooltip';
import * as topNav from '~/shared/components/callbacks/top-nav';
import { loadCallbacks } from '~/shared/utility/callback-attrs/load-callbacks';

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
