module.exports = function (babel) {
	let t = babel.types
  
	let preCode = function () {
	  var _Op = (function () {
		'bpo disable'
  
		return {
			add(a, b) {
				return a.operatorAdd ? a.operatorAdd(a, b) : b.operatorAdd ? b.operatorAdd(a, b) : a + b
			},
	
			sub(a, b) {
				return a.operatorSub ? a.operatorSub(a, b) : b.operatorSub ? b.operatorSub(a, b) : a - b
			},

			neg(a) {
				return a.operatorNeg ? a.operatorNeg() : a.operatorMul ? a.operatorMul(-1) : -a
			},

			mod(a, b) {
				return a.operatorMod ? a.operatorMod(a, b) : b.operatorMod ? b.operatorMod(a, b) : a % b
			},
	
			mul(a, b) {
				return a.operatorMul ? a.operatorMul(a, b) : b.operatorMul ? b.operatorMul(a, b) : a * b
			},
	
			div(a, b) {
				return a.operatorDiv ? a.operatorDiv(a, b) : b.operatorDiv ? b.operatorDiv(a, b) : a / b
			},
	
			pow(a, b) {
				return a.operatorPow ? a.operatorPow(a, b) : b.operatorPow ? b.operatorPow(a, b) : a ** b
			},
	
			binaryAnd(a, b) {
				return a.operatorBinaryAnd ? a.operatorBinaryAnd(a, b) : b.operatorBinaryAnd ? b.operatorBinaryAnd(a, b) : a & b
			},
	
			binaryOr(a, b) {
				return a.operatorBinaryOr ? a.operatorBinaryOr(a, b) : b.operatorBinaryOr ? b.operatorBinaryOr(a, b) :  a | b
			},
	
			binaryXor(a, b) {
				return a.operatorBinaryXor ? a.operatorBinaryXor(a, b) : b.operatorBinaryXor ? b.operatorBinaryXor(a, b) : a ^ b
			},
	
			binaryLShift(a, b) {
				return a.operatorBinaryLShift ? a.operatorBinaryLShift(a, b) : b.operatorBinaryLShift ? b.operatorBinaryLShift(a, b) : a << b
			},
	
			binaryRShift(a, b) {
				return a.operatorBinaryRShift ? a.operatorBinaryRShift(a, b) : b.operatorBinaryRShift ? b.operatorBinaryRShift(a, b) : a >> b
			},
	
			binaryZRShift(a, b) {
				return a.operatorBinaryZRShift ? a.operatorBinaryZRShift(a, b) : b.operatorBinaryZRShift ? b.operatorBinaryZRShift(a, b) : a >>> b
			},
	
			less(a, b) {
				return a.operatorLess ? a.operatorLess(a, b) : b.operatorLess ? b.operatorLess(a, b) : a < b
			},
	
			greater(a, b) {
				return a.operatorGreater ? a.operatorGreater(a, b) : b.operatorGreater ? b.operatorGreater(a, b) : a > b
			},
	
			lessEqual(a, b) {
				return a.operatorLessEqual ? a.operatorLessEqual(a, b) : b.operatorLessEqual ? b.operatorLessEqual(a, b) : a <= b
			},
	
			greaterEqual(a, b) {
				return a.operatorGreaterEqual ? a.operatorGreaterEqual(a, b) : b.operatorGreaterEqual ? b.operatorGreaterEqual(a, b) : a >= b
			},
	
			equal(a, b) {
				return a.operatorEqual ? a.operatorEqual(a, b) : b.operatorEqual ? b.operatorNotEqual(a, b) : a == b
			},
	
			notEqual(a, b) {
				return a.operatorNotEqual ? a.operatorNotEqual(a, b) : b.operatorNotEqual ? b.operatorNotEqual(a, b) : a != b
			},

			typeOf(a) {
				return a.operatorTypeOf ? a.operatorTypeOf(a) : typeof a
			},

			instanceOf(a, b) {
				return a.operatorInstanceOf ? a.operatorInstanceOf(a, b) : a instanceof b
			},
			
			strictEqual(a, b) {
				return a.operatorStrictEqual ? a.operatorStrictEqual(a, b) : b.operatorStrictEqual ? b.operatorStrictEqual(a, b) : a === b
			},

			notStrictEqual(a, b) {
				return a.operatorNotStrictEqual ? a.operatorNotStrictEqual(a, b) : b.operatorNotStrictEqual ? b.operatorNotStrictEqual(a, b) : a !== b
			},

			not(a) {
				return a.operatorNot ? a.operatorNot(a) : !a
			},

			binaryNot(a) {
				return a.operatorBinaryNot ? a.operatorBinaryNot(a) : ~a
			},

			incrementPrefix(a) {
				return a.operatorIncrementPrefix ? a.operatorIncrementPrefix(a) : ++a
			},
			
			incrementSuffix(a) {
				return a.operatorIncrementSuffix ? a.operatorIncrementSuffix(a) : a++
			},
			
			decrementPrefix(a) {
				return a.operatorDecrementPrefix ? a.operatorDecrementPrefix(a) : --a
			},
			
			decrementSuffix(a) {
				return a.operatorDecrementSuffix ? a.operatorDecrementSuffix(a) : a--
			},
			// 复合赋值运算符
			plusAssignment(a, b) {
				return a.operatorPlusAssignment ? a.operatorPlusAssignment(a, b) : 
					b.operatorPlusAssignment ? b.operatorPlusAssignment(a, b) : 
					a += b
			},

			minusAssignment(a, b) {
				return a.operatorMinusAssignment ? a.operatorMinusAssignment(a, b) : 
					b.operatorMinusAssignment ? b.operatorMinusAssignment(a, b) : 
					a -= b
			},

			multiplyAssignment(a, b) {
				return a.operatorMultiplyAssignment ? a.operatorMultiplyAssignment(a, b) : 
					b.operatorMultiplyAssignment ? b.operatorMultiplyAssignment(a, b) : 
					a *= b
			},

			divideAssignment(a, b) {
				return a.operatorDivideAssignment ? a.operatorDivideAssignment(a, b) : 
					b.operatorDivideAssignment ? b.operatorDivideAssignment(a, b) : 
					a /= b
			},

			modAssignment(a, b) {
				return a.operatorModAssignment ? a.operatorModAssignment(a, b) : 
					b.operatorModAssignment ? b.operatorModAssignment(a, b) : 
					a %= b
			},

			powerAssignment(a, b) {
				return a.operatorPowerAssignment ? a.operatorPowerAssignment(a, b) : 
					b.operatorPowerAssignment ? b.operatorPowerAssignment(a, b) : 
					a **= b
			},

			leftMoveAssignment(a, b) {
				return a.operatorLeftMoveAssignment ? a.operatorLeftMoveAssignment(a, b) : 
					b.operatorLeftMoveAssignment ? b.operatorLeftMoveAssignment(a, b) : 
					a <<= b
			},

			rightMoveAssignment(a, b) {
				return a.operatorRightMoveAssignment ? a.operatorRightMoveAssignment(a, b) : 
					b.operatorRightMoveAssignment ? b.operatorRightMoveAssignment(a, b) : 
					a >>= b
			},

			rightMoveUnsignedAssignment(a, b) {
				return a.operatorRightMoveUnsignedAssignment ? a.operatorRightMoveUnsignedAssignment(a, b) : 
					b.operatorRightMoveUnsignedAssignment ? b.operatorRightMoveUnsignedAssignment(a, b) : 
					a >>>= b
			},

			bitAndAssignment(a, b) {
				return a.operatorBitAndAssignment ? a.operatorBitAndAssignment(a, b) : 
					b.operatorBitAndAssignment ? b.operatorBitAndAssignment(a, b) : 
					a &= b
			},

			bitOrAssignment(a, b) {
				return a.operatorBitOrAssignment ? a.operatorBitOrAssignment(a, b) : 
					b.operatorBitOrAssignment ? b.operatorBitOrAssignment(a, b) : 
					a |= b
			},

			andAssignment(a, b) {
				return a.operatorAndAssignment ? a.operatorAndAssignment(a, b) : 
					b.operatorAndAssignment ? b.operatorAndAssignment(a, b) : 
					a &&= b
			},

			orAssignment(a, b) {
				return a.operatorOrAssignment ? a.operatorOrAssignment(a, b) : 
					b.operatorOrAssignment ? b.operatorOrAssignment(a, b) : 
					a ||= b
			},

			nullishCoalesceAssignment(a, b) {
				return a.operatorNullishCoalesceAssignment ? a.operatorNullishCoalesceAssignment(a, b) : 
					b.operatorNullishCoalesceAssignment ? b.operatorNullishCoalesceAssignment(a, b) : 
					a ??= b
			}
		}
	  })()
	}.toString()
  
	let preCodeIn = preCode.slice(preCode.indexOf('{') + 1, preCode.lastIndexOf('}'))
  
	let preCodeAST = babel.template(preCodeIn)({})
  
	let initStatus = path => {
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
		path.node.BPO_STATUS = false
	  }
	}
  
	return {
	  visitor: {
		Program(path) {
		  path.unshiftContainer('body', preCodeAST)
		},
		BlockStatement(path) {
		  initStatus(path)
		},
		BinaryExpression(path) {
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

			// 自运算
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
		  }
  
		  let method = tab[path.node.operator]
  
		  if (method == null) {
			return
		  }
  
		  path.replaceWith(
			t.callExpression(
			  t.MemberExpression(t.identifier('_Op'), t.identifier(method)),
			  [path.node.left, path.node.right]
			)
		  )
		},
		UnaryExpression(path) {
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
			  t.MemberExpression(t.identifier('_Op'), t.identifier(method)),
			  [path.node.argument]
			)
		  )
		},
	  },
	}
  }