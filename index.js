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
            
            let shouldProcess = !include && !exclude; 

            // 检查白名单
            if (include) {
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
            
            // 黑名单
            if (exclude && (shouldProcess || !include)) {
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

            this.file.set('shouldProcess', shouldProcess);
        },
        visitor: {
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
                initStatus(path)
                if (!path.node.BPO_STATUS) {
                    return
                }

                var tab = {
                    '++': ['incrementPrefix', 'incrementSuffix'],
                    '--': ['decrementPrefix', 'decrementSuffix'],
                }

                let arr = tab[path.node.operator]
                if (!arr) {
                    return
                }
                let method = path.node.prefix ? arr[0] : arr[1]

                if (path.node.prefix) {
                    // 前缀：++a  --b
                    path.replaceWith(
                        t.callExpression(
                            t.MemberExpression(
                                t.memberExpression(t.identifier(this.file.get('options').globalObject), t.identifier('_Op')),
                                t.identifier(method)
                            ),
                            [path.node.argument]
                        )
                    )
                } else {
                    // 后缀：a++  b--
                    // (tmp = a, global._Op.incrementSuffix(a), tmp)
                    const tmp = path.scope.generateUidIdentifierBasedOnNode(path.node.argument, 'old')
                    path.replaceWith(
                        t.sequenceExpression([
                            t.assignmentExpression('=', tmp, path.node.argument),
                            t.callExpression(
                                t.MemberExpression(
                                    t.memberExpression(t.identifier(this.file.get('options').globalObject), t.identifier('_Op')),
                                    t.identifier(method)
                                ),
                                [path.node.argument]
                            ),
                            tmp
                        ])
                    )
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
