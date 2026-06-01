const expressionEl = document.getElementById('expression');
const resultEl = document.getElementById('result');
const readyBtn = document.getElementById('ready-btn');
const transcriptEl = document.getElementById('transcript-display');
const opSelect = document.getElementById('operation');
const langSelect = document.getElementById('lang-select');
const titleEl = document.getElementById('title');

let currentAnswer = 0;
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();
recognition.interimResults = true;
recognition.continuous = true;

const translations = {
    'en-US': { title: "Math Test", ready: "Ready to Answer", correct: "CORRECT!", incorrect: "INCORRECT!", ops: ["Addition", "Subtraction", "Multiplication", "Division", "Exponents", "Square Roots"] },
    'pt-BR': { title: "Prova de Matemática", ready: "Pronto para Responder", correct: "CORRETO!", incorrect: "INCORRETO!", ops: ["Adição", "Subtração", "Multiplicação", "Divisão", "Potenciação", "Raiz Quadrada"] },
    'es-ES': { title: "Prova de Matemáticas", ready: "Listo para Responder", correct: "¡CORRECTO!", incorrect: "¡INCORRECTO!", ops: ["Suma", "Resta", "Multiplicación", "División", "Exponentes", "Raíz Cuadrada"] }
};

function updateLanguage() {
    const t = translations[langSelect.value];
    titleEl.innerText = t.title;
    readyBtn.innerText = t.ready;
    recognition.lang = langSelect.value;
    for (let i = 0; i < opSelect.options.length; i++) {
        opSelect.options[i].text = t.ops[i];
    }
}

function generateExpression() {
    const type = opSelect.value;
    let a, b;
    let expressionStr = "";

    switch(type) {
        case 'addition':
            a = Math.floor(Math.random() * 20) + 1;
            b = Math.floor(Math.random() * 20) + 1;
            currentAnswer = a + b;
            expressionStr = `${a} + ${b}`;
            break;
        case 'subtraction':
            a = Math.floor(Math.random() * 20) + 1;
            b = Math.floor(Math.random() * a) + 1;
            currentAnswer = a - b;
            expressionStr = `${a} - ${b}`;
            break;
        case 'multiplication':
            a = Math.floor(Math.random() * 12) + 1;
            b = Math.floor(Math.random() * 12) + 1;
            currentAnswer = a * b;
            expressionStr = `${a} × ${b}`;
            break;
        case 'division':
            currentAnswer = Math.floor(Math.random() * 10) + 1;
            b = Math.floor(Math.random() * 10) + 1;
            a = currentAnswer * b;
            expressionStr = `${a} ÷ ${b}`;
            break;
        case 'exponents':
            a = Math.floor(Math.random() * 5) + 1;
            b = Math.floor(Math.random() * 3) + 2;
            currentAnswer = Math.pow(a, b);
            expressionStr = `${a}<sup>${b}</sup>`;
            break;
        case 'squareRoots':
            a = Math.floor(Math.random() * 10) + 1;
            currentAnswer = a;
            expressionStr = `√${a * a}`;
            break;
    }

    expressionEl.innerHTML = `${expressionStr} = ?`;
    resultEl.innerText = "";
    transcriptEl.innerText = "";
}

// 1. Add error and no-match handlers
recognition.onerror = (event) => {
    console.error("Speech recognition error", event.error);
};

recognition.onend = () => {
    // This is optional: if you want it to stop listening after an attempt,
    // you leave it. If you want it to restart, you could call recognition.start() here.
    console.log("Recognition service disconnected");
};

// 2. Update your onresult handler to include feedback for WRONG answers
recognition.onresult = (event) => {
    let interimTranscript = '';
    let finalTranscript = '';

    for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
        } else {
            interimTranscript += event.results[i][0].transcript;
        }
    }

    transcriptEl.innerText = interimTranscript || finalTranscript;

    // Use a Regular Expression to find all numbers in the text
    const fullText = (finalTranscript || interimTranscript);
    const numbersFound = fullText.match(/\d+/g); 

    if (numbersFound) {
        // Take the LAST number mentioned in the sentence
        const lastSpokenNumber = parseInt(numbersFound[numbersFound.length - 1]);

        if (!isNaN(lastSpokenNumber)) {
            if (lastSpokenNumber === currentAnswer) {
                resultEl.innerText = translations[langSelect.value].correct;
                resultEl.style.color = "green";
                recognition.stop();
                setTimeout(generateExpression, 2000);
            } else if (finalTranscript) {
                // Only mark as incorrect if the speech is "final"
                resultEl.innerText = translations[langSelect.value].incorrect;
                resultEl.style.color = "red";
                setTimeout(() => { if(resultEl.innerText !== translations[langSelect.value].correct) resultEl.innerText = ""; }, 1500);
            }
        }
    }
};

readyBtn.addEventListener('click', () => recognition.start());
langSelect.addEventListener('change', updateLanguage);
opSelect.addEventListener('change', generateExpression);

updateLanguage();
generateExpression();