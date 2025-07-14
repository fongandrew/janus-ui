export interface TimeWindow {
	start: string; // 24-hour format, e.g., "09:30"
	end: string; // 24-hour format, e.g., "15:23"
}

export type TimeDecoded = [number, number]; // [hours, minutes]

export function decodeTimeStrToTuple(timeStr: string): TimeDecoded {
	const timeParts = timeStr.split(':').slice(0, 2);
	const [hours, minutes] = timeParts.map(Number);
	if (
		typeof hours !== 'number' ||
		isNaN(hours) ||
		typeof minutes !== 'number' ||
		isNaN(minutes) ||
		hours < 0 ||
		hours > 23 ||
		minutes < 0 ||
		minutes > 59
	) {
		throw new Error(`Invalid time string: ${timeStr}`);
	}
	return [hours, minutes];
}

export function decodeTimeStrToMinutes(timeStr: string): number {
	const [hours, minutes] = decodeTimeStrToTuple(timeStr);
	return hours * 60 + minutes;
}

export function encodeTimestampToTimeStr(timestampSeconds: number): string {
	const date = new Date(timestampSeconds * 1000);
	const hours = date.getHours().toString().padStart(2, '0');
	const minutes = date.getMinutes().toString().padStart(2, '0');
	return `${hours}:${minutes}`;
}

/**
 * Given two minutes since midnight, returns how many minutes later the latter is than
 * the former, with support for wrapping around midnight.
 */
export function deltaMinutes(from: string | number, to: string | number): number {
	const fromMinutes = typeof from === 'string' ? decodeTimeStrToMinutes(from) : from;
	const toMinutes = typeof to === 'string' ? decodeTimeStrToMinutes(to) : to;
	return (toMinutes - fromMinutes + 1440) % 1440; // Mod to wrap around midnight
}

/**
 * Get the next occurrence of a specific time given the current time.
 * Handles midnight rollover appropriately.
 * @param timeStr The target time in 24-hour format (e.g., "09:30")
 * @param currentTimeMs The current time in milliseconds since epoch
 * @returns The next occurrence of the target time in milliseconds since epoch
 */
export function getNextTimeOccurrence(timeStr: string, currentTimeMs = Date.now() / 1000): number {
	const currentDate = new Date(currentTimeMs);
	const [targetHours, targetMinutes] = decodeTimeStrToTuple(timeStr);

	// Create a new date for today with the target time
	const targetDate = new Date(currentDate);
	targetDate.setHours(targetHours, targetMinutes, 0, 0);

	// If the target time has already passed today, move to tomorrow
	if (targetDate.getTime() <= currentDate.getTime()) {
		targetDate.setDate(targetDate.getDate() + 1);
	}

	return targetDate.getTime();
}

/**
 * Check if a given time is within a given time window. Handles windows
 * that cross midnight.
 * @param time The time to check in 24-hour format (e.g., "09:30")
 * @param window The time window to check against
 * @param preBuffer Number of minutes to extend the window before the start time
 * @param postBuffer Number of minutes to extend the window after the end time
 */
export function isTimeInWindow(
	time: string,
	{ start, end }: TimeWindow,
	preBuffer = 0,
	postBuffer = 0,
): boolean {
	const startTotalMinutes = decodeTimeStrToMinutes(start);
	const endTotalMinutes = decodeTimeStrToMinutes(end);
	const timeTotalMinutes = decodeTimeStrToMinutes(time);

	// Apply buffers
	const bufferedStartMinutes = (startTotalMinutes - preBuffer + 1440) % 1440;
	const bufferedEndMinutes = (endTotalMinutes + postBuffer) % 1440;

	// Handle edge case where the window covers the full day with buffers
	const originalSize =
		startTotalMinutes <= endTotalMinutes
			? endTotalMinutes - startTotalMinutes
			: endTotalMinutes + 60 * 24 - startTotalMinutes;
	const bufferedSize = originalSize + preBuffer + postBuffer;
	if (bufferedSize >= 60 * 24) {
		return true;
	}

	if (bufferedStartMinutes <= bufferedEndMinutes) {
		// Window does not cross midnight
		return timeTotalMinutes >= bufferedStartMinutes && timeTotalMinutes <= bufferedEndMinutes;
	} else {
		// Window crosses midnight
		return timeTotalMinutes >= bufferedStartMinutes || timeTotalMinutes <= bufferedEndMinutes;
	}
}
