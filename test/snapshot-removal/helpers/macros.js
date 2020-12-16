const fs = require('fs').promises;
const exec = require('../../helpers/exec');
const path = require('path');

async function testSnapshotPruning(t, {
	cwd,
	ci = 'not-ci',
	cli,
	remove,
	error = false,
	snapshotPath = 'test.js.snap',
	reportPath = 'test.js.md'
}) {
	snapshotPath = path.join(cwd, snapshotPath);
	reportPath = path.join(cwd, reportPath);

	t.teardown(async () => {
		try {
			await fs.unlink(snapshotPath);
			await fs.unlink(reportPath);
		} catch {}
	});

	// Execute fixture as template to generate snapshots
	const templateResult = exec.fixture(['--update-snapshots'], {
		cwd,
		env: {
			AVA_FORCE_CI: 'not-ci',
			TEMPLATE: 'true'
		}
	});

	await t.notThrowsAsync(templateResult, 'Template crashed - there\'s a bug in the test');

	// Check that the snapshots were created
	await t.notThrowsAsync(fs.access(snapshotPath), 'Template didn\'t create a snapshot - there\'s a bug in the test');
	await t.notThrowsAsync(fs.access(reportPath), 'Template didn\'t create a report - there\'s a bug in the test');

	// Execute fixture as run
	const runResult = exec.fixture(cli, {
		cwd,
		env: {
			AVA_FORCE_CI: ci
		}
	});

	await (error ?
		t.throwsAsync(runResult, error === true ? undefined : error, 'Expected fixture to throw.') :
		t.notThrowsAsync(runResult, 'Expected fixture not to throw.'));

	if (remove) {
		// Assert files don't exist
		await t.throwsAsync(fs.access(snapshotPath), {code: 'ENOENT'}, 'Expected snapshot to be removed');
		await t.throwsAsync(fs.access(reportPath), {code: 'ENOENT'}, 'Expected report to be remove');
	} else {
		// Assert files exist
		await t.notThrowsAsync(fs.access(snapshotPath), 'Expected snapshot not to be removed');
		await t.notThrowsAsync(fs.access(reportPath), 'Expected report not to be removed');
	}
}

module.exports.testSnapshotPruning = testSnapshotPruning;