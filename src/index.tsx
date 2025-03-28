import '~/shared/styles/index.css';

import { Components } from '~/components';
import { mountRoot } from '~/shared/utility/solid/mount-root';

function Main() {
	return <Components title="Janus UI" />;
}

mountRoot(Main);
