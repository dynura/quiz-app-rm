import { useState, useEffect, useRef } from 'react';
import questionsData from './data/questions.json';

export default function App() {
  // --- UI & Environment State ---
  const [phase, setPhase] = useState('START'); // 'START' | 'QUIZ' | 'RESULTS'
  const [darkMode, setDarkMode] = useState(false);

  // --- Quiz Progress & Assessment State ---
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [score, setScore] = useState(0);
  const [userHistory, setUserHistory] = useState([]); 
  
  const [timeLeft, setTimeLeft] = useState(60);
  const timerRef = useRef(null);

  // Toggle dark mode class on root document element
  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  // 60-Second Question Lifecycle Timer
  useEffect(() => {
    if (phase !== 'QUIZ' || showFeedback) {
      clearInterval(timerRef.current);
      return;
    }

    setTimeLeft(60);
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleSkip('timeout'); // Auto-advance instantly on timeout
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [currentIdx, phase, showFeedback]);

  // Unified Handler for Initializing/Resetting Assessment
  const handleStartQuiz = () => {
    setScore(0);
    setCurrentIdx(0);
    setUserHistory([]);
    setSelectedAnswer(null);
    setShowFeedback(false);
    setPhase('QUIZ');
  };

  // Unified Action for both Manual Skips and Automated Timeouts
  const handleSkip = (type = 'skipped') => {
    if (showFeedback) return;
    clearInterval(timerRef.current);
    setScore((prev) => prev - 1);

    const updatedHistory = [
      ...userHistory,
      {
        question: questionsData[currentIdx].question,
        userSelection: type === 'timeout' ? 'Timed Out' : 'Skipped Item',
        correctAnswer: questionsData[currentIdx].answer,
        status: type
      }
    ];

    // Instantly advance question index or move to results phase
    if (currentIdx + 1 < questionsData.length) {
      setCurrentIdx((prev) => prev + 1);
    } else {
      setUserHistory(updatedHistory);
      setPhase('RESULTS');
    }
  };

  // Handles Normal Option Click (Engages Feedback Mode)
  const handleOptionClick = (option) => {
    if (showFeedback) return;
    clearInterval(timerRef.current);
    setSelectedAnswer(option);
    setShowFeedback(true);

    const isCorrect = option === questionsData[currentIdx].answer;
    if (isCorrect) setScore((prev) => prev + 1);

    setUserHistory((prev) => [
      ...prev,
      {
        question: questionsData[currentIdx].question,
        userSelection: option,
        correctAnswer: questionsData[currentIdx].answer,
        status: isCorrect ? 'correct' : 'incorrect'
      }
    ]);
  };

  // Moves to the next question from the interactive feedback screen
  const handleNextQuestion = () => {
    setShowFeedback(false);
    setSelectedAnswer(null);
    if (currentIdx + 1 < questionsData.length) {
      setCurrentIdx((prev) => prev + 1);
    } else {
      setPhase('RESULTS');
    }
  };

  const currentQuestion = questionsData[currentIdx];

  return (
    <div className="min-h-screen bg-mono-light-base dark:bg-mono-dark-base text-mono-light-950 dark:text-mono-dark-950 flex flex-col justify-between font-sans transition-colors duration-200">
      
      {/* Top Application Bar */}
      <header className="border-b border-mono-light-200 dark:border-mono-dark-200 px-6 py-4 flex justify-between items-center bg-mono-light-50 dark:bg-mono-dark-50">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold uppercase tracking-tight">Quiz App</h1>
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-mono-light-900 text-mono-light-base dark:bg-mono-dark-900 dark:text-mono-dark-base tracking-wider uppercase">DYNURA</span>
        </div>
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="border border-mono-light-800 dark:border-mono-dark-800 text-xs uppercase font-medium tracking-widest px-3 py-1.5 rounded hover:bg-mono-light-900 hover:text-mono-light-base dark:hover:bg-mono-dark-900 dark:hover:text-mono-dark-base cursor-pointer transition-all"
        >
          Theme: {darkMode ? 'Dark' : 'Light'}
        </button>
      </header>

      {/* Main Container Core Layout */}
      <main className="grow flex items-center justify-center p-4">
        
        {/* PHASE 1: START CARD */}
        {phase === 'START' && (
          <div className="w-full max-w-md border border-mono-light-200 dark:border-mono-dark-200 p-8 bg-mono-light-50 dark:bg-mono-dark-50 rounded text-center">
            <h2 className="text-2xl font-bold tracking-tight uppercase mb-4">Quiz Initialization</h2>
            <div className="text-sm space-y-2 text-mono-light-600 dark:text-mono-dark-600 mb-8 text-left border-l-2 border-mono-light-900 dark:border-mono-dark-900 pl-4">
              <p>• <strong>Total Items:</strong> {questionsData.length} Assessment Questions</p>
              <p>• <strong>Timer Bounds:</strong> 60s Limit Per Question</p>
              <p>• <strong>Skip Action:</strong> Skips/Timeouts deduct 1 point instantly</p>
            </div>
            <button
              onClick={handleStartQuiz}
              className="w-full py-3 bg-mono-light-900 text-mono-light-base dark:bg-mono-dark-900 dark:text-mono-dark-base text-xs font-semibold uppercase tracking-widest rounded hover:bg-mono-light-800 dark:hover:bg-mono-dark-800 cursor-pointer transition-colors"
            >
              Start Exam
            </button>
          </div>
        )}

        {/* PHASE 2: ACTIVE ASSESSMENT CORE */}
        {phase === 'QUIZ' && (
          <div className="w-full max-w-xl border border-mono-light-200 dark:border-mono-dark-200 p-6 md:p-8 bg-mono-light-50 dark:bg-mono-dark-50 rounded">
            
            {/* Context Status Row */}
            <div className="mb-4 flex justify-between items-center text-xs font-medium uppercase tracking-wider text-mono-light-500 dark:text-mono-dark-500">
              <span>Question {currentIdx + 1} / {questionsData.length}</span>
              <span className={timeLeft <= 10 ? "text-red-600 font-bold animate-pulse" : ""}>Time: {timeLeft}s</span>
            </div>

            {/* Micro Indicator Progress Track */}
            <div className="w-full h-1 bg-mono-light-200 dark:bg-mono-dark-200 mb-6 rounded-full overflow-hidden">
              <div className="h-full bg-mono-light-900 dark:bg-mono-dark-900 transition-all duration-300" style={{ width: `${((currentIdx + 1) / questionsData.length) * 100}%` }} />
            </div>

            {/* Question Display Card */}
            <div className="border border-mono-light-200 dark:border-mono-dark-200 p-5 rounded bg-mono-light-base dark:bg-mono-dark-base mb-6 flex justify-between items-start gap-4">
              <h2 className="text-base md:text-lg font-medium leading-relaxed">{currentQuestion.question}</h2>
              {!showFeedback && (
                <button
                  onClick={() => handleSkip('skipped')}
                  className="px-2.5 py-1 text-[10px] font-bold tracking-widest uppercase border border-mono-light-400 text-mono-light-600 hover:bg-mono-light-900 hover:text-mono-light-base dark:border-mono-dark-400 dark:text-mono-dark-400 dark:hover:bg-mono-dark-900 dark:hover:text-mono-dark-base rounded cursor-pointer transition-colors shrink-0 mt-1"
                >
                  Skip
                </button>
              )}
            </div>

            {/* Unified Clean Option List */}
            <div className="space-y-3 mb-6">
              {currentQuestion.options.map((option, idx) => {
                let btnStyle = "w-full text-left p-4 border rounded text-sm font-medium flex justify-between items-center transition-all cursor-pointer ";
                
                if (!showFeedback) {
                  btnStyle += "border-mono-light-300 dark:border-mono-dark-300 hover:bg-mono-light-100 dark:hover:bg-mono-dark-100";
                } else if (option === currentQuestion.answer) {
                  btnStyle += "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-600 text-emerald-700 dark:text-emerald-400 font-bold";
                } else if (option === selectedAnswer) {
                  btnStyle += "bg-rose-50 dark:bg-rose-950/20 border-rose-600 text-rose-700 dark:text-rose-400";
                } else {
                  btnStyle += "border-mono-light-200 dark:border-mono-dark-200 opacity-40 text-mono-light-400 dark:text-mono-dark-500";
                }

                return (
                  <button key={idx} onClick={() => handleOptionClick(option)} disabled={showFeedback} className={btnStyle}>
                    <span>{option}</span>
                    {showFeedback && option === currentQuestion.answer && <span className="text-xs uppercase font-bold text-emerald-600 dark:text-emerald-400">✓ Correct</span>}
                    {showFeedback && option === selectedAnswer && option !== currentQuestion.answer && <span className="text-xs uppercase font-bold text-rose-600 dark:text-rose-400">✗ Incorrect</span>}
                  </button>
                );
              })}
            </div>

            {/* Bottom State Control Row */}
            <div className="flex justify-between items-center">
              <span className="text-xs font-semibold tracking-wider text-mono-light-500">Score: {score}</span>
              {showFeedback && (
                <button
                  onClick={handleNextQuestion}
                  className="px-6 py-2 bg-mono-light-900 text-mono-light-base dark:bg-mono-dark-900 dark:text-mono-dark-base text-xs font-semibold uppercase tracking-widest rounded hover:bg-mono-light-700 dark:hover:bg-mono-dark-700 cursor-pointer transition-colors"
                >
                  {currentIdx + 1 === questionsData.length ? 'Finish' : 'Next'}
                </button>
              )}
            </div>
          </div>
        )}

        {/* PHASE 3: CLEAN METRIC CARD SHEET */}
        {phase === 'RESULTS' && (
          <div className="w-full max-w-2xl border border-mono-light-200 dark:border-mono-dark-200 p-6 md:p-8 bg-mono-light-50 dark:bg-mono-dark-50 rounded">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold tracking-tight uppercase mb-2">Evaluation Complete</h2>
              <div className="inline-block mt-2 px-6 py-4 border border-mono-light-200 dark:border-mono-dark-200 rounded bg-mono-light-base dark:bg-mono-dark-base">
                <span className="text-4xl font-black block">{score} / {questionsData.length}</span>
                <span className="text-[10px] uppercase tracking-widest font-medium text-mono-light-500">Net Final Score</span>
              </div>
            </div>

            <h3 className="text-xs uppercase tracking-widest font-bold mb-3 text-mono-light-500">Breakdown</h3>
            <div className="space-y-4 max-h-72 overflow-y-auto pr-2 border-t border-b border-mono-light-200 dark:border-mono-dark-200 py-4 mb-8">
              {userHistory.map((item, index) => (
                <div key={index} className="text-xs p-4 border border-mono-light-200 dark:border-mono-dark-200 bg-mono-light-base dark:bg-mono-dark-base rounded">
                  <p className="font-medium text-sm mb-2 text-mono-light-900 dark:text-mono-dark-900">{index + 1}. {item.question}</p>
                  <div className="flex flex-col sm:flex-row justify-between text-mono-light-600 dark:text-mono-dark-500 gap-1">
                    <p>Selection: <span className={item.status === 'correct' ? 'text-emerald-600 font-semibold' : item.status === 'incorrect' ? 'text-rose-600 font-semibold' : 'text-amber-600 font-semibold'}>{item.userSelection}</span></p>
                    <p>Correct: <span className="text-mono-light-900 dark:text-mono-dark-900 font-semibold">{item.correctAnswer}</span></p>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center">
              <button
                onClick={handleStartQuiz}
                className="px-8 py-3 bg-mono-light-900 text-mono-light-base dark:bg-mono-dark-900 dark:text-mono-dark-base text-xs font-semibold uppercase tracking-widest rounded hover:bg-mono-light-800 dark:hover:bg-mono-dark-800 cursor-pointer transition-colors"
              >
                Re-attempt Assessment
              </button>
            </div>
          </div>
        )}
      </main>

      <footer className="border-t border-mono-light-200 dark:border-mono-dark-200 px-6 py-3 text-center text-[10px] tracking-widest uppercase text-mono-light-400 dark:text-mono-dark-400 bg-mono-light-50 dark:bg-mono-dark-50">
        Quiz App • Built with React & Tailwind v4
      </footer>
    </div>
  );
}