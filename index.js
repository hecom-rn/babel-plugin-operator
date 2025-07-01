module.exports = function (babel) {
  const t = babel.types;

  // 判断当前块或父块是否有 "bpo disable"
  function isBpoDisabled(path) {
    let block = path.findParent(p => t.isBlockStatement(p.node) || t.isProgram(p.node));
    if (block && block.node.directives) {
      for (const directive of block.node.directives) {
        if (directive.value.value === 'bpo disable') {
          return true;
        }
      }
    }
    return false;
  }

  return {
    visitor: {
      Program(path) {
        // 只插入一次 import _Op
        const alreadyImported = path.node.body.some(
          node =>
            node.type === 'ImportDeclaration' &&
            node.source.value === './op-helper'
        );
        if (!alreadyImported) {
          path.unshiftContainer(
            'body',
            t.importDeclaration(
              [t.importDefaultSpecifier(t.identifier('_Op'))],
              t.stringLiteral('./op-helper')
            )
          );
        }
      },
      BinaryExpression(path) {
        if (isBpoDisabled(path)) return;

        const tab = {
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
          '>>>': 'binaryZRShift',
          '<': 'less',
          '>': 'greater',
          '<=': 'lessEqual',
          '>=': 'greaterEqual',
          '==': 'equal',
          '!=': 'notEqual',
          '===': 'strictEqual',
          '!==': 'notStrictEqual',
          'instanceof': 'instanceOf',
          '++': 'incrementPrefix',
          '++Post': 'incrementSuffix',
          '--': 'decrementPrefix',
          '--Post': 'decrementSuffix',
          '+=': 'plusAssignment',
          '-=': 'minusAssignment',
          '*=': 'multiplyAssignment',
          '/=': 'divideAssignment',
          '%=': 'modAssignment',
          '**=': 'powerAssignment',
          '<<=': 'leftMoveAssignment',
          '>>=': 'rightMoveAssignment',
          '>>>=': 'rightMoveUnsignedAssignment',
          '&=': 'bitAndAssignment',
          '|=': 'bitOrAssignment',
          '&&=': 'andAssignment',
          '||=': 'orAssignment',
          '??=': 'nullishCoalesceAssignment'
        };

        const method = tab[path.node.operator];
        if (!method) return;

        path.replaceWith(
          t.callExpression(
            t.memberExpression(t.identifier('_Op'), t.identifier(method)),
            [path.node.left, path.node.right]
          )
        );
      },
      UnaryExpression(path) {
        if (isBpoDisabled(path)) return;

        const tab = {
          '-': 'neg',
          'typeof': 'typeOf',
          '!': 'not',
          '~': 'binaryNot',
        };

        const method = tab[path.node.operator];
        if (!method) return;

        path.replaceWith(
          t.callExpression(
            t.memberExpression(t.identifier('_Op'), t.identifier(method)),
            [path.node.argument]
          )
        );
      },
    },
  };
};