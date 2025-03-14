import { loadCallbacks } from '~/shared/utility/callback-attrs/load-callbacks';
import * as noJS from '~/shared/utility/callback-attrs/no-js';
import * as validation from '~/shared/utility/callback-attrs/validate';

loadCallbacks(noJS, validation);
