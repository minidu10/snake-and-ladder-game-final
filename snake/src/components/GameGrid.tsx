interface GameGridProps {
  player1Position: number;
  player1Color: string;
  player2Position: number;
  player2Color: string;
  snakesAndLadders: {
    snakes: Array<{ head: number; tail: number }>;
    ladders: Array<{ bottom: number; top: number }>;
  };
}

export default function GameGrid({
  player1Position,
  player1Color,
  player2Position,
  player2Color,
  snakesAndLadders
}: GameGridProps) {
  // Create 10x10 grid (1-100)
  const createGrid = () => {
    const grid = [];
    for (let row = 9; row >= 0; row--) {
      const rowCells = [];
      for (let col = 0; col < 10; col++) {
        // Snake pattern: odd rows go left to right, even rows go right to left
        const cellNumber = row % 2 === 0 
          ? (9 - row) * 10 + col + 1
          : (9 - row) * 10 + (9 - col) + 1;
        rowCells.push(cellNumber);
      }
      grid.push(rowCells);
    }
    return grid;
  };

  const grid = createGrid();

  const getSpecialCell = (cellNumber: number) => {
    const snake = snakesAndLadders.snakes.find(s => s.head === cellNumber);
    const ladder = snakesAndLadders.ladders.find(l => l.bottom === cellNumber);
    
    if (snake) return { type: "snake", target: snake.tail };
    if (ladder) return { type: "ladder", target: ladder.top };
    return null;
  };

  const hasPlayer = (cellNumber: number) => {
    const players = [];
    if (player1Position === cellNumber) players.push({ color: player1Color, player: 1 });
    if (player2Position === cellNumber) players.push({ color: player2Color, player: 2 });
    return players;
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="grid grid-cols-10 gap-1 bg-gray-200 p-2 rounded-lg">
        {grid.map((row, rowIndex) =>
          row.map((cellNumber, colIndex) => {
            const special = getSpecialCell(cellNumber);
            const players = hasPlayer(cellNumber);
            
            return (
              <div
                key={`${rowIndex}-${colIndex}`}
                className={`
                  aspect-square flex flex-col items-center justify-center text-xs font-bold
                  border border-gray-300 rounded transition-all duration-300
                  ${special?.type === "snake" ? "bg-red-100 border-red-300" :
                    special?.type === "ladder" ? "bg-green-100 border-green-300" :
                    "bg-white"}
                  ${players.length > 0 ? "ring-2 ring-blue-400" : ""}
                `}
              >
                {/* Cell number */}
                <span className={`text-[10px] ${
                  special ? "text-gray-600" : "text-gray-800"
                }`}>
                  {cellNumber}
                </span>
                
                {/* Special indicators */}
                {special && (
                  <span className="text-lg leading-none">
                    {special.type === "snake" ? "🐍" : "🪜"}
                  </span>
                )}
                
                {/* Players */}
                {players.length > 0 && (
                  <div className="flex gap-0.5 mt-0.5">
                    {players.map((player, idx) => (
                      <div
                        key={idx}
                        className="w-3 h-3 rounded-full border-2 border-white shadow-sm animate-pulse"
                        style={{ backgroundColor: player.color }}
                        title={`Player ${player.player}`}
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
      
      {/* Legend */}
      <div className="mt-4 flex justify-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <span className="text-lg">🐍</span>
          <span className="text-gray-600">Snake Head</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-lg">🪜</span>
          <span className="text-gray-600">Ladder Bottom</span>
        </div>
      </div>
    </div>
  );
}
