// @flow
import test from '../../index.js.flow';

test('test', t => {
	t.snapshot({});
	t.snapshot({}, 'a message');
	t.snapshot({}, {id: 'snapshot-id'});
	t.snapshot({}, {id: 'snapshot-id'}, 'a message');

	// $ExpectError Message should be a string
	t.snapshot({}, 1);
	// $ExpectError unknownOption is an unknown options attribute
	t.snapshot({}, {unknownOption: true});
	// $ExpectError Message should be a string
	t.snapshot({}, {id: 'snapshot-id'}, 1);
});
