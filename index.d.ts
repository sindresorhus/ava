export interface ObservableLike {
	subscribe(observer: (value: any) => void): void;
}

export type Constructor = (new (...args: Array<any>) => any);

/** Specify one or more expectations the thrown error must satisfy. */
export type ThrowsExpectation = {
	/** The thrown error must have a code that equals the given string or number. */
	code?: string | number;

	/** The thrown error must be an instance of this constructor. */
	instanceOf?: Constructor;

	/** The thrown error must be strictly equal to this value. */
	is?: Error;

	/** The thrown error must have a message that equals the given string, or matches the regular expression. */
	message?: string | RegExp;

	/** The thrown error must have a name that equals the given string. */
	name?: string;
};

/** Options that can be passed to the `t.snapshot()` assertion. */
export type SnapshotOptions = {
	/** If provided and not an empty string, used to select the snapshot to compare the `expected` value against. */
	id?: string;
};

export interface Assertions {
	/** Assert that `actual` is [truthy](https://developer.mozilla.org/en-US/docs/Glossary/Truthy). Comes with power-assert. */
	assert: AssertAssertion;

	/** Assert that `actual` is [deeply equal](https://github.com/concordancejs/concordance#comparison-details) to `expected`. */
	deepEqual: DeepEqualAssertion;

	/** Fail the test. */
	fail: FailAssertion;

	/** Assert that `actual` is strictly false. */
	false: FalseAssertion;

	/** Assert that `actual` is [falsy](https://developer.mozilla.org/en-US/docs/Glossary/Falsy). */
	falsy: FalsyAssertion;

	/**
	 * Assert that `actual` is [the same
	 * value](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/is) as `expected`.
	 */
	is: IsAssertion;

	/**
	 * Assert that `actual` is not [the same
	 * value](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/is) as `expected`.
	 */
	not: NotAssertion;

	/** Assert that `actual` is not [deeply equal](https://github.com/concordancejs/concordance#comparison-details) to `expected`. */
	notDeepEqual: NotDeepEqualAssertion;

	/** Assert that `string` does not match the regular expression. */
	notRegex: NotRegexAssertion;

	/** Assert that the function does not throw. */
	notThrows: NotThrowsAssertion;

	/** Assert that the async function does not throw, or that the promise does not reject. Must be awaited. */
	notThrowsAsync: NotThrowsAsyncAssertion;

	/** Count a passing assertion. */
	pass: PassAssertion;

	/** Assert that `string` matches the regular expression. */
	regex: RegexAssertion;

	/**
	 * Assert that `expected` is [deeply equal](https://github.com/concordancejs/concordance#comparison-details) to a
	 * previously recorded [snapshot](https://github.com/concordancejs/concordance#serialization-details), or if
	 * necessary record a new snapshot.
	 */
	snapshot: SnapshotAssertion;

	/**
	 * Assert that the function throws [an error](https://www.npmjs.com/package/is-error). If so, returns the error value.
	 */
	throws: ThrowsAssertion;

	/**
	 * Assert that the async function throws [an error](https://www.npmjs.com/package/is-error), or the promise rejects
	 * with one. If so, returns a promise for the error value, which must be awaited.
	 */
	throwsAsync: ThrowsAsyncAssertion;

	/** Assert that `actual` is strictly true. */
	true: TrueAssertion;

	/** Assert that `actual` is [truthy](https://developer.mozilla.org/en-US/docs/Glossary/Truthy). */
	truthy: TruthyAssertion;
}

export interface AssertAssertion {
	/** Assert that `actual` is [truthy](https://developer.mozilla.org/en-US/docs/Glossary/Truthy). Comes with power-assert. */
	(actual: any, message?: string): void;

	/** Skip this assertion. */
	skip(actual: any, message?: string): void;
}

export interface DeepEqualAssertion {
	/** Assert that `actual` is [deeply equal](https://github.com/concordancejs/concordance#comparison-details) to `expected`. */
	<ValueType = any>(actual: ValueType, expected: ValueType, message?: string): void;

	/** Skip this assertion. */
	skip(actual: any, expected: any, message?: string): void;
}

export interface FailAssertion {
	/** Fail the test. */
	(message?: string): void;

	/** Skip this assertion. */
	skip(message?: string): void;
}

