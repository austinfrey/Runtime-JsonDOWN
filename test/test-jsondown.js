const fs = require('fs');
const should = require('should');
const levelup = require('levelup');
const sinon = require('sinon');

const JsonDOWN = require('../jsondown');

const LOCATION = '_testdb_JsonDOWN.json';

function removeLocation() {
	if (fs.existsSync(LOCATION)) {
		fs.unlinkSync(LOCATION);
	}
}

function getLocation() {
	return JSON.parse(fs.readFileSync(LOCATION, 'utf-8'));
}

function putLocation(obj) {
	if (typeof (obj) === 'object')		{
		obj = JSON.stringify(obj);
	}
	fs.writeFileSync(LOCATION, obj, 'utf-8');
}

describe('JsonDOWN', () => {
	beforeEach(removeLocation);
	afterEach(removeLocation);

	it('should raise error on corrupted data', done => {
		putLocation('i am not valid json');
		const db = levelup(LOCATION, {db: JsonDOWN});
		db.open();
		db.on('error', err => {
			err.message.should.match(/^Error parsing JSON in _testdb/);
			done();
		});
	});

	it('should raise error on corrupted key', done => {
		putLocation({not_a_buffer: 'nope'});
		const db = levelup(LOCATION, {db: JsonDOWN});
		db.open();
		db.on('error', err => {
			err.message.should.eql('Error parsing key "not_a_buffer" as a buffer');
			done();
		});
	});

	it('should raise error on corrupted value', done => {
		putLocation({$hi: false});
		const db = levelup(LOCATION, {db: JsonDOWN});
		db.open();
		db.on('error', err => {
			err.message.should.eql('Error parsing value false as a buffer');
			done();
		});
	});

	it('should get existing keys', done => {
		putLocation({$hey: 'there'});
		const db = levelup(LOCATION, {db: JsonDOWN});
		db.get('hey', (err, value) => {
			if (err) {
				return done(err);
			}
			value.should.eql('there');
			done();
		});
	});

	it('should raise error on nonexistent keys', done => {
		const db = levelup(LOCATION, {db: JsonDOWN});
		db.get('nonexistent', (err, value) => {
			err.notFound.should.be.true;
			done();
		});
	});

	it('should support binary keys', done => {
		putLocation({'[1,2,3]': 'yo'});
		const db = levelup(LOCATION, {db: JsonDOWN});
		db.get(Buffer.from([1, 2, 3]), (err, value) => {
			if (err) {
				return done(err);
			}
			value.should.eql('yo');
			done();
		});
	});

	it('should support binary values', done => {
		putLocation({$hello: [1, 2, 3]});
		const db = levelup(LOCATION, {db: JsonDOWN});
		db.get('hello', (err, value) => {
			if (err) {
				return done(err);
			}
			value.should.eql(Buffer.from([1, 2, 3]));
			done();
		});
	});

	it('should delete', done => {
		putLocation({$whats: 'up'});
		const db = levelup(LOCATION, {db: JsonDOWN});
		db.del('whats', err => {
			if (err) {
				return done(err);
			}
			getLocation().should.eql({});
			done();
		});
	});

	it('should put', done => {
		const db = levelup(LOCATION, {db: JsonDOWN});
		db.put('foo', 'bar', err => {
			if (err) {
				return done(err);
			}
			getLocation().should.eql({$foo: 'bar'});
			done();
		});
	});

	it('should intelligently queue writes', done => {
		const db = levelup(LOCATION, {db: JsonDOWN});
		sinon.spy(fs, 'writeFile');
		db.put('foo', 'bar');
		db.put('lol', 'cats');
		db.put('silly', 'monkey', err => {
			if (err) {
				return done(err);
			}
			getLocation().should.eql({
				$foo: 'bar',
				$lol: 'cats',
				$silly: 'monkey'
			});
			fs.writeFile.callCount.should.eql(2);
			db.del('lol', err => {
				getLocation().should.eql({
					$foo: 'bar',
					$silly: 'monkey'
				});
				fs.writeFile.callCount.should.eql(3);
				fs.writeFile.restore();
				done();
			});
		});
	});
});
