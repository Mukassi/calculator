class Calculator {
  constructor(input, output) {
    this.inputDisplay = input;
    this.outputDisplay = output;
    this.inputHistory = [];
  }

  clearAllHistory() {
    this.inputHistory = [];
    this.updateInputDisplay();
    this.updateOutputDisplay('0');
  }

  delete() {
    switch (this.getLastInputType()) {
      case 'number':
        if (this.getLastInputValue().length > 1) {
          this.editLastInput(this.getLastInputValue().slice(0, -1), 'number');
        } else {
          this.deleteLastInput();
        }
        break;
      case 'operator':
        this.deleteLastInput();
        break;
      case 'equals':
        let output = this.getOutputValue()
        this.clearAllHistory()
        if (output.length > 1) {
          this.addNewInput(output, 'number');
          this.editLastInput(this.getLastInputValue().slice(0, -1), 'number');
        }
        break;  
      default:
        return;
    }
  }
  changePercentToDecinal() {
    if(this.getLastInputType() === 'number') {
      this.editLastInput(this.getLastInputValue() / 100, 'number');
    }
  }

  insertNumber(value) {
    if(this.getLastInputType() === 'equals') {
      let output = parseFloat(this.getOutputValue());
      this.clearAllHistory();
      this.addNewInput(output, 'number');
      this.appendToLastInput(value);
    }
    else if(this.getLastInputType() === 'number') {
      if(this.getLastInputValue().includes('.')){
        value = value.replace(/\./,'');
      }
      this.appendToLastInput(value);
    } 
    else if(this.getLastInputType() === 'operator' || this.getLastInputType() === null) {
      this.addNewInput(value, 'number');
    }
  }

  insertOperation(value) {
    switch (this.getLastInputType()){
      case 'number':
        this.addNewInput(value, 'operator');
        break;
      case 'operator':
        this.editLastInput(value, 'operator');
        break;
      case 'equals':
        let output = this.getOutputValue();
        this.clearAllHistory();
        this.addNewInput(output, 'number');
        this.addNewInput(value, 'operator');
        break;
      case null:
        this.addNewInput('0', 'number')
        this.addNewInput(value, 'operator');
      default:
        return; 
    }  
  }

  trigonometryNumber(trigFunction) {
    if(this.getLastInputType() === 'number'){
      this.editLastInput(trigFunction(parseFloat(this.getLastInputValue())), 'number');
    } else if(this.getLastInputType() === 'equals') {
      let output = this.getOutputValue();
      this.clearAllHistory();
      this.addNewInput(trigFunction(parseFloat(output)), 'number');
    } 
  }

  negateNumber() {
    if(this.getLastInputType() === 'number'){2
      this.editLastInput(parseFloat(this.getLastInputValue()) * -1, 'number');
    }
    else if(this.getLastInputType() === 'equals') {
      let output = this.getOutputValue();
      this.clearAllHistory();
      this.addNewInput(parseFloat(output) * -1, 'number');
    }
  }

  logarithmNumber(mathFunction) {
    if(this.getLastInputType() === 'number' && this.getLastInputValue() > 0){
      this.editLastInput(mathFunction(parseFloat(this.getLastInputValue())), 'number');
    }
    else if(this.getLastInputType() === 'equals' && this.getOutputValue() > 0) {
      let output = this.getOutputValue();
      this.clearAllHistory();
      this.addNewInput(mathFunction(parseFloat(output)), 'number');
    }
    else {
        this.clearAllHistory();
        this.addNewInput('Нельзя извлечь логарифм из числа меньше 0','error');
        this.addNewInput('=', 'equals');
    }
  } 

  insertDecimalPoint() {
    if(this.getLastInputType() === 'number' && !this.getLastInputValue().includes('.')) {
      this.appendToLastInput('.');
    }
    else if(this.getLastInputType() === 'operator' || this.getLastInputType() === null) {
      this.addNewInput('0.', 'number');
    }
    else if(this.getLastInputType() === 'equals' && !this.getOutputValue().includes('.')){
      let output = this.getOutputValue();
      this.clearAllHistory();
      this.addNewInput(output, 'number');
      this.appendToLastInput('.');
    }
  }

  generateResult() {
    if (this.getLastInputType() === 'number') {
      const simplyfyExpression = (currentExpression, operator) => {
        if (currentExpression.indexOf(operator) === -1) {
          return currentExpression;
        } else {
          let operatorIdx = currentExpression.indexOf(operator);
          let leftOperandIdx = operatorIdx - 1;
          let rightOperandIdx = operatorIdx + 1;
          let partialSolution = this.performOperation(...currentExpression.slice(leftOperandIdx,rightOperandIdx + 1));
          currentExpression.splice(leftOperandIdx, 3, partialSolution.toString());
          return simplyfyExpression(currentExpression, operator);
        }
      }
      let result = ['^', '*', '/', '+', '-'].reduce(simplyfyExpression, this.getAllInputValues()).toString();
      if (result == 'Infinity' || result == '-Infinity'){
        this.addNewInput('Бесконечность, к сожалению, предел','error');
      }
      if (this.getLastInputType() === 'error'){
        this.addNewInput('=', 'equals');
      } else {
        this.addNewInput('=', 'equals');
        if(this.countDecimals(result) && this.countDecimals(result) > 8) {
          result = Number(result).toFixed(8);
        }
        this.updateOutputDisplay(result);
      }
    }  
  }

  getLastInputType() {
    return (this.inputHistory.length === 0) ? null : this.inputHistory[this.inputHistory.length - 1].type;
  }

  getLastInputValue() {
    return (this.inputHistory.length === 0) ? null : this.inputHistory[this.inputHistory.length - 1].value;
  }

  getAllInputValues() {
    return this.inputHistory.map(entry => entry.value);
  }

  getOutputValue () {
    return this.outputDisplay.textContent;
  }

  addNewInput(value, type) {
    this.inputHistory.push({'type': type, 'value': value.toString()});
    this.updateInputDisplay();
  }

  appendToLastInput(value) {
    this.inputHistory[this.inputHistory.length - 1].value += value.toString();
    this.updateInputDisplay();
  }

  editLastInput (value, type) {
    this.inputHistory.pop();
    this.addNewInput(value, type);
  }

  deleteLastInput() {
    this.inputHistory.pop();
    this.updateInputDisplay();
  }
  updateInputDisplay(error) {
    if (error) {
      this.inputDisplay.innerText = error;
    } else {
      this.inputDisplay.innerText = this.getAllInputValues().join(' ');
    } 
  }
  updateOutputDisplay(value) {
    if(Number(value) || value === '0') {
      this.outputDisplay.innerText = Number(value).toString();
    } else {
      this.outputDisplay.innerText = value.toString();
      this.clearAllHistory();
    }  
  }

  countDecimals(value) {
    if(Math.floor(+value) !== +value){
      return value.toString().split(".")[1].length || 0;
    }
    return 0;
  }

  performOperation(leftOperand, operation, rightOperand) {
    leftOperand = parseFloat(leftOperand);
    rightOperand = parseFloat(rightOperand);
    
    if(Number.isNaN(leftOperand) || Number.isNaN(rightOperand)) {
      return;
    }
    switch(operation) {
      case '^':
        if(rightOperand < 1 && leftOperand < 0) {
          this.clearAllHistory();
          this.addNewInput('Нельзя извлечь корень из отрицательного числа','error');
        }
        return Math.pow(leftOperand, rightOperand);  
      case '*' :
        return leftOperand * rightOperand;
      case '/' :
        if(rightOperand === 0) {
          this.clearAllHistory();
          this.addNewInput('На ноль делить нельзя','error');
        }
        return leftOperand / rightOperand;
      case '-' :
        return leftOperand - rightOperand;
      case '+' :
        return leftOperand + rightOperand;
      default:
        return;     
    }
  }
}

