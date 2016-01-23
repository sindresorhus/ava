'use strict';
var test = require('tap').test;
var Promise = global.Promise = require('bluebird');
var delay = require('delay');
var isPromise = require('is-promise');
var _ava = require('../lib/test');

function ava() {
	var t = _ava.apply(null, arguments);
	t.metadata = {callback: false};
	return t;
}

ava.cb = function () {
	var t = _ava.apply(null, arguments);
	t.metadata = {callback: true};
	return t;
};

test('run test', function (t) {
	var result = ava('foo', function (a) {
		a.fail();
	}).run();

	t.is(result.passed, false);
	t.end();
});

test('title is optional', function (t) {
	var result = ava(function (a) {
		a.pass();
	}).run();

	t.is(result.passed, true);
	t.is(result.result.title, '[anonymous]');
	t.end();
});

test('callback is required', function (t) {
	t.throws(function () {
		ava();
	}, /you must provide a callback/);

	t.throws(function () {
		ava('title');
	}, /you must provide a callback/);

	t.end();
});

test('infer name from function', function (t) {
	var result = ava(function foo(a) {
		a.pass();
	}).run();
	t.is(result.passed, true);
	t.is(result.result.title, 'foo');
	t.end();
});

test('multiple asserts', function (t) {
	var result = ava(function (a) {
		a.pass();
		a.pass();
		a.pass();
	}).run();

	t.is(result.passed, true);
	t.is(result.result.assertCount, 3);
	t.end();
});

test('plan assertions', function (t) {
	var result = ava(function (a) {
		a.plan(2);
		a.pass();
		a.pass();
	}).run();

	t.is(result.passed, true);
	t.is(result.result.planCount, 2);
	t.is(result.result.assertCount, 2);
	t.end();
});

test('run more assertions than planned', function (t) {
	var result = ava(function (a) {
		a.plan(2);
		a.pass();
		a.pass();
		a.pass();
	}).run();

	t.is(result.passed, false);
	t.ok(result.reason);
	t.is(result.reason.name, 'AssertionError');
	t.is(result.reason.expected, 2);
	t.is(result.reason.actual, 3);
	t.match(result.reason.message, /count does not match planned/);
	t.end();
});

test('handle non-assertion errors', function (t) {
	var result = ava(function () {
		throw new Error();
	}).run();

	t.is(result.passed, false);
	t.is(result.reason.name, 'Error');
	t.true(result.reason instanceof Error);
	t.end();
});

test('end can be used as callback without maintaining thisArg', function (t) {
	ava.cb(function (a) {
		setTimeout(a.end);
	}).run().then(function (result) {
		t.is(result.passed, true);
		t.end();
	});
});

test('end can be used as callback with error', function (t) {
	ava.cb(function (a) {
		a.end(new Error('failed'));
	}).run().then(function (result) {
		t.is(result.passed, false);
		t.true(result.reason instanceof Error);
		// TODO: Question - why not just set the reason to the error?
		t.match(result.reason.message, /Callback called with an error/);
		t.end();
	});
});

test('handle non-assertion errors even when planned', function (t) {
	var result = ava(function (a) {
		a.plan(1);
		throw new Error('bar');
	}).run();

	t.is(result.passed, false);
	t.is(result.reason.name, 'Error');
	t.is(result.reason.message, 'bar');
	t.end();
});

test('handle testing of arrays', function (t) {
	var result = ava(function (a) {
		a.same(['foo', 'bar'], ['foo', 'bar']);
	}).run();

	t.is(result.passed, true);
	t.is(result.result.assertCount, 1);
	t.end();
});

test('handle falsy testing of arrays', function (t) {
	var result = ava(function (a) {
		a.notSame(['foo', 'bar'], ['foo', 'bar', 'cat']);
	}).run();

	t.is(result.passed, true);
	t.is(result.result.assertCount, 1);
	t.end();
});

test('handle testing of objects', function (t) {
	var result = ava(function (a) {
		a.same({foo: 'foo', bar: 'bar'}, {foo: 'foo', bar: 'bar'});
	}).run();

	t.is(result.passed, true);
	t.is(result.result.assertCount, 1);
	t.end();
});

test('handle falsy testing of objects', function (t) {
	var result = ava(function (a) {
		a.notSame({foo: 'foo', bar: 'bar'}, {foo: 'foo', bar: 'bar', cat: 'cake'});
	}).run();

	t.is(result.passed, true);
	t.is(result.result.assertCount, 1);
	t.end();
});

