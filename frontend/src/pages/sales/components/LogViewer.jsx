import { useState, useEffect } from 'react';
import SalesLogger from '../../../utils/salesLogger.js';
import './LogViewer.css';

const LogViewer = () => {
  const [logs, setLogs] = useState([]);
  const [filter, setFilter] = useState('all');
  const [showViewer, setShowViewer] = useState(false);

  useEffect(() => {
    if (showViewer) {
      loadLogs();
    }
  }, [showViewer, filter]);

  const loadLogs = () => {
    const allLogs = SalesLogger.getLogs();
    const filteredLogs = filter === 'all' 
      ? allLogs 
      : allLogs.filter(log => log.level.toLowerCase() === filter.toLowerCase());
    
    setLogs(filteredLogs.reverse()); // Show newest first
  };

  const clearLogs = () => {
    if (window.confirm('Are you sure you want to clear all logs?')) {
      SalesLogger.clearLogs();
      setLogs([]);
    }
  };

  const exportLogs = () => {
    const logsData = JSON.stringify(logs, null, 2);
    const blob = new Blob([logsData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sales-logs-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    SalesLogger.info('LogViewer', 'Logs exported', { count: logs.length });
  };

  const getLevelColor = (level) => {
    switch (level.toLowerCase()) {
      case 'error': return '#ef4444';
      case 'warn': return '#f59e0b';
      case 'info': return '#3b82f6';
      case 'debug': return '#6b7280';
      default: return '#374151';
    }
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  if (!showViewer) {
    return (
      <button
        onClick={() => setShowViewer(true)}
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          padding: '12px 16px',
          background: '#001a66',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          fontSize: '14px',
          cursor: 'pointer',
          zIndex: 1000,
          boxShadow: '0 4px 12px rgba(0, 26, 102, 0.3)'
        }}
      >
        📋 View Logs
      </button>
    );
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.7)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        background: 'white',
        width: '90%',
        maxWidth: '1200px',
        height: '80%',
        borderRadius: '12px',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)'
      }}>
        {/* Header */}
        <div style={{
          padding: '20px',
          background: '#001a66',
          color: 'white',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '20px' }}>Sales Activity Logs</h2>
            <p style={{ margin: '4px 0 0 0', fontSize: '14px', opacity: 0.8 }}>
              {logs.length} log entries
            </p>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              style={{
                padding: '8px 12px',
                borderRadius: '6px',
                border: 'none',
                fontSize: '14px'
              }}
            >
              <option value="all">All Levels</option>
              <option value="error">Errors</option>
              <option value="warn">Warnings</option>
              <option value="info">Info</option>
              <option value="debug">Debug</option>
            </select>
            <button
              onClick={exportLogs}
              style={{
                padding: '8px 16px',
                background: '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '14px',
                cursor: 'pointer'
              }}
            >
              📥 Export
            </button>
            <button
              onClick={clearLogs}
              style={{
                padding: '8px 16px',
                background: '#ef4444',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '14px',
                cursor: 'pointer'
              }}
            >
              🗑️ Clear
            </button>
            <button
              onClick={() => setShowViewer(false)}
              style={{
                padding: '8px 16px',
                background: '#6b7280',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '14px',
                cursor: 'pointer'
              }}
            >
              ✕ Close
            </button>
          </div>
        </div>

        {/* Logs Content */}
        <div style={{
          flex: 1,
          overflow: 'auto',
          padding: '0'
        }}>
          {logs.length === 0 ? (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              color: '#6b7280',
              fontSize: '16px'
            }}>
              No logs found for selected filter
            </div>
          ) : (
            <table style={{
              width: '100%',
              borderCollapse: 'collapse'
            }}>
              <thead style={{
                background: '#f8fafc',
                position: 'sticky',
                top: 0
              }}>
                <tr>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', borderBottom: '1px solid #e2e8f0' }}>
                    Time
                  </th>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', borderBottom: '1px solid #e2e8f0' }}>
                    Level
                  </th>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', borderBottom: '1px solid #e2e8f0' }}>
                    Page
                  </th>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', borderBottom: '1px solid #e2e8f0' }}>
                    Action
                  </th>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', borderBottom: '1px solid #e2e8f0' }}>
                    User
                  </th>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', borderBottom: '1px solid #e2e8f0' }}>
                    Details
                  </th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log, index) => (
                  <tr
                    key={index}
                    style={{
                      borderBottom: '1px solid #f1f5f9',
                      fontSize: '14px'
                    }}
                  >
                    <td style={{ padding: '12px', color: '#6b7280' }}>
                      {formatTimestamp(log.timestamp)}
                    </td>
                    <td style={{ padding: '12px' }}>
                      <span style={{
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        fontWeight: '600',
                        textTransform: 'uppercase',
                        backgroundColor: getLevelColor(log.level) + '20',
                        color: getLevelColor(log.level)
                      }}>
                        {log.level}
                      </span>
                    </td>
                    <td style={{ padding: '12px', fontWeight: '600' }}>
                      {log.page}
                    </td>
                    <td style={{ padding: '12px' }}>
                      {log.action}
                    </td>
                    <td style={{ padding: '12px', color: '#6b7280' }}>
                      {log.user}
                    </td>
                    <td style={{ padding: '12px', color: '#6b7280', fontSize: '12px' }}>
                      {Object.keys(log.details).length > 0 ? (
                        <details>
                          <summary style={{ cursor: 'pointer' }}>View details</summary>
                          <pre style={{
                            marginTop: '8px',
                            padding: '8px',
                            background: '#f8fafc',
                            borderRadius: '4px',
                            fontSize: '11px',
                            overflow: 'auto'
                          }}>
                            {JSON.stringify(log.details, null, 2)}
                          </pre>
                        </details>
                      ) : (
                        '-'
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default LogViewer;
