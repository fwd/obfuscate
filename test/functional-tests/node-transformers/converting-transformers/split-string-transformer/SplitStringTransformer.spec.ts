import { assert } from 'chai';

import { StringArrayEncoding } from '../../../../../src/enums/node-transformers/string-array-transformers/StringArrayEncoding';

import { NO_ADDITIONAL_NODES_PRESET } from '../../../../../src/options/presets/NoCustomNodes';

import { readFileAsString } from '../../../../helpers/readFileAsString';

import { JavaScriptObfuscator } from '../../../../../src/JavaScriptObfuscatorFacade';

describe('SplitStringTransformer', () => {
    let obfuscatedCode: string;
    
    describe('Variant #1: simple string literal', () => {
        it('should transform string literal to binary expression', () => {
            const code: string = readFileAsString(__dirname + '/fixtures/simple-input.js');

            obfuscatedCode = JavaScriptObfuscator.obfuscate(
                code,
                {
                    ...NO_ADDITIONAL_NODES_PRESET,
                    splitStrings: true,
                    splitStringsChunkLength: 2
                }
            ).getObfuscatedCode();

            assert.match(obfuscatedCode,  /^var test *= *'ab' *\+ *'cd' *\+ *'ef' *\+ *'g';$/);
        });
    });

    describe('Variant #2: `splitStrings` option is disabled', () => {
        it('should keep original string literal', () => {
            const code: string = readFileAsString(__dirname + '/fixtures/simple-input.js');

            obfuscatedCode = JavaScriptObfuscator.obfuscate(
                code,
                {
                    ...NO_ADDITIONAL_NODES_PRESET,
                    splitStrings: false,
                    splitStringsChunkLength: 10
                }
            ).getObfuscatedCode();

            assert.match(obfuscatedCode,  /^var test *= *'abcdefg';$/);
        });
    });

    describe('Variant #3: `splitStringsChunkLength` value larger than string size', () => {
        it('should keep original string literal', () => {
            const code: string = readFileAsString(__dirname + '/fixtures/simple-input.js');

            obfuscatedCode = JavaScriptObfuscator.obfuscate(
                code,
                {
                    ...NO_ADDITIONAL_NODES_PRESET,
                    splitStrings: true,
                    splitStringsChunkLength: 10
                }
            ).getObfuscatedCode();

            assert.match(obfuscatedCode,  /^var test *= *'abcdefg';$/);
        });
    });

    describe('Variant #4: `splitStringsChunkLength` value is `0`', () => {
        it('should throw an validation error ', () => {
            const code: string = readFileAsString(__dirname + '/fixtures/simple-input.js');

            const testFunc = () => JavaScriptObfuscator.obfuscate(
                code,
                {
                    ...NO_ADDITIONAL_NODES_PRESET,
                    splitStrings: true,
                    splitStringsChunkLength: 0
                }
            );

            assert.throws(testFunc, /validation failed/i);
        });
    });

    describe('Variant #5: strings concatenation', () => {
        it('should transform string literals to binary expressions', () => {
            const code: string = readFileAsString(__dirname + '/fixtures/strings-concatenation.js');

            obfuscatedCode = JavaScriptObfuscator.obfuscate(
                code,
                {
                    ...NO_ADDITIONAL_NODES_PRESET,
                    splitStrings: true,
                    splitStringsChunkLength: 2
                }
            ).getObfuscatedCode();

            assert.match(obfuscatedCode,  /^var test *= *'ab' *\+ *'cd' *\+ *\( *'ef' *\+ *'g' *\);$/);
        });
    });

    describe('Variant #6: unicode escape sequence', () => {
        it('should convert strings to unicode escape sequence view', () => {
            const code: string = readFileAsString(__dirname + '/fixtures/simple-input.js');

            obfuscatedCode = JavaScriptObfuscator.obfuscate(
                code,
                {
                    ...NO_ADDITIONAL_NODES_PRESET,
                    splitStrings: true,
                    splitStringsChunkLength: 2,
                    unicodeEscapeSequence: true
                }
            ).getObfuscatedCode();

            assert.match(obfuscatedCode,  /^var test *= *'\\x61\\x62' *\+ *'\\x63\\x64' *\+ *'\\x65\\x66' *\+ *'\\x67';$/);
        });
    });

    describe('Variant #7: template literal string', () => {
        it('should apply string splitting on template literal strings', () => {
            const code: string = readFileAsString(__dirname + '/fixtures/template-literal-string.js');

            obfuscatedCode = JavaScriptObfuscator.obfuscate(
                code,
                {
                    ...NO_ADDITIONAL_NODES_PRESET,
                    splitStrings: true,
                    splitStringsChunkLength: 2
                }
            ).getObfuscatedCode();

            assert.match(obfuscatedCode,  /^var test *= *'ab' *\+ *'cd' *\+ *'ef' *\+ *'g';$/);
        });
    });

    describe('Variant #8: object string literal', () => {
        it('should keep original key string literal and transform value string literal', () => {
            const code: string = readFileAsString(__dirname + '/fixtures/object-string-literal.js');

            obfuscatedCode = JavaScriptObfuscator.obfuscate(
                code,
                {
                    ...NO_ADDITIONAL_NODES_PRESET,
                    splitStrings: true,
                    splitStringsChunkLength: 2
                }
            ).getObfuscatedCode();

            assert.match(obfuscatedCode,  /^var test *= *{'abcdefg' *: *'ab' *\+ *'cd' *\+ *'ef' *\+ *'g'};$/);
        });
    });

    describe('Variant #9: object computed key string literal', () => {
        it('should transform string literal to binary expression', () => {
            const code: string = readFileAsString(__dirname + '/fixtures/object-computed-key-string-literal.js');

            obfuscatedCode = JavaScriptObfuscator.obfuscate(
                code,
                {
                    ...NO_ADDITIONAL_NODES_PRESET,
                    splitStrings: true,
                    splitStringsChunkLength: 2
                }
            ).getObfuscatedCode();

            assert.match(obfuscatedCode,  /^var test *= *{\['ab' *\+ *'cd' *\+ *'ef' *\+ *'g'] *: *0x1};$/);
        });
    });

    describe('Variant #10: string with emoji', () => {
        describe('Variant #1: single emoji', () => {
            it('should correctly split string with emoji', () => {
                const regExp: RegExp = /^var test *= *'a' *\+ *'b' *\+ *'👋🏼' *\+ *'c' *\+ *'d'; *test;$/;

                const code: string = readFileAsString(__dirname + '/fixtures/string-with-emoji-1.js');

                obfuscatedCode = JavaScriptObfuscator.obfuscate(
                    code,
                    {
                        ...NO_ADDITIONAL_NODES_PRESET,
                        splitStrings: true,
                        splitStringsChunkLength: 1
                    }
                ).getObfuscatedCode();

                assert.match(obfuscatedCode,  regExp);
            });

            it('should correctly evaluate splitted string with emoji', () => {
                const expectedResultString: string = 'ab👋🏼cd';

                const code: string = readFileAsString(__dirname + '/fixtures/string-with-emoji-1.js');

                obfuscatedCode = JavaScriptObfuscator.obfuscate(
                    code,
                    {
                        ...NO_ADDITIONAL_NODES_PRESET,
                        splitStrings: true,
                        splitStringsChunkLength: 1
                    }
                ).getObfuscatedCode();

                const resultString: string = eval(obfuscatedCode);

                assert.equal(resultString, expectedResultString);
            });
        });

        describe('Variant #2: multiple emoji', () => {
            it('should correctly split string with emoji', () => {
                const regExp: RegExp = /^var test *= *'a' *\+ *'b' *\+ *'😴' *\+ *'😄' *\+ *'c' *\+ *'d'; *test;$/;

                const code: string = readFileAsString(__dirname + '/fixtures/string-with-emoji-2.js');

                obfuscatedCode = JavaScriptObfuscator.obfuscate(
                    code,
                    {
                        ...NO_ADDITIONAL_NODES_PRESET,
                        splitStrings: true,
                        splitStringsChunkLength: 1
                    }
                ).getObfuscatedCode();

                assert.match(obfuscatedCode,  regExp);
            });

            it('should correctly evaluate splitted string with emoji', () => {
                const expectedResultString: string = 'ab😴😄cd';

                const code: string = readFileAsString(__dirname + '/fixtures/string-with-emoji-2.js');

                obfuscatedCode = JavaScriptObfuscator.obfuscate(
                    code,
                    {
                        ...NO_ADDITIONAL_NODES_PRESET,
                        splitStrings: true,
                        splitStringsChunkLength: 1
                    }
                ).getObfuscatedCode();

                const resultString: string = eval(obfuscatedCode);

                assert.equal(resultString, expectedResultString);
            });
        });

        describe('Variant #3: correct split emoji', () => {
            it('should correctly split string with emoji', () => {
                const regExp: RegExp = /^var test *= *'ab👋🏼' *\+ *'cd'; *test;$/;

                const code: string = readFileAsString(__dirname + '/fixtures/string-with-emoji-1.js');

                obfuscatedCode = JavaScriptObfuscator.obfuscate(
                    code,
                    {
                        ...NO_ADDITIONAL_NODES_PRESET,
                        splitStrings: true,
                        splitStringsChunkLength: 3
                    }
                ).getObfuscatedCode();

                assert.match(obfuscatedCode,  regExp);
            });

            it('should correctly evaluate splitted string with emoji', () => {
                const expectedResultString: string = 'ab👋🏼cd';

                const code: string = readFileAsString(__dirname + '/fixtures/string-with-emoji-1.js');

                obfuscatedCode = JavaScriptObfuscator.obfuscate(
                    code,
                    {
                        ...NO_ADDITIONAL_NODES_PRESET,
                        splitStrings: true,
                        splitStringsChunkLength: 3
                    }
                ).getObfuscatedCode();

                const resultString: string = eval(obfuscatedCode);

                assert.equal(resultString, expectedResultString);
            });
        });
    });

    describe('Variant #11: Integration with `stringArrayEncoding` option', () => {
        describe('Variant #1: base64 encoding', () => {
            describe('Variant #1: string with emoji', () => {
                describe('Variant #1: prevent URI-malformed error', () => {
                    it('should correctly evaluate splitted string with emoji', () => {
                        const expectedResultString: string = 'ab👋🏼cd';

                        const code: string = readFileAsString(__dirname + '/fixtures/string-with-emoji-1.js');

                        obfuscatedCode = JavaScriptObfuscator.obfuscate(
                            code,
                            {
                                ...NO_ADDITIONAL_NODES_PRESET,
                                splitStrings: true,
                                splitStringsChunkLength: 3,
                                stringArray: true,
                                stringArrayThreshold: 1,
                                stringArrayEncoding: [
                                    StringArrayEncoding.Base64
                                ]
                            }
                        ).getObfuscatedCode();

                        const resultString: string = eval(obfuscatedCode);

                        assert.equal(resultString, expectedResultString);
                    });
                });
            });
        });
    });

    describe('Variant #12: Integration with `transformObjectKeys` option', () => {
        it('should correctly transform string when `transformObjectKeys` option is enabled', () => {
            const regExp: RegExp = new RegExp(`` +
                `var _0x[a-f0-9]{4,6} *= *{};` +
                `*_0x[a-f0-9]{4,6}\\['ab' *\\+ *'cd' *\\+ *'ef' *\\+ *'g'] *= *'ab' *\\+ *'cd' *\\+ *'ef' *\\+ *'g';` +
                `var test *= *_0x[a-f0-9]{4,6};` +
            ``);
            const code: string = readFileAsString(__dirname + '/fixtures/object-string-literal.js');

            obfuscatedCode = JavaScriptObfuscator.obfuscate(
                code,
                {
                    ...NO_ADDITIONAL_NODES_PRESET,
                    splitStrings: true,
                    splitStringsChunkLength: 2,
                    transformObjectKeys: true
                }
            ).getObfuscatedCode();

            assert.match(
                obfuscatedCode,
                regExp
            );
        });
    });

    describe('Variant #13: Integration with `reservedStrings` option', () => {
        it('should correctly ignore strings from `reservedStrings` option', () => {
            const code: string = readFileAsString(__dirname + '/fixtures/ignore-reserved-strings.js');

            obfuscatedCode = JavaScriptObfuscator.obfuscate(
                code,
                {
                    ...NO_ADDITIONAL_NODES_PRESET,
                    splitStrings: true,
                    splitStringsChunkLength: 3,
                    reservedStrings: ['bar']
                }
            ).getObfuscatedCode();

            assert.match(
                obfuscatedCode,
                /^var foo *= *'foo' *\+ *'foo'; *var bar *= *'barbar'; *var baz *= *'baz' *\+ *'baz';$/
            );
        });
    });

    describe('Variant #14: Large string', () => {
        it('Should does not throw `Maximum call stack size exceeded` error on a large string', () => {
            const code: string = `var foo = '${'a'.repeat(10000)}';`;

            const testFunc = () => JavaScriptObfuscator.obfuscate(
                code,
                {
                    ...NO_ADDITIONAL_NODES_PRESET,
                    splitStrings: true,
                    splitStringsChunkLength: 2
                }
            );

            assert.doesNotThrow(
                testFunc,
                Error
            );
        });
    });

    describe('Variant #15: import declaration source literal', () => {
        const importDeclarationRegExp: RegExp = /import *{ *bar *} *from *'foo';/;

        let obfuscatedCode: string;

        before(() => {
            const code: string = readFileAsString(__dirname + '/fixtures/import-declaration-source.js');

            obfuscatedCode = JavaScriptObfuscator.obfuscate(
                code,
                {
                    ...NO_ADDITIONAL_NODES_PRESET,
                    splitStrings: true,
                    splitStringsChunkLength: 2
                }
            ).getObfuscatedCode();
        });

        it('Should not split `ImportDeclaration` source literal', () => {
            assert.match(obfuscatedCode, importDeclarationRegExp);
        });
    });

    describe('Variant #16: export all declaration source literal', () => {
        const exportAllDeclarationRegExp: RegExp = /export *\* *from *'foo';/;

        let obfuscatedCode: string;

        before(() => {
            const code: string = readFileAsString(__dirname + '/fixtures/export-all-declaration-source.js');

            obfuscatedCode = JavaScriptObfuscator.obfuscate(
                code,
                {
                    ...NO_ADDITIONAL_NODES_PRESET,
                    splitStrings: true,
                    splitStringsChunkLength: 2
                }
            ).getObfuscatedCode();
        });

        it('Should not split `ExportAllDeclaration` source literal', () => {
            assert.match(obfuscatedCode, exportAllDeclarationRegExp);
        });
    });

    describe('Variant #17: export named declaration source literal', () => {
        const exportNamedDeclarationRegExp: RegExp = /export *{ *bar *} *from *'foo';/;

        let obfuscatedCode: string;

        before(() => {
            const code: string = readFileAsString(__dirname + '/fixtures/export-named-declaration-source.js');

            obfuscatedCode = JavaScriptObfuscator.obfuscate(
                code,
                {
                    ...NO_ADDITIONAL_NODES_PRESET,
                    splitStrings: true,
                    splitStringsChunkLength: 2
                }
            ).getObfuscatedCode();
        });

        it('Should not split `ExportNamedDeclaration` source literal', () => {
            assert.match(obfuscatedCode, exportNamedDeclarationRegExp);
        });
    });
});
