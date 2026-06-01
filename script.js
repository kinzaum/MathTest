const expressionEl = document.getElementById('expression');
const resultEl = document.getElementById('result');
const readyBtn = document.getElementById('ready-btn');
const transcriptEl = document.getElementById('transcript-display');
const opSelect = document.getElementById('operation');
const langSelect = document.getElementById('lang-select');
const titleEl = document.getElementById('title');

const settingsPanel = document.getElementById('settings-panel');
const settingsToggle = document.getElementById('settings-toggle');
const saveSettings = document.getElementById('save-settings');
const customInput = document.getElementById('custom-expressions');

let customList = null; 
let currentCustomIndex = 0;
let currentAnswer = 0;

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();
recognition.interimResults = true;
recognition.continuous = true;

// Helper: Maps number-words to actual integers
function wordToNumber(word, lang) {
    const maps = {
        'en-US': { "one": 1, "two": 2, "three": 3, "four": 4, "five": 5, "six": 6, "seven": 7, "eight": 8, "nine": 9 },
        'pt-BR': { "um": 1, "dois": 2, "três": 3, "quatro": 4, "cinco": 5, "seis": 6, "sete": 7, "oito": 8, "nove": 9 },
        'es-ES': { "uno": 1, "dos": 2, "tres": 3, "cuatro": 4, "cinco": 5, "seis": 6, "siete": 7, "ocho": 8, "nueve": 9 }
    };
    const cleanWord = word.toLowerCase().trim();
    return maps[lang] ? maps[lang][cleanWord] : null;
}

const translations = {
    'en-US': { title: "Math Practice", ready: "Ready to Answer", listening: "Listening...", correct: "CORRECT!", incorrect: "INCORRECT!", ops: ["Addition", "Subtraction", "Multiplication", "Division", "Exponents", "Square Roots"], settingsTitle: "Personalize Expressions", saveButton: "Save & Apply", gearButton: "⚙️ Settings" },
    'pt-BR': { title: "Teste sua Matemática", ready: "Pronto para Responder", listening: "Ouvindo...", correct: "CORRETO!", incorrect: "INCORRETO!", ops: ["Adição", "Subtração", "Multiplicação", "Divisão", "Potenciação", "Raiz Quadrada"], settingsTitle: "Personalizar Expressões", saveButton: "Salvar & Aplicar", gearButton: "⚙️ Configurações" },
    'es-ES': { title: "pon a prueba tus matemáticas", ready: "Listo para Responder", listening: "Escuchando...", correct: "¡CORRECTO!", incorrect: "¡INCORRECTO!", ops: ["Suma", "Resta", "Multiplicación", "División", "Exponentes", "Raíz Cuadrada"], settingsTitle: "Personalizar Expresiones", saveButton: "Guardar & Aplicar", gearButton: "⚙️ Configuración" }
};

function updateLanguage() {
    const t = translations[langSelect.value];
    titleEl.innerText = t.title; readyBtn.innerText = t.ready;
    document.querySelector('#settings-panel h3').innerText = t.settingsTitle;
    document.getElementById('save-settings').innerText = t.saveButton;
    settingsToggle.innerText = t.gearButton;
    recognition.lang = langSelect.value;
    for (let i = 0; i < opSelect.options.length; i++) {
        if (opSelect.options[i].value !== "custom") opSelect.options[i].text = t.ops[i];
    }
}

function generateExpression() {
    const type = opSelect.value;
    let expressionStr = "";
    if (type === "custom" && customList && customList.length > 0) {
        const rawExpr = customList[currentCustomIndex];
        currentCustomIndex = (currentCustomIndex + 1) % customList.length;
        expressionStr = rawExpr;
        try {
            let cleanExpr = rawExpr.replace(/[xX×]/g, '*').replace('÷', '/');
            currentAnswer = new Function('return ' + cleanExpr)();
        } catch (e) { currentAnswer = 0; expressionStr = "Error"; }
    } else {
        let a, b;
        switch(type) {
            case 'addition': a = Math.floor(Math.random() * 20) + 1; b = Math.floor(Math.random() * 20) + 1; currentAnswer = a + b; expressionStr = `${a} + ${b}`; break;
            case 'subtraction': a = Math.floor(Math.random() * 20) + 1; b = Math.floor(Math.random() * a) + 1; currentAnswer = a - b; expressionStr = `${a} - ${b}`; break;
            case 'multiplication': a = Math.floor(Math.random() * 12) + 1; b = Math.floor(Math.random() * 12) + 1; currentAnswer = a * b; expressionStr = `${a} × ${b}`; break;
            case 'division': currentAnswer = Math.floor(Math.random() * 10) + 1; b = Math.floor(Math.random() * 10) + 1; a = currentAnswer * b; expressionStr = `${a} ÷ ${b}`; break;
            case 'exponents': a = Math.floor(Math.random() * 5) + 1; b = Math.floor(Math.random() * 3) + 2; currentAnswer = Math.pow(a, b); expressionStr = `${a}<sup>${b}</sup>`; break;
            case 'squareRoots': a = Math.floor(Math.random() * 10) + 1; currentAnswer = a; expressionStr = `√${a * a}`; break;
        }
    }
    expressionEl.innerHTML = `${expressionStr} = ?`;
    resultEl.innerText = ""; transcriptEl.innerText = "";
}

recognition.onresult = (event) => {
    let final = '', interim = '';
    for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) final += event.results[i][0].transcript;
        else interim += event.results[i][0].transcript;
    }
    transcriptEl.innerHTML = `<span>${final}</span> <span style="color:#aaa;">${interim}</span>`;

    if (final) {
        const words = final.toLowerCase().split(/\W+/);
        let foundNum = null;
        // Check digits
        const match = final.match(/\d+/g);
        if (match) foundNum = parseInt(match[match.length - 1]);
        // Check word-numbers
        else {
            for (let w of words) {
                let val = wordToNumber(w, langSelect.value);
                if (val !== null) foundNum = val;
            }
        }

        if (foundNum !== null) {
            if (foundNum === currentAnswer) {
                resultEl.innerText = translations[langSelect.value].correct;
                resultEl.style.color = "green";
                recognition.stop();
                setTimeout(generateExpression, 2000);
            } else {
                resultEl.innerText = translations[langSelect.value].incorrect;
                resultEl.style.color = "red";
                setTimeout(() => resultEl.innerText = "", 1500);
            }
        }
    }
};

readyBtn.addEventListener('click', () => { transcriptEl.innerText = translations[langSelect.value].listening; recognition.start(); });
saveSettings.addEventListener('click', () => {
    customList = customInput.value.split(',').map(item => item.trim()).filter(i => i);
    currentCustomIndex = 0;
    if (!document.querySelector('option[value="custom"]')) {
        let opt = document.createElement("option"); opt.value = "custom"; opt.text = "Custom List"; opSelect.add(opt);
    }
    opSelect.value = "custom";
    settingsPanel.classList.add('hidden');
    generateExpression();
});

settingsToggle.addEventListener('click', () => settingsPanel.classList.toggle('hidden'));
langSelect.addEventListener('change', updateLanguage);
opSelect.addEventListener('change', generateExpression);
updateLanguage();
generateExpression();
