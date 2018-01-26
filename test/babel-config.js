'use strict';
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const test = require('tap').test;
const makeDir = require('make-dir');
const uniqueTempDir = require('unique-temp-dir');

const babelConfigHelper = require('../lib/babel-config');

const fixture = name => path.join(__dirname, 'fixture', name);
const setNodeVersion = value => Object.defineProperty(process.versions, 'node', {value});
const resetNodeVersion = setNodeVersion.bind(null, process.versions.node);

// Execute `run` with a given stubbed node version, then reset to the real
// version.
function withNodeVersion(version, run) {
	setNodeVersion(version);
	const promise = new Promise(resolve => {
		resolve(run());
	});
	promise.then(resetNodeVersion, resetNodeVersion);
	return promise;
}

function withNodeEnv(value, run) {
	assert(!('NODE_ENV' in process.env));
	process.env.NODE_ENV = value;
	const reset = () => {
		delete process.env.NODE_ENV;
	};
	const promise = new Promise(resolve => {
		resolve(run());
	});
	promise.then(reset, reset);
	return promise;
}

test('uses default presets when userOptions is "default"', t => {
	const userOptions = 'default';
	const compileEnhancements = true;

	const projectDir = fixture('no-babel-config');
	const cacheDir = path.join(uniqueTempDir(), 'cache');
	return babelConfigHelper.build(projectDir, cacheDir, userOptions, compileEnhancements)
		.then(result => {
			const options = result.getOptions();

			t.false(options.babelrc);
			t.is(options.presets[0][0].wrapped, require('@ava/babel-preset-stage-4'));
			t.is(options.presets[1][0].wrapped, require('@ava/babel-preset-transform-test-files'));
			t.same(options.presets[1][1], {powerAssert: true});
		});
});

test('uses options from babelrc when userOptions is "inherit"', t => {
	const userOptions = 'inherit';
	const compileEnhancements = true;

	const projectDir = fixture('babelrc');
	const cacheDir = path.join(uniqueTempDir(), 'cache');
	return babelConfigHelper.build(projectDir, cacheDir, userOptions, compileEnhancements)
		.then(result => {
			const options = result.getOptions();

			t.false(options.babelrc);
			t.is(options.plugins[0][0].wrapped, require(fixture('babel-plugin-test-doubler')));
			t.is(options.presets[0][0].wrapped, require('@ava/babel-preset-stage-4'));
			t.is(options.presets[1][0].wrapped, require('@ava/babel-preset-transform-test-files'));
			t.same(options.presets[1][1], {powerAssert: true});
		});
});

test('uses userOptions for babel options when userOptions is an object', t => {
	const customFile = require.resolve(fixture('babel-noop-plugin-or-preset'));
	const custom = require(fixture('babel-noop-plugin-or-preset'));
	const userOptions = {
		plugins: [customFile],
		presets: [customFile]
	};
	const compileEnhancements = true;

	const projectDir = fixture('no-babel-config');
	const cacheDir = path.join(uniqueTempDir(), 'cache');
	return babelConfigHelper.build(projectDir, cacheDir, userOptions, compileEnhancements)
		.then(result => {
			const options = result.getOptions();
			t.false(options.babelrc);
			if (options.plugins.length === 1) {
				t.is(options.plugins[0][0].wrapped, custom);
			} else {
				t.is(options.plugins[1][0].wrapped, custom);
			}
			t.is(options.presets[0][0].wrapped, require('@ava/babel-preset-stage-4'));
			t.is(options.presets[1][0].wrapped, custom);
			t.is(options.presets[2][0].wrapped, require('@ava/babel-preset-transform-test-files'));
			t.same(options.presets[2][1], {powerAssert: true});
		});
});

