/**
 * Standalone script code (no framework) for interactivity in SSR demos
 */
import '~/shared/callback-attrs/index';

import { asyncFormSSRSubmit } from '~/demos/callbacks/async-form-ssr';
import { formOutputClear, formOutputWrite } from '~/demos/callbacks/form-output';
import { matchesPassword } from '~/demos/callbacks/form-validation-group-ssr';

// Call callbacks to register
asyncFormSSRSubmit();
formOutputClear();
formOutputWrite();
matchesPassword();
