const textToTypeElement = document.getElementById('text-to-type');
const userInputElement = document.getElementById('user-input');
const wpmElement = document.getElementById('wpm');
const accuracyElement = document.getElementById('accuracy');
const timerElement = document.getElementById('timer');
const restartButton = document.getElementById('restart-button');
const nextTestButton = document.getElementById('next-test-button');
const themeSelector = document.getElementById('theme-selector');
const modeSelector = document.getElementById('mode-selector');
const lengthSelector = document.getElementById('length-selector');
const durationSelector = document.getElementById('duration-selector');
const resultsContainer = document.getElementById('results-container');
const keyboardContainer = document.getElementById('keyboard-container');
const errorDetailsList = document.getElementById('error-details');
const guideKeyboardContainer = document.getElementById('guide-keyboard-container');

const KEYBOARD_LAYOUT = [
    ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
    ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'ñ'],
    ['z', 'x', 'c', 'v', 'b', 'n', 'm'],
    ['space']
];

const FINGER_MAP = {
    'q': 'l-pinky', 'a': 'l-pinky', 'z': 'l-pinky',
    'w': 'l-ring', 's': 'l-ring', 'x': 'l-ring',
    'e': 'l-middle', 'd': 'l-middle', 'c': 'l-middle',
    'r': 'l-index', 'f': 'l-index', 'v': 'l-index', 't': 'l-index', 'g': 'l-index', 'b': 'l-index',
    'y': 'r-index', 'h': 'r-index', 'n': 'r-index', 'u': 'r-index', 'j': 'r-index', 'm': 'r-index',
    'i': 'r-middle', 'k': 'r-middle',
    'o': 'r-ring', 'l': 'r-ring',
    'p': 'r-pinky', 'ñ': 'r-pinky',
    ' ': 'thumb', 'space': 'thumb'
};

const SPANISH_WORDS = [
    'de', 'la', 'que', 'el', 'en', 'y', 'a', 'los', 'un', 'del', 'se', 'no', 'una', 'por', 'con', 'su', 'para', 'es', 'al', 'lo', 'como', 'más', 'o', 'pero', 'sus', 'le', 'he', 'si', 'ya', 'me', 'ha', 'qué', 'este', 'ser', 'muy', 'sin', 'sobre', 'cuando', 'también', 'hasta', 'hay', 'donde', 'quien', 'desde', 'todo', 'nos', 'uno', 'otro', 'él', 'contra', 'esa', 'eso', 'mientras', 'entre', 'todos', 'dos', 'son', 'fue', 'mi', 'bien', 'gran', 'será', 'así', 'hacer', 'puede', 'les', 'era', 'mucho', 'tiempo', 'vida', 'gobierno', 'país', 'gente', 'forma', 'casa', 'trabajo', 'mundo', 'hoy', 'lugar', 'persona', 'noche', 'agua', 'algo', 'cosa', 'parte', 'hombre', 'mujer', 'familia', 'idea', 'punto', 'cabeza', 'mano', 'ojo', 'boca', 'brazo', 'cuerpo', 'amigo', 'padre', 'madre', 'hijo', 'niño', 'calle', 'ciudad', 'nombre', 'historia', 'guerra', 'razón', 'fuerza', 'amor', 'luz', 'sol', 'cielo', 'tierra', 'ley', 'orden', 'paz', 'muerte', 'mes', 'año', 'día'
];

const sampleTexts = [
    // Cortas (< 100)
    "El veloz murciélago hindú comía feliz cardillo y kiwi.",
    "La vida es un viaje, no un destino.",
    "La imaginación es más importante que el conocimiento.",
    "El sol brilla para todos por igual.",
    // Medianas (100-250)
    "El éxito es la suma de pequeños esfuerzos que se repiten cada día sin falta. La constancia es la clave para alcanzar tus metas más ambiciosas.",
    "La única forma de hacer un gran trabajo es amar lo que haces. Si aún no lo has encontrado, sigue buscando. No te conformes.",
    "No cuentes los días, haz que los días cuenten. Cada amanecer es una nueva oportunidad para ser mejor y para acercarte a tus sueños.",
    "El futuro pertenece a quienes creen en la belleza de sus sueños. Nunca dejes que nadie te diga que no puedes lograr algo que te propones.",
    // Largas (> 250)
    "La cigüeña tocaba el saxofón detrás del palenque de paja. Este pangrama es un excelente ejercicio para practicar la mecanografía y asegurar que se dominan todas las teclas del teclado, incluyendo aquellas que se usan con menos frecuencia en el día a día.",
    "La educación es el arma más poderosa que puedes usar para cambiar el mundo. Nelson Mandela nos recordó que el conocimiento abre puertas y derriba barreras. Invertir en tu educación es invertir en tu futuro y en el de la sociedad.",
    "La tecnología ha revolucionado la forma en que vivimos y nos comunicamos. Desde la invención de la imprenta hasta la era de internet y la inteligencia artificial, cada avance ha traído consigo tanto oportunidades como desafíos, obligándonos a adaptarnos constantemente."
];

