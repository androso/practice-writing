import os
import logging
from flask import Flask, render_template, jsonify, request, send_from_directory, redirect, url_for, session, flash
from flask_sqlalchemy import SQLAlchemy
import requests
from datetime import datetime
from statistics import mean

logging.basicConfig(level=logging.DEBUG)

# create the app
app = Flask(__name__)
# setup a secret key, required by sessions
app.secret_key = os.environ.get("FLASK_SECRET_KEY") or "a secret key"
# configure the database, relative to the app instance folder
app.config["SQLALCHEMY_DATABASE_URI"] = os.environ.get("DATABASE_URL")
app.config["SQLALCHEMY_ENGINE_OPTIONS"] = {
    "pool_recycle": 300,
    "pool_pre_ping": True,
}
db = SQLAlchemy(app)

class UserProgress(db.Model):
    __tablename__ = 'user_progress'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id', ondelete='CASCADE'), nullable=False)
    animal_name = db.Column(db.String(80), nullable=False)
    response_time = db.Column(db.Float, nullable=False)  # in seconds
    is_correct = db.Column(db.Boolean, nullable=False)
    timestamp = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)

    def __repr__(self):
        return f'<UserProgress {self.animal_name}>'

class User(db.Model):
    __tablename__ = 'user'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    progress = db.relationship('UserProgress', backref='user', lazy=True, cascade='all, delete-orphan')

    def __repr__(self):
        return f'<User {self.username}>'

    def get_animal_order(self):
        # Get average response times for each animal
        progress_data = {}
        for entry in self.progress:
            if entry.animal_name not in progress_data:
                progress_data[entry.animal_name] = []
            progress_data[entry.animal_name].append(entry.response_time)

        # Calculate average response time for each animal
        avg_times = {
            animal: mean(times) if times else 0 
            for animal, times in progress_data.items()
        }

        # Sort animals by response time (descending)
        return sorted(avg_times.keys(), key=lambda x: avg_times.get(x, 0), reverse=True)

with app.app_context():
    db.create_all()

@app.route('/update_progress', methods=['POST'])
def update_progress():
    if 'user_id' not in session:
        return jsonify({"error": "Not logged in"}), 401

    data = request.json
    animal_name = data.get('animal')
    response_time = data.get('responseTime')
    is_correct = data.get('isCorrect')

    if not all([animal_name, response_time is not None, is_correct is not None]):
        return jsonify({"error": "Missing data"}), 400

    progress = UserProgress(
        user_id=session['user_id'],
        animal_name=animal_name,
        response_time=response_time,
        is_correct=is_correct
    )

    db.session.add(progress)
    db.session.commit()

    # Get updated animal order
    user = User.query.get(session['user_id'])
    animal_order = user.get_animal_order()

    return jsonify({"success": True, "animalOrder": animal_order})

@app.route('/get_animal_order')
def get_animal_order():
    if 'user_id' not in session:
        return jsonify({"error": "Not logged in"}), 401

    user = User.query.get(session['user_id'])
    animal_order = user.get_animal_order()

    return jsonify({"animalOrder": animal_order})

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
        logging.error(f"Error synthesizing speech: {e}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)