test('handle throws with error', function (t) {
	var result = ava(function (a) {
		a.throws(function () {
			throw new Error('foo');
		});
	}).run();

	t.is(result.passed, true);
	t.is(result.result.assertCount, 1);
	t.end();
});

test('handle throws without error', function (t) {
	var result = ava(function (a) {
		a.throws(function () {
			return;
		});
	}).run();

	t.is(result.passed, false);
	t.ok(result.reason);
	t.end();
});

test('handle doesNotThrow with error', function (t) {
	var result = ava(function (a) {
		a.doesNotThrow(function () {
			throw new Error('foo');
		});
	}).run();

	t.is(result.passed, false);
	t.ok(result.reason);
	t.is(result.reason.name, 'AssertionError');
	t.end();
});

test('handle doesNotThrow without error', function (t) {
	var result = ava(function (a) {
		a.doesNotThrow(function () {
			return;
		});
	}).run();

	t.is(result.passed, true);
	t.is(result.result.assertCount, 1);
	t.end();
});

test('run functions after last planned assertion', function (t) {
	var i = 0;

	var result = ava(function (a) {
		a.plan(1);
		a.pass();
		i++;
	}).run();

	t.is(i, 1);
	t.is(result.passed, true);
	t.end();
});

test('run async functions after last planned assertion', function (t) {
	var i = 0;

	ava.cb(function (a) {
		a.plan(1);
		a.pass();
		a.end();
		i++;
	}).run().then(function (result) {
		t.is(i, 1);
		t.is(result.passed, true);
		t.end();
	});
});

test('planned async assertion', function (t) {
	ava.cb(function (a) {
		a.plan(1);

		setTimeout(function () {
			a.pass();
			a.end();
		}, 100);
	}).run().then(function (result) {
		t.is(result.passed, true);
		t.is(result.result.assertCount, 1);
		t.end();
	});
});

test('async assertion with `.end()`', function (t) {
	ava.cb(function (a) {
		setTimeout(function () {
			a.pass();
			a.end();
		}, 100);
	}).run().then(function (result) {
		t.is(result.passed, true);
		t.is(result.result.assertCount, 1);
		t.end();
	});
});

test('more assertions than planned should emit an assertion error', function (t) {
	var result = ava(function (a) {
		a.plan(1);
		a.pass();
		a.pass();
	}).run();

	t.is(result.passed, false);
	t.is(result.reason.name, 'AssertionError');
	t.end();
});

test('record test duration', function (t) {
	ava.cb(function (a) {
		a.plan(1);

		setTimeout(function () {
			a.true(true);
			a.end();
		}, 1234);
	}).run().then(function (result) {
		t.is(result.passed, true);
		t.true(result.result.duration >= 1234);
		t.end();
	});
});

test('wait for test to end', function (t) {
	var avaTest;

	ava.cb(function (a) {
		a.plan(1);

		avaTest = a;
	}).run().then(function (result) {
		t.is(result.passed, true);
		t.is(result.result.planCount, 1);
		t.is(result.result.assertCount, 1);
		t.true(result.result.duration >= 1234);
		t.end();
	});

	setTimeout(function () {
		avaTest.pass();
		avaTest.end();
	}, 1234);
});

test('fails with the first assertError', function (t) {
	var result = ava(function (a) {
		a.plan(2);
		a.is(1, 2);
		a.is(3, 4);
	}).run();

	t.is(result.passed, false);
	t.is(result.reason.actual, 1);
	t.is(result.reason.expected, 2);
	t.end();
});

test('fails with thrown falsy value', function (t) {
	var result = ava(function () {
		throw 0; // eslint-disable-line no-throw-literal
	}).run();

	t.is(result.passed, false);
	t.is(result.reason, 0);
	t.end();
});

test('throwing undefined will be converted to string "undefined"', function (t) {
	var result = ava(function () {
		throw undefined; // eslint-disable-line no-throw-literal
	}).run();

	t.is(result.passed, false);
	t.is(result.reason, 'undefined');
	t.end();
});

test('skipped assertions count towards the plan', function (t) {
	var result = ava(function (a) {
		a.plan(2);
		a.pass();
		a.skip.fail();
	}).run();

	t.is(result.passed, true);
	t.is(result.result.planCount, 2);
	t.is(result.result.assertCount, 2);
	t.end();
});

