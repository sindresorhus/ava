'use strict';
const test = require('tap').test;
const Promise = require('bluebird');
const Sequence = require('../lib/sequence');

function pass(val) {
	return {
		run() {
			return {
				passed: true,
				result: val
			};
		}
	};
}

function fail(val) {
	return {
		run() {
			return {
				passed: false,
				reason: val
			};
		}
	};
}

function passAsync(val) {
	return {
		run() {
			return Promise.resolve({
				passed: true,
				result: val
			});
		}
	};
}

function failAsync(err) {
	return {
		run() {
			return Promise.resolve({
				passed: false,
				reason: err
			});
		}
	};
}

function reject(err) {
	return {
		run() {
			return Promise.reject(err);
		}
	};
}

test('all sync - no failure - no bail', t => {
	const result = new Sequence(
		[
			pass('a'),
			pass('b'),
			pass('c')
		],
		false
	).run();

	t.strictDeepEqual(result, {
		passed: true,
		reason: null,
		result: [
			{
				passed: true,
				result: 'a'
			},
			{
				passed: true,
				result: 'b'
			},
			{
				passed: true,
				result: 'c'
			}
		]
	});
	t.end();
});

test('all sync - no failure - bail', t => {
	const result = new Sequence(
		[
			pass('a'),
			pass('b'),
			pass('c')
		],
		true
	).run();

	t.strictDeepEqual(result, {
		passed: true,
		reason: null,
		result: [
			{
				passed: true,
				result: 'a'
			},
			{
				passed: true,
				result: 'b'
			},
			{
				passed: true,
				result: 'c'
			}
		]
	});
	t.end();
});

test('all sync - begin failure - no bail', t => {
	const result = new Sequence(
		[
			fail('a'),
			pass('b'),
			pass('c')
		],
		false
	).run();

	t.strictDeepEqual(result, {
		passed: false,
		reason: 'a',
		result: [
			{
				passed: false,
				reason: 'a'
			},
			{
				passed: true,
				result: 'b'
			},
			{
				passed: true,
				result: 'c'
			}
		]
	});
	t.end();
});

test('all sync - mid failure - no bail', t => {
	const result = new Sequence(
		[
			pass('a'),
			fail('b'),
			pass('c')
		],
		false
	).run();

	t.strictDeepEqual(result, {
		passed: false,
		reason: 'b',
		result: [
			{
				passed: true,
				result: 'a'},
			{
				passed: false,
				reason: 'b'
			},
			{
				passed: true,
				result: 'c'
			}
		]
	});
	t.end();
});

test('all sync - end failure - no bail', t => {
	const result = new Sequence(
		[
			pass('a'),
			pass('b'),
			fail('c')
		],
		false
	).run();

	t.strictDeepEqual(result, {
		passed: false,
		reason: 'c',
		result: [
			{
				passed: true,
				result: 'a'
			},
			{
				passed: true,
				result: 'b'
			},
			{
				passed: false,
				reason: 'c'
			}
		]
	});
	t.end();
});

test('all sync - multiple failure - no bail', t => {
	const result = new Sequence(
		[
			fail('a'),
			pass('b'),
			fail('c')
		],
		false
	).run();

	t.strictDeepEqual(result, {
		passed: false,
		reason: 'a',
		result: [
			{
				passed: false,
				reason: 'a'
			},
			{
				passed: true,
				result: 'b'
			},
			{
				passed: false,
				reason: 'c'
			}
		]
	});
	t.end();
});

test('all sync - begin failure - bail', t => {
	const result = new Sequence(
		[
			fail('a'),
			pass('b'),
			pass('c')
		],
		true
	).run();

	t.strictDeepEqual(result, {
		passed: false,
		reason: 'a',
		result: [
			{
				passed: false,
				reason: 'a'
			}
		]
	});
	t.end();
});

test('all sync - mid failure - bail', t => {
	const result = new Sequence(
		[
			pass('a'),
			fail('b'),
			pass('c')
		],
		true
	).run();

	t.strictDeepEqual(result, {
		passed: false,
		reason: 'b',
		result: [
			{
				passed: true,
				result: 'a'
			},
			{
				passed: false,
				reason: 'b'
			}
		]
	});
	t.end();
});

