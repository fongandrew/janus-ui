import { expect, type Mock } from 'vitest';

const printCalls = (calls: any[][]) => calls.map((args) => `(${args.join(', ')})`).join(', ');

expect.extend({
	toHaveBeenCalledWithFirstArgs(received: Mock<any>, ...expectedArgs: any[]) {
		const calls = received.mock.calls;
		const pass = calls.some((callArgs) =>
			expectedArgs.every((expected, i) => expected === callArgs[i]),
		);

		return {
			pass,
			message: () =>
				pass
					? `expected mock function not to have been called with first args (${expectedArgs.join(', ')})\n` +
						`Received calls: ${printCalls(calls)}`
					: `expected mock function to have been called with first args (${expectedArgs.join(', ')})\n` +
						`Received calls: ${printCalls(calls)}`,
		};
	},
});
