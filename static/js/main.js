document.addEventListener('DOMContentLoaded', async () => {
    const audioManager = new AudioManager();
    await audioManager.initializeLofiMusic();

    let currentAnimalIndex = 0;
    const animalImage = document.getElementById('animalImage');
    const revealLetters = document.getElementById('revealLetters');
    const letterBoxes = document.getElementById('letterBoxes');
    const userInput = document.getElementById('userInput');
    const checkButton = document.getElementById('checkButton');
    const feedback = document.getElementById('feedback');
    const pronounceButton = document.getElementById('pronounceButton');
    const toggleMusicButton = document.getElementById('toggleMusic');
    const volumeControl = document.getElementById('volumeControl');

    function displayCurrentAnimal() {
        const currentAnimal = animals[currentAnimalIndex];
        animalImage.src = currentAnimal.image;
        animalImage.alt = currentAnimal.english;
        letterBoxes.innerHTML = '';
        revealLetters.textContent = 'Revelar Letras';
    }

    let revealedCount = 0;
    
    function revealAnimalLetters() {
        const currentAnimal = animals[currentAnimalIndex].spanish;
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
    
    function displayCurrentAnimal() {
        const currentAnimal = animals[currentAnimalIndex];
        animalImage.src = currentAnimal.image;
        animalImage.alt = currentAnimal.english;
        letterBoxes.innerHTML = '';
        revealLetters.textContent = 'Revelar Letra';
        revealedCount = 0;
    }

    function checkAnswer() {
        const userAnswer = userInput.value.trim().toLowerCase();
        const correctAnswer = animals[currentAnimalIndex].spanish.toLowerCase();

        feedback.classList.remove('d-none', 'alert-success', 'alert-danger');

        if (userAnswer === correctAnswer) {
            feedback.textContent = '¡Correcto! 🎉';
            feedback.classList.add('alert-success');
            // Play congratulatory message
            audioManager.playPronunciation('¡felicidades!');
            currentAnimalIndex = (currentAnimalIndex + 1) % animals.length;
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
        audioManager.playPronunciation(animals[currentAnimalIndex].spanish);
    });

    toggleMusicButton.addEventListener('click', () => {
        audioManager.toggleMusic();
    });

    volumeControl.addEventListener('input', (e) => {
        audioManager.setVolume(e.target.value);
    });

    // Initialize
    displayCurrentAnimal();
});