const LENGTH_RANGES = { short: [0, 100], medium: [100, 250], long: [250, Infinity] };
let currentLength = 'medium';
let currentIndex = 0;
let startTime;
let intervalId;
let errorList = [];
let gameMode = 'practice'; // 'practice' or 'timed'
let testDuration = 30; // in seconds
let currentText = '';

function setRootProperty(property, value) {
    document.documentElement.style.setProperty(property, value);
}

function setTheme(theme) {
    if (theme === 'dark') {
        setRootProperty('--bg-color', '#2d2d2d');
        setRootProperty('--text-color', '#f0f0f0');
        setRootProperty('--container-bg', '#3c3c3c');
        setRootProperty('--border-color', '#555');
    } else { // Light theme
        setRootProperty('--bg-color', '#f0f0f0');
        setRootProperty('--text-color', '#333');
        setRootProperty('--container-bg', '#fff');
        setRootProperty('--border-color', '#ccc');
    }
    localStorage.setItem('theme', theme);
}

function setCustomTheme(bgColor) {
    // Simple algorithm to decide text color based on background brightness
    const r = parseInt(bgColor.substr(1, 2), 16);
    const g = parseInt(bgColor.substr(3, 2), 16);
    const b = parseInt(bgColor.substr(5, 2), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    const textColor = brightness > 128 ? '#333' : '#f0f0f0';
    const containerBg = brightness > 128 ? `rgba(255,255,255,0.7)` : `rgba(0,0,0,0.3)`;

    setRootProperty('--bg-color', bgColor);
    setRootProperty('--text-color', textColor);
    setRootProperty('--container-bg', containerBg);
    setRootProperty('--border-color', textColor);
    localStorage.setItem('theme', 'custom');
    localStorage.setItem('custom-bg', bgColor);
}

function createResultsKeyboard() {
    keyboardContainer.innerHTML = '';
    KEYBOARD_LAYOUT.forEach(row => {
        const rowDiv = document.createElement('div');
        rowDiv.className = 'keyboard-row';
        row.forEach(key => {
            const keySpan = document.createElement('span');
            keySpan.className = 'key';
            keySpan.dataset.key = key;
            if (key === 'space') {
                keySpan.classList.add('space');
                keySpan.innerText = 'Espacio';
            } else {
                keySpan.innerText = key;
            }
            rowDiv.appendChild(keySpan);
        });
        keyboardContainer.appendChild(rowDiv);
    });
}

function createGuideKeyboard() {
    guideKeyboardContainer.innerHTML = '';
    KEYBOARD_LAYOUT.forEach(row => {
        const rowDiv = document.createElement('div');
        rowDiv.className = 'keyboard-row';
        row.forEach(key => {
            const keySpan = document.createElement('span');
            keySpan.className = 'key';
            keySpan.dataset.key = key;
            if (key === 'space') {
                keySpan.classList.add('space');
                keySpan.innerText = 'Espacio';
            } else {
                keySpan.innerText = key;
            }

            const finger = FINGER_MAP[key.toLowerCase()];
            if (finger) {
                keySpan.classList.add(`finger-${finger}`);
            }

            rowDiv.appendChild(keySpan);
        });
        guideKeyboardContainer.appendChild(rowDiv);
    });
}

function restartTest() {
    if (gameMode === 'practice') {
        setupPracticeMode(currentText);
    } else {
        setupTimedMode();
    }
}

function getNewText() {
    if (gameMode === 'practice') {
        const [min, max] = LENGTH_RANGES[currentLength];
        const filteredTexts = sampleTexts.filter(text => text.length >= min && text.length < max);
        const textsToUse = filteredTexts.length > 0 ? filteredTexts : sampleTexts;
        const randomIndex = Math.floor(Math.random() * textsToUse.length);
        currentText = textsToUse[randomIndex];
        setupPracticeMode(currentText);
    } else {
        setupTimedMode();
    }
}

function setupPracticeMode(text) {
    currentText = text;
    textToTypeElement.innerHTML = '';
    text.split('').forEach(character => {
        const span = document.createElement('span');
        span.innerText = character;
        textToTypeElement.appendChild(span);
    });

    commonReset();
    updateCursorAndGuide(0);
    timerElement.innerText = '0';
}

function setupTimedMode() {
    textToTypeElement.innerHTML = '';
    addMoreWords(40); // Generar un lote inicial de palabras
    commonReset();
    updateCursorAndGuide(0);
    timerElement.innerText = testDuration;
}

function addMoreWords(count) {
    let words = Array.from({ length: count }, () => SPANISH_WORDS[Math.floor(Math.random() * SPANISH_WORDS.length)]);
    words.forEach(word => {
        // Create a span for the word
        const wordSpan = document.createElement('span');
        wordSpan.className = 'word';
        // Create spans for each character in the word
        word.split('').forEach(char => {
            const charSpan = document.createElement('span');
            charSpan.innerText = char;
            wordSpan.appendChild(charSpan);
        });
        textToTypeElement.appendChild(wordSpan);
        // Add a space character span after the word
        const spaceSpan = document.createElement('span');
        spaceSpan.innerText = ' ';
        textToTypeElement.appendChild(spaceSpan);
    });
}

function commonReset() {
    userInputElement.value = '';
    userInputElement.focus();
    userInputElement.disabled = false;
    
    if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
    }
    
    startTime = null;
    currentIndex = 0;
    errorList = [];
    wpmElement.innerText = '0';
    accuracyElement.innerText = '100';
    
    resultsContainer.style.display = 'none';
    createResultsKeyboard();
    restartButton.disabled = true;
}

