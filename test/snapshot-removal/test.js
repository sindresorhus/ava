const test = require('@ava/test');
const exec = require('../helpers/exec');
const {testSnapshotPruning, withTemporaryFixture} = require('./helpers/macros');
const fs = require('fs').promises;
const path = require('path');

// To update fixture snapshots, set to true and run:
// npx test-ava test/snapshot-removal/**
const updating = false;

let macro = (t, {cwd, ...options}) =>
	withTemporaryFixture(t, cwd, (t, temporary) =>
		testSnapshotPruning(t, {cwd: temporary, ...options}));

if (updating) {
	macro = async (t, options) => {
		const {
			cwd,
			env
		} = options;
		let {
			snapshotPath = 'test.js.snap',
			reportPath = 'test.js.md'
		} = options;
		snapshotPath = path.join(cwd, snapshotPath);
		reportPath = path.join(cwd, reportPath);

		// Execute fixture as template to generate snapshots
		const templateResult = exec.fixture(['--update-snapshots'], {
			cwd,
			env: {
				...env,
				AVA_FORCE_CI: 'not-ci',
				TEMPLATE: 'true'
			}
		});

		await t.notThrowsAsync(templateResult, 'Template crashed - there\'s a bug in the test');

		// Check that the snapshots were created
		await t.notThrowsAsync(fs.access(snapshotPath), 'Template didn\'t create a snapshot - there\'s a bug in the test');
		await t.notThrowsAsync(fs.access(reportPath), 'Template didn\'t create a report - there\'s a bug in the test');
	};
}

test('snapshots are removed when tests stop using them', macro, {
	cwd: exec.cwd('removal'),
	cli: ['--update-snapshots'],
	remove: true
});

test('snapshots are removed from a snapshot directory', macro, {
	cwd: exec.cwd('snapshot-dir'),
	cli: ['--update-snapshots'],
	remove: true,
	snapshotPath: path.join('test', 'snapshots', 'test.js.snap'),
	reportPath: path.join('test', 'snapshots', 'test.js.md')
});

test('snapshots are removed from a custom snapshotDir', macro, {
	cwd: exec.cwd('fixed-snapshot-dir'),
	cli: ['--update-snapshots'],
	remove: true,
	snapshotPath: path.join('fixedSnapshotDir', 'test.js.snap'),
	reportPath: path.join('fixedSnapshotDir', 'test.js.md')
});

test('removing non-existent snapshots doesn\'t throw', withTemporaryFixture, exec.cwd('no-snapshots'), async (t, cwd) => {
	// Execute fixture; this should try to unlink the nonexistent snapshots, and
	// should not throw
	const run = exec.fixture(['--update-snapshots'], {
		cwd,
		env: {
			AVA_FORCE_CI: 'not-ci'
		}
	});

	await t.notThrowsAsync(run);
});

test(
	'without --update-snapshots, invalid .snaps are retained',
	withTemporaryFixture,
	exec.cwd('no-snapshots'),
	async (t, cwd) => {
		const snapPath = path.join(cwd, 'test.js.snap');
		const invalid = Buffer.of(0x0A, 0x00, 0x00);
		await fs.writeFile(snapPath, invalid);

		await exec.fixture([], {cwd});

		await t.notThrowsAsync(fs.access(snapPath));
		t.deepEqual(await fs.readFile(snapPath), invalid);
	}
);

test(
	'with --update-snapshots, invalid .snaps are removed',
	withTemporaryFixture,
	exec.cwd('no-snapshots'),
	async (t, cwd) => {
		const snapPath = path.join(cwd, 'test.js.snap');
		const invalid = Buffer.of(0x0A, 0x00, 0x00);
		await fs.writeFile(snapPath, invalid);

		await exec.fixture(['--update-snapshots'], {cwd});

		await t.throwsAsync(fs.access(snapPath), {code: 'ENOENT'}, 'Expected snapshot to be removed');
	}
);

test('snapshots remain if not updating', macro, {
	cwd: exec.cwd('removal'),
	cli: [],
	remove: false
});

test('snapshots remain if they are still used', macro, {
	cwd: exec.cwd('removal'),
	cli: ['--update-snapshots'],
	remove: false,
	env: {
		TEMPLATE: 'true'
	},
	async checkRun(t, run) {
		await t.notThrowsAsync(run, 'Expected fixture not to throw');
		const result = await run;
		t.snapshot(result.stats.passed, 'passed tests');
	}
});

test('snapshots remain if tests run with --match', macro, {
	cwd: exec.cwd('removal'),
	cli: ['--update-snapshots', '--match=\'*another*\''],
	remove: false,
	checkRun: async (t, run) => {
		await t.notThrowsAsync(run, 'Expected fixture not to throw');
		const result = await run;
		t.snapshot(result.stats.passed, 'passed tests');
	}
});

test('snapshots removed if --match selects all tests', macro, {
	cwd: exec.cwd('removal'),
	cli: ['--update-snapshots', '--match=\'*snapshot*\''],
	remove: true,
	checkRun: async (t, run) => {
		await t.notThrowsAsync(run, 'Expected fixture not to throw');
		const result = await run;
		t.snapshot(result.stats.passed, 'passed tests');
	}
});

test('snapshots remain if tests selected by line numbers', macro, {
	cwd: exec.cwd('removal'),
	cli: ['test.js:10-17', '--update-snapshots'],
	remove: false,
	checkRun: async (t, run) => {
		await t.notThrowsAsync(run, 'Expected fixture not to throw');
		const result = await run;
		t.snapshot(result.stats.passed, 'passed tests');
	}
});

test('snapshots removed if line numbers select all tests', macro, {
	cwd: exec.cwd('removal'),
	cli: ['test.js:0-100', '--update-snapshots'],
	remove: true,
	checkRun: async (t, run) => {
		await t.notThrowsAsync(run, 'Expected fixture not to throw');
		const result = await run;
		t.snapshot(result.stats.passed, 'passed tests');
	}
});

test('snapshots remain if using test.only', macro, {
	cwd: exec.cwd('only-test'),
	cli: ['--update-snapshots'],
	remove: false,
	checkRun: async (t, run) => {
		await t.notThrowsAsync(run, 'Expected fixture not to throw');
	}
});

test('snapshots remain if tests are skipped', macro, {
	cwd: exec.cwd('skipped-tests'),
	cli: ['--update-snapshots'],
	remove: false,
	checkRun: async (t, run) => {
		await t.notThrowsAsync(run, 'Expected fixture not to throw');
	}
});

test('snapshots remain if snapshot assertions are skipped', macro, {
	cwd: exec.cwd('skipped-snapshots'),
	cli: ['--update-snapshots'],
	remove: false,
	checkRun: async (t, run) => {
		await t.notThrowsAsync(run, 'Expected fixture not to throw');
	}
});

// This behavior is consistent with the expectation that discarded attempts
// should have no effect.
test('snapshots removed if used in a discarded try()', macro, {
	cwd: exec.cwd('try'),
	cli: ['--update-snapshots'],
	remove: true
});

// This behavior is consistent with the expectation that discarded attempts
// should have no effect.
test('snapshots removed if skipped in a discarded try()', macro, {
	cwd: exec.cwd('skipped-snapshots-in-try'),
	cli: ['--update-snapshots'],
	remove: true,
	checkRun: async (t, run) => {
		await t.notThrowsAsync(run, 'Expected fixture not to throw');
	}
});
