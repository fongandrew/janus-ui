import { createSignal } from 'solid-js';

import { Button } from '~/shared/components/button';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '~/shared/components/card';
import { Dropdown } from '~/shared/components/dropdown';
import { Menu, MenuGroup, MenuItem, MenuItemLink } from '~/shared/components/menu';

function MenuDemo() {
	const [selection, setSelection] = createSignal<string | null>(null);
	return (
		<Card>
			<CardHeader>
				<CardTitle>Menu</CardTitle>
				<CardDescription>Dropdown menu with groups and items</CardDescription>
			</CardHeader>
			<CardContent>
				<div class="o-stack">
					<output>Selected: {selection() ?? 'None'}</output>
					<div class="o-group">
						<Dropdown>
							{() => <Button>Simple Menu</Button>}
							{() => (
								<Menu onValue={setSelection}>
									<MenuItem value="a">Option A</MenuItem>
									<MenuItem value="b">Option B</MenuItem>
									<MenuItem value="c">Option C</MenuItem>
								</Menu>
							)}
						</Dropdown>

						<Dropdown>
							{() => <Button>Menu with Groups</Button>}
							{() => (
								<Menu onValue={setSelection}>
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
											Link to site
										</MenuItemLink>
									</MenuGroup>
								</Menu>
							)}
						</Dropdown>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}

export { MenuDemo };
