export function AiAnalysisCard({ summary, suggestedSteps, predictedCategory, isPending = false }) {
  if (isPending || !summary) {
    return (
      <div className="bg-surface-container-low border border-outline-variant/40 rounded-2xl p-6 flex flex-col items-center justify-center text-center animate-pulse">
        <span className="material-symbols-outlined text-primary text-[32px] mb-2 animate-spin">progress_activity</span>
        <p className="text-sm font-medium text-primary">AI is analyzing the incident...</p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-premium border border-primary/20 rounded-2xl p-6 shadow-premium relative overflow-hidden group">
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/10 rounded-full blur-3xl group-hover:bg-primary/20 transition-all duration-700 pointer-events-none"></div>
      <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-primary/5 rounded-full blur-2xl pointer-events-none"></div>
      
      <div className="relative z-10 flex items-center gap-2 mb-5">
        <div className="w-8 h-8 rounded-lg bg-white/80 shadow-sm border border-primary/10 flex items-center justify-center backdrop-blur-sm">
          <span className="material-symbols-outlined text-primary text-[20px] filled">auto_awesome</span>
        </div>
        <h2 className="text-lg font-bold text-primary tracking-tight">AI Analysis</h2>
      </div>
      
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          <div>
            <span className="text-[11px] font-semibold text-primary/70 uppercase tracking-widest block mb-2">Summary</span>
            <p className="text-sm text-on-surface font-medium leading-relaxed">
              {summary}
            </p>
          </div>
          {suggestedSteps && (
            <div>
              <span className="text-[11px] font-semibold text-primary/70 uppercase tracking-widest block mb-3">Suggested Next Steps</span>
              <ul className="space-y-2.5">
                {suggestedSteps.split('\n').filter(step => step.trim()).map((step, idx) => (
                  <li key={idx} className="flex items-start gap-2.5">
                    <span className="material-symbols-outlined text-primary text-[18px] mt-0.5">check_circle</span>
                    <span className="text-sm font-medium text-on-surface">{step.replace(/^[-*]\s*/, '')}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        <div>
          <span className="text-[11px] font-semibold text-primary/70 uppercase tracking-widest block mb-2">Predicted Category</span>
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/60 border border-primary/20 text-sm font-semibold text-primary backdrop-blur-sm shadow-sm capitalize">
            <span className="material-symbols-outlined text-[16px]">label</span> {predictedCategory || 'Uncategorized'}
          </div>
        </div>
      </div>
    </div>
  );
}
