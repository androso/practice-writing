import os
import logging
from flask import Flask, render_template, jsonify, request, send_from_directory, redirect, url_for, session, flash
from flask_sqlalchemy import SQLAlchemy
import requests

# Set up logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

app = Flask(__name__)
app.secret_key = os.environ.get("FLASK_SECRET_KEY", "default_secret_key")
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get("DATABASE_URL")
app.config['SQLALCHEMY_ENGINE_OPTIONS'] = {
    "pool_recycle": 300,
    "pool_pre_ping": True,
}

# Add debug logging for configuration
logger.debug(f"Database URL configured: {bool(app.config['SQLALCHEMY_DATABASE_URI'])}")

db = SQLAlchemy(app)

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)

    def __repr__(self):
        return f'<User {self.username}>'

# Test route for basic connectivity check
@app.route('/ping')
def ping():
    return jsonify({"status": "ok"})

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form['username']
        user = User.query.filter_by(username=username).first()

        if not user:
            user = User(username=username)
            db.session.add(user)
            db.session.commit()

        session['user_id'] = user.id
        session['username'] = user.username
        return redirect(url_for('index'))

    return render_template('login.html')

@app.route('/logout')
def logout():
    session.pop('user_id', None)
    session.pop('username', None)
    return redirect(url_for('login'))

ELEVEN_LABS_API_KEY = os.environ.get("ELEVEN_LABS_API_KEY", "your_api_key")
VOICE_ID = "EXAVITQu4vr4xnSDxMaL"  # Spanish voice ID

@app.route('/')
def index():
    if 'user_id' not in session:
        return redirect(url_for('login'))
    return render_template('index.html', username=session.get('username'))

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
        logger.error(f"Error synthesizing speech: {e}")
        return jsonify({"error": str(e)}), 500

# Create all database tables
with app.app_context():
    try:
        db.create_all()
        logger.info("Database tables created successfully")
    except Exception as e:
        logger.error(f"Error creating database tables: {e}")

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)