class AudioManager {
    constructor() {
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        this.gainNode = this.audioContext.createGain();
        this.gainNode.connect(this.audioContext.destination);
        this.lofiTrack = null;
        this.isPlaying = false;
        this.volume = 0.5;
    }

    async initializeLofiMusic() {
        try {
            // Using a Creative Commons licensed lofi track
            const response = await fetch('https://cdn.pixabay.com/download/audio/2022/02/22/audio_d0c6ff1bab.mp3');
            const arrayBuffer = await response.arrayBuffer();
            const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);

            this.lofiTrack = this.audioContext.createBufferSource();
            this.lofiTrack.buffer = audioBuffer;
            this.lofiTrack.loop = true;
            this.lofiTrack.connect(this.gainNode);

            console.log('Lofi music initialized successfully');
        } catch (error) {
            console.error('Error loading lofi music:', error);
            // Try alternative track if first one fails
            try {
                const altResponse = await fetch('https://cdn.pixabay.com/download/audio/2022/03/10/audio_2dde668d05.mp3');
                const altArrayBuffer = await altResponse.arrayBuffer();
                const altAudioBuffer = await this.audioContext.decodeAudioData(altArrayBuffer);

                this.lofiTrack = this.audioContext.createBufferSource();
                this.lofiTrack.buffer = altAudioBuffer;
                this.lofiTrack.loop = true;
                this.lofiTrack.connect(this.gainNode);

                console.log('Alternative lofi music initialized successfully');
            } catch (altError) {
                console.error('Error loading alternative lofi music:', altError);
            }
        }
    }

    async toggleMusic() {
        if (this.audioContext.state === 'suspended') {
            await this.audioContext.resume();
        }

        if (!this.isPlaying && this.lofiTrack) {
            this.lofiTrack.start();
            this.isPlaying = true;
        } else if (this.isPlaying) {
            this.lofiTrack?.stop();
            this.isPlaying = false;
            await this.initializeLofiMusic(); // Prepare new track
        }
    }

    setVolume(value) {
        this.volume = value / 100;
        this.gainNode.gain.value = this.volume;
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
            // Show user-friendly error message
            const feedback = document.getElementById('feedback');
            if (feedback) {
                feedback.textContent = 'Error: No se pudo reproducir la pronunciación';
                feedback.classList.remove('d-none');
                feedback.classList.add('alert-danger');
            }
        }
    }
}