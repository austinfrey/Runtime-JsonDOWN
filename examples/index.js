'use strict';

const runtime = require('runtimejs');
const levelup = require('levelup');
const {fs, JsonDOWN} = require('jsondown');
const db = levelup('/wOOt.json', {db: JsonDOWN});

fs.on('ready', () => {
	fs.writeFile('/wOOt.json', JSON.stringify({}), (err) => {
		if (err) console.log(err)

		db.put('foo', 'bar');
		db.put('baz', 'boo');

		db.get('foo', (err, val) => {
			if (err) console.log(err)
			console.log(val)
		});
		db.get('baz', (err, val) => {
			if (err) console.log(err)
			console.log(val)
		});

		db.createReadStream()
	    .on('data', function (kv) {
				console.log('%s: %s', kv.key, kv.value)
			})
	    .on('end', function () {
				console.log('done')
			})

		fs.readFile('/wOOt.json', {encoding: 'utf8'}, (e, d) => {
			if (e) {
				console.log(e);
			}
			console.log(d);
		});
	})
});

fs.on('error', err => console.log(err));
