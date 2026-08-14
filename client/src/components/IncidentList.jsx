import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import { PriorityBadge, StatusBadge, CategoryBadge } from './ui/Badges';
import { USERS, useUser } from '../context/UserContext';

export default function IncidentList() {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all'); // 'all', 'mine', 'resolved'
  const { currentUser } = useUser();

  useEffect(() => {
    fetchIncidents();
  }, []);

  const fetchIncidents = () => {
    api.getIncidents()
      .then(data => {
        setIncidents(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  };

  if (loading) return <div className="flex-1 p-8 text-on-surface-variant font-medium">Loading incidents...</div>;
  if (error) return <div className="flex-1 p-8 text-error font-medium">Error loading incidents: {error}</div>;

  const openIncidentsCount = incidents.filter(i => i.status !== 'resolved').length;
  const highPriorityCount = incidents.filter(i => i.status !== 'resolved' && i.priority === 'high').length;

  const filteredIncidents = incidents.filter(incident => {
    // 1. Tab Filters
    if (filterType === 'resolved' && incident.status !== 'resolved') return false;
    if (filterType === 'mine' && incident.assignee !== currentUser.name) return false;
    
    // 2. Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchesSearch = 
        incident.title?.toLowerCase()?.includes(q) ||
        incident.description?.toLowerCase()?.includes(q) ||
        incident.id?.toString()?.includes(q) ||
        incident.assignee?.toLowerCase()?.includes(q) ||
        incident.category?.toLowerCase()?.includes(q);
      
      if (!matchesSearch) return false;
    }
    
    return true;
  });

  return (
    <div className="px-8 py-8 max-w-7xl mx-auto w-full flex flex-col gap-8">
      {/* Page Header */}
      <div className="flex justify-between items-center animate-entrance" style={{ animationDelay: '50ms' }}>
        <div>
          <h2 className="text-[32px] font-bold text-on-surface leading-tight tracking-tight">🎫 Incident Dashboard</h2>
          <p className="text-sm text-on-surface-variant mt-1 font-medium">Overview of all active and recent system incidents.</p>
        </div>
        <Link to="/new" className="px-4 py-2 bg-gradient-primary-btn text-white rounded-lg text-sm font-semibold hover:shadow-lg hover:shadow-primary/30 transition-all duration-300 shadow-md transform hover:-translate-y-0.5 hover:brightness-110 active:scale-95 flex items-center gap-1">
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>add</span>
          New Incident
        </Link>
      </div>
      
      {/* Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="gradient-card-1 border border-primary/20 rounded-xl p-6 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-lg animate-entrance" style={{ animationDelay: '100ms' }}>
          <p className="text-[11px] font-bold text-primary uppercase tracking-widest mb-2">Open Incidents</p>
          <p className="text-[32px] font-bold text-on-surface tracking-tight">{openIncidentsCount}</p>
        </div>
        <div className="gradient-card-2 border border-error/20 rounded-xl p-6 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-lg animate-entrance" style={{ animationDelay: '150ms' }}>
          <p className="text-[11px] font-bold text-error uppercase tracking-widest mb-2">High Priority</p>
          <p className="text-[32px] font-bold text-error tracking-tight">{highPriorityCount}</p>
        </div>
        <div className="gradient-card-3 border border-secondary/20 rounded-xl p-6 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-lg animate-entrance" style={{ animationDelay: '200ms' }}>
          <p className="text-[11px] font-bold text-secondary uppercase tracking-widest mb-2">Avg Resolution Time</p>
          <p className="text-[32px] font-bold text-on-surface tracking-tight">2.4h</p>
        </div>
        <div className="animate-shimmer border border-primary/40 rounded-xl p-6 shadow-soft flex flex-col justify-center relative overflow-hidden group transition-all duration-300 hover:-translate-y-1 hover:shadow-lg animate-entrance" style={{ animationDelay: '250ms' }}>
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-primary/20 rounded-full blur-2xl group-hover:bg-primary/30 transition-all duration-700 pointer-events-none"></div>
          <span className="text-sm font-bold text-primary relative z-10">System Status: <span className="text-primary font-black animate-pulse inline-block">Degraded</span></span>
        </div>
      </div>
      
      {/* High Density Data Table Container */}
      <div className="bg-surface-container-lowest border border-outline-variant/60 rounded-xl overflow-hidden shadow-soft animate-entrance" style={{ animationDelay: '300ms' }}>
        {/* Table Toolbar */}
        <div className="border-b border-outline-variant/60 px-6 py-4 flex flex-col md:flex-row justify-between items-center bg-white gap-4">
          <div className="flex gap-2 w-full md:w-auto">
            <button 
              onClick={() => setFilterType('all')}
              className={`text-sm font-bold px-3 py-1.5 rounded-md transition-colors ${filterType === 'all' ? 'bg-primary-container text-on-primary-container' : 'text-on-surface-variant hover:bg-surface-container-low'}`}
            >All Tickets</button>
            <button 
              onClick={() => setFilterType('mine')}
              className={`text-sm font-bold px-3 py-1.5 rounded-md transition-colors ${filterType === 'mine' ? 'bg-primary-container text-on-primary-container' : 'text-on-surface-variant hover:bg-surface-container-low'}`}
            >Assigned to Me</button>
            <button 
              onClick={() => setFilterType('resolved')}
              className={`text-sm font-bold px-3 py-1.5 rounded-md transition-colors ${filterType === 'resolved' ? 'bg-primary-container text-on-primary-container' : 'text-on-surface-variant hover:bg-surface-container-low'}`}
            >Resolved</button>
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative w-full md:w-64">
              <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">search</span>
              <input 
                type="text"
                placeholder="Search tickets, assignees..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-1.5 border border-outline-variant/60 rounded-lg text-sm bg-surface-container-low/50 focus:bg-white focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-medium placeholder:text-on-surface-variant/70"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface"
                >
                  <span className="material-symbols-outlined text-[16px]">close</span>
                </button>
              )}
            </div>
            <button className="text-primary hover:text-on-surface hover:bg-surface-container-low rounded-lg p-1.5 flex items-center justify-center transition-colors border border-transparent hover:border-outline-variant/50">
              <span className="material-symbols-outlined text-[20px]">filter_list</span>
            </button>
          </div>
        </div>
        
        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="border-b border-outline-variant/60 bg-surface-container-low">
                <th className="py-3 px-6 text-[11px] font-bold text-primary uppercase tracking-widest">Ticket ID &amp; Title</th>
                <th className="py-3 px-6 text-[11px] font-bold text-primary uppercase tracking-widest">Status</th>
                <th className="py-3 px-6 text-[11px] font-bold text-primary uppercase tracking-widest">Priority</th>
                <th className="py-3 px-6 text-[11px] font-bold text-primary uppercase tracking-widest">Category</th>
                <th className="py-3 px-6 text-[11px] font-bold text-primary uppercase tracking-widest">Created</th>
                <th className="py-3 px-6 text-[11px] font-bold text-primary uppercase tracking-widest">Assignee</th>
              </tr>
            </thead>
            <tbody className="text-sm font-medium bg-white">
              {filteredIncidents.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-on-surface-variant flex-col flex items-center gap-2">
                    <span className="material-symbols-outlined text-[48px] opacity-20">search_off</span>
                    <span>No incidents match your search or filters.</span>
                  </td>
                </tr>
              ) : (
                filteredIncidents.map((incident, idx) => (
                  <tr key={incident.id} className="border-b border-outline-variant/60 hover:bg-surface-container-low/50 transition-all duration-200 hover:translate-x-1 animate-entrance" style={{ animationDelay: `${350 + (idx * 50)}ms` }}>
                    <td className="py-4 px-6">
                      <Link to={`/incident/${incident.id}`} className="flex flex-col gap-0.5 group">
                        <div className="flex items-center gap-2">
                          <span className={`font-bold transition-colors group-hover:text-primary ${incident.status === 'resolved' ? 'text-on-surface-variant line-through opacity-70' : 'text-on-surface'}`}>{incident.title}</span>
                          {incident.isDuplicate && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-error-container/80 text-error tracking-wider uppercase border border-error-container flex items-center gap-0.5" title={`Duplicate of INC-${incident.duplicateOfId}`}>
                              <span className="material-symbols-outlined text-[10px]">content_copy</span> Dup
                            </span>
                          )}
                        </div>
                        <span className={`text-xs font-semibold ${incident.status === 'resolved' ? 'text-primary opacity-70' : 'text-primary'}`}>#{incident.id.toString().padStart(4, '0')}</span>
                      </Link>
                    </td>
                    <td className="py-4 px-6">
                      <StatusBadge status={incident.status} type="pill" />
                    </td>
                    <td className="py-4 px-6">
                      <PriorityBadge priority={incident.priority} />
                    </td>
                    <td className="py-4 px-6">
                      <CategoryBadge category={incident.category} />
                    </td>
                    <td className="py-4 px-6 text-on-surface-variant font-semibold">
                      {new Date(incident.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="py-4 px-6">
                      {(() => {
                        // Use string includes to be extremely robust against slight name mismatches
                        const assigneeUser = USERS.find(u => incident.assignee && u.name.includes(incident.assignee.split(' ')[0]));
                        const avatar = assigneeUser ? assigneeUser.avatar : 'https://api.dicebear.com/9.x/shapes/svg?seed=Unassigned&backgroundColor=cbd5e1,94a3b8,64748b';
                        const name = incident.assignee || 'Unassigned';
                        return (
                          <div className="flex items-center gap-2">
                            <div className="h-6 w-6 rounded-full overflow-hidden border border-outline-variant/50 flex-shrink-0 shadow-sm bg-white">
                              <img alt="Assignee" className="w-full h-full object-cover" src={avatar} />
                            </div>
                            <span className="text-sm font-semibold text-on-surface truncate max-w-[150px]">{name}</span>
                          </div>
                        );
                      })()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Table Footer Pagination */}
        <div className="border-t border-outline-variant/60 px-6 py-4 bg-surface flex justify-between items-center text-sm font-bold text-on-surface-variant">
          <span>Showing {filteredIncidents.length > 0 ? 1 : 0} to {filteredIncidents.length} of {filteredIncidents.length} entries</span>
          <div className="flex gap-2">
            <button className="px-3 py-1.5 border border-primary/30 rounded-md hover:bg-primary hover:text-white transition-colors disabled:opacity-50 disabled:hover:bg-transparent font-bold text-primary" disabled>Prev</button>
            <button className="px-3 py-1.5 border border-primary/30 rounded-md hover:bg-primary hover:text-white transition-colors font-bold text-primary" disabled>Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}
