import cx from 'classix';

/**
 * Given an attribute list that is a space separated list of items (like ARIA ID lists
 * or class names), this adds or removes the given items from the list. This is just
 * a wrapper around classix (renamed to bypass linter assumptions about classnames)
 */
export const attrs = cx;