test('all sync - end failure - bail', t => {
	const result = new Sequence(
		[
			pass('a'),
			pass('b'),
			fail('c')
		],
		true
	).run();

	t.strictDeepEqual(result, {
		passed: false,
		reason: 'c',
		result: [
			{
				passed: true,
				result: 'a'
			},
			{
				passed: true,
				result: 'b'
			},
			{
				passed: false,
				reason: 'c'
			}
		]
	});
	t.end();
});

test('all async - no failure - no bail', t => {
	new Sequence(
		[
			passAsync('a'),
			passAsync('b'),
			passAsync('c')
		],
		false
	).run().then(result => {
		t.strictDeepEqual(result, {
			passed: true,
			reason: null,
			result: [
				{
					passed: true,
					result: 'a'
				},
				{
					passed: true,
					result: 'b'
				},
				{
					passed: true,
					result: 'c'
				}
			]
		});
		t.end();
	});
});

test('all async - no failure - bail', t => {
	new Sequence(
		[
			passAsync('a'),
			passAsync('b'),
			passAsync('c')
		],
		true
	).run().then(result => {
		t.strictDeepEqual(result, {
			passed: true,
			reason: null,
			result: [
				{
					passed: true,
					result: 'a'
				},
				{
					passed: true,
					result: 'b'
				},
				{
					passed: true,
					result: 'c'
				}
			]
		});
		t.end();
	});
});

test('last async - no failure - no bail', t => {
	new Sequence(
		[
			pass('a'),
			pass('b'),
			passAsync('c')
		],
		false
	).run().then(result => {
		t.strictDeepEqual(result, {
			passed: true,
			reason: null,
			result: [
				{
					passed: true,
					result: 'a'
				},
				{
					passed: true,
					result: 'b'
				},
				{
					passed: true,
					result: 'c'
				}
			]
		});
		t.end();
	});
});

test('mid async - no failure - no bail', t => {
	new Sequence(
		[
			pass('a'),
			passAsync('b'),
			pass('c')
		],
		false
	).run().then(result => {
		t.strictDeepEqual(result, {
			passed: true,
			reason: null,
			result: [
				{
					passed: true,
					result: 'a'
				},
				{
					passed: true,
					result: 'b'
				},
				{
					passed: true,
					result: 'c'
				}
			]
		});
		t.end();
	});
});

test('first async - no failure - no bail', t => {
	new Sequence(
		[
			passAsync('a'),
			pass('b'),
			pass('c')
		],
		false
	).run().then(result => {
		t.strictDeepEqual(result, {
			passed: true,
			reason: null,
			result: [
				{
					passed: true,
					result: 'a'
				},
				{
					passed: true,
					result: 'b'
				},
				{
					passed: true,
					result: 'c'
				}
			]
		});
		t.end();
	});
});

test('last async - no failure - bail', t => {
	new Sequence(
		[
			pass('a'),
			pass('b'),
			passAsync('c')
		],
		true
	).run().then(result => {
		t.strictDeepEqual(result, {
			passed: true,
			reason: null,
			result: [
				{
					passed: true,
					result: 'a'
				},
				{
					passed: true,
					result: 'b'
				},
				{
					passed: true,
					result: 'c'
				}
			]
		});
		t.end();
	});
});

test('mid async - no failure - bail', t => {
	new Sequence(
		[
			pass('a'),
			passAsync('b'),
			pass('c')
		],
		true
	).run().then(result => {
		t.strictDeepEqual(result, {
			passed: true,
			reason: null,
			result: [
				{
					passed: true,
					result: 'a'
				},
				{
					passed: true,
					result: 'b'
				},
				{
					passed: true,
					result: 'c'
				}
			]
		});
		t.end();
	});
});

test('first async - no failure - bail', t => {
	new Sequence(
		[
			passAsync('a'),
			pass('b'),
			pass('c')
		],
		true
	).run().then(result => {
		t.strictDeepEqual(result, {
			passed: true,
			reason: null,
			result: [
				{
					passed: true,
					result: 'a'
				},
				{
					passed: true,
					result: 'b'
				},
				{
					passed: true,
					result: 'c'
				}
			]
		});
		t.end();
	});
});

