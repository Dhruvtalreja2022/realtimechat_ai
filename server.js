const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const fomratMessage = require('./public/utlis/messages');
const { userjoin, getcurrentuser, userleave, getroomusers } = require('./public/utlis/users');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

// Set static folder
app.use(express.static(path.join(__dirname, 'public')));

const botname = 'ChatCord Bot';

// Run when a client connects
io.on('connection', (socket) => {
    // Join a chatroom
    socket.on('joinRoom', ({ username, room }) => {
        const user = userjoin(socket.id, username, room);
        socket.join(user.room);

        // Welcome current user
        socket.emit('message', fomratMessage(botname, 'Welcome to ChatCord!'));

        // Broadcast when a user connects (to all others in the room)
        socket.broadcast
            .to(user.room)
            .emit('message', fomratMessage(botname, `${user.username} joined the chat`));



            //Send users and room info
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getroomusers(user.room)
            });
    });

    // Listen for chatMessage
    socket.on('chatMessage', (msg) => {
        const user = getcurrentuser(socket.id);
        io.to(user.room).emit('message', fomratMessage(user.username, msg));
    });

    // Runs when a user disconnects
    socket.on('disconnect', () => {
        const user = userleave(socket.id);
        if (user) {
            io.to(user.room).emit(
                'message',
                fomratMessage(botname, `${user.username} has left the chat`)
            );
            io.to(user.room).emit('roomusers',{
                room: user.room,
                users: getroomusers(user.room),
            });
        }
    });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