test('throws and doesNotThrow work with promises', function (t) {
	var asyncCalled = false;
	ava(function (a) {
		a.plan(2);
		a.throws(delay.reject(10, new Error('foo')), 'foo');
		a.doesNotThrow(delay(20).then(function () {
			asyncCalled = true;
		}));
	}).run().then(function (result) {
		t.is(result.passed, true);
		t.is(result.result.planCount, 2);
		t.is(result.result.assertCount, 2);
		t.is(asyncCalled, true);
		t.end();
	});
});

test('waits for t.throws to resolve after t.end is called', function (t) {
	ava.cb(function (a) {
		a.plan(1);
		a.doesNotThrow(delay(10), 'foo');
		a.end();
	}).run().then(function (result) {
		t.is(result.passed, true);
		t.is(result.result.planCount, 1);
		t.is(result.result.assertCount, 1);
		t.end();
	});
});

test('waits for t.throws to reject after t.end is called', function (t) {
	ava.cb(function (a) {
		a.plan(1);
		a.throws(delay.reject(10, new Error('foo')), 'foo');
		a.end();
	}).run().then(function (result) {
		t.is(result.passed, true);
		t.is(result.result.planCount, 1);
		t.is(result.result.assertCount, 1);
		t.end();
	});
});

test('waits for t.throws to resolve after the promise returned from the test resolves', function (t) {
	ava(function (a) {
		a.plan(1);
		a.doesNotThrow(delay(10), 'foo');
		return Promise.resolve();
	}).run().then(function (result) {
		t.is(result.passed, true);
		t.is(result.result.planCount, 1);
		t.is(result.result.assertCount, 1);
		t.end();
	});
});

test('waits for t.throws to reject after the promise returned from the test resolves', function (t) {
	ava(function (a) {
		a.plan(1);
		a.throws(delay.reject(10, new Error('foo')), 'foo');
		return Promise.resolve();
	}).run().then(function (result) {
		t.is(result.passed, true);
		t.is(result.result.planCount, 1);
		t.is(result.result.assertCount, 1);
		t.end();
	});
});

test('multiple resolving and rejecting promises passed to t.throws/t.doesNotThrow', function (t) {
	ava(function (a) {
		a.plan(6);
		for (var i = 0; i < 3; ++i) {
			a.throws(delay.reject(10, new Error('foo')), 'foo');
			a.doesNotThrow(delay(10), 'foo');
		}
	}).run().then(function (result) {
		t.is(result.passed, true);
		t.is(result.result.planCount, 6);
		t.is(result.result.assertCount, 6);
		t.end();
	});
});

test('number of assertions matches t.plan when the test exits, but before all promises resolve another is added', function (t) {
	ava(function (a) {
		a.plan(2);
		a.throws(delay.reject(10, new Error('foo')), 'foo');
		a.doesNotThrow(delay(10), 'foo');
		setTimeout(function () {
			a.throws(Promise.reject(new Error('foo')), 'foo');
		}, 5);
	}).run().then(function (result) {
		t.is(result.passed, false);
		t.is(result.reason.operator, 'plan');
		t.is(result.reason.actual, 3);
		t.is(result.reason.expected, 2);
		t.end();
	});
});

test('number of assertions doesn\'t match plan when the test exits, but before all promises resolve another is added', function (t) {
	ava(function (a) {
		a.plan(3);
		a.throws(delay.reject(10, new Error('foo')), 'foo');
		a.doesNotThrow(delay(10), 'foo');
		setTimeout(function () {
			a.throws(Promise.reject(new Error('foo')), 'foo');
		}, 5);
	}).run().then(function (result) {
		t.is(result.passed, false);
		t.is(result.reason.operator, 'plan');
		t.is(result.reason.actual, 2);
		t.is(result.reason.expected, 3);
		t.end();
	});
});

test('assertions return promises', function (t) {
	ava(function (a) {
		a.plan(2);
		t.ok(isPromise(a.throws(Promise.reject(new Error('foo')))));
		t.ok(isPromise(a.doesNotThrow(Promise.resolve(true))));
	}).run().then(function (result) {
		t.is(result.passed, true);
		t.end();
	});
});

test('contextRef', function (t) {
	new _ava('foo',
		function (a) {
			t.same(a.context, {foo: 'bar'});
			t.end();
		},
		{context: {foo: 'bar'}}
	).run();
});