document.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    if (savedTheme === 'custom') {
        const savedColor = localStorage.getItem('custom-bg');
        if (savedColor) {
            setCustomTheme(savedColor);
            themeSelector.querySelector('#color-picker').value = savedColor;
        }
    } else {
        setTheme(savedTheme);
    }

    const savedLength = localStorage.getItem('textLength') || 'medium';
    currentLength = savedLength;
    lengthSelector.querySelector('.active')?.classList.remove('active');
    lengthSelector.querySelector(`[data-length="${savedLength}"]`).classList.add('active');
    
    createGuideKeyboard();
    getNewText();
});

modeSelector.addEventListener('click', (e) => {
    if (e.target.tagName !== 'BUTTON') return;
    
    gameMode = e.target.dataset.mode;
    modeSelector.querySelector('.active')?.classList.remove('active');
    e.target.classList.add('active');

    if (gameMode === 'practice') {
        lengthSelector.classList.remove('hidden');
        durationSelector.classList.add('hidden');
    } else {
        lengthSelector.classList.add('hidden');
        durationSelector.classList.remove('hidden');
    }
    getNewText();
});

durationSelector.addEventListener('click', (e) => {
    if (e.target.tagName !== 'BUTTON') return;
    testDuration = parseInt(e.target.dataset.duration, 10);
    durationSelector.querySelector('.active')?.classList.remove('active');
    e.target.classList.add('active');
    getNewText();
});

themeSelector.addEventListener('click', (e) => {
    if (e.target.tagName === 'BUTTON') {
        const theme = e.target.dataset.color;
        
        themeSelector.querySelector('.active')?.classList.remove('active');
        e.target.classList.add('active');
        
        setTheme(theme);
    }
});

themeSelector.querySelector('#color-picker').addEventListener('input', (e) => {
    themeSelector.querySelector('.active')?.classList.remove('active');
    setCustomTheme(e.target.value);
});

lengthSelector.addEventListener('click', (e) => {
    if (e.target.tagName === 'BUTTON') {
        currentLength = e.target.dataset.length;
        localStorage.setItem('textLength', currentLength);

        lengthSelector.querySelector('.active')?.classList.remove('active');
        e.target.classList.add('active');
        
        getNewText();
    }
});

