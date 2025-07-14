import { describe, expect, it } from 'vitest';

import { partitionByMonth } from '~/lib/utility/datetime/partition-by-month';

describe('partitionByMonth', () => {
	// Test interface for our mock data
	interface TestObject {
		id: number;
		timestamp: number;
	}

	const getTimeMs = (obj: TestObject) => obj.timestamp;

	it('should partition objects into months correctly', () => {
		// Create test data spanning multiple months
		const objects: TestObject[] = [
			{ id: 1, timestamp: new Date(2023, 0, 15).getTime() }, // Jan 15, 2023
			{ id: 2, timestamp: new Date(2023, 0, 20).getTime() }, // Jan 20, 2023
			{ id: 3, timestamp: new Date(2023, 1, 5).getTime() }, // Feb 5, 2023
			{ id: 4, timestamp: new Date(2023, 2, 10).getTime() }, // Mar 10, 2023
			{ id: 5, timestamp: new Date(2023, 2, 10).getTime() }, // Mar 10, 2023 (same day)
			{ id: 6, timestamp: new Date(2023, 2, 15).getTime() }, // Mar 15, 2023
		];

		const result = partitionByMonth(objects, getTimeMs);

		// Should have 3 partitions (Jan, Feb, Mar)
		expect(result.length).toBe(3);

		// Check first partition (January)
		const janPartition = result[0]!;
		expect(janPartition).toBeDefined();
		expect(janPartition.dateInMonth.getMonth()).toBe(0);
		expect(janPartition.dateInMonth.getFullYear()).toBe(2023);
		expect(janPartition.objects.length).toBe(2);
		expect(janPartition.objects[0]!.id).toBe(1);
		expect(janPartition.objects[1]!.id).toBe(2);
		expect(janPartition.countsByDay[14]).toBe(1); // Jan 15
		expect(janPartition.countsByDay[19]).toBe(1); // Jan 20

		// Check second partition (February)
		const febPartition = result[1]!;
		expect(febPartition).toBeDefined();
		expect(febPartition.dateInMonth.getMonth()).toBe(1);
		expect(febPartition.dateInMonth.getFullYear()).toBe(2023);
		expect(febPartition.objects.length).toBe(1);
		expect(febPartition.objects[0]!.id).toBe(3);
		expect(febPartition.countsByDay[4]).toBe(1); // Feb 5

		// Check third partition (March)
		const marPartition = result[2]!;
		expect(marPartition).toBeDefined();
		expect(marPartition.dateInMonth.getMonth()).toBe(2);
		expect(marPartition.dateInMonth.getFullYear()).toBe(2023);
		expect(marPartition.objects.length).toBe(3);
		expect(marPartition.objects[0]!.id).toBe(4);
		expect(marPartition.objects[1]!.id).toBe(5);
		expect(marPartition.objects[2]!.id).toBe(6);
		expect(marPartition.countsByDay[9]).toBe(2); // Mar 10 (two events)
		expect(marPartition.countsByDay[14]).toBe(1); // Mar 15
	});

	it('should handle empty input array', () => {
		const result = partitionByMonth<TestObject>([], getTimeMs);
		expect(result).toEqual([]);
	});

	it('should sort objects by timestamp within each partition', () => {
		const objects: TestObject[] = [
			{ id: 2, timestamp: new Date(2023, 0, 20).getTime() }, // Jan 20 (added out of order)
			{ id: 1, timestamp: new Date(2023, 0, 15).getTime() }, // Jan 15
			{ id: 4, timestamp: new Date(2023, 0, 25).getTime() }, // Jan 25
			{ id: 3, timestamp: new Date(2023, 0, 22).getTime() }, // Jan 22
		];

		const result = partitionByMonth(objects, getTimeMs);

		// Should have 1 partition
		expect(result.length).toBe(1);

		// Objects should be sorted by timestamp
		const janPartition = result[0]!;
		expect(janPartition).toBeDefined();
		expect(janPartition.objects.map((o) => o.id)).toEqual([1, 2, 3, 4]);
	});

	it('should handle objects spanning multiple years', () => {
		const objects: TestObject[] = [
			{ id: 1, timestamp: new Date(2022, 11, 31).getTime() }, // Dec 31, 2022
			{ id: 2, timestamp: new Date(2023, 0, 1).getTime() }, // Jan 1, 2023
		];

		const result = partitionByMonth(objects, getTimeMs);

		expect(result.length).toBe(2);

		const decPartition = result[0]!;
		const janPartition = result[1]!;

		expect(decPartition).toBeDefined();
		expect(decPartition.dateInMonth.getFullYear()).toBe(2022);
		expect(decPartition.dateInMonth.getMonth()).toBe(11); // December

		expect(janPartition).toBeDefined();
		expect(janPartition.dateInMonth.getFullYear()).toBe(2023);
		expect(janPartition.dateInMonth.getMonth()).toBe(0); // January
	});
});
