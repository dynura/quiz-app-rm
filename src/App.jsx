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
        userSelection: type === 'timeout' ? 'Timed Out' : 'Skipped Question',
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
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-mono-light-900 text-mono-light-base dark:bg-mono-dark-900 dark:text-mono-dark-base tracking-wider uppercase">AAA Pass</span>
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
            <h2 className="text-2xl font-bold tracking-tight uppercase mb-4">Quiz</h2>
            <div className="text-sm space-y-2 text-mono-light-600 dark:text-mono-dark-600 mb-8 text-left border-l-2 border-mono-light-900 dark:border-mono-dark-900 pl-4">
              <p>• <strong>Total Questions:</strong> {questionsData.length} Assessment Questions</p>
              <p>• <strong>Timer Bounds:</strong> 60s Limit Per Question</p>
              <p>• <strong>Skip Action:</strong> Skips/Timeouts deduct 1 point instantly</p>
            </div>
            <button
              onClick={handleStartQuiz}
              className="w-full py-3 bg-mono-light-900 text-mono-light-base dark:bg-mono-dark-900 dark:text-mono-dark-base text-xs font-semibold uppercase tracking-widest rounded hover:bg-mono-light-800 dark:hover:bg-mono-dark-800 cursor-pointer transition-colors"
            >
              Start
            </button>
          </div>
        )}

        {/* PHASE 2: ACTIVE QUIZ */}
        {phase === 'QUIZ' && (
          <div className="w-full max-w-lg flex flex-col items-center">
            
            {/* Top Metrics Area (Header Elements) */}
            <div className="w-full flex justify-between items-center px-2 mb-6">
              {/* Question Counter Badge */}
              <div className="px-3 py-1.5 rounded-full border border-mono-light-200 dark:border-mono-dark-300 bg-mono-light-50 dark:bg-mono-dark-100 text-[11px] font-bold tracking-wider uppercase text-mono-light-600 dark:text-mono-dark-500">
                Question {currentIdx + 1} of {questionsData.length}
              </div>

              {/* Progress Bar Loader Strip */}
              <div className="grow mx-4 h-1.5 bg-mono-light-200 dark:bg-mono-dark-200 rounded-full overflow-hidden max-w-[35]">
                <div 
                  className="h-full bg-mono-light-900 dark:bg-mono-dark-900 transition-all duration-350 ease-out"
                  style={{ width: `${((currentIdx + 1) / questionsData.length) * 100}%` }}
                />
              </div>

              {/* Running Score Counter Badge */}
              <div className="px-3 py-1.5 rounded-full border border-mono-light-200 dark:border-mono-dark-300 bg-mono-light-50 dark:bg-mono-dark-100 text-[11px] font-bold tracking-wider uppercase text-mono-light-600 dark:text-mono-dark-500">
                Score: {score}
              </div>
            </div>

            {/* Floating Question Block Wrapper Container */}
            <div className="w-full relative pt-8 pb-6 px-6 md:px-8 border border-mono-light-200 dark:border-mono-dark-200 bg-mono-light-50 dark:bg-mono-dark-50 rounded-2xl shadow-xl mb-6 text-center">
              
              {/* Circular Timer Ring Frame */}
              <div className="absolute -top-7 left-1/2 -translate-x-1/2 w-14 h-14 rounded-full border-2 border-mono-light-900 dark:border-mono-dark-900 bg-mono-light-base dark:bg-mono-dark-base flex items-center justify-center shadow-md z-10">
                <span className={`text-sm font-black tracking-tighter ${timeLeft <= 10 ? "text-rose-600 dark:text-rose-400 animate-pulse" : "text-mono-light-950 dark:text-mono-dark-950"}`}>
                  {timeLeft}
                </span>
              </div>

              {/* Tiny Sub-Category Text Identifier */}
              <span className="text-[10px] font-bold uppercase tracking-widest text-mono-light-400 dark:text-mono-dark-400 block mb-2 mt-2">
                Technical Assessment
              </span>

              {/* Primary Question String Statement */}
              <h2 className="text-lg md:text-xl font-semibold leading-relaxed text-mono-light-950 dark:text-mono-dark-950 max-w-md mx-auto">
                “{currentQuestion.question}”
              </h2>

              {/* Inline Skip Target Mechanism */}
              {!showFeedback && (
                <button
                  onClick={handleSkip}
                  className="mt-4 px-3 py-1 text-[9px] font-bold tracking-widest uppercase border border-mono-light-300 text-mono-light-400 hover:border-mono-light-900 hover:text-mono-light-900 dark:border-mono-dark-400 dark:text-mono-dark-500 dark:hover:border-mono-dark-950 dark:hover:text-mono-dark-950 rounded transition-colors cursor-pointer"
                >
                  Skip Question
                </button>
              )}
            </div>

            {/* Structured Options Selection Grid List */}
            <div className="w-full space-y-3.5 mb-6">
              {currentQuestion.options.map((option, idx) => {
                let btnStyle = "w-full text-left p-4 border rounded-xl transition-all text-sm font-medium flex justify-between items-center cursor-pointer shadow-sm ";
                
                if (!showFeedback) {
                  btnStyle += "border-mono-light-200 dark:border-mono-dark-200 bg-mono-light-base dark:bg-mono-dark-base text-mono-light-800 dark:text-mono-dark-800 hover:border-mono-light-900 dark:hover:border-mono-dark-900 hover:translate-x-1";
                } else {
                  if (option === currentQuestion.answer) {
                    btnStyle += "bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-600 text-emerald-800 dark:text-emerald-400 font-bold border-2";
                  } else if (option === selectedAnswer && option !== currentQuestion.answer) {
                    btnStyle += "bg-rose-50/60 dark:bg-rose-950/20 border-rose-600 text-rose-800 dark:text-rose-400 border-2";
                  } else {
                    btnStyle += "border-mono-light-100 dark:border-mono-dark-100 text-mono-light-300 dark:text-mono-dark-600 bg-mono-light-base dark:bg-mono-dark-base opacity-45 pointer-events-none";
                  }
                }

                return (
                  <button
                    key={idx}
                    onClick={() => handleOptionClick(option)}
                    disabled={showFeedback}
                    className={btnStyle}
                  >
                    <span className="pr-4">{option}</span>
                    {showFeedback && option === currentQuestion.answer && (
                      <span className="text-[10px] uppercase tracking-wider font-extrabold text-emerald-600 dark:text-emerald-400 shrink-0">
                        ✓ Correct
                      </span>
                    )}
                    {showFeedback && option === selectedAnswer && option !== currentQuestion.answer && (
                      <span className="text-[10px] uppercase tracking-wider font-extrabold text-rose-600 dark:text-rose-400 shrink-0">
                        ✗ Incorrect
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Post-Submit Navigation Action Drawer */}
            {showFeedback && (
              <div className="w-full animate-fadeIn">
                <button
                  onClick={handleNextQuestion}
                  className="w-full py-3.5 bg-mono-light-900 text-mono-light-base dark:bg-mono-dark-900 dark:text-mono-dark-base text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-mono-light-800 dark:hover:bg-mono-dark-800 transition-all shadow-md active:scale-[0.99] cursor-pointer"
                >
                  {currentIdx + 1 === questionsData.length ? 'Finish & Review Assessment' : 'Continue to Next Question'}
                </button>
              </div>
            )}
          </div>
        )}

        {/* PHASE 3: EVALUATION & DETAILED RESULTS SHEET */}
        {phase === 'RESULTS' && (
          <div className="w-full max-w-2xl border border-mono-light-200 dark:border-mono-dark-200 p-6 md:p-8 bg-mono-light-50 dark:bg-mono-dark-50 rounded-2xl shadow-xl animate-fadeIn">
            
            {/* Performance Summary Header Card */}
            <div className="text-center pb-6 border-b border-mono-light-200 dark:border-mono-dark-200 mb-6">
              <span className="text-[10px] font-bold uppercase tracking-widest text-mono-light-400 dark:text-mono-dark-400 block mb-1">
                Assessment Completed
              </span>
              <h2 className="text-2xl font-black uppercase tracking-tight text-mono-light-950 dark:text-mono-dark-950">
                Performance Review
              </h2>
              
              {/* Final Net Score Unit */}
              <div className="mt-4 inline-block px-6 py-3 rounded-xl bg-mono-light-900 text-mono-light-base dark:bg-mono-dark-900 dark:text-mono-dark-base">
                <p className="text-[10px] font-bold uppercase tracking-wider opacity-70">Net Score</p>
                <p className="text-3xl font-black tracking-tight">{score} <span className="text-sm font-normal opacity-50">/ {questionsData.length}</span></p>
              </div>
            </div>

            {/* Itemized Audit Log / History List */}
            <h3 className="text-xs font-bold uppercase tracking-wider text-mono-light-500 dark:text-mono-dark-400 mb-3">
              Detailed Response Log
            </h3>
            
            <div className="space-y-3 max-h-[80] overflow-y-auto pr-2 mb-8 border border-mono-light-200 dark:border-mono-dark-200 rounded-xl p-3 bg-mono-light-base dark:bg-mono-dark-base">
              {userHistory.map((item, idx) => (
                <div 
                  key={idx} 
                  className="p-3 border rounded-lg text-sm bg-mono-light-50 dark:bg-mono-dark-100 border-mono-light-100 dark:border-mono-dark-200"
                >
                  <div className="flex items-start justify-between gap-4 mb-1.5">
                    <p className="font-semibold text-mono-light-900 dark:text-mono-dark-900 leading-snug">
                      {idx + 1}. {item.question}
                    </p>
                    
                    {/* Status Pill Badges */}
                    <span className={`text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded shrink-0 ${
                      item.status === 'correct' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400' :
                      item.status === 'incorrect' ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-400' :
                      'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400'
                    }`}>
                      {item.status}
                    </span>
                  </div>

                  {/* Sub-text Audit Selections */}
                  <div className="text-xs space-y-0.5 text-mono-light-500 dark:text-mono-dark-500">
                    <p>
                      Your Selection:{' '}
                      <span className={
                        item.status === 'correct' ? 'text-emerald-600 font-semibold' : 
                        item.status === 'incorrect' ? 'text-rose-600 font-semibold' : 'text-amber-600 font-semibold'
                      }>
                        {item.userSelection}
                      </span>
                    </p>
                    <p>Correct Answer: <span className="text-mono-light-900 dark:text-mono-dark-900 font-semibold">{item.correctAnswer}</span></p>
                  </div>
                </div>
              ))}
            </div>

            {/* Reset / Re-Attempt Form Action */}
            <div className="text-center">
              <button
                onClick={handleStartQuiz}
                className="w-full py-3.5 bg-mono-light-900 text-mono-light-base dark:bg-mono-dark-900 dark:text-mono-dark-base text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-mono-light-800 dark:hover:bg-mono-dark-800 transition-all shadow-md active:scale-[0.99] cursor-pointer"
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