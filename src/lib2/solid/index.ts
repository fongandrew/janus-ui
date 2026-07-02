/**
 * Public API for the Solid layer (§13). Thin wrappers around `css/` + `dom/`.
 * Named exports only — no default exports. `utils/` stays internal.
 */

// Framework-boundary helpers + labelling core.
export * from '~/lib2/solid/aria';
export * from '~/lib2/solid/labelled-input';
export * from '~/lib2/solid/use-labelled-input';

// Form components (§13.5–13.6).
export * from '~/lib2/solid/form';
export * from '~/lib2/solid/modal-form';

// Pure CSS component wrappers (§10.1).
export * from '~/lib2/solid/alert';
export * from '~/lib2/solid/avatar';
export * from '~/lib2/solid/badge';
export * from '~/lib2/solid/button';
export * from '~/lib2/solid/card';
export * from '~/lib2/solid/checkbox';
export * from '~/lib2/solid/disclosure';
export * from '~/lib2/solid/input';
export * from '~/lib2/solid/radio';
export * from '~/lib2/solid/select-native';
export * from '~/lib2/solid/skeleton';
export * from '~/lib2/solid/spinner';
export * from '~/lib2/solid/table';
export * from '~/lib2/solid/tag';
export * from '~/lib2/solid/textarea';
export * from '~/lib2/solid/toggle';
export * from '~/lib2/solid/tooltip';

// Browser-primitive component wrappers (§10.2).
export * from '~/lib2/solid/drawer';
export * from '~/lib2/solid/menu';
export * from '~/lib2/solid/modal';
export * from '~/lib2/solid/popover';
export * from '~/lib2/solid/tabs';

// Composite (§10.3) + utility components.
export * from '~/lib2/solid/password';
export * from '~/lib2/solid/styled-select';
