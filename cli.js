#!/usr/bin/env node
'use strict';
var fs = require('fs');
var path = require('path');
var globby = require('globby');
var meow = require('meow');
var resolveFrom = require('resolve-from');
var updateNotifier = require('update-notifier');

try {
	require(resolveFrom('.', 'babel/register'));
} catch (e) {
	require('babel/register');
}

var cli = meow({
	help: [
		'Usage',
		'  ava <file|folder|glob> [...]',
		'',
		'Examples',
		'  ava',
		'  ava test.js test2.js',
		'  ava test-*.js',
		'',
		'Default patterns when no arguments:',
		'test.js test-*.js test/**'
	]
}, {
	string: ['_']
});

function run(file) {
	fs.stat(file, function (err, stats) {
		if (err) {
			console.error(err.message);
			process.exit(1);
		}

		if (stats.isDirectory()) {
			init(path.join(file, '*.js'));
			return;
		}

		require(file);
	});
}

function init(files) {
	if (files.length === 0) {
		files = [
			'test.js',
			'test-*.js',
			'test/**'
		];
	}

	globby(files, function (err, files) {
		if (err) {
			console.error(err.message);
			process.exit(1);
		}

		files.forEach(function (file) {
			run(path.resolve(process.cwd(), file));
		});
	});
}

updateNotifier({pkg: cli.pkg}).notify();

init(cli.input);
