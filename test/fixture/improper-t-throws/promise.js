import test from '../../..';

test('test', t => {
	return Promise.resolve().then(() => {
		t.throws(throwSync());
	});
});

function throwSync() {
	throw new Error('should be detected');
}
