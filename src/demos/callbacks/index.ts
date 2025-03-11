import { asyncFormSSRSubmit } from '~/demos/callbacks/async-form-ssr';
import { formOutputClear, formOutputWrite } from '~/demos/callbacks/form-output';
import { matchesPassword } from '~/demos/callbacks/form-validation-group-ssr';
import { listBoxMinMax, listBoxNoRed } from '~/demos/callbacks/list-box';

// Call callbacks to register
asyncFormSSRSubmit();
formOutputClear();
formOutputWrite();
matchesPassword();
listBoxMinMax();
listBoxNoRed();
