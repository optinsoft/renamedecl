const { renameDeclarations } = require('../src/renamedecl');
const acorn = require('acorn');
const escodegen = require('escodegen');
const fs = require('fs');

function alphaNumber(n) {
    const ac = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const l = ac.length;
    let r = ac.charAt(n % l); n = Math.floor(n / l);
    while (n) {
        r = ac.charAt(n % l) + r;
        n = Math.floor(n / l);
    }
    return r;
}

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
                'variable': () => `v${alphaNumber(scope.level)}${++scope.varNum}`,
                'function': () => `f${alphaNumber(scope.level)}${++scope.funcNum}`,
                'parameter': () => `p${alphaNumber(scope.level)}${++scope.paramNum}`,
            }[type]();
        }, scope => {
            scope.varNum = 0;
            scope.funcNum = 0;
            scope.paramNum = 0;
        });

        const newCode = escodegen.generate(ast);

        fs.writeFileSync(beautyNewFileName, newCode, { encoding: 'utf8' });

        const expectedCode = `
function fa1(pb3) {
    const vb1 = function (pc1, pc2) {
        return pc1 + pc2;
    };
    let vb2 = 10;
    let vb3 = 20;
    let vb4 = vb1(vb2, vb3) + pb3;
    const vb5 = (pb1, pb2) => pb1 + pb2;
    vb4 += vb5(vb2, vb3);
    return vb4;
}
console.log(fa1(1000));
`.trim();

        expect(newCode).toBe(expectedCode);
    });
});