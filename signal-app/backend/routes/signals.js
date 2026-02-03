import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';

export const signalsRouter = Router();

// In-memory signal store (replace with DB in production)
const signals = new Map();

// Get all signals
signalsRouter.get('/', (req, res) => {
  const { filter, limit = 50, offset = 0 } = req.query;
  
  let result = Array.from(signals.values())
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  if (filter === 'pending') {
    result = result.filter(s => !s.status);
  } else if (filter === 'momentum') {
    result = result.filter(s => s.classification?.momentum_flag && !s.status);
  } else if (filter === 'critical') {
    result = result.filter(s => 
      (s.classification?.urgency === 'critical' || s.classification?.urgency === 'high') && !s.status
    );
  } else if (filter === 'processed') {
    result = result.filter(s => s.status);
  }

  res.json({
    signals: result.slice(offset, offset + parseInt(limit)),
    total: result.length,
    stats: {
      pending: Array.from(signals.values()).filter(s => !s.status).length,
      momentum: Array.from(signals.values()).filter(s => s.classification?.momentum_flag && !s.status).length,
      critical: Array.from(signals.values()).filter(s => 
        (s.classification?.urgency === 'critical' || s.classification?.urgency === 'high') && !s.status
      ).length,
      processed: Array.from(signals.values()).filter(s => s.status).length
    }
  });
});

// Get single signal
signalsRouter.get('/:id', (req, res) => {
  const signal = signals.get(req.params.id);
  if (!signal) {
    return res.status(404).json({ error: 'Signal not found' });
  }
  res.json(signal);
});

// Update signal status (approve/reject)
signalsRouter.patch('/:id', (req, res) => {
  const signal = signals.get(req.params.id);
  if (!signal) {
    return res.status(404).json({ error: 'Signal not found' });
  }

  const { status, note } = req.body;
  
  if (!['approved', 'rejected', 'pending'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  signal.status = status;
  signal.processedBy = req.user.username;
  signal.processedAt = new Date().toISOString();
  if (note) signal.note = note;

  signals.set(req.params.id, signal);

  res.json(signal);
});

// Bulk update
signalsRouter.post('/bulk-action', (req, res) => {
  const { ids, status } = req.body;

  if (!Array.isArray(ids) || !status) {
    return res.status(400).json({ error: 'Invalid request' });
  }

  const updated = [];
  for (const id of ids) {
    const signal = signals.get(id);
    if (signal) {
      signal.status = status;
      signal.processedBy = req.user.username;
      signal.processedAt = new Date().toISOString();
      signals.set(id, signal);
      updated.push(id);
    }
  }

  res.json({ updated, count: updated.length });
});

// Export signals store for webhook route
export { signals };

// Public demo endpoint (no auth required)
signalsRouter.get('/demo/public', (req, res) => {
  const result = Array.from(signals.values())
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 20);
  
  res.json({
    signals: result,
    total: signals.size
  });
});
