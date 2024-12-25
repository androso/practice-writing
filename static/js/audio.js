class AudioManager {
    constructor() {
        this.backgroundMusic = new Audio('/static/bg-music.mp3');
        this.backgroundMusic.loop = true;
        this.isPlaying = false;
        this.volume = 0.5;
        this.backgroundMusic.volume = this.volume;
    }

    async initializeLofiMusic() {
        try {
            // Preload the audio
            await this.backgroundMusic.load();
            console.log('Background music initialized successfully');
        } catch (error) {
            console.error('Error loading background music:', error);
        }
    }

    async toggleMusic() {
        try {
            if (!this.isPlaying) {
                await this.backgroundMusic.play();
                this.isPlaying = true;
            } else {
                this.backgroundMusic.pause();
                this.backgroundMusic.currentTime = 0;
                this.isPlaying = false;
            }
        } catch (error) {
            console.error('Error toggling music:', error);
            const feedback = document.getElementById('feedback');
            if (feedback) {
                feedback.textContent = 'Error: No se pudo reproducir la música';
                feedback.classList.remove('d-none');
                feedback.classList.add('alert-danger');
            }
        }
    }

    setVolume(value) {
        this.volume = value / 100;
        this.backgroundMusic.volume = this.volume;
    }

    async playPronunciation(text) {
        try {
            const response = await fetch('/synthesize', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ text })
            });

            if (response.ok) {
                const blob = await response.blob();
                const audioUrl = URL.createObjectURL(blob);
                const audio = new Audio(audioUrl);
                await audio.play();
            } else {
                console.error('Error playing pronunciation: Server returned', response.status);
                throw new Error('Failed to play pronunciation');
            }
        } catch (error) {
            console.error('Error with pronunciation:', error);
            const feedback = document.getElementById('feedback');
            if (feedback) {
                feedback.textContent = 'Error: No se pudo reproducir la pronunciación';
                feedback.classList.remove('d-none');
                feedback.classList.add('alert-danger');
            }
        }
    }
}