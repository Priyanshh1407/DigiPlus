export const api = {
  getIncidents: async () => {
    const res = await fetch('/api/incidents');
    if (!res.ok) throw new Error('Failed to fetch incidents');
    return res.json();
  },
  
  getIncident: async (id) => {
    const res = await fetch(`/api/incidents/${id}`);
    if (!res.ok) throw new Error('Failed to fetch incident');
    return res.json();
  },
  
  createIncident: async (data) => {
    const res = await fetch('/api/incidents', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to create incident');
    return res.json();
  },
  
  updateIncident: async (id, data) => {
    const res = await fetch(`/api/incidents/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to update incident');
    return res.json();
  },

  deleteIncident: async (id) => {
    const res = await fetch(`/api/incidents/${id}`, {
      method: 'DELETE'
    });
    if (!res.ok) throw new Error('Failed to delete incident');
    return res.json();
  },

  analyzeIncident: async (title, description) => {
    const res = await fetch('/api/incidents/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, description })
    });
    if (!res.ok) throw new Error('Failed to analyze incident');
    return res.json();
  },

  getKBArticles: async () => {
    const res = await fetch('/api/kb');
    if (!res.ok) throw new Error('Failed to fetch KB articles');
    return res.json();
  }
};
