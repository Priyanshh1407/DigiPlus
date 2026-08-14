import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { AiAnalysisCard } from './ui/AiAnalysisCard';
import { useUser } from '../context/UserContext';

export default function IncidentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { users } = useUser();
  const [incident, setIncident] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [kbArticles, setKbArticles] = useState([]);

  const [resolutionText, setResolutionText] = useState('');
  const [isResolving, setIsResolving] = useState(false);
  
  const [clarificationText, setClarificationText] = useState('');
  const [isClarifying, setIsClarifying] = useState(false);

  useEffect(() => {
    fetchIncident();
  }, [id]);

  const fetchIncident = async () => {
    setLoading(true);
    try {
      const [incData, kbData] = await Promise.all([
        api.getIncident(id),
        api.getKBArticles().catch(() => []) // fail gracefully if KB fails
      ]);
      setIncident(incData);
      if (incData.resolution) setResolutionText(incData.resolution);
      setKbArticles(kbData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async () => {
    if (!resolutionText.trim()) return;
    setIsResolving(true);
    try {
      const updated = await api.updateIncident(id, {
        status: 'resolved',
        resolution: resolutionText
      });
      setIncident(updated);
      setIsResolving(false);
    } catch (err) {
      alert("Failed to resolve: " + err.message);
      setIsResolving(false);
    }
  };

  const handleClarify = async () => {
    if (!clarificationText.trim()) return;
    setIsClarifying(true);
    try {
      const newDescription = `${incident.description}\n\n[Clarification]: ${clarificationText}`;
      const updated = await api.updateIncident(id, { description: newDescription });
      setIncident(updated);
      setClarificationText('');
      setIsClarifying(false);
    } catch (err) {
      alert("Failed to update details: " + err.message);
      setIsClarifying(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this incident? This action cannot be undone.")) {
      try {
        await api.deleteIncident(id);
        navigate('/');
      } catch (err) {
        alert("Failed to delete: " + err.message);
      }
    }
  };

  if (loading) return <div className="flex-1 p-8 text-on-surface-variant font-medium">Loading incident...</div>;
  if (error || !incident) return <div className="flex-1 p-8 text-error font-medium">⚠️ Error: {error || 'Incident not found'}</div>;

  const assigneeUser = users.find(u => u.name === incident.assignee);
  const assigneeAvatar = assigneeUser ? assigneeUser.avatar : 'https://api.dicebear.com/9.x/shapes/svg?seed=Unassigned&backgroundColor=cbd5e1,94a3b8,64748b';
  const assigneeName = incident.assignee || 'Unassigned';

  return (
    <main className="flex-1 overflow-y-auto w-full flex flex-col pb-8 animate-entrance">
      {/* Context Bar */}
      <div className="px-8 py-4 max-w-5xl mx-auto w-full flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center text-on-surface-variant hover:text-on-surface transition-colors font-medium text-sm gap-1 group">
            <span className="material-symbols-outlined text-[18px] group-hover:-translate-x-0.5 transition-transform">arrow_back</span>
            Back to Dashboard
          </Link>
          <div className="h-4 w-px bg-outline-variant mx-1"></div>
          <span className="font-medium text-sm text-on-surface-variant">INC-{incident.id.toString().padStart(4, '0')}</span>
          <div className="flex items-center gap-2 ml-2">
            {incident.priority === 'high' && (
              <span className="px-2.5 py-1 rounded-md bg-error-container/80 text-error font-semibold text-[11px] uppercase tracking-widest flex items-center gap-1 border border-error-container">
                <span className="material-symbols-outlined text-[14px]">local_fire_department</span> High Priority
              </span>
            )}
            {incident.status === 'resolved' ? (
              <span className="px-2.5 py-1 rounded-md bg-surface-container-low text-on-surface-variant font-bold text-[11px] uppercase tracking-widest flex items-center gap-1 border border-transparent">
                <span className="material-symbols-outlined text-[14px]">check_circle</span> Resolved
              </span>
            ) : (
              <span className="px-2.5 py-1 rounded-md bg-error text-white font-bold text-[11px] uppercase tracking-widest flex items-center gap-1 border border-transparent">
                <span className="material-symbols-outlined text-[14px]">confirmation_number</span> Open
              </span>
            )}
          </div>
        </div>
        <button 
          onClick={handleDelete}
          className="text-error/80 hover:text-error p-1.5 rounded-md hover:bg-error-container/20 transition-colors flex items-center gap-1 text-sm font-semibold"
          title="Delete Incident"
        >
          <span className="material-symbols-outlined text-[18px]">delete</span>
          <span className="hidden sm:inline">Delete</span>
        </button>
      </div>

      <div className="px-8 max-w-5xl mx-auto w-full flex flex-col gap-8">
        
        {/* Duplicate Banner */}
        {incident.isDuplicate && (
          <div className="bg-error-container/20 border border-error-container text-error rounded-xl p-4 flex items-center justify-between shadow-sm animate-entrance mt-2">
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-[20px] mt-0.5">warning</span>
              <div>
                <h4 className="text-sm font-bold">Possible Duplicate Flagged by AI</h4>
                <p className="text-sm mt-1 opacity-90">
                  This incident describes the same issue as INC-{(incident.duplicateOfId || 0).toString().padStart(4, '0')}.
                </p>
              </div>
            </div>
            <Link to={`/incident/${incident.duplicateOfId}`} className="px-4 py-2 bg-error text-white text-xs font-bold rounded-lg hover:bg-error/90 transition-colors shadow-sm whitespace-nowrap">
              View Original
            </Link>
          </div>
        )}

        {/* Header Section */}
        <div className="flex flex-col gap-6">
          <div>
            <h1 className="text-[32px] font-bold text-on-surface leading-tight tracking-tight mb-2">{incident.title}</h1>
            <p className="text-sm text-on-surface-variant">
              Reported by <strong className="text-on-surface font-semibold">User</strong> • {new Date(incident.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>

          {/* Properties Row */}
          <div className="flex items-center gap-8 p-4 bg-surface-container-lowest rounded-xl border border-outline-variant/60 shadow-soft">
            <div className="flex-1 flex flex-col gap-1 border-r border-outline-variant/60 pr-8">
              <span className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-widest">Assignee</span>
              <div className="flex items-center gap-2 mt-1 cursor-pointer hover:bg-surface-container-low p-1 -ml-1 rounded-md transition-colors inline-flex w-fit">
                <img className="w-5 h-5 rounded-full object-cover border border-outline-variant/30" src={assigneeAvatar} alt="Avatar" />
                <span className="text-sm font-medium text-on-surface">{assigneeName}</span>
              </div>
            </div>
            <div className="flex-1 flex flex-col gap-1 border-r border-outline-variant/60 pr-8">
              <span className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-widest">Service / Category</span>
              <span className="text-sm font-medium text-on-surface mt-1 px-1 py-1 flex items-center gap-1.5 capitalize">
                <span className="w-2 h-2 rounded-full bg-primary/80"></span>{incident.category || 'Unassigned'}
              </span>
            </div>
            <div className="flex-1 flex flex-col gap-1">
              <span className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-widest">SLA Status</span>
              {incident.status === 'resolved' ? (
                <span className="text-sm font-semibold text-on-surface-variant mt-1 px-1 py-1 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px]">check_circle</span> Met
                </span>
              ) : (
                <span className="text-sm font-semibold text-error mt-1 px-1 py-1 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px]">timer</span> Pending
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Main Content Left (Description & Resolution) */}
          <div className="md:col-span-2 flex flex-col gap-8">

            {/* Description */}
            <div className="bg-surface-container-lowest border border-outline-variant/60 rounded-xl p-6 shadow-soft">
              <h3 className="text-base font-semibold text-on-surface mb-4 tracking-tight flex items-center gap-2">
                <span className="material-symbols-outlined text-on-surface-variant text-[18px]">subject</span>
                Original Description
              </h3>
              <div className="prose prose-sm max-w-none text-on-surface-variant/90 leading-relaxed font-medium whitespace-pre-wrap">
                {incident.description}
              </div>
              
              {incident.category === 'Other' && incident.status === 'open' && (
                <div className="mt-6 p-5 bg-error-container/20 border border-error-container/50 rounded-lg animate-entrance">
                  <h4 className="text-sm font-semibold text-error mb-2 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[18px]">help</span>
                    More Details Needed
                  </h4>
                  <p className="text-xs text-on-surface-variant font-medium mb-4">The AI could not diagnose the issue from the original description. Please provide more specifics (error messages, steps to reproduce) to automatically re-analyze the incident.</p>
                  <textarea 
                    value={clarificationText}
                    onChange={(e) => setClarificationText(e.target.value)}
                    placeholder="Add clarification details here..."
                    className="w-full h-24 p-3 border border-outline-variant/60 rounded-lg text-sm bg-background/80 focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/10 focus:outline-none resize-y mb-3 transition-colors"
                    disabled={isClarifying}
                  />
                  <div className="flex justify-end">
                    <button 
                      onClick={handleClarify}
                      disabled={isClarifying || !clarificationText.trim()}
                      className="px-4 py-2 bg-gradient-primary-btn text-white rounded-lg text-xs font-semibold hover:shadow-lg hover:shadow-primary/30 transition-all shadow-md flex items-center gap-2 disabled:opacity-70 disabled:transform-none"
                    >
                      {isClarifying ? '🔍 Analyzing New Details...' : 'Submit Details & Re-Analyze'}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* AI Analysis Premium Card */}
            <AiAnalysisCard 
              summary={incident.aiSummary}
              suggestedSteps={incident.aiSuggestedSteps}
              predictedCategory={incident.category}
              isPending={!incident.aiSummary || isClarifying}
            />

            {/* Resolution Area */}
            <div className="bg-surface-container-lowest border border-outline-variant/60 rounded-xl p-6 shadow-soft mt-auto">
              <h3 className="text-base font-semibold text-on-surface mb-4 tracking-tight flex items-center gap-2">
                <span className="material-symbols-outlined text-on-surface-variant text-[18px]">edit_note</span>
                Resolution Notes
              </h3>

              {incident.status === 'resolved' ? (
                <div className="bg-surface-container-low p-4 rounded-lg border border-outline-variant/50 text-sm font-medium text-on-surface-variant whitespace-pre-wrap">
                  {incident.resolution || "Resolved without notes."}
                </div>
              ) : (
                <>
                  <textarea
                    value={resolutionText}
                    onChange={(e) => setResolutionText(e.target.value)}
                    disabled={isResolving}
                    className="w-full h-32 p-4 border border-outline-variant/60 rounded-lg text-sm bg-background/50 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 focus:outline-none resize-y mb-4 placeholder:text-on-surface-variant/50 font-medium transition-all"
                    placeholder="Enter details about how this incident was resolved..."
                  />
                  <div className="flex justify-end gap-3">
                    <button
                      onClick={handleResolve}
                      disabled={isResolving || !resolutionText.trim()}
                      className="px-4 py-2 bg-gradient-primary-btn text-white rounded-lg text-sm font-semibold hover:shadow-lg hover:shadow-primary/30 transition-all shadow-md transform hover:-translate-y-0.5 disabled:opacity-70 disabled:transform-none flex items-center gap-2"
                    >
                      <span>{isResolving ? 'Saving...' : 'Mark Resolved'}</span>
                      {!isResolving && <span className="material-symbols-outlined text-[18px]">check_circle</span>}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Right Column (KB Articles) */}
          <div className="md:col-span-1">
            <div className="bg-surface-container-lowest border border-outline-variant/60 rounded-xl p-6 shadow-soft h-full">
              <div className="flex items-center gap-2 mb-5 pb-4 border-b border-outline-variant/50">
                <span className="material-symbols-outlined text-primary text-[18px]">menu_book</span>
                <h3 className="text-[11px] font-semibold text-primary uppercase tracking-widest">Suggested KB Articles</h3>
              </div>
              <ul className="space-y-4">
                {(() => {
                  let suggestedKBs = [];
                  if (incident?.linkedKbArticleIds) {
                    try {
                      const parsed = JSON.parse(incident.linkedKbArticleIds);
                      suggestedKBs = parsed.map(suggestion => {
                        const kb = kbArticles.find(k => k.id === suggestion.id);
                        return { ...suggestion, title: kb?.title, tags: kb?.tags };
                      }).filter(k => k.title);
                    } catch (e) {
                      console.error("Failed to parse linked KBs", e);
                    }
                  }

                  if (suggestedKBs.length === 0) {
                    return (
                      <li className="text-center p-4">
                        <span className="text-xs font-medium text-on-surface-variant">No related KB articles found.</span>
                      </li>
                    );
                  }

                  return suggestedKBs.map((kb, idx) => (
                    <li key={idx} className="bg-surface-container-low border border-outline-variant/50 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow group cursor-pointer relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-1 h-full bg-primary/40 group-hover:bg-primary transition-colors"></div>
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="text-sm font-semibold text-on-surface leading-tight pr-2 group-hover:text-primary transition-colors">{kb.title}</h4>
                        {kb.matchPercentage && (
                          <span className="text-[10px] font-bold bg-primary/10 text-primary px-1.5 py-0.5 rounded flex-shrink-0">
                            {kb.matchPercentage}% Match
                          </span>
                        )}
                      </div>
                      <p className="text-xs font-medium text-on-surface-variant leading-relaxed">
                        {kb.reason}
                      </p>
                      {kb.tags && (
                        <div className="mt-3 flex flex-wrap gap-1">
                          {kb.tags.split(',').map((tag, tIdx) => (
                            <span key={tIdx} className="text-[10px] font-medium bg-white border border-outline-variant/50 text-on-surface-variant px-1.5 py-0.5 rounded capitalize">
                              {tag.trim()}
                            </span>
                          ))}
                        </div>
                      )}
                    </li>
                  ));
                })()}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
