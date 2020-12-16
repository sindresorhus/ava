/* eslint-disable ava/no-identical-title */

if (process.env.TEMPLATE) {
	const test = require('ava');

	test('snapshots in try', async t => {
		const attempt = await t.try(tt => {
			tt.snapshot('in try');
		});

		attempt.commit();

		t.assert(true);
	});
} else {
	const test = require('ava');

	test('snapshots in try', async t => {
		const attempt = await t.try(tt => {
			tt.snapshot('in try');
		});

		attempt.discard();

		t.assert(true);
	});
}