export type ErrorValidator
	= (new (...args: any[]) => any)
	| RegExp
	| string
	| ((error: any) => boolean);

export interface Observable {
	subscribe(observer: (value: {}) => void): void;
}

export type Test = (t: TestContext) => PromiseLike<void> | Iterator<any> | Observable | void;
export type ContextualTest<T> = (t: ContextualTestContext<T>) => PromiseLike<void> | Iterator<any> | Observable | void;
export type CallbackTest = (t: CallbackTestContext) => void;
export type ContextualCallbackTest<T> = (t: ContextualCallbackTestContext<T>) => void;

export interface AssertContext {
	/**
	 * Passing assertion.
	 */
	pass(message?: string): void;
	/**
	 * Failing assertion.
	 */
	fail(message?: string): void;
	/**
	 * Assert that value is truthy.
	 */
	truthy(value: any, message?: string): void;
	/**
	 * Assert that value is falsy.
	 */
	falsy(value: any, message?: string): void;
	/**
	 * Assert that value is true.
	 */
	true(value: any, message?: string): void;
	/**
	 * Assert that value is false.
	 */
	false(value: any, message?: string): void;
	/**
	 * Assert that value is equal to expected.
	 */
	is<U>(value: U, expected: U, message?: string): void;
	/**
	 * Assert that value is not equal to expected.
	 */
	not<U>(value: U, expected: U, message?: string): void;
	/**
	 * Assert that value is deep equal to expected.
	 */
	deepEqual<U>(value: U, expected: U, message?: string): void;
	/**
	 * Assert that value is not deep equal to expected.
	 */
	notDeepEqual<U>(value: U, expected: U, message?: string): void;
 	/**
 	 * Assert that function throws an error or promise rejects.
 	 * @param error Can be a constructor, regex, error message or validation function.
 	 */
	throws(value: PromiseLike<any>, error?: ErrorValidator, message?: string): Promise<any>;
	throws(value: () => void, error?: ErrorValidator, message?: string): any;
	/**
	 * Assert that function doesn't throw an error or promise resolves.
	 */
	notThrows<U>(value: PromiseLike<U>, message?: string): Promise<U>;
	notThrows(value: () => void, message?: string): void;
	/**
	 * Assert that contents matches regex.
	 */
	regex(contents: string, regex: RegExp, message?: string): void;
	/**
	 * Assert that contents matches a snapshot.
	 */
	snapshot(contents: any, message?: string): void;
	/**
	 * Assert that contents does not match regex.
	 */
	notRegex(contents: string, regex: RegExp, message?: string): void;
	/**
	 * Assert that error is falsy.
	 */
	ifError(error: any, message?: string): void;
}
export interface TestContext extends AssertContext {
	/**
	 * Plan how many assertion there are in the test.
	 * The test will fail if the actual assertion count doesn't match planned assertions.
	 */
	plan(count: number): void;

	skip: AssertContext;
}
export interface CallbackTestContext extends TestContext {
	/**
	 * End the test.
	 */
	end(): void;
}
export interface ContextualTestContext<T> extends TestContext {
	context: T;
}
export interface ContextualCallbackTestContext<T> extends CallbackTestContext {
	context: T;
}

export interface Macro<T> {
	(t: T, ...args: any[]): void;
	title? (providedTitle: string, ...args: any[]): string;
}
export type Macros<T> = Macro<T> | Macro<T>[];

export function contextualize<T>(context: T | (() => T)): ITest<T>;

export interface ITest<T> {
    (name: string, run: ContextualTest<T>): void;
    (run: ContextualTest<T>): void;
    (name: string, run: Macros<ContextualTestContext<T>>, ...args: any[]): void;
    (run: Macros<ContextualTestContext<T>>, ...args: any[]): void;
}
