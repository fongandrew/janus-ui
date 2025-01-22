import { type Component, createSignal } from 'solid-js';

import { Button } from '~/shared/components/button';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '~/shared/components/card';
import { Description } from '~/shared/components/description';
import { Dropdown } from '~/shared/components/dropdown';
import { Group } from '~/shared/components/group';
import { Menu, MenuGroup, MenuItem, MenuItemLink } from '~/shared/components/menu';
import { Stack } from '~/shared/components/stack';

const MenuDemo: Component = () => {
	const [selection, setSelection] = createSignal<string | null>(null);
	return (
		<Card>
			<CardHeader>
				<CardTitle>Menu</CardTitle>
				<CardDescription>Dropdown menu with groups and items</CardDescription>
			</CardHeader>
			<CardContent>
				<Stack class="gap-xs">
					<Description>Selected: {selection() ?? 'None'}</Description>
					<Group>
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
										<MenuItem value="new">New File</MenuItem>
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
											Show Sidebar
										</MenuItem>
										<MenuItem role="menuitemcheckbox" value="status">
											Show Status Bar
										</MenuItem>
									</MenuGroup>
									<MenuGroup>
										<MenuItemLink href="https://example.com">
											Link to Site
										</MenuItemLink>
									</MenuGroup>
								</Menu>
							)}
						</Dropdown>
					</Group>
				</Stack>
			</CardContent>
		</Card>
	);
};

export { MenuDemo };
