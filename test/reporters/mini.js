'use strict';
var chalk = require('chalk');
var test = require('tap').test;
var cross = require('figures').cross;
var lolex = require('lolex');
var repeating = require('repeating');
var AvaError = require('../../lib/ava-error');
var _miniReporter = require('../../lib/reporters/mini');
var beautifyStack = require('../../lib/reporters/helpers/beautify-stack');
var colors = require('../../lib/reporters/helpers/colors');
var compareLineOutput = require('../helper/compare-line-output');

chalk.enabled = true;

var graySpinner = chalk.gray.dim(process.platform === 'win32' ? '-' : '⠋');

// Needed because tap doesn't emulate a tty environment and thus this is
// undefined, making `cli-truncate` append '...' to test titles
process.stdout.columns = 5000;
var fullWidthLine = chalk.gray.dim(repeating('\u2500', 5000));

function miniReporter(options) {
	var reporter = _miniReporter(options);
	reporter.start = function () {
		return '';
	};
	return reporter;
}

process.stderr.setMaxListeners(50);

test('start', function (t) {
	var reporter = _miniReporter();

	t.is(reporter.start(), ' \n ' + graySpinner + ' ');
	reporter.clearInterval();
	t.end();
});

test('passing test', function (t) {
	var reporter = miniReporter();

	var actualOutput = reporter.test({
		title: 'passed'
	});

	var expectedOutput = [
		' ',
		' ' + graySpinner + ' passed',
		'',
		'   ' + chalk.green('1 passed')
	].join('\n');

	t.is(actualOutput, expectedOutput);
	t.end();
});

test('known failure test', function (t) {
	var reporter = miniReporter();

	var actualOutput = reporter.test({
		title: 'known failure',
		failing: true
	});

	var expectedOutput = [
		' ',
		' ' + graySpinner + ' ' + chalk.red('known failure'),
		'',
		'   ' + chalk.green('1 passed'),
		'   ' + chalk.red('1 known failure')
	].join('\n');

	t.is(actualOutput, expectedOutput);
	t.end();
});

test('failing test', function (t) {
	var reporter = miniReporter();

	var actualOutput = reporter.test({
		title: 'failed',
		error: {
			message: 'assertion failed'
		}
	});

	var expectedOutput = [
		' ',
		' ' + graySpinner + ' ' + chalk.red('failed'),
		'',
		'   ' + chalk.red('1 failed')
	].join('\n');

	t.is(actualOutput, expectedOutput);
	t.end();
});

test('failed known failure test', function (t) {
	var reporter = miniReporter();

	var actualOutput = reporter.test({
		title: 'known failure',
		failing: true,
		error: {
			message: 'Test was expected to fail, but succeeded, you should stop marking the test as failing'
		}
	});

	var expectedOutput = [
		' ',
		' ' + graySpinner + ' ' + chalk.red('known failure'),
		'',
		'   ' + chalk.red('1 failed')
	].join('\n');

	t.is(actualOutput, expectedOutput);
	t.end();
});

test('passing test after failing', function (t) {
	var reporter = miniReporter();

	reporter.test({
		title: 'failed',
		error: {
			message: 'assertion failed'
		}
	});

	var actualOutput = reporter.test({title: 'passed'});

	var expectedOutput = [
		' ',
		' ' + graySpinner + ' passed',
		'',
		'   ' + chalk.green('1 passed'),
		'   ' + chalk.red('1 failed')
	].join('\n');

	t.is(actualOutput, expectedOutput);
	t.end();
});

test('failing test after passing', function (t) {
	var reporter = miniReporter();

	reporter.test({title: 'passed'});

	var actualOutput = reporter.test({
		title: 'failed',
		error: {
			message: 'assertion failed'
		}
	});

	var expectedOutput = [
		' ',
		' ' + graySpinner + ' ' + chalk.red('failed'),
		'',
		'   ' + chalk.green('1 passed'),
		'   ' + chalk.red('1 failed')
	].join('\n');

	t.is(actualOutput, expectedOutput);
	t.end();
});

test('skipped test', function (t) {
	var reporter = miniReporter();

	var output = reporter.test({
		title: 'skipped',
		skip: true
	});

	t.false(output);
	t.end();
});

test('todo test', function (t) {
	var reporter = miniReporter();

	var output = reporter.test({
		title: 'todo',
		skip: true,
		todo: true
	});

	t.false(output);
	t.end();
});

test('results with passing tests', function (t) {
	var reporter = miniReporter();
	reporter.passCount = 1;
	reporter.failCount = 0;

	var actualOutput = reporter.finish({});
	var expectedOutput = [
		'\n   ' + chalk.green('1 passed'),
		''
	].join('\n');

	t.is(actualOutput, expectedOutput);
	t.end();
});

test('results with passing known failure tests', function (t) {
	var reporter = miniReporter();
	reporter.passCount = 1;
	reporter.knownFailureCount = 1;
	reporter.failCount = 0;

	var runStatus = {
		knownFailures: [{
			title: 'known failure',
			failing: true
		}]
	};
	var actualOutput = reporter.finish(runStatus);
	var expectedOutput = [
		'\n   ' + chalk.green('1 passed'),
		'   ' + chalk.red('1 known failure'),
		'',
		'',
		'   ' + chalk.red('1. known failure'),
		''
	].join('\n');

	t.is(actualOutput, expectedOutput);
	t.end();
});

test('results with skipped tests', function (t) {
	var reporter = miniReporter();
	reporter.passCount = 0;
	reporter.skipCount = 1;
	reporter.failCount = 0;

	var actualOutput = reporter.finish({});
	var expectedOutput = [
		'\n   ' + chalk.yellow('1 skipped'),
		''
	].join('\n');

	t.is(actualOutput, expectedOutput);
	t.end();
});

