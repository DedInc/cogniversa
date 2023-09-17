const grades = require('./grades.js');
const time = require('./time.js');
const intervals = require('./intervals');


const State = {
  REVISE: 'revise',
  LEARN: 'learn',
  WEAK: 'weak',
  MIDDLE: 'middle',
  STRONG: 'strong'
}

class Session {
  constructor(startTime = time.getUnix(), text = '\n') {
    this.typeSpeed = grades.calculateTypeSpeed(startTime, text);
    this.cards = {
      [State.REVISE]: [],
      [State.LEARN]: [],
      [State.WEAK]: [],
      [State.MIDDLE]: [],
      [State.STRONG]: []
    };
    this.grades = [];
    this.perSessionCards = 5;
  }


  toJSON() {
    return {
      typeSpeed: this.typeSpeed,
      cards: this.cards,
      grades: this.grades,
      perSessionCards: this.perSessionCards
    };
  }


  addCard(question, answer) {
    const newCard = {
      'question': question,
      'answer': answer,
      'learnDate': 0,
      'reviseDates': []
    };

    this.cards[State.LEARN].push(newCard);
  }


  addCards(cards) {
    cards.forEach(card => {
      this.addCard(card.question, card.answer); 
    });
  }


  removeCard(question) {
    Object.values(this.cards).forEach(cards => {
      const index = cards.findIndex(card => card.question === question);
      if (index !== -1) {
        cards.splice(index, 1); 
      }
    });
  }


  removeCards(questions) {
    questions.forEach(question => this.removeCard(question));
  }


  moveCard(card, newState) {
    const currentState = Object.keys(this.cards).find(state => 
      this.cards[state].some(c => c.question === card.question)
    );

    if (currentState === newState) {
      return;
    }

    const index = this.cards[currentState].findIndex(c => c.question === card.question);

    this.cards[currentState].splice(index, 1);
    this.cards[newState].push(card);
  }


  updateCards() {
    Object.values(this.cards).forEach(cards => {
      
      cards.forEach(card => {
      
        if (intervals.isReviseViolated(card.learnDate, card.reviseDates)) {
          card.learnDate = 0;
          card.reviseDates = []; 
          this.moveCard(card, State.LEARN);
        } else if (intervals.needRevise(card.learnDate, Math.max(...card.reviseDates))) {
          this.moveCard(card, State.REVISE); 
        }
        
      });
    
    });
  }


  checkCard(card, grade) {
    const currentState = Object.keys(this.cards).find(state => 
      this.cards[state].some(c => c.question === card.question));

    if (currentState === State.LEARN) {
      card.learnDate = time.getUnix();
      this.moveCard(card, State.WEAK);
      return;
    }

    if (currentState === State.REVISE) {

      const revises = card.reviseDates.length;
      card.reviseDates.push(time.getUnix());

      if (revises === 0) {
        this.moveCard(card, State.WEAK);
      } else {
        this.moveCard(card, 
          grade >= 0.85 ? State.STRONG :
          grade <= 0.6 ? State.WEAK :  
          State.MIDDLE
        );
      }

      return;
    }

    if (currentState === State.WEAK && grade >= 0.6) {
      this.moveCard(card, State.MIDDLE);
      return;
    }

    if (currentState === State.MIDDLE) {
      if (grade >= 0.85) {
        this.moveCard(card, State.STRONG);
      } else if (grade < 0.6) {
        this.moveCard(card, State.WEAK); 
      }
      return;
    }

    if (currentState === State.STRONG && grade <= 0.8) {
      this.moveCard(card, State.MIDDLE);
    }
  }


  updateLevel() {
    const grade = grades.calculateTotalGrade(this.grades);

    this.perSessionCards = Math.min(
      grade >= 0.9 ? this.perSessionCards + 5 :
      grade >= 0.75 ? this.perSessionCards + 3 :
      grade <= 0.6 ? this.perSessionCards - 5 :
      this.perSessionCards,
      20
    );

    this.perSessionCards = Math.max(this.perSessionCards, 5);
    this.grades = [];
  }


  setParams(params) {
      this.typeSpeed = params.typeSpeed;
      this.cards = params.cards;
      this.grades = params.grades;
      this.perSessionCards = params.perSessionCards;
  }


  getCards() {
    const cards = [];

    [State.REVISE, State.WEAK, State.MIDDLE, State.LEARN].forEach(category => {
      const sourceCards = [...this.cards[category]];
      const limit = Math.min(this.perSessionCards - cards.length, sourceCards.length);

      if (cards.length < this.perSessionCards && sourceCards.length > 0) {
        cards.push(...sourceCards.slice(0, limit)); 
      }
    });

    return cards;
  }
}


module.exports = {
  Session,
  State
};