export interface FalseAssertion {
	/** Assert that `actual` is strictly false. */
	(actual: any, message?: string): void;

	/** Skip this assertion. */
	skip(actual: any, message?: string): void;
}

export interface FalsyAssertion {
	/** Assert that `actual` is [falsy](https://developer.mozilla.org/en-US/docs/Glossary/Falsy). */
	(actual: any, message?: string): void;

	/** Skip this assertion. */
	skip(actual: any, message?: string): void;
}

export interface IsAssertion {
	/**
	 * Assert that `actual` is [the same
	 * value](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/is) as `expected`.
	 */
	<ValueType = any>(actual: ValueType, expected: ValueType, message?: string): void;

	/** Skip this assertion. */
	skip(actual: any, expected: any, message?: string): void;
}

export interface NotAssertion {
	/**
	 * Assert that `actual` is not [the same
	 * value](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/is) as `expected`.
	 */
	<ValueType = any>(actual: ValueType, expected: ValueType, message?: string): void;

	/** Skip this assertion. */
	skip(actual: any, expected: any, message?: string): void;
}

export interface NotDeepEqualAssertion {
	/** Assert that `actual` is not [deeply equal](https://github.com/concordancejs/concordance#comparison-details) to `expected`. */
	<ValueType = any>(actual: ValueType, expected: ValueType, message?: string): void;

	/** Skip this assertion. */
	skip(actual: any, expected: any, message?: string): void;
}

export interface NotRegexAssertion {
	/** Assert that `string` does not match the regular expression. */
	(string: string, regex: RegExp, message?: string): void;

	/** Skip this assertion. */
	skip(string: string, regex: RegExp, message?: string): void;
}

export interface NotThrowsAssertion {
	/** Assert that the function does not throw. */
	(fn: () => any, message?: string): void;

	/** Skip this assertion. */
	skip(fn: () => any, message?: string): void;
}

export interface NotThrowsAsyncAssertion {
	/** Assert that the async function does not throw. You must await the result. */
	(fn: () => PromiseLike<any>, message?: string): Promise<void>;

	/** Assert that the promise does not reject. You must await the result. */
	(promise: PromiseLike<any>, message?: string): Promise<void>;

	/** Skip this assertion. */
	skip(nonThrower: any, message?: string): void;
}

export interface PassAssertion {
	/** Count a passing assertion. */
	(message?: string): void;

	/** Skip this assertion. */
	skip(message?: string): void;
}

export interface RegexAssertion {
	/** Assert that `string` matches the regular expression. */
	(string: string, regex: RegExp, message?: string): void;

	/** Skip this assertion. */
	skip(string: string, regex: RegExp, message?: string): void;
}

export interface SnapshotAssertion {
	/**
	 * Assert that `expected` is [deeply equal](https://github.com/concordancejs/concordance#comparison-details) to a
	 * previously recorded [snapshot](https://github.com/concordancejs/concordance#serialization-details), or if
	 * necessary record a new snapshot.
	 */
	(expected: any, message?: string): void;

	/**
	 * Assert that `expected` is [deeply equal](https://github.com/concordancejs/concordance#comparison-details) to a
	 * previously recorded [snapshot](https://github.com/concordancejs/concordance#serialization-details) (selected
	 * through `options.id` if provided), or if necessary record a new snapshot.
	 */
	(expected: any, options: SnapshotOptions, message?: string): void;

	/** Skip this assertion. */
	skip(expected: any, message?: string): void;

	/** Skip this assertion. */
	skip(expected: any, options: SnapshotOptions, message?: string): void;
}

export interface ThrowsAssertion {
	/**
	 * Assert that the function throws [an error](https://www.npmjs.com/package/is-error). If so, returns the error value.
	 */
	<ThrownError extends Error>(fn: () => any, expectations?: null, message?: string): ThrownError;

	/**
	 * Assert that the function throws [an error](https://www.npmjs.com/package/is-error). If so, returns the error value.
	 * The error must be an instance of the given constructor.
	 */
	<ThrownError extends Error>(fn: () => any, constructor: Constructor, message?: string): ThrownError;

	/**
	 * Assert that the function throws [an error](https://www.npmjs.com/package/is-error). If so, returns the error value.
	 * The error must have a message that matches the regular expression.
	 */
	<ThrownError extends Error>(fn: () => any, regex: RegExp, message?: string): ThrownError;

