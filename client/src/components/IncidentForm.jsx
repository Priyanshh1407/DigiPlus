import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../api/client';

export default function IncidentForm() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [titleTouched, setTitleTouched] = useState(false);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  
  // AI Simulation State
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiData, setAiData] = useState(null);
  const typingTimeoutRef = useRef(null);

  const titleHasError = titleTouched && !title.trim();

  const handleAnalyze = async () => {
    if (!description.trim()) return;
    
    setIsAnalyzing(true);
    setAiData(null);
    
    try {
      const data = await api.analyzeIncident(title, description);
      setAiData(data);
    } catch (err) {
      console.error("Failed to analyze:", err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleDescChange = (e) => {
    const val = e.target.value;
    setDescription(val);
    
    // Hide results if editing significantly
    if (aiData && val.length % 10 === 0) {
      setAiData(null);
    }
    
    // Auto-analyze simulation on pause (debounce)
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    if (val.length > 20 && !aiData) {
      typingTimeoutRef.current = setTimeout(() => {
        handleAnalyze();
      }, 1000);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTitleTouched(true);
    
    if (!title.trim() || !description.trim()) {
      return;
    }
    
    setIsSubmitting(true);
    setSubmitError(null);
    
    try {
      const newIncident = await api.createIncident({ title, description });
      navigate(`/incident/${newIncident.id}`);
    } catch (err) {
      setSubmitError(err.message);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center p-4 sm:p-6 w-full min-h-[calc(100vh-64px)]">
      {/* Focused Canvas / Modal Wrapper */}
      <div className="w-full max-w-2xl bg-surface-container-lowest rounded-xl shadow-premium border border-outline-variant/60 overflow-hidden flex flex-col relative animate-entrance">
        
        {/* Header */}
        <div className="px-6 pt-6 pb-2">
          <Link to="/" className="inline-flex items-center gap-1 text-sm font-medium text-on-surface-variant hover:text-primary transition-colors group">
            <span className="material-symbols-outlined text-[18px] transition-transform group-hover:-translate-x-1">arrow_back</span>
            Back to Dashboard
          </Link>
        </div>
        
        <header className="flex justify-between items-center px-6 py-4 border-b border-outline-variant/60 bg-surface-container-lowest z-10 relative">
          <div className="flex items-center gap-2 text-primary">
            <span className="material-symbols-outlined filled text-[24px]">confirmation_number</span>
            <h1 className="font-bold text-lg text-on-surface tracking-tight">🎫 New Incident</h1>
          </div>
          <Link to="/" aria-label="Close" className="text-on-surface-variant hover:text-on-surface transition-colors p-1 rounded-full hover:bg-surface-container-low">
            <span className="material-symbols-outlined">close</span>
          </Link>
        </header>

        {/* Main Form Area */}
        <main className="flex-1 p-6 flex flex-col gap-6">
          {/* Context Banner */}
          <div className="bg-surface-container-low rounded-lg p-4 flex items-start gap-2 border border-outline-variant/50">
            <span className="material-symbols-outlined text-primary text-[20px] mt-[2px]">info</span>
            <p className="text-sm font-medium text-on-surface-variant leading-relaxed">
              Please provide as much detail as possible. Our AI will automatically categorize and prioritize your incident upon submission.
            </p>
          </div>
          
          {submitError && (
            <div className="bg-error-container text-error rounded-lg p-4 flex items-start gap-2 border border-error-container">
              <span className="material-symbols-outlined text-[20px]">error</span>
              <p className="text-sm font-medium">⚠️ Failed to submit: {submitError}</p>
            </div>
          )}

          <form id="incident-form" className="flex flex-col gap-6" onSubmit={handleSubmit}>
            {/* Title Field */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-on-surface flex justify-between items-end tracking-tight" htmlFor="incident-title">
                <span>Title <span className="text-error">*</span></span>
              </label>
              <div className="relative group">
                <input 
                  id="incident-title"
                  type="text"
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    if (titleTouched) setTitleTouched(true);
                  }}
                  onBlur={() => setTitleTouched(true)}
                  disabled={isSubmitting}
                  className={`w-full bg-background/50 border rounded-lg px-4 py-2 text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:bg-white focus:ring-4 transition-all font-medium ${
                    titleHasError 
                      ? 'border-error focus:border-error focus:ring-error-container' 
                      : 'border-outline-variant/60 focus:border-primary focus:ring-primary/10'
                  }`}
                  placeholder="What's the issue?" 
                />
                
                {/* Validation Error State */}
                <div className={`absolute -bottom-6 left-0 flex items-center gap-1 text-error mt-1 transition-opacity duration-200 ${titleHasError ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                  <span className="material-symbols-outlined text-[14px]">warning</span>
                  <span className="text-xs font-medium">Title is required</span>
                </div>
              </div>
            </div>

            {/* Description Field with AI Analysis Overlay */}
            <div className="flex flex-col gap-2 relative mt-2">
              <div className="flex justify-between items-center">
                <label className="text-sm font-semibold text-on-surface tracking-tight" htmlFor="incident-desc">Description</label>
                <button 
                  type="button"
                  onClick={handleAnalyze}
                  className="flex items-center gap-1 text-primary hover:text-on-primary-fixed-variant transition-colors text-xs font-semibold px-2 py-1 rounded hover:bg-primary-fixed/30"
                >
                  <span className="material-symbols-outlined filled text-[16px]">auto_awesome</span>
                  Analyze Input
                </button>
              </div>
              
              <div className="relative">
                <textarea 
                  id="incident-desc"
                  value={description}
                  onChange={handleDescChange}
                  disabled={isSubmitting}
                  className="w-full bg-background/50 border border-outline-variant/60 rounded-lg px-4 py-3 text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all font-medium resize-y min-h-[120px]"
                  placeholder="Tell us more about what's happening, steps to reproduce, or any error messages..." 
                  rows="6"
                />
                
                {/* AI Analysis Loading State */}
                <div className={`absolute bottom-2 right-2 bg-surface-container-lowest/90 backdrop-blur-sm border border-outline-variant/60 rounded-full px-2 py-1 flex items-center gap-2 shadow-sm transition-opacity duration-300 ${isAnalyzing ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                  <span className="material-symbols-outlined text-primary animate-spin text-[16px]">progress_activity</span>
                  <span className="text-xs font-semibold text-on-surface-variant animate-pulse">🔍 AI Analyzing...</span>
                </div>
              </div>
            </div>

            {/* AI Output / Categorization */}
            <div className={`bg-primary/5 border border-primary/20 rounded-lg p-4 flex flex-col gap-2 transition-all duration-300 origin-top transform ${aiData ? 'scale-y-100 opacity-100 block' : 'scale-y-0 opacity-0 hidden'}`}>
              <div className="flex items-center gap-1 text-primary">
                <span className="material-symbols-outlined text-[18px] filled">check_circle</span>
                <span className="text-sm font-bold tracking-tight">AI Suggestions</span>
              </div>
              <div className="flex flex-wrap gap-2">
                <div className="bg-white/60 backdrop-blur-sm border border-primary/20 rounded-lg px-3 py-1.5 flex items-center gap-1.5 shadow-sm">
                  <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-widest">Category:</span>
                  <span className="text-sm font-semibold text-primary flex items-center gap-1 capitalize">
                    <span className="material-symbols-outlined text-[16px]">label</span> {aiData?.category}
                  </span>
                </div>
                <div className="bg-white/60 backdrop-blur-sm border border-primary/20 rounded-lg px-3 py-1.5 flex items-center gap-1.5 shadow-sm">
                  <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-widest">Priority:</span>
                  <span className={`text-sm font-semibold flex items-center gap-1 capitalize ${
                    aiData?.priority === 'high' ? 'text-error' : 
                    aiData?.priority === 'medium' ? 'text-tertiary-container' : 'text-on-surface-variant'
                  }`}>
                    <span className="material-symbols-outlined text-[16px]">
                      {aiData?.priority === 'high' ? 'local_fire_department' : 'keyboard_arrow_up'}
                    </span> 
                    {aiData?.priority}
                  </span>
                </div>
              </div>
            </div>
          </form>
        </main>
        
        {/* Footer Actions */}
        <footer className="bg-surface-container-lowest px-6 py-4 border-t border-outline-variant/60 flex justify-end gap-3 items-center">
          <Link to="/" className="px-4 py-2 border border-outline-variant/80 rounded-lg text-sm font-semibold text-on-surface hover:bg-surface-container-low transition-colors shadow-sm focus:outline-none focus:ring-4 focus:ring-outline-variant/50">
            Cancel
          </Link>
          <button 
            type="submit"
            form="incident-form"
            disabled={isSubmitting}
            className="px-5 py-2 bg-gradient-primary-btn text-white rounded-lg text-sm font-semibold hover:shadow-lg hover:shadow-primary/30 transition-all shadow-md transform hover:-translate-y-0.5 focus:outline-none focus:ring-4 focus:ring-primary/30 flex items-center gap-2 disabled:opacity-70 disabled:transform-none"
          >
            <span>{isSubmitting ? 'Creating...' : 'Create Incident'}</span>
            {!isSubmitting && <span className="material-symbols-outlined text-[18px]">send</span>}
          </button>
        </footer>
      </div>
    </div>
  );
}
