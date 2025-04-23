let display = document.getElementById('display');
let expressionDiv = document.getElementById('expression');
let historyDiv = document.getElementById('history');
let currentInput = '';
let tokens = [];
let history = [];

// مدیریت رویداد beforeinstallprompt
let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault(); // جلوگیری از نمایش پیش‌فرض مرورگر
    deferredPrompt = e; // ذخیره رویداد برای استفاده بعدی
    document.getElementById('popupOverlay').style.display = 'flex'; // نمایش پاپ‌آپ
});

function installPWA() {
    if (deferredPrompt) {
        deferredPrompt.prompt(); // نمایش پیشنهاد نصب
        deferredPrompt.userChoice.then((choiceResult) => {
            if (choiceResult.outcome === 'accepted') {
                console.log('User accepted the install prompt');
            } else {
                console.log('User dismissed the install prompt');
            }
            deferredPrompt = null; // پاک کردن رویداد ذخیره‌شده
            closePopup(); // بستن پاپ‌آپ
        });
    } else {
        console.error('No deferredPrompt available.');
    }
}

function closePopup() {
    document.getElementById('popupOverlay').style.display = 'none';
}

// Functions for Buttons
function appendNumber(number) {
    if (number === '.' && currentInput.includes('.')) return;
    currentInput = currentInput.toString() + number.toString();
    updateExpression();
    updateDisplay();
}

function appendOperator(op) {
    if (currentInput === '' && op !== '-') return;
    if (currentInput === '' && op === '-') {
        currentInput = '-';
        updateExpression();
        updateDisplay();
        return;
    }
    tokens.push(parseFloat(currentInput));
    tokens.push(op);
    currentInput = '';
    updateExpression();
}

function calculate() {
    if (tokens.length === 0 && currentInput === '') return;
    tokens.push(parseFloat(currentInput));
    const result = evaluateExpression(tokens);
    const expression = tokens.map(t => typeof t === 'number' ? t : t).join(' ');
    history.push(`${expression} = ${result}`);
    updateHistory();
    currentInput = result.toString();
    tokens = [];
    updateExpression();
    updateDisplay();
}

function evaluateExpression(tokens) {
    const precedence = { '+': 1, '-': 1, '*': 2, '/': 2 };
    let numbers = [];
    let ops = [];
    for (let token of tokens) {
        if (typeof token === 'number') {
            numbers.push(token);
        } else {
            while (ops.length > 0 && precedence[ops[ops.length - 1]] >= precedence[token]) {
                const b = numbers.pop();
                const a = numbers.pop();
                numbers.push(applyOp(ops.pop(), a, b));
            }
            ops.push(token);
        }
    }
    while (ops.length > 0) {
        const b = numbers.pop();
        const a = numbers.pop();
        numbers.push(applyOp(ops.pop(), a, b));
    }
    return numbers.pop();
}

function applyOp(op, a, b) {
    switch (op) {
        case '+': return a + b;
        case '-': return a - b;
        case '*': return a * b;
        case '/': return a / b;
    }
}

function toggleSign() {
    if (currentInput === '') return;
    currentInput = (-parseFloat(currentInput)).toString();
    updateDisplay();
}

function applyPercentage() {
    if (currentInput === '') return;
    let value = parseFloat(currentInput);
    if (tokens.length > 0) {
        const prev = tokens[tokens.length - 1];
        if (typeof prev === 'number') {
            value = prev * (value / 100);
        }
    } else {
        value = value / 100;
    }
    currentInput = value.toString();
    updateDisplay();
    updateExpression();
}

function backspace() {
    if (currentInput !== '') {
        currentInput = currentInput.slice(0, -1);
    } else if (tokens.length > 0) {
        currentInput = tokens.pop().toString();
        tokens.pop();
    }
    updateExpression();
    updateDisplay();
}

function updateDisplay() {
    display.innerText = currentInput !== '' ? currentInput : '0';
}

function updateExpression() {
    let expr = tokens.map(t => typeof t === 'number' ? t : t).join(' ');
    if (currentInput !== '') expr += ` ${currentInput}`;
    expressionDiv.innerText = expr || '...';
}

function updateHistory() {
    historyDiv.innerHTML = history.slice(-1).join('<br>');
}

function clearDisplay() {
    currentInput = '';
    tokens = [];
    updateExpression();
    updateDisplay();
}