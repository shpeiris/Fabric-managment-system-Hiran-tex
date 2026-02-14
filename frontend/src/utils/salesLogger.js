// Sales logging utility
export class SalesLogger {
  static logLevel = {
    ERROR: 0,
    WARN: 1,
    INFO: 2,
    DEBUG: 3
  };

  static currentLevel = this.logLevel.INFO;

  static setLogLevel(level) {
    this.currentLevel = level;
  }

  static formatMessage(level, page, action, details) {
    const timestamp = new Date().toISOString();
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const userName = user.username || 'Unknown';
    
    return {
      timestamp,
      level,
      page,
      action,
      user: userName,
      details: details || {}
    };
  }

  static log(level, page, action, details) {
    if (level > this.currentLevel) return;

    const logMessage = this.formatMessage(
      Object.keys(this.logLevel)[level],
      page,
      action,
      details
    );

    const consoleMethod = level === 0 ? 'error' : 
                         level === 1 ? 'warn' : 
                         level === 2 ? 'info' : 'debug';

    console[consoleMethod]('[SALES]', logMessage);

    // Store in local storage for audit trail
    this.storeLog(logMessage);

    // Send to backend if needed (optional)
    if (level <= this.logLevel.WARN) {
      this.sendToBackend(logMessage);
    }
  }

  static error(page, action, details) {
    this.log(this.logLevel.ERROR, page, action, details);
  }

  static warn(page, action, details) {
    this.log(this.logLevel.WARN, page, action, details);
  }

  static info(page, action, details) {
    this.log(this.logLevel.INFO, page, action, details);
  }

  static debug(page, action, details) {
    this.log(this.logLevel.DEBUG, page, action, details);
  }

  static storeLog(logMessage) {
    try {
      const logs = JSON.parse(localStorage.getItem('salesLogs') || '[]');
      logs.push(logMessage);
      
      // Keep only last 100 logs
      if (logs.length > 100) {
        logs.splice(0, logs.length - 100);
      }
      
      localStorage.setItem('salesLogs', JSON.stringify(logs));
    } catch (error) {
      console.error('Failed to store log:', error);
    }
  }

  static sendToBackend(logMessage) {
    // Optional: Send critical logs to backend
    if (window.fetch) {
      fetch('http://localhost:5000/api/logs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(logMessage)
      }).catch(error => {
        console.error('Failed to send log to backend:', error);
      });
    }
  }

  static getLogs() {
    try {
      return JSON.parse(localStorage.getItem('salesLogs') || '[]');
    } catch (error) {
      console.error('Failed to retrieve logs:', error);
      return [];
    }
  }

  static clearLogs() {
    localStorage.removeItem('salesLogs');
    this.info('Logger', 'Logs cleared', {});
  }

  // Page-specific logging methods
  static dashboard = {
    pageLoad: (details) => SalesLogger.info('Dashboard', 'Page Load', details),
    dataFetch: (details) => SalesLogger.info('Dashboard', 'Data Fetch', details),
    dataFetchError: (error) => SalesLogger.error('Dashboard', 'Data Fetch Failed', { error: error.message }),
    statCardClick: (cardType) => SalesLogger.info('Dashboard', 'Stat Card Clicked', { cardType }),
    refresh: () => SalesLogger.info('Dashboard', 'Data Refreshed', {})
  };

  static orders = {
    pageLoad: (details) => SalesLogger.info('Orders', 'Page Load', details),
    ordersFetch: (count) => SalesLogger.info('Orders', 'Orders Fetched', { count }),
    ordersFetchError: (error) => SalesLogger.error('Orders', 'Orders Fetch Failed', { error: error.message }),
    filterChange: (filter) => SalesLogger.info('Orders', 'Filter Applied', { filter }),
    statusUpdate: (orderId, newStatus) => SalesLogger.info('Orders', 'Status Updated', { orderId, newStatus }),
    statusUpdateError: (orderId, error) => SalesLogger.error('Orders', 'Status Update Failed', { orderId, error: error.message }),
    orderView: (orderId) => SalesLogger.info('Orders', 'Order Viewed', { orderId }),
    refresh: () => SalesLogger.info('Orders', 'Data Refreshed', {})
  };

  static customers = {
    pageLoad: (details) => SalesLogger.info('Customers', 'Page Load', details),
    customersFetch: (count) => SalesLogger.info('Customers', 'Customers Fetched', { count }),
    customersFetchError: (error) => SalesLogger.error('Customers', 'Customers Fetch Failed', { error: error.message }),
    search: (searchTerm) => SalesLogger.info('Customers', 'Search Applied', { searchTerm }),
    customerView: (customerId) => SalesLogger.info('Customers', 'Customer Viewed', { customerId }),
    refresh: () => SalesLogger.info('Customers', 'Data Refreshed', {})
  };

  static reports = {
    pageLoad: (details) => SalesLogger.info('Reports', 'Page Load', details),
    reportsFetch: (details) => SalesLogger.info('Reports', 'Reports Fetched', details),
    reportsFetchError: (error) => SalesLogger.error('Reports', 'Reports Fetch Failed', { error: error.message }),
    dateRangeChange: (range) => SalesLogger.info('Reports', 'Date Range Changed', { range }),
    export: (format) => SalesLogger.info('Reports', 'Report Exported', { format }),
    refresh: () => SalesLogger.info('Reports', 'Data Refreshed', {})
  };
}

export default SalesLogger;