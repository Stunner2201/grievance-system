class SessionService {
  constructor() {
    this.sessions = new Map();
    setInterval(this.cleanupExpiredSessions.bind(this), 3600000); // Cleanup hourly
  }
  clearSession(sessionId) {
    this.sessions.delete(sessionId);
  }

  createSession(sessionId) {
    const newSession = {
      step: 'GET_NAME',
      data: {},
      lastActive: Date.now()
    };
    this.sessions.set(sessionId, newSession);
    return newSession;
  }

  updateSession(sessionId, updates) {
    const current = this.sessions.get(sessionId) || {};
    this.sessions.set(sessionId, {
      ...current,
      ...updates,
      data: { ...current.data, ...(updates.data || {}) },
      lastActive: Date.now()
    });
  }

  cleanupExpiredSessions(maxAge = 3600000) {
    const now = Date.now();
    for (const [id, session] of this.sessions.entries()) {
      if (now - session.lastActive > maxAge) this.sessions.delete(id);
    }
  }

  getSession(sessionId) {
    return this.sessions.get(sessionId);
  }
}

module.exports = new SessionService();