import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import './App.css';

const socket = io('http://localhost:4000');

function App() {
  const [username, setUsername] = useState('');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [room, setRoom] = useState('');
  const [joined, setJoined] = useState(false);

  useEffect(() => {
    socket.on('chat history', (history) => {
      console.log('Chat history:', history); // Debug log
      setMessages(history);
    });

    socket.on('chat message', ({ username, message }) => {
      console.log('Received message:', { username, message }); // Debug log
      setMessages((prevMessages) => [...prevMessages, { username, message }]);
    });

    return () => {
      socket.off('chat history');
      socket.off('chat message');
    };
  }, []);

  const joinRoom = (e) => {
    e.preventDefault();
    if (room.trim() && username.trim()) {
      console.log(`Joining room: ${room} as ${username}`); // Debug log
      socket.emit('join room', { room, username });
      setJoined(true);
    }
  };

  const leaveRoom = () => {
    setJoined(false);
    setMessages([]);
    setRoom('');
  };

  const sendMessage = (e) => {
    e.preventDefault();
    if (message.trim()) {
      console.log('Sending message:', message); // Debug log
      socket.emit('chat message', { room, message });
      setMessage('');
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        {!joined ? (
          <form onSubmit={joinRoom}>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your name"
              required
            />
            <input
              type="text"
              value={room}
              onChange={(e) => setRoom(e.target.value)}
              placeholder="Enter room name"
              required
            />
            <button type="submit">Join Room</button>
          </form>
        ) : (
          <>
            <button className="leave-room" onClick={leaveRoom}>Change Chat Room</button>
            <h1>Chat Room: {room}</h1>
            <div className="chat-box">
              {messages.map((msg, index) => (
                <div key={index} className="chat-message">
                  <strong>{msg.username}:</strong> {msg.message}
                </div>
              ))}
            </div>
            <form onSubmit={sendMessage}>
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message..."
                required
              />
              <button type="submit">Send</button>
            </form>
          </>
        )}
      </header>
    </div>
  );
}

export default App;
