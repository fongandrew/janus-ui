import * as asyncForm from '~/demos/callbacks/async-form';
import * as formOutput from '~/demos/callbacks/form-output';
import * as formValidationGroup from '~/demos/callbacks/form-validation-group';
import * as listBox from '~/demos/callbacks/list-box';
import { loadCallbacks } from '~/shared/utility/callback-attrs/callback-registry';

loadCallbacks(asyncForm, formOutput, formValidationGroup, listBox);