	/**
	 * Assert that the function throws [an error](https://www.npmjs.com/package/is-error). If so, returns the error value.
	 * The error must have a message equal to `errorMessage`.
	 */
	<ThrownError extends Error>(fn: () => any, errorMessage: string, message?: string): ThrownError;

	/**
	 * Assert that the function throws [an error](https://www.npmjs.com/package/is-error). If so, returns the error value.
	 * The error must satisfy all expectations.
	 */
	<ThrownError extends Error>(fn: () => any, expectations: ThrowsExpectation, message?: string): ThrownError;

	/** Skip this assertion. */
	skip(fn: () => any, expectations?: any, message?: string): void;
}

export interface ThrowsAsyncAssertion {
	/**
	 * Assert that the async function throws [an error](https://www.npmjs.com/package/is-error). If so, returns the error
	 * value. You must await the result.
	 */
	<ThrownError extends Error>(fn: () => PromiseLike<any>, expectations?: null, message?: string): Promise<ThrownError>;

	/**
	 * Assert that the async function throws [an error](https://www.npmjs.com/package/is-error). If so, returns the error
	 * value. You must await the result. The error must be an instance of the given constructor.
	 */
	<ThrownError extends Error>(fn: () => PromiseLike<any>, constructor: Constructor, message?: string): Promise<ThrownError>;

	/**
	 * Assert that the async function throws [an error](https://www.npmjs.com/package/is-error). If so, returns the error
	 * value. You must await the result. The error must have a message that matches the regular expression.
	 */
	<ThrownError extends Error>(fn: () => PromiseLike<any>, regex: RegExp, message?: string): Promise<ThrownError>;

	/**
	 * Assert that the async function throws [an error](https://www.npmjs.com/package/is-error). If so, returns the error
	 * value. You must await the result. The error must have a message equal to `errorMessage`.
	 */
	<ThrownError extends Error>(fn: () => PromiseLike<any>, errorMessage: string, message?: string): Promise<ThrownError>;

	/**
	 * Assert that the async function throws [an error](https://www.npmjs.com/package/is-error). If so, returns the error
	 * value. You must await the result. The error must satisfy all expectations.
	 */
	<ThrownError extends Error>(fn: () => PromiseLike<any>, expectations: ThrowsExpectation, message?: string): Promise<ThrownError>;

	/**
	 * Assert that the promise rejects with [an error](https://www.npmjs.com/package/is-error). If so, returns the
	 * rejection reason. You must await the result.
	 */
	<ThrownError extends Error>(promise: PromiseLike<any>, expectations?: null, message?: string): Promise<ThrownError>;

	/**
	 * Assert that the promise rejects with [an error](https://www.npmjs.com/package/is-error). If so, returns the
	 * rejection reason. You must await the result. The error must be an instance of the given constructor.
	 */
	<ThrownError extends Error>(promise: PromiseLike<any>, constructor: Constructor, message?: string): Promise<ThrownError>;

	/**
	 * Assert that the promise rejects with [an error](https://www.npmjs.com/package/is-error). If so, returns the
	 * rejection reason. You must await the result. The error must have a message that matches the regular expression.
	 */
	<ThrownError extends Error>(promise: PromiseLike<any>, regex: RegExp, message?: string): Promise<ThrownError>;

	/**
	 * Assert that the promise rejects with [an error](https://www.npmjs.com/package/is-error). If so, returns the
	 * rejection reason. You must await the result. The error must have a message equal to `errorMessage`.
	 */
	<ThrownError extends Error>(promise: PromiseLike<any>, errorMessage: string, message?: string): Promise<ThrownError>;

	/**
	 * Assert that the promise rejects with [an error](https://www.npmjs.com/package/is-error). If so, returns the
	 * rejection reason. You must await the result. The error must satisfy all expectations.
	 */
	<ThrownError extends Error>(promise: PromiseLike<any>, expectations: ThrowsExpectation, message?: string): Promise<ThrownError>;

	/** Skip this assertion. */
	skip(thrower: any, expectations?: any, message?: string): void;
}

export interface TrueAssertion {
	/** Assert that `actual` is strictly true. */
	(actual: any, message?: string): void;

