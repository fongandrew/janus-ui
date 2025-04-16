# Janus UI Components

This directory contains reusable UI components built with SolidJS. This README serves as a guide for using these components, with a focus on helping LLMs understand when and how to use each component correctly.

## Core Components

This list is not comprehensive.

### Alerts

```tsx
import { DangerAlert } from '~/shared/components/alert';

<DangerAlert>An error occurred while processing your request</DangerAlert>
```

### Buttons

```tsx
import { Button, GhostButton, IconButton, LinkButton } from '~/shared/components/button';

// Standard button with optional icon
<Button>Default Button</Button>
<Button class="v-colors-primary">Primary</Button>
<Button class="v-colors-danger">Danger</Button>
<Button disabled>Disabled</Button>

// Button with icon
<Button label="Settings">
  <Settings />
</Button>

// Transparent button with no border
<GhostButton>Ghost</GhostButton>

// Button styled as link
<LinkButton>Link</LinkButton>
```

### Cards

```tsx
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '~/shared/components/card';

<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Optional description text</CardDescription>
  </CardHeader>
  <CardContent>
    {/* Card content goes here */}
  </CardContent>
  <CardFooter>
    {/* Footer content, often buttons */}
  </CardFooter>
</Card>
```

### Forms and Inputs

```tsx
import { Form } from '~/shared/components/form';
import { FormContextProvider } from '~/shared/components/form-context';
import { Input } from '~/shared/components/input';
import { Textarea } from '~/shared/components/textarea';
import { Checkbox } from '~/shared/components/checkbox';
import { ResetButton, SubmitButton } from '~/shared/components/form-buttons';
import { Label } from '~/shared/components/label';
import { LabelledInput, LabelledInline } from '~/shared/components/labelled-control';

// Form setup with named fields
const FormNames = {
  email: 'email',
  message: 'message',
  terms: 'terms',
};

// Form with async submission
<Form
names={FormNames}
onSubmit={handleSubmit}
data-testid="contact-form"
>
<LabelledInput label="Email" required>
	<Input
	name={FormNames.email}
	type="email"
	autocomplete="email"
	/>
</LabelledInput>

<LabelledInput label="Message">
	<Textarea
	name={FormNames.message}
	/>
</LabelledInput>

<LabelledInline label="Accept terms">
	<Checkbox
	name={FormNames.terms}
	required
	/>
</LabelledInline>

<div class="o-group">
	<ResetButton />
	<SubmitButton />
</div>
</Form>
```

### Labelled Actions

```tsx
import { LabelledAction, LabelledActionCard } from '~/shared/components/labelled-action';
import { Button } from '~/shared/components/button';
import { ToggleSwitch } from '~/shared/components/toggle-switch';

// Basic labelled action with button
<LabelledAction
  label="Delete account"
  description="This action cannot be undone"
>
  <Button class="v-colors-danger">Delete</Button>
</LabelledAction>

// With toggle switch
<LabelledAction
  label="Dark mode"
  description="Use dark colors for UI elements"
>
  <ToggleSwitch checked={isDarkMode()} onChange={toggleDarkMode} />
</LabelledAction>
```

### Menus (Dropdowns)

```tsx
import { Button } from '~/shared/components/button';
import { Menu, MenuItem, MenuTrigger } from '~/shared/components/menu';

<MenuTrigger>
  <Button>Open Menu</Button>
  <Menu onValue={(value) => console.log(`Selected: ${value}`)}>
    <MenuItem value="option1">Option 1</MenuItem>
    <MenuItem value="option2">Option 2</MenuItem>
    <MenuItem value="option3">Option 3</MenuItem>
  </Menu>
</MenuTrigger>
```

### Modal Dialogs

```tsx
import { Modal, ModalContent, ModalFooter, ModalHeader, ModalOpenTrigger } from '~/shared/components/modal';
import { Button } from '~/shared/components/button';

const dialogId = createUniqueId();

<ModalOpenTrigger targetId={dialogId}>
  <Button>Open Modal</Button>
</ModalOpenTrigger>

<Modal
  isOpen={isOpen()}
  onClose={() => setIsOpen(false)}
  title="Modal Title"
>
  <ModalHeader>Modal Header Content</ModalHeader>
  <ModalContent>Modal body content goes here</ModalContent>
  <ModalFooter>
    <Button onClick={() => setIsOpen(false)}>Close</Button>
  </ModalFooter>
</Modal>
```

### Select

```tsx
import { Select, SelectOption } from '~/shared/components/select';
import { LabelledInput } from '~/shared/components/labelled-control';

<LabelledInput label="Choose an option">
  <Select name="selection">
    <SelectOption value="option1">Option 1</SelectOption>
    <SelectOption value="option2">Option 2</SelectOption>
    <SelectOption value="option3">Option 3</SelectOption>
  </Select>
</LabelledInput>
```

### Tabs

```tsx
import { Tabs, TabList, TabPanel } from '~/shared/components/tabs';

<Tabs>
  <TabList>
    <li>Tab 1</li>
    <li>Tab 2</li>
    <li>Tab 3</li>
  </TabList>
  <TabPanel>Content for Tab 1</TabPanel>
  <TabPanel>Content for Tab 2</TabPanel>
  <TabPanel>Content for Tab 3</TabPanel>
</Tabs>
```

### Tooltips

```tsx
import { Tooltip } from '~/shared/components/tooltip';
import { Button } from '~/shared/components/button';
import { Trash } from 'lucide-solid';

// Basic tooltip
<Tooltip tip="This is helpful information">
  <Button>Hover me</Button>
</Tooltip>
```

## Layout Components

We provide two larger layout components:
* `sidebar-layout.tsx` - Components for a simple responsive left sidebar
* `top-nav-layout.tsx` - Components for a responsive top nav that hides when scrolling. Can be combined with sidebar.

## CSS Layout Objects

This library also provides CSS utility classes for common layout patterns. Use these instead of creating components when simple layout is all that's needed.

### Stack Layout (Vertical)

Use the `o-stack` class for vertical stacking of elements with consistent spacing:

```tsx
<div class="o-stack">
  <div>First item</div>
  <div>Second item</div>
  <div>Third item</div>
</div>
```

### Group Layout (Horizontal)

Use the `o-group` class for horizontal arrangement of elements:

```tsx
<div class="o-group">
  <Button>First button</Button>
  <Button>Second button</Button>
  <Button>Third button</Button>
</div>
```

### Box Layout (Padding Container)

Use the `o-box` class for consistent padding:

```tsx
<div class="o-box">
  Content with standard padding
</div>

<div class="o-text-box">
  Text content with adjusted vertical padding
</div>

<div role="button" class="o-input-box" onClick={doAction}>
  Text box meant to match height and spacing of an input element
</div>

// o-input-container-box can be used to wrap GhostButtons to give appearance of
// even spacing based on text
<div class="o-input-container-box ">
  <GhostButton>Button</GhostButton>
</div>
```

### Badge

Use the `o-badge` class for status indicators or counts:

```tsx
<span class="o-badge">New</span>
<span class="o-badge v-colors-primary">5</span>
<span class="o-badge v-colors-danger">Alert</span>
```

## Best Practices

1. Always use the `LabelledInput` or `LabelledInline` components for form fields to ensure proper accessibility.
2. Use color utility classes like `v-colors-primary` to change component colors, rather than custom CSS.
3. Use layout objects (`o-stack`, `o-group`, etc.) for layout rather than creating custom flex containers.
4. For buttons, prefer semantic variants (`Button`, `GhostButton`, etc.) over custom styling.
5. For actions with explanatory text, use `LabelledAction` rather than creating custom layouts.
