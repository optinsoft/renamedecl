const { renameDeclarations } = require('../src/renamedecl');
const acorn = require('acorn');
const escodegen = require('escodegen');
const fs = require('fs');

describe("renamedecl tests", () => {
    test('rename declarations in calculate.js', () => {
        const originalFileName = './test/calculate.js';
        const beautyFileName = originalFileName.replace(/(\.[^/.]+)?$/, '-beauty' + '$1');
        const beautyNewFileName = originalFileName.replace(/(\.[^/.]+)?$/, '-beauty-new' + '$1');

        let originalCode = fs.readFileSync(originalFileName, { encoding: 'utf8' });

        const ast = acorn.parse(originalCode, {
            ecmaVersion: 2020,
            sourceType: 'script'
        });

        const beautyCode = escodegen.generate(ast);

        fs.writeFileSync(beautyFileName, beautyCode, { encoding: 'utf8' });

        renameDeclarations(ast, (id, scope) => {
            return `v${++scope.varNum}`
        }, scope => {
            scope.varNum = 0
        });

        const newCode = escodegen.generate(ast);

        fs.writeFileSync(beautyNewFileName, newCode, { encoding: 'utf8' });

        const expectedCode = `
function v1(v8) {
    const v1 = function (v1, v2) {
        return v1 + v2;
    };
    let v2 = 10;
    let v3 = 20;
    let v4 = v1(v2, v3) + v8;
    const v7 = (v5, v6) => v5 + v6;
    v4 += v7(v2, v3);
    return v4;
}
console.log(v1(1000));
`.trim();

        expect(newCode).toBe(expectedCode);
    });
});