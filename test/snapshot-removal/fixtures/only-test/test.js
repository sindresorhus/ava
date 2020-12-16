/* eslint-disable capitalized-comments, ava/no-only-test, ava/no-identical-title */

const test = require('ava');

if (process.env.TEMPLATE) {
	test('some snapshots', t => {
		t.snapshot('foo');
		t.snapshot('bar');
		t.assert(true);
	});

	test('another snapshot', t => {
		t.snapshot('baz');
		t.assert(true);
	});
} else {
	test.only('some snapshots', t => {
		// t.snapshot('foo');
		// t.snapshot('bar');
		t.assert(true);
	});

	test('another snapshot', t => {
		// t.snapshot('baz');
		t.assert(true);
	});
}