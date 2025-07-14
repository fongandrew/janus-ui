/**
 * Returns true if two dates (or millisecond timestamps) are on the same date
 * (as determiend by the local timezone).
 */
export function sameDate(a: Date | number, b: Date | number): boolean {
	const dateA = new Date(a);
	const dateB = new Date(b);
	return (
		dateA.getFullYear() === dateB.getFullYear() &&
		dateA.getMonth() === dateB.getMonth() &&
		dateA.getDate() === dateB.getDate()
	);
}

/**
 * Is the specified date (or millisecond timestamp) set to today
 * (as determined by the local timezone).
 */
export function isToday(date: Date | number): boolean {
	return sameDate(date, Date.now());
}

/**
 * Returns true if two dates (or millisecond timestamps) have the same year
 */
export function sameYear(a: Date | number, b: Date | number): boolean {
	const dateA = new Date(a);
	const dateB = new Date(b);
	return dateA.getFullYear() === dateB.getFullYear();
}

/**
 * Returns true if specified date (or millisecond timestamp) is in the current year
 */
export function isThisYear(date: Date | number): boolean {
	return sameYear(date, Date.now());
}
