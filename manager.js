const uuid = require('uuid');

const SESSION_TTL = 3600;

let sessionStore = {};

function generateUniqueSessionId() {
  return uuid.v4();
}

function createSession(session) {
  const sessionId = generateUniqueSessionId();
  sessionStore[sessionId] = session;
  setTimeout(() => {
    delete sessionStore[sessionId];
  }, SESSION_TTL * 1000);
  return sessionId;
}

function getSession(sessionId) {
  return new Promise((resolve, reject) => {
    const sessionData = sessionStore[sessionId];
    if (sessionData) {
      resolve(sessionData);
    } else {
      reject(new Error('Invalid session ID!'));
    }
  });
}

module.exports = { createSession, getSession };