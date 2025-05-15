import '~/shared/styles/index.css';

import { Components } from '~/components';
import { mountRoot } from '~/shared/utility/solid/mount-root';
import { initUIPrefs } from '~/shared/utility/ui-prefs';

initUIPrefs();

function Main() {
	return <Components title="Janus UI" />;
}

mountRoot(Main);
