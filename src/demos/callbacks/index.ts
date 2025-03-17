import * as asyncForm from '~/demos/callbacks/async-form';
import * as formOutput from '~/demos/callbacks/form-output';
import * as formValidationGroup from '~/demos/callbacks/form-validation-group';
import * as listBox from '~/demos/callbacks/list-box';
import * as menu from '~/demos/callbacks/menu';
import * as select from '~/demos/callbacks/select';
import { loadCallbacks } from '~/shared/utility/callback-attrs/load-callbacks';

loadCallbacks(asyncForm, formOutput, formValidationGroup, listBox, menu, select);
