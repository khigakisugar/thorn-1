/*
 * Copyright (c) 2017 SugarCRM Inc. Licensed by SugarCRM under the Apache 2.0 license.
 */

describe('Metadata Handler', () => {
    let _, expect, Meta;

    before(() => {
        _ = require('lodash');
        expect = require('chakram').expect;
        Meta = require('../dist/metadata-handler.js');
    });

    after(() => {
        _.each(_.keys(require.cache), (key) => {
            delete require.cache[key];
        });
    });

    describe('generateFieldValue', () => {
        describe('unsupported types', () => {
            it('should throw an error', () => {
                let types = [
                    'assigned_user_name',
                    'file',
                    'id',
                    'image',
                    'json',
                    'link',
                    'relate',
                    'team_list',
                    'username',
                ];
                _.each(types, (type) => {
                    let msg = 'Fields of type ' + type + ' are not supported. Please define them manually.';
                    expect(() => Meta.generateFieldValue({type: type})).to.throw(msg);
                });
            });
        });

        describe('unrecognized types', () => {
            it('should throw an error', () => {
                let msg = 'Field type i_am_not_a_real_type is not recognized.';
                expect(() => Meta.generateFieldValue({type: 'i_am_not_a_real_type'})).to.throw(msg);
            });
        });

        describe('varchars', () => {
            it('should return a string of maximum length', () => {
                let field = {
                    type: 'varchar',
                    len: 15,
                };
                let value = Meta.generateFieldValue(field);
                expect(value).to.be.a.string;
                expect(value.length).to.be.at.most(field.len);
            });

            it('should have a default length of 30', () => {
                let value = Meta.generateFieldValue({type: 'varchar'});
                expect(value).to.have.lengthOf(30);
            });

            it('should not generate strings longer than 30', () => {
                let field = {
                    type: 'varchar',
                    len: 255,
                };
                let value = Meta.generateFieldValue(field);
                expect(value).to.have.lengthOf(30);
            });
        });

        describe('passwords', () => {
            it('should return a string', () => {
                let value = Meta.generateFieldValue({type: 'password'});
                expect(value).to.be.a.string;
            });
        });

        describe('chars', () => {
            it('should return a string of specified length', () => {
                let field = {
                    type: 'char',
                    len: 15,
                };
                let value = Meta.generateFieldValue(field);
                expect(value).to.be.a.string;
                expect(value).to.have.lengthOf(field.len);
            });

            it('should have a default length of 30', () => {
                let value = Meta.generateFieldValue({type: 'char'});
                expect(value).to.have.lengthOf(30);
            });
        });

        describe('bools', () => {
            it('should return a boolean', () => {
                expect(Meta.generateFieldValue({type: 'bool'})).to.be.a.boolean;
            });
        });

        describe('ints', () => {
            it('should return an integer with the proper number of digits', () => {
                let value = Meta.generateFieldValue({type: 'int', len: 4});
                expect(Number.isInteger(value)).to.be.true;
                expect(value).to.be.at.most(9999);
            });

            it('should only return a number with at most 5 digits', () => {
                let value = Meta.generateFieldValue({type: 'int', len: 6});
                expect(Number.isInteger(value)).to.be.true;
                expect(value).to.be.at.most(99999);
            });
        });

        describe('decimals', () => {
            it('should return a number with the proper number of digits', () => {
                let value = Meta.generateFieldValue({type: 'decimal', len: '5,2'});
                expect(value).to.be.a.number;
                // Number.toString() always uses a ".", even in European locales
                let [intPart, decimalPart] = value.toString().split('.');
                expect(intPart.length).to.be.at.most(3);
                expect(decimalPart.length).to.be.at.most(2);
            });

            it('should only return a number with at most 3 digits before and 2 after the decimal', () => {
                let value = Meta.generateFieldValue({type: 'decimal', len: '10,5'});
                // Number.toString() always uses a ".", even in European locales
                let [intPart, decimalPart] = value.toString().split('.');
                expect(intPart.length).to.be.at.most(3);
                expect(decimalPart.length).to.be.at.most(2);
            });
        });

        describe('datetimes', () => {
            it('should return a Date', () => {
                let value = Meta.generateFieldValue({type: 'datetime'});
                expect(value instanceof Date).to.be.true;
            });
        });

        describe('urls', () => {
            it('should return an HTTP(S) URL', () => {
                let url = require('url');
                let value = url.parse(Meta.generateFieldValue({type: 'url'}));
                expect(value.protocol).to.have.string('http');
            });

            it('should support a maximum length', () => {
                let field = {
                    type: 'url',
                    len: 12,
                };
                let value = Meta.generateFieldValue(field);
                expect(value.length).to.be.at.most(field.len);
            });
        });

        describe('emails', () => {
            it('should return an email address', () => {
                // validating emails is arduous. Just check it's word@domain.tld
                let value = Meta.generateFieldValue({type: 'email'});
                expect(value).to.match(/\w*@\w*\.\w*/);
            });
        });

        describe('phone numbers', () => {
            it('should return a string of digits', () => {
                let value = Meta.generateFieldValue({type: 'phone'});
                expect(value).to.be.a.string;
                expect(value).to.match(/\d*/);
            });

            it('should support a maximum length', () => {
                let field = {
                    type: 'phone',
                    len: 7,
                };
                let value = Meta.generateFieldValue(field);
                expect(value).to.be.a.string;
                expect(value.length).to.be.at.most(field.len);
            });
        });

        describe('texts', () => {
            it('should return a string', () => {
                expect(Meta.generateFieldValue({type: 'text'})).to.be.a.string;
            });
        });

        describe('longtexts', () => {
            it('should return a string', () => {
                expect(Meta.generateFieldValue({type: 'longtext'})).to.be.a.string;
            });
        });

        describe('enums', () => {
            it('should return a string', () => {
                expect(Meta.generateFieldValue({type: 'enum'})).to.be.a.string;
            });
        });

        describe('names', () => {
            it('should return a string', () => {
                expect(Meta.generateFieldValue({type: 'name'})).to.be.a.string;
            });
        });
    });

    describe('Getting Users fields', () => {
        afterEach(() => {
            Meta.clearCachedMetadata();
        });

        describe('when the Users module is defined', () => {
            it('should generate a missing Users.user_hash field definition', function*() {
                process.env.THORN_METADATA_FILE = __dirname + '/fixtures/metadata-handler/users-module-only-without-user-hash.json';
                let metadata = yield Meta.getRequiredFields('Users');
                let expected = {
                    name: 'user_hash',
                    type: 'password',
                };
                expect(metadata.user_hash).to.eql(expected);
                delete process.env.THORN_METADATA_FILE;
            });

            it('should preserve a pre-existing Users.user_hash field definition', function*() {
                process.env.THORN_METADATA_FILE = __dirname + '/fixtures/metadata-handler/users-module-only-with-user-hash.json';
                let metadata = yield Meta.getRequiredFields('Users');
                let expected = {
                    name: 'user_hash',
                    type: 'password',
                    required: true,
                    test: 'abc123',
                };
                expect(metadata.user_hash).to.eql(expected);
                delete process.env.THORN_METADATA_FILE;
            });
        });

        describe('when the Users module is not defined', () => {
            it('should not create metadata for a Users module', function*() {
                process.env.THORN_METADATA_FILE = __dirname + '/fixtures/metadata-handler/random-module.json';
                let errorMsg;
                try {
                    yield Meta.getRequiredFields('Users');
                } catch(e) {
                    errorMsg = e.message;
                }
                expect(errorMsg).to.eql('Unrecognized module: Users');
                delete process.env.THORN_METADATA_FILE;
            });
        });
    });
});

