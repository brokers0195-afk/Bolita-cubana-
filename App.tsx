import React, { useState, useEffect, useRef } from 'react';
import Header from './components/Header';
import DrawDisplay from './components/DrawDisplay';
import History from './components/History';
import Footer from './components/Footer';
import Confetti from './components/Confetti';
import { DrawResult, DrawType, DrawSession } from './types';

const generateInitialNumbers = (count: number): number[] => {
  return Array.from({ length: count }, () => Math.floor(Math.random() * 10));
}

type GameState = 'IDLE' | 'DRAWING' | 'INTERMISSION' | 'RESULTS';

const sessionInfo = {
  [DrawSession.Midday]: {
    label: 'Mediodía',
    time: '11:30 am'
  },
  [DrawSession.Night]: {
    label: 'Noche',
    time: '8:30 pm'
  }
};

const App: React.FC = () => {
  const [pink4Numbers, setPink4Numbers] = useState<(number | null)[]>(generateInitialNumbers(4));
  const [pink3Numbers, setPink3Numbers] = useState<(number | null)[]>(generateInitialNumbers(3));
  const [history, setHistory] = useState<DrawResult[]>([]);
  const [isDrawingPink4, setIsDrawingPink4] = useState(false);
  const [isDrawingPink3, setIsDrawingPink3] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [activeDraw, setActiveDraw] = useState<DrawType>(DrawType.Pink4);
  const [gameState, setGameState] = useState<GameState>('IDLE');
  const [intermissionCountdown, setIntermissionCountdown] = useState(10);
  const [currentDrawSession, setCurrentDrawSession] = useState<DrawSession | null>(null);
  const [nextDrawSession, setNextDrawSession] = useState<DrawSession>(DrawSession.Midday);


  const audioContextRef = useRef<AudioContext | null>(null);
  const shuffleSoundIntervalRef = useRef<number | null>(null);
  const confettiTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    try {
      const storedHistory = localStorage.getItem('boliCubaHistory');
      if (storedHistory) {
        const parsedHistory = JSON.parse(storedHistory, (key, value) => {
          if (key === 'timestamp' && value) {
            return new Date(value);
          }
          return value;
        });
        setHistory(parsedHistory);
      }

      const storedNextSession = localStorage.getItem('boliCubaNextSession');
      if (storedNextSession && (storedNextSession === DrawSession.Midday || storedNextSession === DrawSession.Night)) {
        setNextDrawSession(storedNextSession as DrawSession);
      }

    } catch (error) {
      console.error("Failed to load from localStorage", error);
    }

    return () => {
      stopShufflingSound();
      if (confettiTimeoutRef.current) {
        clearTimeout(confettiTimeoutRef.current);
      }
    };
  }, []);

  const playSound = () => {
    if (typeof window !== 'undefined') {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      if (!audioContext) return;

      const now = audioContext.currentTime;
      const duration = 0.8;
      const peakVolume = 0.35;

      const freqs = [523.25, 659.25, 783.99, 1046.50];

      freqs.forEach((freq, index) => {
          const osc = audioContext.createOscillator();
          const gainNode = audioContext.createGain();

          osc.connect(gainNode);
          gainNode.connect(audioContext.destination);

          const startTime = now + index * 0.04;

          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, startTime);

          gainNode.gain.setValueAtTime(0, startTime);
          gainNode.gain.linearRampToValueAtTime(peakVolume / (index + 1), startTime + 0.05);
          gainNode.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

          osc.start(startTime);
          osc.stop(startTime + duration);
      });
    }
  };

  const playTick = () => {
    if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    const audioContext = audioContextRef.current;
    if (!audioContext) return;

    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.type = 'square';
    oscillator.frequency.setValueAtTime(1200, audioContext.currentTime);
    gainNode.gain.setValueAtTime(0.08, audioContext.currentTime);

    gainNode.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 0.08);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.08);
  };

  const startShufflingSound = () => {
    stopShufflingSound(); 
    shuffleSoundIntervalRef.current = window.setInterval(playTick, 120);
  };

  const stopShufflingSound = () => {
    if (shuffleSoundIntervalRef.current) {
      clearInterval(shuffleSoundIntervalRef.current);
      shuffleSoundIntervalRef.current = null;
    }
  };

  const playSuccessSound = () => {
    if (typeof window !== 'undefined') {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      if (!audioContext) return;

      const now = audioContext.currentTime;
      const finalGain = 0.4;
      const notes = [523.25, 659.25, 783.99, 1046.50];

      notes.forEach((freq, index) => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        const startTime = now + index * 0.1;
        const duration = 0.5;

        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(freq, startTime);

        gainNode.gain.setValueAtTime(0.001, startTime);
        gainNode.gain.linearRampToValueAtTime(finalGain, startTime + 0.05);
        gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

        oscillator.start(startTime);
        oscillator.stop(startTime + duration);
      });
    }
  };
  
  const handleGlobalDraw = async () => {
    if (gameState !== 'IDLE') return;
    if (confettiTimeoutRef.current) clearTimeout(confettiTimeoutRef.current);
    
    const session = nextDrawSession;
    
    setCurrentDrawSession(session);
    setGameState('DRAWING');
    setActiveDraw(DrawType.Pink4);
    setPink4Numbers(Array(4).fill(null));
    setPink3Numbers(Array(3).fill(null));

    const runSingleDraw = async (type: DrawType) => {
        const isPink4 = type === DrawType.Pink4;
        const numCount = isPink4 ? 4 : 3;
        const setNumbers = isPink4 ? setPink4Numbers : setPink3Numbers;
        const drawOrder = isPink4 ? [0, 1, 2, 3] : [0, 2, 1];

        await new Promise(resolve => setTimeout(resolve, 2000));

        const finalNumbers: number[] = Array(numCount).fill(0);
        for (let i = 0; i < numCount; i++) {
            const ballIndex = drawOrder[i];
            const newNumber = Math.floor(Math.random() * 10);
            finalNumbers[ballIndex] = newNumber;

            setNumbers(prev => {
                const next = [...(prev || [])];
                next[ballIndex] = newNumber;
                return next;
            });
            
            playSound();

            if (i < numCount - 1) {
                await new Promise(resolve => setTimeout(resolve, 3000));
            }
        }
        return finalNumbers;
    };

    // --- Pink 4 Draw ---
    setIsDrawingPink4(true);
    startShufflingSound();
    const pink4FinalNumbers = await runSingleDraw(DrawType.Pink4);
    setIsDrawingPink4(false);
    stopShufflingSound();
    setShowConfetti(true);
    confettiTimeoutRef.current = window.setTimeout(() => setShowConfetti(false), 5000);

    // Wait 8 seconds to show Pink 4 results
    await new Promise(resolve => setTimeout(resolve, 8000));

    // --- Intermission ---
    setActiveDraw(DrawType.Pink3);
    setGameState('INTERMISSION');
    const intermissionPromise = new Promise<void>(resolve => {
        let remaining = 10;
        setIntermissionCountdown(remaining);
        const interval = setInterval(() => {
            remaining--;
            setIntermissionCountdown(remaining);
            if (remaining < 0) {
                clearInterval(interval);
                resolve();
            }
        }, 1000);
    });
    await intermissionPromise;

    // --- Pink 3 Draw ---
    setGameState('DRAWING');
    await new Promise(resolve => setTimeout(resolve, 100));

    setIsDrawingPink3(true);
    startShufflingSound();
    const pink3FinalNumbers = await runSingleDraw(DrawType.Pink3);
    setIsDrawingPink3(false);
    stopShufflingSound();
    if (confettiTimeoutRef.current) clearTimeout(confettiTimeoutRef.current);
    setShowConfetti(true);
    confettiTimeoutRef.current = window.setTimeout(() => setShowConfetti(false), 5000);

    const newPink4Entry: DrawResult = {
        id: Date.now() + Math.random() + 1,
        type: DrawType.Pink4,
        session: session,
        numbers: pink4FinalNumbers,
        timestamp: new Date(),
    };
    const newPink3Entry: DrawResult = {
        id: Date.now() + Math.random(),
        type: DrawType.Pink3,
        session: session,
        numbers: pink3FinalNumbers,
        timestamp: new Date(),
    };
    
    setHistory(prevHistory => {
        const newHistory = [newPink3Entry, newPink4Entry, ...prevHistory.slice(0, 98)];
        try {
            localStorage.setItem('boliCubaHistory', JSON.stringify(newHistory));
        } catch (error) {
            console.error("Failed to save history to localStorage", error);
        }
        return newHistory;
    });
    
    playSuccessSound();
    setGameState('RESULTS');
    
    if (confettiTimeoutRef.current) clearTimeout(confettiTimeoutRef.current);
    setShowConfetti(true);
    
    setTimeout(() => {
        setGameState('IDLE');
        setActiveDraw(DrawType.Pink4);
        setShowConfetti(false);
        setCurrentDrawSession(null);
        
        const newNextSession = session === DrawSession.Midday ? DrawSession.Night : DrawSession.Midday;
        setNextDrawSession(newNextSession);
        try {
            localStorage.setItem('boliCubaNextSession', newNextSession);
        } catch (error) {
            console.error("Failed to save next session to localStorage", error);
        }
    }, 10000);
  };

  const sessionDisplayString = currentDrawSession 
    ? `Sorteo ${sessionInfo[currentDrawSession].label} ${sessionInfo[currentDrawSession].time}` 
    : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white p-4 sm:p-8 flex flex-col">
      <Confetti isActive={showConfetti} />
      <div className="max-w-7xl mx-auto w-full flex-grow">
        <Header />
        <div className="text-center mb-8 md:mb-12 h-32 flex flex-col justify-center items-center">
          {gameState === 'IDLE' && (
             <>
                <p className="text-xl sm:text-2xl text-amber-300 mb-4 animate-pulse">
                  Próximo Sorteo: {sessionInfo[nextDrawSession].label} {sessionInfo[nextDrawSession].time}
                </p>
                <button
                    onClick={handleGlobalDraw}
                    disabled={gameState !== 'IDLE'}
                    className="px-10 py-5 text-3xl font-bold text-gray-900 bg-gradient-to-r from-amber-400 to-yellow-500 rounded-2xl shadow-lg transition-transform transform hover:scale-105 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed disabled:scale-100 animate-bounce-glow"
                    aria-label="Iniciar un nuevo sorteo"
                >
                    Iniciar Sorteo
                </button>
             </>
          )}
           {gameState === 'DRAWING' && (
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 shadow-xl border border-white/20 w-full max-w-sm">
              <h3 className="text-xl sm:text-2xl text-amber-300 font-semibold animate-pulse">
                ¡Sorteando números!
              </h3>
            </div>
          )}
          {gameState === 'RESULTS' && (
            <div className="bg-gradient-to-r from-amber-500 to-yellow-400 rounded-2xl p-6 shadow-2xl border border-amber-300/50 w-full max-w-lg animate-pulse">
              <h3 className="text-3xl sm:text-4xl text-gray-900 font-bold mb-2">
                ¡Felicidades a los ganadores!
              </h3>
              <p className="text-lg text-gray-800 font-semibold">
                No te pierdas el próximo sorteo.
              </p>
            </div>
          )}
        </div>
        <main className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 flex items-center justify-center">
            <div className="w-full max-w-lg">
                <DrawDisplay
                    title={activeDraw}
                    numbers={activeDraw === DrawType.Pink4 ? pink4Numbers : pink3Numbers}
                    gradientClass={
                        activeDraw === DrawType.Pink4
                        ? "bg-gradient-to-br from-fuchsia-600 to-purple-600"
                        : "bg-gradient-to-br from-pink-500 to-rose-500"
                    }
                    isDrawing={activeDraw === DrawType.Pink4 ? isDrawingPink4 : isDrawingPink3}
                    gameState={gameState}
                    intermissionCountdown={intermissionCountdown}
                    session={sessionDisplayString}
                />
            </div>
          </div>
          <div className="lg:col-span-1">
            <History results={history} />
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default App;