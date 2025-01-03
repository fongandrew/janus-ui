export interface Deferred<T> extends Promise<T> {
	resolve(value: T): void;
	reject(error: Error): void;
	status(): 'pending' | 'resolved' | 'rejected';
}

export function createDeferred<T>() {
	let resolve: (value: T) => void;
	let reject: (error: Error) => void;
	const promise = new Promise<T>((_resolve, _reject) => {
		resolve = _resolve;
		reject = _reject;
	});

	let status: 'pending' | 'resolved' | 'rejected' = 'pending';
	(promise as Deferred<T>).resolve = (value: T) => {
		if (status === 'pending') {
			status = 'resolved';
			resolve?.(value);
		}
	};
	(promise as Deferred<T>).reject = (error: Error) => {
		if (status === 'pending') {
			status = 'rejected';
			reject?.(error);
		}
	};
	(promise as Deferred<T>).status = () => status;

	return promise as Deferred<T>;
}

export function isDeferred<T>(promise: Promise<T>): promise is Deferred<T> {
	return 'resolve' in promise && 'reject' in promise;
}
