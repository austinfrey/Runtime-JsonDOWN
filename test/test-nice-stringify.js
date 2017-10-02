const should = require('should');

const niceStringify = require('../nice-stringify');

describe('niceStringify()', () => {
	it('should work with empty objects', () => {
		niceStringify({}).should.eql('{\n}\n');
	});

	it('should work with objects w/ 1 key', () => {
		niceStringify({a: 1}).should.eql('{\n  "a": 1\n}\n');
	});

	it('should work with objects w/ 2 keys', () => {
		niceStringify({a: 1, b: 2})
      .should.eql('{\n  "a": 1\n, "b": 2\n}\n');
	});
});
