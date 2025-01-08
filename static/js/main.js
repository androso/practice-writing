document.addEventListener('DOMContentLoaded', async () => {
    const audioManager = new AudioManager();
    await audioManager.initializeLofiMusic();

    let currentAnimalIndex = 0;
    let inputFocusTime = null;
    let orderedAnimals = [...animals];
    const animalImage = document.getElementById('animalImage');
    const revealLetters = document.getElementById('revealLetters');
    const letterBoxes = document.getElementById('letterBoxes');
    const userInput = document.getElementById('userInput');
    const checkButton = document.getElementById('checkButton');
    const feedback = document.getElementById('feedback');
    const pronounceButton = document.getElementById('pronounceButton');
    const toggleMusicButton = document.getElementById('toggleMusic');
    const volumeControl = document.getElementById('volumeControl');

    async function updateAnimalOrder() {
        try {
            const response = await fetch('/get_animal_order');
            if (response.ok) {
                const data = await response.json();
                if (data.animalOrder && data.animalOrder.length > 0) {
                    // Reorder animals based on server response
                    orderedAnimals = animals.sort((a, b) => {
                        const aIndex = data.animalOrder.indexOf(a.spanish);
                        const bIndex = data.animalOrder.indexOf(b.spanish);
                        return (aIndex === -1 ? Infinity : aIndex) - (bIndex === -1 ? Infinity : bIndex);
                    });
                    currentAnimalIndex = 0;
                    displayCurrentAnimal();
                }
            }
        } catch (error) {
            console.error('Error updating animal order:', error);
        }
    }

    function displayCurrentAnimal() {
        const currentAnimal = orderedAnimals[currentAnimalIndex];
        animalImage.src = currentAnimal.image;
        animalImage.alt = currentAnimal.english;
        letterBoxes.innerHTML = '';
        revealLetters.textContent = 'Revelar Letras';
    }

    function revealAnimalLetters() {
        const currentAnimal = orderedAnimals[currentAnimalIndex].spanish;
        letterBoxes.innerHTML = currentAnimal
            .split('')
            .map(letter => `<span class="badge bg-secondary mx-1">${letter}</span>`)
            .join('');
        revealLetters.textContent = 'Letras Reveladas';
    }

    async function updateProgress(animal, responseTime, isCorrect) {
        console.log(`Response Time for ${animal}: ${responseTime}s, Correct: ${isCorrect}`);
        try {
            const response = await fetch('/update_progress', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    animal,
                    responseTime,
                    isCorrect
                })
            });

            if (response.ok) {
                const data = await response.json();
                if (data.animalOrder) {
                    // Reorder animals based on server response
                    orderedAnimals = animals.sort((a, b) => {
                        const aIndex = data.animalOrder.indexOf(a.spanish);
                        const bIndex = data.animalOrder.indexOf(b.spanish);
                        return (aIndex === -1 ? Infinity : aIndex) - (bIndex === -1 ? Infinity : bIndex);
                    });
                }
            }
        } catch (error) {
            console.error('Error updating progress:', error);
        }
    }

    async function checkAnswer() {
        const userAnswer = userInput.value.trim().toLowerCase();
        const currentAnimal = orderedAnimals[currentAnimalIndex];
        const correctAnswer = currentAnimal.spanish.toLowerCase();
        const responseTime = (Date.now() - inputFocusTime) / 1000; // Convert to seconds

        feedback.classList.remove('d-none', 'alert-success', 'alert-danger');

        const isCorrect = userAnswer === correctAnswer;
        await updateProgress(currentAnimal.spanish, responseTime, isCorrect);

        if (isCorrect) {
            feedback.textContent = '¡Correcto! 🎉';
            feedback.classList.add('alert-success');
            audioManager.playPronunciation('¡felicidades!');
            currentAnimalIndex = (currentAnimalIndex + 1) % orderedAnimals.length;
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

    userInput.addEventListener('focus', () => {
        inputFocusTime = Date.now();
    });

    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            checkAnswer();
        }
    });

    revealLetters.addEventListener('click', revealAnimalLetters);

    pronounceButton.addEventListener('click', () => {
        audioManager.playPronunciation(orderedAnimals[currentAnimalIndex].spanish);
    });

    toggleMusicButton.addEventListener('click', () => {
        audioManager.toggleMusic();
    });

    volumeControl.addEventListener('input', (e) => {
        audioManager.setVolume(e.target.value);
    });

    // Initialize
    await updateAnimalOrder();
    displayCurrentAnimal();
});