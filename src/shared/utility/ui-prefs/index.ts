import '~/shared/utility/ui-prefs/animation';
import '~/shared/utility/ui-prefs/color-scheme';
import '~/shared/utility/ui-prefs/font-size';
import '~/shared/utility/ui-prefs/font-family';

import { registerAttrPrefSetup } from '~/shared/utility/ui-prefs/ui-attr-prefs';
import { registerStylePrefSetup } from '~/shared/utility/ui-prefs/ui-style-prefs';

/** Register all setup functions -- this should be called after storage is setup */
export function initUIPrefs() {
	registerAttrPrefSetup();
	registerStylePrefSetup();
}
