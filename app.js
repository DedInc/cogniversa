const WebSocket = require('ws');
const sessions = require('./utils/sessions.js');
const grades = require('./utils/grades.js');
const time = require('./utils/time.js');
const sessionManager = require('./manager.js');

class WebSocketHandler {
  constructor(port = 1337) {
    this.wss = new WebSocket.Server({ port });
    this.wss.on('connection', (ws) => this.handleConnection(ws));
  }

  sendMessage(message) {
    this.ws.send(JSON.stringify(message));
  }

  sendError(error) {
    this.sendMessage({ 'error': error });
  }

  validateData(data, fields) {
    for (const field of fields) {
      if (!data[field]) {
        this.sendError(`Missing ${field}!`);
        return false;
      }
    }
    return true;
  }

  async handleSessionActions(task, data) {
    if (task === 'init') {
      if (!this.validateData(data, ['startTime', 'text'])) {
        return;
      }
      
      const sessionId = sessionManager.createSession(new sessions.Session(data.startTime, data.text));
      this.sendMessage({'sessionId': sessionId});
    } else if (task === 'load') {
      if (!this.validateData(data, ['session'])) {
        return;
      }

      const session = new sessions.Session();
      session.setParams(data.session);
      session.updateCards();
      const sessionId = sessionManager.createSession(session);
      this.sendMessage({'sessionId': sessionId});
    } else if (task === 'get') {
      if (!this.validateData(data, ['sessionId'])) {
        return;
      }

      try {
        const session = await sessionManager.getSession(data.sessionId);
        this.sendMessage({'session': session.toJSON()});
      } catch (error) {
        this.sendError('Session not found!');
      }
    } else {
      this.sendError('Invalid task for session action!');
    }
  }

  async handleCardActions(task, data) {
    if (task === 'addCard') {
      if (!this.validateData(data, ['sessionId']) || !this.validateData(data.card, ['question', 'answer'])) {
        return;
      }

      try {
        const session = await sessionManager.getSession(data.sessionId);
        session.addCard(data.card.question, data.card.answer);
        this.sendMessage({'success': 'Card added!'});
      } catch (error) {
        this.sendError('Session not found!');
      }
    } else if (task === 'addCards') {
      if (!this.validateData(data, ['sessionId', 'cards'])) {
        return;
      }

      try {
        const session = await sessionManager.getSession(data.sessionId);
        session.addCards(data.cards);
        this.sendMessage({'success': 'Cards added!'});
      } catch (error) {
        this.sendError('Session not found!');
      }
    } else if (task === 'removeCard') {
      if (!this.validateData(data, ['sessionId', 'question'])) {
        return;
      }

      try {
        const session = await sessionManager.getSession(data.sessionId);
        session.removeCard(data.question);
        this.sendMessage({'success': 'Card removed!'});
      } catch (error) {
        this.sendError('Session not found!');
      }
    } else if (task === 'removeCards') {
      if (!this.validateData(data, ['sessionId', 'questions'])) {
        return;
      }

      try {
        const session = await sessionManager.getSession(data.sessionId);
        session.removeCards(data.questions);
        this.sendMessage({'success': 'Cards removed!'});
      } catch (error) {
        this.sendError('Session not found!');
      }
    } else if (task === 'getCards') {
      if (!this.validateData(data, ['sessionId'])) {
        return;
      }

      try {
        const session = await sessionManager.getSession(data.sessionId);
        this.sendMessage({'cards': session.getCards()});
      } catch (error) {
        this.sendError('Session not found!');
      }
    } else if (task === 'checkCard') {
      if (!this.validateData(data, ['sessionId', 'card', 'startTime', 'answer'])) {
        return;
      }

      try {
        const session = await sessionManager.getSession(data.sessionId);

        let maxTime = grades.calculateTypingTime(data.card.answer, session.typeSpeed);      
        let typeGrade = grades.calculateTypeGrade(time.getUnix() - data.startTime, maxTime);
        let accuracyGrade = grades.calculateStringsRatio(data.card.answer, data.answer);
        let totalGrade = grades.calculateTotalGrade([typeGrade, accuracyGrade]);

        session.checkCard(data.card, totalGrade);        

        if (session.grades.length == session.perSessionCards) {
          session.updateLevel();
        }
        
        session.grades.push(totalGrade);

        this.sendMessage({'success': 'Answered!'});
      } catch (error) {
        this.sendError('Session not found!');
      }
    } else {
      this.sendError('Invalid task for cards action!');
    }
  };  

  async handleMessage(message) {
    let data;
    try {
      data = JSON.parse(message);
    } catch (error) {
      return this.sendError('Invalid JSON Data!');
    }

    const { action, task } = data;

    if (action === 'sessions') {
      await this.handleSessionActions(task, data);
    } else if (action === 'cards') {
      await this.handleCardActions(task, data);
    } else {
      this.sendError('Invalid action!');
    }
  }

  handleConnection(ws) {
    this.ws = ws;
    ws.on('message', (message) => this.handleMessage(message));
  }
}

new WebSocketHandler();