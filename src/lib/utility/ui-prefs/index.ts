import '~/lib/utility/ui-prefs/animation';
import '~/lib/utility/ui-prefs/color-scheme';
import '~/lib/utility/ui-prefs/font-size';
import '~/lib/utility/ui-prefs/font-family';

import { registerAttrPrefSetup } from '~/lib/utility/ui-prefs/ui-attr-prefs';
import { registerStylePrefSetup } from '~/lib/utility/ui-prefs/ui-style-prefs';

/** Register all setup functions -- this should be called after storage is setup */
export function initUIPrefs() {
	registerAttrPrefSetup();
	registerStylePrefSetup();
}
