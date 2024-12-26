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

    function revealAnimalLetters() {
        const currentAnimal = animals[currentAnimalIndex].spanish;
        letterBoxes.innerHTML = currentAnimal
            .split('')
            .map(letter => `<span class="badge bg-secondary mx-1">${letter}</span>`)
            .join('');
        revealLetters.textContent = 'Letras Reveladas';
    }

    function checkAnswer() {
        const userAnswer = userInput.value.trim().toLowerCase();
        const correctAnswer = animals[currentAnimalIndex].spanish.toLowerCase();

        feedback.classList.remove('d-none', 'alert-success', 'alert-danger');

        if (userAnswer === correctAnswer) {
            feedback.textContent = '¡Correcto! 🎉';
            feedback.classList.add('alert-success');
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