test('userOptions can disable ava/stage-4', t => {
	const userOptions = {
		presets: [['module:ava/stage-4', false]]
	};
	const transpileEnhancements = true;

	const projectDir = uniqueTempDir();
	const cacheDir = path.join(projectDir, 'cache');
	fs.mkdirSync(projectDir);
	fs.mkdirSync(path.join(projectDir, 'node_modules'));
	fs.mkdirSync(path.join(projectDir, 'node_modules', 'ava'));
	fs.writeFileSync(path.join(projectDir, 'node_modules', 'ava', 'stage-4.js'), `module.exports = require(${JSON.stringify(require.resolve('@ava/babel-preset-stage-4'))})`);

	return babelConfigHelper.build(projectDir, cacheDir, userOptions, transpileEnhancements)
		.then(result => {
			const options = result.getOptions();
			t.false(options.babelrc);
			t.is(options.presets[0][0].wrapped, require('@ava/babel-preset-stage-4'));
			t.is(options.presets[0][1], false);
		});
});

test('uses "development" environment if NODE_ENV is the empty string', t => {
	const userOptions = 'inherit';
	const compileEnhancements = true;

	const projectDir = fixture('babelrc');
	const cacheDir = path.join(uniqueTempDir(), 'cache');
	return withNodeEnv('', () => babelConfigHelper.build(projectDir, cacheDir, userOptions, compileEnhancements))
		.then(result => {
			const options = result.getOptions();

			t.false(options.babelrc);
			t.is(options.plugins[0][0].wrapped, require(fixture('babel-plugin-test-capitalizer')));
			t.is(options.presets[0][0].wrapped, require('@ava/babel-preset-stage-4'));
			t.is(options.presets[1][0].wrapped, require('@ava/babel-preset-transform-test-files'));
			t.same(options.presets[1][1], {powerAssert: true});
		});
});

test('supports .babelrc.js files', t => {
	const userOptions = 'inherit';
	const compileEnhancements = true;

	const projectDir = fixture('babelrc-js');
	const cacheDir = path.join(uniqueTempDir(), 'cache');
	return babelConfigHelper.build(projectDir, cacheDir, userOptions, compileEnhancements)
		.then(result => {
			const options = result.getOptions();

			t.false(options.babelrc);
			t.is(options.plugins[0][0].wrapped, require(fixture('babel-plugin-test-doubler')));
			t.is(options.presets[0][0].wrapped, require('@ava/babel-preset-stage-4'));
			t.is(options.presets[1][0].wrapped, require('@ava/babel-preset-transform-test-files'));
			t.same(options.presets[1][1], {powerAssert: true});
		});
});

test('adds babel-plugin-syntax-object-rest-spread for node versions > 8.3.0', t => {
	const projectDir = fixture('no-babel-config');
	const cacheDir = path.join(uniqueTempDir(), 'cache');

	return withNodeVersion('9.0.0', () => babelConfigHelper.build(projectDir, cacheDir, 'default', true))
		.then(result => {
			const options = result.getOptions();
			t.is(options.plugins[0][0].wrapped, require('@babel/plugin-syntax-object-rest-spread').default);
		});
});

test('adds babel-plugin-syntax-object-rest-spread for node versions == 8.3.0', t => {
	const projectDir = fixture('no-babel-config');
	const cacheDir = path.join(uniqueTempDir(), 'cache');

	return withNodeVersion('8.3.0', () => babelConfigHelper.build(projectDir, cacheDir, 'default', true))
		.then(result => {
			const options = result.getOptions();
			t.is(options.plugins[0][0].wrapped, require('@babel/plugin-syntax-object-rest-spread').default);
		});
});

test('does not add babel-plugin-syntax-object-rest-spread for node versions < 8.3.0', t => {
	const projectDir = fixture('no-babel-config');
	const cacheDir = path.join(uniqueTempDir(), 'cache');

	return withNodeVersion('8.2.0', () => babelConfigHelper.build(projectDir, cacheDir, 'default', true))
		.then(result => {
			const options = result.getOptions();
			t.true(!options.plugins);
		});
});

test('should not include transform-test-files when compileEnhancements is false', t => {
	const userOptions = 'default';
	const compileEnhancements = false;

	const projectDir = fixture('no-babel-config');
	const cacheDir = path.join(uniqueTempDir(), 'cache');
	return babelConfigHelper.build(projectDir, cacheDir, userOptions, compileEnhancements)
		.then(result => {
			const options = result.getOptions();

			t.false(options.babelrc);
			t.is(options.presets.length, 1);
		});
});

