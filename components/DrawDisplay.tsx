import React from 'react';
import { DrawType } from '../types';

type GameState = 'IDLE' | 'DRAWING' | 'INTERMISSION' | 'RESULTS';

interface DrawDisplayProps {
  title: string;
  numbers: (number | null)[];
  gradientClass: string;
  isDrawing: boolean;
  gameState: GameState;
  intermissionCountdown: number;
  session: string | null;
}

const ShufflingNumber: React.FC = () => (
    <div className="h-[1.1em] overflow-hidden leading-none">
        <span className="animate-shuffle-fast block">
            0<br />1<br />2<br />3<br />4<br />5<br />6<br />7<br />8<br />9
        </span>
    </div>
);

interface NumberBallProps {
  number: number | null;
  gradient: string;
  isShuffling: boolean;
  drawType: string;
  index: number;
}

const NumberBall: React.FC<NumberBallProps> = ({ number, gradient, isShuffling, drawType, index }) => {
    const getStyling = () => {
        let ballClass = gradient;
        let textClass = 'text-white';

        if (drawType === DrawType.Pink4) {
            ballClass = index < 2
                ? 'bg-gradient-to-br from-blue-500 to-indigo-600'
                : 'bg-gradient-to-br from-red-500 to-rose-600';
        } else if (drawType === DrawType.Pink3) {
            if (index === 0) { // First ball is red
                ballClass = 'bg-gradient-to-br from-red-500 to-rose-600';
                textClass = 'text-white';
            } else { // Last two balls are black
                ballClass = 'bg-gradient-to-br from-gray-800 to-black';
                textClass = 'text-white';
            }
        }
        return { ballClass, textClass };
    };
    
    const { ballClass, textClass } = getStyling();
    const animationClass = isShuffling ? 'animate-bounce-glow' : 'transform transition-transform hover:scale-110';

    return (
      <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center ${textClass} text-3xl sm:text-4xl font-bold shadow-lg ${ballClass} ${animationClass}`}>
        {isShuffling ? <ShufflingNumber /> : (number !== null ? number : '?')}
      </div>
    );
};


const DrawDisplay: React.FC<DrawDisplayProps> = ({ title, numbers, gradientClass, isDrawing, gameState, intermissionCountdown, session }) => {
  const [drawName, drawNumber] = title.split(' ');
  const isPink4 = title === DrawType.Pink4;

  const drawNameGradient = isPink4
    ? 'from-blue-500 to-cyan-400'
    : 'from-gray-900 to-black';
  
  const drawNumberGradient = isPink4
    ? 'from-red-500 to-rose-500'
    : 'from-red-500 to-rose-500';

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 shadow-2xl border border-white/20 flex flex-col items-center justify-center min-h-[300px] relative">
      <h2 className="text-5xl font-bold mb-2 text-center animate-glow-text">
        <span className={`text-transparent bg-clip-text bg-gradient-to-r ${drawNameGradient}`}>{drawName}</span>
        <span className={`text-transparent bg-clip-text bg-gradient-to-r ${drawNumberGradient} ml-2`}>{drawNumber}</span>
      </h2>
      {session && (
        <p className="text-xl text-amber-300 mb-6 font-semibold animate-pulse">{session}</p>
      )}
      <div className="flex justify-center items-center gap-3 sm:gap-4 mt-2">
        {numbers.map((num, index) => (
          <NumberBall 
            key={index} 
            number={num} 
            gradient={gradientClass} 
            isShuffling={isDrawing && num === null}
            drawType={title}
            index={index}
          />
        ))}
      </div>
       {gameState === 'INTERMISSION' && title === DrawType.Pink3 && (
         <div className="absolute inset-0 bg-gray-900/70 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center z-10">
            <p className="text-xl sm:text-2xl text-amber-300 font-semibold mb-4 animate-pulse">
                Sorteo Pink 3 comienza en...
            </p>
            <div className="w-40 h-40 sm:w-48 sm:h-48 rounded-full flex items-center justify-center bg-gradient-to-br from-pink-600 to-rose-600 shadow-2xl border-4 border-white/50">
                <span className="text-6xl sm:text-7xl font-bold text-white">
                    {intermissionCountdown}
                </span>
            </div>
        </div>
      )}
    </div>
  );
};

export default DrawDisplay;