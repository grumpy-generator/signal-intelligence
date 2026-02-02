const { useState, useEffect } = React;

const mockSignals = [
  {
    id: 'sig_001',
    actor: '@degen_whale',
    avatar: '🐋',
    text: 'pump.fun just rugged me for the 3rd time this week. Getting tired of this garbage platform',
    timestamp: '2 min ago',
    source: 'twitter',
    followers: '12.4K',
    classification: {
      intent_stage: 'frustration',
      primary_pain: 'trust_issue',
      urgency: 'high',
      confidence: 0.92,
      momentum_flag: true,
      momentum_count: 47,
      recommended_action: 'reply_with_transparency',
      suggested_reply: "Hey, we hear you and take this seriously. Our team is investigating. Can you DM us the tx hash so we can look into this specific case?"
    }
  },
  {
    id: 'sig_002',
    actor: '@solana_maxi',
    avatar: '☀️',
    text: 'Anyone know how to fix the "transaction failed" error on pump? Been stuck for 20 mins',
    timestamp: '8 min ago',
    source: 'twitter',
    followers: '8.2K',
    classification: {
      intent_stage: 'seeking_help',
      primary_pain: 'technical_issue',
      urgency: 'medium',
      confidence: 0.88,
      momentum_flag: true,
      momentum_count: 23,
      recommended_action: 'reply_with_support_link',
      suggested_reply: "Try refreshing and switching to a different RPC. If that doesn't work, check out our troubleshooting guide: [link]. Let us know if you're still stuck!"
    }
  },
  {
    id: 'sig_003',
    actor: '@crypto_sarah',
    avatar: '✨',
    text: 'First time using pump.fun - is there a guide somewhere? Feeling lost',
    timestamp: '15 min ago',
    source: 'twitter',
    followers: '2.1K',
    classification: {
      intent_stage: 'onboarding',
      primary_pain: 'lack_of_guidance',
      urgency: 'low',
      confidence: 0.95,
      momentum_flag: false,
      momentum_count: 0,
      recommended_action: 'reply_with_tutorial',
      suggested_reply: "Welcome! Here's our quickstart guide to get you going: [link]. Feel free to ask if you have any questions!"
    }
  },
  {
    id: 'sig_004',
    actor: '@memecoin_hunter',
    avatar: '🎯',
    text: 'PUMP IS DOWN AGAIN WTF IS HAPPENING',
    timestamp: '1 min ago',
    source: 'twitter',
    followers: '45.7K',
    classification: {
      intent_stage: 'frustration',
      primary_pain: 'platform_outage',
      urgency: 'critical',
      confidence: 0.97,
      momentum_flag: true,
      momentum_count: 156,
      recommended_action: 'escalate_to_engineering',
      suggested_reply: "We're aware of the issue and our engineering team is on it. Follow @pumpfunstatus for real-time updates. Apologies for the inconvenience."
    }
  },
  {
    id: 'sig_005',
    actor: '@trader_anon',
    avatar: '👻',
    text: 'The new pump.fun UI is actually pretty clean, props to the team',
    timestamp: '22 min ago',
    source: 'twitter',
    followers: '5.3K',
    classification: {
      intent_stage: 'positive_feedback',
      primary_pain: 'none',
      urgency: 'low',
      confidence: 0.91,
      momentum_flag: false,
      momentum_count: 0,
      recommended_action: 'acknowledge_and_thank',
      suggested_reply: "Thanks for the kind words! We've been working hard on it. More improvements coming soon."
    }
  },
  {
    id: 'sig_006',
    actor: '@web3_builder',
    avatar: '🔨',
    text: 'Is there an API for pump.fun? Want to build some tooling around it',
    timestamp: '34 min ago',
    source: 'twitter',
    followers: '18.9K',
    classification: {
      intent_stage: 'feature_request',
      primary_pain: 'missing_functionality',
      urgency: 'medium',
      confidence: 0.89,
      momentum_flag: false,
      momentum_count: 0,
      recommended_action: 'reply_with_docs',
      suggested_reply: "Yes! Check out our API docs here: [link]. We also have a Discord channel for developers if you want to connect with other builders."
    }
  }
];

const urgencyConfig = {
  critical: { color: '#ff3b3b', bg: 'rgba(255, 59, 59, 0.12)', label: 'CRITICAL', icon: '🚨' },
  high: { color: '#ff9500', bg: 'rgba(255, 149, 0, 0.12)', label: 'HIGH', icon: '⚠️' },
  medium: { color: '#ffd60a', bg: 'rgba(255, 214, 10, 0.12)', label: 'MEDIUM', icon: '●' },
  low: { color: '#30d158', bg: 'rgba(48, 209, 88, 0.12)', label: 'LOW', icon: '○' }
};

const intentConfig = {
  frustration: { icon: '😤', color: '#ff6b6b' },
  seeking_help: { icon: '🆘', color: '#ffd93d' },
  onboarding: { icon: '👋', color: '#6bcb77' },
  positive_feedback: { icon: '💚', color: '#4d96ff' },
  feature_request: { icon: '💡', color: '#9b59b6' },
  churning: { icon: '👋', color: '#e74c3c' }
};

