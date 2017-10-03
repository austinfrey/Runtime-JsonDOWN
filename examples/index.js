'use strict';

const runtime = require('runtimejs');
const levelup = require('levelup');
const JsonDOWN = require('jsondown');
const fs = require('./fake-fs');

const db = levelup('/wOOt.json', {db: JsonDOWN});

// Make sure FS is ready before attempting 'put', 'get' etc
fs.on('ready', () => {
	// Add an initial file on disk to write too. Use an empty object.
	fs.writeFile('/wOOt.json', JSON.stringify({}), err => {
		if (err) {
			console.log(err);
		}

		db.put('foo', 'bar');
		db.put('baz', 'boo');

		db.get('foo', (err, val) => {
			if (err) {
				console.log(err);
			}
			console.log(val);
		});
		db.get('baz', (err, val) => {
			if (err) {
				console.log(err);
			}
			console.log(val);
		});

		// Read all keys back out of DB
		db.createReadStream()
	    .on('data', kv => {
		console.log('%s: %s', kv.key, kv.value);
	})
	    .on('end', () => {
		console.log('done');
	});

		// Read all keys from file on disk.
		fs.readFile('/wOOt.json', {encoding: 'utf8'}, (e, d) => {
			if (e) {
				console.log(e);
			}
			console.log(d);
		});
	});
});

fs.on('error', err => console.log(err));
