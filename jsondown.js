const runtime = require('runtimejs');
const util = require('util');
const MemDOWN = require('memdown');
const fs = require('./fake-fs');

const niceStringify = require('./nice-stringify');

function noop() {}

function JsonDOWN(location) {
	if (!(this instanceof JsonDOWN))		{
		return new JsonDOWN(location);
	}
	MemDOWN.call(this, location);
	this._isLoadingFromFile = false;
	this._isWriting = false;
	this._queuedWrites = [];
}

util.inherits(JsonDOWN, MemDOWN);

JsonDOWN.prototype._jsonToBatchOps = function (data) {
	return Object.keys(data).map(key => {
		let value = data[key];
		if (/^\$/.test(key)) {
			key = key.slice(1);
		} else {
			try {
				key = Buffer.from(key);
			} catch (e) {
				throw new Error('Error parsing key ' + JSON.stringify(key) +
                        ' as a buffer');
			}
		}
		if (typeof (value) !== 'string') {
			try {
				value = Buffer.from(value);
			} catch (e) {
				throw new Error('Error parsing value ' + JSON.stringify(value) +
                        ' as a buffer');
			}
		}
		return {type: 'put', key, value};
	});
};

JsonDOWN.prototype._open = function (options, cb) {
	fs.readFile(this.location, {encoding: 'utf8', flag: 'r'}, (err, data) => {
		if (err) {
			if (err.code == 'ENOENT') {
				return cb(null, this);
			}
			return cb(err);
		}
		try {
			data = JSON.parse(data);
		} catch (e) {
			return cb(new Error('Error parsing JSON in ' + this.location +
                          ': ' + e.message));
		}
		this._isLoadingFromFile = true;
		try {
			try {
				this._batch(this._jsonToBatchOps(data), {}, noop);
			} finally {
				this._isLoadingFromFile = false;
			}
		} catch (e) {
			return cb(e);
		}
		cb(null, this);
	});
};

JsonDOWN.prototype._writeToDisk = function (cb) {
	if (this._isWriting)		{
		return this._queuedWrites.push(cb);
	}
	this._isWriting = true;
	fs.writeFile(this.location, niceStringify(this._store), {
		encoding: 'utf-8'
	}, err => {
		const queuedWrites = this._queuedWrites.splice(0);
		this._isWriting = false;
		if (queuedWrites.length)			{
			this._writeToDisk(err => {
				queuedWrites.forEach(cb => {
					cb(err);
				});
			});
		}
		cb(err);
	});
};

JsonDOWN.prototype._put = function (key, value, options, cb) {
	MemDOWN.prototype._put.call(this, key, value, options, noop);
	if (!this._isLoadingFromFile) {
		this._writeToDisk(cb);
	}
};

JsonDOWN.prototype._del = function (key, options, cb) {
	MemDOWN.prototype._del.call(this, key, options, noop);
	this._writeToDisk(cb);
};

module.exports = {
	JsonDOWN,
	fs
};
