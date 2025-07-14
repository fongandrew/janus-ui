import '~/lib/styles/index.css';

import { Components } from '~/components';
import { mountRoot } from '~/lib/utility/solid/mount-root';
import { initUIPrefs } from '~/lib/utility/ui-prefs';

initUIPrefs();

function Main() {
	return <Components title="Janus UI" />;
}

mountRoot(Main);
