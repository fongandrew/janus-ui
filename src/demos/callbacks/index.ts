import { asyncFormSubmit } from '~/demos/callbacks/async-form';
import { formOutputClear, formOutputWrite } from '~/demos/callbacks/form-output';
import { matchesPassword } from '~/demos/callbacks/form-validation-group';
import { listBoxMinMax, listBoxNoRed } from '~/demos/callbacks/list-box';

// Call callbacks to register
asyncFormSubmit();
formOutputClear();
formOutputWrite();
matchesPassword();
listBoxMinMax();
listBoxNoRed();
