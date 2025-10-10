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

renameDeclarations(ast, (id, scope) => {
    return `v${++scope.varNum}`
}, scope => {
    scope.varNum = 0
});

const newCode = escodegen.generate(ast);
console.log(newCode);
```

Expected output: 

```javascript
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
```
