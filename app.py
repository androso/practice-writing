import os
import logging
from flask import Flask, render_template, jsonify, request, send_from_directory
import requests

logging.basicConfig(level=logging.DEBUG)

app = Flask(__name__)
app.secret_key = os.environ.get("FLASK_SECRET_KEY", "default_secret_key")

ELEVEN_LABS_API_KEY = os.environ.get("ELEVEN_LABS_API_KEY", "your_api_key")
VOICE_ID = "EXAVITQu4vr4xnSDxMaL"  # Spanish voice ID

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/static/<path:filename>')
def serve_static(filename):
    return send_from_directory('static', filename)

@app.route('/synthesize', methods=['POST'])
def synthesize_speech():
    text = request.json.get('text', '')

    url = f"https://api.elevenlabs.io/v1/text-to-speech/{VOICE_ID}"

    headers = {
        "Accept": "audio/mpeg",
        "Content-Type": "application/json",
        "xi-api-key": ELEVEN_LABS_API_KEY
    }

    data = {
        "text": text,
        "model_id": "eleven_multilingual_v1",
        "voice_settings": {
            "stability": 0.5,
            "similarity_boost": 0.5
        }
    }

    try:
        response = requests.post(url, json=data, headers=headers)
        if response.status_code == 200:
            return response.content, 200, {'Content-Type': 'audio/mpeg'}
        else:
            return jsonify({"error": "Speech synthesis failed"}), 500
    except Exception as e:
        logging.error(f"Error synthesizing speech: {e}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)