/**
 * Public API for the Solid layer (§13). Thin wrappers mapping props → DOM + the
 * `data-js` behavior tokens of `~/lib2/dom`.
 */
export { Alert, type AlertProps } from '~/lib2/solid/alert';
export { ariaize, attrs } from '~/lib2/solid/aria';
export { Avatar, type AvatarProps } from '~/lib2/solid/avatar';
export { Badge, type BadgeProps } from '~/lib2/solid/badge';
export {
	Button,
	type ButtonProps,
	type ButtonVariant,
	IconButton,
	type IconButtonProps,
} from '~/lib2/solid/button';
export {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	type CardProps,
	type CardSurface,
	CardTitle,
} from '~/lib2/solid/card';
export { Checkbox, type CheckboxProps } from '~/lib2/solid/checkbox';
export { Disclosure, type DisclosureProps } from '~/lib2/solid/disclosure';
export { Drawer, type DrawerProps, type DrawerSide } from '~/lib2/solid/drawer';
export {
	Form,
	FormContext,
	FormError,
	FormGroup,
	type FormProps,
	SubmitButton,
} from '~/lib2/solid/form';
export { Input, type InputProps } from '~/lib2/solid/input';
export {
	LabelledInline,
	LabelledInput,
	LabelledInputGroup,
	type LabelledInputGroupProps,
	type LabelledInputProps,
} from '~/lib2/solid/labelled-input';
export { Menu, MenuItem, type MenuItemProps, type MenuProps } from '~/lib2/solid/menu';
export {
	Modal,
	ModalBody,
	ModalFooter,
	ModalHeader,
	type ModalProps,
	type ModalWidth,
} from '~/lib2/solid/modal';
export {
	ModalForm,
	type ModalFormProps,
	ModalSpeedBump,
	type ModalSpeedBumpProps,
} from '~/lib2/solid/modal-form';
export { Password, type PasswordProps } from '~/lib2/solid/password';
export { Popover, type PopoverProps } from '~/lib2/solid/popover';
export { Radio, RadioGroup, type RadioGroupProps, type RadioProps } from '~/lib2/solid/radio';
export {
	SelectNative,
	type SelectNativeProps,
	type SelectOption,
} from '~/lib2/solid/select-native';
export { Skeleton, type SkeletonProps } from '~/lib2/solid/skeleton';
export { Spinner, type SpinnerProps } from '~/lib2/solid/spinner';
export {
	StyledSelect,
	type StyledSelectOption,
	type StyledSelectProps,
} from '~/lib2/solid/styled-select';
export { Tab, TabList, TabPanel, type TabPanelProps, type TabProps, Tabs } from '~/lib2/solid/tabs';
export { Tag, type TagProps } from '~/lib2/solid/tag';
export { Textarea, type TextareaProps } from '~/lib2/solid/textarea';
export { Toggle, type ToggleProps } from '~/lib2/solid/toggle';
export { Tooltip, type TooltipProps } from '~/lib2/solid/tooltip';
export {
	useLabelledInput,
	type UseLabelledInputOptions,
	type UseLabelledInputResult,
} from '~/lib2/solid/use-labelled-input';