	/** Skip this assertion. */
	skip(actual: any, message?: string): void;
}

export interface TruthyAssertion {
	/** Assert that `actual` is [truthy](https://developer.mozilla.org/en-US/docs/Glossary/Truthy). */
	(actual: any, message?: string): void;

	/** Skip this assertion. */
	skip(actual: any, message?: string): void;
}

/** The `t` value passed to test & hook implementations. */
export interface ExecutionContext<Context = {}> extends Assertions {
	/** Test context, shared with hooks. */
	context: Context;

	/** Title of the test or hook. */
	readonly title: string;

	log: LogFn;
	plan: PlanFn;
	timeout: TimeoutFn;
}

export interface LogFn {
	/** Log one or more values. */
	(...values: Array<any>): void;

	/** Skip logging. */
	skip(...values: Array<any>): void;
}

export interface PlanFn {
	/**
	 * Plan how many assertion there are in the test. The test will fail if the actual assertion count doesn't match the
	 * number of planned assertions. See [assertion planning](https://github.com/avajs/ava#assertion-planning).
	 */
	(count: number): void;

	/** Don't plan assertions. */
	skip(count: number): void;
}

export interface TimeoutFn {
	/**
	 * Set a timeout for the test, in milliseconds. The test will fail if the timeout is exceeded.
	 * The timeout is reset each time an assertion is made.
	 */
	(ms: number): void;
}

/** The `t` value passed to implementations for tests & hooks declared with the `.cb` modifier. */
export interface CbExecutionContext<Context = {}> extends ExecutionContext<Context> {
	/**
	 * End the test. If `error` is [truthy](https://developer.mozilla.org/en-US/docs/Glossary/Truthy) the test or hook
	 * will fail.
	 */
	end(error?: any): void;
}

export type ImplementationResult = PromiseLike<void> | ObservableLike | void;
export type Implementation<Context = {}> = (t: ExecutionContext<Context>) => ImplementationResult;
export type CbImplementation<Context = {}> = (t: CbExecutionContext<Context>) => ImplementationResult;

export type UntitledMacro<Args extends any[], Context = {}> = (t: ExecutionContext<Context>, ...args: Args) => ImplementationResult;
/** A reusable test or hook implementation. */
export type Macro<Args extends any[], Context = {}> = UntitledMacro<Args, Context> & {
	/**
	 * Implement this function to generate a test (or hook) title whenever this macro is used. `providedTitle` contains
	 * the title provided when the test or hook was declared. Also receives the remaining test arguments.
	 */
	title?: (providedTitle: string | undefined, ...args: Args) => string;
}

type _Macro<Args extends any[], Context> = Macro<Args, Context> | UntitledMacro<Args, Context>;

/** Alias for a single macro, or an array of macros. */
export type OneOrMoreMacros<Args extends any[], Context> = _Macro<Args, Context> | [_Macro<Args, Context>, ..._Macro<Args, Context>[]];

export type UntitledCbMacro<Args extends any[], Context = {}> = (t: CbExecutionContext<Context>, ...args: Args) => ImplementationResult
/** A reusable test or hook implementation, for tests & hooks declared with the `.cb` modifier. */
export type CbMacro<Args extends any[], Context = {}> = UntitledCbMacro<Args, Context> & {
	title?: (providedTitle: string | undefined, ...args: Args) => string;
}

type _CbMacro<Args extends any[], Context> = CbMacro<Args, Context> | UntitledCbMacro<Args, Context>;

/** Alias for a single macro, or an array of macros, used for tests & hooks declared with the `.cb` modifier. */
export type OneOrMoreCbMacros<Args extends any[], Context> = _CbMacro<Args, Context> | [_CbMacro<Args, Context>, ..._CbMacro<Args, Context>[]];

export interface TestInterface<Context = {}> {
	/** Declare a concurrent test. */
	(title: string, implementation: Implementation<Context>): void;

	/** Declare a concurrent test that uses one or more macros. Additional arguments are passed to the macro. */
	<T extends any[]>(title: string, macros: OneOrMoreMacros<T, Context>, ...rest: T): void

	/** Declare a concurrent test that uses one or more macros. The macro is responsible for generating a unique test title. */
	<T extends any[]>(macros: OneOrMoreMacros<T, Context>, ...rest: T): void;