const numberButtons = document.querySelectorAll('[data-number]'),
      operationButtons = document.querySelectorAll('[data-operator]'),
      logarithmButtons = document.querySelectorAll('[data-logarithm]'),
      trigonometryButtons = document.querySelectorAll('[data-trigonometry]'),
      equalsButton = document.querySelector('[data-equals]'),
      deleteButton = document.querySelector('[data-delete]'),
      percentButton = document.querySelector('[data-percent]'),
      decimalButton = document.querySelector('[data-decimal'),
      negationButton = document.querySelector('[data-negation]'),
      allClearButton = document.querySelector('[data-all-clear]'),
      inputDisplay = document.querySelector('#history'),
      outputDisplay = document.querySelector('#result');

const calculator = new Calculator(inputDisplay, outputDisplay);

numberButtons.forEach(button => {
  button.addEventListener('click', (event) => {
    let number = event.target.dataset.number;
    if(number === 'e') {
      calculator.insertNumber(Math.E.toFixed(8));
    } 
    else if(number === 'π') {
      calculator.insertNumber(Math.PI.toFixed(8));
    } 
    else {
      calculator.insertNumber(number);
    }  
  })
})

operationButtons.forEach(button => {
  button.addEventListener('click', (event) => {
    let operator = event.target.dataset.operator;
    if(operator === '^ 2' || operator === '^ 0.5'){
      let exponentiation = operator.split(' ')[1];
      calculator.insertOperation('^');
      calculator.insertNumber(exponentiation);
    } 
    else {
      calculator.insertOperation(operator);
    }
  })
})

logarithmButtons.forEach(button => {
  button.addEventListener('click', (event) => {
    let logarithm = event.target.dataset.logarithm;
    if(logarithm === 'e') {
      calculator.logarithmNumber(Math.log);
    } else if(logarithm === '10') {
      calculator.logarithmNumber(Math.log10);
    }
  })
})

trigonometryButtons.forEach(button => {
  button.addEventListener('click', (event) => {
    let trigonometry = event.target.dataset.trigonometry;
    switch(trigonometry) {
      case 'sin':
        calculator.trigonometryNumber(Math.sin);
        break;
      case 'cos':
        calculator.trigonometryNumber(Math.cos);
        break;
      case 'tan':
        calculator.trigonometryNumber(Math.tan);
        break;    
    }
  })
})

equalsButton.addEventListener('click', button => {
  calculator.generateResult();
})

allClearButton.addEventListener('click', button => {
  calculator.clearAllHistory();
})

deleteButton.addEventListener('click', button => {
  calculator.delete();
})

percentButton.addEventListener('click', button => {
  calculator.changePercentToDecinal();
})

negationButton.addEventListener('click', button => {
  calculator.negateNumber();
})

decimalButton.addEventListener('click', button => {
  calculator.insertDecimalPoint();
})

window.addEventListener('keydown', (event) => {
  let {key} = event;
  if(Number(key) || key === '0') {
    calculator.insertNumber(key);
  }
  if(['^', '*', '/', '+', '-'].some((e) => e == key)) {
    calculator.insertOperation(key);
  }
  switch(key) {
    case 'Delete':
      calculator.clearAllHistory();
      break;
    case 'Backspace':
      calculator.delete();
      break;
    case '.':
      calculator.insertDecimalPoint();
      break;  
    case '%':
      calculator.changePercentToDecinal();
      break; 
    case '=':
      calculator.generateResult();
      break;
    case 'Enter':
      calculator.generateResult();
      break;      
  }
})