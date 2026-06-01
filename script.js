const expressionEl = document.getElementById('expression');
const resultEl = document.getElementById('result');
const readyBtn = document.getElementById('ready-btn');
const transcriptEl = document.getElementById('transcript-display');
const opSelect = document.getElementById('operation');
const langSelect = document.getElementById('lang-select');
const titleEl = document.getElementById('title');
const settingsTitleEl = document.querySelector('#settings-panel h3');
const saveBtnEl = document.getElementById('save-settings');
const gearBtnEl = document.getElementById('settings-toggle');

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

const translations = {
    'en-US': { 
        title: "Math Practice", ready: "Ready to Answer", correct: "CORRECT!", incorrect: "INCORRECT!", listening: "Listening...",
        ops: ["Addition", "Subtraction", "Multiplication", "Division", "Exponents", "Square Roots"],
        settingsTitle: "Personalize Expressions", saveButton: "Save & Apply", gearButton: "⚙️ Settings"
    },
    'pt-BR': { 
        title: "Pratique sua Matemática", ready: "Pronto para Responder", correct: "CORRETO!", incorrect: "INCORRETO!", listening: "Ouvindo...",
        ops: ["Adição", "Subtração", "Multiplicação", "Divisão", "Potenciação", "Raiz Quadrada"],
        settingsTitle: "Personalizar Expressões", saveButton: "Salvar & Aplicar", gearButton: "⚙️ Configurações"
    },
    'es-ES': { 
        title: "Práctica de Matemáticas", ready: "Listo para Responder", correct: "¡CORRECTO!", incorrect: "¡INCORRECTO!", listening: "Escuchando...",
        ops: ["Suma", "Resta", "Multiplicación", "División", "Exponentes", "Raíz Cuadrada"],
        settingsTitle: "Personalizar Expresiones", saveButton: "Guardar & Aplicar", gearButton: "⚙️ Configuración"
    }
};

function updateLanguage() {
    const t = translations[langSelect.value];
    titleEl.innerText = t.title;
    readyBtn.innerText = t.ready;
    gearBtnEl.innerText = t.gearButton; // Updated
    settingsTitleEl.innerText = t.settingsTitle; // Updated
    saveBtnEl.innerText = t.saveButton; // Updated
    
    recognition.lang = langSelect.value;
    
    const ops = t.ops;
    for (let i = 0; i < opSelect.options.length; i++) {
        if (opSelect.options[i].value !== "custom") {
            opSelect.options[i].text = ops[i];
        } else {
            // Translate the "Custom List" option specifically
            opSelect.options[i].text = langSelect.value === 'pt-BR' ? 'Lista Personalizada' : 
                                       langSelect.value === 'es-ES' ? 'Lista Personalizada' : 'Custom List';
        }
    }
}

function generateExpression() {
    const type = opSelect.value;
    let expressionStr = "";

    // 1. Check if user is in "Custom List" mode
    if (type === "custom" && customList && customList.length > 0) {
        const rawExpr = customList[currentCustomIndex];
        currentCustomIndex = (currentCustomIndex + 1) % customList.length;
        expressionStr = rawExpr;
        
        try {
            let cleanExpr = rawExpr.replace(/[xX×]/g, '*').replace('÷', '/');
            currentAnswer = new Function('return ' + cleanExpr)();
        } catch (e) {
            console.error("Invalid custom expression format", e);
            currentAnswer = 0;
            expressionStr = "Error";
        }
    } else {
        // 2. Default Logic
        let a, b;
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
    }

    expressionEl.innerHTML = `${expressionStr} = ?`;
    resultEl.innerText = "";
    transcriptEl.innerText = "";
}

// Add this new function to your script
function createPresetButtons() {
    const scrollContainer = document.getElementById('presets-scroll');
    // Create buttons for tables 1 through 10
    for (let i = 1; i <= 10; i++) {
        const btn = document.createElement('button');
        btn.className = 'preset-btn';
        btn.innerText = i + "x Table";
        btn.onclick = () => {
            // Generate string: "1x1, 1x2, ... 1x10"
            const table = Array.from({length: 10}, (_, k) => `${i}x${k+1}`).join(', ');
            customInput.value = table;
        };
        scrollContainer.appendChild(btn);
    }
}

// Call this once at the bottom of your script
createPresetButtons();

// Settings Logic
settingsToggle.addEventListener('click', () => settingsPanel.classList.toggle('hidden'));

saveSettings.addEventListener('click', () => {
    const inputs = customInput.value.split(',').map(item => item.trim()).filter(item => item !== "");
    if (inputs.length > 0) {
        customList = inputs;
        currentCustomIndex = 0;
        
        if (!document.querySelector('option[value="custom"]')) {
            const customOption = document.createElement("option");
            customOption.value = "custom";
            customOption.text = "Custom List";
            opSelect.add(customOption);
        }
        opSelect.value = "custom";
    }
    settingsPanel.classList.add('hidden');
    generateExpression();
});

// Recognition Logic
recognition.onerror = (event) => console.error("Speech recognition error", event.error);

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

    // Display the text immediately as it's spoken
    // We show the final text, and if we are still speaking, we append the interim text
    transcriptEl.innerHTML = `<span>${finalTranscript}</span> <span style="color: #aaa;">${interimTranscript}</span>`;
    
    // Process the final result to check the answer
    if (finalTranscript) {
        const numbersFound = finalTranscript.match(/\d+/g); 
        if (numbersFound) {
            const lastSpokenNumber = parseInt(numbersFound[numbersFound.length - 1]);
            if (lastSpokenNumber === currentAnswer) {
                resultEl.innerText = translations[langSelect.value].correct;
                resultEl.style.color = "green";
                recognition.stop();
                setTimeout(generateExpression, 2000);
            } else {
                resultEl.innerText = translations[langSelect.value].incorrect;
                resultEl.style.color = "red";
                // Don't clear it too fast so the user can see they got it wrong
                setTimeout(() => { if(resultEl.innerText !== translations[langSelect.value].correct) resultEl.innerText = ""; }, 1500);
            }
        }
    }
};

readyBtn.addEventListener('click', () => {
    // Show the "Listening" translation immediately
    transcriptEl.innerText = translations[langSelect.value].listening;
    transcriptEl.style.color = "#ffd700"; // Ensure it stands out
    
    // Start the recognition
    recognition.start();
});
langSelect.addEventListener('change', updateLanguage);
opSelect.addEventListener('change', generateExpression);

updateLanguage();
generateExpression();
