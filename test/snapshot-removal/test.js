const test = require('@ava/test');
const exec = require('../helpers/exec');
const {testSnapshotPruning, withTemporaryFixture} = require('./helpers/macros');
const path = require('path');

const macro = withTemporaryFixture(testSnapshotPruning);

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

test('removing non-existent snapshots doesn\'t throw', async t => {
	// Execute fixture; this should try to unlink the nonexistent snapshots, and
	// should not throw
	const run = exec.fixture(['--update-snapshots'], {
		cwd: exec.cwd('no-snapshots'),
		env: {
			AVA_FORCE_CI: 'not-ci'
		}
	});

	await t.notThrowsAsync(run);
});

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
