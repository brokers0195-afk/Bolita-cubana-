import React from 'react';
import { DrawResult, DrawType, DrawSession } from '../types';

const HistoryItem: React.FC<{ result: DrawResult }> = ({ result }) => {
  const isPink4 = result.type === DrawType.Pink4;
  const badgeClass = isPink4 
    ? 'bg-gray-900' 
    : 'bg-pink-500';

  const [drawName, drawNumber] = result.type.split(' ');
  const sessionIcon = result.session === DrawSession.Midday ? '🌞' : '🌛';

  const renderNumbers = () => {
    if (isPink4) {
      return (
        <>
          {result.numbers.map((number, index) => {
            const ballClass = index < 2
              ? 'bg-blue-500 border-blue-300'
              : 'bg-red-500 border-red-300';

            return (
              <React.Fragment key={index}>
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-white shadow-md border-2 ${ballClass}`}
                >
                  {number}
                </div>
                {index === 1 && <span className="text-gray-400">-</span>}
              </React.Fragment>
            );
          })}
        </>
      );
    } else { // Pink 3
      return (
        <>
          {result.numbers.map((number, index) => {
            const isFirst = index === 0;
            const circleClass = isFirst 
              ? 'bg-red-500 text-white border-red-300' 
              : 'bg-black text-white border-gray-600';
            
            return (
              <div
                key={index}
                className={`w-8 h-8 rounded-full flex items-center justify-center shadow-md border-2 ${circleClass}`}
              >
                {number}
              </div>
            );
          })}
        </>
      );
    }
  };

  return (
    <li className="bg-gray-800/50 rounded-lg p-3 flex items-center gap-4 transition-colors hover:bg-gray-700/50">
      <span className={`px-3 py-1 text-base rounded-full ${badgeClass} flex-shrink-0 w-32 text-center`}>
        <span className="font-semibold text-amber-300 text-xl">{sessionIcon}</span>
        <span className="mx-1.5 text-gray-500">|</span>
        {isPink4 ? (
          <>
            <strong className="font-extrabold tracking-wide animate-glow-text text-blue-400">{drawName}</strong>
            <span className="ml-1.5 animate-glow-text text-red-400">{drawNumber}</span>
          </>
        ) : (
          <>
            <strong className="font-extrabold tracking-wide animate-glow-text text-black">{drawName}</strong>
            <span className="ml-1.5 animate-glow-text text-red-600 font-bold">{drawNumber}</span>
          </>
        )}
      </span>
      <div className="flex-1 flex items-center justify-center gap-1.5 font-bold text-lg">
        {renderNumbers()}
      </div>
    </li>
  );
};

const History: React.FC<{ results: DrawResult[] }> = ({ results }) => {
  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 shadow-2xl border border-white/20">
      <h2 className="text-3xl font-semibold mb-4 text-center">Historial de Sorteos</h2>
      {results.length > 0 ? (
        <ul className="space-y-3 h-96 overflow-y-auto pr-2">
            {results.map((result) => (
              <HistoryItem key={result.id} result={result} />
            ))}
        </ul>
      ) : (
        <p className="text-center text-gray-400 mt-8">No hay sorteos aún.</p>
      )}
    </div>
  );
};

export default History;