userInputElement.addEventListener('input', () => {
    if (!startTime) {
        startTime = new Date();
        restartButton.disabled = false;
        if (gameMode === 'timed') {
            intervalId = setInterval(updateTimer, 1000);
        } else {
            intervalId = setInterval(updateStats, 1000);
        }
    }

    if (gameMode === 'practice') {
        handlePracticeInput();
    } else {
        handleTimedInput();
    }
});

function handlePracticeInput() {
    const textToTypeSpans = textToTypeElement.querySelectorAll('span');
    const userInputArray = userInputElement.value.split('');
    let correctChars = 0;

    textToTypeSpans.forEach((characterSpan, index) => {
        const character = userInputArray[index];
        if (character == null) {
            characterSpan.classList.remove('correct', 'incorrect');
        } else if (character === characterSpan.innerText) {
            characterSpan.classList.add('correct');
            characterSpan.classList.remove('incorrect');
            correctChars++;
        } else {
            characterSpan.classList.add('incorrect');
            characterSpan.classList.remove('correct');
        }
    });

    currentIndex = userInputArray.length;
    updateAccuracy(correctChars);
    updateCursorAndGuide(currentIndex);

    if (userInputArray.length === textToTypeSpans.length) {
        endGame();
    }
}

function handleTimedInput() {
    const allWordEls = textToTypeElement.querySelectorAll('.word');
    const allCharEls = textToTypeElement.querySelectorAll('span:not(.word)');
    const currentWordIndex = Array.from(allWordEls).findIndex(word => !word.classList.contains('typed'));
    
    if (currentWordIndex === -1) { 
        addMoreWords(20);
        return;
    }
    
    // Find absolute character index for cursor
    let absoluteCharIndex = 0;
    for(let i = 0; i < currentWordIndex; i++) {
        absoluteCharIndex += allWordEls[i].children.length + 1; // +1 for space
    }

    const currentWordEl = allWordEls[currentWordIndex];
    const userInput = userInputElement.value;
    const typedChars = userInput.split('');

    if (userInput.endsWith(' ')) { // Palabra enviada
        const expectedWord = Array.from(currentWordEl.querySelectorAll('span')).map(s => s.innerText).join('');
        const typedWord = userInput.slice(0, -1);
        
        currentWordEl.classList.add('typed');
        if (typedWord === expectedWord) {
            currentWordEl.classList.add('correct');
        } else {
            currentWordEl.classList.add('incorrect');
            for (let i = 0; i < expectedWord.length; i++) {
                if (i >= typedWord.length || typedWord[i] !== expectedWord[i]) {
                    errorList.push({
                        expected: expectedWord[i],
                        typed: typedWord[i] || '',
                    });
                }
            }
        }
        userInputElement.value = '';

        const remainingWords = allWordEls.length - (currentWordIndex + 1);
        if (remainingWords < 15) {
            addMoreWords(20);
        }
        updateCursorAndGuide(absoluteCharIndex + expectedWord.length + 1);
        
    } else { // Escribiendo...
        const expectedChars = currentWordEl.querySelectorAll('span');
        expectedChars.forEach((charSpan, index) => {
            if (typedChars[index] == null) {
                charSpan.classList.remove('correct', 'incorrect');
            } else if (typedChars[index] === charSpan.innerText) {
                charSpan.classList.add('correct');
                charSpan.classList.remove('incorrect');
            } else {
                charSpan.classList.add('incorrect');
                charSpan.classList.remove('correct');
            }
        });
        updateCursorAndGuide(absoluteCharIndex + typedChars.length);
    }

    updateStats();
    updateTimedAccuracy();
}

function updateCursorAndGuide(index) {
    // Update cursor in text
    document.querySelector('.current-char')?.classList.remove('current-char');
    const allChars = textToTypeElement.querySelectorAll('span:not(.word)');
    if (index < allChars.length) {
        allChars[index].classList.add('current-char');
    }

    // Update guide keyboard
    document.querySelector('.next-key')?.classList.remove('next-key');
    if (index < allChars.length) {
        let nextChar = allChars[index].innerText;
        if (nextChar === ' ') nextChar = 'space';

        const nextKeyEl = guideKeyboardContainer.querySelector(`[data-key="${nextChar.toLowerCase()}"]`);
        if (nextKeyEl) {
            nextKeyEl.classList.add('next-key');
        }
    }
}