	/** Declare a hook that is run once, after all tests have passed. */
	after: AfterInterface<Context>;

	/** Declare a hook that is run after each passing test. */
	afterEach: AfterInterface<Context>;

	/** Declare a hook that is run once, before all tests. */
	before: BeforeInterface<Context>;

	/** Declare a hook that is run before each test. */
	beforeEach: BeforeInterface<Context>;

	/** Declare a test that must call `t.end()` when it's done. */
	cb: CbInterface<Context>;

	/** Declare a test that is expected to fail. */
	failing: FailingInterface<Context>;

	/** Declare tests and hooks that are run serially. */
	serial: SerialInterface<Context>;

	only: OnlyInterface<Context>;
	skip: SkipInterface<Context>;
	todo: TodoDeclaration;
	meta: MetaInterface;
}

export interface AfterInterface<Context = {}> {
	/** Declare a hook that is run once, after all tests have passed. */
	(implementation: Implementation<Context>): void;

	/** Declare a hook that is run once, after all tests have passed. */
	(title: string, implementation: Implementation<Context>): void;

	/** Declare a hook that is run once, after all tests have passed. Additional arguments are passed to the macro. */
	<T extends any[]>(title: string, macros: OneOrMoreMacros<T, Context>, ...rest: T): void;

	/** Declare a hook that is run once, after all tests have passed. */
	<T extends any[]>(macros: OneOrMoreMacros<T, Context>, ...rest: T): void;

	/** Declare a hook that is run once, after all tests are done. */
	always: AlwaysInterface<Context>;

	/** Declare a hook that must call `t.end()` when it's done. */
	cb: HookCbInterface<Context>;

	skip: HookSkipInterface<Context>;
}

export interface AlwaysInterface<Context = {}> {
	/** Declare a hook that is run once, after all tests are done. */
	(implementation: Implementation<Context>): void;

	/** Declare a hook that is run once, after all tests are done. */
	(title: string, implementation: Implementation<Context>): void;

	/** Declare a hook that is run once, after all tests are done. Additional arguments are passed to the macro. */
	<T extends any[]>(title: string, macros: OneOrMoreMacros<T, Context>, ...rest: T): void;

	/** Declare a hook that is run once, after all tests are done. */
	<T extends any[]>(macros: OneOrMoreMacros<T, Context>, ...rest: T): void;

	/** Declare a hook that must call `t.end()` when it's done. */
	cb: HookCbInterface<Context>;

	skip: HookSkipInterface<Context>;
}

export interface BeforeInterface<Context = {}> {
	/** Declare a hook that is run once, before all tests. */
	(implementation: Implementation<Context>): void;

	/** Declare a hook that is run once, before all tests. */
	(title: string, implementation: Implementation<Context>): void;

	/** Declare a hook that is run once, before all tests. Additional arguments are passed to the macro. */
	<T extends any[]>(title: string, macros: OneOrMoreMacros<T, Context>, ...rest: T): void;

	/** Declare a hook that is run once, before all tests. */
	<T extends any[]>(macros: OneOrMoreMacros<T, Context>, ...rest: T): void;

	/** Declare a hook that must call `t.end()` when it's done. */
	cb: HookCbInterface<Context>;

	skip: HookSkipInterface<Context>;
}

export interface CbInterface<Context = {}> {
	/** Declare a test that must call `t.end()` when it's done. */
	(title: string, implementation: CbImplementation<Context>): void;

	/**
	 * Declare a concurrent test that uses one or more macros. The macros must call `t.end()` when they're done.
	 * Additional arguments are passed to the macro.
	 */
	<T extends any[]>(title: string, macros: OneOrMoreCbMacros<T, Context>, ...rest: T): void;

	/**
	 * Declare a concurrent test that uses one or more macros. The macros must call `t.end()` when they're done.
	 * The macro is responsible for generating a unique test title.
	 */
	<T extends any[]>(macros: OneOrMoreCbMacros<T, Context>, ...rest: T): void;

	/** Declare a test that is expected to fail. */
	failing: CbFailingInterface<Context>;

	only: CbOnlyInterface<Context>;
	skip: CbSkipInterface<Context>;
}

