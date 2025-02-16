
document.addEventListener('DOMContentLoaded', async () => {
    const audioManager = new AudioManager();
    await audioManager.initializeLofiMusic();

    let currentAnimalIndex = 0;
    let currentChapter = null;
    const chapterSelect = document.getElementById('chapterSelect');
    const gameContent = document.getElementById('gameContent');
    const animalImage = document.getElementById('animalImage');
    const revealLetters = document.getElementById('revealLetters');
    const letterBoxes = document.getElementById('letterBoxes');
    const userInput = document.getElementById('userInput');
    const checkButton = document.getElementById('checkButton');
    const feedback = document.getElementById('feedback');
    const pronounceButton = document.getElementById('pronounceButton');
    const backButton = document.getElementById('backButton');

    function displayChapters() {
        backButton.classList.add('d-none');
        gameContent.classList.add('d-none');
        chapterSelect.classList.remove('d-none');
        chapterSelect.innerHTML = '';
        
        Object.entries(chapters).forEach(([key, chapter]) => {
            const chapterCard = document.createElement('div');
            chapterCard.className = 'chapter-card';
            chapterCard.innerHTML = `
                <img src="${chapter.thumbnail}" alt="${chapter.title}">
                <div class="chapter-title text-center">${chapter.title}</div>
            `;
            chapterCard.addEventListener('click', () => selectChapter(key));
            chapterSelect.appendChild(chapterCard);
        });
    }

    function selectChapter(chapterKey) {
        currentChapter = chapters[chapterKey];
        currentAnimalIndex = 0;
        chapterSelect.classList.add('d-none');
        gameContent.classList.remove('d-none');
        backButton.classList.remove('d-none');
        displayCurrentAnimal();
    }

    backButton.addEventListener('click', () => {
        gameContent.classList.add('d-none');
        chapterSelect.classList.remove('d-none');
        backButton.classList.add('d-none');
        currentChapter = null;
        currentAnimalIndex = 0;
        displayChapters();
    });

    function displayCurrentAnimal() {
        const currentAnimal = currentChapter.words[currentAnimalIndex];
        animalImage.src = currentAnimal.image;
        animalImage.alt = currentAnimal.english;
        letterBoxes.innerHTML = '';
        revealLetters.textContent = 'Revelar Letra';
        revealedCount = 0;
    }

    let revealedCount = 0;

    function revealAnimalLetters() {
        const currentAnimal = currentChapter.words[currentAnimalIndex].spanish;
        if (revealedCount >= currentAnimal.length) {
            return;
        }

        const letters = currentAnimal.split('').map((letter, index) => {
            if (index <= revealedCount) {
                return `<span class="badge bg-secondary mx-1">${letter}</span>`;
            }
            return `<span class="badge bg-secondary mx-1">?</span>`;
        });

        letterBoxes.innerHTML = letters.join('');
        revealedCount++;

        if (revealedCount >= currentAnimal.length) {
            revealLetters.textContent = 'Todas las Letras Reveladas';
        }
    }

    function checkAnswer() {
        const userAnswer = userInput.value.trim().toLowerCase();
        const correctAnswer = currentChapter.words[currentAnimalIndex].spanish.toLowerCase();

        feedback.classList.remove('d-none', 'alert-success', 'alert-danger');

        if (userAnswer === correctAnswer) {
            feedback.textContent = '¡Correcto! 🎉';
            feedback.classList.add('alert-success');
            audioManager.playPronunciation('¡felicidades!');
            currentAnimalIndex = (currentAnimalIndex + 1) % currentChapter.words.length;
            userInput.value = '';
            setTimeout(displayCurrentAnimal, 1000);
        } else {
            feedback.textContent = '¡Inténtalo de nuevo! 🤔';
            feedback.classList.add('alert-danger');
        }
        feedback.classList.remove('d-none');
    }

    // Event Listeners
    checkButton.addEventListener('click', checkAnswer);

    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            checkAnswer();
        }
    });

    revealLetters.addEventListener('click', revealAnimalLetters);

    pronounceButton.addEventListener('click', () => {
        audioManager.playPronunciation(currentChapter.words[currentAnimalIndex].spanish);
    });

    toggleMusicButton.addEventListener('click', () => {
        audioManager.toggleMusic();
    });

    volumeControl.addEventListener('input', (e) => {
        audioManager.setVolume(e.target.value);
    });

    // Initialize
    displayChapters();
});
