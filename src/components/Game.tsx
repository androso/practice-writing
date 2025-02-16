import { useState, useEffect } from 'react';
import { Button } from './ui/button';

interface Animal {
  english: string;
  spanish: string;
  image: string;
}

interface Chapter {
  title: string;
  thumbnail: string;
  words: Animal[];
}

interface Chapters {
  [key: string]: Chapter;
}

const Game = () => {
  const [currentAnimalIndex, setCurrentAnimalIndex] = useState(0);
  const [currentChapter, setCurrentChapter] = useState<Chapter | null>(null);
  const [revealedCount, setRevealedCount] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [feedback, setFeedback] = useState({ message: '', type: '' });
  const [chapters, setChapters] = useState<Chapters>({});

  useEffect(() => {
    // Load chapters data
    const loadChapters = async () => {
      const response = await fetch('/static/data/animals.js');
      const chaptersData = await response.json();
      setChapters(chaptersData);
    };
    loadChapters();
  }, []);

  const checkAnswer = () => {
    if (!currentChapter) return;
    
    const userAnswer = userInput.trim().toLowerCase();
    const correctAnswer = currentChapter.words[currentAnimalIndex].spanish.toLowerCase();

    if (userAnswer === correctAnswer) {
      setFeedback({ message: '¡Correcto! 🎉', type: 'success' });
      // Play pronunciation here
      setCurrentAnimalIndex((prev) => (prev + 1) % currentChapter.words.length);
      setUserInput('');
      setRevealedCount(0);
    } else {
      setFeedback({ message: '¡Inténtalo de nuevo! 🤔', type: 'error' });
    }
  };

  const revealLetter = () => {
    if (!currentChapter) return;
    const word = currentChapter.words[currentAnimalIndex].spanish;
    if (revealedCount >= word.length) return;
    setRevealedCount((prev) => prev + 1);
  };

  const selectChapter = (chapterKey: string) => {
    setCurrentChapter(chapters[chapterKey]);
    setCurrentAnimalIndex(0);
    setRevealedCount(0);
    setUserInput('');
    setFeedback({ message: '', type: '' });
  };

  if (!currentChapter) {
    return (
      <div className="container mx-auto p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        {Object.entries(chapters).map(([key, chapter]) => (
          <div
            key={key}
            className="cursor-pointer rounded-lg shadow-md hover:shadow-lg transition-shadow"
            onClick={() => selectChapter(key)}
          >
            <img
              src={chapter.thumbnail}
              alt={chapter.title}
              className="w-full h-48 object-cover rounded-t-lg"
            />
            <div className="p-4 text-center font-bold">{chapter.title}</div>
          </div>
        ))}
      </div>
    );
  }

  const currentAnimal = currentChapter.words[currentAnimalIndex];
  const letters = currentAnimal.spanish.split('').map((letter, index) => (
    <span
      key={index}
      className="inline-block w-8 h-8 mx-1 text-center border rounded-md"
    >
      {index < revealedCount ? letter : '?'}
    </span>
  ));

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <Button
        variant="outline"
        className="mb-4"
        onClick={() => setCurrentChapter(null)}
      >
        Back to Chapters
      </Button>

      <div className="text-center">
        <div className="text-sm text-gray-600 mb-2">
          Card {currentAnimalIndex + 1} of {currentChapter.words.length}
        </div>
        <img
          src={currentAnimal.image}
          alt={currentAnimal.english}
          className="mx-auto max-h-64 object-contain mb-4"
        />

        <div className="space-y-4">
          <div className="flex justify-center space-x-1">{letters}</div>

          <Button
            onClick={revealLetter}
            disabled={revealedCount >= currentAnimal.spanish.length}
          >
            {revealedCount >= currentAnimal.spanish.length
              ? 'Todas las Letras Reveladas'
              : 'Revelar Letra'}
          </Button>

          <div className="space-y-2">
            <input
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && checkAnswer()}
              className="w-full p-2 border rounded-md"
              placeholder="Type the Spanish word..."
            />
            <Button onClick={checkAnswer} className="w-full">
              Check Answer
            </Button>
          </div>

          {feedback.message && (
            <div
              className={`p-2 rounded-md ${
                feedback.type === 'success'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}
            >
              {feedback.message}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Game;
