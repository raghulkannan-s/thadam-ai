import { useState, useEffect, useCallback } from 'react';
import { Coins, Sparkles, Trophy } from 'lucide-react';
import { Badge } from '@/shared/ui/Badge';

export function CoinCatcherGame() {
  const [coins, setCoins] = useState<{ id: number; x: number; y: number }[]>([]);
  const [score, setScore] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);

  const spawnCoin = useCallback(() => {
    const newCoin = {
      id: Date.now(),
      x: Math.floor(Math.random() * 80) + 10, // 10% to 90%
      y: Math.floor(Math.random() * 60) + 20, // 20% to 80%
    };
    
    setCoins(prev => [...prev, newCoin]);
    
    // Auto-remove coin if missed after 5 seconds
    setTimeout(() => {
      setCoins(prev => prev.filter(c => c.id !== newCoin.id));
    }, 5000);
  }, []);

  useEffect(() => {
    if (!gameStarted) return;
    
    // Spawn a coin every 800ms
    const interval = setInterval(spawnCoin, 800);
    return () => clearInterval(interval);
  }, [gameStarted, spawnCoin]);

  const catchCoin = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setCoins(prev => prev.filter(c => c.id !== id));
    setScore(s => s + 1);
  };

  if (!gameStarted) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-[var(--bg-surface)] rounded-xl border border-[var(--border-default)] mt-8 animate-fade-in text-center">
        <Sparkles className="w-12 h-12 text-[var(--accent-primary)] mb-4 animate-pulse" />
        <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">Generating your Curriculum...</h3>
        <p className="text-[var(--text-secondary)] mb-6 max-w-sm">
          AI is analyzing your request. This takes about 60 seconds. Play a quick game while you wait!
        </p>
        <button 
          onClick={() => setGameStarted(true)}
          className="px-6 py-3 bg-[var(--warning)] hover:bg-[#e69500] text-white rounded-lg font-bold transition-all shadow-lg flex items-center gap-2"
        >
          <Coins className="w-5 h-5" /> Play Coin Catcher
        </button>
      </div>
    );
  }

  return (
    <div className="relative w-full h-64 sm:h-80 bg-gradient-to-b from-indigo-950 via-slate-900 to-black rounded-xl border-2 border-indigo-500/30 overflow-hidden mt-8 animate-fade-in shadow-[inset_0_0_40px_rgba(0,0,0,0.8)]">
      {/* Cool subtle grid overlay for an arcade feel */}
      <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
      
      <div className="absolute top-4 left-4 z-10">
        <Badge variant="warning" className="text-sm font-bold shadow-[0_0_15px_rgba(250,204,21,0.5)] px-3 py-1.5 flex items-center gap-1.5 bg-slate-900 border-yellow-500/50">
          <Trophy className="w-4 h-4 text-yellow-400" /> <span className="text-yellow-400">Score: {score}</span>
        </Badge>
      </div>
      <div className="absolute top-4 right-4 z-10 text-xs font-bold text-indigo-300 animate-pulse bg-slate-900/60 px-3 py-1.5 rounded-full border border-indigo-500/30">
        Generating Roadmap...
      </div>
      
      {/* Game Area */}
      <div className="absolute inset-0 cursor-crosshair">
        {coins.map((coin) => (
          <button
            key={coin.id}
            onClick={(e) => catchCoin(coin.id, e)}
            className="absolute p-3 rounded-full transition-all hover:scale-125 focus:outline-none animate-bounce"
            style={{ 
              left: `${coin.x}%`, 
              top: `${coin.y}%`,
              background: 'radial-gradient(circle, rgba(253,224,71,0.4) 0%, rgba(253,224,71,0) 70%)',
              filter: 'drop-shadow(0 0 8px rgba(250, 204, 21, 0.8))'
            }}
          >
            <Coins className="w-8 h-8 text-yellow-400" fill="currentColor" />
          </button>
        ))}
      </div>
    </div>
  );
}
