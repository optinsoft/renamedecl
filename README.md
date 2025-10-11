# Renamedecl

Renaming variables and functions in JS code based on an AST.

## Installation

You can install renamedecl with npm:

```sh
npm install git+https://github.com/optinsoft/renamedecl.git
```

## Usage

Automatic generation of variable and function names:

```javascript
const { renameDeclarations } = require('renamedecl');
const acorn = require('acorn');
const escodegen = require('escodegen');

const originalCode = `
function calculate(z) {
    const add = function(a, b) {
        return a + b;
    }
    let x = 10;
    let y = 20;
    let result = add(x, y) + z;
    const add2 = (a, b) => (a + b);
    result += add2(x, y);
    return result;
}
console.log(calculate(1000));
`;

const ast = acorn.parse(originalCode, {
    ecmaVersion: 2020,
    sourceType: 'script'
});

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
console.log(newCode);
```

Expected output: 

```javascript
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
```
