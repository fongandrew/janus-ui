export interface Partition<T> {
	/** A date in the month you can use for formatting */
	dateInMonth: Date;
	/** Count by days where an object has a given date */
	countsByDay: (number | undefined)[];
	/** Objects in month, sorted ascending */
	objects: T[];
}

export function partitionByMonth<T>(objects: T[], getTimeMs: (value: T) => number): Partition<T>[] {
	const sorted = objects
		.map((object) => [getTimeMs(object), object] as [number, T])
		.sort(([a], [b]) => a - b);

	const partitions: Partition<T>[] = [];
	let currentPartition: Partition<T> | undefined;

	for (const [timeMs, obj] of sorted) {
		const date = new Date(timeMs);
		if (
			currentPartition &&
			date.getFullYear() === currentPartition.dateInMonth.getFullYear() &&
			date.getMonth() === currentPartition.dateInMonth.getMonth()
		) {
			const currentCount = currentPartition.countsByDay[date.getDate() - 1] ?? 0;
			currentPartition.countsByDay[date.getDate() - 1] = currentCount + 1;
			currentPartition.objects.push(obj);
		} else {
			currentPartition = {
				dateInMonth: date,
				countsByDay: [],
				objects: [obj],
			};
			currentPartition.countsByDay[date.getDate() - 1] = 1;
			partitions.push(currentPartition);
		}
	}

	return partitions;
}
