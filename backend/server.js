const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"]
    }
});

const chatHistory = {};  // Store chat history for each room

io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    socket.on('join room', ({ room, username }) => {
        socket.join(room);
        socket.username = username;  // Store the username in the socket object
        console.log(`User ${username} joined room ${room}`);

        // Send chat history to the user
        if (chatHistory[room]) {
            socket.emit('chat history', chatHistory[room]);
        } else {
            chatHistory[room] = [];  // Initialize chat history for the room if not exists
        }
    });

    socket.on('chat message', ({ room, message }) => {
        const msg = { username: socket.username, message };
        console.log(`Message received in room ${room} from ${socket.username}: ${message}`); // Debug log

        // Save the message to chat history
        chatHistory[room].push(msg);

        // Broadcast the message to the room
        io.to(room).emit('chat message', msg);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