test('all async - begin failure - bail', t => {
	new Sequence(
		[
			failAsync('a'),
			passAsync('b'),
			passAsync('c')
		],
		true
	).run().then(result => {
		t.strictDeepEqual(result, {
			passed: false,
			reason: 'a',
			result: [
				{
					passed: false,
					reason: 'a'
				}
			]
		});
		t.end();
	});
});

test('all async - mid failure - bail', t => {
	new Sequence(
		[
			passAsync('a'),
			failAsync('b'),
			passAsync('c')
		],
		true
	).run().then(result => {
		t.strictDeepEqual(result, {
			passed: false,
			reason: 'b',
			result: [
				{
					passed: true,
					result: 'a'
				},
				{
					passed: false,
					reason: 'b'
				}
			]
		});
		t.end();
	});
});

test('all async - end failure - bail', t => {
	new Sequence(
		[
			passAsync('a'),
			passAsync('b'),
			failAsync('c')
		],
		true
	).run().then(result => {
		t.strictDeepEqual(result, {
			passed: false,
			reason: 'c',
			result: [
				{
					passed: true,
					result: 'a'
				},
				{
					passed: true,
					result: 'b'
				},
				{
					passed: false,
					reason: 'c'
				}
			]
		});
		t.end();
	});
});

test('all async - begin failure - no bail', t => {
	new Sequence(
		[
			failAsync('a'),
			passAsync('b'),
			passAsync('c')
		],
		false
	).run().then(result => {
		t.strictDeepEqual(result, {
			passed: false,
			reason: 'a',
			result: [
				{
					passed: false,
					reason: 'a'
				},
				{
					passed: true,
					result: 'b'
				},
				{
					passed: true,
					result: 'c'
				}
			]
		});
		t.end();
	});
});

test('all async - mid failure - no bail', t => {
	new Sequence(
		[
			passAsync('a'),
			failAsync('b'),
			passAsync('c')
		],
		false
	).run().then(result => {
		t.strictDeepEqual(result, {
			passed: false,
			reason: 'b',
			result: [
				{
					passed: true,
					result: 'a'
				},
				{
					passed: false,
					reason: 'b'
				},
				{
					passed: true,
					result: 'c'
				}
			]
		});
		t.end();
	});
});

test('all async - end failure - no bail', t => {
	new Sequence(
		[
			passAsync('a'),
			passAsync('b'),
			failAsync('c')
		],
		false
	).run().then(result => {
		t.strictDeepEqual(result, {
			passed: false,
			reason: 'c',
			result: [
				{
					passed: true,
					result: 'a'
				},
				{
					passed: true,
					result: 'b'
				},
				{
					passed: false,
					reason: 'c'
				}
			]
		});
		t.end();
	});
});

test('all async - multiple failure - no bail', t => {
	new Sequence(
		[
			failAsync('a'),
			passAsync('b'),
			failAsync('c')
		],
		false
	).run().then(result => {
		t.strictDeepEqual(result, {
			passed: false,
			reason: 'a',
			result: [
				{
					passed: false,
					reason: 'a'
				},
				{
					passed: true,
					result: 'b'
				},
				{
					passed: false,
					reason: 'c'
				}
			]
		});
		t.end();
	});
});

test('rejections are just passed through - no bail', t => {
	new Sequence(
		[
			pass('a'),
			pass('b'),
			reject('foo')
		],
		false
	).run().catch(err => {
		t.is(err, 'foo');
		t.end();
	});
});

test('rejections are just passed through - bail', t => {
	new Sequence(
		[
			pass('a'),
			pass('b'),
			reject('foo')
		],
		true
	).run().catch(err => {
		t.is(err, 'foo');
		t.end();
	});
});

test('needs at least one sequence item', t => {
	t.throws(() => {
		new Sequence().run();
	}, {message: 'Sequence items can\'t be undefined'});
	t.end();
});

test('sequences of sequences', t => {
	const result = new Sequence([
		new Sequence([pass('a'), pass('b')]),
		new Sequence([pass('c')])
	]).run();

	t.strictDeepEqual(result, {
		passed: true,
		reason: null,
		result: [
			{
				passed: true,
				reason: null,
				result: [
					{
						passed: true,
						result: 'a'
					},
					{
						passed: true,
						result: 'b'
					}
				]
			},
			{
				passed: true,
				reason: null,
				result: [
					{
						passed: true,
						result: 'c'
					}
				]
			}
		]
	});

	t.end();
});
