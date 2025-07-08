interface SnakeLadderOverlayProps {
  type: "snake" | "ladder";
  message: string;
  onClose: () => void;
}

export default function SnakeLadderOverlay({
  type,
  message,
  onClose
}: SnakeLadderOverlayProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`
        bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center
        animate-in zoom-in duration-500
        ${type === "snake" ? "border-4 border-red-400" : "border-4 border-green-400"}
      `}>
        <div className="text-8xl mb-4 animate-bounce">
          {type === "snake" ? "🐍" : "🪜"}
        </div>
        
        <h2 className={`text-2xl font-bold mb-4 ${
          type === "snake" ? "text-red-600" : "text-green-600"
        }`}>
          {message}
        </h2>
        
        <div className={`text-lg mb-6 ${
          type === "snake" ? "text-red-500" : "text-green-500"
        }`}>
          {type === "snake" 
            ? "You slid down the snake! 📉" 
            : "You climbed up the ladder! 📈"
          }
        </div>
        
        <button
          onClick={onClose}
          className={`
            px-6 py-2 rounded-lg font-medium text-white transition-colors
            ${type === "snake" 
              ? "bg-red-500 hover:bg-red-600" 
              : "bg-green-500 hover:bg-green-600"
            }
          `}
        >
          Continue
        </button>
      </div>
    </div>
  );
}
