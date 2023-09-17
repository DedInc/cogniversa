import json
import time
from websocket import create_connection


class LearningSession:

    def __init__(self):
        self.ws = create_connection('ws://127.0.0.1:1337')
        self.session_id = None

    def init_session(self, start_time, typed_text):
        self._send_message('sessions', 'init', {
            'startTime': start_time,
            'text': typed_text
        })

    def load_session(self, session):
        self._send_message('sessions', 'load', {
            'session': session
        })

    def get_session(self, session_id=None):
        self._send_message('sessions', 'get', {
            'sessionId': session_id or self.session_id
        })

    def learn(self):
        self._send_message('cards', 'getCards', {
            'sessionId': self.session_id
        })

    def check_card(self, card, start_time, answer):
        self._send_message('cards', 'checkCard', {
            'card': card,
            'startTime': start_time,
            'answer': answer,
            'sessionId': self.session_id
        })

    def add_card(self, question, answer):
        self._send_message('cards', 'addCard', {
            'card': {
                'question': question,
                'answer': answer
            },
            'sessionId': self.session_id
        })

    def _send_message(self, action, task, params):
        message = {
            'action': action,
            'task': task
        }        

        for param in list(params.keys()):          
          message[param] = params[param]

        self.ws.send(json.dumps(message))

    def handle_response(self, result):
        result = json.loads(result)
        print(result)

        if 'sessionId' in result and not self.session_id:
            self.session_id = result['sessionId']
        if 'session' in result:
            with open('session.json', 'w', encoding='utf-8') as f:
                f.write(json.dumps(result['session']))
        if 'cards' in result:
            for card in result['cards']:
                start_time = round(time.time())
                answer = input(card['question'] + '> ')
                self.check_card(card, start_time, answer)
                self.handle_response(self.ws.recv())
            self.get_session()
            self.handle_response(self.ws.recv())

    def close(self):
        self.ws.close()


def main():
    session = LearningSession()

    do = int(input('1. Create new session\n2. Load session\n3. Get session data\n> '))

    if do == 1:
        input('Press ENTER and then immediately start typing the text "hello my friends" at your normal typing speed to initialize the session.')
        start_time = round(time.time())
        typed_text = input('> ')
        session.init_session(start_time, typed_text)
        session.handle_response(session.ws.recv())
    elif do == 2:
        session_id = input('Enter session ID: ')
        session.load_session(session_id)
        session.handle_response(session.ws.recv())
    elif do == 3:
        session_id = input('Enter session ID (leave blank for current session): ')
        session.get_session(session_id)
        session.handle_response(session.ws.recv())

    while True:
        action = int(input('1. Learn\n2. Add card\n3. Get session data\n4. Exit\n> '))
        if action == 1:
            session.learn()
            session.handle_response(session.ws.recv())
        elif action == 2:
            question = input('Enter question: ')
            answer = input('Enter answer: ')
            session.add_card(question, answer)
            session.handle_response(session.ws.recv())
        elif action == 3:
            session.get_session()
            session.handle_response(session.ws.recv())
        elif action == 4:
            break

    session.close()


if __name__ == '__main__':
    main()