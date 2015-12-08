'use strict';
var path = require('path');
var test = require('tap').test;
var Api = require('../api');

test('ES2015 support', function (t) {
	t.plan(1);

	var api = new Api([path.join(__dirname, 'fixture/es2015.js')]);

	api.run()
		.then(function () {
			t.same(api.passCount, 1);
		});
});

test('generators support', function (t) {
	t.plan(1);

	var api = new Api([path.join(__dirname, 'fixture/generators.js')]);

	api.run()
		.then(function () {
			t.same(api.passCount, 1);
		});
});

test('async/await support', function (t) {
	t.plan(1);

	var api = new Api([path.join(__dirname, 'fixture/async-await.js')]);

	api.run()
		.then(function () {
			t.same(api.passCount, 2);
		});
});

test('display filename prefixes for failed test stack traces', function (t) {
	t.plan(3);

	var files = [
		path.join(__dirname, 'fixture/es2015.js'),
		path.join(__dirname, 'fixture/one-pass-one-fail.js')
	];

	var api = new Api(files);

	api.run()
		.then(function () {
			t.same(api.passCount, 2);
			t.same(api.failCount, 1);
			t.match(api.errors[0].title, /test › fixture › one-pass-one-fail › this is a failing test/);
		});
});

test('fail-fast mode', function (t) {
	t.plan(4);

	var api = new Api([path.join(__dirname, 'fixture/fail-fast.js')], {
		failFast: true
	});

	api.run()
		.then(function () {
			t.ok(api.failFast);
			t.same(api.passCount, 1);
			t.same(api.failCount, 1);
			t.true(/false fail false/.test(api.errors[0].error.message));
		});
});

test('serial execution mode', function (t) {
	t.plan(2);

	var api = new Api([path.join(__dirname, 'fixture/async-await.js')], {
		serial: true
	});

	api.run()
		.then(function () {
			t.ok(api.serial);
			t.same(api.passCount, 2);
		});
});

test('circular references on assertions do not break process.send', function (t) {
	t.plan(2);

	var api = new Api([path.join(__dirname, 'fixture/circular-reference-on-assertion.js')]);

	api.run()
		.then(function () {
			t.same(api.failCount, 1);
			t.true(/'c'.*?'d'/.test(api.errors[0].error.message));
		});
});

test('change process.cwd() to a test\'s directory', function (t) {
	t.plan(1);

	var api = new Api([path.join(__dirname, 'fixture/process-cwd.js')]);

	api.run()
		.then(function () {
			t.same(api.passCount, 1);
		});
});

test('babel require hook only applies to the test file', function (t) {
	t.plan(3);

	var api = new Api([path.join(__dirname, 'fixture/babel-hook.js')]);

	api.on('error', function (data) {
		t.same(data.name, 'SyntaxError');
		t.true(/Unexpected token/.test(data.message));
	});

	api.run()
		.catch(function (err) {
			t.ok(err);
		});
});

test('unhandled promises will throw an error', function (t) {
	t.plan(3);

	var api = new Api([path.join(__dirname, 'fixture/loud-rejection.js')]);

	api.on('error', function (data) {
		t.same(data.name, 'Error');
		t.true(/You can\'t handle this!/.test(data.message));
	});

	api.run()
		.then(function () {
			t.same(api.passCount, 1);
		});
});

test('uncaught exception will throw an error', function (t) {
	t.plan(3);

	var api = new Api([path.join(__dirname, 'fixture/uncaught-exception.js')]);

	api.on('error', function (data) {
		t.same(data.name, 'Error');
		t.true(/Can\'t catch me!/.test(data.message));
	});

	api.run()
		.then(function () {
			t.same(api.passCount, 1);
		});
});

test('stack traces for exceptions are corrected using a source map', function (t) {
	t.plan(4);

	var api = new Api([path.join(__dirname, 'fixture/source-map-exception.js')]);

	api.on('error', function (data) {
		t.true(/Can't catch me!/.test(data.message));
		t.match(data.stack, /^.*?at.*?bar\b.*source-map-exception.js:12.*$/m);
		t.match(data.stack, /^.*?at.*?foo\b.*source-map-exception.js:8.*$/m);
	});

	api.run()
		.then(function () {
			t.same(api.passCount, 1);
		});
});

test('stack traces for exceptions are corrected using a source map, found via a pragma', function (t) {
	t.plan(4);

	var api = new Api([path.join(__dirname, 'fixture/source-map-pragma-exception.js')]);

	api.on('error', function (data) {
		t.true(/Can't catch me!/.test(data.message));
		t.match(data.stack, /^.*?at.*?bar\b.*source-with-source-map-pragma.js:8.*$/m);
		t.match(data.stack, /^.*?at.*?foo\b.*source-with-source-map-pragma.js:4.*$/m);
	});

	api.run()
		.then(function () {
			t.same(api.passCount, 1);
		});
});

test('absolute paths', function (t) {
	t.plan(1);

	var api = new Api([path.resolve('test/fixture/es2015.js')]);

	api.run()
		.then(function () {
			t.same(api.passCount, 1);
		});
});

test('titles of both passing and failing tests and AssertionErrors are displayed', function (t) {
	t.plan(3);

	var api = new Api([path.join(__dirname, 'fixture/one-pass-one-fail.js')]);

	api.run()
		.then(function () {
			t.true(/this is a failing test/.test(api.errors[0].title));
			t.true(/this is a passing test/.test(api.tests[0].title));
			t.true(/AssertionError/.test(api.errors[0].error.name));
		});
});

test('empty test files creates a failure with a helpful warning', function (t) {
	t.plan(2);

	var api = new Api([path.join(__dirname, 'fixture/empty.js')]);

	api.run()
		.catch(function (err) {
			t.ok(err);
			t.true(/No tests found.*?import "ava"/.test(err.message));
		});
});

test('test file with no tests creates a failure with a helpful warning', function (t) {
	t.plan(2);

	var api = new Api([path.join(__dirname, 'fixture/no-tests.js')]);

	api.run()
		.catch(function (err) {
			t.ok(err);
			t.true(/No tests/.test(err.message));
		});
});

test('test file that immediately exits with 0 exit code ', function (t) {
	t.plan(2);

	var api = new Api([path.join(__dirname, 'fixture/immediate-0-exit.js')]);

	api.run()
		.catch(function (err) {
			t.ok(err);
			t.true(/Test results were not received from/.test(err.message));
		});
});

test('test file in node_modules is ignored', function (t) {
	t.plan(2);

	var api = new Api([path.join(__dirname, 'fixture/node_modules/test.js')]);

	api.run()
		.catch(function (err) {
			t.ok(err);
			t.true(/Couldn't find any files to test/.test(err.message));
		});
});
