import * as formOutput from '~/demos/callbacks/form-output';
import * as formSubmit from '~/demos/callbacks/form-submit';
import * as formValidationGroup from '~/demos/callbacks/form-validation-group';
import * as img from '~/demos/callbacks/img';
import * as input from '~/demos/callbacks/input';
import * as listBox from '~/demos/callbacks/list-box';
import * as menu from '~/demos/callbacks/menu';
import * as prefs from '~/demos/callbacks/prefs';
import * as select from '~/demos/callbacks/select';
import * as sidebar from '~/demos/callbacks/sidebar';
import { loadCallbacks } from '~/shared/utility/callback-attrs/load-callbacks';

loadCallbacks(
	formOutput,
	formSubmit,
	formValidationGroup,
	img,
	input,
	listBox,
	menu,
	prefs,
	select,
	sidebar,
);
