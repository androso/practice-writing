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
            const response = await fetch('https://dl.dropboxusercontent.com/s/e93f5kxsmtqiw6q/lofi-study-112191.mp3');
            const arrayBuffer = await response.arrayBuffer();
            const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
            
            this.lofiTrack = this.audioContext.createBufferSource();
            this.lofiTrack.buffer = audioBuffer;
            this.lofiTrack.loop = true;
            this.lofiTrack.connect(this.gainNode);
        } catch (error) {
            console.error('Error loading lofi music:', error);
        }
    }

    toggleMusic() {
        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }

        if (!this.isPlaying) {
            this.lofiTrack?.start();
            this.isPlaying = true;
        } else {
            this.lofiTrack?.stop();
            this.isPlaying = false;
            this.initializeLofiMusic(); // Prepare new track
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
                audio.play();
            } else {
                console.error('Error playing pronunciation');
            }
        } catch (error) {
            console.error('Error with pronunciation:', error);
        }
    }
}
