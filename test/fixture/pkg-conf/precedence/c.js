import test from '../../../../';
import path from 'path';

const opts = JSON.parse(process.argv[2]);

test('foo', t => {
	t.is(opts.failFast, false);
	t.is(opts.serial, false);
	t.is(opts.cacheEnabled, true);
	t.deepEqual(opts.match, ['foo*']);
	t.deepEqual(opts.require, [
		path.join(__dirname, "required.js")
	]);
});
