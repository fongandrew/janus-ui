import { loadCallbacks } from '~/lib/utility/callback-attrs/load-callbacks';
import * as noJS from '~/lib/utility/callback-attrs/no-js';
import * as validation from '~/lib/utility/callback-attrs/validate';

loadCallbacks(noJS, validation);