test('results with todo tests', function (t) {
	var reporter = miniReporter();
	reporter.passCount = 0;
	reporter.todoCount = 1;
	reporter.failCount = 0;

	var actualOutput = reporter.finish({});
	var expectedOutput = [
		'\n   ' + chalk.blue('1 todo'),
		''
	].join('\n');

	t.is(actualOutput, expectedOutput);
	t.end();
});

test('results with passing skipped tests', function (t) {
	var reporter = miniReporter();
	reporter.passCount = 1;
	reporter.skipCount = 1;

	var output = reporter.finish({}).split('\n');

	t.is(output[0], '');
	t.is(output[1], '   ' + chalk.green('1 passed'));
	t.is(output[2], '   ' + chalk.yellow('1 skipped'));
	t.is(output[3], '');
	t.end();
});

test('results with passing tests and rejections', function (t) {
	var reporter = miniReporter();
	reporter.passCount = 1;
	reporter.rejectionCount = 1;

	var err1 = new Error('failure one');
	err1.type = 'rejection';
	err1.stack = beautifyStack(err1.stack);
	var err2 = new Error('failure two');
	err2.type = 'rejection';
	err2.stack = 'stack line with trailing whitespace\t\n';

	var runStatus = {
		errors: [err1, err2]
	};

	var output = reporter.finish(runStatus);
	compareLineOutput(t, output, [
		'',
		'   ' + chalk.green('1 passed'),
		'   ' + chalk.red('1 rejection'),
		'',
		'',
		'   ' + chalk.red('1. Unhandled Rejection'),
		/Error: failure/,
		/test\/reporters\/mini\.js/,
		compareLineOutput.SKIP_UNTIL_EMPTY_LINE,
		'',
		'',
		'   ' + chalk.red('2. Unhandled Rejection'),
		'   ' + colors.stack('stack line with trailing whitespace')
	]);
	t.end();
});

test('results with passing tests and exceptions', function (t) {
	var reporter = miniReporter();
	reporter.passCount = 1;
	reporter.exceptionCount = 2;

	var err = new Error('failure');
	err.type = 'exception';
	err.stack = beautifyStack(err.stack);

	var avaErr = new AvaError('A futuristic test runner');
	avaErr.type = 'exception';

	var runStatus = {
		errors: [err, avaErr]
	};

	var output = reporter.finish(runStatus);
	compareLineOutput(t, output, [
		'',
		'   ' + chalk.green('1 passed'),
		'   ' + chalk.red('2 exceptions'),
		'',
		'',
		'   ' + chalk.red('1. Uncaught Exception'),
		/Error: failure/,
		/test\/reporters\/mini\.js/,
		compareLineOutput.SKIP_UNTIL_EMPTY_LINE,
		'',
		'',
		'   ' + chalk.red(cross + ' A futuristic test runner')
	]);
	t.end();
});

test('results with errors', function (t) {
	var reporter = miniReporter();
	reporter.failCount = 1;

	var err1 = new Error('failure one');
	err1.stack = beautifyStack(err1.stack);
	var err2 = new Error('failure two');
	err2.stack = 'first line is stripped\nstack line with trailing whitespace\t\n';

	var runStatus = {
		errors: [{
			title: 'failed one',
			error: err1
		}, {
			title: 'failed two',
			error: err2
		}]
	};

	var output = reporter.finish(runStatus);
	compareLineOutput(t, output, [
		'',
		'   ' + chalk.red('1 failed'),
		'',
		'',
		'   ' + chalk.red('1. failed one'),
		/failure/,
		/test\/reporters\/mini\.js/,
		compareLineOutput.SKIP_UNTIL_EMPTY_LINE,
		'',
		'',
		'   ' + chalk.red('2. failed two')
	].concat(
		colors.stack('   failure two\n  stack line with trailing whitespace').split('\n')
	));
	t.end();
});

test('results with 1 previous failure', function (t) {
	var reporter = miniReporter();
	reporter.todoCount = 1;

	var runStatus = {
		previousFailCount: 1
	};

	var output = reporter.finish(runStatus);
	compareLineOutput(t, output, [
		'',
		'   ' + colors.todo('1 todo'),
		'   ' + colors.error('1 previous failure in test files that were not rerun')
	]);
	t.end();
});

test('results with 2 previous failures', function (t) {
	var reporter = miniReporter();
	reporter.todoCount = 1;

	var runStatus = {
		previousFailCount: 2
	};

	var output = reporter.finish(runStatus);
	compareLineOutput(t, output, [
		'',
		'   ' + colors.todo('1 todo'),
		'   ' + colors.error('2 previous failures in test files that were not rerun')
	]);
	t.end();
});

test('empty results after reset', function (t) {
	var reporter = miniReporter();

	reporter.failCount = 1;
	reporter.reset();

	var output = reporter.finish({});
	t.is(output, '\n');
	t.end();
});

test('full-width line when sectioning', function (t) {
	var reporter = miniReporter();

	var output = reporter.section();
	t.is(output, '\n' + fullWidthLine);
	t.end();
});

test('results with watching enabled', function (t) {
	lolex.install(new Date(2014, 11, 19, 17, 19, 12, 200).getTime(), ['Date']);
	var time = ' ' + chalk.grey.dim('[17:19:12]');

	var reporter = miniReporter({watching: true});
	reporter.passCount = 1;
	reporter.failCount = 0;

	var actualOutput = reporter.finish({});
	var expectedOutput = [
		'\n   ' + chalk.green('1 passed') + time,
		''
	].join('\n');

	t.is(actualOutput, expectedOutput);
	t.end();
});
