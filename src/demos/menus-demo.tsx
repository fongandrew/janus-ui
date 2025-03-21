import { createSignal, createUniqueId } from 'solid-js';
import { isServer } from 'solid-js/web';

import { menuUpdateText } from '~/demos/callbacks/menu';
import { Button } from '~/shared/components/button';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '~/shared/components/card';
import { Menu, MenuGroup, MenuItem, MenuItemLink, MenuTrigger } from '~/shared/components/menu';
import { callbackAttrs } from '~/shared/utility/callback-attrs/callback-registry';

function MenusDemo() {
	const [selection, setSelection] = createSignal<string | null>(null);
	const outputId = createUniqueId();

	return (
		<Card id="menus-demo">
			<CardHeader>
				<CardTitle>Menu</CardTitle>
				<CardDescription>Dropdown menu with groups and items</CardDescription>
			</CardHeader>
			<CardContent>
				<div class="o-stack">
					<output id={outputId}>Selected: {selection() ?? 'None'}</output>
					<div class="o-group">
						<MenuTrigger>
							<Button>Simple Menu</Button>
							<Menu
								onValue={setSelection}
								{...callbackAttrs(isServer && menuUpdateText(outputId))}
							>
								<MenuItem value="a">Option A</MenuItem>
								<MenuItem value="b">Option B</MenuItem>
								<MenuItem value="c">Option C</MenuItem>
							</Menu>
						</MenuTrigger>

						<MenuTrigger>
							<Button>Menu with Groups</Button>
							<Menu
								onValue={setSelection}
								{...callbackAttrs(isServer && menuUpdateText(outputId))}
							>
								<MenuGroup heading="File">
									<MenuItem value="new">New file</MenuItem>
									<MenuItem value="open">Open...</MenuItem>
									<MenuItem value="save">Save</MenuItem>
								</MenuGroup>
								<MenuGroup heading="Edit">
									<MenuItem value="cut">Cut</MenuItem>
									<MenuItem value="copy">Copy</MenuItem>
									<MenuItem value="paste">Paste</MenuItem>
								</MenuGroup>
								<MenuGroup>
									<MenuItem role="menuitemcheckbox" value="sidebar">
										Show sidebar
									</MenuItem>
									<MenuItem role="menuitemcheckbox" value="status">
										Show status bar
									</MenuItem>
								</MenuGroup>
								<MenuGroup>
									<MenuItemLink href="https://example.com">
										Link to site and let's give this a really long label to see
										how it wraps and here's a long unbreakable string:
										abcdefghijklmnopqrstuvwxyz0123456789abcdefghijklmnopqrstuvwxyz0123456789abcdefghijklmnopqrstuvwxyz0123456789
									</MenuItemLink>
								</MenuGroup>
							</Menu>
						</MenuTrigger>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}

export { MenusDemo };