export interface CbFailingInterface<Context = {}> {
	/** Declare a test that must call `t.end()` when it's done. The test is expected to fail. */
	(title: string, implementation: CbImplementation<Context>): void;

	/**
	 * Declare a test that uses one or more macros. The macros must call `t.end()` when they're done.
	 * Additional arguments are passed to the macro. The test is expected to fail.
	 */
	<T extends any[]>(title: string, macros: OneOrMoreCbMacros<T, Context>, ...rest: T): void;

	/**
	 * Declare a test that uses one or more macros. The macros must call `t.end()` when they're done.
	 * The test is expected to fail.
	 */
	<T extends any[]>(macros: OneOrMoreCbMacros<T, Context>, ...rest: T): void;

	only: CbOnlyInterface<Context>;
	skip: CbSkipInterface<Context>;
}

export interface CbOnlyInterface<Context = {}> {
	/**
	 * Declare a test that must call `t.end()` when it's done. Only this test and others declared with `.only()` are run.
	 */
	(title: string, implementation: CbImplementation<Context>): void;

	/**
	 * Declare a test that uses one or more macros. The macros must call `t.end()` when they're done.
	 * Additional arguments are passed to the macro. Only this test and others declared with `.only()` are run.
	 */
	<T extends any[]>(title: string, macros: OneOrMoreCbMacros<T, Context>, ...rest: T): void;

	/**
	 * Declare a test that uses one or more macros. The macros must call `t.end()` when they're done.
	 * Additional arguments are passed to the macro. Only this test and others declared with `.only()` are run.
	 */
	<T extends any[]>(macros: OneOrMoreCbMacros<T, Context>, ...rest: T): void;
}

export interface CbSkipInterface<Context = {}> {
	/** Skip this test. */
	(title: string, implementation: CbImplementation<Context>): void;

	/** Skip this test. */
	<T extends any[]>(title: string, macros: OneOrMoreCbMacros<T, Context>, ...rest: T): void;

	/** Skip this test. */
	<T extends any[]>(macros: OneOrMoreCbMacros<T, Context>, ...rest: T): void;
}

export interface FailingInterface<Context = {}> {
	/** Declare a concurrent test. The test is expected to fail. */
	(title: string, implementation: Implementation<Context>): void;

	/**
	 * Declare a concurrent test that uses one or more macros. Additional arguments are passed to the macro.
	 * The test is expected to fail.
	 */
	<T extends any[]>(title: string, macros: OneOrMoreMacros<T, Context>, ...rest: T): void;

	/**
	 * Declare a concurrent test that uses one or more macros. The macro is responsible for generating a unique test title.
	 * The test is expected to fail.
	 */
	<T extends any[]>(macros: OneOrMoreMacros<T, Context>, ...rest: T): void;

	only: OnlyInterface<Context>;
	skip: SkipInterface<Context>;
}

export interface HookCbInterface<Context = {}> {
	/** Declare a hook that must call `t.end()` when it's done. */
	(implementation: CbImplementation<Context>): void;

	/** Declare a hook that must call `t.end()` when it's done. */
	(title: string, implementation: CbImplementation<Context>): void;

	/**
	 * Declare a hook that uses one or more macros. The macros must call `t.end()` when they're done.
	 * Additional arguments are passed to the macro.
	 */
	<T extends any[]>(title: string, macros: OneOrMoreCbMacros<T, Context>, ...rest: T): void;

	/**
	 * Declare a hook that uses one or more macros. The macros must call `t.end()` when they're done.
	 */
	<T extends any[]>(macros: OneOrMoreCbMacros<T, Context>, ...rest: T): void;

	skip: HookCbSkipInterface<Context>;
}

export interface HookCbSkipInterface<Context = {}> {
	/** Skip this hook. */
	(implementation: CbImplementation<Context>): void;

	/** Skip this hook. */
	(title: string, implementation: CbImplementation<Context>): void;

	/** Skip this hook. */
	<T extends any[]>(title: string, macros: OneOrMoreCbMacros<T, Context>, ...rest: T): void;

	/** Skip this hook. */
	<T extends any[]>(macros: OneOrMoreCbMacros<T, Context>, ...rest: T): void;
}

export interface HookSkipInterface<Context = {}> {
	/** Skip this hook. */
	(implementation: Implementation<Context>): void;

