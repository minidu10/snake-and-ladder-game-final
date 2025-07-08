interface GameOverModalProps {
  winner: 1 | 2;
  player1Name: string;
  player2Name: string;
  duration: number;
  onNewGame: () => void;
}

export default function GameOverModal({
  winner,
  player1Name,
  player2Name,
  duration,
  onNewGame
}: GameOverModalProps) {
  const winnerName = winner === 1 ? player1Name : player2Name;
  
  const formatDuration = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    
    if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    }
    return `${seconds}s`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center animate-in zoom-in duration-300">
        <div className="text-6xl mb-4">🏆</div>
        
        <h2 className="text-3xl font-bold text-gray-800 mb-2">
          Game Over!
        </h2>
        
        <div className="text-xl text-gray-600 mb-6">
          <span className="font-semibold text-yellow-600">{winnerName}</span> wins!
        </div>
        
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="text-sm text-gray-600 mb-1">Game Duration</div>
          <div className="text-lg font-bold text-gray-800">
            {formatDuration(duration)}
          </div>
        </div>
        
        <div className="space-y-3">
          <button
            onClick={onNewGame}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-[1.02]"
          >
            🎮 New Game
          </button>
          
          <div className="text-xs text-gray-500">
            Great game! Ready for another round?
          </div>
        </div>
      </div>
    </div>
  );
}
