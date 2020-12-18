const test = require(process.env.AVA_PATH || 'ava');

if (process.env.TEMPLATE) {
	test('some snapshots', t => {
		t.snapshot('foo');
		t.snapshot('bar');
		t.pass();
	});

	test('another snapshot', t => {
		t.snapshot('baz');
		t.pass();
	});
} else {
	test.skip('some snapshots', t => {
		t.pass();
	});

	test('another snapshot', t => {
		t.pass();
	});
}
