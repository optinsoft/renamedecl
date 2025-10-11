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

        renameDeclarations(ast, (id, scope, type) => {
            return {
                'variable': () => `v${++scope.varNum}`,
                'function': () => `f${++scope.funcNum}`,
                'parameter': () => `p${++scope.paramNum}`,
            }[type]();
        }, scope => {
            scope.varNum = 0;
            scope.funcNum = 0;
            scope.paramNum = 0;
        });

        const newCode = escodegen.generate(ast);

        fs.writeFileSync(beautyNewFileName, newCode, { encoding: 'utf8' });

        const expectedCode = `
function f1(p3) {
    const v1 = function (p1, p2) {
        return p1 + p2;
    };
    let v2 = 10;
    let v3 = 20;
    let v4 = v1(v2, v3) + p3;
    const v5 = (p1, p2) => p1 + p2;
    v4 += v5(v2, v3);
    return v4;
}
console.log(f1(1000));
`.trim();

        expect(newCode).toBe(expectedCode);
    });
});