test('caches and uses results', t => {
	const projectDir = fixture('no-babel-config');
	const cacheDir = path.join(uniqueTempDir(), 'cache');
	return babelConfigHelper.build(projectDir, cacheDir, 'default', true)
		.then(result => {
			const files = fs.readdirSync(cacheDir);
			t.is(files.length, 2);
			t.is(files.filter(f => /\.babel-options\.js$/.test(f)).length, 1);
			t.is(files.filter(f => /\.verifier\.bin$/.test(f)).length, 1);

			const firstCacheKeys = result.cacheKeys;
			const stats = files.map(f => fs.statSync(path.join(cacheDir, f)));
			delete stats[0].atime;
			delete stats[0].atimeMs;
			delete stats[1].atime;
			delete stats[1].atimeMs;

			return babelConfigHelper.build(projectDir, cacheDir, 'default', true)
				.then(result => {
					const newStats = files.map(f => fs.statSync(path.join(cacheDir, f)));
					delete newStats[0].atime;
					delete newStats[0].atimeMs;
					delete newStats[1].atime;
					delete newStats[1].atimeMs;

					t.same(newStats, stats);
					t.same(result.cacheKeys, firstCacheKeys);
				});
		});
});

test('discards cache if userOptions change', t => {
	const projectDir = fixture('no-babel-config');
	const cacheDir = path.join(uniqueTempDir(), 'cache');
	const userOptions = {};
	return babelConfigHelper.build(projectDir, cacheDir, userOptions, true)
		.then(result => {
			const files = fs.readdirSync(cacheDir);
			const contents = files.map(f => fs.readFileSync(path.join(cacheDir, f), 'utf8'));
			const firstCacheKeys = result.cacheKeys;

			userOptions.foo = 'bar';
			return babelConfigHelper.build(projectDir, cacheDir, userOptions, true)
				.then(result => {
					t.notSame(files.map(f => fs.readFileSync(path.join(cacheDir, f), 'utf8')), contents);
					t.notSame(result.cacheKeys, firstCacheKeys);
				});
		});
});

test('updates cached verifier if dependency hashes change', t => {
	const projectDir = fixture('no-babel-config');
	const tempDir = uniqueTempDir();
	const cacheDir = path.join(tempDir, 'cache');
	const depFile = path.join(tempDir, 'plugin.js');

	makeDir.sync(cacheDir);
	fs.writeFileSync(depFile, 'module.exports = () => ({})');

	const userOptions = {
		plugins: [depFile]
	};
	return babelConfigHelper.build(projectDir, cacheDir, userOptions, true)
		.then(result => {
			const verifierFile = fs.readdirSync(cacheDir).find(f => /\.verifier\.bin$/.test(f));
			const contents = fs.readFileSync(path.join(cacheDir, verifierFile), 'utf8');
			const firstCacheKeys = result.cacheKeys;

			fs.writeFileSync(depFile, 'bar');
			return babelConfigHelper.build(projectDir, cacheDir, userOptions, true)
				.then(result => {
					t.notSame(contents, fs.readFileSync(path.join(cacheDir, verifierFile), 'utf8'));
					t.notSame(result.cacheKeys.dependencies, firstCacheKeys.dependencies);
					t.same(result.cacheKeys.sources, firstCacheKeys.sources);
				});
		});
});

test('crashes if cached files cannot be read', t => {
	const projectDir = fixture('no-babel-config');
	const cacheDir = path.join(uniqueTempDir(), 'cache');

	t.plan(1);
	return babelConfigHelper.build(projectDir, cacheDir, 'default', true)
		.then(() => {
			for (const f of fs.readdirSync(cacheDir)) {
				fs.unlinkSync(path.join(cacheDir, f));
				fs.mkdirSync(path.join(cacheDir, f));
			}

			return babelConfigHelper.build(projectDir, cacheDir, 'default', true)
				.catch(err => {
					t.is(err.code, 'EISDIR');
				});
		});
});