function SignalDashboard() {
  const [signals, setSignals] = useState(mockSignals);
  const [filter, setFilter] = useState('all');
  const [selectedSignal, setSelectedSignal] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [actionHistory, setActionHistory] = useState([]);
  const [showToast, setShowToast] = useState(null);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleAction = (id, action) => {
    const signal = signals.find(s => s.id === id);
    setSignals(signals.map(s => s.id === id ? { ...s, status: action } : s));
    setActionHistory(prev => [...prev, { id, action, actor: signal.actor, time: new Date().toLocaleTimeString() }]);
    setSelectedSignal(null);
    setShowToast({ type: action, message: action === 'approved' ? 'Signal approved' : 'Signal skipped' });
    setTimeout(() => setShowToast(null), 2500);
  };

  const filteredSignals = signals.filter(s => {
    if (filter === 'all') return !s.status;
    if (filter === 'momentum') return s.classification.momentum_flag && !s.status;
    if (filter === 'critical') return (s.classification.urgency === 'critical' || s.classification.urgency === 'high') && !s.status;
    if (filter === 'processed') return s.status;
    return true;
  });

  const stats = {
    pending: signals.filter(s => !s.status).length,
    momentum: signals.filter(s => s.classification.momentum_flag && !s.status).length,
    critical: signals.filter(s => (s.classification.urgency === 'critical' || s.classification.urgency === 'high') && !s.status).length,
    processed: signals.filter(s => s.status).length
  };

  return (
    <div className="container">
      <div className="ambient-glow" />
      <div className="grid-pattern" />
      
      {showToast && (
        <div className={`toast ${showToast.type}`}>
          <span>{showToast.type === 'approved' ? '✓' : '✕'}</span>
          {showToast.message}
        </div>
      )}
      
      <header className="header">
        <div className="logo-section">
          <div className="logo">
            <div className="logo-icon-wrapper">
              <span className="logo-icon">◉</span>
              <span className="logo-ring" />
            </div>
            <div className="logo-text-wrapper">
              <span className="logo-text">SIGNAL</span>
              <span className="logo-subtext">Feedback Intelligence</span>
            </div>
          </div>
        </div>
        <div className="header-center">
          <div className="search-box">
            <span className="search-icon">⌘</span>
            <span className="search-placeholder">Search signals...</span>
            <span className="search-shortcut">K</span>
          </div>
        </div>
        <div className="header-right">
          <div className="live-indicator">
            <span className="live-dot" />
            <span>LIVE</span>
          </div>
          <div className="divider" />
          <div className="timestamp">{currentTime.toLocaleTimeString('en-US', { hour12: false })}</div>
          <div className="user-avatar">⚡</div>
        </div>
      </header>

      <div className="stats-bar">
        {[
          { key: 'all', label: 'PENDING', value: stats.pending, icon: '◎', color: '#fff' },
          { key: 'momentum', label: 'MOMENTUM', value: stats.momentum, icon: '🔥', color: '#ff9500' },
          { key: 'critical', label: 'HIGH PRIORITY', value: stats.critical, icon: '⚡', color: '#ff3b3b', pulse: stats.critical > 0 },
          { key: 'processed', label: 'PROCESSED', value: stats.processed, icon: '✓', color: '#30d158' }
        ].map(stat => (
          <button
            key={stat.key}
            onClick={() => setFilter(stat.key)}
            className={`stat-card ${filter === stat.key ? 'active' : ''} ${stat.pulse ? 'pulse' : ''}`}
            style={{ '--stat-color': stat.color }}
          >
            <div className="stat-top">
              <span className="stat-icon">{stat.icon}</span>
              <span className="stat-value">{stat.value}</span>
            </div>
            <span className="stat-label">{stat.label}</span>
          </button>
        ))}
      </div>

      <main className="main">
        <div className="signal-list">
          <div className="list-header">
            <div className="list-header-left">
              <span className="list-title">Signal Queue</span>
              <span className="list-count">{filteredSignals.length}</span>
            </div>
            <div className="sort-dropdown">
              <span>Urgency</span>
              <span className="dropdown-arrow">▾</span>
            </div>
          </div>
          
          <div className="signal-list-content">
            {filteredSignals.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">✓</div>
                <div className="empty-title">All clear</div>
                <div className="empty-subtitle">No signals matching this filter</div>
              </div>
            ) : (
              filteredSignals
                .sort((a, b) => {
                  const order = { critical: 0, high: 1, medium: 2, low: 3 };
                  return order[a.classification.urgency] - order[b.classification.urgency];
                })
                .map((signal, index) => (
                  <SignalCard 
                    key={signal.id}
                    signal={signal}
                    index={index}
                    isSelected={selectedSignal?.id === signal.id}
                    onClick={() => setSelectedSignal(signal)}
                    onApprove={() => handleAction(signal.id, 'approved')}
                    onReject={() => handleAction(signal.id, 'rejected')}
                  />
                ))
            )}
          </div>
        </div>

        <div className="detail-panel">
          {selectedSignal ? (
            <SignalDetail 
              signal={selectedSignal}
              onApprove={() => handleAction(selectedSignal.id, 'approved')}
              onReject={() => handleAction(selectedSignal.id, 'rejected')}
              onClose={() => setSelectedSignal(null)}
            />
          ) : (
            <div className="no-selection">
              <div className="no-selection-graphic">
                <div className="no-selection-circle">
                  <span className="no-selection-icon">◎</span>
                </div>
              </div>
              <div className="no-selection-text">Select a signal to review</div>
              <div className="no-selection-hint">Click on any signal from the queue</div>
            </div>
          )}
        </div>
      </main>

      <div className="activity-bar">
        <div className="activity-label">Recent</div>
        <div className="activity-items">
          {actionHistory.slice(-5).reverse().map((item, i) => (
            <div key={i} className="activity-item">
              <span className={`activity-dot ${item.action}`} />
              <span className="activity-text">{item.action === 'approved' ? '✓' : '✕'} {item.actor}</span>
            </div>
          ))}
          {actionHistory.length === 0 && <span className="activity-empty">No activity yet</span>}
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&family=Inter:wght@400;500;600;700&display=swap');
        
        * { box-sizing: border-box; margin: 0; padding: 0; }
        
        .container {
          min-height: 100vh;
          background: #08080a;
          color: #ffffff;
          font-family: 'Inter', -apple-system, sans-serif;
          position: relative;
          overflow: hidden;
        }
        
        .ambient-glow {
          position: fixed;
          inset: 0;
          background: radial-gradient(ellipse 80% 50% at 50% -20%, rgba(255, 149, 0, 0.08) 0%, transparent 50%),
                      radial-gradient(ellipse 60% 40% at 90% 100%, rgba(255, 59, 59, 0.05) 0%, transparent 50%);
          pointer-events: none;
        }
        
        .grid-pattern {
          position: fixed;
          inset: 0;
          background-image: linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px);
          background-size: 50px 50px;
          pointer-events: none;
        }
        
        .toast {
          position: fixed;
          top: 20px;
          left: 50%;
          transform: translateX(-50%);
          padding: 12px 24px;
          border-radius: 12px;
          font-weight: 600;
          font-size: 14px;
          display: flex;
          align-items: center;
          gap: 8px;
          z-index: 1000;
          animation: toastIn 0.3s ease;
          box-shadow: 0 10px 40px rgba(0,0,0,0.4);
        }
        .toast.approved { background: rgba(48, 209, 88, 0.95); }
        .toast.rejected { background: rgba(255, 59, 59, 0.95); }
        
        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 14px 24px;
          border-bottom: 1px solid rgba(255,255,255,0.04);
          position: relative;
          z-index: 10;
          background: rgba(8,8,10,0.85);
          backdrop-filter: blur(20px);
        }
        
        .logo { display: flex; align-items: center; gap: 12px; }
        .logo-icon-wrapper {
          position: relative;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .logo-icon { font-size: 18px; color: #ff9500; z-index: 2; position: relative; }
        .logo-ring {
          position: absolute;
          inset: 0;
          border: 2px solid rgba(255, 149, 0, 0.3);
          border-radius: 50%;
          animation: ring 2s ease-out infinite;
        }
        .logo-text-wrapper { display: flex; flex-direction: column; }
        .logo-text { font-size: 16px; font-weight: 700; letter-spacing: 2px; }
        .logo-subtext { font-size: 9px; color: rgba(255,255,255,0.35); letter-spacing: 0.5px; }
        
        .header-center { flex: 1; display: flex; justify-content: center; padding: 0 32px; }
        .search-box {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 14px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.05);
          border-radius: 8px;
          width: 100%;
          max-width: 320px;
          cursor: pointer;
          transition: all 0.15s;
        }
        .search-box:hover { border-color: rgba(255,255,255,0.1); }
        .search-icon { font-size: 12px; color: rgba(255,255,255,0.25); }
        .search-placeholder { flex: 1; font-size: 12px; color: rgba(255,255,255,0.3); }
        .search-shortcut {
          font-size: 10px;
          color: rgba(255,255,255,0.2);
          padding: 2px 5px;
          background: rgba(255,255,255,0.05);
          border-radius: 4px;
          font-family: 'JetBrains Mono', monospace;
        }
        
        .header-right { display: flex; align-items: center; gap: 14px; }
        .live-indicator {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 1px;
          color: #30d158;
        }
        .live-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #30d158;
          animation: livePulse 2s ease-in-out infinite;
        }
        .divider { width: 1px; height: 16px; background: rgba(255,255,255,0.08); }
        .timestamp {
          font-family: 'JetBrains Mono', monospace;
          font-size: 12px;
          color: rgba(255,255,255,0.35);
        }
        .user-avatar {
          width: 30px;
          height: 30px;
          border-radius: 8px;
          background: linear-gradient(135deg, #ff9500 0%, #ff5e3a 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
        }
        
        .stats-bar {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 10px;
          padding: 14px 24px;
          border-bottom: 1px solid rgba(255,255,255,0.04);
          background: rgba(8,8,10,0.5);
        }
        
        .stat-card {
          padding: 14px 16px;
          border: 1px solid rgba(255,255,255,0.04);
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          flex-direction: column;
          gap: 8px;
          font-family: inherit;
          background: rgba(255,255,255,0.01);
          color: inherit;
        }
        .stat-card:hover { border-color: rgba(255,255,255,0.08); }
        .stat-card.active {
          border-color: color-mix(in srgb, var(--stat-color) 40%, transparent);
          background: linear-gradient(135deg, color-mix(in srgb, var(--stat-color) 5%, transparent) 0%, transparent 100%);
        }
        .stat-card.pulse { animation: glow 2s ease-in-out infinite; }
        
        .stat-top { display: flex; justify-content: space-between; align-items: center; }
        .stat-icon { font-size: 14px; opacity: 0.4; }
        .stat-card.active .stat-icon { opacity: 1; color: var(--stat-color); }
        .stat-value {
          font-size: 26px;
          font-weight: 700;
          font-family: 'JetBrains Mono', monospace;
          color: var(--stat-color);
        }
        .stat-label {
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.5px;
          color: rgba(255,255,255,0.35);
        }
        .stat-card.active .stat-label { color: rgba(255,255,255,0.7); }
        
        .main {
          display: flex;
          height: calc(100vh - 180px);
          position: relative;
          z-index: 10;
        }
        
        .signal-list {
          flex: 0 0 55%;
          border-right: 1px solid rgba(255,255,255,0.04);
          display: flex;
          flex-direction: column;
        }
        
        .list-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 24px;
          border-bottom: 1px solid rgba(255,255,255,0.04);
          background: rgba(8,8,10,0.5);
        }
        .list-header-left { display: flex; align-items: center; gap: 10px; }
        .list-title { font-size: 13px; font-weight: 600; color: rgba(255,255,255,0.8); }
        .list-count {
          font-size: 11px;
          color: rgba(255,255,255,0.3);
          font-family: 'JetBrains Mono', monospace;
          padding: 3px 8px;
          background: rgba(255,255,255,0.04);
          border-radius: 6px;
        }
        .sort-dropdown {
          display: flex;
          align-items: center;
          gap: 5px;
          font-size: 11px;
          color: rgba(255,255,255,0.35);
          cursor: pointer;
        }
        .dropdown-arrow { font-size: 8px; }
        
        .signal-list-content {
          flex: 1;
          overflow-y: auto;
          padding: 6px 0;
        }
        
        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 250px;
          gap: 10px;
        }
        .empty-icon {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          background: rgba(48, 209, 88, 0.1);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          color: #30d158;
        }
        .empty-title { font-size: 14px; font-weight: 600; color: rgba(255,255,255,0.7); }
        .empty-subtitle { font-size: 12px; color: rgba(255,255,255,0.35); }
        
        .signal-card {
          display: flex;
          margin: 3px 10px;
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.15s;
          animation: slideIn 0.3s ease backwards;
          border: 1px solid transparent;
          overflow: hidden;
        }
        .signal-card:hover { background: rgba(255,255,255,0.02); }
        .signal-card.selected {
          border-color: rgba(255,255,255,0.12);
          background: linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%);
        }
        
        .urgency-line { width: 3px; flex-shrink: 0; }
        
        .signal-content { flex: 1; padding: 14px 16px; }
        
        .signal-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px; }
        
        .actor-info { display: flex; align-items: center; gap: 10px; }
        .avatar {
          font-size: 20px;
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(255,255,255,0.03);
          border-radius: 8px;
        }
        .actor-details { display: flex; flex-direction: column; gap: 2px; }
        .actor-row { display: flex; align-items: center; gap: 6px; }
        .actor-name { font-size: 13px; font-weight: 600; }
        .followers { font-size: 10px; color: rgba(255,255,255,0.3); font-family: 'JetBrains Mono', monospace; }
        .signal-time { font-size: 11px; color: rgba(255,255,255,0.25); }
        
        .urgency-badge {
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.5px;
          padding: 4px 8px;
          border-radius: 6px;
          display: flex;
          align-items: center;
          gap: 4px;
        }
        
        .signal-text {
          font-size: 13px;
          line-height: 1.5;
          color: rgba(255,255,255,0.75);
          margin-bottom: 12px;
        }
        
        .signal-meta { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 12px; }
        
        .intent-badge {
          font-size: 10px;
          padding: 4px 8px;
          background: rgba(255,255,255,0.03);
          border: 1px solid;
          border-radius: 6px;
          display: flex;
          align-items: center;
          gap: 4px;
          text-transform: capitalize;
        }
        
        .momentum-badge {
          font-size: 10px;
          padding: 4px 8px;
          background: rgba(255, 149, 0, 0.1);
          border: 1px solid rgba(255, 149, 0, 0.2);
          border-radius: 6px;
          color: #ff9500;
          display: flex;
          align-items: center;
          gap: 4px;
          font-weight: 600;
        }
        
        .confidence-badge {
          font-size: 10px;
          padding: 4px 8px;
          background: rgba(255,255,255,0.03);
          border-radius: 6px;
          color: rgba(255,255,255,0.45);
          font-family: 'JetBrains Mono', monospace;
          display: flex;
          align-items: center;
          gap: 5px;
        }
        .confidence-dot { width: 5px; height: 5px; border-radius: 50%; background: #30d158; }
        
        .quick-actions { display: flex; gap: 6px; }
        
        .approve-btn, .reject-btn {
          padding: 8px 14px;
          font-size: 11px;
          font-weight: 600;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.15s;
          font-family: 'Inter', sans-serif;
          display: flex;
          align-items: center;
          gap: 5px;
        }
        .approve-btn {
          background: rgba(48, 209, 88, 0.08);
          border: 1px solid rgba(48, 209, 88, 0.2);
          color: #30d158;
        }
        .approve-btn:hover { background: rgba(48, 209, 88, 0.15); }
        .reject-btn {
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.06);
          color: rgba(255,255,255,0.45);
        }
        .reject-btn:hover { background: rgba(255,255,255,0.05); }
        
        .status-badge {
          display: inline-flex;
          align-items: center;
          padding: 6px 12px;
          border-radius: 6px;
          font-size: 11px;
          font-weight: 600;
        }
        .status-badge.approved { background: rgba(48, 209, 88, 0.1); color: #30d158; }
        .status-badge.rejected { background: rgba(255, 59, 59, 0.1); color: #ff3b3b; }
        
        .detail-panel {
          flex: 0 0 45%;
          overflow-y: auto;
          background: rgba(255,255,255,0.008);
        }
        
        .no-selection {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          gap: 16px;
        }
        .no-selection-graphic { position: relative; width: 70px; height: 70px; }
        .no-selection-circle {
          width: 100%;
          height: 100%;
          border-radius: 50%;
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.05);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .no-selection-icon { font-size: 22px; color: rgba(255,255,255,0.15); }
        .no-selection-text { font-size: 14px; font-weight: 500; color: rgba(255,255,255,0.5); }
        .no-selection-hint { font-size: 12px; color: rgba(255,255,255,0.25); }
        
        .detail {
          padding: 20px 24px;
          animation: fadeIn 0.2s ease;
        }
        
        .detail-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 24px;
        }
        .detail-title { font-size: 16px; font-weight: 600; margin-bottom: 3px; }
        .detail-id { font-size: 11px; color: rgba(255,255,255,0.25); font-family: 'JetBrains Mono', monospace; }
        
        .close-btn {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          border: 1px solid rgba(255,255,255,0.06);
          background: rgba(255,255,255,0.02);
          color: rgba(255,255,255,0.4);
          cursor: pointer;
          font-size: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.15s;
        }
        .close-btn:hover { background: rgba(255,255,255,0.05); color: rgba(255,255,255,0.7); }
        
        .detail-section { margin-bottom: 20px; }
        .section-label {
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 1px;
          color: rgba(255,255,255,0.3);
          margin-bottom: 10px;
        }
        .section-label-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 10px;
        }
        
        .copy-btn {
          font-size: 10px;
          font-weight: 600;
          color: rgba(255,255,255,0.35);
          background: rgba(255,255,255,0.04);
          border: none;
          padding: 5px 10px;
          border-radius: 5px;
          cursor: pointer;
          transition: all 0.15s;
          font-family: 'Inter', sans-serif;
        }
        .copy-btn:hover { background: rgba(255,255,255,0.08); color: rgba(255,255,255,0.6); }
        
        .original-signal {
          padding: 16px;
          background: rgba(255,255,255,0.02);
          border-radius: 12px;
          border: 1px solid rgba(255,255,255,0.04);
        }
        .original-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 12px;
        }
        .original-actor { display: flex; align-items: center; gap: 10px; }
        .avatar-large {
          font-size: 24px;
          width: 42px;
          height: 42px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(255,255,255,0.03);
          border-radius: 10px;
        }
        .actor-name-large { font-size: 14px; font-weight: 600; }
        .actor-meta { font-size: 11px; color: rgba(255,255,255,0.35); margin-top: 2px; }
        
        .source-link {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 11px;
          color: rgba(255,255,255,0.35);
          text-decoration: none;
          padding: 5px 8px;
          background: rgba(255,255,255,0.03);
          border-radius: 5px;
          transition: all 0.15s;
        }
        .source-link:hover { background: rgba(255,255,255,0.06); color: rgba(255,255,255,0.6); }
        
        .original-text { font-size: 14px; line-height: 1.6; color: rgba(255,255,255,0.8); }
        
        .classification-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
        }
        .class-item {
          padding: 12px 14px;
          background: rgba(255,255,255,0.02);
          border-radius: 10px;
          border: 1px solid rgba(255,255,255,0.03);
        }
        .class-label {
          display: block;
          font-size: 10px;
          color: rgba(255,255,255,0.3);
          margin-bottom: 6px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .class-value { font-size: 13px; font-weight: 600; text-transform: capitalize; }
        
        .confidence-wrapper { display: flex; align-items: center; gap: 10px; margin-top: 4px; }
        .confidence-bar-bg {
          flex: 1;
          height: 5px;
          background: rgba(255,255,255,0.08);
          border-radius: 3px;
          overflow: hidden;
        }
        .confidence-fill {
          height: 100%;
          background: linear-gradient(90deg, #30d158 0%, #5ac8fa 100%);
          border-radius: 3px;
          transition: width 0.4s ease;
        }
        .confidence-percent {
          font-size: 12px;
          font-weight: 600;
          font-family: 'JetBrains Mono', monospace;
          color: #30d158;
        }
        
        .momentum-box {
          padding: 16px;
          background: linear-gradient(135deg, rgba(255, 149, 0, 0.08) 0%, rgba(255, 59, 59, 0.04) 100%);
          border-radius: 12px;
          border: 1px solid rgba(255, 149, 0, 0.12);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .momentum-left { display: flex; flex-direction: column; gap: 2px; }
        .momentum-number {
          font-size: 32px;
          font-weight: 700;
          color: #ff9500;
          font-family: 'JetBrains Mono', monospace;
          line-height: 1;
        }
        .momentum-label { font-size: 11px; color: rgba(255,255,255,0.45); }
        .momentum-right { display: flex; flex-direction: column; align-items: flex-end; gap: 6px; }
        .momentum-bar {
          width: 80px;
          height: 4px;
          background: rgba(255,255,255,0.1);
          border-radius: 2px;
          overflow: hidden;
        }
        .momentum-bar-fill {
          width: 75%;
          height: 100%;
          background: linear-gradient(90deg, #ff9500 0%, #ff5e3a 100%);
          border-radius: 2px;
        }
        .momentum-trend { font-size: 10px; color: #ff9500; font-weight: 500; }
        
        .action-box {
          padding: 14px 16px;
          background: rgba(90, 200, 250, 0.06);
          border-radius: 10px;
          border: 1px solid rgba(90, 200, 250, 0.12);
        }
        .action-header { display: flex; align-items: center; gap: 10px; }
        .action-icon { font-size: 16px; color: #5ac8fa; }
        .action-text { font-size: 14px; font-weight: 600; color: #5ac8fa; text-transform: capitalize; }
        
        .reply-box {
          padding: 14px 16px;
          background: rgba(255,255,255,0.02);
          border-radius: 10px;
          border: 1px solid rgba(255,255,255,0.05);
        }
        .reply-text {
          font-size: 13px;
          line-height: 1.6;
          color: rgba(255,255,255,0.65);
          font-style: italic;
        }
        
        .detail-actions { display: flex; gap: 10px; margin-top: 24px; }
        
        .approve-main-btn, .reject-main-btn {
          padding: 14px 20px;
          font-size: 13px;
          font-weight: 600;
          border-radius: 10px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          font-family: 'Inter', sans-serif;
          transition: all 0.2s;
        }
        .approve-main-btn {
          flex: 2;
          background: linear-gradient(135deg, #30d158 0%, #28a745 100%);
          border: none;
          color: #fff;
          box-shadow: 0 4px 20px rgba(48, 209, 88, 0.25);
        }
        .approve-main-btn:hover { transform: translateY(-1px); box-shadow: 0 6px 25px rgba(48, 209, 88, 0.3); }
        .reject-main-btn {
          flex: 1;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.08);
          color: rgba(255,255,255,0.5);
        }
        .reject-main-btn:hover { background: rgba(255,255,255,0.05); }
        
        .detail-footer {
          margin-top: 16px;
          padding-top: 12px;
          border-top: 1px solid rgba(255,255,255,0.04);
          text-align: center;
        }
        .footer-hint {
          font-size: 10px;
          color: rgba(255,255,255,0.2);
          font-family: 'JetBrains Mono', monospace;
        }
        
        .activity-bar {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          padding: 10px 24px;
          background: rgba(8,8,10,0.95);
          border-top: 1px solid rgba(255,255,255,0.04);
          display: flex;
          align-items: center;
          gap: 16px;
          z-index: 100;
          backdrop-filter: blur(20px);
        }
        .activity-label {
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.5px;
          color: rgba(255,255,255,0.3);
          text-transform: uppercase;
        }
        .activity-items { display: flex; align-items: center; gap: 14px; flex: 1; }
        .activity-item { display: flex; align-items: center; gap: 6px; font-size: 11px; }
        .activity-dot { width: 5px; height: 5px; border-radius: 50%; }
        .activity-dot.approved { background: #30d158; }
        .activity-dot.rejected { background: #ff3b3b; }
        .activity-text { color: rgba(255,255,255,0.5); }
        .activity-empty { font-size: 11px; color: rgba(255,255,255,0.2); }
        
        @keyframes toastIn { from { opacity: 0; transform: translate(-50%, -20px); } to { opacity: 1; transform: translate(-50%, 0); } }
        @keyframes slideIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes livePulse { 0%, 100% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.3); opacity: 0.7; } }
        @keyframes ring { 0% { transform: scale(1); opacity: 0.5; } 100% { transform: scale(1.5); opacity: 0; } }
        @keyframes glow { 0%, 100% { box-shadow: 0 0 15px rgba(255, 59, 59, 0.15); } 50% { box-shadow: 0 0 25px rgba(255, 59, 59, 0.3); } }
        
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.06); border-radius: 3px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.12); }

        /* Mobile Responsive Styles */
        @media (max-width: 1024px) {
          .main {
            flex-direction: column;
            height: auto;
          }
          .signal-list {
            flex: none;
            border-right: none;
            border-bottom: 1px solid rgba(255,255,255,0.04);
            max-height: 50vh;
          }
          .detail-panel {
            flex: none;
            min-height: 50vh;
          }
        }

        @media (max-width: 768px) {
          .header {
            padding: 12px 16px;
            flex-wrap: wrap;
            gap: 12px;
          }
          .header-center {
            order: 3;
            flex: 1 1 100%;
            padding: 0;
          }
          .search-box {
            max-width: 100%;
          }
          .logo-text { font-size: 14px; }
          .logo-subtext { display: none; }
          
          .stats-bar {
            grid-template-columns: repeat(2, 1fr);
            padding: 12px 16px;
            gap: 8px;
          }
          .stat-card { padding: 12px 14px; }
          .stat-value { font-size: 22px; }
          
          .main {
            height: auto;
            min-height: calc(100vh - 220px);
            padding-bottom: 60px;
          }
          .signal-list {
            max-height: none;
            border-bottom: none;
          }
          .detail-panel {
            display: none;
          }
          .detail-panel.mobile-visible {
            display: block;
            position: fixed;
            inset: 0;
            z-index: 200;
            background: #08080a;
            overflow-y: auto;
          }
          
          .list-header { padding: 10px 16px; }
          .signal-card { margin: 3px 8px; }
          .signal-content { padding: 12px 14px; }
          .signal-text { font-size: 12px; }
          .actor-name { font-size: 12px; }
          .quick-actions { flex-wrap: wrap; }
          .approve-btn, .reject-btn { padding: 6px 12px; font-size: 10px; }
          
          .activity-bar {
            padding: 8px 16px;
          }
          .activity-items { overflow-x: auto; }
          
          .detail { padding: 16px; }
          .classification-grid { grid-template-columns: 1fr; }
          .detail-actions { flex-direction: column; }
          .approve-main-btn, .reject-main-btn { flex: none; }
        }

        @media (max-width: 480px) {
          .header { padding: 10px 12px; }
          .header-right { gap: 10px; }
          .timestamp { display: none; }
          .divider { display: none; }
          .logo-icon-wrapper { width: 28px; height: 28px; }
          .logo-icon { font-size: 16px; }
          
          .stats-bar { padding: 10px 12px; gap: 6px; }
          .stat-card { padding: 10px 12px; gap: 6px; }
          .stat-value { font-size: 20px; }
          .stat-label { font-size: 9px; }
          .stat-icon { font-size: 12px; }
          
          .signal-card { margin: 2px 6px; border-radius: 8px; }
          .signal-content { padding: 10px 12px; }
          .avatar { width: 32px; height: 32px; font-size: 18px; }
          .urgency-badge { font-size: 8px; padding: 3px 6px; }
          .signal-text { font-size: 12px; margin-bottom: 10px; }
          .signal-meta { gap: 4px; margin-bottom: 10px; }
          .intent-badge, .momentum-badge, .confidence-badge { font-size: 9px; padding: 3px 6px; }
          
          .original-signal { padding: 12px; }
          .avatar-large { width: 36px; height: 36px; font-size: 20px; }
          .actor-name-large { font-size: 13px; }
          .actor-meta { font-size: 10px; }
          .original-text { font-size: 13px; }
          
          .class-item { padding: 10px 12px; }
          .momentum-box { padding: 12px; flex-direction: column; gap: 12px; align-items: flex-start; }
          .momentum-right { align-items: flex-start; }
          
          .detail-actions { gap: 8px; }
          .approve-main-btn, .reject-main-btn { padding: 12px 16px; font-size: 12px; }
          .detail-footer { display: none; }
          
          .activity-bar { padding: 6px 12px; }
          .activity-label { font-size: 9px; }
          .activity-item { font-size: 10px; }
        }
      `}</style>
    </div>
  );
}

function SignalCard({ signal, index, isSelected, onClick, onApprove, onReject }) {
  const urgency = urgencyConfig[signal.classification.urgency];
  const intent = intentConfig[signal.classification.intent_stage] || { icon: '●', color: '#888' };
  
  return (
    <div 
      onClick={onClick}
      className={`signal-card ${isSelected ? 'selected' : ''}`}
      style={{ animationDelay: `${index * 40}ms` }}
    >
      <div className="urgency-line" style={{ background: urgency.color }} />
      <div className="signal-content">
        <div className="signal-header">
          <div className="actor-info">
            <span className="avatar">{signal.avatar}</span>
            <div className="actor-details">
              <div className="actor-row">
                <span className="actor-name">{signal.actor}</span>
                <span className="followers">{signal.followers}</span>
              </div>
              <span className="signal-time">{signal.timestamp}</span>
            </div>
          </div>
          <div className="urgency-badge" style={{ background: urgency.bg, color: urgency.color }}>
            <span>{urgency.icon}</span>
            <span>{urgency.label}</span>
          </div>
        </div>
        
        <p className="signal-text">{signal.text}</p>
        
        <div className="signal-meta">
          <span className="intent-badge" style={{ borderColor: intent.color + '40' }}>
            <span>{intent.icon}</span>
            <span style={{ color: intent.color }}>{signal.classification.intent_stage.replace(/_/g, ' ')}</span>
          </span>
          {signal.classification.momentum_flag && (
            <span className="momentum-badge">
              <span>🔥</span>
              <span>{signal.classification.momentum_count}</span>
            </span>
          )}
          <span className="confidence-badge">
            <span className="confidence-dot" />
            {Math.round(signal.classification.confidence * 100)}%
          </span>
        </div>

        {!signal.status ? (
          <div className="quick-actions">
            <button className="approve-btn" onClick={(e) => { e.stopPropagation(); onApprove(); }}>
              <span>✓</span> Approve
            </button>
            <button className="reject-btn" onClick={(e) => { e.stopPropagation(); onReject(); }}>
              <span>✕</span> Skip
            </button>
          </div>
        ) : (
          <div className={`status-badge ${signal.status}`}>
            {signal.status === 'approved' ? '✓ Approved' : '✕ Skipped'}
          </div>
        )}
      </div>
    </div>
  );
}

function SignalDetail({ signal, onApprove, onReject, onClose }) {
  const urgency = urgencyConfig[signal.classification.urgency];
  const intent = intentConfig[signal.classification.intent_stage] || { icon: '●', color: '#888' };
  const [copied, setCopied] = useState(false);

  const copyReply = () => {
    navigator.clipboard.writeText(signal.classification.suggested_reply);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  return (
    <div className="detail">
      <div className="detail-header">
        <div>
          <div className="detail-title">Signal Analysis</div>
          <div className="detail-id">{signal.id}</div>
        </div>
        <button onClick={onClose} className="close-btn">✕</button>
      </div>

      <div className="detail-section">
        <div className="section-label">ORIGINAL SIGNAL</div>
        <div className="original-signal">
          <div className="original-header">
            <div className="original-actor">
              <span className="avatar-large">{signal.avatar}</span>
              <div>
                <div className="actor-name-large">{signal.actor}</div>
                <div className="actor-meta">{signal.followers} followers · {signal.timestamp}</div>
              </div>
            </div>
            <a href="#" className="source-link">
              <span>View on 𝕏</span>
              <span>↗</span>
            </a>
          </div>
          <p className="original-text">{signal.text}</p>
        </div>
      </div>

      <div className="detail-section">
        <div className="section-label">CLASSIFICATION</div>
        <div className="classification-grid">
          <div className="class-item">
            <span className="class-label">Intent Stage</span>
            <span className="class-value" style={{ color: intent.color }}>
              {intent.icon} {signal.classification.intent_stage.replace(/_/g, ' ')}
            </span>
          </div>
          <div className="class-item">
            <span className="class-label">Primary Pain</span>
            <span className="class-value">{signal.classification.primary_pain.replace(/_/g, ' ')}</span>
          </div>
          <div className="class-item">
            <span className="class-label">Urgency Level</span>
            <span className="class-value" style={{ color: urgency.color }}>
              {urgency.icon} {urgency.label}
            </span>
          </div>
          <div className="class-item">
            <span className="class-label">Confidence</span>
            <div className="confidence-wrapper">
              <div className="confidence-bar-bg">
                <div className="confidence-fill" style={{ width: `${signal.classification.confidence * 100}%` }} />
              </div>
              <span className="confidence-percent">{Math.round(signal.classification.confidence * 100)}%</span>
            </div>
          </div>
        </div>
      </div>

      {signal.classification.momentum_flag && (
        <div className="detail-section">
          <div className="section-label">🔥 MOMENTUM DETECTED</div>
          <div className="momentum-box">
            <div className="momentum-left">
              <span className="momentum-number">{signal.classification.momentum_count}</span>
              <span className="momentum-label">similar signals</span>
            </div>
            <div className="momentum-right">
              <div className="momentum-bar">
                <div className="momentum-bar-fill" />
              </div>
              <span className="momentum-trend">↑ Trending 24h</span>
            </div>
          </div>
        </div>
      )}

      <div className="detail-section">
        <div className="section-label">RECOMMENDED ACTION</div>
        <div className="action-box">
          <div className="action-header">
            <span className="action-icon">→</span>
            <span className="action-text">{signal.classification.recommended_action.replace(/_/g, ' ')}</span>
          </div>
        </div>
      </div>

      <div className="detail-section">
        <div className="section-label-row">
          <span className="section-label">SUGGESTED REPLY</span>
          <button onClick={copyReply} className="copy-btn">{copied ? '✓ Copied' : 'Copy'}</button>
        </div>
        <div className="reply-box">
          <p className="reply-text">{signal.classification.suggested_reply}</p>
        </div>
      </div>

      <div className="detail-actions">
        <button className="approve-main-btn" onClick={onApprove}>
          <span>✓</span>
          <span>Approve & Execute</span>
        </button>
        <button className="reject-main-btn" onClick={onReject}>
          <span>✕</span>
          <span>Skip</span>
        </button>
      </div>

      <div className="detail-footer">
        <span className="footer-hint">⌘ + Enter to approve · Esc to close</span>
      </div>
    </div>
  );
}
