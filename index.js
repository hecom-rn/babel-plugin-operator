module.exports = function (babel) {
    let t = babel.types

    // 默认配置
    const DEFAULT_OPTIONS = {
        include: null,    // 白名单 (null 表示不限制)
        exclude: null,     // 黑名单 (null 表示不限制)
        globalObject: 'global' //  'global' | 'window' // 全局对象名称
    };

    let initStatus = path => {
        path.node.BPO_STATUS = true; // 默认启用

        // 查找最近的禁用指令
        const disableDirective = path.findParent(p => 
          p.node.directives?.some(d => d.value.value === 'bpo disable')
        );
        
        if (disableDirective) {
          path.node.BPO_STATUS = false;
        }

        let firstBlockStatement = path.findParent(
            path => t.isBlockStatement(path.node) || t.isProgram(path.node)
        )
        if (firstBlockStatement) {
            for (let directiveID in firstBlockStatement.node.directives) {
                let directive = firstBlockStatement.node.directives[directiveID]
                if (directive.value.value == 'bpo disable') {
                    path.node.BPO_HAVE_DEFAULT = true
                    path.node.BPO_STATUS = false
                    break
                } else if (directive.value.value == 'bpo enable') {
                    path.node.BPO_HAVE_DEFAULT = true
                    path.node.BPO_STATUS = true
                    break
                }
            }
            if (!path.node.BPO_HAVE_DEFAULT && firstBlockStatement.node.BPO_HAVE_DEFAULT) {
                path.node.BPO_HAVE_DEFAULT = true
                path.node.BPO_STATUS = firstBlockStatement.node.BPO_STATUS
            }
        }
        if (!path.node.BPO_HAVE_DEFAULT) {
            path.node.BPO_HAVE_DEFAULT = true
            path.node.BPO_STATUS = true // 默认启用
        }
    }

    return {
        //  name: 'babel-plugin-operator',
         pre(file) {
            // 初始化配置
            const options = { ...DEFAULT_OPTIONS, ...this.opts };
            this.file.set('options', options);
            
            // 检查文件是否应该被处理
            const filename = file.opts.filename || '';
            const { include, exclude } = options;
            
            let shouldProcess = true; 

            // 黑名单
            if (exclude) {
                if (Array.isArray(exclude)) {
                    shouldProcess = !exclude.some(pattern => 
                        typeof pattern === 'string' ? filename.includes(pattern) : pattern.test(filename)
                    );
                } else {
                    shouldProcess = typeof exclude === 'string' 
                        ? !filename.includes(exclude) 
                        : !exclude.test(filename);
                }
            }

            // 检查白名单
            if (include && !shouldProcess) {
                if (Array.isArray(include)) {
                    shouldProcess = include.some(pattern => 
                        typeof pattern === 'string' ? filename.includes(pattern) : pattern.test(filename)
                    );
                } else {
                    shouldProcess = typeof include === 'string' 
                        ? filename.includes(include) 
                        : include.test(filename);
                }
            }
            
            this.file.set('shouldProcess', shouldProcess);
        },
        visitor: {
            NewExpression(path) {
                if (!this.file.get('shouldProcess')) return;
                initStatus(path);
                if (!path.node.BPO_STATUS) return;

                const { callee } = path.node;

                // 检查是否为 new Number() 调用
                if (t.isIdentifier(callee, { name: 'Number' })) {
                    path.replaceWith(
                        t.callExpression(
                            t.memberExpression(
                                t.identifier(this.file.get('options').globalObject),
                                t.identifier('_Number')
                            ),
                            path.node.arguments
                        )
                    );
                }
            },
            // 新增的 CallExpression 处理逻辑
            CallExpression(path) {
                if (!this.file.get('shouldProcess')) return;
                initStatus(path);
                if (!path.node.BPO_STATUS) return;

                const { callee } = path.node;

                if (t.isIdentifier(callee, { name: 'Number' })) {
                    path.replaceWith(
                        t.callExpression(
                            t.memberExpression(
                                t.identifier(this.file.get('options').globalObject),
                                t.identifier('_Number')
                            ),
                            path.node.arguments
                        )
                    );
                }

                // 1. 检查是否为 Math 的静态方法调用（如 Math.max(a, b)）
                if (t.isMemberExpression(callee) && 
                    t.isIdentifier(callee.object, { name: 'Math' }) &&
                    t.isIdentifier(callee.property)) {
                    
                    const methodName = callee.property.name;
                    const supportedMethods = ['max', 'min', 'abs', 'floor', 'ceil', 'round', 'pow', 'sqrt']; // 可扩展其他方法
                    
                    if (supportedMethods.includes(methodName)) {
                        // 2. 替换为 Decimal.methodName(...args)
                        path.replaceWith(
                            t.callExpression(
                                t.memberExpression(
                                    t.memberExpression(
                                        t.identifier(this.file.get('options').globalObject),
                                        t.identifier('_Decimal')
                                    ),
                                    t.identifier(methodName)
                                ),
                                path.node.arguments
                            )
                        );
                    }
                }
            },
            BlockStatement(path) {
                if (!this.file.get('shouldProcess')) return;
                initStatus(path)
            },
            BinaryExpression(path) {
                if (!this.file.get('shouldProcess')) return;
                initStatus(path)
                if (!path.node.BPO_STATUS) {
                    return
                }

                let tab = {
                    '+': 'add',
                    '-': 'sub',
                    '*': 'mul',
                    '/': 'div',
                    '**': 'pow',
                    '%': 'mod',

                    '&': 'binaryAnd',
                    '|': 'binaryOr',
                    '^': 'binaryXor',
                    '<<': 'binaryLShift',
                    '>>': 'binaryRShift',
                    // '>>>': 'binaryZRShift',

                    '<': 'less',
                    '>': 'greater',
                    '<=': 'lessEqual',
                    '>=': 'greaterEqual',
                    '==': 'equal',
                    '!=': 'notEqual',
                    '===': 'strictEqual',
                    '!==': 'notStrictEqual',

                    'instanceof': 'instanceOf',

                    '&&': 'logicalAnd',
                    '||': 'logicalOr'
                }

                let method = tab[path.node.operator]

                if (method == null) {
                    return
                }

                path.replaceWith(
                    t.callExpression(
                        t.MemberExpression(
                            t.memberExpression(t.identifier(this.file.get('options').globalObject), t.identifier('_Op')),
                            t.identifier(method)
                        ),
                        [path.node.left, path.node.right]
                    )
                )
            },
            UnaryExpression(path) {
                if (!this.file.get('shouldProcess')) return;
                initStatus(path)
                if (!path.node.BPO_STATUS) {
                    return
                }

                var tab = {
                    '-': 'neg',
                    'typeof': 'typeOf',
                    '!': 'not',
                    '~': 'binaryNot',
                }

                let method = tab[path.node.operator]

                if (method == null) {
                    return
                }

                path.replaceWith(
                    t.callExpression(
                        t.MemberExpression(
                            t.memberExpression(t.identifier(this.file.get('options').globalObject), t.identifier('_Op')),
                            t.identifier(method)
                        ),
                        [path.node.argument]
                    )
                )
            },
            UpdateExpression(path) {
                if (!this.file.get('shouldProcess')) return;
                initStatus(path);
                if (!path.node.BPO_STATUS) return;

                const tab = {
                    '++': 'add',
                    '--': 'sub'
                };

                const method = tab[path.node.operator];
                if (!method) return;

                const globalObj = t.identifier(this.file.get('options').globalObject);
                const opObj = t.memberExpression(globalObj, t.identifier('_Op'));
                const addFn = t.memberExpression(opObj, t.identifier(method));

                const one = t.numericLiteral(1);
                const arg = path.node.argument;

                const coerceNullOrEmpty = (value) => {
                    return t.conditionalExpression(
                        t.logicalExpression(
                            '||',
                            t.binaryExpression('===', value, t.nullLiteral()),
                            t.binaryExpression('===', value, t.stringLiteral(''))
                        ),
                        t.numericLiteral(0),
                        value
                    );
                };

                if (path.node.prefix) {
                    path.replaceWith(
                        t.assignmentExpression(
                            '=',
                            arg,
                            t.callExpression(addFn, [coerceNullOrEmpty(arg), one])
                        )
                    );
                } else {
                    const tmp = path.scope.generateUidIdentifierBasedOnNode(arg, 'old');

                    // 1. 创建变量声明语句
                    const varDeclaration = t.variableDeclaration('var', [
                        t.variableDeclarator(tmp, arg) // 直接初始化变量
                    ]);

                    // 2. 创建赋值和返回值表达式
                    const assignment = t.assignmentExpression(
                        '=',
                        arg,
                        t.callExpression(addFn, [coerceNullOrEmpty(arg), one])
                    );
                    const returnValue = coerceNullOrEmpty(tmp);

                    // 3. 将变量声明和表达式组合成BlockStatement
                    path.replaceWith(
                        t.blockStatement([
                            varDeclaration,
                            t.expressionStatement(assignment),
                            t.expressionStatement(returnValue)
                        ])
                    );
                }
            },
            AssignmentExpression(path) {
                if (!this.file.get('shouldProcess')) return;
                initStatus(path)
                if (!path.node.BPO_STATUS) {
                    return
                }

                let tab = {
                    '+=': 'plusAssignment',
                    '-=': 'minusAssignment',
                    '*=': 'multiplyAssignment',
                    '/=': 'divideAssignment',
                    '%=': 'modAssignment',
                    // '**=': 'powerAssignment',
                    // '<<=': 'leftMoveAssignment',
                    // '>>=': 'rightMoveAssignment',
                    // '>>>=': 'rightMoveUnsignedAssignment',
                    // '&=': 'bitAndAssignment',
                    // '|=': 'bitOrAssignment',
                    // '&&=': 'andAssignment',
                    // '||=': 'orAssignment',
                    // '??=': 'nullishCoalesceAssignment'
                }

                let method = tab[path.node.operator]
                if (method == null) {
                    return
                }

                // 支持对象属性赋值 a.v += b
                if (path.node.left.type === 'MemberExpression') {
                    path.replaceWith(
                        t.assignmentExpression('=',
                            path.node.left,
                            t.callExpression(
                                t.MemberExpression(
                                    t.memberExpression(t.identifier(this.file.get('options').globalObject), t.identifier('_Op')),
                                    t.identifier(method)
                                ),
                                [path.node.left, path.node.right]
                            )
                        )
                    )
                } else {
                    // 普通变量赋值 a += b
                    path.replaceWith(
                        t.assignmentExpression('=',
                            path.node.left,
                            t.callExpression(
                                t.MemberExpression(
                                    t.memberExpression(t.identifier(this.file.get('options').globalObject), t.identifier('_Op')),
                                    t.identifier(method)
                                ),
                                [path.node.left, path.node.right]
                            )
                        )
                    )
                }
            },
        },
    }
}
