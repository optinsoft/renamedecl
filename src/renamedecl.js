const walk = require('acorn-walk');

function renameDeclarations(ast, rename, initscope) {
    class Scope {
        constructor(node) {
            this.node = node;
            this.declarations = {};
            if (initscope) {
                initscope(this);
            }
        }

        addDeclaration(id, type, node) {
            let declaration = { id }
            const newName = rename && rename(id, this, type, node);
            this.declarations[id.name] = declaration;
            if (newName) {
                declaration['newName'] = newName;
            }
        }
    }

    class ScopeTree {
        constructor() {
            this.scopes = {};
        }

        isBlockNode(node) {
            return node && [
                'Program', 
                'BlockStatement',
            ].includes(node.type);
        }

        getBlockScope(node) {
            let scope = this.scopes[node.start];
            if (!scope) {
                if (this.isBlockNode(node)) {
                    scope = new Scope(node);
                    this.scopes[node.start] = scope;
                }
            }
            return scope;
        }

        getAncestorsScope(node, ancestors) {
            let lastScope = null;
            ancestors.forEach(node => {
                const scope = this.getBlockScope(node);
                if (scope) {
                    lastScope = scope;
                }
            });
            return this.getBlockScope(node) || lastScope;
        }

        getIdentifierDeclaration(id, ancestors) {
            let lastDeclaration = null;
            ancestors.forEach(node => {
                const scope = this.getBlockScope(node);
                if (scope) {
                    const declaration = scope.declarations[id.name];
                    if (declaration) {
                        lastDeclaration = declaration;
                    }
                }
            });
            return lastDeclaration;
        }

        *declarations() {
            for (let scope of Object.values(this.scopes)) {
                for (let d of Object.values(scope.declarations)) {
                    yield d;
                }
            }
        }
    }

    const scopes = new ScopeTree();

    // Build scopes first

    walk.ancestor(ast, {
        VariableDeclarator(node, ancestors) {
            const scope = scopes.getAncestorsScope(node, ancestors);
            scope.addDeclaration(node.id, 'variable', node);
        },
        FunctionDeclaration(node, ancestors) {
            const scope = scopes.getAncestorsScope(node, ancestors);
            scope.addDeclaration(node.id, 'function', node);
            const paramsScope = scopes.getAncestorsScope(node.body, ancestors);
            node.params.forEach(param => {
                paramsScope.addDeclaration(param, 'parameter', node);
            });
        },
        FunctionExpression(node, ancestors) {
            const paramsScope = scopes.getAncestorsScope(node.body, ancestors);
            node.params.forEach(param => {
                paramsScope.addDeclaration(param, 'parameter', node);
            });
        },
        ArrowFunctionExpression(node, ancestors) {
            const paramsScope = scopes.getAncestorsScope(node.body, ancestors);
            node.params.forEach(param => {
                paramsScope.addDeclaration(param, 'parameter', node);
            });
        },
        Program(node, ancestors) {
            scopes.getAncestorsScope(node, ancestors);
        },
        BlockStatement(node, ancestors) {
            scopes.getAncestorsScope(node, ancestors);
        },
    });

    // Rename references (but not declarations)

    walk.ancestor(ast, {
        AssignmentExpression(node, ancestors) {
            if (node.left.type === 'Identifier') {
                const left_node = node.left;
                const declaration = scopes.getIdentifierDeclaration(left_node, ancestors);
                if (declaration?.newName) {
                    left_node.name = declaration.newName;
                }
            }
        },
        Identifier(node, ancestors) {
            const declaration = scopes.getIdentifierDeclaration(node, ancestors);
            if (declaration?.newName) {
                node.name = declaration.newName;
            }
        }
    });
    
    // Update declarations

    for (let declaration of scopes.declarations()) {
        if (declaration.newName) {
            declaration.id.name = declaration.newName;
        }
    }
}

module.exports = {
    renameDeclarations,
};