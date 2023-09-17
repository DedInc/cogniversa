
<h1 align="center">🧠 CogniVersa 📚</h1>

> CogniVersa is a flashcard learning app that uses an adaptive repetition algorithm for effective memorization. 🎓💡

## 🌟 Features

- 🔁 Adaptive card repetition based on spaced repetition and knowledge level
- 💻 Typing speed and answer accuracy assessment to determine card mastery level
- 🔧 Automatic adjustment of cards per session based on overall performance  
- ✏️ Add, remove and edit cards
- ☁️ Sync card data and progress between sessions

## ⚙️ Technologies

- 🟢 Node.js 
- 🌐 Websockets for real-time communication 
- 🧩 Modular structure and separation of concerns

## 🚀 Getting Started

```bash
git clone https://github.com/DedInc/cogniversa
cd cogniversa
npm install
node app.js
```

## 🛠️ Usage

CogniVersa provides a WebSocket API for the client app to interact with the server logic.

<h3>Main methods:</h3>
<h4> Session</h4>

- `init` - initialize new session
- `load` - load exist session
- `get` - get session data

<h4> Cards</h4>

- `addCard` - add card
- `addCards` - add cards
- `removeCard` - remove card
- `removeCards` - remove cards
- `getCards` - get cards for study
- `checkCard` - check answer for card

The client app handles the UI and displays data received from the server.

<h4> Simple client app</h4>
You can see simple <a href = "blob/main/examples/simple_app.py">python app</a> code

## 📝 License

CogniVersa is released under the [MIT License](LICENSE)

<div align="center">
  <b>Enjoy the power of learning with CogniVersa! 🚀</b>
</div>