	/** Skip this hook. */
	(title: string, implementation: Implementation<Context>): void;

	/** Skip this hook. */
	<T extends any[]>(title: string, macros: OneOrMoreMacros<T, Context>, ...rest: T): void;

	/** Skip this hook. */
	<T extends any[]>(macros: OneOrMoreMacros<T, Context>, ...rest: T): void;
}

export interface OnlyInterface<Context = {}> {
	/** Declare a test. Only this test and others declared with `.only()` are run. */
	(title: string, implementation: Implementation<Context>): void;

	/**
	 * Declare a test that uses one or more macros. Additional arguments are passed to the macro.
	 * Only this test and others declared with `.only()` are run.
	 */
	<T extends any[]>(title: string, macros: OneOrMoreMacros<T, Context>, ...rest: T): void;

	/**
	 * Declare a test that uses one or more macros. The macro is responsible for generating a unique test title.
	 * Only this test and others declared with `.only()` are run.
	 */
	<T extends any[]>(macros: OneOrMoreMacros<T, Context>, ...rest: T): void;
}

export interface SerialInterface<Context = {}> {
	/** Declare a serial test. */
	(title: string, implementation: Implementation<Context>): void;

	/** Declare a serial test that uses one or more macros. Additional arguments are passed to the macro. */
	<T extends any[]>(title: string, macros: OneOrMoreMacros<T, Context>, ...rest: T): void;

	/**
	 * Declare a serial test that uses one or more macros. The macro is responsible for generating a unique test title.
	 */
	<T extends any[]>(macros: OneOrMoreMacros<T, Context>, ...rest: T): void;

	/** Declare a serial hook that is run once, after all tests have passed. */
	after: AfterInterface<Context>;

	/** Declare a serial hook that is run after each passing test. */
	afterEach: AfterInterface<Context>;

	/** Declare a serial hook that is run once, before all tests. */
	before: BeforeInterface<Context>;

	/** Declare a serial hook that is run before each test. */
	beforeEach: BeforeInterface<Context>;

	/** Declare a serial test that must call `t.end()` when it's done. */
	cb: CbInterface<Context>;

	/** Declare a serial test that is expected to fail. */
	failing: FailingInterface<Context>;

	only: OnlyInterface<Context>;
	skip: SkipInterface<Context>;
	todo: TodoDeclaration;
}

export interface SkipInterface<Context = {}> {
	/** Skip this test. */
	(title: string, implementation: Implementation<Context>): void;

	/** Skip this test. */
	<T extends any[]>(title: string, macros: OneOrMoreMacros<T, Context>, ...rest: T): void;

	/** Skip this test. */
	<T extends any[]>(title: string, macros: OneOrMoreMacros<T, Context>, ...rest: T): void;
}

export interface TodoDeclaration {
	/** Declare a test that should be implemented later. */
	(title: string): void;
}

export interface MetaInterface {
	/** Path to the test file being executed. */
	file: string;
}

/** Call to declare a test, or chain to declare hooks or test modifiers */
declare const test: TestInterface;

/** Call to declare a test, or chain to declare hooks or test modifiers */
export default test;

/** Call to declare a hook that is run once, after all tests have passed, or chain to declare modifiers. */
export const after: AfterInterface;

/** Call to declare a hook that is run after each passing test, or chain to declare modifiers. */
export const afterEach: AfterInterface;

/** Call to declare a hook that is run once, before all tests, or chain to declare modifiers. */
export const before: BeforeInterface;

/** Call to declare a hook that is run before each test, or chain to declare modifiers. */
export const beforeEach: BeforeInterface;

/** Call to declare a test that must invoke `t.end()` when it's done, or chain to declare modifiers. */
export const cb: CbInterface;

/** Call to declare a test that is expected to fail, or chain to declare modifiers. */
export const failing: FailingInterface;

/** Call to declare a test that is run exclusively, along with other tests declared with `.only()`. */
export const only: OnlyInterface;

/** Call to declare a serial test, or chain to declare serial hooks or test modifiers. */
export const serial: SerialInterface;

/** Skip this test. */
export const skip: SkipInterface;

/** Declare a test that should be implemented later. */
export const todo: TodoDeclaration;

/** Meta data associated with the current process. */
export const meta: MetaInterface;
