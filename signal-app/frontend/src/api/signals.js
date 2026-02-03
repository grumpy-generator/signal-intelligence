const API_URL = import.meta.env.VITE_API_URL || '';

export function createSignalsAPI(getToken) {
  function getAuthHeaders() {
    const token = getToken();
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  }

  async function fetchSignals(filter = 'all') {
    const res = await fetch(`${API_URL}/api/signals?filter=${filter}`, {
      headers: getAuthHeaders()
    });
  
    if (!res.ok) throw new Error('Failed to fetch signals');
    return res.json();
  }

  async function updateSignalStatus(id, status, note = '') {
    const res = await fetch(`${API_URL}/api/signals/${id}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status, note })
    });
    
    if (!res.ok) throw new Error('Failed to update signal');
    return res.json();
  }

  async function bulkAction(ids, status) {
    const res = await fetch(`${API_URL}/api/signals/bulk-action`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ ids, status })
    });
    
    if (!res.ok) throw new Error('Failed to bulk update');
    return res.json();
  }

  return { fetchSignals, updateSignalStatus, bulkAction };
}