function endGame() {
    if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
    }
    userInputElement.disabled = true;
    restartButton.disabled = false;

    // Final, accurate error calculation for practice mode
    if (gameMode === 'practice') {
        errorList = []; // Clear previous errors
        const typedText = userInputElement.value;
        const expectedSpans = textToTypeElement.querySelectorAll('span');
        expectedSpans.forEach((span, index) => {
            const expectedChar = span.innerText;
            const typedChar = typedText[index];
            if (typedChar == null || typedChar !== expectedChar) {
                errorList.push({
                    expected: expectedChar,
                    typed: typedChar || '',
                });
            }
        });
    }

    // Recálculo final y preciso de WPM para el modo contrarreloj
    if (gameMode === 'timed') {
        const elapsedTime = testDuration / 60;
        const correctChars = Array.from(textToTypeElement.querySelectorAll('.word.correct span')).length;
        wpmElement.innerText = calculateWPM(elapsedTime, correctChars);
    }
    
    // Generar y mostrar el análisis de errores para ambos modos
    generateErrorAnalysis();
}

function updateTimer() {
    const timeRemaining = testDuration - Math.floor((new Date() - startTime) / 1000);
    timerElement.innerText = timeRemaining;
    if (timeRemaining <= 0) {
        timerElement.innerText = 0;
        endGame();
    }
    updateStats();
}

function updateStats() {
    if (!startTime) return;
    const elapsedTime = (new Date() - startTime) / 1000 / 60;
    
    if (gameMode === 'practice') {
        const correctChars = Array.from(textToTypeElement.querySelectorAll('span.correct')).length;
        wpmElement.innerText = calculateWPM(elapsedTime, correctChars);
    } else {
        const correctChars = Array.from(textToTypeElement.querySelectorAll('.word.correct span')).length;
        wpmElement.innerText = calculateWPM(elapsedTime, correctChars);
    }
}

function calculateWPM(elapsedTime, correctChars) {
    if (elapsedTime <= 0) return 0;
    const wordsTyped = (correctChars / 5);
    return Math.round(wordsTyped / elapsedTime);
}

function updateTimedAccuracy() {
    const typedWords = textToTypeElement.querySelectorAll('.word.typed');
    if (typedWords.length === 0) {
        accuracyElement.innerText = '100';
        return;
    }
    const correctWords = textToTypeElement.querySelectorAll('.word.typed.correct').length;
    const accuracy = Math.round((correctWords / typedWords.length) * 100);
    accuracyElement.innerText = accuracy;
}

function updateAccuracy(correctChars) {
    const totalChars = currentIndex;
    const accuracy = totalChars > 0 ? Math.round((correctChars / totalChars) * 100) : 100;
    accuracyElement.innerText = accuracy;
}

function generateErrorAnalysis() {
    resultsContainer.style.display = 'block';
    errorDetailsList.innerHTML = '';
    
    if (errorList.length === 0) {
        errorDetailsList.innerHTML = '<li>¡Felicidades! Ningún error.</li>';
        return;
    }

    const errorFrequency = {};
    errorList.forEach(error => {
        // Normalizar para teclas como espacio
        const expectedKey = error.expected === ' ' ? 'space' : error.expected.toLowerCase();

        // Contar frecuencia de la tecla que se DEBÍA pulsar
        errorFrequency[expectedKey] = (errorFrequency[expectedKey] || 0) + 1;

        const detailItem = document.createElement('li');
        detailItem.innerHTML = `Se esperaba <b>'${error.expected}'</b> y se escribió <b>'${error.typed}'</b>`;
        errorDetailsList.appendChild(detailItem);
    });

    // Aplicar mapa de calor
    for (const key in errorFrequency) {
        const keyElement = keyboardContainer.querySelector(`[data-key="${key}"]`);
        if (keyElement) {
            const errorCount = errorFrequency[key];
            let errorLevel = 1;
            if (errorCount > 2) errorLevel = 2;
            if (errorCount > 5) errorLevel = 3;
            keyElement.classList.add(`error-level-${errorLevel}`);
        }
    }
}

function calculateTimedWPM(duration) {
    const correctChars = Array.from(textToTypeElement.querySelectorAll('.word.correct span')).length;
    const wordsTyped = correctChars / 5;
    const elapsedTime = duration / 60;
    return Math.round(wordsTyped / elapsedTime);
}

nextTestButton.addEventListener('click', getNewText);
restartButton.addEventListener('click', restartTest); 