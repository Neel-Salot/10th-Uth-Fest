import { Play } from 'lucide-react';

const LiveTicker = () => {
    return (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-brand/90 backdrop-blur-md text-white py-3 overflow-hidden border-t border-brand/30">
            <div className="flex items-center gap-8 whitespace-nowrap animate-[marquee_30s_linear_infinite] px-4 font-bold uppercase tracking-widest text-xs">
                {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex items-center gap-4">
                        <Play size={14} fill="currentColor" />
                        <span>Now Performing: <span className="underline">Mime Ensemble (Round 2)</span> @ Venue Alpha</span>
                        <div className="w-2 h-2 rounded-full bg-white/20" />
                        <span>Next Up: <span className="underline">Solo Folk Dance (Female)</span> @ Venue Gamma</span>
                        <div className="w-12 h-[2px] bg-white/20 mx-4" />
                    </div>
                ))}
            </div>

            <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
        </div>
    );
};

export default LiveTicker;
